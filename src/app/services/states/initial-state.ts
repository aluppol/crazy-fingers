import { State } from './state.abstract';
import { ReadyState } from './ready-state';

export class InitialState extends State {
  public onClick(event: MouseEvent): void {
    this._play();
  }

  public onKeyDown(event: KeyboardEvent): void {
    this._play();
  }

  protected _initState(): void {
    this._context.textChunkToWrite = '';
    this._context.textChunkWrote = '';
    this._context.currentSymbol = '';
    this._context.placeholder = 'Welcome to Crazy Fingers!';
    this._context.tooltip = 'Press anything to START';
  }

  private _play(): void {
    this._context.setState(new ReadyState(this._context));
  }

}
