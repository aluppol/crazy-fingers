import { Finger, KeyboardLayout, KeyCode, KeyRole } from '../enums';

export interface KeyCap {
  readonly code: KeyCode;
  readonly role: KeyRole;
  readonly finger: Finger;
  readonly width: number;
  readonly label: string;
  readonly shiftedLabel: string | null;
  readonly base: string | null;
  readonly shifted: string | null;
}

export type KeyboardRows = ReadonlyArray<readonly KeyCap[]>;

export const KEY_UNITS_PER_ROW = 15;
const PARAGRAPH_BREAK = '\n';
const SPACE = ' ';

const FINGER_OF: Readonly<Record<KeyCode, Finger>> = {
  [KeyCode.Backquote]: Finger.LeftPinky,
  [KeyCode.Digit1]: Finger.LeftPinky,
  [KeyCode.KeyQ]: Finger.LeftPinky,
  [KeyCode.KeyA]: Finger.LeftPinky,
  [KeyCode.KeyZ]: Finger.LeftPinky,
  [KeyCode.Tab]: Finger.LeftPinky,
  [KeyCode.CapsLock]: Finger.LeftPinky,
  [KeyCode.ShiftLeft]: Finger.LeftPinky,
  [KeyCode.Digit2]: Finger.LeftRing,
  [KeyCode.KeyW]: Finger.LeftRing,
  [KeyCode.KeyS]: Finger.LeftRing,
  [KeyCode.KeyX]: Finger.LeftRing,
  [KeyCode.Digit3]: Finger.LeftMiddle,
  [KeyCode.KeyE]: Finger.LeftMiddle,
  [KeyCode.KeyD]: Finger.LeftMiddle,
  [KeyCode.KeyC]: Finger.LeftMiddle,
  [KeyCode.Digit4]: Finger.LeftIndex,
  [KeyCode.Digit5]: Finger.LeftIndex,
  [KeyCode.KeyR]: Finger.LeftIndex,
  [KeyCode.KeyT]: Finger.LeftIndex,
  [KeyCode.KeyF]: Finger.LeftIndex,
  [KeyCode.KeyG]: Finger.LeftIndex,
  [KeyCode.KeyV]: Finger.LeftIndex,
  [KeyCode.KeyB]: Finger.LeftIndex,
  [KeyCode.Space]: Finger.Thumb,
  [KeyCode.Digit6]: Finger.RightIndex,
  [KeyCode.Digit7]: Finger.RightIndex,
  [KeyCode.KeyY]: Finger.RightIndex,
  [KeyCode.KeyU]: Finger.RightIndex,
  [KeyCode.KeyH]: Finger.RightIndex,
  [KeyCode.KeyJ]: Finger.RightIndex,
  [KeyCode.KeyN]: Finger.RightIndex,
  [KeyCode.KeyM]: Finger.RightIndex,
  [KeyCode.Digit8]: Finger.RightMiddle,
  [KeyCode.KeyI]: Finger.RightMiddle,
  [KeyCode.KeyK]: Finger.RightMiddle,
  [KeyCode.Comma]: Finger.RightMiddle,
  [KeyCode.Digit9]: Finger.RightRing,
  [KeyCode.KeyO]: Finger.RightRing,
  [KeyCode.KeyL]: Finger.RightRing,
  [KeyCode.Period]: Finger.RightRing,
  [KeyCode.Digit0]: Finger.RightPinky,
  [KeyCode.Minus]: Finger.RightPinky,
  [KeyCode.Equal]: Finger.RightPinky,
  [KeyCode.KeyP]: Finger.RightPinky,
  [KeyCode.BracketLeft]: Finger.RightPinky,
  [KeyCode.BracketRight]: Finger.RightPinky,
  [KeyCode.Backslash]: Finger.RightPinky,
  [KeyCode.Semicolon]: Finger.RightPinky,
  [KeyCode.Quote]: Finger.RightPinky,
  [KeyCode.Slash]: Finger.RightPinky,
  [KeyCode.Backspace]: Finger.RightPinky,
  [KeyCode.Enter]: Finger.RightPinky,
  [KeyCode.ShiftRight]: Finger.RightPinky,
};

const isLetterPair = (base: string, shifted: string): boolean => base !== shifted && shifted.toLowerCase() === base;

const character = (code: KeyCode, base: string, shifted: string): KeyCap => ({
  code,
  role: KeyRole.Character,
  finger: FINGER_OF[code],
  width: 1,
  label: isLetterPair(base, shifted) ? shifted : base,
  shiftedLabel: isLetterPair(base, shifted) ? null : shifted,
  base,
  shifted,
});

const special = (code: KeyCode, role: KeyRole, label: string, width: number, base: string | null = null): KeyCap => ({
  code,
  role,
  finger: FINGER_OF[code],
  width,
  label,
  shiftedLabel: null,
  base,
  shifted: null,
});

const BACKSPACE_KEY = special(KeyCode.Backspace, KeyRole.Modifier, '⌫', 2);
const TAB_KEY = special(KeyCode.Tab, KeyRole.Modifier, 'Tab', 1.5);
const CAPS_LOCK_KEY = special(KeyCode.CapsLock, KeyRole.Modifier, 'Caps', 1.75);
const ENTER_KEY = special(KeyCode.Enter, KeyRole.Enter, 'Enter', 2.25, PARAGRAPH_BREAK);
const LEFT_SHIFT_KEY = special(KeyCode.ShiftLeft, KeyRole.Shift, 'Shift', 2.25);
const RIGHT_SHIFT_KEY = special(KeyCode.ShiftRight, KeyRole.Shift, 'Shift', 2.75);
const SPACE_KEY = special(KeyCode.Space, KeyRole.Space, '', 6.5, SPACE);

const LATIN_ROWS: KeyboardRows = [
  [
    character(KeyCode.Backquote, '`', '~'), character(KeyCode.Digit1, '1', '!'), character(KeyCode.Digit2, '2', '@'),
    character(KeyCode.Digit3, '3', '#'), character(KeyCode.Digit4, '4', '$'), character(KeyCode.Digit5, '5', '%'),
    character(KeyCode.Digit6, '6', '^'), character(KeyCode.Digit7, '7', '&'), character(KeyCode.Digit8, '8', '*'),
    character(KeyCode.Digit9, '9', '('), character(KeyCode.Digit0, '0', ')'), character(KeyCode.Minus, '-', '_'),
    character(KeyCode.Equal, '=', '+'), BACKSPACE_KEY,
  ],
  [
    TAB_KEY, character(KeyCode.KeyQ, 'q', 'Q'), character(KeyCode.KeyW, 'w', 'W'), character(KeyCode.KeyE, 'e', 'E'),
    character(KeyCode.KeyR, 'r', 'R'), character(KeyCode.KeyT, 't', 'T'), character(KeyCode.KeyY, 'y', 'Y'),
    character(KeyCode.KeyU, 'u', 'U'), character(KeyCode.KeyI, 'i', 'I'), character(KeyCode.KeyO, 'o', 'O'),
    character(KeyCode.KeyP, 'p', 'P'), character(KeyCode.BracketLeft, '[', '{'), character(KeyCode.BracketRight, ']', '}'),
    character(KeyCode.Backslash, '\\', '|'),
  ],
  [
    CAPS_LOCK_KEY, character(KeyCode.KeyA, 'a', 'A'), character(KeyCode.KeyS, 's', 'S'), character(KeyCode.KeyD, 'd', 'D'),
    character(KeyCode.KeyF, 'f', 'F'), character(KeyCode.KeyG, 'g', 'G'), character(KeyCode.KeyH, 'h', 'H'),
    character(KeyCode.KeyJ, 'j', 'J'), character(KeyCode.KeyK, 'k', 'K'), character(KeyCode.KeyL, 'l', 'L'),
    character(KeyCode.Semicolon, ';', ':'), character(KeyCode.Quote, '\'', '"'), ENTER_KEY,
  ],
  [
    LEFT_SHIFT_KEY, character(KeyCode.KeyZ, 'z', 'Z'), character(KeyCode.KeyX, 'x', 'X'), character(KeyCode.KeyC, 'c', 'C'),
    character(KeyCode.KeyV, 'v', 'V'), character(KeyCode.KeyB, 'b', 'B'), character(KeyCode.KeyN, 'n', 'N'),
    character(KeyCode.KeyM, 'm', 'M'), character(KeyCode.Comma, ',', '<'), character(KeyCode.Period, '.', '>'),
    character(KeyCode.Slash, '/', '?'), RIGHT_SHIFT_KEY,
  ],
  [SPACE_KEY],
];

const CYRILLIC_ROWS: KeyboardRows = [
  [
    character(KeyCode.Backquote, 'ё', 'Ё'), character(KeyCode.Digit1, '1', '!'), character(KeyCode.Digit2, '2', '"'),
    character(KeyCode.Digit3, '3', '№'), character(KeyCode.Digit4, '4', ';'), character(KeyCode.Digit5, '5', '%'),
    character(KeyCode.Digit6, '6', ':'), character(KeyCode.Digit7, '7', '?'), character(KeyCode.Digit8, '8', '*'),
    character(KeyCode.Digit9, '9', '('), character(KeyCode.Digit0, '0', ')'), character(KeyCode.Minus, '-', '_'),
    character(KeyCode.Equal, '=', '+'), BACKSPACE_KEY,
  ],
  [
    TAB_KEY, character(KeyCode.KeyQ, 'й', 'Й'), character(KeyCode.KeyW, 'ц', 'Ц'), character(KeyCode.KeyE, 'у', 'У'),
    character(KeyCode.KeyR, 'к', 'К'), character(KeyCode.KeyT, 'е', 'Е'), character(KeyCode.KeyY, 'н', 'Н'),
    character(KeyCode.KeyU, 'г', 'Г'), character(KeyCode.KeyI, 'ш', 'Ш'), character(KeyCode.KeyO, 'щ', 'Щ'),
    character(KeyCode.KeyP, 'з', 'З'), character(KeyCode.BracketLeft, 'х', 'Х'), character(KeyCode.BracketRight, 'ъ', 'Ъ'),
    character(KeyCode.Backslash, '\\', '/'),
  ],
  [
    CAPS_LOCK_KEY, character(KeyCode.KeyA, 'ф', 'Ф'), character(KeyCode.KeyS, 'ы', 'Ы'), character(KeyCode.KeyD, 'в', 'В'),
    character(KeyCode.KeyF, 'а', 'А'), character(KeyCode.KeyG, 'п', 'П'), character(KeyCode.KeyH, 'р', 'Р'),
    character(KeyCode.KeyJ, 'о', 'О'), character(KeyCode.KeyK, 'л', 'Л'), character(KeyCode.KeyL, 'д', 'Д'),
    character(KeyCode.Semicolon, 'ж', 'Ж'), character(KeyCode.Quote, 'э', 'Э'), ENTER_KEY,
  ],
  [
    LEFT_SHIFT_KEY, character(KeyCode.KeyZ, 'я', 'Я'), character(KeyCode.KeyX, 'ч', 'Ч'), character(KeyCode.KeyC, 'с', 'С'),
    character(KeyCode.KeyV, 'м', 'М'), character(KeyCode.KeyB, 'и', 'И'), character(KeyCode.KeyN, 'т', 'Т'),
    character(KeyCode.KeyM, 'ь', 'Ь'), character(KeyCode.Comma, 'б', 'Б'), character(KeyCode.Period, 'ю', 'Ю'),
    character(KeyCode.Slash, '.', ','), RIGHT_SHIFT_KEY,
  ],
  [SPACE_KEY],
];

export const KEYBOARD_LAYOUTS: Readonly<Record<KeyboardLayout, KeyboardRows>> = {
  [KeyboardLayout.Latin]: LATIN_ROWS,
  [KeyboardLayout.Cyrillic]: CYRILLIC_ROWS,
};
