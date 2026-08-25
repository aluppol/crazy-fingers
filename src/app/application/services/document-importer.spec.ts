import { BookAssembler, ChapterSplitter, TextNormalizer } from '../../domain';
import { InMemoryBookRepository } from '../../../testing';
import { EmptyDocumentError } from '../errors';
import { DocumentExtension } from '../enums';
import { IDocumentParser } from '../ports';
import { DocumentImporter } from './document-importer';

const parser: IDocumentParser = {
  supportedExtensions: [DocumentExtension.PlainText],
  parse: source => Promise.resolve({ title: source.name, author: 'A. Author', sections: [{ title: null, text: 'Chapter 1\nHello' }] }),
};

const createImporter = (): { importer: DocumentImporter; books: InMemoryBookRepository } => {
  const books = new InMemoryBookRepository();
  const assembler = new BookAssembler(new TextNormalizer(), new ChapterSplitter());
  return { importer: new DocumentImporter(parser, assembler, books, { nextId: () => 'book-1' }, { now: () => 1000 }), books };
};

describe('DocumentImporter', () => {
  it('imports a parsed document as a book', async () => {
    const { importer, books } = createImporter();
    await importer.importDocument({ name: 'story.txt', bytes: new ArrayBuffer(0) });
    expect(books.savedBooks).toEqual([{
      id: 'book-1',
      addedAt: 1000,
      title: 'story.txt',
      author: 'A. Author',
      text: 'Chapter 1\nHello',
      chapters: [{ title: 'Chapter 1', firstSymbolIndex: 0 }],
    }]);
  });

  it('imports pasted text as a single untitled section', async () => {
    const { importer, books } = createImporter();
    await importer.importText('Note', 'hi there');
    expect(books.savedBooks).toEqual([{
      id: 'book-1',
      addedAt: 1000,
      title: 'Note',
      author: null,
      text: 'hi there',
      chapters: [{ title: 'hi there', firstSymbolIndex: 0 }],
    }]);
  });

  it('rejects documents without typeable text', async () => {
    const { importer, books } = createImporter();
    await expect(importer.importText('Blank', ' \n ')).rejects.toBeInstanceOf(EmptyDocumentError);
    expect(books.savedBooks).toEqual([]);
  });

  it('exposes the extensions of the parser', () => {
    expect(createImporter().importer.supportedExtensions).toEqual([DocumentExtension.PlainText]);
  });
});
