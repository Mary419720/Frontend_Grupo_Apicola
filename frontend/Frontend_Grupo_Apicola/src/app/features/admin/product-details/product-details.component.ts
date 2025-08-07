import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Presentation } from '../../../core/models/product.model';
import { Category, Subcategory } from '../../../core/models/category.model';
import { switchMap, map, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    CurrencyPipe,
    LucideAngularModule
    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Esto permite el uso de elementos personalizados como lucide-icon
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  category: string = '';
  subcategory: string = '';
  loading: boolean = true;
  error: string | null = null;
  selectedImageIndex: number = 0;
  expandedPanelIndex: number | null = null;
  
  // URL base para acceder a las imágenes
  private apiBaseUrl = environment.apiUrl.replace('/api', '');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (!productId) {
      this.error = 'No se encontró el ID del producto';
      this.loading = false;
      return;
    }

    this.loadProduct(productId);
  }

  loadProduct(productId: string): void {
    this.loading = true;
    this.productService.getProductById(productId)
      .pipe(
        switchMap(response => {
          if (response.success && response.data) {
            this.product = response.data;
            
            // Procesar las URLs de las imágenes para asegurar que sean URLs completas
            if (this.product.imagenes && this.product.imagenes.length > 0) {
              this.product.imagenes = this.product.imagenes.map(img => this.getFullImageUrl(img));
            }
            
            // Obtener categoría desde el array local
            const categories = this.categoryService.getCategories();
            if (categories && categories.length > 0) {
              this.category = categories.find(category => category._id === this.product?.categoria_id)?.nombre || 'No especificada';
            }
            
            // Si hay ID de subcategoría, cargar subcategorías
            if (this.product.subcategoria_id) {
              return this.categoryService.getSubcategories(this.product.categoria_id).pipe(
                map(subcategories => {
                  if (subcategories && subcategories.length > 0) {
                    this.subcategory = subcategories.find(sub => sub._id === this.product?.subcategoria_id)?.nombre || 'No especificada';
                  }
                  return this.product;
                }),
                catchError(error => {
                  console.error('Error al cargar la subcategoría', error);
                  return of(this.product);
                })
              );
            } else {
              return of(this.product);
            }
          } else {
            throw new Error('No se pudo cargar el producto');
          }
        }),
        finalize(() => {
          this.loading = false;
        }),
        catchError(error => {
          this.error = error.message || 'Error al cargar el producto';
          this.loading = false;
          return of(null);
        })
      )
      .subscribe();
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  goBack(): void {
    this.router.navigate(['/admin/manage-products']);
  }

  goToEdit(): void {
    if (this.product && this.product._id) {
      this.router.navigate(['/admin/edit-product', this.product._id]);
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  }

  toggleAccordion(index: number): void {
    if (this.expandedPanelIndex === index) {
      this.expandedPanelIndex = null; // Colapsar el panel actualmente expandido
    } else {
      this.expandedPanelIndex = index; // Expandir el nuevo panel
    }
  }
  
  isExpanded(index: number): boolean {
    return this.expandedPanelIndex === index;
  }
  
  /**
   * Convierte una ruta relativa de imagen en una URL completa
   * @param imagePath Ruta de la imagen (relativa o absoluta)
   * @returns URL completa para acceder a la imagen
   */
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
