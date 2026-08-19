import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-menu-item',
    imports: [],
    templateUrl: './menu-item.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './menu-item.component.scss'
})
export class MenuItemComponent {
  @Input() label: string = '';
  @Input() route: string = '';
}
