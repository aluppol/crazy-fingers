import { KeystrokeKind } from '../enums';

export type Keystroke =
  | { readonly kind: KeystrokeKind.Character; readonly character: string }
  | { readonly kind: KeystrokeKind.Enter }
  | { readonly kind: KeystrokeKind.Escape };

export const ENTER_KEYSTROKE: Keystroke = { kind: KeystrokeKind.Enter };
export const ESCAPE_KEYSTROKE: Keystroke = { kind: KeystrokeKind.Escape };

export function characterKeystroke(character: string): Keystroke {
  return { kind: KeystrokeKind.Character, character };
}
