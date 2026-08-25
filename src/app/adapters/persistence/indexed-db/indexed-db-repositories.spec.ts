import 'fake-indexeddb/auto';
import { Book, NO_KEYSTROKES_YET, Progress } from '../../../domain';
import { IndexedDbBookRepository } from './indexed-db-book-repository';
import { IndexedDbProgressRepository } from './indexed-db-progress-repository';
import { openLibraryDatabase } from './library-database';

const BOOK: Book = {
  id: 'book-1',
  title: 'Story',
  author: 'Ann',
  text: 'Chapter 1\nfoo',
  chapters: [{ title: 'Chapter 1', firstSymbolIndex: 0 }],
  addedAt: 2,
};

let databaseCounter = 0;

const openFreshDatabase = (): ReturnType<typeof openLibraryDatabase> => openLibraryDatabase(`test-library-${databaseCounter++}`);

describe('IndexedDbBookRepository', () => {
  it('round-trips a book through the books and texts stores', async () => {
    const repository = new IndexedDbBookRepository(openFreshDatabase());
    await repository.save(BOOK);
    expect(await repository.findById('book-1')).toEqual(BOOK);
  });

  it('returns null for unknown books', async () => {
    const repository = new IndexedDbBookRepository(openFreshDatabase());
    expect(await repository.findById('missing')).toBeNull();
  });

  it('lists summaries without text, ordered by addedAt', async () => {
    const repository = new IndexedDbBookRepository(openFreshDatabase());
    await repository.save({ ...BOOK, id: 'later', addedAt: 5 });
    await repository.save(BOOK);
    expect(await repository.listSummaries()).toEqual([
      { id: 'book-1', title: 'Story', author: 'Ann', chapters: BOOK.chapters, symbolCount: 13, addedAt: 2 },
      { id: 'later', title: 'Story', author: 'Ann', chapters: BOOK.chapters, symbolCount: 13, addedAt: 5 },
    ]);
  });

  it('deletes a book together with its text', async () => {
    const repository = new IndexedDbBookRepository(openFreshDatabase());
    await repository.save(BOOK);
    await repository.delete('book-1');
    expect(await repository.findById('book-1')).toBeNull();
    expect(await repository.listSummaries()).toEqual([]);
  });
});

describe('IndexedDbProgressRepository', () => {
  const progressFor = (bookId: string, symbolIndex: number): Progress =>
    ({ bookId, symbolIndex, lifetime: NO_KEYSTROKES_YET, bestWordsPerMinute: 0 });

  it('saves, overwrites, lists and deletes progress by book', async () => {
    const repository = new IndexedDbProgressRepository(openFreshDatabase());
    await repository.save(progressFor('book-1', 3));
    await repository.save(progressFor('book-1', 9));
    await repository.save(progressFor('book-2', 1));
    expect(await repository.findByBookId('book-1')).toEqual(progressFor('book-1', 9));
    expect(await repository.listAll()).toEqual([progressFor('book-1', 9), progressFor('book-2', 1)]);
    await repository.delete('book-1');
    expect(await repository.findByBookId('book-1')).toBeNull();
  });

  it('round-trips score counters and the personal best', async () => {
    const repository = new IndexedDbProgressRepository(openFreshDatabase());
    const scored: Progress = {
      bookId: 'book-1',
      symbolIndex: 12,
      lifetime: { activeMilliseconds: 61_000, acceptedKeystrokes: 305, rejectedKeystrokes: 7 },
      bestWordsPerMinute: 61,
    };
    await repository.save(scored);
    expect(await repository.findByBookId('book-1')).toEqual(scored);
  });
});
