import { Component, OnInit, isDevMode } from "@angular/core";
import { environment } from "src/environments/environment";
import { InternetConnectionService } from "./shared/internet-connection/internet-connection.service";
import { ImagePreloadService } from "./shared/services/image-preload.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  public isOnline!: Boolean | null;

  constructor(
    internetConnection: InternetConnectionService,
    imagePreloadService: ImagePreloadService
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
}
