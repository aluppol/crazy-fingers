import { CorruptDocumentError } from '../../application';
import { squash, textSource } from '../../../testing';
import { Fb2Parser } from './fb2-parser';

const FB2 = `<?xml version="1.0" encoding="UTF-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0">
  <description><title-info>
    <book-title>Книга</book-title>
    <author><first-name>Иван</first-name><last-name>Петров</last-name></author>
  </title-info></description>
  <body>
    <title><p>Книга</p></title>
    <section><title><p>Глава 1</p></title><p>Первый абзац.</p><empty-line/><p>Второй.</p>
      <section><title><p>Часть</p></title><p>Вложенный.</p></section>
    </section>
  </body>
  <body name="notes"><section><p>note</p></section></body>
</FictionBook>`;

describe('Fb2Parser', () => {
  it('reads metadata and nested sections, skipping notes', async () => {
    const parsed = await new Fb2Parser().parse(textSource('kniga.fb2', FB2));
    expect(parsed.title).toBe('Книга');
    expect(parsed.author).toBe('Иван Петров');
    expect(parsed.sections.map(section => ({ title: section.title, text: squash(section.text) }))).toEqual([
      { title: null, text: 'Книга' },
      { title: 'Глава 1', text: 'Глава 1 Первый абзац. Второй.' },
      { title: 'Часть', text: 'Часть Вложенный.' },
    ]);
  });

  it('rejects malformed xml', async () => {
    await expect(new Fb2Parser().parse(textSource('broken.fb2', '<FictionBook><body>'))).rejects.toBeInstanceOf(CorruptDocumentError);
  });
});
