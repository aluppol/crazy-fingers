import { ErrorName } from '../enums';

export class CorruptDocumentError extends Error {
  constructor(documentName: string, reason: string) {
    super(`Cannot read "${documentName}": ${reason}`);
    this.name = ErrorName.CorruptDocument;
  }
}
