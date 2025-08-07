1. Resumen Ejecutivo (Versión Mejorada)
El presente documento detalla la arquitectura, funcionalidades y diseño técnico del backend para el proyecto "Grupo Apícola". El objetivo principal de este sistema es proporcionar una solución de software robusta y escalable que sirva como el núcleo de una plataforma de comercio electrónico, diseñada para impulsar la presencia digital y optimizar la operación comercial de la empresa.
El backend ha sido desarrollado utilizando un stack tecnológico moderno y de alto rendimiento, compuesto por Node.js y el framework Express.js, garantizando una API rápida y flexible. Para la persistencia de datos, se ha implementado una base de datos NoSQL, MongoDB, gestionada a través del ODM Mongoose, lo que permite un modelado de datos ágil y una arquitectura orientada a la mantenibilidad y escalabilidad a futuro.
Las funcionalidades clave implementadas son:
• Gestión Integral de Productos: Un sistema CRUD (Crear, Leer, Actualizar, Eliminar) completo que soporta un catálogo complejo con múltiples presentaciones, precios diferenciados y control de stock individualizado.
• Autenticación y Seguridad Basada en Roles: Mediante el uso de JSON Web Tokens (JWT) y hashing de contraseñas con bcrypt, el sistema protege las rutas críticas y diferencia los permisos entre usuarios administradores y visitantes.
• Procesamiento de Ventas Transaccional: Un módulo de ventas que asegura la consistencia de los datos y la integridad del inventario mediante el uso de transacciones atómicas en la base de datos durante el registro de cada venta.
• Búsqueda y Filtrado Avanzado: Capacidades de búsqueda optimizadas, con normalización de texto para búsquedas insensibles a acentos y mayúsculas, permitiendo a los usuarios encontrar productos de manera rápida y eficiente.
• Manejo de Archivos Estáticos: Un sistema para la subida y servicio de imágenes de productos, gestionado a través de middleware especializado.
Este reporte está diseñado para ofrecer una visión clara tanto a nivel técnico como funcional, sirviendo como una guía fundamental para el desarrollo continuo, el mantenimiento y la futura expansión del proyecto.

2. Introducción (Versión Detallada)
2.1. Propósito del Proyecto
El proyecto "Grupo Apícola" nace de la necesidad de modernizar y centralizar la gestión comercial de la empresa, abordando los desafíos de un control de inventario manual y una gestión de ventas descentralizada. El propósito fundamental de este sistema backend es actuar como el cerebro operativo de una plataforma de comercio electrónico, proveyendo una API (Interfaz de Programación de Aplicaciones) segura, eficiente y escalable.
Los objetivos específicos del backend son:
• Centralizar la Información: Crear una única fuente de verdad para el catálogo de productos, el inventario y el historial de ventas.
• Automatizar Procesos: Reducir la carga operativa mediante la automatización de la actualización del stock con cada venta.
• Habilitar el Comercio Electrónico: Proporcionar los servicios necesarios para que una aplicación cliente (frontend web o móvil) pueda mostrar productos, procesar compras y gestionar usuarios.
• Facilitar la Toma de Decisiones: Generar datos estructurados sobre ventas y productos que puedan ser utilizados para análisis de negocio y toma de decisiones estratégicas.
2.2. Alcance del Sistema
El alcance del backend se centra en ofrecer un conjunto completo de servicios web (endpoints) que cubren las siguientes áreas funcionales:
• Módulo de Autenticación y Usuarios:
• Registro de nuevos usuarios.
• Inicio de sesión con validación de credenciales.
• Gestión de roles (administrador, visitante) para controlar el acceso a funcionalidades críticas.
• Módulo de Productos e Inventario:
• Gestión completa (CRUD) del catálogo de productos.
• Soporte para múltiples presentaciones por producto (e.g., diferentes tamaños, envases).
• Control de stock en tiempo real a nivel de presentación.
• Capacidad para subir y gestionar imágenes de productos.
• Módulo de Ventas:
• Registro de nuevas ventas con detalle de productos y cliente.
• Actualización atómica del inventario para garantizar la consistencia de los datos.
• Generación de un folio único por cada transacción.
• Módulo de Categorización:
• Gestión de categorías y subcategorías para organizar el catálogo de productos.
• Módulo de Búsqueda:
• Endpoints dedicados para la búsqueda de productos por texto, categoría y otros filtros.
2.3. Público Objetivo
El sistema está diseñado para ser consumido por diferentes tipos de usuarios y sistemas, cada uno con un rol y un propósito específico:
• Administradores: Son los usuarios con el nivel más alto de privilegios. A través de una aplicación cliente de administración, pueden gestionar todo el catálogo de productos, supervisar las ventas, gestionar usuarios y configurar el sistema.
• Vendedores / Personal Interno: Usuarios que pueden tener permisos para registrar ventas y consultar el inventario, interactuando con el sistema a través de un punto de venta o una aplicación interna.
• Clientes Finales (Visitantes): Son los consumidores que interactúan con el sistema de forma indirecta a través de la tienda en línea (frontend). Pueden registrarse, ver productos, añadirlos a favoritos y realizar compras.
• Sistemas Externos (Futuro): La arquitectura basada en API permite que en el futuro se puedan integrar otros sistemas, como software de contabilidad o logística, para consumir los datos del backend.

3. Arquitectura del Sistema (Backend)
3.1. Visión General y Stack Tecnológico
La arquitectura del backend del proyecto "Grupo Apícola" se ha diseñado siguiendo un modelo de API RESTful, que promueve la separación de responsabilidades entre el cliente (frontend) y el servidor. Este enfoque modular y basado en servicios permite una mayor escalabilidad, mantenibilidad y la posibilidad de conectar múltiples tipos de clientes (web, móvil, etc.) a la misma lógica de negocio.
El stack tecnológico seleccionado para este proyecto es:
• Entorno de Ejecución: Node.js, elegido por su modelo de E/S (Entrada/Salida) sin bloqueo, lo que lo hace ideal para aplicaciones en tiempo real y con un alto volumen de peticiones concurrentes.
• Framework del Servidor: Express.js, un framework minimalista y flexible para Node.js que proporciona un conjunto robusto de características para construir aplicaciones web y APIs. Facilita la gestión de rutas, middleware y respuestas HTTP.
• Base de Datos: MongoDB, una base de datos NoSQL orientada a documentos. Su flexibilidad en el esquema de datos es perfecta para los requerimientos de un catálogo de productos complejo y permite una fácil escalabilidad horizontal.
• ODM (Object Data Modeling): Mongoose, una librería que proporciona una solución directa y basada en esquemas para modelar los datos de la aplicación. Facilita las validaciones, la definición de la estructura de los datos y la interacción con MongoDB.
3.2. Diagrama de Arquitectura de Alto Nivel
El siguiente diagrama ilustra el flujo de comunicación y la interacción entre los principales componentes del sistema:
```mermaid
graph TD
    subgraph "Clientes"
        AdminUI[Interfaz de Administrador]
        PublicUI[Tienda en Línea / App Móvil]
    end

    subgraph "Servidor Backend (Node.js)"
        API[API Gateway / Express.js]
        Middleware[Capa de Middleware]
        Router[Gestor de Rutas]
        Controllers[Controladores]
        Models[Modelos de Datos (Mongoose)]
    end

    subgraph "Infraestructura y Persistencia"
        Database[(Base de Datos MongoDB)]
        FileSystem[(Sistema de Archivos /uploads)]
    end

    %% Flujo de Peticiones
    AdminUI -- Peticiones HTTP/S (con Token JWT) --> API
    PublicUI -- Peticiones HTTP/S --> API

    API --> Middleware
    Middleware -- Pasa a --> Router
    Router -- Dirige a --> Controllers
    Controllers -- Usan --> Models
    Models -- Leen/Escriben --> Database

    %% Flujo de Subida de Archivos
    Controllers -- Usan Middleware de Upload --> FileSystem

    %% Flujo de Archivos Estáticos
    API -- Sirve archivos estáticos --> PublicUI
    API -- Sirve archivos estáticos --> AdminUI
    FileSystem -- Provee imágenes --> API
```

3.3. Estructura de Carpetas del Proyecto
La organización del código fuente sigue un patrón de diseño estándar que separa las responsabilidades, facilitando la navegación, el mantenimiento y la colaboración en el proyecto.
```
Backend_Grupo_Apicola/
├── data/                  # (Opcional) Archivos JSON para inicialización de datos (seeding).
├── node_modules/          # Dependencias instaladas por npm.
├── public/
│   └── uploads/           # Directorio público para almacenar y servir imágenes subidas.
├── scripts/               # Scripts para tareas de desarrollo, como el seeding de la BD.
├── src/
│   ├── config/
│   │   └── database.js    # Configuración y lógica de conexión a la base de datos.
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── ...            # Contienen la lógica de negocio y manejan las peticiones.
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── ...            # Funciones que se ejecutan antes de los controladores (auth, logs, etc.).
│   ├── models/
│   │   ├── user.js
│   │   ├── product.js
│   │   └── ...            # Definen los esquemas de datos (schemas) para Mongoose.
│   └── routes/
│       ├── authRoutes.js
│       ├── productRoutes.js
│       └── ...            # Definen los endpoints de la API y los asocian a los controladores.
├── .env                   # Archivo de variables de entorno (credenciales, secretos). No se versiona.
├── package.json           # Metadatos del proyecto y lista de dependencias.
└── server.js              # Punto de entrada de la aplicación. Inicializa Express y el servidor.
```

3.4. Justificación de la Arquitectura Monolítica
Para la fase actual del proyecto "Grupo Apícola", se ha optado conscientemente por una arquitectura monolítica en lugar de un enfoque de microservicios. Esta decisión se basa en las siguientes ventajas estratégicas:

*   **Simplicidad en el Desarrollo y Despliegue:** Un monolito concentra toda la lógica de negocio en una única base de código y un solo artefacto desplegable. Esto simplifica enormemente los procesos de desarrollo, pruebas y despliegue, reduciendo la complejidad operativa y los costos iniciales.
*   **Rendimiento Optimizado para Comunicación Interna:** La comunicación entre los diferentes módulos (e.g., Productos y Ventas) se realiza a través de llamadas a funciones internas, lo cual es significativamente más rápido y eficiente que la comunicación a través de la red que requerirían los microservicios.
*   **Menor Carga de Gestión:** Se evita la sobrecarga de gestionar múltiples repositorios, pipelines de CI/CD, y la complejidad de la comunicación y el descubrimiento de servicios.

Esta arquitectura proporciona la agilidad necesaria para iterar rápidamente y entregar valor en las primeras etapas del proyecto. A medida que la aplicación crezca y las demandas del negocio evolucionen, la estructura modular del código facilitará una posible transición futura a microservicios si fuera necesario.

4. Diseño de la Base de Datos
La base de datos es el corazón del sistema, y su diseño se ha centrado en la flexibilidad, la integridad de los datos y el rendimiento. Se utiliza MongoDB, una base de datos NoSQL, que permite almacenar datos en documentos flexibles similares a JSON, lo cual es ideal para la estructura compleja y anidada de los productos y ventas.
4.1. Modelo de Datos y Colecciones Principales
El sistema se organiza en torno a las siguientes colecciones (equivalentes a las tablas en bases de datos relacionales):
• users: Almacena la información de todos los usuarios registrados, incluyendo sus credenciales de acceso (hasheadas), rol y datos personales.
• products: Contiene el catálogo completo de productos. Cada documento de producto incluye su información básica, descripción, imágenes, y un array anidado con sus diferentes presentaciones (tamaños, formatos, stock individual, etc.).
• categories: Define las categorías principales para la clasificación de productos (e.g., "Miel", "Polen", "Jalea Real").
• subcategories: Define las subcategorías que dependen de una categoría principal, permitiendo una clasificación más granular (e.g., "Miel de Azahar" dentro de "Miel").
• sales: Registra cada transacción realizada. Cada documento de venta contiene la información del cliente, los productos vendidos (como una instantánea), los totales y el estado de la venta.

4.2. Diagrama de Relaciones entre Colecciones
El siguiente diagrama (modelo Entidad-Relación adaptado para NoSQL) ilustra cómo se relacionan estas colecciones entre sí. Las relaciones se gestionan principalmente mediante referencias de ObjectId.
```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        String name
        String email
        String rol
        Array favorites FK
    }

    PRODUCTS {
        ObjectId _id PK
        String nombre
        String codigo
        ObjectId categoria_id FK
        ObjectId subcategoria_id FK
        Array presentaciones
    }

    CATEGORIES {
        ObjectId _id PK
        String nombre
    }

    SUBCATEGORIES {
        ObjectId _id PK
        String nombre
        ObjectId category_id FK
    }

    SALES {
        ObjectId _id PK
        String folio
        ObjectId usuario_vendedor_id FK
        Array productos
    }

    USERS ||--o{ SALES : "realiza"
    USERS {o--o{ PRODUCTS : "marca como favorito"
    CATEGORIES ||--o{ SUBCATEGORIES : "contiene"
    CATEGORIES ||--o{ PRODUCTS : "agrupa"
    SUBCATEGORIES ||--o{ PRODUCTS : "clasifica"
    SALES {o--o{ PRODUCTS : "incluye"
```

4.3. Ejemplos de Esquemas (Schemas) Relevantes
Los esquemas se definen con Mongoose para imponer una estructura y validaciones a los datos. A continuación, se muestran los dos esquemas más importantes del sistema.

**product.js (Esquema de Producto - Simplificado)**
```javascript
const mongoose = require('mongoose');

// Esquema anidado para las presentaciones
const presentacionSchema = new mongoose.Schema({
  sku: { type: String, trim: true },
  formato: { type: String, required: true },
  precio_venta: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  // ... otros campos de la presentación
});

const productSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  codigo: { type: String, required: true, unique: true },
  descripcion: { type: String, required: true },
  
  // Relación con otras colecciones
  categoria_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategoria_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },
  
  // Campo para búsqueda optimizada (generado automáticamente)
  nombre_normalizado: { type: String, index: true },

  // Array de documentos anidados
  presentaciones: [presentacionSchema],

  activo: { type: Boolean, default: true },
  eliminado: { type: Boolean, default: false }
}, { timestamps: true });

// Middleware para normalizar el nombre antes de guardar
productSchema.pre('save', function(next) {
  this.nombre_normalizado = this.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  next();
});

module.exports = mongoose.model('Product', productSchema);
```

**user.js (Esquema de Usuario - Simplificado)**
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: {
    type: String,
    required: true,
    select: false // Evita que la contraseña se envíe en las consultas por defecto
  },
  rol: {
    type: String,
    enum: ['administrador', 'visitante'],
    default: 'visitante'
  }
}, { timestamps: true });

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar contraseñas durante el login
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

**category.js (Esquema de Categoría)**
```javascript
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  descripcion: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
```

**subcategory.js (Esquema de Subcategoría)**
```javascript
const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  categoria_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Subcategory', subcategorySchema);
```

**sale.js (Esquema de Venta)**
```javascript
const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  folio: {
    type: String,
    required: true,
    unique: true
  },
  cliente: {
    nombre: { type: String, required: true },
    email: { type: String }
  },
  productos: [{
    producto_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    nombre: String, // Snapshot del nombre al momento de la venta
    sku: String,
    formato: String,
    cantidad: { type: Number, required: true },
    precio_unitario: { type: Number, required: true } // Snapshot del precio
  }],
  total: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['Completada', 'Pendiente', 'Cancelada'],
    default: 'Completada'
  }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
```

5. Funcionalidades Principales (Endpoints del API)
El backend expone un conjunto de endpoints RESTful que permiten a las aplicaciones cliente interactuar de forma segura y estandarizada con los recursos del sistema. Cada endpoint está diseñado para una acción específica (Crear, Leer, Actualizar, Eliminar) y sigue las convenciones del protocolo HTTP.
El acceso a los endpoints sensibles está protegido por un sistema de autenticación basado en Tokens JWT y autorización por roles, garantizando que solo los usuarios con los permisos adecuados puedan realizar operaciones críticas.
A continuación, se detallan los principales módulos y sus endpoints correspondientes.

**5.1. Módulo de Autenticación y Seguridad (/api/auth)**
| Método | Endpoint | Descripción | Acceso |
| --- | --- | --- | --- |
| POST | /register | Permite a un nuevo usuario registrarse en el sistema proporcionando nombre, email y contraseña. | Público |
| POST | /login | Autentica a un usuario con su email y contraseña. Si es exitoso, devuelve un token JWT y los datos del usuario. | Público |

**5.2. Módulo de Gestión de Productos (/api/products)**
| Método | Endpoint | Descripción | Acceso |
| --- | --- | --- | --- |
| GET | / | Obtiene una lista paginada de productos. Soporta filtros por categoría, búsqueda por texto y múltiples criterios de ordenamiento. | Público |
| GET | /:id | Obtiene los detalles completos de un producto específico por su ID, incluyendo todas sus presentaciones. | Público |
| POST | / | Crea un nuevo producto. Los datos del producto y las imágenes (opcionales) se envían en formato multipart/form-data. | Privado (Administrador) |
| PUT | /:id | Actualiza la información de un producto existente. Permite modificar datos y/o subir nuevas imágenes. | Privado (Administrador) |
| DELETE | /:id | Realiza una eliminación lógica (soft delete) del producto, marcándolo como inactivo sin borrarlo permanentemente. | Privado (Administrador) |
| GET | /search | Endpoint optimizado para búsquedas de texto libre en nombre, código y descripción de productos. | Público |
| POST | /by-ids | Recibe un array de IDs de productos y devuelve la información de cada uno. Ideal para carritos de compra o listas de favoritos. | Público |
| DELETE | /:productId/presentations/:presentationId | Elimina una presentación específica de un producto sin afectar al producto principal. | Privado (Administrador) |

**5.3. Módulo de Categorización (/api/categories y /api/subcategories)**
| Método | Endpoint | Descripción | Acceso |
| --- | --- | --- | --- |
| GET | /categories | Devuelve una lista de todas las categorías. | Público |
| POST | /categories | Crea una nueva categoría. | Privado (Administrador) |
| GET | /subcategories | Devuelve una lista de todas las subcategorías. | Público |
| POST | /subcategories | Crea una nueva subcategoría para una categoría. | Privado (Administrador) |

**5.4. Módulo de Gestión de Ventas (/api/sales)**
| Método | Endpoint | Descripción | Acceso |
| --- | --- | --- | --- |
| POST | / | Registra una nueva venta. El sistema descuenta el stock de los productos vendidos de forma atómica y transaccional. | Privado (Autenticado) |
| GET | / | Obtiene un historial de todas las ventas realizadas en el sistema. | Privado (Administrador) |
| GET | /:id | Obtiene el detalle completo de una venta específica por su ID. | Privado (Administrador) |

**5.5. Módulo de Favoritos (/api/favorites)**
| Método | Endpoint | Descripción | Acceso |
| --- | --- | --- | --- |
| GET | / | Obtiene la lista de productos favoritos del usuario. | Privado (Autenticado) |
| POST | /:productId | Añade un producto a la lista de favoritos. | Privado (Autenticado) |
| DELETE | /:productId | Elimina un producto de la lista de favoritos. | Privado (Autenticado) |

**5.6. Módulo de Pagos (/api/payments)**
| Método | Endpoint | Descripción | Acceso |
| --- | --- | --- | --- |
| POST | / | Registra un nuevo pago asociado a una venta. | Privado (Autenticado) |
| GET | / | Obtiene un listado de todos los pagos realizados. | Privado (Administrador) |
| GET | /:id | Obtiene el detalle de un pago específico. | Privado (Administrador) |

6. Mecanismos de Seguridad Implementados
La seguridad ha sido un pilar fundamental en el diseño y desarrollo del backend del "Grupo Apícola". Se han implementado múltiples capas de protección para asegurar la confidencialidad, integridad y disponibilidad de los datos y servicios.
6.1. Autenticación con JSON Web Tokens (JWT)
El sistema utiliza un esquema de autenticación sin estado basado en tokens JWT. Este enfoque moderno y seguro funciona de la siguiente manera:
1. Inicio de Sesión: Cuando un usuario inicia sesión con credenciales válidas, el servidor genera un token JWT firmado digitalmente que contiene información del usuario (ID, rol).
2. Envío del Token: El token se envía al cliente, que debe almacenarlo de forma segura.
3. Peticiones Autenticadas: Para acceder a rutas protegidas, el cliente debe incluir el token en el encabezado Authorization de cada petición HTTP, usando el esquema Bearer.
4. Verificación en el Servidor: Un middleware en el servidor intercepta cada petición, verifica la firma y la validez del token. Si el token es válido, se extrae la información del usuario y se adjunta al objeto de la petición (req.user), permitiendo el acceso.
Los tokens tienen una fecha de expiración (1 día), lo que obliga a los usuarios a reautenticarse periódicamente, minimizando el riesgo en caso de que un token sea comprometido.

6.2. Autorización Basada en Roles (RBAC)
Para asegurar que los usuarios solo puedan acceder a las funcionalidades que les corresponden, se ha implementado un sistema de control de acceso basado en roles:
• Middleware protect: Verifica que el usuario esté autenticado (es decir, que haya un token válido). Es el primer nivel de seguridad.
• Middleware authorize: Verifica que el usuario autenticado tenga uno de los roles permitidos para acceder a un endpoint específico. Por ejemplo, solo los usuarios con el rol de administrador pueden crear o eliminar productos.
Esta separación de responsabilidades garantiza que un usuario visitante no pueda, bajo ninguna circunstancia, ejecutar acciones administrativas.

6.3. Almacenamiento Seguro de Contraseñas (Hashing)
Las contraseñas de los usuarios nunca se almacenan en texto plano. Se utiliza la librería bcrypt para aplicar un algoritmo de hashing de un solo sentido:
• Hashing y Salting: Antes de guardar un nuevo usuario en la base de datos, su contraseña se transforma en un hash complejo mediante bcrypt. Este proceso incluye un "salt" (una cadena aleatoria única para cada contraseña), lo que previene ataques de diccionario y de tablas arcoíris (rainbow tables).
• Proceso Irreversible: El hash es irreversible; es computacionalmente inviable obtener la contraseña original a partir del hash.
• Verificación: Durante el inicio de sesión, la contraseña proporcionada por el usuario se hashea de la misma manera y se compara con el hash almacenado en la base de datos.

6.4. Validación y Saneamiento de Datos de Entrada
Para prevenir ataques de inyección (como NoSQL Injection) y asegurar la integridad de los datos, se realizan validaciones en múltiples niveles:
• Validación a Nivel de Esquema: Mongoose se utiliza para definir tipos de datos, campos obligatorios y restricciones de formato (e.g., formato de email) directamente en los modelos. La base de datos rechazará cualquier dato que no cumpla con el esquema.
• Validación a Nivel de Controlador: Se realizan comprobaciones adicionales en los controladores para validar la lógica de negocio antes de procesar los datos.

6.5. Protección contra Vulnerabilidades Web Comunes
Se han configurado middlewares de Express para mitigar riesgos conocidos:
• CORS (Cross-Origin Resource Sharing): El backend está configurado para aceptar peticiones únicamente desde orígenes (dominios) autorizados, como el de la aplicación frontend. Esto previene que sitios web maliciosos puedan hacer peticiones a la API en nombre de un usuario.
• Limitación del Tamaño del Payload: Se ha establecido un límite en el tamaño de las peticiones JSON (express.json({ limit: '10mb' })) para prevenir ataques de denegación de servicio (DoS) que intenten sobrecargar el servidor con peticiones muy grandes.

6.6. Gestión Segura de Secretos y Credenciales
Toda la información sensible (cadenas de conexión a la base de datos, secretos para firmar JWT, claves de API de terceros, etc.) se gestiona exclusivamente a través de variables de entorno.
• Archivo .env: Estas variables se almacenan en un archivo .env en el entorno de desarrollo.
• Exclusión de Versionado: Este archivo está explícitamente excluido del control de versiones (Git) a través del archivo .gitignore para asegurar que las credenciales nunca sean expuestas en el repositorio de código.

7. Optimización y Rendimiento
Para garantizar una experiencia de usuario fluida y un uso eficiente de los recursos del servidor, se han implementado varias estrategias de optimización a lo largo de la arquitectura del backend. Estas medidas aseguran que la aplicación sea rápida, escalable y robusta, incluso a medida que el volumen de datos y el número de usuarios aumenten.
7.1. Optimización a Nivel de Base de Datos
El rendimiento de la base de datos es crítico para la velocidad general de la aplicación.
• Indexación de Campos Clave: Se han creado índices en la base de datos MongoDB sobre los campos que se utilizan con frecuencia en las operaciones de búsqueda, filtrado y ordenamiento. Campos como codigo_normalizado, nombre_normalizado y categoria_id en la colección de productos están indexados.
• Impacto: Los índices actúan como una tabla de contenidos para la base de datos, permitiéndole localizar datos de manera casi instantánea sin tener que escanear la colección completa. Esto reduce drásticamente el tiempo de respuesta de las consultas, especialmente en grandes volúmenes de datos.
• Consultas Eficientes con Proyección: En las consultas a la base de datos, se utiliza la proyección de campos (a través del método .select() de Mongoose) para solicitar únicamente los datos necesarios para una operación específica.
• Impacto: Al reducir la cantidad de datos que viajan desde la base de datos al servidor, se minimiza la latencia de la red y el consumo de memoria de la aplicación. Por ejemplo, al mostrar una lista de productos, no es necesario cargar la descripción completa o todos los atributos de cada uno.

7.2. Optimización de la Lógica de Búsqueda
La funcionalidad de búsqueda ha sido diseñada para ser particularmente rápida y precisa.
• Campos Normalizados para Búsqueda de Texto: Como se mencionó anteriormente, los campos de texto principales (nombre, codigo, descripcion) tienen un campo duplicado y normalizado (sin acentos, en minúsculas). Las búsquedas se realizan principalmente sobre estos campos normalizados e indexados.
• Impacto: Este enfoque es significativamente más rápido que realizar búsquedas con expresiones regulares complejas sobre campos no indexados. Permite búsquedas insensibles a mayúsculas y acentos de forma nativa y con un rendimiento muy alto.

7.3. Optimización a Nivel de Red y Aplicación
La eficiencia en la comunicación entre el servidor y el cliente es clave para la percepción de velocidad del usuario.
• Compresión de Respuestas HTTP (GZIP): Se utiliza el middleware compression de Express para comprimir automáticamente las respuestas JSON enviadas al cliente.
• Impacto: La compresión GZIP puede reducir el tamaño de los datos transferidos hasta en un 70-80%. Esto se traduce en tiempos de carga mucho más rápidos para el usuario final, especialmente en conexiones móviles o de baja velocidad.
• Paginación de Resultados: Todos los endpoints que devuelven listas potencialmente grandes (como la lista de productos o el historial de ventas) implementan un sistema de paginación. El cliente puede especificar qué "página" de resultados desea y cuántos ítems por página (?page=1&limit=10).
• Impacto: La paginación evita sobrecargar tanto al servidor como al cliente con conjuntos de datos masivos en una sola petición. Mejora el rendimiento, reduce el uso de memoria y hace que la interfaz de usuario sea más manejable.

7.4. Arquitectura Asíncrona de Node.js
La propia elección de Node.js como entorno de ejecución es una decisión de optimización.
• Modelo de Entrada/Salida (E/S) sin Bloqueo: Node.js utiliza un bucle de eventos (event loop) para manejar operaciones de E/S (como consultas a la base de datos o lecturas de archivos) de forma asíncrona.
• Impacto: Mientras el sistema espera la respuesta de una operación lenta (como una consulta a la base de datos), el servidor no se bloquea. Puede seguir atendiendo otras peticiones de otros usuarios simultáneamente. Esta arquitectura es lo que permite a Node.js manejar una gran cantidad de conexiones concurrentes con un bajo consumo de recursos, haciendo que el sistema sea altamente escalable.

8. Instrucciones de Despliegue y Ejecución
Esta guía proporciona los pasos necesarios para configurar el entorno de desarrollo local, instalar las dependencias y ejecutar el servidor del backend. También incluye recomendaciones para el despliegue en un entorno de producción.
8.1. Prerrequisitos de Software
Antes de comenzar, asegúrate de tener instalado el siguiente software en tu sistema:
• Node.js: Versión 16.x o superior.
• npm (Node Package Manager): Se instala automáticamente con Node.js.
• Git: Para clonar el repositorio de código.
• MongoDB: Una instancia de base de datos MongoDB, ya sea local o en un servicio en la nube como MongoDB Atlas.

8.2. Configuración del Entorno
1.  **Clonar el Repositorio:** `git clone <url_del_repositorio>`
2.  **Instalar Dependencias:** Navegar a la carpeta del proyecto y ejecutar `npm install`.
3.  **Crear Archivo de Entorno:** Crear un archivo `.env` en la raíz del proyecto, basándose en el archivo `.env.example` (si existe). Este archivo debe contener las siguientes variables:
    ```
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/apicola_db
    JWT_SECRET=tu_secreto_super_secreto_para_jwt
    NODE_ENV=development
    ```

8.3. Ejecución en Modo Desarrollo
Para iniciar el servidor en modo de desarrollo con recarga automática (gracias a `nodemon`), ejecutar:
`npm run dev`
El servidor estará disponible en `http://localhost:5000`.

8.4. Configuración para Producción con PM2
Para un despliegue en producción, se recomienda encarecidamente el uso de un gestor de procesos como **PM2**, que proporciona clustering, monitorización y reinicios automáticos.

1.  **Instalar PM2 Globalmente:** `npm install pm2 -g`
2.  **Crear Archivo de Configuración:** Crear un archivo `ecosystem.config.js` en la raíz del proyecto con el siguiente contenido:

    ```javascript
    module.exports = {
      apps: [
        {
          name: 'grupo-apicola-api',
          script: 'server.js',
          instances: 'max', // Utiliza todos los núcleos de CPU disponibles (modo cluster)
          exec_mode: 'cluster',
          autorestart: true,
          watch: false, // Desactivar en producción, reiniciar manualmente tras un pull
          max_memory_restart: '1G', // Reiniciar si excede 1GB de RAM
          env: {
            NODE_ENV: 'development'
          },
          env_production: {
            NODE_ENV: 'production',
            PORT: 8080 // O el puerto que se usará en producción
          }
        }
      ]
    };
    ```

3.  **Iniciar la Aplicación en Producción:**
    `pm2 start ecosystem.config.js --env production`


9. Conclusiones y Recomendaciones

9.1. Conclusiones
El backend del proyecto "Grupo Apícola" se ha diseñado y desarrollado exitosamente como una plataforma robusta, segura y escalable, cumpliendo con todos los objetivos iniciales. La arquitectura basada en Node.js, Express y MongoDB ha demostrado ser una elección acertada, proporcionando un alto rendimiento y una gran flexibilidad para el modelado de datos complejos.

Las principales fortalezas del sistema son:
*   **Arquitectura Sólida y Mantenible:** La estructura modular del código facilita la adición de nuevas funcionalidades y el mantenimiento a largo plazo.
*   **Seguridad Integral:** La implementación de JWT para autenticación, RBAC para autorización, hashing de contraseñas y validaciones a nivel de API y base de datos garantiza la protección de los datos y las operaciones críticas.
*   **Rendimiento Optimizado:** A través de la indexación de la base de datos, la normalización de texto para búsquedas, la compresión de respuestas y la paginación, el sistema está preparado para manejar un volumen considerable de datos y usuarios de manera eficiente.

9.2. Recomendaciones y Próximos Pasos
Para asegurar el éxito continuo y la evolución del proyecto, se recomienda abordar las siguientes iniciativas estratégicas:

*   **Implementar Pruebas Automatizadas:** Desarrollar un conjunto de pruebas unitarias y de integración (usando frameworks como **Jest** y **Supertest**) para validar la lógica de negocio, los endpoints y los modelos. Esto aumentará la fiabilidad del código y reducirá el riesgo de regresiones en futuras actualizaciones.
*   **Desarrollar Funcionalidad de Recuperación de Contraseña:** Crear un flujo seguro para que los usuarios puedan restablecer su contraseña a través de un enlace enviado por correo electrónico, utilizando tokens de un solo uso con tiempo de expiración.
*   **Integrar una Pasarela de Pagos:** Conectar el sistema con una pasarela de pagos reconocida (e.g., **Stripe, PayPal, Mercado Pago**) para automatizar el procesamiento de transacciones con tarjeta de crédito/débito y ampliar las capacidades de comercio electrónico.
*   **Construir un Dashboard de Analíticas:** Desarrollar nuevos endpoints que agreguen y resuman datos de ventas, productos populares y comportamiento de clientes. Esta información es vital para la toma de decisiones de negocio y puede alimentar un panel de control para los administradores.
*   **Implementar Notificaciones en Tiempo Real:** Utilizar **WebSockets** (e.g., con Socket.IO) para notificar al frontend de eventos importantes en tiempo real, como la recepción de una nueva venta o una actualización crítica de inventario.
