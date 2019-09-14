import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from "@angular/router";
import { Observable, of } from "rxjs";
import { take, map, catchError } from "rxjs/operators";

import { AuthService } from "./service/auth.service";

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const expectedRole = next.data.expectedRole;

    return this.authService.getCurrentUser().pipe(
      take(1),
      map(user => {
        if (user) {
          if (
            expectedRole === "user" ||
            (expectedRole === "admin" && user.role === 4)
          ) {
            return true;
          }
          return this.router.createUrlTree(["/stories"]);
        }
        return this.router.createUrlTree(["/login"]);
      }),
      catchError(() => {
        return of(this.router.createUrlTree(["/login"]));
      })
    );
  }
}
