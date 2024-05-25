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
import { ViewNoteModalComponent } from "src/app/modals/view-note-modal/view-note-modal.component";
import { ViewSnapshotModalComponent } from "src/app/modals/view-snapshot-modal/view-snapshot-modal.component";

interface ICashIns {
  _id: string;
  amount: number;
  fee: number;
  fee_payment_is_gcash: boolean;
  snapshot: string;
  status: number;
  type: number;
  phone_number: string;
  note: string;
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
  public sendRequestBtnOnLoad = false;
  public updateRequestBtnOnLoad = false;

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
            cashin.snapshot = message.data.snapshot;
          }
          return { ...cashin };
        });
      }

      if (message.type === "newCashin") {
        if (_.size(this.cashIns) === 3) this.cashIns.pop();
        if (_.size(this.cashIns) === 0) this.currentPage = 1;
        this.cashIns.unshift(message.data);
        this.counts += 1;
        this.pages = Math.ceil(this.counts / 3);
      }

      if (message.type === "updateCashin") {
        console.log("----------", message.data);
        this.cashIns = this.cashIns.map((cashin: ICashIns) => {
          console.log("----------cashin", cashin);
          if (cashin._id === message.data.cid) {
            cashin.amount =
              message.data.fee_payment_is_gcash === "true"
                ? message.data.amount - message.data.fee
                : message.data.amount;
            cashin.fee = message.data.fee;
            cashin.fee_payment_is_gcash =
              message.data.fee_payment_is_gcash === "true";
            cashin.note = message.data.note;
            cashin.phone_number = message.data.phone_number;
            cashin.snapshot = message.data.snapshot;
          }
          return { ...cashin };
        });
      }

      if (message.type === "updateTransactionDetails") {
        this.transactionDetails.runbal_gcash = message.data.runbal_gcash;
        this.transactionDetails.runbal_cash_on_hand =
          message.data.runbal_cash_on_hand;

        console.log(2, message);
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

  private previousCI!: {
    fee_payment_is_gcash: boolean;
    amount: number;
    fee: number;
    status: number;
  };
  emittedButton(event: { type: string; data: any }) {
    switch (event.type) {
      case "approve":
        this.viewType = "approveCashin";
        this.hideMainButton.emit(true);
        this.approveTransactionDetails = event.data;
        break;
      case "cancel":
        this.updateTransactionStatus(TransactionStatus.Cancelled, event.data);
        break;
      case "fail":
        this.updateTransactionStatus(TransactionStatus.Failed, event.data);
        break;
      case "cashinFormView":
        this.hideMainButton.emit(true);
        this.viewType = "addCashin";
        this.sendRequestBtnOnLoad = false;
        break;
      case "edit":
        this.hideMainButton.emit(true);
        this.updateRequestBtnOnLoad = false;
        const {
          phone_number,
          _id,
          fee_payment_is_gcash,
          amount,
          fee,
          note,
          status,
        } = event.data;
        this.cashinForm.patchValue({
          phone_number: phone_number,
          cid: _id,
          fee_payment_is_gcash: String(fee_payment_is_gcash),
          amount: fee_payment_is_gcash ? amount + fee : amount,
          fee: fee,
          note: note,
        });
        this.previousCI = {
          fee_payment_is_gcash: fee_payment_is_gcash,
          amount: fee_payment_is_gcash ? amount + fee : amount,
          fee: fee,
          status: status,
        };
        this.viewType = "editCashin";
        break;
      case "viewNote":
        this.dialog.open(ViewNoteModalComponent, {
          width: "500px",
          data: event.data,
        });
        break;
      case "viewSnapshot":
        this.dialog.open(ViewSnapshotModalComponent, {
          width: "500px",
          data: event.data,
        });
    }
  }

  public approveRequest() {
    const formData = new FormData();
    formData.append("status", "2");
    formData.append("type", "1");
    formData.append("screenshot", this.screenshotFile);
    this.updateTransactionStatus(2, this.approveTransactionDetails, formData);
  }

  public approveReqBtnOnLoad = false;
  public async updateTransactionStatus(
    newStatus: number,
    event: any,
    formData?: any
  ) {
    if (newStatus === TransactionStatus.Approved)
      this.approveReqBtnOnLoad = true;
    this.hrs.request(
      "put",
      `transaction/updateTransactionStatus?trans_id=${this.transactionDetails?._id}&cid=${event.cid}`,
      formData ? formData : { status: newStatus, type: 1 },
      async (data: any) => {
        if (data.success) {
          let CIhaveChanges = false;

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
            CIhaveChanges = true;
            this.approveReqBtnOnLoad = false;
          } else {
            this.cashIns = this.cashIns.map((cashin: any) => {
              if (cashin._id === event.cid) {
                if (
                  newStatus === TransactionStatus.Approved &&
                  [
                    TransactionStatus.Cancelled,
                    TransactionStatus.Failed,
                    TransactionStatus.Pending,
                  ].includes(cashin.status)
                ) {
                  this.transactionDetails.runbal_gcash += cashin.amount;
                  this.transactionDetails.runbal_cash_on_hand -=
                    cashin.amount - cashin.fee;
                  cashin.status = newStatus;
                  CIhaveChanges = true;
                } else if (
                  ([
                    TransactionStatus.Cancelled,
                    TransactionStatus.Failed,
                    TransactionStatus.Pending,
                  ].includes(newStatus) &&
                    cashin.status === TransactionStatus.Approved) ||
                  ([
                    TransactionStatus.Cancelled,
                    TransactionStatus.Pending,
                  ].includes(newStatus) &&
                    cashin.status === TransactionStatus.Failed) ||
                  ([
                    TransactionStatus.Failed,
                    TransactionStatus.Pending,
                  ].includes(newStatus) &&
                    cashin.status === TransactionStatus.Cancelled)
                ) {
                  if (
                    [
                      TransactionStatus.Cancelled,
                      TransactionStatus.Failed,
                      TransactionStatus.Pending,
                    ].includes(newStatus) &&
                    cashin.status === TransactionStatus.Approved
                  ) {
                    this.transactionDetails.runbal_gcash += cashin.amount;
                    this.transactionDetails.runbal_cash_on_hand -=
                      cashin.amount + cashin.fee;
                  }
                  cashin.status = newStatus;
                  CIhaveChanges = true;
                }
              }

              return { ...cashin };
            });
          }

          if (CIhaveChanges) {
            this.dialog.open(PopUpModalComponent, {
              width: "500px",
              data: {
                deletebutton: false,
                title: "Success!",
                message: "Transaction status <b>has been updated</b>.",
              },
            });

            this.socket.sendMessage({
              type: "updateTransactionDetails",
              data: {
                runbal_gcash: this.transactionDetails.runbal_gcash,
                runbal_cash_on_hand:
                  this.transactionDetails.runbal_cash_on_hand,
              },
            });
            console.log(12312321312, data);
            const [updatedData] = data.data.cashin.filter((data: any) => {
              if (data._id === event.cid) return data;
            });

            this.socket.sendMessage({
              type: "updateTransactionStatus",
              data: {
                _id: event.cid,
                status: newStatus,
                snapshot: updatedData.snapshot,
              },
            });
          }
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
          const updatedCI = this.cashinForm.value;

          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              title: "Success!",
              message: "Cashin Request <b>has been updated</b>.",
            },
          });

          if (TransactionStatus.Approved === this.previousCI.status) {
            console.log("----------------edit approved");
            this.transactionDetails.runbal_cash_on_hand -=
              this.previousCI.amount;
            this.transactionDetails.runbal_gcash +=
              this.previousCI.amount - this.previousCI.fee;
            const updatedCI = this.cashinForm.value;

            this.transactionDetails.runbal_cash_on_hand += updatedCI.amount;
            this.transactionDetails.runbal_gcash -=
              updatedCI.amount - updatedCI.fee;

            this.socket.sendMessage({
              type: "updateTransactionDetails",
              data: {
                runbal_gcash: this.transactionDetails.runbal_gcash,
                runbal_cash_on_hand:
                  this.transactionDetails.runbal_cash_on_hand,
              },
            });
          }
          this.socket.sendMessage({ type: "updateCashin", data: updatedCI });

          this.viewType = "table";
          this.resetCashinForm();
          this.getCashIns();
          this.hideMainButton.emit(false);
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
