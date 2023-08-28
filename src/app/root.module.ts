import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RootComponent } from './root.component';
import { RouterModule } from '@angular/router';
import { CoreModule } from './core/core.module';


@NgModule({
  imports: [
    BrowserModule,
    CoreModule,
    RouterModule.forRoot([{
      path: '**', // open access to the platform for everyone
      loadChildren: () => import('./core/core.module').then(m => m.CoreModule),
    }]),
  ],
  exports: [RouterModule],
  declarations: [RootComponent],
  bootstrap: [RootComponent],
})
export class RootModule { }
