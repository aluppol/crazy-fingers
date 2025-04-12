import { Component, Output } from '@angular/core';
import { EventEmitter } from 'stream';

@Component({
  selector: 'app-menu-trigger',
  standalone: true,
  imports: [],
  templateUrl: './menu-trigger.component.html',
  styleUrl: './menu-trigger.component.scss'
})
export class MenuTriggerComponent {
  @Output() toggleMenu = new EventEmitter<void>();

  handleToggle(): void {
    this.toggleMenu.emit();
  }
}
