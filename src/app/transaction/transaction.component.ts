import { Component, OnInit } from "@angular/core";
import { AuthService } from "../authorization/auth.service";

@Component({
  selector: "app-transaction",
  templateUrl: "./transaction.component.html",
  styleUrls: ["./transaction.component.css"],
})
export class TransactionComponent implements OnInit {
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
      this.hideLogoutButton = false;
    } else {
      this.viewType = "cashout";
      this.tabActiveCashin = false;
      this.tabActiveCashout = true;
      this.hideLogoutButton = false;
    }
  }

  logoutButton(event: boolean) {
    this.hideLogoutButton = event;
  }

  public logout() {
    this.auth.logout();
  }
}
