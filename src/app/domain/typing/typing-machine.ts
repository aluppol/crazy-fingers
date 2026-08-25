import { ScoreCounters } from '../entities';
import { KeystrokeVerdict, TypingPhase } from '../enums';
import { IClock } from '../ports';
import { scoreFrom } from '../services';
import { Keystroke } from './keystroke';
import { ScoreTracker } from './score-tracker';
import { CompleteState, PauseState, ProgressState, ReadyState } from './states';
import { IState, ITypingContext, StateRegistry } from './typing-context.interface';
import { KeystrokeFeedback, TypingView } from './typing-view';

const DEFAULT_WINDOW_SIZE = 100;

export class TypingMachine implements ITypingContext {
  private readonly _states: StateRegistry;
  private readonly _tracker: ScoreTracker;
  private _state: IState;
  private _symbolIndex: number;
  private _lastKeystroke: KeystrokeFeedback | null = null;

  constructor(
    private readonly _text: string,
    symbolIndex: number,
    clock: IClock,
    private readonly _windowSize = DEFAULT_WINDOW_SIZE,
  ) {
    this._tracker = new ScoreTracker(clock);
    this._symbolIndex = Math.min(Math.max(symbolIndex, 0), _text.length);
    this._states = {
      [TypingPhase.Ready]: new ReadyState(this),
      [TypingPhase.Progress]: new ProgressState(this),
      [TypingPhase.Pause]: new PauseState(this),
      [TypingPhase.Complete]: new CompleteState(this),
    };
    this._state = this._states[this.currentSymbol === null ? TypingPhase.Complete : TypingPhase.Ready];
  }

  public get currentSymbol(): string | null {
    if (this._symbolIndex >= this._text.length) return null;
    return this._text.charAt(this._symbolIndex);
  }

  public press(keystroke: Keystroke): void {
    this._state.onKeystroke(keystroke);
  }

  public pauseTyping(): void {
    if (this._state.phase === TypingPhase.Progress) this.transitionTo(TypingPhase.Pause);
  }

  public counters(): ScoreCounters {
    return this._tracker.counters();
  }

  public view(): TypingView {
    const counters = this._tracker.counters();
    const windowStart = Math.max(this._symbolIndex - this._windowSize, 0);
    return {
      phase: this._state.phase,
      textChunkWritten: this._text.slice(windowStart, this._symbolIndex),
      currentSymbol: this._text.charAt(this._symbolIndex),
      textChunkToWrite: this._text.slice(this._symbolIndex + 1, this._symbolIndex + 1 + this._windowSize),
      symbolIndex: this._symbolIndex,
      symbolCount: this._text.length,
      lastKeystroke: this._lastKeystroke,
      score: scoreFrom(counters),
      counters,
    };
  }

  public acceptCurrentSymbol(): void {
    this._symbolIndex += 1;
    this._tracker.recordAccepted();
    this._recordKeystroke(KeystrokeVerdict.Accepted);
  }

  public rejectKeystroke(): void {
    this._tracker.recordRejected();
    this._recordKeystroke(KeystrokeVerdict.Rejected);
  }

  public stopTiming(): void {
    this._tracker.stopTiming();
  }

  public transitionTo(phase: TypingPhase): void {
    this._state.onExit();
    this._state = this._states[phase];
  }

  private _recordKeystroke(verdict: KeystrokeVerdict): void {
    this._lastKeystroke = { verdict, sequence: (this._lastKeystroke?.sequence ?? 0) + 1 };
  }
}
