import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cf-menu-context',
  templateUrl: './menu-context.component.html',
  styleUrl: './menu-context.component.scss'
})
export class MenuContextComponent implements OnInit {
  @Input() isActive: boolean = false;

  constructor() {
  }


  public ngOnInit(): void {
  }
}
