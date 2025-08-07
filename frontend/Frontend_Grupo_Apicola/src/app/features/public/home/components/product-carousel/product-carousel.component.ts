import { Component, OnInit, OnDestroy, signal, effect, ChangeDetectionStrategy, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';

import { ProductCardComponent } from 'src/app/shared/components/product-card/product-card.component';
import { SpinnerComponent } from 'src/app/shared/components/spinner/spinner.component';
import { Product } from 'src/app/core/models/product.model';
import { Category } from 'src/app/core/models/category.model';
import { ProductService } from 'src/app/core/services/product.service';
import { CategoryService } from 'src/app/core/services/category.service';
import { ProductFilters } from 'src/app/core/models/product-filters.model';
import { ApiResponse } from 'src/app/core/models/api-response.model';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  templateUrl: './product-carousel.component.html',
  styleUrls: ['./product-carousel.component.scss'],
  imports: [CommonModule, RouterModule, ProductCardComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCarouselComponent implements OnInit, OnDestroy {
  categories = signal<Category[]>([]);
  products: WritableSignal<Product[]> = signal([]);
  loadingProducts = signal(false);
  currentIndex = signal(0);

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private currentProductsSub?: Subscription;

  constructor() {
    effect(() => {
      // Este efecto se ejecutará cuando cambie el índice o las categorías.
      // La guarda asegura que solo se carguen productos si hay categorías disponibles.
      const index = this.currentIndex();
      const categories = this.categories();

      // La guarda asegura que solo se carguen productos si hay categorías disponibles.
      // La dependencia explícita de `index` y `categories` asegura que el efecto
      // se ejecute cuando cualquiera de los dos cambie.
      if (categories.length > 0) {
        this.loadProductsWithDelay();
      }
    });
  }

  ngOnInit(): void {
    this.categoryService.loadCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories: Category[]) => {
          this.categories.set(categories || []);
        },
        error: (err) => {
          console.error('Error al cargar categorías:', err);
          this.categories.set([]);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get currentCategory(): Category | undefined {
    const cats = this.categories();
    const idx = this.currentIndex();
    return cats?.[idx];
  }

  prevCategory(): void {
    const len = this.categories().length;
    if (len === 0) return;
    this.currentIndex.update(i => (i - 1 + len) % len);
  }

  nextCategory(): void {
    const len = this.categories().length;
    if (len === 0) return;
    this.currentIndex.update(i => (i + 1) % len);
  }

  private loadProductsWithDelay(): void {
    queueMicrotask(() => this.loadProductsForCurrentCategory());
  }

  private loadProductsForCurrentCategory(): void {
    const category = this.currentCategory;
    if (!category?._id) {
      this.products.set([]);
      return;
    }

    this.loadingProducts.set(true);
    this.products.set([]);
    const filters: ProductFilters = { categoria_id: category._id, limit: 20, page: 1 };

    this.currentProductsSub?.unsubscribe();

    this.currentProductsSub = this.productService.fetchProducts(filters, false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ApiResponse<Product[]>) => {
          if (category._id === this.currentCategory?._id) {
            this.products.set(res.success ? res.data : []);
          }
          this.loadingProducts.set(false);
        },
        error: (err: any) => {
          console.error(`Error al cargar productos para la categoría ${category.nombre}:`, err);
          this.products.set([]);
          this.loadingProducts.set(false);
        }
      });
  }

  goToCatalog(): void {
    const category = this.currentCategory;
    if (category) {
      this.router.navigate(['/products'], { queryParams: { category: category.nombre } });
    }
  }
}
