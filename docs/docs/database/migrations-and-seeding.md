---
id: migrations-and-seeding
title: Migraciones y poblamiento de datos
---

El backend utiliza **Drizzle ORM** con migraciones SQL para crear y evolucionar el esquema de la base de datos.

## Migraciones

- Carpeta: `fitness-app-backend/drizzle/`
  - Contiene archivos `.sql` generados por `drizzle-kit`.
  - Cada archivo representa un cambio de esquema (creación de tablas, índices, columnas, etc.).

- Script de migración:
  - Definido en `fitness-app-backend/package.json`:
    - `db:migrate`: ejecuta `node ./db/migrate.js`.
  - `db/migrate.js`:
    - Conecta a `DATABASE_URL`.
    - Llama a `migrate(db, { migrationsFolder: "./drizzle" })`.
    - Maneja errores comunes de “ya existe” como advertencias.

### Ejecución local

```bash
cd fitness-app-backend
DATABASE_URL=postgresql://user:pass@localhost:5432/fitnessdb npm run db:migrate
```

### Ejecución en producción (Docker / Render)

- En Docker:
  - `docker-entrypoint.sh` ejecuta automáticamente:
    - `npm run db:migrate` al iniciar el contenedor.

- En Render:
  - Puedes ejecutar `npm run db:migrate` desde el Shell del servicio backend.

## Poblamiento de ejercicios

- Script: `scripts/seed-exercises.js`
  - Inserta un conjunto pequeño de ejercicios de ejemplo (públicos).

- Script: `scripts/populate-free-exercise-db.js`
  - Descarga un JSON de ejercicios de `free-exercise-db` (GitHub).
  - Inserta o actualiza cientos de ejercicios en la tabla `exercises`.
  - Asegura que:
    - `is_public = true`.
    - Los campos obligatorios (`name`, `category`) estén presentes.
    - Se eviten duplicados por nombre.

- Scripts de limpieza:
  - `scripts/remove-exercises-without-images.js`, `clean-invalid-exercises-*.js`, etc.
  - El objetivo es dejar en la tabla `exercises` solo aquellos con imágenes o videos válidos.

### Flujo recomendado para ejercicios

1. Ejecutar migraciones.
2. Ejecutar:

```bash
cd fitness-app-backend
npm run populate:exercises
```

3. Verificar:

```bash
node ./scripts/verify-exercises.js
```

## Poblamiento de alimentos

- Scripts:
  - `scripts/seed-common-foods.js`
  - `scripts/seed-extended-foods.js`
  - `scripts/seed-openfoodfacts.js`

Estos scripts insertan registros en la tabla `foods` con información nutricional básica.

## Usuarios de prueba

- Script: `scripts/create-test-user.js`
  - Crea un usuario de prueba con rutinas, ejercicios y alimentos asociados.
  - Útil para ambientes de desarrollo y demo.
