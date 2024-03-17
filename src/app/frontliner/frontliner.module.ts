import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FrontlinerComponent } from "./frontliner.component";
import { CashOutComponent } from "./cash-out/cash-out.component";
import { RouterModule } from "@angular/router";
import { FrontlinerRoutes } from "./frontliner-routing";
import { CashInComponent } from "./cash-in/cash-in.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { WebcamModule } from "ngx-webcam";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatRadioModule } from "@angular/material/radio";

@NgModule({
  declarations: [FrontlinerComponent, CashOutComponent, CashInComponent],
  imports: [
    CommonModule,
    FormsModule,
    WebcamModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCardModule,
    MatRadioModule,
    RouterModule.forChild(FrontlinerRoutes),
  ],
})
export class FrontlinerModule {}
