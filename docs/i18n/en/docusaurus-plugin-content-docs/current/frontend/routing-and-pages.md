---
id: routing-and-pages
title: Routing and main pages
---

The frontend uses React Router (configured in `App.jsx` and/or `app/layout/AppLayout.jsx`) to define SPA routes.

## Authentication and access pages

- `/` – `LandingPage.jsx`
  - Public welcome page.
- `/welcome` – `WelcomePage.jsx`
  - Introductory screen after registration or before completing onboarding.
- `/login` – `AuthForm.jsx` (login mode) within a page.
- `/register` – `AuthForm.jsx` (register mode).
- `/forgot-password` – `ForgotPasswordPage.jsx`
  - Form to request recovery email.
- `/reset-password` – `ResetPasswordPage.jsx`
  - Allows entering a new password using the token sent by email.

## Onboarding and role selection pages

- `/role-selection` – `RoleSelectionPage.jsx`
  - Allows user to choose between `CLIENT` and `COACH` (if they have permissions).
- `/onboarding/...` – managed by specific pages (depending on implementation) and `OnboardingGuard.jsx`.

## User (client) pages

- `/dashboard` – `Dashboard.jsx`
  - Day summary: consumed/burned calories, weight, day tasks.
- `/daily-log` – `DailyLogPage.jsx`
  - Detailed day record (foods, exercises, weight).
- `/weight-tracking` – `WeightTrackingPage.jsx`
  - Weight charts over time.
- `/diet` – `DietPage.jsx`
  - Daily meal management and diet plans.
- `/calendar` – `CalendarPage.jsx`
  - Routines scheduled by day (`scheduled_routines`).
- `/achievements` – `AchievementsPage.jsx`
  - Unlocked achievements (`user_achievements`).
- `/check-in` – `CheckInPage.jsx`
  - Weekly form with weight, mood and progress photos.
- `/active-workout` – `ActiveWorkoutPage.jsx`
  - View to follow a workout in real time.

## Routine and template pages

- `/routines` – `RoutinesPage.jsx`
  - List of user routines.
- `/routines/:id` – `RoutineDetailPage.jsx`
  - Routine detail (exercises, days of week, etc.).
- `/templates` – `TemplatesPage.jsx`
  - List and management of routine/diet templates.

## Administration and coach pages

- `/admin` – `AdminDashboard.jsx`
  - Panel for administrators (user management, statistics).
- `/coach` – `CoachDashboard.jsx`
  - Coach main view: client list, activity summary.
- `/coach/clients/:id` – `CoachClientDetail.jsx`
  - Client detail, with assigned routines, check-ins and messages.

## Invitation pages

- `/invite/:token` – `InvitePage.jsx`
  - Allows accepting an invitation sent by a coach.

## Route protection

- `OnboardingGuard.jsx`
  - Protects pages that require completed onboarding.
- `AuthContext` + navigation hooks
  - Redirect to login if user is not authenticated.

