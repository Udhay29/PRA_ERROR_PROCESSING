import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService, User } from 'lib-platform-services';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  user: User;
  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.userService.load().pipe(map((user: User) => {
      this.user = new User(user);
      if (this.user && this.user.hasUpdateLevelAccess('/teammanagement')) {
        return true;
      } else {
        this.router.navigateByUrl('/error/401');
        return false;
      }
    }));
  }
}
