---
id: routes-and-controllers
title: Backend routes and controllers
---

This section summarizes the main API routes and what each controller group does.

> Note: Each file in `fitness-app-backend/routes/*.js` defines an Express `router` with prefix `/api/...`.

## Auth (`routes/auth.js`)

Prefix: `/api/auth`

- `POST /register`
  - Registers a new user.
  - Validates reCAPTCHA (if configured).
  - Validates password strength.
  - If email is in `ADMIN_EMAILS`, assigns `ADMIN` role.
  - Supports registration via invitation token (`inviteTokens`).
  - Returns `token` (JWT access token), `refreshToken` and user data.
- `POST /login`
  - Authenticates with email and password.
  - Validates reCAPTCHA (if active).
  - Generates access and refresh tokens, including role and `isAdmin` flag.
- `POST /forgot-password`
  - Generates a recovery token and saves it in the `users` table.
  - Sends an email with recovery link using `nodemailer`.
- `POST /reset-password`
  - Verifies token and expiration.
  - Recalculates `password_hash`.
- `POST /refresh`
  - Validates refresh token.
  - Generates a new access token and a new refresh token (refresh token rotation).

## Logs and nutrition

### `routes/logs.js` – `/api/logs`

- Manages the `daily_logs` table (daily weight, consumed and burned calories).
- Allows creating, updating and querying daily logs.

### `routes/foods.js` – `/api/foods`

- Food catalog (`foods`).
- Endpoints to list, search and populate common foods.

### `routes/mealItems.js` – `/api/meal-items`

- Records consumed foods (`meal_items`) associated with `daily_logs`.
- Allows creating, listing and deleting meal items per day.

## Exercises, routines and workouts

### `routes/exercises.js` – `/api/exercises`

- `GET /` – List of public exercises with pagination and cache.
- `GET /search` – Search by name (autocomplete).
- `GET /by-muscle-group` – Exercises filtered by muscle group.
- `POST /` – Creates an exercise (marked as `is_public = true`).

### `routes/routines.js` – `/api/routines`

- Routine management (`routines`, `routine_exercises`):
  - Create routines for a user.
  - Add/edit exercises within a routine.
  - Activate/deactivate routines.

### `routes/workouts.js` – `/api/workouts`

- Records workouts completed during the day (`daily_exercises`).
- Calculates burned calories based on `default_calories_per_minute`.

## Goals, calendar and check-ins

### `routes/goals.js` – `/api/goals`

- CRUD on user goals (`user_goals`).
- Saves target weight, current weight and calorie goal.

### `routes/calendar.js` – `/api/calendar`

- Manages `scheduled_routines` (routines scheduled by date).
- Allows marking routines as completed.

### `routes/checkins.js` – `/api/checkin`

- Handles the `check_ins` table.
- Saves weekly weight, mood and photos (`photo_front`, `photo_side`, `photo_back`).

## Onboarding and coach mode

### `routes/onboarding.js` – `/api/onboarding`

- User onboarding flow:
  - Initial data (age, height, weight).
  - Training preferences and goals.

### `routes/admin.js` – `/api/admin`

- Endpoints for administrators only:
  - User management (list, create, update roles).
  - Access to aggregated data.

### `routes/coach.js` – `/api/coach`

- Functions for coaches:
  - View client list.
  - Assign routine templates (`routine_templates`) and diet templates (`diet_templates`).
  - Review check-ins and progress.

### `routes/client.js` – `/api/client`

- Endpoints for end clients:
  - View active routines and assigned templates.
  - Query progress and personal metrics.

### `routes/templates.js` – `/api/templates`

- Manages routine templates (`routine_templates`) and diet templates (`diet_templates`).

### `routes/invite.js` – `/api/invite`

- Creates and validates invitation tokens (`invite_tokens`) to connect clients with coaches.

## Notifications, achievements and chat

### `routes/notifications.js` – `/api/notifications`

- CRUD on notifications (`notifications`), mark as read, etc.

### `routes/achievements.js` – `/api/achievements`

- Achievement management (`achievements`, `user_achievements`).
- Calculation and assignment of achievements based on table conditions.

### `routes/messages.js` – `/api/messages`

- Chat between users (`messages`).
- Sending and reading messages between coach and client.

## Health check and branding

### `routes/health.js` – `/api/health`

- Health check endpoints:
  - Database status.
  - Backend version.

### `routes/brand.js` – `/api/brand`

- Manages `brand_settings`:
  - Brand name.
  - Social media.
  - Logo and public links.

