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
import { WebcamImage, WebcamInitError, WebcamUtil } from "ngx-webcam";
import { Subject, Subscription } from "rxjs";
import { Observable } from "rxjs-compat";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { PopUpModalComponent } from "../../modals/pop-up-modal/pop-up-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { animate, style, transition, trigger } from "@angular/animations";
import { TransactionStatus, TransactionStatusLabels } from "../../shared/enums";
import { SocketService } from "src/app/shared/socket/socket.service";
import { AudioService } from "src/app/shared/audio/audio.service";
import * as moment from "moment";
import * as _ from "lodash";

interface ICashOuts {
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
  styleUrls: ["./cash-out.component.css"],
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

  // toggle webcam on/off
  public showWebcam = true;
  public multipleWebcamsAvailable = false;

  // latest snapshot
  public webcamImage: WebcamImage | null = null;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<
    boolean | string
  >();

  private socketSubscription: Subscription;
  public cashoutForm: FormGroup;
  public transactionDetails: any = {};
  constructor(
    private fb: FormBuilder,
    private hrs: HttpRequestService,
    private dialog: MatDialog,
    public audio: AudioService,
    private socket: SocketService,
    private elRef: ElementRef
  ) {
    this.cashoutForm = this.fb.group({
      type: [2],
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

        this.triggerAudioBtn.nativeElement.click();
      }

      if (message.type === "newCashout") {
        if (_.size(this.cashOuts) === 3) this.cashOuts.pop();
        this.cashOuts.unshift(message.data);
        this.triggerAudioBtn.nativeElement.click();
      }

      if (message.type === "updateTransactionDetails") {
        this.transactionDetails.runbal_gcash = message.data.runbal_gcash;
        this.transactionDetails.runbal_cash_on_hand =
          message.data.runbal_cash_on_hand;
        this.triggerAudioBtn.nativeElement.click();
      }
    });
  }

  async ngOnInit(): Promise<any> {
    await this.getTransaction();
    this.readAvailableVideoInputs();
  }

  ngOnDestroy(): void {
    this.socketSubscription.unsubscribe();
  }

  public getTransaction(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Parse the client date and assume it's in the client's local timezone
      const startDate = moment().startOf("day").format("YYYY-MM-DDTHH:mm:ss");
      const endDate = moment().endOf("day").format("YYYY-MM-DDTHH:mm:ss");

      this.hrs.request(
        "get",
        "transaction/getTransaction",
        { startDate, endDate },
        async (res: any) => {
          if (!_.has(res, "data")) {
            this.viewType = "noTransaction";
          } else if (res.success) {
            this.transactionDetails = res.data;

            this.getCashOuts();
          }

          resolve();
        }
      );
    });
  }

  public getCashOuts() {
    this.cashOutTableOnLoad = true;
    this.hrs.request(
      "get",
      "transaction/getCashOuts",
      { ...this.filters, transaction_id: this.transactionDetails?._id },
      async (res: IResponse) => {
        if (!_.has(res, "data")) {
        } else if (res.success) {
          console.log(234234);
          const { total, page, pages } = res.data.meta;
          this.cashOuts = res.data.items;
          this.currentPage = page;
          this.counts = total;
          this.pages = pages;
        }

        this.cashOutTableOnLoad = false;
      }
    );
  }

  emittedButton(event: { type: string; data: any }) {
    console.log(4545454, event);
    switch (event.type) {
      case "approve":
        this.updateTransactionStatus(
          TransactionStatus.Approved,
          event.data?.cid
        );
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
      case "cashoutFormView":
        this.hideMainButton.emit(true);
        this.viewType = "addCashout";
        break;
    }
  }

  cancel() {
    this.viewType = "table";
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

  public updateTransactionStatus(status: number, cid: any) {
    this.hrs.request(
      "put",
      `transaction/updateTransactionStatus?trans_id=${this.transactionDetails?._id}&cid=${cid}`,
      { status: status, type: 2 },
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

          this.socket.sendMessage({
            type: "updateTransactionStatus",
            data: { _id: cid, status },
          });

          // if (status === TransactionStatus.Approved) {
          //   await this.getTransaction();
          // }else{

          // }

          this.cashOuts = this.cashOuts.map((cashout: any) => {
            if (cashout._id === cid) {
              if (status === TransactionStatus.Approved) {
                this.transactionDetails.runbal_gcash += cashout.amount;
                this.transactionDetails.runbal_cash_on_hand -=
                  cashout.amount - cashout.fee;
              } else {
                this.transactionDetails.runbal_gcash -= cashout.amount;
                this.transactionDetails.runbal_cash_on_hand +=
                  cashout.amount - cashout.fee;
              }

              cashout.status = status;
            }
            return { ...cashout };
          });

          this.socket.sendMessage({
            type: "updateTransactionDetails",
            data: {
              runbal_gcash: this.transactionDetails.runbal_gcash,
              runbal_cash_on_hand: this.transactionDetails.runbal_cash_on_hand,
            },
          });

          this.cashOuts = this.cashOuts.map((cashout) => {
            if (cashout._id === cid) {
              cashout.status = status;
            }

            return { ...cashout };
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

  public sendRequestBtnOnLoad = false;
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
          this.viewType = "table";
          this.resetCashoutForm();
          this.getCashOuts();
          this.hideMainButton.emit(false);
          this.socket.sendMessage({ type: "newCashout", data: data.data });
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

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public recapture(): void {
    this.cashoutForm.patchValue({
      snapshot: "",
    });
    this.webcamImage = null;
  }

  public handleInitError(error: WebcamInitError): void {
    if (
      error.mediaStreamError &&
      error.mediaStreamError.name === "NotAllowedError"
    ) {
    }
  }

  public handleImage(webcamImage: any): void {
    this.webcamImage = webcamImage;
    this.cashoutForm.patchValue({
      snapshot: webcamImage?._imageAsDataUrl,
    });
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }

  public get videoOptions(): MediaTrackConstraints {
    const result: MediaTrackConstraints = {};

    result.facingMode = { ideal: "environment" };

    return result;
  }

  public cameraWasSwitched(deviceId: string): void {
    this.readAvailableVideoInputs();
  }

  private readAvailableVideoInputs() {
    WebcamUtil.getAvailableVideoInputs().then(
      (mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      }
    );
  }
}
