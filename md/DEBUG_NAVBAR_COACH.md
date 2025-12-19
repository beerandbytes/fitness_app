# 🐛 Debug: Navbar No Aparece en Dashboard del Coach

## 🔍 Verificaciones Realizadas

### 1. ✅ Componentes Actualizados

- `CoachDashboard.jsx` - ✅ Tiene `ModernNavbar`
- `CoachClientDetail.jsx` - ✅ Tiene `ModernNavbar`
- `TemplatesPage.jsx` - ✅ Tiene `ModernNavbar`
- Early returns - ✅ Incluyen navbar

### 2. ✅ Routing Verificado

- Rutas del coach están correctamente configuradas
- `CoachRoute` protege las rutas correctamente
- No hay `OnboardingGuard` bloqueando (los coaches están exentos)

### 3. ✅ Store y Roles

- `useUserStore.isCoach()` verifica `user?.role === 'COACH'`
- Backend devuelve `role` en login y registro
- Backend devuelve `role` en `/api/profile`

## 🛠️ Debugging Agregado

### Console Logs Agregados:

1. **ModernNavbar:**
   - Log cuando se renderiza
   - Muestra: user, role, isCoach, isAdmin, location

2. **CoachDashboard:**
   - Log cuando se renderiza
   - Muestra: clientsCount, loading, error, location

## 📋 Pasos para Debuggear

### 1. Abrir DevTools (F12)

### 2. Ir a la Consola

### 3. Verificar Logs:

Deberías ver:

```
[ModernNavbar] Renderizado: { user: 'coach@ejemplo.com', role: 'COACH', isCoach: true, ... }
[CoachDashboard] Renderizado: { clientsCount: 0, loading: false, ... }
```

### 4. Verificar en el DOM:

1. Abrir DevTools → Pestaña Elements/Inspector
2. Buscar `<nav>` en el DOM
3. Verificar que existe y tiene las clases:
   - `sticky top-0 z-50`
   - `backdrop-blur-xl bg-white/80`

### 5. Verificar Estilos:

Si el `<nav>` existe pero no es visible:

- Verificar `display: none` o `visibility: hidden`
- Verificar `opacity: 0`
- Verificar `z-index` (debería ser 50)
- Verificar que no está fuera de la pantalla

### 6. Verificar Store:

En la consola del navegador:

```javascript
// Verificar el store
const store = useUserStore.getState();
console.log('User:', store.user);
console.log('Role:', store.user?.role);
console.log('isCoach:', store.isCoach());
```

Debería mostrar:

- `user.role: 'COACH'`
- `isCoach(): true`

## 🔧 Posibles Problemas y Soluciones

### Problema 1: El navbar se renderiza pero está oculto

**Solución:** Verificar estilos CSS que puedan estar ocultándolo

### Problema 2: El usuario no tiene rol COACH

**Solución:**

1. Verificar en la base de datos: `SELECT user_id, email, role FROM users WHERE email = 'coach@ejemplo.com';`
2. Si el rol no es COACH, actualizarlo:
   ```sql
   UPDATE users SET role = 'COACH' WHERE email = 'coach@ejemplo.com';
   ```
3. O usar el panel de admin para cambiar el rol

### Problema 3: El store no tiene el rol

**Solución:**

1. Cerrar sesión
2. Volver a iniciar sesión
3. El store debería cargar el rol desde el backend

### Problema 4: El navbar está renderizándose pero fuera de la vista

**Solución:** Verificar que no hay `transform: translateY(-100%)` o similar

## 🧪 Test Manual

1. **Abrir la aplicación como coach**
2. **Ir a `/coach/dashboard`**
3. **Abrir DevTools (F12)**
4. **En la consola, ejecutar:**

   ```javascript
   // Verificar que el navbar existe
   document.querySelector('nav');
   // Debería retornar el elemento nav

   // Verificar estilos
   const nav = document.querySelector('nav');
   console.log('Display:', window.getComputedStyle(nav).display);
   console.log('Visibility:', window.getComputedStyle(nav).visibility);
   console.log('Opacity:', window.getComputedStyle(nav).opacity);
   console.log('Z-index:', window.getComputedStyle(nav).zIndex);
   ```

5. **Verificar el store:**
   ```javascript
   // En la consola
   import useUserStore from './stores/useUserStore';
   const state = useUserStore.getState();
   console.log('User role:', state.user?.role);
   console.log('Is coach:', state.isCoach());
   ```

## 📝 Checklist de Verificación

- [ ] El usuario tiene `role: 'COACH'` en la base de datos
- [ ] El store tiene `user.role === 'COACH'`
- [ ] `isCoach()` retorna `true`
- [ ] El elemento `<nav>` existe en el DOM
- [ ] El navbar tiene `z-index: 50`
- [ ] El navbar tiene `position: sticky` o `fixed`
- [ ] No hay estilos que oculten el navbar
- [ ] Los logs en consola muestran que se renderiza
- [ ] La ruta es `/coach/dashboard`
- [ ] No hay errores en la consola

## 🚀 Si Todo Falla

1. **Limpiar caché del navegador**
2. **Reiniciar el servidor de desarrollo**
3. **Verificar que no hay errores de compilación**
4. **Verificar que el build se completó correctamente**
