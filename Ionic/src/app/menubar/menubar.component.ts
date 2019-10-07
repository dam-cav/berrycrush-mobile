import { Component } from '@angular/core';
import { GameService } from '../game.service';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.scss'],
})
export class MenubarComponent {
  constructor(
    protected game: GameService,
  ) { }

  isAudioEnabled() {
    return this.game.isAudioEnabled();
  }

  toggleAudio() {
    this.game.toggleAudio();
  }

  quit() {
    this.game.quitApp();
  }
}
