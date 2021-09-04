import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CrazyFingers } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  constructor(
    public app: CrazyFingers,
  ) {
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.app.onKeyDown(event);
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    this.app.onClick(event);
  }

  ngOnDestroy(): void { // not working(
    localStorage.setItem('CrazyFingers_score', `${this.app.score}`);
    localStorage.setItem('CrazyFingers_speed', `${this.app.speed}`);
    localStorage.setItem('CrazyFingers_fullText', this.app.fullText);
    localStorage.setItem('CrazyFingers_maxSpeed', `${this.app.maxSpeed}`);
    localStorage.setItem('CrazyFingers_currentSymbolIndex', `${this.app.currentSymbolIndex}`);
  }
}
