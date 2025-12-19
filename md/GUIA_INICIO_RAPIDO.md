# 🚀 Guía de Inicio Rápido

## Configuración Inicial

### 1. Instalar Dependencias

```bash
# Opción 1: Script automatizado (Linux/Mac)
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh

# Opción 2: Manual
npm run install:all

# Opción 3: Por partes
npm install
npm run backend:install
npm run frontend:install
cd docs && npm install
```

### 2. Configurar Variables de Entorno

#### Backend

Crea `fitness-app-backend/.env` basándote en `fitness-app-backend/.env.example`:

```bash
cd fitness-app-backend
cp .env.example .env
# Edita .env con tus valores
```

Variables mínimas requeridas:
```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/fitnessdb
JWT_SECRET=tu-secret-key-minimo-32-caracteres
PORT=4000
```

#### Frontend

Crea `fitness-app-frontend/.env`:

```bash
cd fitness-app-frontend
cp .env.example .env
# Edita .env con tus valores
```

Variable requerida:
```env
VITE_API_URL=http://localhost:4000/api
```

### 3. Configurar Base de Datos

```bash
# Opción 1: Con Docker
docker-compose up -d postgres

# Opción 2: PostgreSQL local
# Crea la base de datos manualmente
createdb fitnessdb
```

### 4. Ejecutar Migraciones

```bash
npm run backend:migrate
```

### 5. Poblar Ejercicios (Opcional)

```bash
cd fitness-app-backend
npm run populate:exercises
```

## Desarrollo

### Iniciar Servidores

#### Opción 1: Manual (Recomendado para desarrollo)

**Terminal 1 - Backend:**
```bash
npm run backend:start
# O: cd fitness-app-backend && npm start
```

**Terminal 2 - Frontend:**
```bash
npm run frontend:dev
# O: cd fitness-app-frontend && npm run dev
```

**Terminal 3 - Documentación (Opcional):**
```bash
npm run docs:start
# O: cd docs && npm start
```

#### Opción 2: Docker Compose

```bash
# Desarrollo
docker-compose up

# Producción
docker-compose -f docker-compose.prod.yml up
```

### URLs de Desarrollo

- **Backend**: http://localhost:4000
- **Frontend**: http://localhost:5173
- **Documentación**: http://localhost:3000
- **API Health**: http://localhost:4000/api/health

## Scripts Útiles

### Desde la Raíz

```bash
# Instalación
npm run install:all          # Instalar todas las dependencias

# Desarrollo
npm run backend:start        # Iniciar backend
npm run frontend:dev         # Iniciar frontend
npm run docs:start           # Iniciar documentación

# Testing
npm run test                 # Ejecutar todos los tests
npm run backend:test         # Tests del backend
npm run frontend:test        # Tests del frontend

# Formateo
npm run format               # Formatear código
npm run format:check         # Verificar formato

# Docker
npm run docker:build         # Build de imágenes
npm run docker:up            # Iniciar contenedores
npm run docker:down          # Detener contenedores
npm run docker:logs          # Ver logs

# Utilidades
npm run verify               # Verificar configuración
npm run backend:migrate      # Ejecutar migraciones
```

### Backend

```bash
cd fitness-app-backend

npm start                    # Iniciar servidor
npm test                     # Ejecutar tests
npm run db:migrate           # Migraciones
npm run db:generate          # Generar migraciones
npm run populate:exercises   # Poblar ejercicios
npm run diagnose             # Diagnóstico de producción
```

### Frontend

```bash
cd fitness-app-frontend

npm run dev                  # Desarrollo
npm run build                # Build producción
npm test                     # Tests
npm run lint                 # Linter
```

## Verificación

### Verificar Configuración

```bash
npm run verify
```

Este script verifica que todos los archivos necesarios estén presentes.

### Verificar Backend

```bash
curl http://localhost:4000/api/health
```

Deberías recibir:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "..."
}
```

### Verificar Frontend

Abre http://localhost:5173 en tu navegador. Deberías ver la landing page.

## Solución de Problemas

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
npm run install:all
```

### Error: "Port already in use"

```bash
# Cambiar puerto en .env
PORT=4001  # Backend
# O matar proceso en el puerto
# Windows: netstat -ano | findstr :4000
# Linux/Mac: lsof -ti:4000 | xargs kill
```

### Error: "DATABASE_URL not defined"

1. Verifica que `fitness-app-backend/.env` existe
2. Verifica que contiene `DATABASE_URL=...`
3. Reinicia el servidor

### Error: "Migration failed"

```bash
# Verificar conexión a BD
npm run backend:migrate

# Si falla, verifica DATABASE_URL en .env
```

### Docker: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
docker-compose ps

# Ver logs
docker-compose logs postgres
```

## Próximos Pasos

1. ✅ Configuración completada
2. ✅ Servidores iniciados
3. 📝 Crear cuenta de usuario
4. 🏋️ Explorar funcionalidades
5. 📚 Leer documentación en `docs/`

## Recursos

- [Documentación Completa](docs/)
- [Guía de Contribución](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [Análisis del Proyecto](ANALISIS_Y_MEJORAS.md)

## Soporte

Si encuentras problemas:
1. Revisa los logs del servidor
2. Ejecuta `npm run verify`
3. Consulta la documentación en `docs/`
4. Revisa los issues en el repositorio

