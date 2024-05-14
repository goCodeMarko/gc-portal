import { Component, EventEmitter, Inject, OnInit, Output } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-view-note-modal",
  templateUrl: "./view-note-modal.component.html",
  styleUrls: ["./view-note-modal.component.css"],
})
export class ViewNoteModalComponent implements OnInit {
  @Output() result = new EventEmitter();
  constructor(
    private dialog: MatDialogRef<ViewNoteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  close() {
    this.dialog.close();
  }
}
