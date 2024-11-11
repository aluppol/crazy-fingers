import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cf-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @Input() isActive: boolean;


  constructor() {
    this.isActive = false;
  }

  ngOnInit(): void {
  }

}
