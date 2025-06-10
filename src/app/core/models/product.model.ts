export interface Presentation {
  id: string;
  sku: string;
  formato: string;
  capacidad: string;
  precio_venta: number;
  precio_compra: number;
  stock: number;
  stock_minimo: number;
  lote: string;
  fecha_ingreso: string;
  fecha_vencimiento: string;
  proveedor: string;
  ubicacion: string;
  observaciones: string;
}

export interface Product {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: string;
  categoria: string;
  subcategoria: string;
  estado: string;
  fecha_creacion: string;
  presentaciones: Presentation[];
  imagenes: string[];
}
