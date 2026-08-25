import { Chapter } from '../entities';
import { chapterIndexAt } from './chapter-locator';

const CHAPTERS: readonly Chapter[] = [
  { title: 'A', firstSymbolIndex: 0 },
  { title: 'B', firstSymbolIndex: 10 },
  { title: 'C', firstSymbolIndex: 20 },
];

interface LocatorCase {
  readonly id: string;
  readonly chapters: readonly Chapter[];
  readonly symbolIndex: number;
  readonly expected: number;
}

const CASES: readonly LocatorCase[] = [
  { id: 'start of the first chapter', chapters: CHAPTERS, symbolIndex: 0, expected: 0 },
  { id: 'last symbol of the first chapter', chapters: CHAPTERS, symbolIndex: 9, expected: 0 },
  { id: 'start of the second chapter', chapters: CHAPTERS, symbolIndex: 10, expected: 1 },
  { id: 'inside the last chapter', chapters: CHAPTERS, symbolIndex: 25, expected: 2 },
  { id: 'before the first chapter', chapters: [{ title: 'Late', firstSymbolIndex: 5 }], symbolIndex: 2, expected: 0 },
  { id: 'no chapters', chapters: [], symbolIndex: 3, expected: 0 },
];

describe('chapterIndexAt', () => {
  it('locates every case', () => {
    const mismatches = CASES
      .map(({ id, chapters, symbolIndex, expected }) => ({ id, expected, actual: chapterIndexAt(chapters, symbolIndex) }))
      .filter(({ expected, actual }) => actual !== expected);
    expect(mismatches).toEqual([]);
  });
});
