// Script para verificar que las tablas sociales se crearon correctamente
require('dotenv').config();
const { db } = require('../db/db_config');
const { sql } = require('drizzle-orm');

async function verifySocialTables() {
    console.log('🔍 Verificando que las tablas sociales existen...\n');
    
    try {
        // Verificar user_follows
        const userFollowsCheck = await db.execute(sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'user_follows'
            );
        `);
        console.log('✅ user_follows existe:', userFollowsCheck.rows[0].exists);
        
        // Verificar shared_workouts
        const sharedWorkoutsCheck = await db.execute(sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'shared_workouts'
            );
        `);
        console.log('✅ shared_workouts existe:', sharedWorkoutsCheck.rows[0].exists);
        
        // Verificar workout_likes
        const workoutLikesCheck = await db.execute(sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'workout_likes'
            );
        `);
        console.log('✅ workout_likes existe:', workoutLikesCheck.rows[0].exists);
        
        // Verificar workout_comments
        const workoutCommentsCheck = await db.execute(sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'workout_comments'
            );
        `);
        console.log('✅ workout_comments existe:', workoutCommentsCheck.rows[0].exists);
        
        // Verificar estructura de user_follows
        if (userFollowsCheck.rows[0].exists) {
            const userFollowsColumns = await db.execute(sql`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'user_follows'
                ORDER BY ordinal_position;
            `);
            console.log('\n📋 Columnas de user_follows:');
            userFollowsColumns.rows.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type}`);
            });
        }
        
        // Verificar estructura de shared_workouts
        if (sharedWorkoutsCheck.rows[0].exists) {
            const sharedWorkoutsColumns = await db.execute(sql`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'shared_workouts'
                ORDER BY ordinal_position;
            `);
            console.log('\n📋 Columnas de shared_workouts:');
            sharedWorkoutsColumns.rows.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type}`);
            });
        }
        
        // Verificar constraints únicos
        const uniqueConstraints = await db.execute(sql`
            SELECT 
                tc.table_name, 
                kcu.column_name,
                tc.constraint_name
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'UNIQUE' 
              AND tc.table_schema = 'public'
              AND tc.table_name IN ('user_follows', 'shared_workouts', 'workout_likes', 'workout_comments')
            ORDER BY tc.table_name, kcu.ordinal_position;
        `);
        
        if (uniqueConstraints.rows.length > 0) {
            console.log('\n🔒 Constraints únicos encontrados:');
            uniqueConstraints.rows.forEach(constraint => {
                console.log(`   - ${constraint.table_name}.${constraint.column_name} (${constraint.constraint_name})`);
            });
        }
        
        // Verificar foreign keys
        const foreignKeys = await db.execute(sql`
            SELECT
                tc.table_name, 
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name,
                tc.constraint_name
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY' 
              AND tc.table_schema = 'public'
              AND tc.table_name IN ('user_follows', 'shared_workouts', 'workout_likes', 'workout_comments')
            ORDER BY tc.table_name, kcu.ordinal_position;
        `);
        
        if (foreignKeys.rows.length > 0) {
            console.log('\n🔗 Foreign keys encontradas:');
            foreignKeys.rows.forEach(fk => {
                console.log(`   - ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
            });
        }
        
        const allExist = 
            userFollowsCheck.rows[0].exists &&
            sharedWorkoutsCheck.rows[0].exists &&
            workoutLikesCheck.rows[0].exists &&
            workoutCommentsCheck.rows[0].exists;
        
        if (allExist) {
            console.log('\n✅ ¡Todas las tablas sociales se crearon correctamente!');
        } else {
            console.log('\n⚠️  Algunas tablas no existen. Revisa los resultados arriba.');
        }
        
    } catch (error) {
        console.error('❌ Error verificando tablas:', error);
        throw error;
    } finally {
        process.exit(0);
    }
}

verifySocialTables();

