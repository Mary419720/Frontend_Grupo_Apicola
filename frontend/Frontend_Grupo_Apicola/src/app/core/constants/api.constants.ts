import { HttpContextToken } from '@angular/common/http';

/**
 * Token de contexto para marcar una API como pública.
 * Las peticiones con este token establecido en `true` no incluirán el token de autenticación.
 */
export const IS_PUBLIC_API = new HttpContextToken<boolean>(() => false);
