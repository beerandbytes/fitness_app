---
id: schema
title: Database schema (Drizzle / PostgreSQL)
---

The database is modeled with **Drizzle ORM** in `fitness-app-backend/db/schema.js` and runs on **PostgreSQL**.

## General Structure

The database contains **27 tables** organized into the following functional areas:

- **Authentication and users**: `users`
- **Daily logging**: `daily_logs`, `daily_exercises`
- **Nutrition**: `foods`, `meal_items`, `user_daily_meal_plans`
- **Exercises and training**: `exercises`, `routines`, `routine_exercises`, `scheduled_routines`
- **Goals and tracking**: `user_goals`, `check_ins`
- **Gamification**: `notifications`, `achievements`, `user_achievements`
- **Coach/Client**: `invite_tokens`, `routine_templates`, `diet_templates`, `client_routine_assignments`
- **Communication**: `messages`
- **Configuration**: `brand_settings`

## Detailed Tables

### 1. `users` - Users

Main authentication and user profiles table.

**Fields**:
- `user_id` (serial, PK): Unique user identifier
- `email` (varchar(255), UNIQUE, NOT NULL): User email (unique)
- `password_hash` (varchar(255), NOT NULL): Password hash (bcrypt)
- `reset_password_token` (varchar(255), nullable): Password recovery token
- `reset_password_expires` (timestamp, nullable): Token expiration
- `onboarding_completed` (boolean, default: false): Whether onboarding is completed
- `onboarding_step` (integer, default: 0): Current onboarding step (0-4)
- `gender` (varchar(20), nullable): Gender ('male', 'female', 'other')
- `age` (integer, nullable): Age in years
- `height` (numeric, nullable): Height in cm
- `role` (varchar(20), default: 'CLIENT', NOT NULL): User role ('CLIENT', 'COACH', 'ADMIN')
- `coach_id` (integer, FK → users.user_id, nullable): Assigned coach ID
- `created_at` (timestamp, default: now()): Creation date
- `updated_at` (timestamp, default: now()): Last update date

**Relationships**:
- A user can have a `coach_id` referencing another user with COACH role
- A user can have multiple `daily_logs`, `routines`, `user_goals`, etc.

### 2. `daily_logs` - Daily Metrics Log

Daily log of weight, consumed and burned calories.

**Fields**:
- `log_id` (serial, PK): Unique log identifier
- `user_id` (integer, FK → users.user_id, NOT NULL): Owner user
- `date` (date, NOT NULL): Log date
- `weight` (numeric, NOT NULL): Weight in kg
- `consumed_calories` (numeric, default: 0, NOT NULL): Consumed calories
- `burned_calories` (numeric, default: 0, NOT NULL): Burned calories
- `created_at` (timestamp, default: now()): Creation date
- `updated_at` (timestamp, default: now()): Update date

**Constraints**:
- UNIQUE (`user_id`, `date`): Only one log per user per day

**Relationships**:
- Belongs to a `user` (many-to-one)
- Has multiple `daily_exercises` (one-to-many)
- Has multiple `meal_items` (one-to-many)

### 3. `foods` - Food Catalog

Food catalog with nutritional information.

**Fields**:
- `food_id` (serial, PK): Unique food identifier
- `name` (varchar(100), UNIQUE, NOT NULL): Food name
- `calories_base` (numeric, NOT NULL): Calories per 100g
- `protein_g` (numeric, default: 0, NOT NULL): Protein grams per 100g
- `carbs_g` (numeric, default: 0, NOT NULL): Carbohydrate grams per 100g
- `fat_g` (numeric, default: 0, NOT NULL): Fat grams per 100g
- `created_at` (timestamp, default: now()): Creation date

**Relationships**:
- Referenced by multiple `meal_items` (one-to-many)

### 4. `meal_items` - Daily Consumption Log

Record of foods consumed on a specific day.

**Fields**:
- `meal_item_id` (serial, PK): Unique identifier
- `log_id` (integer, FK → daily_logs.log_id, NOT NULL): Associated daily log
- `food_id` (integer, FK → foods.food_id, NOT NULL): Consumed food
- `quantity_grams` (numeric, NOT NULL): Quantity in grams
- `meal_type` (varchar(50), NOT NULL): Meal type ('Breakfast', 'Lunch', 'Dinner', etc.)
- `consumed_calories` (numeric, NOT NULL): Consumed calories (calculated)
- `created_at` (timestamp, default: now()): Creation date

**Relationships**:
- Belongs to a `daily_log` (many-to-one)
- References a `food` (many-to-one)

### 5. `exercises` - Exercise Catalog

Catalog of exercises available in the application.

**Fields**:
- `exercise_id` (serial, PK): Unique exercise identifier
- `name` (varchar(100), UNIQUE, NOT NULL): Exercise name
- `category` (varchar(50), NOT NULL): Category ('Cardio', 'Strength', 'Hybrid', etc.)
- `default_calories_per_minute` (numeric, default: 5, NOT NULL): Calories burned per minute (base)
- `gif_url` (varchar(500), nullable): GIF/image demonstration URL
- `video_url` (varchar(500), nullable): Video demonstration URL
- `wger_id` (integer, nullable): Exercise ID in wger API (external reference)
- `is_public` (boolean, default: true, NOT NULL): Whether the exercise is public
- `created_at` (timestamp, default: now()): Creation date

**Relationships**:
- Referenced by multiple `routine_exercises` (one-to-many)
- Referenced by multiple `daily_exercises` (one-to-many)

### 6. `routines` - User Routines

Training routines created by users or coaches.

**Fields**:
- `routine_id` (serial, PK): Unique routine identifier
- `user_id` (integer, FK → users.user_id, NOT NULL): Owner user
- `name` (varchar(100), NOT NULL): Routine name
- `description` (varchar(255), nullable): Routine description
- `is_active` (boolean, default: true, NOT NULL): Whether the routine is active
- `created_at` (timestamp, default: now()): Creation date
- `updated_at` (timestamp, default: now()): Update date

**Relationships**:
- Belongs to a `user` (many-to-one)
- Has multiple `routine_exercises` (one-to-many)
- Referenced by multiple `scheduled_routines` (one-to-many)

### 7. `routine_exercises` - Exercises in a Routine

Template of exercises that compose a routine.

**Fields**:
- `routine_exercise_id` (serial, PK): Unique identifier
- `routine_id` (integer, FK → routines.routine_id, NOT NULL): Routine it belongs to
- `exercise_id` (integer, FK → exercises.exercise_id, NOT NULL): Included exercise
- `sets` (integer, NOT NULL): Number of sets
- `reps` (integer, nullable): Repetitions (null if cardio)
- `duration_minutes` (numeric, nullable): Duration in minutes (null if sets/reps)
- `weight_kg` (numeric, default: 0): Weight in kg
- `order_index` (integer, NOT NULL): Exercise order in the routine
- `day_of_week` (integer, nullable): Day of week (0=Sunday, 1=Monday, ..., 6=Saturday, null=all days)

**Constraints**:
- UNIQUE (`routine_id`, `exercise_id`, `day_of_week`): Prevents duplicates

**Relationships**:
- Belongs to a `routine` (many-to-one)
- References an `exercise` (many-to-one)

### 8. `daily_exercises` - Daily Completed Exercises Log

Record of exercises completed on a specific day.

**Fields**:
- `daily_exercise_id` (serial, PK): Unique identifier
- `log_id` (integer, FK → daily_logs.log_id, NOT NULL): Associated daily log
- `exercise_id` (integer, FK → exercises.exercise_id, NOT NULL): Completed exercise
- `sets_done` (integer, NOT NULL): Completed sets
- `reps_done` (integer, nullable): Completed repetitions
- `duration_minutes` (numeric, nullable): Duration in minutes
- `weight_kg` (numeric, default: 0): Weight used
- `burned_calories` (numeric, NOT NULL): Burned calories (calculated)
- `created_at` (timestamp, default: now()): Creation date

**Relationships**:
- Belongs to a `daily_log` (many-to-one)
- References an `exercise` (many-to-one)

### 9. `user_goals` - User Goals

User weight and calorie goals.

**Fields**:
- `goal_id` (serial, PK): Unique goal identifier
- `user_id` (integer, FK → users.user_id, NOT NULL): Owner user
- `target_weight` (numeric, NOT NULL): Target weight in kg
- `current_weight` (numeric, NOT NULL): Current weight when goal was set
- `daily_calorie_goal` (numeric, nullable): Daily calorie goal (calculated)
- `weekly_weight_change_goal` (numeric, default: -0.5, NOT NULL): Weekly weight change goal (kg/week, negative=loss)
- `goal_type` (varchar(50), default: 'weight_loss', NOT NULL): Goal type ('weight_loss', 'weight_gain', 'maintain')
- `is_active` (boolean, default: true, NOT NULL): Whether the goal is active
- `created_at` (timestamp, default: now()): Creation date
- `updated_at` (timestamp, default: now()): Update date

**Relationships**:
- Belongs to a `user` (many-to-one)

### 10. `scheduled_routines` - Scheduled Routines

Routines scheduled in the user's calendar.

**Fields**:
- `scheduled_id` (serial, PK): Unique identifier
- `user_id` (integer, FK → users.user_id, NOT NULL): Owner user
- `routine_id` (integer, FK → routines.routine_id, NOT NULL): Scheduled routine
- `scheduled_date` (date, NOT NULL): Date for which it's scheduled
- `is_completed` (boolean, default: false, NOT NULL): Whether the routine was completed
- `completed_at` (timestamp, nullable): Timestamp when it was completed
- `created_at` (timestamp, default: now()): Creation date
- `updated_at` (timestamp, default: now()): Update date

**Constraints**:
- UNIQUE (`user_id`, `routine_id`, `scheduled_date`): One routine per user per date

**Relationships**:
- Belongs to a `user` (many-to-one)
- References a `routine` (many-to-one)

### 11. `user_daily_meal_plans` - Daily Meal Plans

Meal plans defined by coaches for each day of the week.

**Fields**:
- `plan_id` (serial, PK): Unique identifier
- `user_id` (integer, FK → users.user_id, NOT NULL): User/client
- `day_of_week` (integer, NOT NULL): Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
- `breakfast` (varchar(1000), nullable): Free text for breakfast
- `lunch` (varchar(1000), nullable): Free text for lunch
- `dinner` (varchar(1000), nullable): Free text for dinner
- `snacks` (varchar(1000), nullable): Free text for snacks

**Constraints**:
- UNIQUE (`user_id`, `day_of_week`): One plan per user per day of week

**Relationships**:
- Belongs to a `user` (many-to-one)

### 12. `notifications` - Notification System

Notifications for users.

**Fields**:
- `notification_id` (serial, PK): Unique identifier
- `user_id` (integer, FK → users.user_id, NOT NULL): Target user
- `title` (varchar(255), NOT NULL): Notification title
- `message` (varchar(1000), NOT NULL): Notification message
- `type` (varchar(50), default: 'info', NOT NULL): Type ('info', 'success', 'warning', 'achievement', 'reminder')
- `is_read` (boolean, default: false, NOT NULL): Whether it was read
- `link_url` (varchar(500), nullable): Optional URL to navigate on click
- `created_at` (timestamp, default: now()): Creation date

**Relationships**:
- Belongs to a `user` (many-to-one)

### 13. `achievements` - Achievement System

Definition of available achievements.

**Fields**:
- `achievement_id` (serial, PK): Unique identifier
- `name` (varchar(100), UNIQUE, NOT NULL): Achievement name
- `description` (varchar(500), nullable): Achievement description
- `icon` (varchar(50), nullable): Emoji or icon code
- `category` (varchar(50), nullable): Category ('weight', 'exercise', 'nutrition', 'streak', 'milestone')
- `condition_type` (varchar(50), NOT NULL): Condition type ('weight_loss', 'weight_gain', 'days_streak', 'exercises_completed', etc.)
- `condition_value` (numeric, NOT NULL): Value needed to unlock
- `rarity` (varchar(20), default: 'common', NOT NULL): Rarity ('common', 'rare', 'epic', 'legendary')
- `created_at` (timestamp, default: now()): Creation date

**Relationships**:
- Referenced by multiple `user_achievements` (one-to-many)

### 14. `user_achievements` - User Unlocked Achievements

Achievements unlocked by each user.

**Fields**:
- `user_achievement_id` (serial, PK): Unique identifier
- `user_id` (integer, FK → users.user_id, NOT NULL): User
- `achievement_id` (integer, FK → achievements.achievement_id, NOT NULL): Unlocked achievement
- `unlocked_at` (timestamp, default: now()): Unlock date

**Constraints**:
- UNIQUE (`user_id`, `achievement_id`): A user can only unlock an achievement once

**Relationships**:
- Belongs to a `user` (many-to-one)
- References an `achievement` (many-to-one)

### 15. `brand_settings` - Brand Configuration

Brand/organization configuration for the application.

**Fields**:
- `setting_id` (serial, PK): Unique identifier
- `brand_name` (varchar(100), default: 'FitnessApp', NOT NULL): Brand name
- `tagline` (varchar(255), nullable): Slogan or tagline
- `logo_url` (varchar(500), nullable): Logo URL
- `instagram_url` (varchar(255), nullable): Instagram URL
- `facebook_url` (varchar(255), nullable): Facebook URL
- `twitter_url` (varchar(255), nullable): Twitter URL
- `linkedin_url` (varchar(255), nullable): LinkedIn URL
- `youtube_url` (varchar(255), nullable): YouTube URL
- `tiktok_url` (varchar(255), nullable): TikTok URL
- `website_url` (varchar(255), nullable): Website URL
- `created_at` (timestamp, default: now()): Creation date
- `updated_at` (timestamp, default: now()): Update date

### 16. `invite_tokens` - Invitation System

Invitation tokens for the coach/client system.

**Fields**:
- `id` (serial, PK): Unique identifier
- `coach_id` (integer, FK → users.user_id, NOT NULL): Coach creating the invitation
- `email` (varchar(255), NOT NULL): Invited email
- `token` (varchar(255), UNIQUE, NOT NULL): Unique invitation token
- `expires_at` (timestamp, NOT NULL): Expiration date
- `used` (boolean, default: false, NOT NULL): Whether the token was used
- `created_at` (timestamp, default: now()): Creation date

**Relationships**:
- Belongs to a `user` (coach) (many-to-one)

### 17. `routine_templates` - Routine Templates

Routine templates created by coaches.

**Fields**:
- `template_id` (serial, PK): Unique identifier
- `coach_id` (integer, FK → users.user_id, NOT NULL): Creator coach
- `name` (varchar(100), NOT NULL): Template name
- `description` (varchar(500), nullable): Description
- `exercises` (jsonb, NOT NULL): Array of exercises with sets, reps, etc. (JSON)
- `created_at` (timestamp, default: now()): Creation date
- `updated_at` (timestamp, default: now()): Update date

**Relationships**:
- Belongs to a `user` (coach) (many-to-one)
- Referenced by multiple `client_routine_assignments` (one-to-many)

### 18. `diet_templates` - Diet Templates

Diet templates created by coaches.

**Fields**:
- `template_id` (serial, PK): Unique identifier
- `coach_id` (integer, FK → users.user_id, NOT NULL): Creator coach
- `name` (varchar(100), NOT NULL): Template name
- `description` (varchar(500), nullable): Description
- `meals` (jsonb, NOT NULL): Array of meals with foods and quantities (JSON)
- `target_macros` (jsonb, nullable): Macronutrient targets `{protein, carbs, fat, calories}` (JSON)
- `created_at` (timestamp, default: now()): Creation date
- `updated_at` (timestamp, default: now()): Update date

**Relationships**:
- Belongs to a `user` (coach) (many-to-one)

### 19. `client_routine_assignments` - Routine Assignments

Routine assignments from coaches to clients.

**Fields**:
- `assignment_id` (serial, PK): Unique identifier
- `client_id` (integer, FK → users.user_id, NOT NULL): Assigned client
- `template_id` (integer, FK → routine_templates.template_id, NOT NULL): Assigned template
- `assigned_date` (date, NOT NULL): Assignment date
- `is_recurring` (boolean, default: false, NOT NULL): Whether it's recurring
- `recurring_day` (integer, nullable): Day of week for recurrence (0-6, null if not recurring)
- `created_at` (timestamp, default: now()): Creation date

**Constraints**:
- UNIQUE (`client_id`, `template_id`, `assigned_date`): Prevents duplicate assignments

**Relationships**:
- Belongs to a `user` (client) (many-to-one)
- References a `routine_template` (many-to-one)

### 20. `check_ins` - Weekly Check-ins

Weekly check-ins from clients to coaches.

**Fields**:
- `check_in_id` (serial, PK): Unique identifier
- `client_id` (integer, FK → users.user_id, NOT NULL): Client
- `week_of` (date, NOT NULL): Monday of the week
- `weight` (numeric, nullable): Weight in kg
- `feeling` (integer, nullable): Feeling scale (1-5)
- `notes` (text, nullable): Client notes
- `photo_front` (varchar(500), nullable): Front photo URL
- `photo_side` (varchar(500), nullable): Side photo URL
- `photo_back` (varchar(500), nullable): Back photo URL
- `created_at` (timestamp, default: now()): Creation date
- `updated_at` (timestamp, default: now()): Update date

**Constraints**:
- UNIQUE (`client_id`, `week_of`): One check-in per client per week

**Relationships**:
- Belongs to a `user` (client) (many-to-one)

### 21. `messages` - Chat System

One-to-one messages between users (coach/client).

**Fields**:
- `message_id` (serial, PK): Unique identifier
- `sender_id` (integer, FK → users.user_id, NOT NULL): Sender user
- `receiver_id` (integer, FK → users.user_id, NOT NULL): Receiver user
- `content` (text, NOT NULL): Message content
- `is_read` (boolean, default: false, NOT NULL): Whether it was read
- `created_at` (timestamp, default: now()): Creation date

**Relationships**:
- Sender: belongs to a `user` (sender) (many-to-one)
- Receiver: belongs to a `user` (receiver) (many-to-one)

## Main Relationships Diagram

```
users (1) ──< (many) daily_logs
users (1) ──< (many) routines
users (1) ──< (many) user_goals
users (1) ──< (many) scheduled_routines
users (1) ──< (many) notifications
users (1) ──< (many) user_achievements
users (1) ──< (many) user_daily_meal_plans
users (1) ──< (many) check_ins
users (1) ──< (many) invite_tokens (as coach_id)
users (1) ──< (many) routine_templates (as coach_id)
users (1) ──< (many) diet_templates (as coach_id)
users (1) ──< (many) client_routine_assignments (as client_id)
users (1) ──< (many) messages (as sender_id)
users (1) ──< (many) messages (as receiver_id)

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

## Important Notes

1. **Primary Keys**: All tables use `serial` (auto-increment) as primary key.

2. **Foreign Keys**: Relationships are explicitly defined using `.references()` in Drizzle.

3. **Unique Constraints**: Several tables have UNIQUE constraints to prevent duplicates:
   - `daily_logs`: one log per user per day
   - `check_ins`: one check-in per client per week
   - `user_daily_meal_plans`: one plan per user per day of week
   - `user_achievements`: an achievement can only be unlocked once per user

4. **JSON Data Types**: The `routine_templates` and `diet_templates` tables use `jsonb` to store complex exercise and meal structures.

5. **Role System**: The `role` field in `users` determines available permissions and functionalities:
   - `CLIENT`: Regular user
   - `COACH`: Coach with access to management tools
   - `ADMIN`: Administrator with full access

6. **Onboarding**: The onboarding system is integrated into the `users` table with `onboarding_completed` and `onboarding_step`.

For more technical details, see:
- `fitness-app-backend/db/schema.js` - Complete schema definition
- `fitness-app-backend/drizzle/` - SQL migration files
