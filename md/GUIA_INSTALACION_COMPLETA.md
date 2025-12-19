# 📦 Guía de Instalación Completa

## 🚀 Pasos para Poner en Marcha la Aplicación

### 1. Instalar Dependencias

#### Frontend
```bash
cd fitness-app-frontend
npm install
```

Esto instalará todas las dependencias incluyendo las nuevas para tests:
- `vitest` - Framework de testing
- `@testing-library/react` - Utilidades de testing
- `@testing-library/jest-dom` - Matchers adicionales
- `@testing-library/user-event` - Simulación de eventos
- `jsdom` - Entorno DOM para tests

#### Backend
```bash
cd fitness-app-backend
npm install
```

Las dependencias de testing ya están incluidas:
- `jest` - Framework de testing
- `supertest` - Testing de APIs

---

### 2. Configurar Variables de Entorno

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000/api
VITE_RECAPTCHA_SITE_KEY=tu_clave_publica_de_recaptcha
```

#### Backend (.env)
```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/fitness_db

# JWT
JWT_SECRET=tu_secreto_jwt_muy_seguro
JWT_REFRESH_SECRET=tu_secreto_refresh_muy_seguro

# reCAPTCHA (opcional para desarrollo)
RECAPTCHA_SECRET_KEY=tu_clave_secreta_de_recaptcha

# SMTP (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password

# Frontend URL
FRONTEND_BASE_URL=http://localhost:5173
```

---

### 3. Crear Iconos PWA

Crea los iconos necesarios para la PWA:

1. **icon-192.png** (192x192 píxeles)
2. **icon-512.png** (512x512 píxeles)

Colócalos en: `fitness-app-frontend/public/`

**Herramientas recomendadas**:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

---

### 4. Ejecutar Migraciones de Base de Datos

```bash
cd fitness-app-backend
npm run db:migrate
```

Esto creará las nuevas tablas:
- `notifications`
- `achievements`
- `user_achievements`

---

### 5. Ejecutar Tests

#### Frontend
```bash
cd fitness-app-frontend
npm test              # Modo watch
npm run test:ui       # Con UI interactiva
npm run test:coverage # Con cobertura
```

#### Backend
```bash
cd fitness-app-backend
npm test              # Todos los tests
npm run test:routes   # Solo tests de rutas
npm run test:utils    # Solo tests de utilidades
```

---

### 6. Iniciar la Aplicación

#### Backend
```bash
cd fitness-app-backend
npm start
```

El servidor se iniciará en `http://localhost:4000`

#### Frontend
```bash
cd fitness-app-frontend
npm run dev
```

La aplicación se iniciará en `http://localhost:5173`

---

### 7. Verificar Funcionalidades

#### Checklist de Verificación

- [ ] **Modo Entrenamiento Activo**
  - Ir a una rutina y hacer clic en "Iniciar Entrenamiento"
  - Verificar cronómetro, temporizador de descanso

- [ ] **Sistema de Notificaciones**
  - Verificar campana en navbar
  - Verificar contador de no leídas

- [ ] **Sistema de Logros**
  - Ir a `/achievements`
  - Verificar que se muestre la página

- [ ] **PWA**
  - En Chrome/Edge: Ver opción "Instalar app"
  - Verificar que funciona offline (después de primera carga)

- [ ] **Exportación**
  - Exportar historial de peso desde gráfico
  - Exportar rutina desde detalle de rutina

- [ ] **Dashboard Mejorado**
  - Verificar gráfico de macronutrientes
  - Verificar widget semanal

- [ ] **Accesibilidad**
  - Navegar con Tab
  - Verificar skip link (presionar Tab al cargar)

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'vitest'"
```bash
cd fitness-app-frontend
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Error: "Cannot find module '@testing-library/jest-dom'"
```bash
cd fitness-app-frontend
npm install --save-dev @testing-library/jest-dom
```

### Error en tests de backend: "Cannot find module"
```bash
cd fitness-app-backend
npm install --save-dev @types/jest
```

### PWA no funciona
- Verificar que `manifest.json` existe en `public/`
- Verificar que `sw.js` existe en `public/`
- Verificar que los iconos existen
- Abrir DevTools > Application > Service Workers

### reCAPTCHA no funciona
- En desarrollo, funciona sin clave (usa clave de prueba)
- En producción, configurar `VITE_RECAPTCHA_SITE_KEY` y `RECAPTCHA_SECRET_KEY`

---

## ✅ Verificación Final

Ejecutar tests para verificar que todo funciona:

```bash
# Frontend
cd fitness-app-frontend
npm test -- --run

# Backend
cd fitness-app-backend
npm test
```

---

## 📝 Notas Importantes

1. **Base de Datos**: Asegúrate de que PostgreSQL esté corriendo
2. **Migraciones**: Ejecuta migraciones después de cambios en schema
3. **Tests**: Los tests usan mocks, no requieren BD real
4. **PWA**: Solo funciona en HTTPS en producción (HTTP en localhost está bien)

---

**¡Listo!** La aplicación está completamente configurada y lista para usar.

