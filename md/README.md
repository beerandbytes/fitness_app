# Fitness App Monorepo

Aplicación completa de fitness y salud con seguimiento de entrenamientos, nutrición, objetivos y progreso.

Este repositorio contiene:

- `fitness-app-backend/`: API REST (Node.js, Express, Drizzle, PostgreSQL).
- `fitness-app-frontend/`: SPA (React, Vite, Tailwind).
- `docs/`: documentación completa con Docusaurus (ES/EN).

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js >= 22.0.0
- npm >= 10.0.0
- PostgreSQL >= 16.0
- Docker (opcional, para desarrollo con contenedores)

### Instalación Completa

```bash
# Instalar todas las dependencias
npm run install:all

# O instalar por partes:
npm install                    # Raíz
npm run backend:install        # Backend
npm run frontend:install       # Frontend
cd docs && npm install         # Documentación
```

### Configuración

1. **Backend**: Copia `fitness-app-backend/.env.example` a `.env` y configura las variables
2. **Frontend**: Copia `fitness-app-frontend/.env.example` a `.env` y configura `VITE_API_URL`

### Desarrollo

```bash
# Iniciar backend
npm run backend:start

# Iniciar frontend (en otra terminal)
npm run frontend:dev

# Iniciar documentación (en otra terminal)
npm run docs:start
```

### Con Docker

```bash
# Desarrollo
docker-compose up

# Producción
docker-compose -f docker-compose.prod.yml up
```

## 📚 Documentación

La documentación oficial del proyecto está en la carpeta `docs/` y cubre:

- Arquitectura del backend y frontend
- Esquema completo de la base de datos
- Referencia de API
- Guías de despliegue (Docker, Render)
- Configuración y variables de entorno

### Acceder a la Documentación

```bash
# Modo desarrollo
npm run docs:start
# Abre http://localhost:3000

# Build estático
npm run docs:build
npm run docs:serve
```

## 🛠️ Scripts Disponibles

### Desde la Raíz

```bash
npm run install:all          # Instalar todas las dependencias
npm run format               # Formatear código con Prettier
npm run format:check         # Verificar formato sin cambiar
npm run lint                 # Ejecutar linter
npm run test                 # Ejecutar todos los tests
```

### Backend

```bash
npm run backend:install      # Instalar dependencias
npm run backend:start        # Iniciar servidor
npm run backend:test         # Ejecutar tests
npm run backend:migrate      # Ejecutar migraciones de BD
```

### Frontend

```bash
npm run frontend:install     # Instalar dependencias
npm run frontend:dev         # Modo desarrollo
npm run frontend:build       # Build de producción
npm run frontend:test        # Ejecutar tests
```

### Documentación

```bash
npm run docs:start           # Servidor de desarrollo
npm run docs:build           # Build estático
npm run docs:serve           # Servir build estático
```

## 📖 Documentación Adicional

- [Guía de Inicio Rápido](GUIA_INICIO_RAPIDO.md) - Configuración inicial paso a paso
- [Guía de Contribución](CONTRIBUTING.md) - Cómo contribuir al proyecto
- [Changelog](CHANGELOG.md) - Historial de cambios y versiones
- [Análisis y Mejoras](ANALISIS_Y_MEJORAS.md) - Análisis del proyecto y mejoras planificadas
- [Revisión Completa](REVISION_COMPLETA_PROYECTO.md) - Análisis detallado del proyecto
- [Resumen Final](RESUMEN_FINAL_COMPLETO.md) - Resumen completo de todas las mejoras

## 🏗️ Estructura del Proyecto

```
.
├── fitness-app-backend/     # API REST backend
│   ├── routes/              # Rutas de la API
│   ├── db/                  # Configuración de BD y esquema
│   ├── middleware/          # Middlewares de Express
│   └── scripts/            # Scripts de utilidad
├── fitness-app-frontend/     # Aplicación React
│   ├── src/
│   │   ├── pages/          # Páginas principales
│   │   ├── components/     # Componentes reutilizables
│   │   └── stores/         # Estado global (Zustand)
│   └── public/             # Archivos estáticos
└── docs/                    # Documentación Docusaurus
    ├── docs/               # Contenido de documentación
    └── i18n/               # Traducciones (ES/EN)
```

## 🧪 Testing

```bash
# Backend
npm run backend:test

# Frontend
npm run frontend:test

# Todo
npm run test
```

## 🐳 Docker

El proyecto incluye configuración Docker completa:

- `docker-compose.yml` - Desarrollo local
- `docker-compose.prod.yml` - Producción
- Dockerfiles optimizados para backend y frontend

## 📝 Convenciones

- **Commits**: Usamos [Conventional Commits](https://www.conventionalcommits.org/)
- **Código**: Formateado con Prettier (configuración en `.prettierrc`)
- **Branches**: `feature/`, `fix/`, `docs/`, etc.

## 🤝 Contribuir

Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md) para detalles sobre nuestro código de conducta y el proceso para enviar pull requests.

## 📄 Licencia

Ver [LICENSE.md](LICENSE.md) para más información.

## 🔗 Enlaces Útiles

- [Documentación Completa](docs/) - Documentación técnica detallada
- [API Reference](docs/docs/api/overview.md) - Referencia de la API
- [Guía de Despliegue](docs/docs/devops/docker-and-render.md) - Cómo desplegar en producción


