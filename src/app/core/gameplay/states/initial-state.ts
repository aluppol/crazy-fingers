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
    this._gameplay.textChunkToWrite = '';
    this._gameplay.textChunkWrote = '';
    this._gameplay.currentSymbol = '';
    this._gameplay.placeholder = 'Welcome to Crazy Fingers!';
    this._gameplay.tooltip = 'Press anything to START';
  }

  private _play(): void {
    this._gameplay.setState(new ReadyState(this._gameplay));
  }

}
