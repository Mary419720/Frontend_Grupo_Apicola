/**
 * Interfaces para respuestas de la API
 */

// Respuesta genérica para un solo objeto
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Respuesta genérica para listas de objetos
export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
  pages?: number; // Número total de páginas disponibles
}

// Respuesta de error de la API
export interface ApiErrorResponse {
  success: boolean;
  message: string;
  error?: any;
}
