import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { APICULTURE_CATEGORIES } from '../../../../core/constants/apiculture.constants';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, debounceTime, distinctUntilChanged, Observable, of } from 'rxjs';
import { FavoritesService } from '../../../../core/services/favorites.service';

import { LoadingState, ProductStore } from '../../../../core/services/product.store';
import { Product } from '../../../../core/models/product.model';
import { ProductActionsService } from '../../../../core/services/product-actions.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  // Observables del store para la vista
  products$: Observable<Product[]>;
  loading$: Observable<LoadingState>;
  pagination$: Observable<{ currentPage: number, totalPages: number, limit: number, total: number }>;

  // Estado local para los controles de la UI
  searchControl = new FormControl('');
  selectedCategories: string[] = [];
  
  // Para la UI de filtros
  categories = APICULTURE_CATEGORIES.map(cat => ({ ...cat, count: 0 })); // Simplified version

  constructor(
    public productStore: ProductStore, // Inyectado como público para usarlo en el template
    private productActionsService: ProductActionsService,
    public favoritesService: FavoritesService, // Inyectado como público para la UI
    private router: Router,
    private route: ActivatedRoute,

  ) {
    this.products$ = this.productStore.products$;
    this.loading$ = this.productStore.loading$;
    this.pagination$ = this.productStore.pagination$;

    
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const search = params['search'] || '';
      const categories = params['tipo'] ? params['tipo'].split(',') : [];

      this.searchControl.setValue(search, { emitEvent: false });
      this.selectedCategories = categories;

      const filters: { [param: string]: string | number | boolean } = {};
      if (search) filters['search'] = search;
      if (categories.length > 0) filters['tipo'] = categories.join(',');

      this.productActionsService.fetchFilteredProducts(1, { ...filters, limit: 12 }).subscribe();
    });

    this.listenToSearchChanges();
  }

  // --- Métodos de Interacción con el Store ---

  onPageChange(page: number): void {
    const filters = this.getCurrentFilters();
    this.productActionsService.fetchFilteredProducts(page, filters).subscribe();
  }

  listenToSearchChanges(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const filters: { [param: string]: string | number | boolean } = {};
    const searchTerm = (this.searchControl.value || '').trim();
    if (searchTerm) {
      filters['search'] = searchTerm;
    }
    if (this.selectedCategories.length > 0) {
      filters['tipo'] = this.selectedCategories.join(',');
    }

    // Actualizar URL sin recargar la página
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: filters,
      queryParamsHandling: 'merge',
      replaceUrl: true // Evita añadir al historial de navegación en cada filtro
    });

    // La acción de fetch se encarga de actualizar los filtros en el store
    this.productActionsService.fetchFilteredProducts(1, filters).subscribe();
  }

  toggleCategory(category: string): void {
    const index = this.selectedCategories.indexOf(category);
    if (index === -1) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories.splice(index, 1);
    }
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.selectedCategories = [];
    
    // Limpiar URL y recargar productos
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });

    this.productActionsService.clearFiltersAndFetch().subscribe();
  }

  // --- Métodos para Favoritos ---

  toggleFavorite(productId: string): void {
    if (!productId) return;
    this.favoritesService.toggleFavorite(productId);
  }

  isFavorite(productId: string): Observable<boolean> {
    if (!productId) return of(false);
    return this.favoritesService.isFavorite(productId);
  }

  // --- Métodos de Ayuda para la UI (pueden permanecer si son solo de presentación) ---

  private getCurrentFilters(): { [param: string]: string | number | boolean } {
    const filters: { [param: string]: string | number | boolean } = {};
    const searchTerm = (this.searchControl.value || '').trim();
    if (searchTerm) {
      filters['search'] = searchTerm;
    }
    if (this.selectedCategories.length > 0) {
      filters['tipo'] = this.selectedCategories.join(',');
    }
    return filters;
  }

  // --- Métodos de Ayuda para la UI (pueden permanecer si son solo de presentación) ---

  getMinMaxPrices(product: Product): { min: number, max: number } | null {
    if (!product.presentaciones || product.presentaciones.length === 0) return null;
    const prices = product.presentaciones.map(p => p.precio_venta).filter(p => p != null);
    if (prices.length === 0) return null;
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }

  getProductImage(product: Product): string {
    return product.imagenes?.[0] || 'assets/images/placeholder-product.jpg';
  }

  isNewProduct(product: Product): boolean {
    if (!product.fecha_creacion) return false;
    const diffDays = (new Date().getTime() - new Date(product.fecha_creacion).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  }

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
}
