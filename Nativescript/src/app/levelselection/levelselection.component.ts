import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterExtensions } from "nativescript-angular/router";
import LevelList, { LevelParams } from "~/shared/src/LevelList";
import { NavigationExtras } from '@angular/router';
import { android as androidApp } from 'tns-core-modules/application';
import * as application from "tns-core-modules/application";
import { GameService } from '../game.service';
import { LevelSave } from '~/shared/angular/game.service';

type Level = LevelSave & LevelParams;

@Component({
	selector: 'ns-levelselection',
	templateUrl: './levelselection.component.html',
	styleUrls: ['./levelselection.component.css'],
	moduleId: module.id,
})
export class LevelselectionComponent implements OnInit {

  levels: Level[] = [];

	constructor(private routerExtensions: RouterExtensions, private game: GameService) {}

	ngOnInit() {

    this.changeBackBehaviour()

    this.game.unlockNextLevel();
    if (!this.game.isTutorialPlayed()) {
      let navigationExtras: NavigationExtras = {
        queryParams: {
            "level": "tutorial",
        }
      };
      return this.routerExtensions.navigate(["level/"], navigationExtras);
    }

    this.game.stopAllSFX();
    this.levels = LevelList.levels.map((level) => {
      const levelSave = this.game.getLevel(level.level);
      return{
        ...level,
        ...levelSave,
        locked: levelSave === undefined,
      };
    });
  }

	openLevel(event: Event, tapped:string, locked:boolean|undefined){
    if(!locked){
      let navigationExtras: NavigationExtras = {
        queryParams: {
            "level": tapped,
        }
      };
      this.routerExtensions.navigate(["level/"], navigationExtras);
    }
    else console.error("Level locked");
  }

  //cambio comportamento tasto back
  private changeBackBehaviour(){
    if (androidApp) {
        application.android.on(application.AndroidApplication.activityBackPressedEvent, (args: any) => {
            args.cancel = true;
        });
    }
  }

  exit(){
    if (androidApp) application.android.foregroundActivity.finish();
    //android.os.Process.killProcess(android.os.Process.myPid());
  }

  toggleAudio(){
    this.game.toggleAudio();
  }

  isAudioEnabled(){
    return this.game.isAudioEnabled();
  }

  isTutorialPlayed(){
      return this.game.isTutorialPlayed();
  }
}
