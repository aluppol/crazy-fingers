import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-menu-container',
    imports: [],
    templateUrl: './menu-container.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './menu-container.component.scss'
})
export class MenuContainerComponent {
  @Input() isOpen: boolean = false;
}
