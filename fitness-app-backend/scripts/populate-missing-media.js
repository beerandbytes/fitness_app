// Script para obtener media desde wger para ejercicios que no tienen
require('dotenv').config();
const axios = require('axios');
const { db } = require('../db/db_config');
const { exercises } = require('../db/schema');
const { eq, isNull, and, sql } = require('drizzle-orm');

const WGER_API_BASE = 'https://wger.de/api/v2';

// Obtener imagen y video desde wger API para un ejercicio específico
async function getExerciseMediaFromWger(wgerId, retries = 2) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            // Buscar imagen
            const imageResponse = await axios.get(`${WGER_API_BASE}/exerciseimage/`, {
                params: { exercise: wgerId, is_main: true, limit: 1 },
                timeout: 5000
            });

            let imageUrl = null;
            if (imageResponse.data?.results?.length > 0) {
                const img = imageResponse.data.results[0];
                if (img.image) {
                    imageUrl = img.image.startsWith('http') ? img.image : `https://wger.de${img.image}`;
                }
            }

            // Buscar video
            const videoResponse = await axios.get(`${WGER_API_BASE}/video/`, {
                params: { exercise: wgerId, limit: 1 },
                timeout: 5000
            });

            let videoUrl = null;
            if (videoResponse.data?.results?.length > 0) {
                const video = videoResponse.data.results[0];
                if (video.video) {
                    videoUrl = video.video.startsWith('http') ? video.video : `https://wger.de${video.video}`;
                }
            }

            return { imageUrl, videoUrl };
        } catch (error) {
            if (attempt < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }
            return { imageUrl: null, videoUrl: null };
        }
    }
    return { imageUrl: null, videoUrl: null };
}

// Buscar ejercicio en wger por nombre
async function searchExerciseInWger(exerciseName, retries = 2) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            // Buscar en exerciseinfo con español de España
            const response = await axios.get(`${WGER_API_BASE}/exerciseinfo/`, {
                params: {
                    language: 4, // Español de España
                    limit: 10
                },
                timeout: 10000
            });
            
            if (!response.data || !response.data.results) {
                return null;
            }
            
            // Buscar coincidencia por nombre
            const exerciseNameLower = exerciseName.toLowerCase().trim();
            for (const exerciseInfo of response.data.results) {
                const spanishTranslation = exerciseInfo.translations?.find(t => t.language === 4);
                if (spanishTranslation && spanishTranslation.name) {
                    const wgerNameLower = spanishTranslation.name.toLowerCase().trim();
                    if (wgerNameLower === exerciseNameLower || wgerNameLower.includes(exerciseNameLower) || exerciseNameLower.includes(wgerNameLower)) {
                        return exerciseInfo.id;
                    }
                }
            }
            
            return null;
        } catch (error) {
            if (attempt < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }
            return null;
        }
    }
    return null;
}

async function populateMissingMedia() {
    console.log('🔄 Obteniendo media desde wger para ejercicios sin media...\n');
    
    try {
        // Obtener ejercicios sin media
        const exercisesWithoutMedia = await db.select()
            .from(exercises)
            .where(
                and(
                    eq(exercises.is_public, true),
                    isNull(exercises.gif_url),
                    isNull(exercises.video_url)
                )
            );
        
        console.log(`📋 Encontrados ${exercisesWithoutMedia.length} ejercicios sin media\n`);
        
        if (exercisesWithoutMedia.length === 0) {
            console.log('✅ Todos los ejercicios tienen media\n');
            return;
        }
        
        let stats = {
            total: exercisesWithoutMedia.length,
            updated: 0,
            foundWgerId: 0,
            gotMedia: 0,
            skipped: 0,
            errors: 0
        };
        
        console.log('🔍 Buscando media para ejercicios...\n');
        
        for (let i = 0; i < exercisesWithoutMedia.length; i++) {
            const exercise = exercisesWithoutMedia[i];
            const progress = `[${i + 1}/${stats.total}]`;
            
            try {
                let wgerId = exercise.wger_id;
                
                // Si no tiene wger_id, intentar buscarlo por nombre
                if (!wgerId) {
                    console.log(`${progress} Buscando wger_id para "${exercise.name}"...`);
                    wgerId = await searchExerciseInWger(exercise.name);
                    
                    if (wgerId) {
                        stats.foundWgerId++;
                        // Actualizar wger_id en la base de datos
                        await db.update(exercises)
                            .set({ wger_id: wgerId })
                            .where(eq(exercises.exercise_id, exercise.exercise_id));
                        console.log(`   ✅ Encontrado wger_id: ${wgerId}`);
                    } else {
                        stats.skipped++;
                        console.log(`   ⚠️  No se encontró en wger`);
                        await new Promise(resolve => setTimeout(resolve, 200));
                        continue;
                    }
                }
                
                // Obtener media desde wger
                console.log(`${progress} Obteniendo media para "${exercise.name}" (wger_id: ${wgerId})...`);
                const media = await getExerciseMediaFromWger(wgerId);
                
                if (media.imageUrl || media.videoUrl) {
                    const updateData = {};
                    if (media.imageUrl) {
                        updateData.gif_url = media.imageUrl;
                    }
                    if (media.videoUrl) {
                        updateData.video_url = media.videoUrl;
                    }
                    
                    await db.update(exercises)
                        .set(updateData)
                        .where(eq(exercises.exercise_id, exercise.exercise_id));
                    
                    stats.updated++;
                    stats.gotMedia++;
                    console.log(`   ✅ Media obtenida${media.imageUrl ? ' 🖼️' : ''}${media.videoUrl ? ' 🎥' : ''}`);
                } else {
                    stats.skipped++;
                    console.log(`   ⚠️  No hay media disponible en wger`);
                }
                
                // Delay para no sobrecargar la API
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                stats.errors++;
                console.error(`   ❌ Error procesando "${exercise.name}":`, error.message);
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN');
        console.log('='.repeat(60));
        console.log(`Total de ejercicios sin media: ${stats.total}`);
        console.log(`wger_id encontrados: ${stats.foundWgerId}`);
        console.log(`Media obtenida: ${stats.gotMedia}`);
        console.log(`Ejercicios actualizados: ${stats.updated}`);
        console.log(`Omitidos: ${stats.skipped}`);
        console.log(`Errores: ${stats.errors}`);
        console.log('='.repeat(60) + '\n');
        
    } catch (error) {
        console.error('❌ Error en el proceso:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

if (require.main === module) {
    populateMissingMedia()
        .then(() => {
            console.log('✅ Proceso completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { populateMissingMedia };

