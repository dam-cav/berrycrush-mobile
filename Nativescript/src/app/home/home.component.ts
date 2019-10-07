import { Component, OnInit } from '@angular/core';
import { android as androidApp } from 'tns-core-modules/application';
import { RouterExtensions } from 'nativescript-angular/router';
import * as application from "tns-core-modules/application";
import { GameService } from '../game.service';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'ns-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  moduleId: module.id,
})
export class HomeComponent implements OnInit {

  constructor(private routerExtensions: RouterExtensions, private game: GameService,) { }

  ngOnInit() {
  }

  play(event: Event){
		this.routerExtensions.navigate(["levelselection/"]);
  }

  exit(){
    if (androidApp) application.android.foregroundActivity.finish();
    //android.os.Process.killProcess(android.os.Process.myPid());
  }

  toggleAudio(){
    this.game.toggleAudio();
  }

  openTutorial(){
    let navigationExtras: NavigationExtras = {
      queryParams: {
          "level": "tutorial",
      }
    };
    this.routerExtensions.navigate(["level/"], navigationExtras);
  }

  canReplayTutorial() {
    return this.game.isTutorialPlayed();
  }

  isAudioEnabled(){
    return this.game.isAudioEnabled();
  }
}