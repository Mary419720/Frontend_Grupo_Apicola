import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth/auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-auth-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-container" style="padding: 20px; background: #f5f5f5; border: 1px solid #ddd; margin: 20px; border-radius: 5px;">
      <h2>Información de Autenticación (Debug)</h2>
      
      <div style="margin-top: 15px;">
        <h3>Estado de Autenticación</h3>
        <p>¿Está autenticado?: <strong>{{ isAuthenticated ? 'Sí' : 'No' }}</strong></p>
      </div>

      <div style="margin-top: 15px;">
        <h3>Usuario Actual</h3>
        <pre>{{ userJson }}</pre>
      </div>

      <div style="margin-top: 15px;">
        <h3>Verificación de Roles</h3>
        <p>¿Es administrador? (hasRole): <strong>{{ isAdmin ? 'Sí' : 'No' }}</strong></p>
        <p>Rol en el objeto usuario: <strong>{{ userRole }}</strong></p>
      </div>

      <div style="margin-top: 15px;">
        <h3>Token JWT (Raw)</h3>
        <div style="max-height: 100px; overflow-y: auto; background: #eee; padding: 10px; border: 1px solid #ccc;">
          {{ token || 'No hay token disponible' }}
        </div>
      </div>

      <div style="margin-top: 15px;">
        <h3>Token JWT (Decodificado)</h3>
        <pre>{{ decodedToken }}</pre>
      </div>
    </div>
  `
})
export class AuthDebugComponent implements OnInit {
  isAuthenticated = false;
  user: any = null;
  userJson = '{}';
  token: string | null = null;
  decodedToken = '{}';
  isAdmin = false;
  userRole = 'ninguno';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Cargar datos de autenticación
    this.isAuthenticated = this.authService.isAuthenticated();
    this.user = this.authService.getCurrentUser();
    this.userJson = JSON.stringify(this.user, null, 2);
    
    // Verificar rol de administrador
    this.isAdmin = this.authService.hasRole('administrador');
    this.userRole = this.user?.rol || 'no definido';

    // Obtener y decodificar token
    this.token = this.authService.getToken();
    
    if (this.token) {
      try {
        const decoded = jwtDecode<any>(this.token);
        this.decodedToken = JSON.stringify(decoded, null, 2);
        
        // Mostrar en consola para depuración
        console.log('AUTH DEBUG - Token decodificado:', decoded);
        console.log('AUTH DEBUG - Rol del usuario:', this.userRole);
        console.log('AUTH DEBUG - ¿Es admin?:', this.isAdmin);
      } catch (e) {
        this.decodedToken = JSON.stringify({error: 'Error al decodificar el token'});
        console.error('AUTH DEBUG - Error al decodificar token:', e);
      }
    }
  }
}
