export const environment = {
  production: true,
  apiUrl: 'YOUR_PRODUCTION_API_URL/api', // <-- CAMBIA ESTO CUANDO DESPLIEGUES
  debugMode: false,           // Deshabilita características de depuración en producción
  showDebugPanels: false,     // Oculta paneles de depuración en producción
  enableAdminOverride: false, // Solo usuarios con rol de administrador real pueden acceder a funciones admin
  logApiResponses: false      // No registrar respuestas API en consola en producción
};
