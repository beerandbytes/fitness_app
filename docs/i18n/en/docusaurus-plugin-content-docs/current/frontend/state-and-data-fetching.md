---
id: state-and-data-fetching
title: State and data consumption
---

The frontend combines **Context**, **Zustand** and custom hooks to manage state and API calls.

## Global contexts

- `AuthContext.jsx`
  - Stores:
    - Authenticated user (id, email, role, isAdmin).
    - Access/refresh tokens.
  - Exposes methods:
    - `login`, `logout`, `refreshToken`.
  - Integrates with `services/api.js` to add token to requests.

- `BrandContext.jsx`
  - Contains brand configuration (`brand_settings` from backend).

- `ThemeContext.jsx`
  - Controls light/dark theme and synchronizes with `useThemeStore`.

## Stores (Zustand) in `stores/`

- `useUserStore.js`
  - Current user data (role, onboarding, preferences).
- `useGoalStore.js`
  - Goals (`user_goals`) and derived calculations (target calories).
- `useTodayLogStore.js`
  - Daily log state (`daily_logs`, `daily_exercises`, consumed foods).
- `useToastStore.js`
  - Toast queue and their states.
- `useBrandStore.js`, `useThemeStore.js`
  - Brand and UI theme configuration.

## Data hooks (`hooks/` and `shared/hooks/`)

- `useCachedApi.js`
  - Encapsulates API calls with:
    - In-memory cache (to avoid duplicate calls).
    - `loading` / `error` / `data` state handling.

- `useRetry.js`
  - Adds exponential retries for critical requests.

- `useRateLimit.js`
  - Prevents user from firing too many requests in a short time (e.g., autocomplete).

- `useDailyLog.js` (in `shared/hooks/`)
  - Abstracts daily log access:
    - Load/create `daily_logs` for current date.
    - Add exercises (`daily_exercises`) and foods (`meal_items`).

- `useNavigation.js`, `usePageTitle.js`
  - Synchronize navigation and page title with global state.

## API client (`services/api.js`)

- Configures `baseURL` using `import.meta.env.VITE_API_URL`.
- Intercepts requests to add `Authorization: Bearer <token>`.
- Intercepts responses:
  - Handles 401/403 errors redirecting to login or renewing tokens.
  - Exposes helpers for domains (auth, logs, foods, exercises, etc.).

## Typical data flow

1. User interacts with a page (e.g., `DailyLogPage`).
2. Component uses hooks (`useDailyLog`, `useCachedApi`) to get initial data.
3. API responses are saved in stores (Zustand) or local state as appropriate.
4. Child components (`ModernExerciseCard`, `FoodSearchAndAdd`, etc.) receive data and callbacks to update state.

