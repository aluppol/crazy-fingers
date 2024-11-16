import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameplayComponent } from './gameplay.component';
import { GameplayService } from './gameplay.service';
import { GameplayRoutingModule } from './gemeplay.routing.module';



@NgModule({
  declarations: [
    GameplayComponent
  ],
  imports: [
    CommonModule,
    GameplayRoutingModule,
  ],
  providers: [GameplayService],
})
export class GameplayModule { }
