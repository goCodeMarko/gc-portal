import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TransactionComponent } from "./transaction.component";
import { CashOutComponent } from "./pages/cash-out/cash-out.component";
import { RouterModule } from "@angular/router";
import { TransactionRoutes } from "./transaction-routing";
import { CashInComponent } from "./pages/cash-in/cash-in.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { WebcamModule } from "ngx-webcam";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatRadioModule } from "@angular/material/radio";
import { TableComponent } from "./shared/components/table/table.component";
import { TransactionStatusPipe } from "../shared/pipes/transaction-status.pipe";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PaymentTypePipe } from "../shared/pipes/payment-type.pipe";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { CreateTransactionComponent } from "./pages/create-transaction/create-transaction.component";
import { SharedModule } from "../shared/shared.module";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { MatListModule } from "@angular/material/list";

@NgModule({
  declarations: [
    TransactionComponent,
    CashOutComponent,
    CashInComponent,
    TableComponent,
    TransactionStatusPipe,
    PaymentTypePipe,
    CreateTransactionComponent,
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
    MatMenuModule,
    MatIconModule,
    MatButtonToggleModule,
    MatBottomSheetModule,
    SharedModule,
    MatListModule,
    RouterModule.forChild(TransactionRoutes),
  ],
})
export class TransactionModule {}
