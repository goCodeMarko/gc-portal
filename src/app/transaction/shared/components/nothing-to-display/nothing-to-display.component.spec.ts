import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NothingToDisplayComponent } from './nothing-to-display.component';

describe('NothingToDisplayComponent', () => {
  let component: NothingToDisplayComponent;
  let fixture: ComponentFixture<NothingToDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NothingToDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NothingToDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
