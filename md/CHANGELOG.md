# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

### Añadido

- Documentación completa con Docusaurus (ES/EN)
- Scripts de diagnóstico de producción (`npm run diagnose`)
- Validación de variables de entorno al inicio
- Configuración de Docker para desarrollo y producción
- Guías de despliegue en Render

### Mejorado

- Estructura del proyecto más organizada
- Documentación de API más completa
- Manejo de errores más robusto

### Corregido

- Error 404 en versión en inglés de la documentación
- Problemas con reconocimiento de emails de admin
- Poblamiento automático de ejercicios en producción

## [1.0.0] - 2025-01-XX

### Añadido

- Backend completo con Express y Drizzle ORM
- Frontend con React, Vite y Tailwind CSS
- Sistema de autenticación JWT
- Gestión de ejercicios, rutinas y entrenamientos
- Sistema de nutrición y seguimiento de calorías
- Roles de usuario (CLIENT, COACH, ADMIN)
- Sistema de invitaciones para coaches
- Notificaciones y logros
- Chat entre usuarios
- Check-ins semanales con fotos

### Seguridad

- Validación de entrada con express-validator
- Rate limiting en rutas críticas
- Sanitización de datos
- Helmet para headers de seguridad
- CORS configurado correctamente

[Unreleased]: https://github.com/tu-usuario/fitness-aprendizaje/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/tu-usuario/fitness-aprendizaje/releases/tag/v1.0.0
