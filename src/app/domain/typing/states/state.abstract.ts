import { TypingPhase } from '../../enums';
import { Keystroke } from '../keystroke';
import { IState, ITypingContext } from '../typing-context.interface';

export abstract class State implements IState {
  public abstract readonly phase: TypingPhase;
  protected readonly _context: ITypingContext;

  constructor(context: ITypingContext) {
    this._context = context;
  }

  public abstract onKeystroke(keystroke: Keystroke): void;

  public onExit(): void {
    return;
  }
}
