import { Routes } from "@angular/router";
import { FullComponent } from "./layouts/full/full.component";
import { SecurityGuard } from "./guards/security.guard";
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
        path: "transaction",
        loadChildren: () =>
          import("./transaction/transaction.module").then(
            (m) => m.TransactionModule
          ),
        canActivate: [SecurityGuard],
      },
      { path: "**", redirectTo: "/login", pathMatch: "full" },
    ],
  },
];
