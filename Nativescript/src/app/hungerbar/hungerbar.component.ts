import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'ns-hungerbar',
  templateUrl: './hungerbar.component.html',
  styleUrls: ['./hungerbar.component.css'],
  moduleId: module.id,
})
export class hungerbarComponent implements OnInit {
  @Input() mName:String;
  @Input() actHunger: number;
  @Input() highlight: String|undefined;

  constructor() {
  }

  ngOnInit() {
  }

  setProgressbarWidth() {
    return this.actHunger + "*," + (100 - this.actHunger) + "*";
  }
}
