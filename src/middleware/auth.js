import jwt from 'jsonwebtoken';
import { asyncHandler, AppError } from './errorHandler.js';
import db from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (userId, username, role) => {
    return jwt.sign(
        { userId, username, role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

export const verifyToken = asyncHandler(async (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        throw new AppError('Access denied. No authentication token found.', 401);
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Verify user still exists in database
        const result = await db.execute(
            'SELECT id, username, name, role FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            // Clear invalid cookie
            res.clearCookie('authToken');
            throw new AppError('User not found.', 401);
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        // Clear invalid cookie
        res.clearCookie('authToken');

        if (error.name === 'JsonWebTokenError') {
            throw new AppError('Invalid token.', 401);
        } else if (error.name === 'TokenExpiredError') {
            throw new AppError('Token expired.', 401);
        }
        throw error;
    }
});

export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('User not authenticated.', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError('Insufficient permissions.', 403));
        }

        next();
    };
};

// Función para establecer la cookie de autenticación
export const setAuthCookie = (res, token) => {
    res.cookie('authToken', token, {
        domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
        httpOnly: true, // Previene acceso desde JavaScript
        secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
        sameSite: 'strict', // Protección CSRF
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        path: '/' // Disponible en toda la aplicación
    });
};

// Función para limpiar la cookie de autenticación
export const clearAuthCookie = (res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
}; 