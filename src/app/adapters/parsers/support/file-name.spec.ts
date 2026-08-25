import { extensionOf, titleFromFileName } from './file-name';

describe('extensionOf', () => {
  it('lower-cases the last extension and returns empty without one', () => {
    expect(extensionOf('Book.EPUB')).toBe('epub');
    expect(extensionOf('archive.tar.gz')).toBe('gz');
    expect(extensionOf('README')).toBe('');
  });
});

describe('titleFromFileName', () => {
  it('drops the extension and replaces underscores', () => {
    expect(titleFromFileName('harry_potter_1.txt')).toBe('harry potter 1');
    expect(titleFromFileName('.hidden')).toBe('.hidden');
    expect(titleFromFileName('README')).toBe('README');
  });
});
