import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../authorization/auth.service";

@Injectable({
  providedIn: "root",
})
export class SecurityGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return (async (): Promise<boolean> => {
      const role: string = await this.auth.checkRole();

      if (["frontliner", "admin"].includes(role)) {
        return true;
      } else {
        this.router.navigate(["transaction"]);
        return false;
      }
    })();
  }
}
