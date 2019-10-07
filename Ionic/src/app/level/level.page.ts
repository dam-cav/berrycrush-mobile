import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { GameService } from '../game.service';
import SLevelPage from 'src/shared/angular/level.page';
import Berry from 'src/shared/src/Berry';
import Grid from 'src/shared/src/Grid';
import { Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-level',
  templateUrl: './level.page.html',
  styleUrls: ['./level.page.scss'],
})
export class LevelPage extends SLevelPage implements OnInit, OnDestroy {
  _grid: Grid<Berry>;

  private backButtonSub: Subscription;

  constructor(
    private platform: Platform,
    private route: ActivatedRoute,
    private router: Router,
    game: GameService,
  ) {
    super(game);
  }

  ngOnInit() {
    this.backButtonSub = this.platform.backButton.subscribeWithPriority(1, () => {
      // this.router.navigate(['/level-selection']);
      this.game.pause();
    });

    try {
      const levelId = this.route.snapshot.paramMap.get('id');
      if (!levelId) {
        throw new Error('nessun levelid');
      }
      this.loadLevel(levelId);
      this.afterInit();
    } catch (err) {
      console.error(err);
      return this.router.navigate(['/level-selection']);
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.backButtonSub.unsubscribe();
  }

  updateBerryGrid() {
    this._grid = this.grid.getGrid().clone();
  }
}
