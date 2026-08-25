import { KeystrokeKind, TypingPhase } from '../../enums';
import { Keystroke } from '../keystroke';
import { State } from './state.abstract';

const PARAGRAPH_BREAK = '\n';

export class ProgressState extends State {
  public readonly phase = TypingPhase.Progress;

  public onKeystroke(keystroke: Keystroke): void {
    if (keystroke.kind === KeystrokeKind.Escape) {
      this._context.transitionTo(TypingPhase.Pause);
      return;
    }
    if (this._matchesCurrentSymbol(keystroke)) this._acceptCurrentSymbol();
    else this._context.rejectKeystroke();
  }

  public override onExit(): void {
    this._context.stopTiming();
  }

  private _matchesCurrentSymbol(keystroke: Keystroke): boolean {
    const expectedSymbol = this._context.currentSymbol;
    if (keystroke.kind === KeystrokeKind.Enter) return expectedSymbol === PARAGRAPH_BREAK;
    return keystroke.kind === KeystrokeKind.Character && keystroke.character === expectedSymbol;
  }

  private _acceptCurrentSymbol(): void {
    this._context.acceptCurrentSymbol();
    if (this._context.currentSymbol === null) this._context.transitionTo(TypingPhase.Complete);
  }
}
