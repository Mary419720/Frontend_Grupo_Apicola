# 🚀 Guía de Despliegue - Frontend Grupo Apícola

Esta guía te ayudará a desplegar el frontend de Angular en producción.

## ⚠️ ANTES DE DESPLEGAR

### 1. Actualizar URL del Backend
Edita el archivo `src/environments/environment.prod.ts`:

```typescript
apiUrl: 'https://tu-backend-real.com/api'  // ⚠️ CAMBIAR ESTA LÍNEA
```

**Reemplaza con la URL real de tu backend desplegado**

Ejemplos:
- Si usas Render: `https://grupo-apicola-api.onrender.com/api`
- Si usas Railway: `https://tu-proyecto.railway.app/api`
- Si tienes dominio propio: `https://api.tumelarium.com/api`

### 2. Verificar que el Build Funcione

Antes de desplegar, prueba el build de producción localmente:

```bash
npm run build --configuration production
```

Debería generar los archivos en: `dist/melarium/browser`

---

## 📦 Opción 1: Desplegar en Netlify (Recomendado)

### Método A: Desde la interfaz web

1. Ve a [netlify.com](https://netlify.com) y crea una cuenta
2. Click en "Add new site" → "Import an existing project"
3. Conecta tu repositorio de Git (GitHub, GitLab, Bitbucket)
4. Configuración:
   - **Base directory**: `frontend/Frontend_Grupo_Apicola`
   - **Build command**: `npm run build --configuration production`
   - **Publish directory**: `dist/melarium/browser`
5. Click "Deploy site"

### Método B: Desde CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Desplegar (desde la carpeta del frontend)
cd frontend/Frontend_Grupo_Apicola
netlify deploy --prod
```

### ✅ Configuración Automática
El archivo `netlify.toml` ya está configurado con:
- Redirects para rutas de Angular
- Headers de seguridad
- Cache de assets

---

## 📦 Opción 2: Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta
2. Click en "Add New" → "Project"
3. Importa tu repositorio
4. Configuración:
   - **Framework Preset**: Angular
   - **Root Directory**: `frontend/Frontend_Grupo_Apicola`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/melarium/browser`
5. Deploy

---

## 📦 Opción 3: Desplegar en Firebase Hosting

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar (desde la carpeta del frontend)
cd frontend/Frontend_Grupo_Apicola
firebase init hosting

# Configuración:
# - Public directory: dist/melarium/browser
# - Single-page app: Yes
# - Automatic builds: No

# Construir y desplegar
npm run build --configuration production
firebase deploy --only hosting
```

---

## 🔧 Configurar CORS en el Backend

Después de desplegar el frontend, **actualiza el backend**:

1. Edita el archivo `.env` del backend:
```env
FRONTEND_URL=https://tu-sitio.netlify.app
```

O si tienes dominio:
```env
FRONTEND_URL=https://www.tumelarium.com
```

2. Redespliega el backend con esta nueva configuración

---

## 🌐 Configurar Dominio Personalizado (Opcional)

### En Netlify:
1. Ve a "Domain settings"
2. Click "Add custom domain"
3. Ingresa `www.tumelarium.com`
4. Sigue las instrucciones para configurar DNS

### En Vercel:
1. Ve a "Domains"
2. Click "Add"
3. Ingresa tu dominio
4. Configura los registros DNS

---

## ✅ Checklist Post-Despliegue

- [ ] El sitio carga correctamente
- [ ] Las rutas de Angular funcionan (prueba navegar y refrescar)
- [ ] Puedes hacer login (verifica conexión con backend)
- [ ] Las imágenes de productos se cargan
- [ ] No hay errores en la consola del navegador
- [ ] El backend permite peticiones desde el frontend (CORS configurado)
- [ ] HTTPS está activo (certificado SSL)

---

## 🐛 Solución de Problemas

### Error: "Cannot GET /ruta"
- **Causa**: Los redirects no están configurados
- **Solución**: Verifica que `netlify.toml` esté en la raíz del proyecto frontend

### Error: CORS al llamar al backend
- **Causa**: Backend no permite el origen del frontend
- **Solución**: Actualiza `FRONTEND_URL` en el backend

### Build falla con error de memoria
- **Solución**: Aumenta la memoria de Node en `netlify.toml`:
  ```toml
  [build.environment]
    NODE_OPTIONS = "--max-old-space-size=4096"
  ```

### Las rutas no funcionan al refrescar
- **Causa**: Falta configuración de SPA
- **Solución**: Asegúrate que el hosting redirige todo a `index.html`

---

## 📊 Monitoreo

### Analytics en Netlify
- Activa "Netlify Analytics" en el dashboard
- Ve métricas de tráfico y rendimiento

### Logs
- Revisa los logs de deploy en el dashboard de tu hosting
- Verifica errores en la consola del navegador (F12)

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

1. Haz commit y push a tu repositorio
2. El sitio se redespliegará automáticamente (si configuraste CI/CD)
3. O ejecuta manualmente: `netlify deploy --prod`

---

**¡Listo! Tu frontend está desplegado** 🎉

Para más información, consulta:
- [Documentación completa](../../INFORME_FRONTEND.md)
- [Documentación de Netlify](https://docs.netlify.com)
- [Documentación de Angular](https://angular.io/guide/deployment)
