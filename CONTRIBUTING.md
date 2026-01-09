# Guía de Contribución

¡Gracias por tu interés en contribuir al proyecto Fitness App! 🎉

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Estándares de Código](#estándares-de-código)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)

## 📜 Código de Conducta

Este proyecto sigue un código de conducta. Al participar, se espera que mantengas este código.

## 🚀 Cómo Contribuir

### Reportar Bugs

Si encuentras un bug:

1. Verifica que no haya sido reportado ya en [Issues](https://github.com/tu-usuario/fitness-aprendizaje/issues)
2. Crea un nuevo issue con:
   - Título descriptivo
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del entorno (OS, Node version, etc.)

### Sugerir Mejoras

Para sugerir nuevas características:

1. Verifica que no haya sido sugerida ya
2. Crea un issue con:
   - Descripción detallada de la mejora
   - Casos de uso
   - Beneficios esperados

### Contribuir con Código

1. **Fork el repositorio**
2. **Crea una rama** desde `main`:
   ```bash
   git checkout -b feature/mi-nueva-caracteristica
   ```
3. **Haz tus cambios** siguiendo los estándares de código
4. **Escribe tests** para nuevas funcionalidades
5. **Asegúrate de que los tests pasen**:

   ```bash
   # Backend
   cd fitness-app-backend
   npm test

   # Frontend
   cd fitness-app-frontend
   npm test
   ```

6. **Commit tus cambios** con mensajes descriptivos:
   ```bash
   git commit -m "feat: añadir nueva característica X"
   ```
7. **Push a tu fork**:
   ```bash
   git push origin feature/mi-nueva-caracteristica
   ```
8. **Abre un Pull Request**

## ⚙️ Configuración del Entorno

### Requisitos Previos

- Node.js >= 22.0.0
- npm >= 10.0.0
- PostgreSQL >= 16.0
- Docker (opcional, para desarrollo con contenedores)

### Configuración Inicial

1. **Clona el repositorio**:

   ```bash
   git clone https://github.com/tu-usuario/fitness-aprendizaje.git
   cd fitness-aprendizaje
   ```

2. **Configura el backend**:

   ```bash
   cd fitness-app-backend
   cp .env.example .env
   # Edita .env con tus valores
   npm install
   npm run db:migrate
   ```

3. **Configura el frontend**:

   ```bash
   cd fitness-app-frontend
   cp .env.example .env
   # Edita .env con tus valores
   npm install
   ```

4. **Inicia los servicios**:

   ```bash
   # Con Docker Compose (recomendado)
   docker-compose up

   # O manualmente
   # Terminal 1: Backend
   cd fitness-app-backend && npm start

   # Terminal 2: Frontend
   cd fitness-app-frontend && npm run dev
   ```

## 📝 Estándares de Código

### Convenciones de Nombres

- **Variables y funciones**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Componentes React**: `PascalCase`
- **Archivos**: `kebab-case` para componentes, `camelCase` para utilidades

### Formateo

El proyecto usa Prettier para formateo automático:

```bash
# Formatear todo el código
npm run format

# Verificar formato
npm run format:check
```

### Estructura de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva característica
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formateo, punto y coma faltante, etc.
- `refactor:` Refactorización de código
- `test:` Añadir o corregir tests
- `chore:` Cambios en build, dependencias, etc.

Ejemplos:

```
feat: añadir sistema de notificaciones push
fix: corregir error 404 en rutas de admin
docs: actualizar guía de despliegue
refactor: optimizar consultas a base de datos
```

### Linting

```bash
# Backend (si tiene ESLint configurado)
cd fitness-app-backend
npm run lint

# Frontend
cd fitness-app-frontend
npm run lint
```

## 🔄 Proceso de Pull Request

1. **Actualiza tu rama** con los últimos cambios de `main`:

   ```bash
   git checkout main
   git pull upstream main
   git checkout feature/mi-nueva-caracteristica
   git rebase main
   ```

2. **Asegúrate de que**:
   - Todos los tests pasan
   - El código sigue los estándares
   - La documentación está actualizada
   - No hay conflictos

3. **Crea el Pull Request** con:
   - Título descriptivo
   - Descripción detallada de los cambios
   - Referencias a issues relacionados
   - Screenshots si aplica

4. **Revisa los comentarios** y haz los cambios necesarios

5. **Una vez aprobado**, tu PR será mergeado

## 🧪 Testing

### Backend

```bash
cd fitness-app-backend
npm test              # Ejecutar todos los tests
npm run test:watch   # Modo watch
npm run test:coverage # Con cobertura
```

### Frontend

```bash
cd fitness-app-frontend
npm test              # Ejecutar todos los tests
npm run test:ui       # Interfaz visual
npm run test:coverage # Con cobertura
```

## 📚 Documentación

- La documentación principal está en `docs/` (Docusaurus)
- Para cambios en documentación, edita los archivos `.md` en `docs/docs/`
- Ejecuta la documentación localmente:
  ```bash
  cd docs
  npm start
  ```

## ❓ Preguntas

Si tienes preguntas, puedes:

- Abrir un issue con la etiqueta `question`
- Contactar a los mantenedores

¡Gracias por contribuir! 🎉
