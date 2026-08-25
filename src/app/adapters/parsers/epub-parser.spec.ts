import { CorruptDocumentError } from '../../application';
import { squash, textSource, zipSource } from '../../../testing';
import { EpubParser } from './epub-parser';

const CONTAINER = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`;

const OPF_EPUB3 = `<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>My Epub</dc:title><dc:creator>Ann Author</dc:creator></metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch1" href="text/ch1.xhtml" media-type="application/xhtml+xml"/>
    <item id="ch2" href="text/ch2.xhtml" media-type="application/xhtml+xml"/>
    <item id="css" href="style.css" media-type="text/css"/>
  </manifest>
  <spine><itemref idref="cover" linear="no"/><itemref idref="ch1"/><itemref idref="ch2"/><itemref idref="css"/></spine>
</package>`;

const NAV = `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><body>
<nav epub:type="toc"><ol>
  <li><a href="text/ch1.xhtml">Chapter One</a></li>
  <li><a href="text/ch2.xhtml#start">Ignored label</a></li>
</ol></nav>
</body></html>`;

const EPUB3_FILES = {
  'META-INF/container.xml': CONTAINER,
  'OEBPS/content.opf': OPF_EPUB3,
  'OEBPS/nav.xhtml': NAV,
  'OEBPS/cover.xhtml': '<html><body><p>Cover</p></body></html>',
  'OEBPS/text/ch1.xhtml': '<?xml version="1.0"?><html><body><p>Para one.</p></body></html>',
  'OEBPS/text/ch2.xhtml': '<html><body><h1>Chapter Two</h1><p>Para two.</p></body></html>',
  'OEBPS/style.css': 'p {}',
};

const OPF_EPUB2 = `<?xml version="1.0"?>
<package xmlns="http://www.idpf.org/2007/opf" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Old Epub</dc:title></metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="ch1" href="ch1.html" media-type="text/html"/>
  </manifest>
  <spine toc="ncx"><itemref idref="ch1"/></spine>
</package>`;

const NCX = `<?xml version="1.0"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/"><navMap>
  <navPoint id="n1"><navLabel><text>First Chapter</text></navLabel><content src="ch1.html"/></navPoint>
</navMap></ncx>`;

const sectionsOf = async (files: Readonly<Record<string, string>>): Promise<Array<{ title: string | null; text: string }>> => {
  const parsed = await new EpubParser().parse(zipSource('book.epub', files));
  return parsed.sections.map(section => ({ title: section.title, text: squash(section.text) }));
};

describe('EpubParser', () => {
  it('reads metadata, follows the spine and labels sections from the epub3 navigation', async () => {
    const parsed = await new EpubParser().parse(zipSource('book.epub', EPUB3_FILES));
    expect(parsed.title).toBe('My Epub');
    expect(parsed.author).toBe('Ann Author');
    expect(await sectionsOf(EPUB3_FILES)).toEqual([
      { title: 'Chapter One', text: 'Para one.' },
      { title: 'Chapter Two', text: 'Chapter Two Para two.' },
    ]);
  });

  it('labels sections from the epub2 ncx table of contents', async () => {
    const files = {
      'META-INF/container.xml': CONTAINER,
      'OEBPS/content.opf': OPF_EPUB2,
      'OEBPS/toc.ncx': NCX,
      'OEBPS/ch1.html': '<html><body><p>Old text.</p></body></html>',
    };
    const parsed = await new EpubParser().parse(zipSource('old.epub', files));
    expect(parsed.title).toBe('Old Epub');
    expect(parsed.author).toBeNull();
    expect(await sectionsOf(files)).toEqual([{ title: 'First Chapter', text: 'Old text.' }]);
  });

  it('rejects files that are not zip archives', async () => {
    await expect(new EpubParser().parse(textSource('fake.epub', 'not a zip'))).rejects.toBeInstanceOf(CorruptDocumentError);
  });

  it('rejects archives without a container', async () => {
    await expect(new EpubParser().parse(zipSource('empty.epub', { 'mimetype': 'application/epub+zip' }))).rejects.toBeInstanceOf(CorruptDocumentError);
  });
});
