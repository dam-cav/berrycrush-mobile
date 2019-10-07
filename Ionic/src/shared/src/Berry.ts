export enum BerryColor {
	Green = 'green',
	Magenta = 'magenta',
	Red = 'red',
	Yellow = 'yellow',
	Azure = 'aqua',
	Empty = 'transparent',
	Purple = '#663399',
}

export default class Berry {
	static noBerry = new Berry('x', BerryColor.Empty);

	private color: string;
	private name: string;

	constructor(name: string, color: string) {
		this.name = name;
		this.color = color;
	}

	getColor() {
		return this.color;
	}

	getName() {
		return this.name;
	}
}
