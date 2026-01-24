import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-product-debug',
  standalone: true,
  imports: [CommonModule,  LucideAngularModule],
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
export class ProductDebugComponent implements OnInit, OnDestroy {
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

  private apiUrl = environment.apiUrl + '/products';
  private subscription: Subscription | null = null;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Cargar productos automáticamente al iniciar
    this.loadProducts();
  }
  
  ngOnDestroy(): void {
    // Limpieza de suscripciones para evitar memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;
    
    // Obtener token del servicio de autenticación
    const token = this.authService.getToken();
    
    if (environment.debugMode) {
      console.log('Token de autenticación disponible:', !!token);
    }
    
    // Configurar cabeceras, con o sin token
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      if (environment.debugMode) {
        console.log('Usando token para autenticación');
      }
    } else if (environment.debugMode) {
      console.warn('No se encontró token de autenticación, intentando sin autenticación');
    }
    
    // Hacer petición al backend sin procesar los datos
    this.subscription = this.http.get(this.apiUrl, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.loading = false;
          
          let errorMessage = 'Error al cargar los productos';
          if (error.error instanceof ErrorEvent) {
            // Error del lado del cliente
            errorMessage = `Error: ${error.error.message}`;
          } else {
            // Error del lado del servidor
            errorMessage = `Error ${error.status}: ${error.error?.message || 'No se pudo conectar con el servidor'}`;
          }
          
          this.error = errorMessage;
          this.notificationService.error(errorMessage);
          
          if (environment.debugMode) {
            console.error('Error al cargar productos:', error);
          }
          
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.rawResponse = response;
          
          if (response && response.success && Array.isArray(response.data)) {
            this.products = response.data;
            this.notificationService.success(`${this.products.length} productos cargados en modo depuración`);
            
            // Extraer campos importantes para depuración (solo en modo debug)
            if (environment.debugMode && this.products.length > 0) {
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
            this.notificationService.warning('Formato de respuesta inválido');
            if (environment.debugMode) {
              console.error('Respuesta inválida:', response);
            }
          }
        },
        error: () => {
          // Los errores ya se manejan en el operador catchError
        }
      });
  }
}
