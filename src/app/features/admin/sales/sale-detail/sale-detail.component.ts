import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SalesService, Sale, SaleProduct } from '../../../../core/services/sales.service';
import { generarComprobantePDF, ComprobantePago } from '../../../../shared/utils/comprobante-pdf.util';

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

  downloadComprobante(): void {
    if (!this.sale) return;

    const data: ComprobantePago = {
      folio: this.sale.folio || this.sale.id || this.sale._id || '',
      fecha: this.sale.fecha,
      cliente: {
        nombre: this.sale.cliente.nombre,
        rfc: this.sale.cliente.rfc,
        direccion: this.sale.cliente.direccion,
        email: this.sale.cliente.email,
      },
      productos: this.sale.productos.map(p => ({
        cantidad: p.cantidad,
        descripcion: p.nombre,
        precio_unitario: p.precio_unitario,
        subtotal_producto: p.subtotal_producto,
      })),
      totales: {
        subtotal: this.sale.totales.subtotal || 0,
        iva: this.sale.totales.iva || 0,
        descuento: this.sale.totales.descuento || 0,
        total: this.sale.totales.total,
        moneda: this.sale.totales.moneda,
      },
      metodoPago: {
        tipo: this.sale.metodo_pago,
        referencia: undefined, // No disponible en el modelo Sale
        fechaPago: undefined, // No disponible en el modelo Sale
      },
      estatus: this.sale.estatus || this.sale.estado || 'No definido',
      notas: this.sale.notas || this.sale.observaciones,
      qr: this.sale.qr,
    };

    generarComprobantePDF(data);
  }
}
