-- Crear tablas para el sistema social y comunidad
-- user_follows: Sistema de seguir usuarios
-- shared_workouts: Rutinas compartidas públicamente
-- workout_likes: Likes en rutinas compartidas
-- workout_comments: Comentarios en rutinas compartidas

CREATE TABLE IF NOT EXISTS "user_follows" (
	"follow_id" serial PRIMARY KEY NOT NULL,
	"follower_id" integer NOT NULL,
	"following_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "follow_unique" UNIQUE("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shared_workouts" (
	"share_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"routine_id" integer NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"shares_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workout_likes" (
	"like_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"share_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "like_unique" UNIQUE("user_id","share_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workout_comments" (
	"comment_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"share_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_users_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_following_id_users_user_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_workouts" ADD CONSTRAINT "shared_workouts_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_workouts" ADD CONSTRAINT "shared_workouts_routine_id_routines_routine_id_fk" FOREIGN KEY ("routine_id") REFERENCES "public"."routines"("routine_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workout_likes" ADD CONSTRAINT "workout_likes_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workout_likes" ADD CONSTRAINT "workout_likes_share_id_shared_workouts_share_id_fk" FOREIGN KEY ("share_id") REFERENCES "public"."shared_workouts"("share_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workout_comments" ADD CONSTRAINT "workout_comments_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workout_comments" ADD CONSTRAINT "workout_comments_share_id_shared_workouts_share_id_fk" FOREIGN KEY ("share_id") REFERENCES "public"."shared_workouts"("share_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

