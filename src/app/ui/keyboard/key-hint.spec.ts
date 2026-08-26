import { Finger, KeyboardLayout, KeyCode } from '../enums';
import { hintFor, KeyHint, needsSystemLayoutSwitch, ShiftHint } from './key-hint';

interface HintCase {
  readonly id: string;
  readonly symbol: string;
  readonly layout: KeyboardLayout;
  readonly expected: KeyHint | null;
}

interface SwitchCase {
  readonly id: string;
  readonly expectedSymbol: string;
  readonly typedCharacter: string;
  readonly expected: boolean;
}

const LEFT_SHIFT: ShiftHint = { keyCode: KeyCode.ShiftLeft, finger: Finger.LeftPinky };
const RIGHT_SHIFT: ShiftHint = { keyCode: KeyCode.ShiftRight, finger: Finger.RightPinky };
const LATIN = KeyboardLayout.Latin;
const CYRILLIC = KeyboardLayout.Cyrillic;

const CASES: readonly HintCase[] = [
  { id: 'lowercase letter', symbol: 'a', layout: LATIN, expected: { layout: LATIN, keyCode: KeyCode.KeyA, finger: Finger.LeftPinky, shift: null } },
  {
    id: 'capital letter holds shift with the other hand',
    symbol: 'A',
    layout: LATIN,
    expected: { layout: LATIN, keyCode: KeyCode.KeyA, finger: Finger.LeftPinky, shift: RIGHT_SHIFT },
  },
  { id: 'semicolon', symbol: ';', layout: LATIN, expected: { layout: LATIN, keyCode: KeyCode.Semicolon, finger: Finger.RightPinky, shift: null } },
  {
    id: 'colon is a right pinky key with the left shift',
    symbol: ':',
    layout: LATIN,
    expected: { layout: LATIN, keyCode: KeyCode.Semicolon, finger: Finger.RightPinky, shift: LEFT_SHIFT },
  },
  {
    id: 'cyrillic letter switches to the cyrillic layout',
    symbol: 'ф',
    layout: LATIN,
    expected: { layout: CYRILLIC, keyCode: KeyCode.KeyA, finger: Finger.LeftPinky, shift: null },
  },
  {
    id: 'cyrillic capital holds the right shift',
    symbol: 'Ф',
    layout: CYRILLIC,
    expected: { layout: CYRILLIC, keyCode: KeyCode.KeyA, finger: Finger.LeftPinky, shift: RIGHT_SHIFT },
  },
  { id: 'space is a thumb key', symbol: ' ', layout: LATIN, expected: { layout: LATIN, keyCode: KeyCode.Space, finger: Finger.Thumb, shift: null } },
  {
    id: 'paragraph break is enter with the right pinky',
    symbol: '\n',
    layout: CYRILLIC,
    expected: { layout: CYRILLIC, keyCode: KeyCode.Enter, finger: Finger.RightPinky, shift: null },
  },
  { id: 'comma in latin', symbol: ',', layout: LATIN, expected: { layout: LATIN, keyCode: KeyCode.Comma, finger: Finger.RightMiddle, shift: null } },
  {
    id: 'comma in cyrillic is the shifted period key',
    symbol: ',',
    layout: CYRILLIC,
    expected: { layout: CYRILLIC, keyCode: KeyCode.Slash, finger: Finger.RightPinky, shift: LEFT_SHIFT },
  },
  {
    id: 'latin letter switches back to the latin layout',
    symbol: 'a',
    layout: CYRILLIC,
    expected: { layout: LATIN, keyCode: KeyCode.KeyA, finger: Finger.LeftPinky, shift: null },
  },
  {
    id: 'shared digit keeps the preferred layout',
    symbol: '1',
    layout: CYRILLIC,
    expected: { layout: CYRILLIC, keyCode: KeyCode.Digit1, finger: Finger.LeftPinky, shift: null },
  },
  {
    id: 'yo sits on the backquote key',
    symbol: 'ё',
    layout: LATIN,
    expected: { layout: CYRILLIC, keyCode: KeyCode.Backquote, finger: Finger.LeftPinky, shift: null },
  },
  {
    id: 'cyrillic double quote is shift plus two',
    symbol: '"',
    layout: CYRILLIC,
    expected: { layout: CYRILLIC, keyCode: KeyCode.Digit2, finger: Finger.LeftRing, shift: RIGHT_SHIFT },
  },
  { id: 'em dash is not on either layout', symbol: '—', layout: LATIN, expected: null },
  { id: 'empty symbol', symbol: '', layout: LATIN, expected: null },
];

const SWITCH_CASES: readonly SwitchCase[] = [
  { id: 'latin typed for a cyrillic symbol', expectedSymbol: 'ф', typedCharacter: 'a', expected: true },
  { id: 'cyrillic typed for a latin symbol', expectedSymbol: 'a', typedCharacter: 'ф', expected: true },
  { id: 'wrong letter on the same layout', expectedSymbol: 'a', typedCharacter: 'b', expected: false },
  { id: 'space exists on both layouts', expectedSymbol: 'ф', typedCharacter: ' ', expected: false },
  { id: 'digit exists on both layouts', expectedSymbol: 'ф', typedCharacter: '1', expected: false },
  { id: 'unmapped expected symbol', expectedSymbol: '—', typedCharacter: 'a', expected: false },
  { id: 'unmapped typed character', expectedSymbol: 'a', typedCharacter: '—', expected: false },
];

describe('hintFor', () => {
  it('maps every symbol case to a key, a finger and a shift', () => {
    const mismatches = CASES
      .map(({ id, symbol, layout, expected }) => ({ id, expected, actual: hintFor(symbol, layout) }))
      .filter(({ expected, actual }) => JSON.stringify(actual) !== JSON.stringify(expected));
    expect(mismatches).toEqual([]);
  });
});

describe('needsSystemLayoutSwitch', () => {
  it('flags only keystrokes that no layout of the expected symbol can produce', () => {
    const mismatches = SWITCH_CASES
      .map(({ id, expectedSymbol, typedCharacter, expected }) => ({
        id,
        expected,
        actual: needsSystemLayoutSwitch(expectedSymbol, typedCharacter),
      }))
      .filter(({ expected, actual }) => actual !== expected);
    expect(mismatches).toEqual([]);
  });
});
