import { Book, BookId, BookSummary } from '../../domain';

export interface IBookRepository {
  save(book: Book): Promise<void>;
  findById(bookId: BookId): Promise<Book | null>;
  listSummaries(): Promise<BookSummary[]>;
  delete(bookId: BookId): Promise<void>;
}
