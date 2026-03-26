import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { UserRole } from '../models/login.model';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const currentRole = authService.currentRole as UserRole;

    // If user is trying to access a specific route and has a role, allow
    if (currentRole) {
      return true;
    }
  }

  // Redirect to login page with return URL
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

