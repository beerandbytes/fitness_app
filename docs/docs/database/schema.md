---
id: schema
title: Esquema de base de datos (Drizzle / PostgreSQL)
---

La base de datos está modelada con **Drizzle ORM** en `fitness-app-backend/db/schema.js` y se ejecuta sobre **PostgreSQL**.

## Estructura General

La base de datos contiene **27 tablas** organizadas en las siguientes áreas funcionales:

- **Autenticación y usuarios**: `users`
- **Registro diario**: `daily_logs`, `daily_exercises`
- **Nutrición**: `foods`, `meal_items`, `user_daily_meal_plans`
- **Ejercicios y entrenamiento**: `exercises`, `routines`, `routine_exercises`, `scheduled_routines`
- **Objetivos y seguimiento**: `user_goals`, `check_ins`
- **Gamificación**: `notifications`, `achievements`, `user_achievements`
- **Coach/Cliente**: `invite_tokens`, `routine_templates`, `diet_templates`, `client_routine_assignments`
- **Comunicación**: `messages`
- **Configuración**: `brand_settings`

## Tablas Detalladas

### 1. `users` - Usuarios

Tabla principal de autenticación y perfiles de usuario.

**Campos**:
- `user_id` (serial, PK): Identificador único del usuario
- `email` (varchar(255), UNIQUE, NOT NULL): Email del usuario (único)
- `password_hash` (varchar(255), NOT NULL): Hash de la contraseña (bcrypt)
- `reset_password_token` (varchar(255), nullable): Token para recuperación de contraseña
- `reset_password_expires` (timestamp, nullable): Expiración del token de recuperación
- `onboarding_completed` (boolean, default: false): Si completó el onboarding
- `onboarding_step` (integer, default: 0): Paso actual del onboarding (0-4)
- `gender` (varchar(20), nullable): Género ('male', 'female', 'other')
- `age` (integer, nullable): Edad en años
- `height` (numeric, nullable): Altura en cm
- `role` (varchar(20), default: 'CLIENT', NOT NULL): Rol del usuario ('CLIENT', 'COACH', 'ADMIN')
- `coach_id` (integer, FK → users.user_id, nullable): ID del entrenador asignado
- `created_at` (timestamp, default: now()): Fecha de creación
- `updated_at` (timestamp, default: now()): Fecha de última actualización

**Relaciones**:
- Un usuario puede tener un `coach_id` que referencia a otro usuario con rol COACH
- Un usuario puede tener múltiples `daily_logs`, `routines`, `user_goals`, etc.

### 2. `daily_logs` - Registro Diario de Métricas

Registro diario de peso, calorías consumidas y quemadas.

**Campos**:
- `log_id` (serial, PK): Identificador único del log
- `user_id` (integer, FK → users.user_id, NOT NULL): Usuario propietario
- `date` (date, NOT NULL): Fecha del registro
- `weight` (numeric, NOT NULL): Peso en kg
- `consumed_calories` (numeric, default: 0, NOT NULL): Calorías consumidas
- `burned_calories` (numeric, default: 0, NOT NULL): Calorías quemadas
- `created_at` (timestamp, default: now()): Fecha de creación
- `updated_at` (timestamp, default: now()): Fecha de actualización

**Constraints**:
- UNIQUE (`user_id`, `date`): Solo un log por usuario por día

**Relaciones**:
- Pertenece a un `user` (many-to-one)
- Tiene múltiples `daily_exercises` (one-to-many)
- Tiene múltiples `meal_items` (one-to-many)

### 3. `foods` - Catálogo de Alimentos

Catálogo de alimentos con información nutricional.

**Campos**:
- `food_id` (serial, PK): Identificador único del alimento
- `name` (varchar(100), UNIQUE, NOT NULL): Nombre del alimento
- `calories_base` (numeric, NOT NULL): Calorías por 100g
- `protein_g` (numeric, default: 0, NOT NULL): Gramos de proteína por 100g
- `carbs_g` (numeric, default: 0, NOT NULL): Gramos de carbohidratos por 100g
- `fat_g` (numeric, default: 0, NOT NULL): Gramos de grasa por 100g
- `created_at` (timestamp, default: now()): Fecha de creación

**Relaciones**:
- Referenciado por múltiples `meal_items` (one-to-many)

### 4. `meal_items` - Registro de Consumo Diario

Registro de alimentos consumidos en un día específico.

**Campos**:
- `meal_item_id` (serial, PK): Identificador único
- `log_id` (integer, FK → daily_logs.log_id, NOT NULL): Log diario asociado
- `food_id` (integer, FK → foods.food_id, NOT NULL): Alimento consumido
- `quantity_grams` (numeric, NOT NULL): Cantidad en gramos
- `meal_type` (varchar(50), NOT NULL): Tipo de comida ('Desayuno', 'Almuerzo', 'Cena', etc.)
- `consumed_calories` (numeric, NOT NULL): Calorías consumidas (calculadas)
- `created_at` (timestamp, default: now()): Fecha de creación

**Relaciones**:
- Pertenece a un `daily_log` (many-to-one)
- Referencia un `food` (many-to-one)

### 5. `exercises` - Catálogo de Ejercicios

Catálogo de ejercicios disponibles en la aplicación.

**Campos**:
- `exercise_id` (serial, PK): Identificador único del ejercicio
- `name` (varchar(100), UNIQUE, NOT NULL): Nombre del ejercicio
- `category` (varchar(50), NOT NULL): Categoría ('Cardio', 'Fuerza', 'Híbrido', etc.)
- `default_calories_per_minute` (numeric, default: 5, NOT NULL): Calorías quemadas por minuto (base)
- `gif_url` (varchar(500), nullable): URL del GIF/imagen de demostración
- `video_url` (varchar(500), nullable): URL del video de demostración
- `wger_id` (integer, nullable): ID del ejercicio en wger API (referencia externa)
- `is_public` (boolean, default: true, NOT NULL): Si el ejercicio es público
- `created_at` (timestamp, default: now()): Fecha de creación

**Relaciones**:
- Referenciado por múltiples `routine_exercises` (one-to-many)
- Referenciado por múltiples `daily_exercises` (one-to-many)

### 6. `routines` - Rutinas del Usuario

Rutinas de entrenamiento creadas por usuarios o entrenadores.

**Campos**:
- `routine_id` (serial, PK): Identificador único de la rutina
- `user_id` (integer, FK → users.user_id, NOT NULL): Usuario propietario
- `name` (varchar(100), NOT NULL): Nombre de la rutina
- `description` (varchar(255), nullable): Descripción de la rutina
- `is_active` (boolean, default: true, NOT NULL): Si la rutina está activa
- `created_at` (timestamp, default: now()): Fecha de creación
- `updated_at` (timestamp, default: now()): Fecha de actualización

**Relaciones**:
- Pertenece a un `user` (many-to-one)
- Tiene múltiples `routine_exercises` (one-to-many)
- Referenciada por múltiples `scheduled_routines` (one-to-many)

### 7. `routine_exercises` - Ejercicios en una Rutina

Plantilla de ejercicios que componen una rutina.

**Campos**:
- `routine_exercise_id` (serial, PK): Identificador único
- `routine_id` (integer, FK → routines.routine_id, NOT NULL): Rutina a la que pertenece
- `exercise_id` (integer, FK → exercises.exercise_id, NOT NULL): Ejercicio incluido
- `sets` (integer, NOT NULL): Número de series
- `reps` (integer, nullable): Repeticiones (null si es cardio)
- `duration_minutes` (numeric, nullable): Duración en minutos (null si es sets/reps)
- `weight_kg` (numeric, default: 0): Peso en kg
- `order_index` (integer, NOT NULL): Orden del ejercicio en la rutina
- `day_of_week` (integer, nullable): Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado, null=todos los días)

**Constraints**:
- UNIQUE (`routine_id`, `exercise_id`, `day_of_week`): Evita duplicados

**Relaciones**:
- Pertenece a una `routine` (many-to-one)
- Referencia un `exercise` (many-to-one)

### 8. `daily_exercises` - Registro Diario de Ejercicios Completados

Registro de ejercicios completados en un día específico.

**Campos**:
- `daily_exercise_id` (serial, PK): Identificador único
- `log_id` (integer, FK → daily_logs.log_id, NOT NULL): Log diario asociado
- `exercise_id` (integer, FK → exercises.exercise_id, NOT NULL): Ejercicio realizado
- `sets_done` (integer, NOT NULL): Series completadas
- `reps_done` (integer, nullable): Repeticiones completadas
- `duration_minutes` (numeric, nullable): Duración en minutos
- `weight_kg` (numeric, default: 0): Peso utilizado
- `burned_calories` (numeric, NOT NULL): Calorías quemadas (calculadas)
- `created_at` (timestamp, default: now()): Fecha de creación

**Relaciones**:
- Pertenece a un `daily_log` (many-to-one)
- Referencia un `exercise` (many-to-one)

### 9. `user_goals` - Objetivos del Usuario

Objetivos de peso y calorías del usuario.

**Campos**:
- `goal_id` (serial, PK): Identificador único del objetivo
- `user_id` (integer, FK → users.user_id, NOT NULL): Usuario propietario
- `target_weight` (numeric, NOT NULL): Peso objetivo en kg
- `current_weight` (numeric, NOT NULL): Peso actual al establecer el objetivo
- `daily_calorie_goal` (numeric, nullable): Calorías diarias objetivo (calculadas)
- `weekly_weight_change_goal` (numeric, default: -0.5, NOT NULL): Cambio de peso semanal objetivo (kg/semana, negativo=pérdida)
- `goal_type` (varchar(50), default: 'weight_loss', NOT NULL): Tipo de objetivo ('weight_loss', 'weight_gain', 'maintain')
- `is_active` (boolean, default: true, NOT NULL): Si el objetivo está activo
- `created_at` (timestamp, default: now()): Fecha de creación
- `updated_at` (timestamp, default: now()): Fecha de actualización

**Relaciones**:
- Pertenece a un `user` (many-to-one)

### 10. `scheduled_routines` - Rutinas Planificadas

Rutinas programadas en el calendario del usuario.

**Campos**:
- `scheduled_id` (serial, PK): Identificador único
- `user_id` (integer, FK → users.user_id, NOT NULL): Usuario propietario
- `routine_id` (integer, FK → routines.routine_id, NOT NULL): Rutina programada
- `scheduled_date` (date, NOT NULL): Fecha para la cual está planificada
- `is_completed` (boolean, default: false, NOT NULL): Si la rutina fue completada
- `completed_at` (timestamp, nullable): Timestamp de cuando se completó
- `created_at` (timestamp, default: now()): Fecha de creación
- `updated_at` (timestamp, default: now()): Fecha de actualización

**Constraints**:
- UNIQUE (`user_id`, `routine_id`, `scheduled_date`): Una rutina por usuario por fecha

**Relaciones**:
- Pertenece a un `user` (many-to-one)
- Referencia una `routine` (many-to-one)

### 11. `user_daily_meal_plans` - Planes de Comida por Día

Planes de comida definidos por el entrenador para cada día de la semana.

**Campos**:
- `plan_id` (serial, PK): Identificador único
- `user_id` (integer, FK → users.user_id, NOT NULL): Usuario/cliente
- `day_of_week` (integer, NOT NULL): Día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado)
- `breakfast` (varchar(1000), nullable): Texto libre para desayuno
- `lunch` (varchar(1000), nullable): Texto libre para almuerzo
- `dinner` (varchar(1000), nullable): Texto libre para cena
- `snacks` (varchar(1000), nullable): Texto libre para snacks

**Constraints**:
- UNIQUE (`user_id`, `day_of_week`): Un plan por usuario por día de la semana

**Relaciones**:
- Pertenece a un `user` (many-to-one)

### 12. `notifications` - Sistema de Notificaciones

Notificaciones para usuarios.

**Campos**:
- `notification_id` (serial, PK): Identificador único
- `user_id` (integer, FK → users.user_id, NOT NULL): Usuario destinatario
- `title` (varchar(255), NOT NULL): Título de la notificación
- `message` (varchar(1000), NOT NULL): Mensaje de la notificación
- `type` (varchar(50), default: 'info', NOT NULL): Tipo ('info', 'success', 'warning', 'achievement', 'reminder')
- `is_read` (boolean, default: false, NOT NULL): Si fue leída
- `link_url` (varchar(500), nullable): URL opcional para navegar al hacer click
- `created_at` (timestamp, default: now()): Fecha de creación

**Relaciones**:
- Pertenece a un `user` (many-to-one)

### 13. `achievements` - Sistema de Logros

Definición de logros/achievements disponibles.

**Campos**:
- `achievement_id` (serial, PK): Identificador único
- `name` (varchar(100), UNIQUE, NOT NULL): Nombre del logro
- `description` (varchar(500), nullable): Descripción del logro
- `icon` (varchar(50), nullable): Emoji o código de icono
- `category` (varchar(50), nullable): Categoría ('weight', 'exercise', 'nutrition', 'streak', 'milestone')
- `condition_type` (varchar(50), NOT NULL): Tipo de condición ('weight_loss', 'weight_gain', 'days_streak', 'exercises_completed', etc.)
- `condition_value` (numeric, NOT NULL): Valor necesario para desbloquear
- `rarity` (varchar(20), default: 'common', NOT NULL): Rareza ('common', 'rare', 'epic', 'legendary')
- `created_at` (timestamp, default: now()): Fecha de creación

**Relaciones**:
- Referenciado por múltiples `user_achievements` (one-to-many)

### 14. `user_achievements` - Logros Desbloqueados por Usuario

Logros desbloqueados por cada usuario.

**Campos**:
- `user_achievement_id` (serial, PK): Identificador único
- `user_id` (integer, FK → users.user_id, NOT NULL): Usuario
- `achievement_id` (integer, FK → achievements.achievement_id, NOT NULL): Logro desbloqueado
- `unlocked_at` (timestamp, default: now()): Fecha de desbloqueo

**Constraints**:
- UNIQUE (`user_id`, `achievement_id`): Un usuario solo puede desbloquear un logro una vez

**Relaciones**:
- Pertenece a un `user` (many-to-one)
- Referencia un `achievement` (many-to-one)

### 15. `brand_settings` - Configuración de Marca

Configuración de marca/organización de la aplicación.

**Campos**:
- `setting_id` (serial, PK): Identificador único
- `brand_name` (varchar(100), default: 'FitnessApp', NOT NULL): Nombre de la marca
- `tagline` (varchar(255), nullable): Slogan o tagline
- `logo_url` (varchar(500), nullable): URL del logo
- `instagram_url` (varchar(255), nullable): URL de Instagram
- `facebook_url` (varchar(255), nullable): URL de Facebook
- `twitter_url` (varchar(255), nullable): URL de Twitter
- `linkedin_url` (varchar(255), nullable): URL de LinkedIn
- `youtube_url` (varchar(255), nullable): URL de YouTube
- `tiktok_url` (varchar(255), nullable): URL de TikTok
- `website_url` (varchar(255), nullable): URL del sitio web
- `created_at` (timestamp, default: now()): Fecha de creación
- `updated_at` (timestamp, default: now()): Fecha de actualización

### 16. `invite_tokens` - Sistema de Invitaciones

Tokens de invitación para el sistema coach/cliente.

**Campos**:
- `id` (serial, PK): Identificador único
- `coach_id` (integer, FK → users.user_id, NOT NULL): Entrenador que crea la invitación
- `email` (varchar(255), NOT NULL): Email del invitado
- `token` (varchar(255), UNIQUE, NOT NULL): Token único de invitación
- `expires_at` (timestamp, NOT NULL): Fecha de expiración
- `used` (boolean, default: false, NOT NULL): Si el token fue usado
- `created_at` (timestamp, default: now()): Fecha de creación

**Relaciones**:
- Pertenece a un `user` (coach) (many-to-one)

### 17. `routine_templates` - Plantillas de Rutinas

Plantillas de rutinas creadas por entrenadores.

**Campos**:
- `template_id` (serial, PK): Identificador único
- `coach_id` (integer, FK → users.user_id, NOT NULL): Entrenador creador
- `name` (varchar(100), NOT NULL): Nombre de la plantilla
- `description` (varchar(500), nullable): Descripción
- `exercises` (jsonb, NOT NULL): Array de ejercicios con sets, reps, etc. (JSON)
- `created_at` (timestamp, default: now()): Fecha de creación
- `updated_at` (timestamp, default: now()): Fecha de actualización

**Relaciones**:
- Pertenece a un `user` (coach) (many-to-one)
- Referenciada por múltiples `client_routine_assignments` (one-to-many)

### 18. `diet_templates` - Plantillas de Dietas

Plantillas de dietas creadas por entrenadores.

**Campos**:
- `template_id` (serial, PK): Identificador único
- `coach_id` (integer, FK → users.user_id, NOT NULL): Entrenador creador
- `name` (varchar(100), NOT NULL): Nombre de la plantilla
- `description` (varchar(500), nullable): Descripción
- `meals` (jsonb, NOT NULL): Array de comidas con alimentos y cantidades (JSON)
- `target_macros` (jsonb, nullable): Objetivos de macronutrientes `{protein, carbs, fat, calories}` (JSON)
- `created_at` (timestamp, default: now()): Fecha de creación
- `updated_at` (timestamp, default: now()): Fecha de actualización

**Relaciones**:
- Pertenece a un `user` (coach) (many-to-one)

### 19. `client_routine_assignments` - Asignaciones de Rutinas

Asignaciones de rutinas de entrenadores a clientes.

**Campos**:
- `assignment_id` (serial, PK): Identificador único
- `client_id` (integer, FK → users.user_id, NOT NULL): Cliente asignado
- `template_id` (integer, FK → routine_templates.template_id, NOT NULL): Plantilla asignada
- `assigned_date` (date, NOT NULL): Fecha de asignación
- `is_recurring` (boolean, default: false, NOT NULL): Si es recurrente
- `recurring_day` (integer, nullable): Día de la semana para recurrencia (0-6, null si no es recurrente)
- `created_at` (timestamp, default: now()): Fecha de creación

**Constraints**:
- UNIQUE (`client_id`, `template_id`, `assigned_date`): Evita asignaciones duplicadas

**Relaciones**:
- Pertenece a un `user` (client) (many-to-one)
- Referencia una `routine_template` (many-to-one)

### 20. `check_ins` - Check-ins Semanales

Check-ins semanales de clientes para entrenadores.

**Campos**:
- `check_in_id` (serial, PK): Identificador único
- `client_id` (integer, FK → users.user_id, NOT NULL): Cliente
- `week_of` (date, NOT NULL): Lunes de la semana
- `weight` (numeric, nullable): Peso en kg
- `feeling` (integer, nullable): Escala de sentimiento (1-5)
- `notes` (text, nullable): Notas del cliente
- `photo_front` (varchar(500), nullable): URL de la foto frontal
- `photo_side` (varchar(500), nullable): URL de la foto lateral
- `photo_back` (varchar(500), nullable): URL de la foto trasera
- `created_at` (timestamp, default: now()): Fecha de creación
- `updated_at` (timestamp, default: now()): Fecha de actualización

**Constraints**:
- UNIQUE (`client_id`, `week_of`): Un check-in por cliente por semana

**Relaciones**:
- Pertenece a un `user` (client) (many-to-one)

### 21. `messages` - Sistema de Chat

Mensajes uno-a-uno entre usuarios (coach/cliente).

**Campos**:
- `message_id` (serial, PK): Identificador único
- `sender_id` (integer, FK → users.user_id, NOT NULL): Usuario remitente
- `receiver_id` (integer, FK → users.user_id, NOT NULL): Usuario destinatario
- `content` (text, NOT NULL): Contenido del mensaje
- `is_read` (boolean, default: false, NOT NULL): Si fue leído
- `created_at` (timestamp, default: now()): Fecha de creación

**Relaciones**:
- Remitente: pertenece a un `user` (sender) (many-to-one)
- Destinatario: pertenece a un `user` (receiver) (many-to-one)

## Diagrama de Relaciones Principales

```
users (1) ──< (many) daily_logs
users (1) ──< (many) routines
users (1) ──< (many) user_goals
users (1) ──< (many) scheduled_routines
users (1) ──< (many) notifications
users (1) ──< (many) user_achievements
users (1) ──< (many) user_daily_meal_plans
users (1) ──< (many) check_ins
users (1) ──< (many) invite_tokens (como coach_id)
users (1) ──< (many) routine_templates (como coach_id)
users (1) ──< (many) diet_templates (como coach_id)
users (1) ──< (many) client_routine_assignments (como client_id)
users (1) ──< (many) messages (como sender_id)
users (1) ──< (many) messages (como receiver_id)

daily_logs (1) ──< (many) daily_exercises
daily_logs (1) ──< (many) meal_items

foods (1) ──< (many) meal_items

exercises (1) ──< (many) routine_exercises
exercises (1) ──< (many) daily_exercises

routines (1) ──< (many) routine_exercises
routines (1) ──< (many) scheduled_routines

achievements (1) ──< (many) user_achievements

routine_templates (1) ──< (many) client_routine_assignments
```

## Notas Importantes

1. **Claves Primarias**: Todas las tablas usan `serial` (auto-increment) como clave primaria.

2. **Claves Foráneas**: Las relaciones están definidas explícitamente usando `.references()` en Drizzle.

3. **Constraints Únicos**: Varias tablas tienen constraints UNIQUE para evitar duplicados:
   - `daily_logs`: un log por usuario por día
   - `check_ins`: un check-in por cliente por semana
   - `user_daily_meal_plans`: un plan por usuario por día de la semana
   - `user_achievements`: un logro solo puede ser desbloqueado una vez por usuario

4. **Tipos de Datos JSON**: Las tablas `routine_templates` y `diet_templates` usan `jsonb` para almacenar estructuras complejas de ejercicios y comidas.

5. **Sistema de Roles**: El campo `role` en `users` determina los permisos y funcionalidades disponibles:
   - `CLIENT`: Usuario regular
   - `COACH`: Entrenador con acceso a herramientas de gestión
   - `ADMIN`: Administrador con acceso completo

6. **Onboarding**: El sistema de onboarding está integrado en la tabla `users` con `onboarding_completed` y `onboarding_step`.

Para más detalles técnicos, consulta:
- `fitness-app-backend/db/schema.js` - Definición completa del schema
- `fitness-app-backend/drizzle/` - Archivos de migración SQL

