import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { LevelPage } from './level.page';
import { GridComponent } from './grid/grid.component';
import { SharedComponentsModule } from '../shared-components/shared-components.module';
import { GridBerryRowsPipe } from '../grid-berry-rows.pipe';
import { MenubarLevelComponent } from '../menubar/menubar-level.component';

const routes: Routes = [
  {
    path: '',
    component: LevelPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedComponentsModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    LevelPage,
    GridComponent,
    MenubarLevelComponent,
    GridBerryRowsPipe,
  ],
})
export class LevelPageModule {}
