import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { User } from '../models/user.model';

// Interfaz para la respuesta de autenticación del backend
interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'authToken';

  // Fuentes de datos reactivas
  private userSource = new BehaviorSubject<User | null>(null);
  private showLayoutSource = new BehaviorSubject<boolean>(false);

  // Observables públicos
  user$ = this.userSource.asObservable();
  isAuthenticated$ = this.user$.pipe(map(user => !!user));
  currentUserRole$ = this.user$.pipe(map(user => user?.rol ?? null));
  showLayout$ = this.showLayoutSource.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    // Al iniciar, intentar cargar el usuario desde un token válido existente
    this.loadUserFromToken();
  }

  // --- Métodos de Autenticación (API) ---

  register(userInfo: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, userInfo);
  }

  login(credentials: { email: string, password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.storeToken(response.token);
      })
    );
  }

  logout(): void {
    this.removeToken();
    this.router.navigate(['/login']);
  }

  // --- Métodos de Estado y Roles ---

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  hasRole(roles: string | string[]): boolean {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const currentUser = this.userSource.getValue();
    return !!currentUser && allowedRoles.includes(currentUser.rol);
  }

  getCurrentUser(): User | null {
    return this.userSource.getValue();
  }

  // --- Métodos de Visibilidad del Layout ---

  setShowLayout(visible: boolean): void {
    this.showLayoutSource.next(visible);
  }

  // --- Métodos Privados (Manejo de Token y Estado) ---

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.loadUserFromToken(); // Cargar datos del usuario inmediatamente después de guardar el token
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.userSource.next(null);
    this.showLayoutSource.next(false);
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      try {
        // Decodificar el token para examinar su estructura
        const rawDecoded = jwtDecode<any>(token);
        console.log('JWT Token decodificado:', rawDecoded);
        
        // Crear un objeto User con la estructura correcta
        const userData: User = {
          id: rawDecoded.id || rawDecoded.sub || '',
          name: rawDecoded.name || rawDecoded.nombre || rawDecoded.username || '',
          email: rawDecoded.email || rawDecoded.correo || '',
          rol: rawDecoded.rol || rawDecoded.role || 'usuario',
          exp: rawDecoded.exp
        };
        
        console.log('Usuario normalizado:', userData);
        this.userSource.next(userData);
        this.showLayoutSource.next(true);
      } catch (e) {
        console.error('Error decodificando token al cargar:', e);
        this.removeToken(); // Token inválido, limpiar
      }
    } else if (token) {
      // Si el token existe pero está expirado, limpiarlo
      this.removeToken();
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<{ exp?: number }>(token);
      if (decoded.exp) {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        return decoded.exp < nowInSeconds;
      }
      return false; // Si no hay 'exp', no se puede determinar si expiró
    } catch (e) {
      return true; // Si hay error al decodificar, tratarlo como expirado/inválido
    }
  }
}
