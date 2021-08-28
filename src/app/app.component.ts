import { Component, ViewChild } from '@angular/core';
import { CrazyFingers, InitialState, State } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    public app: CrazyFingers,
  ) {
  }
}
