import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state): 
  boolean 
  | UrlTree => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

    const isAuthenticated = authService.isAuthenticated();
  console.log('[AuthGuard] Checking authentication. Status:', isAuthenticated);

  if (isAuthenticated) {
    return true;
  }

  // Si no está autenticado, redirigir al login
  console.log('[AuthGuard] User not authenticated. Redirecting to /login.');
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
