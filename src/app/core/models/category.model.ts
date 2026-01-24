/**
 * Interfaz que representa una subcategoría de producto.
 */
export interface Subcategory {
  _id: string;      // Identificador único de MongoDB
  nombre: string;   // Nombre de la subcategoría (ej. "Miel de Azahar")
}

/**
 * Interfaz que representa una categoría de producto, que puede contener múltiples subcategorías.
 */
export interface Category {
  _id: string;      // Identificador único de MongoDB
  nombre: string;   // Nombre de la categoría (ej. "Mieles")
  // La propiedad 'subcategorias' se elimina porque ahora se cargan de forma independiente.
}
