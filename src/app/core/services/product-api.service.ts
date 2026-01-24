import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiListResponse, ApiResponse } from '../models/api.model';
import { Product, Presentation } from '../models/product.model';
import { ProductFilters } from '../models/product-filters.model';
import { IS_PUBLIC_API } from '../constants/api.constants';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../constants/pagination.constants';

@Injectable({
  providedIn: 'root'
})
export class ProductApiService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  // --- Productos ---

  /**
   * Obtiene la lista de productos desde la API, aplicando filtros y paginación.
   * @param filters Objeto con los filtros a aplicar.
   * @returns Un observable con la lista de productos paginada.
   */
  fetchProducts(filters: ProductFilters = {}): Observable<ApiListResponse<Product>> {
    const params = new HttpParams({
      fromObject: {
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null && v !== '')),
      },
    });
    return this.http.get<ApiListResponse<Product>>(this.apiUrl, { params });
  }

  /**
   * Obtiene un producto específico por su ID.
   * @param id El ID del producto a obtener.
   * @returns Un observable con el producto solicitado.
   */
  fetchProductById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo producto.
   * @param formData Los datos del producto en formato FormData (incluye imágenes).
   * @returns Un observable con el producto creado.
   */
  addProduct(formData: FormData): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.apiUrl, formData);
  }

  /**
   * Actualiza un producto existente.
   * @param id El ID del producto a actualizar.
   * @param formData Los datos del producto en formato FormData.
   * @returns Un observable con el producto actualizado.
   */
  updateProduct(id: string, formData: FormData): Observable<ApiResponse<Product>> {
    // NO establecer Content-Type manualmente, dejar que el navegador lo determine automáticamente
    // Cuando se envía FormData, el navegador configura automáticamente el Content-Type correcto
    // y el boundary necesario para separar las partes del formulario
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, formData, {
      // Asegurarse de que no se transforme el body de la petición
      // Esto es esencial para el correcto envío de FormData con archivos
      reportProgress: true, // Opcional: permite seguir el progreso de la carga
    });
  }

  /**
   * Elimina un producto por su ID.
   * @param id El ID del producto a eliminar.
   * @returns Un observable vacío tras la eliminación.
   */
  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Solicita la exportación de todos los productos a un archivo Excel.
   * @returns Un observable con la respuesta HTTP completa, conteniendo el archivo como un Blob.
   */
  exportProductsToExcel(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/export`, {
      observe: 'response',
      responseType: 'blob',
      context: new HttpContext().set(IS_PUBLIC_API, false)
    });
  }

  // --- Presentaciones ---

  /**
   * Añade una nueva presentación a un producto.
   * @param productId El ID del producto padre.
   * @param presentation La nueva presentación a añadir.
   * @returns Un observable con el producto actualizado (incluyendo la nueva presentación).
   */
  addPresentation(productId: string, presentation: Presentation): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.apiUrl}/${productId}/presentations`, presentation);
  }

  /**
   * Actualiza una presentación existente.
   * @param productId El ID del producto padre.
   * @param presentationId El ID de la presentación a actualizar.
   * @param presentation Los datos parciales para actualizar.
   * @returns Un observable con el producto actualizado.
   */
  updatePresentation(productId: string, presentationId: string, presentation: Partial<Presentation>): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${productId}/presentations/${presentationId}`, presentation);
  }

  /**
   * Elimina una presentación de un producto.
   * @param productId El ID del producto padre.
   * @param presentationId El ID de la presentación a eliminar.
   * @returns Un observable con el producto actualizado.
   */
  deletePresentation(productId: string, presentationId: string): Observable<ApiResponse<Product>> {
    return this.http.delete<ApiResponse<Product>>(`${this.apiUrl}/${productId}/presentations/${presentationId}`);
  }
}
