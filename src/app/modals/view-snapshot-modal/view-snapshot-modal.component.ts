import { Component, EventEmitter, Inject, OnInit, Output } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-view-snapshot-modal",
  templateUrl: "./view-snapshot-modal.component.html",
  styleUrls: ["./view-snapshot-modal.component.css"],
})
export class ViewSnapshotModalComponent implements OnInit {
  @Output() result = new EventEmitter();
  constructor(
    private dialog: MatDialogRef<ViewSnapshotModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  close() {
    this.dialog.close();
  }
}
