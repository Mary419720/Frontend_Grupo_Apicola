import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  constructor(private authService: AuthService) {}

  onLogin(): void {
    this.loginError = false;
    if (this.credentials.email === 'admin@melarium.com' && this.credentials.password === 'admin123') {
      this.authService.login('admin');
    } else if (this.credentials.email === 'visitor@melarium.com' && this.credentials.password === 'visitor123') {
      this.authService.login('visitor');
    } else {
      this.loginError = true;
    }
  }
}
