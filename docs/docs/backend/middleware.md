---
id: middleware
title: Middlewares del backend
---

El backend utiliza varios middlewares para seguridad, observabilidad y robustez.

## Middlewares globales (en `index.js`)

- `requestIdMiddleware` (`middleware/requestId.js`)
  - Asigna un identificador único a cada petición (`X-Request-Id`).
  - Facilita el trazado de logs.

- `responseTimeMiddleware` (`middleware/responseTime.js`)
  - Mide el tiempo de respuesta de cada petición.
  - Añade una cabecera `X-Response-Time`.

- `helmet`:
  - Configura cabeceras de seguridad (CSP, CORP, etc.).
  - Ajustado para permitir Vite en desarrollo y dominios de Render/Netlify/Vercel en producción.

- `compression`:
  - Comprime las respuestas HTTP (gzip/brotli).

- `payloadSize` (`middleware/payloadSize.js`)
  - Limita el tamaño máximo de los cuerpos JSON (por ejemplo 1MB).

- `sanitize` (`middleware/sanitize.js`)
  - Sanitiza la entrada del usuario para evitar inyecciones.

- `express.json({ limit: '1mb' })`
  - Parseo del cuerpo JSON con límite de tamaño.

- `cors` (configurado dinámicamente)
  - En desarrollo permite todos los orígenes.
  - En producción permite solo orígenes específicos (`FRONTEND_URL`, dominios de Render, Vercel, Netlify, etc.).

## Middlewares específicos

### Autenticación

- `routes/authMiddleware.js`
  - Verifica el token JWT en la cabecera `Authorization: Bearer <token>`.
  - Si es válido, añade `req.user` con `id`, `email`, `role` e `isAdmin`.
  - Se usa en rutas protegidas (`/api/profile`, `/api/logs`, `/api/exercises`, etc.).

### Rate limiting (`middleware/rateLimiter.js`)

- `authLimiter`
  - Limita intentos de registro y login para evitar fuerza bruta.
- `passwordResetLimiter`
  - Más estricto para rutas de recuperación de contraseña.
- `generalLimiter`
  - Se aplica a rutas públicas como `/` o `/api/invite`.

### Validación (`middleware/validation.js`)

- Usa `express-validator` para:
  - Validar campos de registro/login.
  - Validar parámetros en rutas de admin, ejercicios, alimentos, etc.
- `handleValidationErrors`
  - Centraliza la respuesta cuando fallan las validaciones.

### Manejo de errores (`middleware/errorHandler.js`)

- Middleware final en `index.js`.
- Captura errores no manejados y:
  - Loguea detalles (mensaje, stack, requestId).
  - Devuelve una respuesta JSON estándar con código 500.

## Orden y encadenamiento

1. `requestIdMiddleware` y `responseTimeMiddleware`.
2. Middlewares de seguridad (`helmet`, `compression`).
3. `payloadSize`, `sanitize`, `express.json`.
4. `cors`.
5. Rate limiting específico en rutas (`authLimiter`, `passwordResetLimiter`, `generalLimiter`).
6. `authenticateToken` para rutas protegidas.
7. Controladores de ruta.
8. Middleware de ruta no encontrada (404).
9. `errorHandler` global.
