import { Book, characterKeystroke, ENTER_KEYSTROKE, ESCAPE_KEYSTROKE, Keystroke, NO_KEYSTROKES_YET, Progress, unreadProgress } from '../../domain';
import { FakeClock, InMemoryProgressRepository } from '../../../testing';
import { TypingSession } from './typing-session';

interface AutosaveCase {
  readonly id: string;
  readonly text: string;
  readonly keystrokes: readonly Keystroke[];
  readonly leaves: boolean;
  readonly expectedSaves: readonly number[];
}

const type = (characters: string): Keystroke[] => [...characters].map(characterKeystroke);

const CASES: readonly AutosaveCase[] = [
  { id: 'saves every ten accepted symbols and at completion', text: 'a'.repeat(25), keystrokes: [ENTER_KEYSTROKE, ...type('a'.repeat(25))], leaves: false, expectedSaves: [10, 20, 25] },
  { id: 'saves on pause', text: 'abc', keystrokes: [ENTER_KEYSTROKE, ...type('a'), ESCAPE_KEYSTROKE], leaves: false, expectedSaves: [1] },
  { id: 'does not save a pause without typing', text: 'abc', keystrokes: [ENTER_KEYSTROKE, ESCAPE_KEYSTROKE], leaves: false, expectedSaves: [] },
  { id: 'a session of only mistakes still saves them', text: 'abc', keystrokes: [ENTER_KEYSTROKE, ...type('xx')], leaves: true, expectedSaves: [0] },
  { id: 'leaving flushes unsaved symbols', text: 'abc', keystrokes: [ENTER_KEYSTROKE, ...type('ab')], leaves: true, expectedSaves: [2] },
  { id: 'leaving without unsaved symbols saves nothing', text: 'abc', keystrokes: [ENTER_KEYSTROKE], leaves: true, expectedSaves: [] },
  {
    id: 'counting restarts after a pause',
    text: 'a'.repeat(30),
    keystrokes: [ENTER_KEYSTROKE, ...type('a'.repeat(5)), ESCAPE_KEYSTROKE, ESCAPE_KEYSTROKE, ...type('a'.repeat(5))],
    leaves: true,
    expectedSaves: [5, 10],
  },
];

const book = (text: string): Book => ({ id: 'book-1', title: 'T', author: null, text, chapters: [], addedAt: 0 });

interface OpenSession {
  readonly session: TypingSession;
  readonly repository: InMemoryProgressRepository;
  readonly clock: FakeClock;
}

const openSession = (text: string, progress?: Progress): OpenSession => {
  const repository = new InMemoryProgressRepository();
  const clock = new FakeClock();
  return { session: new TypingSession(book(text), progress ?? unreadProgress('book-1'), clock, repository), repository, clock };
};

describe('TypingSession', () => {
  it('persists progress in every case', async () => {
    const mismatches = [];
    for (const { id, text, keystrokes, leaves, expectedSaves } of CASES) {
      const { session, repository } = openSession(text);
      for (const keystroke of keystrokes) await session.press(keystroke);
      if (leaves) await session.leave();
      if (JSON.stringify(repository.savedSymbolIndexes) !== JSON.stringify(expectedSaves)) {
        mismatches.push({ id, expectedSaves, actual: repository.savedSymbolIndexes });
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('saves progress under the book id', async () => {
    const { session, repository } = openSession('ab');
    await session.press(ENTER_KEYSTROKE);
    await session.press(characterKeystroke('a'));
    await session.leave();
    expect(await repository.findByBookId('book-1')).toMatchObject({ bookId: 'book-1', symbolIndex: 1 });
  });

  it('adds the session onto the stored lifetime instead of replacing it', async () => {
    const stored: Progress = {
      bookId: 'book-1',
      symbolIndex: 0,
      lifetime: { activeMilliseconds: 60_000, acceptedKeystrokes: 300, rejectedKeystrokes: 20 },
      bestWordsPerMinute: 55,
    };
    const { session, repository, clock } = openSession('a'.repeat(30), stored);
    await session.press(ENTER_KEYSTROKE);
    for (const keystroke of type('a'.repeat(10))) {
      await session.press(keystroke);
      clock.advance(100);
    }
    await session.leave();
    expect(await repository.findByBookId('book-1')).toMatchObject({
      lifetime: { activeMilliseconds: 60_900, acceptedKeystrokes: 310, rejectedKeystrokes: 20 },
    });
  });

  it('does not double-count the lifetime across repeated autosaves', async () => {
    const { session, repository } = openSession('a'.repeat(30));
    await session.press(ENTER_KEYSTROKE);
    for (const keystroke of type('a'.repeat(25))) await session.press(keystroke);
    await session.leave();
    const saved = await repository.findByBookId('book-1');
    expect(saved?.lifetime.acceptedKeystrokes).toBe(25);
  });

  it('keeps a record only once the session is long enough to be meaningful', async () => {
    const { session, repository, clock } = openSession('a'.repeat(99));
    await session.press(ENTER_KEYSTROKE);
    for (const keystroke of type('a'.repeat(99))) {
      await session.press(keystroke);
      clock.advance(10);
    }
    await session.leave();
    expect((await repository.findByBookId('book-1'))?.bestWordsPerMinute).toBe(0);
  });

  it('records a personal best once the session passes the threshold', async () => {
    const { session, repository, clock } = openSession('a'.repeat(300));
    await session.press(ENTER_KEYSTROKE);
    for (const keystroke of type('a'.repeat(300))) {
      await session.press(keystroke);
      clock.advance(200);
    }
    await session.leave();
    const best = (await repository.findByBookId('book-1'))?.bestWordsPerMinute ?? 0;
    expect(best).toBeGreaterThan(0);
  });

  it('never lowers an existing personal best', async () => {
    const stored: Progress = { bookId: 'book-1', symbolIndex: 0, lifetime: NO_KEYSTROKES_YET, bestWordsPerMinute: 999 };
    const { session, repository, clock } = openSession('a'.repeat(300), stored);
    await session.press(ENTER_KEYSTROKE);
    for (const keystroke of type('a'.repeat(300))) {
      await session.press(keystroke);
      clock.advance(1_000);
    }
    await session.leave();
    expect((await repository.findByBookId('book-1'))?.bestWordsPerMinute).toBe(999);
  });

  it('never loses a mistake made after the last save', async () => {
    const { session, repository } = openSession('a'.repeat(30));
    await session.press(ENTER_KEYSTROKE);
    for (const keystroke of type('a'.repeat(10))) await session.press(keystroke);
    await session.press(characterKeystroke('WRONG'));
    await session.leave();
    expect((await repository.findByBookId('book-1'))?.lifetime).toMatchObject({ acceptedKeystrokes: 10, rejectedKeystrokes: 1 });
  });

  it('saves a mistake made during a pause-free session that ends on the mistake', async () => {
    const { session, repository } = openSession('abc');
    await session.press(ENTER_KEYSTROKE);
    await session.press(characterKeystroke('a'));
    await session.press(characterKeystroke('WRONG'));
    await session.leave();
    expect((await repository.findByBookId('book-1'))?.lifetime).toMatchObject({ acceptedKeystrokes: 1, rejectedKeystrokes: 1 });
  });

  it('stops the clock when the reader leaves mid-word', async () => {
    const { session, repository, clock } = openSession('a'.repeat(30));
    await session.press(ENTER_KEYSTROKE);
    await session.press(characterKeystroke('a'));
    clock.advance(1_000);
    await session.leave();
    clock.advance(600_000);
    const before = (await repository.findByBookId('book-1'))?.lifetime.activeMilliseconds;
    await session.leave();
    expect((await repository.findByBookId('book-1'))?.lifetime.activeMilliseconds).toBe(before);
  });
});
