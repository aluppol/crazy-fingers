import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cf-menu-btn',
  templateUrl: './menu-btn.component.html',
  styleUrls: ['./menu-btn.component.scss']
})
export class MenuBtnComponent implements OnInit {
  @Input() isMenu: boolean;


  constructor() {
    this.isMenu = false;
  }


  ngOnInit(): void {
  }

}
