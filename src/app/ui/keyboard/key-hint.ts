import { Finger, KeyboardLayout, KeyCode } from '../enums';
import { KEYBOARD_LAYOUTS, KeyboardRows, KeyCap } from './keyboard-layouts';

export interface ShiftHint {
  readonly keyCode: KeyCode;
  readonly finger: Finger;
}

export interface KeyHint {
  readonly layout: KeyboardLayout;
  readonly keyCode: KeyCode;
  readonly finger: Finger;
  readonly shift: ShiftHint | null;
}

interface KeyMatch {
  readonly cap: KeyCap;
  readonly shifted: boolean;
}

const LEFT_SHIFT: ShiftHint = { keyCode: KeyCode.ShiftLeft, finger: Finger.LeftPinky };
const RIGHT_SHIFT: ShiftHint = { keyCode: KeyCode.ShiftRight, finger: Finger.RightPinky };

const SHIFT_ACROSS_FROM: Readonly<Record<Finger, ShiftHint | null>> = {
  [Finger.LeftPinky]: RIGHT_SHIFT,
  [Finger.LeftRing]: RIGHT_SHIFT,
  [Finger.LeftMiddle]: RIGHT_SHIFT,
  [Finger.LeftIndex]: RIGHT_SHIFT,
  [Finger.Thumb]: null,
  [Finger.RightIndex]: LEFT_SHIFT,
  [Finger.RightMiddle]: LEFT_SHIFT,
  [Finger.RightRing]: LEFT_SHIFT,
  [Finger.RightPinky]: LEFT_SHIFT,
};

const OTHER_LAYOUT: Readonly<Record<KeyboardLayout, KeyboardLayout>> = {
  [KeyboardLayout.Latin]: KeyboardLayout.Cyrillic,
  [KeyboardLayout.Cyrillic]: KeyboardLayout.Latin,
};

const SYMBOL_INDEX: Readonly<Record<KeyboardLayout, ReadonlyMap<string, KeyMatch>>> = {
  [KeyboardLayout.Latin]: indexSymbols(KEYBOARD_LAYOUTS[KeyboardLayout.Latin]),
  [KeyboardLayout.Cyrillic]: indexSymbols(KEYBOARD_LAYOUTS[KeyboardLayout.Cyrillic]),
};

export function hintFor(symbol: string, preferredLayout: KeyboardLayout): KeyHint | null {
  for (const layout of [preferredLayout, OTHER_LAYOUT[preferredLayout]]) {
    const match = SYMBOL_INDEX[layout].get(symbol);
    if (match !== undefined) return toHint(layout, match);
  }
  return null;
}

export function needsSystemLayoutSwitch(expectedSymbol: string, typedCharacter: string): boolean {
  const expectedLayouts = layoutsProducing(expectedSymbol);
  const typedLayouts = layoutsProducing(typedCharacter);
  if (expectedLayouts.length === 0 || typedLayouts.length === 0) return false;
  return !expectedLayouts.some(layout => typedLayouts.includes(layout));
}

function layoutsProducing(symbol: string): KeyboardLayout[] {
  return Object.values(KeyboardLayout).filter(layout => SYMBOL_INDEX[layout].has(symbol));
}

function toHint(layout: KeyboardLayout, { cap, shifted }: KeyMatch): KeyHint {
  return {
    layout,
    keyCode: cap.code,
    finger: cap.finger,
    shift: shifted ? SHIFT_ACROSS_FROM[cap.finger] : null,
  };
}

function indexSymbols(rows: KeyboardRows): ReadonlyMap<string, KeyMatch> {
  const index = new Map<string, KeyMatch>();
  for (const cap of rows.flat()) {
    if (cap.base !== null) index.set(cap.base, { cap, shifted: false });
    if (cap.shifted !== null) index.set(cap.shifted, { cap, shifted: true });
  }
  return index;
}
