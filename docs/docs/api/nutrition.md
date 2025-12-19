---
id: nutrition
title: API de nutrición y alimentos
---

La API de nutrición trabaja principalmente con las tablas `foods`, `meal_items` y `daily_logs`.

## /api/foods

### GET /api/foods

Lista alimentos disponibles.

- **Requiere**: JWT.
- **Respuesta**:
  - Array de alimentos con:
    - `food_id`
    - `name`
    - `calories_base`
    - `protein_g`, `carbs_g`, `fat_g`

### GET /api/foods/search

Busca alimentos por nombre.

- **Query params**:
  - `q` o similar (según implementación).

### POST /api/foods

Crea un nuevo alimento (para admins o coaches, según permisos).

## /api/meal-items

### GET /api/meal-items

Lista items de comida asociados al log del día o a un `log_id` concreto.

### POST /api/meal-items

Registra un alimento consumido.

- **Body JSON**:
  - `log_id` (o fecha para inferir log).
  - `food_id`
  - `quantity_grams`
  - `meal_type` (`Desayuno`, `Almuerzo`, etc.).

### DELETE /api/meal-items/:id

Elimina un item de comida del log.
