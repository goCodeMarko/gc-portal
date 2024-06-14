import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import * as moment from "moment";
import { Location } from "@angular/common";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { PopUpModalComponent } from "src/app/modals/pop-up-modal/pop-up-modal.component";
import { Router, NavigationStart } from "@angular/router";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-create-transaction",
  templateUrl: "./create-transaction.component.html",
  styleUrls: ["./create-transaction.component.scss"],
})
export class CreateTransactionComponent implements OnInit {
  @Output() hideMainButton = new EventEmitter<boolean>();
  @Output() getTransactionLoading = new EventEmitter<boolean>();
  @Output() viewTypeTransaction = new EventEmitter<string>();
  @Output() selectedRoutes = new EventEmitter<string>();
  public transactionForm: FormGroup;
  private previousUrl!: string;
  public hideForm = false;

  constructor(
    private fb: FormBuilder,
    private hrs: HttpRequestService,
    private dialog: MatDialog,
    private location: Location,
    private router: Router
  ) {
    this.transactionForm = this.fb.group({
      date: ["", Validators.required],
      gcash: ["", Validators.required],
      cash_on_hand: ["", Validators.required],
      gcashNumber: ["", [Validators.required, Validators.pattern(/^09\d{9}$/)]],
    });

    //gets the previous url
    this.previousUrl =
      this.router
        .getCurrentNavigation()
        ?.previousNavigation?.finalUrl?.toString() || "";
    //end
  }

  ngOnInit(): void {
    this.hideMainButton.emit(true);
  }

  goBack(): void {
    const queryparams = this.previousUrl.split("?")[1];
    const url = this.previousUrl.split("?")[0];

    this.hideForm = true;
    if (queryparams) {
      this.viewTypeTransaction.emit("");
      this.getTransactionLoading.emit(true);
    } else {
      this.viewTypeTransaction.emit("noTransaction");
      this.getTransactionLoading.emit(false);
    }
    this.hideMainButton.emit(false);
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
      async (res: any) => {
        if (res.success) {
          // hides the create transaction form
          this.hideForm = true;

          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              title: "Success!",
              message: "Transaction <b>has been created</b>.",
            },
          });

          this.hideMainButton.emit(false);
          this.viewTypeTransaction.emit("");
          this.transactionForm.reset();

          // Check if the previous URL is "/app/transaction"
          if (this.previousUrl === "/app/transaction") {
            // Update the previous URL to include the "/cashout" route
            this.previousUrl = `${this.previousUrl}/cashout`;

            // Emit an event with the value "cashout"
            this.selectedRoutes.emit("cashout");
          }

          // Check if the response data contains an ID
          if (res.data?._id) {
            // Extract query parameters from the previous URL, if any
            const queryparams = this.previousUrl.split("?")[1];

            // If there are query parameters
            if (queryparams) {
              // Go back to the previous URL
              this.goBack();
            } else {
              // Create a params object with the ID from the response data
              const params = { tid: res.data?._id };

              // Navigate to the previous URL with the new query parameters, merging them with any existing ones
              this.router.navigate([this.previousUrl], {
                queryParams: params,
                queryParamsHandling: "merge",
              });
            }
          } else {
            // Go back to the previous URL
            this.goBack();
          }
        } else {
          if (res.message == "Restricted") {
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
              message: res?.error?.message,
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
