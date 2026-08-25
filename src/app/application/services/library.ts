import { Book, BookId, BookSummary, IClock, Progress, Score, scoreFrom, unreadProgress } from '../../domain';
import { BookNotFoundError } from '../errors';
import { IBookRepository, IProgressRepository } from '../ports';
import { TypingSession } from './typing-session';

export interface LibraryEntry {
  readonly book: BookSummary;
  readonly symbolIndex: number;
  readonly score: Score;
  readonly bestWordsPerMinute: number;
}

export class Library {
  constructor(
    private readonly _books: IBookRepository,
    private readonly _progress: IProgressRepository,
    private readonly _clock: IClock,
  ) {}

  public async listEntries(): Promise<LibraryEntry[]> {
    const [summaries, progressRecords] = await Promise.all([this._books.listSummaries(), this._progress.listAll()]);
    const progressByBook = new Map(progressRecords.map(progress => [progress.bookId, progress]));
    return summaries.map(book => this._toEntry(book, progressByBook.get(book.id) ?? unreadProgress(book.id)));
  }

  public async openBook(bookId: BookId): Promise<TypingSession> {
    const book = await this._requireBook(bookId);
    return new TypingSession(book, await this._progressFor(bookId), this._clock, this._progress);
  }

  public async moveCursorToChapter(bookId: BookId, chapterIndex: number): Promise<void> {
    const book = await this._requireBook(bookId);
    const chapter = chapterIndex < 0 ? undefined : book.chapters.at(chapterIndex);
    if (chapter === undefined) throw new RangeError(`Chapter ${chapterIndex} is not in "${book.title}"`);
    const progress = await this._progressFor(bookId);
    await this._progress.save({ ...progress, symbolIndex: chapter.firstSymbolIndex });
  }

  public async deleteBook(bookId: BookId): Promise<void> {
    await this._books.delete(bookId);
    await this._progress.delete(bookId);
  }

  private _toEntry(book: BookSummary, progress: Progress): LibraryEntry {
    return {
      book,
      symbolIndex: progress.symbolIndex,
      score: scoreFrom(progress.lifetime),
      bestWordsPerMinute: progress.bestWordsPerMinute,
    };
  }

  private async _progressFor(bookId: BookId): Promise<Progress> {
    return await this._progress.findByBookId(bookId) ?? unreadProgress(bookId);
  }

  private async _requireBook(bookId: BookId): Promise<Book> {
    const book = await this._books.findById(bookId);
    if (book === null) throw new BookNotFoundError(bookId);
    return book;
  }
}
