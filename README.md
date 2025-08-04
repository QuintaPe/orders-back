# Bar QR Backend - Sistema de Usuarios para Camareros

Este es el backend para un sistema de pedidos de bar con QR codes que incluye un sistema de autenticación para camareros.

## Características

- **Sistema de Autenticación**: Registro y login de usuarios con JWT
- **Roles de Usuario**: 
  - `waiter`: Camareros que pueden ver y actualizar pedidos
  - `manager`: Gerentes con acceso completo
  - `admin`: Administradores del sistema
- **Gestión de Pedidos**: Los camareros pueden ver todos los pedidos y actualizar su estado
- **API RESTful**: Endpoints bien estructurados y documentados

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Inicializar la base de datos:
```bash
npm run init-db
```

3. Iniciar el servidor:
```bash
npm start
```

## Usuarios de Prueba

El script de inicialización crea los siguientes usuarios con contraseña `password123`:

- **admin** - Administrador del sistema
- **waiter1** - Juan Pérez (Camarero)
- **waiter2** - María García (Camarero)
- **manager** - Carlos López (Gerente)

## API Endpoints

### Autenticación

#### POST /api/users/register
Registrar un nuevo usuario
```json
{
  "username": "nuevo_usuario",
  "password": "contraseña123",
  "name": "Nombre Completo",
  "role": "waiter"
}
```

#### POST /api/users/login
Iniciar sesión
```json
{
  "username": "waiter1",
  "password": "password123"
}
```

#### GET /api/users/profile
Obtener perfil del usuario autenticado
```
Headers: Authorization: Bearer <token>
```

### Pedidos (Protegido - Requiere autenticación)

#### GET /api/orders
Obtener todos los pedidos (solo camareros, managers y admins)
```
Headers: Authorization: Bearer <token>
```

#### PATCH /api/orders/:orderId/status
Actualizar estado de un pedido
```
Headers: Authorization: Bearer <token>
Body: { "status": "ready" }
```

Estados válidos: `pending`, `preparing`, `ready`, `delivered`, `cancelled`

### Crear Pedidos (Público)

#### POST /api/orders
Crear un nuevo pedido (desde QR codes)
```json
{
  "table_number": "5",
  "products": [
    {
      "id": "1",
      "name": "Estrella Galicia",
      "price": 2.5,
      "quantity": 2
    }
  ]
}
```

## Flujo de Trabajo para Camareros

1. **Login**: El camarero inicia sesión con su usuario y contraseña
2. **Ver Pedidos**: Obtiene la lista de todos los pedidos pendientes
3. **Actualizar Estado**: Cambia el estado de los pedidos según el progreso
   - `pending` → `preparing` → `ready` → `delivered`

## Seguridad

- Contraseñas encriptadas con bcrypt
- Tokens JWT para autenticación
- Validación de roles para acceso a endpoints
- Middleware de validación para datos de entrada

## Variables de Entorno

Crear un archivo `.env` con:
```
JWT_SECRET=tu_clave_secreta_muy_segura
DATABASE_URL=file:barqr.db
PORT=3000
```

## Estructura del Proyecto

```
src/
├── controllers/
│   ├── userController.js    # Lógica de usuarios
│   ├── orderController.js   # Lógica de pedidos (con WebSocket)
│   ├── categoryController.js # Lógica de categorías
│   └── productController.js  # Lógica de productos
├── middleware/
│   ├── auth.js             # Autenticación con cookies
│   ├── roleMiddleware.js   # Middleware de roles
│   ├── validation.js       # Validación de datos
│   └── errorHandler.js     # Manejo de errores
├── routes/
│   ├── userRoutes.js       # Rutas de autenticación
│   ├── adminRoutes.js      # Rutas de administradores
│   ├── waiterRoutes.js     # Rutas de camareros
│   ├── orderRoutes.js      # Rutas públicas de pedidos
│   ├── categoryRoutes.js   # Rutas públicas de categorías
│   └── productRoutes.js    # Rutas públicas de productos
├── websocket.js            # Configuración de WebSocket
└── server.js               # Servidor principal (HTTP + WebSocket)
```

## Archivos de Prueba y Documentación

- `websocket-test.html` - Página de prueba para WebSocket
- `WEBSOCKET_DOCS.md` - Documentación completa del WebSocket 