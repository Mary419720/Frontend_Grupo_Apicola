import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode'; // Importación correcta para jwt-decode v3+
  
// Interfaz para la respuesta del login (ajusta según tu backend)
interface AuthResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
    rol: string; // Corregido para coincidir con el backend
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserRoleSource = new BehaviorSubject<string | null>(this.getRoleFromToken());
  currentUserRole$ = this.currentUserRoleSource.asObservable();
  private readonly TOKEN_KEY = 'authToken';

  constructor(private router: Router, private http: HttpClient) { }

  public getApiUrl(): string {
    return this.apiUrl;
  }

  // Registra un nuevo usuario
  register(userInfo: any): Observable<any> { // Define una interfaz más específica para userInfo si es necesario
    return this.http.post<any>(`${this.apiUrl}/auth/register`, userInfo);
    // Podrías añadir un .pipe(tap(...)) si quieres hacer login automático después del registro
  }

  // Inicia sesión llamando al backend
  login(credentials: { email: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        // Almacenar el token y actualizar el rol del usuario actual
        this.storeToken(response.token);
        const userRole = this.getRoleFromToken();
        this.currentUserRoleSource.next(userRole);
        // La redirección ahora se maneja en el componente que llama a login()
      })
    );
  }

  // Simula el cierre de sesión
  logout(): void {
    console.log('Cerrando sesión...');
    this.removeToken();
    this.currentUserRoleSource.next(null);
    this.router.navigate(['/login']);
    console.log('Sesión cerrada con éxito. Token eliminado y redirigido a /login.');
  }

  // Verifica si el usuario está autenticado (tiene un rol)
  isAuthenticated(): boolean {
    const token = this.getToken();
    // Aquí podrías añadir lógica para verificar si el token ha expirado
    return !!token;
  }

  // Verifica si el usuario tiene un rol específico
  hasRole(role: string): boolean {
    return this.currentUserRoleSource.value === role;
  }

  // Obtiene el rol actual del usuario
  getCurrentUserRole(): string | null {
    return this.currentUserRoleSource.value;
  }

  // Métodos para manejar el token JWT
  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Decodifica el token para obtener información (ej. rol)
  // Necesitarás una librería como jwt-decode o implementar tu propia lógica si el token no es opaco
  private getRoleFromToken(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        // Usar jwt-decode para decodificar el token
        const decodedToken = jwtDecode<{ rol: string }>(token); // Corregido para decodificar 'rol'
        return decodedToken.rol || null;
      } catch (e) {
        console.error('Error decodificando token:', e);
        this.removeToken(); // Token inválido, eliminarlo
        return null;
      }
    }
    return null;
  }
}
