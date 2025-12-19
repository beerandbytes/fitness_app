# 🔧 Solución: Error Axios en Frontend - ERR_NETWORK / ERR_CONNECTION_REFUSED

## 🚨 Problema

El frontend en Render está intentando conectarse a `localhost:4000` en lugar de la URL del backend:

```
Error: Network Error
ERR_CONNECTION_REFUSED
localhost:4000/api/auth/register
```

## 🔍 Causa

La variable de entorno `VITE_API_URL` no está configurada correctamente o no se está pasando durante el build.

**Importante:** En Vite, las variables que empiezan con `VITE_` se "bakean" (incrustan) en el código JavaScript durante el **build**. Si no está disponible durante el build, se usará el valor por defecto (`localhost:4000`).

---

## ✅ Soluciones

### Opción 1: Si usas Docker para el Frontend en Render

Si estás usando Docker para desplegar el frontend:

1. **Ve a Render Dashboard** → Tu servicio frontend
2. **Ve a "Environment"**
3. **Verifica que existe la variable:**
   ```
   VITE_API_URL=https://tu-backend.onrender.com/api
   ```
4. **Problema:** Las variables de entorno en Render NO se pasan automáticamente como build args al Dockerfile.

**Solución:** Necesitas pasar `VITE_API_URL` como build arg. Actualiza tu configuración:

#### En Render (si usas Docker):

1. Ve a tu servicio frontend
2. En "Environment", agrega:
   ```
   VITE_API_URL=https://tu-backend.onrender.com/api
   ```
3. **Pero esto no es suficiente para Docker.** Necesitas actualizar el Dockerfile o usar una solución diferente.

---

### Opción 2: Usar Static Site (Recomendado para Frontend)

**La mejor solución es usar Static Site en Render en lugar de Docker para el frontend:**

#### Configuración en Render:

1. **Dashboard → New + → Static Site**
2. **Conecta tu repositorio**
3. **Configuración:**
   ```
   Name: fitness-app-frontend
   Branch: main
   Root Directory: fitness-app-frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```
4. **Environment Variables:**
   ```
   VITE_API_URL=https://tu-backend.onrender.com/api
   NODE_VERSION=22
   ```

**Con Static Site, Render automáticamente pasa las variables de entorno durante el build.**

---

### Opción 3: Actualizar Dockerfile para Usar Variables de Entorno de Render

Si insistes en usar Docker, necesitas pasar `VITE_API_URL` como build arg:

#### Actualizar el Dockerfile:

```dockerfile
# Construir la aplicación
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build
```

#### En Render (Web Service con Docker):

1. Ve a "Environment Variables"
2. Agrega: `VITE_API_URL=https://tu-backend.onrender.com/api`
3. **Pero esto no funciona directamente.** Render no pasa las env vars como build args automáticamente.

**Solución alternativa:** Usa un script de build que lea las variables de entorno:

```dockerfile
# Construir la aplicación con variable de entorno
RUN VITE_API_URL=$VITE_API_URL npm run build || \
    echo "⚠️  VITE_API_URL no definida, usando localhost por defecto" && \
    npm run build
```

---

## 🎯 Solución Recomendada: Static Site

**Para el frontend, usa Static Site, no Docker:**

### Pasos:

1. **Elimina el servicio Docker del frontend** (si existe)
2. **Crea un nuevo Static Site:**
   - Dashboard → New + → Static Site
   - Conecta repositorio
   - Root Directory: `fitness-app-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
3. **Agrega Environment Variables:**
   ```
   VITE_API_URL=https://tu-backend.onrender.com/api
   NODE_VERSION=22
   ```
4. **Deploy**

Con Static Site, Render automáticamente inyecta las variables de entorno durante el build.

---

## 🔍 Verificar la Configuración

### Verificar que VITE_API_URL está Configurada:

1. **Ve a Render Dashboard** → Tu servicio frontend
2. **Ve a "Environment"**
3. **Verifica que existe:**
   ```
   VITE_API_URL=https://tu-backend.onrender.com/api
   ```
   ⚠️ **Asegúrate de que:**
   - La URL termina en `/api` (no solo la URL del backend)
   - Usa `https://` (no `http://`)
   - No tenga barra final `/api/`

### Verificar en el Código Generado:

Después del build, el código JavaScript debe tener la URL correcta. Abre el navegador:
1. Ve a tu frontend en Render
2. Abre DevTools (F12)
3. Ve a "Sources" o "Network"
4. Busca el archivo JavaScript principal
5. Busca `VITE_API_URL` o la URL del backend
6. Debería mostrar la URL de Render, no `localhost`

---

## 📋 Checklist

- [ ] Frontend desplegado como Static Site (no Docker)
- [ ] Variable `VITE_API_URL` configurada en Render
- [ ] URL correcta: `https://tu-backend.onrender.com/api`
- [ ] URL termina en `/api`
- [ ] Reconstruir después de cambiar variables
- [ ] Verificar en el navegador que la URL es correcta

---

## 🔗 URLs Correctas

Ejemplo de configuración:

**Backend en Render:**
```
https://fitness-app-backend.onrender.com
```

**Frontend VITE_API_URL debe ser:**
```
https://fitness-app-backend.onrender.com/api
```

**No usar:**
- ❌ `http://localhost:4000/api`
- ❌ `https://fitness-app-backend.onrender.com` (falta `/api`)
- ❌ `https://fitness-app-backend.onrender.com/api/` (barra final extra)

---

## 🚀 Pasos Inmediatos

1. **Ve a Render Dashboard** → Tu servicio frontend
2. **Verifica o agrega la variable:**
   ```
   VITE_API_URL=https://tu-backend.onrender.com/api
   ```
3. **Si usas Docker:** Considera cambiar a Static Site
4. **Si usas Static Site:** Solo agrega la variable y reconstruye
5. **Verifica** que funciona después del rebuild

---

**Resumen:** El problema es que `VITE_API_URL` no está disponible durante el build. Con Static Site en Render, esto se resuelve automáticamente. Con Docker, es más complicado.

