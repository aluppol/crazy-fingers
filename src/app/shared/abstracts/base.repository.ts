import { GenericObject } from '..';

export abstract class BaseRepository {
  protected constructor(dbName: string) {
    const request = indexedDB.open(dbName);
    // create DB  if not exist
    request.onupgradeneeded = this._createDb;

  };

  public create(data: GenericObject) {
    Object.keys(data).forEach((key: string) => {
      indexedDB.op
    });

  private __createDb(): void { }
}
