import { strFromU8, unzipSync } from 'fflate';
import { CorruptDocumentError, SourceDocument } from '../../../application';
import { ParserErrorReason } from '../enums';

const BYTE_ORDER_MARK = /^\uFEFF/;

export class ZipArchive {
  private constructor(
    public readonly documentName: string,
    private readonly _entries: Record<string, Uint8Array>,
  ) {}

  public static open(source: SourceDocument): ZipArchive {
    try {
      return new ZipArchive(source.name, unzipSync(new Uint8Array(source.bytes)));
    } catch {
      throw new CorruptDocumentError(source.name, ParserErrorReason.NotAZipArchive);
    }
  }

  public has(path: string): boolean {
    return this._entries[path] !== undefined;
  }

  public readText(path: string): string {
    const entry = this._entries[path];
    if (entry === undefined) throw new CorruptDocumentError(this.documentName, `missing "${path}"`);
    return strFromU8(entry).replace(BYTE_ORDER_MARK, '');
  }
}
