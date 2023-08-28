import { Component, HostListener, OnDestroy } from '@angular/core';
import { InputFeedbacks } from './gameplay.interface';
import { GameplayService } from './gameplay.service';

@Component({
  selector: 'cf-gameplay',
  templateUrl: './gameplay.component.html',
  styleUrls: ['./gameplay.component.scss']
})
export class GameplayComponent implements OnDestroy {
  public InputFeedbacks = InputFeedbacks;
  constructor(
    public gameplay: GameplayService,
  ) {
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.gameplay.onKeyDown(event);
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    this.gameplay.onClick(event);
  }

  ngOnDestroy(): void { // not working(
    localStorage.setItem('CrazyFingers_score', `${this.gameplay.score}`);
    localStorage.setItem('CrazyFingers_speed', `${this.gameplay.speed}`);
    localStorage.setItem('CrazyFingers_fullText', this.gameplay.fullText);
    localStorage.setItem('CrazyFingers_maxSpeed', `${this.gameplay.maxSpeed}`);
    localStorage.setItem('CrazyFingers_currentSymbolIndex', `${this.gameplay.currentSymbolIndex}`);
  }
}
