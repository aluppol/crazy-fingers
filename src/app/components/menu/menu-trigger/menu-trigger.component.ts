import { Component, Output, ChangeDetectionStrategy } from '@angular/core';
import { EventEmitter } from 'stream';

@Component({
    selector: 'app-menu-trigger',
    imports: [],
    templateUrl: './menu-trigger.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './menu-trigger.component.scss'
})
export class MenuTriggerComponent {
  @Output() toggleMenu = new EventEmitter<void>();

  handleToggle(): void {
    this.toggleMenu.emit();
  }
}
