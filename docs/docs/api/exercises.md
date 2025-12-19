---
id: exercises
title: API de ejercicios y rutinas
---

## /api/exercises

### GET /api/exercises

Lista ejercicios públicos con paginación.

- **Query params**:
  - `page` (opcional, default 1)
  - `limit` (opcional, default 20)
- **Requiere**: JWT.
- **Comportamiento**:
  - Filtra `exercises` por `is_public = true`.
  - Devuelve objeto:
    - `exercises`: array de ejercicios.
    - `pagination`: `{ page, limit, total, totalPages, hasNext, hasPrev }`.

### GET /api/exercises/search

Búsqueda por nombre (autocompletar).

- **Query params**:
  - `name` (min 2 caracteres).
- **Requiere**: JWT.
- **Respuesta**:
  - `exercises`: ejercicios públicos que coinciden parcialmente (`ilike`).

### GET /api/exercises/by-muscle-group

Busca ejercicios por grupo muscular (lógica basada en palabras clave).

- **Query params**:
  - `group` (`pecho`, `espalda`, `piernas`, `brazos`, `hombros`, etc.).
- **Requiere**: JWT.

### POST /api/exercises

Crea un ejercicio público.

- **Body JSON**:
  - `name` (requerido)
  - `category` (requerido)
  - `default_calories_per_minute` (opcional, default 5)
  - `gif_url` (opcional)
- **Requiere**: JWT.

---

## /api/routines

Gestiona rutinas del usuario (tabla `routines` y `routine_exercises`).

Ejemplos típicos (la implementación exacta se detalla en `routes/routines.js`):

- `GET /api/routines`
  - Lista rutinas del usuario autenticado.
- `POST /api/routines`
  - Crea una nueva rutina.
- `PUT /api/routines/:id`
  - Actualiza nombre, descripción o estado.
- `DELETE /api/routines/:id`
  - Elimina/desactiva una rutina.
- Endpoints adicionales para gestionar `routine_exercises` (añadir/editar/eliminar ejercicios en una rutina).

---

## /api/workouts

Registra entrenamientos reales realizados.

- `POST /api/workouts`
  - Crea/actualiza entradas en `daily_exercises` asociadas al `daily_log` del día.
  - Calcula `burned_calories` en base a `default_calories_per_minute` y duración/sets.

- `GET /api/workouts/history`
  - Devuelve historial de entrenamientos del usuario (agregado por día).
