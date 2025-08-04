import { AppError } from './errorHandler.js';

// Middleware para verificar si el usuario es admin
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return next(new AppError('User not authenticated.', 401));
    }

    if (req.user.role !== 'admin') {
        return next(new AppError('Admin access required.', 403));
    }

    next();
};

// Middleware para verificar si el usuario es waiter
export const requireWaiter = (req, res, next) => {
    if (!req.user) {
        return next(new AppError('User not authenticated.', 401));
    }

    if (req.user.role !== 'waiter') {
        return next(new AppError('Waiter access required.', 403));
    }

    next();
};

// Middleware para verificar si el usuario es manager
export const requireManager = (req, res, next) => {
    if (!req.user) {
        return next(new AppError('User not authenticated.', 401));
    }

    if (req.user.role !== 'manager') {
        return next(new AppError('Manager access required.', 403));
    }

    next();
};

// Middleware para verificar si el usuario es waiter o manager
export const requireWaiterOrManager = (req, res, next) => {
    if (!req.user) {
        return next(new AppError('User not authenticated.', 401));
    }

    if (!['waiter', 'manager'].includes(req.user.role)) {
        return next(new AppError('Waiter or manager access required.', 403));
    }

    next();
};

// Middleware para verificar si el usuario es admin o manager
export const requireAdminOrManager = (req, res, next) => {
    if (!req.user) {
        return next(new AppError('User not authenticated.', 401));
    }

    if (!['admin', 'manager'].includes(req.user.role)) {
        return next(new AppError('Admin or manager access required.', 403));
    }

    next();
}; 