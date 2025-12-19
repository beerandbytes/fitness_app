# 🚀 Configuración Final de Despliegue - Lista para Producción

Esta guía contiene la configuración **completa y final** para desplegar la aplicación en Render sin pasos adicionales.

---

## ✅ Cambios Implementados

### 1. **Seeds se ejecutan SOLO durante el BUILD**
   - ✅ `render.yaml`: `buildCommand` incluye `npm run seed:all`
   - ✅ `docker-entrypoint.sh`: NO ejecuta seeds (solo migraciones)
   - ✅ El servidor inicia rápidamente sin bloqueos

### 2. **Migraciones automáticas**
   - ✅ Se ejecutan en `docker-entrypoint.sh` antes de iniciar el servidor
   - ✅ Se ejecutan en `buildCommand` de `render.yaml` (sin Docker)

### 3. **Validación de variables de entorno**
   - ✅ `docker-entrypoint.sh` verifica variables críticas
   - ✅ `envValidator.js` valida al iniciar la aplicación

---

## 📋 Configuración en Render

### Paso 1: Crear Base de Datos PostgreSQL

1. **Render Dashboard → New + → PostgreSQL**
2. **Configuración:**
   ```
   Name: fitness-app-db
   Database: fitnessdb
   User: fitnessuser
   Region: Oregon (o la más cercana)
   PostgreSQL Version: 16
   Plan: Free
   ```
3. **Crear y copiar la "Internal Database URL"**

---

### Paso 2: Crear Backend (Web Service)

#### Opción A: Sin Docker (Recomendado para empezar)

1. **Render Dashboard → New + → Web Service**
2. **Conecta tu repositorio** (GitHub/GitLab/Bitbucket)
3. **Configuración:**
   ```
   Name: fitness-app-backend
   Region: Oregon (misma que la base de datos)
   Branch: main (o tu rama principal)
   Root Directory: fitness-app-backend
   Environment: Node
   Build Command: npm install && npm run db:migrate && npm run seed:all
   Start Command: node index.js
   Plan: Free
   ```

4. **Environment Variables:**
   ```env
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<Internal Database URL de Render>
   JWT_SECRET=<genera uno seguro con: openssl rand -base64 32>
   FRONTEND_URL=https://tu-frontend.onrender.com
   ```

5. **Link Database:**
   - En el servicio backend → Environment → Link Database
   - Selecciona `fitness-app-db`
   - Render agregará automáticamente `DATABASE_URL`

#### Opción B: Con Docker

1. **Render Dashboard → New + → Web Service**
2. **Conecta tu repositorio**
3. **Configuración:**
   ```
   Name: fitness-app-backend
   Region: Oregon
   Branch: main
   Root Directory: fitness-app-backend
   Environment: Docker
   Dockerfile Path: Dockerfile
   Build Command: [DEJAR VACÍO]
   Start Command: [DEJAR VACÍO]
   Plan: Free
   ```

4. **Environment Variables:** (mismas que Opción A)

---

### Paso 3: Crear Frontend (Static Site)

1. **Render Dashboard → New + → Static Site**
2. **Conecta tu repositorio**
3. **Configuración:**
   ```
   Name: fitness-app-frontend
   Branch: main
   Root Directory: fitness-app-frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   Plan: Free
   ```

4. **Environment Variables:**
   ```env
   VITE_API_URL=https://tu-backend.onrender.com/api
   NODE_VERSION=22
   ```

   ⚠️ **IMPORTANTE:** Reemplaza `tu-backend` con la URL real de tu backend en Render.

---

## 🔧 Variables de Entorno Requeridas

### Backend (Críticas)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | `openssl rand -base64 32` |

### Backend (Recomendadas)

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `4000` (Docker) o `10000` (Node) |
| `NODE_ENV` | Entorno de ejecución | `production` |
| `FRONTEND_URL` | URL del frontend (para CORS) | - |

### Frontend (Críticas)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL del backend API | `https://backend.onrender.com/api` |

---

## 📝 Flujo de Despliegue Automático

### Con Docker:

```
1. Render construye la imagen Docker
2. Durante el BUILD (si usas buildCommand):
   - npm install
   - npm run db:migrate
   - npm run seed:all
3. Render inicia el contenedor
4. docker-entrypoint.sh ejecuta:
   - npm run db:migrate (por si acaso)
   - Verifica variables de entorno
   - Inicia el servidor (node index.js)
5. ✅ Servidor listo
```

### Sin Docker:

```
1. Render ejecuta buildCommand:
   - npm install
   - npm run db:migrate
   - npm run seed:all
2. Render ejecuta startCommand:
   - node index.js
3. ✅ Servidor listo
```

---

## ✅ Checklist de Verificación

### Antes de Desplegar:

- [ ] Base de datos PostgreSQL creada en Render
- [ ] Backend creado y configurado
- [ ] Frontend creado y configurado
- [ ] Variables de entorno configuradas:
  - [ ] `DATABASE_URL` (backend)
  - [ ] `JWT_SECRET` (backend)
  - [ ] `VITE_API_URL` (frontend)
  - [ ] `FRONTEND_URL` (backend, opcional pero recomendado)
- [ ] Base de datos vinculada al backend (si usas Docker)

### Después del Despliegue:

- [ ] Backend responde en `https://tu-backend.onrender.com`
- [ ] Deberías ver: "Servidor de Fitness App corriendo con Express y Drizzle!"
- [ ] Frontend carga correctamente
- [ ] Puedes registrarte/iniciar sesión
- [ ] Los ejercicios se cargan (verifica en los logs que seeds se ejecutaron)
- [ ] Los alimentos se cargan (verifica en los logs que seeds se ejecutaron)

---

## 🔍 Verificar que Todo Funciona

### 1. Verificar Backend

```bash
# Visita en el navegador:
https://tu-backend.onrender.com

# Deberías ver:
"Servidor de Fitness App corriendo con Express y Drizzle!"

# Prueba un endpoint:
https://tu-backend.onrender.com/api/health
```

### 2. Verificar Logs del Backend

En Render Dashboard → Tu servicio backend → Logs, deberías ver:

```
🚀 Iniciando aplicación...
📦 Ejecutando migraciones de base de datos...
✅ Migraciones completadas exitosamente.
🔍 Verificando variables de entorno...
✅ Iniciando servidor...
🚀 Servidor Express escuchando en http://localhost:4000
```

### 3. Verificar que Seeds se Ejecutaron

En los logs del BUILD (no del runtime), deberías ver:

```
🌱 Iniciando proceso de población de base de datos...
📊 Verificando ejercicios...
⚠️  No se encontraron ejercicios públicos. Poblando ejercicios...
✅ Ejercicios poblados correctamente (XXX ejercicios)
📊 Verificando alimentos...
⚠️  No se encontraron alimentos. Poblando alimentos comunes...
✅ Alimentos comunes poblados correctamente (XXX alimentos)
✅ Base de datos poblada correctamente!
```

### 4. Verificar Frontend

```bash
# Visita en el navegador:
https://tu-frontend.onrender.com

# Deberías ver la aplicación cargando
# Abre DevTools → Console y verifica:
# - No hay errores de conexión a localhost:4000
# - Las peticiones van a tu-backend.onrender.com/api
```

---

## 🐛 Solución de Problemas

### Error: "DATABASE_URL no está configurada"

**Solución:**
1. Ve a Render Dashboard → Tu servicio backend → Environment
2. Verifica que `DATABASE_URL` esté configurada
3. Si usas Docker, asegúrate de haber vinculado la base de datos

### Error: "JWT_SECRET no está configurada"

**Solución:**
1. Genera un secreto: `openssl rand -base64 32`
2. Agrégalo en Render Dashboard → Environment Variables

### Frontend no se conecta al backend (404)

**Solución:**
1. Verifica que `VITE_API_URL` esté configurada en el frontend
2. Asegúrate de que termine en `/api`: `https://backend.onrender.com/api`
3. Reconstruye el frontend después de cambiar la variable

### Los ejercicios/alimentos no cargan

**Solución:**
1. Verifica en los logs del BUILD que `seed:all` se ejecutó
2. Si no se ejecutó, puedes ejecutarlo manualmente:
   - Render Dashboard → Tu servicio backend → Shell
   - Ejecuta: `npm run seed:all`

### El servidor no inicia

**Solución:**
1. Revisa los logs completos en Render
2. Verifica que todas las variables de entorno estén configuradas
3. Verifica que la base de datos esté accesible

---

## 📚 Archivos de Configuración

### Backend:

- `fitness-app-backend/render.yaml` - Configuración de Render (Blueprint)
- `fitness-app-backend/Dockerfile` - Imagen Docker
- `fitness-app-backend/docker-entrypoint.sh` - Script de inicio
- `fitness-app-backend/package.json` - Scripts npm
- `fitness-app-backend/config/envValidator.js` - Validación de variables

### Frontend:

- `fitness-app-frontend/Dockerfile` - Imagen Docker (si usas Docker)
- `fitness-app-frontend/vite.config.js` - Configuración de Vite
- `fitness-app-frontend/package.json` - Scripts npm

---

## 🎯 Resumen

**Configuración Final:**
- ✅ Seeds se ejecutan durante el BUILD (no bloquean el inicio)
- ✅ Migraciones se ejecutan automáticamente
- ✅ Validación de variables de entorno
- ✅ Servidor inicia rápidamente
- ✅ Frontend configurado para producción

**Resultado:**
- 🚀 Despliegue completamente automático
- ⚡ Servidor inicia en segundos
- 📊 Base de datos poblada automáticamente
- ✅ Aplicación lista para usar sin pasos adicionales

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render Dashboard
2. Verifica que todas las variables estén configuradas
3. Consulta los documentos de solución de problemas:
   - `SOLUCION_ROUTING_RENDER.md`
   - `SOLUCION_POBLAR_BASE_DATOS_RENDER.md`
   - `SOLUCION_SCRIPT_BLOQUEA_SERVIDOR.md`

---

**¡Tu aplicación está lista para producción!** 🎉

