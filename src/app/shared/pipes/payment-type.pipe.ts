import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "paymentType" })
export class PaymentTypePipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    let result = "";

    if (value) {
      result = `<img src="assets/images/gcash.png" width="25" alt="user">`;
    } else {
      result = `<img src="assets/images/cash.png" width="25" alt="user">`;
    }

    return result;
  }
}
