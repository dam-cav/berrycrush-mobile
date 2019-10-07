import Berry, { BerryColor } from './Berry';

export const defaultBerries = [
	new Berry('magost', BerryColor.Magenta),
	new Berry('razz', BerryColor.Red),
	new Berry('pinap', BerryColor.Yellow),
	new Berry('yache', BerryColor.Azure),
	new Berry('wepear', BerryColor.Green),
	new Berry('wiki', BerryColor.Purple),
];

export default class BerryDex {
	private entry: Berry[];

	constructor(berries: Berry[] = []) {
		this.entry = berries;
	}

	add(b: Berry) {
		this.entry.push(b);
	}

	pop() {
		this.entry.pop();
	}

	randomRemove() {
		if (this.entry.length > 0) {
			this.entry.splice(this.getRandomIndex(), 1);
		}
	}

	size(): number {
		return this.entry.length;
	}

	getRandom(): Berry {
		if (this.entry.length > 0) {
			return this.entry[this.getRandomIndex()];
		}

		return Berry.noBerry;
	}

	private getRandomIndex(): number {
		return Math.floor(Math.random() * this.entry.length);
	}
}
