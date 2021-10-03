import { State } from './state.abstract';
import { PauseState } from './pause-state';
import { CompleteState } from './complete-state';
import { IKeyDownHandler } from '.';
import { InputFeedbacks } from '..';

export class ProgressState extends State {
  private _writtenSymbolsCounter = 0;
  private _writtenSymbolsLimit = 10;
  private _fetchSymbolsCapacity = 10;
  private _fetchingChunkSymbolIndex = this._context.currentSymbolIndex + this._context.textChunkToWrite.length + 1;
  private _escKeydownHandler!: IKeyDownHandler;
  private _timeOut!: ReturnType<typeof setTimeout>;

  onClick(event: MouseEvent): void {
    // TODO implement
  }

  onKeyDown(event: KeyboardEvent): void {
    const { key } = event;
    switch (true) {
    case key === this._context.currentSymbol:
    case key === 'Enter' && this._context.currentSymbol === '\u21B5':
    case key === ' ' && this._context.currentSymbol === '⎵':
      this._handleRightInput();
      break;

    default:
      this._handleWrongInput();
    }
  }

  protected _initState(): void {
    this._context.tooltip = '';
    this._escKeydownHandler = this._escKeydownHandlerFunction.bind(this);
    window.addEventListener('keydown', this._escKeydownHandler);
  }

  private _switchToPause(): void {
    this._onDestroy();
    this._context.setState(new PauseState(this._context));
  }

  private _switchToComplete(): void {
    this._onDestroy();
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
    if (this._context.inputFeedback === InputFeedbacks.error) {
      clearTimeout(this._timeOut);
      this._context.inputFeedback = InputFeedbacks.accepted;
      this._context.tooltip = '';
      this._timeOut = setTimeout(() => {
        this._context.inputFeedback = null as unknown as InputFeedbacks;
      }, 400);
    }

    this._processWrittenSymbol();
    if (this._context.textChunkToWrite.length === 0) {
      this._switchToComplete();
      return;
    }
    this._prepareNextSymbol();
  }

  private _processWrittenSymbol(): void {
    if (this._context.currentSymbol === '⎵') this._context.currentSymbol = ' ';
    this._context.textChunkWrote += this._context.currentSymbol;
    const newCurrentSymbol = this._context.textChunkToWrite.slice(0, 1);
    this._context.currentSymbol = newCurrentSymbol === ' ' ? '⎵' : newCurrentSymbol;
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
    this._context.inputFeedback = InputFeedbacks.error;
    this._context.tooltip = 'Wrong!';
    clearTimeout(this._timeOut);
    this._timeOut = setTimeout(() => {
      this._context.tooltip = '';
      this._context.inputFeedback = null as unknown as InputFeedbacks;
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
