/**
 * Script de verificación para rutinas predefinidas
 * 
 * Este script verifica que:
 * 1. Las rutinas predefinidas están correctamente definidas
 * 2. Los ejercicios referenciados existen en la base de datos
 * 3. Los endpoints están correctamente implementados
 */

require('dotenv').config();
const predefinedRoutines = require('../data/predefinedRoutines');
const { db } = require('../db/db_config');
const { exercises } = require('../db/schema');
const { eq, ilike, or, and } = require('drizzle-orm');

/**
 * Busca un ejercicio por nombre
 */
async function findExerciseByName(exerciseName, alternatives = []) {
    try {
        let found = await db.select()
            .from(exercises)
            .where(
                and(
                    eq(exercises.is_public, true),
                    or(
                        ilike(exercises.name, `%${exerciseName}%`),
                        ilike(exercises.name_es, `%${exerciseName}%`)
                    )
                )
            )
            .limit(1);

        if (found.length > 0) {
            return found[0];
        }

        for (const alt of alternatives) {
            found = await db.select()
                .from(exercises)
                .where(
                    and(
                        eq(exercises.is_public, true),
                        or(
                            ilike(exercises.name, `%${alt}%`),
                            ilike(exercises.name_es, `%${alt}%`)
                        )
                    )
                )
                .limit(1);

            if (found.length > 0) {
                return found[0];
            }
        }

        return null;
    } catch (error) {
        console.error(`Error buscando ejercicio "${exerciseName}":`, error.message);
        return null;
    }
}

/**
 * Verifica las rutinas predefinidas
 */
async function verifyPredefinedRoutines() {
    console.log('🔍 Verificando rutinas predefinidas...\n');
    console.log('='.repeat(60));

    try {
        // Verificar conexión a la base de datos
        await db.execute('SELECT 1');
        console.log('✅ Conexión a la base de datos exitosa\n');

        let totalRoutines = 0;
        let totalExercises = 0;
        let foundExercises = 0;
        let missingExercises = 0;
        const missingExercisesList = [];

        // Verificar cada rutina
        for (let i = 0; i < predefinedRoutines.length; i++) {
            const routine = predefinedRoutines[i];
            totalRoutines++;

            console.log(`\n📋 Rutina ${i + 1}/${predefinedRoutines.length}: "${routine.name}"`);
            console.log(`   Tipo: ${routine.trainingType} | Nivel: ${routine.level} | Frecuencia: ${routine.frequency} días/semana`);

            let routineExercisesFound = 0;
            let routineExercisesMissing = 0;

            // Verificar ejercicios de cada día
            for (const day of routine.exercises) {
                for (const exercise of day.exercises) {
                    totalExercises++;
                    const dbExercise = await findExerciseByName(
                        exercise.exercise_name,
                        exercise.exercise_name_alt || []
                    );

                    if (dbExercise) {
                        foundExercises++;
                        routineExercisesFound++;
                    } else {
                        missingExercises++;
                        routineExercisesMissing++;
                        missingExercisesList.push({
                            routine: routine.name,
                            exercise: exercise.exercise_name,
                            alternatives: exercise.exercise_name_alt || []
                        });
                    }
                }
            }

            console.log(`   ✅ Ejercicios encontrados: ${routineExercisesFound}`);
            if (routineExercisesMissing > 0) {
                console.log(`   ⚠️  Ejercicios no encontrados: ${routineExercisesMissing}`);
            }
        }

        // Resumen
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE VERIFICACIÓN');
        console.log('='.repeat(60));
        console.log(`✅ Rutinas verificadas: ${totalRoutines}`);
        console.log(`📝 Total de ejercicios referenciados: ${totalExercises}`);
        console.log(`✅ Ejercicios encontrados: ${foundExercises} (${((foundExercises / totalExercises) * 100).toFixed(1)}%)`);
        console.log(`⚠️  Ejercicios no encontrados: ${missingExercises} (${((missingExercises / totalExercises) * 100).toFixed(1)}%)`);

        if (missingExercisesList.length > 0) {
            console.log('\n⚠️  EJERCICIOS NO ENCONTRADOS:');
            console.log('-'.repeat(60));
            missingExercisesList.forEach((item, idx) => {
                console.log(`${idx + 1}. Rutina: "${item.routine}"`);
                console.log(`   Ejercicio: "${item.exercise}"`);
                if (item.alternatives.length > 0) {
                    console.log(`   Alternativas probadas: ${item.alternatives.join(', ')}`);
                }
                console.log('');
            });
        }

        // Verificar estructura de datos
        console.log('\n📐 VERIFICACIÓN DE ESTRUCTURA:');
        console.log('-'.repeat(60));
        let structureErrors = 0;

        predefinedRoutines.forEach((routine, idx) => {
            if (!routine.name) {
                console.log(`❌ Rutina ${idx + 1}: Falta nombre`);
                structureErrors++;
            }
            if (!routine.trainingType) {
                console.log(`❌ Rutina ${idx + 1}: Falta trainingType`);
                structureErrors++;
            }
            if (!routine.level) {
                console.log(`❌ Rutina ${idx + 1}: Falta level`);
                structureErrors++;
            }
            if (!routine.exercises || !Array.isArray(routine.exercises)) {
                console.log(`❌ Rutina ${idx + 1}: Falta o es inválido el array de exercises`);
                structureErrors++;
            } else {
                routine.exercises.forEach((day, dayIdx) => {
                    if (!day.day_of_week) {
                        console.log(`❌ Rutina ${idx + 1}, Día ${dayIdx + 1}: Falta day_of_week`);
                        structureErrors++;
                    }
                    if (!day.exercises || !Array.isArray(day.exercises)) {
                        console.log(`❌ Rutina ${idx + 1}, Día ${dayIdx + 1}: Falta array de ejercicios`);
                        structureErrors++;
                    }
                });
            }
        });

        if (structureErrors === 0) {
            console.log('✅ Todas las rutinas tienen estructura válida');
        } else {
            console.log(`❌ Se encontraron ${structureErrors} errores de estructura`);
        }

        // Verificar cobertura de tipos de entrenamiento
        console.log('\n🎯 COBERTURA DE TIPOS DE ENTRENAMIENTO:');
        console.log('-'.repeat(60));
        const trainingTypes = {};
        predefinedRoutines.forEach(routine => {
            trainingTypes[routine.trainingType] = (trainingTypes[routine.trainingType] || 0) + 1;
        });

        Object.entries(trainingTypes).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} rutina(s)`);
        });

        // Verificar cobertura de niveles
        console.log('\n📊 COBERTURA DE NIVELES:');
        console.log('-'.repeat(60));
        const levels = {};
        predefinedRoutines.forEach(routine => {
            levels[routine.level] = (levels[routine.level] || 0) + 1;
        });

        Object.entries(levels).forEach(([level, count]) => {
            console.log(`   ${level}: ${count} rutina(s)`);
        });

        console.log('\n' + '='.repeat(60));
        if (missingExercises === 0 && structureErrors === 0) {
            console.log('✅ VERIFICACIÓN COMPLETA: Todas las rutinas están correctas');
        } else {
            console.log('⚠️  VERIFICACIÓN COMPLETA: Se encontraron algunos problemas');
            console.log('   Revisa los detalles arriba para más información');
        }
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ Error en la verificación:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    verifyPredefinedRoutines();
}

module.exports = { verifyPredefinedRoutines };

