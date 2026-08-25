import { KeystrokeKind, TypingPhase } from '../../enums';
import { Keystroke } from '../keystroke';
import { State } from './state.abstract';

export class ReadyState extends State {
  public readonly phase = TypingPhase.Ready;

  public onKeystroke(keystroke: Keystroke): void {
    if (keystroke.kind === KeystrokeKind.Enter) this._context.transitionTo(TypingPhase.Progress);
  }
}
