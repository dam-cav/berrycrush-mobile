import { OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import Monster from '../src/Monster';
import Stopwatch from '../src/Stopwatch';
import Grid, { Coord } from '../src/Grid';
import BerryGrid from '../src/BerryGrid';
import SGameService from './game.service';
import BerryDex from '../src/BerryDex';
import LevelList from '../src/LevelList';
import { Direction } from '../src/Direction';
import PowerupDex, { PowerupName } from '../src/PowerupDex';

const comboMessages = [
  'Mmmh che buone!',
  'Ci sai fare con le bacche.',
  'Senti la pancia come brontola!',
  'Gnam gnam!',
  'Ottima scelta, mi piacciono queste bacche.',
  'Che combo!',
];

enum ResolveGridTrigger {
  MOVE,
  POWER,
  OTHER,
}

/**
 * Polyfill della libreria `delay`, perchè non viene compilata correttamente
 * con webpack per ionic.
 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default abstract class SLevelPage implements OnDestroy {
  gameLoop?: any;
  game: SGameService;

  levelId: string;
  monster: Monster;
  grid: BerryGrid;
  readypower?: PowerupName;
  moves = 0;
  stopwatch = new Stopwatch();
  time = 0;
  message = '';
  monsterHunger = 1;
  monsterName = '';
  lastDestroyedCoords: Coord[] = [];
  lockUserInput = false;
  animationDelay = 300;
  completed = false;
  levelPaused = false;
  isNewRecord = false;

  isTutorial = false;
  tutorialSteps: Array<() => Promise<void>> = [];
  // Indica l'elemento da evidenziare, per il tutorial
  highlight: 'grid' | 'scoreboard' | 'hungerbar' | 'powerup' | undefined;

  private pausedSubscription?: Subscription;
  private powers = new PowerupDex();
  private lastComboMessage?: string;

  constructor(
    game: SGameService,
  ) {
    this.game = game;

    this.levelId = 'loadinglevel';
    this.monster = new Monster('unknown', 0);
    this.grid = new BerryGrid(new Grid([]), new BerryDex());
  }

  afterInit() {
    this.start();

    this.pausedSubscription = this.game.paused.subscribe((paused) => {
      if (paused) {
        this.pause();
      } else {
        this.continue();
      }
    });

    this.gameLoop = setInterval(() => {
      this.time = this.stopwatch.getTime();
    }, 200);
  }

  ngOnDestroy() {
    // Ferma suoni ancora in corso del livello, es. vittoria
    this.game.stopAllSFX();

    if (this.pausedSubscription) {
      this.pausedSubscription.unsubscribe();
    }

    clearInterval(this.gameLoop);
    this.gameLoop = undefined;

    this.levelPaused = true;
  }

  /**
   * @throws {Error} se il livello `levelId` non è presente in LevelList
   * @param levelId
   */
  loadLevel(levelId: string) {
    const { monster, berryGrid } = LevelList.createMonsterLevel(levelId);

    this.levelId = levelId;
    this.grid = berryGrid;
    this.monster = monster;
    this.monsterName = this.monster.getName();
  }

  /**
	 * Avvia il livello. Resetta tutto lo stato.
	 */
  start() {
    this.lockUserInput = false;

    this.game.stopAllSFX();
    this.completed = false;
    this.isNewRecord = false;
    this.time = 0;
    this.moves = 0;
    this.grid.reset();
    this.updateBerryGrid();
    this.monster.reset();
    this.updateMonsterHunger();
    this.readypower = this.game.getStockedPowerup();

    if (this.levelId === 'tutorial') {
      this.startTutorial();
    }

    setTimeout(() => {
      this.stopwatch.start();
    }, 500);
  }

  restart() {
    this.start();
  }

  /**
	 * Mette in pausa il livello
	 */
  pause() {
    this.lockUserInput = true;

    this.stopwatch.pause();
    this.levelPaused = true;
  }

  /**
	 * Riprende dalla pausa il livello
	 */
  continue() {
    this.lockUserInput = false;

    this.stopwatch.continue();

    if (this.levelPaused) {
      this.levelPaused = false;
      this.resolveGrid();
    }
  }

  async onTriedMoveBerry(event: { x: number, y: number, dir: Direction }) {
    if (this.lockUserInput || this.completed) {
      return;
    }

    const { x, y, dir } = event;

    this.lockUserInput = true;

    if (this.grid.canMoveBerry(x, y, dir)) {
      this.moves += 1;
      this.grid.moveBerry(x, y, dir);
      this.updateBerryGrid();
      await delay(this.animationDelay);
      await this.resolveGrid(ResolveGridTrigger.MOVE);
    } else {
      this.game.playSFX('moveFailed');
      console.error('level.page/onTriedMoveBerry: cannot move', event);
    }

    this.lockUserInput = false;
  }

  async onTriedPowerup() {
    if (this.lockUserInput || this.completed || !this.readypower) {
      return;
    }

    this.lockUserInput = true;

    this.game.playSFX('powerup');
    this.usePower(this.readypower);
    this.readypower = undefined;
    await delay(this.animationDelay - 100);

    await this.resolveGrid(ResolveGridTrigger.POWER);

    this.lockUserInput = false;
  }

  async resolveGrid(trigger = ResolveGridTrigger.OTHER) {
    this.lockUserInput = true;

    // utile per continue() quando non ci sono bacche da distruggere
    let levelCompleted = this.checkLevelCompleted();
    let destroyedBerries = this.destroyBerries();
    let totalDestroyedBerries = destroyedBerries;

    while (!levelCompleted && !this.levelPaused && destroyedBerries > 0) {
      this.game.playSFX('berryDestroy');
      await delay(this.animationDelay);

      // Pulisce array berry distrutte precedentemente;
      // previene animazioni su berry sbagliate, dopo compact/refill
      this.lastDestroyedCoords = [];

      this.grid.compact();
      this.updateBerryGrid();
      await delay(this.animationDelay + 100);

      this.grid.refillBerry();
      this.updateBerryGrid();
      await delay(this.animationDelay - 100);

      levelCompleted = this.checkLevelCompleted();
      destroyedBerries = this.destroyBerries();
      totalDestroyedBerries += destroyedBerries;
    }

    if (levelCompleted && !this.levelPaused) {
      return this.onLevelCompleted();
    }

    // Resetto il messaggio, se non è nel tutorial
    if (!this.isTutorial) {
      this.message = '';
    }

    // 5+: croci dello stesso colore
    // 6+: doppie triple al move o durante refill/compact
    if (trigger === ResolveGridTrigger.MOVE && totalDestroyedBerries >= 5) {
      this.message = this.getRandomComboMessage();
      if (!this.readypower) {
        this.readypower = this.powers.getRandom();
        this.message += ' Eccoti un potere.';
      }
    }

    if (!this.grid.isGridSolvable()) {
      this.grid.reset();
      this.updateBerryGrid();
    }

    this.lockUserInput = false;
  }

  protected abstract updateBerryGrid(): void;

  private destroyBerries(): number {
    const destroyed = this.grid.searchAndDestroy();
    this.lastDestroyedCoords = destroyed;
    this.monster.reduceHunger(destroyed.length);
    this.updateMonsterHunger();

    return destroyed.length;
  }

  private checkLevelCompleted(): boolean {
    // Il mostro non ha più fame
    return this.monster.getActHunger() <= 0;
  }

  private onLevelCompleted() {
    this.lockUserInput = true;

    this.game.playSFX('victory');
    this.completed = true;
    this.stopwatch.pause();

    // Salva il powerup corrente, o lo rimuove se non ce ne più nessuno
    if (this.readypower && !this.isTutorial) {
      this.game.stockPowerup(this.readypower);
    } else {
      this.game.removeStockedPowerup();
    }

    this.game.setTutorialPlayed();

    this.isNewRecord = this.game.setLevelBestScore(this.levelId, {
      moves: this.moves,
      time: this.time,
    });

    this.game.unlockNextLevel();

    // Salva il nuovo score e eventuali powerup
    this.game.writeSave();
  }

  private updateMonsterHunger() {
    this.monsterHunger = this.monster.getActHunger() / this.monster.getMaxHunger();
  }

  private usePower(powerup: PowerupName) {
    switch (powerup) {
      case 'shuffler':
        this.grid.shuffle();
        this.updateBerryGrid();
        break;
      case 'switcher':
        this.grid.changeColors();
        this.updateBerryGrid();
        break;
      case 'destroyer':
        this.lastDestroyedCoords = this.grid.randomDestroy();
        break;
    }
  }

  nextTutorialStep() {
    const step = this.tutorialSteps.shift();
    if (step) {
      step();
    }
  }

  private startTutorial() {
    this.isTutorial = true;
    this.readypower = undefined;
    this.highlight = undefined;
    this.lockUserInput = true;

    this.tutorialSteps = [
      async () => {
        this.message = 'Ciao! Io sono Barosa e ti spiegherò come funziona BerryCrush.';
      },
      async () => {
        this.message = 'Noi mostri abbiamo molta fame, ma siamo capricciosi e mangiamo solo 3 o più bacche uguali.';
        this.highlight = 'hungerbar';
      },
      async () => {
        this.message = 'Vedo che i contadini ti hanno dato queste bacche, sembrano molto buone...';
        this.highlight = 'grid';
      },
      async () => {
        this.lockUserInput = false;
        this.message = 'Trascina il dito per scambiare 2 bacche fra loro e creare una fila.';
        this.highlight = 'grid';
      },
      async () => {
        this.message = 'Se sei così bravo da metterne tante in fila, ti regalerò un potere. Prova questo!';
        this.readypower = 'destroyer';
        this.highlight = 'powerup';
      },
      async () => {
        this.message = 'Potrai avere solo un potere alla volta, ma lo terrai nei prossimi livelli.';
        this.highlight = 'powerup';
      },
      async () => {
        this.message = 'Mangiando tante bacche la mia fame diminuisce e sono più felice.';
        this.highlight = 'hungerbar';
      },
      async () => {
        this.message = 'Quando la mia pancia sarà piena ti lascerò andare avanti.';
        this.highlight = 'hungerbar';
      },
      async () => {
        this.message = 'Ah già, qui vedi il numero di mosse fatte e quanto tempo è passato. '
          + 'Prova a battere i tuoi record!';
        this.highlight = 'scoreboard';
      },
      async () => {
        this.message = 'Bene, ora... ho fame! Scambia le bacche e crea delle file di 3 o più bacche.';
        this.highlight = undefined;
      },
    ];

    this.nextTutorialStep();
  }

  private getRandomComboMessage(): string {
    let message = this.lastComboMessage;
    let index = 0;

    do {
      index = Math.floor(Math.random() * comboMessages.length);
      message = comboMessages[index];
      // Scegli un messaggio random diverso dall'ultimo
    } while (comboMessages[index] === this.lastComboMessage);

    this.lastComboMessage = message;
    return message;
  }
}
