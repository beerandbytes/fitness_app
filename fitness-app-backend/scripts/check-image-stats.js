// Script para verificar estadísticas de imágenes
require('dotenv').config();
const { db } = require('../db/db_config');
const { exercises } = require('../db/schema');
const { eq, sql } = require('drizzle-orm');

async function checkImageStats() {
    const total = await db.select({ count: sql`count(*)` })
        .from(exercises)
        .where(eq(exercises.is_public, true));
    
    const withImage = await db.select({ count: sql`count(*)` })
        .from(exercises)
        .where(sql`is_public = true AND (gif_url IS NOT NULL AND gif_url != '' AND gif_url != 'null')`);
    
    const totalCount = parseInt(total[0].count);
    const withImageCount = parseInt(withImage[0].count);
    const percentage = ((withImageCount / totalCount) * 100).toFixed(1);
    
    console.log('\n📊 ESTADÍSTICAS DE IMÁGENES\n');
    console.log(`Total ejercicios públicos: ${totalCount}`);
    console.log(`Ejercicios con imagen: ${withImageCount}`);
    console.log(`Ejercicios sin imagen: ${totalCount - withImageCount}`);
    console.log(`Porcentaje con imagen: ${percentage}%\n`);
    
    process.exit(0);
}

checkImageStats();

