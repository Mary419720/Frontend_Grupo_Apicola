import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-product-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="margin: 20px; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
      <h3>Depuración de Productos</h3>
      <button (click)="loadProducts()" style="background-color: #4CAF50; color: white; padding: 10px; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 10px;">
        Cargar Productos
      </button>
      
      <div *ngIf="loading">Cargando productos...</div>
      
      <div *ngIf="error" style="color: red; margin: 10px 0;">
        {{ error }}
      </div>
      
      <div *ngIf="products && products.length > 0">
        <p>Se encontraron {{ products.length }} productos:</p>
        <div *ngFor="let product of products" style="margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
          <h4>{{ product.nombre }}</h4>
          <p><strong>Código:</strong> {{ product.codigo }}</p>
          <p><strong>Tipo:</strong> {{ product.tipo }}</p>
          <p><strong>Descripción:</strong> {{ product.descripcion }}</p>
          <p><strong>Precio:</strong> {{ product.precio }}</p>
          <p><strong>Stock:</strong> {{ product.stock }}</p>
          <div *ngIf="product.atributos && product.atributos.presentaciones">
            <h5>Presentaciones:</h5>
            <div *ngFor="let pres of product.atributos.presentaciones" style="margin-left: 15px; border-left: 3px solid #4CAF50; padding-left: 10px;">
              <p><strong>SKU:</strong> {{ pres.sku }}</p>
              <p><strong>Formato:</strong> {{ pres.formato }}</p>
              <p><strong>Precio:</strong> {{ pres.precio_venta }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="products && products.length === 0">
        <p>No se encontraron productos en la base de datos.</p>
      </div>
      
      <div *ngIf="rawResponse" style="margin-top: 20px;">
        <h4>Respuesta del servidor:</h4>
        <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; max-height: 300px;">{{ rawResponse | json }}</pre>
      </div>
    </div>
  `
})
export class ProductDebugComponent implements OnInit {
  products: any[] = [];
  loading = false;
  error: string | null = null;
  rawResponse: any = null;
  // Añadimos como alias las propiedades que están siendo usadas incorrectamente para evitar errores
  get isLoading() { return this.loading; }
  set isLoading(value: boolean) { this.loading = value; }
  
  get hasError() { return this.error !== null; }
  set hasError(value: boolean) { if (!value) this.error = null; }
  
  get errorMessage() { return this.error; }
  set errorMessage(value: string | null) { this.error = value; }

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Cargar productos automáticamente al iniciar
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    
    // Obtener token para autorización - intentar diferentes posibles ubicaciones
    const token = localStorage.getItem('token') || 
                 sessionStorage.getItem('token') || 
                 sessionStorage.getItem('auth_token') || 
                 localStorage.getItem('auth_token');
    
    console.log('Tokens disponibles:', {
      localStorageToken: localStorage.getItem('token'),
      sessionStorageToken: sessionStorage.getItem('token'),
      localStorageAuthToken: localStorage.getItem('auth_token'),
      sessionStorageAuthToken: sessionStorage.getItem('auth_token')
    });
    
    // Configurar cabeceras, con o sin token
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      console.log('Usando token para autenticación:', token);
    } else {
      console.warn('No se encontró token de autenticación, intentando sin autenticación');
    }
    
    // Hacer petición al backend sin procesar los datos
    this.http.get('http://localhost:3001/api/products', { headers })
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.rawResponse = response;
          
          if (response && response.success && Array.isArray(response.data)) {
            this.products = response.data;
            console.log('Productos cargados:', this.products);
            
            // Extraer campos importantes para depuración
            if (this.products.length > 0) {
              const firstProduct = this.products[0];
              console.log('ESTRUCTURA DE PRODUCTO:', Object.keys(firstProduct));
              console.log('CAMPOS DEL PRIMER PRODUCTO:');
              for (const [key, value] of Object.entries(firstProduct)) {
                console.log(`- ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
              }
              
              // Extraer datos importantes para adaptación
              if (firstProduct.categoria_id) console.log('CATEGORIA_ID:', firstProduct.categoria_id);
              if (firstProduct.subcategoria_id) console.log('SUBCATEGORIA_ID:', firstProduct.subcategoria_id);
              if (firstProduct.atributos) console.log('ATRIBUTOS:', firstProduct.atributos);
            }
          } else {
            this.error = 'Formato de respuesta inválido';
            console.error('Respuesta inválida:', response);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          this.hasError = true;
          this.errorMessage = `Error al cargar productos: ${err.message || 'Error desconocido'}`;
          this.loading = false;
          this.error = `Error al cargar productos: ${err.message || 'Error desconocido'}`;
          console.error('Error al cargar productos:', err);
        }
      });
  }
}
