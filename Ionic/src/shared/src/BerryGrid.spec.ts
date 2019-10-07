import test from 'ava';
import Berry from './Berry';
import BerryDex from './BerryDex';
import BerryGrid from './BerryGrid';
import { Direction } from './Direction';
import Grid from './Grid';

const X = Berry.noBerry;
const A = new Berry('*', '*');
const B = new Berry('-', '-');

const defaulBerryDex = new BerryDex([A, B]);

/**
 * Controlla se nella grid compare la berry cercata almeno una volta.
 * @param grid
 * @param berry
 */
function hasBerry(grid: Grid<Berry>, berry: Berry): boolean {
	const found = grid.find((gridBerry, { x, y }) => gridBerry.getColor() === berry.getColor());
	return Boolean(found);
}

/**
 * Compara due grid punto per punto, se le berry sono uguali.
 * Fallisce se le grandezze delle grid sono diverse.
 * @param grid1
 * @param grid2
 */
function compareGrid(grid1: Grid<Berry>, grid2: Grid<Berry>): boolean {
	if (grid1.getColN() !== grid2.getColN() || grid1.getRowN() !== grid2.getRowN()) {
		// console.error('dimensioni diverse');
		return false;
	}

	for (let x = 0; x < grid1.getColN(); ++x) {
		for (let y = 0; y < grid1.getRowN(); ++y) {
			const color1 = grid1.get(x, y).getColor();
			const color2 = grid2.get(x, y).getColor();
			if (color1 !== color2) {
				return false;
			}
		}
	}

	return true;
}

test('(test interno) createEmptyGrid, compareGrid', (t) => {
	const size = 3;
	const grid = Grid.create(size, size, X);
	t.is(grid.getColN(), size);
	t.is(grid.getRowN(), size);
	t.true(hasBerry(grid, X));
	t.false(compareGrid(Grid.create(3, 3, X), Grid.create(4, 4, X)));
	t.false(compareGrid(new Grid([
		[A, X],
		[X, X],
	]), new Grid([
		[A, A],
		[X, A],
	])));
});

test('la noBerry non viene considerata come componibile/distruttibile', (t) => {
	const berryGrid = new BerryGrid(new Grid([
		[X, X, A],
		[X, A, X],
		[A, X, X],
	]), defaulBerryDex);

	t.true(!berryGrid.canMoveBerry(1, 1, Direction.up));
});

test('si può muovere solo se si potrà comporre una tripletta ', (t) => {
	const berryToMove = { x: 0, y: 2 };

	const berryGrid = new BerryGrid(new Grid([
		[X, X, A],
		[X, A, X],
		[X, A, X],
	]), defaulBerryDex);

	// console.log('Sposta berry', berryToMove, 'in alto');
	// printGridBerry(berryGrid.getGrid());

	t.true(berryGrid.canMoveBerry(berryToMove.x, berryToMove.y, Direction.up));
	t.false(berryGrid.canMoveBerry(berryToMove.x, berryToMove.y, Direction.right));
});

test('non si può muovere una berry fuori dalla grid', (t) => {
	const berryToMove = { x: 0, y: 0 };

	const berryGrid = new BerryGrid(new Grid([
		[A, X, X],
		[X, X, A],
		[X, X, A],
	]), defaulBerryDex);

	// console.log('Sposta berry', berryToMove, 'in alto');
	// printGridBerry(berryGrid.getGrid());

	t.true(!berryGrid.canMoveBerry(berryToMove.x, berryToMove.y, Direction.up));
});

test('scambiando distrugge le berry dove si compone una tripletta', (t) => {
	const berryToMove = { x: 0, y: 2 };

	const berryGrid = new BerryGrid(new Grid([
		[X, X, A],
		[X, A, X],
		[X, A, X],
	]), defaulBerryDex);

	// console.log('Sposta berry', berryToMove, 'in alto');
	// console.log(berryGrid.toString());

	berryGrid.moveBerry(berryToMove.x, berryToMove.y, Direction.up);
	const destroyed = berryGrid.searchAndDestroy();
	t.true(destroyed.length > 0);

	const expectedGrid = new Grid([
		[X, X, X],
		[X, X, X],
		[X, X, X],
	]);

	t.true(compareGrid(berryGrid.getGrid(), expectedGrid));
});

test('non si può scambiare se si compone una tripletta in diagonale', (t) => {
	const berryToMove = { x: 2, y: 1 };

	const berryGrid = new BerryGrid(new Grid([
		[X, X, A],
		[X, A, X],
		[X, A, X],
	]), defaulBerryDex);

	// console.log('Sposta berry', berryToMove, 'in alto');
	// printGridBerry(berryGrid.getGrid());

	t.true(!berryGrid.canMoveBerry(berryToMove.x, berryToMove.y, Direction.left));
});

test('scambiando distrugge le triplette che si formano in entrambi gli assi', (t) => {
	const berryToMove = { x: 1, y: 3 };

	// 4x3
	const berryGrid = new BerryGrid(new Grid([
		[X, X, A, X],
		[A, A, X, A],
		[X, X, A, X],
	]), defaulBerryDex);

	// console.log('Sposta berry', berryToMove, 'in alto');
	// console.log(berryGrid.toString());

	t.true(berryGrid.canMoveBerry(berryToMove.x, berryToMove.y, Direction.up));

	berryGrid.moveBerry(berryToMove.x, berryToMove.y, Direction.up);
	const destroyed = berryGrid.searchAndDestroy();
	t.true(destroyed.length > 0);

	// console.log(berryGrid.toString());

	const expectedGrid = new Grid([
		[X, X, X, X],
		[X, X, X, X],
		[X, X, X, X],
	]);

	t.true(compareGrid(berryGrid.getGrid(), expectedGrid));
});

test('scambiando due berry distrugge le triplette formatesi da entrambe le berry', (t) => {
	const berryToMove = { x: 1, y: 3 };

	// 3x5
	const berryGrid = new BerryGrid(new Grid([
		[X, X, A, B, X, X],
		[A, A, B, A, B, B],
		[X, X, A, B, X, X],
	]), defaulBerryDex);

	// console.log('Sposta berry', berryToMove, 'in alto');
	// printGridBerry(berryGrid.getGrid());

	t.true(berryGrid.canMoveBerry(berryToMove.x, berryToMove.y, Direction.up));

	berryGrid.moveBerry(berryToMove.x, berryToMove.y, Direction.up);
	const destroyed = berryGrid.searchAndDestroy();
	t.true(destroyed.length > 0);

	// printGridBerry(berryGrid.getGrid());

	const expectedGrid = new Grid([
		[X, X, X, X, X, X],
		[X, X, X, X, X, X],
		[X, X, X, X, X, X],
	]);

	t.true(compareGrid(berryGrid.getGrid(), expectedGrid));
});

test('la grid non è risolvibile da un punto', (t) => {
	const size = 5;

	const points = [
		{ x: 0, y: 0 },
		{ x: 2, y: 2 },
		{ x: 4, y: 4 },
	];

	const grid = Grid.create(size, size, X);
	points.forEach((point) => grid.set(point.x, point.y, A));

	// Grid vuota, con punti separati fra loro, senza possibilità di combinarsi
	// in un solo movimento
	const berryGrid = new BerryGrid(grid, defaulBerryDex);

	// printGridBerry(berryGrid.getGrid());

	points.forEach((point) => {
		// console.log('Cerco se risolvibile dal punto', point);
		t.true(!berryGrid.isSolvableFrom(point.x, point.y));
	});
});

test('la grid è risolvibile da più punti', (t) => {
	const size = 5;

	const grid = Grid.create(size, size, X);

	const center = { x: 2, y: 2 };
	grid.set(3, 1, A);
	grid.set(3, 3, A);
	grid.set(center.x, center.y, A);

	const start = { x: 0, y: 1 };
	grid.fill({ x: 1, y: 0 }, { x: 2, y: 0 }, A);
	grid.set(start.x, start.y, A);

	const berryGrid = new BerryGrid(grid, defaulBerryDex);

	// printGridBerry(berryGrid.getGrid());

	// console.log('Cerco se risolvibile dal punto', center);
	t.true(berryGrid.isSolvableFrom(center.x, center.y));

	// console.log('Cerco se risolvibile dal punto', start);
	t.true(berryGrid.isSolvableFrom(start.x, start.y));

	// console.log('Cerco se risolvibile');
	t.true(berryGrid.isGridSolvable());
});

test('refill copre tutti gli spazi vuoti, partendo dall\'alto', (t) => {
	const gridsWithEmpty = [
		Grid.create(3, 3, X),
		new Grid([
			[X, A, A],
			[X, X, A],
			[X, X, X],
		]),
	];

	gridsWithEmpty.forEach((grid) => {
		const berryGrid = new BerryGrid(grid, defaulBerryDex);
		berryGrid.refillBerry();
		// printGridBerry(berryGrid.getGrid());
		t.true(!hasBerry(berryGrid.getGrid(), X));
	});
});

test('compact copre gli spazi vuoti spostando le berry sopra di esse', (t) => {
	const berryGrid = new BerryGrid(new Grid([
		[A, X, X, A], // sposta giù la prima A
		[X, X, X, A], // non sposta niente
		[A, X, X, X], // sposta giù A fino in fondo
	]), defaulBerryDex);

	berryGrid.compact();
	// printGridBerry(berryGrid.getGrid());

	const expectedGrid = new Grid([
		[X, X, A, A],
		[X, X, X, A],
		[X, X, X, A],
	]);
	t.true(compareGrid(berryGrid.getGrid(), expectedGrid));
});

test('searchAndDestroy distrugge tutte le combo presenti e torna numero distrutti', (t) => {
	const berryGrid = new BerryGrid(new Grid([
		[B, B, A, X],
		[B, A, A, A],
		[B, B, A, X],
		[A, X, A, X],
	]), defaulBerryDex);

	const destroyed = berryGrid.searchAndDestroy();
	// console.log(berryGrid.toString());

	const expectedGrid = new Grid([
		[X, B, X, X],
		[X, X, X, X],
		[X, B, X, X],
		[A, X, X, X],
	]);

	t.true(compareGrid(berryGrid.getGrid(), expectedGrid));
	t.is(destroyed.length, 9);
});

test('reset torna una grid risolvibile', (t) => {
	const size = 5;
	const berryGrid = new BerryGrid(Grid.create(size, size, X), defaulBerryDex);

	berryGrid.reset();
	// printGridBerry(berryGrid.getGrid());

	t.true(!hasBerry(berryGrid.getGrid(), X));
	t.true(berryGrid.isGridSolvable());
});

test('ciclo compact-refill-searchAndDestroy non infinito', (t) => {
	const size = 5;
	const berryGrid = new BerryGrid(Grid.create(size, size, X), new BerryDex());

	const max = 10;
	let i = 0;
	let destroyed = 1;
	while (destroyed > 0 && i < max) {
		berryGrid.compact();
		berryGrid.refillBerry();
		destroyed = berryGrid.searchAndDestroy().length;
		// printGridBerry(berryGrid.getGrid());
		// console.log('Distrutti:', destroyed);
		++i;
	}

	t.true(i < max);
});
