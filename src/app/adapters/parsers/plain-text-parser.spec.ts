import { bytesSource, textSource } from '../../../testing';
import { PlainTextParser } from './plain-text-parser';

describe('PlainTextParser', () => {
  const parser = new PlainTextParser();

  it('titles the book by the file name and keeps the text as one untitled section', async () => {
    expect(await parser.parse(textSource('my_book.txt', 'Hello\n\nWorld'))).toEqual({
      title: 'my book',
      author: null,
      sections: [{ title: null, text: 'Hello\n\nWorld' }],
    });
  });

  it('decodes utf-8 with a byte order mark', async () => {
    const parsed = await parser.parse(bytesSource('bom.txt', [0xEF, 0xBB, 0xBF, 0xD0, 0x9F, 0xD1, 0x80]));
    expect(parsed.sections[0].text).toBe('Пр');
  });

  it('decodes utf-16 little endian with a byte order mark', async () => {
    const parsed = await parser.parse(bytesSource('utf16.txt', [0xFF, 0xFE, 0x68, 0x00, 0x69, 0x00]));
    expect(parsed.sections[0].text).toBe('hi');
  });

  it('falls back to windows-1251 for invalid utf-8', async () => {
    const parsed = await parser.parse(bytesSource('cp1251.txt', [0xCF, 0xF0, 0xE8, 0xE2, 0xE5, 0xF2]));
    expect(parsed.sections[0].text).toBe('Привет');
  });
});
