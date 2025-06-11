import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { Product, Presentation } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { EditProductComponent } from '../edit-product/edit-product.component';
import { RouterModule } from '@angular/router'; // Importar RouterModule
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, EditProductComponent, RouterModule, LucideAngularModule], // Añadir RouterModule
  templateUrl: './manage-products.component.html',
  styleUrls: ['./manage-products.component.css']
})
export class ManageProductsComponent implements OnInit {
  products$!: Observable<Product[]>;
  private allProducts: Product[] = [];

  searchTerm$ = new BehaviorSubject<string>('');
  categoryFilter$ = new BehaviorSubject<string>('all');
  providerFilter$ = new BehaviorSubject<string>('all');

  categories: string[] = [];
  providers: string[] = [];

  isModalVisible = false;
  selectedPresentation: Presentation | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.initializeFilteredProductsStream();
  }

  private initializeFilteredProductsStream(): void {
    this.products$ = combineLatest([
      this.productService.getProducts(), // Escucha los cambios directamente del servicio
      this.searchTerm$.pipe(debounceTime(300), startWith('')), 
      this.categoryFilter$.pipe(startWith('all')),
      this.providerFilter$.pipe(startWith('all'))
    ]).pipe(
      map(([products, searchTerm, category, provider]) => {
        this.allProducts = products; // Actualiza la lista local para la lógica de edición
        this.populateFilterOptions(products);

        let filteredProducts = products;

        if (category !== 'all') {
          filteredProducts = filteredProducts.filter(p => p.categoria === category);
        }

        if (searchTerm) {
          const searchTermLower = searchTerm.toLowerCase();
          filteredProducts = filteredProducts.filter(p => 
            p.nombre.toLowerCase().includes(searchTermLower) ||
            p.codigo.toLowerCase().includes(searchTermLower) ||
            p.presentaciones.some(pres => pres.sku.toLowerCase().includes(searchTermLower))
          );
        }

        return filteredProducts.map(product => {
          const matchingPresentations = product.presentaciones.filter(pres => {
            return provider === 'all' || pres.proveedor === provider;
          });
          return { ...product, presentaciones: matchingPresentations };
        }).filter(product => product.presentaciones.length > 0);
      })
    );
  }

  private populateFilterOptions(products: Product[]): void {
    const allCategories = products.map(p => p.categoria);
    this.categories = [...new Set(allCategories)];
    const allProviders = products.flatMap(p => p.presentaciones.map(pr => pr.proveedor));
    this.providers = [...new Set(allProviders)];
  }

  onSearchTermChange(term: string): void {
    this.searchTerm$.next(term);
  }

  onCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.categoryFilter$.next(selectElement.value);
  }

  onProviderChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.providerFilter$.next(selectElement.value);
  }

  editProduct(id: string): void {
    for (const product of this.allProducts) {
      const presentation = product.presentaciones.find(p => p.id === id);
      if (presentation) {
        this.selectedPresentation = presentation;
        this.isModalVisible = true;
        break;
      }
    }
  }

  deleteProduct(id: string): void {
    const confirmation = confirm('¿Estás seguro de que quieres eliminar esta presentación?');
    if (confirmation) {
      this.productService.deletePresentation(id);
    }
  }

  handleSave(presentation: Presentation): void {
    this.productService.updatePresentation(presentation);
    this.handleClose();
  }

  handleClose(): void {
    this.isModalVisible = false;
    this.selectedPresentation = null;
  }
}
