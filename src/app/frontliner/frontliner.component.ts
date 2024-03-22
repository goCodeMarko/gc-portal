import { Component, OnInit } from "@angular/core";
import { AuthService } from "../authorization/auth.service";

@Component({
  selector: "app-frontliner",
  templateUrl: "./frontliner.component.html",
  styleUrls: ["./frontliner.component.css"],
})
export class FrontlinerComponent implements OnInit {
  viewType: "cashout" | "cashin" = "cashout";
  public hideLogoutButton = false;
  public tabActiveCashout = true;
  public tabActiveCashin = false;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {}

  view(type: "cashout" | "cashin") {
    if (type === "cashin") {
      this.viewType = "cashin";
      this.tabActiveCashin = true;
      this.tabActiveCashout = false;
    } else {
      this.viewType = "cashout";
      this.tabActiveCashin = false;
      this.tabActiveCashout = true;
    }

    console.log(this.viewType);
  }

  logoutButton(event: boolean) {
    this.hideLogoutButton = event;
  }

  public logout() {
    this.auth.logout();
  }
}
