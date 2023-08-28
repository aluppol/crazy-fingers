import { IGameplayService } from '../gameplay.interface';
import { IState } from './state.interface';

export abstract class State implements IState {
  constructor(protected _gameplay: IGameplayService) {
    this._initState();
  }

  abstract onKeyDown($event: KeyboardEvent): void;
  abstract onClick($event: MouseEvent): void;

  protected abstract _initState(): void;

  protected _changeState(newState: IState): void {
    this._gameplay.setState(newState);
  }
}
