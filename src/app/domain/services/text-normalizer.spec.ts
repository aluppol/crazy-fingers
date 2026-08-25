import { TextNormalizer } from './text-normalizer';

interface NormalizationCase {
  readonly id: string;
  readonly input: string;
  readonly expected: string;
}

const CASES: readonly NormalizationCase[] = [
  { id: 'keeps question marks', input: 'Are you ok? Yes.', expected: 'Are you ok? Yes.' },
  { id: 'replaces typographic quotes', input: 'He said “hello” and ‘bye’, that’s it', expected: 'He said "hello" and \'bye\', that\'s it' },
  { id: 'replaces guillemets', input: '«Привет»', expected: '"Привет"' },
  { id: 'unifies windows and classic mac line endings', input: 'one\r\n\r\ntwo\rthree', expected: 'one\ntwo three' },
  { id: 'keeps cyrillic', input: 'Привет, мир! Hello', expected: 'Привет, мир! Hello' },
  { id: 'replaces non-breaking space', input: 'a b', expected: 'a b' },
  { id: 'replaces ellipsis and dashes', input: 'wait… then – go — now', expected: 'wait... then - go - now' },
  { id: 'drops untypeable symbols', input: 'Copyright © 2001 ★ Rowling', expected: 'Copyright 2001 Rowling' },
  { id: 'reflows hard-wrapped paragraphs', input: 'Mr. and Mrs. Dursley,\nof number four,\n\nwere proud.', expected: 'Mr. and Mrs. Dursley, of number four,\nwere proud.' },
  { id: 'collapses tabs and space runs', input: 'a\t\tb   c', expected: 'a b c' },
  { id: 'composes decomposed accents', input: 'café', expected: 'café' },
  { id: 'removes soft hyphens and zero-width characters', input: 'mus­tache​!', expected: 'mustache!' },
  { id: 'trims blank paragraphs', input: '\n\n  first  \n\n\n\n second \n\n', expected: 'first\nsecond' },
  { id: 'keeps every ascii punctuation symbol', input: '.,!?;:\'"()[]{}<>/\\|@#$%^&*-+=_~`', expected: '.,!?;:\'"()[]{}<>/\\|@#$%^&*-+=_~`' },
  { id: 'returns empty text for whitespace', input: ' \n\t ', expected: '' },
  { id: 'keeps one paragraph per line when lines are not hard-wrapped', input: 'Chapter 1\nfoo\nChapter 2\nbar', expected: 'Chapter 1\nfoo\nChapter 2\nbar' },
  {
    id: 'keeps long lines as paragraphs even with blank lines between them',
    input: `${'a'.repeat(100)}\n\n${'b'.repeat(100)}\n${'c'.repeat(100)}`,
    expected: `${'a'.repeat(100)}\n${'b'.repeat(100)}\n${'c'.repeat(100)}`,
  },
  { id: 'keeps short lines as paragraphs when no blank line separates them', input: 'line one\nline two', expected: 'line one\nline two' },
];

describe('TextNormalizer', () => {
  it('normalizes every case', () => {
    const normalizer = new TextNormalizer();
    const mismatches = CASES
      .map(({ id, input, expected }) => ({ id, expected, actual: normalizer.normalize(input) }))
      .filter(({ expected, actual }) => actual !== expected);
    expect(mismatches).toEqual([]);
  });
});
