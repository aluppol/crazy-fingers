import { KeystrokeKind, TypingPhase } from '../../enums';
import { Keystroke } from '../keystroke';
import { State } from './state.abstract';

export class PauseState extends State {
  public readonly phase = TypingPhase.Pause;

  public onKeystroke(keystroke: Keystroke): void {
    if (keystroke.kind === KeystrokeKind.Escape) this._context.transitionTo(TypingPhase.Progress);
  }
}
