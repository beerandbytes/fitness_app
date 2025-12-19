# 🧪 Guía de Pruebas - Coach Mode

## Flujo de Prueba Completo

### 1. Preparación

Asegúrate de tener:
- ✅ Base de datos PostgreSQL corriendo
- ✅ Migraciones ejecutadas (`npm run db:migrate`)
- ✅ Variables de entorno configuradas
- ✅ Servidores listos para iniciar

### 2. Iniciar Servidores

#### Backend:
```bash
cd fitness-app-backend
npm start
```

#### Frontend:
```bash
cd fitness-app-frontend
npm run dev
```

### 3. Flujo de Prueba - Sistema de Invitaciones

#### Paso 1: Crear Usuario Coach
1. Ir a `http://localhost:5173/register`
2. Registrar un nuevo usuario
3. Después del registro, seleccionar rol "Entrenador"
4. Deberías ser redirigido a `/coach/dashboard`

#### Paso 2: Invitar Cliente
1. En el dashboard del coach, hacer clic en "Invitar Cliente"
2. Ingresar un email (ej: `cliente@test.com`)
3. Verificar que se muestre el mensaje de éxito
4. Si SMTP está configurado, verificar el email recibido

#### Paso 3: Registrar Cliente con Invitación
1. Copiar el token de la URL de invitación (o usar el enlace del email)
2. Ir a `http://localhost:5173/invite/[TOKEN]`
3. Completar el formulario de registro
4. El email debería estar pre-rellenado
5. Crear contraseña y registrarse
6. Debería redirigir automáticamente al dashboard

### 4. Flujo de Prueba - Dashboard del Coach

#### Verificar Dashboard:
1. Ir a `/coach/dashboard`
2. Verificar que aparezcan los clientes invitados
3. Probar el cambio entre vista carrusel y tabla
4. Probar los filtros (Todos, Activos, Inactivos)
5. Verificar las métricas en las tarjetas superiores

#### Verificar Detalle de Cliente:
1. Hacer clic en una tarjeta de cliente
2. Verificar las pestañas:
   - **Progreso:** Historial de peso
   - **Rutinas:** (Sprint 3 - pendiente de datos)
   - **Dieta:** Registros de comidas
   - **Check-ins:** Check-ins semanales
   - **Notas:** (Sprint 5 - pendiente)

### 5. Flujo de Prueba - Plantillas

#### Crear Plantilla de Rutina:
1. Ir a `/coach/templates`
2. Clic en "Nueva Plantilla"
3. Seleccionar pestaña "Rutinas"
4. Llenar:
   - Nombre: "Rutina Push"
   - Descripción: "Entrenamiento de empuje"
   - Ejercicios (JSON):
   ```json
   [
     {
       "exercise_id": 1,
       "sets": 3,
       "reps": 10,
       "weight_kg": 20
     }
   ]
   ```
5. Guardar

#### Crear Plantilla de Dieta:
1. En la misma página, cambiar a pestaña "Dietas"
2. Clic en "Nueva Plantilla"
3. Llenar:
   - Nombre: "Dieta Definición"
   - Comidas (JSON):
   ```json
   [
     {
       "meal_type": "Desayuno",
       "foods": [
         {
           "food_id": 1,
           "quantity_grams": 100
         }
       ]
     }
   ]
   ```
4. Guardar

### 6. Flujo de Prueba - Check-in Semanal

#### Como Cliente:
1. Iniciar sesión como cliente
2. Ir a `/checkin`
3. Completar el formulario:
   - Peso actual
   - Sentimiento (1-5 estrellas)
   - Notas opcionales
   - Subir 3 fotos (frontal, lateral, trasera)
4. Guardar check-in

#### Como Coach:
1. Ir al detalle del cliente
2. Pestaña "Check-ins"
3. Verificar que aparezca el check-in reciente
4. Ver las fotos subidas

### 7. Flujo de Prueba - Streak

#### Como Cliente:
1. Completar ejercicios en varios días consecutivos
2. Verificar que aparezca el badge de streak en el navbar
3. El número debería aumentar con cada día consecutivo

### 8. Verificaciones Adicionales

#### Roles y Permisos:
- ✅ Cliente no puede acceder a `/coach/dashboard`
- ✅ Coach no puede acceder a rutas de admin (si no es admin)
- ✅ Admin puede acceder a todo

#### Navbar:
- ✅ Coach ve botón "Invitar Cliente"
- ✅ Coach ve enlaces a Dashboard y Plantillas
- ✅ Cliente ve badge de streak (si tiene)
- ✅ Cliente no ve secciones de coach

## 🐛 Problemas Comunes

### Error: "Token inválido o expirado"
- Verificar que el token no haya sido usado
- Verificar que no haya expirado (7 días)
- Verificar que el email coincida

### Error: "Solo los entrenadores pueden acceder"
- Verificar que el usuario tenga rol COACH
- Verificar que el token JWT incluya el rol correcto
- Hacer logout y login nuevamente

### Check-ins no aparecen
- Verificar que el cliente haya completado el check-in
- Verificar que el coach esté viendo el cliente correcto
- Verificar la fecha de la semana (debe ser lunes)

### Streak no aparece
- Verificar que el cliente haya completado ejercicios
- Verificar que sean días consecutivos
- El streak se calcula desde hoy o ayer hacia atrás

## ✅ Checklist de Pruebas

- [ ] Registro de usuario coach
- [ ] Selección de rol
- [ ] Invitación de cliente
- [ ] Registro con token de invitación
- [ ] Dashboard del coach muestra clientes
- [ ] Vista de detalle de cliente
- [ ] Creación de plantillas
- [ ] Check-in semanal
- [ ] Visualización de check-ins
- [ ] Streak en navbar
- [ ] Protección de rutas por rol

## 📝 Notas

- Si SMTP no está configurado, los emails no se enviarán pero el sistema funcionará
- El cron job de recordatorios puede implementarse después
- La exportación a PDF puede añadirse como mejora futura

