import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Product } from 'src/app/core/models/product.model';
import { FavoritesService } from 'src/app/core/services/favorites.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-product-card',
  standalone: true,
    imports: [
      CommonModule,
      RouterModule,
      LucideAngularModule
    ],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;
  defaultImage = '../../../../assets/images/no-image.png';
  isFavorite$!: Observable<boolean>;

  constructor(private favoritesService: FavoritesService) { }

  ngOnInit(): void {
    const productId = this.product?._id;
    if (productId) {
      console.log(`ProductCardComponent (${this.product.nombre}): ngOnInit`);
      this.isFavorite$ = this.favoritesService.isFavorite(productId).pipe(
        tap((isFav: boolean) => {
          console.log(`ProductCardComponent (${this.product.nombre}): isFavorite$ emitió: ${isFav}`);
        })
      );
    } else {
      this.isFavorite$ = of(false);
    }
  }

  toggleFavorite(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    const productId = this.product?._id;
    if (productId) {
      console.log(`ProductCardComponent (${this.product.nombre}): toggleFavorite`);
      this.favoritesService.toggleFavorite(productId);
    }
  }

  getProductImage(product: Product): string {
    if (product?.imagenes?.length > 0) {
      const imagePath = product.imagenes[0];

      // Si la URL es de un placeholder, usar la imagen local por defecto.
      if (imagePath.includes('placeholder.com')) {
        return 'assets/images/placeholder-product.jpg';
      }

      // Si la ruta ya es una URL completa (y no es de placeholder), la devuelve directamente.
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      
      // Construye la URL completa usando la URL base del backend.
      const baseUrl = environment.apiUrl.replace('/api', '');
      return `${baseUrl}${imagePath}`;
    }
    
    // Devuelve una imagen por defecto si no hay imágenes disponibles.
    return 'assets/images/placeholder-product.jpg';
  }

  getMinMaxPrices(product: Product) {
    if (!product?.presentaciones?.length) {
      return null;
    }

    const validPrices = product.presentaciones
      .map((p: any) => p.precio_venta) // Corregido a precio_venta
      .filter((p: any) => typeof p === 'number' && isFinite(p));

    if (validPrices.length === 0) {
      return null;
    }

    return {
      min: Math.min(...validPrices),
      max: Math.max(...validPrices),
    };
  }
}
