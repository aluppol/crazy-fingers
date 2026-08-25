import { SourceDocument } from '../../application';
import { DocumentSection, ParsedDocument } from '../../domain';
import { Fb2Attribute, Fb2BodyName, Fb2Element } from './enums';
import { IFormatParser } from './format-parser.interface';
import { childrenNamed, decodeText, firstDescendantNamed, parseXml, plainTextOf, SectionBuilder, titleFromFileName } from './support';

const AUTHOR_NAME_PARTS = [Fb2Element.FirstName, Fb2Element.MiddleName, Fb2Element.LastName];

export class Fb2Parser implements IFormatParser {
  public async parse(source: SourceDocument): Promise<ParsedDocument> {
    const root = parseXml(decodeText(source.bytes), source.name).documentElement;
    const titleInfo = firstDescendantNamed(root, Fb2Element.TitleInfo);
    return {
      title: (titleInfo === null ? '' : plainTextOf(firstDescendantNamed(titleInfo, Fb2Element.BookTitle))) || titleFromFileName(source.name),
      author: titleInfo === null ? null : this._authorOf(titleInfo),
      sections: this._sectionsOf(root),
    };
  }

  private _authorOf(titleInfo: Element): string | null {
    const author = firstDescendantNamed(titleInfo, Fb2Element.Author);
    if (author === null) return null;
    const fullName = AUTHOR_NAME_PARTS
      .map(part => plainTextOf(firstDescendantNamed(author, part)))
      .filter(namePart => namePart.length > 0)
      .join(' ');
    return fullName || plainTextOf(firstDescendantNamed(author, Fb2Element.Nickname)) || null;
  }

  private _sectionsOf(root: Element): DocumentSection[] {
    const walk = new Fb2SectionWalk();
    childrenNamed(root, Fb2Element.Body)
      .filter(body => body.getAttribute(Fb2Attribute.Name) !== Fb2BodyName.Notes)
      .forEach(body => walk.visitBody(body));
    return walk.sections();
  }
}

class Fb2SectionWalk {
  private readonly _builder = new SectionBuilder();

  public visitBody(body: Element): void {
    this._visitChildren(Array.from(body.children));
  }

  public sections(): DocumentSection[] {
    return this._builder.sections();
  }

  private _visitChildren(children: readonly Element[]): void {
    for (const child of children) {
      if (child.localName === Fb2Element.Section) this._visitSection(child);
      else if (child.localName === Fb2Element.EmptyLine) this._builder.breakParagraph();
      else this._appendParagraph(child);
    }
  }

  private _visitSection(section: Element): void {
    const title = childrenNamed(section, Fb2Element.Title).at(0);
    if (title === undefined) this._builder.breakParagraph();
    else this._builder.openSection(plainTextOf(title));
    this._visitChildren(Array.from(section.children).filter(child => child !== title));
  }

  private _appendParagraph(element: Element): void {
    this._builder.appendText(plainTextOf(element));
    this._builder.breakParagraph();
  }
}
