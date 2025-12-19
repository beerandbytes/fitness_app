# 📋 Guía de Configuración de Variables de Entorno

## Variables Obligatorias

### 1. DATABASE_URL

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/fitness_app
```

**Descripción:** URL de conexión a PostgreSQL  
**Formato:** `postgresql://usuario:contraseña@host:puerto/nombre_base_datos`

#### 🗄️ Cómo Obtener la URL de PostgreSQL en Render:

1. **Ve a Render Dashboard** → Tu base de datos PostgreSQL
2. **Pestaña "Info"** → Busca "Internal Database URL"
3. **Copia la URL completa** - Se ve así:
   ```
   postgresql://fitnessuser:password@dpg-xxxxx-a.oregon-postgres.render.com/fitnessdb
   ```
4. **En Render (producción)**: Usa esta URL en las variables de entorno del servicio backend
5. **En local (.env)**: Puedes usar la "External Database URL" para desarrollo

**📖 Guía detallada:** Ver [COMO_OBTENER_POSTGRESQL_RENDER.md](./COMO_OBTENER_POSTGRESQL_RENDER.md)

**💡 Método Más Fácil:** En el dashboard de tu servicio backend → Environment → "Link Database" → Selecciona tu base de datos. Render configurará automáticamente `DATABASE_URL`.

### 2. JWT_SECRET

```env
JWT_SECRET=tu_secreto_jwt_muy_largo_y_seguro_minimo_32_caracteres
```

**Descripción:** Secreto para firmar tokens JWT  
**Recomendación:** Mínimo 32 caracteres, usar un generador de secretos aleatorios

#### 🔐 Cómo Generar y Configurar JWT_SECRET:

**Generar un secreto seguro:**

- **Windows (PowerShell)**: `openssl rand -base64 32`
- **Linux/Mac**: `openssl rand -base64 32`
- **Online**: Usa un generador de secretos aleatorios (mínimo 32 caracteres)

**Configurar:**

- **Local (.env)**: Agrega `JWT_SECRET=tu_secreto_aqui` en `fitness-app-backend/.env`
- **Render (producción)**: Dashboard → Tu servicio backend → Environment → Add Variable → `JWT_SECRET` = [tu secreto]

**Verificación automática:**

- La app valida que existe al iniciar (error si falta)
- Te avisa si es muy corto (menos de 32 caracteres)
- No iniciará si falta esta variable crítica

**📖 Guía detallada:** Ver [COMO_CONFIGURAR_JWT_SECRET.md](./COMO_CONFIGURAR_JWT_SECRET.md)

**⚠️ IMPORTANTE:**

- La aplicación **NO iniciará** sin `JWT_SECRET`
- Debe tener al menos 32 caracteres para mayor seguridad
- Usa diferentes secretos en desarrollo y producción

### 3. JWT_REFRESH_SECRET (Opcional)

```env
JWT_REFRESH_SECRET=tu_secreto_refresh_token_muy_largo_y_seguro
```

**Descripción:** Secreto para refresh tokens (si no se define, usa JWT_SECRET)

## Variables Recomendadas

### 4. FRONTEND_BASE_URL

```env
FRONTEND_BASE_URL=http://localhost:5173
```

**Descripción:** URL base del frontend (para enlaces de invitación)  
**Producción:** `https://tudominio.com`

### 5. SMTP (Para emails de invitación)

#### Gmail:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
SMTP_FROM=noreply@fitnessapp.com
```

**Nota para Gmail:** Necesitas crear una "Contraseña de aplicación" en tu cuenta de Google:

1. Ve a tu cuenta de Google
2. Seguridad → Verificación en 2 pasos
3. Contraseñas de aplicaciones
4. Genera una nueva contraseña para "Correo"

#### Mailtrap (Para desarrollo):

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=tu_usuario_mailtrap
SMTP_PASS=tu_contraseña_mailtrap
SMTP_FROM=noreply@fitnessapp.com
```

## Variables Opcionales

### 6. ADMIN_EMAILS

```env
ADMIN_EMAILS=admin@ejemplo.com,coach@ejemplo.com
```

**Descripción:** Lista de emails separados por comas que serán administradores automáticamente

### 7. PORT

```env
PORT=4000
```

**Descripción:** Puerto del servidor backend (por defecto: 4000)

### 8. NODE_ENV

```env
NODE_ENV=development
```

**Descripción:** Entorno de ejecución (`development`, `production`, `test`)

## 🔧 Pasos para Configurar

1. **Copia el archivo de ejemplo:**

   ```bash
   cd fitness-app-backend
   cp .env.example .env
   ```

2. **Edita el archivo `.env` con tus valores:**
   - Configura `DATABASE_URL` con tus credenciales de PostgreSQL
   - Genera un `JWT_SECRET` seguro (puedes usar: `openssl rand -base64 32`)
   - Configura `FRONTEND_BASE_URL` según tu entorno
   - Configura SMTP si quieres enviar emails de invitación

3. **Verifica la configuración:**
   El servidor validará automáticamente las variables al iniciar.

## ⚠️ Importante

- **NUNCA** subas el archivo `.env` al repositorio
- El archivo `.env` ya debería estar en `.gitignore`
- Para producción, usa variables de entorno del servidor/hosting

## 🧪 Probar Configuración

Una vez configurado, puedes probar iniciando el servidor:

```bash
cd fitness-app-backend
npm start
```

Si hay variables faltantes, el servidor te indicará cuáles faltan.
