/**
 * Cronometro. Utilizzato per tenere il tempo di gioco perchè può essere messo
 * in pausa e ripreso.
 */
export default class Stopwatch {
	private timeStart?: number;

	private totalPauseOffset: number;
	private pauseStart?: number;

	constructor() {
		this.totalPauseOffset = 0;
	}

	/**
	* Reset e start il cronometro.
	*/
	start(): void {
		this.timeStart = Date.now();
		this.pauseStart = undefined;
		this.totalPauseOffset = 0;
	}

	pause(): void {
		if (!this.isPaused()) {
			this.pauseStart = Date.now();
		}
	}

	continue(): void {
		this.totalPauseOffset += this.getCurrentPauseOffset();
		this.pauseStart = undefined;
	}

	isPaused() {
		return this.pauseStart !== undefined;
	}

	/**
	* Ottieni il tempo passato dallo start; in millisecondi
	*/
	getTime(): number {
		const offset = this.totalPauseOffset + this.getCurrentPauseOffset();
		const now = Date.now();
		return now - (this.timeStart || now) - offset;
	}

	private getCurrentPauseOffset() {
		if (this.isPaused()) {
			return Date.now() - (this.pauseStart || 0);
		}

		return 0;
	}
}
