import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NativeAudio } from '@ionic-native/native-audio/ngx';

import SGameService, { bgmNamesList, sfxNamesList, SFXNames, BGMNames } from 'src/shared/angular/game.service';

export interface Scoreboard {
  moves: number;
  time: number;
  monsterName: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService extends SGameService {
  private currentBgm: BGMNames = 'bg';

  constructor(
    private storage: Storage,
    private nativeAudio: NativeAudio,
  ) {
    super();
  }

  quitApp() {
    if ((navigator as any).app) {
      (navigator as any).app.exitApp();
    }
    this.writeSave();
    this.stopAllSFX();
    this.pauseBgMusic();
  }

  async loadSave() {
    await this.storage.ready();

    console.log('loading save...');

    try {
      const data = await this.storage.get('save');
      this.importSaveFromJSON(JSON.parse(data));
    } catch (err) {
      console.warn('no previous save found:', err);
    }

    this.writeSave();
  }

  async writeSave() {
    console.log('writing save...');
    try {
      await this.storage.set('save', JSON.stringify(this.exportSaveToJSON()));
    } catch (err) {
      console.error('failed writing save:', err);
    }
  }

  async playSFX(name: SFXNames): Promise<void> {
    if (!this.isAudioEnabled()) {
      return;
    }

    return this.nativeAudio.play(name);
  }

  async stopAllSFX(): Promise<any> {
    super.stopAllSFX();
    return Promise.all(sfxNamesList
      .map((name) => this.nativeAudio.stop(name)));
  }

  async playBgMusic(name?: BGMNames): Promise<void> {
    if (!this.isAudioEnabled()) {
      return;
    }

    super.playBgMusic(name);

    // Se name settato: sostituisci attuale o riprendi
    if (name) {
      if (name !== this.currentBgm) {
        await this.nativeAudio.stop(this.currentBgm);
        this.nativeAudio.loop(name);
        this.currentBgm = name;
      } else {
        this.nativeAudio.loop(name);
      }
      // Se name non settato, riprendi attuale
    } else {
      this.nativeAudio.loop(this.currentBgm);
    }
  }

  async pauseBgMusic(): Promise<void> {
    super.pauseBgMusic();
    this.nativeAudio.stop(this.currentBgm);
  }

  async loadAllSounds() {
    console.log('loading all sounds...');

    sfxNamesList.forEach(async (name) => {
      try {
        await this.nativeAudio.preloadSimple(name, `assets/sounds/${name}.wav`);
      } catch (err) {
        console.error('failed create sfx', name, 'because:', err);
      }
    });

    bgmNamesList.forEach(async (name) => {
      try {
        await this.nativeAudio.preloadComplex(name, `assets/sounds/${name}.ogg`, 0.9, 1, 0);
      } catch (err) {
        console.error('failed create bgm', name, 'because:', err);
      }
    });
  }
}
