// Script para verificar si las tablas de progreso existen
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkTables() {
    try {
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('body_measurements', 'progress_photos')
            ORDER BY table_name;
        `);
        
        console.log('Tablas encontradas:');
        if (result.rows.length === 0) {
            console.log('❌ No se encontraron las tablas body_measurements y progress_photos');
        } else {
            result.rows.forEach(row => {
                console.log(`✅ ${row.table_name}`);
            });
        }
        
        if (result.rows.length < 2) {
            console.log('\n⚠️  Las tablas faltantes necesitan ser creadas. Ejecutando migración manual...');
            await createTables();
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

async function createTables() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Crear body_measurements si no existe
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
        
        // Crear progress_photos si no existe
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
        
        // Agregar foreign keys si no existen
        await client.query(`
            DO $$ BEGIN
                ALTER TABLE "body_measurements" 
                ADD CONSTRAINT "body_measurements_user_id_users_user_id_fk" 
                FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") 
                ON DELETE no action ON UPDATE no action;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        await client.query(`
            DO $$ BEGIN
                ALTER TABLE "progress_photos" 
                ADD CONSTRAINT "progress_photos_user_id_users_user_id_fk" 
                FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") 
                ON DELETE no action ON UPDATE no action;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        
        await client.query('COMMIT');
        console.log('✅ Tablas creadas exitosamente');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creando tablas:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

checkTables();





