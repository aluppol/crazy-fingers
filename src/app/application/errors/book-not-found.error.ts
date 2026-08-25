import { BookId } from '../../domain';
import { ErrorName } from '../enums';

export class BookNotFoundError extends Error {
  constructor(bookId: BookId) {
    super(`Book "${bookId}" is not in the library`);
    this.name = ErrorName.BookNotFound;
  }
}
