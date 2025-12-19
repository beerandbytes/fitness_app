# 🚀 Guía Completa de Despliegue Gratuito - Fitness App

Esta guía te ayudará a desplegar tu aplicación de fitness de forma completamente gratuita en la nube.

## 📋 Arquitectura de Despliegue Recomendada

### Opción 1: Render + Vercel (Recomendado)
- **Backend + Base de Datos**: Render.com (100% gratuito)
- **Frontend**: Vercel (100% gratuito)

### Opción 2: Railway (Todo en uno)
- **Backend + Base de Datos + Frontend**: Railway.app (500 horas/mes gratis)

### Opción 3: Render + Netlify
- **Backend + Base de Datos**: Render.com
- **Frontend**: Netlify (100% gratuito)

---

## 🎯 OPCIÓN 1: Render + Vercel (Recomendado)

### Paso 1: Preparar el Código

#### 1.1 Actualizar API URL del Frontend
El archivo `fitness-app-frontend/src/services/api.js` ya está configurado para usar variables de entorno.

#### 1.2 Asegurar que CORS está configurado
El backend ya tiene CORS habilitado, así que debería funcionar.

---

### Paso 2: Desplegar Base de Datos PostgreSQL (Render)

#### 2.1 Crear cuenta
1. Ve a [https://render.com](https://render.com)
2. Haz clic en **"Get Started for Free"**
3. Conecta con tu cuenta de GitHub (recomendado)

#### 2.2 Crear Base de Datos PostgreSQL
1. En el dashboard, haz clic en **"New +"** → **"PostgreSQL"**
2. Configuración:
   ```
   Name: fitness-app-db
   Database: fitnessdb
   User: fitnessuser (o déjalo por defecto)
   Region: Oregon (o la más cercana a ti)
   PostgreSQL Version: 16
   Plan: Free
   ```
3. Haz clic en **"Create Database"**
4. Espera 2-3 minutos a que se cree
5. **IMPORTANTE**: Copia la **Internal Database URL** (la encontrarás en la sección "Connections")
   - Se verá algo como: `postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/fitnessdb`

---

### Paso 3: Desplegar Backend (Render)

#### 3.1 Preparar repositorio
Asegúrate de que todo tu código esté en GitHub.

#### 3.2 Crear servicio web
1. En Render, haz clic en **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Si no está conectado:
   - Haz clic en **"Connect account"**
   - Autoriza Render para acceder a tus repositorios
4. Selecciona tu repositorio
5. Configuración del servicio:
   ```
   Name: fitness-app-backend
   Region: Oregon (misma que la base de datos)
   Branch: main (o la rama principal)
   Root Directory: fitness-app-backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```
6. Haz clic en **"Create Web Service"**

#### 3.3 Configurar Variables de Entorno
En la sección "Environment" del servicio web, añade estas variables:

```env
DATABASE_URL=postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/fitnessdb
JWT_SECRET=tu-secret-key-muy-segura-genera-una-aleatoria
PORT=10000
NODE_ENV=production
```

**Generar JWT_SECRET seguro:**
- En tu terminal local ejecuta: `openssl rand -hex 32`
- O usa un generador online de tokens aleatorios

#### 3.4 Configurar CORS
El backend ya tiene CORS configurado, pero asegúrate de que permita tu dominio de Vercel. El código actual usa `cors()` sin restricciones, así que debería funcionar.

#### 3.5 Desplegar
1. Render comenzará a desplegar automáticamente
2. Espera a que termine el despliegue (5-10 minutos la primera vez)
3. Copia la URL de tu servicio (algo como: `https://fitness-app-backend.onrender.com`)

#### 3.6 Ejecutar Migraciones
Una vez desplegado, necesitas ejecutar las migraciones de la base de datos:

**Opción A - Desde tu máquina local (temporalmente):**
1. Obtén la **External Database URL** de Render (en la sección Connections de la BD)
2. Crea un archivo `.env.temp` localmente:
   ```env
   DATABASE_URL=postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/fitnessdb
   ```
3. Ejecuta:
   ```bash
   cd fitness-app-backend
   node scripts/run-calendar-migration.js
   node scripts/run-onboarding-migration.js
   node db/migrate.js
   ```

**Opción B - Desde Render Shell:**
1. En el servicio web de Render, ve a la pestaña "Shell"
2. Ejecuta:
   ```bash
   node db/migrate.js
   ```

---

### Paso 4: Desplegar Frontend (Vercel)

#### 4.1 Crear cuenta
1. Ve a [https://vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"**
3. Conecta con tu cuenta de GitHub

#### 4.2 Importar proyecto
1. Haz clic en **"Add New..."** → **"Project"**
2. Selecciona tu repositorio de GitHub
3. Configuración:
   ```
   Framework Preset: Vite
   Root Directory: fitness-app-frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
4. Haz clic en **"Configure"**

#### 4.3 Configurar Variables de Entorno
En la sección "Environment Variables", añade:

```env
VITE_API_URL=https://fitness-app-backend.onrender.com/api
```

**⚠️ IMPORTANTE**: Reemplaza `fitness-app-backend.onrender.com` con la URL real de tu backend en Render.

#### 4.4 Desplegar
1. Haz clic en **"Deploy"**
2. Espera 2-3 minutos
3. Vercel te dará una URL como: `https://tu-app.vercel.app`

---

## 🎯 OPCIÓN 2: Railway (Todo en uno - Alternativa más simple)

Railway ofrece un tier gratuito con 500 horas/mes y $5 de crédito.

### Paso 1: Crear cuenta en Railway
1. Ve a [https://railway.app](https://railway.app)
2. Inicia sesión con GitHub

### Paso 2: Crear nuevo proyecto
1. Haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Elige tu repositorio

### Paso 3: Añadir base de datos PostgreSQL
1. En el proyecto, haz clic en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente la base de datos

### Paso 4: Configurar backend
1. Añade un servicio desde el directorio `fitness-app-backend`
2. Railway detectará automáticamente que es Node.js
3. Variables de entorno:
   - Railway añadirá automáticamente `DATABASE_URL`
   - Añade manualmente:
     ```env
     JWT_SECRET=tu-secret-key
     PORT=10000
     NODE_ENV=production
     ```

### Paso 5: Configurar frontend
1. Añade otro servicio desde `fitness-app-frontend`
2. Variables de entorno:
   ```env
   VITE_API_URL=https://tu-backend-service.railway.app/api
   ```

---

## 📝 Archivos de Configuración Creados

He creado los siguientes archivos para facilitar el despliegue:

1. **`fitness-app-backend/render.yaml`** - Configuración de Render
2. **`fitness-app-frontend/vercel.json`** - Configuración de Vercel
3. **`DEPLOYMENT_GUIDE.md`** - Esta guía

---

## 🔧 Configuraciones Importantes

### Backend
- ✅ CORS ya está configurado
- ✅ Puerto configurable mediante `PORT` env var
- ✅ Script `start` añadido al package.json

### Frontend
- ✅ API URL configurable mediante `VITE_API_URL`
- ✅ Fallback a localhost para desarrollo

---

## ✅ Checklist de Despliegue

### Base de Datos
- [ ] Cuenta en Render creada
- [ ] Base de datos PostgreSQL creada
- [ ] Internal Database URL copiada

### Backend
- [ ] Código subido a GitHub
- [ ] Servicio web creado en Render
- [ ] Variables de entorno configuradas (DATABASE_URL, JWT_SECRET, PORT, NODE_ENV)
- [ ] Servicio desplegado correctamente
- [ ] URL del backend copiada
- [ ] Migraciones ejecutadas

### Frontend
- [ ] Cuenta en Vercel creada
- [ ] Proyecto importado desde GitHub
- [ ] Variable VITE_API_URL configurada con la URL del backend
- [ ] Frontend desplegado
- [ ] Aplicación funcionando correctamente

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to database"
- Verifica que estés usando la **Internal Database URL** en Render
- Asegúrate de que la base de datos esté activa
- Verifica que las variables de entorno estén correctamente configuradas

### Error: "CORS policy blocked"
- El backend ya tiene CORS habilitado
- Si persiste, verifica que la URL del frontend esté en la lista de orígenes permitidos (aunque actualmente permite todos)

### Error: "401 Unauthorized"
- Verifica que el JWT_SECRET esté configurado correctamente
- Asegúrate de que el frontend esté usando la URL correcta del backend

### El frontend no carga
- Verifica los logs en Vercel
- Asegúrate de que `VITE_API_URL` esté configurada
- Verifica que el build se haya completado correctamente

### Las migraciones no se ejecutan
- Ejecútalas manualmente desde tu máquina local usando la External Database URL
- O crea un script de inicio que ejecute migraciones antes de iniciar el servidor

---

## 🔄 Despliegue Automático

Ambas plataformas (Render y Vercel) ofrecen despliegue automático:
- Cada push a `main` desplegará automáticamente
- Puedes configurar branches específicos en las configuraciones

---

## 💰 Límites del Plan Gratuito

### Render Free Tier
- **Web Services**: Duermen después de 15 minutos de inactividad
- **Base de Datos**: Válida por 90 días (luego necesitas actualizar)
- **Ancho de banda**: Limitado pero suficiente para desarrollo/pequeños proyectos

### Vercel Free Tier
- **Ancho de banda**: 100GB/mes
- **Builds**: Ilimitados
- **Dominio personalizado**: Gratis

### Railway Free Tier
- **Créditos**: $5 gratis/mes
- **Horas**: 500 horas/mes
- **Base de datos**: Incluida en el crédito

---

## 🚀 Pasos Rápidos (Resumen)

1. **Base de datos**: Crear PostgreSQL en Render → Copiar Internal URL
2. **Backend**: Crear Web Service en Render → Configurar variables → Desplegar → Ejecutar migraciones
3. **Frontend**: Importar en Vercel → Configurar VITE_API_URL → Desplegar
4. **¡Listo!** Tu aplicación estará en línea

---

## 📚 Enlaces Útiles

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

---

¿Necesitas ayuda con algún paso específico? ¡Dime y te ayudo!
