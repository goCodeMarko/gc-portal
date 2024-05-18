import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { TransactionComponent } from "./transaction.component";
import { SecurityGuard } from "./../guards/security.guard";

export const TransactionRoutes: Routes = [
  {
    path: "main",
    component: TransactionComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(TransactionRoutes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule {}
