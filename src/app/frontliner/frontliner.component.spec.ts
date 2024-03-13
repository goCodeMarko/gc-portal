import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrontlinerComponent } from './frontliner.component';

describe('FrontlinerComponent', () => {
  let component: FrontlinerComponent;
  let fixture: ComponentFixture<FrontlinerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FrontlinerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FrontlinerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
