import { Pipe, PipeTransform } from '@angular/core';
import { Glyph } from '../enums';

const PARAGRAPH_BREAK = '\n';

@Pipe({ name: 'paragraphGlyphs' })
export class ParagraphGlyphsPipe implements PipeTransform {
  public transform(text: string): string {
    return text.replaceAll(PARAGRAPH_BREAK, Glyph.ParagraphBreak);
  }
}
