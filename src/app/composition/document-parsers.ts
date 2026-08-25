import {
  DocxParser, EpubParser, Fb2Parser, FormatDispatchingParser, HtmlParser, IFormatParser, MarkdownParser, PlainTextParser,
} from '../adapters/parsers';
import { DocumentExtension } from '../application';

const PDF_WORKER_URL = 'pdf.worker.min.mjs';

async function createPdfParser(): Promise<IFormatParser> {
  const pdfParserModule = await import('../adapters/parsers/pdf-parser');
  return new pdfParserModule.PdfParser(() => import('pdfjs-dist'), PDF_WORKER_URL);
}

export const documentParser = new FormatDispatchingParser([
  { extensions: [DocumentExtension.PlainText, DocumentExtension.PlainTextLong], create: () => Promise.resolve(new PlainTextParser()) },
  { extensions: [DocumentExtension.Markdown, DocumentExtension.MarkdownLong], create: () => Promise.resolve(new MarkdownParser()) },
  {
    extensions: [DocumentExtension.Html, DocumentExtension.HtmlShort, DocumentExtension.Xhtml],
    create: () => Promise.resolve(new HtmlParser()),
  },
  { extensions: [DocumentExtension.Epub], create: () => Promise.resolve(new EpubParser()) },
  { extensions: [DocumentExtension.FictionBook], create: () => Promise.resolve(new Fb2Parser()) },
  { extensions: [DocumentExtension.Docx], create: () => Promise.resolve(new DocxParser()) },
  { extensions: [DocumentExtension.Pdf], create: createPdfParser },
]);
