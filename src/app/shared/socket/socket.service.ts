import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Socket, io } from "socket.io-client";
import { environment } from "src/environments/environment";

type strings = "updateTransactionStatus" | "newCashout" | "newCashin";
@Injectable({
  providedIn: "root",
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.WEBSOCKET); // Change the URL to your server's address
  }

  public sendMessage(message: { type: strings; data: any }): void {
    this.socket.emit("message", message);
  }

  public onMessage(): Observable<{ type: strings; data: any }> {
    return new Observable<{ type: strings; data: any }>((observer) => {
      this.socket.on("message", (message: { type: strings; data: any }) => {
        observer.next(message);
      });
    });
  }
}
