require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // En Docker interno a veces no se debe forzar SSL aunque sea producción
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function patchDatabase() {
    console.log("🛠️ Starting emergency database patch...");

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log("Checking and adding missing columns to 'exercises' table...");

        // 1. name_es
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='name_es') THEN
                    ALTER TABLE "exercises" ADD COLUMN "name_es" varchar(100);
                    RAISE NOTICE 'Added column name_es';
                ELSE
                    RAISE NOTICE 'Column name_es already exists';
                END IF;
            END $$;
        `);

        // 2. description
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='description') THEN
                    ALTER TABLE "exercises" ADD COLUMN "description" text;
                    RAISE NOTICE 'Added column description';
                ELSE
                    RAISE NOTICE 'Column description already exists';
                END IF;
            END $$;
        `);

        // 3. muscles
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='muscles') THEN
                    ALTER TABLE "exercises" ADD COLUMN "muscles" text;
                    RAISE NOTICE 'Added column muscles';
                ELSE
                    RAISE NOTICE 'Column muscles already exists';
                END IF;
            END $$;
        `);

        // 4. equipment
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='equipment') THEN
                    ALTER TABLE "exercises" ADD COLUMN "equipment" text;
                    RAISE NOTICE 'Added column equipment';
                ELSE
                    RAISE NOTICE 'Column equipment already exists';
                END IF;
            END $$;
        `);

        await client.query('COMMIT');
        console.log("✅ Database patch applied successfully!");

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("❌ Failed to patch database:", error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

patchDatabase();
