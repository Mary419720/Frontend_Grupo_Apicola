# ✅ Checklist Rápido de Despliegue

Usa esta lista para verificar que todo está listo antes de desplegar.

---

## 🔧 PREPARACIÓN (Antes de desplegar)

### Backend ✅
- [x] Archivo `.env` configurado con todas las variables
- [x] Archivo `.env.example` creado (para documentación)
- [x] `README.md` creado en el backend
- [x] `.gitignore` incluye `.env`
- [x] MongoDB Atlas configurado y accesible
- [ ] Código subido a Git (GitHub/GitLab/Bitbucket)
- [ ] Probar que el backend funciona localmente: `npm run dev`

### Frontend ✅
- [x] Archivo `netlify.toml` creado
- [x] `DEPLOY.md` con guía de despliegue
- [ ] **⚠️ CRÍTICO**: Actualizar `src/environments/environment.prod.ts` con URL real del backend
- [ ] Probar el build de producción: `npm run build --configuration production`
- [ ] Verificar que no hay errores en el build
- [ ] Código subido a Git

---

## 🚀 DESPLIEGUE

### Paso 1: Backend en Render
- [ ] Crear cuenta en [render.com](https://render.com)
- [ ] Crear Web Service
- [ ] Conectar repositorio Git
- [ ] Configurar:
  - [ ] Root Directory: `backend/Backend_Grupo_Apicola`
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
- [ ] Agregar variables de entorno:
  - [ ] `MONGODB_URI`
  - [ ] `PORT`
  - [ ] `JWT_SECRET`
  - [ ] `FRONTEND_URL` (puedes usar temporal: `http://localhost:4200`)
  - [ ] `NODE_ENV=production`
- [ ] Desplegar
- [ ] **Copiar URL del backend**: `https://_____.onrender.com`
- [ ] Verificar que funciona: abrir la URL en el navegador

### Paso 2: Actualizar Frontend con URL del Backend
- [ ] Editar `frontend/Frontend_Grupo_Apicola/src/environments/environment.prod.ts`
- [ ] Cambiar `apiUrl` a la URL de Render
- [ ] Hacer commit y push:
  ```bash
  git add src/environments/environment.prod.ts
  git commit -m "Configure production backend URL"
  git push
  ```

### Paso 3: Frontend en Netlify
- [ ] Crear cuenta en [netlify.com](https://netlify.com)
- [ ] Importar proyecto desde Git
- [ ] Configurar:
  - [ ] Base directory: `frontend/Frontend_Grupo_Apicola`
  - [ ] Build command: `npm run build --configuration production`
  - [ ] Publish directory: `dist/melarium/browser`
- [ ] Desplegar
- [ ] **Copiar URL del frontend**: `https://_____.netlify.app`

### Paso 4: Actualizar CORS en Backend
- [ ] Ir al dashboard de Render
- [ ] Seleccionar el Web Service del backend
- [ ] Ir a "Environment"
- [ ] Actualizar `FRONTEND_URL` con la URL de Netlify
- [ ] Guardar (el servicio se reiniciará)

---

## ✅ VERIFICACIÓN POST-DESPLIEGUE

### Backend
- [ ] El backend responde en la URL de Render
- [ ] No hay errores en los logs de Render
- [ ] MongoDB está conectado correctamente
- [ ] Endpoint de prueba funciona: `https://tu-backend.onrender.com/`

### Frontend
- [ ] El sitio carga correctamente
- [ ] No hay errores en la consola del navegador (F12)
- [ ] Puedes navegar entre páginas
- [ ] Al refrescar una página, no da error 404

### Funcionalidades
- [ ] **Login funciona**:
  - [ ] Puedes crear una cuenta
  - [ ] Puedes iniciar sesión
  - [ ] El token se guarda correctamente
- [ ] **Productos**:
  - [ ] Se cargan los productos
  - [ ] Las imágenes se ven correctamente
  - [ ] Puedes ver los detalles de un producto
- [ ] **Panel Admin** (si tienes cuenta admin):
  - [ ] Puedes acceder al panel
  - [ ] Puedes crear/editar productos
  - [ ] Puedes ver el historial de ventas
- [ ] **Búsqueda y filtros funcionan**

---

## 🐛 SOLUCIÓN RÁPIDA DE PROBLEMAS

### ❌ Error: "Cannot GET /ruta" al refrescar
**Solución**: Verifica que `netlify.toml` esté en la raíz del proyecto frontend

### ❌ Error CORS en consola del navegador
**Solución**: Verifica que `FRONTEND_URL` en el backend sea EXACTAMENTE igual a la URL del frontend

### ❌ Backend no conecta a MongoDB
**Solución**: Ve a MongoDB Atlas → Network Access → Asegúrate que permite acceso desde cualquier IP

### ❌ Imágenes no cargan
**Solución**: Verifica que el backend sirva la carpeta `/uploads` correctamente

---

## 🎉 TODO LISTO

Si todos los checkboxes están marcados ✅, ¡tu aplicación está desplegada exitosamente!

**URLs de Producción**:
- 🌐 Frontend: `https://_____.netlify.app`
- 🔧 Backend: `https://_____.onrender.com`

---

## 📚 Documentación Adicional

Si necesitas más ayuda:
- **[GUIA_DESPLIEGUE.md](./GUIA_DESPLIEGUE.md)** - Guía detallada paso a paso
- **[Backend README](./backend/Backend_Grupo_Apicola/README.md)**
- **[Frontend DEPLOY](./frontend/Frontend_Grupo_Apicola/DEPLOY.md)**

---

**Última actualización**: 2025  
**Tiempo estimado total**: 30-60 minutos
