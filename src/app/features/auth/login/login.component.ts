import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importar Router
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  loginError = false;

  constructor(private authService: AuthService, private router: Router) {} // Inyectar Router

  onLogin(): void {
    this.loginError = false;
    if (this.credentials.email && this.credentials.password) {
      this.authService.login(this.credentials).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);

          // Lógica de redirección basada en el rol del usuario
          if (response && response.user) { // Comprobación de seguridad
            if (response.user.rol === 'administrador') {
              this.router.navigate(['/admin']);
            } else {
              // Para visitantes, redirigir a una página principal o dashboard.
              // NOTA: Actualmente la ruta '/' redirige a '/login'. Deberías crear una ruta como '/dashboard' para los visitantes.
              this.router.navigate(['/']); 
            }
          } else {
            // Si no hay información del usuario, redirigir a una ruta por defecto
            console.error('No se recibió información del usuario en la respuesta.');
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          console.error('Error en el login:', err);
          this.loginError = true;
          // Aquí podrías mostrar un mensaje de error más específico basado en la respuesta del backend
          // Por ejemplo, si err.error.message existe.
        }
      });
    } else {
      // Manejar el caso de campos vacíos si es necesario, aunque la validación del formulario es mejor.
      this.loginError = true; 
      console.log('Email o contraseña vacíos');
    }
  }
}
