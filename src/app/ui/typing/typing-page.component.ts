import { ChangeDetectionStrategy, Component, computed, HostListener, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Library, TypingSession } from '../../application';
import { chapterIndexAt, KeystrokeFeedback, KeystrokeVerdict, TypingPhase, TypingView } from '../../domain';
import { describeError } from '../error-message';
import { CurrentSymbolGlyphPipe } from './current-symbol-glyph.pipe';
import { keystrokeFrom } from './keystroke-mapper';
import { ParagraphGlyphsPipe } from './paragraph-glyphs.pipe';

const TOOLTIPS: Readonly<Record<TypingPhase, string>> = {
  [TypingPhase.Ready]: 'Press [ENTER] to start',
  [TypingPhase.Progress]: '',
  [TypingPhase.Pause]: 'Paused — press [ESC] to continue',
  [TypingPhase.Complete]: 'The book is complete!',
};
const REJECTED_TOOLTIP = 'Wrong!';
const MILLISECONDS_BEFORE_SPEED_IS_MEANINGFUL = 2_000;
const SPEED_STILL_SETTLING = '—';
const FEEDBACK_FLASH_MILLISECONDS = 400;

@Component({
  selector: 'app-typing-page',
  imports: [RouterLink, ParagraphGlyphsPipe, CurrentSymbolGlyphPipe],
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
  private _flashTimeout: ReturnType<typeof setTimeout> | null = null;
  private _flashedSequence = 0;

  public async ngOnInit(): Promise<void> {
    try {
      const session = await this._library.openBook(this.bookId());
      this.session.set(session);
      this.view.set(session.view());
    } catch (error) {
      this.errorMessage.set(describeError(error));
    }
  }

  public ngOnDestroy(): void {
    void this.leave();
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
    const persisted = session.press(keystroke);
    const view = session.view();
    this.view.set(view);
    this._flashFeedback(view.lastKeystroke);
    await persisted;
  }

  private _flashFeedback(feedback: KeystrokeFeedback | null): void {
    if (feedback === null || feedback.sequence === this._flashedSequence) return;
    if (this._flashTimeout !== null) clearTimeout(this._flashTimeout);
    this._flashedSequence = feedback.sequence;
    this.flash.set(feedback.verdict);
    this._flashTimeout = setTimeout(() => this.flash.set(null), FEEDBACK_FLASH_MILLISECONDS);
  }
}
