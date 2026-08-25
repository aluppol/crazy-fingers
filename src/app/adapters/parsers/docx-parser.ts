import { SourceDocument } from '../../application';
import { DocumentSection, ParsedDocument } from '../../domain';
import { DocxAttribute, DocxElement, DocxPath } from './enums';
import { DocxStyles } from './docx-styles';
import { IFormatParser } from './format-parser.interface';
import { descendantsNamed, firstDescendantNamed, parseXml, plainTextOf, SectionBuilder, titleFromFileName, ZipArchive } from './support';

interface CoreProperties {
  readonly title: string;
  readonly author: string | null;
}

const SPACE = ' ';
const LINE_BREAK = '\n';

export class DocxParser implements IFormatParser {
  public async parse(source: SourceDocument): Promise<ParsedDocument> {
    const archive = ZipArchive.open(source);
    const coreProperties = this._coreProperties(archive);
    return {
      title: coreProperties.title || titleFromFileName(source.name),
      author: coreProperties.author,
      sections: this._sectionsOf(archive),
    };
  }

  private _sectionsOf(archive: ZipArchive): DocumentSection[] {
    const styles = DocxStyles.read(archive);
    const builder = new SectionBuilder();
    for (const paragraph of descendantsNamed(parseXml(archive.readText(DocxPath.Document), archive.documentName), DocxElement.Paragraph)) {
      const text = paragraphText(paragraph);
      if (styles.isHeading(paragraphStyleId(paragraph)) && text.trim().length > 0) builder.openSection(text.trim());
      else {
        builder.appendText(text);
        builder.breakParagraph();
      }
    }
    return builder.sections();
  }

  private _coreProperties(archive: ZipArchive): CoreProperties {
    if (!archive.has(DocxPath.CoreProperties)) return { title: '', author: null };
    const properties = parseXml(archive.readText(DocxPath.CoreProperties), archive.documentName);
    return {
      title: plainTextOf(firstDescendantNamed(properties, DocxElement.Title)),
      author: plainTextOf(firstDescendantNamed(properties, DocxElement.Creator)) || null,
    };
  }
}

function paragraphText(paragraph: Element): string {
  return descendantsNamed(paragraph, DocxElement.Run)
    .flatMap(run => Array.from(run.children))
    .map(runChildText)
    .join('');
}

function runChildText(runChild: Element): string {
  switch (runChild.localName) {
  case DocxElement.Text: return runChild.textContent ?? '';
  case DocxElement.Tab: return SPACE;
  case DocxElement.Break: return LINE_BREAK;
  default: return '';
  }
}

function paragraphStyleId(paragraph: Element): string {
  return firstDescendantNamed(paragraph, DocxElement.ParagraphStyle)?.getAttribute(DocxAttribute.Value) ?? '';
}
