# 💪 Fitness App

Aplicación completa de fitness y entrenamiento desarrollada con React, Node.js y PostgreSQL. Incluye funcionalidades para usuarios, entrenadores y administradores.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Despliegue Local](#-despliegue-local)
- [Despliegue con Docker](#-despliegue-con-docker)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Funcionalidades Detalladas](#-funcionalidades-detalladas)
- [API](#-api)
- [Scripts Disponibles](#-scripts-disponibles)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## ✨ Características

### Para Usuarios (CLIENT)
- 🏋️ **Gestión de Rutinas**: Crear, editar y gestionar rutinas de entrenamiento personalizadas
- 📊 **Seguimiento de Progreso**: Registro diario de peso, medidas y progreso visual
- 🍎 **Gestión de Nutrición**: Registro de comidas, cálculo de calorías y macronutrientes
- 📅 **Calendario de Entrenamientos**: Planificación y seguimiento de sesiones
- 🎯 **Objetivos y Metas**: Establecer y seguir objetivos de peso y fitness
- 🏆 **Sistema de Logros**: Badges y logros por hitos alcanzados
- ⏱️ **Modo Entrenamiento Activo**: Cronómetro, contador de repeticiones y temporizador de descanso
- 📸 **Check-ins Semanales**: Registro de fotos de progreso y estado de ánimo
- 💬 **Mensajería**: Comunicación directa con tu entrenador
- 🔔 **Notificaciones**: Recordatorios y alertas personalizadas

### Para Entrenadores (COACH)
- 👥 **Gestión de Clientes**: Dashboard completo para gestionar múltiples clientes
- 📋 **Plantillas de Rutinas**: Crear y compartir plantillas de entrenamiento
- 📊 **Análisis de Progreso**: Visualización del progreso de cada cliente
- 📧 **Sistema de Invitaciones**: Invitar clientes por email
- 💬 **Mensajería**: Comunicación directa con clientes
- 📈 **Métricas y Estadísticas**: Análisis detallado del rendimiento de clientes

### Para Administradores (ADMIN)
- 🛠️ **Panel de Administración**: Gestión completa de usuarios, coaches y contenido
- 📊 **Métricas del Sistema**: Estadísticas globales de la aplicación
- 🎨 **Personalización de Marca**: Configuración de colores y branding
- 🔐 **Gestión de Roles**: Asignación y gestión de permisos

## 🛠️ Tecnologías

### Frontend
- **React 19** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **React Router** - Enrutamiento
- **Zustand** - Gestión de estado
- **Tailwind CSS 4** - Estilos
- **Radix UI** - Componentes accesibles
- **Framer Motion** - Animaciones
- **Socket.io Client** - Comunicación en tiempo real
- **Recharts** - Gráficos y visualizaciones

### Backend
- **Node.js 24** - Runtime
- **Express 5** - Framework web
- **PostgreSQL** - Base de datos
- **Drizzle ORM** - ORM para PostgreSQL
- **JWT** - Autenticación
- **Socket.io** - WebSockets
- **Winston** - Logging
- **Express Validator** - Validación
- **Helmet** - Seguridad
- **Swagger** - Documentación API

### DevOps
- **Docker** - Contenedores
- **Docker Compose** - Orquestación
- **Nginx** - Servidor web (producción)

## 📦 Requisitos Previos

- **Node.js** >= 24.0.0
- **npm** >= 11.0.0
- **PostgreSQL** >= 16.0 (o Docker para ejecutar PostgreSQL)
- **Git**

Opcional:
- **Docker** y **Docker Compose** (para despliegue con contenedores)

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/fitness-app.git
cd fitness-app
```

### 2. Instalar Dependencias

```bash
# Instalar todas las dependencias (raíz, backend, frontend y docs)
npm run install:all

# O instalar por partes:
npm install
npm run backend:install
npm run frontend:install
cd docs && npm install && cd ..
```

### 3. Configurar Variables de Entorno

**Backend:**
```bash
cd fitness-app-backend
cp .env.example .env
# Edita .env con tus valores (ver sección de Configuración)
```

**Frontend:**
```bash
cd fitness-app-frontend
cp .env.example .env
# Edita .env con tus valores
```

## ⚙️ Configuración

> 💡 **Tip**: Los archivos `.env.example` en cada directorio contienen todas las variables disponibles con descripciones detalladas.

### Variables de Entorno - Backend

Copia el archivo de ejemplo y configura tus valores:

```bash
cd fitness-app-backend
cp .env.example .env
# Edita .env con tus valores
```

**Variables críticas requeridas:**
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `JWT_SECRET`: Secreto para firmar tokens JWT (mínimo 32 caracteres)

**⚠️ IMPORTANTE**: 
- `JWT_SECRET` debe tener al menos 32 caracteres
- Genera un secreto seguro: `openssl rand -base64 32`
- Ver `fitness-app-backend/.env.example` para todas las variables disponibles

### Variables de Entorno - Frontend

Copia el archivo de ejemplo y configura tus valores:

```bash
cd fitness-app-frontend
cp .env.example .env
# Edita .env con tus valores
```

**Variable requerida:**
- `VITE_API_URL`: URL completa del backend API (ej: `http://localhost:4000/api`)

Ver `fitness-app-frontend/.env.example` para más detalles.

### Configurar Base de Datos

#### Opción 1: PostgreSQL Local

```bash
# Crear base de datos
createdb fitnessdb

# O usando psql:
psql -U postgres
CREATE DATABASE fitnessdb;
```

#### Opción 2: Docker (Recomendado para desarrollo)

```bash
# Iniciar solo PostgreSQL
docker-compose up -d postgres
```

### Ejecutar Migraciones

```bash
# Desde la raíz del proyecto
npm run backend:migrate

# O desde el directorio backend
cd fitness-app-backend
npm run db:migrate
```

### Poblar Datos Iniciales (Opcional)

```bash
cd fitness-app-backend

# Poblar ejercicios
npm run seed:exercises

# Poblar alimentos comunes
npm run seed:foods

# Poblar rutinas predefinidas
npm run seed:predefined-routines

# O poblar todo
npm run seed:all
```

## 🏃 Despliegue Local

### Desarrollo (Terminales Separadas)

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
```

### URLs de Desarrollo

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Documentación**: http://localhost:3000 (si se ejecuta)

## 🐳 Despliegue con Docker

### Desarrollo

```bash
# Construir e iniciar todos los servicios
docker-compose up --build

# O en modo detached
docker-compose up -d
```

### Producción

```bash
# Construir e iniciar con configuración de producción
docker-compose -f docker-compose.prod.yml up --build -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Comandos Útiles

```bash
# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Reconstruir sin caché
docker-compose build --no-cache
```

## 📁 Estructura del Proyecto

```
fitness-app/
├── fitness-app-backend/      # Backend API
│   ├── config/               # Configuración
│   ├── db/                   # Base de datos y migraciones
│   ├── middleware/           # Middlewares de Express
│   ├── routes/               # Rutas de la API
│   ├── scripts/              # Scripts de utilidad
│   ├── tests/                # Tests
│   ├── utils/                # Utilidades
│   ├── index.js              # Punto de entrada
│   └── package.json
│
├── fitness-app-frontend/      # Frontend React
│   ├── public/               # Archivos estáticos
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/            # Páginas de la aplicación
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # Servicios API
│   │   ├── stores/           # Estado global (Zustand)
│   │   ├── utils/            # Utilidades
│   │   └── App.jsx           # Componente principal
│   └── package.json
│
├── docs/                      # Documentación (Docusaurus)
│   ├── docs/                 # Archivos de documentación
│   └── docusaurus.config.js
│
├── scripts/                   # Scripts del monorepo
├── docker-compose.yml         # Docker Compose desarrollo
├── docker-compose.prod.yml    # Docker Compose producción
└── package.json              # Configuración del monorepo
```

## 🎯 Funcionalidades Detalladas

### Autenticación y Autorización
- ✅ Registro y login de usuarios
- ✅ Autenticación con JWT (access + refresh tokens)
- ✅ Recuperación de contraseña por email
- ✅ Autenticación social (Google, Facebook)
- ✅ Roles: CLIENT, COACH, ADMIN
- ✅ Protección de rutas por rol

### Gestión de Rutinas
- ✅ Crear rutinas personalizadas
- ✅ Añadir ejercicios con sets, reps, peso y duración
- ✅ Rutinas predefinidas del sistema
- ✅ Crear rutinas desde plantillas
- ✅ Activar/desactivar rutinas
- ✅ Exportar rutinas a PDF
- ✅ Compartir rutinas con entrenador

### Ejercicios
- ✅ Catálogo completo de ejercicios
- ✅ Búsqueda y filtrado avanzado
- ✅ Visualización con GIFs animados
- ✅ Información detallada de cada ejercicio
- ✅ Categorías y músculos trabajados
- ✅ Integración con wger API

### Nutrición
- ✅ Registro de comidas diarias
- ✅ Búsqueda de alimentos
- ✅ Cálculo automático de calorías y macronutrientes
- ✅ Base de datos de alimentos (OpenFoodFacts)
- ✅ Historial de comidas
- ✅ Objetivos calóricos personalizados

### Seguimiento de Progreso
- ✅ Registro diario de peso
- ✅ Gráficos de progreso
- ✅ Seguimiento de medidas corporales
- ✅ Historial completo
- ✅ Comparación con períodos anteriores
- ✅ Cálculo de IMC y otras métricas

### Entrenamientos
- ✅ Modo entrenamiento activo
- ✅ Cronómetro por ejercicio
- ✅ Contador de repeticiones
- ✅ Temporizador de descanso
- ✅ Registro de series completadas
- ✅ Historial de entrenamientos

### Sistema Social
- ✅ Mensajería entre usuario y entrenador
- ✅ Notificaciones en tiempo real
- ✅ Sistema de invitaciones
- ✅ Compartir logros

### Dashboard y Análisis
- ✅ Dashboard personalizado por rol
- ✅ Métricas y estadísticas
- ✅ Gráficos de progreso
- ✅ Resumen diario/semanal/mensual
- ✅ Comparación de períodos

### Calendario
- ✅ Vista de calendario de entrenamientos
- ✅ Programar rutinas
- ✅ Recordatorios
- ✅ Historial de sesiones

### Logros y Gamificación
- ✅ Sistema de badges
- ✅ Logros por hitos
- ✅ Racha de días consecutivos
- ✅ Puntos y niveles

## 🔌 API

### Endpoints Principales

#### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `POST /api/auth/reset-password` - Resetear contraseña

#### Rutinas
- `GET /api/routines` - Listar rutinas
- `POST /api/routines` - Crear rutina
- `GET /api/routines/:id` - Obtener rutina
- `PUT /api/routines/:id` - Actualizar rutina
- `DELETE /api/routines/:id` - Eliminar rutina

#### Ejercicios
- `GET /api/exercises` - Listar ejercicios
- `GET /api/exercises/:id` - Obtener ejercicio
- `GET /api/exercises/search` - Buscar ejercicios

#### Nutrición
- `GET /api/foods` - Buscar alimentos
- `POST /api/logs` - Registrar comida
- `GET /api/logs` - Obtener logs diarios

#### Progreso
- `POST /api/logs/weight` - Registrar peso
- `GET /api/progress` - Obtener progreso
- `GET /api/streaks` - Obtener rachas

#### Coach
- `GET /api/coach/clients` - Listar clientes
- `GET /api/coach/clients/:id` - Detalle de cliente
- `POST /api/invite` - Invitar cliente

#### Admin
- `GET /api/admin/stats` - Estadísticas
- `GET /api/admin/users` - Listar usuarios
- `PUT /api/admin/users/:id` - Actualizar usuario

**Documentación completa**: La API está documentada con Swagger. Accede a `/api-docs` cuando el backend esté ejecutándose.

## 📜 Scripts Disponibles

### Desde la Raíz

```bash
# Instalación
npm run install:all          # Instalar todas las dependencias

# Desarrollo
npm run backend:start       # Iniciar backend
npm run frontend:dev        # Iniciar frontend
npm run docs:start         # Iniciar documentación

# Base de datos
npm run backend:migrate     # Ejecutar migraciones

# Docker
npm run docker:build        # Construir imágenes
npm run docker:up          # Iniciar servicios
npm run docker:down        # Detener servicios

# Testing
npm run test               # Ejecutar todos los tests
npm run backend:test       # Tests del backend
npm run frontend:test      # Tests del frontend

# Linting
npm run lint               # Lint del frontend
npm run format             # Formatear código
```

### Backend

```bash
cd fitness-app-backend

# Base de datos
npm run db:migrate         # Ejecutar migraciones
npm run db:generate        # Generar migraciones

# Seeds
npm run seed:all          # Poblar todos los datos
npm run seed:exercises    # Poblar ejercicios
npm run seed:foods        # Poblar alimentos
npm run seed:predefined-routines  # Poblar rutinas

# Testing
npm run test              # Ejecutar tests
npm run test:watch        # Tests en modo watch
```

### Frontend

```bash
cd fitness-app-frontend

npm run dev              # Desarrollo
npm run build            # Build de producción
npm run preview          # Preview del build
npm run test             # Tests
npm run lint             # Linting
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, lee nuestra [Guía de Contribución](CONTRIBUTING.md) para más detalles.

**Resumen rápido:**

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Sigue las convenciones de código existentes
- Añade tests para nuevas funcionalidades
- Actualiza la documentación según sea necesario
- Asegúrate de que todos los tests pasen
- Usa [Conventional Commits](https://www.conventionalcommits.org/) para los mensajes de commit

Para más información, consulta [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte, abre un issue en el repositorio de GitHub.

---

**Desarrollado con ❤️ para la comunidad fitness**
