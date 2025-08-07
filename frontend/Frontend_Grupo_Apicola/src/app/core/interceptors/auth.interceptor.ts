import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { IS_PUBLIC_API } from '../constants/api.constants';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si la petición es pública o de autenticación, la dejamos pasar sin modificarla.
  if (req.context.get(IS_PUBLIC_API) || req.url.includes('/auth/')) {
    return next(req);
  }

  // 1. Clonar la petición original para poder modificarla.
  let authReq = req.clone();

  // 2. Añadir el token de autenticación si existe.
  const authToken = authService.getToken();
  if (authToken) {
    authReq = authReq.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
  }

  // 3. Añadir Content-Type: application/json si es necesario.
  // Se evita en peticiones con FormData, ya que el navegador lo gestiona.
  const isFormData = req.body instanceof FormData;
  if (!isFormData && !req.headers.has('Content-Type')) {
    authReq = authReq.clone({
      setHeaders: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Manejo de errores centralizado.
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.error('Interceptor: Error 401 - No autorizado. Redirigiendo a login.');
        authService.logout();
        router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
      }
      return throwError(() => error);
    })
  );
};
