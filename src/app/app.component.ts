import { Component, OnInit, isDevMode } from "@angular/core";
import { environment } from "src/environments/environment";
import { InternetConnectionService } from "./shared/internet-connection/internet-connection.service";
import { ImagePreloadService } from "./shared/services/image-preload.service";
import { SwPush } from "@angular/service-worker";
import { HttpRequestService } from "./http-request/http-request.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  public isOnline!: Boolean | null;
  readonly VAPID_PUBLIC_KEY =
    "BENFs5s5g4eYPr8DmBtmI7V46TAQhjv22N31JJVVNoicaefJcrM8ezT6XSvt4SUPqk2rt9JfzmuhzTCUr98DPNI";

  constructor(
    internetConnection: InternetConnectionService,
    imagePreloadService: ImagePreloadService,
    private swPush: SwPush,
    private hrs: HttpRequestService
  ) {
    // Subscribe to the internet connection status
    internetConnection.getConnectionStatus().subscribe((status) => {
      this.isOnline = status; // Update the isOnline property with the current status

      // If the status is online (true), set a timeout to reset isOnline after 5 seconds
      if (status) {
        setTimeout(() => {
          this.isOnline = null;
        }, 5000);
      }
    });

    // Check if the app is in development mode and log the appropriate environment
    if (isDevMode()) console.log("Development!");
    else console.log("Production!");

    // List of images to be preloaded
    const imagesToPreload = [
      "assets/images/gcash.png",
      "assets/images/cash.png",
      "assets/images/noDataFound.png",
    ];
    // Preload the listed images
    imagePreloadService.preload(imagesToPreload);
  }

  ngOnInit(): void {
    console.log("-----------this.swPush.isEnabled", this.swPush.isEnabled);
    if (this.swPush.isEnabled) {
      this.swPush
        .requestSubscription({
          serverPublicKey: this.VAPID_PUBLIC_KEY,
        })
        .then((sub) => this.sendToServer(sub))
        .catch((err) =>
          console.error("Could not subscribe to notifications", err)
        );

      this.swPush.messages.subscribe((message) => {
        console.log("Received a push message", message);
      });

      this.swPush.notificationClicks.subscribe((click) => {
        console.log("Notification clicked", click);
      });
    }
  }

  sendToServer(subscription: PushSubscription) {
    // Send subscription to the server
    this.hrs.request(
      "post",
      "serviceWorker/subscribe",
      subscription,
      async (data: any) => {
        console.log(
          "-----------------i am subscribed to PWA push notification"
        );
        console.log("-----------------data", data);
      }
    );
  }
}
