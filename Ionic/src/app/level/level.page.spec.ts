import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelPage } from './level.page';

describe('LevelPage', () => {
  let component: LevelPage;
  let fixture: ComponentFixture<LevelPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LevelPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LevelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
