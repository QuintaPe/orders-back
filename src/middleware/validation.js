import { AppError } from './errorHandler.js';

// Validation middleware for common patterns
export const validateRequiredFields = (fields) => {
    return (req, res, next) => {
        const missingFields = [];

        fields.forEach(field => {
            if (!req.body[field] && req.body[field] !== 0) {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            return next(new AppError(
                `Missing required fields: ${missingFields.join(', ')}`,
                400,
                { missingFields }
            ));
        }

        next();
    };
};

// Validate numeric fields
export const validateNumericField = (fieldName) => {
    return (req, res, next) => {
        const value = req.body[fieldName];

        if (value !== undefined && (isNaN(value) || value < 0)) {
            return next(new AppError(
                `${fieldName} must be a positive number`,
                400,
                { field: fieldName, value }
            ));
        }

        next();
    };
};

// Validate array fields
export const validateArrayField = (fieldName, minLength = 1) => {
    return (req, res, next) => {
        const value = req.body[fieldName];

        if (!Array.isArray(value) || value.length < minLength) {
            return next(new AppError(
                `${fieldName} must be an array with at least ${minLength} item(s)`,
                400,
                { field: fieldName, value }
            ));
        }

        next();
    };
};

// Validate string length
export const validateStringLength = (fieldName, minLength = 1, maxLength = 255) => {
    return (req, res, next) => {
        const value = req.body[fieldName];

        if (value !== undefined) {
            if (typeof value !== 'string') {
                return next(new AppError(
                    `${fieldName} must be a string`,
                    400,
                    { field: fieldName, value }
                ));
            }

            if (value.length < minLength || value.length > maxLength) {
                return next(new AppError(
                    `${fieldName} must be between ${minLength} and ${maxLength} characters`,
                    400,
                    { field: fieldName, length: value.length, minLength, maxLength }
                ));
            }
        }

        next();
    };
};

// Validate UUID format
export const validateUUID = (fieldName) => {
    return (req, res, next) => {
        const value = req.params[fieldName] || req.body[fieldName];
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (value && !uuidRegex.test(value)) {
            return next(new AppError(
                `${fieldName} must be a valid UUID`,
                400,
                { field: fieldName, value }
            ));
        }

        next();
    };
}; 