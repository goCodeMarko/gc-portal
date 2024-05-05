import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  OnDestroy,
  ElementRef,
  ViewChild,
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
import * as moment from "moment";
import * as _ from "lodash";

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
  @Output() hideMainButton = new EventEmitter<boolean>();
  @ViewChild("triggerAudioBtn") triggerAudioBtn!: ElementRef;

  //Cash in form
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

  //sockets
  private socketSubscription: Subscription;

  // Transaction Details
  public transactionDetails: any = {};

  constructor(
    private fb: FormBuilder,
    private hrs: HttpRequestService,
    private dialog: MatDialog,
    private socket: SocketService,
    public audio: AudioService,
    private elRef: ElementRef
  ) {
    this.cashinForm = this.fb.group({
      type: [1],
      cid: [""],
      phone_number: [
        "",
        [Validators.required, Validators.pattern(/^09\d{9}$/)],
      ],
      fee_payment_is_gcash: ["false"],
      amount: ["", Validators.required],
      fee: ["", Validators.required],
      note: [""],
    });

    this.approveCashinForm = this.fb.group({
      screenshot: ["", Validators.required],
    });

    this.socketSubscription = this.socket.onMessage().subscribe((message) => {
      if (message.type === "updateTransactionStatus") {
        this.cashIns = this.cashIns.map((cashin: ICashIns) => {
          if (cashin._id === message.data._id) {
            cashin.status = message.data.status;
          }
          return { ...cashin };
        });

        this.triggerAudioBtn.nativeElement.click();
      }

      if (message.type === "newCashin") {
        if (_.size(this.cashIns) === 3) this.cashIns.pop();
        this.cashIns.unshift(message.data);

        this.triggerAudioBtn.nativeElement.click();
      }

      if (message.type === "updateTransactionDetails") {
        this.transactionDetails.runbal_gcash = message.data.runbal_gcash;
        this.transactionDetails.runbal_cash_on_hand =
          message.data.runbal_cash_on_hand;

        console.log(2, message);

        this.triggerAudioBtn.nativeElement.click();
      }
    });
  }

  async ngOnInit(): Promise<any> {
    await this.getTransaction();
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

  public getTransaction(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Parse the client's local timezone
      const startDate = moment().startOf("day").format("YYYY-MM-DDTHH:mm:ss");
      const endDate = moment().endOf("day").format("YYYY-MM-DDTHH:mm:ss");

      this.hrs.request(
        "get",
        "transaction/getTransaction",
        { startDate, endDate },
        async (res: any) => {
          console.log(2342341111, res.data);
          if (!_.has(res, "data")) {
            this.viewType = "noTransaction";
          } else if (res.success) {
            this.transactionDetails = res.data;

            this.getCashIns();
          }

          resolve();
        }
      );
    });
  }

  public getCashIns() {
    this.cashInTableOnLoad = true;

    this.hrs.request(
      "get",
      "transaction/getCashIns",
      {
        ...this.filters,
        transaction_id: this.transactionDetails?._id,
      },
      async (res: IResponse) => {
        if (!_.has(res, "data")) {
        } else if (res.success) {
          const { total, page, pages } = res.data.meta;
          this.cashIns = res.data.items;
          this.currentPage = page;
          this.counts = total;
          this.pages = pages;
        }
        this.cashInTableOnLoad = false;
      }
    );
  }

  emittedButton(event: { type: string; data: any }) {
    switch (event.type) {
      case "approve":
        this.viewType = "approveCashin";
        this.hideMainButton.emit(true);
        this.approveTransactionDetails = event.data;
        break;
      case "cancel":
        this.updateTransactionStatus(
          TransactionStatus.Cancelled,
          event.data?.cid
        );
        break;
      case "fail":
        this.updateTransactionStatus(TransactionStatus.Failed, event.data?.cid);
        break;
      case "cashinFormView":
        this.hideMainButton.emit(true);
        this.viewType = "addCashin";
        break;
      case "edit":
        this.hideMainButton.emit(true);
        const { phone_number, _id, fee_payment_is_gcash, amount, fee, note } =
          event.data;
        this.cashinForm.patchValue({
          phone_number: phone_number,
          cid: _id,
          fee_payment_is_gcash: String(fee_payment_is_gcash),
          amount: fee_payment_is_gcash ? amount + fee : amount,
          fee: fee,
          note: note,
        });
        this.viewType = "editCashin";
        console.log("-----------editCashin", this.cashinForm.value);
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
      this.approveTransactionDetails.cid,
      formData
    );
  }

  public approveReqBtnOnLoad = false;
  public async updateTransactionStatus(
    status: number,
    cid: any,
    formData?: any
  ) {
    if (status === TransactionStatus.Approved) this.approveReqBtnOnLoad = true;
    this.hrs.request(
      "put",
      `transaction/updateTransactionStatus?trans_id=${this.transactionDetails?._id}&cid=${cid}`,
      formData ? formData : { status, type: 1 },
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
            await this.getTransaction();

            this.viewType = "table";
            this.resetApproveCashinForm();
            this.hideMainButton.emit(false);
            this.approveTransactionDetails = {};

            this.socket.sendMessage({
              type: "updateTransactionDetails",
              data: {
                runbal_gcash: this.transactionDetails.runbal_gcash,
                runbal_cash_on_hand:
                  this.transactionDetails.runbal_cash_on_hand,
              },
            });
            this.approveReqBtnOnLoad = false;
          } else {
            this.cashIns = this.cashIns.map((cashin: any) => {
              if (cashin._id === cid) {
                if (status === TransactionStatus.Approved) {
                  this.transactionDetails.runbal_gcash += cashin.amount;
                  this.transactionDetails.runbal_cash_on_hand -=
                    cashin.amount - cashin.fee;
                } else {
                  this.transactionDetails.runbal_gcash += cashin.amount;
                  this.transactionDetails.runbal_cash_on_hand -=
                    cashin.amount + cashin.fee;
                }
                cashin.status = status;
              }

              return { ...cashin };
            });

            this.socket.sendMessage({
              type: "updateTransactionDetails",
              data: {
                runbal_gcash: this.transactionDetails.runbal_gcash,
                runbal_cash_on_hand:
                  this.transactionDetails.runbal_cash_on_hand,
              },
            });
          }

          this.socket.sendMessage({
            type: "updateTransactionStatus",
            data: { _id: cid, status },
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

  public sendRequestBtnOnLoad = false;
  sendRequest() {
    this.sendRequestBtnOnLoad = true;
    this.hrs.request(
      "post",
      `transaction/addTransaction?trans_id=${this.transactionDetails?._id}`,
      this.cashinForm.value,
      async (data: any) => {
        if (data.success) {
          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              title: "Success!",
              message: "Cashin Request <b>has been sent</b>.",
            },
          });
          this.getCashIns();
          this.viewType = "table";
          this.hideMainButton.emit(false);
          console.log(4234234, data);
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

        this.resetCashinForm();
        this.sendRequestBtnOnLoad = false;
      }
    );
  }

  public updateRequestBtnOnLoad = false;
  updateRequest() {
    this.updateRequestBtnOnLoad = true;
    this.hrs.request(
      "put",
      `transaction/updateCICO?trans_id=${this.transactionDetails?._id}&cid=${
        this.cashinForm.get("cid")!.value
      }`,
      this.cashinForm.value,
      async (data: any) => {
        if (data.success) {
          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              title: "Success!",
              message: "Cashin Request <b>has been updated</b>.",
            },
          });
          this.viewType = "table";
          this.resetCashinForm();
          this.getCashIns();
          this.hideMainButton.emit(false);

          // this.socket.sendMessage({ type: "newCashout", data: data.data });
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

          this.updateRequestBtnOnLoad = false;
        }
      }
    );
  }
  cancel() {
    this.viewType = "table";
    this.resetCashinForm();
    this.resetApproveCashinForm();
    this.hideMainButton.emit(false);
  }

  resetCashinForm() {
    this.cashinForm.reset();
    this.cashinForm.patchValue({
      type: 1,
      fee_payment_is_gcash: "false",
    });
  }

  resetApproveCashinForm() {
    this.approveCashinForm.reset();
    this.approveCashinForm.patchValue({
      screenshot: "",
    });
  }
}
