import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Direction } from '~/shared/src/Direction';
import { Coord } from '~/shared/src/Grid';
import { calculateValidDirection} from "~/shared/src/Direction";
import Berry, { BerryColor } from "~/shared/src/Berry";
import { PanGestureEventData } from 'tns-core-modules/ui/gestures/gestures';

export interface MoveBerryEvent {
	x: number;
	y: number;
	dir: Direction;
}

@Component({
	selector: 'ns-grid',
	templateUrl: './grid.component.html',
	styleUrls: ['./grid.component.css'],
	moduleId: module.id,
})
export class GridComponent implements OnInit {
	@Input() berrys: Berry[];
	@Input() gCol: number;
	@Input() gRow: number;
	@Input() destroyedCoords: Coord[] = [];
	@Input() highlight: String|undefined;

	@Output() triedMoveBerry = new EventEmitter<{ x: number, y: number, dir: number }>();

	columns:String;
	rows:String;

	constructor() {
	}

	ngOnInit() {
		this.columns=this.colToString();
		this.rows=this.rowToString();
	}

	onSelected(event: MoveBerryEvent) {
		if (event.dir !== undefined) {
			this.triedMoveBerry.emit({ x: event.x, y: event.y, dir: event.dir});	
		}
	}

	getX(i: number){
		return i % this.gCol;
	}

	getY(i: number){
		return Math.floor(i / this.gCol);
	}

	colToString():String{
		let col = "*";
		for(let i=1; i<this.gCol;++i) col= col + " , *";
		return col;
	}

	rowToString():String{
		let row = "*";
		for(let i=1; i<this.gRow;++i) row= row + " , *";
		return row;
	}

	berryStatus(x: number, y: number){
		if (!!this.destroyedCoords.find((coord) => coord.x === x && coord.y === y)) return "berry critic";
		return "berry";
	}

	berryMoved(args: PanGestureEventData, xm:number, ym:number) {
		if(args.state===3){
		  const dr = calculateValidDirection({x: 0, y: 0},{x: args.deltaX,y: args.deltaY});
		  this.triedMoveBerry.emit({ x: xm, y: ym, dir: dr});
		}
	}

	getImg(name: String): String{
	  return "res://" + name + "_berry";
	}
}
