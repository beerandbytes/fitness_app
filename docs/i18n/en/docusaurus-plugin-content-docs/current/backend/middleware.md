---
id: middleware
title: Backend middlewares
---

The backend uses several middlewares for security, observability and robustness.

## Global middlewares (in `index.js`)

- `requestIdMiddleware` (`middleware/requestId.js`)
  - Assigns a unique identifier to each request (`X-Request-Id`).
  - Facilitates log tracing.

- `responseTimeMiddleware` (`middleware/responseTime.js`)
  - Measures response time for each request.
  - Adds an `X-Response-Time` header.

- `helmet`:
  - Configures security headers (CSP, CORP, etc.).
  - Adjusted to allow Vite in development and Render/Netlify/Vercel domains in production.

- `compression`:
  - Compresses HTTP responses (gzip/brotli).

- `payloadSize` (`middleware/payloadSize.js`)
  - Limits maximum size of JSON bodies (e.g., 1MB).

- `sanitize` (`middleware/sanitize.js`)
  - Sanitizes user input to prevent injections.

- `express.json({ limit: '1mb' })`
  - JSON body parsing with size limit.

- `cors` (dynamically configured)
  - In development allows all origins.
  - In production allows only specific origins (`FRONTEND_URL`, Render, Vercel, Netlify domains, etc.).

## Specific middlewares

### Authentication

- `routes/authMiddleware.js`
  - Verifies JWT token in `Authorization: Bearer <token>` header.
  - If valid, adds `req.user` with `id`, `email`, `role` and `isAdmin`.
  - Used in protected routes (`/api/profile`, `/api/logs`, `/api/exercises`, etc.).

### Rate limiting (`middleware/rateLimiter.js`)

- `authLimiter`
  - Limits registration and login attempts to prevent brute force.
- `passwordResetLimiter`
  - Stricter for password recovery routes.
- `generalLimiter`
  - Applied to public routes like `/` or `/api/invite`.

### Validation (`middleware/validation.js`)

- Uses `express-validator` to:
  - Validate registration/login fields.
  - Validate parameters in admin, exercises, foods routes, etc.
- `handleValidationErrors`
  - Centralizes response when validations fail.

### Error handling (`middleware/errorHandler.js`)

- Final middleware in `index.js`.
- Catches unhandled errors and:
  - Logs details (message, stack, requestId).
  - Returns a standard JSON response with 500 code.

## Order and chaining

1. `requestIdMiddleware` and `responseTimeMiddleware`.
2. Security middlewares (`helmet`, `compression`).
3. `payloadSize`, `sanitize`, `express.json`.
4. `cors`.
5. Specific rate limiting on routes (`authLimiter`, `passwordResetLimiter`, `generalLimiter`).
6. `authenticateToken` for protected routes.
7. Route controllers.
8. Route not found middleware (404).
9. Global `errorHandler`.

