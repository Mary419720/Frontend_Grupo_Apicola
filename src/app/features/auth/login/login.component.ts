import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loginError = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    this.loginError = false;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        // Después del login, el AuthService ya tiene la información del usuario.
        const user = this.authService.getCurrentUser();
        console.log('Usuario logueado:', user);
        
        // Redireccionar según el rol del usuario
        if (user && user.rol === 'administrador') {
          console.log('Redirigiendo a panel de administración');
          this.router.navigate(['/admin']);
        } else {
          console.log('Redirigiendo a página principal');
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.loginError = true;
        this.errorMessage = err.error?.message || 'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.';
      }
    });
  }
}
