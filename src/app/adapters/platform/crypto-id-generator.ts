import { IIdGenerator } from '../../application';

export class CryptoIdGenerator implements IIdGenerator {
  public nextId(): string {
    return crypto.randomUUID();
  }
}
