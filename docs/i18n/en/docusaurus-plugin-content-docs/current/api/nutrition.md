---
id: nutrition
title: Nutrition and foods API
---

The nutrition API works mainly with the `foods`, `meal_items` and `daily_logs` tables.

## /api/foods

### GET /api/foods

Lists available foods.

- **Requires**: JWT.
- **Response**:
  - Array of foods with:
    - `food_id`
    - `name`
    - `calories_base`
    - `protein_g`, `carbs_g`, `fat_g`

### GET /api/foods/search

Searches foods by name.

- **Query params**:
  - `q` or similar (depending on implementation).

### POST /api/foods

Creates a new food (for admins or coaches, depending on permissions).

## /api/meal-items

### GET /api/meal-items

Lists meal items associated with the day's log or a specific `log_id`.

### POST /api/meal-items

Records a consumed food.

- **JSON Body**:
  - `log_id` (or date to infer log).
  - `food_id`
  - `quantity_grams`
  - `meal_type` (`Breakfast`, `Lunch`, etc.).

### DELETE /api/meal-items/:id

Deletes a meal item from the log.

