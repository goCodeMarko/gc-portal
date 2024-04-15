import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class InternetConnectionService {
  private connectionStatus: Subject<boolean>;

  constructor() {
    this.connectionStatus = new Subject<boolean>();

    window.addEventListener("online", () => {
      this.connectionStatus.next(true);
    });

    window.addEventListener("offline", () => {
      this.connectionStatus.next(false);
    });
  }

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }
}
