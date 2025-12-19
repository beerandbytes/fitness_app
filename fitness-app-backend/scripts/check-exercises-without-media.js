// Script para verificar cuántos ejercicios no tienen media
require('dotenv').config();
const { db } = require('../db/db_config');
const { exercises } = require('../db/schema');
const { isNull, and, sql, eq } = require('drizzle-orm');

async function checkExercisesWithoutMedia() {
    console.log('🔍 Verificando ejercicios sin media...\n');
    
    try {
        // Ejercicios sin ninguna media
        const withoutMedia = await db.select()
            .from(exercises)
            .where(
                and(
                    eq(exercises.is_public, true),
                    isNull(exercises.gif_url),
                    isNull(exercises.video_url)
                )
            );
        
        // Ejercicios con solo imagen
        const withImageOnly = await db.select()
            .from(exercises)
            .where(
                and(
                    eq(exercises.is_public, true),
                    sql`${exercises.gif_url} IS NOT NULL`,
                    isNull(exercises.video_url)
                )
            );
        
        // Ejercicios con solo video
        const withVideoOnly = await db.select()
            .from(exercises)
            .where(
                and(
                    eq(exercises.is_public, true),
                    isNull(exercises.gif_url),
                    sql`${exercises.video_url} IS NOT NULL`
                )
            );
        
        // Ejercicios con ambos
        const withBoth = await db.select()
            .from(exercises)
            .where(
                and(
                    eq(exercises.is_public, true),
                    sql`${exercises.gif_url} IS NOT NULL`,
                    sql`${exercises.video_url} IS NOT NULL`
                )
            );
        
        // Total de ejercicios públicos
        const total = await db.select({
            count: sql`count(*)`.as('count')
        }).from(exercises).where(eq(exercises.is_public, true));
        
        const totalCount = total[0].count;
        
        console.log('📊 Estadísticas de ejercicios:\n');
        console.log(`Total de ejercicios públicos: ${totalCount}`);
        console.log(`Ejercicios sin media: ${withoutMedia.length} (${((withoutMedia.length / totalCount) * 100).toFixed(1)}%)`);
        console.log(`Ejercicios con solo imagen: ${withImageOnly.length} (${((withImageOnly.length / totalCount) * 100).toFixed(1)}%)`);
        console.log(`Ejercicios con solo video: ${withVideoOnly.length} (${((withVideoOnly.length / totalCount) * 100).toFixed(1)}%)`);
        console.log(`Ejercicios con ambos: ${withBoth.length} (${((withBoth.length / totalCount) * 100).toFixed(1)}%)`);
        console.log(`Ejercicios con al menos un medio: ${withImageOnly.length + withVideoOnly.length + withBoth.length} (${(((withImageOnly.length + withVideoOnly.length + withBoth.length) / totalCount) * 100).toFixed(1)}%)\n`);
        
        // Ejercicios sin media pero con wger_id (pueden obtener media)
        const withoutMediaButWithWger = await db.select()
            .from(exercises)
            .where(
                and(
                    eq(exercises.is_public, true),
                    isNull(exercises.gif_url),
                    isNull(exercises.video_url),
                    sql`${exercises.wger_id} IS NOT NULL`
                )
            );
        
        console.log(`Ejercicios sin media pero con wger_id: ${withoutMediaButWithWger.length}`);
        console.log('   (Estos pueden obtener media desde wger API)\n');
        
        if (withoutMedia.length > 0 && withoutMedia.length <= 20) {
            console.log('Ejemplos de ejercicios sin media:');
            withoutMedia.slice(0, 10).forEach(ex => {
                console.log(`  - ${ex.name} (wger_id: ${ex.wger_id || 'N/A'})`);
            });
        }
        
        return {
            total: totalCount,
            withoutMedia: withoutMedia.length,
            withImageOnly: withImageOnly.length,
            withVideoOnly: withVideoOnly.length,
            withBoth: withBoth.length,
            withoutMediaButWithWger: withoutMediaButWithWger.length
        };
        
    } catch (error) {
        console.error('❌ Error en la verificación:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

if (require.main === module) {
    checkExercisesWithoutMedia()
        .then(() => {
            console.log('\n✅ Verificación completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { checkExercisesWithoutMedia };

