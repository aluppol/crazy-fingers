import { Keystroke, KeystrokeKind } from '../../domain';
import { keystrokeFrom } from './keystroke-mapper';

interface MappingCase {
  readonly id: string;
  readonly event: KeyboardEventInit;
  readonly expected: Keystroke | null;
}

const CASES: readonly MappingCase[] = [
  { id: 'letter', event: { key: 'a' }, expected: { kind: KeystrokeKind.Character, character: 'a' } },
  { id: 'shifted letter', event: { key: 'A', shiftKey: true }, expected: { kind: KeystrokeKind.Character, character: 'A' } },
  { id: 'space', event: { key: ' ' }, expected: { kind: KeystrokeKind.Character, character: ' ' } },
  { id: 'cyrillic letter', event: { key: 'ж' }, expected: { kind: KeystrokeKind.Character, character: 'ж' } },
  { id: 'enter', event: { key: 'Enter' }, expected: { kind: KeystrokeKind.Enter } },
  { id: 'escape', event: { key: 'Escape' }, expected: { kind: KeystrokeKind.Escape } },
  { id: 'browser shortcut with meta', event: { key: 'r', metaKey: true }, expected: null },
  { id: 'browser shortcut with control', event: { key: 'r', ctrlKey: true }, expected: null },
  { id: 'alt combination', event: { key: 'a', altKey: true }, expected: null },
  { id: 'modifier alone', event: { key: 'Shift' }, expected: null },
  { id: 'tab', event: { key: 'Tab' }, expected: null },
  { id: 'backspace', event: { key: 'Backspace' }, expected: null },
  { id: 'dead key', event: { key: 'Dead' }, expected: null },
  { id: 'composing input', event: { key: 'a', isComposing: true }, expected: null },
];

describe('keystrokeFrom', () => {
  it('maps every keyboard event case', () => {
    const mismatches = CASES
      .map(({ id, event, expected }) => ({ id, expected, actual: keystrokeFrom(new KeyboardEvent('keydown', event)) }))
      .filter(({ expected, actual }) => JSON.stringify(actual) !== JSON.stringify(expected));
    expect(mismatches).toEqual([]);
  });
});
