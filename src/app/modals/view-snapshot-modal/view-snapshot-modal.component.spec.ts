import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ViewSnapshotModalComponent } from "./view-snapshot-modal.component";

describe("ViewSnapshotModalComponent", () => {
  let component: ViewSnapshotModalComponent;
  let fixture: ComponentFixture<ViewSnapshotModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewSnapshotModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSnapshotModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
