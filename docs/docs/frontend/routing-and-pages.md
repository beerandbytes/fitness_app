---
id: routing-and-pages
title: Routing y páginas principales
---

El frontend utiliza React Router (configurado en `App.jsx` y/o `app/layout/AppLayout.jsx`) para definir las rutas de la SPA.

## Páginas de autenticación y acceso

- `/` – `LandingPage.jsx`
  - Página de bienvenida pública.
- `/welcome` – `WelcomePage.jsx`
  - Pantalla introductoria tras registrarse o antes de completar onboarding.
- `/login` – `AuthForm.jsx` (modo login) dentro de una página.
- `/register` – `AuthForm.jsx` (modo registro).
- `/forgot-password` – `ForgotPasswordPage.jsx`
  - Formulario para solicitar un email de recuperación.
- `/reset-password` – `ResetPasswordPage.jsx`
  - Permite introducir una nueva contraseña usando el token enviado por email.

## Páginas de onboarding y selección de rol

- `/role-selection` – `RoleSelectionPage.jsx`
  - Permite al usuario elegir entre `CLIENT` y `COACH` (si tiene permisos).
- `/onboarding/...` – gestionado por páginas específicas (según implementación) y `OnboardingGuard.jsx`.

## Páginas de usuario (cliente)

- `/dashboard` – `Dashboard.jsx`
  - Resumen del día: calorías consumidas/quemadas, peso, tareas del día.
- `/daily-log` – `DailyLogPage.jsx`
  - Registro detallado del día (alimentos, ejercicios, peso).
- `/weight-tracking` – `WeightTrackingPage.jsx`
  - Gráficas de peso en el tiempo.
- `/diet` – `DietPage.jsx`
  - Gestión de comidas diarias y planes de dieta.
- `/calendar` – `CalendarPage.jsx`
  - Rutinas programadas por día (`scheduled_routines`).
- `/achievements` – `AchievementsPage.jsx`
  - Logros desbloqueados (`user_achievements`).
- `/check-in` – `CheckInPage.jsx`
  - Formulario semanal con peso, sentimiento y fotos de progreso.
- `/active-workout` – `ActiveWorkoutPage.jsx`
  - Vista para seguir un entrenamiento en tiempo real.

## Páginas de rutinas y plantillas

- `/routines` – `RoutinesPage.jsx`
  - Lista de rutinas del usuario.
- `/routines/:id` – `RoutineDetailPage.jsx`
  - Detalle de una rutina (ejercicios, días de la semana, etc.).
- `/templates` – `TemplatesPage.jsx`
  - Lista y gestión de plantillas de rutinas/dietas.

## Páginas de administración y coach

- `/admin` – `AdminDashboard.jsx`
  - Panel para administradores (gestión de usuarios, estadísticas).
- `/coach` – `CoachDashboard.jsx`
  - Vista principal del entrenador: lista de clientes, resumen de actividad.
- `/coach/clients/:id` – `CoachClientDetail.jsx`
  - Detalle de un cliente, con rutinas asignadas, check-ins y mensajes.

## Páginas de invitación

- `/invite/:token` – `InvitePage.jsx`
  - Permite aceptar una invitación enviada por un coach.

## Protección de rutas

- `OnboardingGuard.jsx`
  - Protege páginas que requieren onboarding completo.
- `AuthContext` + hooks de navegación
  - Redirigen al login si el usuario no está autenticado.


