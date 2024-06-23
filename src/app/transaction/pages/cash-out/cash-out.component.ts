import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { PopUpModalComponent } from "../../../modals/pop-up-modal/pop-up-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { animate, style, transition, trigger } from "@angular/animations";
import {
  TransactionStatus,
  TransactionStatusLabels,
} from "../../../shared/enums";
import { SocketService } from "src/app/shared/socket/socket.service";
import { AudioService } from "src/app/shared/audio/audio.service";
import * as _ from "lodash";
import { ViewNoteModalComponent } from "src/app/modals/view-note-modal/view-note-modal.component";
import { ViewSnapshotModalComponent } from "src/app/modals/view-snapshot-modal/view-snapshot-modal.component";
import { ActivatedRoute } from "@angular/router";
import { TransactionDetailsService } from "../../shared/services/transaction-details/transaction-details.service";
import { CameraModalComponent } from "src/app/modals/camera-modal/camera-modal.component";

interface ICashOuts {
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
    items: ICashOuts[];
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
  selector: "app-cash-out",
  templateUrl: "./cash-out.component.html",
  styleUrls: ["./cash-out.component.scss"],
  animations: [
    trigger("fade", [
      transition("void => *", [
        style({ opacity: 0 }),
        animate(300, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class CashOutComponent implements OnInit, OnDestroy {
  @Output() hideMainButton = new EventEmitter<boolean>();
  @ViewChild("triggerAudioBtn") triggerAudioBtn!: ElementRef;
  @ViewChild("imageContainer") imageContainer!: ElementRef;
  @ViewChild("openCameraInput") openCameraInput!: ElementRef;
  //tables
  cashOuts: ICashOuts[] = [];
  viewType = "table";
  counts = 0;
  pages = 0;
  currentPage = 0;
  filters = {
    search: "",
    skip: 3,
    dateStart: "",
    dateEnd: "",
    skipCount: 0,
    limit: 3,
  };
  cashOutTableOnLoad: boolean = true;

  private socketSubscription: Subscription;
  private routeSubscription: Subscription;
  public cashoutForm: FormGroup;
  public transactionDetails: any = {};
  public sendRequestBtnOnLoad = false;
  public updateRequestBtnOnLoad = false;
  public webcamImage: object | null | string = null; //latest snapshot

  constructor(
    private fb: FormBuilder,
    private hrs: HttpRequestService,
    private dialog: MatDialog,
    public audio: AudioService,
    private socket: SocketService,
    private transactionDetailsService: TransactionDetailsService,
    private route: ActivatedRoute
  ) {
    this.cashoutForm = this.fb.group({
      type: [2],
      cid: [""],
      fee_payment_is_gcash: ["true"],
      snapshot: ["", Validators.required],
      amount: ["", Validators.required],
      fee: ["", Validators.required],
      note: [""],
    });

    this.socketSubscription = this.socket.onMessage().subscribe((message) => {
      if (message.type === "updateTransactionStatus") {
        this.cashOuts = this.cashOuts.map((cashout: ICashOuts) => {
          if (cashout._id === message.data._id) {
            cashout.status = message.data.status;
          }
          return { ...cashout };
        });
      }

      if (message.type === "newCashout") {
        console.log("-----------", message);
        if (_.size(this.cashOuts) === 3) this.cashOuts.pop();
        if (_.size(this.cashOuts) === 0) {
          this.viewType = "table";
          this.currentPage = 1;
        }
        this.cashOuts.unshift(message.data);
        this.counts += 1;
        this.pages = Math.ceil(this.counts / 3);
      }

      if (message.type === "updateCashout") {
        this.cashOuts = this.cashOuts.map((cashout: ICashOuts) => {
          if (cashout._id === message.data.cid) {
            cashout.amount =
              message.data.fee_payment_is_gcash === "true"
                ? message.data.amount + message.data.fee
                : message.data.amount;
            cashout.fee = message.data.fee;
            cashout.fee_payment_is_gcash =
              message.data.fee_payment_is_gcash === "true";
            cashout.note = message.data.note;
            cashout.snapshot = message.data.snapshot;
          }
          return { ...cashout };
        });
      }
    });

    //Checks if route has tid param
    this.routeSubscription = this.route.queryParams.subscribe((params: any) => {
      if (params["tid"]) {
        this.transactionDetails._id = params["tid"];
        this.getCashOuts();
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

  public openCamera(): void {
    this.openCameraInput.nativeElement.click();
  }
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.webcamImage = e.target!.result;
        this.cashoutForm.patchValue({
          snapshot: e.target?.result,
        });

        const img = document.createElement("img");
        img.src = e.target?.result as string;
        img.style.maxWidth = "100%"; // Optional: Style the image
        img.style.height = "auto";
        console.log(2343242, e.target?.result);
        // Clear previous content if any
        this.imageContainer.nativeElement.innerHTML = "";

        // Append the new image
        this.imageContainer.nativeElement.appendChild(img);
      };

      reader.readAsDataURL(file);
    }
  }

  public getCashOuts() {
    this.cashOutTableOnLoad = true;
    this.hrs.request(
      "get",
      "transaction/getCashOuts",
      { ...this.filters, transaction_id: this.transactionDetails?._id },
      async (res: IResponse) => {
        if (res.success && _.has(res, "data")) {
          this.hideMainButton.emit(false);
          const { total, page, pages } = res.data.meta;
          this.cashOuts = res.data.items;
          this.currentPage = page;
          this.counts = total;
          this.pages = pages;
        } else {
          this.viewType = "noTransaction";
        }

        this.cashOutTableOnLoad = false;
      }
    );
  }
  // public openCamera(): void {
  //   this.dialog
  //     .open(CameraModalComponent, {
  //       height: "465px",
  //       width: "331px",
  //       hasBackdrop: true,
  //       data: {},
  //     })
  //     .componentInstance.result.subscribe((data) => {
  //       console.log("CASHOUT COMPONENT: ", data);
  //       this.webcamImage = data;
  //       this.cashoutForm.patchValue({
  //         snapshot: data?._imageAsDataUrl,
  //       });
  //     });
  // }
  // public recapture(): void {
  //   this.cashoutForm.patchValue({
  //     snapshot: "",
  //   });
  //   this.webcamImage = null;
  // }

  private previousCO!: {
    fee_payment_is_gcash: boolean;
    amount: number;
    fee: number;
    status: number;
  };
  emittedButton(event: { type: string; data: any }) {
    switch (event.type) {
      case "approve":
        this.updateTransactionStatus(TransactionStatus.Approved, event.data);
        break;
      case "cancel":
        this.updateTransactionStatus(TransactionStatus.Cancelled, event.data);
        break;
      case "fail":
        this.updateTransactionStatus(TransactionStatus.Failed, event.data);
        break;
      case "cashoutFormView":
        this.hideMainButton.emit(true);
        this.viewType = "addCashout";
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
          snapshot,
        } = event.data;

        this.cashoutForm.patchValue({
          phone_number: phone_number,
          cid: _id,
          fee_payment_is_gcash: String(fee_payment_is_gcash),
          amount: fee_payment_is_gcash ? amount - fee : amount,
          fee: fee,
          note: note,
          snapshot: snapshot,
        });
        this.previousCO = {
          fee_payment_is_gcash: fee_payment_is_gcash,
          amount: fee_payment_is_gcash ? amount - fee : amount,
          fee: fee,
          status: status,
        };
        this.webcamImage = { imageAsDataUrl: event.data.snapshot };
        this.viewType = "editCashout";
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
        break;
    }
  }

  cancel() {
    if (_.size(this.cashOuts) === 0) this.viewType = "noTransaction";
    else this.viewType = "table";

    this.resetCashoutForm();
    this.hideMainButton.emit(false);
  }

  resetCashoutForm() {
    this.cashoutForm.reset();
    this.webcamImage = null;

    this.cashoutForm.patchValue({
      type: 2,
      fee_payment_is_gcash: "true",
    });
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

  public checkFormControlErrors(name: string): boolean {
    let result = false;
    if (
      this.cashoutForm.get(name)?.invalid &&
      this.cashoutForm.get(name)?.errors &&
      (this.cashoutForm.get(name)?.dirty || this.cashoutForm.get(name)?.touched)
    ) {
      result = true;
    }

    return result;
  }

  public updateTransactionStatus(newStatus: number, event: any) {
    this.hrs.request(
      "put",
      `transaction/updateTransactionStatus?trans_id=${this.transactionDetails?._id}&cid=${event.cid}`,
      { status: newStatus, type: 2 },
      async (data: any) => {
        if (data.success) {
          this.socket.sendMessage({
            type: "updateTransactionStatus",
            data: { _id: data.cid, status },
          });

          let COhaveChanges = false;

          this.cashOuts = this.cashOuts.map((cashout: any) => {
            if (cashout._id === event.cid) {
              // from pending, failed, cancelled to approve
              if (
                [
                  TransactionStatus.Cancelled,
                  TransactionStatus.Failed,
                  TransactionStatus.Pending,
                ].includes(cashout.status) &&
                newStatus === TransactionStatus.Approved
              ) {
                //to update transaction details for current user
                this.transactionDetailsService.update({
                  runbal_gcash: {
                    data: cashout.amount,
                    operation: "sum",
                  },
                  runbal_cash_on_hand: {
                    data: cashout.amount - cashout.fee,
                    operation: "subtract",
                  },
                });
                //end

                //to update transaction details for all users
                this.socket.sendMessage({
                  type: "updateTransactionDetails",
                  data: {
                    runbal_gcash: {
                      data: cashout.amount,
                      operation: "sum",
                    },
                    runbal_cash_on_hand: {
                      data: cashout.amount - cashout.fee,
                      operation: "subtract",
                    },
                  },
                });
                //end
                cashout.status = newStatus;
                COhaveChanges = true;
              }
              // from approved to cancelled or failed
              else if (
                cashout.status === TransactionStatus.Approved &&
                [
                  TransactionStatus.Cancelled,
                  TransactionStatus.Failed,
                ].includes(newStatus)
              ) {
                //to update transaction details for current user
                this.transactionDetailsService.update({
                  runbal_gcash: {
                    data: cashout.amount,
                    operation: "subtract",
                  },
                  runbal_cash_on_hand: {
                    data: cashout.amount - cashout.fee,
                    operation: "sum",
                  },
                });
                //end

                //to update transaction details for all users
                this.socket.sendMessage({
                  type: "updateTransactionDetails",
                  data: {
                    runbal_gcash: {
                      data: cashout.amount,
                      operation: "subtract",
                    },
                    runbal_cash_on_hand: {
                      data: cashout.amount - cashout.fee,
                      operation: "sum",
                    },
                  },
                });
                //end
                cashout.status = newStatus;
                COhaveChanges = true;
              }
              // from failed  to cancelled
              // from cancelled to failed
              // from pending  to cancelled
              // from pending  to failed
              else if (
                [
                  TransactionStatus.Cancelled,
                  TransactionStatus.Failed,
                  TransactionStatus.Pending,
                ].includes(cashout.status) &&
                [
                  TransactionStatus.Cancelled,
                  TransactionStatus.Failed,
                ].includes(newStatus)
              ) {
                cashout.status = newStatus;
                COhaveChanges = true;
              }
            }
            return { ...cashout };
          });

          if (COhaveChanges) {
            this.socket.sendMessage({
              type: "updateTransactionStatus",
              data: { _id: event.cid, status: newStatus },
            });

            this.dialog.open(PopUpModalComponent, {
              width: "500px",
              data: {
                deletebutton: false,
                title: "Success!",
                message: "Transaction status <b>has been updated</b>.",
              },
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
      }
    );
  }

  sendRequest() {
    this.sendRequestBtnOnLoad = true;
    this.hrs.request(
      "post",
      `transaction/addTransaction?trans_id=${this.transactionDetails?._id}`,
      this.cashoutForm.value,
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
          await this.getCashOuts();
          this.socket.sendMessage({ type: "newCashout", data: data.data });
          this.resetCashoutForm();
          this.hideMainButton.emit(false);
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
              title: "Server Error",
              message: data?.error?.message,
            },
          });

          this.sendRequestBtnOnLoad = false;
        }
      }
    );
  }

  updateRequest() {
    this.updateRequestBtnOnLoad = true;
    this.hrs.request(
      "put",
      `transaction/updateCICO?trans_id=${this.transactionDetails?._id}&cid=${
        this.cashoutForm.get("cid")!.value
      }`,
      this.cashoutForm.value,
      async (data: any) => {
        if (data.success) {
          const updatedCO = this.cashoutForm.value;

          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              title: "Success!",
              message: "Cashout Request <b>has been updated</b>.",
            },
          });

          if (TransactionStatus.Approved === this.previousCO.status) {
            //it will adjust the running balance based from previous CO
            if (this.previousCO.fee_payment_is_gcash) {
              this.transactionDetailsService.update({
                runbal_gcash: {
                  data: this.previousCO.amount + this.previousCO.fee,
                  operation: "subtract",
                },
                runbal_cash_on_hand: {
                  data: this.previousCO.amount,
                  operation: "sum",
                },
              });
              this.socket.sendMessage({
                type: "updateTransactionDetails",
                data: {
                  runbal_gcash: {
                    data: this.previousCO.amount + this.previousCO.fee,
                    operation: "subtract",
                  },
                  runbal_cash_on_hand: {
                    data: this.previousCO.amount,
                    operation: "sum",
                  },
                },
              });
            } else {
              this.transactionDetailsService.update({
                runbal_gcash: {
                  data: this.previousCO.amount,
                  operation: "subtract",
                },
                runbal_cash_on_hand: {
                  data: this.previousCO.amount - this.previousCO.fee,
                  operation: "sum",
                },
              });
              this.socket.sendMessage({
                type: "updateTransactionDetails",
                data: {
                  runbal_gcash: {
                    data: this.previousCO.amount,
                    operation: "subtract",
                  },
                  runbal_cash_on_hand: {
                    data: this.previousCO.amount - this.previousCO.fee,
                    operation: "sum",
                  },
                },
              });
            }

            //it will uodate the running balance based from updated CO
            if (updatedCO.fee_payment_is_gcash === "true") {
              this.transactionDetailsService.update({
                runbal_gcash: {
                  data: updatedCO.amount + updatedCO.fee,
                  operation: "sum",
                },
                runbal_cash_on_hand: {
                  data: updatedCO.amount,
                  operation: "subtract",
                },
              });
              this.socket.sendMessage({
                type: "updateTransactionDetails",
                data: {
                  runbal_gcash: {
                    data: updatedCO.amount + updatedCO.fee,
                    operation: "sum",
                  },
                  runbal_cash_on_hand: {
                    data: updatedCO.amount,
                    operation: "subtract",
                  },
                },
              });
            } else {
              this.transactionDetailsService.update({
                runbal_gcash: {
                  data: updatedCO.amount,
                  operation: "sum",
                },
                runbal_cash_on_hand: {
                  data: updatedCO.amount - updatedCO.fee,
                  operation: "subtract",
                },
              });
              this.socket.sendMessage({
                type: "updateTransactionDetails",
                data: {
                  runbal_gcash: {
                    data: updatedCO.amount + updatedCO.fee,
                    operation: "sum",
                  },
                  runbal_cash_on_hand: {
                    data: updatedCO.amount,
                    operation: "subtract",
                  },
                },
              });
            }
          }
          this.socket.sendMessage({ type: "updateCashout", data: updatedCO });

          this.viewType = "table";
          this.resetCashoutForm();
          this.getCashOuts();
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
}
