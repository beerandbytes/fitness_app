# 🔧 Solución: Múltiples Conexiones al Pool de Base de Datos

## 🚨 Problema

Los logs muestran múltiples conexiones siendo adquiridas simultáneamente:

```
2025-12-03 20:12:22 [debug]: Conexión adquirida del pool (x7)
```

**Causa:** 
- El script `seed-all.js` abre conexiones para verificar datos
- Los scripts hijos (`populate-free-exercise-db.js`, `seed-common-foods.js`) también abren sus propias conexiones
- Cada script crea su propia instancia de `db` pero todos comparten el mismo pool
- Las conexiones no se cierran correctamente entre scripts

**Riesgo:** 
- Agotar el pool de conexiones (máximo 20 por defecto)
- Errores de "too many connections"
- Scripts fallando silenciosamente

---

## ✅ Solución Implementada

### Cambios Realizados:

1. **Cerrar conexiones antes de ejecutar scripts hijos**
   - El script padre cierra su pool antes de ejecutar scripts hijos
   - Los scripts hijos crean sus propios pools (aislados)
   - Después de cada script hijo, se recrea la conexión del padre

2. **Cerrar pool al final del script**
   - El script cierra explícitamente el pool al terminar
   - Libera todas las conexiones para evitar leaks

3. **Manejo robusto de reconexión**
   - Si se cierra el pool, se recrea automáticamente
   - Maneja errores de conexión gracefully

---

## 🔍 Cómo Funciona Ahora

### Flujo Mejorado:

```
1. seed-all.js abre conexión
2. Verifica ejercicios (usa conexión)
3. Cierra conexión del padre
4. Ejecuta populate:exercises (crea su propio pool)
5. populate:exercises termina y cierra su pool
6. seed-all.js recrea su conexión
7. Verifica que se insertaron ejercicios
8. Repite proceso para alimentos
9. Cierra pool al final
```

**Ventajas:**
- ✅ Cada script hijo tiene su propio pool (aislado)
- ✅ No hay competencia por conexiones
- ✅ Las conexiones se liberan correctamente
- ✅ No se agota el pool

---

## 📊 Verificación

### Antes (Problema):
```
seed-all.js: conexión 1
seed-all.js: conexión 2 (verificación)
populate:exercises: conexión 3
populate:exercises: conexión 4
populate:exercises: conexión 5
seed-all.js: conexión 6 (verificación)
seed:foods: conexión 7
seed:foods: conexión 8
seed-all.js: conexión 9 (verificación final)
= 9 conexiones simultáneas
```

### Después (Solución):
```
seed-all.js: conexión 1 (verificación)
seed-all.js: CIERRA conexión
populate:exercises: conexión 1 (su propio pool)
populate:exercises: CIERRA su pool
seed-all.js: conexión 1 (recreada, verificación)
seed-all.js: CIERRA conexión
seed:foods: conexión 1 (su propio pool)
seed:foods: CIERRA su pool
seed-all.js: conexión 1 (recreada, verificación final)
seed-all.js: CIERRA pool al final
= Máximo 1-2 conexiones simultáneas
```

---

## 🧪 Cómo Probar

### 1. Verificar que no hay leaks de conexiones:

```bash
cd fitness-app-backend
npm run seed:all
```

**Qué buscar en los logs:**
- ✅ Deberías ver menos mensajes de "Conexión adquirida del pool"
- ✅ Deberías ver mensajes de "Cerrando conexiones del pool"
- ✅ No deberías ver errores de "too many connections"

### 2. Verificar en la base de datos:

```sql
-- Ver conexiones activas (PostgreSQL)
SELECT count(*) FROM pg_stat_activity WHERE datname = 'tu_database';

-- Debería ser bajo (1-5 conexiones normalmente)
```

### 3. Ejecutar múltiples veces:

```bash
# Ejecutar varias veces seguidas
npm run seed:all
npm run seed:all
npm run seed:all
```

**Debería funcionar sin problemas** (antes podría fallar por agotar el pool).

---

## ⚙️ Configuración del Pool

El pool está configurado en `db/db_config.js`:

```javascript
max: 20  // Máximo de conexiones (por defecto)
min: 5   // Mínimo de conexiones a mantener
```

**Para Render (plan gratuito):**
- PostgreSQL Free Tier permite ~20 conexiones
- Con la solución actual, usamos máximo 1-2 conexiones simultáneas
- ✅ No debería haber problemas

**Si necesitas ajustar:**

Agrega a tu `.env`:
```env
DB_POOL_MAX=10  # Reducir si tienes problemas
DB_POOL_MIN=2   # Reducir conexiones mínimas
```

---

## 🐛 Si Sigue Habiendo Problemas

### Error: "too many connections"

**Solución:**
1. Verifica que el script cierre conexiones correctamente
2. Reduce `DB_POOL_MAX` en `.env`
3. Verifica que no haya otros procesos usando la base de datos

### Error: "Connection terminated"

**Solución:**
1. Verifica que `DATABASE_URL` sea correcta
2. Verifica que la base de datos esté accesible
3. Aumenta `DB_CONNECTION_TIMEOUT` si es necesario

### Los scripts fallan silenciosamente

**Solución:**
1. Revisa los logs completos
2. Verifica que las tablas existan (`npm run db:migrate`)
3. Verifica que `DATABASE_URL` esté configurada

---

## 📝 Archivos Modificados

1. `fitness-app-backend/scripts/seed-all.js`
   - Cierra pool antes de ejecutar scripts hijos
   - Recrea conexión después de cada script hijo
   - Cierra pool al final explícitamente

---

## ✅ Checklist

Después de los cambios:

- [ ] El script `seed-all.js` cierra conexiones antes de scripts hijos
- [ ] Los scripts hijos crean sus propios pools (aislados)
- [ ] El script cierra el pool al final
- [ ] No hay errores de "too many connections"
- [ ] Los logs muestran menos conexiones simultáneas
- [ ] El script funciona correctamente en Render

---

**La solución asegura que cada script maneje sus propias conexiones y las libere correctamente, evitando agotar el pool.** 🔒

