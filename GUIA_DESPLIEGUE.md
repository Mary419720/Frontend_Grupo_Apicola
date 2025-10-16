# 🚀 Guía Completa de Despliegue - Proyecto Grupo Apícola

Esta guía te llevará paso a paso para desplegar tanto el backend como el frontend en producción.

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Despliegue del Backend](#despliegue-del-backend)
3. [Despliegue del Frontend](#despliegue-del-frontend)
4. [Configuración Post-Despliegue](#configuración-post-despliegue)
5. [Verificación Final](#verificación-final)
6. [Solución de Problemas](#solución-de-problemas)

---

## ✅ Requisitos Previos

- [ ] Cuenta de MongoDB Atlas (ya tienes)
- [ ] Repositorio Git (GitHub, GitLab o Bitbucket)
- [ ] Cuenta en Render (para backend) - [render.com](https://render.com)
- [ ] Cuenta en Netlify (para frontend) - [netlify.com](https://netlify.com)
- [ ] Dominio web (opcional): `www.tumelarium.com`

---

## 🔧 PASO 1: Despliegue del Backend

### 1.1 Preparar el Backend

Tus archivos ya están listos:
- ✅ `.env` configurado (NO subas este archivo a Git)
- ✅ `.env.example` creado (documentación)
- ✅ `README.md` creado
- ✅ `package.json` con scripts correctos

### 1.2 Subir a Git (si no lo has hecho)

```bash
cd backend/Backend_Grupo_Apicola

# Verificar que .env está en .gitignore
git status

# Agregar y hacer commit
git add .
git commit -m "Backend ready for deployment"
git push origin main
```

### 1.3 Desplegar en Render

1. **Ir a [render.com](https://render.com)** y crear cuenta

2. **Crear un Web Service**:
   - Click en "New +" → "Web Service"
   - Conecta tu repositorio Git
   - Selecciona tu repositorio

3. **Configuración**:
   ```
   Name: grupo-apicola-backend
   Root Directory: backend/Backend_Grupo_Apicola
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Agregar Variables de Entorno**:
   En la sección "Environment Variables", agrega:
   
   ```
   MONGODB_URI = mongodb+srv://maelu080:E2BYaDTmGAdV9Bsv@cluster1uri.u7ckvi0.mongodb.net/grupo_api_bd?retryWrites=true&w=majority&appName=Cluster1Uri
   
   PORT = 3001
   
   JWT_SECRET = a8b3d5e7f9c1a4b6d8e0f2c5a7b9d1e3f6c8a0b2d4e7f1c3a5b8d9e2f4c7a1b3
   
   FRONTEND_URL = https://tumelarium.netlify.app
   
   NODE_ENV = production
   ```
   
   **⚠️ IMPORTANTE**: El `FRONTEND_URL` lo actualizarás después de desplegar el frontend

5. **Deploy**: Click en "Create Web Service"

6. **Copiar la URL generada**: Algo como `https://grupo-apicola-backend.onrender.com`

### 1.4 Verificar el Backend

Una vez desplegado, prueba:
```
https://tu-backend.onrender.com/
```

Deberías ver: "¡Bienvenido al API de Melariu Grupo Apícola!"

---

## 🎨 PASO 2: Despliegue del Frontend

### 2.1 Preparar el Frontend

**CRÍTICO**: Actualiza la URL del backend

Edita: `frontend/Frontend_Grupo_Apicola/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://grupo-apicola-backend.onrender.com/api', // 👈 TU URL DE RENDER
  debugMode: false,
  showDebugPanels: false,
  enableAdminOverride: false,
  logApiResponses: false
};
```

### 2.2 Probar el Build Localmente

```bash
cd frontend/Frontend_Grupo_Apicola
npm run build --configuration production
```

Si no hay errores, continúa.

### 2.3 Hacer Commit del Cambio

```bash
git add src/environments/environment.prod.ts
git commit -m "Configure production backend URL"
git push origin main
```

### 2.4 Desplegar en Netlify

1. **Ir a [netlify.com](https://netlify.com)** y crear cuenta

2. **Importar Proyecto**:
   - Click en "Add new site" → "Import an existing project"
   - Conecta tu repositorio Git
   - Selecciona tu repositorio

3. **Configuración**:
   ```
   Base directory: frontend/Frontend_Grupo_Apicola
   Build command: npm run build --configuration production
   Publish directory: dist/melarium/browser
   ```

4. **Deploy**: Click en "Deploy site"

5. **Copiar la URL generada**: Algo como `https://tumelarium.netlify.app`

### 2.5 Configurar Dominio (Opcional)

Si tienes `www.tumelarium.com`:

1. En Netlify, ve a "Domain settings"
2. Click "Add custom domain"
3. Ingresa: `www.tumelarium.com`
4. Sigue las instrucciones para configurar los registros DNS
5. Netlify automáticamente provee certificado SSL (HTTPS)

---

## 🔄 PASO 3: Configuración Post-Despliegue

### 3.1 Actualizar CORS en el Backend

**MUY IMPORTANTE**: Ahora que tienes la URL del frontend, actualízala en Render:

1. Ve al dashboard de Render
2. Selecciona tu Web Service del backend
3. Ve a "Environment"
4. Edita `FRONTEND_URL`:
   - Si usas Netlify: `https://tumelarium.netlify.app`
   - Si configuraste dominio: `https://www.tumelarium.com`
5. **Guarda los cambios** (el servicio se reiniciará automáticamente)

### 3.2 Configurar MongoDB Atlas

Asegúrate de que MongoDB Atlas permita conexiones desde Render:

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Cluster → Network Access
3. Verifica que esté en "Allow access from anywhere" o agrega la IP de Render

---

## ✅ PASO 4: Verificación Final

### Checklist Completo

**Backend**:
- [ ] El backend responde en la URL de Render
- [ ] MongoDB está conectado (sin errores en logs)
- [ ] Variables de entorno configuradas correctamente
- [ ] CORS permite peticiones desde el frontend

**Frontend**:
- [ ] El sitio carga en Netlify/Vercel
- [ ] Puedes navegar entre páginas
- [ ] Puedes hacer login
- [ ] Las imágenes de productos se cargan
- [ ] El panel de administración funciona
- [ ] No hay errores en la consola del navegador (F12)

### Probar Funcionalidades Clave

1. **Registro/Login**:
   - Crea una cuenta nueva
   - Inicia sesión
   - Verifica que el token se guarde

2. **Productos**:
   - Lista de productos se carga
   - Ver detalles de un producto
   - (Admin) Crear/editar/eliminar productos

3. **Ventas**:
   - (Admin) Ver historial de ventas
   - Registrar una venta nueva

4. **Navegación**:
   - Prueba refrescar la página en diferentes rutas
   - Verifica que no dé error 404

---

## 🐛 Solución de Problemas Comunes

### Backend no conecta a MongoDB
- **Síntoma**: Error en logs de Render
- **Solución**: 
  - Verifica que `MONGODB_URI` esté correctamente configurado en Render
  - Asegúrate que MongoDB Atlas permite conexiones desde cualquier IP

### Frontend no puede llamar al backend (CORS)
- **Síntoma**: Error en consola del navegador: "CORS policy blocked"
- **Solución**:
  - Verifica que `FRONTEND_URL` en el backend coincida EXACTAMENTE con la URL del frontend
  - No incluyas `/` al final de la URL
  - Verifica protocolo (http vs https)

### Rutas de Angular no funcionan al refrescar
- **Síntoma**: Error 404 al refrescar cualquier ruta que no sea `/`
- **Solución**: 
  - Verifica que `netlify.toml` esté en el directorio correcto
  - Asegúrate que los redirects estén configurados

### Imágenes de productos no cargan
- **Síntoma**: Imágenes aparecen rotas
- **Solución**:
  - Verifica que el backend esté sirviendo la carpeta `/uploads`
  - Asegúrate que la carpeta `public/uploads` tenga imágenes
  - Verifica la URL completa de las imágenes en la consola

### Build falla con error de memoria
- **Solución**: 
  - En `netlify.toml`, ya está configurado: `NODE_OPTIONS = "--max-old-space-size=4096"`
  - Si persiste, contacta soporte de Netlify

---

## 📊 Monitoreo

### Logs del Backend (Render)
- Ve al dashboard de Render
- Selecciona tu servicio
- Ve a "Logs" para ver en tiempo real

### Logs del Frontend (Netlify)
- Ve al dashboard de Netlify
- Selecciona tu sitio
- Ve a "Deploys" → Click en un deploy → "Deploy log"

### Errores del Navegador
- Abre la consola del navegador (F12)
- Pestaña "Console" para errores JavaScript
- Pestaña "Network" para errores de peticiones HTTP

---

## 🔄 Actualizaciones Futuras

Cuando hagas cambios en el código:

1. **Commit y push**:
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push origin main
   ```

2. **Redespliegue automático**:
   - Render y Netlify detectarán el cambio automáticamente
   - Se redesplegarán solos en 2-5 minutos

---

## 📞 URLs Útiles

**Documentación del Proyecto**:
- Backend: `backend/Backend_Grupo_Apicola/README.md`
- Frontend: `frontend/Frontend_Grupo_Apicola/DEPLOY.md`
- Informe técnico backend: `INFORME_BACKEND.md`
- Informe técnico frontend: `INFORME_FRONTEND.md`

**Plataformas de Hosting**:
- [Render Dashboard](https://dashboard.render.com)
- [Netlify Dashboard](https://app.netlify.com)
- [MongoDB Atlas](https://cloud.mongodb.com)

**Documentación Oficial**:
- [Express.js](https://expressjs.com)
- [Angular](https://angular.io)
- [Mongoose](https://mongoosejs.com)

---

## ✨ ¡Felicidades!

Si completaste todos los pasos, tu aplicación **Grupo Apícola** está:
- ✅ Desplegada en producción
- ✅ Accesible desde internet
- ✅ Con HTTPS (certificado SSL)
- ✅ Conectada a base de datos en la nube
- ✅ Lista para usuarios reales

**URLs de Producción**:
- Frontend: `https://tumelarium.netlify.app` o `https://www.tumelarium.com`
- Backend: `https://grupo-apicola-backend.onrender.com`

---

**Creado con ❤️ para Grupo Apícola**  
**Versión**: 1.0.0  
**Fecha**: 2025
