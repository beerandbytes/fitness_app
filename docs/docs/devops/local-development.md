---
id: local-development
title: Desarrollo local
---

Esta sección explica cómo levantar el entorno de desarrollo en tu máquina.

## Requisitos

- Node.js ≥ 22
- npm ≥ 10
- Docker (opcional pero recomendado para base de datos)

## Opción 1: Con Docker (recomendada)

```bash
# En la raíz del repositorio
docker-compose up --build
```

Servicios:

- Backend: `http://localhost:4000` (API).
- Frontend: `http://localhost:5173`.
- PostgreSQL: `localhost:5432` (usuario/DB según `docker-compose.yml`).

Una vez levantado:

- Ejecuta migraciones (si no se lanzan automáticamente):

```bash
cd fitness-app-backend
npm install
npm run db:migrate
npm run populate:exercises
```

## Opción 2: Sin Docker

1. Crear una base de datos PostgreSQL local.
2. Configurar `DATABASE_URL` en `fitness-app-backend/.env`.

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/fitnessdb
JWT_SECRET=<secreto_seguro_de_32+_caracteres>
```

3. Backend:

```bash
cd fitness-app-backend
npm install
npm run db:migrate
npm run populate:exercises
npm start
```

4. Frontend:

```bash
cd fitness-app-frontend
npm install
npm run dev
```

El frontend usará `VITE_API_URL` (configurado en `.env` de frontend o en scripts) para llamar a la API.


