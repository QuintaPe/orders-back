// Error handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details = null;

    // Handle different types of errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        details = err.message;
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    } else if (err.code === 'SQLITE_CONSTRAINT') {
        statusCode = 400;
        message = 'Database constraint violation';
        details = err.message;
    } else if (err.code === 'SQLITE_BUSY') {
        statusCode = 503;
        message = 'Database is busy, please try again';
    } else if (err.code === 'SQLITE_READONLY') {
        statusCode = 500;
        message = 'Database is read-only';
    } else if (err.message) {
        message = err.message;
    }

    // Custom error status codes
    if (err.statusCode) {
        statusCode = err.statusCode;
    }

    // Error response structure
    const errorResponse = {
        success: false,
        error: {
            message,
            statusCode,
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method
        }
    };

    // Add details if available
    if (details) {
        errorResponse.error.details = details;
    }

    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.error.stack = err.stack;
    }

    res.status(statusCode).json(errorResponse);
};

// Custom error class for application errors
export class AppError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
    }
}

// Async error wrapper to catch async errors
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// 404 handler for undefined routes
export const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
}; 