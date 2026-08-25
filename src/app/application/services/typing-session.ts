import {
  Book, IClock, Keystroke, NO_KEYSTROKES_YET, Progress, ScoreCounters, scoreFrom, sumCounters, TypingMachine, TypingPhase, TypingView,
} from '../../domain';
import { IProgressRepository } from '../ports';

const AUTOSAVE_EVERY_SYMBOLS = 10;
const MINIMUM_KEYSTROKES_FOR_RECORD = 100;

export class TypingSession {
  private readonly _machine: TypingMachine;
  private readonly _lifetimeBeforeSession: ScoreCounters;
  private _bestWordsPerMinute: number;
  private _countersWhenLastSaved: ScoreCounters = NO_KEYSTROKES_YET;
  private _unsavedSymbols = 0;

  constructor(
    public readonly book: Book,
    progress: Progress,
    clock: IClock,
    private readonly _progress: IProgressRepository,
  ) {
    this._machine = new TypingMachine(book.text, progress.symbolIndex, clock);
    this._lifetimeBeforeSession = progress.lifetime;
    this._bestWordsPerMinute = progress.bestWordsPerMinute;
  }

  public view(): TypingView {
    return this._machine.view();
  }

  public async press(keystroke: Keystroke): Promise<void> {
    const symbolIndexBefore = this._machine.view().symbolIndex;
    this._machine.press(keystroke);
    const viewAfter = this._machine.view();
    this._unsavedSymbols += viewAfter.symbolIndex - symbolIndexBefore;
    if (this._isSaveDue(viewAfter)) await this._saveProgress();
  }

  public async leave(): Promise<void> {
    this._machine.pauseTyping();
    if (this._hasUnrecordedKeystrokes()) await this._saveProgress();
  }

  private _isSaveDue(view: TypingView): boolean {
    if (!this._hasUnrecordedKeystrokes()) return false;
    return this._unsavedSymbols >= AUTOSAVE_EVERY_SYMBOLS || view.phase !== TypingPhase.Progress;
  }

  private _hasUnrecordedKeystrokes(): boolean {
    const counters = this._machine.counters();
    return counters.acceptedKeystrokes !== this._countersWhenLastSaved.acceptedKeystrokes
      || counters.rejectedKeystrokes !== this._countersWhenLastSaved.rejectedKeystrokes;
  }

  private async _saveProgress(): Promise<void> {
    this._unsavedSymbols = 0;
    const sessionCounters = this._machine.counters();
    this._countersWhenLastSaved = sessionCounters;
    this._rememberRecord(sessionCounters);
    await this._progress.save({
      bookId: this.book.id,
      symbolIndex: this._machine.view().symbolIndex,
      lifetime: sumCounters(this._lifetimeBeforeSession, sessionCounters),
      bestWordsPerMinute: this._bestWordsPerMinute,
    });
  }

  private _rememberRecord(sessionCounters: ScoreCounters): void {
    if (sessionCounters.acceptedKeystrokes < MINIMUM_KEYSTROKES_FOR_RECORD) return;
    this._bestWordsPerMinute = Math.max(this._bestWordsPerMinute, scoreFrom(sessionCounters).wordsPerMinute);
  }
}
