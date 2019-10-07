import { Pipe, PipeTransform } from '@angular/core';
import Berry from 'src/shared/src/Berry';
import Grid from 'src/shared/src/Grid';

@Pipe({
  name: 'gridBerryRows'
})
export class GridBerryRowsPipe implements PipeTransform {
  transform(grid?: Grid<Berry>, args?: any): Berry[][] {
    if (!grid) {
      return [];
    }

    const rows = [];
    for (let i = 0; i < grid.getRowN(); ++i) {
      rows.push(grid.getRow(i));
    }
    return rows;
  }
}
