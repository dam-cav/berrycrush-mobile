import { Subject } from 'rxjs';
import LevelList from '../src/LevelList';
import { PowerupName } from '../src/PowerupDex';

export interface LevelSave {
  completed: boolean;
  bestMoves?: number;
  bestTime?: number;
}

interface LevelsSaves { [id: string]: LevelSave | undefined; }

interface SaveJSON {
  levels: LevelsSaves;
  audio: boolean;
  powerup?: PowerupName;
  tutorialPlayed: boolean;
}

export type SFXNames = 'victory' | 'berryDestroy' | 'powerup' | 'moveFailed';

export const sfxNamesList: SFXNames[] = ['victory', 'berryDestroy', 'powerup', 'moveFailed'];

/**
 * - 'bg' = musichetta dei menu;
 * - 'bgLevel' = musichetta durante livello, ma può essere uguale a 'bg' dei menù.
 */
export type BGMNames = 'bg';

export const bgmNamesList: BGMNames[] = ['bg'];

export default abstract class SGameService {
  private levels: LevelsSaves = {};
  private audio: boolean = true;
  private powerup?: PowerupName;
  private tutorialPlayed = false;

  /**
   * Canale ad eventi che serve per annunciare l'entrata o uscita dalla pausa,
   * ad esempio per `level.page`.
   */
  paused: Subject<boolean> = new Subject();

	/**
	 * Ottiene il salvataggio di un livello, se è già stato sbloccato.
	 */
  getLevel(id: string): LevelSave | undefined {
    return this.levels[id];
  }

	/**
	 * Riporta lo score al completamento di un livello, e lo salva come best score
	 * per il livello se migliori di quelli precedentemente salvati.
	 */
  setLevelBestScore(id: string, stats: { moves: number, time: number }): boolean {
    const level = this.getLevel(id);

    if (!level) {
      return false;
    }

    // Non salvare tempo minore di un secondo; moves negative
    // moves=0 vuole dire aver usato un powerup che ha giocato da solo
    if (stats.time < 1000 || stats.moves < 0) {
      return false;
    }

    const bestMoves = Math.min(level.bestMoves || Infinity, stats.moves);
    const bestTime = Math.min(level.bestTime || Infinity, stats.time);

    this.setLevel(id, {
      ...level,
      completed: true,
      bestMoves,
      bestTime,
    });

    // Se i valori best sono cambiati allora ho battuto il best score precedente
    return level.bestMoves !== bestMoves
      || level.bestTime !== bestTime;
  }

  stockPowerup(powerup: PowerupName) {
    this.powerup = powerup;
  }

  removeStockedPowerup() {
    this.powerup = undefined;
  }

  getStockedPowerup() {
    return this.powerup;
  }

  pause() {
    this.paused.next(true);
  }

  unpause() {
    this.paused.next(false);
  }

  isTutorialPlayed() {
    return this.tutorialPlayed;
  }

  setTutorialPlayed() {
    this.tutorialPlayed = true;
  }

  /**
   * Shortcut per setAudio, utile per la UI.
   * @returns true se l'audio è abilitato dopo il toggle; falso altrimenti
   */
  toggleAudio(): boolean {
    this.setAudio(!this.isAudioEnabled());
    return this.isAudioEnabled();
  }

  setAudio(enabled: boolean) {
    this.audio = enabled;

    if (this.isAudioEnabled()) {
      this.playBgMusic();
    } else {
      this.pauseBgMusic();
    }

    this.writeSave();
  }

  isAudioEnabled() {
    return this.audio;
  }

  /**
   * Esegue audio semplice, solitamente corto, per effetti sonori.
   * Se richiamata, riavvia l'audio dall'inizio (per evitare problemi di
   * multiple esecuzioni dello stesso audio).
   *
   * Deve onorare isAudioEnabled: se mutato, non esegue audio
   * @param name
   */
  async playSFX(name: SFXNames): Promise<void> {
    console.log('audio/sfx:', name, 'PLAY');
  }
  /**
   * Ferma tutti gli effetti sonori. Necessario per mute/unmute e fermare
   * i suoni a fine livello.
   */
  async stopAllSFX(): Promise<void> {
    console.log('audio/sfx:', 'STOP ALL');
  }

  /**
   * Esegue audio più complesso, come una musichetta lunga, in loop, da sfondo
   * al gioco.
   * Se chiama senza `name` riprende loop, se si era fermata.
   * Se chiama con `name` diverso dal corrente, ferma la corrente ed esegue
   * dall'inizio la nuova.
   *
   * Deve onorare isAudioEnabled: se mutato, non esegue audio
   * @param name
   */
  async playBgMusic(name?: BGMNames): Promise<void> {
    console.log('audio/bgm:', name || '<current bgm>', 'PLAY');
  }

  /**
   * Ferma tutto l'audio complesso, in loop, ed altro. Utile per mute/unmute.
   */
  async pauseBgMusic(): Promise<void> {
    console.log('audio/bgm: PAUSE');
  }

  // Da implementare singolarmente.
  // La lascio abstract perchè potremmo aggiungerla ad un init() comune.
  async loadAllSounds(): Promise<void> {
    console.log('loadAllSounds()...');
  }

	/**
	 * Sblocca il livello successivo all'ultimo livello giocato.
	 * @return `id` del livello sbloccato, o niente se nessun livello sbloccato
	 */
  unlockNextLevel(): string | undefined {
    const levels = LevelList.levels;

    // Sblocca sempre il primo livello
    const firstLevelId = levels[0].level;
    const firstLevel = this.getLevel(firstLevelId);
    if (!firstLevel) {
      this.setLevel(firstLevelId, { completed: false });
    }

    let i = levels.length - 1;
    while (i > 0) {
      const previousLevel = this.getLevel(levels[i - 1].level);
      if (previousLevel && previousLevel.completed) {
        const nextLevelId = levels[i].level;
        const nextLevel = this.getLevel(nextLevelId);

        // Evita di sbloccare ripetutamente l'ultimo livello
        if (nextLevel) {
          return;
        }

        this.setLevel(nextLevelId, { completed: false });
        this.writeSave();
        return nextLevelId;
        // Sblocchiamo solo un livello successivo, quindi termino ciclo
      }
      i--;
    }
  }

	/**
	 * Salva il gioco su storage
	 */
  abstract writeSave(): void;

	/**
	 * Carica il gioco da storage
	 */
  abstract loadSave(): void;

  protected importSaveFromJSON(save: SaveJSON) {
    this.levels = save.levels;
    this.audio = save.audio;
    this.powerup = save.powerup;
    this.tutorialPlayed = save.tutorialPlayed;
    // etc.
  }

  protected exportSaveToJSON(): SaveJSON {
    return {
      levels: this.levels,
      audio: this.audio,
      powerup: this.powerup,
      tutorialPlayed: this.tutorialPlayed,
    };
  }

  private setLevel(id: string, data: LevelSave) {
    this.levels[id] = data;
  }
}
