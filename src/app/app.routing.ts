import { Routes } from "@angular/router";
import { FullComponent } from "./layouts/full/full.component";
import { AdminGuard } from "./guards/admin.guard";
import { FrontlinerGuard } from "./guards/frontliner.guard";
import { LoginComponent } from "./login/login.component";

export const AppRoutes: Routes = [
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "",
    component: FullComponent,
    children: [
      {
        path: "frontliner",
        loadChildren: () =>
          import("./frontliner/frontliner.module").then(
            (m) => m.FrontlinerModule
          ),
        canActivate: [FrontlinerGuard],
      },
      {
        path: "admin",
        loadChildren: () =>
          import("./admin/admin.module").then((m) => m.AdminModule),
        canActivate: [AdminGuard],
      },
    ],
  },
  { path: "**", redirectTo: "login" },
];
