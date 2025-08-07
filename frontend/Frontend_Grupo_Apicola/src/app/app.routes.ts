import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component'; // Importar RegisterComponent
import { authGuard } from './core/auth/auth.guard'; // Importar el authGuard
import { adminGuard } from './core/auth/admin.guard'; // Importar el guard específico para administradores
import { AuthDebugComponent } from './debug/auth-debug.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule)
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent, // Añadir ruta para el registro
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    canActivate: [adminGuard] // Aplicar el guard específico para administradores
  },
  {
    path: 'favorites',
    canActivate: [authGuard], // Proteger la ruta
    loadComponent: () =>
      import('./features/user/favorites-list/favorites-list.component').then(
        (c) => c.FavoritesListComponent
      ),
  },

  // Aquí irían la ruta del visitante y la de 'not-found'
  
  // Ruta de depuración de autenticación
  {
    path: 'debug/auth',
    component: AuthDebugComponent
  }
];
