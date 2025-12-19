---
id: overview
title: Frontend architecture
---

The frontend is a SPA built with **React** and **Vite**, using Tailwind CSS and several custom hooks/utilities.

## Main structure (`fitness-app-frontend/src`)

- `main.jsx` and `App.jsx`
  - React entry point and top-level routing/layout.

- `pages/`
  - High level screens:
    - Auth & access: `LandingPage`, `WelcomePage`, `ForgotPasswordPage`, `ResetPasswordPage`, `RoleSelectionPage`.
    - User dashboards: `Dashboard`, `DailyLogPage`, `WeightTrackingPage`, `DietPage`, `CalendarPage`, `AchievementsPage`, `CheckInPage`, `ActiveWorkoutPage`.
    - Routines & templates: `RoutinesPage`, `RoutineDetailPage`, `TemplatesPage`.
    - Admin/coach: `AdminDashboard`, `CoachDashboard`, `CoachClientDetail`, `InvitePage`.

- `components/`
  - Reusable UI such as navbars, bottom navigation, charts, cards, forms, modals, loaders and toasts.

- `contexts/`
  - `AuthContext`, `BrandContext`, `ThemeContext`.

- `stores/` (Zustand)
  - User data, goals, today log, brand, theme, toasts.

- `hooks/` and `shared/hooks/`
  - `useCachedApi`, `useRetry`, `useRateLimit`, `useDailyLog`, `useNavigation`, `usePageTitle`, etc.

- `services/api.js`
  - Central HTTP client configured with `VITE_API_URL`, JWT headers and error handling.

Other pages explain routing, main components and data fetching in more detail.


