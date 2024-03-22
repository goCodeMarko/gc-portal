import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { PopUpModalComponent } from "../../modals/pop-up-modal/pop-up-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { animate, style, transition, trigger } from "@angular/animations";

interface ICashIns {
  _id: string;
  amount: number;
  fee: number;
  fee_payment_is_gcash: boolean;
  snapshot: string;
  status: number;
  type: number;
  phone_number: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
interface IResponse {
  success: string;
  data: {
    items: ICashIns[];
    meta: {
      total: number;
      limit: number;
      page: number;
      pages: number;
    };
  };
  code: number;
  message: string;
}
@Component({
  selector: "app-cash-in",
  templateUrl: "./cash-in.component.html",
  styleUrls: ["./cash-in.component.css"],
})
export class CashInComponent implements OnInit {
  @Output() hideLogoutButton = new EventEmitter<boolean>();

  public cashinForm: FormGroup;

  // Table Props
  public viewType = "table";
  public cashIns: ICashIns[] = [];
  public counts = 0;
  public pages = 0;
  public currentPage = 0;
  public filters = {
    search: "",
    skip: 5,
    dateStart: "",
    dateEnd: "",
    skipCount: 0,
    limit: 5,
  };
  // End

  constructor(
    private fb: FormBuilder,
    private hrs: HttpRequestService,
    private dialog: MatDialog
  ) {
    this.cashinForm = this.fb.group({
      type: [1],
      phone_number: [
        "",
        [Validators.required, Validators.pattern(/^09\d{9}$/)],
      ],
      fee_payment_is_gcash: ["true"],
      amount: ["", Validators.required],
      fee: ["", Validators.required],
      note: [""],
    });
  }

  ngOnInit(): void {
    this.getCashIns();
  }

  public getCashIns() {
    this.hrs.request(
      "get",
      "transaction/getCashIns",
      this.filters,
      async (res: IResponse) => {
        const { total, page, pages } = res.data.meta;
        this.cashIns = res.data.items;
        this.currentPage = page;
        this.counts = total;
        this.pages = pages;

        console.log(121321, this.cashIns);
      }
    );
  }

  emittedButton(type: string) {
    if (type == "cashinFormView") {
      this.hideLogoutButton.emit(true);
      this.viewType = "addCashin";
    }
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
      this.cashinForm.get(name)?.invalid &&
      this.cashinForm.get(name)?.errors &&
      (this.cashinForm.get(name)?.dirty || this.cashinForm.get(name)?.touched)
    ) {
      result = true;
    }

    return result;
  }

  sendRequest() {
    this.hrs.request(
      "post",
      `transaction/addTransaction`,
      this.cashinForm.value,
      async (data: any) => {
        if (data.success) {
          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              title: "Success!",
              message: "Cashout Request <b>has been sent</b>.",
            },
          });
          this.getCashIns();
          this.viewType = "table";
          this.hideLogoutButton.emit(false);
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
      }
    );
  }

  cancel() {
    this.viewType = "table";
    this.resetCashoutForm();
    this.hideLogoutButton.emit(false);
  }

  resetCashoutForm() {
    this.cashinForm.reset();
    this.cashinForm.patchValue({
      type: 1,
      fee_payment_is_gcash: "true",
    });
  }
}
