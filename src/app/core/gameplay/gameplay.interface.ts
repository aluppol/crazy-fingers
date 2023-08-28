import { IState } from './states';


export interface IGameplayService {
  textChunkToWrite: string;
  textChunkWrote: string;
  score: number;
  speed: number;
  maxSpeed: number;
  placeholder: string;
  currentSymbol: string;
  tooltip: string;
  fullText: string;
  currentSymbolIndex: number;
  textContainerSize: number;
  inputFeedback?: InputFeedbacks;

  onKeyDown($event: KeyboardEvent): void;
  onClick($event: MouseEvent): void;
  setState(newState: IState): void;

}

export enum InputFeedbacks {
  error = 'Error',
  accepted = 'Accepted',
}