import { Pipe, PipeTransform } from '@angular/core';
import { Glyph } from '../enums';

const SYMBOL_GLYPHS: ReadonlyMap<string, Glyph> = new Map([
  [' ', Glyph.Space],
  ['\n', Glyph.ParagraphBreak],
]);

@Pipe({ name: 'currentSymbolGlyph' })
export class CurrentSymbolGlyphPipe implements PipeTransform {
  public transform(symbol: string): string {
    return SYMBOL_GLYPHS.get(symbol) ?? symbol;
  }
}
