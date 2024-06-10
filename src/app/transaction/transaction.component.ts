import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { AuthService } from "../authorization/auth.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import * as moment from "moment";
import { HttpRequestService } from "../http-request/http-request.service";
import { MatDialog } from "@angular/material/dialog";
import { PopUpModalComponent } from "../modals/pop-up-modal/pop-up-modal.component";
import { Router } from "@angular/router";

@Component({
  selector: "app-transaction",
  templateUrl: "./transaction.component.html",
  styleUrls: ["./transaction.component.scss"],
  encapsulation: ViewEncapsulation.None, // Optional: Disable view encapsulation if necessary
})
export class TransactionComponent implements OnInit {
  viewType: string = "cashout";
  public hideMainButton = false;
  public tabActiveCashout = true;
  public tabActiveCashin = false;
  private viewTypeBefore: string = "";
  selectedRoutes: string = "cashout";
  public role: string = "";
  public routerOutletComponent: any;
  public type = "OUT";
  public pre = "REQUEST";
  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private hrs: HttpRequestService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkRole();
  }

  selectOption(option: string) {
    this.selectedRoutes = option;
  }

  async checkRole() {
    const user = JSON.parse(this.auth.getUserData());
    this.role = user.role;

    if (user.role === "admin") this.pre = "ADD";
    else this.pre = "REQUEST";
  }

  createTransactionPage() {
    this.hideMainButton = true;
    this.router.navigate(["/transaction/create"]);
  }

  fromRouterOutlet(component: any) {
    this.routerOutletComponent = component;
    if (component.hideMainButton) {
      this.hideMainButton = false;
      component.hideMainButton.subscribe((value: boolean) => {
        this.hideMainButton = value;
      });
    }

    if (component.cashinForm) this.type = "IN";
    else this.type = "OUT";
  }

  addTransaction() {
    if (
      this.routerOutletComponent &&
      this.routerOutletComponent.emittedButton
    ) {
      let formView: string = "cashoutFormView";

      if (this.routerOutletComponent.cashinForm) formView = "cashinFormView";

      this.routerOutletComponent.emittedButton({ type: formView });
    }
  }

  public logout() {
    this.auth.logout();
  }

  public generateReportBtnOnLoad = false;
  generateReport() {
    this.generateReportBtnOnLoad = true;

    const startDate = moment().startOf("day").format("YYYY-MM-DDTHH:mm:ss");
    const endDate = moment().endOf("day").format("YYYY-MM-DDTHH:mm:ss");

    this.hrs.request(
      "get",
      "transaction/generateReport",
      { startDate, endDate },
      async (res: any) => {
        this.generateReportBtnOnLoad = false;
        if (res.success) {
          this.dialog.open(PopUpModalComponent, {
            width: "500px",
            data: {
              deletebutton: false,
              title: "Success!",
              message: "Daily report <b>has been sent</b> to your email.",
            },
          });
        } else {
          if (res.error.message == "Restricted") {
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
        }
      }
    );
  }
}
