import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { FrontlinerComponent } from "./frontliner.component";
import { CashOutComponent } from "./cash-out/cash-out.component";

export const FrontlinerRoutes: Routes = [
  {
    path: "",
    component: FrontlinerComponent,
  },
  { path: "**", redirectTo: "" },
];

@NgModule({
  imports: [RouterModule.forChild(FrontlinerRoutes)],
  exports: [RouterModule],
})
export class FrontlinerRoutingModule {}
