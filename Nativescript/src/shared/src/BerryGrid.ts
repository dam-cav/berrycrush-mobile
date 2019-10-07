import Berry from './Berry';
import BerryDex, {defaultBerries} from './BerryDex';
import { Direction } from './Direction';
import Grid, { Coord } from './Grid';

const directionMap = {
	[Direction.up]: { x: 0, y: -1 },
	[Direction.down]: { x: 0, y: 1 },
	[Direction.left]: { x: -1, y: 0 },
	[Direction.right]: { x: 1, y: 0 },
};

const directionArray = [Direction.up, Direction.down, Direction.left, Direction.right];

export default class BerryGrid {
	private grid: Grid<Berry>;
	private dex: BerryDex;

	constructor(g: Grid<Berry>, dex: BerryDex) {
		this.dex = dex;
		this.grid = g;
	}

	reset() {
		let destroy: number = 1;
		this.shuffle();
		while (destroy > 0 ) {
			destroy = this.searchAndDestroy().length;
			this.compact();
			this.refillBerry();
		}
		if (!this.isGridSolvable()) { this.reset(); }
	}

	shuffle() {
		this.fillNoBerry();
		this.refillBerry();
	}

	fillNoBerry() {
		this.grid.forEach((berry, { x, y }) => {
			this.grid.set(x, y, Berry.noBerry);
		});
	}

	canMoveBerry(xpos: number, ypos: number, dir: Direction): boolean {
		let otherPosX = xpos;
		let otherPosY = ypos;

		if (directionMap[dir].x !== 0) {
			otherPosX += directionMap[dir].x;
		} else { otherPosY += directionMap[dir].y; }

		if (this.grid.has(otherPosX, otherPosY)) {
			// scambia temporaneamente
			const tempB: Berry = this.grid.get(xpos, ypos);
			this.grid.set(xpos, ypos, this.grid.get(otherPosX, otherPosY));
			this.grid.set(otherPosX, otherPosY, tempB);

			// controlla se si distrugge qualcosa contando i vicini della berry toccata
			const vSeries = 1
				+ this.countNeighbour(xpos, ypos, this.grid.get(xpos, ypos).getColor(), Direction.up)
				+ this.countNeighbour(xpos, ypos, this.grid.get(xpos, ypos).getColor(), Direction.down);
			// ^controlla solo la somma tra su e giu+1
			const hSeries = 1
				+ this.countNeighbour(xpos, ypos, this.grid.get(xpos, ypos).getColor(), Direction.right)
				+ this.countNeighbour(xpos, ypos, this.grid.get(xpos, ypos).getColor(), Direction.left);
			// ^controlla solo la somma tra sinistra e destra+1

			// controlla su quella scambiata
			const otherVSeries = 1
				+ this.countNeighbour(otherPosX, otherPosY, this.grid.get(otherPosX, otherPosY).getColor(), Direction.up)
				+ this.countNeighbour(otherPosX, otherPosY, this.grid.get(otherPosX, otherPosY).getColor(), Direction.down);
			// ^controlla solo la somma tra su e giu+1
			const otherHSeries = 1
				+ this.countNeighbour(otherPosX, otherPosY, this.grid.get(otherPosX, otherPosY).getColor(), Direction.right)
				+ this.countNeighbour(otherPosX, otherPosY, this.grid.get(otherPosX, otherPosY).getColor(), Direction.left);
			// ^controlla solo la somma tra sinistra e destra+1

			// riporta la griglia allo stato iniziale
			this.grid.set(otherPosX, otherPosY, this.grid.get(xpos, ypos));
			this.grid.set(xpos, ypos, tempB);
			return vSeries >= 3 || hSeries >= 3 || otherVSeries >= 3 || otherHSeries >= 3;
		}
		return false;
	}

	moveBerry(xpos: number, ypos: number, dir: Direction): void {
		// calcolo posizione altra berry
		let otherPosX = xpos;
		let otherPosY = ypos;
		if (directionMap[dir].x !== 0) {
			otherPosX += directionMap[dir].x;
		} else {
			otherPosY += directionMap[dir].y;
		}

		// scambia
		const tempB: Berry = this.grid.get(xpos, ypos);
		this.grid.set(xpos, ypos, this.grid.get(otherPosX, otherPosY));
		this.grid.set(otherPosX, otherPosY, tempB);
	}

	/**
	* Conta i vicini nella direzione indicata.
	*/
	countNeighbour(xpos: number, ypos: number, color: string, dir: Direction): number {
		let stepN: number = 0;
		let otherCord: number;
		if (directionMap[dir].x !== 0) {
			otherCord = xpos + directionMap[dir].x;
			while (
				this.grid.has(otherCord, ypos) && this.grid.get(otherCord, ypos).getColor() === color
				&& this.grid.get(otherCord, ypos) !== Berry.noBerry
			) {
				stepN++;
				otherCord += directionMap[dir].x;
			}
		} else {
			otherCord = ypos + directionMap[dir].y;
			while (
				this.grid.has(xpos, otherCord) && this.grid.get(xpos, otherCord).getColor() === color
				&& this.grid.get(xpos, otherCord) !== Berry.noBerry
			) {
				stepN++;
				otherCord += directionMap[dir].y;
			}
		}
		return stepN;
	}

	/**
	* Sostituisce le berry con una noberry incolore non nelle coordinate ricevute ma solo nella direzione indicata
	*/
	destroyNeighbour(xpos: number, ypos: number, dir: Direction): number {
		let stepN: number = 0;
		let otherCord: number;
		if (directionMap[dir].x !== 0) {
			otherCord = xpos + directionMap[dir].x;
			while (
				this.grid.has(otherCord, ypos)
				&& this.grid.get(otherCord, ypos).getColor() === this.grid.get(xpos, ypos).getColor()
			) {
				this.grid.set(otherCord, ypos, Berry.noBerry);
				stepN++;
				otherCord += directionMap[dir].x;
			}
		} else {
			otherCord = ypos + directionMap[dir].y;
			while (
				this.grid.has(xpos, otherCord)
				&& this.grid.get(xpos, otherCord).getColor() === this.grid.get(xpos, ypos).getColor()
			) {
				this.grid.set(xpos, otherCord, Berry.noBerry);
				stepN++;
				otherCord += directionMap[dir].y;
			}
		}
		return stepN;
	}

	isSolvableFrom(xpos: number, ypos: number): boolean {
		let hope: boolean = false;
		let dritto: number;
		let lati: number;

		for (let i = 0; i < directionArray.length && !hope; i++) {
			lati = 0;
			dritto = this.countNeighbour(
				xpos + directionMap[directionArray[i]].x,
				ypos + directionMap[directionArray[i]].y,
				this.grid.get(xpos, ypos).getColor(), directionArray[i],
			);

			const berryColor = this.grid.get(xpos, ypos).getColor();

			if (directionMap[directionArray[i]].x === 0) {
				if (this.grid.has(xpos, ypos + directionMap[directionArray[i]].y)) {
					lati = this.countNeighbour(xpos, ypos + directionMap[directionArray[i]].y, berryColor, Direction.left)
						+ this.countNeighbour(xpos, ypos + directionMap[directionArray[i]].y, berryColor, Direction.right);
				}
			} else {
				if (this.grid.has(xpos + directionMap[directionArray[i]].x, ypos)) {
					lati = this.countNeighbour(xpos + directionMap[directionArray[i]].x, ypos, berryColor, Direction.up)
						+ this.countNeighbour(xpos + directionMap[directionArray[i]].x, ypos, berryColor, Direction.down);
				}
			}
			if (dritto >= 2 || lati >= 2) { hope = true; }
		}
		return hope;
	}

	isGridSolvable(): boolean {
		return !!this.grid.find((berry, { x, y }) => {
			return this.isSolvableFrom(x, y);
		});
	}

	/**
	* Abbassa tutte le berry per gravità
	*/
	compact(): boolean {
		let nGravity: number = 0; // per sapere se ho effettivamente abbassato qualcuno per gravità
		let step: number;
		let colored: number = 0; // numero di colorati sopra ai noberry
		// abbassa le berry
		for (let i = 0; i < this.getColN(); i++) {
			step = 1;
			while (step < this.getRowN()) {
				if (this.grid.get(i, this.getRowN() - step) === Berry.noBerry) {

					colored = 0;
					for (let j = this.getRowN() - step; j >= 0; j--) {
						if (this.grid.get(i, j) !== Berry.noBerry) { colored++; }
					}

					for (let j = this.getRowN() - step; j > 0; j--) {
						this.grid.set(i, j, this.grid.get(i, j - 1));
						this.grid.set(i, j - 1, Berry.noBerry);
					}
					if (colored > 0 && this.grid.get(i, this.getRowN() - step) === Berry.noBerry) { step--; }

					nGravity++;
				}
				step++;
			}
		}
		return nGravity > 0;
	}

	searchAndDestroy(): Coord[] {
		let points: Coord[] = [];
		const destroyed: Coord[] = [];

		// Conta spazi vuoti come distrutte; es. da powerup
		this.grid.forEach((berry, coord) => {
			if (berry === Berry.noBerry) {
				destroyed.push(coord);
			}
		});

		this.grid.forEach((berry, coord) => {
			if (berry !== Berry.noBerry) {
				points = points.concat(this.destroyList(coord.x, coord.y));
			}
		});

		points.forEach(({ x, y }) => {
			if (this.grid.get(x, y) !== Berry.noBerry) {
				this.grid.set(x, y, Berry.noBerry);
				destroyed.push({x, y});
			}
		});

		return destroyed;
	}

	destroyList(x: number, y: number): Coord[] {
		const points = [];
		const su = this.countNeighbour(x, y, this.grid.get(x, y).getColor(), Direction.up);
		const giu = this.countNeighbour(x, y, this.grid.get(x, y).getColor(), Direction.down);
		const dx = this.countNeighbour(x, y, this.grid.get(x, y).getColor(), Direction.right);
		const sx = this.countNeighbour(x, y, this.grid.get(x, y).getColor(), Direction.left);

		if (su + giu  >= 2) {
			for (let i = su; i > 0; i--) {
				points.push({x, y: y - i});
			}
			for (let i = giu; i > 0; i--) {
				points.push({x, y: y + i});
			}
		}
		if (sx + dx >= 2) {
			for (let i = sx; i > 0; i--) {
				points.push({x: x - i, y});
			}
			for (let i = dx; i > 0; i--) {
				points.push({x: x + i, y});
			}
		}
		if (su + giu  >= 2 || sx + dx >= 2) { points.push({x, y}); }
		return points;
	}

	/**
	* Cerca noBerry e le sostituisce con Berry casuali
	*/
	refillBerry() {
		let step: number;

		// refilla i noberry
		for (let i = 0; i < this.getColN(); i++) {
			step = 0;
			while (step < this.getRowN() && this.grid.get(i, step) === Berry.noBerry) {
				this.grid.set(i, step, this.dex.getRandom());
				step++;
			}
		}
	}

	// usata da powerup 'switcher'
	changeColors() {
		const nquantity = new Map<Berry, number>();
		let q;
		let n: Berry;

		this.grid.forEach((berry, coord) => {
			n = this.grid.get(coord.x, coord.y);
			q = nquantity.get(n);
			if (q) {
				nquantity.set(n, q + 1);
			} else {
				nquantity.set(n, 1);
			}
		});

		let minb = Berry.noBerry;
		let maxb = Berry.noBerry;
		let minq = this.grid.getRowN() * this.grid.getColN();
		let maxq = 0;

		nquantity.forEach((value: number, key: Berry) => {
				if (value < minq) {minb = key; minq = value; }
				if (value > maxq) {maxb = key; maxq = value; }
			},
		);

		this.grid.forEach((berry, coord) => {
			if (this.grid.get(coord.x, coord.y) === minb) {
				this.grid.set(coord.x, coord.y, maxb);
			}
		});
	}

	// usata da powerup 'destroyer'
	randomDestroy(): Coord[] {
		const nDestroy = Math.floor((this.grid.getColN() + this.grid.getRowN()) / 1.8);
		const randomCoords = Array(nDestroy).fill(1).map(() => ({
			x: Math.round(Math.random() * this.grid.getColN()),
			y: Math.round(Math.random() * this.grid.getRowN()),
		}));

		randomCoords.forEach((coord) => this.grid.set(coord.x, coord.y, Berry.noBerry));

		return randomCoords;
	}

	getGrid(): Grid<Berry> {
		return this.grid;
	}

	getColN() {
		return this.grid.getColN();
	}

	getRowN() {
		return this.grid.getRowN();
	}

	toString(): string {
		let output = '   ';

		for (let x = 0; x < this.grid.getColN(); ++x) {
			output += `${x} `;
		}
		output += '\n';

		for (let y = 0; y < this.grid.getRowN(); ++y) {
			const row = this.grid.getRow(y);
			output += ` ${y} `;

			for (const berry of row) {
				output += `${berry.getName().charAt(0)} `;
			}

			output += '\n';
		}

		return output;
	}
}
