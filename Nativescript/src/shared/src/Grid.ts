export interface Coord {
	x: number;
	y: number;
}

export default class Grid<T> {

	private grid: T[][];

	/**
	 * Crea una grid con una certa dimensione pieni con l'elemento specificato.
	 * @param cols
	 * @param rows
	 */
	static create<T>(cols: number, rows: number, fillWith: T): Grid<T> {
		const grid = [];

		for (let c = 0; c < cols; ++c) {
			const col = [];
			for (let r = 0; r < rows; ++r) {
				col.push(fillWith);
			}
			grid.push(col);
		}

		return new Grid(grid);
	}	

	constructor(cols: T[][]) {
		this.grid = cols;
		this.validateGridSize();
	}

	fill(start: Coord, end: Coord, value: T): boolean {
		for (let x = 0; x < this.grid.length; ++x) {
			if (x >= start.x && x <= end.x) {
				for (let y = 0; y < this.grid[x].length; ++y) {
					if (y >= start.y && y <= end.y) {
						this.set(x, y, value);
					}
				}
			}
		}
		return true;
	}

	get(x: number, y: number): T {
		if (x < this.getColN() && y < this.getRowN() && x >= 0 && y >= 0 ) {
			return this.grid[x][y];
		}
		throw new Error(`stai sforando, chiedi x = ${x} e y = ${y}`);
	}

	set(x: number, y: number, value: T): boolean {
		if (x < this.getColN() && y < this.getRowN() && x >= 0 && y >= 0 ) {
			this.grid[x][y] = value;
			return true;
		}
		return false;
	}

	// Per scorrere una riga
	getRow(n: number): T[] {
		const row: T[] = [];
		for (let i = 0 ; i < this.getColN() ; i++) {
			row.push(this.get(i, n));
		}
		return  row;
	}

	// Per scorrere una colonna
	getCol(n: number): T[] {
		return this.grid[n];
	}

	getColN(): number {
		return this.grid.length;
	}

	getRowN(): number {
		if (this.grid.length) {
			return this.grid[0].length;
		} else { return 0; }
	}

	/**
	 * Ottiene una copia della grid in matrice, colonne x righe.
	 */
	getGrid(): T[][] {
		return this.grid.map((row) => [...row]);
	}

	clone(): Grid<T> {
		return new Grid(this.getGrid());
	}

	has(x: number, y: number): boolean {
		return x >= 0 && y >= 0 && x < this.getColN() && y < this.getRowN();
	}

	/**
	 * Cicla su tutti i valori della grid, da sinistra a destra, dall'alto verso
	 * il basso.
	 * @param fn
	 */
	forEach(fn: (value: T, key: Coord) => void): void {
		for (let x = 0; x < this.grid.length; ++x) {
			const col = this.grid[x];
			for (let y = 0; y < col.length; ++y) {
				fn(col[y], { x, y });
			}
		}
	}

	/**
	 * Cerca in tutta la grid tramite una funzione e restituisce `T` se lo trova,
	 * altrimenti `undefined`. Simile ad `Array#find`.
	 * @param fn
	 */
	find(fn: (value: T, key: Coord) => boolean): T | undefined {
		for (let x = 0; x < this.grid.length; ++x) {
			const col = this.grid[x];
			for (let y = 0; y < col.length; ++y) {
				const value = col[y];
				const found = fn(value, { x, y });

				if (Boolean(found)) {
					return value;
				}
			}
		}
	}

	private validateGridSize() {
		if (this.grid.length) {
			const rowLength = this.grid[0].length;
			for (const row of this.grid) {
				if (row.length !== rowLength) {
					throw new TypeError('malformed grid, row length mismatching');
				}
			}
		}
	}
}
