import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip interceptor for login endpoint
  if (req.url.includes('/Login')) {
    return next(req);
  }

  const authService = inject(AuthenticationService);
  const router = inject(Router);

  const token = authService.getAuthToken();

  if (token) {
    // Clone request and add authorization header
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(clonedReq).pipe(
      catchError((error: any) => {
        if (error.status === 401) {
          // Unauthorized - redirect to login
          authService.logout();
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  } else {
    return next(req);
  }
};
