export interface IState {
  onKeyDown($event: KeyboardEvent): void;
  onClick($event: MouseEvent): void;
}

export interface IKeyDownHandler {
  (e: KeyboardEvent): void
}
