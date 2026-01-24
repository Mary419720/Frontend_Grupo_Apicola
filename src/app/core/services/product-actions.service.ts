import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';
import { ProductService } from './product.service';
import { ProductStore, LoadingState } from './product.store';
import { Product, Presentation } from '../models/product.model';
import { ApiListResponse, ApiResponse } from '../models/api.model';
import { ProductFilters } from '../models/product-filters.model';

@Injectable({
  providedIn: 'root'
})
export class ProductActionsService {

  constructor(
    private productStore: ProductStore,
    private productService: ProductService
  ) {}

  private wrapWithLoading<T>(
    obs$: Observable<T>,
    key: keyof LoadingState,
    onSuccess?: (data: T) => void
  ): Observable<T> {
    this.productStore.setLoading(key, true);
    this.productStore.setError(key, null);

    return obs$.pipe(
      tap(data => {
        if (onSuccess) {
          onSuccess(data);
        }
      }),
      catchError(error => {
        // Extraer el mensaje de error específico del backend si está disponible
        const errorMessage = error?.error?.message || error?.message || 'Ocurrió un error inesperado.';
        this.productStore.setError(key, errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        this.productStore.setLoading(key, false);
      })
    );
  }

  fetchFilteredProducts(page = 1, filters: ProductFilters = {}): Observable<ApiListResponse<Product>> {
    const combinedFilters = { ...this.productStore.filtersValue, ...filters, page };
    
    return this.wrapWithLoading(
      this.productService.fetchProducts(combinedFilters),
      'list',
      (response) => {
        if (response.success) {
            this.productStore.setProducts(response.data);
            this.productStore.setPagination({
                currentPage: response.page || 1,
                totalPages: response.pages || 1,
                total: response.total || 0,
                limit: response.limit || 10,
            });
        } else {
            throw new Error(response.message || 'Error al cargar productos');
        }
      }
    );
  }

  fetchProductById(id: string): Observable<ApiResponse<Product>> {
    return this.wrapWithLoading(
      this.productService.getProductById(id),
      'select',
      (response) => {
        if (response.success) {
          this.productStore.setSelectedProduct(response.data);
        }
      }
    );
  }

  createProduct(product: Partial<Product>, files: File[]): Observable<ApiResponse<Product>> {
    return this.wrapWithLoading(
      this.productService.addProduct(product, files),
      'create',
      (response) => {
        if (response.success && response.data) {
          this.productStore.addProduct(response.data);
        }
      }
    );
  }

  updateProduct(id: string, product: Partial<Product>, files: File[]): Observable<ApiResponse<Product>> {
    return this.wrapWithLoading(
      this.productService.updateProduct(id, product, files),
      'update',
      (response) => {
        if (response.success && response.data) {
          this.updateProductInStore(response.data);
        }
      }
    );
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.wrapWithLoading(
      this.productService.deleteProduct(id),
      'delete',
      (response) => {
        if (response.success) {
            this.productStore.removeProduct(id);
        }
      }
    );
  }

  createPresentation(productId: string, presentation: Presentation): Observable<ApiResponse<Product>> {
    return this.wrapWithLoading(
      this.productService.addPresentation(productId, presentation),
      'update',
      (response) => {
        if (response.success && response.data) {
          this.updateProductInStore(response.data);
        }
      }
    );
  }

  updatePresentation(productId: string, presentation: Presentation): Observable<ApiResponse<Product>> {
    if (!presentation._id) {
      return throwError(() => new Error('El ID de la presentación es requerido para actualizar.'));
    }
    return this.wrapWithLoading(
      this.productService.updatePresentation(productId, presentation._id, presentation),
      'update',
      (response) => {
        if (response.success && response.data) {
          this.updateProductInStore(response.data);
        }
      }
    );
  }

  deletePresentation(productId: string, presentationId: string): Observable<ApiResponse<Product>> {
    return this.wrapWithLoading(
      this.productService.deletePresentation(productId, presentationId),
      'update',
      (response) => {
        if (response.success && response.data) {
          this.updateProductInStore(response.data);
        }
      }
    );
  }
  
  private updateProductInStore(updatedProduct: Product): void {
    this.productStore.updateProduct(updatedProduct);
  }

  setFilters(filters: ProductFilters): void {
    this.productStore.setFilters(filters);
    this.fetchFilteredProducts(1, filters).subscribe();
  }

  clearFilters(): void {
    this.productStore.clearFilters();
    this.fetchFilteredProducts(1).subscribe();
  }

  clearFiltersAndFetch(): Observable<ApiListResponse<Product>> {
    this.productStore.clearFilters();
    // Llama a fetchFilteredProducts con la página 1 y un objeto de filtros vacío
    return this.fetchFilteredProducts(1, {});
  }

  goToPage(page: number): void {
    this.fetchFilteredProducts(page, this.productStore.filtersValue).subscribe();
  }
  
  fetchLowStockProducts(): Observable<ApiListResponse<Product>> {
    return this.wrapWithLoading(
        this.productService.fetchProducts({ stock_status: 'low' }),
        'lowStock',
        (response) => {
            if (response.success) {
                this.productStore.setLowStockProducts(response.data);
            }
        }
    );
  }
}
