---
id: project-overview
title: Visión general del proyecto
---

Esta sección describe la estructura global del proyecto **Fitness App** y cómo se organiza el código.

## Estructura de carpetas principal

- `fitness-app-backend/`: API REST construida con **Express** y **Drizzle ORM**.
  - `index.js`: punto de entrada del servidor Express.
  - `db/`: configuración de base de datos, migraciones y esquema (`schema.js`).
  - `routes/`: rutas agrupadas por dominio (auth, exercises, workouts, foods, admin, coach, client, etc.).
  - `middleware/`: middlewares transversales (logging, validación, seguridad, rate limiting, etc.).
  - `config/`: validación de variables de entorno, Swagger/OpenAPI, configuración de Drizzle.
  - `utils/`: utilidades compartidas (logger, validadores, helpers).
  - `scripts/`: scripts de mantenimiento, poblamiento de datos, verificación de estructura, etc.

- `fitness-app-frontend/`: SPA construida con **React + Vite**.
  - `src/App.jsx`: composición principal de la aplicación.
  - `src/main.jsx`: punto de entrada de React.
  - `src/pages/`: páginas de alto nivel (Dashboard, Login, Onboarding, Diet, Calendar, etc.).
  - `src/components/`: componentes reutilizables (navbar, formularios, tarjetas, gráficos).
  - `src/contexts/`: contextos globales (autenticación, tema, marca).
  - `src/stores/`: stores de estado (Zustand) para usuario, objetivos, notificaciones, etc.
  - `src/hooks/`: hooks reutilizables (llamadas a API con caché, accesibilidad, etc.).
  - `src/utils/`: utilidades (validaciones, formateadores, helpers de red, SEO).

- `docker-compose.yml` / `docker-compose.prod.yml`: orquestación de servicios (backend, frontend, PostgreSQL).

## Flujo funcional principal

1. Un usuario se registra o inicia sesión desde el frontend.
2. El frontend envía peticiones HTTP al backend (prefijo `/api`).
3. El backend valida, autentica y ejecuta lógica de negocio usando **Drizzle** para hablar con PostgreSQL.
4. Los datos se almacenan en tablas como `users`, `daily_logs`, `exercises`, `foods`, `routines`, etc.
5. El frontend muestra dashboards de salud, rutinas, dieta, logros, notificaciones y herramientas para coaches y clientes.

En las siguientes secciones se documentan en detalle:

- El backend (rutas, middlewares, flujo de autenticación).
- El frontend (páginas, componentes, stores y hooks).
- La base de datos (todas las tablas, campos, claves y relaciones).
- La API (endpoints por dominio funcional).
- El despliegue con Docker y Render.


