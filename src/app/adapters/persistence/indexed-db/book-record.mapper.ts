import { Book, BookSummary } from '../../../domain';
import { BookRecord, TextRecord } from './library-database';

export function toBookRecord(book: Book): BookRecord {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    chapters: [...book.chapters],
    symbolCount: book.text.length,
    addedAt: book.addedAt,
  };
}

export function toTextRecord(book: Book): TextRecord {
  return { bookId: book.id, text: book.text };
}

export function toBook(record: BookRecord, textRecord: TextRecord): Book {
  return {
    id: record.id,
    title: record.title,
    author: record.author,
    text: textRecord.text,
    chapters: record.chapters,
    addedAt: record.addedAt,
  };
}

export function toBookSummary(record: BookRecord): BookSummary {
  return {
    id: record.id,
    title: record.title,
    author: record.author,
    chapters: record.chapters,
    symbolCount: record.symbolCount,
    addedAt: record.addedAt,
  };
}
