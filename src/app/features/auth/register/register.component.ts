import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para ngModel
import { Router, RouterLink } from '@angular/router'; // RouterLink para enlaces
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  userInfo = {
    name: '', // Cambiado de 'nombre' a 'name'
    email: '',
    password: '',
    rol: 'visitante' // Rol por defecto para nuevos registros, ajusta si es necesario
  };
  registrationError = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    this.registrationError = false;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.userInfo.name && this.userInfo.email && this.userInfo.password) { // Cambiado de 'nombre' a 'name'
      this.authService.register(this.userInfo).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.successMessage = '¡Registro exitoso! Serás redirigido al login.';
          // Opcional: Redirigir al login después de un breve retraso
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000); 
        },
        error: (err) => {
          console.error('Error en el registro:', err);
          this.registrationError = true;
          if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.';
          }
        }
      });
    } else {
      this.registrationError = true;
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
    }
  }
}
