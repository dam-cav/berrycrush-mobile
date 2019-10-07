import { Component} from "@angular/core";
import { GameService } from "./game.service";
import { device } from 'tns-core-modules/platform';
import * as application from "tns-core-modules/application";
import { android as androidApp, AndroidApplication } from "tns-core-modules/application";
import { enableProdMode } from '@angular/core';

enableProdMode();

declare var android: any;

@Component({
    selector: "ns-app",
    moduleId: module.id,
    templateUrl: "./app.component.html"
})
export class AppComponent {
    constructor(private game: GameService) {
        this.initializeApp();

        /* Forza l'app a rimanere fullscreen*/
        if(androidApp && device.sdkVersion >= '21'){
            androidApp.on(AndroidApplication.activityStartedEvent, (args: application.AndroidActivityEventData) => {
                console.log("Event: " + args.eventName + ", Activity: " + args.activity);
                const View = android.view.View;
                const window = androidApp.startActivity.getWindow();
                const decorView = window.getDecorView();
                decorView.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_FULLSCREEN |
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                );

                this.game.playBgMusic();
            });
        }

        androidApp.on(AndroidApplication.activityPausedEvent, (args: application.AndroidActivityEventData) => {
            console.log("Event: " + args.eventName + ", Activity: " + args.activity);
            this.game.pauseBgMusic();
        });
    }

    async initializeApp() {
        await Promise.all([
            this.game.loadSave(),
            this.game.loadAllSounds(),
        ]).then(() => {
            this.game.playBgMusic('bg');
        });
    }
}
