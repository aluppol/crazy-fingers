import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cf-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @Input() isMenu: boolean;


  constructor() {
    this.isMenu = false;
  }

  ngOnInit(): void {
  }

}
