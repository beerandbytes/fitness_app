#!/usr/bin/env node
/**
 * Script de verificación completa de la base de datos y pool de conexiones
 * Verifica:
 * - Configuración del pool
 * - Estado de las conexiones
 * - Salud de la base de datos
 * - Posibles problemas de conexión
 * - Estadísticas del pool
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
    console.log('\n' + '='.repeat(60));
    log(title, 'cyan');
    console.log('='.repeat(60));
}

function logSubsection(title) {
    console.log('\n' + '-'.repeat(60));
    log(title, 'blue');
    console.log('-'.repeat(60));
}

async function verifyDatabasePool() {
    let hasErrors = false;
    let hasWarnings = false;

    try {
        // 1. Verificar configuración del pool
        logSection('📋 CONFIGURACIÓN DEL POOL');
        
        const poolConfig = {
            max: parseInt(process.env.DB_POOL_MAX || '20', 10),
            min: parseInt(process.env.DB_POOL_MIN || '5', 10),
            idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
            connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
        };

        log(`Máximo de conexiones: ${poolConfig.max}`, 'green');
        log(`Mínimo de conexiones: ${poolConfig.min}`, 'green');
        log(`Timeout de inactividad: ${poolConfig.idleTimeoutMillis}ms (${poolConfig.idleTimeoutMillis / 1000}s)`, 'green');
        log(`Timeout de conexión: ${poolConfig.connectionTimeoutMillis}ms (${poolConfig.connectionTimeoutMillis / 1000}s)`, 'green');

        // Advertencias sobre configuración
        if (poolConfig.min > 10) {
            log(`⚠️  ADVERTENCIA: El mínimo de conexiones (${poolConfig.min}) es alto.`, 'yellow');
            log('   Para planes gratuitos de Render (~20 conexiones), considera reducirlo a 2-5.', 'yellow');
            hasWarnings = true;
        }

        if (poolConfig.max > 20) {
            log(`⚠️  ADVERTENCIA: El máximo de conexiones (${poolConfig.max}) puede exceder el límite de Render Free Tier.`, 'yellow');
            hasWarnings = true;
        }

        // 2. Verificar estado actual del pool
        logSection('🔌 ESTADO ACTUAL DEL POOL');
        
        const poolStats = {
            totalCount: pool.totalCount || 0,
            idleCount: pool.idleCount || 0,
            waitingCount: pool.waitingCount || 0,
        };

        const activeCount = poolStats.totalCount - poolStats.idleCount;

        log(`Total de conexiones en el pool: ${poolStats.totalCount}`, poolStats.totalCount > 0 ? 'green' : 'yellow');
        log(`Conexiones activas: ${activeCount}`, activeCount > 0 ? 'green' : 'yellow');
        log(`Conexiones inactivas: ${poolStats.idleCount}`, 'green');
        log(`Conexiones en espera: ${poolStats.waitingCount}`, poolStats.waitingCount > 0 ? 'yellow' : 'green');

        // Verificar si hay conexiones esperando (posible problema)
        if (poolStats.waitingCount > 0) {
            log(`⚠️  ADVERTENCIA: Hay ${poolStats.waitingCount} conexión(es) esperando.`, 'yellow');
            log('   Esto puede indicar que el pool está saturado.', 'yellow');
            hasWarnings = true;
        }

        // Verificar uso del pool
        const poolUsagePercent = poolConfig.max > 0 ? (poolStats.totalCount / poolConfig.max) * 100 : 0;
        log(`Uso del pool: ${poolUsagePercent.toFixed(1)}%`, poolUsagePercent > 80 ? 'yellow' : 'green');

        if (poolUsagePercent > 80) {
            log(`⚠️  ADVERTENCIA: El pool está usando más del 80% de su capacidad.`, 'yellow');
            hasWarnings = true;
        }

        // 3. Verificar salud de la base de datos
        logSection('💚 SALUD DE LA BASE DE DATOS');
        
        try {
            const health = await checkDatabaseHealth();
            
            if (health.healthy) {
                log('✅ Base de datos está saludable', 'green');
                log(`   Timestamp: ${health.timestamp}`, 'green');
                log(`   Versión PostgreSQL: ${health.version ? health.version.split(' ')[0] + ' ' + health.version.split(' ')[1] : 'N/A'}`, 'green');
                
                if (health.poolStats) {
                    log(`   Pool Stats:`, 'green');
                    log(`     - Total: ${health.poolStats.totalCount}`, 'green');
                    log(`     - Inactivas: ${health.poolStats.idleCount}`, 'green');
                    log(`     - En espera: ${health.poolStats.waitingCount}`, 'green');
                }
            } else {
                log('❌ Base de datos NO está saludable', 'red');
                log(`   Error: ${health.error}`, 'red');
                hasErrors = true;
            }
        } catch (error) {
            log(`❌ Error al verificar salud: ${error.message}`, 'red');
            hasErrors = true;
        }

        // 4. Probar conexión directa
        logSection('🧪 PRUEBA DE CONEXIÓN');
        
        try {
            const startTime = Date.now();
            const result = await db.execute(sql`SELECT NOW() as current_time, version() as version, current_database() as database`);
            const responseTime = Date.now() - startTime;
            
            log(`✅ Conexión exitosa (${responseTime}ms)`, 'green');
            log(`   Base de datos: ${result.rows[0].database}`, 'green');
            log(`   Hora del servidor: ${result.rows[0].current_time}`, 'green');
            
            if (responseTime > 1000) {
                log(`⚠️  ADVERTENCIA: Tiempo de respuesta lento (${responseTime}ms)`, 'yellow');
                hasWarnings = true;
            }
        } catch (error) {
            log(`❌ Error en prueba de conexión: ${error.message}`, 'red');
            hasErrors = true;
        }

        // 5. Verificar conexiones activas en PostgreSQL
        logSection('📊 CONEXIONES EN POSTGRESQL');
        
        try {
            const connectionsResult = await db.execute(sql`
                SELECT 
                    count(*) as total_connections,
                    count(*) FILTER (WHERE state = 'active') as active_connections,
                    count(*) FILTER (WHERE state = 'idle') as idle_connections,
                    count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
                FROM pg_stat_activity 
                WHERE datname = current_database()
            `);
            
            const connStats = connectionsResult.rows[0];
            
            log(`Total de conexiones: ${connStats.total_connections}`, 'green');
            log(`Conexiones activas: ${connStats.active_connections}`, 'green');
            log(`Conexiones inactivas: ${connStats.idle_connections}`, 'green');
            
            if (parseInt(connStats.idle_in_transaction) > 0) {
                log(`⚠️  ADVERTENCIA: Hay ${connStats.idle_in_transaction} conexión(es) inactivas en transacción.`, 'yellow');
                log('   Esto puede indicar transacciones que no se cerraron correctamente.', 'yellow');
                hasWarnings = true;
            }

            // Verificar límite de conexiones
            const maxConnectionsResult = await db.execute(sql`SHOW max_connections`);
            const maxConnections = parseInt(maxConnectionsResult.rows[0].max_connections);
            const usagePercent = (parseInt(connStats.total_connections) / maxConnections) * 100;
            
            log(`Límite máximo de conexiones: ${maxConnections}`, 'green');
            log(`Uso: ${usagePercent.toFixed(1)}%`, usagePercent > 80 ? 'yellow' : 'green');
            
            if (usagePercent > 80) {
                log(`⚠️  ADVERTENCIA: Estás usando más del 80% del límite de conexiones.`, 'yellow');
                hasWarnings = true;
            }
        } catch (error) {
            log(`⚠️  No se pudo obtener estadísticas de PostgreSQL: ${error.message}`, 'yellow');
            hasWarnings = true;
        }

        // 6. Verificar variables de entorno
        logSection('🔐 VARIABLES DE ENTORNO');
        
        const requiredVars = {
            'DATABASE_URL': process.env.DATABASE_URL,
            'JWT_SECRET': process.env.JWT_SECRET,
        };

        Object.entries(requiredVars).forEach(([key, value]) => {
            if (value) {
                if (key === 'DATABASE_URL') {
                    const masked = value.replace(/:[^:@]+@/, ':****@');
                    log(`✅ ${key}: ${masked}`, 'green');
                } else if (key === 'JWT_SECRET') {
                    const length = value.length;
                    log(`✅ ${key}: Configurado (${length} caracteres)`, length >= 32 ? 'green' : 'yellow');
                    if (length < 32) {
                        log(`   ⚠️  Se recomienda al menos 32 caracteres para mayor seguridad`, 'yellow');
                        hasWarnings = true;
                    }
                } else {
                    log(`✅ ${key}: Configurado`, 'green');
                }
            } else {
                log(`❌ ${key}: NO CONFIGURADA`, 'red');
                hasErrors = true;
            }
        });

        // Variables opcionales del pool
        logSubsection('Variables opcionales del pool');
        const optionalPoolVars = {
            'DB_POOL_MAX': process.env.DB_POOL_MAX,
            'DB_POOL_MIN': process.env.DB_POOL_MIN,
            'DB_IDLE_TIMEOUT': process.env.DB_IDLE_TIMEOUT,
            'DB_CONNECTION_TIMEOUT': process.env.DB_CONNECTION_TIMEOUT,
        };

        Object.entries(optionalPoolVars).forEach(([key, value]) => {
            if (value) {
                log(`✅ ${key}: ${value}`, 'green');
            } else {
                log(`ℹ️  ${key}: No configurada (usando valor por defecto)`, 'blue');
            }
        });

        // 7. Prueba de carga básica
        logSection('⚡ PRUEBA DE CARGA BÁSICA');
        
        try {
            const queries = 5;
            const startTime = Date.now();
            const promises = [];
            
            for (let i = 0; i < queries; i++) {
                promises.push(db.execute(sql`SELECT NOW()`));
            }
            
            await Promise.all(promises);
            const totalTime = Date.now() - startTime;
            const avgTime = totalTime / queries;
            
            log(`✅ Ejecutadas ${queries} consultas en paralelo`, 'green');
            log(`   Tiempo total: ${totalTime}ms`, 'green');
            log(`   Tiempo promedio: ${avgTime.toFixed(2)}ms`, 'green');
            
            // Verificar estado del pool después de la carga
            const afterLoadStats = {
                totalCount: pool.totalCount || 0,
                idleCount: pool.idleCount || 0,
                waitingCount: pool.waitingCount || 0,
            };
            
            log(`   Pool después de carga:`, 'green');
            log(`     - Total: ${afterLoadStats.totalCount}`, 'green');
            log(`     - Inactivas: ${afterLoadStats.idleCount}`, 'green');
            log(`     - En espera: ${afterLoadStats.waitingCount}`, 'green');
            
            if (afterLoadStats.waitingCount > 0) {
                log(`   ⚠️  Hay conexiones esperando después de la carga`, 'yellow');
                hasWarnings = true;
            }
        } catch (error) {
            log(`❌ Error en prueba de carga: ${error.message}`, 'red');
            hasErrors = true;
        }

        // Resumen final
        logSection('📋 RESUMEN');
        
        if (hasErrors) {
            log('❌ Se encontraron ERRORES que requieren atención inmediata', 'red');
        } else if (hasWarnings) {
            log('⚠️  Se encontraron ADVERTENCIAS que deberías revisar', 'yellow');
        } else {
            log('✅ Todo está funcionando correctamente', 'green');
        }

        log('\n💡 RECOMENDACIONES:', 'cyan');
        
        if (poolConfig.min > 10) {
            log('   - Considera reducir DB_POOL_MIN a 2-5 para planes gratuitos', 'yellow');
        }
        
        if (poolConfig.max > 20) {
            log('   - Considera reducir DB_POOL_MAX a 15-20 para Render Free Tier', 'yellow');
        }
        
        if (!hasErrors && !hasWarnings) {
            log('   - La configuración actual es adecuada', 'green');
        }

        return { hasErrors, hasWarnings };

    } catch (error) {
        log(`\n❌ Error fatal: ${error.message}`, 'red');
        log(`   Stack: ${error.stack}`, 'red');
        return { hasErrors: true, hasWarnings: false };
    } finally {
        // No cerramos el pool aquí porque puede estar siendo usado por la aplicación
        // Solo cerramos si estamos en modo script independiente
        if (process.env.CLOSE_POOL === 'true') {
            try {
                await pool.end();
                log('\n🔌 Pool cerrado', 'blue');
            } catch (error) {
                // Ignorar errores al cerrar
            }
        }
    }
}

// Ejecutar verificación
if (require.main === module) {
    verifyDatabasePool()
        .then(({ hasErrors, hasWarnings }) => {
            process.exit(hasErrors ? 1 : 0);
        })
        .catch(error => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { verifyDatabasePool };









