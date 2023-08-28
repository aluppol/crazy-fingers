import { State } from './state.abstract';
import { PauseState } from './pause-state';
import { CompleteState } from './complete-state';
import { IKeyDownHandler } from './state.interface';
import { InputFeedbacks } from '../gameplay.interface';

export class ProgressState extends State {
  private _writtenSymbolsCounter = 0;
  private _writtenSymbolsLimit = 10;
  private _fetchSymbolsCapacity = 10;
  private _fetchingChunkSymbolIndex = this._gameplay.currentSymbolIndex + this._gameplay.textChunkToWrite.length + 1;
  private _escKeydownHandler!: IKeyDownHandler;
  private _timeOut!: ReturnType<typeof setTimeout>;

  onClick(event: MouseEvent): void {
    // TODO implement
  }

  onKeyDown(event: KeyboardEvent): void {
    const { key } = event;
    switch (true) {
      case key === this._gameplay.currentSymbol:
      case key === 'Enter' && this._gameplay.currentSymbol === '\u21B5':
      case key === ' ' && this._gameplay.currentSymbol === '⎵':
        this._handleRightInput();
        break;

      default:
        this._handleWrongInput();
    }
  }

  protected _initState(): void {
    this._gameplay.tooltip = '';
    this._escKeydownHandler = this._escKeydownHandlerFunction.bind(this);
    window.addEventListener('keydown', this._escKeydownHandler);
  }

  private _switchToPause(): void {
    this._onDestroy();
    this._gameplay.setState(new PauseState(this._gameplay));
  }

  private _switchToComplete(): void {
    this._onDestroy();
    this._gameplay.setState(new CompleteState(this._gameplay));
  }

  private _getNextChunk(): string {
    const res = this._gameplay.fullText.slice(this._fetchingChunkSymbolIndex, this._fetchingChunkSymbolIndex + this._fetchSymbolsCapacity);
    this._fetchingChunkSymbolIndex += res.length;
    return res;
  }

  private _setNextChunk(chunk: string): void {
    this._gameplay.textChunkToWrite += chunk;
    this._writtenSymbolsCounter = 0;
  }

  private _updateWroteTextChunk(): void {
    if (this._gameplay.textChunkWrote.length < this._gameplay.textContainerSize) return;
    this._gameplay.textChunkWrote = this._gameplay.textChunkWrote.slice(this._writtenSymbolsLimit);
  }

  private _handleRightInput(): void {
    if (this._gameplay.inputFeedback === InputFeedbacks.error) {
      clearTimeout(this._timeOut);
      this._gameplay.inputFeedback = InputFeedbacks.accepted;
      this._gameplay.tooltip = '';
      this._timeOut = setTimeout(() => {
        this._gameplay.inputFeedback = null as unknown as InputFeedbacks;
      }, 400);
    }

    this._processWrittenSymbol();
    if (this._gameplay.textChunkToWrite.length === 0) {
      this._switchToComplete();
      return;
    }
    this._prepareNextSymbol();
  }

  private _processWrittenSymbol(): void {
    if (this._gameplay.currentSymbol === '⎵') this._gameplay.currentSymbol = ' ';
    this._gameplay.textChunkWrote += this._gameplay.currentSymbol;
    const newCurrentSymbol = this._gameplay.textChunkToWrite.slice(0, 1);
    this._gameplay.currentSymbol = newCurrentSymbol === ' ' ? '⎵' : newCurrentSymbol;
    this._gameplay.currentSymbolIndex++;
    localStorage.setItem('CrazyFingers_currentSymbolIndex', `${this._gameplay.currentSymbolIndex}`);
    this._writtenSymbolsCounter++;
  }

  private _prepareNextSymbol(): void {
    this._gameplay.textChunkToWrite = this._gameplay.textChunkToWrite.slice(1);
    if (this._writtenSymbolsCounter === this._writtenSymbolsLimit) {
      const nextChunk = this._getNextChunk();
      this._setNextChunk(nextChunk);
      this._updateWroteTextChunk();
    }
  }

  private _handleWrongInput(): void {
    this._gameplay.inputFeedback = InputFeedbacks.error;
    this._gameplay.tooltip = 'Wrong!';
    clearTimeout(this._timeOut);
    this._timeOut = setTimeout(() => {
      this._gameplay.tooltip = '';
      this._gameplay.inputFeedback = null as unknown as InputFeedbacks;
    }, 400);
  }

  private _escKeydownHandlerFunction(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    this._switchToPause();
  }

  private _onDestroy(): void {
    window.removeEventListener('keydown', this._escKeydownHandler);
  }

}
