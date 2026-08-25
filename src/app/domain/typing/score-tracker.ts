import { ScoreCounters } from '../entities';
import { IClock } from '../ports';

const LONGEST_GAP_THAT_COUNTS_AS_TYPING = 5_000;

export class ScoreTracker {
  private _countedMilliseconds = 0;
  private _lastKeystrokeAt: number | null = null;
  private _acceptedKeystrokes = 0;
  private _rejectedKeystrokes = 0;

  constructor(private readonly _clock: IClock) {}

  public counters(): ScoreCounters {
    return {
      activeMilliseconds: this._countedMilliseconds + this._millisecondsSinceLastKeystroke(),
      acceptedKeystrokes: this._acceptedKeystrokes,
      rejectedKeystrokes: this._rejectedKeystrokes,
    };
  }

  public recordAccepted(): void {
    this._countGapBeforeThisKeystroke();
    this._acceptedKeystrokes += 1;
  }

  public recordRejected(): void {
    this._countGapBeforeThisKeystroke();
    this._rejectedKeystrokes += 1;
  }

  public stopTiming(): void {
    this._countedMilliseconds += this._millisecondsSinceLastKeystroke();
    this._lastKeystrokeAt = null;
  }

  private _countGapBeforeThisKeystroke(): void {
    this._countedMilliseconds += this._millisecondsSinceLastKeystroke();
    this._lastKeystrokeAt = this._clock.now();
  }

  private _millisecondsSinceLastKeystroke(): number {
    if (this._lastKeystrokeAt === null) return 0;
    return Math.min(this._clock.now() - this._lastKeystrokeAt, LONGEST_GAP_THAT_COUNTS_AS_TYPING);
  }
}
