import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { TransactionComponent } from "./transaction.component";
import { SecurityGuard } from "./../guards/security.guard";
import { CashOutComponent } from "./pages/cash-out/cash-out.component";
import { CreateTransactionComponent } from "./pages/create-transaction/create-transaction.component";
import { CashInComponent } from "./pages/cash-in/cash-in.component";

export const TransactionRoutes: Routes = [
  {
    path: "",
    component: TransactionComponent,
    children: [
      { path: "cashin", component: CashInComponent },
      { path: "cashout", component: CashOutComponent },
      { path: "create", component: CreateTransactionComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(TransactionRoutes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule {}
