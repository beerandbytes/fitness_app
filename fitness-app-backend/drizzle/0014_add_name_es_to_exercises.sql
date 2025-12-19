-- Migration: Add name_es column to exercises table
-- This field stores the Spanish translation (equivalencia en castellano) of exercise names

ALTER TABLE "exercises"
ADD COLUMN IF NOT EXISTS "name_es" varchar(100);

-- Add comment to explain the column
COMMENT ON COLUMN exercises.name_es IS 'Nombre del ejercicio en español (equivalencia en castellano)';

