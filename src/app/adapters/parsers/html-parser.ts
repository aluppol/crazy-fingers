import { SourceDocument } from '../../application';
import { ParsedDocument } from '../../domain';
import { IFormatParser } from './format-parser.interface';
import { decodeText, extractSections, parseHtml, titleFromFileName } from './support';

const AUTHOR_META_SELECTOR = 'meta[name="author"]';
const CONTENT_ATTRIBUTE = 'content';

export class HtmlParser implements IFormatParser {
  public async parse(source: SourceDocument): Promise<ParsedDocument> {
    const parsed = parseHtml(decodeText(source.bytes));
    const author = parsed.querySelector(AUTHOR_META_SELECTOR)?.getAttribute(CONTENT_ATTRIBUTE)?.trim() ?? '';
    return {
      title: parsed.title.trim() || titleFromFileName(source.name),
      author: author || null,
      sections: extractSections(parsed.body),
    };
  }
}
