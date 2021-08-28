import { ICrazyFingers, IState } from '..';

export abstract class State implements IState {
  private _context: ICrazyFingers;

  constructor(app: ICrazyFingers) {
    this._context = app;
  }

  abstract onKeyDown($event: KeyboardEvent): void;
  abstract onClick($event: MouseEvent): void;

  protected _changeState(newState: IState): void {
    this._context.setState(newState);
  }
}
