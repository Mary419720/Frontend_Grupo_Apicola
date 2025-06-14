import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service'; // Ajusta la ruta si es necesario
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authToken = this.authService.getToken();
    let authReq = request;

    // Solo añade el token si la petición va a la URL de tu API
    // y si el token existe.
    // Esto evita enviar el token a APIs de terceros si las usaras.
    if (authToken && request.url.startsWith(this.authService.getApiUrl())) {
      authReq = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token inválido o expirado
          console.error('Interceptor: Error 401 - No autorizado. Redirigiendo a login.');
          this.authService.logout(); // Limpia el token y estado del usuario
          // Podrías añadir un queryParam para mostrar un mensaje en la página de login
          this.router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
        }
        return throwError(() => error);
      })
    );
  }
}
