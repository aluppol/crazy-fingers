import { ErrorName } from '../enums';

export class UnsupportedFormatError extends Error {
  constructor(public readonly extension: string) {
    super(extension === '' ? 'The file has no extension, so its format is unknown' : `Unsupported document format: .${extension}`);
    this.name = ErrorName.UnsupportedFormat;
  }
}
