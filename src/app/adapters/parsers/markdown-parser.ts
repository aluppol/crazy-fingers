import { SourceDocument } from '../../application';
import { DocumentSection, ParsedDocument } from '../../domain';
import { IFormatParser } from './format-parser.interface';
import { decodeText, SectionBuilder, titleFromFileName } from './support';

const HEADING_LINE = /^ {0,3}#{1,6}\s+(.*?)\s*#*\s*$/;
const CODE_FENCE = /^\s*(```|~~~)/;
const INLINE_MARKUP: ReadonlyArray<readonly [RegExp, string]> = [
  [/!\[[^\]]*\]\([^)]*\)/g, ''],
  [/\[([^\]]+)\]\([^)]*\)/g, '$1'],
  [/(\*\*|__)(.+?)\1/g, '$2'],
  [/(\*|_)(.+?)\1/g, '$2'],
  [/`([^`]+)`/g, '$1'],
  [/^ {0,3}>\s?/gm, ''],
  [/^\s*[-*+]\s+/gm, ''],
  [/^\s*\d+\.\s+/gm, ''],
  [/^\s*([-*_])(\s*\1){2,}\s*$/gm, ''],
];

export class MarkdownParser implements IFormatParser {
  public async parse(source: SourceDocument): Promise<ParsedDocument> {
    return {
      title: titleFromFileName(source.name),
      author: null,
      sections: this._sectionsOf(decodeText(source.bytes).split(/\r?\n/)),
    };
  }

  private _sectionsOf(lines: readonly string[]): DocumentSection[] {
    const builder = new SectionBuilder();
    for (const line of lines) {
      const heading = HEADING_LINE.exec(line);
      if (heading !== null) builder.openSection(stripInlineMarkup(heading[1]));
      else if (!CODE_FENCE.test(line)) builder.appendText(`${line}\n`);
    }
    return builder.sections().map(section => ({ title: section.title, text: stripInlineMarkup(section.text) }));
  }
}

function stripInlineMarkup(text: string): string {
  return INLINE_MARKUP.reduce((partiallyStripped, [pattern, replacement]) => partiallyStripped.replace(pattern, replacement), text);
}
