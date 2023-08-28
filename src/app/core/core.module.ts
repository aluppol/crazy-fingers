import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreComponent } from './core.component';
import { CoreRoutingModule } from './core.routing.module';
import { Context } from './context';
import { HeaderComponent } from './components/header/header.component';
import { MenuComponent } from './components/menu/menu.component';
import { LoaderComponent } from './components/loader/loader.component';
import { MenuBtnComponent } from './components/menu-btn/menu-btn.component';
import { BrowserModule } from '@angular/platform-browser';
import { AboutComponent } from './about/about.component';



@NgModule({
  declarations: [CoreComponent, HeaderComponent, MenuComponent, LoaderComponent, MenuBtnComponent, AboutComponent],
  imports: [BrowserModule, CommonModule, CoreRoutingModule],
  providers: [Context],
})
export class CoreModule { }
