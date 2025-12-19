# 📦 Instrucciones de Instalación - Mejoras Implementadas

## 🚀 Pasos para Aplicar las Mejoras

### 1. Instalar Nuevas Dependencias

```bash
cd fitness-app-backend
npm install
```

Esto instalará:
- `express-rate-limit` - Rate limiting
- `express-validator` - Validación
- `winston` - Logging estructurado
- `node-cache` - Sistema de cache
- `zod` - Validación de esquemas (para uso futuro)

### 2. Configurar Variables de Entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` y configura:

```env
# Variables críticas (requeridas)
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_base_datos
JWT_SECRET=tu-secret-key-super-segura-y-larga-minimo-32-caracteres

# Variables recomendadas
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
FRONTEND_BASE_URL=http://localhost:5173

# Refresh Token (opcional, usa JWT_SECRET si no se define)
JWT_REFRESH_SECRET=otro-secret-diferente-y-largo

# Logging (opcional)
LOG_LEVEL=info

# Administradores (opcional)
ADMIN_EMAILS=admin@tudominio.com,coach@tudominio.com

# SMTP (opcional, para recuperación de contraseña)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
SMTP_FROM=no-reply@fitness-app.local
```

**⚠️ IMPORTANTE**: 
- `JWT_SECRET` debe tener al menos 32 caracteres para mayor seguridad
- Si no defines `JWT_REFRESH_SECRET`, se usará `JWT_SECRET` como fallback

### 3. Crear Directorio de Logs

```bash
mkdir -p logs
```

Los logs se guardarán en:
- `logs/error.log` - Solo errores
- `logs/combined.log` - Todos los logs

### 4. Verificar que Todo Funciona

```bash
npm start
```

Deberías ver:
```
✅ Todas las variables de entorno validadas correctamente
🚀 Servidor Express escuchando en http://localhost:4000
```

Si hay errores, revisa los mensajes de validación.

---

## 🔄 Cambios en el Frontend (Opcional)

### Actualizar para Usar Refresh Tokens

Si quieres usar refresh tokens en el frontend, actualiza `AuthContext.jsx`:

```javascript
// Guardar refresh token
localStorage.setItem('refreshToken', refreshToken);

// Función para refrescar token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');
  
  const response = await api.post('/auth/refresh', { refreshToken });
  localStorage.setItem('userToken', response.data.token);
  return response.data.token;
};
```

### Manejar Errores 401

Agrega un interceptor en `services/api.js`:

```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await refreshAccessToken();
        // Reintentar request original
        return api.request(error.config);
      } catch (refreshError) {
        // Logout si refresh falla
        localStorage.removeItem('userToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 🧪 Probar las Mejoras

### 1. Rate Limiting

Intenta hacer más de 5 requests a `/api/auth/login` en 15 minutos. Deberías recibir:
```json
{
  "error": "Demasiados intentos de autenticación. Por favor, intenta de nuevo en 15 minutos."
}
```

### 2. Validación de Contraseñas

Intenta registrar con una contraseña débil (ej: "123456"). Deberías recibir errores específicos.

### 3. Paginación

Haz un GET a `/api/exercises?page=1&limit=10` y verifica la respuesta con metadatos de paginación.

### 4. Cache

Haz dos requests seguidos a `/api/exercises`. El segundo debería ser más rápido (verifica en logs).

### 5. Logs

Revisa `logs/combined.log` para ver logs estructurados.

---

## ⚠️ Notas Importantes

1. **Backward Compatibility**: Las mejoras son compatibles con el código existente, pero algunas rutas ahora requieren validación adicional.

2. **Rate Limiting**: Los límites pueden ser ajustados en `middleware/rateLimiter.js` según tus necesidades.

3. **Cache**: El cache se invalida automáticamente cuando se crean nuevos recursos, pero puedes invalidarlo manualmente si es necesario.

4. **Logs en Producción**: En producción, los logs se guardan en formato JSON en archivos. Asegúrate de tener espacio suficiente.

5. **Variables de Entorno**: La aplicación NO iniciará si faltan variables críticas. Esto previene errores en runtime.

---

## 🐛 Troubleshooting

### Error: "Variables de entorno críticas faltantes"
- Verifica que tu archivo `.env` existe y tiene `DATABASE_URL` y `JWT_SECRET`

### Error: "JWT_SECRET es demasiado corto"
- Aumenta la longitud de `JWT_SECRET` a al menos 32 caracteres

### Error: "PORT debe ser un número entre 1 y 65535"
- Verifica que `PORT` en `.env` sea un número válido

### Los logs no se crean
- Verifica que el directorio `logs/` existe y tiene permisos de escritura

### Rate limiting muy restrictivo
- Ajusta los límites en `middleware/rateLimiter.js`

---

## 📚 Documentación Adicional

- Ver `MEJORAS_IMPLEMENTADAS.md` para detalles de todas las mejoras
- Ver `ANALISIS_CODIGO_COMPLETO.md` para el análisis original
- Ver `RESUMEN_ANALISIS.md` para un resumen ejecutivo

---

**¡Listo!** Todas las mejoras están implementadas y listas para usar. 🎉

