import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "paymentType" })
export class PaymentTypePipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    let result = "";

    if (value) {
      // result = `<img src="assets/images/gcash.png" width="25" alt="user">`;
      result = `<span class='custom-badge'>Gcash</span>`;
    } else {
      result = `<span class='custom-badge'>Cash</span>`;
    }

    return result;
  }
}
