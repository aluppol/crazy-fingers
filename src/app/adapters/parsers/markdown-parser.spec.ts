import { squash, textSource } from '../../../testing';
import { MarkdownParser } from './markdown-parser';

const MARKDOWN = [
  '# Title',
  '',
  'Some **bold** and *it* and `code` and [link](http://x) and ![img](a.png).',
  '',
  '## Second ##',
  '',
  '- item one',
  '- item two',
  '',
  '> quote',
  '',
  '```',
  'code block',
  '```',
  '',
  '---',
].join('\n');

describe('MarkdownParser', () => {
  it('splits by headings and strips inline markup', async () => {
    const parsed = await new MarkdownParser().parse(textSource('notes.md', MARKDOWN));
    expect(parsed.title).toBe('notes');
    expect(parsed.author).toBeNull();
    expect(parsed.sections.map(section => ({ title: section.title, text: squash(section.text) }))).toEqual([
      { title: 'Title', text: 'Title Some bold and it and code and link and .' },
      { title: 'Second', text: 'Second item one item two quote code block' },
    ]);
  });

  it('keeps text before the first heading untitled', async () => {
    const parsed = await new MarkdownParser().parse(textSource('notes.md', 'intro\n\n# One\n\nbody'));
    expect(parsed.sections.map(section => ({ title: section.title, text: squash(section.text) }))).toEqual([
      { title: null, text: 'intro' },
      { title: 'One', text: 'One body' },
    ]);
  });
});
