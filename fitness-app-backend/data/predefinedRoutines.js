/**
 * Rutinas Predefinidas para Entrenadores
 * 
 * Este archivo contiene 10 rutinas semanales predefinidas de diferentes tipos
 * de entrenamiento que los entrenadores pueden usar como inspiración o asignar
 * directamente a sus clientes.
 * 
 * Las rutinas usan nombres de ejercicios que deben existir en la base de datos.
 * El script de población buscará estos ejercicios por nombre o name_es.
 */

module.exports = [
    // =================================================================
    // RUTINA 1: Full Body Principiante (3 días/semana)
    // =================================================================
    {
        name: "Rutina Full Body Principiante",
        description: "Rutina completa para principiantes que entrena todo el cuerpo en cada sesión. Ideal para quienes comienzan su camino en el fitness. Enfocada en ejercicios compuestos básicos y técnica correcta.",
        trainingType: "strength",
        level: "beginner",
        frequency: 3,
        equipment: ["barbell", "dumbbells", "bench", "bodyweight"],
        tags: ["full_body", "beginner", "strength", "compound"],
        exercises: [
            {
                day_of_week: 1, // Lunes
                dayName: "Lunes",
                exercises: [
                    {
                        exercise_name: "Sentadilla",
                        exercise_name_alt: ["Squat", "Barbell Squat"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Mantener la espalda recta y bajar hasta que los muslos estén paralelos al suelo"
                    },
                    {
                        exercise_name: "Press de Banca",
                        exercise_name_alt: ["Bench Press", "Dumbbell Bench Press"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Controlar el movimiento en ambas fases"
                    },
                    {
                        exercise_name: "Remo con Barra",
                        exercise_name_alt: ["Barbell Row", "Dumbbell Row"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Mantener el core activo durante todo el movimiento"
                    },
                    {
                        exercise_name: "Press Militar",
                        exercise_name_alt: ["Overhead Press", "Shoulder Press"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "No arquear la espalda excesivamente"
                    },
                    {
                        exercise_name: "Peso Muerto",
                        exercise_name_alt: ["Deadlift"],
                        sets: 3,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Técnica correcta es más importante que el peso"
                    }
                ]
            },
            {
                day_of_week: 3, // Miércoles
                dayName: "Miércoles",
                exercises: [
                    {
                        exercise_name: "Sentadilla",
                        exercise_name_alt: ["Squat", "Barbell Squat"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Aumentar peso si es posible mantener la forma"
                    },
                    {
                        exercise_name: "Press de Banca Inclinado",
                        exercise_name_alt: ["Incline Bench Press"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Ángulo de 30-45 grados"
                    },
                    {
                        exercise_name: "Remo con Mancuernas",
                        exercise_name_alt: ["Dumbbell Row"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Trabajar ambos lados por igual"
                    },
                    {
                        exercise_name: "Elevación Lateral",
                        exercise_name_alt: ["Lateral Raise"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Movimiento controlado, no balancear"
                    },
                    {
                        exercise_name: "Peso Muerto Rumano",
                        exercise_name_alt: ["Romanian Deadlift"],
                        sets: 3,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Enfocarse en los isquiotibiales"
                    }
                ]
            },
            {
                day_of_week: 5, // Viernes
                dayName: "Viernes",
                exercises: [
                    {
                        exercise_name: "Sentadilla Frontal",
                        exercise_name_alt: ["Front Squat"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Alternativa a la sentadilla trasera"
                    },
                    {
                        exercise_name: "Press de Banca",
                        exercise_name_alt: ["Bench Press"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Intentar aumentar peso esta semana"
                    },
                    {
                        exercise_name: "Dominada",
                        exercise_name_alt: ["Pull Up", "Chin Up"],
                        sets: 3,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Usar asistencia si es necesario"
                    },
                    {
                        exercise_name: "Press Militar",
                        exercise_name_alt: ["Overhead Press"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Mantener el core fuerte"
                    },
                    {
                        exercise_name: "Zancada",
                        exercise_name_alt: ["Lunges", "Walking Lunges"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "6 repeticiones por pierna"
                    }
                ]
            }
        ],
        notes: "Descansar 48 horas entre sesiones. Enfocarse en la técnica antes de aumentar el peso. Progresar agregando peso o repeticiones cada semana."
    },

    // =================================================================
    // RUTINA 2: Push/Pull/Legs Intermedia (6 días/semana)
    // =================================================================
    {
        name: "Rutina Push/Pull/Legs Intermedia",
        description: "División avanzada de 6 días que separa los entrenamientos en empuje (pecho, hombros, tríceps), tracción (espalda, bíceps) y piernas. Ideal para intermedios que buscan mayor volumen y especialización.",
        trainingType: "strength",
        level: "intermediate",
        frequency: 6,
        equipment: ["barbell", "dumbbells", "bench", "cable", "pull_up_bar"],
        tags: ["push_pull_legs", "intermediate", "strength", "6_days"],
        exercises: [
            {
                day_of_week: 1, // Lunes - Push
                dayName: "Lunes - Push",
                exercises: [
                    {
                        exercise_name: "Press de Banca",
                        exercise_name_alt: ["Bench Press"],
                        sets: 4,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Ejercicio principal del día"
                    },
                    {
                        exercise_name: "Press de Banca Inclinado",
                        exercise_name_alt: ["Incline Bench Press"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Enfocado en parte superior del pecho"
                    },
                    {
                        exercise_name: "Press Militar",
                        exercise_name_alt: ["Overhead Press"],
                        sets: 4,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Ejercicio principal de hombros"
                    },
                    {
                        exercise_name: "Elevación Lateral",
                        exercise_name_alt: ["Lateral Raise"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Aislar deltoides laterales"
                    },
                    {
                        exercise_name: "Fondos",
                        exercise_name_alt: ["Dips", "Chest Dips"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Enfocado en tríceps"
                    },
                    {
                        exercise_name: "Extensiones de Tríceps",
                        exercise_name_alt: ["Tricep Extension", "Overhead Tricep Extension"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 6,
                        notes: "Aislar tríceps"
                    }
                ]
            },
            {
                day_of_week: 2, // Martes - Pull
                dayName: "Martes - Pull",
                exercises: [
                    {
                        exercise_name: "Peso Muerto",
                        exercise_name_alt: ["Deadlift"],
                        sets: 4,
                        reps: 6,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Ejercicio principal, máximo esfuerzo"
                    },
                    {
                        exercise_name: "Dominada",
                        exercise_name_alt: ["Pull Up"],
                        sets: 4,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Agarre ancho para trabajar dorsales"
                    },
                    {
                        exercise_name: "Remo con Barra",
                        exercise_name_alt: ["Barbell Row"],
                        sets: 4,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Trabajar toda la espalda"
                    },
                    {
                        exercise_name: "Jalón al Pecho",
                        exercise_name_alt: ["Lat Pulldown"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Agarre cerrado para variación"
                    },
                    {
                        exercise_name: "Curl de Bíceps",
                        exercise_name_alt: ["Bicep Curl", "Dumbbell Curl"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Aislar bíceps"
                    },
                    {
                        exercise_name: "Martillo",
                        exercise_name_alt: ["Hammer Curl"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 6,
                        notes: "Trabajar braquial anterior"
                    }
                ]
            },
            {
                day_of_week: 3, // Miércoles - Legs
                dayName: "Miércoles - Legs",
                exercises: [
                    {
                        exercise_name: "Sentadilla",
                        exercise_name_alt: ["Squat", "Barbell Squat"],
                        sets: 5,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Ejercicio principal, máximo esfuerzo"
                    },
                    {
                        exercise_name: "Prensa de Piernas",
                        exercise_name_alt: ["Leg Press"],
                        sets: 4,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Volumen adicional para cuádriceps"
                    },
                    {
                        exercise_name: "Peso Muerto Rumano",
                        exercise_name_alt: ["Romanian Deadlift"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Enfocado en isquiotibiales"
                    },
                    {
                        exercise_name: "Curl de Piernas",
                        exercise_name_alt: ["Leg Curl"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Aislar isquiotibiales"
                    },
                    {
                        exercise_name: "Elevación de Gemelos",
                        exercise_name_alt: ["Calf Raise", "Standing Calf Raise"],
                        sets: 4,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Rango completo de movimiento"
                    },
                    {
                        exercise_name: "Empuje de Cadera",
                        exercise_name_alt: ["Hip Thrust"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 6,
                        notes: "Enfocado en glúteos"
                    }
                ]
            },
            {
                day_of_week: 4, // Jueves - Push
                dayName: "Jueves - Push",
                exercises: [
                    {
                        exercise_name: "Press de Banca con Mancuernas",
                        exercise_name_alt: ["Dumbbell Bench Press"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Variación del press de banca"
                    },
                    {
                        exercise_name: "Aperturas de Pecho",
                        exercise_name_alt: ["Chest Fly", "Dumbbell Fly"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Estirar el pecho"
                    },
                    {
                        exercise_name: "Press de Hombros con Mancuernas",
                        exercise_name_alt: ["Dumbbell Shoulder Press"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Mayor rango de movimiento"
                    },
                    {
                        exercise_name: "Elevación Frontal",
                        exercise_name_alt: ["Front Raise"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Deltoides anteriores"
                    },
                    {
                        exercise_name: "Press Francés",
                        exercise_name_alt: ["French Press", "Lying Tricep Extension"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Aislar tríceps"
                    },
                    {
                        exercise_name: "Extensiones de Tríceps con Cable",
                        exercise_name_alt: ["Tricep Pushdown"],
                        sets: 3,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 6,
                        notes: "Bomba final para tríceps"
                    }
                ]
            },
            {
                day_of_week: 5, // Viernes - Pull
                dayName: "Viernes - Pull",
                exercises: [
                    {
                        exercise_name: "Remo con Mancuernas",
                        exercise_name_alt: ["Dumbbell Row"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Mayor rango de movimiento"
                    },
                    {
                        exercise_name: "Dominada Agarre Supino",
                        exercise_name_alt: ["Chin Up"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Más énfasis en bíceps"
                    },
                    {
                        exercise_name: "Remo con Cable",
                        exercise_name_alt: ["Cable Row", "Seated Row"],
                        sets: 4,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Tensión constante"
                    },
                    {
                        exercise_name: "Jalón Facial",
                        exercise_name_alt: ["Face Pull"],
                        sets: 3,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Hombros posteriores y trapecios"
                    },
                    {
                        exercise_name: "Curl de Bíceps con Barra",
                        exercise_name_alt: ["Barbell Curl"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Ejercicio principal de bíceps"
                    },
                    {
                        exercise_name: "Curl de Bíceps Concentrado",
                        exercise_name_alt: ["Concentration Curl"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 6,
                        notes: "Aislar completamente el bíceps"
                    }
                ]
            },
            {
                day_of_week: 6, // Sábado - Legs
                dayName: "Sábado - Legs",
                exercises: [
                    {
                        exercise_name: "Sentadilla Frontal",
                        exercise_name_alt: ["Front Squat"],
                        sets: 4,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Variación de sentadilla"
                    },
                    {
                        exercise_name: "Zancada",
                        exercise_name_alt: ["Lunges", "Walking Lunges"],
                        sets: 4,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "6 repeticiones por pierna"
                    },
                    {
                        exercise_name: "Sentadilla Búlgara",
                        exercise_name_alt: ["Bulgarian Split Squat"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "5 repeticiones por pierna"
                    },
                    {
                        exercise_name: "Extensión de Piernas",
                        exercise_name_alt: ["Leg Extension"],
                        sets: 3,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Aislar cuádriceps"
                    },
                    {
                        exercise_name: "Elevación de Gemelos Sentado",
                        exercise_name_alt: ["Seated Calf Raise"],
                        sets: 4,
                        reps: 20,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Sóleo"
                    },
                    {
                        exercise_name: "Puente de Glúteos",
                        exercise_name_alt: ["Glute Bridge"],
                        sets: 3,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 6,
                        notes: "Activación de glúteos"
                    }
                ]
            }
        ],
        notes: "Descansar 1 día entre ciclos. Progresar aumentando peso o repeticiones. Mantener buena forma en todos los ejercicios."
    },

    // =================================================================
    // RUTINA 3: Upper/Lower Avanzada (4 días/semana)
    // =================================================================
    {
        name: "Rutina Upper/Lower Avanzada",
        description: "División de 4 días alternando tren superior e inferior. Ideal para avanzados que buscan alta intensidad y volumen moderado. Permite mayor recuperación entre sesiones.",
        trainingType: "strength",
        level: "advanced",
        frequency: 4,
        equipment: ["barbell", "dumbbells", "bench", "cable", "pull_up_bar"],
        tags: ["upper_lower", "advanced", "strength", "4_days"],
        exercises: [
            {
                day_of_week: 1, // Lunes - Upper
                dayName: "Lunes - Upper",
                exercises: [
                    {
                        exercise_name: "Press de Banca",
                        exercise_name_alt: ["Bench Press"],
                        sets: 5,
                        reps: 5,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Fuerza máxima, descansar 3-5 min"
                    },
                    {
                        exercise_name: "Remo con Barra",
                        exercise_name_alt: ["Barbell Row"],
                        sets: 5,
                        reps: 5,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Ejercicio principal de espalda"
                    },
                    {
                        exercise_name: "Press Militar",
                        exercise_name_alt: ["Overhead Press"],
                        sets: 4,
                        reps: 6,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Fuerza de hombros"
                    },
                    {
                        exercise_name: "Dominada",
                        exercise_name_alt: ["Pull Up"],
                        sets: 4,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Peso adicional si es posible"
                    },
                    {
                        exercise_name: "Fondos",
                        exercise_name_alt: ["Dips"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Peso adicional para avanzados"
                    },
                    {
                        exercise_name: "Curl de Bíceps",
                        exercise_name_alt: ["Bicep Curl"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 6,
                        notes: "Accesorio"
                    }
                ]
            },
            {
                day_of_week: 2, // Martes - Lower
                dayName: "Martes - Lower",
                exercises: [
                    {
                        exercise_name: "Sentadilla",
                        exercise_name_alt: ["Squat", "Barbell Squat"],
                        sets: 5,
                        reps: 5,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Fuerza máxima, descansar 3-5 min"
                    },
                    {
                        exercise_name: "Peso Muerto",
                        exercise_name_alt: ["Deadlift"],
                        sets: 3,
                        reps: 5,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Cuidado con la fatiga acumulada"
                    },
                    {
                        exercise_name: "Prensa de Piernas",
                        exercise_name_alt: ["Leg Press"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Volumen adicional"
                    },
                    {
                        exercise_name: "Curl de Piernas",
                        exercise_name_alt: ["Leg Curl"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Isquiotibiales"
                    },
                    {
                        exercise_name: "Elevación de Gemelos",
                        exercise_name_alt: ["Calf Raise"],
                        sets: 4,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Gemelos"
                    }
                ]
            },
            {
                day_of_week: 4, // Jueves - Upper
                dayName: "Jueves - Upper",
                exercises: [
                    {
                        exercise_name: "Press de Banca Inclinado",
                        exercise_name_alt: ["Incline Bench Press"],
                        sets: 4,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Hipertrofia de pecho superior"
                    },
                    {
                        exercise_name: "Jalón al Pecho",
                        exercise_name_alt: ["Lat Pulldown"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Dorsales"
                    },
                    {
                        exercise_name: "Press de Hombros con Mancuernas",
                        exercise_name_alt: ["Dumbbell Shoulder Press"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Hipertrofia de hombros"
                    },
                    {
                        exercise_name: "Remo con Cable",
                        exercise_name_alt: ["Cable Row"],
                        sets: 4,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Espalda media"
                    },
                    {
                        exercise_name: "Aperturas de Pecho",
                        exercise_name_alt: ["Chest Fly"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Estiramiento del pecho"
                    },
                    {
                        exercise_name: "Extensiones de Tríceps",
                        exercise_name_alt: ["Tricep Extension"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 6,
                        notes: "Tríceps"
                    }
                ]
            },
            {
                day_of_week: 5, // Viernes - Lower
                dayName: "Viernes - Lower",
                exercises: [
                    {
                        exercise_name: "Sentadilla Frontal",
                        exercise_name_alt: ["Front Squat"],
                        sets: 4,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Variación de sentadilla"
                    },
                    {
                        exercise_name: "Peso Muerto Rumano",
                        exercise_name_alt: ["Romanian Deadlift"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Isquiotibiales y glúteos"
                    },
                    {
                        exercise_name: "Zancada",
                        exercise_name_alt: ["Lunges"],
                        sets: 4,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "6 por pierna"
                    },
                    {
                        exercise_name: "Extensión de Piernas",
                        exercise_name_alt: ["Leg Extension"],
                        sets: 3,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Cuádriceps"
                    },
                    {
                        exercise_name: "Empuje de Cadera",
                        exercise_name_alt: ["Hip Thrust"],
                        sets: 4,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Glúteos"
                    },
                    {
                        exercise_name: "Elevación de Gemelos",
                        exercise_name_alt: ["Calf Raise"],
                        sets: 4,
                        reps: 20,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 6,
                        notes: "Gemelos"
                    }
                ]
            }
        ],
        notes: "Descansar 2 días entre sesiones del mismo grupo. Enfocarse en fuerza los días 1-2 y en hipertrofia los días 3-4. Progresar con periodización."
    },

    // =================================================================
    // RUTINA 4: Cardio para Pérdida de Peso (5 días/semana)
    // =================================================================
    {
        name: "Rutina Cardio para Pérdida de Peso",
        description: "Rutina cardiovascular de 5 días diseñada para maximizar la quema de calorías y mejorar la condición física. Incluye variedad de ejercicios cardiovasculares para mantener el interés y evitar el aburrimiento.",
        trainingType: "cardio",
        level: "intermediate",
        frequency: 5,
        equipment: ["treadmill", "bike", "elliptical", "bodyweight", "jump_rope"],
        tags: ["cardio", "weight_loss", "intermediate", "5_days"],
        exercises: [
            {
                day_of_week: 1, // Lunes
                dayName: "Lunes",
                exercises: [
                    {
                        exercise_name: "Correr",
                        exercise_name_alt: ["Running", "Treadmill"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 30,
                        order_index: 1,
                        notes: "Ritmo moderado constante"
                    },
                    {
                        exercise_name: "Caminar",
                        exercise_name_alt: ["Walking"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 10,
                        order_index: 2,
                        notes: "Enfriamiento"
                    }
                ]
            },
            {
                day_of_week: 2, // Martes
                dayName: "Martes",
                exercises: [
                    {
                        exercise_name: "Bicicleta",
                        exercise_name_alt: ["Cycling", "Bike"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 40,
                        order_index: 1,
                        notes: "Ritmo moderado-alto"
                    }
                ]
            },
            {
                day_of_week: 3, // Miércoles
                dayName: "Miércoles",
                exercises: [
                    {
                        exercise_name: "Elíptica",
                        exercise_name_alt: ["Elliptical"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 35,
                        order_index: 1,
                        notes: "Bajo impacto, alta intensidad"
                    },
                    {
                        exercise_name: "Escaladora",
                        exercise_name_alt: ["Stair Climber"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 15,
                        order_index: 2,
                        notes: "Alta intensidad"
                    }
                ]
            },
            {
                day_of_week: 4, // Jueves
                dayName: "Jueves",
                exercises: [
                    {
                        exercise_name: "Nadar",
                        exercise_name_alt: ["Swimming"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 30,
                        order_index: 1,
                        notes: "Estilos variados"
                    },
                    {
                        exercise_name: "Remo",
                        exercise_name_alt: ["Rowing"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 20,
                        order_index: 2,
                        notes: "Ejercicio completo"
                    }
                ]
            },
            {
                day_of_week: 5, // Viernes
                dayName: "Viernes",
                exercises: [
                    {
                        exercise_name: "Correr",
                        exercise_name_alt: ["Running"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 25,
                        order_index: 1,
                        notes: "Ritmo rápido"
                    },
                    {
                        exercise_name: "Saltar la Cuerda",
                        exercise_name_alt: ["Jump Rope", "Skipping"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 15,
                        order_index: 2,
                        notes: "Alta intensidad"
                    }
                ]
            }
        ],
        notes: "Mantener frecuencia cardíaca entre 60-80% del máximo. Hidratarse adecuadamente. Escuchar al cuerpo y ajustar intensidad según sea necesario."
    },

    // =================================================================
    // RUTINA 5: HIIT Intensiva (3 días/semana)
    // =================================================================
    {
        name: "Rutina HIIT Intensiva",
        description: "Entrenamiento de alta intensidad por intervalos de 3 días por semana. Máxima quema de calorías en poco tiempo. Ideal para personas con poco tiempo pero que buscan resultados efectivos.",
        trainingType: "hiit",
        level: "intermediate",
        frequency: 3,
        equipment: ["bodyweight", "dumbbells", "kettlebell", "jump_rope"],
        tags: ["hiit", "intermediate", "high_intensity", "3_days"],
        exercises: [
            {
                day_of_week: 1, // Lunes
                dayName: "Lunes",
                exercises: [
                    {
                        exercise_name: "Burpees",
                        exercise_name_alt: ["Burpee"],
                        sets: 8,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: null,
                        workSeconds: 30,
                        restSeconds: 30,
                        order_index: 1,
                        notes: "30 segundos trabajo, 30 segundos descanso"
                    },
                    {
                        exercise_name: "Mountain Climbers",
                        exercise_name_alt: ["Mountain Climber"],
                        sets: 8,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: null,
                        workSeconds: 30,
                        restSeconds: 30,
                        order_index: 2,
                        notes: "Mantener core activo"
                    },
                    {
                        exercise_name: "Jump Squats",
                        exercise_name_alt: ["Jump Squat"],
                        sets: 8,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: null,
                        workSeconds: 30,
                        restSeconds: 30,
                        order_index: 3,
                        notes: "Máxima explosividad"
                    },
                    {
                        exercise_name: "Flexiones",
                        exercise_name_alt: ["Push Up"],
                        sets: 8,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: null,
                        workSeconds: 30,
                        restSeconds: 30,
                        order_index: 4,
                        notes: "Mantener forma correcta"
                    },
                    {
                        exercise_name: "Saltar la Cuerda",
                        exercise_name_alt: ["Jump Rope"],
                        sets: 8,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: null,
                        workSeconds: 30,
                        restSeconds: 30,
                        order_index: 5,
                        notes: "Ritmo rápido constante"
                    }
                ]
            },
            {
                day_of_week: 3, // Miércoles
                dayName: "Miércoles",
                exercises: [
                    {
                        exercise_name: "Sprints",
                        exercise_name_alt: ["Sprint"],
                        sets: 10,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: null,
                        workSeconds: 20,
                        restSeconds: 40,
                        order_index: 1,
                        notes: "Máxima velocidad"
                    },
                    {
                        exercise_name: "Sentadilla con Salto",
                        exercise_name_alt: ["Jump Squat"],
                        sets: 10,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: null,
                        workSeconds: 20,
                        restSeconds: 40,
                        order_index: 2,
                        notes: "Explosivo"
                    },
                    {
                        exercise_name: "Flexión con Palmada",
                        exercise_name_alt: ["Push Up with Clap"],
                        sets: 8,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: null,
                        workSeconds: 20,
                        restSeconds: 40,
                        order_index: 3,
                        notes: "Solo si tienes la fuerza"
                    },
                    {
                        exercise_name: "Zancadas con Salto",
                        exercise_name_alt: ["Jumping Lunges"],
                        sets: 10,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: null,
                        workSeconds: 20,
                        restSeconds: 40,
                        order_index: 4,
                        notes: "Alternar piernas"
                    },
                    {
                        exercise_name: "Plancha",
                        exercise_name_alt: ["Plank"],
                        sets: 6,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: null,
                        workSeconds: 30,
                        restSeconds: 30,
                        order_index: 5,
                        notes: "Mantener posición"
                    }
                ]
            },
            {
                day_of_week: 5, // Viernes
                dayName: "Viernes",
                exercises: [
                    {
                        exercise_name: "Burpees",
                        exercise_name_alt: ["Burpee"],
                        sets: 10,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: null,
                        workSeconds: 30,
                        restSeconds: 30,
                        order_index: 1,
                        notes: "Aumentar intensidad"
                    },
                    {
                        exercise_name: "Saltar la Cuerda",
                        exercise_name_alt: ["Jump Rope"],
                        sets: 10,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: null,
                        workSeconds: 30,
                        restSeconds: 30,
                        order_index: 2,
                        notes: "Ritmo alto"
                    },
                    {
                        exercise_name: "Mountain Climbers",
                        exercise_name_alt: ["Mountain Climber"],
                        sets: 10,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: null,
                        workSeconds: 30,
                        restSeconds: 30,
                        order_index: 3,
                        notes: "Core fuerte"
                    },
                    {
                        exercise_name: "Jump Squats",
                        exercise_name_alt: ["Jump Squat"],
                        sets: 10,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: null,
                        workSeconds: 30,
                        restSeconds: 30,
                        order_index: 4,
                        notes: "Máxima potencia"
                    },
                    {
                        exercise_name: "Flexiones",
                        exercise_name_alt: ["Push Up"],
                        sets: 10,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: null,
                        workSeconds: 30,
                        restSeconds: 30,
                        order_index: 5,
                        notes: "Forma perfecta"
                    }
                ]
            }
        ],
        notes: "Calentar 5-10 minutos antes. Enfriar y estirar después. Mantener intensidad máxima durante los intervalos de trabajo. Descansar completamente durante los períodos de descanso."
    },

    // Continuaré con las otras 5 rutinas en el siguiente bloque debido al límite de tamaño...
    
    // =================================================================
    // RUTINA 6: Resistencia (5 días/semana)
    // =================================================================
    {
        name: "Rutina de Resistencia",
        description: "Rutina de 5 días que combina ejercicios cardiovasculares y de fuerza resistencia. Diseñada para mejorar la capacidad aeróbica y la resistencia muscular. Ideal para atletas y personas activas.",
        trainingType: "endurance",
        level: "intermediate",
        frequency: 5,
        equipment: ["barbell", "dumbbells", "bodyweight", "treadmill", "bike"],
        tags: ["endurance", "intermediate", "5_days", "cardio_strength"],
        exercises: [
            {
                day_of_week: 1, // Lunes
                dayName: "Lunes",
                exercises: [
                    {
                        exercise_name: "Correr",
                        exercise_name_alt: ["Running"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 20,
                        order_index: 1,
                        notes: "Ritmo moderado"
                    },
                    {
                        exercise_name: "Sentadilla",
                        exercise_name_alt: ["Squat"],
                        sets: 4,
                        reps: 20,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Alto volumen, peso ligero"
                    },
                    {
                        exercise_name: "Flexiones",
                        exercise_name_alt: ["Push Up"],
                        sets: 4,
                        reps: 20,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Mantener ritmo constante"
                    },
                    {
                        exercise_name: "Remo con Barra",
                        exercise_name_alt: ["Barbell Row"],
                        sets: 4,
                        reps: 20,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Peso ligero, muchas repeticiones"
                    }
                ]
            },
            {
                day_of_week: 2, // Martes
                dayName: "Martes",
                exercises: [
                    {
                        exercise_name: "Bicicleta",
                        exercise_name_alt: ["Cycling"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 30,
                        order_index: 1,
                        notes: "Ritmo constante"
                    },
                    {
                        exercise_name: "Zancada",
                        exercise_name_alt: ["Lunges"],
                        sets: 3,
                        reps: 25,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "12-13 por pierna"
                    },
                    {
                        exercise_name: "Press de Hombros",
                        exercise_name_alt: ["Shoulder Press"],
                        sets: 3,
                        reps: 20,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Peso ligero"
                    }
                ]
            },
            {
                day_of_week: 3, // Miércoles
                dayName: "Miércoles",
                exercises: [
                    {
                        exercise_name: "Nadar",
                        exercise_name_alt: ["Swimming"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 25,
                        order_index: 1,
                        notes: "Estilos variados"
                    },
                    {
                        exercise_name: "Peso Muerto",
                        exercise_name_alt: ["Deadlift"],
                        sets: 4,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Peso moderado"
                    },
                    {
                        exercise_name: "Press de Banca",
                        exercise_name_alt: ["Bench Press"],
                        sets: 4,
                        reps: 20,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Peso ligero, alta resistencia"
                    }
                ]
            },
            {
                day_of_week: 4, // Jueves
                dayName: "Jueves",
                exercises: [
                    {
                        exercise_name: "Elíptica",
                        exercise_name_alt: ["Elliptical"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 25,
                        order_index: 1,
                        notes: "Ritmo moderado-alto"
                    },
                    {
                        exercise_name: "Sentadilla",
                        exercise_name_alt: ["Squat"],
                        sets: 3,
                        reps: 25,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Solo peso corporal"
                    },
                    {
                        exercise_name: "Dominada",
                        exercise_name_alt: ["Pull Up"],
                        sets: 3,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Asistida si es necesario"
                    }
                ]
            },
            {
                day_of_week: 5, // Viernes
                dayName: "Viernes",
                exercises: [
                    {
                        exercise_name: "Correr",
                        exercise_name_alt: ["Running"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 30,
                        order_index: 1,
                        notes: "Ritmo constante, distancia larga"
                    },
                    {
                        exercise_name: "Circuito Completo",
                        exercise_name_alt: ["Circuit Training"],
                        sets: 3,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 20,
                        order_index: 2,
                        notes: "Sentadillas, flexiones, remo, zancadas - sin descanso entre ejercicios"
                    }
                ]
            }
        ],
        notes: "Enfocarse en mantener el ritmo durante todo el ejercicio. Peso ligero a moderado con alto volumen de repeticiones. Descansar 30-60 segundos entre series."
    },

    // =================================================================
    // RUTINA 7: Flexibilidad y Movilidad (4 días/semana)
    // =================================================================
    {
        name: "Rutina de Flexibilidad y Movilidad",
        description: "Rutina de 4 días enfocada en mejorar la flexibilidad, movilidad articular y rango de movimiento. Incluye estiramientos estáticos y dinámicos, yoga y movilidad funcional.",
        trainingType: "flexibility",
        level: "beginner",
        frequency: 4,
        equipment: ["yoga_mat", "resistance_band", "foam_roller"],
        tags: ["flexibility", "mobility", "beginner", "4_days", "yoga"],
        exercises: [
            {
                day_of_week: 1, // Lunes
                dayName: "Lunes",
                exercises: [
                    {
                        exercise_name: "Estiramiento de Cuádriceps",
                        exercise_name_alt: ["Quad Stretch"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 30,
                        order_index: 1,
                        notes: "Mantener 30 segundos cada pierna"
                    },
                    {
                        exercise_name: "Estiramiento de Isquiotibiales",
                        exercise_name_alt: ["Hamstring Stretch"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 30,
                        order_index: 2,
                        notes: "Sentado, alcanzar los dedos de los pies"
                    },
                    {
                        exercise_name: "Estiramiento de Glúteos",
                        exercise_name_alt: ["Glute Stretch"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 30,
                        order_index: 3,
                        notes: "Pigeon pose"
                    },
                    {
                        exercise_name: "Estiramiento de Espalda",
                        exercise_name_alt: ["Back Stretch"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 30,
                        order_index: 4,
                        notes: "Gato-vaca"
                    },
                    {
                        exercise_name: "Estiramiento de Hombros",
                        exercise_name_alt: ["Shoulder Stretch"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 30,
                        order_index: 5,
                        notes: "Brazo cruzado"
                    },
                    {
                        exercise_name: "Estiramiento de Pecho",
                        exercise_name_alt: ["Chest Stretch"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 30,
                        order_index: 6,
                        notes: "En marco de puerta"
                    }
                ]
            },
            {
                day_of_week: 2, // Martes
                dayName: "Martes",
                exercises: [
                    {
                        exercise_name: "Yoga Flow",
                        exercise_name_alt: ["Yoga"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 30,
                        order_index: 1,
                        notes: "Secuencia de saludo al sol"
                    },
                    {
                        exercise_name: "Estiramiento de Cadera",
                        exercise_name_alt: ["Hip Stretch"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 20,
                        order_index: 2,
                        notes: "Movilidad de cadera"
                    },
                    {
                        exercise_name: "Estiramiento de Gemelos",
                        exercise_name_alt: ["Calf Stretch"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 20,
                        order_index: 3,
                        notes: "Contra la pared"
                    }
                ]
            },
            {
                day_of_week: 4, // Jueves
                dayName: "Jueves",
                exercises: [
                    {
                        exercise_name: "Movilidad de Hombros",
                        exercise_name_alt: ["Shoulder Mobility"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 15,
                        order_index: 1,
                        notes: "Círculos de brazos"
                    },
                    {
                        exercise_name: "Estiramiento de Cuello",
                        exercise_name_alt: ["Neck Stretch"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 10,
                        order_index: 2,
                        notes: "Suave y controlado"
                    },
                    {
                        exercise_name: "Estiramiento de Muñecas",
                        exercise_name_alt: ["Wrist Stretch"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 10,
                        order_index: 3,
                        notes: "Importante para prevenir lesiones"
                    },
                    {
                        exercise_name: "Estiramiento Completo",
                        exercise_name_alt: ["Full Body Stretch"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 25,
                        order_index: 4,
                        notes: "Rutina completa de estiramiento"
                    }
                ]
            },
            {
                day_of_week: 6, // Sábado
                dayName: "Sábado",
                exercises: [
                    {
                        exercise_name: "Yoga Restaurativo",
                        exercise_name_alt: ["Restorative Yoga"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 40,
                        order_index: 1,
                        notes: "Relajación profunda"
                    },
                    {
                        exercise_name: "Foam Rolling",
                        exercise_name_alt: ["Self Massage"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 20,
                        order_index: 2,
                        notes: "Liberación miofascial"
                    }
                ]
            }
        ],
        notes: "Respirar profundamente durante los estiramientos. No forzar, avanzar gradualmente. Mantener cada estiramiento 30-60 segundos. Realizar después del calentamiento o como sesión separada."
    },

    // =================================================================
    // RUTINA 8: Híbrida Fuerza-Cardio (5 días/semana)
    // =================================================================
    {
        name: "Rutina Híbrida Fuerza-Cardio",
        description: "Rutina equilibrada de 5 días que combina entrenamiento de fuerza y cardiovascular en cada sesión. Ideal para quienes buscan un desarrollo completo: fuerza, resistencia y condición física general.",
        trainingType: "hybrid",
        level: "intermediate",
        frequency: 5,
        equipment: ["barbell", "dumbbells", "bench", "treadmill", "bike", "bodyweight"],
        tags: ["hybrid", "intermediate", "5_days", "strength_cardio"],
        exercises: [
            {
                day_of_week: 1, // Lunes
                dayName: "Lunes",
                exercises: [
                    {
                        exercise_name: "Sentadilla",
                        exercise_name_alt: ["Squat"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Fuerza primero"
                    },
                    {
                        exercise_name: "Press de Banca",
                        exercise_name_alt: ["Bench Press"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Fuerza"
                    },
                    {
                        exercise_name: "Remo con Barra",
                        exercise_name_alt: ["Barbell Row"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Fuerza"
                    },
                    {
                        exercise_name: "Correr",
                        exercise_name_alt: ["Running"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 20,
                        order_index: 4,
                        notes: "Cardio después de fuerza"
                    }
                ]
            },
            {
                day_of_week: 2, // Martes
                dayName: "Martes",
                exercises: [
                    {
                        exercise_name: "Bicicleta",
                        exercise_name_alt: ["Cycling"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 25,
                        order_index: 1,
                        notes: "Calentamiento cardio"
                    },
                    {
                        exercise_name: "Press Militar",
                        exercise_name_alt: ["Overhead Press"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Fuerza"
                    },
                    {
                        exercise_name: "Dominada",
                        exercise_name_alt: ["Pull Up"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Fuerza"
                    },
                    {
                        exercise_name: "Zancada",
                        exercise_name_alt: ["Lunges"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Fuerza resistencia"
                    },
                    {
                        exercise_name: "Elíptica",
                        exercise_name_alt: ["Elliptical"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 15,
                        order_index: 5,
                        notes: "Cardio final"
                    }
                ]
            },
            {
                day_of_week: 3, // Miércoles
                dayName: "Miércoles",
                exercises: [
                    {
                        exercise_name: "Peso Muerto",
                        exercise_name_alt: ["Deadlift"],
                        sets: 4,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Ejercicio principal"
                    },
                    {
                        exercise_name: "Prensa de Piernas",
                        exercise_name_alt: ["Leg Press"],
                        sets: 3,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Volumen"
                    },
                    {
                        exercise_name: "Nadar",
                        exercise_name_alt: ["Swimming"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 20,
                        order_index: 3,
                        notes: "Cardio completo"
                    }
                ]
            },
            {
                day_of_week: 4, // Jueves
                dayName: "Jueves",
                exercises: [
                    {
                        exercise_name: "Correr",
                        exercise_name_alt: ["Running"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 15,
                        order_index: 1,
                        notes: "Calentamiento"
                    },
                    {
                        exercise_name: "Press de Banca Inclinado",
                        exercise_name_alt: ["Incline Bench Press"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Fuerza"
                    },
                    {
                        exercise_name: "Remo con Mancuernas",
                        exercise_name_alt: ["Dumbbell Row"],
                        sets: 4,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Fuerza"
                    },
                    {
                        exercise_name: "Fondos",
                        exercise_name_alt: ["Dips"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Fuerza"
                    },
                    {
                        exercise_name: "Saltar la Cuerda",
                        exercise_name_alt: ["Jump Rope"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 10,
                        order_index: 5,
                        notes: "Cardio intenso"
                    }
                ]
            },
            {
                day_of_week: 5, // Viernes
                dayName: "Viernes",
                exercises: [
                    {
                        exercise_name: "Sentadilla Frontal",
                        exercise_name_alt: ["Front Squat"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Fuerza"
                    },
                    {
                        exercise_name: "Press de Hombros",
                        exercise_name_alt: ["Shoulder Press"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Fuerza"
                    },
                    {
                        exercise_name: "Jalón al Pecho",
                        exercise_name_alt: ["Lat Pulldown"],
                        sets: 4,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Fuerza"
                    },
                    {
                        exercise_name: "Bicicleta",
                        exercise_name_alt: ["Cycling"],
                        sets: 1,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 25,
                        order_index: 4,
                        notes: "Cardio final de la semana"
                    }
                ]
            }
        ],
        notes: "Alternar entre fuerza y cardio en cada sesión. Mantener buena forma en todos los ejercicios. Hidratarse adecuadamente. Progresar aumentando peso o duración del cardio."
    },

    // =================================================================
    // RUTINA 9: Bro Split (5 días/semana)
    // =================================================================
    {
        name: "Rutina Bro Split",
        description: "División clásica de 5 días entrenando un grupo muscular por día. Ideal para quienes buscan máximo volumen y especialización por grupo muscular. Permite recuperación completa entre sesiones del mismo grupo.",
        trainingType: "strength",
        level: "intermediate",
        frequency: 5,
        equipment: ["barbell", "dumbbells", "bench", "cable", "pull_up_bar"],
        tags: ["bro_split", "intermediate", "strength", "5_days", "bodybuilding"],
        exercises: [
            {
                day_of_week: 1, // Lunes - Pecho
                dayName: "Lunes - Pecho",
                exercises: [
                    {
                        exercise_name: "Press de Banca",
                        exercise_name_alt: ["Bench Press"],
                        sets: 4,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Ejercicio principal"
                    },
                    {
                        exercise_name: "Press de Banca Inclinado",
                        exercise_name_alt: ["Incline Bench Press"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Parte superior del pecho"
                    },
                    {
                        exercise_name: "Press de Banca Declinado",
                        exercise_name_alt: ["Decline Bench Press"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Parte inferior del pecho"
                    },
                    {
                        exercise_name: "Aperturas de Pecho",
                        exercise_name_alt: ["Chest Fly"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Estiramiento del pecho"
                    },
                    {
                        exercise_name: "Cruces con Cable",
                        exercise_name_alt: ["Cable Crossover"],
                        sets: 3,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Bomba final"
                    }
                ]
            },
            {
                day_of_week: 2, // Martes - Espalda
                dayName: "Martes - Espalda",
                exercises: [
                    {
                        exercise_name: "Peso Muerto",
                        exercise_name_alt: ["Deadlift"],
                        sets: 4,
                        reps: 6,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Ejercicio principal"
                    },
                    {
                        exercise_name: "Dominada",
                        exercise_name_alt: ["Pull Up"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Dorsales"
                    },
                    {
                        exercise_name: "Remo con Barra",
                        exercise_name_alt: ["Barbell Row"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Espalda media"
                    },
                    {
                        exercise_name: "Jalón al Pecho",
                        exercise_name_alt: ["Lat Pulldown"],
                        sets: 4,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Dorsales"
                    },
                    {
                        exercise_name: "Remo con Cable",
                        exercise_name_alt: ["Cable Row"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Espalda baja"
                    },
                    {
                        exercise_name: "Encogimiento de Hombros",
                        exercise_name_alt: ["Shrug"],
                        sets: 4,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 6,
                        notes: "Trapecios"
                    }
                ]
            },
            {
                day_of_week: 3, // Miércoles - Hombros
                dayName: "Miércoles - Hombros",
                exercises: [
                    {
                        exercise_name: "Press Militar",
                        exercise_name_alt: ["Overhead Press"],
                        sets: 4,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Ejercicio principal"
                    },
                    {
                        exercise_name: "Elevación Lateral",
                        exercise_name_alt: ["Lateral Raise"],
                        sets: 4,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Deltoides laterales"
                    },
                    {
                        exercise_name: "Elevación Frontal",
                        exercise_name_alt: ["Front Raise"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Deltoides anteriores"
                    },
                    {
                        exercise_name: "Jalón Facial",
                        exercise_name_alt: ["Face Pull"],
                        sets: 4,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Deltoides posteriores"
                    },
                    {
                        exercise_name: "Elevación Lateral Inclinado",
                        exercise_name_alt: ["Bent Over Lateral Raise"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Hombros posteriores"
                    }
                ]
            },
            {
                day_of_week: 4, // Jueves - Piernas
                dayName: "Jueves - Piernas",
                exercises: [
                    {
                        exercise_name: "Sentadilla",
                        exercise_name_alt: ["Squat"],
                        sets: 5,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Ejercicio principal"
                    },
                    {
                        exercise_name: "Prensa de Piernas",
                        exercise_name_alt: ["Leg Press"],
                        sets: 4,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Volumen adicional"
                    },
                    {
                        exercise_name: "Extensión de Piernas",
                        exercise_name_alt: ["Leg Extension"],
                        sets: 4,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Cuádriceps"
                    },
                    {
                        exercise_name: "Curl de Piernas",
                        exercise_name_alt: ["Leg Curl"],
                        sets: 4,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Isquiotibiales"
                    },
                    {
                        exercise_name: "Elevación de Gemelos",
                        exercise_name_alt: ["Calf Raise"],
                        sets: 5,
                        reps: 20,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Gemelos"
                    },
                    {
                        exercise_name: "Empuje de Cadera",
                        exercise_name_alt: ["Hip Thrust"],
                        sets: 4,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 6,
                        notes: "Glúteos"
                    }
                ]
            },
            {
                day_of_week: 5, // Viernes - Brazos
                dayName: "Viernes - Brazos",
                exercises: [
                    {
                        exercise_name: "Curl de Bíceps con Barra",
                        exercise_name_alt: ["Barbell Curl"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Ejercicio principal de bíceps"
                    },
                    {
                        exercise_name: "Curl de Bíceps con Mancuernas",
                        exercise_name_alt: ["Dumbbell Curl"],
                        sets: 4,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Alternar brazos"
                    },
                    {
                        exercise_name: "Martillo",
                        exercise_name_alt: ["Hammer Curl"],
                        sets: 3,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Braquial anterior"
                    },
                    {
                        exercise_name: "Fondos",
                        exercise_name_alt: ["Dips"],
                        sets: 4,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Tríceps principal"
                    },
                    {
                        exercise_name: "Press Francés",
                        exercise_name_alt: ["French Press"],
                        sets: 4,
                        reps: 12,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 5,
                        notes: "Tríceps aislado"
                    },
                    {
                        exercise_name: "Extensiones de Tríceps con Cable",
                        exercise_name_alt: ["Tricep Pushdown"],
                        sets: 3,
                        reps: 15,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 6,
                        notes: "Bomba final"
                    }
                ]
            }
        ],
        notes: "Un grupo muscular por día permite máximo volumen y recuperación. Progresar aumentando peso o repeticiones. Mantener buena forma en todos los ejercicios. Descansar 2 días antes de repetir el mismo grupo."
    },

    // =================================================================
    // RUTINA 10: Fuerza para Principiantes (3 días/semana)
    // =================================================================
    {
        name: "Rutina de Fuerza para Principiantes",
        description: "Rutina de 3 días enfocada en desarrollar fuerza fundamental y técnica correcta. Ideal para principiantes que quieren construir una base sólida antes de avanzar a rutinas más complejas. Enfoque en ejercicios compuestos y progresión gradual.",
        trainingType: "strength",
        level: "beginner",
        frequency: 3,
        equipment: ["barbell", "dumbbells", "bench", "bodyweight"],
        tags: ["beginner", "strength", "3_days", "foundation"],
        exercises: [
            {
                day_of_week: 1, // Lunes
                dayName: "Lunes",
                exercises: [
                    {
                        exercise_name: "Sentadilla",
                        exercise_name_alt: ["Squat"],
                        sets: 3,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Empezar con peso corporal, luego agregar peso gradualmente"
                    },
                    {
                        exercise_name: "Press de Banca",
                        exercise_name_alt: ["Bench Press"],
                        sets: 3,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Técnica correcta es prioridad"
                    },
                    {
                        exercise_name: "Remo con Barra",
                        exercise_name_alt: ["Barbell Row"],
                        sets: 3,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Mantener espalda recta"
                    },
                    {
                        exercise_name: "Plancha",
                        exercise_name_alt: ["Plank"],
                        sets: 3,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 30,
                        order_index: 4,
                        notes: "Mantener 30 segundos, descansar 30"
                    }
                ]
            },
            {
                day_of_week: 3, // Miércoles
                dayName: "Miércoles",
                exercises: [
                    {
                        exercise_name: "Sentadilla",
                        exercise_name_alt: ["Squat"],
                        sets: 3,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Intentar aumentar peso ligeramente"
                    },
                    {
                        exercise_name: "Press Militar",
                        exercise_name_alt: ["Overhead Press"],
                        sets: 3,
                        reps: 8,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Core fuerte"
                    },
                    {
                        exercise_name: "Dominada",
                        exercise_name_alt: ["Pull Up"],
                        sets: 3,
                        reps: 5,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Usar asistencia si es necesario"
                    },
                    {
                        exercise_name: "Peso Muerto",
                        exercise_name_alt: ["Deadlift"],
                        sets: 3,
                        reps: 5,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "Técnica perfecta antes de aumentar peso"
                    }
                ]
            },
            {
                day_of_week: 5, // Viernes
                dayName: "Viernes",
                exercises: [
                    {
                        exercise_name: "Sentadilla",
                        exercise_name_alt: ["Squat"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 1,
                        notes: "Más repeticiones esta sesión"
                    },
                    {
                        exercise_name: "Press de Banca",
                        exercise_name_alt: ["Bench Press"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 2,
                        notes: "Más repeticiones"
                    },
                    {
                        exercise_name: "Remo con Barra",
                        exercise_name_alt: ["Barbell Row"],
                        sets: 3,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 3,
                        notes: "Más repeticiones"
                    },
                    {
                        exercise_name: "Zancada",
                        exercise_name_alt: ["Lunges"],
                        sets: 2,
                        reps: 10,
                        weight_kg: 0,
                        duration_minutes: null,
                        order_index: 4,
                        notes: "5 por pierna"
                    },
                    {
                        exercise_name: "Plancha",
                        exercise_name_alt: ["Plank"],
                        sets: 3,
                        reps: null,
                        weight_kg: 0,
                        duration_minutes: 45,
                        order_index: 5,
                        notes: "Progresar a 45 segundos"
                    }
                ]
            }
        ],
        notes: "Enfocarse en aprender la técnica correcta de cada ejercicio. Progresar gradualmente: primero aumentar repeticiones, luego peso. Descansar 48 horas entre sesiones. No tener prisa, la consistencia es clave."
    }
];

