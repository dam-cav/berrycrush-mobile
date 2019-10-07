import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Direction, calculateValidDirection } from 'src/shared/src/Direction';
import Berry from 'src/shared/src/Berry';
import Grid, { Coord } from 'src/shared/src/Grid';
// import { trigger, style, state, transition, animate } from '@angular/animations';

function unifyTouchMouseEvent(event: MouseEvent | TouchEvent) {
  if ((event as TouchEvent).changedTouches) {
    return (event as TouchEvent).changedTouches[0];
  }
  return event as MouseEvent;
}

export interface MoveBerryEvent {
  x: number;
  y: number;
  dir: Direction;
}

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent implements OnInit {
  @Input() grid: Grid<Berry>;
  @Input() destroyedCoords: Coord[] = [];

  @Output() triedMoveBerry = new EventEmitter<MoveBerryEvent>();

  // Berry selezionata, solitamente all'inizio dello swipe
  private selectedBerry?: { x: number, y: number };
  // Punto di partenza dello swipe, per calcolare poi la direzione dello swipe
  private swipeStart?: { x: number, y: number };

  ngOnInit() {}

  selectBerry(x: number, y: number, event: any) {
    this.selectedBerry = { x, y };
  }

  // Possibili implementazioni di swipe/slide
  // https://css-tricks.com/simple-swipe-with-vanilla-javascript/
  // https://developer.mozilla.org/en-US/docs/Web/API/Document/drag_event
  // https://hammerjs.github.io/recognizer-swipe/

  /**
   * Evento iniziale di swipe: effettuo la pressione (mousedown o touchstart) su
   * questa berry.
   */
  onSwipeStart(event: MouseEvent | TouchEvent) {
    const unifiedEvent = unifyTouchMouseEvent(event);

    if (this.selectedBerry) {
      this.swipeStart = {
        x: unifiedEvent.clientX,
        y: unifiedEvent.clientY,
      };
    }

    // console.log('start swipe from', this.swipeStart, 'berry', this.selectedBerry);
  }

  /**
   * Evento finale di swipe: rilascio la pressione (mouseup o touchend) da
   * questa berry. Calcolo la direzione e riporto il movimnto della berry
   */
  onSwipeEnd(event: MouseEvent | TouchEvent) {
    const unifiedEvent = unifyTouchMouseEvent(event);

    const swipeEnd = { x: unifiedEvent.clientX, y: unifiedEvent.clientY };

    if (this.swipeStart) {
      const dir = calculateValidDirection(this.swipeStart, swipeEnd);

      if (dir !== undefined && this.selectedBerry) {
        this.triedMoveBerry.emit({
          ...this.selectedBerry,
          dir,
        });
      } else {
        console.warn('dir ambigua');
      }
    } else {
      // console.warn('swipe not started');
    }

    // console.log('stopped swipe to', swipeEnd);
    this.swipeStart = undefined;
    this.selectedBerry = undefined;
  }

  isBerryDestroyed(x: number, y: number): boolean {
    // FIXME chiamate all'infinito
    // console.log('isBerryDestroyed');
    return !!this.destroyedCoords.find((coord) => coord.x === x && coord.y === y);
  }

  isBerrySelected(x: number, y: number): boolean {
    // FIXME chiamate all'infinito
    // console.log('isBerrySelected');
    return !!this.selectedBerry
      && this.selectedBerry.x === x
      && this.selectedBerry.y === y;
  }
}
