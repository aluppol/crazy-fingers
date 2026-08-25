import { FakeClock } from '../../../testing';
import { KeystrokeVerdict, TypingPhase } from '../enums';
import { characterKeystroke, ENTER_KEYSTROKE, ESCAPE_KEYSTROKE, Keystroke } from './keystroke';
import { TypingMachine } from './typing-machine';
import { TypingView } from './typing-view';

interface MachineCase {
  readonly id: string;
  readonly text: string;
  readonly startIndex: number;
  readonly windowSize?: number;
  readonly keystrokes: readonly Keystroke[];
  readonly expected: Partial<TypingView>;
}

const type = (characters: string): Keystroke[] => [...characters].map(characterKeystroke);

const CASES: readonly MachineCase[] = [
  {
    id: 'starts ready and ignores characters',
    text: 'ab',
    startIndex: 0,
    keystrokes: type('a'),
    expected: { phase: TypingPhase.Ready, symbolIndex: 0, textChunkWritten: '', currentSymbol: 'a', textChunkToWrite: 'b', lastKeystroke: null },
  },
  { id: 'ignores escape while ready', text: 'ab', startIndex: 0, keystrokes: [ESCAPE_KEYSTROKE], expected: { phase: TypingPhase.Ready } },
  { id: 'enter starts progress', text: 'ab', startIndex: 0, keystrokes: [ENTER_KEYSTROKE], expected: { phase: TypingPhase.Progress, symbolIndex: 0 } },
  {
    id: 'accepts the matching symbol',
    text: 'ab',
    startIndex: 0,
    keystrokes: [ENTER_KEYSTROKE, ...type('a')],
    expected: { symbolIndex: 1, textChunkWritten: 'a', currentSymbol: 'b', textChunkToWrite: '', lastKeystroke: { verdict: KeystrokeVerdict.Accepted, sequence: 1 } },
  },
  {
    id: 'rejects a wrong symbol',
    text: 'ab',
    startIndex: 0,
    keystrokes: [ENTER_KEYSTROKE, ...type('x')],
    expected: { symbolIndex: 0, lastKeystroke: { verdict: KeystrokeVerdict.Rejected, sequence: 1 } },
  },
  {
    id: 'rejects enter while a letter is expected',
    text: 'ab',
    startIndex: 0,
    keystrokes: [ENTER_KEYSTROKE, ENTER_KEYSTROKE],
    expected: { symbolIndex: 0, lastKeystroke: { verdict: KeystrokeVerdict.Rejected, sequence: 1 } },
  },
  {
    id: 'enter matches a paragraph break',
    text: 'a\nb',
    startIndex: 0,
    keystrokes: [ENTER_KEYSTROKE, ...type('a'), ENTER_KEYSTROKE],
    expected: { symbolIndex: 2, currentSymbol: 'b' },
  },
  { id: 'space is a character', text: 'a b', startIndex: 0, keystrokes: [ENTER_KEYSTROKE, ...type('a ')], expected: { symbolIndex: 2 } },
  {
    id: 'escape pauses and ignores typing',
    text: 'abc',
    startIndex: 0,
    keystrokes: [ENTER_KEYSTROKE, ...type('a'), ESCAPE_KEYSTROKE, ...type('b')],
    expected: { phase: TypingPhase.Pause, symbolIndex: 1, lastKeystroke: { verdict: KeystrokeVerdict.Accepted, sequence: 1 } },
  },
  {
    id: 'escape resumes progress',
    text: 'abc',
    startIndex: 0,
    keystrokes: [ENTER_KEYSTROKE, ...type('a'), ESCAPE_KEYSTROKE, ESCAPE_KEYSTROKE, ...type('b')],
    expected: { phase: TypingPhase.Progress, symbolIndex: 2 },
  },
  {
    id: 'completes at the end of the text and ignores further keys',
    text: 'ab',
    startIndex: 0,
    keystrokes: [ENTER_KEYSTROKE, ...type('abx')],
    expected: { phase: TypingPhase.Complete, symbolIndex: 2, currentSymbol: '', textChunkToWrite: '', lastKeystroke: { verdict: KeystrokeVerdict.Accepted, sequence: 2 } },
  },
  { id: 'starts complete when the cursor is past the end', text: 'ab', startIndex: 5, keystrokes: [], expected: { phase: TypingPhase.Complete, symbolIndex: 2 } },
  { id: 'clamps a negative cursor', text: 'ab', startIndex: -3, keystrokes: [], expected: { phase: TypingPhase.Ready, symbolIndex: 0 } },
  {
    id: 'shows a sliding window around the cursor',
    text: 'abcdefghij',
    startIndex: 5,
    windowSize: 3,
    keystrokes: [],
    expected: { textChunkWritten: 'cde', currentSymbol: 'f', textChunkToWrite: 'ghi', symbolCount: 10 },
  },
  {
    id: 'numbers keystrokes across verdicts',
    text: 'ab',
    startIndex: 0,
    keystrokes: [ENTER_KEYSTROKE, ...type('xxa')],
    expected: { lastKeystroke: { verdict: KeystrokeVerdict.Accepted, sequence: 3 } },
  },
];

const pick = (view: TypingView, expected: Partial<TypingView>): Partial<TypingView> =>
  Object.fromEntries(Object.keys(expected).map(key => [key, view[key as keyof TypingView]]));

describe('TypingMachine score', () => {
  it('exposes the raw counters alongside the derived score', () => {
    const clock = new FakeClock();
    const machine = new TypingMachine('abc', 0, clock);
    machine.press(ENTER_KEYSTROKE);
    machine.press(characterKeystroke('a'));
    clock.advance(60_000);
    machine.press(characterKeystroke('x'));
    expect(machine.view().counters).toEqual({ activeMilliseconds: 5_000, acceptedKeystrokes: 1, rejectedKeystrokes: 1 });
    expect(machine.view().score.accuracyPercent).toBe(50);
  });

  it('stops the clock when leaving progress, so a pause costs no speed', () => {
    const clock = new FakeClock();
    const machine = new TypingMachine('abcd', 0, clock);
    machine.press(ENTER_KEYSTROKE);
    machine.press(characterKeystroke('a'));
    clock.advance(1_000);
    machine.press(ESCAPE_KEYSTROKE);
    clock.advance(600_000);
    expect(machine.view().counters.activeMilliseconds).toBe(1_000);
  });
});

describe('TypingMachine', () => {
  it('handles every keystroke case', () => {
    const mismatches = CASES
      .map(({ id, text, startIndex, windowSize, keystrokes, expected }) => {
        const machine = new TypingMachine(text, startIndex, new FakeClock(), windowSize);
        keystrokes.forEach(keystroke => machine.press(keystroke));
        return { id, expected, actual: pick(machine.view(), expected) };
      })
      .filter(({ expected, actual }) => JSON.stringify(actual) !== JSON.stringify(expected));
    expect(mismatches).toEqual([]);
  });
});
