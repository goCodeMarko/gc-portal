import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "paymentType" })
export class PaymentTypePipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    let result = "";

    if (value) {
      result = `<img  class="gs-image-bg" src="assets/images/gcash.png" width="23" alt="user">`;
    } else {
      result = `<img class="gs-image-bg" src="assets/images/cash.png" width="23" alt="user">`;
    }

    return result;
  }
}
