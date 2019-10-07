import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { GameService } from '../game.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  private backButtonSub?: Subscription;

  constructor(
    private platform: Platform,
    private game: GameService,
  ) {}

  ngOnInit() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(1, () => {
      this.game.quitApp();
    });
  }

  ngOnDestroy() {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
    }
  }

  canReplayTutorial() {
    return this.game.isTutorialPlayed();
  }
}
