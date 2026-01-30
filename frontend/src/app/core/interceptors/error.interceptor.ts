import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        switch (error.status) {
          case 401:
            // Unauthorized - clear auth and redirect to login
            authService.logout();
            errorMessage = 'Your session has expired. Please login again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to access this resource.';
            router.navigate(['/']);
            break;
          case 404:
            errorMessage = 'The requested resource was not found.';
            break;
          case 422:
            // Validation error
            if (error.error?.errors) {
              errorMessage = Object.values(error.error.errors).join(', ');
            } else {
              errorMessage = error.error?.message || 'Validation failed';
            }
            break;
          case 400:
            // Bad request - typically validation or duplicate errors
            errorMessage = error.error?.message || 'Bad request';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || error.message || 'An error occurred';
        }
      }

      // Log error to console in development
      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: req.url,
      });

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error,
      }));
    }),
  );
};
