---
id: local-development
title: Local development
---

## Requirements

- Node.js ≥ 22
- npm ≥ 10
- Docker (optional but recommended for PostgreSQL)

## Option 1: With Docker (recommended)

```bash
docker-compose up --build
```

Services:

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`
- PostgreSQL: `localhost:5432`

Run migrations and seed exercises:

```bash
cd fitness-app-backend
npm install
npm run db:migrate
npm run populate:exercises
```

## Option 2: Without Docker

1. Create a local PostgreSQL database.
2. Configure `DATABASE_URL` in `fitness-app-backend/.env`:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/fitnessdb
JWT_SECRET=<32+ chars secret>
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


