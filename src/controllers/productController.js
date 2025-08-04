import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export const listProducts = asyncHandler(async (req, res) => {
  const result = await db.execute(`
        SELECT p.id, p.name, p.price, p.category_id, c.name AS category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        ORDER BY p.name
    `);

  res.json(result.rows);
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
  res.json(result.rows[0]);
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, price, category_id } = req.body;

  if (!name || !price || !category_id) {
    throw new AppError('Missing required fields: name, price, category_id', 400);
  }

  // Check if category exists
  const categoryResult = await db.execute(
    'SELECT id FROM categories WHERE id = ?',
    [category_id]
  );

  if (categoryResult.rows.length === 0) {
    throw new AppError('Category not found', 400);
  }

  const id = uuidv4();

  await db.execute(`
        INSERT INTO products (id, name, price, category_id)
        VALUES (?, ?, ?, ?)
    `, [id, name, price, category_id]);

  res.status(201).json({ id, name, price, category_id });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { name, price, category_id } = req.body;

  if (!name || !price || !category_id) {
    throw new AppError('Missing required fields: name, price, category_id', 400);
  }

  // Check if product exists
  const productResult = await db.execute(
    'SELECT id FROM products WHERE id = ?',
    [productId]
  );

  if (productResult.rows.length === 0) {
    throw new AppError('Product not found', 404);
  }

  // Check if category exists
  const categoryResult = await db.execute(
    'SELECT id FROM categories WHERE id = ?',
    [category_id]
  );

  if (categoryResult.rows.length === 0) {
    throw new AppError('Category not found', 400);
  }

  // Update product
  await db.execute(
    'UPDATE products SET name = ?, price = ?, category_id = ? WHERE id = ?',
    [name, price, category_id, productId]
  );

  res.json({ id: productId, name, price, category_id });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Check if product exists
  const productResult = await db.execute(
    'SELECT id FROM products WHERE id = ?',
    [productId]
  );

  if (productResult.rows.length === 0) {
    throw new AppError('Product not found', 404);
  }

  // Delete product
  await db.execute('DELETE FROM products WHERE id = ?', [productId]);

  res.json({ message: 'Product deleted successfully' });
});

// Alias para compatibilidad
export const getAllProducts = listProducts;
