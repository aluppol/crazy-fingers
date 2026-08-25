import { Progress } from '../../../domain';
import { ProgressRecord } from './library-database';

export function toProgressRecord(progress: Progress): ProgressRecord {
  return {
    bookId: progress.bookId,
    symbolIndex: progress.symbolIndex,
    activeMilliseconds: progress.lifetime.activeMilliseconds,
    acceptedKeystrokes: progress.lifetime.acceptedKeystrokes,
    rejectedKeystrokes: progress.lifetime.rejectedKeystrokes,
    bestWordsPerMinute: progress.bestWordsPerMinute,
  };
}

export function toProgress(record: ProgressRecord): Progress {
  return {
    bookId: record.bookId,
    symbolIndex: record.symbolIndex,
    lifetime: {
      activeMilliseconds: record.activeMilliseconds,
      acceptedKeystrokes: record.acceptedKeystrokes,
      rejectedKeystrokes: record.rejectedKeystrokes,
    },
    bestWordsPerMinute: record.bestWordsPerMinute,
  };
}
