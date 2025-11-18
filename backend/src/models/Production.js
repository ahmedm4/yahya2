const { query } = require('../config/database');

class Production {
  /**
   * Get all production batches
   */
  static async getAll(filters = {}) {
    const { product_id, start_date, end_date } = filters;

    let sql = `
      SELECT pb.*,
             p.name as product_name, p.sku,
             m.name as meal_name, m.pieces_per_batch,
             u.name as created_by_name
      FROM production_batches pb
      JOIN products p ON pb.product_id = p.id
      JOIN meals m ON pb.meal_id = m.id
      LEFT JOIN users u ON pb.created_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (product_id) {
      sql += ` AND pb.product_id = $${paramCount++}`;
      params.push(product_id);
    }

    if (start_date) {
      sql += ` AND pb.production_date >= $${paramCount++}`;
      params.push(start_date);
    }

    if (end_date) {
      sql += ` AND pb.production_date <= $${paramCount++}`;
      params.push(end_date);
    }

    sql += ' ORDER BY pb.production_date DESC, p.name';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Get production batch by ID
   */
  static async getById(id) {
    const result = await query(
      `SELECT pb.*,
              p.name as product_name, p.sku,
              m.name as meal_name, m.pieces_per_batch
       FROM production_batches pb
       JOIN products p ON pb.product_id = p.id
       JOIN meals m ON pb.meal_id = m.id
       WHERE pb.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get production batches for a date
   */
  static async getByDate(productionDate) {
    const result = await query(
      `SELECT pb.*,
              p.name as product_name, p.sku,
              m.name as meal_name, m.pieces_per_batch
       FROM production_batches pb
       JOIN products p ON pb.product_id = p.id
       JOIN meals m ON pb.meal_id = m.id
       WHERE pb.production_date = $1
       ORDER BY p.name`,
      [productionDate]
    );
    return result.rows;
  }

  /**
   * Create production batch
   */
  static async create(productionData) {
    const {
      product_id, meal_id, production_date, batches_planned,
      batches_produced, pieces_planned, pieces_produced,
      notes, created_by
    } = productionData;

    const result = await query(
      `INSERT INTO production_batches (
        product_id, meal_id, production_date, batches_planned,
        batches_produced, pieces_planned, pieces_produced,
        notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [product_id, meal_id, production_date, batches_planned,
       batches_produced || 0, pieces_planned, pieces_produced || 0,
       notes, created_by]
    );
    return result.rows[0];
  }

  /**
   * Update production batch
   */
  static async update(id, productionData) {
    const { batches_produced, pieces_produced, notes } = productionData;

    const result = await query(
      `UPDATE production_batches
       SET batches_produced = COALESCE($1, batches_produced),
           pieces_produced = COALESCE($2, pieces_produced),
           notes = COALESCE($3, notes)
       WHERE id = $4
       RETURNING *`,
      [batches_produced, pieces_produced, notes, id]
    );
    return result.rows[0];
  }

  /**
   * Calculate production plan from orders
   */
  static async calculateProductionPlan(productionDate) {
    const result = await query(
      `SELECT
        p.id as product_id,
        p.name as product_name,
        p.sku,
        m.id as meal_id,
        m.name as meal_name,
        m.pieces_per_batch,
        COALESCE(SUM(boi.pieces_requested), 0) as total_requested,
        CEIL(COALESCE(SUM(boi.pieces_requested), 0)::DECIMAL / m.pieces_per_batch) as batches_needed,
        CEIL(COALESCE(SUM(boi.pieces_requested), 0)::DECIMAL / m.pieces_per_batch) * m.pieces_per_batch as pieces_to_produce,
        (CEIL(COALESCE(SUM(boi.pieces_requested), 0)::DECIMAL / m.pieces_per_batch) * m.pieces_per_batch) - COALESCE(SUM(boi.pieces_requested), 0) as surplus
      FROM products p
      JOIN meals m ON p.meal_id = m.id
      LEFT JOIN branch_order_items boi ON p.id = boi.product_id
      LEFT JOIN branch_orders bo ON boi.branch_order_id = bo.id
        AND bo.order_date = $1
        AND bo.status IN ('submitted', 'confirmed')
      WHERE p.active = true
      GROUP BY p.id, p.name, p.sku, m.id, m.name, m.pieces_per_batch
      HAVING COALESCE(SUM(boi.pieces_requested), 0) > 0
      ORDER BY p.name`,
      [productionDate]
    );
    return result.rows;
  }

  /**
   * Get production summary for date range
   */
  static async getSummary(startDate, endDate) {
    const result = await query(
      `SELECT
        p.name as product_name,
        COUNT(pb.id) as production_days,
        SUM(pb.batches_planned) as total_batches_planned,
        SUM(pb.batches_produced) as total_batches_produced,
        SUM(pb.pieces_planned) as total_pieces_planned,
        SUM(pb.pieces_produced) as total_pieces_produced,
        ROUND(AVG(pb.pieces_produced::DECIMAL / NULLIF(pb.pieces_planned, 0) * 100), 2) as avg_efficiency
      FROM production_batches pb
      JOIN products p ON pb.product_id = p.id
      WHERE pb.production_date BETWEEN $1 AND $2
      GROUP BY p.id, p.name
      ORDER BY total_pieces_produced DESC`,
      [startDate, endDate]
    );
    return result.rows;
  }

  /**
   * Delete production batch
   */
  static async delete(id) {
    const result = await query(
      'DELETE FROM production_batches WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Production;
