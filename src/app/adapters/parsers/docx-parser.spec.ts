import { squash, zipSource } from '../../../testing';
import { DocxParser } from './docx-parser';

const WORD_NAMESPACE = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

const DOCUMENT = `<?xml version="1.0"?>
<w:document xmlns:w="${WORD_NAMESPACE}"><w:body>
  <w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Intro</w:t></w:r></w:p>
  <w:p><w:r><w:t xml:space="preserve">Hello </w:t></w:r><w:r><w:t>world</w:t><w:tab/><w:t>tabbed</w:t></w:r></w:p>
  <w:p><w:pPr><w:pStyle w:val="1"/></w:pPr><w:r><w:t>Глава</w:t></w:r></w:p>
  <w:p><w:r><w:t>Текст</w:t><w:br/><w:t>дальше</w:t></w:r></w:p>
</w:body></w:document>`;

const STYLES = `<?xml version="1.0"?>
<w:styles xmlns:w="${WORD_NAMESPACE}">
  <w:style w:styleId="1"><w:name w:val="heading 2"/></w:style>
  <w:style w:styleId="Normal"><w:name w:val="Normal"/></w:style>
</w:styles>`;

const CORE = `<?xml version="1.0"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:title>Doc Title</dc:title><dc:creator>Ann</dc:creator>
</cp:coreProperties>`;

describe('DocxParser', () => {
  it('reads core properties and splits by heading styles resolved through styles.xml', async () => {
    const parsed = await new DocxParser().parse(zipSource('doc.docx', {
      'word/document.xml': DOCUMENT,
      'word/styles.xml': STYLES,
      'docProps/core.xml': CORE,
    }));
    expect(parsed.title).toBe('Doc Title');
    expect(parsed.author).toBe('Ann');
    expect(parsed.sections.map(section => ({ title: section.title, text: squash(section.text) }))).toEqual([
      { title: 'Intro', text: 'Intro Hello world tabbed' },
      { title: 'Глава', text: 'Глава Текст дальше' },
    ]);
  });

  it('falls back to the file name without core properties', async () => {
    const parsed = await new DocxParser().parse(zipSource('plain_doc.docx', { 'word/document.xml': DOCUMENT }));
    expect(parsed.title).toBe('plain doc');
    expect(parsed.author).toBeNull();
  });
});
