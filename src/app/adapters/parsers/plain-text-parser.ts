import { SourceDocument } from '../../application';
import { ParsedDocument } from '../../domain';
import { IFormatParser } from './format-parser.interface';
import { decodeText, titleFromFileName } from './support';

export class PlainTextParser implements IFormatParser {
  public async parse(source: SourceDocument): Promise<ParsedDocument> {
    return {
      title: titleFromFileName(source.name),
      author: null,
      sections: [{ title: null, text: decodeText(source.bytes) }],
    };
  }
}
