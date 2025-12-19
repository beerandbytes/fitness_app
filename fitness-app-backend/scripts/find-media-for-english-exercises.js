// Script mejorado para buscar media en wger para ejercicios en inglés
// Usa búsqueda por palabras clave y múltiples estrategias
require('dotenv').config();
const axios = require('axios');
const { db } = require('../db/db_config');
const { exercises } = require('../db/schema');
const { eq, isNull, and, sql } = require('drizzle-orm');

const WGER_API_BASE = 'https://wger.de/api/v2';

// Mapeo de términos comunes en inglés a español
const exerciseTranslations = {
    'deadlift': 'peso muerto',
    'squat': 'sentadilla',
    'bench press': 'press banca',
    'press': 'press',
    'curl': 'curl',
    'fly': 'apertura',
    'row': 'remo',
    'pull': 'tirón',
    'push': 'empuje',
    'extension': 'extensión',
    'stretch': 'estiramiento',
    'bridge': 'puente',
    'jump': 'salto',
    'run': 'correr',
    'walk': 'caminar',
    'sprint': 'esprint',
    'crunch': 'abdominal',
    'sit-up': 'abdominal',
    'lunge': 'zancada',
    'step': 'paso',
    'raise': 'elevación',
    'kick': 'patada',
    'hop': 'salto',
    'slam': 'golpe',
    'clean': 'cargada',
    'snatch': 'arrancada',
    'jerk': 'envión'
};

// Traducir palabras clave del nombre del ejercicio
function translateExerciseName(name) {
    const nameLower = name.toLowerCase();
    let translated = nameLower;
    
    for (const [english, spanish] of Object.entries(exerciseTranslations)) {
        if (nameLower.includes(english)) {
            translated = translated.replace(new RegExp(english, 'gi'), spanish);
        }
    }
    
    return translated;
}

// Buscar ejercicio en wger usando múltiples estrategias
async function findExerciseInWger(exerciseName, retries = 2) {
    const strategies = [
        // Estrategia 1: Buscar directamente en español
        async () => {
            const response = await axios.get(`${WGER_API_BASE}/exerciseinfo/`, {
                params: { language: 4, limit: 100 },
                timeout: 10000
            });
            
            if (!response.data?.results) return null;
            
            const nameLower = exerciseName.toLowerCase().trim();
            for (const exerciseInfo of response.data.results) {
                const spanishTranslation = exerciseInfo.translations?.find(t => t.language === 4);
                if (spanishTranslation?.name) {
                    const wgerNameLower = spanishTranslation.name.toLowerCase().trim();
                    if (wgerNameLower === nameLower || 
                        wgerNameLower.includes(nameLower) || 
                        nameLower.includes(wgerNameLower)) {
                        return exerciseInfo.id;
                    }
                }
            }
            return null;
        },
        
        // Estrategia 2: Buscar por palabras clave traducidas
        async () => {
            const translatedName = translateExerciseName(exerciseName);
            const keywords = translatedName.split(/\s+/).filter(w => w.length > 3);
            
            if (keywords.length === 0) return null;
            
            const response = await axios.get(`${WGER_API_BASE}/exerciseinfo/`, {
                params: { language: 4, limit: 200 },
                timeout: 10000
            });
            
            if (!response.data?.results) return null;
            
            for (const exerciseInfo of response.data.results) {
                const spanishTranslation = exerciseInfo.translations?.find(t => t.language === 4);
                if (spanishTranslation?.name) {
                    const wgerNameLower = spanishTranslation.name.toLowerCase();
                    // Verificar si al menos 2 palabras clave coinciden
                    const matches = keywords.filter(kw => wgerNameLower.includes(kw));
                    if (matches.length >= Math.min(2, keywords.length)) {
                        return exerciseInfo.id;
                    }
                }
            }
            return null;
        },
        
        // Estrategia 3: Buscar por primera palabra clave importante
        async () => {
            const translatedName = translateExerciseName(exerciseName);
            const keywords = translatedName.split(/\s+/).filter(w => w.length > 4);
            if (keywords.length === 0) return null;
            
            const mainKeyword = keywords[0];
            const response = await axios.get(`${WGER_API_BASE}/exerciseinfo/`, {
                params: { language: 4, limit: 200 },
                timeout: 10000
            });
            
            if (!response.data?.results) return null;
            
            for (const exerciseInfo of response.data.results) {
                const spanishTranslation = exerciseInfo.translations?.find(t => t.language === 4);
                if (spanishTranslation?.name) {
                    const wgerNameLower = spanishTranslation.name.toLowerCase();
                    if (wgerNameLower.includes(mainKeyword)) {
                        return exerciseInfo.id;
                    }
                }
            }
            return null;
        }
    ];
    
    for (const strategy of strategies) {
        try {
            const wgerId = await strategy();
            if (wgerId) {
                return wgerId;
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            // Continuar con la siguiente estrategia
        }
    }
    
    return null;
}

// Obtener media desde wger
async function getExerciseMediaFromWger(wgerId) {
    try {
        const [imageResponse, videoResponse] = await Promise.all([
            axios.get(`${WGER_API_BASE}/exerciseimage/`, {
                params: { exercise: wgerId, is_main: true, limit: 1 },
                timeout: 5000
            }).catch(() => ({ data: { results: [] } })),
            axios.get(`${WGER_API_BASE}/video/`, {
                params: { exercise: wgerId, limit: 1 },
                timeout: 5000
            }).catch(() => ({ data: { results: [] } }))
        ]);

        let imageUrl = null;
        if (imageResponse.data?.results?.length > 0 && imageResponse.data.results[0].image) {
            imageUrl = imageResponse.data.results[0].image.startsWith('http') 
                ? imageResponse.data.results[0].image 
                : `https://wger.de${imageResponse.data.results[0].image}`;
        }

        let videoUrl = null;
        if (videoResponse.data?.results?.length > 0 && videoResponse.data.results[0].video) {
            videoUrl = videoResponse.data.results[0].video.startsWith('http')
                ? videoResponse.data.results[0].video
                : `https://wger.de${videoResponse.data.results[0].video}`;
        }

        return { imageUrl, videoUrl };
    } catch (error) {
        return { imageUrl: null, videoUrl: null };
    }
}

async function findMediaForEnglishExercises() {
    console.log('🔍 Buscando media en wger para ejercicios en inglés...\n');
    
    const exercisesWithoutMedia = await db.select()
        .from(exercises)
        .where(
            and(
                eq(exercises.is_public, true),
                isNull(exercises.gif_url),
                isNull(exercises.video_url)
            )
        )
        .limit(50); // Procesar solo los primeros 50 para no sobrecargar
    
    console.log(`📋 Procesando ${exercisesWithoutMedia.length} ejercicios (límite de 50 por ejecución)...\n`);
    
    let stats = {
        total: exercisesWithoutMedia.length,
        found: 0,
        gotMedia: 0,
        updated: 0,
        skipped: 0
    };
    
    for (let i = 0; i < exercisesWithoutMedia.length; i++) {
        const exercise = exercisesWithoutMedia[i];
        const progress = `[${i + 1}/${stats.total}]`;
        
        try {
            console.log(`${progress} Buscando "${exercise.name}"...`);
            
            const wgerId = await findExerciseInWger(exercise.name);
            
            if (wgerId) {
                stats.found++;
                console.log(`   ✅ Encontrado wger_id: ${wgerId}`);
                
                // Actualizar wger_id
                await db.update(exercises)
                    .set({ wger_id: wgerId })
                    .where(eq(exercises.exercise_id, exercise.exercise_id));
                
                // Obtener media
                const media = await getExerciseMediaFromWger(wgerId);
                
                if (media.imageUrl || media.videoUrl) {
                    const updateData = {};
                    if (media.imageUrl) updateData.gif_url = media.imageUrl;
                    if (media.videoUrl) updateData.video_url = media.videoUrl;
                    
                    await db.update(exercises)
                        .set(updateData)
                        .where(eq(exercises.exercise_id, exercise.exercise_id));
                    
                    stats.gotMedia++;
                    stats.updated++;
                    console.log(`   ✅ Media obtenida${media.imageUrl ? ' 🖼️' : ''}${media.videoUrl ? ' 🎥' : ''}`);
                } else {
                    stats.skipped++;
                    console.log(`   ⚠️  No hay media disponible`);
                }
            } else {
                stats.skipped++;
                console.log(`   ⚠️  No encontrado en wger`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 400));
            
        } catch (error) {
            stats.skipped++;
            console.error(`   ❌ Error: ${error.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN');
    console.log('='.repeat(60));
    console.log(`Total procesados: ${stats.total}`);
    console.log(`wger_id encontrados: ${stats.found}`);
    console.log(`Media obtenida: ${stats.gotMedia}`);
    console.log(`Ejercicios actualizados: ${stats.updated}`);
    console.log(`Omitidos: ${stats.skipped}`);
    console.log('='.repeat(60) + '\n');
}

if (require.main === module) {
    findMediaForEnglishExercises()
        .then(() => {
            console.log('✅ Proceso completado');
            console.log('💡 Ejecuta este script varias veces para procesar más ejercicios\n');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { findMediaForEnglishExercises };

