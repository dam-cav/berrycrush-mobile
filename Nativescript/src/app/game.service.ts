import { Injectable } from '@angular/core';
import * as appSettings from "tns-core-modules/application-settings";
import SGameService, { sfxNamesList, bgmNamesList, BGMNames, SFXNames } from '~/shared/angular/game.service';
import Sound from './sound';
import { android as androidApp, AndroidApplication, AndroidActivityBundleEventData } from "tns-core-modules/application";
import * as application from "tns-core-modules/application";

interface Sounds {
    [name: string]: Sound;
}

@Injectable({
    providedIn: 'root'
})
export class GameService extends SGameService {
    private sfx: Sounds = {};
    private bgm: Sounds = {};

    /**
    * Salva il gioco su storage
    */
    async writeSave(){
        appSettings.setString("save", JSON.stringify(this.exportSaveToJSON()));
    }

    /**
    * Carica il gioco da storage
    */
    async loadSave(){
        let data;
        data = appSettings.getString("save");
        if(data) this.importSaveFromJSON(JSON.parse(data));
    }

    async playBgMusic(name?: BGMNames) {
        if (!this.isAudioEnabled()) {
            return;
        }

        name = name || 'bg';
        if (name) {
            await super.playBgMusic(name);
            this.bgm[name].play();
        }
    }

    async pauseBgMusic() {
        super.pauseBgMusic();
        this.bgm['bg'].stop();
    }

    async playSFX(name: SFXNames) {
        if (!this.isAudioEnabled()) {
            return;
        }

        super.playSFX(name);
        await this.sfx[name].play();
    }

    async stopAllSFX() {
        super.stopAllSFX();
        await Promise.all(sfxNamesList.map((name) => this.sfx[name].stop()));
    }

    async loadAllSounds() {
        sfxNamesList.forEach((name) => {
            try {
                this.sfx[name] = Sound.create(`~/shared/resources/sounds/${name}.wav`);
            } catch (err) {
                console.error(err);
            }
        });

        bgmNamesList.forEach((name) => {
            try {
                this.bgm[name] = Sound.create(`~/shared/resources/sounds/${name}.ogg`, true);
            } catch (err) {
                console.error(err);
            }
        });
    }
}
