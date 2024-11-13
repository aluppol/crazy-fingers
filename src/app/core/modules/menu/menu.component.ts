import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cf-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  public isOpen: boolean = false;


  constructor() {
  }

  ngOnInit(): void {
  }


  public toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }


}
