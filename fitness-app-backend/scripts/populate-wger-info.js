// Script para poblar información adicional de ejercicios desde wger API
// Incluye: descripciones, músculos trabajados, equipamiento necesario
require('dotenv').config();
const axios = require('axios');
const { db } = require('../db/db_config');
const { exercises } = require('../db/schema');
const { eq, and, isNotNull } = require('drizzle-orm');
const logger = require('../utils/logger');

const WGER_API_BASE = 'https://wger.de/api/v2';

// Obtener información completa de un ejercicio desde wger
async function getWgerExerciseInfo(wgerId, retries = 2) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            // Obtener información del ejercicio desde exerciseinfo
            const response = await axios.get(`${WGER_API_BASE}/exerciseinfo/`, {
                params: {
                    id: wgerId,
                    language: 2 // Inglés/español
                },
                timeout: 10000
            });
            
            if (response.data && response.data.results && response.data.results.length > 0) {
                return response.data.results[0];
            }
            
            return null;
        } catch (error) {
            if (attempt < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }
            
            if (error.response?.status === 404) {
                return null;
            }
            
            logger.error(`Error obteniendo info de wger para ejercicio ID ${wgerId}:`, error.message);
            return null;
        }
    }
    
    return null;
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

// Función principal
async function populateWgerInfo(limit = null) {
    console.log('🚀 Iniciando poblamiento de información adicional desde wger API...\n');
    console.log('✅ wger API disponible (pública, sin API key requerida)\n');
    
    if (limit) {
        console.log(`🧪 MODO PRUEBA: Procesando solo ${limit} ejercicios\n`);
    }
    
    try {
        // Obtener todos los ejercicios públicos con wger_id
        console.log('📦 Obteniendo ejercicios de la base de datos...');
        let allExercises = await db.select()
            .from(exercises)
            .where(and(
                eq(exercises.is_public, true),
                isNotNull(exercises.wger_id)
            ));
        
        // Aplicar límite si se especifica (para pruebas)
        if (limit) {
            allExercises = allExercises.slice(0, limit);
        }
        
        console.log(`   ✅ Encontrados ${allExercises.length} ejercicios con wger_id\n`);
        
        if (allExercises.length === 0) {
            console.log('⚠️  No hay ejercicios con wger_id para procesar.\n');
            return;
        }
        
        let stats = {
            total: allExercises.length,
            descriptionsUpdated: 0,
            musclesUpdated: 0,
            equipmentUpdated: 0,
            skipped: 0,
            errors: 0
        };
        
        console.log('🔍 Obteniendo información adicional desde wger...\n');
        
        for (let i = 0; i < allExercises.length; i++) {
            const exercise = allExercises[i];
            const progress = `[${i + 1}/${stats.total}]`;
            
            try {
                console.log(`${progress} Procesando "${exercise.name}" (wger_id: ${exercise.wger_id})...`);
                
                // Obtener información del ejercicio desde wger
                const wgerInfo = await getWgerExerciseInfo(exercise.wger_id);
                
                if (!wgerInfo) {
                    console.log(`   ⚠️  No se encontró información en wger`);
                    stats.skipped++;
                    await new Promise(resolve => setTimeout(resolve, 200));
                    continue;
                }
                
                const updateData = {};
                
                // Buscar traducción en español para la descripción
                let spanishTranslation = wgerInfo.translations?.find(t => t.language === 4); // Español específico
                if (!spanishTranslation) {
                    spanishTranslation = wgerInfo.translations?.find(t => t.language === 2);
                }
                
                // Actualizar descripción si está disponible
                if (spanishTranslation && spanishTranslation.description) {
                    const description = spanishTranslation.description.trim();
                    if (description && description.length > 0) {
                        updateData.description = description;
                        stats.descriptionsUpdated++;
                        console.log(`   ✅ Descripción encontrada (${description.length} caracteres)`);
                    }
                }
                
                // Extraer músculos trabajados (ya vienen en la respuesta)
                const muscleNames = extractMuscleNames(wgerInfo);
                if (muscleNames) {
                    updateData.muscles = muscleNames;
                    stats.musclesUpdated++;
                    const muscles = JSON.parse(muscleNames);
                    console.log(`   ✅ Músculos encontrados: ${muscles.join(', ')}`);
                }
                
                // Extraer equipamiento necesario (ya viene en la respuesta)
                const equipmentNames = extractEquipmentNames(wgerInfo);
                if (equipmentNames) {
                    updateData.equipment = equipmentNames;
                    stats.equipmentUpdated++;
                    const equipment = JSON.parse(equipmentNames);
                    console.log(`   ✅ Equipamiento encontrado: ${equipment.join(', ')}`);
                }
                
                // Actualizar en la base de datos si hay algo que actualizar
                if (Object.keys(updateData).length > 0) {
                    await db.update(exercises)
                        .set(updateData)
                        .where(eq(exercises.exercise_id, exercise.exercise_id));
                    
                    console.log(`   ✅ Información actualizada en la base de datos`);
                } else {
                    stats.skipped++;
                    console.log(`   ⚠️  No se encontró información adicional para actualizar`);
                }
                
                // Rate limiting entre ejercicios
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Mostrar progreso cada 10 ejercicios
                if ((i + 1) % 10 === 0) {
                    console.log(`\n📊 Progreso: ${i + 1}/${stats.total} | Descripciones: ${stats.descriptionsUpdated} | Músculos: ${stats.musclesUpdated} | Equipamiento: ${stats.equipmentUpdated}\n`);
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
        console.log(`✅ Descripciones actualizadas: ${stats.descriptionsUpdated}`);
        console.log(`✅ Músculos actualizados: ${stats.musclesUpdated}`);
        console.log(`✅ Equipamiento actualizado: ${stats.equipmentUpdated}`);
        console.log(`⏭️  Ejercicios sin información adicional: ${stats.skipped}`);
        console.log(`⚠️  Errores: ${stats.errors}`);
        console.log('='.repeat(60) + '\n');
        
        console.log('✅ Poblamiento completado!\n');
        
    } catch (error) {
        console.error('❌ Error fatal en poblamiento:', error);
        logger.error('Error fatal en populate-wger-info:', error);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    // Permitir límite desde argumentos de línea de comandos para pruebas
    // Ejemplo: node populate-wger-info.js 5  (procesa solo 5 ejercicios)
    const limit = process.argv[2] ? parseInt(process.argv[2], 10) : null;
    
    populateWgerInfo(limit)
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { populateWgerInfo };

