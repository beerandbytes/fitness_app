// Script para traducir ejercicios existentes de inglés a español
// Agrega el campo name_es con la traducción en castellano
require('dotenv').config();
const { db } = require('../db/db_config');
const { exercises } = require('../db/schema');
const { eq, isNull, and, or, sql } = require('drizzle-orm');

// Diccionario de traducciones comunes de ejercicios
const exerciseTranslations = {
    // Ejercicios básicos
    'Squat': 'Sentadilla',
    'Push Up': 'Flexión',
    'Pull Up': 'Dominada',
    'Bench Press': 'Press de Banca',
    'Deadlift': 'Peso Muerto',
    'Shoulder Press': 'Press de Hombros',
    'Bicep Curl': 'Curl de Bíceps',
    'Tricep Extension': 'Extensión de Tríceps',
    'Leg Press': 'Prensa de Piernas',
    'Calf Raise': 'Elevación de Gemelos',
    'Plank': 'Plancha',
    'Crunch': 'Abdominales',
    'Sit Up': 'Abdominales',
    'Lunge': 'Zancada',
    'Burpee': 'Burpee',
    'Jumping Jacks': 'Saltos de Tijera',
    'Running': 'Correr',
    'Cycling': 'Ciclismo',
    'Swimming': 'Natación',
    'Walking': 'Caminar',
    'Rowing': 'Remo',
    'Jump Rope': 'Salto de Cuerda',
    
    // Ejercicios compuestos
    'Barbell Squat': 'Sentadilla con Barra',
    'Dumbbell Squat': 'Sentadilla con Mancuernas',
    'Goblet Squat': 'Sentadilla Goblet',
    'Front Squat': 'Sentadilla Frontal',
    'Back Squat': 'Sentadilla Trasera',
    'Bulgarian Split Squat': 'Sentadilla Búlgara',
    
    'Incline Bench Press': 'Press de Banca Inclinado',
    'Decline Bench Press': 'Press de Banca Declinado',
    'Dumbbell Bench Press': 'Press de Banca con Mancuernas',
    'Chest Press': 'Press de Pecho',
    'Chest Fly': 'Aperturas de Pecho',
    
    'Barbell Row': 'Remo con Barra',
    'Dumbbell Row': 'Remo con Mancuernas',
    'Cable Row': 'Remo con Cable',
    'Lat Pulldown': 'Jalón al Pecho',
    'Pull Down': 'Jalón',
    'Seated Row': 'Remo Sentado',
    
    'Overhead Press': 'Press Militar',
    'Military Press': 'Press Militar',
    'Lateral Raise': 'Elevación Lateral',
    'Front Raise': 'Elevación Frontal',
    'Rear Delt Fly': 'Vuelo Posterior',
    
    'Barbell Curl': 'Curl con Barra',
    'Dumbbell Curl': 'Curl con Mancuernas',
    'Hammer Curl': 'Curl Martillo',
    'Concentration Curl': 'Curl Concentrado',
    
    'Tricep Dip': 'Fondos de Tríceps',
    'Overhead Tricep Extension': 'Extensión de Tríceps por Encima',
    'Tricep Pushdown': 'Extensión de Tríceps',
    'Close Grip Bench Press': 'Press de Banca Agarre Cerrado',
    
    'Leg Extension': 'Extensión de Piernas',
    'Leg Curl': 'Curl de Piernas',
    'Romanian Deadlift': 'Peso Muerto Rumano',
    'Stiff Leg Deadlift': 'Peso Muerto Piernas Rígidas',
    'Hip Thrust': 'Empuje de Cadera',
    'Glute Bridge': 'Puente de Glúteos',
    
    // Cardio
    'Treadmill': 'Cinta de Correr',
    'Elliptical': 'Elíptica',
    'Stationary Bike': 'Bicicleta Estática',
    'HIIT': 'HIIT',
    'Sprint': 'Esprint',
    'Jogging': 'Trote',
    
    // Core
    'Russian Twist': 'Giro Ruso',
    'Mountain Climber': 'Escalador',
    'Bicycle Crunch': 'Abdominales Bicicleta',
    'Leg Raise': 'Elevación de Piernas',
    'Hanging Leg Raise': 'Elevación de Piernas Colgado',
    'Side Plank': 'Plancha Lateral',
    'Dead Bug': 'Bicho Muerto',
    'Bird Dog': 'Perro Pájaro',
    
    // Otros
    'Kettlebell Swing': 'Balanceo con Kettlebell',
    'Turkish Get Up': 'Levantamiento Turco',
    'Farmer\'s Walk': 'Caminata del Granjero',
    'Battle Ropes': 'Cuerdas de Batalla',
    'Box Jump': 'Salto al Cajón',
    'Wall Sit': 'Sentadilla en la Pared',
    'Diamond Push Up': 'Flexión Diamante',
    'Wide Grip Push Up': 'Flexión Agarre Ancho',
    'Pike Push Up': 'Flexión Pike',
};

// Función para detectar si un texto está en inglés
function isEnglish(text) {
    if (!text) return false;
    // Palabras comunes en inglés de ejercicios
    const englishKeywords = [
        'press', 'curl', 'squat', 'deadlift', 'row', 'raise', 'extension',
        'pull', 'push', 'bench', 'barbell', 'dumbbell', 'cable', 'machine',
        'running', 'cycling', 'swimming', 'walking', 'jumping', 'cardio',
        'tricep', 'bicep', 'shoulder', 'chest', 'back', 'leg', 'abs', 'core'
    ];
    const lowerText = text.toLowerCase();
    return englishKeywords.some(keyword => lowerText.includes(keyword));
}

// Función para traducir un nombre de ejercicio
function translateExerciseName(name) {
    if (!name) return null;
    
    // Buscar traducción exacta
    if (exerciseTranslations[name]) {
        return exerciseTranslations[name];
    }
    
    // Buscar traducción parcial (si contiene alguna palabra clave)
    const lowerName = name.toLowerCase();
    for (const [english, spanish] of Object.entries(exerciseTranslations)) {
        if (lowerName.includes(english.toLowerCase())) {
            // Reemplazar la palabra en inglés por su traducción
            const regex = new RegExp(english, 'gi');
            return name.replace(regex, spanish);
        }
    }
    
    // Si no hay traducción directa pero parece estar en inglés, intentar traducciones comunes
    if (isEnglish(name)) {
        // Traducciones de palabras comunes
        let translated = name;
        translated = translated.replace(/\bpress\b/gi, 'Press');
        translated = translated.replace(/\bcurl\b/gi, 'Curl');
        translated = translated.replace(/\bsquat\b/gi, 'Sentadilla');
        translated = translated.replace(/\bdeadlift\b/gi, 'Peso Muerto');
        translated = translated.replace(/\brow\b/gi, 'Remo');
        translated = translated.replace(/\braise\b/gi, 'Elevación');
        translated = translated.replace(/\bextension\b/gi, 'Extensión');
        translated = translated.replace(/\bpull\b/gi, 'Jalón');
        translated = translated.replace(/\bpush\b/gi, 'Empuje');
        translated = translated.replace(/\bbench\b/gi, 'Banca');
        translated = translated.replace(/\bbarbell\b/gi, 'Barra');
        translated = translated.replace(/\bdumbbell\b/gi, 'Mancuerna');
        translated = translated.replace(/\bcable\b/gi, 'Cable');
        translated = translated.replace(/\bmachine\b/gi, 'Máquina');
        translated = translated.replace(/\btricep\b/gi, 'Tríceps');
        translated = translated.replace(/\bbicep\b/gi, 'Bíceps');
        translated = translated.replace(/\bshoulder\b/gi, 'Hombro');
        translated = translated.replace(/\bchest\b/gi, 'Pecho');
        translated = translated.replace(/\bback\b/gi, 'Espalda');
        translated = translated.replace(/\bleg\b/gi, 'Pierna');
        translated = translated.replace(/\babs\b/gi, 'Abdominales');
        translated = translated.replace(/\bcore\b/gi, 'Core');
        
        // Si cambió algo, devolver la traducción
        if (translated !== name) {
            return translated;
        }
    }
    
    // Si ya está en español o no se puede traducir, devolver null
    return null;
}

async function translateExercises() {
    console.log('🔄 Iniciando traducción de ejercicios a español...\n');
    
    try {
        // Obtener todos los ejercicios que no tienen name_es o tienen name_es vacío
        const allExercises = await db.select()
            .from(exercises)
            .where(
                or(
                    isNull(exercises.name_es),
                    sql`${exercises.name_es} = ''`
                )
            );
        
        console.log(`📋 Encontrados ${allExercises.length} ejercicios sin traducción\n`);
        
        if (allExercises.length === 0) {
            console.log('✅ Todos los ejercicios ya tienen traducción en español.\n');
            return;
        }
        
        let translated = 0;
        let skipped = 0;
        let errors = 0;
        
        for (const exercise of allExercises) {
            try {
                const spanishName = translateExerciseName(exercise.name);
                
                if (spanishName && spanishName !== exercise.name) {
                    // Actualizar el ejercicio con la traducción
                    await db.update(exercises)
                        .set({ name_es: spanishName })
                        .where(eq(exercises.exercise_id, exercise.exercise_id));
                    
                    translated++;
                    if (translated % 10 === 0) {
                        console.log(`   ✅ ${translated} ejercicios traducidos... (último: "${exercise.name}" → "${spanishName}")`);
                    }
                } else {
                    // Si el nombre ya está en español o no se puede traducir, usar el mismo nombre
                    await db.update(exercises)
                        .set({ name_es: exercise.name })
                        .where(eq(exercises.exercise_id, exercise.exercise_id));
                    
                    skipped++;
                }
            } catch (error) {
                console.error(`   ❌ Error traduciendo "${exercise.name}":`, error.message);
                errors++;
            }
        }
        
        console.log('\n✅ Traducción completada!');
        console.log(`📊 Resumen:`);
        console.log(`   - Ejercicios traducidos: ${translated}`);
        console.log(`   - Ejercicios sin cambios (ya en español): ${skipped}`);
        console.log(`   - Errores: ${errors}`);
        console.log(`   - Total procesado: ${translated + skipped + errors}\n`);
        
    } catch (error) {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    translateExercises()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { translateExercises, translateExerciseName };

