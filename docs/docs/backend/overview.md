---
id: overview
title: Arquitectura del backend
---

El backend de **Fitness App** está construido con **Node.js**, **Express** y **Drizzle ORM** sobre **PostgreSQL**.

## Estructura principal

- `index.js`: punto de entrada del servidor Express.
- `config/`:
  - `envValidator.js`: valida que las variables de entorno críticas (por ejemplo `DATABASE_URL`, `JWT_SECRET`) estén definidas y con formato correcto.
  - `swagger.js`: definición de la especificación OpenAPI/Swagger.
- `db/`:
  - `db_config.js`: crea el `Pool` de `pg` y la instancia `db` de Drizzle.
  - `schema.js`: define todas las tablas (users, daily_logs, foods, exercises, routines, diet_templates, check_ins, messages, etc.).
  - `migrate.js`: ejecuta migraciones desde la carpeta `drizzle/`.
- `routes/`: routers de Express agrupados por dominio funcional:
  - `auth.js`: registro, login, recuperación de contraseña, refresh tokens.
  - `logs.js`: registro diario de métricas (`daily_logs`, `daily_exercises`).
  - `foods.js` y `mealItems.js`: nutrición y alimentos.
  - `exercises.js`, `routines.js`, `workouts.js`: catálogo de ejercicios y entrenamiento.
  - `goals.js`, `checkins.js`: objetivos de peso y check-ins.
  - `calendar.js`: rutinas programadas.
  - `onboarding.js`: flujo de onboarding del usuario.
  - `admin.js`, `coach.js`, `client.js`, `templates.js`: modo coach, clientes y plantillas de rutinas/dietas.
  - `notifications.js`, `achievements.js`, `messages.js`: notificaciones, logros y chat.
  - `health.js`: health check del servicio.
  - `invite.js`: sistema de invitaciones.
- `middleware/`:
  - `authMiddleware.js` (en `routes/`), `rateLimiter.js`, `validation.js`, `errorHandler.js`, `sanitize.js`, `payloadSize.js`, `requestId.js`, `responseTime.js`.
- `utils/`: logger (`winston`), validadores de contraseñas, recaptcha, etc.
- `scripts/`: scripts de verificación de base de datos, poblamiento de ejercicios, creación de usuarios de prueba, etc.

## Flujo de petición típico

1. El frontend envía una petición HTTP a `/api/...` con un token JWT (si la ruta está protegida).
2. Express aplica middlewares globales:
   - `requestId`, `responseTime`, `helmet`, `compression`, `payloadSize`, `sanitize`, `cors`.
3. Para rutas protegidas, se usa `authenticateToken` para validar el JWT y adjuntar `req.user`.
4. El router correspondiente procesa la petición, valida el payload (`express-validator`), aplica rate limiting y llama a Drizzle para acceder a la base de datos.
5. Se devuelve una respuesta JSON con datos o mensajes de error estructurados.

En los documentos siguientes se detallan:

- Las rutas y controladores principales (`backend/routes-and-controllers`).
- Los middlewares y cómo se encadenan (`backend/middleware`).
- La configuración de entorno y seguridad (`backend/config-and-env`).
