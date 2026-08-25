import { BookAssembler, IClock, ParsedDocument } from '../../domain';
import { EmptyDocumentError } from '../errors';
import { DocumentExtension } from '../enums';
import { IBookRepository, IDocumentParser, IIdGenerator, SourceDocument } from '../ports';

export class DocumentImporter {
  constructor(
    private readonly _parser: IDocumentParser,
    private readonly _assembler: BookAssembler,
    private readonly _books: IBookRepository,
    private readonly _idGenerator: IIdGenerator,
    private readonly _clock: IClock,
  ) {}

  public get supportedExtensions(): readonly DocumentExtension[] {
    return this._parser.supportedExtensions;
  }

  public async importDocument(source: SourceDocument): Promise<void> {
    const parsedDocument = await this._parser.parse(source);
    await this._importParsedDocument(parsedDocument, source.name);
  }

  public async importText(title: string, text: string): Promise<void> {
    await this._importParsedDocument({ title, author: null, sections: [{ title: null, text }] }, title);
  }

  private async _importParsedDocument(parsedDocument: ParsedDocument, documentName: string): Promise<void> {
    const draft = this._assembler.assemble(parsedDocument);
    if (draft.text.length === 0) throw new EmptyDocumentError(documentName);
    await this._books.save({ ...draft, id: this._idGenerator.nextId(), addedAt: this._clock.now() });
  }
}
