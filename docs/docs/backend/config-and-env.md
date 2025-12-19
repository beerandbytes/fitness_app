---
id: config-and-env
title: Configuración y variables de entorno
---

El backend depende de varias variables de entorno críticas y archivos de configuración.

## Archivos de configuración

- `config/envValidator.js`
  - Verifica que existan:
    - `DATABASE_URL`
    - `JWT_SECRET`
  - Opcionalmente avisa si faltan:
    - `PORT`
    - `FRONTEND_URL`
    - `NODE_ENV`
  - Valida:
    - Longitud de `JWT_SECRET` (recomienda ≥ 32 caracteres).
    - Formato de `DATABASE_URL` (`postgresql://` o `postgres://`).
    - Que `PORT` sea un número válido.

- `db/db_config.js`
  - Carga `DATABASE_URL` desde `process.env`.
  - Crea un `Pool` de `pg` con parámetros configurables:
    - `DB_POOL_MAX`, `DB_POOL_MIN`, `DB_IDLE_TIMEOUT`, `DB_CONNECTION_TIMEOUT`.
  - Crea la instancia `db` de Drizzle y la exporta junto con `pool`.

- `db/migrate.js`
  - Usa `drizzle-orm/node-postgres/migrator` para ejecutar las migraciones SQL de la carpeta `drizzle/`.
  - Fuerza `SET search_path TO public, "$user"`.
  - Maneja errores comunes (tablas/columnas/índices ya existentes) como advertencias.

## Variables de entorno principales

### Críticas

- `DATABASE_URL`
  - Cadena de conexión a PostgreSQL.
  - En Render se debe usar la **Internal Database URL**.

- `JWT_SECRET`
  - Secreto para firmar los JWT de acceso.
  - Recomendado ≥ 32 caracteres.

### Autenticación y seguridad

- `JWT_REFRESH_SECRET` (opcional)
  - Si no se define, se reutiliza `JWT_SECRET`.
- `ADMIN_EMAILS`
  - Lista separada por comas de emails que serán admins automáticamente al registrarse.
  - Ejemplo:
    - `ADMIN_EMAILS=admin@ejemplo.com,coach@ejemplo.com`

### Frontend y CORS

- `FRONTEND_URL`
  - URL del frontend en producción (por ejemplo `https://mi-app.onrender.com`).
- `FRONTEND_BASE_URL`
  - Usado en `auth.js` para construir enlaces (reset password, etc.).

### SMTP (emails)

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
  - Configuración para envío de emails (por ejemplo Gmail o Mailtrap).

### Otros

- `PORT`
  - Puerto en el que escucha el backend (por defecto 4000).
- `NODE_ENV`
  - `development`, `production` o `test`.
- `RECAPTCHA_SECRET_KEY`
  - Clave secreta para verificar reCAPTCHA en registro/login (opcional).
- `DEBUG_ADMIN`
  - Si es `true`, habilita logs detallados en `isAdminEmail`.

## Flujo de carga de configuración

1. `require('dotenv').config()` carga el archivo `.env` (en desarrollo).
2. `envValidator.validateEnvVars()` se ejecuta al inicio en `index.js`.
3. Si falta alguna variable crítica, el proceso termina con error.
4. El resto de módulos (db, rutas, scripts) leen las variables desde `process.env`.
