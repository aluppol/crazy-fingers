import { Component, HostListener } from '@angular/core';
import { CrazyFingers } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    public app: CrazyFingers,
  ) {}

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.app.onKeyDown(event);
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    this.app.onClick(event);
  }
}
