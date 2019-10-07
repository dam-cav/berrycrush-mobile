export default class Monster {
	private name: string;
	private maxHunger: number;
	private actHunger: number;

	constructor(name: string, maxHunger: number) {
		this.name = name;
		this.maxHunger = maxHunger;
		this.actHunger = maxHunger;
		this.reset();
	}

	reset() {
		this.actHunger = this.maxHunger;
	}

	getName() {
		return this.name;
	}

	reduceHunger(bNumber: number): number {
		if (bNumber > 2) { this.actHunger -= bNumber - 2; }
		if (this.actHunger < 0) { this.actHunger = 0; }
		return this.actHunger;
	}

	getMaxHunger() {
		return this.maxHunger;
	}

	getActHunger() {
		return this.actHunger;
	}
}
