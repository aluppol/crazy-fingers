import { FingerGuideVisibility } from '../enums';
import { fingerGuideVisibilityFrom, readFingerGuideVisibility, writeFingerGuideVisibility } from './finger-guide-preference';

interface StoredValueCase {
  readonly id: string;
  readonly storedValue: string | null;
  readonly expected: FingerGuideVisibility;
}

const CASES: readonly StoredValueCase[] = [
  { id: 'nothing stored', storedValue: null, expected: FingerGuideVisibility.Shown },
  { id: 'hidden', storedValue: 'hidden', expected: FingerGuideVisibility.Hidden },
  { id: 'shown', storedValue: 'shown', expected: FingerGuideVisibility.Shown },
  { id: 'garbage falls back to shown', storedValue: 'maybe', expected: FingerGuideVisibility.Shown },
  { id: 'empty string falls back to shown', storedValue: '', expected: FingerGuideVisibility.Shown },
];

describe('fingerGuideVisibilityFrom', () => {
  it('reads every stored value defensively', () => {
    const mismatches = CASES
      .map(({ id, storedValue, expected }) => ({ id, expected, actual: fingerGuideVisibilityFrom(storedValue) }))
      .filter(({ expected, actual }) => actual !== expected);
    expect(mismatches).toEqual([]);
  });
});

describe('finger guide preference storage', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips the choice through storage', () => {
    writeFingerGuideVisibility(localStorage, FingerGuideVisibility.Hidden);
    expect(readFingerGuideVisibility(localStorage)).toBe(FingerGuideVisibility.Hidden);
  });

  it('defaults to shown when storage is empty', () => {
    expect(readFingerGuideVisibility(localStorage)).toBe(FingerGuideVisibility.Shown);
  });

  it('defaults to shown when storage throws', () => {
    const brokenStorage = { getItem: (): string => { throw new Error('quota'); } } as unknown as Storage;
    expect(readFingerGuideVisibility(brokenStorage)).toBe(FingerGuideVisibility.Shown);
  });
});
