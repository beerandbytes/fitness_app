# ✅ Checklist Completo de Verificación Pre-Despliegue

## 🎯 Objetivo

Este checklist te ayuda a identificar y prevenir errores **ANTES** de desplegar en Render.

---

## 📋 1. VERIFICACIÓN DE ARCHIVOS Y RECURSOS

### ✅ Archivos que NO deben causar errores 404

- [x] **Service Worker** (`sw.js`)
  - ✅ Ya es opcional - no falla si falta
  - ✅ Solo se registra en producción
- [x] **Iconos PWA**
  - ✅ Manifest actualizado para usar `vite.svg`
  - ✅ Referencias a `icon-192.png` y `icon-512.png` eliminadas
- [x] **Manifest.json**
  - ✅ Todos los iconos usan `vite.svg`
  - ✅ Shortcuts actualizados

- [ ] **Verificar que `vite.svg` existe**
  ```bash
  ls fitness-app-frontend/public/vite.svg
  # Debe existir
  ```

---

## 📋 2. VERIFICACIÓN DE VARIABLES DE ENTORNO

### ✅ Frontend (Static Site en Render)

- [ ] **VITE_API_URL está configurada**
  - URL: `https://tu-backend.onrender.com/api`
  - ✅ Debe terminar en `/api`
  - ✅ Debe usar `https://`
  - ❌ NO debe tener barra final (`/api/`)

**Cómo verificar:**

1. Render Dashboard → Tu Static Site → Environment
2. Debe existir: `VITE_API_URL=https://tu-backend.onrender.com/api`

### ✅ Backend (Web Service en Render)

- [ ] **DATABASE_URL está configurada**
  - Usa la "Internal Database URL" de Render
  - Formato: `postgresql://user:pass@host:port/dbname`

- [ ] **JWT_SECRET está configurada**
  - Mínimo 32 caracteres
  - Ejemplo: `jwt_secret_minimo_32_caracteres_para_seguridad_12345`

- [ ] **FRONTEND_URL está configurada**
  - URL de tu Static Site frontend
  - Formato: `https://tu-frontend.onrender.com`

- [ ] **NODE_ENV está configurada**
  - Valor: `production`

- [ ] **PORT está configurada** (opcional, por defecto 4000)
  - Valor: `4000`

---

## 📋 3. VERIFICACIÓN DE CONFIGURACIÓN EN RENDER

### ✅ Frontend (Static Site)

- [ ] **Root Directory**: `fitness-app-frontend`
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Publish Directory**: `dist`
- [ ] **Node Version**: `22` (configurado en Environment)

### ✅ Backend (Web Service)

- [ ] **Root Directory**: `fitness-app-backend` (o vacío si usas Dockerfile en raíz)
- [ ] **Dockerfile Path**: `Dockerfile` (o la ruta correcta)
- [ ] **Start Command**: (debe estar vacío, usa el ENTRYPOINT del Dockerfile)

---

## 📋 4. VERIFICACIÓN DE CÓDIGO

### ✅ Referencias a localhost

- [x] **api.js**
  - ✅ Usa `import.meta.env.VITE_API_URL || 'http://localhost:4000/api'`
  - ✅ Fallback a localhost solo en desarrollo

- [ ] **Buscar otras referencias hardcodeadas** (opcional)
  ```bash
  cd fitness-app-frontend
  grep -r "localhost" src/ --exclude-dir=node_modules
  # Solo deberían aparecer en comentarios o como fallback
  ```

### ✅ Manejo de errores

- [x] **ErrorBoundary** existe y captura errores de React
- [x] **Axios interceptors** manejan errores 401/403
- [x] **Service Worker** no falla si falta

---

## 📋 5. VERIFICACIÓN DE BUILD LOCAL

### ✅ Probar build antes de desplegar

```bash
cd fitness-app-frontend

# Limpiar build anterior
rm -rf dist
rm -rf node_modules/.vite

# Instalar dependencias (si es necesario)
npm install

# Hacer build
npm run build

# Verificar que dist/ tiene todos los archivos
ls -la dist/
# Debe incluir:
# - index.html
# - manifest.json
# - sw.js
# - vite.svg
# - assets/ (con todos los JS/CSS)
```

- [ ] **Build se completa sin errores**
- [ ] **Todos los archivos están en `dist/`**
- [ ] **No hay warnings críticos**

---

## 📋 6. VERIFICACIÓN DE BASE DE DATOS

### ✅ Backend - Migraciones

- [ ] **Migraciones ejecutadas en producción**
  - Las tablas se crean automáticamente en el primer deploy
  - Verifica logs de Render para confirmar

- [ ] **Base de datos PostgreSQL existe en Render**
  - Estado: "Available"
  - Internal Database URL configurada en backend

---

## 📋 7. VERIFICACIÓN POST-DEPLOY

### ✅ Después de desplegar, verifica:

- [ ] **Frontend carga sin errores 404**
  - Abre DevTools → Console
  - No debe haber errores de recursos faltantes

- [ ] **Service Worker no falla** (si está presente)
  - Solo debe mostrar warning si no existe (eso es normal ahora)

- [ ] **Conexión al backend funciona**
  - Intenta hacer login/registro
  - Verifica Network tab en DevTools

- [ ] **No hay errores en consola**
  - Solo warnings menores son aceptables
  - Errores críticos deben resolverse

---

## 📋 8. ERRORES COMUNES Y PREVENCIÓN

### ✅ Errores que ya están resueltos:

1. ✅ **Service Worker 404**
   - Solución: Service Worker opcional
2. ✅ **Iconos faltantes**
   - Solución: Manifest usa `vite.svg`

3. ✅ **Axios localhost error**
   - Solución: Configurar `VITE_API_URL` en Render

4. ✅ **Migraciones faltantes**
   - Solución: Se ejecutan automáticamente en docker-entrypoint.sh

### ⚠️ Errores posibles y cómo prevenirlos:

1. **Build falla en Render**
   - ✅ Verifica que `package.json` tiene todas las dependencias
   - ✅ Verifica que Node Version es correcta (22)
   - ✅ Revisa logs de build en Render

2. **Backend no se conecta a la BD**
   - ✅ Verifica `DATABASE_URL` (Internal URL)
   - ✅ Verifica que PostgreSQL está "Available"

3. **Frontend no se conecta al backend**
   - ✅ Verifica `VITE_API_URL` en Static Site
   - ✅ Verifica CORS en backend (FRONTEND_URL)

4. **Caché del navegador causa problemas**
   - ✅ Limpia caché después del deploy
   - ✅ Usa modo incógnito para probar

---

## 🚀 CHECKLIST RÁPIDO PRE-DEPLOY

Antes de hacer commit y push:

- [ ] Build local funciona sin errores
- [ ] Todas las variables de entorno están configuradas en Render
- [ ] No hay referencias hardcodeadas a localhost (excepto fallbacks)
- [ ] Service Worker es opcional (ya está hecho)
- [ ] Manifest usa `vite.svg` (ya está hecho)
- [ ] `vite.svg` existe en `public/`

**Después de deploy:**

- [ ] Frontend carga correctamente
- [ ] No hay errores 404 en consola
- [ ] Conexión al backend funciona
- [ ] Login/Registro funcionan

---

## 📝 NOTAS IMPORTANTES

1. **Los nombres de archivos JS/CSS cambian en cada build** (es normal)
   - Vite genera hashes: `index-XXXXX.js`
   - El `index.html` siempre referencia los archivos correctos

2. **Service Worker puede mostrar warning** (es normal ahora)
   - Ya no es crítico, solo informativo

3. **Algunos errores pueden ser de caché**
   - Siempre limpia caché del navegador después de deploy

4. **Verifica logs de Render**
   - Build logs: Para ver errores de compilación
   - Runtime logs: Para ver errores de ejecución

---

## ✅ ESTADO ACTUAL DEL PROYECTO

### Errores resueltos:

- ✅ Service Worker 404
- ✅ Iconos faltantes (manifest)
- ✅ Service Worker falla si faltan archivos

### Protecciones implementadas:

- ✅ Service Worker opcional
- ✅ ErrorBoundary para errores de React
- ✅ Manejo de errores en Axios
- ✅ Fallbacks para variables de entorno

### Pendiente de verificar:

- ⚠️ Configurar `VITE_API_URL` en Render (si no está)
- ⚠️ Verificar que todas las variables de entorno están configuradas

---

**Después de completar este checklist, deberías estar seguro de no encontrar errores inesperados.**
