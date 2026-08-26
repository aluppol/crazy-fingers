import { ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, inject, input, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Library, TypingSession } from '../../application';
import { chapterIndexAt, Keystroke, KeystrokeKind, KeystrokeVerdict, TypingPhase, TypingView } from '../../domain';
import { FingerGuideVisibility } from '../enums';
import { describeError } from '../error-message';
import { KeyboardGuideComponent, needsSystemLayoutSwitch, readFingerGuideVisibility, writeFingerGuideVisibility } from '../keyboard';
import { CurrentSymbolGlyphPipe } from './current-symbol-glyph.pipe';
import { keystrokeFrom } from './keystroke-mapper';
import { ParagraphGlyphsPipe } from './paragraph-glyphs.pipe';

const TOOLTIPS: Readonly<Record<TypingPhase, string>> = {
  [TypingPhase.Ready]: 'Press [ENTER] to start',
  [TypingPhase.Progress]: '',
  [TypingPhase.Pause]: 'Paused — press [ESC] to continue',
  [TypingPhase.Complete]: '',
};
const REJECTED_TOOLTIP = 'Wrong!';
const MILLISECONDS_BEFORE_SPEED_IS_MEANINGFUL = 2_000;
const SPEED_STILL_SETTLING = '—';
const FEEDBACK_FLASH_MILLISECONDS = 400;
const INSTRUCTION_FLASH_TIMING: KeyframeAnimationOptions = { duration: 820, easing: 'ease-out' };

function isForeignToExpectedSymbol(expectedSymbol: string, keystroke: Keystroke): boolean {
  return keystroke.kind === KeystrokeKind.Character && needsSystemLayoutSwitch(expectedSymbol, keystroke.character);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function instructionFlashKeyframes(element: HTMLElement): Keyframe[] {
  const styles = getComputedStyle(element);
  const accent = styles.getPropertyValue('--accent').trim();
  const resting = styles.getPropertyValue('--ink-muted').trim();
  const still = prefersReducedMotion();
  return [
    { color: accent, fontWeight: '700', transform: still ? 'scale(1)' : 'scale(1.16)', offset: 0 },
    { color: accent, fontWeight: '700', transform: still ? 'scale(1)' : 'scale(1.05)', offset: 0.14 },
    { color: resting, fontWeight: '400', transform: 'scale(1)', offset: 1 },
  ];
}

@Component({
  selector: 'app-typing-page',
  imports: [RouterLink, ParagraphGlyphsPipe, CurrentSymbolGlyphPipe, KeyboardGuideComponent],
  templateUrl: './typing-page.component.html',
  styleUrl: './typing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypingPageComponent implements OnInit, OnDestroy {
  public readonly verdicts = KeystrokeVerdict;
  public readonly phases = TypingPhase;
  public readonly bookId = input.required<string>();
  public readonly session = signal<TypingSession | null>(null);
  public readonly view = signal<TypingView | null>(null);
  public readonly flash = signal<KeystrokeVerdict | null>(null);
  public readonly errorMessage = signal<string | null>(null);
  public readonly guideVisible = signal(readFingerGuideVisibility(localStorage) === FingerGuideVisibility.Shown);
  public readonly layoutMismatch = signal(false);
  public readonly isPersonalBest = signal(false);

  public readonly progressPercent = computed(() => {
    const view = this.view();
    return view === null || view.symbolCount === 0 ? 0 : Math.floor((view.symbolIndex / view.symbolCount) * 100);
  });

  public readonly chapterLabel = computed(() => {
    const session = this.session();
    const view = this.view();
    if (session === null || view === null || session.book.chapters.length === 0) return '';
    const chapterIndex = chapterIndexAt(session.book.chapters, view.symbolIndex);
    return `${chapterIndex + 1}/${session.book.chapters.length} · ${session.book.chapters[chapterIndex].title}`;
  });

  public readonly speedLabel = computed(() => {
    const view = this.view();
    if (view === null || view.counters.activeMilliseconds < MILLISECONDS_BEFORE_SPEED_IS_MEANINGFUL) return SPEED_STILL_SETTLING;
    return `${view.score.wordsPerMinute} wpm`;
  });

  public readonly tooltip = computed(() => {
    const view = this.view();
    if (view === null) return '';
    return this.flash() === KeystrokeVerdict.Rejected ? REJECTED_TOOLTIP : TOOLTIPS[view.phase];
  });

  private readonly _library = inject(Library);
  private readonly _tooltip = viewChild<ElementRef<HTMLElement>>('tooltipEl');
  private _flashTimeout: ReturnType<typeof setTimeout> | null = null;
  private _flashAnimation: Animation | null = null;
  private _reactedSequence = 0;
  private _bestWordsPerMinuteBefore = 0;

  public async ngOnInit(): Promise<void> {
    try {
      const session = await this._library.openBook(this.bookId());
      this.session.set(session);
      this.view.set(session.view());
      this._bestWordsPerMinuteBefore = await this._bestWordsPerMinute();
    } catch (error) {
      this.errorMessage.set(describeError(error));
    }
  }

  public ngOnDestroy(): void {
    void this.leave();
  }

  public toggleGuide(toggle: HTMLButtonElement): void {
    const visible = !this.guideVisible();
    this.guideVisible.set(visible);
    writeFingerGuideVisibility(localStorage, visible ? FingerGuideVisibility.Shown : FingerGuideVisibility.Hidden);
    toggle.blur();
  }

  @HostListener('window:pagehide')
  public async leave(): Promise<void> {
    const session = this.session();
    if (session !== null) await session.leave();
  }

  @HostListener('window:keydown', ['$event'])
  public async handleKeydown(event: KeyboardEvent): Promise<void> {
    const session = this.session();
    const keystroke = keystrokeFrom(event);
    if (session === null || keystroke === null) return;
    event.preventDefault();
    const phaseBefore = session.view().phase;
    const persisted = session.press(keystroke);
    const view = session.view();
    this.view.set(view);
    this._reactToRecordedKeystroke(view, keystroke);
    this._emphasizeExpectedKey(view.phase);
    await persisted;
    if (view.phase === TypingPhase.Complete && phaseBefore !== view.phase) this.isPersonalBest.set(await this._hasNewPersonalBest());
  }

  private _reactToRecordedKeystroke(view: TypingView, keystroke: Keystroke): void {
    const feedback = view.lastKeystroke;
    if (feedback === null || feedback.sequence === this._reactedSequence) return;
    this._reactedSequence = feedback.sequence;
    this._flashFeedback(feedback.verdict);
    this.layoutMismatch.set(feedback.verdict === KeystrokeVerdict.Rejected && isForeignToExpectedSymbol(view.currentSymbol, keystroke));
  }

  private _flashFeedback(verdict: KeystrokeVerdict): void {
    if (this._flashTimeout !== null) clearTimeout(this._flashTimeout);
    this.flash.set(verdict);
    this._flashTimeout = setTimeout(() => this.flash.set(null), FEEDBACK_FLASH_MILLISECONDS);
  }

  private _emphasizeExpectedKey(phase: TypingPhase): void {
    const element = this._tooltip()?.nativeElement;
    if (element === undefined || TOOLTIPS[phase].length === 0) return;
    this._flashAnimation?.cancel();
    this._flashAnimation = element.animate(instructionFlashKeyframes(element), INSTRUCTION_FLASH_TIMING);
  }

  private async _hasNewPersonalBest(): Promise<boolean> {
    return await this._bestWordsPerMinute() > this._bestWordsPerMinuteBefore;
  }

  private async _bestWordsPerMinute(): Promise<number> {
    const entries = await this._library.listEntries();
    return entries.find(entry => entry.book.id === this.bookId())?.bestWordsPerMinute ?? 0;
  }
}
