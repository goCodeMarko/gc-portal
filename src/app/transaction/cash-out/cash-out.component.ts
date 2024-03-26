import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { WebcamImage, WebcamInitError, WebcamUtil } from "ngx-webcam";
import { Subject } from "rxjs";
import { Observable } from "rxjs-compat";
import { HttpRequestService } from "src/app/http-request/http-request.service";
import { PopUpModalComponent } from "../../modals/pop-up-modal/pop-up-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { animate, style, transition, trigger } from "@angular/animations";
import { TransactionStatus, TransactionStatusLabels } from "../../shared/enums";

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
export class CashOutComponent implements OnInit {
  @Output() hideLogoutButton = new EventEmitter<boolean>();

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
  public cashoutForm: FormGroup;
  constructor(
    private fb: FormBuilder,
    private hrs: HttpRequestService,
    private dialog: MatDialog
  ) {
    this.cashoutForm = this.fb.group({
      type: [2],
      fee_payment_is_gcash: ["false"],
      snapshot: ["", Validators.required],
      amount: ["", Validators.required],
      fee: ["", Validators.required],
      note: [""],
    });
  }

  ngOnInit(): void {
    this.getCashOuts();
    this.readAvailableVideoInputs();
  }

  public getCashOuts() {
    this.hrs.request(
      "get",
      "transaction/getCashOuts",
      this.filters,
      async (res: IResponse) => {
        const { total, page, pages } = res.data.meta;
        this.cashOuts = res.data.items;
        this.currentPage = page;
        this.counts = total;
        this.pages = pages;

        console.log(121321, this.cashOuts);
      }
    );
  }

  emittedButton(event: { type: string; data: any }) {
    console.log("cash out component:updateTransactionStatus ", event);
    switch (event.type) {
      case "approve":
        this.updateTransactionStatus(
          TransactionStatus.Approved,
          event.data?.trans_id
        );
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
      case "cashoutFormView":
        this.hideLogoutButton.emit(true);
        this.viewType = "addCashout";
        break;
    }
  }

  cancel() {
    this.viewType = "table";
    this.resetCashoutForm();
    this.hideLogoutButton.emit(false);
  }

  resetCashoutForm() {
    this.cashoutForm.reset();
    this.webcamImage = null;

    this.cashoutForm.patchValue({
      type: 2,
      fee_payment_is_gcash: "false",
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

  public updateTransactionStatus(status: number, trans_id: any) {
    console.log("cash out component: ", status);
    console.log("cash out component: ", trans_id);
    this.hrs.request(
      "put",
      `transaction/updateTransactionStatus?trans_id=${trans_id}`,
      { status: status },
      async (data: any) => {
        console.log("cashout component: updateTransactionStatus", data);
        if (data.success) {
          this.dialog.open(PopUpModalComponent, {
            width: "1000px",
            data: {
              deletebutton: false,
              title: "Success!",
              message: "Transaction status <b>has been updated</b>.",
            },
          });

          this.cashOuts = this.cashOuts.map((cashout) => {
            if (cashout._id === trans_id) {
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

  sendRequest() {
    this.hrs.request(
      "post",
      `transaction/addTransaction`,
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
