import { DocumentExtension, UnsupportedFormatError } from '../../application';
import { ParsedDocument } from '../../domain';
import { textSource } from '../../../testing';
import { FormatDispatchingParser, ParserRegistration } from './format-dispatching-parser';

const parsedAs = (label: string): ParsedDocument => ({ title: label, author: null, sections: [] });

describe('FormatDispatchingParser', () => {
  let created: string[];
  let parser: FormatDispatchingParser;

  beforeEach(() => {
    created = [];
    const register = (label: string, extensions: DocumentExtension[]): ParserRegistration => ({
      extensions,
      create: () => {
        created.push(label);
        return Promise.resolve({ parse: () => Promise.resolve(parsedAs(label)) });
      },
    });
    parser = new FormatDispatchingParser([
      register('text', [DocumentExtension.PlainText, DocumentExtension.PlainTextLong]),
      register('epub', [DocumentExtension.Epub]),
    ]);
  });

  it('lists every registered extension', () => {
    expect(parser.supportedExtensions).toEqual([DocumentExtension.PlainText, DocumentExtension.PlainTextLong, DocumentExtension.Epub]);
  });

  it('dispatches by the lower-cased extension and creates the parser lazily', async () => {
    expect(created).toEqual([]);
    expect(await parser.parse(textSource('BOOK.EPUB', ''))).toEqual(parsedAs('epub'));
    expect(created).toEqual(['epub']);
  });

  it('rejects an extension no parser is registered for', async () => {
    await expect(parser.parse(textSource('book.docx', ''))).rejects.toMatchObject({ extension: DocumentExtension.Docx });
  });

  it('rejects unknown and absent extensions', async () => {
    await expect(parser.parse(textSource('book.mobi', ''))).rejects.toMatchObject({ extension: 'mobi' });
    await expect(parser.parse(textSource('README', ''))).rejects.toBeInstanceOf(UnsupportedFormatError);
  });
});
