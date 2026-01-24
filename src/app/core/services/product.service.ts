import { Injectable } from '@angular/core';
import { HttpResponse, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { of, Observable, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

import { Product, Presentation } from '../models/product.model';
import { environment } from '../../../environments/environment';
import { ApiResponse, ApiListResponse } from '../models/api.model';
import { APICULTURE_TYPES, APICULTURE_CATEGORIES } from '../constants/apiculture.constants';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../constants/pagination.constants';
import { ProductAdapterService } from './product-adapter.service';
import { ProductCacheService } from './product-cache.service';
import { ProductApiService } from './product-api.service';
import { ProductFilters } from '../models/product-filters.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(
    private apiService: ProductApiService,
    private cacheService: ProductCacheService,
    private adapterService: ProductAdapterService
  ) {}

  // --- MÉTODOS DE LECTURA DE DATOS ---

  fetchProducts(filters: ProductFilters = {}, useCache: boolean = true): Observable<ApiListResponse<Product>> {
    const processedFilters = { ...filters };
    if (typeof processedFilters['search'] === 'string' && processedFilters['search'].trim() !== '') {
      useCache = false;
    }

    const orderedParams = new HttpParams({
      fromObject: Object.fromEntries(
        Object.entries(processedFilters)
          .filter(([_, v]) => v != null && v !== '')
          .sort(([a], [b]) => a.localeCompare(b))
      )
    });
    const cacheKey = `products_${orderedParams.toString()}`;

    if (useCache) {
      const cachedResponse = this.cacheService.get<ApiListResponse<Product>>(cacheKey);
      if (cachedResponse) {
        this.log(`Cache HIT para productos con filtros:`, filters);
        return of(cachedResponse);
      }
    }

    this.log(`Cache MISS. Obteniendo productos desde API con filtros:`, filters);
    return this.apiService.fetchProducts(processedFilters).pipe(
      map(response => {
        if (response && response.success && Array.isArray(response.data)) {
          const adaptedProducts = response.data.map(p => this.adapterService.adaptBackendProduct(p));
          const apiResponse: ApiListResponse<Product> = { ...response, data: adaptedProducts };
          if (useCache) {
            this.cacheService.set(cacheKey, apiResponse);
          }
          return apiResponse;
        }
        return { success: false, data: [], message: 'Respuesta de API inválida' };
      }),
      catchError(this.handleError<ApiListResponse<Product>>('fetchProducts', { success: false, data: [], message: 'Error en la petición' }))
    );
  }

  getProductById(id: string): Observable<ApiResponse<Product>> {
    const cacheKey = `product_${id}`;
    const cachedProduct = this.cacheService.get<ApiResponse<Product>>(cacheKey);
    if (cachedProduct) {
      this.log(`Cache HIT para producto ID: ${id}`);
      return of(cachedProduct);
    }

    this.log(`Cache MISS. Obteniendo producto ID: ${id} desde API`);
    return this.apiService.fetchProductById(id).pipe(
      switchMap((response: ApiResponse<Product>) => {
        if (response && response.success && response.data) {
          const adaptedProduct = this.adapterService.adaptBackendProduct(response.data);
          const apiResponse: ApiResponse<Product> = { ...response, data: adaptedProduct };
          this.cacheService.set(cacheKey, apiResponse);
          return of(apiResponse);
        }
        const errorMessage = response?.message || `Producto con ID ${id} no encontrado`;
        return of({ success: false, message: errorMessage, data: null as any });
      }),
      catchError(this.handleError<ApiResponse<Product>>('getProductById'))
    );
  }

  // --- MÉTODOS DE ESCRITURA DE DATOS (PRODUCTOS) ---

  addProduct(product: Partial<Product>, files: File[]): Observable<ApiResponse<Product>> {
    this.log('Añadiendo nuevo producto', product);
    const formData = this.adapterService.adaptProductToFormData(product, files);
    return this.apiService.addProduct(formData).pipe(
      tap(response => {
        if (response.success) {
          this.log('Producto añadido, invalidando caché de listados.');
          this.cacheService.invalidateByPattern('products_');
        }
      }),
      map(response => this.adaptAndReturnProduct(response)),
      catchError(this.handleError<ApiResponse<Product>>('addProduct'))
    );
  }

  updateProduct(id: string, product: Partial<Product>, files: File[]): Observable<ApiResponse<Product>> {
    this.log(`Actualizando producto ID: ${id}`, product);
    const formData = this.adapterService.adaptProductToFormData(product, files, id);
    return this.apiService.updateProduct(id, formData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.log(`Producto ${id} actualizado, actualizando su caché e invalidando listados.`);
          const adaptedProduct = this.adapterService.adaptBackendProduct(response.data);
          this.cacheService.set(`product_${id}`, { ...response, data: adaptedProduct });
          this.cacheService.invalidateByPattern('products_');
        }
      }),
      map(response => this.adaptAndReturnProduct(response)),
      catchError(this.handleError<ApiResponse<Product>>('updateProduct'))
    );
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    this.log(`Eliminando producto ID: ${id}`);
    return this.apiService.deleteProduct(id).pipe(
      tap(() => {
        this.log(`Caché invalidado tras eliminar producto ID: ${id}`);
        this.cacheService.invalidateByPattern('product_');
        this.cacheService.invalidateByPattern('products_');
      }),
      catchError(this.handleError<ApiResponse<void>>('deleteProduct'))
    );
  }

  /**
   * Llama al servicio API para exportar los productos a Excel.
   * @returns Un observable con la respuesta HTTP completa para la descarga.
   */
  exportProductsToExcel(): Observable<HttpResponse<Blob>> {
    this.log('Solicitando exportación de productos a Excel');
    return this.apiService.exportProductsToExcel().pipe(
      catchError(this.handleError<HttpResponse<Blob>>('exportProductsToExcel'))
    );
  }

  // --- MÉTODOS DE ESCRITURA DE DATOS (PRESENTACIONES) ---

  addPresentation(productId: string, presentation: Presentation): Observable<ApiResponse<Product>> {
    this.log(`Añadiendo presentación al producto ${productId}`, presentation);
    return this.apiService.addPresentation(productId, presentation).pipe(
      map(response => this.handlePresentationResponse(response, 'addPresentation'))
    );
  }

  updatePresentation(productId: string, presentationId: string, presentation: Partial<Presentation>): Observable<ApiResponse<Product>> {
    this.log(`Actualizando presentación ${presentationId} del producto ${productId}`, presentation);
    return this.apiService.updatePresentation(productId, presentationId, presentation).pipe(
      map(response => this.handlePresentationResponse(response, 'updatePresentation'))
    );
  }

  deletePresentation(productId: string, presentationId: string): Observable<ApiResponse<Product>> {
    this.log(`Eliminando presentación ${presentationId} del producto ${productId}`);
    return this.apiService.deletePresentation(productId, presentationId).pipe(
      map(response => this.handlePresentationResponse(response, 'deletePresentation'))
    );
  }

  // --- MÉTODOS DE UTILIDAD Y CACHÉ LOCAL ---

  updateProductStockLocally(productId: string, presentationId: string, quantity: number, absolute: boolean = false): boolean {
    this.log(`Actualizando stock localmente para producto ${productId}, presentación ${presentationId}`);
    let updated = false;
    const updateStock = (p: Presentation) => {
      if (typeof p.stock !== 'number') {
        this.logError(`Stock inválido para presentación ${p._id}. Se resetea a 0.`, { stock: p.stock });
        p.stock = 0;
      }
      p.stock = absolute ? quantity : p.stock + quantity;
      updated = true;
    };

    const processProduct = (product: Product) => {
      const presentation = product.presentaciones?.find(p => p._id === presentationId);
      if (presentation) updateStock(presentation);
    };

    const singleProductCacheKey = `product_${productId}`;
    const cachedSingleProduct = this.cacheService.get<ApiResponse<Product>>(singleProductCacheKey);
    if (cachedSingleProduct?.data) {
      processProduct(cachedSingleProduct.data);
      this.cacheService.set(singleProductCacheKey, cachedSingleProduct);
    }

    this.cacheService.getKeysByPattern('products_').forEach(key => {
      const cachedList = this.cacheService.get<ApiListResponse<Product>>(key);
      const productInList = cachedList?.data?.find(p => p._id === productId);
      if (productInList) {
        processProduct(productInList);
        this.cacheService.set(key, cachedList);
      }
    });

    if (!updated) this.logError(`No se encontró la presentación para actualizar stock localmente.`, { productId, presentationId });
    return updated;
  }

  getCategories = () => APICULTURE_CATEGORIES;
  getTypes = () => APICULTURE_TYPES;

  // --- MÉTODOS PRIVADOS AUXILIARES ---

  private adaptAndReturnProduct(response: ApiResponse<any>): ApiResponse<Product> {
    if (response.success && response.data) {
      const adaptedProduct = this.adapterService.adaptBackendProduct(response.data);
      return { ...response, data: adaptedProduct };
    }
    return response as ApiResponse<Product>;
  }

  private handlePresentationResponse(response: ApiResponse<any>, operation: string): ApiResponse<Product> {
    if (response && response.success && response.data) {
      const adaptedProduct = this.adapterService.adaptBackendProduct(response.data);
      const cacheKey = `product_${adaptedProduct._id}`;

      this.log(`Caché del producto ${adaptedProduct._id} actualizado y listados invalidados tras ${operation}.`);
      this.cacheService.set(cacheKey, { ...response, data: adaptedProduct });
      this.cacheService.invalidateByPattern('products_');
      
      return { ...response, data: adaptedProduct };
    }
    return response as ApiResponse<Product>;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      this.logError(`${operation} falló:`, error);
      let errorMessage = 'Ocurrió un error inesperado. Por favor, intente de nuevo.';
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error del cliente: ${error.error.message}`;
      } else if (error.status) {
        errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
      
      if (result && typeof result === 'object') {
        (result as any).message = errorMessage;
      }
      
      return of(result as T);
    };
  }

  private log(message: string, ...optionalParams: any[]): void {
    if (!environment.production || environment.debugMode) {
      console.log(`[ProductService] ${message}`, ...optionalParams);
    }
  }

  private logError(message: string, error: any): void {
    console.error(`[ProductService] ${message}`, error);
  }
}