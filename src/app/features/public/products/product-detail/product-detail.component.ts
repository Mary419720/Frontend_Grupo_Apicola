import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  // Variables para el producto
  product: Product | null = null;
  loading = true;
  error = false;
  mainImageUrl = '';
  currentImageIndex = 0;
  relatedProducts: Product[] = [];
  encodedUrl = '';
  isFavorite = false;
  quantity = 1;
  
  // URL base para las imágenes
  private apiBaseUrl = environment.apiUrl;
  
  // Suscripciones para limpiar
  private subscriptions: Subscription[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}
  
  ngOnInit(): void {
    // Obtener el ID del producto desde la URL
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadProductDetails(params['id']);
      }
    });
  }
  
  ngOnDestroy(): void {
    // Limpiar suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  // Cargar detalles del producto
  loadProductDetails(productId: string): void {
    this.loading = true;
    this.error = false;
    
    const productSub = this.productService.getProductById(productId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.product = response.data;
          
          // Establecer la imagen principal
          if (this.product.imagenes && this.product.imagenes.length > 0) {
            this.mainImageUrl = this.getFullImageUrl(this.product.imagenes[0]);
          } else {
            this.mainImageUrl = 'assets/images/image.png';
          }
          
          // Generar URL codificada para compartir
          const currentUrl = window.location.href;
          this.encodedUrl = encodeURIComponent(currentUrl);
          
          // Cargar productos relacionados de la misma categoría
          this.loadRelatedProducts();
        } else {
          this.error = true;
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar el producto:', err);
        this.loading = false;
        this.error = true;
      }
    });
    
    this.subscriptions.push(productSub);
  }
  
  // Cargar productos relacionados (misma categoría)
  loadRelatedProducts(): void {
    if (!this.product?.atributos?.categoria_original) return;

    const filters = {
      categoria_id: this.product.atributos.categoria_original,
      limit: 5 // Pedimos uno más por si el producto actual viene en la lista
    };

    const relatedSub = this.productService.fetchProducts(filters).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Excluir el producto actual de la lista de relacionados y tomar los primeros 4
          this.relatedProducts = response.data
            .filter(p => p._id !== this.product?._id)
            .slice(0, 4);
        }
      },
      error: (err) => {
        console.error('Error al cargar productos relacionados:', err);
      }
    });
    
    this.subscriptions.push(relatedSub);
  }

  // Marcar/desmarcar como favorito
  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    // Aquí iría la lógica para llamar a un servicio de favoritos
    console.log(`Producto marcado como favorito: ${this.isFavorite}`);
  }

  // Incrementar cantidad
  incrementQuantity(): void {
    this.quantity++;
  }

  // Decrementar cantidad
  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  
  // Cambiar la imagen principal
  changeMainImage(imageUrl: string, index: number): void {
    this.mainImageUrl = this.getFullImageUrl(imageUrl);
    this.currentImageIndex = index;
  }
  
  // Obtener el precio mínimo y máximo
  getPriceRange(): { min: number, max: number } | null {
    if (!this.product?.presentaciones || this.product.presentaciones.length === 0) {
      return null;
    }
    
    let min = Number.MAX_VALUE;
    let max = 0;
    
    this.product.presentaciones.forEach(p => {
      if (p.precio_venta < min) min = p.precio_venta;
      if (p.precio_venta > max) max = p.precio_venta;
    });
    
    return { min, max };
  }
  
  // Verificar si un producto es nuevo (menos de 30 días)
  isNewProduct(product: Product): boolean {
    if (!product.fecha_creacion) return false;
    
    const creationDate = new Date(product.fecha_creacion);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - creationDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 30;
  }
  
  // Obtener imagen de un producto relacionado
  getProductImage(product: Product): string {
    if (product.imagenes && product.imagenes.length > 0) {
      return this.getFullImageUrl(product.imagenes[0]);
    }
    return 'assets/images/image.png';
  }
  
  // Convertir path relativo a URL completa
  getFullImageUrl(imagePath: string): string {
    // Si la imagen es vacía o undefined, usar placeholder
    if (!imagePath) {
      return 'assets/images/image.png';
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
    // La URL base para archivos estáticos es distinta de la URL base para la API
    if (imagePath.startsWith('/uploads/')) {
      // Extraer la parte base de la URL (sin '/api')
      const baseUrl = this.apiBaseUrl.replace('/api', '');
      return `${baseUrl}${imagePath}`;
    }
    
    // Si es otra ruta relativa del servidor (comienza con /), adjuntarla a la URL de la API
    if (imagePath.startsWith('/')) {
      return `${this.apiBaseUrl}${imagePath}`;
    }
    
    // De lo contrario, asumir que es una ruta relativa y añadir / antes
    return `${this.apiBaseUrl}/${imagePath}`;
  }
  
  // Obtener precios mínimo y máximo de un producto relacionado
  getMinMaxPrices(product: Product): { min: number, max: number } | null {
    if (!product.presentaciones || product.presentaciones.length === 0) {
      return null;
    }
    
    let min = Number.MAX_VALUE;
    let max = 0;
    
    product.presentaciones.forEach(p => {
      if (p.precio_venta < min) min = p.precio_venta;
      if (p.precio_venta > max) max = p.precio_venta;
    });
    
    return { min, max };
  }
}
