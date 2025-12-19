# 🐛 Guía de Debug - Problema de Registro

## Problemas Comunes y Soluciones

### 1. Error: "La contraseña debe contener al menos..."

**Problema:** La validación de contraseña es estricta.

**Requisitos de contraseña:**

- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial (@$!%\*?&)
- Sin espacios

**Ejemplo de contraseña válida:** `Test123!`

### 2. Error: "Error de validación"

**Problema:** El formato de error no se muestra correctamente.

**Solución:** Los errores ahora muestran el primer mensaje de validación de forma clara.

### 3. Error: "Error interno del servidor"

**Posibles causas:**

- La columna `role` no existe en la base de datos
- Error de conexión a la base de datos
- Problema con el hash de la contraseña

**Solución:**

1. Verificar que las migraciones se ejecutaron: `npm run db:migrate`
2. Verificar que DATABASE_URL está configurado
3. Revisar los logs del servidor

### 4. Error: reCAPTCHA

**Problema:** Si RECAPTCHA_SECRET_KEY está configurado pero falla la verificación.

**Solución:** En desarrollo, no configurar RECAPTCHA_SECRET_KEY o usar la clave de prueba.

## Pasos para Debug

### 1. Verificar Backend

```bash
cd fitness-app-backend
npm start
```

Intenta registrar y revisa los logs del servidor.

### 2. Verificar Frontend

Abre la consola del navegador (F12) y busca errores en la pestaña Console y Network.

### 3. Probar con curl/Postman

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!"
  }'
```

### 4. Verificar Base de Datos

```sql
-- Verificar que la columna role existe
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'role';

-- Verificar usuarios existentes
SELECT user_id, email, role FROM users;
```

## Mensajes de Error Mejorados

Ahora los errores muestran:

- El mensaje específico de validación
- Detalles adicionales si hay múltiples errores
- Formato más amigable para el usuario

## Prueba Rápida

1. **Contraseña válida:** `Test123!`
2. **Email válido:** `test@ejemplo.com`
3. **Sin reCAPTCHA en desarrollo:** No configurar RECAPTCHA_SECRET_KEY
