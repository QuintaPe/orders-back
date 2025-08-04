import express from 'express';
import { registerUser, loginUser, logoutUser, getProfile, listUsers } from '../controllers/userController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { validateRequiredFields } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register',
    validateRequiredFields(['username', 'password', 'name']),
    registerUser
);

router.post('/login',
    validateRequiredFields(['username', 'password']),
    loginUser
);

router.post('/logout', logoutUser);

// Protected routes
router.get('/profile', verifyToken, getProfile);
router.get('/', verifyToken, requireRole(['admin', 'manager']), listUsers);

export default router; 