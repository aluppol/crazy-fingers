import { TypingPhase } from '../enums';
import { Keystroke } from './keystroke';

export interface IState {
  readonly phase: TypingPhase;
  onKeystroke(keystroke: Keystroke): void;
  onExit(): void;
}

export type StateRegistry = Readonly<Record<TypingPhase, IState>>;

export interface ITypingContext {
  readonly currentSymbol: string | null;
  acceptCurrentSymbol(): void;
  rejectKeystroke(): void;
  stopTiming(): void;
  transitionTo(phase: TypingPhase): void;
}
