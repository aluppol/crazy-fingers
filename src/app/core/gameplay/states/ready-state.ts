import { book as harryPotterBook } from '../../../statics/books/Book1-ThePhilosopher\'sStone';
import { State } from './state.abstract';
import { ProgressState } from './progress-state';

export class ReadyState extends State {

  onClick($event: MouseEvent): void {
    // just do nothing
  }

  onKeyDown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Enter') {
      this._gameplay.setState(new ProgressState(this._gameplay));
    }
  }

  protected _initState(): void {
    this._gameplay.placeholder = '';
    this._gameplay.currentSymbolIndex = +(localStorage.getItem('CrazyFingers_currentSymbolIndex') || 0);
    this._gameplay.fullText = localStorage.getItem('CrazyFingers_fullText') || '';
    if (!this._gameplay.fullText) {
      this._loadDefaultText();
    }
    this._gameplay.textChunkWrote = this._gameplay.fullText.slice(
      this._gameplay.currentSymbolIndex > this._gameplay.textContainerSize ?
        this._gameplay.currentSymbolIndex - this._gameplay.textContainerSize :
        0,
      this._gameplay.currentSymbolIndex,
    );
    const pureCurrentSymbol = this._gameplay.fullText.slice(this._gameplay.currentSymbolIndex, this._gameplay.currentSymbolIndex + 1);
    this._gameplay.currentSymbol = pureCurrentSymbol === ' ' ? '⎵' : pureCurrentSymbol;
    this._gameplay.textChunkToWrite = this._gameplay.fullText.slice(
      this._gameplay.currentSymbolIndex + 1,
      this._gameplay.currentSymbolIndex + this._gameplay.textContainerSize + 1,
    );
    this._gameplay.tooltip = 'Press [ENTER] to START';
  }

  private _loadDefaultText(): void {
    const unprocessedText = harryPotterBook;
    const text = this._filterForAllowedSymbolsOnly(unprocessedText);
    this._gameplay.fullText = text;
  }

  private _filterForAllowedSymbolsOnly(text: string): string {
    const regExp = /[A-Za-z0-9\s\.,!?$@()\*\-+=_\/<>;:"'%`~\[\]{}|\\#\^\t\n]/gi;
    const textAfterReplacements = text.replace(/’/g, '\'').replace(/—/g, '-');
    const allowedCharArray = textAfterReplacements.match(regExp) || [];
    const stringWithLBr = allowedCharArray.join('');
    const result = stringWithLBr.replace(/[\t?\n]/g, '\u21B5');
    return result;
  }
}
