import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { TransactionComponent } from "./transaction.component";

export const TransactionRoutes: Routes = [
  {
    path: "",
    component: TransactionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(TransactionRoutes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule {}
