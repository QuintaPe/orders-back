import express from 'express';
import { listUsers, deleteUser, updateUserRole } from '../controllers/userController.js';
import { listOrders, deleteOrder } from '../controllers/orderController.js';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { listProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { verifyToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { validateRequiredFields } from '../middleware/validation.js';

const router = express.Router();

// Aplicar middleware de autenticación y autorización a todas las rutas
router.use(verifyToken);
router.use(requireAdmin);

// Gestión de usuarios
router.get('/users', listUsers);
router.delete('/users/:userId', deleteUser);
router.patch('/users/:userId/role',
    validateRequiredFields(['role']),
    updateUserRole
);

// Gestión de pedidos
router.get('/orders', listOrders);
router.delete('/orders/:orderId', deleteOrder);

// Gestión de categorías
router.get('/categories', listCategories);
router.post('/categories',
    validateRequiredFields(['name']),
    createCategory
);
router.put('/categories/:categoryId',
    validateRequiredFields(['name']),
    updateCategory
);
router.delete('/categories/:categoryId', deleteCategory);

// Gestión de productos
router.get('/products', listProducts);
router.post('/products',
    validateRequiredFields(['name', 'price', 'category_id']),
    createProduct
);
router.put('/products/:productId',
    validateRequiredFields(['name', 'price', 'category_id']),
    updateProduct
);
router.delete('/products/:productId', deleteProduct);

export default router; 