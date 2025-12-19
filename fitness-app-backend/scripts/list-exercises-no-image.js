// Script simple para listar ejercicios sin imagen
require('dotenv').config();
const { db } = require('../db/db_config');
const { exercises } = require('../db/schema');
const { eq, isNull, and, or } = require('drizzle-orm');

async function listExercisesNoImage() {
    const noImage = await db.select()
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
    
    console.log(`\n📋 Ejercicios sin imagen (${noImage.length}):\n`);
    noImage.forEach((ex, i) => {
        console.log(`${i + 1}. ${ex.name}${ex.name_es ? ` (${ex.name_es})` : ''}`);
    });
    console.log('');
    
    process.exit(0);
}

listExercisesNoImage();

