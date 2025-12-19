-- Agregar campos de información adicional a la tabla exercises
-- description: Descripción del ejercicio (cómo realizarlo)
-- muscles: Músculos trabajados (JSON array o texto)
-- equipment: Equipamiento necesario (JSON array o texto)

ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "muscles" text;
ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "equipment" text;

