# 🔧 Solución: Errores CORS y "Unknown Address Space" con ngrok

## 🚨 Errores que estás viendo

### 1. Error CORS: "Permission was denied for this request to access the `unknown` address space"

**Causa:**
- Tu frontend está accesible a través de ngrok: `https://unexecuting-craggier-emile.ngrok-free.dev`
- Pero el frontend está intentando llamar a `http://localhost:4000` (tu backend local)
- Los navegadores modernos bloquean solicitudes desde orígenes públicos (HTTPS ngrok) a direcciones privadas (localhost) por seguridad

**Por qué ocurre:**
1. **Mixed Content**: Estás intentando hacer una solicitud HTTP desde una página HTTPS
2. **Private Network Access (CORS-RFC1918)**: Los navegadores bloquean solicitudes desde orígenes públicos a redes privadas/localhost por seguridad

### 2. Error 503: "Failed to load resource: the server responded with a status of 503"

**Causa:**
- El backend en `localhost:4000` no está accesible desde el navegador a través de ngrok
- O el backend no está corriendo
- O ngrok no está configurado para el backend

### 3. Error 404: "icons/icon-144x144.png: Failed to load resource"

**Causa:**
- Archivos de iconos faltantes en el frontend

---

## ✅ Soluciones

### Solución Principal: Exponer el Backend a través de ngrok

**El problema principal es que solo tienes el frontend expuesto a través de ngrok, pero el backend sigue siendo localhost.**

#### Paso 1: Exponer el Backend con ngrok

Abre una **nueva terminal** y ejecuta:

```bash
# Si tu backend está corriendo en el puerto 4000
ngrok http 4000
```

Esto te dará una URL como:
```
Forwarding: https://abc123.ngrok-free.dev -> http://localhost:4000
```

**Anota esta URL** (ej: `https://abc123.ngrok-free.dev`)

#### Paso 2: Configurar el Frontend para usar la URL de ngrok del Backend

Tienes dos opciones:

##### Opción A: Variable de Entorno (Recomendado para desarrollo)

1. **Crea o edita** el archivo `.env` en `fitness-app-frontend/`:

```env
VITE_API_URL=https://abc123.ngrok-free.dev/api
```

**⚠️ IMPORTANTE:** Reemplaza `abc123.ngrok-free.dev` con la URL real que te dio ngrok para el backend.

2. **Reinicia el servidor de desarrollo del frontend:**

```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciarlo
cd fitness-app-frontend
npm run dev
```

**Nota:** En Vite, las variables `VITE_*` se "bakean" (incrustan) en el código durante el build. Si cambias la variable, necesitas reiniciar el servidor de desarrollo.

##### Opción B: Modificar temporalmente el código (Solo para pruebas rápidas)

Si necesitas una solución rápida para probar, puedes modificar temporalmente `fitness-app-frontend/src/services/api.js`:

```javascript
// Línea 6 - Cambiar temporalmente
const API_URL = 'https://abc123.ngrok-free.dev/api'; // Reemplaza con tu URL de ngrok
```

**⚠️ NO olvides revertir este cambio después y usar la variable de entorno.**

#### Paso 3: Verificar que el Backend acepta el origen de ngrok

El backend ya está configurado para aceptar dominios de ngrok (líneas 144-146 en `fitness-app-backend/index.js`):

```javascript
/^https:\/\/.*\.ngrok-free\.dev$/,  // ngrok free domains
/^https:\/\/.*\.ngrok\.io$/,  // ngrok paid domains
/^https:\/\/.*\.ngrok-app\.dev$/,  // ngrok app domains
```

**Verifica que tu backend esté corriendo:**

```bash
# Verifica que el backend esté corriendo
curl http://localhost:4000/api/health

# O desde el navegador (en Windows, no a través de ngrok)
http://localhost:4000/api/health
```

---

### Solución Alternativa: Usar un solo túnel de ngrok con múltiples servicios

Si prefieres usar un solo túnel de ngrok, puedes configurar ngrok para que enrute tanto el frontend como el backend:

#### Opción: ngrok con múltiples servicios (ngrok config file)

1. **Crea un archivo `ngrok.yml`** en tu directorio home:

```yaml
version: "2"
authtoken: tu-token-de-ngrok
tunnels:
  frontend:
    addr: 3000  # O el puerto donde corre tu frontend
    proto: http
  backend:
    addr: 4000
    proto: http
```

2. **Inicia ngrok con la configuración:**

```bash
ngrok start --all
```

Esto creará dos túneles. Usa la URL del backend para `VITE_API_URL`.

---

### Solución para el Error 404 de Iconos

1. **Verifica que los iconos existan** en `fitness-app-frontend/public/icons/`:

```bash
ls fitness-app-frontend/public/icons/
```

2. **Si no existen**, créalos o actualiza el `manifest.json` para que apunte a iconos que sí existan.

---

## 🔍 Verificación

Después de aplicar las soluciones:

1. **Verifica que ambos servicios estén corriendo:**
   - Frontend: Accesible en `https://unexecuting-craggier-emile.ngrok-free.dev`
   - Backend: Accesible en `https://tu-backend-ngrok-url.ngrok-free.dev/api/health`

2. **Verifica la configuración del frontend:**
   - Abre las DevTools (F12) → Console
   - Deberías ver que las llamadas van a la URL de ngrok del backend, no a localhost

3. **Prueba una llamada API:**
   - Abre Network tab en DevTools
   - Intenta hacer login o cargar la página
   - Verifica que las solicitudes vayan a la URL correcta de ngrok

---

## 📝 Notas Importantes

### URLs de ngrok cambian

**⚠️ IMPORTANTE:** Las URLs de ngrok gratuitas cambian cada vez que reinicias ngrok (a menos que tengas un plan de pago).

**Solución temporal:** Cada vez que reinicies ngrok, actualiza `VITE_API_URL` en el `.env` del frontend y reinicia el servidor de desarrollo.

**Solución permanente:** Considera usar un plan de ngrok con dominio fijo, o mejor aún, despliega en un servicio como Render, Vercel, o Coolify.

### Desarrollo Local vs ngrok

Para desarrollo local normal (sin ngrok), usa:
```env
VITE_API_URL=http://localhost:4000/api
```

Para desarrollo con ngrok, usa:
```env
VITE_API_URL=https://tu-backend-ngrok-url.ngrok-free.dev/api
```

### CORS ya está configurado

El backend ya está configurado para aceptar solicitudes desde dominios de ngrok. El problema es que el frontend está llamando a `localhost` en lugar de la URL de ngrok del backend.

---

## 🚀 Próximos Pasos Recomendados

1. **Para desarrollo local:** Usa `localhost` directamente (sin ngrok)
2. **Para compartir temporalmente:** Usa ngrok con ambas URLs configuradas
3. **Para producción:** Despliega en un servicio como Render, Vercel, o Coolify con dominios reales

---

## 📚 Referencias

- [Private Network Access (CORS-RFC1918)](https://developer.chrome.com/blog/private-network-access-update/)
- [ngrok Documentation](https://ngrok.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

