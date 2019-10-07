import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarComponent } from '../menubar/menubar.component';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

// https://github.com/angular/angular/issues/10646#issuecomment-253275045
@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    MenubarComponent,
    ProgressBarComponent,
  ],
  exports: [
    MenubarComponent,
    ProgressBarComponent,
  ],
})
export class SharedComponentsModule { }
