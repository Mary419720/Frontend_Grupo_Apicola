import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state): 
  boolean 
  | UrlTree => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.hasRole('admin')) {
    return true;
  }

  // Si no está autenticado o no es admin, redirigir al login
  return router.createUrlTree(['/login']);
};
