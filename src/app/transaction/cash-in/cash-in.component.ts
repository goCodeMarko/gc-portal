import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  OnDestroy,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { PopUpModalComponent } from "../../modals/pop-up-modal/pop-up-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { animate, style, transition, trigger } from "@angular/animations";
import { TransactionStatus, TransactionStatusLabels } from "../../shared/enums";
import { SocketService } from "src/app/shared/socket/socket.service";
import { Subscription } from "rxjs";
import { AudioService } from "src/app/shared/audio/audio.service";

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
export class CashInComponent implements OnInit, OnDestroy {
  @Output() hideLogoutButton = new EventEmitter<boolean>();

  public cashinForm: FormGroup;

  //screenshot file
  public approveCashinForm: FormGroup;
  public screenshotFile: any;
  public approveTransactionDetails: any;

  // Table Props
  public viewType = "table";
  public cashIns: ICashIns[] = [];
  public counts = 0;
  public pages = 0;
  public currentPage = 0;
  public filters = {
    search: "",
    skip: 3,
    dateStart: "",
    dateEnd: "",
    skipCount: 0,
    limit: 3,
  };
  public cashInTableOnLoad: boolean = true;
  // End

  private socketSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private hrs: HttpRequestService,
    private dialog: MatDialog,
    private socket: SocketService,
    private audio: AudioService
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

    this.approveCashinForm = this.fb.group({
      screenshot: ["", Validators.required],
    });

    this.socketSubscription = this.socket.onMessage().subscribe((message) => {
      console.log("socket: ", message);
      if (message.type === "updateTransactionStatus") {
        this.cashIns = this.cashIns.map((cashin: ICashIns) => {
          if (cashin._id === message.data._id) {
            cashin.status = message.data.status;
            cashin.snapshot = message.data.snapshot;
          }
          return { ...cashin };
        });
        this.audio.playSound("mixkit-elevator-tone.wav");
      }

      if (message.type === "newCashin") {
        this.cashIns.pop();
        this.cashIns.unshift(message.data);
        this.audio.playSound("mixkit-elevator-tone.wav");
      }
    });
  }

  ngOnInit(): void {
    this.getCashIns();
  }

  ngOnDestroy(): void {
    this.socketSubscription.unsubscribe();
  }

  screenshotUploadHandler(event: any) {
    this.approveCashinForm.patchValue({
      screenshot: event.target.files[0].name,
    });
    this.screenshotFile = event.target.files[0];
  }

  public getCashIns() {
    this.cashInTableOnLoad = true;
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
        this.cashInTableOnLoad = false;
      }
    );
  }

  emittedButton(event: { type: string; data: any }) {
    switch (event.type) {
      case "approve":
        this.viewType = "approveCashin";
        this.hideLogoutButton.emit(true);
        this.approveTransactionDetails = event.data;
        break;
      case "cancel":
        this.updateTransactionStatus(
          TransactionStatus.Cancelled,
          event.data?.trans_id
        );
        break;
      case "fail":
        this.updateTransactionStatus(
          TransactionStatus.Failed,
          event.data?.trans_id
        );
        break;
      case "cashinFormView":
        this.hideLogoutButton.emit(true);
        this.viewType = "addCashin";
        break;
    }
  }

  public approveRequest() {
    const formData = new FormData();
    formData.append("status", "2");
    formData.append("type", "1");
    formData.append("screenshot", this.screenshotFile);
    this.updateTransactionStatus(
      2,
      this.approveTransactionDetails.trans_id,
      formData
    );
  }

  public updateTransactionStatus(
    status: number,
    trans_id: any,
    formData?: any
  ) {
    this.hrs.request(
      "put",
      `transaction/updateTransactionStatus?trans_id=${trans_id}`,
      formData ? formData : { status: status },
      async (data: any) => {
        if (data.success) {
          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              title: "Success!",
              message: "Transaction status <b>has been updated</b>.",
            },
          });

          if (formData) {
            this.getCashIns();
            this.viewType = "table";
            this.resetApproveCashinForm();
            this.hideLogoutButton.emit(false);
            this.approveTransactionDetails = {};
          } else {
            this.cashIns = this.cashIns.map((cashout) => {
              if (cashout._id === trans_id) {
                cashout.status = status;
              }
              return { ...cashout };
            });
          }

          this.socket.sendMessage({
            type: "updateTransactionStatus",
            data: data.data,
          });
        } else {
          if (data.error.message == "Restricted") {
            this.dialog.open(PopUpModalComponent, {
              width: "500px",
              data: {
                deletebutton: false,
                title: "Access Denied",
                message:
                  "Oops, It looks like you <b>dont have access</b> on this feature.",
              },
            });
          } else {
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

          this.socket.sendMessage({ type: "newCashin", data: data.data });
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
    this.resetApproveCashinForm();
    this.hideLogoutButton.emit(false);
  }

  resetCashoutForm() {
    this.cashinForm.reset();
    this.cashinForm.patchValue({
      type: 1,
      fee_payment_is_gcash: "true",
    });
  }

  resetApproveCashinForm() {
    this.approveCashinForm.reset();
    this.approveCashinForm.patchValue({
      screenshot: "",
    });
  }
}
