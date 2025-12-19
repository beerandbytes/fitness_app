// Script para eliminar todas las URLs de Giphy de la base de datos
require('dotenv').config();
const { db } = require('../db/db_config');
const { exercises } = require('../db/schema');
const { sql, or, like } = require('drizzle-orm');

async function removeGiphyUrls() {
    console.log('🧹 Iniciando eliminación de URLs de Giphy...\n');
    
    try {
        // Buscar todos los ejercicios que tienen URLs de Giphy
        const exercisesWithGiphy = await db.select()
            .from(exercises)
            .where(
                or(
                    sql`${exercises.gif_url} ILIKE '%giphy.com%'`,
                    sql`${exercises.gif_url} ILIKE '%giphy%'`,
                    sql`${exercises.video_url} ILIKE '%giphy.com%'`,
                    sql`${exercises.video_url} ILIKE '%giphy%'`
                )
            );
        
        console.log(`📋 Encontrados ${exercisesWithGiphy.length} ejercicios con URLs de Giphy\n`);
        
        if (exercisesWithGiphy.length === 0) {
            console.log('✅ No hay URLs de Giphy para eliminar\n');
            return {
                total: 0,
                updated: 0,
                errors: 0
            };
        }
        
        let stats = {
            total: exercisesWithGiphy.length,
            updated: 0,
            errors: 0
        };
        
        console.log('🗑️  Eliminando URLs de Giphy...\n');
        
        for (const exercise of exercisesWithGiphy) {
            try {
                const updateData = {};
                
                // Limpiar gif_url si contiene Giphy
                if (exercise.gif_url && (
                    exercise.gif_url.toLowerCase().includes('giphy.com') ||
                    exercise.gif_url.toLowerCase().includes('giphy')
                )) {
                    updateData.gif_url = null;
                    console.log(`   🧹 Limpiando gif_url de "${exercise.name}"`);
                }
                
                // Limpiar video_url si contiene Giphy
                if (exercise.video_url && (
                    exercise.video_url.toLowerCase().includes('giphy.com') ||
                    exercise.video_url.toLowerCase().includes('giphy')
                )) {
                    updateData.video_url = null;
                    console.log(`   🧹 Limpiando video_url de "${exercise.name}"`);
                }
                
                if (Object.keys(updateData).length > 0) {
                    await db.update(exercises)
                        .set(updateData)
                        .where(sql`${exercises.exercise_id} = ${exercise.exercise_id}`);
                    
                    stats.updated++;
                    
                    if (stats.updated % 50 === 0) {
                        console.log(`   ✅ ${stats.updated} ejercicios actualizados...`);
                    }
                }
            } catch (error) {
                stats.errors++;
                console.error(`   ❌ Error al actualizar "${exercise.name}":`, error.message);
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN');
        console.log('='.repeat(60));
        console.log(`Total de ejercicios con Giphy: ${stats.total}`);
        console.log(`Ejercicios actualizados: ${stats.updated}`);
        console.log(`Errores: ${stats.errors}`);
        console.log('='.repeat(60) + '\n');
        
        // Verificar que no queden URLs de Giphy
        const remainingGiphy = await db.select()
            .from(exercises)
            .where(
                or(
                    sql`${exercises.gif_url} ILIKE '%giphy.com%'`,
                    sql`${exercises.gif_url} ILIKE '%giphy%'`,
                    sql`${exercises.video_url} ILIKE '%giphy.com%'`,
                    sql`${exercises.video_url} ILIKE '%giphy%'`
                )
            );
        
        if (remainingGiphy.length === 0) {
            console.log('✅ Todas las URLs de Giphy han sido eliminadas\n');
        } else {
            console.log(`⚠️  Aún quedan ${remainingGiphy.length} ejercicios con URLs de Giphy\n`);
        }
        
        return stats;
        
    } catch (error) {
        console.error('❌ Error en el proceso:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Ejecutar
if (require.main === module) {
    removeGiphyUrls()
        .then(() => {
            console.log('✅ Proceso completado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { removeGiphyUrls };

