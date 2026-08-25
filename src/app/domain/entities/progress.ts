import { BookId } from './book';
import { NO_KEYSTROKES_YET, ScoreCounters } from './score';

export interface Progress {
  readonly bookId: BookId;
  readonly symbolIndex: number;
  readonly lifetime: ScoreCounters;
  readonly bestWordsPerMinute: number;
}

export function unreadProgress(bookId: BookId): Progress {
  return { bookId, symbolIndex: 0, lifetime: NO_KEYSTROKES_YET, bestWordsPerMinute: 0 };
}
