#!/usr/bin/env node
/**
 * Script de diagnóstico para problemas en producción
 * Verifica:
 * - Conexión a la base de datos
 * - Ejercicios en la base de datos
 * - Variables de entorno críticas
 * - Configuración de admin emails
 */

require('dotenv').config();
const { db, pool } = require('../db/db_config');
const { exercises, users } = require('../db/schema');
const { eq, sql } = require('drizzle-orm');

async function diagnose() {
    console.log('🔍 DIAGNÓSTICO DE PRODUCCIÓN\n');
    console.log('='.repeat(50));
    
    // 1. Verificar variables de entorno
    console.log('\n📋 1. VARIABLES DE ENTORNO:');
    console.log('-'.repeat(50));
    
    const criticalVars = {
        'DATABASE_URL': process.env.DATABASE_URL,
        'JWT_SECRET': process.env.JWT_SECRET,
        'NODE_ENV': process.env.NODE_ENV,
        'PORT': process.env.PORT,
    };
    
    const optionalVars = {
        'ADMIN_EMAILS': process.env.ADMIN_EMAILS,
        'FRONTEND_URL': process.env.FRONTEND_URL,
        'SMTP_HOST': process.env.SMTP_HOST,
    };
    
    let hasErrors = false;
    
    Object.entries(criticalVars).forEach(([key, value]) => {
        if (value) {
            if (key === 'JWT_SECRET') {
                console.log(`✅ ${key}: ${value.length >= 32 ? '✅ Configurado (longitud adecuada)' : '⚠️  Muy corto (recomendado: 32+ caracteres)'}`);
            } else if (key === 'DATABASE_URL') {
                const masked = value.replace(/:[^:@]+@/, ':****@');
                console.log(`✅ ${key}: ${masked}`);
            } else {
                console.log(`✅ ${key}: ${value}`);
            }
        } else {
            console.log(`❌ ${key}: NO CONFIGURADA`);
            hasErrors = true;
        }
    });
    
    console.log('\n📋 Variables opcionales:');
    Object.entries(optionalVars).forEach(([key, value]) => {
        if (value) {
            if (key === 'ADMIN_EMAILS') {
                const emails = value.split(',').map(e => e.trim()).filter(Boolean);
                console.log(`✅ ${key}: ${emails.length} email(s) configurado(s)`);
                emails.forEach(email => console.log(`   - ${email}`));
            } else {
                console.log(`✅ ${key}: ${value}`);
            }
        } else {
            console.log(`⚠️  ${key}: No configurada (opcional)`);
        }
    });
    
    // 2. Verificar conexión a la base de datos
    console.log('\n🔌 2. CONEXIÓN A BASE DE DATOS:');
    console.log('-'.repeat(50));
    
    try {
        const healthCheck = await db.execute(sql`SELECT NOW() as current_time, version() as version`);
        console.log('✅ Conexión exitosa');
        console.log(`   Hora del servidor: ${healthCheck.rows[0].current_time}`);
        console.log(`   Versión PostgreSQL: ${healthCheck.rows[0].version.split(' ')[0]} ${healthCheck.rows[0].version.split(' ')[1]}`);
        
        // Estadísticas del pool
        console.log(`\n   Estadísticas del pool:`);
        console.log(`   - Total conexiones: ${pool.totalCount}`);
        console.log(`   - Conexiones inactivas: ${pool.idleCount}`);
        console.log(`   - Conexiones en espera: ${pool.waitingCount}`);
    } catch (error) {
        console.log(`❌ Error de conexión: ${error.message}`);
        hasErrors = true;
        return;
    }
    
    // 3. Verificar ejercicios
    console.log('\n💪 3. EJERCICIOS EN BASE DE DATOS:');
    console.log('-'.repeat(50));
    
    try {
        // Total de ejercicios
        const totalResult = await db.execute(sql`SELECT COUNT(*) as count FROM exercises`);
        const totalExercises = parseInt(totalResult.rows[0].count);
        console.log(`📊 Total de ejercicios: ${totalExercises}`);
        
        // Ejercicios públicos
        const publicResult = await db.execute(sql`SELECT COUNT(*) as count FROM exercises WHERE is_public = true`);
        const publicExercises = parseInt(publicResult.rows[0].count);
        console.log(`📊 Ejercicios públicos (is_public = true): ${publicExercises}`);
        
        // Ejercicios con imágenes
        const withImagesResult = await db.execute(sql`
            SELECT COUNT(*) as count 
            FROM exercises 
            WHERE is_public = true AND (gif_url IS NOT NULL OR video_url IS NOT NULL)
        `);
        const exercisesWithImages = parseInt(withImagesResult.rows[0].count);
        console.log(`📊 Ejercicios públicos con imágenes: ${exercisesWithImages}`);
        
        if (publicExercises === 0) {
            console.log('\n⚠️  ADVERTENCIA: No hay ejercicios públicos en la base de datos.');
            console.log('   Ejecuta: npm run populate:exercises');
            hasErrors = true;
        } else {
            // Mostrar algunos ejemplos
            const sampleResult = await db.select({
                exercise_id: exercises.exercise_id,
                name: exercises.name,
                category: exercises.category,
                is_public: exercises.is_public,
                has_image: sql`CASE WHEN ${exercises.gif_url} IS NOT NULL OR ${exercises.video_url} IS NOT NULL THEN true ELSE false END`.as('has_image')
            })
            .from(exercises)
            .where(eq(exercises.is_public, true))
            .limit(5);
            
            console.log('\n   Ejemplos de ejercicios públicos:');
            sampleResult.forEach(ex => {
                console.log(`   - ${ex.name} (${ex.category}) ${ex.has_image ? '🖼️' : '❌ sin imagen'}`);
            });
        }
    } catch (error) {
        console.log(`❌ Error al verificar ejercicios: ${error.message}`);
        console.log(`   Stack: ${error.stack}`);
        hasErrors = true;
    }
    
    // 4. Verificar usuarios admin
    console.log('\n👤 4. USUARIOS ADMINISTRADORES:');
    console.log('-'.repeat(50));
    
    try {
        const adminUsersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'`);
        const adminCount = parseInt(adminUsersResult.rows[0].count);
        console.log(`📊 Usuarios con rol ADMIN: ${adminCount}`);
        
        if (process.env.ADMIN_EMAILS) {
            const adminEmails = process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
            console.log(`\n📧 Emails configurados en ADMIN_EMAILS:`);
            
            // Verificar cada email de forma secuencial
            for (const email of adminEmails) {
                try {
                    const userResult = await db.select()
                        .from(users)
                        .where(eq(users.email, email))
                        .limit(1);
                    
                    if (userResult.length > 0) {
                        const user = userResult[0];
                        console.log(`   ✅ ${email} - Usuario existe (rol actual: ${user.role})`);
                        if (user.role !== 'ADMIN') {
                            console.log(`      ⚠️  El usuario existe pero NO tiene rol ADMIN en la BD`);
                            console.log(`      ℹ️  El rol se asignará automáticamente al registrarse si está en ADMIN_EMAILS`);
                        }
                    } else {
                        console.log(`   ⚠️  ${email} - Usuario NO existe aún`);
                        console.log(`      ℹ️  Se asignará rol ADMIN automáticamente al registrarse`);
                    }
                } catch (err) {
                    console.log(`   ❌ ${email} - Error al verificar: ${err.message}`);
                }
            }
        } else {
            console.log('⚠️  ADMIN_EMAILS no está configurada');
            console.log('   Los usuarios no serán marcados como admin automáticamente');
        }
    } catch (error) {
        console.log(`❌ Error al verificar usuarios admin: ${error.message}`);
        hasErrors = true;
    }
    
    // 5. Verificar tablas
    console.log('\n📊 5. ESTRUCTURA DE BASE DE DATOS:');
    console.log('-'.repeat(50));
    
    try {
        const tablesResult = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        const expectedTables = ['users', 'exercises', 'foods', 'daily_logs', 'daily_exercises', 'meal_items'];
        const existingTables = tablesResult.rows.map(r => r.table_name);
        
        console.log(`📊 Tablas encontradas: ${existingTables.length}`);
        expectedTables.forEach(table => {
            if (existingTables.includes(table)) {
                console.log(`   ✅ ${table}`);
            } else {
                console.log(`   ❌ ${table} - NO ENCONTRADA`);
                hasErrors = true;
            }
        });
    } catch (error) {
        console.log(`❌ Error al verificar tablas: ${error.message}`);
        hasErrors = true;
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('📋 RESUMEN:');
    console.log('='.repeat(50));
    
    // Cerrar conexión del pool
    try {
        await pool.end();
    } catch (error) {
        // Ignorar errores al cerrar
    }
    
    if (hasErrors) {
        console.log('❌ Se encontraron problemas que requieren atención.');
        console.log('\n💡 SOLUCIONES SUGERIDAS:');
        console.log('   1. Si faltan ejercicios: npm run populate:exercises');
        console.log('   2. Si falta ADMIN_EMAILS: Configúrala en Render como variable de entorno');
        console.log('   3. Si hay errores de conexión: Verifica DATABASE_URL');
        process.exit(1);
    } else {
        console.log('✅ Todo parece estar configurado correctamente.');
        process.exit(0);
    }
}

// Ejecutar diagnóstico
diagnose().catch(error => {
    console.error('❌ Error fatal en diagnóstico:', error);
    process.exit(1);
});

