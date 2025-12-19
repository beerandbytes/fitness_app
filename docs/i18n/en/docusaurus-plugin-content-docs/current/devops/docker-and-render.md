---
id: docker-and-render
title: Docker and Render deployment
---

This page summarizes how to run the project with Docker and how to deploy it on Render.

## Docker (local)

- `docker-compose.yml`
  - `postgres`, `backend`, `frontend` services for development.
- `docker-compose.prod.yml`
  - Production-like setup with `NODE_ENV=production`.

Basic usage:

```bash
docker-compose up --build
docker-compose -f docker-compose.prod.yml up --build
```

## Render (Docker)

### Backend service

1. Create a PostgreSQL service on Render (free tier).
2. Use the **Internal Database URL** as `DATABASE_URL`.
3. Create a Web Service for the backend:
   - Root Directory: `fitness-app-backend`
   - Environment: `Docker`
   - Dockerfile Path: `Dockerfile`
4. Set environment variables:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=<Internal Database URL>
JWT_SECRET=<strong_secret>
FRONTEND_URL=https://your-frontend.onrender.com
ADMIN_EMAILS=admin@example.com,coach@example.com
```

The `docker-entrypoint.sh` script will:

- Run `npm run db:migrate`.
- Check for public exercises and run `npm run populate:exercises` if needed.

### Frontend service

1. Create a Web Service for the frontend:
   - Root Directory: `fitness-app-frontend`
   - Environment: `Docker`
   - Dockerfile Path: `Dockerfile`
2. Set `VITE_API_URL` pointing to the backend:

```env
VITE_API_URL=https://your-backend.onrender.com/api
```


