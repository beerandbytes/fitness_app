---
id: components
title: Componentes principales del frontend
---

Esta sección resume los componentes más importantes y su responsabilidad.

## Layout y navegación

- `ModernNavbar.jsx` / `Navbar.jsx`
  - Barra superior con enlaces principales.
  - Puede mostrar información de usuario, tema y notificaciones.

- `BottomNavigation.jsx`
  - Navegación inferior optimizada para móvil (acceso rápido a Dashboard, Dieta, Entrenamientos, Perfil).

- `PageContainer.jsx` (en `shared/components/layout/`)
  - Contenedor estándar con paddings, título y manejo de scroll.

- `SkipLink.jsx`
  - Link de accesibilidad para saltar directamente al contenido principal.

## Autenticación y formularios

- `AuthForm.jsx`
  - Formulario reutilizable para login y registro.
  - Usa validaciones centralizadas (`validators.js`, `validationSchemas`).

- `WeightForm.jsx`
  - Formulario para registrar peso diario.

- `RoutineExerciseForm.jsx`
  - Formulario para añadir/editar ejercicios dentro de una rutina.

## Widgets y visualizaciones

- `CalorieRadialChart.jsx`
  - Muestra progreso de calorías consumidas vs. objetivo.

- `MacroBarChart.jsx`
  - Visualiza macros (proteínas, carbohidratos, grasas).

- `WeightLineChart.jsx`
  - Gráfica de peso a lo largo del tiempo.

- `WeeklyStatsWidget.jsx`
  - Resumen semanal de actividad (ejercicios, calorías, peso).

- `StreakBadge.jsx`
  - Muestra el streak de días consecutivos entrenando.

## Ejercicios y nutrición

- `MuscleGroupSections.jsx`
  - Organiza ejercicios por grupos musculares para facilitar la selección.

- `ModernExerciseCard.jsx`
  - Tarjeta visual de un ejercicio con nombre, categoría y multimedia.

- `ExerciseSearchAndAdd.jsx`
  - Componente completo para buscar ejercicios (`/api/exercises/search`) y añadirlos a rutinas o logs diarios.

- `FoodSearchAndAdd.jsx`
  - Búsqueda y selección de alimentos (`/api/foods`) para registrar comidas (`meal_items`).

## UX, accesibilidad y feedback

- `LoadingSpinner.jsx`, `LoadingState.jsx`
  - Indicadores de carga reutilizables.

- `ErrorMessage.jsx`
  - Muestra errores de forma consistente y accesible.

- `ToastContainer.jsx`
  - Contenedor de notificaciones tipo toast (ligado a `useToastStore`).

- `ThemeToggle.jsx`
  - Cambia entre tema claro y oscuro, integrándose con `ThemeContext` y `useThemeStore`.

- `OptimizedImage.jsx`
  - Componente para cargar imágenes de forma optimizada (lazy loading, tamaños responsivos).

## Componentes para coach y admin

- `UserManagement.jsx`
  - Gestiona usuarios (vista de admin): lista, roles, filtros.

- `InviteClientModal.jsx`
  - Modal para generar invitaciones y enviarlas a clientes potenciales.

- `AssignTemplateModal.jsx`
  - Modal para asignar plantillas de rutinas/dietas a clientes desde el panel de coach.

- `UserTracking.jsx`
  - Vista resumida del progreso de un cliente (peso, check-ins, logros).


