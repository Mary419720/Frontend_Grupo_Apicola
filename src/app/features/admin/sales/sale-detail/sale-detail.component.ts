import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SalesService, Sale, SaleProduct } from '../../../../core/services/sales.service';

@Component({
  selector: 'app-sale-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sale-detail.component.html',
  styleUrl: './sale-detail.component.scss'
})
export class SaleDetailComponent implements OnInit {
  sale: Sale | undefined;
  isLoading: boolean = true;
  errorLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private salesService: SalesService
  ) {}
  ngOnInit(): void {
    const saleId = this.route.snapshot.paramMap.get('id');
    if (saleId) {
      this.salesService.getSaleById(saleId).subscribe({
        next: (data) => {
          if (data) {
            this.sale = data;
          } else {
            this.errorLoading = true; // Venta no encontrada
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching sale details:', err);
          this.errorLoading = true;
          this.isLoading = false;
        }
      });
    } else {
      // No hay ID en la ruta, manejar como error o redirigir
      console.error('No sale ID found in route parameters');
      this.errorLoading = true;
      this.isLoading = false;
    }
  }

  calculateProductsSubtotal(products: SaleProduct[]): number {
    if (!products || products.length === 0) return 0;
    return products.reduce((sum, product) => sum + product.subtotal_producto, 0);
  }
}
