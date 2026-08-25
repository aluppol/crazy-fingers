import { IBookRepository } from '../../../application';
import { Book, BookId, BookSummary } from '../../../domain';
import { toBook, toBookRecord, toBookSummary, toTextRecord } from './book-record.mapper';
import { LibraryDatabase, LibraryStore, TransactionMode } from './library-database';

const BOOK_STORES = [LibraryStore.Books, LibraryStore.Texts];

export class IndexedDbBookRepository implements IBookRepository {
  constructor(private readonly _database: Promise<LibraryDatabase>) {}

  public async save(book: Book): Promise<void> {
    const transaction = (await this._database).transaction(BOOK_STORES, TransactionMode.ReadWrite);
    await Promise.all([
      transaction.objectStore(LibraryStore.Books).put(toBookRecord(book)),
      transaction.objectStore(LibraryStore.Texts).put(toTextRecord(book)),
      transaction.done,
    ]);
  }

  public async findById(bookId: BookId): Promise<Book | null> {
    const transaction = (await this._database).transaction(BOOK_STORES, TransactionMode.ReadOnly);
    const [record, textRecord] = await Promise.all([
      transaction.objectStore(LibraryStore.Books).get(bookId),
      transaction.objectStore(LibraryStore.Texts).get(bookId),
    ]);
    if (record === undefined || textRecord === undefined) return null;
    return toBook(record, textRecord);
  }

  public async listSummaries(): Promise<BookSummary[]> {
    const records = await (await this._database).getAll(LibraryStore.Books);
    return records.map(toBookSummary).sort((earlier, later) => earlier.addedAt - later.addedAt);
  }

  public async delete(bookId: BookId): Promise<void> {
    const transaction = (await this._database).transaction(BOOK_STORES, TransactionMode.ReadWrite);
    await Promise.all([
      transaction.objectStore(LibraryStore.Books).delete(bookId),
      transaction.objectStore(LibraryStore.Texts).delete(bookId),
      transaction.done,
    ]);
  }
}
