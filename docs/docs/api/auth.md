---
id: auth
title: API de autenticación
---

Prefijo: `/api/auth`

## POST /api/auth/register

Registra un nuevo usuario.

- **Body JSON**:
  - `email` (string, requerido)
  - `password` (string, requerido)
  - `recaptchaToken` (string, opcional según config)
  - `invitationToken` (string, opcional)

- **Flujo**:
  1. Verifica reCAPTCHA si `RECAPTCHA_SECRET_KEY` está configurada.
  2. Valida la contraseña (fortaleza mínima).
  3. Comprueba que el email no exista en `users`.
  4. Si `invitationToken` está presente, valida:
     - Que exista en `invite_tokens`.
     - Que no esté usado.
     - Que no haya expirado.
     - Que el email coincida.
  5. Determina rol:
     - Si el email está en `ADMIN_EMAILS` → `ADMIN`.
     - Si viene de invitación → `CLIENT`.
  6. Crea el usuario con contraseña encriptada.
  7. Genera `token` (JWT de acceso) y `refreshToken`.

- **Respuesta 201**:
  - `message`
  - `token`
  - `refreshToken`
  - `user`:
    - `id`, `email`, `role`, `isAdmin`

## POST /api/auth/login

Inicia sesión.

- **Body JSON**:
  - `email`
  - `password`
  - `recaptchaToken` (opcional)

- **Flujo**:
  1. Valida campos y reCAPTCHA.
  2. Busca usuario por email.
  3. Compara hash de contraseña.
  4. Calcula `isAdmin` usando `ADMIN_EMAILS` y `user.role`.
  5. Genera tokens.

- **Respuesta 200**:
  - Igual formato que `/register`.

## POST /api/auth/forgot-password

Inicia el proceso de recuperación de contraseña.

- **Body JSON**:
  - `email`

- **Flujo**:
  1. Si el usuario existe, genera `reset_password_token` y `reset_password_expires`.
  2. Envía un email con enlace de recuperación (`FRONTEND_BASE_URL`).
  3. Siempre responde 200 (para no filtrar existencia del email).

## POST /api/auth/reset-password

Completa el cambio de contraseña.

- **Body JSON**:
  - `email`
  - `token`
  - `newPassword`

- **Flujo**:
  1. Valida fortaleza de la nueva contraseña.
  2. Busca usuario y compara token/expiración.
  3. Actualiza `password_hash` y limpia campos de reset.

## POST /api/auth/refresh

Rota el refresh token y genera un nuevo access token.

- **Body JSON**:
  - `refreshToken`

- **Flujo**:
  1. Verifica el refresh token con `JWT_REFRESH_SECRET` (o `JWT_SECRET`).
  2. Busca el usuario por `id`.
  3. Recalcula `isAdmin` y `role`.
  4. Genera:
     - `token` (nuevo access token, ~1h)
     - `refreshToken` (nuevo, ~30 días)
