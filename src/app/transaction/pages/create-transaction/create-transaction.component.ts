import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import * as moment from "moment";
import { Location } from "@angular/common";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { PopUpModalComponent } from "src/app/modals/pop-up-modal/pop-up-modal.component";

@Component({
  selector: "app-create-transaction",
  templateUrl: "./create-transaction.component.html",
  styleUrls: ["./create-transaction.component.scss"],
})
export class CreateTransactionComponent implements OnInit {
  public transactionForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private hrs: HttpRequestService,
    private dialog: MatDialog,
    private location: Location
  ) {
    this.transactionForm = this.fb.group({
      date: ["", Validators.required],
      gcash: ["", Validators.required],
      cash_on_hand: ["", Validators.required],
      gcashNumber: ["", [Validators.required, Validators.pattern(/^09\d{9}$/)]],
    });
  }

  ngOnInit(): void {}

  goBack(): void {
    this.location.back();
  }

  public createTransBtnOnLoad = false;
  createTransaction() {
    this.createTransBtnOnLoad = true;
    const date = moment(this.transactionForm.get("date")?.value)
      .startOf("day")
      .format("YYYY-MM-DDTHH:mm:ss");

    this.transactionForm.patchValue({
      date: date,
    });

    this.hrs.request(
      "post",
      `transaction/createTransaction`,
      this.transactionForm.value,
      async (data: any) => {
        if (data.success) {
          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              title: "Success!",
              message: "Transaction <b>has been created</b>.",
            },
          });

          this.transactionForm.reset();
        } else {
          if (data.message == "Restricted") {
            this.dialog.open(PopUpModalComponent, {
              width: "500px",
              data: {
                deletebutton: false,
                title: "Access Denied",
                message:
                  "Oops, It looks like you <b>dont have access</b> on this feature.",
              },
            });
          }
          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              title: "Server Error",
              message: data?.error?.message,
            },
          });
        }

        this.createTransBtnOnLoad = false;
      }
    );
  }

  public currencyStrict(event: any) {
    let pasteValue = [];
    const allowedInput = [
      ".",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ];
    if (event.type == "paste") {
      pasteValue = event.clipboardData.getData("text/plain").split("");
      pasteValue.forEach((char: string) => {
        if (!allowedInput.includes(char)) event.preventDefault();
      });
    } else {
      if (!allowedInput.includes(event.key)) event.preventDefault();
    }
  }

  public phoneNumberStrict(event: any) {
    let pasteValue = [];
    const allowedInput = [
      "+",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ];
    if (event.type == "paste") {
      pasteValue = event.clipboardData.getData("text/plain").split("");
      pasteValue.forEach((char: string) => {
        if (!allowedInput.includes(char)) event.preventDefault();
      });
    } else {
      if (!allowedInput.includes(event.key)) event.preventDefault();
    }
  }

  public checkFormControlErrors(name: string): boolean {
    let result = false;
    if (
      this.transactionForm.get(name)?.invalid &&
      this.transactionForm.get(name)?.errors &&
      (this.transactionForm.get(name)?.dirty ||
        this.transactionForm.get(name)?.touched)
    ) {
      result = true;
    }

    return result;
  }
}
