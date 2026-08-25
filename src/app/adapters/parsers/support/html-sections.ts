import { DocumentSection } from '../../../domain';
import { HtmlTag } from '../enums';
import { SectionBuilder } from './section-builder';
import { plainTextOf } from './xml';

const BLOCK_ELEMENTS: ReadonlySet<string> = new Set([
  HtmlTag.Paragraph, HtmlTag.Div, HtmlTag.ListItem, HtmlTag.UnorderedList, HtmlTag.OrderedList,
  HtmlTag.DefinitionList, HtmlTag.DefinitionTerm, HtmlTag.DefinitionDescription, HtmlTag.Blockquote,
  HtmlTag.Preformatted, HtmlTag.Section, HtmlTag.Article, HtmlTag.Aside, HtmlTag.Header, HtmlTag.Footer,
  HtmlTag.Main, HtmlTag.Nav, HtmlTag.Figure, HtmlTag.FigureCaption, HtmlTag.Table, HtmlTag.TableRow,
  HtmlTag.TableCell, HtmlTag.TableHeaderCell, HtmlTag.HorizontalRule, HtmlTag.Body,
]);

const HEADING_ELEMENTS: ReadonlySet<string> = new Set([
  HtmlTag.Heading1, HtmlTag.Heading2, HtmlTag.Heading3, HtmlTag.Heading4, HtmlTag.Heading5, HtmlTag.Heading6,
]);

const SKIPPED_ELEMENTS: ReadonlySet<string> = new Set([
  HtmlTag.Script, HtmlTag.Style, HtmlTag.Head, HtmlTag.Title, HtmlTag.Template, HtmlTag.Noscript,
  HtmlTag.Svg, HtmlTag.Math, HtmlTag.Iframe, HtmlTag.Object,
]);

const LINE_BREAK = '\n';

export function extractSections(root: Node): DocumentSection[] {
  return new SectionWalk(root).sections();
}

class SectionWalk {
  private readonly _builder = new SectionBuilder();

  constructor(root: Node) {
    this._visitChildren(root);
  }

  public sections(): DocumentSection[] {
    return this._builder.sections();
  }

  private _visitChildren(parent: Node): void {
    parent.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) this._builder.appendText(child.textContent ?? '');
      else if (child.nodeType === Node.ELEMENT_NODE) this._visitElement(child as Element);
    });
  }

  private _visitElement(element: Element): void {
    const tag = element.localName.toLowerCase();
    if (SKIPPED_ELEMENTS.has(tag)) return;
    if (tag === HtmlTag.Break) {
      this._builder.appendText(LINE_BREAK);
      return;
    }
    if (HEADING_ELEMENTS.has(tag)) {
      this._builder.openSection(plainTextOf(element));
      return;
    }
    if (BLOCK_ELEMENTS.has(tag)) this._builder.breakParagraph();
    this._visitChildren(element);
    if (BLOCK_ELEMENTS.has(tag)) this._builder.breakParagraph();
  }
}
