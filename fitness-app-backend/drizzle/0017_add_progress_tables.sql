-- Crear tablas para seguimiento de progreso
-- body_measurements: Medidas corporales
-- progress_photos: Fotos de progreso

CREATE TABLE IF NOT EXISTS "body_measurements" (
	"measurement_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" date NOT NULL,
	"chest" numeric,
	"waist" numeric,
	"hips" numeric,
	"arms" numeric,
	"thighs" numeric,
	"neck" numeric,
	"shoulders" numeric,
	"body_fat_percentage" numeric,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "measurement_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "progress_photos" (
	"photo_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" date NOT NULL,
	"photo_front" varchar(500),
	"photo_side" varchar(500),
	"photo_back" varchar(500),
	"weight" numeric,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "body_measurements" ADD CONSTRAINT "body_measurements_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;





