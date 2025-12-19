# ⚡ Solución Rápida: Error Axios Frontend - localhost:4000

## 🚨 Error

El frontend intenta conectarse a `localhost:4000` en lugar de tu backend en Render:
```
ERR_CONNECTION_REFUSED
localhost:4000/api/auth/register
```

## ✅ Solución Inmediata

### Paso 1: Verificar cómo está desplegado el Frontend

Ve a Render Dashboard → Tu servicio frontend y verifica:

**¿Es un "Static Site" o un "Web Service" (Docker)?**

---

### Opción A: Si es Static Site (Recomendado)

1. **Ve a Render Dashboard** → Tu servicio frontend (Static Site)
2. **Ve a "Environment"**
3. **Verifica que existe:**
   ```
   VITE_API_URL=https://tu-backend.onrender.com/api
   ```
   ⚠️ **Reemplaza `tu-backend` con la URL real de tu backend**
4. **Si no existe, agrega la variable**
5. **Haz clic en "Manual Deploy" → "Deploy latest commit"**
   - Esto reconstruirá el frontend con la variable correcta

---

### Opción B: Si es Web Service (Docker) - Problema Común

**El problema:** Con Docker, Render NO pasa automáticamente las variables de entorno como build args.

**Solución 1: Cambiar a Static Site (Más Fácil)**

1. **Elimina el Web Service del frontend**
2. **Crea un nuevo Static Site:**
   - Dashboard → New + → Static Site
   - Root Directory: `fitness-app-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Environment Variables:
     ```
     VITE_API_URL=https://tu-backend.onrender.com/api
     NODE_VERSION=22
     ```
3. **Deploy**

**Solución 2: Si quieres seguir usando Docker**

Necesitas modificar el Dockerfile para leer las variables de entorno durante el build. Render tiene limitaciones aquí.

---

## 🔍 Cómo Encontrar la URL Correcta de tu Backend

1. **Ve a Render Dashboard**
2. **Haz clic en tu servicio backend**
3. **Copia la URL** (ej: `https://fitness-app-backend.onrender.com`)
4. **Agrega `/api` al final:**
   ```
   https://fitness-app-backend.onrender.com/api
   ```
5. **Usa esta URL como `VITE_API_URL`**

---

## ✅ Verificación

Después de reconstruir:

1. **Abre tu frontend en el navegador**
2. **Abre DevTools (F12)**
3. **Ve a "Network"**
4. **Intenta hacer login o registro**
5. **Deberías ver peticiones a:**
   ```
   https://tu-backend.onrender.com/api/auth/register
   ```
   **NO a `localhost:4000`**

---

## 📋 Checklist Rápido

- [ ] Encontré la URL de mi backend en Render
- [ ] Agregué `/api` al final de la URL
- [ ] Configuré `VITE_API_URL` en Render (Static Site o Web Service)
- [ ] Reconstruí el frontend (Manual Deploy)
- [ ] Verifiqué en el navegador que las peticiones van a la URL correcta

---

## 🚀 Pasos Inmediatos (2 minutos)

1. **Abre Render Dashboard** → Tu frontend
2. **Environment** → Verifica/Agrega:
   ```
   VITE_API_URL=https://TU-BACKEND-REAL.onrender.com/api
   ```
3. **Manual Deploy** → "Deploy latest commit"
4. **Espera 2-3 minutos**
5. **Prueba en el navegador**

---

**Si sigue sin funcionar:** Comparte:
- Cómo está desplegado (Static Site o Docker)
- Qué URL tiene configurada en `VITE_API_URL`
- La URL de tu backend en Render

