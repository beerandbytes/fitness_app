/**
 * Script para poblar rutinas predefinidas en la base de datos
 * 
 * Este script:
 * 1. Busca o crea un usuario "Sistema" para las rutinas predefinidas
 * 2. Lee las rutinas predefinidas desde predefinedRoutines.js
 * 3. Busca los ejercicios por nombre en la base de datos
 * 4. Inserta las rutinas como plantillas en routine_templates
 * 5. Maneja duplicados (no inserta si ya existe)
 */

require('dotenv').config();
const { db } = require('../db/db_config');
const schema = require('../db/schema');
const { users, routineTemplates, exercises } = schema;
const { eq, ilike, or, and } = require('drizzle-orm');
const predefinedRoutines = require('../data/predefinedRoutines');

/**
 * Busca o crea un usuario "Sistema" para las rutinas predefinidas
 */
async function getOrCreateSystemUser() {
    try {
        // Buscar usuario sistema existente (email: system@fitnessapp.com)
        const systemUsers = await db.select()
            .from(users)
            .where(eq(users.email, 'system@fitnessapp.com'))
            .limit(1);

        if (systemUsers.length > 0) {
            console.log(`✅ Usuario Sistema encontrado (ID: ${systemUsers[0].user_id})`);
            return systemUsers[0];
        }

        // Si no existe, crear uno automáticamente
        console.log('📝 Creando usuario Sistema...');
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        // Generar un hash seguro pero no utilizable (nadie debería poder hacer login con este usuario)
        const randomPassword = require('crypto').randomBytes(32).toString('hex');
        const password_hash = await bcrypt.hash(randomPassword, saltRounds);

        const newSystemUser = await db
            .insert(users)
            .values({
                email: 'system@fitnessapp.com',
                password_hash: password_hash,
                role: 'COACH', // Debe ser COACH para poder crear templates
            })
            .returning();

        console.log(`✅ Usuario Sistema creado exitosamente (ID: ${newSystemUser[0].user_id})`);
        return newSystemUser[0];
    } catch (error) {
        console.error('❌ Error buscando/creando usuario sistema:', error.message);
        throw error;
    }
}

/**
 * Busca un ejercicio por nombre (name o name_es)
 */
async function findExerciseByName(exerciseName, alternatives = []) {
    try {
        // Buscar por nombre exacto primero
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

        // Si no se encuentra, buscar en alternativas
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
 * Convierte una rutina predefinida al formato de exercises para routine_templates
 */
async function convertRoutineToTemplate(routine, coachId) {
    const templateExercises = [];

    for (const day of routine.exercises) {
        for (const exercise of day.exercises) {
            // Buscar el ejercicio en la base de datos
            const dbExercise = await findExerciseByName(
                exercise.exercise_name,
                exercise.exercise_name_alt || []
            );

            if (!dbExercise) {
                console.warn(`⚠️  Ejercicio no encontrado: "${exercise.exercise_name}" (alternativas: ${(exercise.exercise_name_alt || []).join(', ')})`);
                // Continuar sin este ejercicio
                continue;
            }

            // Crear objeto de ejercicio para la plantilla
            const templateExercise = {
                exercise_id: dbExercise.exercise_id,
                exercise_name: dbExercise.name_es || dbExercise.name,
                day_of_week: day.day_of_week,
                dayName: day.dayName,
                sets: exercise.sets,
                reps: exercise.reps,
                weight_kg: exercise.weight_kg || 0,
                duration_minutes: exercise.duration_minutes,
                workSeconds: exercise.workSeconds,
                restSeconds: exercise.restSeconds,
                order_index: exercise.order_index,
                notes: exercise.notes || null
            };

            templateExercises.push(templateExercise);
        }
    }

    // Los metadatos se almacenarán en el campo exercises como un objeto separado
    // para facilitar el acceso, pero los ejercicios reales estarán en un array
    // Estructura: exercises es un array de ejercicios, y agregamos metadatos al final
    // Los metadatos se pueden acceder desde el objeto template directamente
    const exercisesWithMetadata = [...templateExercises];
    
    // Agregar metadatos como propiedad del array (se almacenará en JSONB)
    return {
        coach_id: coachId,
        name: routine.name,
        description: routine.description,
        exercises: exercisesWithMetadata,
        // Los metadatos se almacenarán en el campo exercises como parte del JSONB
        // pero para facilitar el acceso, los incluiremos también en el objeto
        _metadata: {
            trainingType: routine.trainingType,
            level: routine.level,
            frequency: routine.frequency,
            equipment: routine.equipment,
            tags: routine.tags,
            notes: routine.notes
        }
    };
}

/**
 * Verifica si una plantilla ya existe
 */
async function templateExists(coachId, templateName) {
    try {
        const existing = await db.select()
            .from(routineTemplates)
            .where(
                and(
                    eq(routineTemplates.coach_id, coachId),
                    eq(routineTemplates.name, templateName)
                )
            )
            .limit(1);

        return existing.length > 0;
    } catch (error) {
        console.error('Error verificando plantilla existente:', error.message);
        return false;
    }
}

/**
 * Función principal
 */
async function seedPredefinedRoutines() {
    console.log('🚀 Iniciando poblamiento de rutinas predefinidas...\n');

    try {
        // Verificar conexión a la base de datos
        await db.execute('SELECT 1');
        console.log('✅ Conexión a la base de datos exitosa\n');

        // Obtener o crear usuario sistema
        // Opción: Usar un coach_id específico desde variable de entorno
        const systemCoachId = process.env.SYSTEM_COACH_ID 
            ? parseInt(process.env.SYSTEM_COACH_ID) 
            : null;

        let coachId = systemCoachId;

        if (!coachId) {
            const systemUser = await getOrCreateSystemUser();
            if (!systemUser) {
                console.error('\n❌ No se pudo obtener un coach_id para las rutinas predefinidas.');
                console.error('   Por favor, configura SYSTEM_COACH_ID en .env o crea un usuario sistema.');
                process.exit(1);
            }
            coachId = systemUser.user_id;
        }

        console.log(`📋 Usando coach_id: ${coachId}\n`);

        let inserted = 0;
        let skipped = 0;
        let errors = 0;
        const warnings = [];

        // Procesar cada rutina predefinida
        for (let i = 0; i < predefinedRoutines.length; i++) {
            const routine = predefinedRoutines[i];
            console.log(`\n📝 Procesando rutina ${i + 1}/${predefinedRoutines.length}: "${routine.name}"`);

            try {
                // Verificar si ya existe
                const exists = await templateExists(coachId, routine.name);
                if (exists) {
                    console.log(`   ⏭️  Ya existe, saltando...`);
                    skipped++;
                    continue;
                }

                // Convertir rutina a formato de plantilla
                const template = await convertRoutineToTemplate(routine, coachId);

                // Verificar que se encontraron ejercicios
                if (template.exercises.length === 0) {
                    console.warn(`   ⚠️  No se encontraron ejercicios para esta rutina. Saltando...`);
                    warnings.push(`Rutina "${routine.name}": No se encontraron ejercicios`);
                    skipped++;
                    continue;
                }

                // Preparar ejercicios con metadatos
                // Los metadatos se incluyen en el objeto exercises para facilitar el acceso
                const exercisesData = {
                    exercises: template.exercises,
                    metadata: template._metadata
                };

                // Insertar plantilla
                const [newTemplate] = await db.insert(routineTemplates)
                    .values({
                        coach_id: template.coach_id,
                        name: template.name,
                        description: template.description,
                        exercises: exercisesData
                    })
                    .returning();

                console.log(`   ✅ Insertada exitosamente (ID: ${newTemplate.template_id}, ${template.exercises.length} ejercicios)`);
                inserted++;

            } catch (error) {
                console.error(`   ❌ Error procesando rutina:`, error.message);
                errors++;
                warnings.push(`Rutina "${routine.name}": ${error.message}`);
            }
        }

        // Resumen
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DEL POBLAMIENTO');
        console.log('='.repeat(60));
        console.log(`✅ Rutinas insertadas: ${inserted}`);
        console.log(`⏭️  Rutinas saltadas (ya existían): ${skipped}`);
        console.log(`❌ Errores: ${errors}`);
        
        if (warnings.length > 0) {
            console.log(`\n⚠️  Advertencias:`);
            warnings.forEach(w => console.log(`   - ${w}`));
        }

        console.log('\n✅ Proceso completado!\n');

    } catch (error) {
        console.error('\n❌ Error fatal en el proceso:', error);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    seedPredefinedRoutines();
}

module.exports = { seedPredefinedRoutines };

