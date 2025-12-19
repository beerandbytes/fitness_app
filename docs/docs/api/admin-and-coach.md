---
id: admin-and-coach
title: API de administración y modo coach
---

Esta sección resume endpoints orientados a administradores y entrenadores.

## /api/admin

> Implementado en `routes/admin.js`. Requiere usuario con rol `ADMIN`.

### Gestión de usuarios

- `GET /api/admin/users`
  - Lista usuarios con filtros (rol, email, etc.).

- `POST /api/admin/users`
  - Crea un usuario con rol específico (`CLIENT`, `COACH`, `ADMIN`).
  - Hashea la contraseña antes de insertarla.

- `PUT /api/admin/users/:userId`
  - Actualiza email, contraseña (opcional) y rol.

- `DELETE /api/admin/users/:userId`
  - Desactiva o elimina un usuario (según implementación exacta).

## /api/coach

> Implementado en `routes/coach.js`. Requiere rol `COACH` o `ADMIN`.

### Clientes y asignaciones

- `GET /api/coach/clients`
  - Devuelve la lista de clientes asignados al coach autenticado.

- `GET /api/coach/clients/:id`
  - Detalle del cliente: rutinas, check-ins, progreso.

- `POST /api/coach/clients/:id/assign-template`
  - Asigna una `routine_template` o `diet_template` al cliente (`client_routine_assignments`).

## /api/client

> Implementado en `routes/client.js`. Requiere rol `CLIENT`.

- `GET /api/client/assignments`
  - Lista rutinas/dietas asignadas al cliente.

- `GET /api/client/dashboard`
  - Devuelve datos agregados para el dashboard del cliente.

## /api/templates

> Implementado en `routes/templates.js`.

- `GET /api/templates/routines`
  - Lista plantillas de rutina disponibles para el coach.

- `POST /api/templates/routines`
  - Crea una nueva plantilla (`routine_templates`).

- `GET /api/templates/diets`
  - Lista plantillas de dieta (`diet_templates`).

- `POST /api/templates/diets`
  - Crea una nueva plantilla de dieta.

## /api/invite

> Implementado en `routes/invite.js`.

- `POST /api/invite`
  - Crea un token de invitación (`invite_tokens`) para un email específico.

- `GET /api/invite/validate?token=...`
  - Valida que el token de invitación sea correcto, no usado y no expirado.
