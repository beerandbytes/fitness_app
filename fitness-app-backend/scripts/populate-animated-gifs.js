// Script para poblar la base de datos con imágenes/GIFs desde wger API (pública, sin API key)
require('dotenv').config();
const axios = require('axios');
const { db } = require('../db/db_config');
const { exercises } = require('../db/schema');
const { eq, and, isNotNull, ne } = require('drizzle-orm');
const logger = require('../utils/logger');

const WGER_API_BASE = 'https://wger.de/api/v2';

// Helper: Verificar si una URL es un GIF animado real
function isAnimatedGif(url) {
    if (!url) return false;
    // Verificar que termine en .gif (antes de cualquier query string)
    const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
    const extension = match ? match[1].toLowerCase() : '';
    
    // Aceptar URLs que terminen en .gif
    return extension === 'gif';
}

// Buscar imagen/GIF en wger API (pública, sin API key requerida)
async function searchWgerImage(exercise, retries = 2) {
    // Solo buscar en wger si el ejercicio tiene wger_id
    if (!exercise.wger_id) {
        return null;
    }
    
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            // Buscar imágenes del ejercicio en wger
            const response = await axios.get(`${WGER_API_BASE}/exerciseimage/`, {
                params: {
                    exercise: exercise.wger_id,
                    is_main: true,
                    limit: 10
                },
                timeout: 10000
            });
            
            if (response.data && response.data.results && response.data.results.length > 0) {
                // wger devuelve imágenes, tomar la primera (principal)
                for (const img of response.data.results) {
                    if (img.image) {
                        let imageUrl = img.image;
                        if (!imageUrl.startsWith('http')) {
                            imageUrl = `https://wger.de${imageUrl}`;
                        }
                        return imageUrl;
                    }
                }
            }
            
            return null;
        } catch (error) {
            if (attempt < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }
            
            if (error.response?.status === 404) {
                return null; // Ejercicio no encontrado, no es error crítico
            }
            
            logger.error(`Error buscando en wger para ejercicio ID ${exercise.wger_id}:`, error.message);
            return null;
        }
    }
    
    return null;
}

// Buscar video en wger API
async function searchWgerVideo(exercise, retries = 2) {
    // Solo buscar en wger si el ejercicio tiene wger_id
    if (!exercise.wger_id) {
        return null;
    }
    
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            // Buscar videos del ejercicio en wger
            const response = await axios.get(`${WGER_API_BASE}/video/`, {
                params: {
                    exercise: exercise.wger_id,
                    limit: 1
                },
                timeout: 10000
            });
            
            if (response.data && response.data.results && response.data.results.length > 0) {
                const video = response.data.results[0];
                if (video.video) {
                    let videoUrl = video.video;
                    if (!videoUrl.startsWith('http')) {
                        videoUrl = `https://wger.de${videoUrl}`;
                    }
                    return videoUrl;
                }
            }
            
            return null;
        } catch (error) {
            if (attempt < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }
            
            if (error.response?.status === 404) {
                return null; // Ejercicio no encontrado, no es error crítico
            }
            
            logger.error(`Error buscando video en wger para ejercicio ID ${exercise.wger_id}:`, error.message);
            return null;
        }
    }
    
    return null;
}

// Función principal
async function populateMediaFromWger(limit = null) {
    console.log('🚀 Iniciando poblamiento de imágenes y videos desde wger API...\n');
    console.log('✅ wger API disponible (pública, sin API key requerida)\n');
    
    if (limit) {
        console.log(`🧪 MODO PRUEBA: Procesando solo ${limit} ejercicios\n`);
    }
    
    try {
        // Obtener todos los ejercicios públicos
        console.log('📦 Obteniendo ejercicios de la base de datos...');
        let allExercises = await db.select()
            .from(exercises)
            .where(eq(exercises.is_public, true));
        
        // Aplicar límite si se especifica (para pruebas)
        if (limit) {
            allExercises = allExercises.slice(0, limit);
        }
        
        console.log(`   ✅ Encontrados ${allExercises.length} ejercicios públicos\n`);
        
        // Filtrar ejercicios que tienen wger_id
        const exercisesToUpdate = allExercises.filter(ex => ex.wger_id);
        
        console.log(`📊 Ejercicios a procesar: ${exercisesToUpdate.length}`);
        console.log(`   - Con wger_id: ${exercisesToUpdate.length}`);
        console.log(`   - Sin wger_id: ${allExercises.length - exercisesToUpdate.length}\n`);
        
        if (exercisesToUpdate.length === 0) {
            console.log('⚠️  No hay ejercicios con wger_id para procesar.\n');
            return;
        }
        
        let stats = {
            total: exercisesToUpdate.length,
            imagesFound: 0,
            imagesUpdated: 0,
            videosFound: 0,
            videosUpdated: 0,
            skipped: 0,
            errors: 0
        };
        
        console.log('🔍 Buscando imágenes y videos desde wger...\n');
        
        for (let i = 0; i < exercisesToUpdate.length; i++) {
            const exercise = exercisesToUpdate[i];
            const progress = `[${i + 1}/${stats.total}]`;
            
            try {
                console.log(`${progress} Procesando "${exercise.name}" (wger_id: ${exercise.wger_id})...`);
                
                const updateData = {};
                
                // Buscar imagen
                const imageUrl = await searchWgerImage(exercise);
                if (imageUrl) {
                    updateData.gif_url = imageUrl;
                    stats.imagesFound++;
                    console.log(`   ✅ Imagen encontrada: ${imageUrl.substring(0, 80)}...`);
                } else {
                    console.log(`   ⚠️  No se encontró imagen`);
                }
                
                // Rate limiting para wger (pública, pero ser respetuosos)
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Buscar video
                const videoUrl = await searchWgerVideo(exercise);
                if (videoUrl) {
                    updateData.video_url = videoUrl;
                    stats.videosFound++;
                    console.log(`   ✅ Video encontrado: ${videoUrl.substring(0, 80)}...`);
                } else {
                    console.log(`   ⚠️  No se encontró video`);
                }
                
                // Actualizar en la base de datos si hay algo que actualizar
                if (Object.keys(updateData).length > 0) {
                    await db.update(exercises)
                        .set(updateData)
                        .where(eq(exercises.exercise_id, exercise.exercise_id));
                    
                    if (updateData.gif_url) stats.imagesUpdated++;
                    if (updateData.video_url) stats.videosUpdated++;
                } else {
                    stats.skipped++;
                }
                
                // Rate limiting entre ejercicios
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Mostrar progreso cada 10 ejercicios
                if ((i + 1) % 10 === 0) {
                    console.log(`\n📊 Progreso: ${i + 1}/${stats.total} | Imágenes: ${stats.imagesUpdated} | Videos: ${stats.videosUpdated}\n`);
                }
                
            } catch (error) {
                stats.errors++;
                logger.error(`Error procesando ejercicio "${exercise.name}":`, error);
                console.log(`   ⚠️  Error: ${error.message}`);
            }
        }
        
        // Resumen final
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN FINAL');
        console.log('='.repeat(60));
        console.log(`Total de ejercicios procesados: ${stats.total}`);
        console.log(`✅ Imágenes encontradas: ${stats.imagesFound}`);
        console.log(`✅ Imágenes actualizadas: ${stats.imagesUpdated}`);
        console.log(`✅ Videos encontrados: ${stats.videosFound}`);
        console.log(`✅ Videos actualizados: ${stats.videosUpdated}`);
        console.log(`⏭️  Ejercicios sin medios encontrados: ${stats.skipped}`);
        console.log(`⚠️  Errores: ${stats.errors}`);
        console.log('='.repeat(60) + '\n');
        
        console.log('✅ Poblamiento completado!\n');
        
    } catch (error) {
        console.error('❌ Error fatal en poblamiento:', error);
        logger.error('Error fatal en populate-animated-gifs:', error);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    // Permitir límite desde argumentos de línea de comandos para pruebas
    // Ejemplo: node populate-animated-gifs.js 5  (procesa solo 5 ejercicios)
    const limit = process.argv[2] ? parseInt(process.argv[2], 10) : null;
    
    populateMediaFromWger(limit)
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { populateMediaFromWger, isAnimatedGif };
