// Este middleware verifica el token JWT y protege las rutas privadas.
// CORREGIDO: Usa async/await para mejor manejo de errores y validaciones de seguridad

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { db } = require('../db/db_config');
const { users } = require('../db/schema');
const { eq } = require('drizzle-orm');

// Asegúrate de que tu JWT_SECRET está configurado en el archivo .env
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido en el archivo .env. Es necesario para la autenticación.');
} 

/**
 * Función middleware para verificar el token JWT en cada solicitud protegida.
 * CORREGIDO: Ahora usa async/await y valida que el usuario exista en la base de datos
 */
const authenticateToken = async (req, res, next) => {
    try {
        // 1. Obtener el encabezado de autorización (Authorization: Bearer <token>)
        const authHeader = req.headers['authorization'];
        
        // Validar formato del header
        if (!authHeader || typeof authHeader !== 'string') {
            return res.status(401).json({ 
                error: 'Acceso denegado. No se proporcionó un token de autenticación.',
                statusCode: 401
            });
        }
        
        // Extraer el token de la cadena 'Bearer <token>'
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ 
                error: 'Formato de token inválido. Use: Bearer <token>',
                statusCode: 401
            });
        }
        
        const token = parts[1];
        
        // 2. Verificar si el token está presente y no está vacío
        if (!token || token.trim() === '') {
            return res.status(401).json({ 
                error: 'Acceso denegado. No se proporcionó un token de autenticación.',
                statusCode: 401
            });
        }

        // 3. Verificar el token usando la clave secreta (ahora con async/await)
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            // Log detallado del error
            const errorDetails = {
                error: err.message,
                errorName: err.name,
                ip: req.ip,
                path: req.path,
                method: req.method,
                // Solo incluir parte del token para debugging (no el token completo por seguridad)
                tokenPreview: token ? `${token.substring(0, 20)}...` : 'no token'
            };
            
            // Diferentes niveles de log según el tipo de error
            const errorMessage = err.name === 'TokenExpiredError' 
                ? `Token JWT expirado - ${err.message}`
                : err.name === 'JsonWebTokenError'
                ? `Token JWT inválido - ${err.message}`
                : `Error de verificación JWT - ${err.message}`;
            
            logger.warn(errorMessage, errorDetails);
            
            // 403 Forbidden: Token inválido o expirado
            return res.status(403).json({ 
                error: 'Token inválido o expirado.',
                statusCode: 403,
                // En desarrollo, incluir más detalles
                ...(process.env.NODE_ENV === 'development' && {
                    details: {
                        errorType: err.name,
                        message: err.message
                    }
                })
            });
        }

        // 4. Validar que el token tenga la estructura correcta
        if (!decoded || !decoded.id || !decoded.email) {
            logger.warn('Token JWT con estructura inválida', {
                ip: req.ip,
                path: req.path,
                decoded: decoded ? Object.keys(decoded) : 'null'
            });
            return res.status(403).json({ 
                error: 'Token inválido. Estructura incorrecta.',
                statusCode: 403
            });
        }

        // 5. CORREGIDO: Validar que el usuario aún exista en la base de datos
        // Esto previene que tokens de usuarios eliminados sigan siendo válidos
        try {
            const userArray = await db.select({
                user_id: users.user_id,
                email: users.email,
                role: users.role
            })
            .from(users)
            .where(eq(users.user_id, decoded.id))
            .limit(1);

            if (userArray.length === 0) {
                logger.warn('Intento de acceso con token de usuario inexistente', {
                    userId: decoded.id,
                    email: decoded.email,
                    ip: req.ip,
                    path: req.path
                });
                return res.status(403).json({ 
                    error: 'Token inválido. Usuario no encontrado.',
                    statusCode: 403
                });
            }

            const user = userArray[0];

            // 6. Validar que el email del token coincida con el de la base de datos
            // Esto previene problemas si un usuario cambió su email
            if (user.email.toLowerCase() !== decoded.email.toLowerCase()) {
                logger.warn('Token JWT con email que no coincide con la base de datos', {
                    tokenEmail: decoded.email,
                    dbEmail: user.email,
                    userId: decoded.id,
                    ip: req.ip
                });
                // No rechazamos el token, pero usamos el email de la BD para mayor seguridad
            }

            // 7. Token válido: Adjuntar la información del usuario al objeto req
            // Usamos datos de la BD en lugar de solo confiar en el token
            req.user = { 
                id: user.user_id, 
                email: user.email, // Usar email de la BD, no del token
                isAdmin: decoded.isAdmin === true || user.role === 'ADMIN',
                role: user.role || decoded.role || 'CLIENT' // Priorizar rol de la BD
            }; 
            
            // 8. Continuar con la ejecución de la ruta
            next();
        } catch (dbError) {
            logger.error('Error al validar usuario en base de datos durante autenticación', {
                error: dbError.message,
                userId: decoded.id,
                ip: req.ip,
                path: req.path
            });
            // En caso de error de BD, permitir el acceso basado en el token (fallback)
            // pero loguear el error para monitoreo
            req.user = { 
                id: decoded.id, 
                email: decoded.email, 
                isAdmin: !!decoded.isAdmin,
                role: decoded.role || (decoded.isAdmin ? 'ADMIN' : 'CLIENT')
            };
            next();
        }
    } catch (error) {
        // Manejo de errores inesperados
        logger.error('Error inesperado en authenticateToken middleware', {
            error: error.message,
            stack: error.stack,
            ip: req.ip,
            path: req.path
        });
        return res.status(500).json({ 
            error: 'Error interno del servidor durante la autenticación.',
            statusCode: 500
        });
    }
};

module.exports = authenticateToken;