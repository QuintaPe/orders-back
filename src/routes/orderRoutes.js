import express from 'express';
import {
    createOrder,
    listOrders,
    updateOrderStatus,
    deleteOrder,
    getOrderById,
    getOrdersByTable
} from '../controllers/orderController.js';
import { validateRequiredFields, validateArrayField, validateNumericField } from '../middleware/validation.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public route for creating orders (from QR codes)
router.post('/',
    validateRequiredFields(['table_number', 'products']),
    validateNumericField('table_number'),
    validateArrayField('products', 1),
    createOrder
);

// Public route for getting orders by table (for QR code interface)
router.get('/table/:tableNumber', getOrdersByTable);

// Protected routes for waiters and admins
router.get('/', verifyToken, requireRole(['waiter', 'admin', 'manager']), listOrders);
router.get('/:orderId', verifyToken, requireRole(['waiter', 'admin', 'manager']), getOrderById);

router.patch('/:orderId/status',
    verifyToken,
    requireRole(['waiter', 'admin', 'manager']),
    validateRequiredFields(['status']),
    updateOrderStatus
);

router.delete('/:orderId',
    verifyToken,
    requireRole(['admin', 'manager']),
    deleteOrder
);

export default router;
