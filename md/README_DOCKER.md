# 🐳 Docker - Inicio Rápido

## 🚀 Desarrollo Local

```bash
# Iniciar todos los servicios (backend, frontend, base de datos)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

**URLs**:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- API: http://localhost:4000/api

## 📦 Estructura Docker

```
.
├── docker-compose.yml          # Desarrollo local
├── docker-compose.prod.yml     # Producción
├── fitness-app-backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── docker-entrypoint.sh
└── fitness-app-frontend/
    ├── Dockerfile
    └── .dockerignore
```

## 🎯 Despliegue en Render.com

### Backend con Docker

1. **Render Dashboard → New + → Web Service**
2. **Environment**: `Docker`
3. **Dockerfile Path**: `fitness-app-backend/Dockerfile`
4. **Root Directory**: `fitness-app-backend`
5. Configura variables de entorno (ver `GUIA_DESPLIEGUE_DOCKER.md`)

### Frontend

Recomendado usar **Static Site** en lugar de Docker para mejor rendimiento.

## 📚 Documentación Completa

- **Guía completa**: [GUIA_DESPLIEGUE_DOCKER.md](./GUIA_DESPLIEGUE_DOCKER.md)
- **Guía sin Docker**: [GUIA_DESPLIEGUE_RENDER.md](./GUIA_DESPLIEGUE_RENDER.md)

## 🔧 Comandos Útiles

```bash
# Reconstruir imágenes
docker-compose build --no-cache

# Ejecutar migraciones manualmente
docker-compose exec backend npm run db:migrate

# Acceder al shell del backend
docker-compose exec backend sh

# Ver estado
docker-compose ps

# Limpiar todo
docker-compose down -v
```

