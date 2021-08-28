import { GenericObject } from '../../helpers/types';

export abstract class IndexedDbRepository {
  protected constructor(dbName: string){
    const request = indexedDB.open(dbName);
    // create DB  if not exist
    request.onupgradeneeded = this._createDb;

    };
  }

  public create(data: GenericObject) {
    Object.keys(data).forEach((key: string) => {
      indexedDB.op
    });
  }

  private _createDb(): void {}
}
