import { KeystrokeVerdict, TypingPhase } from '../enums';
import { Score, ScoreCounters } from '../entities';

export interface KeystrokeFeedback {
  readonly verdict: KeystrokeVerdict;
  readonly sequence: number;
}

export interface TypingView {
  readonly phase: TypingPhase;
  readonly textChunkWritten: string;
  readonly currentSymbol: string;
  readonly textChunkToWrite: string;
  readonly symbolIndex: number;
  readonly symbolCount: number;
  readonly lastKeystroke: KeystrokeFeedback | null;
  readonly score: Score;
  readonly counters: ScoreCounters;
}
