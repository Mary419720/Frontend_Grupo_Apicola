import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { SalesService, Sale } from '../../../../core/services/sales.service';
import { AuthService } from '../../../../core/auth/auth.service'; // Importar AuthService
import { LucideAngularModule } from 'lucide-angular';
import { saveAs } from 'file-saver'; // Importar saveAs

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LucideAngularModule
  ],
  templateUrl: './sales-list.component.html',
  styleUrl: './sales-list.component.scss'
})
export class SalesListComponent implements OnInit {
  sales: Sale[] = [];
  isLoading: boolean = true;
  isExporting: boolean = false;
  errorLoading: boolean = false;
  isAdmin: boolean = false;
  // Los íconos se registran globalmente en app.config.ts

  constructor(
    private salesService: SalesService,
    private authService: AuthService, // Inyectar AuthService
    private router: Router,
    private route: ActivatedRoute
  ) {}

  goToDetail(id: string | undefined) {
    if (!id) return;
    // Navega a la ruta hija ':id' relativa a la ruta actual ('sales')
    this.router.navigate([id], { relativeTo: this.route });
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('administrador');
    this.loadSales();
  }

  loadSales(): void {
    this.isLoading = true;
    this.salesService.getSales().subscribe({
      next: (data) => {
        this.sales = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching sales list:', err);
        this.errorLoading = true;
        this.isLoading = false;
      }
    });
  }

  exportToExcel(): void {
    if (!this.isAdmin) return;

    this.isExporting = true;
    this.salesService.exportSalesToExcel().subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          console.error('La respuesta del servidor no contiene un archivo.');
          this.isExporting = false;
          return;
        }

        // Extraer el nombre del archivo de la cabecera 'Content-Disposition'
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `Reporte_Ventas_${new Date().toISOString().slice(0, 10)}.xlsx`; // Nombre por defecto

        if (contentDisposition) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        saveAs(blob, filename);
        this.isExporting = false;
      },
      error: (err) => {
        console.error('Error exporting sales to Excel:', err);
        // Aquí se podría mostrar una notificación de error al usuario
        this.isExporting = false;
      }
    });
  }
}
