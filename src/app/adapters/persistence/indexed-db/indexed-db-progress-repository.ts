import { IProgressRepository } from '../../../application';
import { BookId, Progress } from '../../../domain';
import { LibraryDatabase, LibraryStore } from './library-database';
import { toProgress, toProgressRecord } from './progress-record.mapper';

export class IndexedDbProgressRepository implements IProgressRepository {
  constructor(private readonly _database: Promise<LibraryDatabase>) {}

  public async save(progress: Progress): Promise<void> {
    await (await this._database).put(LibraryStore.Progress, toProgressRecord(progress));
  }

  public async findByBookId(bookId: BookId): Promise<Progress | null> {
    const record = await (await this._database).get(LibraryStore.Progress, bookId);
    return record === undefined ? null : toProgress(record);
  }

  public async listAll(): Promise<Progress[]> {
    const records = await (await this._database).getAll(LibraryStore.Progress);
    return records.map(toProgress);
  }

  public async delete(bookId: BookId): Promise<void> {
    await (await this._database).delete(LibraryStore.Progress, bookId);
  }
}
