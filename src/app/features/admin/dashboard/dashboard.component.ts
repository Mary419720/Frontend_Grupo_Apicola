import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service'; // Importar AuthService

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  constructor(private authService: AuthService) {} // Inyectar AuthService y eliminar Router si ya no se usa directamente

  logout(): void {
    this.authService.logout(); // Usar el método logout del servicio
  }
}
