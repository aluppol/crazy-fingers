import { IClock } from '../app/domain';

export class FakeClock implements IClock {
  private _currentMilliseconds = 0;

  public now(): number {
    return this._currentMilliseconds;
  }

  public advance(milliseconds: number): void {
    this._currentMilliseconds += milliseconds;
  }
}
