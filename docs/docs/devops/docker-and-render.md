---
id: docker-and-render
title: Docker y despliegue en Render
---

Esta sección resume cómo ejecutar el proyecto con Docker y cómo desplegarlo en Render.

## Docker local

### Archivos clave

- `docker-compose.yml`
  - Servicios:
    - `postgres`: base de datos PostgreSQL.
    - `backend`: `fitness-app-backend` (modo desarrollo, con volumen del código).
    - `frontend`: `fitness-app-frontend` (build estático servido con Nginx).

- `docker-compose.prod.yml`
  - Versión para producción:
    - `postgres` sin puertos expuestos públicamente.
    - `backend` en modo `NODE_ENV=production`.
    - `frontend` servido en puerto 5173 (desde Nginx).

- `fitness-app-backend/Dockerfile`
  - Imagen de Node 22.
  - Instala dependencias, copia el código y ejecuta `docker-entrypoint.sh`.

- `fitness-app-frontend/Dockerfile`
  - Build multi-stage:
    - Stage 1: build de Vite.
    - Stage 2: Nginx sirviendo `/usr/share/nginx/html`.

### Comandos básicos

```bash
# Desarrollo
docker-compose up --build

# Producción local
docker-compose -f docker-compose.prod.yml up --build
```

## Render (Docker)

### Backend

1. Crear servicio PostgreSQL en Render (plan gratuito).
2. Copiar la **Internal Database URL** y usarla como `DATABASE_URL`.
3. Crear un Web Service para el backend:
   - Root Directory: `fitness-app-backend`
   - Environment: `Docker`
   - Dockerfile Path: `Dockerfile`
4. Variables de entorno:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=<Internal Database URL>
JWT_SECRET=<secreto seguro>
FRONTEND_URL=https://tu-frontend.onrender.com
ADMIN_EMAILS=admin@ejemplo.com,otro@ejemplo.com
```

5. El `docker-entrypoint.sh`:
   - Ejecuta `npm run db:migrate`.
   - Verifica si hay ejercicios públicos; si no, ejecuta `npm run populate:exercises`.

### Frontend

1. Crear Web Service para el frontend:
   - Root Directory: `fitness-app-frontend`
   - Environment: `Docker`
   - Dockerfile Path: `Dockerfile`
2. Configurar variable de entorno para el build:

```env
VITE_API_URL=https://tu-backend.onrender.com/api
```

## Diagnóstico en producción

- Script: `fitness-app-backend/scripts/diagnose-production.js`
  - Verifica:
    - Variables de entorno críticas.
    - Conexión a base de datos.
    - Conteo de ejercicios públicos.
    - Configuración de `ADMIN_EMAILS`.
    - Estructura de tablas.

```bash
cd fitness-app-backend
npm run diagnose
```


