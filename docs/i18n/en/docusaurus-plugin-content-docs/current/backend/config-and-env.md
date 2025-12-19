---
id: config-and-env
title: Configuration and environment variables
---

The backend depends on several critical environment variables and configuration files.

## Configuration files

- `config/envValidator.js`
  - Verifies that exist:
    - `DATABASE_URL`
    - `JWT_SECRET`
  - Optionally warns if missing:
    - `PORT`
    - `FRONTEND_URL`
    - `NODE_ENV`
  - Validates:
    - `JWT_SECRET` length (recommends ≥ 32 characters).
    - `DATABASE_URL` format (`postgresql://` or `postgres://`).
    - That `PORT` is a valid number.

- `db/db_config.js`
  - Loads `DATABASE_URL` from `process.env`.
  - Creates a `pg` `Pool` with configurable parameters:
    - `DB_POOL_MAX`, `DB_POOL_MIN`, `DB_IDLE_TIMEOUT`, `DB_CONNECTION_TIMEOUT`.
  - Creates the Drizzle `db` instance and exports it along with `pool`.

- `db/migrate.js`
  - Uses `drizzle-orm/node-postgres/migrator` to execute SQL migrations from the `drizzle/` folder.
  - Forces `SET search_path TO public, "$user"`.
  - Handles common errors (existing tables/columns/indexes) as warnings.

## Main environment variables

### Critical

- `DATABASE_URL`
  - PostgreSQL connection string.
  - In Render, the **Internal Database URL** must be used.

- `JWT_SECRET`
  - Secret for signing JWT access tokens.
  - Recommended ≥ 32 characters.

### Authentication and security

- `JWT_REFRESH_SECRET` (optional)
  - If not defined, `JWT_SECRET` is reused.
- `ADMIN_EMAILS`
  - Comma-separated list of emails that will be admins automatically upon registration.
  - Example:
    - `ADMIN_EMAILS=admin@example.com,coach@example.com`

### Frontend and CORS

- `FRONTEND_URL`
  - Frontend URL in production (e.g., `https://my-app.onrender.com`).
- `FRONTEND_BASE_URL`
  - Used in `auth.js` to build links (reset password, etc.).

### SMTP (emails)

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
  - Configuration for sending emails (e.g., Gmail or Mailtrap).

### Others

- `PORT`
  - Port on which the backend listens (default 4000).
- `NODE_ENV`
  - `development`, `production` or `test`.
- `RECAPTCHA_SECRET_KEY`
  - Secret key to verify reCAPTCHA on registration/login (optional).
- `DEBUG_ADMIN`
  - If `true`, enables detailed logs in `isAdminEmail`.

## Configuration loading flow

1. `require('dotenv').config()` loads the `.env` file (in development).
2. `envValidator.validateEnvVars()` runs at startup in `index.js`.
3. If any critical variable is missing, the process exits with error.
4. The rest of modules (db, routes, scripts) read variables from `process.env`.

