# ✅ Solución al Error 500 en el Registro

## 🔍 Problema Identificado

El error 500 (Internal Server Error) al intentar registrarse se debía a que **las columnas `role` y `coach_id` no existían en la tabla `users`** de la base de datos.

## 🛠️ Solución Aplicada

### 1. Diagnóstico
Se creó un script de verificación (`scripts/check-db-columns.js`) que confirmó que las columnas faltaban:
- ❌ `role` NO existía
- ❌ `coach_id` NO existía

### 2. Corrección
Se ejecutó el script `scripts/add-role-columns.js` que:
- ✅ Agregó la columna `role` (varchar(20), DEFAULT 'CLIENT', NOT NULL)
- ✅ Agregó la columna `coach_id` (integer, nullable)
- ✅ Agregó el constraint de foreign key `users_coach_id_users_user_id_fk`

### 3. Mejoras en el Manejo de Errores
Se mejoró el endpoint de registro (`routes/auth.js`) para:
- Mostrar mensajes de error más descriptivos en desarrollo
- Detectar errores específicos de base de datos (código 42703 = columna no existe)
- Incluir más detalles en los logs para facilitar el debugging

## 📋 Estado Actual

✅ **Columnas verificadas:**
- `user_id` ✅
- `email` ✅
- `password_hash` ✅
- `role` ✅ (agregada)
- `coach_id` ✅ (agregada)

✅ **Constraint agregado:**
- `users_coach_id_users_user_id_fk` ✅

## 🧪 Prueba Ahora

El registro debería funcionar correctamente. Intenta registrarte con:
- Email: `test@ejemplo.com`
- Contraseña: `Test123!` (debe cumplir los requisitos)

## 📝 Notas

- Las migraciones de Drizzle no se habían ejecutado completamente
- El script `add-role-columns.js` es idempotente (se puede ejecutar múltiples veces sin problemas)
- Si vuelves a tener problemas, ejecuta: `node scripts/check-db-columns.js` para verificar el estado

## 🔧 Scripts Útiles

```bash
# Verificar columnas de la base de datos
node scripts/check-db-columns.js

# Agregar columnas si faltan
node scripts/add-role-columns.js

# Ejecutar todas las migraciones
npm run db:migrate
```

