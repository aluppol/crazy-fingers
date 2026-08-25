import { ErrorName } from '../enums';

export class EmptyDocumentError extends Error {
  constructor(documentName: string) {
    super(`"${documentName}" contains no typeable text`);
    this.name = ErrorName.EmptyDocument;
  }
}
