import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { emitOrderEvent, emitToTable, emitToKitchen, emitToWaiters, emitToAdmin, orderEvents } from '../websocket.js';

export const createOrder = asyncHandler(async (req, res) => {
    const { table_number, products } = req.body;

    if (!table_number || !products?.length) {
        throw new AppError('Missing required data: table_number and products', 400);
    }

    const id = uuidv4();
    const productsJson = JSON.stringify(products);
    const createdAt = new Date().toISOString();

    await db.execute(`
      INSERT INTO orders (id, table_number, products, status, created_at)
      VALUES (?, ?, ?, 'pending', ?)
    `, [id, table_number, productsJson, createdAt]);

    const order = { id, table_number, products, status: 'pending', created_at: createdAt };

    // Emitir eventos WebSocket
    emitOrderEvent(orderEvents.ORDER_CREATED, order);
    emitToTable(table_number, orderEvents.ORDER_CREATED, order);
    emitToKitchen(orderEvents.ORDER_CREATED, order);
    emitToWaiters(orderEvents.ORDER_CREATED, order);
    emitToAdmin(orderEvents.ORDER_CREATED, order);

    res.status(201).json(order);
});

export const listOrders = asyncHandler(async (req, res) => {
    const result = await db.execute('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = result.rows.map(order => ({
        ...order,
        products: JSON.parse(order.products)
    }));

    res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
        throw new AppError('Status is required', 400);
    }

    // Validar que el status sea válido
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        throw new AppError('Invalid status', 400);
    }

    // Check if order exists
    const orderResult = await db.execute(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
    );

    if (orderResult.rows.length === 0) {
        throw new AppError('Order not found', 404);
    }

    const oldOrder = {
        ...orderResult.rows[0],
        products: JSON.parse(orderResult.rows[0].products)
    };

    // Update order status
    await db.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId]
    );

    // Get updated order
    const updatedOrderResult = await db.execute(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
    );

    const updatedOrder = {
        ...updatedOrderResult.rows[0],
        products: JSON.parse(updatedOrderResult.rows[0].products)
    };

    // Emitir eventos WebSocket
    emitOrderEvent(orderEvents.ORDER_STATUS_CHANGED, {
        order: updatedOrder,
        previousStatus: oldOrder.status,
        newStatus: status
    });

    emitToTable(updatedOrder.table_number, orderEvents.ORDER_STATUS_CHANGED, {
        order: updatedOrder,
        previousStatus: oldOrder.status,
        newStatus: status
    });

    // Emitir eventos específicos según el nuevo status
    if (status === 'preparing') {
        emitToKitchen(orderEvents.ORDER_UPDATED, updatedOrder);
    } else if (status === 'ready') {
        emitToWaiters(orderEvents.ORDER_UPDATED, updatedOrder);
    } else if (status === 'delivered') {
        emitToTable(updatedOrder.table_number, orderEvents.ORDER_COMPLETED, updatedOrder);
    } else if (status === 'cancelled') {
        emitOrderEvent(orderEvents.ORDER_CANCELLED, updatedOrder);
    }

    res.json(updatedOrder);
});

export const deleteOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    // Check if order exists
    const orderResult = await db.execute(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
    );

    if (orderResult.rows.length === 0) {
        throw new AppError('Order not found', 404);
    }

    const order = {
        ...orderResult.rows[0],
        products: JSON.parse(orderResult.rows[0].products)
    };

    // Delete order
    await db.execute('DELETE FROM orders WHERE id = ?', [orderId]);

    // Emitir evento de eliminación
    emitOrderEvent(orderEvents.ORDER_CANCELLED, order);
    emitToTable(order.table_number, orderEvents.ORDER_CANCELLED, order);
    emitToKitchen(orderEvents.ORDER_CANCELLED, order);
    emitToWaiters(orderEvents.ORDER_CANCELLED, order);
    emitToAdmin(orderEvents.ORDER_CANCELLED, order);

    res.json({ message: 'Order deleted successfully' });
});

export const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const result = await db.execute(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
    );

    if (result.rows.length === 0) {
        throw new AppError('Order not found', 404);
    }

    const order = {
        ...result.rows[0],
        products: JSON.parse(result.rows[0].products)
    };

    res.json(order);
});

export const getOrdersByTable = asyncHandler(async (req, res) => {
    const { tableNumber } = req.params;

    const result = await db.execute(
        'SELECT * FROM orders WHERE table_number = ? ORDER BY created_at DESC',
        [tableNumber]
    );

    const orders = result.rows.map(order => ({
        ...order,
        products: JSON.parse(order.products)
    }));

    res.json(orders);
});
