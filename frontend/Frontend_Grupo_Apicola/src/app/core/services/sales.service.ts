import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiListResponse, ApiResponse } from '../models/api.model';

// Interfaces alineadas con el modelo del Backend
export interface SaleProduct {
  producto_id: string;
  presentacion_id: string; // ID de la presentación específica vendida
  nombre: string;
  cantidad: number;
  unidad: string;
  precio_unitario: number;
  subtotal_producto: number;
}

export interface Sale {
  _id?: string;
  folio?: string;
  fecha?: string;
  cliente: {
    tipo: string;
    usuario_id?: string;
    nombre: string;
    email?: string;
    rfc?: string;
    direccion?: string;
  };
  productos: SaleProduct[];
  totales: {
    subtotal: number;
    descuento?: number;
    iva?: number;
    total: number;
    moneda: string;
  };
  metodo_pago: string;
  estado?: string;
  usuario_vendedor_id?: string;
  ubicacion_venta?: string;
  notas?: string;
  qr?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) { }

  /**
   * Registra una nueva venta en el sistema.
   * @param saleData Los datos de la venta a crear.
   * @returns Un Observable con la respuesta del backend.
   */
  createSale(saleData: Sale): Observable<Sale> {
    return this.http.post<ApiResponse<Sale>>(this.apiUrl, saleData).pipe(
      map(response => response.data),
      catchError(this.handleError<Sale>('createSale'))
    );
  }

  /**
   * Obtiene todas las ventas registradas.
   * @returns Un Observable con un arreglo de ventas.
   */
  getSales(): Observable<Sale[]> {
    return this.http.get<ApiListResponse<Sale>>(this.apiUrl).pipe(
      map(response => response.data || []),
      catchError(this.handleError<Sale[]>('getSales', []))
    );
  }

  /**
   * Obtiene una venta específica por su ID.
   * @param id El ID de la venta a obtener.
   * @returns Un Observable con los datos de la venta.
   */
  getSaleById(id: string): Observable<Sale> {
    return this.http.get<ApiResponse<Sale>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data),
      catchError(this.handleError<Sale>(`getSaleById id=${id}`))
    );
  }

  /**
   * Solicita la exportación de todas las ventas a un archivo Excel.
   * @returns Un Observable que emite un HttpResponse con el contenido del archivo.
   */
  exportSalesToExcel(): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/export`, {
      observe: 'response', // Necesitamos observar la respuesta completa para obtener las cabeceras
      responseType: 'blob'
    });
  }

  /**
   * Maneja las operaciones HTTP que fallaron.
   * Permite que la aplicación continúe.
   * @param operation - nombre de la operación que falló
   * @param result - valor opcional para devolver como resultado observable
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error); // log a la consola

      // Para errores de validación del backend, podrías querer mostrar los mensajes
      if (error.status === 400 && error.error.message) {
        // Aquí podrías usar un servicio de notificaciones para mostrar el error al usuario
        console.error(`Error de negocio: ${error.error.message}`);
      }

      // Devuelve un resultado seguro para que la app no se rompa,
      // o relanza un error que el componente pueda manejar.
      if (result !== undefined) {
        return of(result as T);
      }

      return throwError(() => new Error(`Falló la operación: ${operation}. Intente de nuevo más tarde.`));
    };
  }
}


