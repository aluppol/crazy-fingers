import { SourceDocument } from '../../application';
import { ParsedDocument } from '../../domain';

export interface IFormatParser {
  parse(source: SourceDocument): Promise<ParsedDocument>;
}
