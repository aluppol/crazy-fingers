import { squash, textSource } from '../../../testing';
import { HtmlParser } from './html-parser';

const HTML = `<!doctype html><html>
<head><title> Doc </title><meta name="author" content="Ann"><style>p{}</style></head>
<body><p>Intro para.</p><h1>One</h1><p>First<br>line.</p><div>Block</div>
<h2>Two</h2><p>Second.</p><script>var x = 1;</script></body></html>`;

describe('HtmlParser', () => {
  it('reads title, author and heading-delimited sections', async () => {
    const parsed = await new HtmlParser().parse(textSource('page.html', HTML));
    expect(parsed.title).toBe('Doc');
    expect(parsed.author).toBe('Ann');
    expect(parsed.sections.map(section => ({ title: section.title, text: squash(section.text) }))).toEqual([
      { title: null, text: 'Intro para.' },
      { title: 'One', text: 'One First line. Block' },
      { title: 'Two', text: 'Two Second.' },
    ]);
  });

  it('merges a heading pair that opens a section', async () => {
    const parsed = await new HtmlParser().parse(textSource('page.html', '<h1>Chapter One</h1><h2>The Boy</h2><p>text</p>'));
    expect(parsed.sections.map(section => ({ title: section.title, text: squash(section.text) }))).toEqual([
      { title: 'Chapter One — The Boy', text: 'Chapter One The Boy text' },
    ]);
  });

  it('falls back to the file name without a title element', async () => {
    const parsed = await new HtmlParser().parse(textSource('untitled_page.htm', '<p>x</p>'));
    expect(parsed.title).toBe('untitled page');
    expect(parsed.author).toBeNull();
  });
});
