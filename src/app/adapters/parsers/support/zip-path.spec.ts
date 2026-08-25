import { directoryOf, resolveZipPath } from './zip-path';

interface ResolveCase {
  readonly id: string;
  readonly base: string;
  readonly reference: string;
  readonly expected: string;
}

const CASES: readonly ResolveCase[] = [
  { id: 'sibling file', base: 'OEBPS/', reference: 'ch1.xhtml', expected: 'OEBPS/ch1.xhtml' },
  { id: 'subdirectory', base: 'OEBPS/', reference: 'text/ch1.xhtml', expected: 'OEBPS/text/ch1.xhtml' },
  { id: 'parent directory', base: 'OEBPS/text/', reference: '../images/a.png', expected: 'OEBPS/images/a.png' },
  { id: 'fragment stripped', base: 'OEBPS/', reference: 'ch1.xhtml#start', expected: 'OEBPS/ch1.xhtml' },
  { id: 'percent decoding', base: '', reference: 'my%20book.xhtml', expected: 'my book.xhtml' },
  { id: 'absolute reference', base: 'OEBPS/', reference: '/other/ch1.xhtml', expected: 'other/ch1.xhtml' },
  { id: 'current directory segments', base: 'OEBPS/', reference: './ch1.xhtml', expected: 'OEBPS/ch1.xhtml' },
];

describe('resolveZipPath', () => {
  it('resolves every case', () => {
    const mismatches = CASES
      .map(({ id, base, reference, expected }) => ({ id, expected, actual: resolveZipPath(base, reference) }))
      .filter(({ expected, actual }) => actual !== expected);
    expect(mismatches).toEqual([]);
  });
});

describe('directoryOf', () => {
  it('keeps the trailing slash and returns empty for root files', () => {
    expect(directoryOf('OEBPS/content.opf')).toBe('OEBPS/');
    expect(directoryOf('content.opf')).toBe('');
  });
});
