export interface ScoreCounters {
  readonly activeMilliseconds: number;
  readonly acceptedKeystrokes: number;
  readonly rejectedKeystrokes: number;
}

export interface Score {
  readonly wordsPerMinute: number;
  readonly accuracyPercent: number;
  readonly points: number;
}

export const NO_KEYSTROKES_YET: ScoreCounters = {
  activeMilliseconds: 0,
  acceptedKeystrokes: 0,
  rejectedKeystrokes: 0,
};
