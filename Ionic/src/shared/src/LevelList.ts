import Berry from './Berry';
import BerryDex, { defaultBerries } from './BerryDex';
import BerryGrid from './BerryGrid';
import Grid from './Grid';
import Monster from './Monster';

export interface LevelParams {
	level: string;
	title: string;
	difficulty: number;
	rows?: number; // default 7
	columns?: number; // default 7
	nberry?: number; // default 5
	mname: string;
	mhunger: number;
}

export default class LevelList {
	static levels: LevelParams[] = [
		{
			title: 'Inizio amichevole',
			mname: 'barosa',
			level: 'tutorial',
			difficulty: 1,
			mhunger: 30,
			rows: 6,
			columns: 6,
			nberry: 4,
		},
		{
			title: 'Avvolgenti abissi',
			mname: 'tentayawp',
			level: 'level1',
			difficulty: 1,
			mhunger: 50,
			rows: 6,
			columns: 6,
			nberry: 4,
		},
		{
			title: 'Crepa nel terreno',
			mname: 'kakztus',
			level: 'level2',
			difficulty: 2,
			rows: 6,
			mhunger: 70,
		},
		{
			title: 'Re della giungla',
			mname: 'goroffe',
			level: 'level3',
			difficulty: 2,
			rows: 6,
			mhunger: 90,
		},
		{
			title: 'Pascolo tranquillo',
			mname: 'sofolo',
			level: 'level4',
			difficulty: 2,
			mhunger: 120,
		},
		{
			title: 'Schiaccianoci ghiotto',
			mname: 'treelefa',
			level: 'level5',
			difficulty: 3,
			mhunger: 160,
		},
		{
			title: 'Oceano in eruzione',
			mname: 'whalezzy',
			level: 'level6',
			difficulty: 3,
			mhunger: 180,
		},
		{
			title: 'Sorte sommersa',
			mname: 'galigambo',
			level: 'level7',
			difficulty: 3,
			mhunger: 200,
		},
		{
			title: 'Cavallo selvaggio',
			mname: 'spirit',
			level: 'level8',
			difficulty: 4,
			mhunger: 220,
		},
		{
			title: 'Furfante affamato',
			mname: 'larry',
			level: 'level9',
			difficulty: 4,
			mhunger: 260,
		},
	];

	static createMonsterLevel(id: string) {
		const params = LevelList.levels.find((level) => level.level === id);

		if (!params) {
			throw new Error(`level '${id}' does not exists`);
		}

		const bdex = new BerryDex([...defaultBerries]);
		const nBerry = params.nberry || 5;
		while (bdex.size() > nBerry) {
			bdex.randomRemove();
		}

		const cols = params.columns || 7;
		const rows = params.rows || 7;
		const grid = Grid.create(cols, rows, Berry.noBerry);

		return {
			berryGrid: new BerryGrid(grid, bdex),
			monster: new Monster(params.mname, params.mhunger),
		};
	}
}
