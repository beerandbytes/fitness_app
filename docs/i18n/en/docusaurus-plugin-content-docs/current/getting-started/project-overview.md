---
id: project-overview
title: Project overview
---

This page describes the global structure of the **Fitness App** project and how the code is organized.

## Top-level folders

- `fitness-app-backend/`: REST API built with **Express** and **Drizzle ORM**.
  - `index.js`: Express entry point.
  - `db/`: database config, `schema.js` and migrations.
  - `routes/`: route handlers grouped by domain (auth, exercises, workouts, foods, admin, coach, client, etc.).
  - `middleware/`: cross-cutting middleware (logging, validation, security, rate limiting, etc.).
  - `config/`: env validation, Swagger/OpenAPI, Drizzle config.
  - `utils/`: shared utilities (logger, validators, helpers).
  - `scripts/`: maintenance, seeding and verification scripts.

- `fitness-app-frontend/`: SPA built with **React + Vite**.
  - `src/App.jsx`, `src/main.jsx`: root React components and bootstrapping.
  - `src/pages/`: high-level views (Dashboard, Login, Onboarding, Diet, Calendar, etc.).
  - `src/components/`: reusable UI components (navbar, forms, cards, charts, modals).
  - `src/contexts/`: global contexts (auth, theme, brand).
  - `src/stores/`: Zustand stores for user, goals, daily log, toasts, etc.
  - `src/hooks/`: reusable hooks (API fetching with cache, accessibility, etc.).
  - `src/utils/`: utilities (validation, formatting, SEO, logging).

- Docker files:
  - `docker-compose.yml` / `docker-compose.prod.yml`: orchestrate backend, frontend and PostgreSQL.

## Main functional flow

1. A user registers or logs in from the frontend.
2. The frontend calls the backend API (prefix `/api`) using JWT tokens.
3. The backend validates, authenticates and runs business logic through **Drizzle** and PostgreSQL.
4. Data is stored in tables such as `users`, `daily_logs`, `exercises`, `foods`, `routines`, etc.
5. The frontend renders dashboards for health, training, nutrition, achievements, notifications and coach/client views.

The following sections document in detail:

- Backend architecture, routes and middleware.
- Frontend architecture, components and state management.
- Database schema and relations.
- API grouped by domain.
- Docker and Render deployment.


