import { CorruptDocumentError, SourceDocument } from '../../application';
import { squash, textSource } from '../../../testing';
import { PdfParser } from './pdf-parser';

interface OutlineFixture {
  readonly title: string;
  readonly pageIndex: number;
}

const WORKER_URL = 'unused-in-node-because-the-worker-runs-on-the-main-thread';

const pdfSource = (name: string, pageTexts: readonly string[], outline: readonly OutlineFixture[] = []): SourceDocument => {
  const objects: string[] = [];
  const fontId = 3 + pageTexts.length * 2;
  const outlineRootId = fontId + 1;
  const outlinesClause = outline.length === 0 ? '' : ` /Outlines ${outlineRootId} 0 R /PageMode /UseOutlines`;
  objects.push(`<< /Type /Catalog /Pages 2 0 R${outlinesClause} >>`);
  const pageObjectIds = pageTexts.map((text, index) => 3 + index * 2);
  objects.push(`<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageTexts.length} >>`);
  pageTexts.forEach((text, index) => {
    const stream = `BT /F1 12 Tf 72 700 Td (${text}) Tj ET`;
    const resources = `/Resources << /Font << /F1 ${fontId} 0 R >> >>`;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${4 + index * 2} 0 R ${resources} >>`);
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  if (outline.length > 0) {
    const itemIds = outline.map((entry, index) => outlineRootId + 1 + index);
    objects.push(`<< /Type /Outlines /First ${itemIds[0]} 0 R /Last ${itemIds[itemIds.length - 1]} 0 R /Count ${outline.length} >>`);
    outline.forEach((entry, index) => {
      const previous = index === 0 ? '' : ` /Prev ${itemIds[index - 1]} 0 R`;
      const next = index === outline.length - 1 ? '' : ` /Next ${itemIds[index + 1]} 0 R`;
      const destination = `/Dest [${3 + entry.pageIndex * 2} 0 R /XYZ null null null]`;
      objects.push(`<< /Title (${entry.title}) /Parent ${outlineRootId} 0 R${previous}${next} ${destination} >>`);
    });
  }
  let body = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return { name, bytes: new TextEncoder().encode(body).buffer as ArrayBuffer };
};

describe('PdfParser', () => {
  const parser = new PdfParser(() => import('pdfjs-dist/legacy/build/pdf.mjs'), WORKER_URL);

  beforeAll(async () => {
    await import('pdfjs-dist/legacy/build/pdf.worker.mjs');
  });

  it('joins pages into one untitled section without an outline', async () => {
    const parsed = await parser.parse(pdfSource('scan.pdf', ['Page one text', 'Page two text']));
    expect(parsed.title).toBe('scan');
    expect(parsed.author).toBeNull();
    expect(parsed.sections.map(section => ({ title: section.title, text: squash(section.text) }))).toEqual([
      { title: null, text: 'Page one text Page two text' },
    ]);
  });

  it('splits pages into sections by the outline', async () => {
    const parsed = await parser.parse(pdfSource('book.pdf', ['Intro text', 'First chapter', 'More chapter'], [
      { title: 'Intro', pageIndex: 0 },
      { title: 'Chapter One', pageIndex: 1 },
    ]));
    expect(parsed.sections.map(section => ({ title: section.title, text: squash(section.text) }))).toEqual([
      { title: 'Intro', text: 'Intro text' },
      { title: 'Chapter One', text: 'First chapter More chapter' },
    ]);
  });

  it('rejects files that are not pdf', async () => {
    await expect(parser.parse(textSource('fake.pdf', 'not a pdf'))).rejects.toBeInstanceOf(CorruptDocumentError);
  });
});
