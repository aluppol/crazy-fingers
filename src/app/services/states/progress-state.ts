import { State } from './state.abstract';
import { PauseState } from './pause-state';
import { CompleteState } from './complete-state';

export class ProgressState extends State {
  private _writtenSymbolsCounter = 0;
  private _writtenSymbolsLimit = 10;
  private _fetchSymbolsCapacity = 10;
  private _fetchingChunkSymbolIndex = this._context.currentSymbolIndex + this._context.textChunkToWrite.length + 1;

  onClick(event: MouseEvent): void {
    // TODO implement
  }

  onKeyDown(event: KeyboardEvent): void {
    const { key } = event;
    switch (true) {

    case key === this._context.currentSymbol:
    case key === 'Enter' && this._context.currentSymbol === '\u21B5':
      this._handleRightInput();
      break;

    case key === 'Pause':
      this._switchToPause();
      break;

    default:
      this._handleWrongInput();
    }
  }

  protected _initState(): void {
    this._context.tooltip = '';
  }

  private _switchToPause(): void {
    this._context.setState(new PauseState(this._context));
  }

  private _switchToComplete(): void {
    this._context.setState(new CompleteState(this._context));
  }

  private _getNextChunk(): string {
    const res = this._context.fullText.slice(this._fetchingChunkSymbolIndex, this._fetchingChunkSymbolIndex + this._fetchSymbolsCapacity);
    this._fetchingChunkSymbolIndex += res.length;
    return res;
  }

  private _setNextChunk(chunk: string): void {
    this._context.textChunkToWrite += chunk;
    this._writtenSymbolsCounter = 0;
  }

  private _updateWroteTextChunk(): void {
    if (this._context.textChunkWrote.length < this._context.textContainerSize) return;
    this._context.textChunkWrote = this._context.textChunkWrote.slice(this._writtenSymbolsLimit);
  }

  private _handleRightInput(): void {
    this._processWrittenSymbol();
    if (this._context.textChunkToWrite.length === 0) {
      this._switchToComplete();
      return;
    }
    this._prepareNextSymbol();
  }

  private _processWrittenSymbol(): void {
    this._context.textChunkWrote += this._context.currentSymbol;
    this._context.currentSymbol = this._context.textChunkToWrite.slice(0, 1);
    this._context.currentSymbolIndex++;
    localStorage.setItem('CrazyFingers_currentSymbolIndex', `${this._context.currentSymbolIndex}`);
    this._writtenSymbolsCounter++;
  }

  private _prepareNextSymbol(): void {
    this._context.textChunkToWrite = this._context.textChunkToWrite.slice(1);
    if (this._writtenSymbolsCounter === this._writtenSymbolsLimit) {
      const nextChunk = this._getNextChunk();
      this._setNextChunk(nextChunk);
      this._updateWroteTextChunk();
    }
  }

  private _handleWrongInput(): void {
    this._context.tooltip = 'Wrong!';
    setTimeout(() => this._context.tooltip = '', 500);
  }

}
