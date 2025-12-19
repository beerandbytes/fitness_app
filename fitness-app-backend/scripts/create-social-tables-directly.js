// Script para crear las tablas sociales directamente ejecutando el SQL
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL no está definido en el archivo .env');
}

const pool = new Pool({
    connectionString: connectionString,
    max: 1
});

async function createSocialTables() {
    console.log('🚀 Creando tablas sociales directamente...\n');
    
    const client = await pool.connect();
    
    try {
        // Crear las tablas una por una
        console.log('📝 Creando tablas...\n');
        
        // 1. user_follows
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS "user_follows" (
                    "follow_id" serial PRIMARY KEY NOT NULL,
                    "follower_id" integer NOT NULL,
                    "following_id" integer NOT NULL,
                    "created_at" timestamp DEFAULT now(),
                    CONSTRAINT "follow_unique" UNIQUE("follower_id","following_id")
                );
            `);
            console.log('   ✅ user_follows creada');
        } catch (error) {
            if (error.code !== '42P07') {
                console.error('   ❌ Error creando user_follows:', error.message);
                throw error;
            }
            console.log('   ⚠️  user_follows ya existe');
        }
        
        // 2. shared_workouts
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS "shared_workouts" (
                    "share_id" serial PRIMARY KEY NOT NULL,
                    "user_id" integer NOT NULL,
                    "routine_id" integer NOT NULL,
                    "is_public" boolean DEFAULT true NOT NULL,
                    "likes_count" integer DEFAULT 0 NOT NULL,
                    "shares_count" integer DEFAULT 0 NOT NULL,
                    "created_at" timestamp DEFAULT now()
                );
            `);
            console.log('   ✅ shared_workouts creada');
        } catch (error) {
            if (error.code !== '42P07') {
                console.error('   ❌ Error creando shared_workouts:', error.message);
                throw error;
            }
            console.log('   ⚠️  shared_workouts ya existe');
        }
        
        // 3. workout_likes
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS "workout_likes" (
                    "like_id" serial PRIMARY KEY NOT NULL,
                    "user_id" integer NOT NULL,
                    "share_id" integer NOT NULL,
                    "created_at" timestamp DEFAULT now(),
                    CONSTRAINT "like_unique" UNIQUE("user_id","share_id")
                );
            `);
            console.log('   ✅ workout_likes creada');
        } catch (error) {
            if (error.code !== '42P07') {
                console.error('   ❌ Error creando workout_likes:', error.message);
                throw error;
            }
            console.log('   ⚠️  workout_likes ya existe');
        }
        
        // 4. workout_comments
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS "workout_comments" (
                    "comment_id" serial PRIMARY KEY NOT NULL,
                    "user_id" integer NOT NULL,
                    "share_id" integer NOT NULL,
                    "content" text NOT NULL,
                    "created_at" timestamp DEFAULT now(),
                    "updated_at" timestamp DEFAULT now()
                );
            `);
            console.log('   ✅ workout_comments creada');
        } catch (error) {
            if (error.code !== '42P07') {
                console.error('   ❌ Error creando workout_comments:', error.message);
                throw error;
            }
            console.log('   ⚠️  workout_comments ya existe');
        }
        
        // Agregar foreign keys
        console.log('\n📝 Agregando foreign keys...\n');
        
        const foreignKeys = [
            { table: 'user_follows', constraint: 'user_follows_follower_id_users_user_id_fk', column: 'follower_id', refTable: 'users', refColumn: 'user_id' },
            { table: 'user_follows', constraint: 'user_follows_following_id_users_user_id_fk', column: 'following_id', refTable: 'users', refColumn: 'user_id' },
            { table: 'shared_workouts', constraint: 'shared_workouts_user_id_users_user_id_fk', column: 'user_id', refTable: 'users', refColumn: 'user_id' },
            { table: 'shared_workouts', constraint: 'shared_workouts_routine_id_routines_routine_id_fk', column: 'routine_id', refTable: 'routines', refColumn: 'routine_id' },
            { table: 'workout_likes', constraint: 'workout_likes_user_id_users_user_id_fk', column: 'user_id', refTable: 'users', refColumn: 'user_id' },
            { table: 'workout_likes', constraint: 'workout_likes_share_id_shared_workouts_share_id_fk', column: 'share_id', refTable: 'shared_workouts', refColumn: 'share_id' },
            { table: 'workout_comments', constraint: 'workout_comments_user_id_users_user_id_fk', column: 'user_id', refTable: 'users', refColumn: 'user_id' },
            { table: 'workout_comments', constraint: 'workout_comments_share_id_shared_workouts_share_id_fk', column: 'share_id', refTable: 'shared_workouts', refColumn: 'share_id' },
        ];
        
        for (const fk of foreignKeys) {
            try {
                await client.query(`
                    DO $$ 
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_constraint 
                            WHERE conname = '${fk.constraint}'
                        ) THEN
                            ALTER TABLE "${fk.table}" 
                            ADD CONSTRAINT "${fk.constraint}" 
                            FOREIGN KEY ("${fk.column}") 
                            REFERENCES "public"."${fk.refTable}"("${fk.refColumn}") 
                            ON DELETE no action ON UPDATE no action;
                        END IF;
                    END $$;
                `);
                console.log(`   ✅ ${fk.constraint} agregada`);
            } catch (error) {
                if (error.code === '42710' || error.message.includes('ya existe') || error.message.includes('already exists')) {
                    console.log(`   ⚠️  ${fk.constraint} ya existe`);
                } else {
                    console.error(`   ❌ Error agregando ${fk.constraint}:`, error.message);
                    // No lanzar error, continuar con las siguientes
                }
            }
        }
        
        console.log('\n✅ Tablas sociales creadas exitosamente!');
        
        // Verificar que las tablas existen
        const tables = ['user_follows', 'shared_workouts', 'workout_likes', 'workout_comments'];
        console.log('\n🔍 Verificando tablas creadas...\n');
        
        for (const tableName of tables) {
            const result = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                );
            `, [tableName]);
            
            console.log(`   ${result.rows[0].exists ? '✅' : '❌'} ${tableName}: ${result.rows[0].exists ? 'existe' : 'NO existe'}`);
        }
        
    } catch (error) {
        console.error('❌ Error creando tablas:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

createSocialTables()
    .then(() => {
        console.log('\n✅ Proceso completado.');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });

