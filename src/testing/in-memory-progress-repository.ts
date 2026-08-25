import { IProgressRepository } from '../app/application';
import { BookId, Progress } from '../app/domain';

export class InMemoryProgressRepository implements IProgressRepository {
  public readonly savedSymbolIndexes: number[] = [];
  private readonly _progressByBook = new Map<BookId, Progress>();

  public save(progress: Progress): Promise<void> {
    this._progressByBook.set(progress.bookId, progress);
    this.savedSymbolIndexes.push(progress.symbolIndex);
    return Promise.resolve();
  }

  public findByBookId(bookId: BookId): Promise<Progress | null> {
    return Promise.resolve(this._progressByBook.get(bookId) ?? null);
  }

  public listAll(): Promise<Progress[]> {
    return Promise.resolve([...this._progressByBook.values()]);
  }

  public delete(bookId: BookId): Promise<void> {
    this._progressByBook.delete(bookId);
    return Promise.resolve();
  }
}
