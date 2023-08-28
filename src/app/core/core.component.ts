import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Context } from './context';

@Component({
  selector: 'cf-core',
  templateUrl: './core.component.html',
  styleUrls: ['./core.component.scss']
})
export class CoreComponent implements OnInit {
  isMenu = false;
  isDisplayControls = true;

  constructor(
    private __router: Router,
    private __context: Context,
  ) { }

  ngOnInit(): void {
    this.__context.baseRoute = this.__router.url;
    this.__context.userId = 1;
    this.__context.userName = 'John Bee';
  }

  public toggleMenu(): void {
    this.isMenu = !this.isMenu;
  }

}


