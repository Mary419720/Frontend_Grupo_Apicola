import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Category, Subcategory } from '../models/category.model';
import { ApiListResponse, ApiResponse } from '../../core/models/api.model';
import { IS_PUBLIC_API } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();
  private subcategoryCache = new Map<string, Subcategory[]>();

  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Carga las categorías desde el backend si aún no se han cargado.
   * Utiliza un BehaviorSubject para cachear los datos y evitar llamadas repetidas.
   */
  loadCategories(): Observable<Category[]> {
    // Si ya tenemos categorías en el BehaviorSubject, no las volvemos a cargar.
    if (this.categoriesSubject.getValue().length > 0) {
      return this.categories$;
    }

    // Se marca la petición con el contexto IS_PUBLIC_API para que el interceptor no añada el token.
    const context = new HttpContext().set(IS_PUBLIC_API, true);
    return this.http.get<ApiResponse<Category[]>>(this.apiUrl, { context }).pipe(
      map(response => {
        if (response && response.success) {
          this.categoriesSubject.next(response.data);
          this.logInfo('Categorías cargadas y cacheadas desde la API.');
          return response.data;
        } else {
          throw new Error(response.message || 'La respuesta de la API no fue exitosa');
        }
      }),
      catchError(error => {
        this.logError('Error al cargar las categorías', error);
        return throwError(() => new Error('No se pudieron cargar las categorías.'));
      })
    );
  }

  reloadCategories(): Observable<Category[]> {
    const context = new HttpContext().set(IS_PUBLIC_API, true);
    return this.http.get<ApiResponse<Category[]>>(this.apiUrl, { context }).pipe(
      map(response => {
        if (!response.success) throw new Error(response.message || 'Error en respuesta API');
        return response.data;
      }),
      tap(categories => {
        this.categoriesSubject.next(categories);
        this.logInfo('Categorías recargadas desde backend.');
      }),
      catchError(error => {
        this.logError('Error al recargar las categorías.', error);
        return throwError(() => new Error('No se pudieron recargar las categorías.'));
      })
    );
  }

  /**
   * Obtiene la lista de categorías cacheadas.
   * Es un método síncrono que devuelve el valor actual del BehaviorSubject.
   */
  getCategories(): Category[] {
    return this.categoriesSubject.getValue();
  }

  /**
   * Obtiene las subcategorías desde el backend, opcionalmente filtradas por una categoría padre.
   * @param categoryId El ID de la categoría para la cual se desean obtener las subcategorías.
   */
  getSubcategories(categoryId: string): Observable<Subcategory[]> {
    if (this.subcategoryCache.has(categoryId)) {
      this.logInfo(`Subcategorías cacheadas para categoría ${categoryId}`);
      return of(this.subcategoryCache.get(categoryId)!);
    }

    const token = this.authService.getToken();
    if (!token) {
      return throwError(() => new Error('Token de autenticación no encontrado.'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${environment.apiUrl}/subcategories?category=${categoryId}`;

    return this.http.get<ApiResponse<Subcategory[]>>(url, { headers }).pipe(
      map(response => {
        if (response && response.success) {
          this.subcategoryCache.set(categoryId, response.data);
          return response.data;
        } else {
          throw new Error(response.message || 'La respuesta de la API no fue exitosa para subcategorías');
        }
      }),
      catchError(error => {
        this.logError(`Error al cargar subcategorías para la categoría ${categoryId}`, error);
        return throwError(() => new Error('No se pudieron cargar las subcategorías.'));
      })
    );
  }

  private logInfo(message: string, ...optionalParams: any[]): void {
    if (!environment.production || environment.debugMode) {
      console.log(`[CategoryService] INFO: ${message}`, ...optionalParams);
    }
  }

  private logError(message: string, ...optionalParams: any[]): void {
    console.error(`[CategoryService] ERROR: ${message}`, ...optionalParams);
  }
}
