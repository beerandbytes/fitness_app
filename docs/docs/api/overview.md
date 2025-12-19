---
id: overview
title: Visión general de la API
---

La API sigue un estilo REST y expone endpoints bajo el prefijo `/api`. La mayoría de las rutas requieren autenticación mediante JWT.

## Autenticación

- Prefijo: `/api/auth`
- Funciones:
  - Registro, login, refresh token.
  - Recuperación y restablecimiento de contraseña.
  - Asignación automática de rol `ADMIN` según `ADMIN_EMAILS`.

## Dominios principales

- `/api/logs`
  - Registro diario de métricas de usuario (`daily_logs`, `daily_exercises`).

- `/api/foods`, `/api/meal-items`
  - Catálogo de alimentos y registro de ingesta diaria (`foods`, `meal_items`).

- `/api/exercises`, `/api/routines`, `/api/workouts`
  - Catálogo de ejercicios, rutinas y entrenamientos completados.

- `/api/goals`, `/api/checkin`, `/api/calendar`
  - Objetivos de peso/calorías, check-ins semanales y rutinas programadas.

- `/api/admin`, `/api/coach`, `/api/client`, `/api/templates`, `/api/invite`
  - Modo admin/coach:
    - Gestión de usuarios.
    - Plantillas de rutinas/dietas.
    - Invitaciones y asignación de clientes.

- `/api/notifications`, `/api/achievements`, `/api/messages`
  - Notificaciones, logros y sistema de mensajería.

- `/api/brand`
  - Configuración de marca (nombre, logo, redes sociales).

- `/api/health`
  - Health check del servicio y de la base de datos.

En documentos posteriores se detalla cada grupo de endpoints.
