import { Score, ScoreCounters } from '../entities';
import { scoreFrom, sumCounters } from './score-calculator';

interface ScoreCase {
  readonly id: string;
  readonly counters: ScoreCounters;
  readonly expected: Score;
}

const MINUTE = 60_000;

const counters = (activeMilliseconds: number, acceptedKeystrokes: number, rejectedKeystrokes: number): ScoreCounters =>
  ({ activeMilliseconds, acceptedKeystrokes, rejectedKeystrokes });

const CASES: readonly ScoreCase[] = [
  {
    id: '300 correct symbols in one minute is 60 wpm at full accuracy',
    counters: counters(MINUTE, 300, 0),
    expected: { wordsPerMinute: 60, accuracyPercent: 100, points: 60 },
  },
  {
    id: 'half a minute doubles the rate',
    counters: counters(MINUTE / 2, 150, 0),
    expected: { wordsPerMinute: 60, accuracyPercent: 100, points: 60 },
  },
  {
    id: 'rejected keystrokes lower accuracy but not speed',
    counters: counters(MINUTE, 300, 100),
    expected: { wordsPerMinute: 60, accuracyPercent: 75, points: 45 },
  },
  {
    id: 'points are speed penalised by accuracy',
    counters: counters(MINUTE, 150, 150),
    expected: { wordsPerMinute: 30, accuracyPercent: 50, points: 15 },
  },
  { id: 'no elapsed time yields no speed, never a division by zero', counters: counters(0, 42, 0), expected: { wordsPerMinute: 0, accuracyPercent: 100, points: 0 } },
  { id: 'no keystrokes at all counts as flawless', counters: counters(MINUTE, 0, 0), expected: { wordsPerMinute: 0, accuracyPercent: 100, points: 0 } },
  { id: 'only mistakes means zero accuracy', counters: counters(MINUTE, 0, 50), expected: { wordsPerMinute: 0, accuracyPercent: 0, points: 0 } },
  { id: 'results are rounded to whole numbers', counters: counters(MINUTE, 301, 0), expected: { wordsPerMinute: 60, accuracyPercent: 100, points: 60 } },
];

describe('scoreFrom', () => {
  it('scores every case', () => {
    const mismatches = CASES
      .map(({ id, counters: input, expected }) => ({ id, expected, actual: scoreFrom(input) }))
      .filter(({ expected, actual }) => JSON.stringify(actual) !== JSON.stringify(expected));
    expect(mismatches).toEqual([]);
  });
});

describe('sumCounters', () => {
  it('adds every counter field', () => {
    expect(sumCounters(counters(1000, 10, 2), counters(500, 4, 1))).toEqual(counters(1500, 14, 3));
  });
});
