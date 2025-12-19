---
id: auth
title: Authentication API
---

Prefix: `/api/auth`

## POST /api/auth/register

Registers a new user.

- **JSON Body**:
  - `email` (string, required)
  - `password` (string, required)
  - `recaptchaToken` (string, optional depending on config)
  - `invitationToken` (string, optional)

- **Flow**:
  1. Verifies reCAPTCHA if `RECAPTCHA_SECRET_KEY` is configured.
  2. Validates password (minimum strength).
  3. Checks that email doesn't exist in `users`.
  4. If `invitationToken` is present, validates:
     - That it exists in `invite_tokens`.
     - That it's not used.
     - That it hasn't expired.
     - That the email matches.
  5. Determines role:
     - If email is in `ADMIN_EMAILS` → `ADMIN`.
     - If from invitation → `CLIENT`.
  6. Creates user with encrypted password.
  7. Generates `token` (JWT access token) and `refreshToken`.

- **201 Response**:
  - `message`
  - `token`
  - `refreshToken`
  - `user`:
    - `id`, `email`, `role`, `isAdmin`

## POST /api/auth/login

Logs in.

- **JSON Body**:
  - `email`
  - `password`
  - `recaptchaToken` (optional)

- **Flow**:
  1. Validates fields and reCAPTCHA.
  2. Searches user by email.
  3. Compares password hash.
  4. Calculates `isAdmin` using `ADMIN_EMAILS` and `user.role`.
  5. Generates tokens.

- **200 Response**:
  - Same format as `/register`.

## POST /api/auth/forgot-password

Initiates password recovery process.

- **JSON Body**:
  - `email`

- **Flow**:
  1. If user exists, generates `reset_password_token` and `reset_password_expires`.
  2. Sends email with recovery link (`FRONTEND_BASE_URL`).
  3. Always responds 200 (to avoid filtering email existence).

## POST /api/auth/reset-password

Completes password change.

- **JSON Body**:
  - `email`
  - `token`
  - `newPassword`

- **Flow**:
  1. Validates new password strength.
  2. Searches user and compares token/expiration.
  3. Updates `password_hash` and clears reset fields.

## POST /api/auth/refresh

Rotates refresh token and generates a new access token.

- **JSON Body**:
  - `refreshToken`

- **Flow**:
  1. Verifies refresh token with `JWT_REFRESH_SECRET` (or `JWT_SECRET`).
  2. Searches user by `id`.
  3. Recalculates `isAdmin` and `role`.
  4. Generates:
     - `token` (new access token, ~1h)
     - `refreshToken` (new, ~30 days)

