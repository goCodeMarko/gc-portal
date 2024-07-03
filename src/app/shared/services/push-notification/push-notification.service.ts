import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class PushNotificationService {
  constructor() {}

  notifyMe() {
    console.log("window ", window);
    if (!("Notification" in window)) {
      // Check if the browser supports notifications
      alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
      // Check whether notification permissions have already been granted;
      // if so, create a notification
      const notification = new Notification("Hi there granted!", {
        body: `Lorem ipsum dolor sit amet. Ut ullam tempora ut explicabo praesentium in 
        iste eius et minus sint sed nesciunt numquam est similique mollitia. 
        Ea eius rerum id consectetur minus est quas veritatis eum quaerat atque.`,
        data: {
          url: "https://facebook.com",
          status: "open",
        },
      });

      notification.onclick = (event) => {
        event.preventDefault(); // prevent the browser from focusing the Notification's tab
        window.open(
          "http://localhost:4200/app/transaction/cashin?tid=6684b4d8b87d7c7ab2da8b71",
          "_blank"
        );
      };
      // …
    } else if (Notification.permission === "default") {
      // We need to ask the user for permission
      Notification.requestPermission().then((permission) => {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          const notification = new Notification("Hi there permission!");
          notification.onclick = (event) => {
            event.preventDefault(); // prevent the browser from focusing the Notification's tab
            window.open(
              "http://localhost:4200/app/transaction/cashin?tid=6684b4d8b87d7c7ab2da8b71",
              "_blank"
            );
          };
        }
      });
    }

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them anymore.
  }
}
