import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreComponent } from './core.component';
import { CoreRoutingModule } from './core.routing.module';
import { Context } from './context';
import { HeaderComponent } from './components/header/header.component';
import { LoaderComponent } from './components/loader/loader.component';
import { BrowserModule } from '@angular/platform-browser';
import { AboutComponent } from './about/about.component';
import { MenuModule } from './modules/menu/menu.module';



@NgModule({
  declarations: [
    CoreComponent,
    HeaderComponent,
    LoaderComponent,
    AboutComponent],
  imports: [
    BrowserModule,
    CommonModule,
    CoreRoutingModule,
    MenuModule,
  ],
  providers: [Context],
})
export class CoreModule { }
