import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../game.service';
import { MenubarComponent } from './menubar.component';

@Component({
  selector: 'app-menubar-level',
  templateUrl: './menubar-level.component.html',
  styleUrls: ['./menubar.component.scss'],
})
export class MenubarLevelComponent extends MenubarComponent implements OnInit {
  // Valori dello scoreboard del livello
  @Input() moves = 0;
  @Input() time = 0;
  @Input() monsterName = '';

  @Output() levelRestarted = new EventEmitter<void>();

  paused = false;

  showConfirmation = false;
  confirmMessage = '';
  confirmAction: () => void = () => {};

  constructor(
    private router: Router,
    protected game: GameService,
  ) {
    super(game);
  }

  ngOnInit() {
    this.game.paused.subscribe((paused) => {
      this.paused = paused;
    });
  }

  pause() {
    this.game.pause();
  }

  unpause() {
    this.game.unpause();
    this.showConfirmation = false;
  }

  restartLevel() {
    this.askConfirmation(() => {
      this.unpause();
      this.levelRestarted.emit();
    }, 'riprova il livello');
  }

  canQuitLevel() {
    return this.game.isTutorialPlayed();
  }

  quitLevel() {
    this.askConfirmation(() => {
      this.unpause();
      this.router.navigate(['/level-selection']);
    }, 'abbandona il livello');
  }

  quit() {
    this.askConfirmation(() => {
      this.unpause();
      super.quit();
    }, 'esci dal gioco');
  }

  rejectAction() {
    this.showConfirmation = false;
  }

  private askConfirmation(action: () => void, message: string) {
    this.confirmMessage = message;

    this.confirmAction = () => {
      action();

      // resetta modal conferma
      this.showConfirmation = false;
      this.confirmAction = () => {};
    };

    this.showConfirmation = true;
  }
}
