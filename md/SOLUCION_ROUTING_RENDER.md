# 🔧 Solución: Ejercicios y Comida No Cargan en Render

## 🚨 Problema

Cuando subes el proyecto a Render, no cargan ni los ejercicios ni la comida. Las peticiones fallan o no devuelven datos.

## 🔍 Causas Posibles

### 1. **VITE_API_URL no está configurada correctamente** (MÁS COMÚN)

El frontend necesita saber la URL del backend durante el **build**. Si `VITE_API_URL` no está configurada, el frontend intentará conectarse a `http://localhost:4000/api`, que no existe en producción.

### 2. **Problemas de autenticación**

Las rutas `/api/exercises` y `/api/foods` requieren autenticación. Si el token JWT no está siendo enviado correctamente o está expirado, las peticiones fallarán.

### 3. **Rutas del backend no responden**

Aunque las rutas están correctamente registradas, podría haber un problema con el servidor o la base de datos.

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar cómo está desplegado el Frontend

Ve a **Render Dashboard → Tu servicio frontend** y verifica:

**¿Es un "Static Site" o un "Web Service" (Docker)?**

---

### Opción A: Si es Static Site (RECOMENDADO)

**Static Site es la mejor opción para el frontend** porque Render pasa automáticamente las variables de entorno durante el build.

#### 1. Verificar/Crear Static Site

1. **Ve a Render Dashboard**
2. Si ya tienes un Static Site, ve a él. Si no, crea uno:
   - **Dashboard → New + → Static Site**
   - Conecta tu repositorio
   - **Root Directory**: `fitness-app-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

#### 2. Configurar Variables de Entorno

1. **Ve a tu Static Site → Environment**
2. **Agrega o verifica estas variables:**

```env
VITE_API_URL=https://tu-backend.onrender.com/api
NODE_VERSION=22
```

**⚠️ IMPORTANTE:**
- Reemplaza `tu-backend` con la URL real de tu backend en Render
- La URL debe terminar en `/api` (ej: `https://fitness-app-backend.onrender.com/api`)
- Para encontrar la URL de tu backend: Render Dashboard → Tu servicio backend → Copia la URL

#### 3. Reconstruir el Frontend

1. **Ve a tu Static Site → Manual Deploy → Deploy latest commit**
2. Espera a que termine el build (2-5 minutos)
3. Verifica los logs para confirmar que `VITE_API_URL` está configurada

---

### Opción B: Si es Web Service (Docker)

Si estás usando Docker para el frontend, Render **NO pasa automáticamente** las variables de entorno como build args.

#### Solución Recomendada: Cambiar a Static Site

1. **Elimina el Web Service del frontend** (si existe)
2. **Crea un nuevo Static Site** siguiendo la Opción A arriba

#### Alternativa: Si quieres seguir usando Docker

Necesitas pasar `VITE_API_URL` como build arg. En Render:

1. **Ve a tu Web Service → Settings**
2. **En "Environment Variables", agrega:**
   ```env
   VITE_API_URL=https://tu-backend.onrender.com/api
   ```
3. **PERO esto no es suficiente.** Render no pasa automáticamente las env vars como build args.

**Solución:** Necesitas usar un script de build o actualizar el Dockerfile. El Dockerfile actual ya está preparado para recibir `VITE_API_URL` como build arg, pero Render necesita configuración adicional.

**Recomendación:** Usa Static Site en lugar de Docker para el frontend.

---

## 🔍 Verificar que Funciona

### 1. Verificar en los Logs de Build

En Render, ve a tu servicio frontend → Logs y busca:

```
✅ VITE_API_URL configurada: https://tu-backend.onrender.com/api
```

Si ves una advertencia sobre `VITE_API_URL` no definida, significa que la variable no está configurada.

### 2. Verificar en el Navegador

1. **Abre tu aplicación en el navegador**
2. **Abre las DevTools (F12) → Console**
3. **Intenta cargar ejercicios o comida**
4. **Revisa la pestaña Network** para ver las peticiones:

**Si funciona correctamente:**
- Verás peticiones a `https://tu-backend.onrender.com/api/exercises/...`
- Las peticiones deberían devolver datos (200 OK)

**Si NO funciona:**
- Verás peticiones a `http://localhost:4000/api/exercises/...` (incorrecto)
- O verás errores 401/403 (problema de autenticación)
- O verás errores 404 (rutas no encontradas)

### 3. Verificar Autenticación

Si las peticiones van a la URL correcta pero fallan con 401/403:

1. **Verifica que estés logueado** en la aplicación
2. **Revisa el token JWT** en localStorage:
   - DevTools → Application → Local Storage
   - Busca `userToken`
   - Si no existe o está vacío, necesitas iniciar sesión

### 4. Verificar Rutas del Backend

Si las peticiones van a la URL correcta pero fallan con 404:

1. **Verifica que el backend esté funcionando:**
   - Visita: `https://tu-backend.onrender.com`
   - Deberías ver: "Servidor de Fitness App corriendo con Express y Drizzle!"

2. **Verifica las rutas específicas:**
   - `https://tu-backend.onrender.com/api/exercises` (requiere autenticación)
   - `https://tu-backend.onrender.com/api/foods/search?name=test` (requiere autenticación)

3. **Revisa los logs del backend** en Render para ver si hay errores

---

## 🐛 Problemas Comunes y Soluciones

### Error: "Network Error" o "ERR_CONNECTION_REFUSED"

**Causa:** `VITE_API_URL` no está configurada o está mal configurada.

**Solución:**
1. Verifica que `VITE_API_URL` esté en las variables de entorno del frontend
2. Asegúrate de que la URL sea correcta (debe terminar en `/api`)
3. Reconstruye el frontend después de cambiar la variable

### Error: 401 Unauthorized o 403 Forbidden

**Causa:** Problema de autenticación. El token JWT no está siendo enviado o está expirado.

**Solución:**
1. Inicia sesión en la aplicación
2. Verifica que el token esté en localStorage
3. Si el problema persiste, revisa la configuración de CORS en el backend

### Error: 404 Not Found

**Causa:** Las rutas no están siendo encontradas.

**Solución:**
1. Verifica que el backend esté funcionando
2. Verifica que las rutas estén correctamente registradas en `index.js`
3. Revisa los logs del backend para ver si hay errores

### Los datos no cargan pero no hay errores

**Causa:** La base de datos podría estar vacía o las migraciones no se ejecutaron.

**Solución:**
1. Verifica que las migraciones se ejecutaron correctamente
2. Verifica que haya datos en la base de datos (ejercicios y alimentos)
3. Si la base de datos está vacía, ejecuta los scripts de población:
   ```bash
   # En el Shell del backend en Render
   npm run db:seed  # Si existe este script
   ```

---

## 📋 Checklist de Verificación

- [ ] `VITE_API_URL` está configurada en Render (Static Site o Web Service)
- [ ] La URL del backend es correcta (termina en `/api`)
- [ ] El frontend se reconstruyó después de configurar `VITE_API_URL`
- [ ] El backend está funcionando y responde
- [ ] Las rutas `/api/exercises` y `/api/foods` están registradas en el backend
- [ ] Estás logueado en la aplicación (token JWT presente)
- [ ] La base de datos tiene datos (ejercicios y alimentos)
- [ ] Las migraciones se ejecutaron correctamente

---

## 🎯 Resumen Rápido

**El problema más común es que `VITE_API_URL` no está configurada en Render.**

**Solución rápida:**
1. Ve a Render Dashboard → Tu servicio frontend
2. Ve a Environment Variables
3. Agrega: `VITE_API_URL=https://tu-backend.onrender.com/api`
4. Reconstruye el frontend (Manual Deploy)

**Si usas Docker para el frontend, considera cambiar a Static Site** (es más simple y Render maneja mejor las variables de entorno).

---

## 📚 Recursos Adicionales

- [Documentación de Render sobre Variables de Entorno](https://render.com/docs/environment-variables)
- [Documentación de Vite sobre Variables de Entorno](https://vitejs.dev/guide/env-and-mode.html)
- Ver archivo: `GUIA_DESPLIEGUE_RENDER.md` para más detalles sobre el despliegue completo

