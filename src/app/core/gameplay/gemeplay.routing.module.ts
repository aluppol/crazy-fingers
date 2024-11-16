import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameplayComponent } from './gameplay.component';

const routes: Routes = [
  {
    path: '',
    component: GameplayComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GameplayRoutingModule { }
