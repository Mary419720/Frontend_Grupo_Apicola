import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, Subject, takeUntil, debounceTime, finalize, distinctUntilChanged, tap } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { ApiListResponse, ApiResponse } from '../../../core/models/api.model';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationContainerComponent } from '../../../shared/components/notification-container/notification-container.component';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { ProductStore, LoadingState } from '../../../core/services/product.store';
import { ProductActionsService } from '../../../core/services/product-actions.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // Añadir para FormControl
    RouterModule,
    LucideAngularModule,
    NotificationContainerComponent
  ],
  templateUrl: './manage-products.component.html',
  styleUrls: ['./manage-products.component.css']
  // El store ya se provee en root, no es necesario proveerlo aquí.
})
export class ManageProductsComponent implements OnInit {
  // Observables del store para la vista
  products$: Observable<Product[]>;
  pagination$: Observable<{ currentPage: number, totalPages: number, limit: number, total: number }>;
  loading$: Observable<LoadingState>; // Actualizado al nuevo tipo de estado de carga

  // Estado local para UI
  categories: Category[] = [];
  searchControl = new FormControl('');
  categoryFilter = ''; // Usar '' en lugar de 'all' para el valor por defecto
  pageSize = 10;
  deletingProductId: string | null = null; // Para el estado de carga local al eliminar
  isExporting = false; // Para el estado de carga de la exportación
  
  // URL base para acceder a las imágenes
  private apiBaseUrl = environment.apiUrl.replace('/api', '');


  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    public productStore: ProductStore, // Público para acceso desde la plantilla
    private productActionsService: ProductActionsService,
    private categoryService: CategoryService,
    private notificationService: NotificationService,
    private router: Router,
    private productService: ProductService
  ) {
    this.products$ = this.productStore.products$;
    this.pagination$ = this.productStore.pagination$;
    this.loading$ = this.productStore.loading$;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.listenToSearchChanges();
    this.applyFiltersAndLoad(); // Carga inicial
    this.processProductImages();
  }
  
  /**
   * Procesa las URLs de imágenes en los productos cargados
   */
  private processProductImages(): void {
    this.products$.pipe(takeUntil(this.destroy$)).subscribe(products => {
      if (products && products.length > 0) {
        // Procesar imágenes sin modificar el estado del store directamente
        products.forEach(product => {
          if (product.imagenes && product.imagenes.length > 0) {
            // Actualizar en el objeto local sin afectar al store
            product.imagenes = product.imagenes.map(img => this.getFullImageUrl(img));
          }
        });
      }
    });
  }

  private listenToSearchChanges(): void {
    // Suscribirse a los cambios en el campo de búsqueda
    this.searchControl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged(), // Solo emitir si el valor realmente cambia
      // Agregamos tap para ver el valor actual para depuración
      tap(value => console.log('Nuevo valor de búsqueda:', value)),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Cuando cambia el valor del campo de búsqueda, aplicar filtros
      this.applyFiltersAndLoad();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.categoryService.loadCategories().subscribe({
      next: (cats) => (this.categories = cats),
      error: (err) => {
        const message = err?.error?.message || 'No se pudieron cargar las categorías.';
        this.notificationService.error(message);
        console.error('Error al cargar categorías:', err);
      },
    });
  }

  applyFiltersAndLoad(): void {
    const filters: { [param: string]: string | number | boolean } = {};
    
    // Normalizar y validar el término de búsqueda
    const searchTerm = (this.searchControl.value || '').trim();
    
    // Importante: Siempre incluir el parámetro search, incluso si está vacío
    // Esto fuerza al servicio a realizar una nueva solicitud cuando se borra el campo
    filters['search'] = searchTerm;
    
    if (this.categoryFilter) {
      filters['categoria_id'] = this.categoryFilter;
    }
    
    console.log('Aplicando filtros:', filters);
    
    // Reiniciar a la página 1 cada vez que se aplica un filtro
    this.productActionsService.fetchFilteredProducts(1, { ...filters, limit: this.pageSize }).subscribe();
  }

  loadPage(page: number): void {
    const filters: { [param: string]: string | number | boolean } = {};
    
    // Normalizar y validar el término de búsqueda
    const searchTerm = (this.searchControl.value || '').trim();
    
    // Siempre incluir el parámetro de búsqueda, incluso si está vacío
    filters['search'] = searchTerm;
    
    if (this.categoryFilter) {
      filters['categoria_id'] = this.categoryFilter;
    }
    
    console.log(`Cargando página ${page} con filtros:`, filters);
    this.productActionsService.fetchFilteredProducts(page, { ...filters, limit: this.pageSize }).subscribe();
  }

  getCategoryName(categoryId: string): string {
    return this.categories.find(cat => cat._id === categoryId)?.nombre || 'N/A';
  }

  confirmDelete(product: Product): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${product.nombre}"?`)) {
      if (product._id) {
        this.deleteProduct(product._id);
      } else {
        this.notificationService.error('Este producto no tiene un ID válido para ser eliminado.');
      }
    }
  }

  private deleteProduct(productId: string): void {
    this.deletingProductId = productId;
    this.productActionsService.deleteProduct(productId).pipe(
      finalize(() => {
        this.deletingProductId = null; // Se ejecuta siempre, al completar o al dar error
      })
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.success('Producto eliminado con éxito.');
          // El store ya se actualiza desde la acción, no es necesario refrescar manualmente.
        } else {
          this.notificationService.error(response.message || 'Ocurrió un error al eliminar.');
        }
      },
      error: (err) => {
        const message = err?.error?.message || 'Error de conexión al eliminar el producto.';
        this.notificationService.error(message);
        console.error('Error al eliminar producto:', err);
      }
    });
  }

  // --- Métodos de Ayuda para la UI ---

  getPageNumbers(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let end = start + maxVisiblePages - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    return Array.from({ length: (end - start) + 1 }, (_, i) => start + i);
  }

  trackByProductId(index: number, product: Product): string {
    return product._id || index.toString();
  }
  
  /**
   * Convierte una ruta relativa de imagen en una URL completa
   * @param imagePath Ruta de la imagen (relativa o absoluta)
   * @returns URL completa para acceder a la imagen
   */
  exportToExcel(): void {
    this.isExporting = true;
    this.productService.exportProductsToExcel().subscribe({
      next: (response) => {
        if (!response) {
          // Esto puede ocurrir si el interceptor de autenticación redirige en un 401.
          // El error es manejado por el interceptor, así que simplemente detenemos la ejecución aquí.
          return;
        }

        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'productos.xlsx'; // Nombre por defecto
        if (contentDisposition) {
          const matches = /filename=\"?([^;\"]+)\"?/i.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1];
          }
        }

        if (response.body) {
          saveAs(response.body, filename);
          this.notificationService.success('La exportación de productos se ha completado con éxito.');
        } else {
          this.notificationService.warning('No se recibió un archivo para descargar.');
        }
      },
      error: (err) => {
        console.error('Error al exportar productos:', err);
        this.notificationService.error('Hubo un error al exportar los productos. Inténtalo de nuevo.');
      },
      complete: () => {
        this.isExporting = false;
      }
    });
  }

  getFullImageUrl(imagePath: string): string {
    // Si la imagen es vacía o undefined, usar placeholder
    if (!imagePath) {
      return 'assets/images/placeholder-product.jpg';
    }
    
    // Si ya es una URL completa (comienza con http:// o https://), devolverla tal cual
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Si es una ruta de activos estáticos, devolverla tal cual
    if (imagePath.startsWith('assets/')) {
      return imagePath;
    }
    
    // Si es una ruta que comienza con /uploads/, construir la URL correcta
    if (imagePath.startsWith('/uploads/')) {
      return `${this.apiBaseUrl}${imagePath}`;
    }
    
    // De lo contrario, asumir que es una ruta relativa y añadir / antes
    return `${this.apiBaseUrl}/${imagePath}`;
  }
}