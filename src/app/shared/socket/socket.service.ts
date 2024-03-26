import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Socket, io } from "socket.io-client";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.WEBSOCKET); // Change the URL to your server's address
  }

  public sendMessage(message: { type: string; data: any }): void {
    this.socket.emit("message", message);
  }

  public onMessage(): Observable<{ type: string; data: any }> {
    return new Observable<{ type: string; data: any }>((observer) => {
      this.socket.on("message", (message: { type: string; data: any }) => {
        observer.next(message);
      });
    });
  }
}
