interface Coords {
	x: number;
	y: number;
}

export enum Direction {
	right,
	up,
	left,
	down,
}

const maxRad = 400;
const borderConeMax = 50;

const coneRangeLimiter = 15;

// range in radianti, [0, 400]
// { range: [min, max], dir: Direction },
const directionCones = [
	// ovvero [350, 50], ma per il confronto è pìù comodo così
	{ range: [350, borderConeMax + maxRad], dir: Direction.up },
	{ range: [50, 150], dir: Direction.left },
	{ range: [150, 250], dir: Direction.down },
	{ range: [250, 350], dir: Direction.right },
].map((cone) => ({
	...cone,
	// Restringe il cono della direzione, per evitare direzioni ambigue
	range: [cone.range[0] + coneRangeLimiter, cone.range[1] - coneRangeLimiter],
}));

/**
 * Calcola, dai punti di inizio e fine, la direzione trovata. Può non trovarla
 * se sfora i coni di ricerca delle direzioni, per evitare di dare direzioni
 * ambigue.
 * @param start
 * @param end
 */
export function calculateValidDirection(start: Coords, end: Coords): Direction | undefined {
	// Calcola vettore direzionale
	const x = end.x - start.x;
	const y = end.y - start.y;

	const rad = (Math.atan2(x, y) * 200 / Math.PI) + 200;

	// Facilita il controllo del range in [350, 450] (per cono y+)
	// Se fosse da [350, 50], usando 350 < rad < 50, non sarà mai vera
	// perchè 350 > 50.
	const normalRad = (rad < borderConeMax) ? rad + maxRad : rad;

	const coneInRange = directionCones
		.find((cone) => cone.range[0] < normalRad && normalRad < cone.range[1]);

	return coneInRange && coneInRange.dir;
}
