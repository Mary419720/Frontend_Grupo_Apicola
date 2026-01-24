export interface User {
  id: string;
  name: string;
  email: string;
  rol: string;
  exp?: number; // Opcional: fecha de expiración en segundos
}
