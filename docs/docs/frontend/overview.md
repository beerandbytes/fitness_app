---
id: overview
title: Arquitectura del frontend
---

El frontend de **Fitness App** es una SPA construida con **React** y **Vite**, usando Tailwind CSS para estilos y varias utilidades para accesibilidad y rendimiento.

## Estructura principal (`fitness-app-frontend/src`)

- `main.jsx`
  - Punto de entrada de React, monta la aplicación y configura `BrowserRouter` (según la implementación).
- `App.jsx`
  - Define la estructura principal de la app, rutas de alto nivel y layout global.

- `app/`
  - `config/navigation.config.jsx`: define secciones de navegación y rutas usadas por la barra inferior/superior.
  - `layout/AppLayout.jsx`: layout principal (navbar, bottom navigation, contenedor).

- `pages/`
  - Vistas de alto nivel:
    - `LandingPage.jsx`, `WelcomePage.jsx`.
    - `Dashboard.jsx`, `DailyLogPage.jsx`, `WeightTrackingPage.jsx`.
    - `DietPage.jsx`, `CalendarPage.jsx`.
    - `AchievementsPage.jsx`, `CheckInPage.jsx`.
    - `ActiveWorkoutPage.jsx`, `RoutinesPage.jsx`, `RoutineDetailPage.jsx`, `TemplatesPage.jsx`.
    - `AdminDashboard.jsx`.
    - `CoachDashboard.jsx`, `CoachClientDetail.jsx`.
    - `InvitePage.jsx`.
    - `ForgotPasswordPage.jsx`, `ResetPasswordPage.jsx`.
    - `RoleSelectionPage.jsx`.

- `components/`
  - Componentes reutilizables:
    - Navegación: `Navbar.jsx`, `ModernNavbar.jsx`, `BottomNavigation.jsx`, `SkipLink.jsx`.
    - UI y feedback: `LoadingSpinner.jsx`, `ErrorMessage.jsx`, `SkeletonLoader.jsx`, `ToastContainer.jsx`.
    - Tarjetas y widgets: `ModernExerciseCard.jsx`, `ModernRoutineCard.jsx`, `WeeklyStatsWidget.jsx`, `StreakBadge.jsx`.
    - Formularios y flujos: `AuthForm.jsx`, `WeightForm.jsx`, `RoutineExerciseForm.jsx`, `InviteClientModal.jsx`, `AssignTemplateModal.jsx`.
    - Contenido dinámico: `MuscleGroupSections.jsx`, `ExerciseSearchAndAdd.jsx`, `FoodSearchAndAdd.jsx`.
    - Accesibilidad/UX: `ThemeToggle.jsx`, `OptimizedImage.jsx`, `RequestCoachAttention.jsx`, `FirstStepsGuide.jsx`.

- `contexts/`
  - `AuthContext.jsx`: estado global de autenticación (usuario, tokens, login/logout).
  - `BrandContext.jsx`: marca (logo, colores, textos).
  - `ThemeContext.jsx`: tema claro/oscuro.

- `stores/` (Zustand)
  - `useUserStore.js`: datos del usuario autenticado.
  - `useGoalStore.js`: objetivos de peso/calorías.
  - `useTodayLogStore.js`: datos del log del día.
  - `useToastStore.js`: toasts y notificaciones locales.
  - `useBrandStore.js`, `useThemeStore.js`.

- `hooks/`
  - Hooks genéricos de UX:
    - `useCachedApi`, `useRetry`, `useRateLimit`.
    - `useDebounce`, `useSafeState`, `useLocalStorage`.
    - `useErrorHandler`, `useEscapeKey`, `useFocusTrap`, `useWebVitals`.

- `services/api.js`
  - Cliente HTTP centralizado.
  - Configura `VITE_API_URL` como base de la API.
  - Maneja headers de autenticación e intercepta respuestas de error.

- `shared/`
  - `components/`: componentes compartidos (charts, feedback, forms, layout).
  - `hooks/`: hooks compartidos como `useDailyLog`, `useNavigation`, `usePageTitle`.
  - `constants/`: constantes comunes (roles, rutas, etc.).
  - `utils/`: helpers reutilizables.

- `utils/`
  - `validators.js`, `validationSchemas.js/ts`: validaciones de formularios.
  - `formatters.js`: formateo de fechas, números, unidades.
  - `seo.js`: helpers de meta tags.
  - `logger.js`: logging en frontend.
  - `cache.js`, `registerServiceWorker.js`, etc.

En los siguientes documentos se detalla:

- El sistema de routing y las páginas principales (`frontend/routing-and-pages`).
- Los componentes clave y su responsabilidad (`frontend/components`).
- Cómo se gestionan estado y llamadas a la API (`frontend/state-and-data-fetching`).


