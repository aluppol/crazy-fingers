import { IState, InitialState } from './states';
import { Injectable } from '@angular/core';
import { InputFeedbacks, IGameplayService } from './gameplay.interface';


@Injectable()
export class GameplayService implements IGameplayService {
  public score: number;
  public speed: number;
  public maxSpeed: number;
  public textChunkToWrite = '';
  public textChunkWrote = '';
  public currentSymbol = '';
  public placeholder = ''
  public tooltip = '';
  public fullText = '';
  public currentSymbolIndex = 0;
  public textContainerSize = 100;
  public inputFeedback!: InputFeedbacks;

  private _state: IState;


  constructor() {
    this._state = new InitialState(this);
    this.score = +(localStorage.getItem('CrazyFingers_score') ?? 0); //indexedDb
    this.speed = +(localStorage.getItem('CrazyFingers_speed') ?? 0);
    this.fullText = localStorage.getItem('CrazyFingers_fullText') ?? '';
    this.maxSpeed = +(localStorage.getItem('CrazyFingers_maxSpeed') ?? 0);
  }


  public onClick(event: MouseEvent): void {
    this._state.onClick(event);
  }


  public onKeyDown(event: KeyboardEvent): void {
    this._state.onKeyDown(event);
  }


  public setState(newState: IState): void {
    this._state = newState;
  }
}