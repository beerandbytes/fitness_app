// Script para buscar imágenes para ejercicios que no tienen imagen
// Busca coincidencias por nombre en wger API y asigna las imágenes correspondientes
require('dotenv').config();
const axios = require('axios');
const { db } = require('../db/db_config');
const { exercises } = require('../db/schema');
const { eq, isNull, and, or, ilike } = require('drizzle-orm');

const WGER_API_BASE = 'https://wger.de/api/v2';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';
const EXERCISES_JSON_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

// Normalizar nombre para comparación (minúsculas, sin espacios extra, sin caracteres especiales)
function normalizeName(name) {
    if (!name) return '';
    return name.toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // Eliminar caracteres especiales
        .replace(/\s+/g, ' '); // Normalizar espacios
}

// Calcular similitud entre dos nombres (simple, basado en palabras comunes)
function calculateSimilarity(name1, name2) {
    const words1 = normalizeName(name1).split(' ').filter(w => w.length > 2);
    const words2 = normalizeName(name2).split(' ').filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const commonWords = words1.filter(w => words2.includes(w));
    const totalWords = Math.max(words1.length, words2.length);
    
    return commonWords.length / totalWords;
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
            
            response.data.results.forEach(img => {
                const exerciseId = img.exercise;
                if (img.image) {
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

// Obtener todos los ejercicios de wger con sus nombres y crear un mapa nombre -> ejercicio_id
async function getAllWgerExercises() {
    console.log('📋 Obteniendo todos los ejercicios de wger con sus nombres...');
    const exerciseMap = new Map(); // nombre normalizado -> { id, name, imageUrl }
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
        try {
            const response = await axios.get(`${WGER_API_BASE}/exerciseinfo/`, {
                params: {
                    language: 2, // Inglés/español
                    limit: 100,
                    offset: (page - 1) * 100
                },
                timeout: 15000
            });
            
            if (!response.data || !response.data.results || response.data.results.length === 0) {
                hasMore = false;
                break;
            }
            
            response.data.results.forEach(exerciseInfo => {
                const exerciseId = exerciseInfo.id;
                
                // Buscar traducción en español
                let spanishTranslation = exerciseInfo.translations?.find(t => t.language === 4); // Español específico
                if (!spanishTranslation) {
                    spanishTranslation = exerciseInfo.translations?.find(t => t.language === 2);
                }
                
                if (spanishTranslation && spanishTranslation.name) {
                    const name = spanishTranslation.name.trim();
                    const normalizedName = normalizeName(name);
                    
                    // Guardar con nombre normalizado como clave
                    if (!exerciseMap.has(normalizedName)) {
                        exerciseMap.set(normalizedName, {
                            id: exerciseId,
                            name: name,
                            normalizedName: normalizedName
                        });
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
            console.error(`   ⚠️  Error obteniendo ejercicios página ${page}:`, error.message);
            hasMore = false;
        }
    }
    
    console.log(`   ✅ Mapa de ejercicios creado: ${exerciseMap.size} ejercicios únicos\n`);
    return exerciseMap;
}

// Obtener ejercicios de free-exercise-db y crear un mapa nombre -> image_url
async function getAllFreeExerciseDbExercises() {
    console.log('📦 Obteniendo ejercicios de free-exercise-db...');
    const exerciseMap = new Map(); // nombre normalizado -> { name, imageUrl }
    
    try {
        const response = await axios.get(EXERCISES_JSON_URL, {
            timeout: 30000
        });
        
        if (response.data && Array.isArray(response.data)) {
            response.data.forEach(exercise => {
                if (exercise.name && exercise.images && Array.isArray(exercise.images) && exercise.images.length > 0) {
                    const name = exercise.name.trim();
                    const normalizedName = normalizeName(name);
                    
                    // Construir URL de imagen
                    const imagePath = exercise.images[0];
                    let imageUrl;
                    
                    if (imagePath.startsWith('http')) {
                        imageUrl = imagePath;
                    } else {
                        imageUrl = `${GITHUB_RAW_BASE}/${imagePath}`;
                    }
                    
                    // Guardar con nombre normalizado como clave
                    if (!exerciseMap.has(normalizedName)) {
                        exerciseMap.set(normalizedName, {
                            name: name,
                            normalizedName: normalizedName,
                            imageUrl: imageUrl
                        });
                    }
                }
            });
        }
        
        console.log(`   ✅ Mapa de free-exercise-db creado: ${exerciseMap.size} ejercicios con imágenes\n`);
    } catch (error) {
        console.error(`   ⚠️  Error obteniendo ejercicios de free-exercise-db:`, error.message);
    }
    
    return exerciseMap;
}

// Buscar imagen para un ejercicio específico
async function findImageForExercise(exercise, imageMap, wgerExerciseMap, freeExerciseDbMap) {
    const exerciseName = exercise.name || '';
    const exerciseNameEs = exercise.name_es || '';
    
    // Intentar búsqueda exacta primero en wger
    const normalizedName = normalizeName(exerciseName);
    const normalizedNameEs = normalizeName(exerciseNameEs);
    
    // Buscar coincidencia exacta en wger
    let match = wgerExerciseMap.get(normalizedName) || wgerExerciseMap.get(normalizedNameEs);
    
    if (match) {
        const imageUrl = imageMap.get(match.id);
        if (imageUrl) {
            return { imageUrl, matchType: 'exact', source: 'wger', wgerId: match.id, wgerName: match.name };
        }
    }
    
    // Buscar coincidencia exacta en free-exercise-db
    let freeDbMatch = freeExerciseDbMap.get(normalizedName) || freeExerciseDbMap.get(normalizedNameEs);
    
    if (freeDbMatch && freeDbMatch.imageUrl) {
        return { 
            imageUrl: freeDbMatch.imageUrl, 
            matchType: 'exact', 
            source: 'free-exercise-db',
            wgerName: freeDbMatch.name 
        };
    }
    
    // Si no hay coincidencia exacta, buscar por similitud en wger
    let bestMatch = null;
    let bestSimilarity = 0;
    
    for (const [normalizedWgerName, wgerExercise] of wgerExerciseMap.entries()) {
        const similarity1 = calculateSimilarity(exerciseName, wgerExercise.name);
        const similarity2 = exerciseNameEs ? calculateSimilarity(exerciseNameEs, wgerExercise.name) : 0;
        const similarity = Math.max(similarity1, similarity2);
        
        if (similarity > bestSimilarity && similarity >= 0.5) { // Al menos 50% de similitud
            const imageUrl = imageMap.get(wgerExercise.id);
            if (imageUrl) {
                bestSimilarity = similarity;
                bestMatch = {
                    imageUrl,
                    matchType: 'similar',
                    similarity,
                    source: 'wger',
                    wgerId: wgerExercise.id,
                    wgerName: wgerExercise.name
                };
            }
        }
    }
    
    // Buscar por similitud en free-exercise-db también
    for (const [normalizedFreeDbName, freeDbExercise] of freeExerciseDbMap.entries()) {
        const similarity1 = calculateSimilarity(exerciseName, freeDbExercise.name);
        const similarity2 = exerciseNameEs ? calculateSimilarity(exerciseNameEs, freeDbExercise.name) : 0;
        const similarity = Math.max(similarity1, similarity2);
        
        if (similarity > bestSimilarity && similarity >= 0.5) {
            if (freeDbExercise.imageUrl) {
                bestSimilarity = similarity;
                bestMatch = {
                    imageUrl: freeDbExercise.imageUrl,
                    matchType: 'similar',
                    similarity,
                    source: 'free-exercise-db',
                    wgerName: freeDbExercise.name
                };
            }
        }
    }
    
    return bestMatch || null;
}

async function findImagesForExercises() {
    console.log('🔍 Buscando imágenes para ejercicios sin imagen...\n');
    
    try {
        // Paso 1: Obtener todos los ejercicios sin imagen
        console.log('📦 Obteniendo ejercicios sin imagen de la base de datos...');
        const exercisesWithoutImage = await db.select()
            .from(exercises)
            .where(
                and(
                    eq(exercises.is_public, true),
                    or(
                        isNull(exercises.gif_url),
                        eq(exercises.gif_url, ''),
                        eq(exercises.gif_url, 'null')
                    )
                )
            );
        
        console.log(`   ✅ Encontrados ${exercisesWithoutImage.length} ejercicios sin imagen\n`);
        
        if (exercisesWithoutImage.length === 0) {
            console.log('✅ No hay ejercicios sin imagen. ¡Todo está actualizado!\n');
            return;
        }
        
        // Paso 2: Obtener todas las imágenes de wger
        const imageMap = await getAllExerciseImages();
        
        // Paso 3: Obtener todos los ejercicios de wger con sus nombres
        const wgerExerciseMap = await getAllWgerExercises();
        
        // Paso 4: Obtener ejercicios de free-exercise-db
        const freeExerciseDbMap = await getAllFreeExerciseDbExercises();
        
        // Paso 5: Buscar imágenes para cada ejercicio
        console.log('🔍 Buscando imágenes para cada ejercicio...\n');
        
        let stats = {
            total: exercisesWithoutImage.length,
            found: 0,
            exactMatches: 0,
            similarMatches: 0,
            notFound: 0,
            errors: 0
        };
        
        for (let i = 0; i < exercisesWithoutImage.length; i++) {
            const exercise = exercisesWithoutImage[i];
            
            try {
                const result = await findImageForExercise(exercise, imageMap, wgerExerciseMap, freeExerciseDbMap);
                
                if (result) {
                    // Actualizar ejercicio con la imagen encontrada
                    const updateData = { gif_url: result.imageUrl };
                    if (result.wgerId) {
                        updateData.wger_id = result.wgerId;
                    }
                    
                    await db.update(exercises)
                        .set(updateData)
                        .where(eq(exercises.exercise_id, exercise.exercise_id));
                    
                    stats.found++;
                    if (result.matchType === 'exact') {
                        stats.exactMatches++;
                        console.log(`   ✅ [${i + 1}/${stats.total}] "${exercise.name}" → Imagen encontrada en ${result.source} (coincidencia exacta con "${result.wgerName}")`);
                    } else {
                        stats.similarMatches++;
                        console.log(`   ✅ [${i + 1}/${stats.total}] "${exercise.name}" → Imagen encontrada en ${result.source} (similitud ${(result.similarity * 100).toFixed(0)}% con "${result.wgerName}")`);
                    }
                } else {
                    stats.notFound++;
                    console.log(`   ❌ [${i + 1}/${stats.total}] "${exercise.name}" → No se encontró imagen`);
                }
                
                // Pequeña pausa para no sobrecargar la API
                if ((i + 1) % 10 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
            } catch (error) {
                stats.errors++;
                console.error(`   ⚠️  Error procesando "${exercise.name}":`, error.message);
            }
        }
        
        // Resumen final
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE BÚSQUEDA DE IMÁGENES');
        console.log('='.repeat(60));
        console.log(`Total de ejercicios procesados: ${stats.total}`);
        console.log(`✅ Imágenes encontradas: ${stats.found}`);
        console.log(`   - Coincidencias exactas: ${stats.exactMatches}`);
        console.log(`   - Coincidencias similares: ${stats.similarMatches}`);
        console.log(`❌ No encontradas: ${stats.notFound}`);
        console.log(`⚠️  Errores: ${stats.errors}`);
        console.log('='.repeat(60) + '\n');
        
        console.log('✅ Búsqueda de imágenes completada!\n');
        
    } catch (error) {
        console.error('❌ Error en búsqueda de imágenes:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    findImagesForExercises()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { findImagesForExercises };

