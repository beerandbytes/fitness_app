# ⚡ Comandos Rápidos

## 🚀 Desarrollo

### Iniciar Aplicación
```bash
# Terminal 1 - Backend
cd fitness-app-backend
npm start

# Terminal 2 - Frontend
cd fitness-app-frontend
npm run dev
```

---

## 🧪 Testing

### Frontend
```bash
cd fitness-app-frontend
npm test              # Watch mode
npm run test:ui       # UI interactiva
npm run test:coverage # Con cobertura
npm test -- --run     # Ejecutar una vez
```

### Backend
```bash
cd fitness-app-backend
npm test              # Todos los tests
npm run test:watch    # Watch mode
npm run test:routes   # Solo rutas
npm run test:utils    # Solo utilidades
```

---

## 🗄️ Base de Datos

```bash
cd fitness-app-backend
npm run db:generate   # Generar migraciones
npm run db:migrate    # Ejecutar migraciones
```

---

## 📦 Build

### Frontend
```bash
cd fitness-app-frontend
npm run build         # Build de producción
npm run preview       # Preview del build
```

---

## 🔍 Linting

```bash
cd fitness-app-frontend
npm run lint          # Ejecutar ESLint
```

---

## 🧹 Limpiar

```bash
# Frontend
cd fitness-app-frontend
rm -rf node_modules dist
npm install

# Backend
cd fitness-app-backend
rm -rf node_modules
npm install
```

---

## 📊 Verificar Estado

```bash
# Verificar que todo funciona
cd fitness-app-frontend && npm test -- --run
cd ../fitness-app-backend && npm test
```

---

## 🎯 Scripts Útiles

### Crear Usuario de Prueba
```bash
cd fitness-app-backend
npm run create:test-user
```

### Sincronizar Ejercicios de wger
```bash
cd fitness-app-backend
npm run sync:wger
```

### Seed de Datos
```bash
cd fitness-app-backend
npm run seed:exercises      # Ejercicios
npm run seed:foods          # Alimentos comunes
npm run seed:foods:extended # Alimentos extendidos
```

