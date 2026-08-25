import { SourceDocument } from '../../application';
import { DocumentSection, ParsedDocument } from '../../domain';
import { MediaType } from './enums';
import { EpubNavigation } from './epub-navigation';
import { EpubPackage } from './epub-package';
import { IFormatParser } from './format-parser.interface';
import { extractSections, parseHtml, titleFromFileName, ZipArchive } from './support';

const XHTML_MEDIA_TYPES: ReadonlySet<string> = new Set([MediaType.Xhtml, MediaType.Html]);

export class EpubParser implements IFormatParser {
  public async parse(source: SourceDocument): Promise<ParsedDocument> {
    const archive = ZipArchive.open(source);
    const epubPackage = EpubPackage.read(archive);
    const navigation = EpubNavigation.read(archive, epubPackage);
    const sections = epubPackage.spineItems
      .filter(item => XHTML_MEDIA_TYPES.has(item.mediaType) && archive.has(item.href))
      .flatMap(item => this._sectionsOf(archive, item.href, navigation));
    return { title: epubPackage.title || titleFromFileName(source.name), author: epubPackage.author, sections };
  }

  private _sectionsOf(archive: ZipArchive, href: string, navigation: EpubNavigation): DocumentSection[] {
    const sections = extractSections(parseHtml(archive.readText(href)).body);
    const label = navigation.labelFor(href);
    const first = sections.at(0);
    if (label === null || first === undefined || first.title !== null) return sections;
    return [{ title: label, text: first.text }, ...sections.slice(1)];
  }
}
