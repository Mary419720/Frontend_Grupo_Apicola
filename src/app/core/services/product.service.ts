import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth/auth.service'; // Importar AuthService
import { Observable, BehaviorSubject, of, tap, catchError, map } from 'rxjs';
import { Presentation, Product } from '../models/product.model';
import { environment } from '../../../environments/environment';

// Interfaces para respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

// Constante con categorías y subcategorías apícolas

export const APICULTURE_TYPES: string[] = [
    "Madera",
    "Plástico",
    "Vidrio",
    "Metal",
    "Orgánico",
    "Cera",
    "Polen",
    "Miel",
    "Jalea Real",
    "Propóleo",
    "Pan de Abeja",
    "Veneno de Abeja",
    "Líquido",
    "Sólido",
    "Semisólido",
    "Polvo",
    "Herramienta",
    "Envase",
    "Insumo",
    "Producto Terminado",
    "Materia Prima",
    "Perecedero",
    "No Perecedero",
    "Tecnología",
    "Equipo de Protección",
    "Alimento para Abejas",
    "Medicamento",
    "Cosmético",
    "Suplemento Alimenticio",
    "Bebida",
    "Extractor",
    "Mantenimiento",
    "Servicio",
    "Otro"
];


export const APICULTURE_CATEGORIES: { categoria: string; subcategorias: string[] }[] = [
  {
    categoria: "Productos Apícolas",
    subcategorias: [
      "Miel",
      "Polen",
      "Propóleo",
      "Jalea Real",
      "Cera de Abeja",
      "Pan de Abeja",
      "Veneno de Abeja"
    ]
  },
  {
    categoria: "Productos Derivados",
    subcategorias: [
      "Caramelos de miel",
      "Galletas y snacks con miel o polen",
      "Cosméticos naturales (cremas, bálsamos, ungüentos)",
      "Suplementos alimenticios",
      "Bebidas energéticas o medicinales",
      "Jarabes naturales",
      "Velas artesanales",
      "Medicinas naturales"
    ]
  },
  {
    categoria: "Insumos Apícolas",
    subcategorias: [
      "Cajas Langstroth",
      "Cajas Nacionales",
      "Cuadros y marcos",
      "Cera estampada",
      "Alzas y fondos sanitarios",
      "Separadores y excluidores de reina",
      "Trampas de polen",
      "Rejillas",
      "Alimentadores"
    ]
  },
  {
    categoria: "Herramientas Apícolas",
    subcategorias: [
      "Ahumadores",
      "Pinzas y palancas",
      "Cepillos para abejas",
      "Guantes",
      "Trajes y velos protectores",
      "Herramientas para revisión",
      "Cuchillos desoperculadores",
      "Ganchos para cuadros",
      "Trampas atrapa enjambres"
    ]
  },
  {
    categoria: "Procesamiento y Envasado",
    subcategorias: [
      "Extractores de miel",
      "Filtros de miel",
      "Decantadores",
      "Tanques de maduración",
      "Envasadoras",
      "Etiquetadoras",
      "Pasteurizadores",
      "Sistemas de limpieza de equipos",
      "Secadores de polen"
    ]
  },
  {
    categoria: "Envases y Embalaje",
    subcategorias: [
      "Frascos de vidrio",
      "Frascos plásticos",
      "Bolsas al vacío",
      "Etiquetas",
      "Tapas con precinto",
      "Cajas para transporte",
      "Tubos para jalea",
      "Contenedores a granel"
    ]
  },
  {
    categoria: "Control Sanitario y Alimentación",
    subcategorias: [
      "Alimentos proteicos",
      "Jarabes energéticos",
      "Vitaminas para abejas",
      "Medicamentos autorizados",
      "Tratamientos contra varroa",
      "Tratamientos contra loque",
      "Fumigantes orgánicos"
    ]
  },
  {
    categoria: "Tecnología y Monitoreo",
    subcategorias: [
      "Básculas electrónicas para colmenas",
      "Sensores de temperatura y humedad",
      "Aplicaciones móviles de apicultura",
      "Rastreo por GPS",
      "Sistemas RFID para colmenas",
      "Software de gestión apícola"
    ]
  },
  {
    categoria: "Educación y Servicios",
    subcategorias: [
      "Capacitaciones presenciales",
      "Cursos en línea",
      "Asesoría técnica",
      "Consultoría apícola",
      "Servicios de polinización",
      "Instalación de apiarios",
      "Diseño de etiquetas"
    ]
  },
  {
    categoria: "Infraestructura Apícola",
    subcategorias: [
      "Apiarios (espacios físicos)",
      "Cámaras frías",
      "Centros de acopio",
      "Talleres de cera",
      "Laboratorios",
      "Centros de extracción",
      "Vehículos apícolas"
    ]
  },
  {
    categoria: "Otros",
    subcategorias: [
      "Souvenirs",
      "Material promocional",
      "Publicidad con temática apícola",
      "Obsequios corporativos",
      "Decoración artesanal con cera"
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;
  private products$ = new BehaviorSubject<Product[]>([]);
  
  // Mantener los datos de prueba como respaldo
  private mockProducts: Product[] = [
    {
      id: 'prod-001',
      codigo: 'MIEL-PUR-500',
      nombre: 'Miel Pura de Abeja',
      descripcion: 'Miel de abeja 100% natural, cosechada en los altos de Jalisco.',
      tipo: 'Miel',
      categoria: 'Alimentos',
      subcategoria: 'Endulzantes',
      estado: 'Activo',
      fecha_creacion: '2023-01-15',
      presentaciones: [
        {
          id: 'pres-001',
          sku: 'MIEL-PUR-500-FR',
          formato: 'Frasco de vidrio',
          capacidad: '500g',
          precio_venta: 120.50,
          precio_compra: 60.00,
          stock: 150,
          stock_minimo: 20,
          lote: 'LOTE20230110',
          fecha_ingreso: '2023-01-10',
          fecha_vencimiento: '2025-01-10',
          proveedor: 'Apícola de los Altos',
          ubicacion: 'Almacén A, Estante 3',
          observaciones: 'Cosecha de primavera.'
        },
        {
          id: 'pres-002',
          sku: 'MIEL-PUR-1000-FR',
          formato: 'Frasco de vidrio',
          capacidad: '1kg',
          precio_venta: 210.00,
          precio_compra: 100.00,
          stock: 80,
          stock_minimo: 15,
          lote: 'LOTE20230112',
          fecha_ingreso: '2023-01-12',
          fecha_vencimiento: '2025-01-12',
          proveedor: 'Apícola de los Altos',
          ubicacion: 'Almacén A, Estante 3',
          observaciones: 'Cosecha de primavera.'
        }
      ],
      imagenes: ['assets/images/miel_pura_1.jpg', 'assets/images/miel_pura_2.jpg']
    },
    {
      id: 'prod-002',
      codigo: 'JAB-MIEL-AVN',
      nombre: 'Jabón Artesanal de Miel y Avena',
      descripcion: 'Jabón suave y nutritivo, ideal para pieles sensibles.',
      tipo: 'Cuidado Personal',
      categoria: 'Cosméticos',
      subcategoria: 'Jabones',
      estado: 'Activo',
      fecha_creacion: '2023-02-20',
      presentaciones: [
        {
          id: 'pres-003',
          sku: 'JAB-MIEL-AVN-100',
          formato: 'Barra',
          capacidad: '100g',
          precio_venta: 45.00,
          precio_compra: 20.00,
          stock: 200,
          stock_minimo: 30,
          lote: 'LOTE20230215',
          fecha_ingreso: '2023-02-15',
          fecha_vencimiento: '2024-08-15',
          proveedor: 'Cosmética Natural Bee',
          ubicacion: 'Almacén B, Estante 1',
          observaciones: 'Hecho a mano.'
        }
      ],
      imagenes: ['assets/images/jabon_miel_1.jpg']
    },
    {
        id: 'prod-003',
        codigo: 'VEL-CER-ABE',
        nombre: 'Vela de Cera de Abeja',
        descripcion: 'Vela aromática de cera de abeja pura, larga duración.',
        tipo: 'Hogar',
        categoria: 'Velas',
        subcategoria: 'Aromáticas',
        estado: 'Activo',
        fecha_creacion: '2023-03-05',
        presentaciones: [
          {
            id: 'pres-004',
            sku: 'VEL-CER-ABE-MED',
            formato: 'Vaso de vidrio',
            capacidad: 'Mediana',
            precio_venta: 150.00,
            precio_compra: 75.00,
            stock: 120,
            stock_minimo: 25,
            lote: 'LOTE20230301',
            fecha_ingreso: '2023-03-01',
            fecha_vencimiento: 'N/A',
            proveedor: 'El Panal Decorativo',
            ubicacion: 'Almacén C, Estante 2',
            observaciones: 'Aroma a miel y flores.'
          }
        ],
        imagenes: ['assets/images/vela_cera_1.jpg']
      }
  ];

  constructor(private http: HttpClient, private authService: AuthService) { // Inyectar AuthService
    // Cargar productos al inicializar el servicio
    this.loadProducts();
  }
  
  // Método privado para cargar productos desde el backend
  private loadProducts(): void {
    this.http.get<ApiListResponse<Product>>(`${this.apiUrl}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.products$.next(response.data);
          } else {
            console.error('Error al cargar productos:', response.message);
            // Si hay un error, usar los datos de prueba como fallback
            this.products$.next(this.mockProducts);
          }
        }),
        catchError(error => {
          console.error('Error al cargar productos:', error);
          // Si hay un error, usar los datos de prueba como fallback
          this.products$.next(this.mockProducts);
          return of({ success: false, data: this.mockProducts, message: 'Error de conexión, usando datos locales' });
        })
    ); // Closing parenthesis for pipe()
  } // Closing brace for the method preceding getProducts

  getProducts(): Observable<ApiListResponse<Product>> {
    console.log('Obteniendo productos desde:', `${this.apiUrl}`);

    let token = this.authService.getToken() || 
                localStorage.getItem('token') || 
                sessionStorage.getItem('token') || 
                localStorage.getItem('auth_token') || 
                sessionStorage.getItem('auth_token');

    console.log('Token disponible para getProducts:', token ? 'Sí' : 'No');

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<any>(`${this.apiUrl}`, { headers })
      .pipe(
        tap((response: any) => console.log('Respuesta cruda del backend:', response)),
        map((response: any): ApiListResponse<Product> => {
          if (response && response.success && Array.isArray(response.data)) {
            const adaptedProducts: Product[] = response.data.map((backendProduct: any): Product => {
              console.log('Procesando producto (raw del backend):', JSON.parse(JSON.stringify(backendProduct)));
              
              let frontendPresentations: Presentation[] = [];

              if (backendProduct.atributos && Array.isArray(backendProduct.atributos.presentaciones) && backendProduct.atributos.presentaciones.length > 0) {
                console.log('Usando presentaciones de backendProduct.atributos.presentaciones');
                frontendPresentations = backendProduct.atributos.presentaciones.map((pres: any): Presentation => ({
                  id: pres.id || `pres-attr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`,
                  sku: pres.sku || backendProduct.codigo || 'SKU-ATTR-DEFAULT',
                  formato: pres.formato || 'N/A',
                  capacidad: pres.capacidad || 'N/A',
                  precio_venta: pres.precio_venta !== undefined ? pres.precio_venta : (backendProduct.precio_venta !== undefined ? backendProduct.precio_venta : (backendProduct.precio !== undefined ? backendProduct.precio : 0)),
                  precio_compra: pres.precio_compra !== undefined ? pres.precio_compra : (backendProduct.precio_compra !== undefined ? backendProduct.precio_compra : 0),
                  stock: pres.stock !== undefined ? pres.stock : (backendProduct.stock !== undefined ? backendProduct.stock : 0),
                  stock_minimo: pres.stock_minimo || 10,
                  lote: pres.lote || 'LOTE-ATTR-DEFAULT',
                  fecha_ingreso: pres.fecha_ingreso || backendProduct.fecha_creacion || new Date().toISOString(),
                  fecha_vencimiento: pres.fecha_vencimiento || 'N/A',
                  proveedor: pres.proveedor || 'Proveedor Atributos',
                  ubicacion: pres.ubicacion || 'Ubicación Atributos',
                  observaciones: pres.observaciones || ''
                }));
              } else {
                console.log('Creando presentación por defecto desde campos raíz del producto');
                frontendPresentations = [{
                  id: `pres-def-${backendProduct._id || Date.now().toString(36)}`,
                  sku: backendProduct.codigo || backendProduct.sku || 'SKU-ROOT-DEFAULT',
                  formato: backendProduct.formato || 'Formato estándar',
                  capacidad: backendProduct.capacidad || backendProduct.estado_fisico || 'N/A',
                  precio_venta: backendProduct.precio_venta !== undefined ? backendProduct.precio_venta : (backendProduct.precio !== undefined ? backendProduct.precio : 0),
                  precio_compra: backendProduct.precio_compra !== undefined ? backendProduct.precio_compra : 0,
                  stock: backendProduct.stock !== undefined ? backendProduct.stock : 0,
                  stock_minimo: backendProduct.stock_minimo || 10,
                  lote: backendProduct.lote || 'LOTE-ROOT-DEFAULT',
                  fecha_ingreso: backendProduct.fecha_ingreso || backendProduct.fecha_creacion || new Date().toISOString(),
                  fecha_vencimiento: backendProduct.fecha_vencimiento || 'N/A',
                  proveedor: backendProduct.proveedor || 'Proveedor Raíz',
                  ubicacion: backendProduct.ubicacion || 'Ubicación Raíz',
                  observaciones: backendProduct.observaciones || ''
                }];
              }

              if (frontendPresentations.length === 0) {
                console.warn('Ninguna presentación encontrada o creada para el producto, añadiendo una de emergencia.');
                frontendPresentations.push({
                  id: `pres-emerg-${backendProduct._id || Date.now().toString(36)}`,
                  sku: 'SKU-EMERGENCY',
                  formato: 'Emergencia',
                  capacidad: 'N/A',
                  precio_venta: 0,
                  precio_compra: 0,
                  stock: 0,
                  stock_minimo: 0,
                  lote: 'LOTE-EMERGENCY',
                  fecha_ingreso: new Date().toISOString(),
                  fecha_vencimiento: 'N/A',
                  proveedor: 'N/A',
                  ubicacion: 'N/A',
                  observaciones: 'Presentación de emergencia creada.'
                });
              }

              const categoriaAdaptada = backendProduct.atributos?.categoria_original || backendProduct.categoria_id?.nombre || (typeof backendProduct.categoria_id === 'string' ? backendProduct.categoria_id : 'Sin Categoría');
              const subcategoriaAdaptada = backendProduct.atributos?.subcategoria_original || backendProduct.subcategoria_id?.nombre || (typeof backendProduct.subcategoria_id === 'string' ? backendProduct.subcategoria_id : 'Sin Subcategoría');

              const adaptedProduct: Product = {
                id: backendProduct._id || `temp-id-${Date.now()}`,
                codigo: backendProduct.codigo || backendProduct.sku || 'COD-DEFAULT',
                nombre: backendProduct.nombre || 'Nombre no disponible',
                descripcion: backendProduct.descripcion || '',
                tipo: backendProduct.tipo || 'Tipo no disponible',
                categoria: categoriaAdaptada,
                subcategoria: subcategoriaAdaptada,
                estado: backendProduct.activo ? 'Activo' : 'Inactivo',
                fecha_creacion: backendProduct.fecha_creacion || new Date().toISOString(),
                presentaciones: frontendPresentations,
                imagenes: (backendProduct.imagenes && Array.isArray(backendProduct.imagenes) && backendProduct.imagenes.length > 0)
                            ? backendProduct.imagenes
                            : ['assets/images/placeholder.jpg']
              };
              console.log('Producto completamente adaptado:', JSON.parse(JSON.stringify(adaptedProduct)));
              return adaptedProduct;
            });

            const validAdaptedProducts = adaptedProducts.filter(p => p.id !== 'error-id');
            this.products$.next(validAdaptedProducts);
            console.log(`Productos adaptados y actualizados en BehaviorSubject: ${validAdaptedProducts.length}`);

            return {
              success: true,
              total: adaptedProducts.length, // Standardized to total
              data: adaptedProducts,
              message: response.message || 'Productos obtenidos y adaptados correctamente'
            };
          } else {
            console.error('Respuesta del backend no exitosa o datos no son un array:', response);
            this.products$.next([]);
            return {
              success: false,
              total: 0, // Standardized to total
              data: [],
              message: response?.message || 'Respuesta inválida del servidor o sin datos.'
            };
          }
        }),
        catchError((error: HttpErrorResponse): Observable<ApiListResponse<Product>> => {
          console.error('Error en la solicitud HTTP para obtener productos:', error);
          this.products$.next([]); 
          let errorMessage = 'Error al conectar con el servidor para obtener productos.';
          if (error.error instanceof ErrorEvent) {
            errorMessage = `Error del cliente: ${error.error.message}`;
          } else {
            errorMessage = `Error del servidor (Código: ${error.status}): ${error.message}`;
            if (error.status === 401 || error.status === 403) {
              errorMessage = 'Error de autenticación o autorización. Por favor, verifique sus credenciales o inicie sesión nuevamente.';
            }
          }
          return of({
            success: false,
            total: 0, // Standardized to total
            data: [],
            message: errorMessage
          });
        })
      );
  }
  
  getProductsAsObservable(): Observable<Product[]> {
    return this.products$.asObservable();
  }
  
  // Obtener el valor actual del BehaviorSubject
  getProductsValue(): Product[] {
    return this.products$.getValue();
  }
  
  // Establecer nuevos productos en el BehaviorSubject
  setProducts(products: Product[]): void {
    console.log('Actualizando productos en el servicio:', products.length);
    this.products$.next(products);
  }
  
  getProductById(id: string): Observable<ApiResponse<Product>> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        tap(response => {
          if (!response.success) {
            throw new Error('Producto no encontrado');
          }
        }),
        catchError(error => {
          console.error('Error al obtener producto:', error);
          return of({ success: false, data: null as unknown as Product, message: 'Error al obtener producto' });
        })
      );
  }

  deletePresentation(presentationId: string): Observable<any> {
    // Primero encontramos a qué producto pertenece esta presentación
    const currentProducts = this.products$.getValue();
    let productId: string | null = null;
    
    for (const product of currentProducts) {
      const presentationExists = product.presentaciones.some((p: Presentation) => p.id === presentationId);
      if (presentationExists) {
        productId = product.id;
        break;
      }
    }
    
    if (!productId) {
      console.error('No se encontró el producto para la presentación:', presentationId);
      return of({ success: false, message: 'Presentación no encontrada' });
    }
    
    // Obtenemos el producto actual
    return this.getProductById(productId).pipe(
      tap(productResponse => {
        const product = productResponse.data;
        if (!product) return;
        
        // Filtramos la presentación
        const updatedPresentations = product.presentaciones.filter((p: Presentation) => p.id !== presentationId);
        
        // Actualizamos el producto con las presentaciones filtradas
        return this.updateProduct(productId, { ...product, presentaciones: updatedPresentations });
      }),
      catchError(error => {
        console.error('Error al eliminar presentación:', error);
        return of({ success: false, message: 'Error al eliminar presentación' });
      })
    );
  }

  updatePresentation(updatedPresentation: Presentation): Observable<any> {
    // Primero encontramos a qué producto pertenece esta presentación
    const currentProducts = this.products$.getValue();
    let productToUpdate: Product | null = null;
    
    for (const product of currentProducts) {
      const presentationIndex = product.presentaciones.findIndex(p => p.id === updatedPresentation.id);
      if (presentationIndex > -1) {
        const newPresentations = [...product.presentaciones];
        newPresentations[presentationIndex] = updatedPresentation;
        productToUpdate = { ...product, presentaciones: newPresentations };
        break;
      }
    }
    
    if (!productToUpdate) {
      console.error('No se encontró el producto para la presentación:', updatedPresentation.id);
      return of({ success: false, message: 'Presentación no encontrada' });
    }
    
    // Actualizamos el producto con la presentación actualizada
    // No es necesario añadir cabeceras aquí porque updateProduct ya las maneja
    return this.updateProduct(productToUpdate.id, productToUpdate);
  }

  addProduct(newProduct: Omit<Product, 'id' | 'fecha_creacion' | 'imagenes'> & { presentaciones: Omit<Presentation, 'id'>[] }): Observable<ApiResponse<Product>> {
    // Adaptamos el producto para que coincida con el modelo del backend
    // Tomamos la primera presentación para obtener precio y stock
    const firstPresentation = newProduct.presentaciones[0] || {};
    
    // Crear objeto adaptado para el backend
    const adaptedProduct = {
      codigo: newProduct.codigo,
      nombre: newProduct.nombre,
      descripcion: newProduct.descripcion,
      tipo: newProduct.tipo,
      // Usar los IDs de categoría y subcategoría de MongoDB
      categoria_id: "65a6f9a8b74de32a64c13456", // ID de categoría en MongoDB
      subcategoria_id: "65a6f9a8b74de32a64c13457", // ID de subcategoría en MongoDB
      estado_fisico: newProduct.tipo === "Miel" ? "Líquido" : "Sólido", // Valor basado en el tipo
      precio: firstPresentation.precio_venta || 0,
      stock: firstPresentation.stock || 0,
      imagenes: ['assets/images/placeholder.jpg'],
      activo: true, // Asegurar que el producto esté activo
      // Guardamos la información completa en atributos para no perderla
      atributos: {
        categoria_original: newProduct.categoria,
        subcategoria_original: newProduct.subcategoria,
        presentaciones: newProduct.presentaciones.map(p => ({
          ...p,
          id: `pres-${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`,
          fecha_ingreso: p.fecha_ingreso || 'N/A',
          fecha_vencimiento: p.fecha_vencimiento || 'N/A'
        }))
      }
    };

    console.log('Producto adaptado para enviar al backend:', adaptedProduct);
    
    const token = this.authService.getToken();
    console.log('Token recuperado en ProductService.addProduct:', token);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Cabeceras enviadas en ProductService.addProduct:', headers);

    return this.http.post<ApiResponse<Product>>(`${this.apiUrl}`, adaptedProduct, { headers })
      .pipe(
        tap(response => {
          if (response.success) {
            // Actualizamos la lista local de productos
            const currentProducts = this.products$.getValue();
            this.products$.next([...currentProducts, response.data]);
          }
        }),
        catchError(error => {
          console.error('Error al crear producto:', error);
          return of({ success: false, data: null as unknown as Product, message: 'Error al crear producto' });
        })
      );
  }

  getCategories() {
    return APICULTURE_CATEGORIES;
  }
  
  getTypes() {
    return APICULTURE_TYPES;
  }
  
  // Método para actualizar un producto existente
  updateProduct(id: string, productData: Partial<Product>): Observable<ApiResponse<Product>> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, productData, { headers })
      .pipe(
        tap(response => {
          if (response.success) {
            // Actualizamos la lista local de productos
            const currentProducts = this.products$.getValue();
            const updatedProducts = currentProducts.map(p => 
              p.id === id ? response.data : p
            );
            this.products$.next(updatedProducts);
          }
        }),
        catchError(error => {
          console.error('Error al actualizar producto:', error);
          return of({ success: false, data: null as unknown as Product, message: 'Error al actualizar producto' });
        })
      );
  }
  
  // Método para eliminar un producto
  deleteProduct(id: string): Observable<{success: boolean, message: string}> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete<{success: boolean, message: string}>(`${this.apiUrl}/${id}`, { headers })
      .pipe(
        tap(response => {
          if (response.success) {
            // Eliminamos el producto de la lista local
            const currentProducts = this.products$.getValue();
            const updatedProducts = currentProducts.filter(p => p.id !== id);
            this.products$.next(updatedProducts);
          }
        }),
        catchError(error => {
          console.error('Error al eliminar producto:', error);
          return of({ success: false, message: 'Error al eliminar producto' });
        })
      );
  }
  
  // Método para buscar productos
  searchProducts(query: string): Observable<ApiListResponse<Product>> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<ApiListResponse<Product>>(`${this.apiUrl}/search?query=${query}`, { headers })
      .pipe(
        tap(response => {
          if (!response.success) {
            throw new Error('Error en la búsqueda');
          }
        }),
        catchError(error => {
          console.error('Error al buscar productos:', error);
          return of({ success: false, data: [], message: 'Error al buscar productos' });
        })
      );
  }
}
