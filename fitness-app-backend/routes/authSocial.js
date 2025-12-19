const express = require('express');
const router = express.Router();
const { db } = require('../db/db_config');
const schema = require('../db/schema');
const { users } = schema;
const { eq } = require('drizzle-orm');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { authLimiter } = require('../middleware/rateLimiter');
const asyncHandler = require('../middleware/asyncHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * POST /api/auth/social/google
 * Autenticación con Google OAuth
 */
router.post('/google',
    authLimiter,
    asyncHandler(async (req, res) => {
        const { idToken, email, name, picture } = req.body;

        if (!idToken || !email) {
            return res.status(400).json({ error: 'idToken y email son requeridos' });
        }

        try {
            // Verificar si el usuario ya existe
            const existingUsers = await db.select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            let user;
            if (existingUsers.length > 0) {
                user = existingUsers[0];
            } else {
                // Crear nuevo usuario
                const newUser = await db.insert(users).values({
                    email: email,
                    name: name || email.split('@')[0],
                    password_hash: null, // Sin contraseña para usuarios sociales
                    role: 'CLIENT',
                    profile_picture_url: picture || null,
                    is_verified: true, // Verificado por Google
                }).returning();

                user = newUser[0];
            }

            // Generar JWT
            const token = jwt.sign(
                { id: user.user_id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(200).json({
                message: 'Autenticación exitosa',
                token,
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    profile_picture_url: user.profile_picture_url,
                },
            });
        } catch (error) {
            logger.error('Error en autenticación social Google:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    })
);

/**
 * POST /api/auth/social/facebook
 * Autenticación con Facebook OAuth
 */
router.post('/facebook',
    authLimiter,
    asyncHandler(async (req, res) => {
        const { accessToken, email, name, picture } = req.body;

        if (!accessToken || !email) {
            return res.status(400).json({ error: 'accessToken y email son requeridos' });
        }

        try {
            // Verificar si el usuario ya existe
            const existingUsers = await db.select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);

            let user;
            if (existingUsers.length > 0) {
                user = existingUsers[0];
            } else {
                // Crear nuevo usuario
                const newUser = await db.insert(users).values({
                    email: email,
                    name: name || email.split('@')[0],
                    password_hash: null,
                    role: 'CLIENT',
                    profile_picture_url: picture?.data?.url || null,
                    is_verified: true,
                }).returning();

                user = newUser[0];
            }

            // Generar JWT
            const token = jwt.sign(
                { id: user.user_id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(200).json({
                message: 'Autenticación exitosa',
                token,
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    profile_picture_url: user.profile_picture_url,
                },
            });
        } catch (error) {
            logger.error('Error en autenticación social Facebook:', error);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
    })
);

module.exports = router;

