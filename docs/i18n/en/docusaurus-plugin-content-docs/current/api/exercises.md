---
id: exercises
title: Exercises and routines API
---

## /api/exercises

### GET /api/exercises

Lists public exercises with pagination.

- **Query params**:
  - `page` (optional, default 1)
  - `limit` (optional, default 20)
- **Requires**: JWT.
- **Behavior**:
  - Filters `exercises` by `is_public = true`.
  - Returns object:
    - `exercises`: array of exercises.
    - `pagination`: `{ page, limit, total, totalPages, hasNext, hasPrev }`.

### GET /api/exercises/search

Search by name (autocomplete).

- **Query params**:
  - `name` (min 2 characters).
- **Requires**: JWT.
- **Response**:
  - `exercises`: public exercises that partially match (`ilike`).

### GET /api/exercises/by-muscle-group

Searches exercises by muscle group (keyword-based logic).

- **Query params**:
  - `group` (`chest`, `back`, `legs`, `arms`, `shoulders`, etc.).
- **Requires**: JWT.

### POST /api/exercises

Creates a public exercise.

- **JSON Body**:
  - `name` (required)
  - `category` (required)
  - `default_calories_per_minute` (optional, default 5)
  - `gif_url` (optional)
- **Requires**: JWT.

---

## /api/routines

Manages user routines (`routines` and `routine_exercises` tables).

Typical examples (exact implementation detailed in `routes/routines.js`):

- `GET /api/routines`
  - Lists routines of authenticated user.
- `POST /api/routines`
  - Creates a new routine.
- `PUT /api/routines/:id`
  - Updates name, description or status.
- `DELETE /api/routines/:id`
  - Deletes/deactivates a routine.
- Additional endpoints to manage `routine_exercises` (add/edit/delete exercises in a routine).

---

## /api/workouts

Records actual workouts performed.

- `POST /api/workouts`
  - Creates/updates entries in `daily_exercises` associated with the day's `daily_log`.
  - Calculates `burned_calories` based on `default_calories_per_minute` and duration/sets.

- `GET /api/workouts/history`
  - Returns user workout history (aggregated by day).

