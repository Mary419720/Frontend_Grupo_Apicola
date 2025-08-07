/**
 * Interfaz que define la estructura de los filtros de productos.
 * Permite un tipado fuerte y consistente a través de la aplicación.
 */
export interface ProductFilters {
  search?: string;
  categoria_id?: string;
  subcategoria_id?: string;
  page?: number;
  limit?: number;
  stock_status?: 'low' | 'in_stock' | 'out_of_stock';
  // Permite flexibilidad para otros filtros no definidos explícitamente
  [key: string]: any;
}
