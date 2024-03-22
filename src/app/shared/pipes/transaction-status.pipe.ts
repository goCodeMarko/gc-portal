import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "transactionStatus" })
export class TransactionStatusPipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    console.log("wwwwwwwww", value);
    let result = "";
    switch (value) {
      case 1:
        result = "<span class='badge text-bg-light'>Pending</span>";
        break;

      case 2:
        result = "<span class='badge text-bg-info'>Approved</span>";
        break;
      case 3:
        result = "<span class='badge text-bg-danger'>Failed</span>";
        break;
      case 4:
        result = "<span class='badge text-bg-secondary'>Cancelled</span>";
        break;
    }

    return result;
  }
}
