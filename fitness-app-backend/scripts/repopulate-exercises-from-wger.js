// Script para repoblar completamente la base de datos de ejercicios desde wger API
// - Elimina todos los ejercicios existentes (verificando referencias)
// - Solo ejercicios en español de España (language 4)
// - Solo ejercicios con media (imagen o video)
// - Incluye todos los campos: description, muscles, equipment, etc.
require('dotenv').config();
const axios = require('axios');
const { db } = require('../db/db_config');
const { exercises, routineExercises, dailyExercises } = require('../db/schema');
const { eq, isNull, and, sql } = require('drizzle-orm');

const WGER_API_BASE = 'https://wger.de/api/v2';

// Mapear categoría de wger a categoría local
function mapCategory(wgerCategoryName) {
    const categoryMap = {
        'Arms': 'Fuerza',
        'Abs': 'Fuerza',
        'Back': 'Fuerza',
        'Calves': 'Fuerza',
        'Chest': 'Fuerza',
        'Legs': 'Fuerza',
        'Shoulders': 'Fuerza',
        'Cardio': 'Cardio'
    };
    return categoryMap[wgerCategoryName] || 'Fuerza';
}

// Extraer nombres de músculos desde la respuesta de exerciseinfo
function extractMuscleNames(wgerInfo) {
    if (!wgerInfo.muscles || wgerInfo.muscles.length === 0) {
        return null;
    }
    
    // wger devuelve músculos como objetos con id y name
    const muscleNames = wgerInfo.muscles
        .map(m => m.name || (typeof m === 'object' && m.name) || null)
        .filter(Boolean);
    
    // Si no hay nombres en el objeto, intentar obtener desde muscles_secondary
    if (muscleNames.length === 0 && wgerInfo.muscles_secondary) {
        const secondaryMuscles = wgerInfo.muscles_secondary
            .map(m => m.name || (typeof m === 'object' && m.name) || null)
            .filter(Boolean);
        muscleNames.push(...secondaryMuscles);
    }
    
    // También incluir músculos secundarios si existen
    if (wgerInfo.muscles_secondary && wgerInfo.muscles_secondary.length > 0) {
        wgerInfo.muscles_secondary.forEach(m => {
            const name = m.name || (typeof m === 'object' && m.name) || null;
            if (name && !muscleNames.includes(name)) {
                muscleNames.push(name);
            }
        });
    }
    
    return muscleNames.length > 0 ? JSON.stringify(muscleNames) : null;
}

// Extraer nombres de equipamiento desde la respuesta de exerciseinfo
function extractEquipmentNames(wgerInfo) {
    if (!wgerInfo.equipment || wgerInfo.equipment.length === 0) {
        return null;
    }
    
    // wger devuelve equipamiento como objetos con id y name
    const equipmentNames = wgerInfo.equipment
        .map(e => e.name || (typeof e === 'object' && e.name) || null)
        .filter(Boolean);
    
    return equipmentNames.length > 0 ? JSON.stringify(equipmentNames) : null;
}

// Calcular calorías por minuto basado en categoría
function calculateCaloriesPerMinute(category) {
    const caloriesMap = {
        'Cardio': '8',
        'Fuerza': '5',
        'Flexibilidad': '3',
        'Híbrido': '6'
    };
    return caloriesMap[category] || '5';
}

// Fase 1: Eliminación segura de ejercicios existentes
async function safeDeleteAllExercises() {
    console.log('🗑️  Verificando y eliminando ejercicios existentes...\n');
    
    // Obtener todos los ejercicios públicos
    const allExercises = await db.select()
        .from(exercises)
        .where(eq(exercises.is_public, true));
    
    console.log(`📋 Encontrados ${allExercises.length} ejercicios públicos\n`);
    
    if (allExercises.length === 0) {
        console.log('✅ No hay ejercicios para eliminar\n');
        return {
            total: 0,
            withRoutineReferences: 0,
            withDailyLogReferences: 0,
            deleted: 0,
            errors: 0
        };
    }
    
    let stats = {
        total: allExercises.length,
        withRoutineReferences: 0,
        withDailyLogReferences: 0,
        deleted: 0,
        errors: 0
    };
    
    const toDelete = [];
    
    console.log('🔍 Verificando referencias en otras tablas...\n');
    
    for (const exercise of allExercises) {
        // Verificar si está en rutinas
        const inRoutines = await db.select()
            .from(routineExercises)
            .where(eq(routineExercises.exercise_id, exercise.exercise_id))
            .limit(1);
        
        // Verificar si está en logs diarios
        const inDailyLogs = await db.select()
            .from(dailyExercises)
            .where(eq(dailyExercises.exercise_id, exercise.exercise_id))
            .limit(1);
        
        if (inRoutines.length > 0) {
            stats.withRoutineReferences++;
            console.log(`   ⚠️  "${exercise.name}" tiene referencias en rutinas - NO se eliminará`);
        } else if (inDailyLogs.length > 0) {
            stats.withDailyLogReferences++;
            console.log(`   ⚠️  "${exercise.name}" tiene referencias en logs diarios - NO se eliminará`);
        } else {
            toDelete.push(exercise);
        }
    }
    
    console.log(`\n📊 Resumen de verificación:`);
    console.log(`   Total de ejercicios públicos: ${stats.total}`);
    console.log(`   Con referencias en rutinas: ${stats.withRoutineReferences}`);
    console.log(`   Con referencias en logs: ${stats.withDailyLogReferences}`);
    console.log(`   Seguros para eliminar: ${toDelete.length}\n`);
    
    // Eliminar ejercicios seguros
    if (toDelete.length > 0) {
        console.log(`🗑️  Eliminando ${toDelete.length} ejercicios sin referencias...\n`);
        
        for (const exercise of toDelete) {
            try {
                await db.delete(exercises)
                    .where(eq(exercises.exercise_id, exercise.exercise_id));
                
                stats.deleted++;
                if (stats.deleted % 50 === 0) {
                    console.log(`   ✅ ${stats.deleted} ejercicios eliminados...`);
                }
            } catch (error) {
                stats.errors++;
                console.error(`   ❌ Error al eliminar "${exercise.name}":`, error.message);
            }
        }
        
        console.log(`\n   ✅ Eliminación completada: ${stats.deleted} ejercicios eliminados\n`);
    } else {
        console.log('ℹ️  No hay ejercicios seguros para eliminar (todos tienen referencias)\n');
    }
    
    if (stats.withRoutineReferences > 0 || stats.withDailyLogReferences > 0) {
        console.log('⚠️  ADVERTENCIA: Hay ejercicios con referencias que no fueron eliminados.');
        console.log('   Estos ejercicios pueden causar conflictos. Considera limpiar las referencias primero.\n');
    }
    
    return stats;
}

// Fase 2: Obtener todas las imágenes disponibles y crear un mapa ejercicio_id -> image_url
async function getAllExerciseImages() {
    console.log('🖼️  Obteniendo todas las imágenes disponibles desde /exerciseimage/...');
    const imageMap = new Map();
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
        try {
            const response = await axios.get(`${WGER_API_BASE}/exerciseimage/`, {
                params: {
                    limit: 100,
                    offset: (page - 1) * 100
                },
                timeout: 10000
            });
            
            if (!response.data || !response.data.results || response.data.results.length === 0) {
                hasMore = false;
                break;
            }
            
            // Procesar imágenes: priorizar is_main=true
            response.data.results.forEach(img => {
                const exerciseId = img.exercise;
                if (img.image) {
                    // Si no existe o si esta es la principal, actualizar
                    if (!imageMap.has(exerciseId) || img.is_main) {
                        let imageUrl = img.image;
                        if (!imageUrl.startsWith('http')) {
                            imageUrl = `https://wger.de${imageUrl}`;
                        }
                        imageMap.set(exerciseId, imageUrl);
                    }
                }
            });
            
            if (!response.data.next) {
                hasMore = false;
            } else {
                page++;
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
        } catch (error) {
            console.error(`   ⚠️  Error obteniendo imágenes página ${page}:`, error.message);
            hasMore = false;
        }
    }
    
    console.log(`   ✅ Mapa de imágenes creado: ${imageMap.size} ejercicios con imágenes\n`);
    return imageMap;
}

// Fase 2: Obtener todos los videos disponibles y crear un mapa ejercicio_id -> video_url
async function getAllExerciseVideos() {
    console.log('🎥 Obteniendo todos los videos disponibles desde /video/...');
    const videoMap = new Map();
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
        try {
            const response = await axios.get(`${WGER_API_BASE}/video/`, {
                params: {
                    limit: 100,
                    offset: (page - 1) * 100
                },
                timeout: 10000
            });
            
            if (!response.data || !response.data.results || response.data.results.length === 0) {
                hasMore = false;
                break;
            }
            
            // Procesar videos: usar el primero encontrado para cada ejercicio
            response.data.results.forEach(video => {
                const exerciseId = video.exercise;
                if (video.video && !videoMap.has(exerciseId)) {
                    let videoUrl = video.video;
                    if (!videoUrl.startsWith('http')) {
                        videoUrl = `https://wger.de${videoUrl}`;
                    }
                    videoMap.set(exerciseId, videoUrl);
                }
            });
            
            if (!response.data.next) {
                hasMore = false;
            } else {
                page++;
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
        } catch (error) {
            console.error(`   ⚠️  Error obteniendo videos página ${page}:`, error.message);
            hasMore = false;
        }
    }
    
    console.log(`   ✅ Mapa de videos creado: ${videoMap.size} ejercicios con videos\n`);
    return videoMap;
}

// Fase 3: Sincronizar ejercicios desde wger con todos los campos
async function syncWgerExercisesWithAllFields(imageMap, videoMap) {
    console.log('📦 Sincronizando ejercicios desde /exerciseinfo/ (español de España, solo con media)...\n');
    
    let page = 1;
    let hasMore = true;
    let totalSynced = 0;
    let totalSkippedNoES = 0;
    let totalSkippedNoMedia = 0;
    let totalSkippedNoName = 0;
    let totalErrors = 0;
    let processedIds = new Set();
    
    while (hasMore) {
        try {
            console.log(`📄 Procesando página ${page}...`);
            
            // Obtener ejercicios desde exerciseinfo con language 4 (español de España)
            const response = await axios.get(`${WGER_API_BASE}/exerciseinfo/`, {
                params: {
                    language: 4, // Español de España
                    limit: 100,
                    offset: (page - 1) * 100
                },
                timeout: 15000
            });
            
            if (!response.data || !response.data.results || response.data.results.length === 0) {
                hasMore = false;
                break;
            }
            
            const exerciseInfos = response.data.results;
            console.log(`   Encontrados ${exerciseInfos.length} ejercicios en esta página`);
            
            // Procesar cada ejercicio
            for (const exerciseInfo of exerciseInfos) {
                try {
                    const exerciseId = exerciseInfo.id;
                    
                    // Evitar procesar duplicados
                    if (processedIds.has(exerciseId)) {
                        continue;
                    }
                    processedIds.add(exerciseId);
                    
                    // Buscar traducción en español de España (language 4)
                    const spanishTranslation = exerciseInfo.translations?.find(t => t.language === 4);
                    
                    // Si no tiene traducción en español de España, saltar
                    if (!spanishTranslation || !spanishTranslation.name) {
                        totalSkippedNoES++;
                        continue;
                    }
                    
                    const exerciseName = spanishTranslation.name.trim();
                    
                    // Validar que el nombre no esté vacío
                    if (!exerciseName || exerciseName.length === 0) {
                        totalSkippedNoName++;
                        continue;
                    }
                    
                    // Obtener imagen y video del mapa
                    const gifUrl = imageMap.get(exerciseId) || null;
                    const videoUrl = videoMap.get(exerciseId) || null;
                    
                    // Validar que las URLs sean válidas (no solo strings vacíos)
                    const hasValidImage = gifUrl && gifUrl.trim().length > 0;
                    const hasValidVideo = videoUrl && videoUrl.trim().length > 0;
                    
                    // Si NO tiene media válida (ni imagen ni video), saltar
                    if (!hasValidImage && !hasValidVideo) {
                        totalSkippedNoMedia++;
                        continue;
                    }
                    
                    // Obtener categoría
                    const categoryName = exerciseInfo.category?.name || 'Fuerza';
                    const category = mapCategory(categoryName);
                    
                    // Extraer descripción
                    const description = spanishTranslation.description 
                        ? spanishTranslation.description.trim() 
                        : null;
                    
                    // Extraer músculos
                    const muscles = extractMuscleNames(exerciseInfo);
                    
                    // Extraer equipamiento
                    const equipment = extractEquipmentNames(exerciseInfo);
                    
                    // Calcular calorías por minuto
                    const caloriesPerMinute = calculateCaloriesPerMinute(category);
                    
                    // Insertar ejercicio con todos los campos (solo si tiene media válida)
                    try {
                        await db.insert(exercises).values({
                            name: exerciseName,
                            name_es: exerciseName,
                            category: category,
                            default_calories_per_minute: caloriesPerMinute,
                            gif_url: hasValidImage ? gifUrl.trim() : null,
                            video_url: hasValidVideo ? videoUrl.trim() : null,
                            wger_id: exerciseId,
                            description: description || null,
                            muscles: muscles || null,
                            equipment: equipment || null,
                            is_public: true
                        });
                        
                        totalSynced++;
                        
                        if (totalSynced % 10 === 0) {
                            const mediaIcons = `${hasValidImage ? ' 🖼️' : ''}${hasValidVideo ? ' 🎥' : ''}`;
                            console.log(`   ✅ ${totalSynced} ejercicios agregados... (último: ${exerciseName.substring(0, 40)}${mediaIcons})`);
                        }
                    } catch (insertError) {
                        const errorCode = insertError.code || insertError.cause?.code;
                        if (errorCode === '23505') {
                            // Duplicado por nombre único - solo actualizar si tiene media válida
                            if (hasValidImage || hasValidVideo) {
                                try {
                                    await db.update(exercises)
                                        .set({
                                            name_es: exerciseName,
                                            category: category,
                                            default_calories_per_minute: caloriesPerMinute,
                                            gif_url: hasValidImage ? gifUrl.trim() : null,
                                            video_url: hasValidVideo ? videoUrl.trim() : null,
                                            wger_id: exerciseId,
                                            description: description || null,
                                            muscles: muscles || null,
                                            equipment: equipment || null
                                        })
                                        .where(eq(exercises.name, exerciseName));
                                    
                                    totalSynced++;
                                } catch (updateError) {
                                    console.error(`   ❌ Error actualizando "${exerciseName}":`, updateError.message);
                                    totalErrors++;
                                }
                            } else {
                                // Duplicado pero sin media válida - saltar
                                totalSkippedNoMedia++;
                            }
                        } else {
                            console.error(`   ❌ Error insertando "${exerciseName}":`, insertError.message);
                            totalErrors++;
                        }
                    }
                    
                } catch (error) {
                    console.error(`   ❌ Error procesando ejercicio:`, error.message);
                    totalErrors++;
                }
            }
            
            // Verificar si hay más páginas
            if (!response.data.next) {
                hasMore = false;
            } else {
                page++;
            }
            
            console.log(`   Progreso: ${totalSynced} nuevos, ${totalSkippedNoES} sin ES, ${totalSkippedNoMedia} sin media, ${totalSkippedNoName} sin nombre, ${totalErrors} errores\n`);
            
            // Pausa entre páginas
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`❌ Error al obtener página ${page}:`, error.message);
            hasMore = false;
        }
    }
    
    return {
        totalSynced,
        totalSkippedNoES,
        totalSkippedNoMedia,
        totalSkippedNoName,
        totalErrors,
        processedIds: processedIds.size
    };
}

// Fase 4: Limpiar ejercicios sin media (verificación final)
async function cleanExercisesWithoutMedia() {
    console.log('\n🧹 Limpiando ejercicios sin media (verificación final)...\n');
    
    // Obtener todos los ejercicios públicos
    const allExercises = await db.select()
        .from(exercises)
        .where(eq(exercises.is_public, true));
    
    // Filtrar ejercicios que realmente no tienen media válida
    const exercisesWithoutMedia = allExercises.filter(exercise => {
        const hasValidImage = exercise.gif_url && exercise.gif_url.trim().length > 0;
        const hasValidVideo = exercise.video_url && exercise.video_url.trim().length > 0;
        return !hasValidImage && !hasValidVideo;
    });
    
    console.log(`📋 Encontrados ${exercisesWithoutMedia.length} ejercicios sin media\n`);
    
    if (exercisesWithoutMedia.length === 0) {
        console.log('✅ No hay ejercicios sin media para eliminar\n');
        return {
            total: 0,
            withRoutineReferences: 0,
            withDailyLogReferences: 0,
            deleted: 0,
            errors: 0
        };
    }
    
    let stats = {
        total: exercisesWithoutMedia.length,
        withRoutineReferences: 0,
        withDailyLogReferences: 0,
        deleted: 0,
        errors: 0
    };
    
    const toDelete = [];
    
    console.log('🔍 Verificando referencias en otras tablas...\n');
    
    for (const exercise of exercisesWithoutMedia) {
        // Verificar si está en rutinas
        const inRoutines = await db.select()
            .from(routineExercises)
            .where(eq(routineExercises.exercise_id, exercise.exercise_id))
            .limit(1);
        
        // Verificar si está en logs diarios
        const inDailyLogs = await db.select()
            .from(dailyExercises)
            .where(eq(dailyExercises.exercise_id, exercise.exercise_id))
            .limit(1);
        
        if (inRoutines.length > 0) {
            stats.withRoutineReferences++;
            console.log(`   ⚠️  "${exercise.name}" tiene referencias en rutinas - NO se eliminará`);
        } else if (inDailyLogs.length > 0) {
            stats.withDailyLogReferences++;
            console.log(`   ⚠️  "${exercise.name}" tiene referencias en logs diarios - NO se eliminará`);
        } else {
            toDelete.push(exercise);
        }
    }
    
    console.log(`\n📊 Resumen de verificación:`);
    console.log(`   Total sin media: ${stats.total}`);
    console.log(`   Con referencias en rutinas: ${stats.withRoutineReferences}`);
    console.log(`   Con referencias en logs: ${stats.withDailyLogReferences}`);
    console.log(`   Seguros para eliminar: ${toDelete.length}\n`);
    
    // Eliminar ejercicios seguros
    if (toDelete.length > 0) {
        console.log(`🗑️  Eliminando ${toDelete.length} ejercicios sin media y sin referencias...\n`);
        
        for (const exercise of toDelete) {
            try {
                await db.delete(exercises)
                    .where(eq(exercises.exercise_id, exercise.exercise_id));
                
                stats.deleted++;
                if (stats.deleted % 50 === 0) {
                    console.log(`   ✅ ${stats.deleted} ejercicios eliminados...`);
                }
            } catch (error) {
                stats.errors++;
                console.error(`   ❌ Error al eliminar "${exercise.name}":`, error.message);
            }
        }
        
        console.log(`\n   ✅ Eliminación completada: ${stats.deleted} ejercicios eliminados\n`);
    } else {
        console.log('ℹ️  No hay ejercicios seguros para eliminar (todos tienen referencias)\n');
    }
    
    return stats;
}

// Función principal
async function repopulateExercisesFromWger() {
    console.log('🔄 Iniciando repoblación completa de ejercicios desde wger API...\n');
    console.log('📋 Estrategia:');
    console.log('   1. Eliminar ejercicios existentes (verificando referencias)');
    console.log('   2. Obtener todas las imágenes y videos disponibles');
    console.log('   3. Sincronizar ejercicios desde wger (solo español de España, solo con media)');
    console.log('   4. Incluir todos los campos: description, muscles, equipment, etc.');
    console.log('   5. Limpiar ejercicios sin media (verificación final)\n');
    console.log('='.repeat(60) + '\n');
    
    try {
        // Fase 1: Eliminar ejercicios existentes
        const deleteStats = await safeDeleteAllExercises();
        
        // Fase 2: Obtener todos los medios disponibles
        const [imageMap, videoMap] = await Promise.all([
            getAllExerciseImages(),
            getAllExerciseVideos()
        ]);
        
        // Fase 3: Sincronizar ejercicios desde wger con todos los campos
        const syncStats = await syncWgerExercisesWithAllFields(imageMap, videoMap);
        
        // Fase 4: Limpiar ejercicios sin media (verificación final)
        const cleanupStats = await cleanExercisesWithoutMedia();
        
        // Resumen final
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN FINAL');
        console.log('='.repeat(60));
        console.log('\n🗑️  Eliminación:');
        console.log(`   - Total de ejercicios públicos: ${deleteStats.total}`);
        console.log(`   - Con referencias (no eliminados): ${deleteStats.withRoutineReferences + deleteStats.withDailyLogReferences}`);
        console.log(`   - Eliminados: ${deleteStats.deleted}`);
        console.log(`   - Errores: ${deleteStats.errors}`);
        
        console.log('\n🔄 Sincronización:');
        console.log(`   - Nuevos ejercicios agregados: ${syncStats.totalSynced}`);
        console.log(`   - Omitidos (sin español ES): ${syncStats.totalSkippedNoES}`);
        console.log(`   - Omitidos (sin media): ${syncStats.totalSkippedNoMedia}`);
        console.log(`   - Omitidos (sin nombre): ${syncStats.totalSkippedNoName}`);
        console.log(`   - Errores: ${syncStats.totalErrors}`);
        console.log(`   - Total procesado: ${syncStats.processedIds}`);
        
        console.log('\n🧹 Limpieza final:');
        console.log(`   - Total sin media: ${cleanupStats.total}`);
        console.log(`   - Con referencias (no eliminados): ${cleanupStats.withRoutineReferences + cleanupStats.withDailyLogReferences}`);
        console.log(`   - Eliminados: ${cleanupStats.deleted}`);
        console.log(`   - Errores: ${cleanupStats.errors}`);
        
        console.log('\n📊 Medios disponibles:');
        console.log(`   - Imágenes: ${imageMap.size}`);
        console.log(`   - Videos: ${videoMap.size}`);
        
        // Estadísticas finales de la base de datos
        const finalCount = await db.select({
            count: sql`count(*)`.as('count')
        }).from(exercises).where(eq(exercises.is_public, true));
        
        const withMediaCount = await db.select({
            count: sql`count(*)`.as('count')
        }).from(exercises).where(
            and(
                eq(exercises.is_public, true),
                sql`(${exercises.gif_url} IS NOT NULL OR ${exercises.video_url} IS NOT NULL)`
            )
        );
        
        const withDescriptionCount = await db.select({
            count: sql`count(*)`.as('count')
        }).from(exercises).where(
            and(
                eq(exercises.is_public, true),
                sql`${exercises.description} IS NOT NULL`
            )
        );
        
        const withMusclesCount = await db.select({
            count: sql`count(*)`.as('count')
        }).from(exercises).where(
            and(
                eq(exercises.is_public, true),
                sql`${exercises.muscles} IS NOT NULL`
            )
        );
        
        const withEquipmentCount = await db.select({
            count: sql`count(*)`.as('count')
        }).from(exercises).where(
            and(
                eq(exercises.is_public, true),
                sql`${exercises.equipment} IS NOT NULL`
            )
        );
        
        console.log('\n💾 Estado final de la base de datos:');
        console.log(`   - Total de ejercicios públicos: ${finalCount[0].count}`);
        console.log(`   - Ejercicios con media: ${withMediaCount[0].count}`);
        console.log(`   - Ejercicios con descripción: ${withDescriptionCount[0].count}`);
        console.log(`   - Ejercicios con músculos: ${withMusclesCount[0].count}`);
        console.log(`   - Ejercicios con equipamiento: ${withEquipmentCount[0].count}`);
        console.log(`   - Porcentaje con media: ${((withMediaCount[0].count / finalCount[0].count) * 100).toFixed(1)}%`);
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ Repoblación completa finalizada!');
        console.log('='.repeat(60) + '\n');
        
    } catch (error) {
        console.error('\n❌ Error fatal en la repoblación:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Ejecutar
if (require.main === module) {
    repopulateExercisesFromWger()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { repopulateExercisesFromWger };

