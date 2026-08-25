import { IClock } from '../../domain';

export class SystemClock implements IClock {
  public now(): number {
    return Date.now();
  }
}
