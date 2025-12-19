---
id: overview
title: Backend architecture
---

The **Fitness App** backend is built with **Node.js**, **Express** and **Drizzle ORM** on top of **PostgreSQL**.

## Main structure

- `index.js`: Express server entry point.
- `config/`:
  - `envValidator.js`: validates that critical environment variables (e.g., `DATABASE_URL`, `JWT_SECRET`) are defined and correctly formatted.
  - `swagger.js`: OpenAPI/Swagger specification definition.
- `db/`:
  - `db_config.js`: creates the `pg` Pool and the Drizzle `db` instance.
  - `schema.js`: defines all tables (users, daily_logs, foods, exercises, routines, diet_templates, check_ins, messages, etc.).
  - `migrate.js`: runs migrations from the `drizzle/` folder.
- `routes/`: Express routers grouped by functional domain:
  - `auth.js`: registration, login, password recovery, refresh tokens.
  - `logs.js`: daily metrics logging (`daily_logs`, `daily_exercises`).
  - `foods.js` and `mealItems.js`: nutrition and foods.
  - `exercises.js`, `routines.js`, `workouts.js`: exercise catalog and training.
  - `goals.js`, `checkins.js`: weight goals and check-ins.
  - `calendar.js`: scheduled routines.
  - `onboarding.js`: user onboarding flow.
  - `admin.js`, `coach.js`, `client.js`, `templates.js`: coach mode, clients and routine/diet templates.
  - `notifications.js`, `achievements.js`, `messages.js`: notifications, achievements and chat.
  - `health.js`: service health check.
  - `invite.js`: invitation system.
- `middleware/`:
  - `authMiddleware.js` (in `routes/`), `rateLimiter.js`, `validation.js`, `errorHandler.js`, `sanitize.js`, `payloadSize.js`, `requestId.js`, `responseTime.js`.
- `utils/`: logger (`winston`), password validators, recaptcha, etc.
- `scripts/`: database verification scripts, exercise seeding, test user creation, etc.

## Typical request flow

1. The frontend sends an HTTP request to `/api/...` with a JWT token (if the route is protected).
2. Express applies global middlewares:
   - `requestId`, `responseTime`, `helmet`, `compression`, `payloadSize`, `sanitize`, `cors`.
3. For protected routes, `authenticateToken` is used to validate the JWT and attach `req.user`.
4. The corresponding router processes the request, validates the payload (`express-validator`), applies rate limiting and calls Drizzle to access the database.
5. A JSON response is returned with data or structured error messages.

The following documents detail:

- Main routes and controllers (`backend/routes-and-controllers`).
- Middlewares and how they chain (`backend/middleware`).
- Environment configuration and security (`backend/config-and-env`).


