import { TypingPhase } from '../../enums';
import { State } from './state.abstract';

export class CompleteState extends State {
  public readonly phase = TypingPhase.Complete;

  public onKeystroke(): void {
    return;
  }
}
