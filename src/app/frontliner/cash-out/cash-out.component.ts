import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { WebcamImage, WebcamInitError, WebcamUtil } from "ngx-webcam";
import { Subject } from "rxjs";
import { Observable } from "rxjs-compat";
import { HttpRequestService } from "src/app/http-request/http-request.service";

@Component({
  selector: "app-cash-out",
  templateUrl: "./cash-out.component.html",
  styleUrls: ["./cash-out.component.css"],
})
export class CashOutComponent implements OnInit {
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
  constructor(private fb: FormBuilder, private hrs: HttpRequestService) {
    this.cashoutForm = this.fb.group({
      type: [2],
      fee_payment_is_gcash: ["false"],
      snapshot: ["", Validators.required],
      amount: ["", Validators.required],
      fee: ["", Validators.required],
      note: [""],
    });

    console.log(2);
  }

  ngOnInit(): void {
    this.readAvailableVideoInputs();
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

  sendRequest() {
    console.log(this.cashoutForm.value);

    this.hrs.request(
      "post",
      `transaction/addTransaction`,
      this.cashoutForm.value,
      async (data: any) => {
        console.log(data);
        // if (data.success) {
        //   this.editCurrentBookInTable(oldData._id, newData);
        // } else {
        //   if (data.message == "Restricted") {
        //     this.dialog.open(PopUpModalComponent, {
        //       width: "500px",
        //       data: {
        //         deletebutton: false,
        //         title: "Access Denied",
        //         message:
        //           "Oops, It looks like you <b>dont have access</b> on this feature.",
        //       },
        //     });
        //   }
        // }
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
