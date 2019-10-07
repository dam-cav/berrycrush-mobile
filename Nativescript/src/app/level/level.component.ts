import { Component, OnInit, OnDestroy } from "@angular/core";
import Berry from "~/shared/src/Berry";
import { ActivatedRoute, Router } from "@angular/router";
import { android as androidApp, AndroidApplication } from "tns-core-modules/application";
import { GameService } from "../game.service";
import { RouterExtensions } from 'nativescript-angular/router';
import * as application from "tns-core-modules/application";
import SLevelPage from "~/shared/angular/level.page";

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

@Component({
    selector: "ns-level",
    moduleId: module.id,
    styleUrls: ['./level.component.css'],
    templateUrl: "./level.component.html"
})
export class LevelComponent extends SLevelPage implements OnInit, OnDestroy {
    
    leaving: number;
    berrys: Berry[] = [];
    gCol: number;
    gRow: number;

    constructor(private route: ActivatedRoute,
        private router: Router,
        game: GameService,
        private routerExtensions: RouterExtensions
        ) {
        super(game);
        androidApp.on(AndroidApplication.activityPausedEvent, (args) => {
            this.game.pause();
        });
    }

    ngOnInit() {
        this.leaving = 0;
        let levelId;
        try {
            this.route.queryParams.subscribe(params => {
                levelId = params["level"];
            }); 
            if (!levelId) {
              throw new Error('nessun levelid');
            }
            this.loadLevel(levelId);
            this.levelId = levelId;
        } catch (err) {
            console.error(err);
            this.router.navigate(['/level-selection']);
            return;
        }
      
        this.afterInit();

        this.gRow = this.grid.getRowN();
        this.gCol = this.grid.getColN();

        this.changeBackBehaviour();
    }

    protected updateBerryGrid(){
        this.berrys = [];
        for(let i=0;i<this.grid.getGrid().getRowN();i++){
            for(let j=0;j<this.grid.getGrid().getColN();j++){
                this.berrys.push(this.grid.getGrid().get(j,i));
            }
        }
    }

    //cambio comportamento tasto back
    private changeBackBehaviour(){
        if (androidApp) {
            application.android.on(application.AndroidApplication.activityBackPressedEvent, (args: any) => {
                args.cancel = true;
                this.pause();
            });
        }
    }

    exit(){
        if (androidApp) application.android.foregroundActivity.finish();
        //android.os.Process.killProcess(android.os.Process.myPid());
    }

    toLevelSelection(){
        this.routerExtensions.navigate(["levelselection/"]);
    }

    wayToLeave(how:number){
        this.leaving=how;
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