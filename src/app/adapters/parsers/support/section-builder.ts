import { DocumentSection } from '../../../domain';

interface SectionDraft {
  title: string | null;
  text: string;
  hasBody: boolean;
}

export class SectionBuilder {
  private readonly _drafts: SectionDraft[] = [{ title: null, text: '', hasBody: false }];

  public appendText(text: string): void {
    const current = this._current();
    current.text += text;
    if (text.trim().length > 0) current.hasBody = true;
  }

  public breakParagraph(): void {
    this._current().text += '\n\n';
  }

  public openSection(title: string): void {
    const current = this._current();
    if (current.hasBody) this._drafts.push({ title, text: '', hasBody: false });
    else current.title = current.title === null ? title : `${current.title} — ${title}`;
    this._current().text += `\n\n${title}\n\n`;
  }

  public sections(): DocumentSection[] {
    return this._drafts.map(({ title, text }) => ({ title, text }));
  }

  private _current(): SectionDraft {
    return this._drafts[this._drafts.length - 1];
  }
}
