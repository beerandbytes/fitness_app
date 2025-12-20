// /routes/exercises.js

const express = require('express');
const router = express.Router();
// Reusa el middleware de seguridad para todas las rutas
const authenticateToken = require('./authMiddleware');

const { db } = require('../db/db_config'); // Conexión a DB
const { exercises, users } = require('../db/schema'); // Tablas a usar
const { eq, ilike, asc, sql, or, count, and, isNotNull, inArray } = require('drizzle-orm');
const logger = require('../utils/logger');
const { getOrSetCache, invalidateCache, invalidateCachePattern } = require('../utils/cache');
const { generalLimiter } = require('../middleware/rateLimiter');
const { routeValidations, handleValidationErrors, commonValidations } = require('../middleware/validation');
const asyncHandler = require('../middleware/asyncHandler');

// --- 1. POST /api/exercises ---
// Crear un nuevo ejercicio en el catálogo.
// Se asume que los ejercicios creados por el usuario no son "públicos" por defecto
// a menos que se implemente una lógica más compleja de aprobación. Aquí lo guardamos como público.
router.post('/',
    authenticateToken,
    routeValidations.createExercise,
    handleValidationErrors,
    asyncHandler(async (req, res) => {
        // Solo necesitamos el user_id para autenticar que es un usuario válido
        const user_id = req.user.id;
        const {
            name,
            name_es,
            category,
            default_calories_per_minute,
            gif_url,
            video_url,
            description,
            image_base64,
            video_base64
        } = req.body;

        if (!name || !category) {
            return res.status(400).json({ error: 'El nombre y la categoría del ejercicio son obligatorios.' });
        }

        try {
            // Determinar URLs de media: priorizar base64 si está presente, sino usar URLs proporcionadas
            let finalGifUrl = null;
            let finalVideoUrl = null;

            // Si hay image_base64, usarlo como gif_url
            if (image_base64 && image_base64.trim() !== '') {
                finalGifUrl = image_base64;
            } else if (gif_url && gif_url.trim() !== '') {
                finalGifUrl = gif_url;
            }

            // Si hay video_base64, usarlo como video_url
            if (video_base64 && video_base64.trim() !== '') {
                finalVideoUrl = video_base64;
            } else if (video_url && video_url.trim() !== '') {
                finalVideoUrl = video_url;
            }

            // 1. Insertar el nuevo ejercicio.
            const newExercise = await db.insert(exercises).values({
                name: name,
                name_es: name_es || name, // Si no se proporciona name_es, usar el mismo nombre
                category: category,
                default_calories_per_minute: default_calories_per_minute || 5, // Usar un valor por defecto si no se proporciona
                gif_url: finalGifUrl,
                video_url: finalVideoUrl,
                description: (description && description.trim() !== '') ? description : null,
                is_public: true, // Asumimos que todos los creados por el usuario son públicos en este contexto simple
            }).returning(); // Devolver el ejercicio completo

            // Invalidar cache de ejercicios (todas las páginas y búsquedas)
            invalidateCachePattern('exercises:public:*');

            logger.info(`Ejercicio creado exitosamente: ${name} por usuario ${user_id}`);

            // 2. Respuesta de éxito
            return res.status(201).json({
                message: 'Ejercicio creado y añadido al catálogo.',
                exercise: newExercise[0]
            });
        } catch (error) {
            // Manejar error de duplicado (código 23505 es unique constraint violation en PostgreSQL)
            if (error.code === '23505') {
                logger.warn(`Intento de crear ejercicio duplicado: ${name}`);
                return res.status(409).json({
                    error: 'Ya existe un ejercicio con ese nombre.'
                });
            }

            // Re-lanzar otros errores para que el errorHandler los maneje
            throw error;
        }
    })
);


// --- 2. GET /api/exercises ---
// Listar todos los ejercicios disponibles (públicos) con paginación y cache.
router.get('/',
    authenticateToken,
    generalLimiter,
    commonValidations.pagination,
    handleValidationErrors,
    async (req, res) => {
        // El user_id solo se usa para autenticar, no para filtrar ejercicios
        // ya que estamos listando los "públicos"

        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            logger.info(`Fetching exercises: page=${page}, limit=${limit}, offset=${offset}`);

            // Cache key basado en página y límite
            const cacheKey = `exercises:public:page:${page}:limit:${limit}`;

            // Obtener o establecer cache
            const result = await getOrSetCache(cacheKey, async () => {
                // Consultar ejercicios con paginación
                const allExercises = await db.select()
                    .from(exercises)
                    .where(eq(exercises.is_public, true))
                    .orderBy(asc(exercises.name))
                    .limit(limit)
                    .offset(offset);

                // Obtener total de ejercicios
                const totalResult = await db.select({
                    count: sql`count(*)`.as('count')
                })
                    .from(exercises)
                    .where(eq(exercises.is_public, true));

                const total = parseInt(totalResult[0].count);

                return {
                    exercises: allExercises,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit),
                        hasNext: page < Math.ceil(total / limit),
                        hasPrev: page > 1
                    }
                };
            }, 300); // Cache por 5 minutos

            return res.status(200).json({
                message: 'Catálogo de ejercicios cargado con éxito.',
                ...result
            });

        } catch (error) {
            logger.error('Error al obtener ejercicios:', { error: error.message, stack: error.stack });
            return res.status(500).json({ error: 'Error interno del servidor al obtener el catálogo.' });
        }
    }
);

// --- 3. GET /api/exercises/search?name=... ---
// Buscar ejercicios por nombre (autocompletar) en la base de datos local.
// Busca tanto en el campo 'name' como en 'name_es' para encontrar ejercicios en ambos idiomas.
router.get('/search', authenticateToken, async (req, res) => {
    const { name } = req.query;

    if (!name || name.length < 2) {
        return res.status(400).json({ error: 'El nombre de búsqueda debe tener al menos 2 caracteres.' });
    }

    try {
        const searchTerm = `%${name.trim()}%`;

        // Buscar en la base de datos local - solo ejercicios públicos
        // Buscar tanto en 'name' como en 'name_es' usando OR
        const localResults = await db.select()
            .from(exercises)
            .where(and(
                or(
                    ilike(exercises.name, searchTerm),
                    and(
                        isNotNull(exercises.name_es),
                        ilike(exercises.name_es, searchTerm)
                    )
                ),
                eq(exercises.is_public, true)
            ))
            .orderBy(asc(exercises.name))
            .limit(20);

        return res.status(200).json({
            exercises: localResults.map(ex => ({ ...ex, source: 'local' })),
            count: localResults.length,
        });

    } catch (error) {
        logger.error('Error al buscar ejercicios:', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// --- 4. GET /api/exercises/gif?name=... ---
// Obtener GIF/imagen de un ejercicio desde la base de datos local
// Nota: Endpoint público, no requiere autenticación ya que solo obtiene información de ejercicios públicos
router.get('/gif', async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: 'El nombre del ejercicio es requerido.' });
    }

    try {
        const searchTerm = name.trim();
        // Buscar tanto en 'name' como en 'name_es' (manejando NULL)
        const localExercise = await db.select()
            .from(exercises)
            .where(or(
                ilike(exercises.name, searchTerm),
                and(
                    isNotNull(exercises.name_es),
                    ilike(exercises.name_es, searchTerm)
                )
            ))
            .limit(1);

        // Si tenemos el ejercicio en la base de datos local
        if (localExercise.length > 0) {
            // Si ya tiene GIF URL o video URL, devolverlos directamente
            if (localExercise[0].gif_url || localExercise[0].video_url) {
                return res.status(200).json({
                    gif_url: localExercise[0].gif_url || null,
                    video_url: localExercise[0].video_url || null,
                    source: 'database'
                });
            }
        }

        // Si no se encuentra imagen local, retornar placeholder
        return res.status(200).json({
            gif_url: 'https://via.placeholder.com/300x200/4a5568/ffffff?text=Exercise+Demonstration',
            video_url: null,
            source: 'placeholder',
            message: 'Imagen no encontrada localmente, mostrando placeholder'
        });

    } catch (error) {
        logger.error('Error al obtener GIF del ejercicio:', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// --- 5. GET /api/exercises/by-ids?ids=1,2,3 ---
// Obtener ejercicios por sus IDs (útil para cargar detalles de ejercicios en plantillas y rutinas)
router.get('/by-ids', authenticateToken, async (req, res) => {
    const { ids } = req.query;

    if (!ids) {
        return res.status(400).json({ error: 'Los IDs de ejercicios son requeridos. Formato: ids=1,2,3' });
    }

    try {
        // Parsear los IDs desde la query string (formato: ids=1,2,3)
        const exerciseIds = ids.split(',')
            .map(id => parseInt(id.trim()))
            .filter(id => !isNaN(id) && id > 0);

        if (exerciseIds.length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron IDs válidos.' });
        }

        // Limitar a 100 ejercicios por request para evitar queries muy grandes
        if (exerciseIds.length > 100) {
            return res.status(400).json({ error: 'Máximo 100 ejercicios por request.' });
        }

        // Obtener los ejercicios por sus IDs
        const foundExercises = await db.select()
            .from(exercises)
            .where(inArray(exercises.exercise_id, exerciseIds))
            .orderBy(asc(exercises.name));

        return res.status(200).json({
            message: 'Ejercicios obtenidos exitosamente.',
            exercises: foundExercises,
            count: foundExercises.length
        });

    } catch (error) {
        logger.error('Error al obtener ejercicios por IDs:', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// --- 6. GET /api/exercises/by-muscle-group?group=... ---
// Obtener ejercicios filtrados por grupo muscular (pecho, pierna, espalda, brazos, hombros)
router.get('/by-muscle-group', authenticateToken, async (req, res) => {
    const { group } = req.query;

    if (!group) {
        return res.status(400).json({ error: 'El grupo muscular es requerido. Valores válidos: pecho, pierna, espalda, brazos, hombros' });
    }

    const validGroups = ['pecho', 'pierna', 'piernas', 'espalda', 'brazos', 'brazo', 'hombros', 'hombro'];
    const normalizedGroup = group.toLowerCase();

    if (!validGroups.includes(normalizedGroup)) {
        return res.status(400).json({
            error: 'Grupo muscular no válido. Valores válidos: pecho, pierna, espalda, brazos, hombros'
        });
    }

    try {
        // Buscar en la base de datos local primero
        // Para esto, necesitamos buscar por nombre que contenga palabras clave del grupo muscular
        const muscleGroupKeywords = {
            'pecho': ['pecho', 'chest', 'press banca', 'press pecho', 'pectoral', 'push up', 'push-up', 'push', 'bench press', 'bench', 'fly', 'apertura', 'dip', 'fondos', 'flexión', 'pullover'],
            'pierna': ['pierna', 'leg', 'squat', 'sentadilla', 'prensa', 'extensión', 'lunge', 'zancada', 'calf', 'gemelo', 'glute', 'glúteo', 'hip thrust', 'empuje cadera'],
            'piernas': ['pierna', 'leg', 'squat', 'sentadilla', 'prensa', 'extensión', 'lunge', 'zancada', 'calf', 'gemelo', 'glute', 'glúteo', 'hip thrust', 'empuje cadera'],
            'espalda': ['espalda', 'back', 'remo', 'pull', 'jalón', 'dominada', 'row', 'lat pulldown', 'pulldown', 'chin up', 'pull up', 'hiperextensión', 'good morning'],
            'brazos': ['brazo', 'arm', 'curl', 'tríceps', 'bíceps', 'press', 'extension', 'extensión', 'dip', 'fondos', 'kickback', 'skull crusher', 'french press'],
            'brazo': ['brazo', 'arm', 'curl', 'tríceps', 'bíceps', 'press', 'extension', 'extensión', 'dip', 'fondos', 'kickback', 'skull crusher', 'french press'],
            'hombros': ['hombro', 'shoulder', 'press militar', 'elevación', 'lateral', 'overhead press', 'military press', 'arnold press', 'raise', 'fly', 'vuelo', 'upright row', 'remo vertical', 'shrug', 'encogimiento'],
            'hombro': ['hombro', 'shoulder', 'press militar', 'elevación', 'lateral', 'overhead press', 'military press', 'arnold press', 'raise', 'fly', 'vuelo', 'upright row', 'remo vertical', 'shrug', 'encogimiento']
        };

        const keywords = muscleGroupKeywords[normalizedGroup] || [];
        let localResults = [];

        // Buscar ejercicios locales que coincidan con las palabras clave y sean públicos
        // Buscar tanto en 'name' como en 'name_es'
        if (keywords.length > 0) {
            const searchConditions = [];
            keywords.forEach(keyword => {
                const keywordPattern = `%${keyword}%`;
                searchConditions.push(ilike(exercises.name, keywordPattern));
                // Solo buscar en name_es si no es NULL
                searchConditions.push(
                    and(
                        isNotNull(exercises.name_es),
                        ilike(exercises.name_es, keywordPattern)
                    )
                );
            });

            // Usar OR para buscar cualquier palabra clave Y filtrar por is_public = true
            localResults = await db.select()
                .from(exercises)
                .where(and(
                    or(...searchConditions),
                    eq(exercises.is_public, true)
                ))
                .orderBy(asc(exercises.name))
                .limit(100);
        }

        return res.status(200).json({
            exercises: localResults.map(ex => ({ ...ex, source: 'local', muscle_group: normalizedGroup })),
            count: localResults.length,
            muscle_group: normalizedGroup
        });

    } catch (error) {
        logger.error('Error al obtener ejercicios por grupo muscular:', { error: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
});



module.exports = router;