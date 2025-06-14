import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { LucideAngularModule, LogOut, Edit, Trash2, Eye } from 'lucide-angular';
import { AuthInterceptor } from './core/interceptors/auth.interceptor'; // Importar el interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(LucideAngularModule.pick({ LogOut, Edit, Trash2, Eye })),
    provideHttpClient(withInterceptorsFromDi()),
    AuthInterceptor // Registrar el interceptor como un provider
  ]
};
