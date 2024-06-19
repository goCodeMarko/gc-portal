import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { AuthService } from "../authorization/auth.service";
import * as moment from "moment";
import { HttpRequestService } from "../http-request/http-request.service";
import { MatDialog } from "@angular/material/dialog";
import { PopUpModalComponent } from "../modals/pop-up-modal/pop-up-modal.component";
import { ActivatedRoute, Router } from "@angular/router";
import { SocketService } from "../shared/socket/socket.service";
import { Subscription } from "rxjs";
import { TransactionDetailsService } from "./shared/services/transaction-details/transaction-details.service";
import * as _ from "lodash";

interface ITransactionDetail {
  _id: string;
  gcash: number;
  runbal_gcash: number;
  date: string;
  gcashNumber: string;
  cash_on_hand: number;
  runbal_cash_on_hand: number;
}
@Component({
  selector: "app-transaction",
  templateUrl: "./transaction.component.html",
  styleUrls: ["./transaction.component.scss"],
  encapsulation: ViewEncapsulation.None, // Optional: Disable view encapsulation if necessary
})
export class TransactionComponent implements OnInit {
  public viewTypeTransaction: string = "cashout";
  public hideMainButton = false;
  public tabActiveCashout = true;
  public tabActiveCashin = false;
  public selectedRoutes!: string;
  public role: string = "";
  public routerOutletComponent: any;
  public transactionDetails!: ITransactionDetail;
  public type = "OUT";
  public pre = "REQUEST";
  private socketSubscription: Subscription;
  private transactionDetailsSubscription: Subscription;
  private routeSubscription: Subscription;
  public getTransactionLoading = false;
  public hideRouterOutlet = false;
  constructor(
    private auth: AuthService,
    private hrs: HttpRequestService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private socket: SocketService,
    private transactionDetailsService: TransactionDetailsService
  ) {
    this.socketSubscription = this.socket.onMessage().subscribe((message) => {
      if (message.type === "updateTransactionDetails") {
        //it will update the transaction details
        if (message.data.runbal_gcash.operation === "sum") {
          this.transactionDetails.runbal_gcash +=
            message.data.runbal_gcash.data;
        } else if (message.data.runbal_gcash.operation === "subtract") {
          this.transactionDetails.runbal_gcash -=
            message.data.runbal_gcash.data;
        }

        if (message.data.runbal_cash_on_hand.operation === "sum") {
          this.transactionDetails.runbal_cash_on_hand +=
            message.data.runbal_cash_on_hand.data;
        } else if (message.data.runbal_cash_on_hand.operation === "subtract") {
          this.transactionDetails.runbal_cash_on_hand -=
            message.data.runbal_cash_on_hand.data;
        }
        //end
      }
    });

    this.transactionDetailsSubscription = this.transactionDetailsService
      .everyNewUpdate()
      .subscribe(
        (message) => {
          //it will update the transaction details
          console.log(11111, message);

          if (message.runbal_gcash.operation === "sum") {
            this.transactionDetails.runbal_gcash += message.runbal_gcash.data;
          } else if (message.runbal_gcash.operation === "subtract") {
            this.transactionDetails.runbal_gcash -= message.runbal_gcash.data;
          }

          if (message.runbal_cash_on_hand.operation === "sum") {
            this.transactionDetails.runbal_cash_on_hand +=
              message.runbal_cash_on_hand.data;
          } else if (message.runbal_cash_on_hand.operation === "subtract") {
            this.transactionDetails.runbal_cash_on_hand -=
              message.runbal_cash_on_hand.data;
          }
          //end
        },
        (error) => {
          console.log(error);
        },
        () => {
          console.log("complete");
        }
      );

    //Checks if route has tid param
    this.routeSubscription = this.route.queryParams.subscribe(
      async (params: any) => {
        if (!params["tid"]) this.viewTypeTransaction = "noTransaction";
        else await this.getTransaction();
      }
    );
    //end

    //It will change hte color of active button based on the current route
    const currentUrlWithoutQueryParams = this.router.url.split("?")[0];
    if (currentUrlWithoutQueryParams === "/app/transaction/cashin")
      this.selectedRoutes = "cashin";
    else if (currentUrlWithoutQueryParams === "/app/transaction/cashout")
      this.selectedRoutes = "cashout";
    //end
  }

  async ngOnInit(): Promise<any> {
    this.checkRole();
  }

  async ngOnDestroy() {
    this.socketSubscription.unsubscribe();
    this.transactionDetailsSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }

  fromRouterOutlet(component: any) {
    this.routerOutletComponent = component;

    if (component.hideMainButton) {
      component.hideMainButton.subscribe((value: boolean) => {
        this.hideMainButton = value;
      });
    }

    if (component.viewTypeTransaction) {
      component.viewTypeTransaction.subscribe((value: string) => {
        this.viewTypeTransaction = value;
      });
    }

    if (component.getTransactionLoading) {
      component.getTransactionLoading.subscribe((value: boolean) => {
        this.getTransactionLoading = value;
      });
    }

    if (component.selectedRoutes) {
      component.selectedRoutes.subscribe((value: string) => {
        this.selectedRoutes = value;
      });
    }

    if (component.cashinForm) this.type = "IN";
    else if (component.cashoutForm) this.type = "OUT";
  }

  public getTransaction(): Promise<void> {
    this.getTransactionLoading = true;
    return new Promise((resolve, reject) => {
      // Parse the client's local timezone
      const startDate = moment().startOf("day").format("YYYY-MM-DDTHH:mm:ss");
      const endDate = moment().endOf("day").format("YYYY-MM-DDTHH:mm:ss");

      this.hrs.request(
        "get",
        "transaction/getTransaction",
        { startDate, endDate },
        async (res: any) => {
          console.log("-----------TransactionComponent:getTransaction()", res);
          this.getTransactionLoading = false;

          if (res.success && _.has(res, "data")) {
            this.hideRouterOutlet = false;
            this.transactionDetails = res.data;

            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { tid: this.transactionDetails._id },
              queryParamsHandling: "merge",
            });
            this.viewTypeTransaction = "";
          } else {
            this.hideRouterOutlet = true;
            this.viewTypeTransaction = "noTransaction";
          }

          resolve();
        }
      );
    });
  }

  selectOption(option: string) {
    this.selectedRoutes = option;
  }

  navigate(url: string) {
    let params = {};
    if (this.transactionDetails?._id)
      params = { tid: this.transactionDetails._id };
    this.router.navigate([url], {
      queryParams: params,
      queryParamsHandling: "merge",
    });
  }

  async checkRole() {
    const user = JSON.parse(this.auth.getUserData());
    this.role = user.role;

    if (user.role === "admin") this.pre = "ADD";
    else this.pre = "REQUEST";
  }

  createTransactionPage() {
    this.hideMainButton = true;
    this.router.navigate(["/app/transaction/create"]);
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
