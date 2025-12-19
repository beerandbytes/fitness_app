---
id: overview
title: API overview
---

The API follows a REST-style and exposes endpoints under the `/api` prefix. Most routes require authentication via JWT.

## Authentication

- Prefix: `/api/auth`
- Functions:
  - Registration, login, refresh token.
  - Password recovery and reset.
  - Automatic `ADMIN` role assignment based on `ADMIN_EMAILS`.

## Main domains

- `/api/logs`
  - Daily logging of user metrics (`daily_logs`, `daily_exercises`).

- `/api/foods`, `/api/meal-items`
  - Food catalog and daily intake logging (`foods`, `meal_items`).

- `/api/exercises`, `/api/routines`, `/api/workouts`
  - Exercise catalog, routines and completed workouts.

- `/api/goals`, `/api/checkin`, `/api/calendar`
  - Weight/calorie goals, weekly check-ins and scheduled routines.

- `/api/admin`, `/api/coach`, `/api/client`, `/api/templates`, `/api/invite`
  - Admin/coach mode:
    - User management.
    - Routine/diet templates.
    - Invitations and client assignments.

- `/api/notifications`, `/api/achievements`, `/api/messages`
  - Notifications, achievements and messaging system.

- `/api/brand`
  - Brand configuration (name, logo, social media).

- `/api/health`
  - Service and database health check.

Subsequent documents detail each endpoint group.


