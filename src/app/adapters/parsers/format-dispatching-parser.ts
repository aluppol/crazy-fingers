import { DocumentExtension, IDocumentParser, SourceDocument, toDocumentExtension, UnsupportedFormatError } from '../../application';
import { ParsedDocument } from '../../domain';
import { IFormatParser } from './format-parser.interface';
import { extensionOf } from './support';

export interface ParserRegistration {
  readonly extensions: readonly DocumentExtension[];
  readonly create: () => Promise<IFormatParser>;
}

export class FormatDispatchingParser implements IDocumentParser {
  private readonly _registrationsByExtension: ReadonlyMap<DocumentExtension, ParserRegistration>;

  constructor(registrations: readonly ParserRegistration[]) {
    this._registrationsByExtension = new Map(
      registrations.flatMap(registration => registration.extensions.map(extension => [extension, registration] as const)),
    );
  }

  public get supportedExtensions(): readonly DocumentExtension[] {
    return [...this._registrationsByExtension.keys()];
  }

  public async parse(source: SourceDocument): Promise<ParsedDocument> {
    const rawExtension = extensionOf(source.name);
    const registration = this._registrationFor(rawExtension);
    if (registration === undefined) throw new UnsupportedFormatError(rawExtension);
    return (await registration.create()).parse(source);
  }

  private _registrationFor(rawExtension: string): ParserRegistration | undefined {
    const extension = toDocumentExtension(rawExtension);
    return extension === undefined ? undefined : this._registrationsByExtension.get(extension);
  }
}
