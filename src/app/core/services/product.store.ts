import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { ProductFilters } from '../models/product-filters.model';

export interface LoadingState {
  list: boolean;
  select: boolean;
  delete: boolean;
  create: boolean;
  update: boolean;
  lowStock: boolean;
}

export type ErrorState = {
  [K in keyof LoadingState]?: string | null;
};

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  lowStockProducts: Product[];
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  loading: LoadingState;
  error: ErrorState;
  filters: ProductFilters;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  lowStockProducts: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  loading: {
    list: false,
    select: false,
    delete: false,
    create: false,
    update: false,
    lowStock: false,
  },
  error: {},
  filters: {},
};

@Injectable({
  providedIn: 'root'
})
export class ProductStore {
  private readonly _state = new BehaviorSubject<ProductState>(initialState);

  // --- Selectores y Getters ---
  readonly state$: Observable<ProductState> = this._state.asObservable();
  readonly products$ = this.state$.pipe(map(s => s.products));
  readonly selectedProduct$ = this.state$.pipe(map(s => s.selectedProduct));
  readonly lowStockProducts$ = this.state$.pipe(map(s => s.lowStockProducts));
  readonly pagination$ = this.state$.pipe(map(s => ({ 
    currentPage: s.currentPage, totalPages: s.totalPages, limit: s.limit, total: s.total
  })));
  readonly loading$ = this.state$.pipe(map(s => s.loading));
  readonly error$ = this.state$.pipe(map(s => s.error));
  readonly filters$ = this.state$.pipe(map(s => s.filters));

  get productsValue(): Product[] { return this._state.getValue().products; }
  get filtersValue(): ProductFilters { return this._state.getValue().filters; }

  // --- Acciones para modificar el estado ---
  setLoading(key: keyof LoadingState, value: boolean) {
    this.patchState({ loading: { ...this._state.getValue().loading, [key]: value } });
  }

  setError(key: keyof ErrorState, message: string | null) {
    this.patchState({ error: { ...this._state.getValue().error, [key]: message } });
  }

  setProducts(products: Product[]) {
    this.patchState({ products });
  }

  setPagination(pagination: { currentPage: number, totalPages: number, total: number, limit: number }) {
    this.patchState(pagination);
  }

  setSelectedProduct(product: Product | null) {
    this.patchState({ selectedProduct: product });
  }

  addProduct(product: Product) {
    this.patchState({ products: [product, ...this.productsValue] });
  }

  updateProduct(updatedProduct: Product) {
    const updatedProducts = this.productsValue.map(p => p._id === updatedProduct._id ? updatedProduct : p);
    this.patchState({ products: updatedProducts });
    if (this._state.getValue().selectedProduct?._id === updatedProduct._id) {
      this.patchState({ selectedProduct: updatedProduct });
    }
  }

  removeProduct(productId: string) {
    const filteredProducts = this.productsValue.filter(p => p._id !== productId);
    this.patchState({ products: filteredProducts });
  }

  setLowStockProducts(products: Product[]) {
    this.patchState({ lowStockProducts: products });
  }

  setFilters(filters: ProductFilters) {
    this.patchState({ filters });
  }

  clearFilters() {
    this.patchState({ filters: {} });
  }

  private patchState(patch: Partial<ProductState>) {
    this._state.next({ ...this._state.getValue(), ...patch });
  }
}
