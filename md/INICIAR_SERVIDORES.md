# 🚀 Guía Rápida para Iniciar los Servidores

## Iniciar Backend

```bash
cd fitness-app-backend
npm start
```

El servidor debería iniciar en `http://localhost:4000`

## Iniciar Frontend

En una nueva terminal:

```bash
cd fitness-app-frontend
npm run dev
```

El frontend debería iniciar en `http://localhost:5173`

## Verificar que Todo Funciona

1. **Backend saludable:**
   - Abre `http://localhost:4000` en el navegador
   - Deberías ver: "Servidor de Fitness App corriendo con Express y Drizzle!"

2. **Frontend cargando:**
   - Abre `http://localhost:5173`
   - Deberías ver la landing page

3. **Probar registro:**
   - Ir a `/register`
   - Crear una cuenta
   - Seleccionar rol (Coach o Cliente)

## Scripts Útiles

### Backend:
- `npm start` - Iniciar servidor
- `npm run db:migrate` - Ejecutar migraciones
- `npm run db:generate` - Generar nuevas migraciones
- `npm test` - Ejecutar tests

### Frontend:
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm test` - Ejecutar tests

## Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
npm install
```

### Error: "Port already in use"
```bash
# Cambiar el puerto en .env
PORT=4001
```

### Error: "DATABASE_URL not defined"
- Verificar que el archivo `.env` existe en `fitness-app-backend/`
- Verificar que contiene `DATABASE_URL=...`

### Error: "Migration failed"
```bash
# Verificar que la base de datos existe
# Verificar credenciales en DATABASE_URL
# Ejecutar migraciones manualmente si es necesario
```

