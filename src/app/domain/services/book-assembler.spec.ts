import { BookDraft, ParsedDocument } from '../entities';
import { BookAssembler } from './book-assembler';
import { ChapterSplitter } from './chapter-splitter';
import { TextNormalizer } from './text-normalizer';

interface AssemblyCase {
  readonly id: string;
  readonly document: ParsedDocument;
  readonly expected: BookDraft;
}

const document = (sections: ParsedDocument['sections'], title = 'Book', author: string | null = 'Someone'): ParsedDocument => ({ title, author, sections });

const CASES: readonly AssemblyCase[] = [
  {
    id: 'keeps titled sections as chapters',
    document: document([{ title: 'One', text: 'a b' }, { title: 'Two', text: 'c' }]),
    expected: { title: 'Book', author: 'Someone', text: 'a b\nc', chapters: [{ title: 'One', firstSymbolIndex: 0 }, { title: 'Two', firstSymbolIndex: 4 }] },
  },
  {
    id: 'splits untitled sections by detected headings',
    document: document([{ title: null, text: 'Chapter 1\nfoo\nChapter 2\nbar' }]),
    expected: {
      title: 'Book',
      author: 'Someone',
      text: 'Chapter 1\nfoo\nChapter 2\nbar',
      chapters: [{ title: 'Chapter 1', firstSymbolIndex: 0 }, { title: 'Chapter 2', firstSymbolIndex: 14 }],
    },
  },
  {
    id: 'titles a headless section by its excerpt',
    document: document([{ title: null, text: 'Mr. Dursley was proud.\nmore' }]),
    expected: { title: 'Book', author: 'Someone', text: 'Mr. Dursley was proud.\nmore', chapters: [{ title: 'Mr. Dursley was proud.', firstSymbolIndex: 0 }] },
  },
  {
    id: 'adds an excerpt chapter for text before the first heading',
    document: document([{ title: null, text: 'Some preface.\nChapter 1\nfoo' }]),
    expected: {
      title: 'Book',
      author: 'Someone',
      text: 'Some preface.\nChapter 1\nfoo',
      chapters: [{ title: 'Some preface.', firstSymbolIndex: 0 }, { title: 'Chapter 1', firstSymbolIndex: 14 }],
    },
  },
  {
    id: 'drops empty sections',
    document: document([{ title: 'Empty', text: '  \n ' }, { title: 'Real', text: 'x' }]),
    expected: { title: 'Book', author: 'Someone', text: 'x', chapters: [{ title: 'Real', firstSymbolIndex: 0 }] },
  },
  {
    id: 'normalizes section text',
    document: document([{ title: 'Q', text: 'ok?\r\n\r\n“yes”' }]),
    expected: { title: 'Book', author: 'Someone', text: 'ok?\n"yes"', chapters: [{ title: 'Q', firstSymbolIndex: 0 }] },
  },
  {
    id: 'offsets chapters of later sections',
    document: document([{ title: 'One', text: 'aa' }, { title: null, text: 'Chapter 2\nbb' }]),
    expected: {
      title: 'Book',
      author: 'Someone',
      text: 'aa\nChapter 2\nbb',
      chapters: [{ title: 'One', firstSymbolIndex: 0 }, { title: 'Chapter 2', firstSymbolIndex: 3 }],
    },
  },
  {
    id: 'falls back to an untitled book',
    document: document([{ title: 'One', text: 'a' }], '   ', null),
    expected: { title: 'Untitled', author: null, text: 'a', chapters: [{ title: 'One', firstSymbolIndex: 0 }] },
  },
  {
    id: 'yields no chapters for an empty document',
    document: document([]),
    expected: { title: 'Book', author: 'Someone', text: '', chapters: [] },
  },
];

describe('BookAssembler', () => {
  it('assembles every case', () => {
    const assembler = new BookAssembler(new TextNormalizer(), new ChapterSplitter());
    const mismatches = CASES
      .map(({ id, document: parsed, expected }) => ({ id, expected, actual: assembler.assemble(parsed) }))
      .filter(({ expected, actual }) => JSON.stringify(actual) !== JSON.stringify(expected));
    expect(mismatches).toEqual([]);
  });
});
