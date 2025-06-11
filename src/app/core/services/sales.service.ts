import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importa HttpClient si planeas hacer llamadas HTTP
import { Observable, of } from 'rxjs'; // 'of' para devolver mock data como Observable

// Interfaces (puedes moverlas a archivos .model.ts dedicados si prefieres)
export interface Product {
  _id: string;
  nombre: string;
  // descripcion?: string;
  precio_unitario: number;
  // stock?: number;
  unidad: string; // 'kg', 'frasco', 'pieza', etc.
  // categoria?: string;
  // imagenUrl?: string;
}

export interface SaleProduct {
  producto_id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  precio_unitario: number;
  subtotal_producto: number;
}

export interface Sale {
  _id?: string; // Opcional si es generado por el backend
  fecha: string; // ISO Date string
  cliente: {
    tipo: string;
    usuario_id?: string;
    nombre: string;
    email?: string;
  };
  productos: SaleProduct[];
  totales: {
    // subtotal: number; // Calculado en backend o frontend
    impuestos?: number; // Opcional
    descuento?: number;
    total: number; // Calculado en backend o frontend
    moneda: string;
  };
  metodo_pago: string;
  estado?: string; // e.g., 'completada', 'pendiente', 'anulada'
  usuario_vendedor?: string;
  observaciones?: string;
  ubicacion_venta?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  // Mock de productos. Reemplaza esto con una llamada HTTP a tu API.
  private mockSales: Sale[] = [
    {
      _id: 'S001',
      fecha: new Date().toISOString(),
      cliente: {
        tipo: 'registrado',
        usuario_id: 'U001',
        nombre: 'Cliente Ejemplo Uno',
        email: 'cliente1@example.com'
      },
      productos: [
        { producto_id: 'P001', nombre: 'Miel Multifloral 500g', cantidad: 2, unidad: 'frasco', precio_unitario: 85.00, subtotal_producto: 170.00 },
        { producto_id: 'P003', nombre: 'Propóleo Extracto 30ml', cantidad: 1, unidad: 'frasco', precio_unitario: 120.00, subtotal_producto: 120.00 }
      ],
      totales: {
        descuento: 10.00,
        total: 280.00, // (170 + 120) - 10 = 280
        moneda: 'MXN'
      },
      metodo_pago: 'tarjeta',
      estado: 'completada',
      usuario_vendedor: 'Vendedor01',
      observaciones: 'Cliente frecuente, aplicar descuento la próxima vez.',
      ubicacion_venta: 'Tienda Principal'
    }
  ];

  private mockProducts: Product[] = [
    { _id: 'P001', nombre: 'Miel Multifloral 500g', precio_unitario: 85.00, unidad: 'frasco' },
    { _id: 'P002', nombre: 'Miel de Azahar 1kg', precio_unitario: 150.00, unidad: 'frasco' },
    { _id: 'P003', nombre: 'Propóleo Extracto 30ml', precio_unitario: 120.00, unidad: 'frasco' },
    { _id: 'P004', nombre: 'Polen de Flores 250g', precio_unitario: 90.00, unidad: 'bolsa' },
    { _id: 'P005', nombre: 'Jalea Real Fresca 10g', precio_unitario: 250.00, unidad: 'frasco' },
    { _id: 'P006', nombre: 'Cera de Abeja Pura 100g', precio_unitario: 50.00, unidad: 'bloque' }
  ];

  // private apiUrl = 'tu_url_de_api/sales'; // Descomenta y ajusta cuando tengas un backend

  constructor(private http: HttpClient) { } // Inyecta HttpClient

  getProducts(): Observable<Product[]> {
    // Simula una llamada API devolviendo los datos mock como un Observable
    console.log('SalesService: Obteniendo productos (mock)...');
    return of(this.mockProducts);
    // Cuando tengas un backend:
    // return this.http.get<Product[]>(`tu_url_de_api/products`);
  }

  createSale(saleData: Sale): Observable<any> { // El 'any' puede ser una interfaz de respuesta del backend
    console.log('SalesService: Creando venta con datos:', saleData);
    // Simula una llamada API POST
    // Cuando tengas un backend:
    // return this.http.post<any>(this.apiUrl, saleData);
    
    // Por ahora, solo devolvemos un observable con los mismos datos (simulando éxito)
    return of({ success: true, message: 'Venta registrada (simulado)', data: saleData });
  }

  // Aquí podrías agregar más métodos: getSaleById, updateSale, deleteSale, etc.

  getSales(): Observable<Sale[]> {
    console.log('SalesService: Obteniendo todas las ventas (mock)...');
    return of(this.mockSales);
    // Cuando tengas un backend:
    // return this.http.get<Sale[]>(this.apiUrl);
  }

  getSaleById(id: string): Observable<Sale | undefined> {
    console.log(`SalesService: Obteniendo venta por ID (mock): ${id}`);
    const sale = this.mockSales.find(s => s._id === id);
    return of(sale);
    // Cuando tengas un backend:
    // return this.http.get<Sale>(`${this.apiUrl}/${id}`);
  }
}

