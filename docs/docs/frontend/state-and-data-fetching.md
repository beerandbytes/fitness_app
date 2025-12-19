---
id: state-and-data-fetching
title: Estado y consumo de datos
---

El frontend combina **Context**, **Zustand** y hooks personalizados para gestionar estado y llamadas a la API.

## Contextos globales

- `AuthContext.jsx`
  - Almacena:
    - Usuario autenticado (id, email, rol, isAdmin).
    - Tokens de acceso/refresh.
  - Expone métodos:
    - `login`, `logout`, `refreshToken`.
  - Se integra con `services/api.js` para añadir el token a las peticiones.

- `BrandContext.jsx`
  - Contiene la configuración de marca (`brand_settings` del backend).

- `ThemeContext.jsx`
  - Controla tema claro/oscuro y sincroniza con `useThemeStore`.

## Stores (Zustand) en `stores/`

- `useUserStore.js`
  - Datos del usuario actual (rol, onboarding, preferencias).
- `useGoalStore.js`
  - Objetivos (`user_goals`) y cálculos derivados (calorías objetivo).
- `useTodayLogStore.js`
  - Estado del registro diario (`daily_logs`, `daily_exercises`, alimentos consumidos).
- `useToastStore.js`
  - Cola de toasts y sus estados.
- `useBrandStore.js`, `useThemeStore.js`
  - Configuración de marca y tema UI.

## Hooks de datos (`hooks/` y `shared/hooks/`)

- `useCachedApi.js`
  - Encapsula llamadas a la API con:
    - Caché en memoria (para evitar llamadas duplicadas).
    - Manejo de estados `loading` / `error` / `data`.

- `useRetry.js`
  - Añade reintentos exponenciales para peticiones críticas.

- `useRateLimit.js`
  - Previene que el usuario dispare demasiadas requests en poco tiempo (por ejemplo autocompletar).

- `useDailyLog.js` (en `shared/hooks/`)
  - Abstrae el acceso al log diario:
    - Cargar/crear `daily_logs` para la fecha actual.
    - Añadir ejercicios (`daily_exercises`) y alimentos (`meal_items`).

- `useNavigation.js`, `usePageTitle.js`
  - Synchronizan navegación y título de página con el estado global.

## Cliente de API (`services/api.js`)

- Configura `baseURL` usando `import.meta.env.VITE_API_URL`.
- Intercepta peticiones para añadir `Authorization: Bearer <token>`.
- Intercepta respuestas:
  - Maneja errores 401/403 redirigiendo a login o renovando tokens.
  - Expone helpers para dominios (auth, logs, foods, exercises, etc.).

## Flujo típico de datos

1. El usuario interactúa con una página (por ejemplo `DailyLogPage`).
2. El componente usa hooks (`useDailyLog`, `useCachedApi`) para obtener datos iniciales.
3. Las respuestas de la API se guardan en stores (Zustand) o estado local según convenga.
4. Los componentes hijos (`ModernExerciseCard`, `FoodSearchAndAdd`, etc.) reciben datos y callbacks para actualizar el estado.


