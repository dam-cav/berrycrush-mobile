import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelSelectionPage } from './level-selection.page';

describe('LevelSelectionPage', () => {
  let component: LevelSelectionPage;
  let fixture: ComponentFixture<LevelSelectionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LevelSelectionPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LevelSelectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
