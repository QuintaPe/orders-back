import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import waiterRoutes from './routes/waiterRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { initializeWebSocket } from './websocket.js';

const app = express();
const server = http.createServer(app);

// Inicializar WebSocket
initializeWebSocket(server);

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true // Importante para cookies
}));
app.use(express.json());
app.use(cookieParser());

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Bar QR Backend API',
        version: '1.0.0',
        websocket: 'Available'
    });
});

// Public routes (no authentication required)
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Protected routes with role-based access
app.use('/api/admin', adminRoutes);
app.use('/api/waiter', waiterRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`WebSocket server ready for connections`);
    console.log(`Health check available at /health`);
});
