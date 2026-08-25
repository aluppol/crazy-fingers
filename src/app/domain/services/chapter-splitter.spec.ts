import { Chapter } from '../entities';
import { ChapterSplitter } from './chapter-splitter';

interface SplitCase {
  readonly id: string;
  readonly text: string;
  readonly expected: readonly Chapter[];
}

const chapter = (text: string, title: string): Chapter => ({ title, firstSymbolIndex: text.indexOf(title.split(' — ')[0]) });

const listText = `FIRST CHAPTER\n${'a'.repeat(1000)}\nUNIFORM\nthree sets of robes\nCOURSE BOOKS\nsome books\nSECOND CHAPTER\n${'b'.repeat(1000)}`;
const labelText = `CHAPTER ONE\n${'a'.repeat(500)}\nChapter 2\nx\nTHIRD\ny\nFOURTH\n${'b'.repeat(500)}`;
const tinyFirstText = `TINY\nx\nBIG CHAPTER\n${'a'.repeat(200)}\nOTHER CHAPTER\n${'b'.repeat(200)}`;

const CASES: readonly SplitCase[] = [
  {
    id: 'detects numbered chapter labels',
    text: 'Chapter 1\nfirst\nChapter 2: The End\nsecond',
    expected: [{ title: 'Chapter 1', firstSymbolIndex: 0 }, { title: 'Chapter 2: The End', firstSymbolIndex: 16 }],
  },
  {
    id: 'detects capitalized titles',
    text: 'THE BOY WHO LIVED\ntext\nHALLOWEEN\nmore',
    expected: [{ title: 'THE BOY WHO LIVED', firstSymbolIndex: 0 }, { title: 'HALLOWEEN', firstSymbolIndex: 23 }],
  },
  {
    id: 'merges a label with the title that follows it',
    text: 'CHAPTER ONE\nTHE BOY WHO LIVED\ntext',
    expected: [{ title: 'CHAPTER ONE — THE BOY WHO LIVED', firstSymbolIndex: 0 }],
  },
  {
    id: 'merges a standalone number with the title that follows it',
    text: '3\nTHE LETTERS FROM NO ONE\ntext',
    expected: [{ title: '3 — THE LETTERS FROM NO ONE', firstSymbolIndex: 0 }],
  },
  {
    id: 'does not merge two capitalized titles',
    text: 'ALBUS DUMBLEDORE\nCURRENTLY HEADMASTER\ntext',
    expected: [{ title: 'ALBUS DUMBLEDORE', firstSymbolIndex: 0 }, { title: 'CURRENTLY HEADMASTER', firstSymbolIndex: 17 }],
  },
  { id: 'ignores sentences that start with a label word', text: 'Part of him wanted to laugh.\nChapter one was boring, he thought.', expected: [] },
  { id: 'ignores short shouts and exclamations', text: 'NO!\nOK\nfine', expected: [] },
  {
    id: 'detects cyrillic labels and roman numerals',
    text: 'Глава 1\nтекст\nII\nещё',
    expected: [{ title: 'Глава 1', firstSymbolIndex: 0 }, { title: 'II', firstSymbolIndex: 14 }],
  },
  {
    id: 'detects standalone prologue and epilogue',
    text: 'Prologue\ntext\nEpilogue\nend',
    expected: [{ title: 'Prologue', firstSymbolIndex: 0 }, { title: 'Epilogue', firstSymbolIndex: 14 }],
  },
  { id: 'ignores overlong capitalized lines', text: `${'A'.repeat(61)}\ntext`, expected: [] },
  { id: 'keeps long labels', text: `Chapter 1: ${'x'.repeat(60)}\ntext`, expected: [{ title: `Chapter 1: ${'x'.repeat(60)}`, firstSymbolIndex: 0 }] },
  {
    id: 'drops guessed headings that open tiny chapters',
    text: listText,
    expected: [chapter(listText, 'FIRST CHAPTER'), chapter(listText, 'SECOND CHAPTER')],
  },
  {
    id: 'never drops labels',
    text: labelText,
    expected: [chapter(labelText, 'CHAPTER ONE'), chapter(labelText, 'Chapter 2'), chapter(labelText, 'FOURTH')],
  },
  {
    id: 'never drops the first heading',
    text: tinyFirstText,
    expected: [chapter(tinyFirstText, 'TINY'), chapter(tinyFirstText, 'BIG CHAPTER'), chapter(tinyFirstText, 'OTHER CHAPTER')],
  },
  { id: 'returns nothing for headless prose', text: 'just prose\nmore prose', expected: [] },
  { id: 'returns nothing for empty text', text: '', expected: [] },
];

describe('ChapterSplitter', () => {
  it('splits every case', () => {
    const splitter = new ChapterSplitter();
    const mismatches = CASES
      .map(({ id, text, expected }) => ({ id, expected, actual: splitter.split(text) }))
      .filter(({ expected, actual }) => JSON.stringify(actual) !== JSON.stringify(expected));
    expect(mismatches).toEqual([]);
  });

  it('titles a chapter by its first paragraph, truncated to 60 symbols', () => {
    const splitter = new ChapterSplitter();
    expect(splitter.titleFromExcerpt('Short opening.\nsecond paragraph')).toBe('Short opening.');
    expect(splitter.titleFromExcerpt(`${'word '.repeat(13)}tail\nnext`)).toBe(`${'word '.repeat(11)}word…`);
  });
});
