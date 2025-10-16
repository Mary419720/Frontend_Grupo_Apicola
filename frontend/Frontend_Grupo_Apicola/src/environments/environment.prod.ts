export const environment = {
  production: true,
  // 🔴 IMPORTANTE: Actualiza esta URL con la URL REAL de tu backend desplegado
  // Ejemplo: 'https://tu-backend.onrender.com/api' o 'https://api.tumelarium.com/api'
  apiUrl: 'https://backend-grupo-apicola-1.onrender.com/api', // ⚠️ CAMBIAR ANTES DE DESPLEGAR
  debugMode: false,           // Deshabilita características de depuración en producción
  showDebugPanels: false,     // Oculta paneles de depuración en producción
  enableAdminOverride: false, // Solo usuarios con rol de administrador real pueden acceder a funciones admin
  logApiResponses: false      // No registrar respuestas API en consola en producción
};
