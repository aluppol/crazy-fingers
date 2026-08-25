import { Score, ScoreCounters } from '../entities';

const SYMBOLS_PER_WORD = 5;
const MILLISECONDS_PER_MINUTE = 60_000;
const FLAWLESS_ACCURACY_PERCENT = 100;

export function scoreFrom(counters: ScoreCounters): Score {
  const wordsPerMinute = typedWordsPerMinute(counters);
  const accuracyPercent = keystrokeAccuracyPercent(counters);
  return {
    wordsPerMinute: Math.round(wordsPerMinute),
    accuracyPercent: Math.round(accuracyPercent),
    points: Math.round((wordsPerMinute * accuracyPercent) / FLAWLESS_ACCURACY_PERCENT),
  };
}

export function sumCounters(first: ScoreCounters, second: ScoreCounters): ScoreCounters {
  return {
    activeMilliseconds: first.activeMilliseconds + second.activeMilliseconds,
    acceptedKeystrokes: first.acceptedKeystrokes + second.acceptedKeystrokes,
    rejectedKeystrokes: first.rejectedKeystrokes + second.rejectedKeystrokes,
  };
}

function typedWordsPerMinute(counters: ScoreCounters): number {
  const minutes = counters.activeMilliseconds / MILLISECONDS_PER_MINUTE;
  if (minutes === 0) return 0;
  return counters.acceptedKeystrokes / SYMBOLS_PER_WORD / minutes;
}

function keystrokeAccuracyPercent(counters: ScoreCounters): number {
  const totalKeystrokes = counters.acceptedKeystrokes + counters.rejectedKeystrokes;
  if (totalKeystrokes === 0) return FLAWLESS_ACCURACY_PERCENT;
  return (counters.acceptedKeystrokes / totalKeystrokes) * FLAWLESS_ACCURACY_PERCENT;
}
