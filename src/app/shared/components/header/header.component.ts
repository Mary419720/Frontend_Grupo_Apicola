import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  isMobileMenuOpen = false;
  isAuthenticated$ = this.authService.isAuthenticated$;
  user$ = this.authService.user$;

  // Array reutilizable de enlaces de navegación
  navLinks = [
    { path: '/', label: 'Inicio', exact: true },
    { path: '/products', label: 'Productos', exact: false },
    { path: '/about', label: 'Nosotros', exact: false },
  ];

  // Enlaces para usuarios autenticados
  authLinks = [
    { path: '/favorites', label: 'Mis Favoritos', icon: 'Heart' },
    { path: '/admin', label: 'Dashboard', icon: 'layout-dashboard', requiresAdmin: true },
  ];

  // Campo para almacenar un mensaje de diagnóstico
  diagnosticMessage = '';
  // Control para mostrar/ocultar el diagnóstico
  showDebug = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Suscribirse a cambios en el usuario para detectar actualizaciones
    this.authService.user$.subscribe(user => {
      console.log('Usuario actual:', user); // Log para depuración
      this.cdr.markForCheck();
    });
  }

  ngOnInit() {
    // Extraer y examinar el token directamente
    this.examineToken();
    
    // También intentamos forzar la carga inicial del usuario
    setTimeout(() => {
      const currentUser = this.authService.getCurrentUser();
      console.log('Usuario obtenido directamente:', currentUser);
      this.cdr.markForCheck();
    }, 100);
  }
  
  // Método para examinar directamente el token
  private examineToken() {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        this.diagnosticMessage = 'No hay token almacenado';
        console.warn('No hay token JWT almacenado en localStorage');
        return;
      }
      
      // Log del token completo (no hacer esto en producción)
      console.log('Token JWT:', token);
      
      // Decodificar el token sin validarlo
      const decoded = jwtDecode<any>(token);
      console.log('Token JWT decodificado:', decoded);
      
      // Construir un mensaje de diagnóstico
      this.diagnosticMessage = `Token válido: ${decoded ? 'Sí' : 'No'}\n`;
      
      if (decoded) {
        // Listar todas las propiedades del token
        this.diagnosticMessage += 'Propiedades encontradas en el token:\n';
        
        Object.keys(decoded).forEach(key => {
          this.diagnosticMessage += `- ${key}: ${JSON.stringify(decoded[key])}\n`;
        });
        
        console.log('Diagnóstico:', this.diagnosticMessage);
      }
    } catch (error: any) {
      console.error('Error al examinar el token:', error);
      this.diagnosticMessage = `Error al examinar el token: ${error?.message || 'Desconocido'}`;
    }
  }

  toggleMobileMenu() {
    // Cambiar el estado del menú móvil
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    console.log('Menú móvil: ' + (this.isMobileMenuOpen ? 'abierto' : 'cerrado'));
    
    // Forzar la detección de cambios para actualizar la vista inmediatamente
    this.cdr.detectChanges();
    
    // Prevenir desplazamiento cuando el menú está abierto
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
    this.isMobileMenuOpen = false;
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
    this.isMobileMenuOpen = false;
  }
}
