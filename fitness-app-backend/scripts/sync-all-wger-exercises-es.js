// Script completo para sincronizar TODA la base de datos de ejercicios con wger
// - Solo ejercicios en español de España (language 4)
// - Solo ejercicios con media (imagen o video)
// - Elimina ejercicios sin media (verificando referencias primero)
// - Actualiza ejercicios existentes a español de España
require('dotenv').config();
const axios = require('axios');
const { db } = require('../db/db_config');
const { exercises, routineExercises, dailyExercises } = require('../db/schema');
const { eq, isNull, and, or, sql } = require('drizzle-orm');

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

// Obtener todas las imágenes disponibles y crear un mapa ejercicio_id -> image_url
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

// Obtener todos los videos disponibles y crear un mapa ejercicio_id -> video_url
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

// Fase 2: Sincronizar ejercicios desde wger (solo español de España, solo con media)
async function syncWgerExercisesES(imageMap, videoMap) {
    console.log('📦 Sincronizando ejercicios desde /exerciseinfo/ (solo español de España, solo con media)...\n');
    
    let page = 1;
    let hasMore = true;
    let totalSynced = 0;
    let totalUpdated = 0;
    let totalSkippedNoES = 0;
    let totalSkippedNoMedia = 0;
    let totalSkippedOther = 0;
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
                        totalSkippedOther++;
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
                    
                    // Obtener imagen y video del mapa
                    const gifUrl = imageMap.get(exerciseId) || null;
                    const videoUrl = videoMap.get(exerciseId) || null;
                    
                    // Si NO tiene media (ni imagen ni video), saltar
                    if (!gifUrl && !videoUrl) {
                        totalSkippedNoMedia++;
                        continue;
                    }
                    
                    // Obtener categoría
                    const categoryName = exerciseInfo.category?.name || 'Fuerza';
                    const category = mapCategory(categoryName);
                    
                    // Verificar si ya existe
                    const existingByWgerId = await db.select()
                        .from(exercises)
                        .where(eq(exercises.wger_id, exerciseId))
                        .limit(1);
                    
                    const existingByName = await db.select()
                        .from(exercises)
                        .where(eq(exercises.name, exerciseName))
                        .limit(1);
                    
                    const existing = existingByWgerId.length > 0 ? existingByWgerId[0] : (existingByName.length > 0 ? existingByName[0] : null);
                    
                    if (existing) {
                        // Actualizar ejercicio existente
                        const updateData = {};
                        
                        // Siempre actualizar nombre a español de España
                        updateData.name = exerciseName;
                        updateData.name_es = exerciseName;
                        
                        // Actualizar imagen si tenemos una
                        if (gifUrl) {
                            updateData.gif_url = gifUrl;
                        }
                        
                        // Actualizar video si tenemos uno
                        if (videoUrl) {
                            updateData.video_url = videoUrl;
                        }
                        
                        // Actualizar wger_id si falta
                        if (!existing.wger_id) {
                            updateData.wger_id = exerciseId;
                        }
                        
                        // Actualizar categoría si es necesario
                        if (category && existing.category !== category) {
                            updateData.category = category;
                        }
                        
                        await db.update(exercises)
                            .set(updateData)
                            .where(eq(exercises.exercise_id, existing.exercise_id));
                        totalUpdated++;
                        
                        if (totalUpdated % 20 === 0) {
                            console.log(`   ✏️  ${totalUpdated} ejercicios actualizados...`);
                        }
                    } else {
                        // Insertar nuevo ejercicio
                        try {
                            await db.insert(exercises).values({
                                name: exerciseName,
                                name_es: exerciseName,
                                category: category,
                                default_calories_per_minute: '5',
                                gif_url: gifUrl || null,
                                video_url: videoUrl || null,
                                wger_id: exerciseId,
                                is_public: true
                            });
                            totalSynced++;
                            
                            if (totalSynced % 10 === 0) {
                                console.log(`   ✅ ${totalSynced} ejercicios agregados... (último: ${exerciseName.substring(0, 40)}${gifUrl ? ' 🖼️' : ''}${videoUrl ? ' 🎥' : ''})`);
                            }
                        } catch (insertError) {
                            const errorCode = insertError.code || insertError.cause?.code;
                            if (errorCode === '23505') {
                                // Duplicado por nombre único
                                totalSkippedOther++;
                            } else {
                                console.error(`   ❌ Error insertando ${exerciseName}:`, insertError.message);
                                totalErrors++;
                            }
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
            
            console.log(`   Progreso: ${totalSynced} nuevos, ${totalUpdated} actualizados, ${totalSkippedNoES} sin ES, ${totalSkippedNoMedia} sin media, ${totalSkippedOther} otros, ${totalErrors} errores\n`);
            
            // Pausa entre páginas
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.error(`❌ Error al obtener página ${page}:`, error.message);
            hasMore = false;
        }
    }
    
    return {
        totalSynced,
        totalUpdated,
        totalSkippedNoES,
        totalSkippedNoMedia,
        totalSkippedOther,
        totalErrors,
        processedIds: processedIds.size
    };
}

// Fase 3: Limpiar ejercicios sin media
async function cleanExercisesWithoutMedia() {
    console.log('\n🧹 Limpiando ejercicios sin media...\n');
    
    // Obtener todos los ejercicios que no tienen gif_url ni video_url
    const exercisesWithoutMedia = await db.select()
        .from(exercises)
        .where(
            and(
                isNull(exercises.gif_url),
                isNull(exercises.video_url)
            )
        );
    
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

// Fase 4: Actualizar ejercicios existentes a español de España
async function updateExistingExercisesToES(imageMap, videoMap) {
    console.log('\n🔄 Actualizando ejercicios existentes a español de España...\n');
    
    // Obtener todos los ejercicios que tienen wger_id pero pueden no estar en español de España
    const existingExercises = await db.select()
        .from(exercises)
        .where(sql`${exercises.wger_id} IS NOT NULL`);
    
    console.log(`📋 Encontrados ${existingExercises.length} ejercicios con wger_id para verificar\n`);
    
    let stats = {
        total: existingExercises.length,
        updated: 0,
        skipped: 0,
        errors: 0
    };
    
    for (let i = 0; i < existingExercises.length; i++) {
        const exercise = existingExercises[i];
        const progress = `[${i + 1}/${stats.total}]`;
        
        try {
            // Obtener información del ejercicio desde wger
            const response = await axios.get(`${WGER_API_BASE}/exerciseinfo/`, {
                params: {
                    id: exercise.wger_id,
                    language: 4 // Español de España
                },
                timeout: 10000
            });
            
            if (!response.data || !response.data.results || response.data.results.length === 0) {
                stats.skipped++;
                continue;
            }
            
            const exerciseInfo = response.data.results[0];
            
            // Buscar traducción en español de España
            const spanishTranslation = exerciseInfo.translations?.find(t => t.language === 4);
            
            if (!spanishTranslation || !spanishTranslation.name) {
                stats.skipped++;
                continue;
            }
            
            const exerciseNameES = spanishTranslation.name.trim();
            
            // Verificar si necesita actualización
            const needsUpdate = exercise.name !== exerciseNameES || exercise.name_es !== exerciseNameES;
            
            if (needsUpdate) {
                const updateData = {
                    name: exerciseNameES,
                    name_es: exerciseNameES
                };
                
                // Actualizar media si está disponible en los mapas
                const gifUrl = imageMap.get(exercise.wger_id);
                const videoUrl = videoMap.get(exercise.wger_id);
                
                if (gifUrl && (!exercise.gif_url || !exercise.gif_url.includes('wger.de'))) {
                    updateData.gif_url = gifUrl;
                }
                if (videoUrl && (!exercise.video_url || !exercise.video_url.includes('wger.de'))) {
                    updateData.video_url = videoUrl;
                }
                
                await db.update(exercises)
                    .set(updateData)
                    .where(eq(exercises.exercise_id, exercise.exercise_id));
                
                stats.updated++;
                
                if (stats.updated % 20 === 0) {
                    console.log(`   ✏️  ${stats.updated} ejercicios actualizados...`);
                }
            } else {
                stats.skipped++;
            }
            
            // Pequeño delay para no sobrecargar la API
            await new Promise(resolve => setTimeout(resolve, 200));
            
        } catch (error) {
            stats.errors++;
            if (stats.errors % 10 === 0) {
                console.error(`   ⚠️  ${stats.errors} errores al procesar ejercicios...`);
            }
        }
    }
    
    console.log(`\n📊 Resumen de actualización:`);
    console.log(`   Total verificados: ${stats.total}`);
    console.log(`   Actualizados: ${stats.updated}`);
    console.log(`   Omitidos: ${stats.skipped}`);
    console.log(`   Errores: ${stats.errors}\n`);
    
    return stats;
}

// Función principal
async function syncAllWgerExercisesES() {
    console.log('🔄 Iniciando sincronización completa de ejercicios con wger...\n');
    console.log('📋 Estrategia:');
    console.log('   1. Obtener todas las imágenes y videos disponibles');
    console.log('   2. Sincronizar ejercicios desde wger (solo español de España, solo con media)');
    console.log('   3. Limpiar ejercicios sin media (verificando referencias)');
    console.log('   4. Actualizar ejercicios existentes a español de España\n');
    console.log('='.repeat(60) + '\n');
    
    try {
        // Fase 1: Obtener todos los medios disponibles
        const [imageMap, videoMap] = await Promise.all([
            getAllExerciseImages(),
            getAllExerciseVideos()
        ]);
        
        // Fase 2: Sincronizar ejercicios desde wger
        const syncStats = await syncWgerExercisesES(imageMap, videoMap);
        
        // Fase 3: Limpiar ejercicios sin media
        const cleanupStats = await cleanExercisesWithoutMedia();
        
        // Fase 4: Actualizar ejercicios existentes a español de España
        const updateStats = await updateExistingExercisesToES(imageMap, videoMap);
        
        // Resumen final
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN FINAL');
        console.log('='.repeat(60));
        console.log('\n🔄 Sincronización:');
        console.log(`   - Nuevos ejercicios: ${syncStats.totalSynced}`);
        console.log(`   - Ejercicios actualizados: ${syncStats.totalUpdated}`);
        console.log(`   - Omitidos (sin español ES): ${syncStats.totalSkippedNoES}`);
        console.log(`   - Omitidos (sin media): ${syncStats.totalSkippedNoMedia}`);
        console.log(`   - Omitidos (otros): ${syncStats.totalSkippedOther}`);
        console.log(`   - Errores: ${syncStats.totalErrors}`);
        console.log(`   - Total procesado: ${syncStats.processedIds}`);
        
        console.log('\n🧹 Limpieza:');
        console.log(`   - Total sin media: ${cleanupStats.total}`);
        console.log(`   - Con referencias (no eliminados): ${cleanupStats.withRoutineReferences + cleanupStats.withDailyLogReferences}`);
        console.log(`   - Eliminados: ${cleanupStats.deleted}`);
        console.log(`   - Errores: ${cleanupStats.errors}`);
        
        console.log('\n🔄 Actualización existentes:');
        console.log(`   - Total verificados: ${updateStats.total}`);
        console.log(`   - Actualizados: ${updateStats.updated}`);
        console.log(`   - Omitidos: ${updateStats.skipped}`);
        console.log(`   - Errores: ${updateStats.errors}`);
        
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
        
        console.log('\n💾 Estado final de la base de datos:');
        console.log(`   - Total de ejercicios públicos: ${finalCount[0].count}`);
        console.log(`   - Ejercicios con media: ${withMediaCount[0].count}`);
        console.log(`   - Porcentaje con media: ${((withMediaCount[0].count / finalCount[0].count) * 100).toFixed(1)}%`);
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ Sincronización completa finalizada!');
        console.log('='.repeat(60) + '\n');
        
    } catch (error) {
        console.error('\n❌ Error fatal en la sincronización:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Ejecutar
if (require.main === module) {
    syncAllWgerExercisesES()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { syncAllWgerExercisesES };

