// Script para verificar si hay URLs de Giphy en la base de datos
require('dotenv').config();
const { db } = require('../db/db_config');
const { exercises } = require('../db/schema');
const { sql, or } = require('drizzle-orm');

async function checkGiphyUrls() {
    console.log('🔍 Verificando URLs de Giphy en la base de datos...\n');
    
    try {
        // Buscar todas las variantes posibles de URLs de Giphy
        const patterns = [
            '%giphy%',
            '%giphy.com%',
            '%media.giphy.com%',
            '%i.giphy.com%',
            '%media0.giphy.com%',
            '%media1.giphy.com%',
            '%media2.giphy.com%',
            '%media3.giphy.com%',
            '%api.giphy.com%'
        ];
        
        const conditions = [];
        for (const pattern of patterns) {
            conditions.push(sql`${exercises.gif_url} ILIKE ${pattern}`);
            conditions.push(sql`${exercises.video_url} ILIKE ${pattern}`);
        }
        
        const exercisesWithGiphy = await db.select()
            .from(exercises)
            .where(or(...conditions));
        
        console.log(`📋 Encontrados ${exercisesWithGiphy.length} ejercicios con URLs de Giphy\n`);
        
        if (exercisesWithGiphy.length > 0) {
            console.log('Ejemplos de URLs encontradas:\n');
            exercisesWithGiphy.slice(0, 20).forEach(ex => {
                if (ex.gif_url && (ex.gif_url.toLowerCase().includes('giphy') || ex.gif_url.toLowerCase().includes('giphy'))) {
                    console.log(`  - ${ex.name}:`);
                    console.log(`    gif_url: ${ex.gif_url}`);
                }
                if (ex.video_url && (ex.video_url.toLowerCase().includes('giphy') || ex.video_url.toLowerCase().includes('giphy'))) {
                    console.log(`  - ${ex.name}:`);
                    console.log(`    video_url: ${ex.video_url}`);
                }
            });
            
            if (exercisesWithGiphy.length > 20) {
                console.log(`\n  ... y ${exercisesWithGiphy.length - 20} más\n`);
            }
        } else {
            console.log('✅ No se encontraron URLs de Giphy en la base de datos\n');
        }
        
        // También verificar todas las URLs que contienen "gif" para ver si hay alguna sospechosa
        const allGifUrls = await db.select({
            exercise_id: exercises.exercise_id,
            name: exercises.name,
            gif_url: exercises.gif_url,
            video_url: exercises.video_url
        })
        .from(exercises)
        .where(
            or(
                sql`${exercises.gif_url} IS NOT NULL`,
                sql`${exercises.video_url} IS NOT NULL`
            )
        )
        .limit(50);
        
        console.log('\n📊 Muestra de URLs en la base de datos (primeras 10):\n');
        allGifUrls.slice(0, 10).forEach(ex => {
            if (ex.gif_url) {
                console.log(`  ${ex.name}: ${ex.gif_url.substring(0, 80)}${ex.gif_url.length > 80 ? '...' : ''}`);
            }
        });
        
        return exercisesWithGiphy.length;
        
    } catch (error) {
        console.error('❌ Error en la verificación:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

if (require.main === module) {
    checkGiphyUrls()
        .then((count) => {
            if (count > 0) {
                console.log(`\n⚠️  Se encontraron ${count} ejercicios con URLs de Giphy`);
                console.log('   Ejecuta: node scripts/remove-giphy-urls.js para eliminarlas\n');
                process.exit(1);
            } else {
                console.log('\n✅ No hay URLs de Giphy en la base de datos\n');
                process.exit(0);
            }
        })
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { checkGiphyUrls };

