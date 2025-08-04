import db from '../db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../middleware/auth.js';

export const registerUser = asyncHandler(async (req, res) => {
    const { username, password, name, role = 'waiter' } = req.body;

    if (!username || !password || !name) {
        throw new AppError('Missing required fields: username, password, name', 400);
    }

    // Check if username already exists
    const existingUser = await db.execute(
        'SELECT id FROM users WHERE username = ?',
        [username]
    );

    if (existingUser.rows.length > 0) {
        throw new AppError('Username already exists', 400);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await db.execute(`
        INSERT INTO users (id, username, password, name, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [id, username, hashedPassword, name, role, createdAt]);

    // Generate token and set cookie
    const token = generateToken(id, username, role);
    setAuthCookie(res, token);

    res.status(201).json({
        id,
        username,
        name,
        role,
        created_at: createdAt,
        message: 'User registered successfully'
    });
});

export const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new AppError('Missing required fields: username, password', 400);
    }

    // Find user by username
    const result = await db.execute(
        'SELECT id, username, password, name, role FROM users WHERE username = ?',
        [username]
    );

    if (result.rows.length === 0) {
        throw new AppError('Invalid credentials', 401);
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
    }

    // Generate token and set cookie
    const token = generateToken(user.id, user.username, user.role);
    setAuthCookie(res, token);

    res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        message: 'Login successful'
    });
});

export const logoutUser = asyncHandler(async (req, res) => {
    clearAuthCookie(res);

    res.json({ message: 'Logout successful' });
});

export const getProfile = asyncHandler(async (req, res) => {
    res.json(req.user);
});

export const listUsers = asyncHandler(async (req, res) => {
    const result = await db.execute(
        'SELECT id, username, name, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(result.rows);
});

export const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Check if user exists
    const userResult = await db.execute(
        'SELECT id FROM users WHERE id = ?',
        [userId]
    );

    if (userResult.rows.length === 0) {
        throw new AppError('User not found', 404);
    }

    // Delete user
    await db.execute('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'User deleted successfully' });
});

export const updateUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['waiter', 'manager', 'admin'];
    if (!validRoles.includes(role)) {
        throw new AppError('Invalid role. Must be one of: waiter, manager, admin', 400);
    }

    // Check if user exists
    const userResult = await db.execute(
        'SELECT id FROM users WHERE id = ?',
        [userId]
    );

    if (userResult.rows.length === 0) {
        throw new AppError('User not found', 404);
    }

    // Update user role
    await db.execute(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, userId]
    );

    res.json({ message: 'User role updated successfully' });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
        throw new AppError('Status is required', 400);
    }

    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        throw new AppError('Invalid status. Must be one of: pending, preparing, ready, delivered, cancelled', 400);
    }

    const result = await db.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId]
    );

    if (result.rowsAffected === 0) {
        throw new AppError('Order not found', 404);
    }

    res.json({ message: 'Order status updated successfully' });
}); 