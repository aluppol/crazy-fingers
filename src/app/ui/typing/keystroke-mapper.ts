import { characterKeystroke, ENTER_KEYSTROKE, ESCAPE_KEYSTROKE, Keystroke } from '../../domain';
import { KeyboardKey } from '../enums';

const SINGLE_CHARACTER_LENGTH = 1;

export function keystrokeFrom(event: KeyboardEvent): Keystroke | null {
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return null;
  if (event.key === KeyboardKey.Enter) return ENTER_KEYSTROKE;
  if (event.key === KeyboardKey.Escape) return ESCAPE_KEYSTROKE;
  if (event.key.length === SINGLE_CHARACTER_LENGTH) return characterKeystroke(event.key);
  return null;
}
