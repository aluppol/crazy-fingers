import { BookId, Progress } from '../../domain';

export interface IProgressRepository {
  save(progress: Progress): Promise<void>;
  findByBookId(bookId: BookId): Promise<Progress | null>;
  listAll(): Promise<Progress[]>;
  delete(bookId: BookId): Promise<void>;
}
