# 🍯 Grupo Apícola - Sistema de Gestión Completo

Sistema completo de comercio electrónico y gestión administrativa para el Grupo Apícola. Incluye API REST robusta (Backend) y aplicación web moderna (Frontend).

---

## 📚 Documentación

Este proyecto incluye documentación completa y detallada:

### 🚀 Para Empezar
- **[📖 GUIA_DESPLIEGUE.md](./GUIA_DESPLIEGUE.md)** - Guía paso a paso para desplegar en producción

### 📘 Documentación Técnica
- **[INFORME_BACKEND.md](./INFORME_BACKEND.md)** (540 líneas) - Arquitectura completa del backend
- **[INFORME_FRONTEND.md](./INFORME_FRONTEND.md)** (361 líneas) - Arquitectura completa del frontend

### 📂 README Específicos
- **[Backend README](./backend/Backend_Grupo_Apicola/README.md)** - Setup y ejecución del backend
- **[Frontend README](./frontend/Frontend_Grupo_Apicola/README.md)** - Setup y ejecución del frontend
- **[Frontend DEPLOY](./frontend/Frontend_Grupo_Apicola/DEPLOY.md)** - Guía de despliegue del frontend

---

## 🏗️ Arquitectura del Sistema

```
Grupo Apícola
├── Backend (Node.js + Express + MongoDB)
│   ├── API REST
│   ├── Autenticación JWT
│   ├── Gestión de productos, ventas, usuarios
│   └── Base de datos MongoDB Atlas
│
└── Frontend (Angular 17)
    ├── Portal público para clientes
    ├── Panel de administración
    ├── Gestión de productos, ventas, categorías
    └── Sistema de autenticación y roles
```

---

## 🛠️ Tecnologías

### Backend
- **Node.js** v16+
- **Express.js** - Framework web
- **MongoDB** + **Mongoose** - Base de datos NoSQL
- **JWT** - Autenticación
- **bcryptjs** - Hashing de contraseñas
- **Multer** - Subida de archivos

### Frontend
- **Angular 17** - Framework SPA
- **TypeScript** - Lenguaje principal
- **Bootstrap 5** - Framework CSS
- **RxJS** - Programación reactiva
- **Lucide** - Iconos SVG

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js v16 o superior
- npm o yarn
- MongoDB Atlas (o instancia local)

### 1️⃣ Configurar Backend

```bash
# Navegar a la carpeta del backend
cd backend/Backend_Grupo_Apicola

# Instalar dependencias
npm install

# Configurar variables de entorno
# Copia .env.example a .env y configura las variables
cp .env.example .env

# Iniciar en modo desarrollo
npm run dev

# El servidor estará en: http://localhost:3001
```

### 2️⃣ Configurar Frontend

```bash
# Navegar a la carpeta del frontend
cd frontend/Frontend_Grupo_Apicola

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm start

# La aplicación estará en: http://localhost:4200
```

---

## 📖 Estructura del Proyecto

```
proyect_Apicola/
│
├── 📄 README.md                    # Este archivo
├── 📄 GUIA_DESPLIEGUE.md          # Guía de despliegue completa
├── 📄 INFORME_BACKEND.md          # Documentación técnica del backend
├── 📄 INFORME_FRONTEND.md         # Documentación técnica del frontend
│
├── 📁 backend/
│   └── Backend_Grupo_Apicola/
│       ├── 📄 README.md           # Instrucciones del backend
│       ├── 📄 package.json
│       ├── 📄 .env.example        # Plantilla de variables de entorno
│       ├── 📁 src/
│       │   ├── config/            # Configuración de BD
│       │   ├── controllers/       # Lógica de negocio
│       │   ├── middleware/        # Middleware (auth, upload)
│       │   ├── models/            # Modelos de datos (Mongoose)
│       │   ├── routes/            # Rutas de la API
│       │   └── server.js          # Punto de entrada
│       ├── 📁 public/uploads/     # Archivos subidos
│       └── 📁 scripts/            # Scripts de seeding
│
└── 📁 frontend/
    └── Frontend_Grupo_Apicola/
        ├── 📄 README.md           # Instrucciones del frontend
        ├── 📄 DEPLOY.md           # Guía de despliegue
        ├── 📄 package.json
        ├── 📄 angular.json
        ├── 📄 netlify.toml        # Configuración de Netlify
        └── 📁 src/
            ├── 📁 app/
            │   ├── core/          # Servicios core, auth, guards
            │   ├── features/      # Módulos de funcionalidades
            │   │   ├── admin/     # Panel de administración
            │   │   └── public/    # Portal público
            │   └── shared/        # Componentes compartidos
            └── 📁 environments/   # Configuración de entornos
```

---

## 🔐 Seguridad

- ✅ Autenticación con **JWT**
- ✅ Contraseñas hasheadas con **bcrypt**
- ✅ Control de acceso basado en roles (RBAC)
- ✅ **CORS** configurado
- ✅ Validación de datos en múltiples capas
- ✅ Variables de entorno para credenciales
- ✅ `.gitignore` para secretos

---

## 📡 API Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login

### Productos
- `GET /api/products` - Listar (paginado, filtros)
- `GET /api/products/:id` - Detalle
- `POST /api/products` - Crear (Admin)
- `PUT /api/products/:id` - Actualizar (Admin)
- `DELETE /api/products/:id` - Eliminar (Admin)

### Ventas
- `POST /api/sales` - Registrar venta
- `GET /api/sales` - Historial (Admin)

### Categorías
- `GET /api/categories` - Listar
- `POST /api/categories` - Crear (Admin)

Ver documentación completa en `INFORME_BACKEND.md`

---

## 🌟 Características Principales

### Backend
- ✅ API REST completa y documentada
- ✅ Gestión de productos con múltiples presentaciones
- ✅ Sistema de ventas con actualización atómica de stock
- ✅ Autenticación JWT con roles
- ✅ Subida de imágenes con Multer
- ✅ Búsqueda optimizada (normalización de texto)
- ✅ Paginación y filtros avanzados
- ✅ Compresión GZIP de respuestas
- ✅ Manejo centralizado de errores

### Frontend
- ✅ Arquitectura modular con State Management
- ✅ Portal público para clientes
- ✅ Panel de administración completo
- ✅ Lazy loading de módulos
- ✅ Caché inteligente de datos
- ✅ Guards de autenticación y autorización
- ✅ Interceptores HTTP
- ✅ Generación de reportes PDF
- ✅ UI responsiva con Bootstrap 5

---

## 🚀 Despliegue en Producción

### Plataformas Recomendadas

**Backend**:
- ✅ [Render](https://render.com) (Recomendado - Free tier)
- Railway
- Heroku
- AWS / DigitalOcean

**Frontend**:
- ✅ [Netlify](https://netlify.com) (Recomendado - Free tier)
- Vercel
- Firebase Hosting
- GitHub Pages

### Guía Completa
Sigue la **[GUIA_DESPLIEGUE.md](./GUIA_DESPLIEGUE.md)** para instrucciones paso a paso.

---

## 📊 Estado del Proyecto

**Versión**: 1.0.0  
**Estado**: ✅ **Production Ready**

### Completado
- [x] Backend completo y funcional
- [x] Frontend completo y funcional
- [x] Autenticación y autorización
- [x] CRUD de productos
- [x] Sistema de ventas
- [x] Gestión de categorías
- [x] Sistema de favoritos
- [x] Subida de imágenes
- [x] Búsqueda y filtros
- [x] Paginación
- [x] Documentación completa
- [x] Archivos de configuración para despliegue

### Mejoras Futuras (Opcional)
- [ ] Pasarela de pagos (Stripe/PayPal)
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Dashboard de analíticas
- [ ] Sistema de recuperación de contraseña
- [ ] Tests automatizados
- [ ] Docker containerization

---

## 🤝 Soporte y Contacto

Para más información técnica, consulta:
- **Backend**: [INFORME_BACKEND.md](./INFORME_BACKEND.md)
- **Frontend**: [INFORME_FRONTEND.md](./INFORME_FRONTEND.md)
- **Despliegue**: [GUIA_DESPLIEGUE.md](./GUIA_DESPLIEGUE.md)

---

## 📝 Licencia

Este proyecto fue desarrollado para el Grupo Apícola.

---

## 🎉 Agradecimientos

Desarrollado con ❤️ utilizando tecnologías modernas y mejores prácticas de la industria.

---

**¡Tu proyecto está listo para desplegar!** 🚀  
Sigue la [Guía de Despliegue](./GUIA_DESPLIEGUE.md) para llevarlo a producción.
