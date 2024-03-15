import { Component, OnInit } from "@angular/core";
import { WebcamImage, WebcamInitError, WebcamUtil } from "ngx-webcam";
import { Subject } from "rxjs";
import { Observable } from "rxjs-compat";

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
  constructor() {}

  ngOnInit(): void {
    this.readAvailableVideoInputs();
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public recapture(): void {
    this.webcamImage = null;
  }

  public handleInitError(error: WebcamInitError): void {
    if (
      error.mediaStreamError &&
      error.mediaStreamError.name === "NotAllowedError"
    ) {
    }
  }

  public handleImage(webcamImage: WebcamImage): void {
    console.log(webcamImage);
    this.webcamImage = webcamImage;
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

  public send(): void {
    console.log(this.webcamImage);
  }
}
