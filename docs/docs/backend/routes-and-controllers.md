---
id: routes-and-controllers
title: Rutas y controladores del backend
---

Esta sección resume las rutas principales de la API y qué hace cada grupo de controladores.

> Nota: Cada archivo en `fitness-app-backend/routes/*.js` define un `router` de Express con prefijo `/api/...`.

## Auth (`routes/auth.js`)

Prefijo: `/api/auth`

- `POST /register`
  - Registra un nuevo usuario.
  - Valida reCAPTCHA (si está configurado).
  - Valida la fortaleza de la contraseña.
  - Si el email está en `ADMIN_EMAILS`, asigna rol `ADMIN`.
  - Soporta registro mediante token de invitación (`inviteTokens`).
  - Devuelve `token` (JWT de acceso), `refreshToken` y datos de usuario.
- `POST /login`
  - Autentica con email y contraseña.
  - Valida reCAPTCHA (si está activo).
  - Genera tokens de acceso y refresh, incluyendo rol y flag `isAdmin`.
- `POST /forgot-password`
  - Genera un token de recuperación y lo guarda en la tabla `users`.
  - Envía un email con enlace de recuperación usando `nodemailer`.
- `POST /reset-password`
  - Verifica token y expiración.
  - Recalcula el `password_hash`.
- `POST /refresh`
  - Valida el refresh token.
  - Genera un nuevo access token y un nuevo refresh token (refresh token rotation).

## Logs y nutrición

### `routes/logs.js` – `/api/logs`

- Gestiona la tabla `daily_logs` (peso diario, calorías consumidas y quemadas).
- Permite crear, actualizar y consultar registros diarios.

### `routes/foods.js` – `/api/foods`

- Catálogo de alimentos (`foods`).
- Endpoints para listar, buscar y poblar alimentos comunes.

### `routes/mealItems.js` – `/api/meal-items`

- Registra los alimentos consumidos (`meal_items`) asociados a `daily_logs`.
- Permite crear, listar y eliminar items de comida por día.

## Ejercicios, rutinas y entrenamientos

### `routes/exercises.js` – `/api/exercises`

- `GET /` – Lista de ejercicios públicos con paginación y caché.
- `GET /search` – Búsqueda por nombre (autocompletar).
- `GET /by-muscle-group` – Ejercicios filtrados por grupo muscular.
- `POST /` – Crea un ejercicio (marcado como `is_public = true`).

### `routes/routines.js` – `/api/routines`

- Gestión de rutinas (`routines`, `routine_exercises`):
  - Crear rutinas para un usuario.
  - Añadir/editar ejercicios dentro de una rutina.
  - Activar/desactivar rutinas.

### `routes/workouts.js` – `/api/workouts`

- Registra entrenamientos realizados en el día (`daily_exercises`).
- Calcula calorías quemadas basadas en `default_calories_per_minute`.

## Objetivos, calendario y check-ins

### `routes/goals.js` – `/api/goals`

- CRUD sobre objetivos del usuario (`user_goals`).
- Guarda peso objetivo, peso actual y meta de calorías.

### `routes/calendar.js` – `/api/calendar`

- Gestiona `scheduled_routines` (rutinas planificadas por fecha).
- Permite marcar rutinas como completadas.

### `routes/checkins.js` – `/api/checkin`

- Maneja la tabla `check_ins`.
- Guarda peso semanal, estado anímico y fotos (`photo_front`, `photo_side`, `photo_back`).

## Onboarding y modo coach

### `routes/onboarding.js` – `/api/onboarding`

- Flujo de onboarding del usuario:
  - Datos iniciales (edad, altura, peso).
  - Preferencias de entrenamiento y objetivos.

### `routes/admin.js` – `/api/admin`

- Endpoints solo para administradores:
  - Gestión de usuarios (listar, crear, actualizar roles).
  - Acceso a datos agregados.

### `routes/coach.js` – `/api/coach`

- Funciones para entrenadores:
  - Ver lista de clientes.
  - Asignar plantillas de rutinas (`routine_templates`) y dietas (`diet_templates`).
  - Revisar check-ins y progreso.

### `routes/client.js` – `/api/client`

- Endpoints orientados al cliente final:
  - Ver rutinas activas y plantillas asignadas.
  - Consultar progreso y métricas personales.

### `routes/templates.js` – `/api/templates`

- Gestiona plantillas de rutinas (`routine_templates`) y dietas (`diet_templates`).

### `routes/invite.js` – `/api/invite`

- Crea y valida tokens de invitación (`invite_tokens`) para conectar clientes con coaches.

## Notificaciones, logros y chat

### `routes/notifications.js` – `/api/notifications`

- CRUD sobre notificaciones (`notifications`), marcarlas como leídas, etc.

### `routes/achievements.js` – `/api/achievements`

- Gestión de logros (`achievements`, `user_achievements`).
- Cálculo y asignación de logros según condiciones de la tabla.

### `routes/messages.js` – `/api/messages`

- Chat entre usuarios (`messages`).
- Envío y lectura de mensajes entre coach y cliente.

## Health check y branding

### `routes/health.js` – `/api/health`

- Endpoints de health check:
  - Estado de la base de datos.
  - Versión del backend.

### `routes/brand.js` – `/api/brand`

- Gestiona `brand_settings`:
  - Nombre de marca.
  - Redes sociales.
  - Logo y enlaces públicos.
