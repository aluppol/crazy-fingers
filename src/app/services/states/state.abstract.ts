import { ICrazyFingers, IState } from '..';

export abstract class State implements IState {
  protected _context: ICrazyFingers;

  constructor(app: ICrazyFingers) {
    this._context = app;
    this._initState();
  }

  abstract onKeyDown($event: KeyboardEvent): void;
  abstract onClick($event: MouseEvent): void;

  protected abstract _initState(): void;

  protected _changeState(newState: IState): void {
    this._context.setState(newState);
  }
}
