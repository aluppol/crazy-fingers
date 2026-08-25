import { BookDraft, Chapter, DocumentSection, ParsedDocument } from '../entities';
import { ChapterSplitter } from './chapter-splitter';
import { TextNormalizer } from './text-normalizer';

const UNTITLED_BOOK = 'Untitled';

export class BookAssembler {
  constructor(
    private readonly _normalizer: TextNormalizer,
    private readonly _splitter: ChapterSplitter,
  ) {}

  public assemble(document: ParsedDocument): BookDraft {
    const sections = this._normalizeSections(document.sections);
    return {
      title: document.title.trim() || UNTITLED_BOOK,
      author: document.author,
      text: sections.map(section => section.text).join('\n'),
      chapters: this._collectChapters(sections),
    };
  }

  private _normalizeSections(sections: readonly DocumentSection[]): DocumentSection[] {
    return sections
      .map(section => ({ title: section.title, text: this._normalizer.normalize(section.text) }))
      .filter(section => section.text.length > 0);
  }

  private _collectChapters(sections: readonly DocumentSection[]): Chapter[] {
    const chapters: Chapter[] = [];
    let sectionStart = 0;
    for (const section of sections) {
      const detected = this._detectedChapters(section, sectionStart);
      const opensAtStart = detected[0]?.firstSymbolIndex === sectionStart;
      chapters.push(...(opensAtStart ? detected : [this._openingChapter(section, sectionStart), ...detected]));
      sectionStart += section.text.length + 1;
    }
    return chapters;
  }

  private _detectedChapters(section: DocumentSection, sectionStart: number): Chapter[] {
    if (section.title !== null) return [];
    return this._splitter.split(section.text)
      .map(chapter => ({ title: chapter.title, firstSymbolIndex: chapter.firstSymbolIndex + sectionStart }));
  }

  private _openingChapter(section: DocumentSection, sectionStart: number): Chapter {
    return { title: section.title ?? this._splitter.titleFromExcerpt(section.text), firstSymbolIndex: sectionStart };
  }
}
