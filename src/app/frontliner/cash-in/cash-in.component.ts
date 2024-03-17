import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpRequestService } from "src/app/http-request/http-request.service";

@Component({
  selector: "app-cash-in",
  templateUrl: "./cash-in.component.html",
  styleUrls: ["./cash-in.component.css"],
})
export class CashInComponent implements OnInit {
  public cashinForm: FormGroup;

  constructor(private fb: FormBuilder, private hrs: HttpRequestService) {
    this.cashinForm = this.fb.group({
      type: [1],
      phone_number: [
        "",
        [Validators.required, Validators.pattern(/^09\d{9}$/)],
      ],
      fee_payment_is_gcash: ["false"],
      amount: ["", Validators.required],
      fee: ["", Validators.required],
      note: [""],
    });
  }

  ngOnInit(): void {}

  public currencyStrict(event: any) {
    let pasteValue = [];
    const allowedInput = [
      ".",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ];
    if (event.type == "paste") {
      pasteValue = event.clipboardData.getData("text/plain").split("");
      pasteValue.forEach((char: string) => {
        if (!allowedInput.includes(char)) event.preventDefault();
      });
    } else {
      if (!allowedInput.includes(event.key)) event.preventDefault();
    }
  }

  public phoneNumberStrict(event: any) {
    let pasteValue = [];
    const allowedInput = [
      "+",
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ];
    if (event.type == "paste") {
      pasteValue = event.clipboardData.getData("text/plain").split("");
      pasteValue.forEach((char: string) => {
        if (!allowedInput.includes(char)) event.preventDefault();
      });
    } else {
      if (!allowedInput.includes(event.key)) event.preventDefault();
    }
  }

  public checkFormControlErrors(name: string): boolean {
    let result = false;
    if (
      this.cashinForm.get(name)?.invalid &&
      this.cashinForm.get(name)?.errors &&
      (this.cashinForm.get(name)?.dirty || this.cashinForm.get(name)?.touched)
    ) {
      result = true;
    }

    return result;
  }

  sendRequest() {
    console.log(this.cashinForm.value);

    this.hrs.request(
      "post",
      `transaction/addTransaction`,
      this.cashinForm.value,
      async (data: any) => {
        console.log(data);
        // if (data.success) {
        //   this.editCurrentBookInTable(oldData._id, newData);
        // } else {
        //   if (data.message == "Restricted") {
        //     this.dialog.open(PopUpModalComponent, {
        //       width: "500px",
        //       data: {
        //         deletebutton: false,
        //         title: "Access Denied",
        //         message:
        //           "Oops, It looks like you <b>dont have access</b> on this feature.",
        //       },
        //     });
        //   }
        // }
      }
    );
  }
}
