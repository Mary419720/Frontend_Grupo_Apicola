import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { Product, Presentation } from '../../../core/models/product.model';
import { ProductService, ApiListResponse, ApiResponse } from '../../../core/services/product.service';
import { EditProductComponent } from '../edit-product/edit-product.component';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProductDebugComponent } from './product-debug.component';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, EditProductComponent, RouterModule, LucideAngularModule, ProductDebugComponent],
  templateUrl: './manage-products.component.html',
  styleUrls: ['./manage-products.component.css']
})
export class ManageProductsComponent implements OnInit {
  products$!: Observable<Product[]>;
  productsResponse$!: Observable<ApiListResponse<Product>>;
  public allProducts: Product[] = [];

  searchTerm$ = new BehaviorSubject<string>('');
  categoryFilter$ = new BehaviorSubject<string>('all');
  providerFilter$ = new BehaviorSubject<string>('all');

  categories: string[] = [];
  providers: string[] = [];

  isModalVisible = false;
  selectedPresentation: Presentation | null = null;

  constructor(private productService: ProductService, private http: HttpClient) {}

  ngOnInit(): void {
    console.log('Inicializando componente ManageProductsComponent');
    // Cargar productos inmediatamente al iniciar el componente
    this.reloadProducts();
    // Configurar el stream filtrado
    this.initializeFilteredProductsStream();
  }

  private initializeFilteredProductsStream(): void {
    console.log('Inicializando stream de productos filtrados');
    // Obtener productos del servicio
    this.productsResponse$ = this.productService.getProducts();
    
    // Inicializar la carga de productos con manejo de errores
    this.productsResponse$.subscribe({
      next: (response) => {
        console.log('Productos cargados:', response);
        if (!response.success) {
          console.error('Error al cargar productos:', response.message);
        } else {
          console.log(`Se cargaron ${response.data.length} productos exitosamente`);
          // Forzar actualización del BehaviorSubject si es necesario
          if (response.data.length > 0 && this.productService.getProductsValue().length === 0) {
            this.productService.setProducts(response.data);
          }
        }
      },
      error: (error) => {
        console.error('Error en la suscripción a productos:', error);
      }
    });

    // Simplificar la lógica de filtrado para asegurar que los productos se muestren correctamente
    this.products$ = combineLatest([
      this.productService.getProductsAsObservable(),
      this.searchTerm$.pipe(debounceTime(300), startWith('')),
      this.categoryFilter$.pipe(startWith('all')),
      this.providerFilter$.pipe(startWith('all'))
    ]).pipe(
      map(([products, searchTerm, category, provider]) => {
        console.log('Productos recibidos para filtrar:', products);
        console.log('Cantidad de productos recibidos:', products.length);
        
        // Guardar todos los productos y actualizar opciones de filtro sin importar si hay filtros
        if (products && products.length > 0) {
          this.allProducts = [...products];
          this.populateFilterOptions(products);
          console.log('Opciones de categoría actualizadas:', this.categories);
          console.log('Opciones de proveedor actualizadas:', this.providers);
        } else {
          console.log('No hay productos disponibles para filtrar');
          return [];
        }
        
        // Debug: analizar estructura del primer producto
        if (products.length > 0) {
          const firstProduct = products[0];
          console.log('ESTRUCTURA DE PRIMER PRODUCTO EN FILTRO:', firstProduct);
          console.log('Tiene presentaciones?', firstProduct.presentaciones?.length || 'NO');
        }
        
        // FORZAR DEVOLVER TODOS LOS PRODUCTOS PARA DEPURACIÓN
        return products; // ACTIVADO: mostrar todos los productos sin filtro para depurar
        
        // Crear una copia para el filtrado
        let filteredProducts = [...products];
        
        // ---- FILTRADO SIMPLIFICADO PARA DEPURACIÓN ----
        // Para depuración, vamos a evitar filtrar inicialmente
        // Solo aplicar filtros si el usuario ha seleccionado algo específico
        
        // Filtrar por categoría solo si se ha seleccionado una categoría específica
        if (category !== 'all') {
          console.log(`Aplicando filtro de categoría: ${category}`);
          filteredProducts = filteredProducts.filter(p => p.categoria === category);
        }
        
        // Filtrar por término de búsqueda solo si hay un término
        if (searchTerm && searchTerm.trim().length > 0) {
          const term = searchTerm.toLowerCase().trim();
          console.log(`Aplicando filtro de búsqueda: ${term}`);
          filteredProducts = filteredProducts.filter(p => 
            p.nombre.toLowerCase().includes(term) || 
            p.codigo.toLowerCase().includes(term)
          );
        }
        
        // Filtrar por proveedor solo si se ha seleccionado un proveedor específico
        if (provider !== 'all') {
          console.log(`Aplicando filtro de proveedor: ${provider}`);
          // Simplemente verificar si alguna presentación tiene ese proveedor
          filteredProducts = filteredProducts.filter(p => 
            p.presentaciones.some(pres => pres.proveedor === provider)
          );
        }
        
        console.log('RESULTADOS DE FILTRADO:');
        console.log(`- Productos iniciales: ${products.length}`);
        console.log(`- Productos filtrados: ${filteredProducts.length}`);
        filteredProducts.forEach(p => console.log(`  > ${p.nombre} (${p.codigo})`));
        
        return filteredProducts;
      })
    );
  }

  // Método para recargar productos manualmente
  reloadProducts(): void {
    console.log('Recargando productos...');
    
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
    
    const apiUrl = 'http://localhost:3001/api/products';
    
    // Obtener productos directamente del backend
    this.http.get<{success: boolean, data: any[], message: string}>(apiUrl, { headers }).subscribe({
      next: (response) => {
        console.log('Respuesta directa del backend:', response);
        
        if (response && response.success && Array.isArray(response.data)) {
          // Procesar productos manualmente
          const processedProducts = response.data.map((item: any) => {
            console.log('Procesando producto raw:', item);
            
            // Crear presentaciones por defecto si no existen
            let presentaciones = [];
            if (item.atributos && item.atributos.presentaciones) {
              presentaciones = item.atributos.presentaciones;
            } else {
              presentaciones = [{
                id: `pres-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                sku: item.codigo || 'SKU-DEFAULT',
                formato: 'Formato estándar',
                capacidad: 'N/A',
                precio_venta: item.precio || 0,
                precio_compra: item.precio * 0.7 || 0,
                stock: item.stock || 0,
                stock_minimo: 10,
                lote: 'LOTE-DEFAULT',
                fecha_ingreso: 'N/A',
                fecha_vencimiento: 'N/A',
                proveedor: 'Proveedor por defecto',
                ubicacion: 'Ubicación por defecto',
                observaciones: ''
              }];
            }
            
            // Crear producto adaptado
            return {
              id: item._id,
              codigo: item.codigo || '',
              nombre: item.nombre || '',
              descripcion: item.descripcion || '',
              tipo: item.tipo || '',
              categoria: item.atributos?.categoria_original || 'Sin categoría',
              subcategoria: item.atributos?.subcategoria_original || 'Sin subcategoría',
              estado: item.activo ? 'Activo' : 'Inactivo',
              fecha_creacion: item.fecha_creacion || new Date().toISOString(),
              presentaciones: presentaciones,
              imagenes: item.imagenes && item.imagenes.length > 0 ? 
                item.imagenes : ['assets/images/placeholder.jpg']
            } as Product;
          });
          
          console.log('Productos procesados manualmente:', processedProducts);
          
          // Actualizar productos en el servicio
          this.productService.setProducts(processedProducts);
          
          // Actualizar productos locales
          this.allProducts = processedProducts;
          
          // Actualizar filtros
          this.populateFilterOptions(processedProducts);
          
          // Resetear filtros
          this.searchTerm$.next('');
          this.categoryFilter$.next('all');
          this.providerFilter$.next('all');
        } else {
          console.error('Respuesta inválida del backend:', response);
        }
      },
      error: (error: any) => {
        console.error('Error al recargar productos directamente:', error);
      }
    });
  }

  private populateFilterOptions(products: Product[]): void {
    const allCategories = products.map(p => p.categoria);
    this.categories = [...new Set(allCategories)];
    const allProviders = products.flatMap(p => p.presentaciones.map(pr => pr.proveedor));
    this.providers = [...new Set(allProviders)];
  }

  onSearchTermChange(term: string): void {
    this.searchTerm$.next(term);
  }

  onCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.categoryFilter$.next(selectElement.value);
  }

  onProviderChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.providerFilter$.next(selectElement.value);
  }

  editProduct(id: string): void {
    for (const product of this.allProducts) {
      const presentation = product.presentaciones.find(p => p.id === id);
      if (presentation) {
        this.selectedPresentation = presentation;
        this.isModalVisible = true;
        break;
      }
    }
  }

  deleteProduct(id: string): void {
    const confirmation = confirm('¿Estás seguro de que quieres eliminar esta presentación?');
    if (confirmation) {
      this.productService.deletePresentation(id).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Presentación eliminada con éxito');
            // Actualizar la lista de productos después de eliminar
            this.productService.getProducts().subscribe();
          } else {
            console.error('Error al eliminar presentación:', response.message);
            alert('Error al eliminar la presentación: ' + response.message);
          }
        },
        error: (error) => {
          console.error('Error al eliminar presentación:', error);
          alert('Error al eliminar la presentación. Por favor, intente nuevamente.');
        }
      });
    }
  }

  handleSave(presentation: Presentation): void {
    this.productService.updatePresentation(presentation).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Presentación actualizada con éxito');
          this.handleClose();
          // Actualizar la lista de productos después de actualizar
          this.productService.getProducts().subscribe();
        } else {
          console.error('Error al actualizar presentación:', response.message);
          alert('Error al actualizar la presentación: ' + response.message);
        }
      },
      error: (error) => {
        console.error('Error al actualizar presentación:', error);
        alert('Error al actualizar la presentación. Por favor, intente nuevamente.');
      }
    });
  }

  handleClose(): void {
    this.isModalVisible = false;
    this.selectedPresentation = null;
  }
}
