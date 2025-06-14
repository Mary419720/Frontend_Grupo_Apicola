import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component'; // Importar RegisterComponent
import { authGuard } from './core/auth/auth.guard'; // Importar el authGuard

export const routes: Routes = [
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
    canActivate: [authGuard] // Aplicar el guard
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  // Aquí irían la ruta del visitante y la de 'not-found'
];
