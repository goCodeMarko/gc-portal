import { Component, OnInit } from "@angular/core";
import { AuthService } from "../authorization/auth.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";
import { HttpRequestService } from "../http-request/http-request.service";
import { MatDialog } from "@angular/material/dialog";
import { PopUpModalComponent } from "../modals/pop-up-modal/pop-up-modal.component";

@Component({
  selector: "app-transaction",
  templateUrl: "./transaction.component.html",
  styleUrls: ["./transaction.component.css"],
})
export class TransactionComponent implements OnInit {
  viewType: string = "cashout";
  public hideMainButton = false;
  public tabActiveCashout = true;
  public tabActiveCashin = false;
  private viewTypeBefore: string = "";

  //Cash in form
  public transactionForm: FormGroup;
  public role: string = "";
  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private hrs: HttpRequestService,
    private dialog: MatDialog
  ) {
    this.transactionForm = this.fb.group({
      date: ["", Validators.required],
      gcash: ["", Validators.required],
      cash_on_hand: ["", Validators.required],
      gcashNumber: ["", [Validators.required, Validators.pattern(/^09\d{9}$/)]],
    });
  }

  ngOnInit(): void {
    this.checkRole();
  }

  async checkRole() {
    const user = JSON.parse(this.auth.getUserData());
    this.role = user.role;
  }

  view(type: string) {
    if (type === "cashin") {
      this.viewType = "cashin";
      this.tabActiveCashin = true;
      this.tabActiveCashout = false;
      this.hideMainButton = false;
    } else if (type === "cashout") {
      this.viewType = "cashout";
      this.tabActiveCashin = false;
      this.tabActiveCashout = true;
      this.hideMainButton = false;
    }
  }

  mainButton(event: boolean) {
    this.hideMainButton = event;
  }

  public logout() {
    this.auth.logout();
  }

  public createTransactionView() {
    this.hideMainButton = true;
    this.viewTypeBefore = this.viewType;
    this.viewType = "createTransaction";
    this.transactionForm.reset();
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

          this.hideMainButton = false;
          this.viewType = this.viewTypeBefore;
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

  public generateReportBtnOnLoad = false;
  generateReport() {
    this.generateReportBtnOnLoad = true;

    const startDate = moment().startOf("day").format("YYYY-MM-DDTHH:mm:ss");
    const endDate = moment().endOf("day").format("YYYY-MM-DDTHH:mm:ss");

    this.hrs.request(
      "get",
      "transaction/generateReport",
      { startDate, endDate },
      async (res: any) => {
        this.generateReportBtnOnLoad = false;
        if (res.success) {
          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              title: "Success!",
              message: "Daily report <b>has been sent</b> to your email.",
            },
          });
        } else {
          if (res.error.message == "Restricted") {
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
        }
      }
    );
  }

  cancel() {
    this.viewType = this.viewTypeBefore;
    this.tabActiveCashin = false;
    this.tabActiveCashout = true;
    this.hideMainButton = false;
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
