const { query } = require('../config/database');

class Product {
  /**
   * Get all products
   */
  static async getAll(activeOnly = false) {
    const sql = activeOnly
      ? `SELECT p.*, m.name as meal_name, m.pieces_per_batch
         FROM products p
         JOIN meals m ON p.meal_id = m.id
         WHERE p.active = true
         ORDER BY p.name`
      : `SELECT p.*, m.name as meal_name, m.pieces_per_batch
         FROM products p
         JOIN meals m ON p.meal_id = m.id
         ORDER BY p.name`;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get product by ID
   */
  static async getById(id) {
    const result = await query(
      `SELECT p.*, m.name as meal_name, m.code as meal_code,
              m.trolleys_per_batch, m.pieces_per_trolley, m.pieces_per_batch
       FROM products p
       JOIN meals m ON p.meal_id = m.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get product by SKU
   */
  static async getBySku(sku) {
    const result = await query(
      `SELECT p.*, m.name as meal_name, m.pieces_per_batch
       FROM products p
       JOIN meals m ON p.meal_id = m.id
       WHERE p.sku = $1`,
      [sku]
    );
    return result.rows[0];
  }

  /**
   * Get products by meal
   */
  static async getByMeal(mealId) {
    const result = await query(
      `SELECT p.*, m.name as meal_name, m.pieces_per_batch
       FROM products p
       JOIN meals m ON p.meal_id = m.id
       WHERE p.meal_id = $1 AND p.active = true
       ORDER BY p.name`,
      [mealId]
    );
    return result.rows;
  }

  /**
   * Create new product
   */
  static async create(productData) {
    const { name, sku, description, meal_id, unit_price } = productData;
    const result = await query(
      `INSERT INTO products (name, sku, description, meal_id, unit_price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, sku, description, meal_id, unit_price]
    );
    return result.rows[0];
  }

  /**
   * Update product
   */
  static async update(id, productData) {
    const { name, sku, description, meal_id, unit_price, active } = productData;
    const result = await query(
      `UPDATE products
       SET name = COALESCE($1, name),
           sku = COALESCE($2, sku),
           description = COALESCE($3, description),
           meal_id = COALESCE($4, meal_id),
           unit_price = COALESCE($5, unit_price),
           active = COALESCE($6, active)
       WHERE id = $7
       RETURNING *`,
      [name, sku, description, meal_id, unit_price, active, id]
    );
    return result.rows[0];
  }

  /**
   * Delete product (soft delete)
   */
  static async delete(id) {
    const result = await query(
      'UPDATE products SET active = false WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get product with production statistics
   */
  static async getWithStats(id, startDate, endDate) {
    const result = await query(
      `SELECT p.*,
              m.name as meal_name, m.pieces_per_batch,
              COALESCE(SUM(boi.pieces_requested), 0) as total_requested,
              COALESCE(SUM(boi.pieces_delivered), 0) as total_delivered,
              COUNT(DISTINCT bo.id) as order_count
       FROM products p
       JOIN meals m ON p.meal_id = m.id
       LEFT JOIN branch_order_items boi ON p.id = boi.product_id
       LEFT JOIN branch_orders bo ON boi.branch_order_id = bo.id
         AND bo.order_date BETWEEN $2 AND $3
       WHERE p.id = $1
       GROUP BY p.id, m.id`,
      [id, startDate, endDate]
    );
    return result.rows[0];
  }
}

module.exports = Product;
