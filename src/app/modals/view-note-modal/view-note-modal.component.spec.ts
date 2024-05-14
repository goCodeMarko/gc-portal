import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewNoteModalComponent } from './view-note-modal.component';

describe('ViewNoteModalComponent', () => {
  let component: ViewNoteModalComponent;
  let fixture: ComponentFixture<ViewNoteModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewNoteModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewNoteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
