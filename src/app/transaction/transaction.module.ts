import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TransactionComponent } from "./transaction.component";
import { CashOutComponent } from "./cash-out/cash-out.component";
import { RouterModule } from "@angular/router";
import { TransactionRoutes } from "./transaction-routing";
import { CashInComponent } from "./cash-in/cash-in.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { WebcamModule } from "ngx-webcam";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatRadioModule } from "@angular/material/radio";
import { TableComponent } from "./table/table.component";
import { TransactionStatusPipe } from "../shared/pipes/transaction-status.pipe";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@NgModule({
  declarations: [
    TransactionComponent,
    CashOutComponent,
    CashInComponent,
    TableComponent,
    TransactionStatusPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    WebcamModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCardModule,
    MatRadioModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    RouterModule.forChild(TransactionRoutes),
  ],
})
export class TransactionModule {}
