import { median } from './statistics';

const TYPOGRAPHIC_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/[\u2018\u2019\u201A\u201B\u2039\u203A\u02BC]/g, '\''],
  [/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"'],
  [/[\u2010-\u2015\u2212]/g, '-'],
  [/\u2026/g, '...'],
  [/[\u00A0\u2000-\u200A\u202F\u205F\u3000\t]/g, ' '],
  [/[\u00AD\u200B-\u200D\u2060\uFEFF]/g, ''],
];

const UNTYPEABLE_SYMBOLS = /[^\p{L}\p{M}\p{N} \n.,!?;:'"()[\]{}<>/\\|@#$%^&*+=_~`-]/gu;
const BLANK_LINE = /\n[ ]*\n/;
const LINE_BREAK = /\n/;
const WHITESPACE_RUN = /\s+/g;
const MAX_HARD_WRAPPED_LINE_LENGTH = 80;

export class TextNormalizer {
  public normalize(rawText: string): string {
    const unifiedText = rawText.normalize('NFC').replace(/\r\n?/g, '\n');
    const asciiPunctuationText = this._replaceTypographicSymbols(unifiedText);
    const typeableText = asciiPunctuationText.replace(UNTYPEABLE_SYMBOLS, '');
    return this._reflowParagraphs(typeableText);
  }

  private _replaceTypographicSymbols(text: string): string {
    return TYPOGRAPHIC_REPLACEMENTS.reduce(
      (partiallyReplacedText, [pattern, replacement]) => partiallyReplacedText.replace(pattern, replacement),
      text,
    );
  }

  private _reflowParagraphs(text: string): string {
    const paragraphSeparator = this._isHardWrapped(text) ? BLANK_LINE : LINE_BREAK;
    return text
      .split(paragraphSeparator)
      .map(paragraph => paragraph.replace(WHITESPACE_RUN, ' ').trim())
      .filter(paragraph => paragraph.length > 0)
      .join('\n');
  }

  private _isHardWrapped(text: string): boolean {
    const lineLengths = text.split(LINE_BREAK).map(line => line.trim().length).filter(length => length > 0);
    return BLANK_LINE.test(text) && median(lineLengths) <= MAX_HARD_WRAPPED_LINE_LENGTH;
  }
}
