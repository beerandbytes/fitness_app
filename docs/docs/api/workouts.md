---
id: workouts
title: API de entrenamientos y logs diarios
---

Esta sección cubre endpoints relacionados con `daily_logs`, `daily_exercises` y progreso diario.

> La implementación exacta está en los archivos `routes/logs.js` y `routes/workouts.js`.

## /api/logs

### GET /api/logs/today

Obtiene el log diario del usuario autenticado para la fecha actual.

- **Requiere**: JWT.
- **Respuesta**:
  - Datos de la fila en `daily_logs` más agregados de ejercicios/alimentos.

### POST /api/logs

Crea o actualiza el log de un día concreto.

- **Body JSON** típico:
  - `date`
  - `weight`
  - `consumed_calories`
  - `burned_calories`

### Otros endpoints

Dependiendo de la implementación, se incluyen endpoints para:

- Listar logs por rango de fechas.
- Actualizar solo el peso o las calorías.

## /api/workouts

### POST /api/workouts

Registra un entrenamiento realizado.

- **Body JSON** (ejemplo, puede variar):
  - `log_id` o `date` (para asociar al `daily_log` correcto).
  - Detalles de ejercicios realizados (arrays con sets, reps, duración, peso).

- **Efectos**:
  - Inserta o actualiza filas en `daily_exercises`.
  - Recalcula `burned_calories` para el log diario.

### GET /api/workouts/history

Devuelve un resumen de entrenamientos históricos:

- Totales por día, semana o mes.
- Información derivada como calorías quemadas y número de sesiones.
