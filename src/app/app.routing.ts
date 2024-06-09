import { Routes } from "@angular/router";
import { FullComponent } from "./layouts/full/full.component";
import { SecurityGuard } from "./guards/security.guard";
import { LoginComponent } from "./login/login.component";

export const AppRoutes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" }, // Redirect root URL to login
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "transaction",
    component: FullComponent,
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./transaction/transaction.module").then(
            (m) => m.TransactionModule
          ),
        canActivate: [SecurityGuard],
      },
    ],
  },
  { path: "**", redirectTo: "login", pathMatch: "full" }, // Wildcard route for unknown routes
];
