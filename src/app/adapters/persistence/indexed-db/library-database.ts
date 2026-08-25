import { DBSchema, IDBPDatabase, IDBPTransaction, openDB } from 'idb';
import { Chapter } from '../../../domain';

export enum LibraryStore {
  Books = 'books',
  Texts = 'texts',
  Progress = 'progress',
}

export enum TransactionMode {
  ReadOnly = 'readonly',
  ReadWrite = 'readwrite',
}

export interface BookRecord {
  id: string;
  title: string;
  author: string | null;
  chapters: Chapter[];
  symbolCount: number;
  addedAt: number;
}

export interface TextRecord {
  bookId: string;
  text: string;
}

export interface ProgressRecord {
  bookId: string;
  symbolIndex: number;
  activeMilliseconds: number;
  acceptedKeystrokes: number;
  rejectedKeystrokes: number;
  bestWordsPerMinute: number;
}

interface LibrarySchema extends DBSchema {
  [LibraryStore.Books]: { key: string; value: BookRecord };
  [LibraryStore.Texts]: { key: string; value: TextRecord };
  [LibraryStore.Progress]: { key: string; value: ProgressRecord };
}

export type LibraryDatabase = IDBPDatabase<LibrarySchema>;

type UpgradeTransaction = IDBPTransaction<LibrarySchema, LibraryStore[], 'versionchange'>;

const SCHEMA_VERSION = 2;
const BOOK_KEY_PATH = 'id';
const PROGRESS_KEY_PATH = 'bookId';

const UNSCORED: Omit<ProgressRecord, 'bookId' | 'symbolIndex'> = {
  activeMilliseconds: 0,
  acceptedKeystrokes: 0,
  rejectedKeystrokes: 0,
  bestWordsPerMinute: 0,
};

export function openLibraryDatabase(databaseName: string): Promise<LibraryDatabase> {
  return openDB<LibrarySchema>(databaseName, SCHEMA_VERSION, {
    async upgrade(database, versionBeforeUpgrade, upgradedVersion, transaction) {
      if (versionBeforeUpgrade < 1) createStores(database);
      if (versionBeforeUpgrade === 1) await addScoreCountersToExistingProgress(transaction);
    },
  });
}

function createStores(database: LibraryDatabase): void {
  database.createObjectStore(LibraryStore.Books, { keyPath: BOOK_KEY_PATH });
  database.createObjectStore(LibraryStore.Texts, { keyPath: PROGRESS_KEY_PATH });
  database.createObjectStore(LibraryStore.Progress, { keyPath: PROGRESS_KEY_PATH });
}

async function addScoreCountersToExistingProgress(transaction: UpgradeTransaction): Promise<void> {
  const store = transaction.objectStore(LibraryStore.Progress);
  const records = await store.getAll();
  await Promise.all(records.map(record => store.put({ ...UNSCORED, ...record })));
}
