import { book as harryPotterBook } from '../../statics/books/Book1-ThePhilosopher\'sStone';
import { State } from './state.abstract';
import { ProgressState } from './progress-state';

export class ReadyState extends State {

  onClick($event: MouseEvent): void {
    // just do nothing
  }

  onKeyDown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Enter') {
      this._context.setState(new ProgressState(this._context));
    }
  }

  protected _initState(): void {
    this._context.placeholder = '';
    this._context.currentSymbolIndex = +(localStorage.getItem('CrazyFingers_currentSymbolIndex') || 0);
    this._context.fullText = localStorage.getItem('CrazyFingers_fullText') || '';
    if (!this._context.fullText) {
      this._loadDefaultText();
    }
    this._context.textChunkWrote = this._context.fullText.slice(
      this._context.currentSymbolIndex > this._context.textContainerSize ?
        this._context.currentSymbolIndex - this._context.textContainerSize :
        0,
      this._context.currentSymbolIndex,
    );
    const pureCurrentSymbol = this._context.fullText.slice(this._context.currentSymbolIndex, this._context.currentSymbolIndex + 1);
    this._context.currentSymbol = pureCurrentSymbol === ' ' ? '⎵' : pureCurrentSymbol;
    this._context.textChunkToWrite = this._context.fullText.slice(
      this._context.currentSymbolIndex + 1,
      this._context.currentSymbolIndex + this._context.textContainerSize + 1,
    );
    this._context.tooltip = 'Press [ENTER] to START';
  }

  private _loadDefaultText(): void {
    const unprocessedText = harryPotterBook;
    const text = this._filterForAllowedSymbolsOnly(unprocessedText);
    this._context.fullText = text;
  }

  private _filterForAllowedSymbolsOnly(text: string): string {
    const regExp = /[A-Za-z0-9\s\.,!?$@()\*\-+=_\/<>;:"'%`~\[\]{}|\\#\^\t\n]/gi;
    const textAfterReplacements =  text.replace(/’/g, '\'').replace(/—/g, '-');
    const allowedCharArray = textAfterReplacements.match(regExp) || [];
    const stringWithLBr =  allowedCharArray.join('');
    const result = stringWithLBr.replace(/[\t?\n]/g, '\u21B5');
    return result;
  }
}
