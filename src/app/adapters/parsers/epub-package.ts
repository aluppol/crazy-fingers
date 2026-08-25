import { CorruptDocumentError } from '../../application';
import { EpubPath, OpfAttribute, OpfElement, OpfProperty, ParserErrorReason } from './enums';
import { descendantsNamed, directoryOf, firstDescendantNamed, parseXml, plainTextOf, resolveZipPath, ZipArchive } from './support';

export interface EpubSpineItem {
  readonly href: string;
  readonly mediaType: string;
}

interface ManifestItem extends EpubSpineItem {
  readonly properties: string;
}

const NON_LINEAR = 'no';
const PROPERTY_SEPARATOR = /\s+/;

export class EpubPackage {
  private constructor(
    private readonly _packageDocument: Document,
    private readonly _directory: string,
  ) {}

  public static read(archive: ZipArchive): EpubPackage {
    const container = parseXml(archive.readText(EpubPath.Container), archive.documentName);
    const rootfilePath = firstDescendantNamed(container, OpfElement.Rootfile)?.getAttribute(OpfAttribute.FullPath) ?? null;
    if (rootfilePath === null) throw new CorruptDocumentError(archive.documentName, ParserErrorReason.NoRootfile);
    return new EpubPackage(parseXml(archive.readText(rootfilePath), archive.documentName), directoryOf(rootfilePath));
  }

  public get title(): string {
    return plainTextOf(firstDescendantNamed(this._packageDocument, OpfElement.Title));
  }

  public get author(): string | null {
    return plainTextOf(firstDescendantNamed(this._packageDocument, OpfElement.Creator)) || null;
  }

  public get spineItems(): EpubSpineItem[] {
    const manifest = this._manifest();
    return descendantsNamed(this._packageDocument, OpfElement.ItemReference)
      .filter(itemReference => itemReference.getAttribute(OpfAttribute.Linear) !== NON_LINEAR)
      .map(itemReference => manifest.get(itemReference.getAttribute(OpfAttribute.IdReference) ?? ''))
      .filter((item): item is ManifestItem => item !== undefined)
      .map(item => ({ href: item.href, mediaType: item.mediaType }));
  }

  public get navigationHref(): string | null {
    const navigation = [...this._manifest().values()]
      .find(item => item.properties.split(PROPERTY_SEPARATOR).includes(OpfProperty.Navigation));
    return navigation?.href ?? null;
  }

  public get tableOfContentsHref(): string | null {
    const tableOfContentsId = firstDescendantNamed(this._packageDocument, OpfElement.Spine)
      ?.getAttribute(OpfAttribute.TableOfContents) ?? null;
    if (tableOfContentsId === null) return null;
    return this._manifest().get(tableOfContentsId)?.href ?? null;
  }

  private _manifest(): Map<string, ManifestItem> {
    return new Map(descendantsNamed(this._packageDocument, OpfElement.Item).map(item => [item.getAttribute(OpfAttribute.Id) ?? '', {
      href: resolveZipPath(this._directory, item.getAttribute(OpfAttribute.Href) ?? ''),
      mediaType: item.getAttribute(OpfAttribute.MediaType) ?? '',
      properties: item.getAttribute(OpfAttribute.Properties) ?? '',
    }]));
  }
}
