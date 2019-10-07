import { Component, OnDestroy, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { AndroidFullScreen } from '@ionic-native/android-full-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { HeaderColor } from '@ionic-native/header-color/ngx';

import { GameService } from './game.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnDestroy, OnInit {
  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private androidFullScreen: AndroidFullScreen,
    private headerColor: HeaderColor,
    private game: GameService,
  ) {}

  ngOnDestroy() {
    this.game.quitApp();
  }

  ngOnInit() {
    // this.fullscreen();

    // config.xml:BackgroundColor
    this.headerColor.tint('#82cf20');

    // this.platform.backButton.subscribeWithPriority(1000, () => {
    //   console.log('back button');
    //   this.game.pause();
    // });

    /**
     * Quando l'app perde il focus (es. switch app), mette in pausa il gioco,
     * cosicchè se si sta giocando un livello impedisce al tempo di gioco di
     * avanzare.
     */
    this.platform.pause.subscribe(() => {
      this.game.pause();
    });

    /**
     * Quando l'app riprende il focus, mette in pausa, cosicchè se si sta
     * giocando un livello, impedisce che il tempo di gioco di avanzare e lascia
     * il tempo all'utente per riprendere quando vuole.
     */
    this.platform.resume.subscribe(() => {
      this.game.pause();

      // Qualche volta, riprendendo l'app, non va in immersive mode, quindi
      // riprovo a mandarla in fullscreen
      this.fullscreen();
    });

    return Promise.all([
      this.platform.ready(),
      this.game.loadAllSounds(),
      this.game.loadSave(),
    ]).then(() => {
      this.fullscreen();
      this.splashScreen.hide();
      this.game.playBgMusic('bg');
    });
  }

  fullscreen() {
    // Per ottenere fullscreen in iOS
    if (this.statusBar.isVisible) {
      this.statusBar.hide();
      this.statusBar.overlaysWebView(false);
    }

    // API https://github.com/mesmotronic/cordova-plugin-fullscreen
    // Android 5.0+
    this.androidFullScreen.isImmersiveModeSupported()
      .then(() => this.androidFullScreen.immersiveMode())
      .catch(err => console.warn('Immersive mode not supported:', err));
  }
}
