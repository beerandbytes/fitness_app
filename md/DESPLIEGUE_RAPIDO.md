# ⚡ Despliegue Rápido en Render.com

## 🎯 Resumen Ejecutivo

Despliega tu aplicación completa en Render.com (100% gratuito) en 3 servicios:

1. **PostgreSQL** (Base de datos)
2. **Backend** (API Express)
3. **Frontend** (React/Vite)

## 🐳 ¿Con Docker o Sin Docker?

- **Con Docker**: Más consistente, mejor para producción → Ver [GUIA_DESPLIEGUE_DOCKER.md](./GUIA_DESPLIEGUE_DOCKER.md)
- **Sin Docker**: Más rápido de configurar → Sigue esta guía

---

## 📝 Pasos Rápidos

### 1️⃣ Base de Datos

- **Dashboard → New + → PostgreSQL**
- Name: `fitness-app-db`
- Plan: `Free`
- **Copia la "Internal Database URL"**

**📌 Nota:** La base de datos se crea vacía (sin tablas). Las tablas se crearán automáticamente cuando se ejecuten las migraciones de Drizzle (ver paso 2️⃣).

### 2️⃣ Backend

- **Dashboard → New + → Web Service**
- Conecta repositorio
- **Root Directory**: `fitness-app-backend`
- **Build Command**: `npm install && npm run db:migrate`
- **Start Command**: `node index.js`
- **Variables de entorno**:
  ```
  DATABASE_URL=<Internal Database URL>
  JWT_SECRET=<genera con: openssl rand -base64 32>
  FRONTEND_URL=https://tu-frontend.onrender.com (configurar después)
  NODE_ENV=production
  PORT=10000
  ```
- **Link Database**: Selecciona `fitness-app-db`
- **Copia la URL del backend**

### 3️⃣ Frontend

- **Dashboard → New + → Static Site**
- Conecta repositorio
- **Root Directory**: `fitness-app-frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Variables de entorno**:
  ```
  VITE_API_URL=https://tu-backend.onrender.com/api
  NODE_VERSION=22
  ```
- **Copia la URL del frontend**

### 4️⃣ Actualizar URLs

- En el **backend**, actualiza `FRONTEND_URL` con la URL del frontend
- El backend se reiniciará automáticamente

---

## ✅ Verificación

- Backend: `https://tu-backend.onrender.com` → Debe mostrar mensaje de servidor
- Frontend: `https://tu-frontend.onrender.com` → Debe cargar la app
- Prueba registro/login

---

## ⚠️ Notas Importantes

1. **Spinning Down**: El plan gratuito "duerme" servicios después de 15 min de inactividad
   - Primera petición después puede tardar 30-60 segundos
   - Solución: Usa [UptimeRobot](https://uptimerobot.com) para mantener activo

2. **Migraciones y Creación de Tablas**:
   - Las migraciones de Drizzle ya están en el repositorio (`fitness-app-backend/drizzle/*.sql`)
   - Se ejecutan automáticamente en el build (`npm run db:migrate` crea todas las tablas)
   - Si fallan, ejecuta manualmente en el Shell: `npm run db:migrate`
   - Para más detalles: Consulta `COMO_FUNCIONA_DRIZZLE_BASE_DATOS.md`

3. **CORS**: Ya está configurado para aceptar dominios `.onrender.com`

---

## 🔗 URLs de Ejemplo

- Backend: `https://fitness-app-backend.onrender.com`
- Frontend: `https://fitness-app-frontend.onrender.com`
- API: `https://fitness-app-backend.onrender.com/api`

---

## 📚 Documentación Completa

- **Sin Docker**: [GUIA_DESPLIEGUE_RENDER.md](./GUIA_DESPLIEGUE_RENDER.md)
- **Con Docker**: [GUIA_DESPLIEGUE_DOCKER.md](./GUIA_DESPLIEGUE_DOCKER.md)
- **Inicio rápido Docker**: [README_DOCKER.md](./README_DOCKER.md)
