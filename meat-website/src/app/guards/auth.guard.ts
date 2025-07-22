import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.checkAuthWithBackend().pipe(
      map(user => {
        if (user) {
          return true;
        } else {
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return of(false);
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.log('AdminGuard: Checking admin access for route:', state.url);
    return this.authService.checkAdminAuthWithBackend().pipe(
      map(result => {
        console.log('AdminGuard: Admin validation result:', result);
        if (result.isAdmin) {
          console.log('AdminGuard: Access granted for admin user:', result.user?.email);
          return true;
        } else {
          console.log('AdminGuard: Access denied - redirecting to login');
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
          return false;
        }
      }),
      catchError((error) => {
        console.log('AdminGuard: Error during admin validation:', error);
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return of(false);
      })
    );
  }
} 