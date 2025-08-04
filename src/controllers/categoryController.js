import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export const listCategories = asyncHandler(async (req, res) => {
    const result = await db.execute('SELECT * FROM categories ORDER BY name');

    res.json(result.rows);
});

export const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        throw new AppError('Category name is required', 400);
    }

    const id = uuidv4();

    await db.execute(`
        INSERT INTO categories (id, name)
        VALUES (?, ?)
    `, [id, name]);

    res.status(201).json({ id, name });
});

export const updateCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!name) {
        throw new AppError('Category name is required', 400);
    }

    // Check if category exists
    const categoryResult = await db.execute(
        'SELECT id FROM categories WHERE id = ?',
        [categoryId]
    );

    if (categoryResult.rows.length === 0) {
        throw new AppError('Category not found', 404);
    }

    // Update category
    await db.execute(
        'UPDATE categories SET name = ? WHERE id = ?',
        [name, categoryId]
    );

    res.json({ id: categoryId, name });
});

export const deleteCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    // Check if category exists
    const categoryResult = await db.execute(
        'SELECT id FROM categories WHERE id = ?',
        [categoryId]
    );

    if (categoryResult.rows.length === 0) {
        throw new AppError('Category not found', 404);
    }

    // Check if category has products
    const productsResult = await db.execute(
        'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
        [categoryId]
    );

    if (productsResult.rows[0].count > 0) {
        throw new AppError('Cannot delete category with existing products', 400);
    }

    // Delete category
    await db.execute('DELETE FROM categories WHERE id = ?', [categoryId]);

    res.json({ message: 'Category deleted successfully' });
});

// Alias para compatibilidad
export const getAllCategories = listCategories;
