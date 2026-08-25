import { EpubNavigationType, HtmlTag, NcxAttribute, NcxElement, OpfAttribute } from './enums';
import { EpubPackage } from './epub-package';
import { descendantsNamed, directoryOf, firstDescendantNamed, parseHtml, parseXml, plainTextOf, resolveZipPath, ZipArchive } from './support';

const EPUB_TYPE_ATTRIBUTE = 'epub:type';

export class EpubNavigation {
  private constructor(private readonly _labelsByHref: ReadonlyMap<string, string>) {}

  public static read(archive: ZipArchive, epubPackage: EpubPackage): EpubNavigation {
    const navigationHref = epubPackage.navigationHref;
    if (navigationHref !== null && archive.has(navigationHref)) {
      return new EpubNavigation(this._labelsFromNavigation(archive, navigationHref));
    }
    const tableOfContentsHref = epubPackage.tableOfContentsHref;
    if (tableOfContentsHref !== null && archive.has(tableOfContentsHref)) {
      return new EpubNavigation(this._labelsFromNcx(archive, tableOfContentsHref));
    }
    return new EpubNavigation(new Map());
  }

  public labelFor(href: string): string | null {
    return this._labelsByHref.get(href) ?? null;
  }

  private static _labelsFromNavigation(archive: ZipArchive, navigationHref: string): Map<string, string> {
    const navigations = Array.from(parseHtml(archive.readText(navigationHref)).getElementsByTagName(HtmlTag.Nav));
    const tableOfContents = navigations
      .find(navigation => navigation.getAttribute(EPUB_TYPE_ATTRIBUTE) === EpubNavigationType.TableOfContents) ?? navigations.at(0);
    const anchors = tableOfContents === undefined ? [] : Array.from(tableOfContents.getElementsByTagName(HtmlTag.Anchor));
    return this._firstLabels(anchors.map(anchor => [
      resolveZipPath(directoryOf(navigationHref), anchor.getAttribute(OpfAttribute.Href) ?? ''),
      plainTextOf(anchor),
    ]));
  }

  private static _labelsFromNcx(archive: ZipArchive, tableOfContentsHref: string): Map<string, string> {
    const tableOfContents = parseXml(archive.readText(tableOfContentsHref), archive.documentName);
    const navigationPoints = descendantsNamed(tableOfContents, NcxElement.NavigationPoint);
    return this._firstLabels(navigationPoints.map(navigationPoint => [
      resolveZipPath(
        directoryOf(tableOfContentsHref),
        firstDescendantNamed(navigationPoint, NcxElement.Content)?.getAttribute(NcxAttribute.Source) ?? '',
      ),
      plainTextOf(firstDescendantNamed(navigationPoint, NcxElement.Text)),
    ]));
  }

  private static _firstLabels(pairs: ReadonlyArray<readonly [string, string]>): Map<string, string> {
    const labels = new Map<string, string>();
    for (const [href, label] of pairs) {
      if (!labels.has(href) && label.length > 0) labels.set(href, label);
    }
    return labels;
  }
}
