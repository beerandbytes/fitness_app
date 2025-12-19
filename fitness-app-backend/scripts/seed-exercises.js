// Script para poblar la base de datos con ejercicios de ejemplo
require('dotenv').config();
const { db } = require('../db/db_config');
const { exercises } = require('../db/schema');

const sampleExercises = [
    // ============================================
    // EJERCICIOS DE PECHO
    // ============================================
    { name: 'Push Up', name_es: 'Flexión', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Bench Press', name_es: 'Press de Banca', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Incline Bench Press', name_es: 'Press de Banca Inclinado', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Decline Bench Press', name_es: 'Press de Banca Declinado', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Dumbbell Bench Press', name_es: 'Press de Banca con Mancuernas', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Chest Press', name_es: 'Press de Pecho', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Chest Fly', name_es: 'Aperturas de Pecho', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Dumbbell Fly', name_es: 'Aperturas con Mancuernas', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Diamond Push Up', name_es: 'Flexión Diamante', category: 'Fuerza', default_calories_per_minute: '9' },
    { name: 'Wide Grip Push Up', name_es: 'Flexión Agarre Ancho', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Incline Push Up', name_es: 'Flexión Inclinada', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Decline Push Up', name_es: 'Flexión Declinada', category: 'Fuerza', default_calories_per_minute: '9' },
    { name: 'Cable Crossover', name_es: 'Cruces con Cable', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Push Up with Clap', name_es: 'Flexión con Palmada', category: 'Fuerza', default_calories_per_minute: '10' },
    { name: 'Pike Push Up', name_es: 'Flexión Pike', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Archer Push Up', name_es: 'Flexión Arquero', category: 'Fuerza', default_calories_per_minute: '9' },
    { name: 'Hindu Push Up', name_es: 'Flexión Hindú', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Pseudo Planche Push Up', name_es: 'Flexión Pseudo Plancha', category: 'Fuerza', default_calories_per_minute: '10' },
    { name: 'Incline Dumbbell Fly', name_es: 'Aperturas Inclinadas con Mancuernas', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Decline Dumbbell Fly', name_es: 'Aperturas Declinadas con Mancuernas', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Chest Dips', name_es: 'Fondos de Pecho', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Pullover', name_es: 'Jalón por Encima', category: 'Fuerza', default_calories_per_minute: '5' },
    
    // ============================================
    // EJERCICIOS DE ESPALDA
    // ============================================
    { name: 'Pull Up', name_es: 'Dominada', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Chin Up', name_es: 'Dominada Agarre Supino', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Lat Pulldown', name_es: 'Jalón al Pecho', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Barbell Row', name_es: 'Remo con Barra', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Dumbbell Row', name_es: 'Remo con Mancuernas', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Cable Row', name_es: 'Remo con Cable', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Seated Row', name_es: 'Remo Sentado', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'T-Bar Row', name_es: 'Remo T-Bar', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Bent Over Row', name_es: 'Remo Inclinado', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'One Arm Row', name_es: 'Remo Unilateral', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Wide Grip Pull Up', name_es: 'Dominada Agarre Ancho', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Close Grip Pull Up', name_es: 'Dominada Agarre Cerrado', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Wide Grip Lat Pulldown', name_es: 'Jalón Agarre Ancho', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Reverse Grip Lat Pulldown', name_es: 'Jalón Agarre Inverso', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Face Pull', name_es: 'Jalón Facial', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Straight Arm Pulldown', name_es: 'Jalón Brazo Recto', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Hyperextension', name_es: 'Hiperextensión', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Good Morning', name_es: 'Buenos Días', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Shrug', name_es: 'Encogimiento de Hombros', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Deadlift', name_es: 'Peso Muerto', category: 'Fuerza', default_calories_per_minute: '9' },
    { name: 'Romanian Deadlift', name_es: 'Peso Muerto Rumano', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Stiff Leg Deadlift', name_es: 'Peso Muerto Piernas Rígidas', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Sumo Deadlift', name_es: 'Peso Muerto Sumo', category: 'Fuerza', default_calories_per_minute: '9' },
    
    // ============================================
    // EJERCICIOS DE PIERNAS
    // ============================================
    { name: 'Squat', name_es: 'Sentadilla', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Barbell Squat', name_es: 'Sentadilla con Barra', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Dumbbell Squat', name_es: 'Sentadilla con Mancuernas', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Goblet Squat', name_es: 'Sentadilla Goblet', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Front Squat', name_es: 'Sentadilla Frontal', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Back Squat', name_es: 'Sentadilla Trasera', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Bulgarian Split Squat', name_es: 'Sentadilla Búlgara', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Jump Squat', name_es: 'Sentadilla con Salto', category: 'Fuerza', default_calories_per_minute: '10' },
    { name: 'Sumo Squat', name_es: 'Sentadilla Sumo', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Wall Sit', name_es: 'Sentadilla en la Pared', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Lunges', name_es: 'Zancada', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Walking Lunges', name_es: 'Zancadas Caminando', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Reverse Lunges', name_es: 'Zancada Inversa', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Lateral Lunges', name_es: 'Zancada Lateral', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Dumbbell Lunges', name_es: 'Zancada con Mancuernas', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Leg Press', name_es: 'Prensa de Piernas', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Leg Extension', name_es: 'Extensión de Piernas', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Leg Curl', name_es: 'Curl de Piernas', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Romanian Deadlift', name_es: 'Peso Muerto Rumano', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Stiff Leg Deadlift', name_es: 'Peso Muerto Piernas Rígidas', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Calf Raise', name_es: 'Elevación de Gemelos', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Standing Calf Raise', name_es: 'Elevación de Gemelos de Pie', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Seated Calf Raise', name_es: 'Elevación de Gemelos Sentado', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Hip Thrust', name_es: 'Empuje de Cadera', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Glute Bridge', name_es: 'Puente de Glúteos', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Single Leg Glute Bridge', name_es: 'Puente de Glúteos Unilateral', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Step Up', name_es: 'Subida al Cajón', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Box Jump', name_es: 'Salto al Cajón', category: 'Fuerza', default_calories_per_minute: '11' },
    { name: 'Pistol Squat', name_es: 'Sentadilla Pistola', category: 'Fuerza', default_calories_per_minute: '9' },
    { name: 'Hack Squat', name_es: 'Sentadilla Hack', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Sissy Squat', name_es: 'Sentadilla Sissy', category: 'Fuerza', default_calories_per_minute: '7' },
    
    // ============================================
    // EJERCICIOS DE HOMBROS
    // ============================================
    { name: 'Shoulder Press', name_es: 'Press de Hombros', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Overhead Press', name_es: 'Press Militar', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Military Press', name_es: 'Press Militar', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Dumbbell Shoulder Press', name_es: 'Press de Hombros con Mancuernas', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Arnold Press', name_es: 'Press Arnold', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Lateral Raise', name_es: 'Elevación Lateral', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Front Raise', name_es: 'Elevación Frontal', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Rear Delt Fly', name_es: 'Vuelo Posterior', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Reverse Fly', name_es: 'Vuelo Inverso', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Upright Row', name_es: 'Remo Vertical', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Cable Lateral Raise', name_es: 'Elevación Lateral con Cable', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Cable Front Raise', name_es: 'Elevación Frontal con Cable', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Pike Push Up', name_es: 'Flexión Pike', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Handstand Push Up', name_es: 'Flexión Parada de Manos', category: 'Fuerza', default_calories_per_minute: '12' },
    { name: 'Shrug', name_es: 'Encogimiento de Hombros', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Face Pull', name_es: 'Jalón Facial', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Cuban Press', name_es: 'Press Cubano', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Bent Over Lateral Raise', name_es: 'Elevación Lateral Inclinado', category: 'Fuerza', default_calories_per_minute: '4' },
    
    // ============================================
    // EJERCICIOS DE BÍCEPS
    // ============================================
    { name: 'Bicep Curl', name_es: 'Curl de Bíceps', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Barbell Curl', name_es: 'Curl con Barra', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Dumbbell Curl', name_es: 'Curl con Mancuernas', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Hammer Curl', name_es: 'Curl Martillo', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Concentration Curl', name_es: 'Curl Concentrado', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Cable Curl', name_es: 'Curl con Cable', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Preacher Curl', name_es: 'Curl Predicador', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Incline Dumbbell Curl', name_es: 'Curl Inclinado con Mancuernas', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Spider Curl', name_es: 'Curl Araña', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: '21s', name_es: 'Curl 21s', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Zottman Curl', name_es: 'Curl Zottman', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Cross Body Hammer Curl', name_es: 'Curl Martillo Cruzado', category: 'Fuerza', default_calories_per_minute: '4' },
    
    // ============================================
    // EJERCICIOS DE TRÍCEPS
    // ============================================
    { name: 'Tricep Extension', name_es: 'Extensión de Tríceps', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Tricep Dip', name_es: 'Fondos de Tríceps', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Overhead Tricep Extension', name_es: 'Extensión de Tríceps por Encima', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Tricep Pushdown', name_es: 'Extensión de Tríceps', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Close Grip Bench Press', name_es: 'Press de Banca Agarre Cerrado', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Diamond Push Up', name_es: 'Flexión Diamante', category: 'Fuerza', default_calories_per_minute: '9' },
    { name: 'Dumbbell Tricep Extension', name_es: 'Extensión de Tríceps con Mancuernas', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Cable Tricep Extension', name_es: 'Extensión de Tríceps con Cable', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Tricep Kickback', name_es: 'Patada de Tríceps', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Skull Crusher', name_es: 'Rompecráneos', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'French Press', name_es: 'Press Francés', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Overhead Cable Extension', name_es: 'Extensión con Cable por Encima', category: 'Fuerza', default_calories_per_minute: '4' },
    { name: 'Bench Dip', name_es: 'Fondos en Banco', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Tricep Rope Pushdown', name_es: 'Extensión de Tríceps con Cuerda', category: 'Fuerza', default_calories_per_minute: '4' },
    
    // ============================================
    // EJERCICIOS DE CORE/ABDOMINALES
    // ============================================
    { name: 'Plank', name_es: 'Plancha', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Side Plank', name_es: 'Plancha Lateral', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Crunches', name_es: 'Abdominales', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Sit Up', name_es: 'Abdominales', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Bicycle Crunch', name_es: 'Abdominales Bicicleta', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Russian Twist', name_es: 'Giro Ruso', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Leg Raise', name_es: 'Elevación de Piernas', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Hanging Leg Raise', name_es: 'Elevación de Piernas Colgado', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Mountain Climber', name_es: 'Escalador', category: 'Fuerza', default_calories_per_minute: '10' },
    { name: 'Dead Bug', name_es: 'Bicho Muerto', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Bird Dog', name_es: 'Perro Pájaro', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'V-Up', name_es: 'V-Up', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Flutter Kicks', name_es: 'Patadas Alternas', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Scissor Kicks', name_es: 'Tijeras', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Reverse Crunch', name_es: 'Abdominales Inversos', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Hollow Body Hold', name_es: 'Plancha Hueca', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'L-Sit', name_es: 'L-Sit', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Dragon Flag', name_es: 'Bandera del Dragón', category: 'Fuerza', default_calories_per_minute: '9' },
    { name: 'Ab Wheel Rollout', name_es: 'Rueda Abdominal', category: 'Fuerza', default_calories_per_minute: '7' },
    { name: 'Cable Crunch', name_es: 'Abdominales con Cable', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Toe Touch', name_es: 'Toque de Dedos', category: 'Fuerza', default_calories_per_minute: '6' },
    { name: 'Heel Tap', name_es: 'Toque de Talones', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Plank Up Down', name_es: 'Plancha Sube y Baja', category: 'Fuerza', default_calories_per_minute: '8' },
    { name: 'Plank Jack', name_es: 'Plancha con Salto', category: 'Fuerza', default_calories_per_minute: '9' },
    { name: 'Side Crunch', name_es: 'Abdominales Laterales', category: 'Fuerza', default_calories_per_minute: '5' },
    { name: 'Oblique Crunch', name_es: 'Abdominales Oblicuos', category: 'Fuerza', default_calories_per_minute: '5' },
    
    // ============================================
    // EJERCICIOS DE CARDIO
    // ============================================
    { name: 'Running', name_es: 'Correr', category: 'Cardio', default_calories_per_minute: '12' },
    { name: 'Jogging', name_es: 'Trote', category: 'Cardio', default_calories_per_minute: '10' },
    { name: 'Sprint', name_es: 'Esprint', category: 'Cardio', default_calories_per_minute: '18' },
    { name: 'Cycling', name_es: 'Ciclismo', category: 'Cardio', default_calories_per_minute: '10' },
    { name: 'Stationary Bike', name_es: 'Bicicleta Estática', category: 'Cardio', default_calories_per_minute: '9' },
    { name: 'Jump Rope', name_es: 'Salto de Cuerda', category: 'Cardio', default_calories_per_minute: '13' },
    { name: 'Swimming', name_es: 'Natación', category: 'Cardio', default_calories_per_minute: '11' },
    { name: 'Walking', name_es: 'Caminar', category: 'Cardio', default_calories_per_minute: '5' },
    { name: 'Rowing', name_es: 'Remo', category: 'Cardio', default_calories_per_minute: '12' },
    { name: 'Treadmill', name_es: 'Cinta de Correr', category: 'Cardio', default_calories_per_minute: '11' },
    { name: 'Elliptical', name_es: 'Elíptica', category: 'Cardio', default_calories_per_minute: '10' },
    { name: 'Stair Climber', name_es: 'Escaleras', category: 'Cardio', default_calories_per_minute: '12' },
    { name: 'Jumping Jacks', name_es: 'Saltos de Tijera', category: 'Cardio', default_calories_per_minute: '10' },
    { name: 'High Knees', name_es: 'Rodillas Altas', category: 'Cardio', default_calories_per_minute: '11' },
    { name: 'Butt Kicks', name_es: 'Talones al Glúteo', category: 'Cardio', default_calories_per_minute: '10' },
    { name: 'Jump Squat', name_es: 'Sentadilla con Salto', category: 'Cardio', default_calories_per_minute: '10' },
    { name: 'Box Jump', name_es: 'Salto al Cajón', category: 'Cardio', default_calories_per_minute: '11' },
    { name: 'Jumping Lunges', name_es: 'Zancadas con Salto', category: 'Cardio', default_calories_per_minute: '11' },
    { name: 'Star Jump', name_es: 'Salto de Estrella', category: 'Cardio', default_calories_per_minute: '10' },
    { name: 'Tuck Jump', name_es: 'Salto con Rodillas al Pecho', category: 'Cardio', default_calories_per_minute: '12' },
    { name: 'Broad Jump', name_es: 'Salto de Longitud', category: 'Cardio', default_calories_per_minute: '11' },
    { name: 'Skater Jump', name_es: 'Salto de Patinador', category: 'Cardio', default_calories_per_minute: '10' },
    { name: 'Sprint Intervals', name_es: 'Intervalos de Esprint', category: 'Cardio', default_calories_per_minute: '16' },
    { name: 'HIIT', name_es: 'HIIT', category: 'Cardio', default_calories_per_minute: '15' },
    { name: 'Tabata', name_es: 'Tabata', category: 'Cardio', default_calories_per_minute: '14' },
    { name: 'Rowing Machine', name_es: 'Máquina de Remo', category: 'Cardio', default_calories_per_minute: '12' },
    { name: 'Cross Trainer', name_es: 'Entrenador Cruzado', category: 'Cardio', default_calories_per_minute: '10' },
    { name: 'Stepper', name_es: 'Stepper', category: 'Cardio', default_calories_per_minute: '11' },
    
    // ============================================
    // EJERCICIOS HÍBRIDOS
    // ============================================
    { name: 'Burpees', name_es: 'Burpee', category: 'Híbrido', default_calories_per_minute: '15' },
    { name: 'Burpee with Push Up', name_es: 'Burpee con Flexión', category: 'Híbrido', default_calories_per_minute: '16' },
    { name: 'Burpee with Jump', name_es: 'Burpee con Salto', category: 'Híbrido', default_calories_per_minute: '17' },
    { name: 'Mountain Climber', name_es: 'Escalador', category: 'Híbrido', default_calories_per_minute: '10' },
    { name: 'Thruster', name_es: 'Thruster', category: 'Híbrido', default_calories_per_minute: '12' },
    { name: 'Man Maker', name_es: 'Man Maker', category: 'Híbrido', default_calories_per_minute: '14' },
    { name: 'Renegade Row', name_es: 'Remo Renegado', category: 'Híbrido', default_calories_per_minute: '11' },
    { name: 'Bear Crawl', name_es: 'Gateo de Oso', category: 'Híbrido', default_calories_per_minute: '9' },
    { name: 'Crab Walk', name_es: 'Caminata de Cangrejo', category: 'Híbrido', default_calories_per_minute: '8' },
    { name: 'Duck Walk', name_es: 'Caminata de Pato', category: 'Híbrido', default_calories_per_minute: '9' },
    { name: 'Kettlebell Swing', name_es: 'Balanceo con Kettlebell', category: 'Híbrido', default_calories_per_minute: '12' },
    { name: 'Turkish Get Up', name_es: 'Levantamiento Turco', category: 'Híbrido', default_calories_per_minute: '8' },
    { name: 'Farmer\'s Walk', name_es: 'Caminata del Granjero', category: 'Híbrido', default_calories_per_minute: '7' },
    { name: 'Battle Ropes', name_es: 'Cuerdas de Batalla', category: 'Híbrido', default_calories_per_minute: '13' },
    { name: 'Clean and Press', name_es: 'Cargada y Press', category: 'Híbrido', default_calories_per_minute: '11' },
    { name: 'Snatch', name_es: 'Arrancada', category: 'Híbrido', default_calories_per_minute: '12' },
    { name: 'Clean and Jerk', name_es: 'Cargada y Envión', category: 'Híbrido', default_calories_per_minute: '12' },
    { name: 'Sled Push', name_es: 'Empuje de Trineo', category: 'Híbrido', default_calories_per_minute: '13' },
    { name: 'Sled Pull', name_es: 'Jalón de Trineo', category: 'Híbrido', default_calories_per_minute: '13' },
    { name: 'Tire Flip', name_es: 'Volteo de Neumático', category: 'Híbrido', default_calories_per_minute: '14' },
    { name: 'Sledgehammer Swing', name_es: 'Golpe con Mazo', category: 'Híbrido', default_calories_per_minute: '12' },
    { name: 'Sandbag Carry', name_es: 'Carga de Saco de Arena', category: 'Híbrido', default_calories_per_minute: '10' },
    { name: 'Suitcase Carry', name_es: 'Carga de Maleta', category: 'Híbrido', default_calories_per_minute: '8' },
    { name: 'Overhead Carry', name_es: 'Carga por Encima', category: 'Híbrido', default_calories_per_minute: '9' },
    { name: 'Devil Press', name_es: 'Press del Diablo', category: 'Híbrido', default_calories_per_minute: '15' },
    { name: 'Devil\'s Press', name_es: 'Press del Diablo', category: 'Híbrido', default_calories_per_minute: '15' },
];

async function seedExercises() {
    console.log('🌱 Poblando base de datos con ejercicios de ejemplo...');
    
    try {
        for (const exercise of sampleExercises) {
            try {
                await db.insert(exercises).values({
                    name: exercise.name,
                    name_es: exercise.name_es || exercise.name,
                    category: exercise.category,
                    default_calories_per_minute: exercise.default_calories_per_minute,
                    is_public: true
                });
                console.log(`✅ ${exercise.name} agregado`);
            } catch (error) {
                if (error.code === '23505' || error.cause?.code === '23505') {
                    console.log(`⚠️  ${exercise.name} ya existe, saltando...`);
                } else {
                    console.error(`❌ Error al agregar ${exercise.name}:`, error.message);
                }
            }
        }
        
        console.log('✅ Proceso completado!');
    } catch (error) {
        console.error('❌ Error en el proceso:', error);
    } finally {
        process.exit(0);
    }
}

seedExercises();

