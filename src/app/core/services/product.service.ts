import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Presentation, Product } from '../models/product.model';

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
  // ...
  getTypes() {
    return APICULTURE_TYPES;
  }

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

  private products$ = new BehaviorSubject<Product[]>(this.mockProducts);

  constructor() { }

  getProducts(): Observable<Product[]> {
    return this.products$.asObservable();
  }

  deletePresentation(presentationId: string): void {
    const currentProducts = this.products$.getValue();
    
    const updatedProducts = currentProducts.map(product => {
      const filteredPresentations = product.presentaciones.filter(p => p.id !== presentationId);
      return { ...product, presentaciones: filteredPresentations };
    }).filter(product => product.presentaciones.length > 0);

    this.products$.next(updatedProducts);
    this.mockProducts = updatedProducts;
  }

  updatePresentation(updatedPresentation: Presentation): void {
    const currentProducts = this.products$.getValue();
    
    const updatedProducts = currentProducts.map(product => {
      const presentationIndex = product.presentaciones.findIndex(p => p.id === updatedPresentation.id);
      
      if (presentationIndex > -1) {
        const newPresentations = [...product.presentaciones];
        newPresentations[presentationIndex] = updatedPresentation;
        return { ...product, presentaciones: newPresentations };
      }
      
      return product;
    });

    this.products$.next(updatedProducts);
    this.mockProducts = updatedProducts;
  }

  addProduct(newProduct: Omit<Product, 'id' | 'fecha_creacion' | 'imagenes'> & { presentaciones: Omit<Presentation, 'id'>[] }): void {
    const currentProducts = this.products$.getValue();
    
    const productToAdd: Product = {
      ...newProduct,
      id: `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`,
      fecha_creacion: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
      imagenes: ['assets/images/placeholder.jpg'], // Placeholder para la imagen
      presentaciones: newProduct.presentaciones.map(p => ({
        ...p,
        id: `pres-${Date.now().toString(36)}-${Math.random().toString(36).substring(2)}`
      }))
    };

    const updatedProducts = [...currentProducts, productToAdd];
    this.products$.next(updatedProducts);
    this.mockProducts = updatedProducts;
  }

  getCategories() {
    return APICULTURE_CATEGORIES;
  }
}
