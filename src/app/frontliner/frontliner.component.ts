import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-frontliner",
  templateUrl: "./frontliner.component.html",
  styleUrls: ["./frontliner.component.css"],
})
export class FrontlinerComponent implements OnInit {
  viewType: "cashout" | "cashin" = "cashout";

  constructor() {}

  ngOnInit(): void {}

  view(type: "cashout" | "cashin") {
    if (type === "cashin") this.viewType = "cashin";
    else this.viewType = "cashout";

    console.log(this.viewType);
  }
}
