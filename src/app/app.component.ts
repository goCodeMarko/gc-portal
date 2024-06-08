import { Component, OnInit, isDevMode } from "@angular/core";
import { environment } from "src/environments/environment";
import { InternetConnectionService } from "./shared/internet-connection/internet-connection.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  public isOnline!: Boolean | null;

  constructor(internetConnection: InternetConnectionService) {
    internetConnection.getConnectionStatus().subscribe((status) => {
      this.isOnline = status;

      if (status) {
        setTimeout(() => {
          this.isOnline = null;
        }, 5000);
      }
    });

    if (isDevMode()) console.log("Development!");
    else console.log("Production!");

    console.log(environment);
  }
}
