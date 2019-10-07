export type PowerupName = 'shuffler' | 'switcher' | 'destroyer';

export default class PowerupDex {
	private powerups: PowerupName[] = ['shuffler', 'switcher', 'destroyer'];

	getRandom(): PowerupName | undefined {
		return this.powerups[this.getRandomIndex()];
	}
	private getRandomIndex(): number {
		return Math.floor(Math.random() * this.powerups.length);
	}
}
