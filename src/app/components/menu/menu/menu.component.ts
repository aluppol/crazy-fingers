import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-menu',
    imports: [],
    templateUrl: './menu.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './menu.component.scss'
})
export class MenuComponent {
  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}
