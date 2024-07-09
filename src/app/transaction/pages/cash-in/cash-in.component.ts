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
import { PopUpModalComponent } from "../../../modals/pop-up-modal/pop-up-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { animate, style, transition, trigger } from "@angular/animations";
import {
  TransactionStatus,
  TransactionStatusLabels,
} from "../../../shared/enums";
import { SocketService } from "src/app/shared/socket/socket.service";
import { Subscription } from "rxjs";
import { AudioService } from "src/app/shared/audio/audio.service";
import * as _ from "lodash";
import { ViewNoteModalComponent } from "src/app/modals/view-note-modal/view-note-modal.component";
import { ViewSnapshotModalComponent } from "src/app/modals/view-snapshot-modal/view-snapshot-modal.component";
import { TransactionDetailsService } from "../../shared/services/transaction-details/transaction-details.service";
import { ActivatedRoute } from "@angular/router";
import { Clipboard } from "@angular/cdk/clipboard";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ImagePreloadService } from "src/app/shared/services/image-preload.service";
import { PushNotificationService } from "src/app/shared/services/push-notification/push-notification.service";
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
  styleUrls: ["./cash-in.component.scss"],
  animations: [
    trigger("fade", [
      transition("void => *", [
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 })),
      ]),
    ]),
  ],
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

  //subscriptions
  private socketSubscription: Subscription;
  private routeSubscription: Subscription;

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
    private transactionDetailsService: TransactionDetailsService,
    private route: ActivatedRoute,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private imagePreloadService: ImagePreloadService,
    private pushNotificationService: PushNotificationService
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

    this.socketSubscription = this.socket
      .onMessage()
      .subscribe(async (message) => {
        if (message.type === "updateTransactionStatus") {
          let found = 0;
          this.cashIns = this.cashIns.map((cashin: ICashIns) => {
            if (cashin._id === message.data._id) {
              cashin.status = message.data.status;
              cashin.snapshot = message.data.snapshot;
              found = 1;
            }
            return { ...cashin };
          });

          if (found === 1) {
            await this.imagePreloadService.preload([message.data.snapshot]);
          }
        }

        if (message.type === "newCashin") {
          if (_.size(this.cashIns) === 3) this.cashIns.pop();
          if (_.size(this.cashIns) === 0) {
            this.currentPage = 1;
            this.viewType = "table";
          }

          this.cashIns.unshift(message.data);
          this.counts += 1;
          this.pages = Math.ceil(this.counts / 3);
        }

        if (message.type === "updateCashin") {
          this.cashIns = this.cashIns.map((cashin: ICashIns) => {
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
            }
            return { ...cashin };
          });
        }
      });

    //Checks if route has tid param
    this.routeSubscription = this.route.queryParams.subscribe((params: any) => {
      if (params["tid"]) {
        this.transactionDetails._id = params["tid"];
        this.getCashIns();
      } else {
        this.viewType = "noTransaction";
      }
    });
    //end
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.socketSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }

  screenshotUploadHandler(event: any) {
    this.approveCashinForm.patchValue({
      screenshot: event.target.files[0].name,
    });
    console.log("--------------", this.approveCashinForm);
    this.screenshotFile = event.target.files[0];
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
        if (res.success && _.has(res, "data")) {
          const preloadPromises = res.data.items.map((cashin) => {
            if (cashin.snapshot)
              this.imagePreloadService.preload([cashin.snapshot]);
          });
          await Promise.all(preloadPromises);

          const { total, page, pages } = res.data.meta;
          this.cashIns = res.data.items;
          this.currentPage = page;
          this.counts = total;
          this.pages = pages;
        } else {
          this.viewType = "noTransaction";
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
        if (event.data.currentStatus !== 2) {
          this.viewType = "approveCashin";
          this.hideMainButton.emit(true);
          this.approveTransactionDetails = event.data;
        }
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
        this.edit(event);
        break;
      case "viewNote":
        this.viewNote(event);
        break;
      case "viewSnapshot":
        this.viewSnapshot(event);
        break;
      case "copy":
        this.copy(event.data);
        break;
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
    if (event.currentStatus !== newStatus) {
      if (newStatus === TransactionStatus.Approved) {
        // Indicate that the approve request button is in loading state
        this.approveReqBtnOnLoad = true;
      }

      // Make an HTTP PUT request to update the transaction status
      this.hrs.request(
        "put",
        `transaction/updateTransactionStatus?trans_id=${this.transactionDetails?._id}&cid=${event.cid}`,
        formData ? formData : { status: newStatus, type: 1 },
        async (data: any) => {
          if (data.success) {
            let CIhaveChanges = false;

            // If transitioning from pending, failed, or cancelled to approved
            if (formData) {
              // Update the view type, reset the approval form, and hide the main button
              this.viewType = "table";
              this.resetApproveCashinForm();
              this.hideMainButton.emit(false);
              this.approveTransactionDetails = {};
              this.approveReqBtnOnLoad = false;

              // Update the cashIns array based on the new status
              this.cashIns = this.cashIns.map((cashin: any) => {
                if (cashin._id === event.cid) {
                  // Find the updated cashin details from the response
                  const [updatedCashin] = data.data.cashin.filter(
                    (udpdatedCashin: any) => udpdatedCashin._id === event.cid
                  );
                  cashin.status = newStatus;
                  cashin.snapshot = updatedCashin.snapshot;

                  // Update the state of transaction details
                  this.transactionDetailsService.update({
                    runbal_gcash: {
                      data: cashin.amount,
                      operation: "subtract",
                    },
                    runbal_cash_on_hand: {
                      data: cashin.amount + cashin.fee,
                      operation: "sum",
                    },
                  });

                  // Notify all users about the updated transaction details via WebSocket
                  this.socket.sendMessage({
                    type: "updateTransactionDetails",
                    data: {
                      runbal_gcash: {
                        data: cashin.amount,
                        operation: "subtract",
                      },
                      runbal_cash_on_hand: {
                        data: cashin.amount + cashin.fee,
                        operation: "sum",
                      },
                    },
                  });
                }

                return { ...cashin };
              });

              CIhaveChanges = true;
            } else {
              // Handle non-approval status changes

              this.cashIns = this.cashIns.map((cashin: any) => {
                if (cashin._id === event.cid) {
                  // Handle status transition from approved to cancelled or failed
                  if (
                    cashin.status === TransactionStatus.Approved &&
                    [
                      TransactionStatus.Cancelled,
                      TransactionStatus.Failed,
                    ].includes(newStatus)
                  ) {
                    // Update the state of transaction details
                    this.transactionDetailsService.update({
                      runbal_gcash: {
                        data: cashin.amount,
                        operation: "sum",
                      },
                      runbal_cash_on_hand: {
                        data: cashin.amount + cashin.fee,
                        operation: "subtract",
                      },
                    });

                    // Notify all users about the updated transaction details via WebSocket
                    this.socket.sendMessage({
                      type: "updateTransactionDetails",
                      data: {
                        runbal_gcash: {
                          data: cashin.amount,
                          operation: "sum",
                        },
                        runbal_cash_on_hand: {
                          data: cashin.amount + cashin.fee,
                          operation: "subtract",
                        },
                      },
                    });

                    // Update the cashout status to the new status
                    cashin.status = newStatus;
                    CIhaveChanges = true;
                  }

                  // If transitioning between failed to cancelled, cancelled to failed, pending to cancelled, or pending to failed
                  else if (
                    [
                      TransactionStatus.Cancelled,
                      TransactionStatus.Failed,
                      TransactionStatus.Pending,
                    ].includes(cashin.status) &&
                    [
                      TransactionStatus.Cancelled,
                      TransactionStatus.Failed,
                    ].includes(newStatus)
                  ) {
                    cashin.status = newStatus;
                    CIhaveChanges = true;
                  }
                }

                return { ...cashin };
              });
            }

            // If there were changes to any cashins, notify via WebSocket and show success dialog
            if (CIhaveChanges) {
              // Find the updated cashin details from the response
              const [updatedData] = data.data.cashin.filter((data: any) => {
                if (data._id === event.cid) return data;
              });

              // Notify all users about the updated transaction details via WebSocket
              this.socket.sendMessage({
                type: "updateTransactionStatus",
                data: {
                  _id: event.cid,
                  status: newStatus,
                  snapshot: updatedData.snapshot,
                },
              });

              // Show a success dialog
              this.dialog.open(PopUpModalComponent, {
                width: "500px",
                data: {
                  deletebutton: false,
                  okaybutton: true,
                  title: "Success!",
                  message: "Transaction status <b>has been updated</b>.",
                },
              });
            }
          } else {
            // Handle error responses
            if (data.error.message == "Restricted") {
              // Show an access denied dialog
              this.dialog.open(PopUpModalComponent, {
                width: "500px",
                data: {
                  deletebutton: false,
                  okaybutton: true,
                  title: "Access Denied",
                  message:
                    "Oops, It looks like you <b>dont have access</b> on this feature.",
                },
              });
            } else {
              // Show a server error dialog
              this.dialog.open(PopUpModalComponent, {
                width: "500px",
                data: {
                  deletebutton: false,
                  okaybutton: true,
                  title: "Server Error",
                  message: data?.error?.message,
                },
              });
            }
          }
        }
      );
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
              okaybutton: true,
              title: "Success!",
              message: "Cashin Request <b>has been sent</b>.",
            },
          });
          await this.getCashIns();
          this.hideMainButton.emit(false);
          this.socket.sendMessage({ type: "newCashin", data: data.data });
          this.viewType = "table";
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
              okaybutton: true,
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
              okaybutton: true,
              title: "Success!",
              message: "Cashin Request <b>has been updated</b>.",
            },
          });
          console.log("--------2", this.cashinForm.value);
          if (TransactionStatus.Approved === this.previousCI.status) {
            //removed the calculation of recent transaction
            this.transactionDetailsService.update({
              runbal_gcash: {
                data: this.previousCI.amount - this.previousCI.fee,
                operation: "sum",
              },
              runbal_cash_on_hand: {
                data: this.previousCI.amount,
                operation: "subtract",
              },
            });
            this.socket.sendMessage({
              type: "updateTransactionDetails",
              data: {
                runbal_gcash: {
                  data: this.previousCI.amount - this.previousCI.fee,
                  operation: "sum",
                },
                runbal_cash_on_hand: {
                  data: this.previousCI.amount,
                  operation: "subtract",
                },
              },
            });
            //end

            //added the calculation of new transaction
            this.transactionDetailsService.update({
              runbal_gcash: {
                data: updatedCI.amount - updatedCI.fee,
                operation: "subtract",
              },
              runbal_cash_on_hand: {
                data: updatedCI.amount,
                operation: "sum",
              },
            });
            this.socket.sendMessage({
              type: "updateTransactionDetails",
              data: {
                runbal_gcash: {
                  data: updatedCI.amount - updatedCI.fee,
                  operation: "subtract",
                },
                runbal_cash_on_hand: {
                  data: updatedCI.amount,
                  operation: "sum",
                },
              },
            });
            //end
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
                okaybutton: true,
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
              okaybutton: true,
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
    if (_.size(this.cashIns) === 0) this.viewType = "noTransaction";
    else this.viewType = "table";

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

  private edit(event: any) {
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
  }

  private viewNote(event: any) {
    this.dialog.open(ViewNoteModalComponent, {
      width: "500px",
      data: event.data,
    });
  }

  private viewSnapshot(event: any) {
    this.dialog.open(ViewSnapshotModalComponent, {
      width: "500px",
      data: event.data,
    });
  }

  private copy(event: string) {
    let phone_number = event.slice(1, 11);
    this.clipboard.copy(phone_number);

    const dialog = this.dialog.open(PopUpModalComponent, {
      width: "200px",
      data: {
        deletebutton: false,
        okaybutton: false,
        title: "",
        message: "Copy!",
      },
    });

    dialog.afterOpened().subscribe((_) => {
      setTimeout(() => {
        dialog.close();
      }, 2000);
    });
  }
}
