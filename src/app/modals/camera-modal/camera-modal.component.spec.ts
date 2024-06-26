import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CameraModalComponent } from "./camera-modal.component";

describe("CameraComponent", () => {
  let component: CameraModalComponent;
  let fixture: ComponentFixture<CameraModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CameraModalComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
