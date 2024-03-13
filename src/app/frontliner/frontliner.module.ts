import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FrontlinerComponent } from "./frontliner.component";
import { CashOutComponent } from "./cash-out/cash-out.component";
import { RouterModule } from "@angular/router";
import { FrontlinerRoutes } from "./frontliner-routing";
import { CashInComponent } from "./cash-in/cash-in.component";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [FrontlinerComponent, CashOutComponent, CashInComponent],
  imports: [CommonModule, FormsModule, RouterModule.forChild(FrontlinerRoutes)],
})
export class FrontlinerModule {}
