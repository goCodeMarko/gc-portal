import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Subject, Subscription, Observable } from "rxjs";
// import { WebcamImage, WebcamInitError, WebcamUtil } from "ngx-webcam";

@Component({
  selector: "app-camera",
  templateUrl: "./camera-modal.component.html",
  styleUrls: ["./camera-modal.component.scss"],
})
export class CameraModalComponent implements OnInit, OnDestroy {
  // public showWebcam = true; // toggle webcam on/off
  // public multipleWebcamsAvailable = false;
  // public onLoad = true;
  // private trigger: Subject<void> = new Subject<void>(); // webcam snapshot trigger
  // private nextWebcam: Subject<boolean | string> = new Subject<
  //   boolean | string
  // >(); // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  // // public elementChecker!: any;
  // @Output() result = new EventEmitter();
  // constructor(
  //   private dialog: MatDialogRef<CameraModalComponent>,
  //   private el: ElementRef,
  //   private renderer: Renderer2,
  //   @Inject(MAT_DIALOG_DATA) public data: any
  // ) {}
  ngOnInit(): void {
    //   this.readAvailableVideoInputs();
    //   this.checkForElement();
    //   this.renderer.listen("window", "click", (e: Event) => {
    //     const target = e.target as HTMLElement;
    //     if (target.className === "camera-switch ng-star-inserted")
    //       this.onLoad = true;
    //   });
  }
  ngOnDestroy(): void {
    //   // clearInterval(this.elementChecker);
  }
  // private checkForElement(): void {
  //   // this.elementChecker = setInterval(() => {
  //   //   const element = this.el.nativeElement.querySelector(".webcam-wrapper");
  //   //   if (element) {
  //   //     clearInterval(this.elementChecker);
  //   //     this.onLoad = false;
  //   //     console.log("Element exists in the DOM");
  //   //   }
  //   // }, 1000);
  // }
  // // Method to trigger the snapshot
  // public triggerSnapshot(): void {
  //   this.trigger.next();
  // }
  // // Method to handle webcam errors
  // public handleInitError(error: WebcamInitError): void {
  //   console.warn("Webcam error", error);
  // }
  // // Method to handle the captured image
  // public handleImage(webcamImage: any): void {
  //   console.log("--------------", webcamImage);
  //   this.result.emit(webcamImage);
  //   this.dialog.close();
  // }
  // // Method to handle webcam initialization
  // public handleInit(webcamActive: boolean): void {
  //   console.info("Webcam active:", webcamActive);
  // }
  // public get triggerObservable(): Observable<void> {
  //   return this.trigger.asObservable();
  // }
  // public get nextWebcamObservable(): Observable<boolean | string> {
  //   return this.nextWebcam.asObservable();
  // }
  // public get videoOptions(): MediaTrackConstraints {
  //   const result: MediaTrackConstraints = {};
  //   result.facingMode = { ideal: "environment" };
  //   console.log(9);
  //   return result;
  // }
  // public cameraWasSwitched(deviceId: string): void {
  //   this.onLoad = true;
  //   this.readAvailableVideoInputs();
  //   setTimeout(() => {
  //     this.onLoad = false;
  //   }, 500);
  // }
  // private readAvailableVideoInputs() {
  //   WebcamUtil.getAvailableVideoInputs().then(
  //     (mediaDevices: MediaDeviceInfo[]) => {
  //       this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
  //     }
  //   );
  // }
}
