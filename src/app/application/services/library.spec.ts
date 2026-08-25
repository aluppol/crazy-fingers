import { Book, NO_KEYSTROKES_YET, Progress } from '../../domain';
import { FakeClock, InMemoryBookRepository, InMemoryProgressRepository } from '../../../testing';
import { BookNotFoundError } from '../errors';
import { Library } from './library';

const progressAt = (symbolIndex: number): Progress =>
  ({ bookId: 'book-1', symbolIndex, lifetime: NO_KEYSTROKES_YET, bestWordsPerMinute: 0 });

const BOOK: Book = {
  id: 'book-1',
  title: 'Story',
  author: null,
  text: 'Chapter 1\nfoo\nChapter 2\nbar',
  chapters: [{ title: 'Chapter 1', firstSymbolIndex: 0 }, { title: 'Chapter 2', firstSymbolIndex: 14 }],
  addedAt: 1,
};

const createLibrary = async (): Promise<{ library: Library; progress: InMemoryProgressRepository; books: InMemoryBookRepository }> => {
  const books = new InMemoryBookRepository();
  const progress = new InMemoryProgressRepository();
  await books.save(BOOK);
  return { library: new Library(books, progress, new FakeClock()), progress, books };
};

describe('Library', () => {
  it('lists books joined with their progress', async () => {
    const { library, progress } = await createLibrary();
    await progress.save(progressAt(7));
    expect(await library.listEntries()).toEqual([{
      book: { id: 'book-1', title: 'Story', author: null, chapters: BOOK.chapters, symbolCount: BOOK.text.length, addedAt: 1 },
      symbolIndex: 7,
      score: { wordsPerMinute: 0, accuracyPercent: 100, points: 0 },
      bestWordsPerMinute: 0,
    }]);
  });

  it('reports the stored lifetime score and personal best on the card', async () => {
    const { library, progress } = await createLibrary();
    await progress.save({
      bookId: 'book-1',
      symbolIndex: 7,
      lifetime: { activeMilliseconds: 60_000, acceptedKeystrokes: 300, rejectedKeystrokes: 100 },
      bestWordsPerMinute: 72,
    });
    const [entry] = await library.listEntries();
    expect(entry.score).toEqual({ wordsPerMinute: 60, accuracyPercent: 75, points: 45 });
    expect(entry.bestWordsPerMinute).toBe(72);
  });

  it('keeps the score when jumping to a chapter', async () => {
    const { library, progress } = await createLibrary();
    const scored = {
      bookId: 'book-1',
      symbolIndex: 3,
      lifetime: { activeMilliseconds: 60_000, acceptedKeystrokes: 300, rejectedKeystrokes: 0 },
      bestWordsPerMinute: 61,
    };
    await progress.save(scored);
    await library.moveCursorToChapter('book-1', 1);
    expect(await progress.findByBookId('book-1')).toEqual({ ...scored, symbolIndex: 14 });
  });

  it('lists unread books at symbol zero', async () => {
    const { library } = await createLibrary();
    expect((await library.listEntries()).map(entry => entry.symbolIndex)).toEqual([0]);
  });

  it('opens a book at the saved cursor', async () => {
    const { library, progress } = await createLibrary();
    await progress.save(progressAt(7));
    const session = await library.openBook('book-1');
    expect(session.view().symbolIndex).toBe(7);
    expect(session.book).toEqual(BOOK);
  });

  it('refuses to open an unknown book', async () => {
    const { library } = await createLibrary();
    await expect(library.openBook('missing')).rejects.toBeInstanceOf(BookNotFoundError);
  });

  it('moves the cursor to the start of a chapter', async () => {
    const { library, progress } = await createLibrary();
    await library.moveCursorToChapter('book-1', 1);
    expect(await progress.findByBookId('book-1')).toEqual(progressAt(14));
  });

  it('refuses a chapter outside the book', async () => {
    const { library } = await createLibrary();
    await expect(library.moveCursorToChapter('book-1', 2)).rejects.toBeInstanceOf(RangeError);
    await expect(library.moveCursorToChapter('book-1', -1)).rejects.toBeInstanceOf(RangeError);
  });

  it('deletes a book together with its progress', async () => {
    const { library, progress, books } = await createLibrary();
    await progress.save(progressAt(3));
    await library.deleteBook('book-1');
    expect(await books.listSummaries()).toEqual([]);
    expect(await progress.listAll()).toEqual([]);
  });
});
