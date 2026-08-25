import { DocxAttribute, DocxElement, DocxPath } from './enums';
import { descendantsNamed, firstDescendantNamed, parseXml, ZipArchive } from './support';

const HEADING_STYLE_NAME = /^(heading\s*[1-3]|title)$/i;

export class DocxStyles {
  private constructor(private readonly _namesById: ReadonlyMap<string, string>) {}

  public static read(archive: ZipArchive): DocxStyles {
    if (!archive.has(DocxPath.Styles)) return new DocxStyles(new Map());
    const styles = descendantsNamed(parseXml(archive.readText(DocxPath.Styles), archive.documentName), DocxElement.Style);
    return new DocxStyles(new Map(styles.map(style => [
      style.getAttribute(DocxAttribute.StyleId) ?? '',
      firstDescendantNamed(style, DocxElement.Name)?.getAttribute(DocxAttribute.Value) ?? '',
    ])));
  }

  public isHeading(styleId: string): boolean {
    return HEADING_STYLE_NAME.test(this._namesById.get(styleId) ?? styleId);
  }
}
