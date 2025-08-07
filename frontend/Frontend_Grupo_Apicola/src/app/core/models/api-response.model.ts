/**
 * Interfaz genérica para una respuesta de API estándar que devuelve un único objeto.
 * @template T El tipo de dato del objeto principal en la respuesta.
 */
export interface ApiResponse<T> {
  success: boolean;       // Indica si la operación fue exitosa.
  message?: string;      // Mensaje descriptivo, especialmente en caso de error.
  data: T;                // Los datos principales de la respuesta.
}

/**
 * Interfaz genérica para una respuesta de API que devuelve una lista de objetos.
 * @template T El tipo de dato de los objetos en la lista.
 */
export interface ApiListResponse<T> {
  success: boolean;       // Indica si la operación fue exitosa.
  message?: string;      // Mensaje descriptivo.
  data: T[];              // La lista de datos.
  total?: number;         // Opcional: número total de elementos disponibles en el servidor.
}
