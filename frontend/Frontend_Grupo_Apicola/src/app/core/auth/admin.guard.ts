import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = (route, state): 
  boolean 
  | UrlTree => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar autenticación primero
  if (!authService.isAuthenticated()) {
    console.log('[AdminGuard] Usuario no autenticado. Redirigiendo a /login.');
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  // Verificar rol de administrador
  if (!authService.hasRole('administrador')) {
    console.log('[AdminGuard] Usuario autenticado pero no es administrador. Redirigiendo a inicio.');
    return router.createUrlTree(['/']);
  }

  console.log('[AdminGuard] Usuario es administrador. Acceso permitido.');
  return true;
};
