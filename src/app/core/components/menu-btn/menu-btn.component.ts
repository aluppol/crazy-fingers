import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cf-menu-btn',
  templateUrl: './menu-btn.component.html',
  styleUrls: ['./menu-btn.component.scss']
})
export class MenuBtnComponent implements OnInit {
  @Input() isActive: boolean;


  constructor() {
    this.isActive = false;
  }


  public ngOnInit(): void {
  }

  public onClick() {
    this.isActive = !this.isActive;
  }

}
