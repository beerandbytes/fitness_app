#!/usr/bin/env node
/**
 * Script de verificación completa del proyecto
 * Verifica:
 * - Conexión a base de datos
 * - Todas las rutas están cargadas correctamente
 * - Variables de entorno
 * - Configuración del pool
 */

require('dotenv').config();
const { db, pool, checkDatabaseHealth } = require('../db/db_config');
const { sql } = require('drizzle-orm');
const logger = require('../utils/logger');

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log('\n' + '='.repeat(70));
    log(title, 'cyan');
    console.log('='.repeat(70));
}

function logSubsection(title) {
    console.log('\n' + '-'.repeat(70));
    log(title, 'blue');
    console.log('-'.repeat(70));
}

async function verifyDatabaseConnection() {
    logSection('🗄️  VERIFICACIÓN DE BASE DE DATOS');
    
    let dbOk = true;
    
    try {
        // Verificar health check
        logSubsection('Health Check');
        const health = await checkDatabaseHealth();
        
        if (health.healthy) {
            log('✅ Base de datos conectada correctamente', 'green');
            log(`   Timestamp: ${health.timestamp}`, 'green');
            log(`   Pool Stats:`, 'green');
            log(`     - Total: ${health.poolStats.totalCount}`, 'green');
            log(`     - Idle: ${health.poolStats.idleCount}`, 'green');
            log(`     - Waiting: ${health.poolStats.waitingCount}`, 'green');
        } else {
            log(`❌ Error en conexión: ${health.error}`, 'red');
            dbOk = false;
        }
        
        // Verificar query simple
        logSubsection('Query de Prueba');
        const result = await db.execute(sql`SELECT NOW() as now, current_database() as db`);
        log(`✅ Query exitosa`, 'green');
        log(`   Base de datos: ${result.rows[0].db}`, 'green');
        log(`   Hora del servidor: ${result.rows[0].now}`, 'green');
        
    } catch (error) {
        log(`❌ Error verificando base de datos: ${error.message}`, 'red');
        dbOk = false;
    }
    
    return dbOk;
}

function verifyRoutes() {
    logSection('🛣️  VERIFICACIÓN DE RUTAS');
    
    const routes = [
        'auth', 'logs', 'foods', 'mealItems', 'routines', 'exercises',
        'workouts', 'goals', 'calendar', 'onboarding', 'admin', 'brand',
        'notifications', 'achievements', 'coach', 'client', 'invite',
        'templates', 'checkins', 'messages', 'health'
    ];
    
    let allOk = true;
    const results = [];
    
    routes.forEach(r => {
        try {
            const route = require(`../routes/${r}`);
            if (!route) {
                log(`❌ ${r}: No exporta router`, 'red');
                results.push({ route: r, status: 'ERROR', message: 'No exporta router' });
                allOk = false;
            } else {
                log(`✅ ${r}`, 'green');
                results.push({ route: r, status: 'OK' });
            }
        } catch(e) {
            log(`❌ ${r}: ${e.message}`, 'red');
            results.push({ route: r, status: 'ERROR', message: e.message });
            allOk = false;
        }
    });
    
    logSubsection('Resumen de Rutas');
    const okCount = results.filter(r => r.status === 'OK').length;
    const errorCount = results.filter(r => r.status === 'ERROR').length;
    log(`✅ Rutas OK: ${okCount}/${routes.length}`, okCount === routes.length ? 'green' : 'yellow');
    
    if (errorCount > 0) {
        log(`❌ Rutas con errores: ${errorCount}`, 'red');
        results.filter(r => r.status === 'ERROR').forEach(r => {
            log(`   - ${r.route}: ${r.message}`, 'red');
        });
    }
    
    return allOk;
}

function verifyEnvironmentVariables() {
    logSection('🔐 VERIFICACIÓN DE VARIABLES DE ENTORNO');
    
    const critical = ['DATABASE_URL', 'JWT_SECRET'];
    const recommended = ['FRONTEND_URL', 'NODE_ENV', 'PORT'];
    
    let allCriticalOk = true;
    let missingRecommended = [];
    
    logSubsection('Variables Críticas');
    critical.forEach(varName => {
        if (process.env[varName]) {
            // Ocultar valores sensibles
            const value = varName === 'DATABASE_URL' 
                ? process.env[varName].substring(0, 20) + '...' 
                : '***configurado***';
            log(`✅ ${varName}: ${value}`, 'green');
        } else {
            log(`❌ ${varName}: NO CONFIGURADA`, 'red');
            allCriticalOk = false;
        }
    });
    
    logSubsection('Variables Recomendadas');
    recommended.forEach(varName => {
        if (process.env[varName]) {
            log(`✅ ${varName}: ${process.env[varName]}`, 'green');
        } else {
            log(`⚠️  ${varName}: No configurada (opcional)`, 'yellow');
            missingRecommended.push(varName);
        }
    });
    
    // Verificar JWT_SECRET length
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        log(`⚠️  JWT_SECRET es corto (${process.env.JWT_SECRET.length} caracteres). Se recomienda al menos 32.`, 'yellow');
    }
    
    return { allCriticalOk, missingRecommended };
}

function verifyPoolConfiguration() {
    logSubsection('Configuración del Pool');
    
    const poolConfig = {
        max: parseInt(process.env.DB_POOL_MAX || '20', 10),
        min: parseInt(process.env.DB_POOL_MIN || '5', 10),
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
        connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
    };
    
    log(`Máximo de conexiones: ${poolConfig.max}`, 'green');
    log(`Mínimo de conexiones: ${poolConfig.min}`, 'green');
    log(`Timeout de inactividad: ${poolConfig.idleTimeoutMillis}ms`, 'green');
    log(`Timeout de conexión: ${poolConfig.connectionTimeoutMillis}ms`, 'green');
    
    let warnings = [];
    if (poolConfig.min > 10) {
        warnings.push(`Mínimo de conexiones alto (${poolConfig.min}). Considera 2-5 para Render Free Tier.`);
    }
    if (poolConfig.max > 20) {
        warnings.push(`Máximo de conexiones (${poolConfig.max}) puede exceder límite de Render Free Tier.`);
    }
    
    if (warnings.length > 0) {
        warnings.forEach(w => log(`⚠️  ${w}`, 'yellow'));
    }
    
    return warnings.length === 0;
}

async function main() {
    console.log('\n');
    log('🚀 INICIANDO VERIFICACIÓN COMPLETA DEL PROYECTO', 'cyan');
    console.log('\n');
    
    const results = {
        database: false,
        routes: false,
        env: { critical: false, recommended: [] },
        pool: false
    };
    
    // 1. Verificar variables de entorno
    const envResult = verifyEnvironmentVariables();
    results.env.critical = envResult.allCriticalOk;
    results.env.recommended = envResult.missingRecommended;
    
    if (!results.env.critical) {
        log('\n❌ ERROR: Variables críticas faltantes. Abortando verificación.', 'red');
        process.exit(1);
    }
    
    // 2. Verificar configuración del pool
    results.pool = verifyPoolConfiguration();
    
    // 3. Verificar conexión a base de datos
    results.database = await verifyDatabaseConnection();
    
    // 4. Verificar rutas
    results.routes = verifyRoutes();
    
    // Resumen final
    logSection('📊 RESUMEN FINAL');
    
    log(`Base de Datos: ${results.database ? '✅ OK' : '❌ ERROR'}`, results.database ? 'green' : 'red');
    log(`Rutas: ${results.routes ? '✅ OK' : '❌ ERROR'}`, results.routes ? 'green' : 'red');
    log(`Variables Críticas: ${results.env.critical ? '✅ OK' : '❌ ERROR'}`, results.env.critical ? 'green' : 'red');
    log(`Configuración Pool: ${results.pool ? '✅ OK' : '⚠️  ADVERTENCIAS'}`, results.pool ? 'green' : 'yellow');
    
    if (results.env.recommended.length > 0) {
        log(`\n⚠️  Variables recomendadas no configuradas: ${results.env.recommended.join(', ')}`, 'yellow');
    }
    
    const allOk = results.database && results.routes && results.env.critical;
    
    if (allOk) {
        log('\n✅ TODAS LAS VERIFICACIONES CRÍTICAS PASARON', 'green');
        log('🎉 El proyecto está listo para ejecutarse', 'green');
    } else {
        log('\n❌ ALGUNAS VERIFICACIONES FALLARON', 'red');
        log('Por favor, corrige los errores antes de continuar', 'red');
    }
    
    // Cerrar pool
    await pool.end();
    
    process.exit(allOk ? 0 : 1);
}

// Ejecutar verificación
main().catch(error => {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});








