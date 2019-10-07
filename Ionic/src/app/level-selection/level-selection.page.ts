import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import LevelList, { LevelParams } from 'src/shared/src/LevelList';
import { GameService } from '../game.service';
import { LevelSave } from 'src/shared/angular/game.service';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

type Level = LevelSave & LevelParams;

@Component({
  selector: 'app-level-selection',
  templateUrl: './level-selection.page.html',
  styleUrls: ['./level-selection.page.scss'],
})
export class LevelSelectionPage implements OnInit, OnDestroy {
  levels: Level[] = [];

  private backButtonSub?: Subscription;
  private unlockTaps = 0;

  constructor(
    private platform: Platform,
    private router: Router,
    private ngZone: NgZone,
    private game: GameService,
  ) { }

  ngOnInit() {
    // const lastLevelUnlocked =
    this.game.unlockNextLevel();

    if (!this.game.isTutorialPlayed()) {
      return this.router.navigateByUrl('/level/tutorial');
    }

    // https://stackoverflow.com/questions/53645534/navigation-triggered-outside-angular-zone-did-you-forget-to-call-ngzone-run
    this.backButtonSub = this.platform.backButton
      .subscribeWithPriority(1, () => this.ngZone.run(() => this.router.navigate(['/home'])));

    this.levels = LevelList.levels.map((level) => {
      const levelSave = this.game.getLevel(level.level);

      return {
        ...level,
        completed: false,
        ...levelSave,
        locked: levelSave === undefined,
        // DEBUG
        // locked: false,
      };
    });
  }

  ngOnDestroy() {
    if (this.backButtonSub) {
      this.backButtonSub.unsubscribe();
    }
  }

  goToLevel(levelId: string, locked: boolean) {
    if (!locked || this.unlockTaps > 5) {
      this.router.navigateByUrl(`/level/${levelId}`);
    } else {
      this.unlockTaps += 1;
    }
  }

  range(n: number): number[] {
    return Array.from(Array(n).keys());
  }
}
