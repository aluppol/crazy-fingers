import type { PDFDocumentProxy, TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';
import { CorruptDocumentError, SourceDocument } from '../../application';
import { DocumentSection, ParsedDocument } from '../../domain';
import { IFormatParser } from './format-parser.interface';
import { ParserErrorReason } from './enums';
import { titleFromFileName } from './support';

type PdfJs = typeof import('pdfjs-dist');

interface OutlineEntry {
  readonly title: string;
  readonly pageIndex: number;
}

interface PdfInformation {
  readonly Title?: string;
  readonly Author?: string;
}

const PARAGRAPH_GAP_RATIO = 1.5;
const HYPHENATED_LINE_BREAK = /-\n(?=\p{Ll})/gu;

export class PdfParser implements IFormatParser {
  constructor(
    private readonly _loadPdfJs: () => Promise<PdfJs>,
    private readonly _workerUrl: string,
  ) {}

  public async parse(source: SourceDocument): Promise<ParsedDocument> {
    const pdfjs = await this._loadPdfJs();
    pdfjs.GlobalWorkerOptions.workerSrc = this._workerUrl;
    const document = await this._load(pdfjs, source);
    const [pageTexts, outline, metadata] = await Promise.all([this._pageTexts(document), this._outline(document), document.getMetadata()]);
    const information = metadata.info as PdfInformation;
    return {
      title: information.Title?.trim() || titleFromFileName(source.name),
      author: information.Author?.trim() || null,
      sections: sectionsFrom(pageTexts, outline),
    };
  }

  private async _load(pdfjs: PdfJs, source: SourceDocument): Promise<PDFDocumentProxy> {
    try {
      return await pdfjs.getDocument({ data: new Uint8Array(source.bytes) }).promise;
    } catch (error) {
      throw new CorruptDocumentError(source.name, error instanceof Error ? error.message : ParserErrorReason.UnreadablePdf);
    }
  }

  private _pageTexts(document: PDFDocumentProxy): Promise<string[]> {
    const pageNumbers = [...Array(document.numPages).keys()].map(pageIndex => pageIndex + 1);
    return Promise.all(pageNumbers.map(async pageNumber => {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      return pageText(content.items.filter(isTextItem));
    }));
  }

  private async _outline(document: PDFDocumentProxy): Promise<OutlineEntry[]> {
    const outline = await document.getOutline() ?? [];
    const entries = await Promise.all(
      outline.map(async item => ({ title: item.title, pageIndex: await this._pageIndexOf(document, item.dest) })),
    );
    return entries.filter((entry): entry is OutlineEntry => entry.pageIndex !== null);
  }

  private async _pageIndexOf(document: PDFDocumentProxy, destination: unknown): Promise<number | null> {
    const explicitDestination = typeof destination === 'string' ? await document.getDestination(destination) : destination;
    if (!Array.isArray(explicitDestination)) return null;
    const pageReference: unknown = explicitDestination[0];
    if (typeof pageReference === 'number') return pageReference;
    try {
      return await document.getPageIndex(pageReference as { num: number; gen: number });
    } catch {
      return null;
    }
  }
}

function isTextItem(item: TextItem | TextMarkedContent): item is TextItem {
  return 'str' in item;
}

function pageText(items: readonly TextItem[]): string {
  let text = '';
  items.forEach((item, index) => {
    text += item.str;
    if (!item.hasEOL) return;
    const next = items.at(index + 1);
    const verticalGap = next === undefined ? 0 : item.transform[5] - next.transform[5];
    text += verticalGap > item.height * PARAGRAPH_GAP_RATIO ? '\n\n' : '\n';
  });
  return text.replace(HYPHENATED_LINE_BREAK, '');
}

function sectionsFrom(pageTexts: readonly string[], outline: readonly OutlineEntry[]): DocumentSection[] {
  const entries = [...outline].sort((earlier, later) => earlier.pageIndex - later.pageIndex);
  const firstEntryPage = entries.at(0)?.pageIndex ?? pageTexts.length;
  const sections: DocumentSection[] = [];
  if (firstEntryPage > 0) sections.push({ title: null, text: pageTexts.slice(0, firstEntryPage).join('\n\n') });
  entries.forEach((entry, index) => {
    const endPage = entries.at(index + 1)?.pageIndex ?? pageTexts.length;
    if (endPage > entry.pageIndex) sections.push({ title: entry.title, text: pageTexts.slice(entry.pageIndex, endPage).join('\n\n') });
  });
  return sections;
}
