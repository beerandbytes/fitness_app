/**
 * Script para poblar la base de datos con todos los datos iniciales
 * Ejecuta seeds de ejercicios y alimentos de forma idempotente
 * 
 * Uso: node scripts/seed-all.js
 * O: npm run seed:all
 */

require('dotenv').config();
const { execSync } = require('child_process');
const { db, pool } = require('../db/db_config');
const { sql } = require('drizzle-orm');

async function checkTableExists(tableName) {
    try {
        const result = await db.execute(
            sql`SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = ${tableName}
            )`
        );
        return result.rows[0]?.exists || false;
    } catch (error) {
        console.error(`Error verificando tabla ${tableName}:`, error.message);
        return false;
    }
}

async function checkExercisesCount() {
    try {
        const result = await db.execute(
            sql`SELECT COUNT(*) as count FROM exercises WHERE is_public = true`
        );
        return parseInt(result.rows[0]?.count || 0);
    } catch (error) {
        console.error('Error verificando ejercicios:', error.message);
        return 0;
    }
}

async function checkFoodsCount() {
    try {
        const result = await db.execute(
            sql`SELECT COUNT(*) as count FROM foods`
        );
        return parseInt(result.rows[0]?.count || 0);
    } catch (error) {
        console.error('Error verificando alimentos:', error.message);
        return 0;
    }
}

async function seedAll() {
    console.log('🌱 Iniciando proceso de población de base de datos...\n');

    try {
        // Verificar que las tablas existan
        const exercisesTableExists = await checkTableExists('exercises');
        const foodsTableExists = await checkTableExists('foods');

        if (!exercisesTableExists || !foodsTableExists) {
            console.log('⚠️  Las tablas aún no existen. Ejecuta las migraciones primero:');
            console.log('   npm run db:migrate\n');
            process.exit(1);
        }

        // Verificar y poblar ejercicios
        console.log('📊 Verificando ejercicios...');
        const exerciseCount = await checkExercisesCount();

        if (exerciseCount === 0) {
            console.log('⚠️  No se encontraron ejercicios públicos. Poblando ejercicios...');
            // Nota: Los scripts hijos se ejecutan en procesos separados, así que no comparten el pool
            // No necesitamos cerrar el pool aquí, pero sí asegurarnos de que las queries se liberen
            try {
                // Ejecutar script de población de ejercicios como proceso hijo
                // El script hijo creará su propio pool de conexiones (proceso separado)
                execSync('npm run populate:exercises', {
                    stdio: 'inherit',
                    cwd: process.cwd(),
                    encoding: 'utf8'
                });

                // Verificar que realmente se insertaron ejercicios
                // Las conexiones del pool se liberan automáticamente después de cada query
                const newExerciseCount = await checkExercisesCount();
                if (newExerciseCount > 0) {
                    console.log(`✅ Ejercicios poblados correctamente (${newExerciseCount} ejercicios)\n`);
                } else {
                    throw new Error('El script se ejecutó pero no se insertaron ejercicios');
                }
            } catch (error) {
                console.error('❌ Error al poblar ejercicios con populate:exercises:', error.message);

                // Verificar si al menos se insertaron algunos ejercicios
                const currentCount = await checkExercisesCount();
                if (currentCount > 0) {
                    console.log(`⚠️  Se insertaron ${currentCount} ejercicios antes del error. Continuando...\n`);
                } else {
                    // Intentar con el seed básico como fallback
                    try {
                        console.log('🔄 Intentando con seed básico...');
                        execSync('npm run seed:exercises', {
                            stdio: 'inherit',
                            cwd: process.cwd(),
                            encoding: 'utf8'
                        });

                        const fallbackCount = await checkExercisesCount();
                        if (fallbackCount > 0) {
                            console.log(`✅ Ejercicios básicos poblados como fallback (${fallbackCount} ejercicios)\n`);
                        } else {
                            console.error('⚠️  El fallback no insertó ejercicios');
                        }
                    } catch (fallbackError) {
                        console.error('❌ Error en fallback de ejercicios:', fallbackError.message);
                    }
                }
            }
        } else {
            console.log(`✅ Se encontraron ${exerciseCount} ejercicios públicos. No es necesario poblar.\n`);
        }

        // Verificar y poblar alimentos
        console.log('📊 Verificando alimentos...');
        const foodCount = await checkFoodsCount();

        if (foodCount === 0) {
            console.log('⚠️  No se encontraron alimentos. Poblando alimentos comunes...');
            // Nota: Los scripts hijos se ejecutan en procesos separados, así que no comparten el pool
            try {
                // Ejecutar script de alimentos como proceso hijo
                execSync('npm run seed:foods', {
                    stdio: 'inherit',
                    cwd: process.cwd(),
                    encoding: 'utf8'
                });

                // Verificar que realmente se insertaron alimentos
                // Las conexiones del pool se liberan automáticamente después de cada query
                const newFoodCount = await checkFoodsCount();
                if (newFoodCount > 0) {
                    console.log(`✅ Alimentos comunes poblados correctamente (${newFoodCount} alimentos)\n`);
                } else {
                    throw new Error('El script se ejecutó pero no se insertaron alimentos');
                }
            } catch (error) {
                console.error('❌ Error al poblar alimentos:', error.message);

                // Verificar si al menos se insertaron algunos alimentos
                const currentCount = await checkFoodsCount();
                if (currentCount > 0) {
                    console.log(`⚠️  Se insertaron ${currentCount} alimentos antes del error. Continuando...\n`);
                }
            }

            // Poblar alimentos españoles adicionales
            try {
                console.log('📊 Poblando alimentos en español...');
                execSync('npm run seed:foods:spanish', {
                    stdio: 'inherit',
                    cwd: process.cwd(),
                    encoding: 'utf8'
                });

                const spanishFoodCount = await checkFoodsCount();
                console.log(`✅ Alimentos en español poblados (${spanishFoodCount} alimentos totales)\n`);
            } catch (error) {
                console.error('⚠️  Error al poblar alimentos españoles:', error.message);
                console.log('   Continuando con los alimentos básicos...\n');
            }
        } else {
            console.log(`✅ Se encontraron ${foodCount} alimentos. No es necesario poblar.\n`);
        }

        // Poblar rutinas predefinidas (plantillas de ejemplo para usuarios)
        try {
            console.log('📋 Verificando rutinas predefinidas...');
            const routinesResult = await db.execute(
                sql`SELECT COUNT(*) as count FROM workout_templates WHERE is_public = true`
            );
            const routinesCount = parseInt(routinesResult.rows[0]?.count || 0);

            if (routinesCount === 0) {
                console.log('📋 Poblando rutinas predefinidas...');
                execSync('npm run seed:predefined-routines', {
                    stdio: 'inherit',
                    cwd: process.cwd(),
                    encoding: 'utf8'
                });
                console.log('✅ Rutinas predefinidas pobladas\n');
            } else {
                console.log(`✅ Se encontraron ${routinesCount} rutinas predefinidas. No es necesario poblar.\n`);
            }
        } catch (error) {
            console.error('⚠️  Error al poblar rutinas predefinidas:', error.message);
            console.log('   Continuando sin rutinas predefinidas...\n');
        }

        // Verificar resultado final
        const finalExerciseCount = await checkExercisesCount();
        const finalFoodCount = await checkFoodsCount();

        console.log('📊 Resumen final:');
        console.log(`   - Ejercicios públicos: ${finalExerciseCount}`);
        console.log(`   - Alimentos: ${finalFoodCount}`);

        if (finalExerciseCount > 0 && finalFoodCount > 0) {
            console.log('\n✅ Base de datos poblada correctamente!');
            process.exit(0);
        } else {
            console.log('\n⚠️  La base de datos podría no estar completamente poblada.');
            if (finalExerciseCount === 0) {
                console.log('   - No hay ejercicios. Verifica los logs anteriores.');
            }
            if (finalFoodCount === 0) {
                console.log('   - No hay alimentos. Verifica los logs anteriores.');
            }
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Error en el proceso de población:', error);
        process.exit(1);
    } finally {
        // Cerrar conexión a la base de datos para liberar recursos
        // IMPORTANTE: Usar setTimeout para evitar que el cierre bloquee el proceso
        // Esto asegura que el script termine incluso si hay problemas con el pool
        try {
            if (pool && !pool.ended) {
                console.log('🔌 Cerrando conexiones del pool...');
                // Usar Promise.race con timeout para evitar que se cuelgue
                await Promise.race([
                    pool.end(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout cerrando pool')), 5000)
                    )
                ]).catch(err => {
                    // Si hay timeout o error, forzar cierre
                    console.warn('⚠️  Advertencia al cerrar pool:', err.message);
                    // Forzar cierre de todas las conexiones
                    if (pool && pool.end) {
                        pool.end().catch(() => { }); // Ignorar errores al forzar cierre
                    }
                });
                console.log('✅ Conexiones cerradas');
            }
        } catch (closeError) {
            // Ignorar errores al cerrar, pero loguear para debugging
            console.warn('⚠️  Advertencia al cerrar pool:', closeError.message);
        }
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    seedAll();
}

module.exports = { seedAll };

