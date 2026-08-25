import { Chapter } from '../entities';
import { median } from './statistics';

interface HeadingParagraph extends Chapter {
  readonly ordinal: number;
  readonly isCertain: boolean;
  readonly absorbsNextHeading: boolean;
}

const LABEL_HEADING = /^(chapter|part|book|глава|часть|книга|том)\s+(\d+|[ivxlcdm]+|\p{L}+)(\s*[:.-]\s*.*)?$/iu;
const STANDALONE_WORD_LABEL = /^(prologue|epilogue|preface|introduction|пролог|эпилог|предисловие|введение)$/iu;
const STANDALONE_NUMBER_LABEL = /^(\d+|[IVXLCDM]+)\.?$/u;
const CAPITALIZED_HEADING = /^\p{Lu}[\p{Lu}\p{N} '-]{2,}$/u;
const MAX_LABEL_LENGTH = 80;
const MAX_CAPITALIZED_LENGTH = 60;
const MIN_GUESSED_CHAPTER_RATIO = 0.15;
const EXCERPT_TITLE_LENGTH = 60;

export class ChapterSplitter {
  public split(text: string): Chapter[] {
    const headings = this._mergeLabelHeadings(this._findHeadings(text));
    return this._dropShortGuessedChapters(headings, text.length)
      .map(({ title, firstSymbolIndex }) => ({ title, firstSymbolIndex }));
  }

  public titleFromExcerpt(text: string): string {
    const firstParagraph = text.split('\n', 1)[0];
    if (firstParagraph.length <= EXCERPT_TITLE_LENGTH) return firstParagraph;
    return `${firstParagraph.slice(0, EXCERPT_TITLE_LENGTH).trimEnd()}…`;
  }

  private _findHeadings(text: string): HeadingParagraph[] {
    const headings: HeadingParagraph[] = [];
    let paragraphStart = 0;
    text.split('\n').forEach((paragraph, ordinal) => {
      const heading = this._classifyHeading(paragraph, paragraphStart, ordinal);
      if (heading !== null) headings.push(heading);
      paragraphStart += paragraph.length + 1;
    });
    return headings;
  }

  private _classifyHeading(paragraph: string, firstSymbolIndex: number, ordinal: number): HeadingParagraph | null {
    const isLabel = paragraph.length <= MAX_LABEL_LENGTH && this._isLabel(paragraph);
    const isCapitalized = paragraph.length <= MAX_CAPITALIZED_LENGTH && CAPITALIZED_HEADING.test(paragraph);
    if (!isLabel && !isCapitalized) return null;
    return { title: paragraph, firstSymbolIndex, ordinal, isCertain: isLabel, absorbsNextHeading: isLabel };
  }

  private _isLabel(paragraph: string): boolean {
    return LABEL_HEADING.test(paragraph) || STANDALONE_WORD_LABEL.test(paragraph) || STANDALONE_NUMBER_LABEL.test(paragraph);
  }

  private _mergeLabelHeadings(headings: readonly HeadingParagraph[]): HeadingParagraph[] {
    const merged: HeadingParagraph[] = [];
    for (const heading of headings) {
      const previous = merged.at(-1);
      const completesLabel = previous !== undefined && previous.absorbsNextHeading && previous.ordinal + 1 === heading.ordinal;
      if (completesLabel) merged[merged.length - 1] = this._joinHeadings(previous, heading);
      else merged.push(heading);
    }
    return merged;
  }

  private _joinHeadings(label: HeadingParagraph, title: HeadingParagraph): HeadingParagraph {
    return {
      title: `${label.title} — ${title.title}`,
      firstSymbolIndex: label.firstSymbolIndex,
      ordinal: title.ordinal,
      isCertain: true,
      absorbsNextHeading: false,
    };
  }

  private _dropShortGuessedChapters(headings: readonly HeadingParagraph[], textLength: number): HeadingParagraph[] {
    const chapterLengths = headings.map(
      (heading, index) => (headings.at(index + 1)?.firstSymbolIndex ?? textLength) - heading.firstSymbolIndex,
    );
    const minimumLength = median(chapterLengths) * MIN_GUESSED_CHAPTER_RATIO;
    return headings.filter((heading, index) => heading.isCertain || index === 0 || chapterLengths[index] >= minimumLength);
  }
}
