import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameplayComponent } from './gameplay.component';
import { GameplayService } from './gameplay.service';



@NgModule({
  declarations: [
    GameplayComponent
  ],
  imports: [
    CommonModule,
  ],
  providers: [GameplayService],
})
export class GameplayModule { }
