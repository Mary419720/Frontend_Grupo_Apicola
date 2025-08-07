import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { FavoritesService } from '../../../core/services/favorites.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LucideAngularModule } from 'lucide-angular';
@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [
    CommonModule,
    ProductCardComponent,
    LucideAngularModule,// Importamos SharedModule para poder usar app-product-card
  ],
  templateUrl: './favorites-list.component.html',
  styleUrls: ['./favorites-list.component.scss']
})
export class FavoritesListComponent implements OnInit {
  private favoritesService = inject(FavoritesService);

  favoriteProducts$!: Observable<Product[]>;

  ngOnInit(): void {
    this.favoriteProducts$ = this.favoritesService.getFavoriteProducts();
  }
}
