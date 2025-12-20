require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function fixProgressTables() {
    console.log("🛠️ Creating progress tables...");

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log("Creating 'body_measurements' table...");
        await client.query(`
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
        `);

        console.log("Creating 'progress_photos' table...");
        await client.query(`
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
        `);

        console.log("Adding foreign keys...");
        try {
            await client.query(`
                ALTER TABLE "body_measurements" ADD CONSTRAINT "body_measurements_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
            `);
        } catch (e) {
            console.log("Foreign key for body_measurements might already exist or failed (non-critical if table exists):", e.message);
        }

        try {
            await client.query(`
                ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;
            `);
        } catch (e) {
            console.log("Foreign key for progress_photos might already exist or failed (non-critical if table exists):", e.message);
        }

        await client.query('COMMIT');
        console.log("\n✅ All progress tables created successfully.");
        process.exit(0);

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("❌ Error creating tables:", error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

fixProgressTables();
