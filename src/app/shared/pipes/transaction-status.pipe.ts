import { Pipe, PipeTransform } from "@angular/core";
import { TransactionStatus, TransactionStatusLabels } from "../../shared/enums";

@Pipe({ name: "transactionStatus" })
export class TransactionStatusPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    let result = "";

    if (TransactionStatusLabels[value] == "Pending") {
      result = `<span class='custom-badge'>
      <span class='gs-circle bg-pending'></span>
     ${TransactionStatusLabels[value]}
     </span>`;
    } else if (TransactionStatusLabels[value] == "Approved") {
      result = `<span class='custom-badge'>
      <span class='gs-circle bg-approved'></span>
     ${TransactionStatusLabels[value]}
     </span>`;
    } else if (TransactionStatusLabels[value] == "Failed") {
      result = `<span class='custom-badge'>
      <span class='gs-circle bg-failed'></span>
     ${TransactionStatusLabels[value]}
     </span>`;
    } else if (TransactionStatusLabels[value] == "Cancelled") {
      result = `<span class='custom-badge'>
      <span class='gs-circle bg-cancelled'></span>
     ${TransactionStatusLabels[value]}
     </span>`;
    }

    return result;
  }
}
