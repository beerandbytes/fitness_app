---
id: admin-and-coach
title: Administration and coach mode API
---

This section summarizes endpoints oriented to administrators and coaches.

## /api/admin

> Implemented in `routes/admin.js`. Requires user with `ADMIN` role.

### User management

- `GET /api/admin/users`
  - Lists users with filters (role, email, etc.).

- `POST /api/admin/users`
  - Creates a user with specific role (`CLIENT`, `COACH`, `ADMIN`).
  - Hashes password before inserting.

- `PUT /api/admin/users/:userId`
  - Updates email, password (optional) and role.

- `DELETE /api/admin/users/:userId`
  - Deactivates or deletes a user (depending on exact implementation).

## /api/coach

> Implemented in `routes/coach.js`. Requires `COACH` or `ADMIN` role.

### Clients and assignments

- `GET /api/coach/clients`
  - Returns list of clients assigned to authenticated coach.

- `GET /api/coach/clients/:id`
  - Client detail: routines, check-ins, progress.

- `POST /api/coach/clients/:id/assign-template`
  - Assigns a `routine_template` or `diet_template` to client (`client_routine_assignments`).

## /api/client

> Implemented in `routes/client.js`. Requires `CLIENT` role.

- `GET /api/client/assignments`
  - Lists routines/diets assigned to client.

- `GET /api/client/dashboard`
  - Returns aggregated data for client dashboard.

## /api/templates

> Implemented in `routes/templates.js`.

- `GET /api/templates/routines`
  - Lists routine templates available for coach.

- `POST /api/templates/routines`
  - Creates a new template (`routine_templates`).

- `GET /api/templates/diets`
  - Lists diet templates (`diet_templates`).

- `POST /api/templates/diets`
  - Creates a new diet template.

## /api/invite

> Implemented in `routes/invite.js`.

- `POST /api/invite`
  - Creates an invitation token (`invite_tokens`) for a specific email.

- `GET /api/invite/validate?token=...`
  - Validates that invitation token is correct, not used and not expired.

