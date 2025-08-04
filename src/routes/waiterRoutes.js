import express from 'express';
import { listOrders } from '../controllers/orderController.js';
import { updateOrderStatus } from '../controllers/userController.js';
import { listCategories } from '../controllers/categoryController.js';
import { listProducts } from '../controllers/productController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireWaiterOrManager } from '../middleware/roleMiddleware.js';
import { validateRequiredFields } from '../middleware/validation.js';

const router = express.Router();

// Aplicar middleware de autenticación y autorización a todas las rutas
router.use(verifyToken);
router.use(requireWaiterOrManager);

// Ver pedidos
router.get('/orders', listOrders);

// Actualizar estado de pedidos
router.patch('/orders/:orderId/status',
    validateRequiredFields(['status']),
    updateOrderStatus
);

// Ver categorías (solo lectura)
router.get('/categories', listCategories);

// Ver productos (solo lectura)
router.get('/products', listProducts);

export default router; 