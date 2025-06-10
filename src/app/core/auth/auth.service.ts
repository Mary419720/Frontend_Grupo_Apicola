import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserRole: string | null = null;

  constructor(private router: Router) { }

  // Simula el inicio de sesión estableciendo un rol
  login(role: 'admin' | 'visitor'): void {
    this.currentUserRole = role;
    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'visitor') {
      this.router.navigate(['/visitor']); // Ruta para visitante (aún no creada)
    }
  }

  // Simula el cierre de sesión
  logout(): void {
    this.currentUserRole = null;
    this.router.navigate(['/login']);
  }

  // Verifica si el usuario está autenticado (tiene un rol)
  isAuthenticated(): boolean {
    return !!this.currentUserRole;
  }

  // Verifica si el usuario tiene un rol específico
  hasRole(role: string): boolean {
    return this.currentUserRole === role;
  }

  // Obtiene el rol actual del usuario
  getCurrentUserRole(): string | null {
    return this.currentUserRole;
  }
}
