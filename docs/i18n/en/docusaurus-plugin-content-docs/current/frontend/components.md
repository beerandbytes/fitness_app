---
id: components
title: Main frontend components
---

This section summarizes the most important components and their responsibilities.

## Layout and navigation

- `ModernNavbar.jsx` / `Navbar.jsx`
  - Top bar with main links.
  - Can show user information, theme and notifications.

- `BottomNavigation.jsx`
  - Bottom navigation optimized for mobile (quick access to Dashboard, Diet, Workouts, Profile).

- `PageContainer.jsx` (in `shared/components/layout/`)
  - Standard container with paddings, title and scroll handling.

- `SkipLink.jsx`
  - Accessibility link to skip directly to main content.

## Authentication and forms

- `AuthForm.jsx`
  - Reusable form for login and registration.
  - Uses centralized validations (`validators.js`, `validationSchemas`).

- `WeightForm.jsx`
  - Form to register daily weight.

- `RoutineExerciseForm.jsx`
  - Form to add/edit exercises within a routine.

## Widgets and visualizations

- `CalorieRadialChart.jsx`
  - Shows progress of consumed calories vs. goal.

- `MacroBarChart.jsx`
  - Visualizes macros (proteins, carbohydrates, fats).

- `WeightLineChart.jsx`
  - Weight chart over time.

- `WeeklyStatsWidget.jsx`
  - Weekly activity summary (exercises, calories, weight).

- `StreakBadge.jsx`
  - Shows streak of consecutive training days.

## Exercises and nutrition

- `MuscleGroupSections.jsx`
  - Organizes exercises by muscle groups for easier selection.

- `ModernExerciseCard.jsx`
  - Visual card of an exercise with name, category and multimedia.

- `ExerciseSearchAndAdd.jsx`
  - Complete component to search exercises (`/api/exercises/search`) and add them to routines or daily logs.

- `FoodSearchAndAdd.jsx`
  - Food search and selection (`/api/foods`) to record meals (`meal_items`).

## UX, accessibility and feedback

- `LoadingSpinner.jsx`, `LoadingState.jsx`
  - Reusable loading indicators.

- `ErrorMessage.jsx`
  - Shows errors consistently and accessibly.

- `ToastContainer.jsx`
  - Toast notification container (linked to `useToastStore`).

- `ThemeToggle.jsx`
  - Switches between light and dark theme, integrating with `ThemeContext` and `useThemeStore`.

- `OptimizedImage.jsx`
  - Component to load images optimized (lazy loading, responsive sizes).

## Components for coach and admin

- `UserManagement.jsx`
  - Manages users (admin view): list, roles, filters.

- `InviteClientModal.jsx`
  - Modal to generate invitations and send them to potential clients.

- `AssignTemplateModal.jsx`
  - Modal to assign routine/diet templates to clients from coach panel.

- `UserTracking.jsx`
  - Summary view of client progress (weight, check-ins, achievements).

