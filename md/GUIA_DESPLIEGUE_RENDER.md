# 🚀 Guía Completa de Despliegue en Render.com (Gratuito)

Esta guía te ayudará a desplegar tu aplicación completa (backend + frontend + base de datos) en Render.com de forma **100% gratuita**.

## 📋 Requisitos Previos

1. **Cuenta en Render.com**: Regístrate en [render.com](https://render.com) (gratis)
2. **Repositorio Git**: Tu código debe estar en GitHub, GitLab o Bitbucket
3. **Node.js 22+**: Render soporta Node.js 22 y superior (LTS recomendado)

## 🎯 Estructura del Despliegue

Desplegaremos 3 servicios en Render:
1. **PostgreSQL Database** (Base de datos)
2. **Backend Web Service** (API Express)
3. **Frontend Static Site** (React/Vite)

---

## 📦 Paso 1: Preparar el Repositorio

### 1.1 Actualizar render.yaml

El archivo `render.yaml` ya existe, pero vamos a mejorarlo para incluir el frontend:

```yaml
# fitness-app-backend/render.yaml
services:
  # Backend API
  - type: web
    name: fitness-app-backend
    env: node
    region: oregon
    plan: free
    buildCommand: npm install && npm run db:migrate
    startCommand: node index.js
    healthCheckPath: /
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      # DATABASE_URL se configurará automáticamente desde la base de datos
      # JWT_SECRET debe configurarse manualmente en el dashboard

  # Frontend Static Site
  - type: web
    name: fitness-app-frontend
    env: static
    buildCommand: cd ../fitness-app-frontend && npm install && npm run build
    staticPublishPath: ../fitness-app-frontend/dist
    envVars:
      - key: VITE_API_URL
        value: https://fitness-app-backend.onrender.com/api
      - key: NODE_VERSION
        value: 22

databases:
  - name: fitness-app-db
    databaseName: fitnessdb
    user: fitnessuser
    plan: free
    postgresMajorVersion: 16
```

**Nota**: Render no soporta múltiples servicios en un solo `render.yaml` de forma directa. Desplegaremos cada servicio manualmente.

---

## 🗄️ Paso 2: Crear la Base de Datos PostgreSQL

1. **Inicia sesión en Render.com**
2. **Ve a Dashboard → New + → PostgreSQL**
3. **Configura la base de datos**:
   - **Name**: `fitness-app-db`
   - **Database**: `fitnessdb`
   - **User**: `fitnessuser`
   - **Region**: `Oregon` (o la más cercana a ti)
   - **PostgreSQL Version**: `16`
   - **Plan**: `Free`
4. **Crea la base de datos**
5. **Copia la "Internal Database URL"** (la necesitarás después)

**📌 Nota Importante sobre la Base de Datos:**
- La base de datos se crea **vacía** (sin tablas)
- Las **tablas se crearán automáticamente** cuando ejecutes las migraciones de Drizzle
- Las migraciones ya están en el repositorio (`fitness-app-backend/drizzle/*.sql`)
- No necesitas generar migraciones, solo ejecutarlas (ver Paso 3.4)
- Para más detalles, consulta: `COMO_FUNCIONA_DRIZZLE_BASE_DATOS.md`

---

## 🔧 Paso 3: Desplegar el Backend

### 3.1 Crear el Web Service

1. **Ve a Dashboard → New + → Web Service**
2. **Conecta tu repositorio** (GitHub/GitLab/Bitbucket)
3. **Configura el servicio**:
   - **Name**: `fitness-app-backend`
   - **Region**: `Oregon` (o la misma que la base de datos)
   - **Branch**: `main` (o tu rama principal)
   - **Root Directory**: `fitness-app-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run db:migrate`
   - **Start Command**: `node index.js`
   - **Plan**: `Free`

### 3.2 Configurar Variables de Entorno

En la sección **Environment Variables** del servicio backend, agrega:

```env
# Base de datos (usa la Internal Database URL de Render)
DATABASE_URL=<Internal Database URL de Render>

# JWT Secret (genera uno seguro)
JWT_SECRET=<genera_un_secreto_largo_y_seguro_de_al_menos_32_caracteres>

# Frontend URL (se configurará después de desplegar el frontend)
FRONTEND_URL=https://tu-frontend.onrender.com

# Node Environment
NODE_ENV=production

# Puerto (Render lo asigna automáticamente, pero puedes especificarlo)
PORT=10000
```

**Para generar JWT_SECRET**:
```bash
# En tu terminal local
openssl rand -base64 32
```

### 3.3 Conectar la Base de Datos

1. En el dashboard del servicio backend, ve a **Environment**
2. Haz clic en **Link Database**
3. Selecciona `fitness-app-db`
4. Render agregará automáticamente `DATABASE_URL` con la Internal Database URL

### 3.4 Desplegar y Crear las Tablas

1. Haz clic en **Create Web Service**
2. Render comenzará a construir y desplegar tu backend
3. **El Build Command incluye las migraciones** (`npm run db:migrate`), que crearán automáticamente todas las tablas en tu base de datos
4. Espera a que termine (puede tardar 5-10 minutos la primera vez)
5. **Copia la URL del servicio** (ej: `https://fitness-app-backend.onrender.com`)

**📌 ¿Qué hace `npm run db:migrate`?**
- Lee los archivos SQL de migración en `fitness-app-backend/drizzle/*.sql`
- Ejecuta el SQL en tu base de datos PostgreSQL
- **Crea todas las tablas necesarias** (users, foods, exercises, logs, routines, etc.)
- Las migraciones ya están en el repositorio, no necesitas generarlas

**✅ Verificación:** Revisa los logs de Render para confirmar que las migraciones se ejecutaron correctamente.

---

## 🎨 Paso 4: Desplegar el Frontend

### 4.1 Crear el Static Site

1. **Ve a Dashboard → New + → Static Site**
2. **Conecta tu repositorio**
3. **Configura el sitio**:
   - **Name**: `fitness-app-frontend`
   - **Branch**: `main` (o tu rama principal)
   - **Root Directory**: `fitness-app-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: `Free`

### 4.2 Configurar Variables de Entorno

En la sección **Environment Variables**, agrega:

```env
# URL del backend (usa la URL que copiaste en el paso 3.4)
VITE_API_URL=https://fitness-app-backend.onrender.com/api

# Node Version
NODE_VERSION=18
```

### 4.3 Desplegar

1. Haz clic en **Create Static Site**
2. Render construirá y desplegará tu frontend
3. **Copia la URL del frontend** (ej: `https://fitness-app-frontend.onrender.com`)

### 4.4 Actualizar FRONTEND_URL en el Backend

1. Ve al servicio backend en Render
2. Edita la variable de entorno `FRONTEND_URL`
3. Cambia el valor a la URL de tu frontend: `https://fitness-app-frontend.onrender.com`
4. Guarda los cambios (esto reiniciará el backend)

---

## ✅ Paso 5: Verificar el Despliegue

### 5.1 Verificar Backend

1. Visita: `https://fitness-app-backend.onrender.com`
2. Deberías ver: "Servidor de Fitness App corriendo con Express y Drizzle!"
3. Prueba un endpoint: `https://fitness-app-backend.onrender.com/api/auth/register` (debería responder)

### 5.2 Verificar Frontend

1. Visita la URL de tu frontend
2. Deberías ver la aplicación React cargando
3. Intenta registrarte o iniciar sesión

### 5.3 Verificar Base de Datos

1. Ve al dashboard de la base de datos en Render
2. Verifica que las tablas se hayan creado (puedes usar el **Shell** de Render para conectarte)

---

## 🔄 Paso 6: Ejecutar Migraciones (si es necesario)

Si las migraciones no se ejecutaron automáticamente:

1. Ve al servicio backend en Render
2. Abre el **Shell** (terminal)
3. Ejecuta:
```bash
npm run db:migrate
```

---

## ⚙️ Configuración Adicional (Opcional)

### SMTP para Emails

Si quieres enviar emails de invitación, agrega estas variables al backend:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
SMTP_FROM=noreply@fitnessapp.com
```

**Nota**: Para Gmail, necesitas una "Contraseña de aplicación" (no tu contraseña normal).

### reCAPTCHA (Opcional)

Si usas reCAPTCHA, agrega:

```env
RECAPTCHA_SECRET_KEY=tu_clave_secreta
```

Y en el frontend:
```env
VITE_RECAPTCHA_SITE_KEY=tu_clave_publica
```

---

## 🚨 Solución de Problemas Comunes

### Error: "DATABASE_URL no está definido"

- Verifica que hayas vinculado la base de datos al servicio backend
- Revisa que `DATABASE_URL` esté en las variables de entorno

### Error: "CORS Error"

- Verifica que `FRONTEND_URL` en el backend sea la URL correcta del frontend
- Asegúrate de que la URL no termine con `/`

### El frontend no se conecta al backend

- Verifica que `VITE_API_URL` en el frontend sea la URL correcta del backend
- Asegúrate de incluir `/api` al final: `https://backend.onrender.com/api`

### El backend se "duerme" después de inactividad

- **Render Free Tier** tiene "spinning down" después de 15 minutos de inactividad
- La primera petición después de dormir puede tardar 30-60 segundos
- **Solución**: Usa un servicio de "ping" gratuito como [UptimeRobot](https://uptimerobot.com) para mantener el servicio activo

### Error en las migraciones

- Verifica que `DATABASE_URL` esté correctamente configurado
- Ejecuta las migraciones manualmente desde el Shell del servicio backend

---

## 💰 Límites del Plan Gratuito

- **Web Services**: 750 horas/mes (suficiente para 1 servicio 24/7)
- **PostgreSQL**: 90 días de retención, 1GB de almacenamiento
- **Static Sites**: Ilimitados
- **Spinning Down**: Los servicios se "duermen" después de 15 min de inactividad

---

## 🔐 Seguridad

1. **Nunca subas `.env` al repositorio** (ya debería estar en `.gitignore`)
2. **Usa variables de entorno** en Render para secretos
3. **JWT_SECRET**: Debe ser largo y aleatorio (mínimo 32 caracteres)
4. **DATABASE_URL**: Render lo maneja automáticamente, no lo copies manualmente

---

## 📝 Checklist Final

- [ ] Base de datos PostgreSQL creada
- [ ] Backend desplegado y funcionando
- [ ] Frontend desplegado y funcionando
- [ ] Variables de entorno configuradas
- [ ] Migraciones ejecutadas
- [ ] CORS configurado correctamente
- [ ] URLs actualizadas (FRONTEND_URL en backend, VITE_API_URL en frontend)
- [ ] Aplicación probada (registro, login, etc.)

---

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando completamente en Render.com de forma gratuita.

**URLs de ejemplo**:
- Backend: `https://fitness-app-backend.onrender.com`
- Frontend: `https://fitness-app-frontend.onrender.com`
- API: `https://fitness-app-backend.onrender.com/api`

---

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [Render Free Tier](https://render.com/docs/free)
- [PostgreSQL en Render](https://render.com/docs/databases)

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas push a tu repositorio:
- Render detectará los cambios automáticamente
- Reconstruirá y redesplegará el servicio
- No necesitas hacer nada manualmente

**Nota**: El primer despliegue puede tardar 5-10 minutos. Los siguientes son más rápidos (2-5 minutos).

