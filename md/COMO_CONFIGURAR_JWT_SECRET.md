# 🔐 Cómo Configurar JWT_SECRET Correctamente

Esta guía te explica cómo generar, configurar y verificar que tu `JWT_SECRET` esté correctamente configurado para evitar errores.

---

## ✅ ¿Cómo Sé que No Tendré Errores?

Tu aplicación tiene **validación automática** que te avisará si hay problemas:

1. **Validación al Iniciar**: La app verifica que `JWT_SECRET` exista
2. **Validación de Longitud**: Te avisa si es muy corto (menos de 32 caracteres)
3. **Error Inmediato**: Si falta, la app **NO iniciará** y te dirá qué falta

---

## 📋 Requisitos de JWT_SECRET

- ✅ **Obligatorio**: Debe existir (la app no iniciará sin él)
- ✅ **Recomendado**: Mínimo 32 caracteres para mayor seguridad
- ✅ **Formato**: Puede ser cualquier cadena de texto aleatoria

---

## 🔧 Paso 1: Generar un JWT_SECRET Seguro

### Opción A: Usando OpenSSL (Recomendado)

#### En Windows (PowerShell):

```powershell
# Si tienes OpenSSL instalado
openssl rand -base64 32

# Resultado ejemplo:
# 8xK7mN2pQ9vL5wR3tY6uI1oP4aS8dF0gH5jK2lM9=
```

#### En Linux/Mac:

```bash
openssl rand -base64 32
```

### Opción B: Usando PowerShell (Solo Windows)

```powershell
# Genera 32 caracteres aleatorios
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Opción C: Generador Online

Puedes usar generadores online de secretos aleatorios:

- https://randomkeygen.com/
- https://www.grc.com/passwords.htm

**Nota:** Asegúrate de generar al menos 32 caracteres.

---

## 💻 Paso 2: Configurar en Desarrollo Local (.env)

1. **Abre tu archivo** `fitness-app-backend/.env`
2. **Agrega o actualiza** la línea:
   ```env
   JWT_SECRET=tu_secreto_generado_aqui_minimo_32_caracteres
   ```
3. **Ejemplo:**
   ```env
   JWT_SECRET=8xK7mN2pQ9vL5wR3tY6uI1oP4aS8dF0gH5jK2lM9=
   ```

---

## 🚀 Paso 3: Configurar en Render (Producción)

### Método 1: Desde el Dashboard (Recomendado)

1. **Ve a Render Dashboard**: https://dashboard.render.com
2. **Selecciona tu servicio backend** (`fitness-app-backend`)
3. **Ve a la pestaña "Environment"**
4. **En "Environment Variables"**, haz clic en **"Add Environment Variable"**
5. **Configura:**
   - **Key**: `JWT_SECRET`
   - **Value**: Pega el secreto que generaste
6. **Haz clic en "Save Changes"**
7. Render reiniciará automáticamente tu servicio

### Método 2: Usando Render CLI (Opcional)

```bash
# Instalar Render CLI (si no lo tienes)
npm install -g render-cli

# Configurar JWT_SECRET
render env:set JWT_SECRET="tu_secreto_aqui" --service fitness-app-backend
```

---

## ✅ Paso 4: Verificar que Está Configurado Correctamente

### Desde Local (.env)

```bash
cd fitness-app-backend
npm start
```

**Deberías ver:**

```
✅ Todas las variables de entorno validadas correctamente
🚀 Servidor Express escuchando en http://localhost:4000
```

**Si hay errores, verás:**

```
❌ Variables de entorno críticas faltantes: JWT_SECRET
Por favor, configura estas variables en tu archivo .env
```

**Si es muy corto, verás:**

```
⚠️  JWT_SECRET es demasiado corto. Se recomienda al menos 32 caracteres para mayor seguridad.
```

### Desde Render (Producción)

1. **Ve a tu servicio backend en Render**
2. **Ve a la pestaña "Logs"**
3. **Busca mensajes como:**
   - ✅ `✅ Todas las variables de entorno validadas correctamente`
   - ✅ `🚀 Server running on port 4000`
   - ❌ `❌ Variables de entorno críticas faltantes: JWT_SECRET`

---

## 🧪 Paso 5: Probar que Funciona

### Test Rápido: Crear un Token JWT

1. **Inicia tu servidor** (local o producción)
2. **Intenta registrarte o hacer login**
3. **Si recibes un token**, significa que `JWT_SECRET` está funcionando ✅

### Test Manual: Verificar que Existe

```bash
# En tu terminal local
cd fitness-app-backend

# Verificar que está en .env (sin mostrar el valor)
cat .env | grep JWT_SECRET

# Deberías ver:
# JWT_SECRET=...
```

---

## 🔄 Paso 6: Configurar JWT_REFRESH_SECRET (Opcional)

Si quieres usar un secreto diferente para refresh tokens:

1. **Genera otro secreto** (puedes usar el mismo método)
2. **Agrega en `.env`**:
   ```env
   JWT_SECRET=tu_secreto_principal
   JWT_REFRESH_SECRET=tu_secreto_diferente_para_refresh_tokens
   ```

**Nota:** Si no defines `JWT_REFRESH_SECRET`, se usará `JWT_SECRET` automáticamente.

---

## 🚨 Problemas Comunes y Soluciones

### Error: "JWT_SECRET no está definido"

**Causa:** La variable no está configurada.

**Solución:**

1. Verifica que existe en `.env` (local) o en Render (producción)
2. Verifica que no tiene espacios extra
3. Reinicia el servidor después de agregar la variable

### Advertencia: "JWT_SECRET es demasiado corto"

**Causa:** El secreto tiene menos de 32 caracteres.

**Solución:**

1. Genera un nuevo secreto con al menos 32 caracteres
2. Actualiza la variable con el nuevo valor
3. La app funcionará, pero es menos seguro

### Error: "Invalid token" o "Token verification failed"

**Causa:** El `JWT_SECRET` cambió, o los tokens fueron firmados con un secreto diferente.

**Solución:**

1. Si cambiaste el `JWT_SECRET`, los usuarios deben hacer login de nuevo
2. Asegúrate de usar el mismo `JWT_SECRET` en desarrollo y producción si quieres que los tokens funcionen en ambos
3. **No cambies** `JWT_SECRET` en producción sin avisar a los usuarios

---

## 📝 Ejemplo Completo de .env

```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@host:5432/fitnessdb

# JWT Secret (OBLIGATORIO - mínimo 32 caracteres)
JWT_SECRET=8xK7mN2pQ9vL5wR3tY6uI1oP4aS8dF0gH5jK2lM9=

# JWT Refresh Secret (Opcional)
JWT_REFRESH_SECRET=9yL8nO3qR0wM6xS4uZ7vJ2pQ5bT9eG1hI6kL3mN0=

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Node Environment
NODE_ENV=development

# Puerto
PORT=4000
```

---

## 🔐 Seguridad: Mejores Prácticas

1. ✅ **Usa un secreto diferente** en desarrollo y producción
2. ✅ **Mínimo 32 caracteres** (mejor 64 o más)
3. ✅ **No compartas** tu `JWT_SECRET` públicamente
4. ✅ **No lo subas** a GitHub (debe estar en `.gitignore`)
5. ✅ **Rótalo periódicamente** en producción (cada 6-12 meses)

---

## ✅ Checklist de Verificación

- [ ] Generé un `JWT_SECRET` con al menos 32 caracteres
- [ ] Lo agregué a mi archivo `.env` local
- [ ] Lo configuré en Render (producción)
- [ ] El servidor inicia sin errores
- [ ] Veo el mensaje: "✅ Todas las variables de entorno validadas correctamente"
- [ ] Puedo hacer login y recibir un token
- [ ] No hay advertencias sobre JWT_SECRET

---

## 📖 Resumen Rápido

1. **Genera** un secreto: `openssl rand -base64 32`
2. **Configura** en `.env` (local) y Render (producción)
3. **Verifica** que el servidor inicia sin errores
4. **Prueba** haciendo login - si recibes un token, funciona ✅

---

## 🆘 Si Sigue Fallando

1. **Revisa los logs** del servidor para ver el error exacto
2. **Verifica** que la variable se llama exactamente `JWT_SECRET` (sin espacios)
3. **Asegúrate** de reiniciar el servidor después de cambiar la variable
4. **En Render**, verifica que guardaste los cambios y espera a que reinicie

---

**¿Listo?** Ahora tu `JWT_SECRET` está correctamente configurado y no deberías tener errores. 🎉
