import { ParsedDocument } from '../../domain';
import { DocumentExtension } from '../enums';
import { SourceDocument } from './source-document';

export interface IDocumentParser {
  readonly supportedExtensions: readonly DocumentExtension[];
  parse(source: SourceDocument): Promise<ParsedDocument>;
}
