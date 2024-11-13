import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu.component';
import { MenuBtnComponent } from './menu-btn/menu-btn.component';
import { MenuContextComponent } from './menu-context/menu-context.component';



@NgModule({
  declarations: [MenuComponent, MenuBtnComponent, MenuContextComponent],
  imports: [
    CommonModule
  ],
  exports: [
    MenuComponent
  ]
})
export class MenuModule { }
