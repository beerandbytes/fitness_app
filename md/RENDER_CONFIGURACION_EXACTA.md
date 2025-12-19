# 🎯 Configuración EXACTA para Render.com

Esta guía te da las rutas **exactas** que debes poner en Render para que funcione.

## ⚠️ IMPORTANTE: Elige UNA configuración y úsala

Hay DOS formas de configurar Render. Elige la que prefieras, pero usa la MISMA para ambos servicios.

---

## 📋 Configuración para BACKEND

Ve a **Render Dashboard → Tu Servicio Backend → Settings** y configura **EXACTAMENTE** esto:

### ✅ OPCIÓN 1: Build desde subdirectorio (RECOMENDADA - PRUEBA ESTA PRIMERO)

```
Name: fitness-app-backend
Environment: Docker
Root Directory: fitness-app-backend
Dockerfile Path: Dockerfile
Build Command: (dejar vacío)
Start Command: (dejar vacío)
```

**Usa el Dockerfile que está en:** `fitness-app-backend/Dockerfile`

---

### ✅ OPCIÓN 2: Build desde la raíz (USA ESTA SI LA OPCIÓN 1 FALLA)

Si la Opción 1 da el error "package.json not found", usa esta configuración:

```
Name: fitness-app-backend
Environment: Docker
Root Directory: (DEJAR COMPLETAMENTE VACÍO - no poner nada)
Dockerfile Path: Dockerfile
Build Command: (dejar vacío)
Start Command: (dejar vacío)
```

**IMPORTANTE:** Usa el `Dockerfile` que está en la **raíz del repositorio** (acabo de crearlo). Este Dockerfile copia desde `fitness-app-backend/package.json`.

---

## 📋 Configuración para FRONTEND

Ve a **Render Dashboard → Tu Servicio Frontend → Settings** y configura **EXACTAMENTE** esto:

### ✅ OPCIÓN 1: Build desde subdirectorio (RECOMENDADA - PRUEBA ESTA PRIMERO)

```
Name: fitness-app-frontend
Environment: Docker
Root Directory: fitness-app-frontend
Dockerfile Path: Dockerfile
Build Command: (dejar vacío)
Start Command: (dejar vacío)
```

**Usa el Dockerfile que está en:** `fitness-app-frontend/Dockerfile`

---

### ✅ OPCIÓN 2: Build desde la raíz (USA ESTA SI LA OPCIÓN 1 FALLA)

Si la Opción 1 da el error "package.json not found", usa esta configuración:

```
Name: fitness-app-frontend
Environment: Docker
Root Directory: (DEJAR COMPLETAMENTE VACÍO - no poner nada)
Dockerfile Path: Dockerfile.frontend.raiz
Build Command: (dejar vacío)
Start Command: (dejar vacío)
```

**IMPORTANTE:** Este Dockerfile está en la raíz y copia desde `fitness-app-frontend/package.json`.

---

## ⚠️ PASOS CRÍTICOS ANTES DE DESPLEGAR

1. **Verifica que los archivos existen en tu repositorio**:
   ```bash
   # En tu repositorio local, verifica:
   ls fitness-app-backend/package.json
   ls fitness-app-frontend/package.json
   ls fitness-app-backend/Dockerfile
   ls fitness-app-frontend/Dockerfile
   ```

2. **Asegúrate de hacer commit y push**:
   ```bash
   git add .
   git commit -m "Fix Docker configuration for Render"
   git push
   ```

3. **En Render, después de cambiar la configuración**:
   - Guarda los cambios
   - Ve a "Manual Deploy" → "Deploy latest commit"
   - Revisa los logs para ver si funciona

---

## 🔧 Variables de Entorno

### Backend

```
NODE_ENV=production
PORT=10000
DATABASE_URL=<tu Internal Database URL de Render>
JWT_SECRET=<genera uno seguro>
FRONTEND_URL=https://tu-frontend.onrender.com
```

### Frontend

```
VITE_API_URL=https://tu-backend.onrender.com/api
```

---

## 🐛 Si Sigue Fallando

1. **Verifica los logs de Render**: Ve a tu servicio → Logs y busca el error específico
2. **Prueba la Opción A primero** (Root Directory vacío)
3. **Asegúrate de hacer commit y push de todos los archivos**:
   ```bash
   git add .
   git commit -m "Fix Docker configuration"
   git push
   ```
4. **En Render, haz un "Manual Deploy"** después de cambiar la configuración

