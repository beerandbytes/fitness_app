# 🗄️ Cómo Funciona Drizzle y la Creación de la Base de Datos

## 🔍 Entendiendo el Proceso

Cuando usas Drizzle ORM, hay **dos pasos principales** para trabajar con la base de datos:

1. **Generar migraciones** (solo cuando cambias el schema)
2. **Ejecutar migraciones** (crea las tablas en la base de datos)

---

## 📋 Paso 1: Generar Migraciones (`db:generate`)

### ¿Cuándo se hace?

- ✅ **Solo cuando modificas el schema** (`db/schema.js`)
- ✅ **Solo en desarrollo local**
- ✅ **No es necesario en producción** si las migraciones ya están en el repositorio

### ¿Qué hace?

```bash
npm run db:generate
```

Este comando:

- Lee tu archivo `db/schema.js` (donde defines las tablas)
- Genera archivos SQL en la carpeta `drizzle/`
- Estos archivos SQL contienen las instrucciones para crear/modificar tablas

### Ejemplo:

Si tienes en `db/schema.js`:

```javascript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
});
```

Drizzle generará un archivo SQL como `drizzle/0001_create_users.sql`:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL
);
```

---

## 📋 Paso 2: Ejecutar Migraciones (`db:migrate`)

### ¿Cuándo se hace?

- ✅ **Siempre que despliegas** (primera vez o después de cambios)
- ✅ **Cada vez que inicias el servidor en producción** (automático con Docker)
- ✅ **Después de crear una base de datos nueva**

### ¿Qué hace?

```bash
npm run db:migrate
```

Este comando:

- **Lee los archivos SQL** de la carpeta `drizzle/`
- **Ejecuta el SQL** en tu base de datos PostgreSQL
- **Crea o modifica las tablas** según las migraciones

### Resultado:

Después de ejecutar `db:migrate`, tu base de datos tendrá todas las tablas definidas en el schema:

- ✅ `users`
- ✅ `foods`
- ✅ `exercises`
- ✅ `logs`
- ✅ `routines`
- ✅ etc.

---

## 🚀 Flujo Completo para Primera Vez

### Situación: Primera vez que despliegas

#### 1. **Crear la Base de Datos PostgreSQL** (vacía)

En Render:

- Dashboard → New + → PostgreSQL
- Crear la base de datos
- **La base de datos está vacía** (sin tablas todavía)

#### 2. **Las Migraciones Ya Están en el Repositorio**

✅ **No necesitas generar migraciones** - Ya están en `fitness-app-backend/drizzle/`

El repositorio incluye:

- `drizzle/0000_good_ogun.sql`
- `drizzle/0001_*.sql`
- `drizzle/0002_*.sql`
- etc.

Estos archivos contienen las instrucciones SQL para crear todas las tablas.

#### 3. **Ejecutar las Migraciones**

Ahora solo necesitas **ejecutar** las migraciones para crear las tablas:

```bash
npm run db:migrate
```

O si estás en Render:

- Ve al Shell del servicio backend
- Ejecuta: `node db/migrate.js`

**Esto creará todas las tablas en tu base de datos PostgreSQL.**

---

## 🔄 Flujo para Despliegue con Docker

### En el Dockerfile

El `docker-entrypoint.sh` ya está configurado para ejecutar migraciones automáticamente:

```bash
#!/bin/sh
# Ejecutar migraciones automáticamente al iniciar
npm run db:migrate || {
    echo "⚠️  Advertencia: Las migraciones fallaron, pero continuando..."
}
# Iniciar el servidor
exec node index.js
```

**Esto significa que:**

- ✅ Las migraciones se ejecutan automáticamente cuando el contenedor inicia
- ✅ No necesitas ejecutarlas manualmente
- ✅ La base de datos se crea automáticamente

---

## 📝 Resumen: Qué Hacer en Cada Situación

### ✅ Primera Vez - Desarrollo Local

```bash
# 1. Crear la base de datos PostgreSQL localmente
createdb fitness_db

# 2. Configurar DATABASE_URL en .env
DATABASE_URL=postgresql://usuario:password@localhost:5432/fitness_db

# 3. Las migraciones ya están en el repositorio, solo ejecutarlas
npm run db:migrate

# 4. Iniciar el servidor
npm start
```

### ✅ Primera Vez - Producción (Render)

```bash
# 1. Crear PostgreSQL en Render (Dashboard → New + → PostgreSQL)

# 2. Configurar DATABASE_URL en Render (Environment Variables)

# 3. Desplegar el backend
#    - Las migraciones se ejecutan automáticamente con docker-entrypoint.sh
#    - O ejecutar manualmente en el Shell:
npm run db:migrate

# 4. ¡Listo! La base de datos está creada
```

### ✅ Después de Cambiar el Schema

Si modificas `db/schema.js`:

```bash
# 1. Generar nuevas migraciones
npm run db:generate

# 2. Revisar los archivos generados en drizzle/

# 3. Commit y push al repositorio
git add drizzle/
git commit -m "Add migration for new table"
git push

# 4. En producción, las migraciones se ejecutan automáticamente
#    O ejecutar manualmente: npm run db:migrate
```

---

## 🔍 Verificar que las Migraciones Funcionaron

### Ver las Tablas Creadas:

En Render (Shell del backend):

```bash
psql $DATABASE_URL -c "\dt"
```

O desde local (con la External Database URL):

```bash
psql "postgresql://..." -c "\dt"
```

Deberías ver todas las tablas:

```
              List of relations
 Schema |      Name       | Type  | Owner
--------+-----------------+-------+-------
 public | users           | table | ...
 public | foods           | table | ...
 public | exercises       | table | ...
 public | logs            | table | ...
 ...
```

---

## ⚠️ Notas Importantes

### 1. **Las Migraciones Ya Están en el Repositorio**

✅ **NO necesitas generar migraciones** en producción
✅ **Las migraciones ya están** en `fitness-app-backend/drizzle/`
✅ **Solo necesitas ejecutarlas** con `npm run db:migrate`

### 2. **La Base de Datos Debe Existir Primero**

⚠️ **La base de datos PostgreSQL debe estar creada** (pero puede estar vacía)
⚠️ **Drizzle NO crea la base de datos**, solo crea las tablas dentro de ella

Render crea la base de datos automáticamente cuando creas el servicio PostgreSQL.

### 3. **Ejecutar Migraciones es Idempotente**

✅ Puedes ejecutar `db:migrate` múltiples veces sin problemas
✅ Drizzle rastrea qué migraciones ya se ejecutaron
✅ Solo ejecuta las migraciones nuevas

---

## 🎯 Checklist para Primera Vez

- [ ] Crear base de datos PostgreSQL (vacía está bien)
- [ ] Configurar `DATABASE_URL` en variables de entorno
- [ ] Las migraciones ya están en `fitness-app-backend/drizzle/`
- [ ] Ejecutar `npm run db:migrate` (automático con Docker o manual)
- [ ] Verificar que las tablas se crearon
- [ ] Iniciar el servidor

---

## 🔗 Archivos Relacionados

- **Schema**: `fitness-app-backend/db/schema.js` - Define las tablas
- **Migraciones**: `fitness-app-backend/drizzle/*.sql` - SQL generado
- **Script de Migración**: `fitness-app-backend/db/migrate.js` - Ejecuta las migraciones
- **Config**: `fitness-app-backend/drizzle.config.js` - Configuración de Drizzle

---

¿Tienes dudas? Revisa los logs de Render para ver si las migraciones se ejecutaron correctamente.
