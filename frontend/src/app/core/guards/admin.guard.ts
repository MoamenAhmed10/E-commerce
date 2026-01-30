import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already authenticated and is admin via signal, allow immediately
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  // Otherwise check via API
  return authService.checkAuth().pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated && authService.isAdmin()) {
        return true;
      }

      if (isAuthenticated) {
        // User is logged in but not admin
        router.navigate(['/']);
      } else {
        // User is not logged in
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: state.url },
        });
      }
      return false;
    }),
  );
};
