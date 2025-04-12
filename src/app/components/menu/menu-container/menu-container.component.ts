import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-menu-container',
  standalone: true,
  imports: [],
  templateUrl: './menu-container.component.html',
  styleUrl: './menu-container.component.scss'
})
export class MenuContainerComponent {
  @Input() isOpen: boolean = false;
}
