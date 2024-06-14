import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";

interface ITransactionDetails {
  runbal_gcash: {
    data: number;
    operation: "sum" | "subtract";
  };
  runbal_cash_on_hand: {
    data: number;
    operation: "sum" | "subtract";
  };
}
@Injectable({
  providedIn: "root",
})
export class TransactionDetailsService {
  private subject: Subject<any> = new Subject<any>();

  constructor() {}

  // Method to trigger an event
  update(data: ITransactionDetails): void {
    this.subject.next(data);
  }

  // Method to get the observable
  everyNewUpdate(): Observable<ITransactionDetails> {
    return this.subject.asObservable();
  }
}
