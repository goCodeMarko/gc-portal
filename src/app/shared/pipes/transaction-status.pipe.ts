import { Pipe, PipeTransform } from "@angular/core";
import { TransactionStatus, TransactionStatusLabels } from "../../shared/enums";

@Pipe({ name: "transactionStatus" })
export class TransactionStatusPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    let result = "";
    switch (value) {
      case TransactionStatus.Pending:
        result = `<span class='badge text-bg-light'>${
          TransactionStatusLabels[TransactionStatus.Pending]
        }</span>`;
        break;

      case TransactionStatus.Approved:
        result = `<span class='badge text-bg-info'>${
          TransactionStatusLabels[TransactionStatus.Approved]
        }</span>`;
        break;
      case TransactionStatus.Failed:
        result = `<span class='badge text-bg-danger'>${
          TransactionStatusLabels[TransactionStatus.Failed]
        }</span>`;
        break;
      case TransactionStatus.Cancelled:
        result = `<span class='badge text-bg-secondary'>${
          TransactionStatusLabels[TransactionStatus.Cancelled]
        }</span>`;
        break;
    }

    return result;
  }
}
