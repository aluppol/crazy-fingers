import { IBookRepository } from '../app/application';
import { Book, BookId, BookSummary } from '../app/domain';

export class InMemoryBookRepository implements IBookRepository {
  private readonly _books = new Map<BookId, Book>();

  public get savedBooks(): Book[] {
    return [...this._books.values()];
  }

  public save(book: Book): Promise<void> {
    this._books.set(book.id, book);
    return Promise.resolve();
  }

  public findById(bookId: BookId): Promise<Book | null> {
    return Promise.resolve(this._books.get(bookId) ?? null);
  }

  public listSummaries(): Promise<BookSummary[]> {
    return Promise.resolve(this.savedBooks.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      chapters: book.chapters,
      symbolCount: book.text.length,
      addedAt: book.addedAt,
    })));
  }

  public delete(bookId: BookId): Promise<void> {
    this._books.delete(bookId);
    return Promise.resolve();
  }
}
