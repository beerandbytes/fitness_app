---
id: workouts
title: Workouts and daily logs API
---

This section covers endpoints related to `daily_logs`, `daily_exercises` and daily progress.

> Exact implementation is in `routes/logs.js` and `routes/workouts.js` files.

## /api/logs

### GET /api/logs/today

Gets the daily log of the authenticated user for the current date.

- **Requires**: JWT.
- **Response**:
  - Data from the row in `daily_logs` plus aggregated exercises/foods.

### POST /api/logs

Creates or updates the log for a specific day.

- Typical **JSON Body**:
  - `date`
  - `weight`
  - `consumed_calories`
  - `burned_calories`

### Other endpoints

Depending on implementation, includes endpoints for:

- Listing logs by date range.
- Updating only weight or calories.

## /api/workouts

### POST /api/workouts

Records a completed workout.

- **JSON Body** (example, may vary):
  - `log_id` or `date` (to associate with correct `daily_log`).
  - Details of exercises performed (arrays with sets, reps, duration, weight).

- **Effects**:
  - Inserts or updates rows in `daily_exercises`.
  - Recalculates `burned_calories` for the daily log.

### GET /api/workouts/history

Returns a summary of historical workouts:

- Totals by day, week or month.
- Derived information like burned calories and number of sessions.

