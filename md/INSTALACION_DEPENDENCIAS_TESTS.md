# 📦 Instalación de Dependencias para Tests

## Frontend

Ejecuta en `fitness-app-frontend/`:

```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

## Backend

Las dependencias de testing ya están instaladas:
- `jest` ✅
- `supertest` ✅

Si necesitas instalar algo adicional:

```bash
npm install --save-dev @types/jest
```

---

## ✅ Verificación

### Frontend
```bash
cd fitness-app-frontend
npm test -- --run
```

### Backend
```bash
cd fitness-app-backend
npm test
```

---

**Nota**: Los tests están configurados y listos. Solo necesitas instalar las dependencias si no están ya instaladas.

