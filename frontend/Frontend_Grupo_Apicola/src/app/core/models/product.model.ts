// Representa una variante o presentación específica de un producto.
export interface Presentation {
  id?: string;          // ID temporal para la gestión en el frontend (ej. en FormArrays).
  _id?: string;         // ID de MongoDB, presente si la presentación ya existe en la BD.
  sku: string;
  formato: string;
  capacidad: string;
  precio_venta: number;
  precio_compra?: number;
  stock: number;
  stock_minimo?: number;
  lote?: string;
  fecha_ingreso?: string;
  fecha_vencimiento?: string;
  proveedor?: string;
  ubicacion?: string;
  observaciones?: string;
  activo?: boolean;
}

// Representa la estructura principal de un producto, alineada con el backend.
export interface Product {
  id: string;           // ID principal usado en el frontend (generalmente mapeado desde _id).
  _id?: string;         // ID de MongoDB.
  codigo: string;
  nombre: string;
  tipo: string;
  categoria_id: string; // Referencia al _id de la categoría.
  subcategoria_id?: string;// Referencia al _id de la subcategoría.
  estado_fisico?: string;
  descripcion: string;

  activo?: boolean;
  imagenes: string[];
  presentaciones: Presentation[];

  // Atributos denormalizados para facilitar la visualización sin joins.
  atributos?: {
    categoria_original?: string;
    subcategoria_original?: string;
    Categoria?: string; 
  };

  fecha_creacion?: string;
  fecha_actualizacion?: string;
}
