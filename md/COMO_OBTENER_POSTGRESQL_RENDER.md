# 🗄️ Cómo Obtener la URL de PostgreSQL de Render

Esta guía te explica paso a paso cómo obtener la URL de conexión y credenciales de tu base de datos PostgreSQL en Render.

---

## 📋 Paso 1: Crear la Base de Datos PostgreSQL (Si aún no la tienes)

1. **Inicia sesión en Render.com**: https://dashboard.render.com
2. **Ve al Dashboard** (pantalla principal)
3. **Haz clic en "New +"** (botón azul en la esquina superior derecha)
4. **Selecciona "PostgreSQL"**

### Configuración de la Base de Datos:

```
Name: fitness-app-db
Database: fitnessdb
User: fitnessuser
Region: Oregon (o la más cercana a ti)
PostgreSQL Version: 16
Plan: Free
```

5. **Haz clic en "Create Database"**

---

## 📍 Paso 2: Obtener la URL de Conexión (Internal Database URL)

Una vez creada la base de datos, sigue estos pasos:

### Opción A: Desde el Dashboard de la Base de Datos

1. **En tu Dashboard de Render**, haz clic en tu base de datos PostgreSQL (`fitness-app-db`)
2. **En la pestaña "Info"** (por defecto), verás varias secciones:
   - **Connection Info** - Aquí están las credenciales individuales
   - **Internal Database URL** - Esta es la URL completa que necesitas ✅

3. **Busca la sección "Internal Database URL"**
   - Verás algo como:
     ```
     postgresql://fitnessuser:password@dpg-xxxxx-a.oregon-postgres.render.com/fitnessdb
     ```
   - **Copia esta URL completa** - Esta es la que usarás en `DATABASE_URL`

---

## 🔑 Paso 3: Entender la URL (Opcional)

La URL de PostgreSQL tiene este formato:

```
postgresql://usuario:contraseña@host:puerto/nombre_base_datos
```

**Ejemplo:**

```
postgresql://fitnessuser:abc123xyz@dpg-xxxxx-a.oregon-postgres.render.com:5432/fitnessdb
```

**Desglose:**

- `postgresql://` - Protocolo
- `fitnessuser` - Usuario de la base de datos
- `abc123xyz` - Contraseña (generada automáticamente por Render)
- `dpg-xxxxx-a.oregon-postgres.render.com` - Host (servidor)
- `5432` - Puerto (por defecto 5432, puede no aparecer en la URL)
- `fitnessdb` - Nombre de la base de datos

---

## 🔗 Paso 4: Obtener la URL Interna vs Externa

Render proporciona dos tipos de URLs:

### ✅ Internal Database URL (RECOMENDADA)

- **Usa esta** si tu backend está en Render
- Más rápida y segura (tráfico interno)
- Formato: `postgresql://...@dpg-xxxxx-a.oregon-postgres.render.com/...`
- **Esta es la que debes usar para `DATABASE_URL`**

### External Database URL (Solo si necesitas conectar desde fuera de Render)

- Solo si quieres conectar desde tu máquina local u otro servidor
- Más lenta pero accesible desde internet
- Formato: `postgresql://...@dpg-xxxxx-a.oregon-postgres.render.com:5432/...`

**Para desarrollo local**, también puedes usar la External Database URL en tu `.env` local.

---

## ⚙️ Paso 5: Obtener Credenciales Individuales (Si las necesitas)

Si necesitas los componentes individuales (usuario, contraseña, host, etc.):

1. **En el Dashboard de tu base de datos**, ve a la pestaña **"Info"**
2. **Busca la sección "Connection Info"**
3. Verás:
   - **Host**: `dpg-xxxxx-a.oregon-postgres.render.com`
   - **Port**: `5432`
   - **Database**: `fitnessdb`
   - **User**: `fitnessuser`
   - **Password**: `[Haz clic en "Show" para verla]`

**Nota:** Render genera automáticamente una contraseña segura. Puedes verla haciendo clic en el botón "Show" junto al campo Password.

---

## 🔧 Paso 6: Configurar en Render (Variables de Entorno)

Una vez que tengas la Internal Database URL, configúrala en tu servicio backend:

### Método 1: Link Database (Más Fácil - RECOMENDADO)

1. **Ve al Dashboard de tu servicio backend** (`fitness-app-backend`)
2. **Ve a la pestaña "Environment"**
3. **Busca la sección "Link Database"**
4. **Haz clic en "Link Database"**
5. **Selecciona** tu base de datos (`fitness-app-db`)
6. **Render automáticamente:**
   - Crea la variable `DATABASE_URL` con la Internal Database URL
   - La configura como variable de entorno
   - ¡Listo! No necesitas copiarla manualmente

### Método 2: Configuración Manual

Si prefieres hacerlo manualmente:

1. **Ve al Dashboard de tu servicio backend**
2. **Ve a la pestaña "Environment"**
3. **En "Environment Variables"**, haz clic en "Add Environment Variable"
4. **Configura:**
   - **Key**: `DATABASE_URL`
   - **Value**: Pega la Internal Database URL que copiaste
5. **Haz clic en "Save Changes"**

---

## 💻 Paso 7: Configurar en .env Local (Para Desarrollo)

Si quieres usar la misma base de datos para desarrollo local:

1. **Obtén la External Database URL** (o usa la Internal si tu VPN permite)
2. **Abre tu archivo `.env`** en `fitness-app-backend/.env`
3. **Agrega o actualiza:**

```env
DATABASE_URL=postgresql://fitnessuser:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/fitnessdb
```

**Ejemplo completo del .env:**

```env
# Base de datos PostgreSQL de Render
DATABASE_URL=postgresql://fitnessuser:abc123xyz@dpg-xxxxx-a.oregon-postgres.render.com:5432/fitnessdb

# JWT Secret (genera uno nuevo para desarrollo)
JWT_SECRET=tu_secreto_jwt_local_muy_largo_y_seguro_minimo_32_caracteres

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Node Environment
NODE_ENV=development

# Puerto
PORT=4000
```

---

## 🔐 Paso 8: Generar un JWT_SECRET (Si aún no lo tienes)

Para generar un JWT_SECRET seguro, usa:

### En Windows (PowerShell):

```powershell
# Opción 1: OpenSSL (si lo tienes instalado)
openssl rand -base64 32

# Opción 2: PowerShell nativo
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### En Linux/Mac:

```bash
openssl rand -base64 32
```

O simplemente usa un generador online de secretos aleatorios.

---

## ✅ Paso 9: Verificar la Conexión

### Desde Render (Logs del Backend):

1. **Ve a tu servicio backend en Render**
2. **Ve a la pestaña "Logs"**
3. **Busca mensajes como:**
   - ✅ `Database connected successfully`
   - ✅ `Server running on port 4000`
   - ❌ Si ves errores de conexión, verifica la URL

### Desde Local (Terminal):

```bash
cd fitness-app-backend
npm start
```

Deberías ver:

```
✅ Database connected successfully
🚀 Server running on port 4000
```

---

## 🔄 Paso 10: Actualizar la URL (Si es necesario)

Si necesitas cambiar la URL de la base de datos:

1. **En Render Dashboard**, ve a tu base de datos
2. **Copia la nueva Internal Database URL**
3. **En tu servicio backend**, ve a "Environment"
4. **Edita la variable `DATABASE_URL`**
5. **Pega la nueva URL**
6. **Guarda los cambios**
7. Render reiniciará automáticamente tu servicio

---

## 🚨 Problemas Comunes

### Error: "Connection refused"

- Verifica que estés usando la **Internal Database URL** (no la External)
- Asegúrate de que la base de datos esté "Available" (no "Spinning down")

### Error: "Password authentication failed"

- La contraseña cambió - Obtén la nueva desde el Dashboard
- Verifica que estés usando la URL correcta

### Error: "Database does not exist"

- Verifica el nombre de la base de datos en la URL
- Asegúrate de que la base de datos esté creada y activa

### La base de datos está "Spinning down"

- Render "duerme" las bases de datos gratuitas después de inactividad
- La primera conexión después de dormir puede tardar 30-60 segundos
- Considera usar un plan de pago si necesitas que esté siempre disponible

---

## 📝 Resumen Rápido

1. ✅ **Crear PostgreSQL** en Render → Dashboard → New + → PostgreSQL
2. ✅ **Copiar Internal Database URL** → Dashboard de la DB → Info → Internal Database URL
3. ✅ **Link Database** → Dashboard del backend → Environment → Link Database
4. ✅ **O configurar manualmente** → Environment → Add Variable → `DATABASE_URL` = [URL]

**Para desarrollo local:**

- Usa la External Database URL en tu `.env`
- O configura una base de datos local

---

## 🔗 Enlaces Útiles

- [Render Dashboard](https://dashboard.render.com)
- [Render PostgreSQL Docs](https://render.com/docs/databases)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)

---

¿Necesitas ayuda? Revisa los logs de Render para ver mensajes de error específicos.
