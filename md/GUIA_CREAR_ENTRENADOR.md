# 🏋️ Guía: Cómo Crear una Cuenta de Entrenador

## 📋 Métodos Disponibles

Hay **3 formas** de crear una cuenta de entrenador:

### 1. ✅ Desde el Panel de Administración (Recomendado)

**Requisitos:** Debes tener una cuenta de administrador

**Pasos:**
1. Inicia sesión como administrador
2. Ve al panel de administración (`/admin`)
3. En la sección "Gestión de Usuarios", haz clic en **"+ Nuevo Usuario"**
4. Completa el formulario:
   - **Email:** Email del entrenador
   - **Contraseña:** Contraseña temporal (el entrenador puede cambiarla después)
   - **Rol:** Selecciona **"Entrenador"** del menú desplegable
5. Haz clic en **"Crear"**

**Ventajas:**
- ✅ Control total sobre quién puede ser entrenador
- ✅ Puedes crear la cuenta con el rol correcto desde el inicio
- ✅ No requiere que el usuario se registre primero

### 2. ✅ Registro Normal + Selección de Rol

**Pasos:**
1. El usuario se registra normalmente en `/register`
2. Si no tiene rol asignado, se le redirige a `/select-role`
3. El usuario selecciona **"Entrenador"**
4. El sistema actualiza su rol a `COACH`
5. Se redirige al dashboard del entrenador (`/coach/dashboard`)

**Ventajas:**
- ✅ El usuario puede elegir su propio rol
- ✅ No requiere intervención del administrador

**Desventajas:**
- ⚠️ Cualquiera puede registrarse como entrenador (puede no ser deseable)

### 3. ✅ Actualizar Rol de Usuario Existente (Admin)

**Pasos:**
1. Inicia sesión como administrador
2. Ve al panel de administración (`/admin`)
3. En la lista de usuarios, encuentra el usuario que quieres convertir en entrenador
4. Haz clic en **"Editar"**
5. En el campo **"Rol"**, selecciona **"Entrenador"**
6. Haz clic en **"Actualizar"**

**Ventajas:**
- ✅ Puedes convertir usuarios existentes en entrenadores
- ✅ Útil para promocionar usuarios de CLIENT a COACH

## 🔧 Cambios Técnicos Implementados

### Backend

1. **Endpoint POST `/api/admin/users`**
   - Ahora acepta el parámetro `role` en el body
   - Valida que el rol sea uno de: `CLIENT`, `COACH`, `ADMIN`
   - Por defecto crea usuarios como `CLIENT` si no se especifica

2. **Endpoint PUT `/api/admin/users/:userId`**
   - Ahora permite actualizar el `role` de un usuario
   - Valida que el rol sea válido

3. **Endpoint GET `/api/admin/users`**
   - Ahora incluye el campo `role` en la respuesta

### Frontend

1. **Componente `UserManagement.jsx`**
   - Agregado campo de selección de rol en el formulario de crear/editar
   - Agregada columna "Rol" en la tabla de usuarios
   - Muestra badges de colores según el rol:
     - 🟣 **Admin** (púrpura)
     - 🔵 **Entrenador** (azul)
     - ⚪ **Cliente** (gris)

## 📝 Ejemplo de Uso (API)

### Crear Entrenador desde API

```bash
POST /api/admin/users
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "email": "entrenador@ejemplo.com",
  "password": "Password123!",
  "role": "COACH"
}
```

### Actualizar Rol de Usuario

```bash
PUT /api/admin/users/123
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "role": "COACH"
}
```

## 🎯 Flujo Completo para Entrenador

1. **Creación de cuenta** (método 1 o 2)
2. **Login** → Redirige a `/coach/dashboard`
3. **No requiere onboarding** (los coaches están exentos)
4. **Puede:**
   - Invitar clientes
   - Crear plantillas de rutinas
   - Crear plantillas de dietas
   - Ver y gestionar sus clientes
   - Ver progreso de clientes

## ⚠️ Notas Importantes

- Los entrenadores **NO** pasan por el proceso de onboarding
- Los entrenadores tienen acceso al dashboard del coach (`/coach/dashboard`)
- Solo los administradores pueden crear/editar roles de usuarios
- El rol se valida en el backend para seguridad

## 🔐 Seguridad

- Los roles se validan en el backend
- Solo usuarios con rol `ADMIN` pueden crear/editar roles
- El rol se incluye en el token JWT para autorización rápida
- Se verifica el rol en la base de datos para operaciones sensibles

