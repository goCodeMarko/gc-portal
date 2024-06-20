import { Pipe, PipeTransform } from "@angular/core";
import { TransactionStatus, TransactionStatusLabels } from "../../shared/enums";

@Pipe({ name: "transactionStatus" })
export class TransactionStatusPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    let result = "";

    result = `<span class='custom-badge'>${TransactionStatusLabels[value]}</span>`;

    return result;
  }
}
