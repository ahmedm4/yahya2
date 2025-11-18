const { query, transaction } = require('../config/database');

class Order {
  /**
   * Get all orders with optional filters
   */
  static async getAll(filters = {}) {
    const { branch_id, status, start_date, end_date, limit = 50, offset = 0 } = filters;

    let sql = `
      SELECT bo.*, b.name as branch_name, b.code as branch_code,
             u.name as submitted_by_name,
             COUNT(boi.id) as item_count,
             SUM(boi.pieces_requested) as total_pieces_requested,
             SUM(boi.pieces_delivered) as total_pieces_delivered
      FROM branch_orders bo
      JOIN branches b ON bo.branch_id = b.id
      LEFT JOIN users u ON bo.submitted_by = u.id
      LEFT JOIN branch_order_items boi ON bo.id = boi.branch_order_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (branch_id) {
      sql += ` AND bo.branch_id = $${paramCount++}`;
      params.push(branch_id);
    }

    if (status) {
      sql += ` AND bo.status = $${paramCount++}`;
      params.push(status);
    }

    if (start_date) {
      sql += ` AND bo.order_date >= $${paramCount++}`;
      params.push(start_date);
    }

    if (end_date) {
      sql += ` AND bo.order_date <= $${paramCount++}`;
      params.push(end_date);
    }

    sql += `
      GROUP BY bo.id, b.id, u.id
      ORDER BY bo.order_date DESC, bo.created_at DESC
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `;

    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Get order by ID with items
   */
  static async getById(id) {
    const orderResult = await query(
      `SELECT bo.*, b.name as branch_name, b.code as branch_code,
              us.name as submitted_by_name, uc.name as confirmed_by_name
       FROM branch_orders bo
       JOIN branches b ON bo.branch_id = b.id
       LEFT JOIN users us ON bo.submitted_by = us.id
       LEFT JOIN users uc ON bo.confirmed_by = uc.id
       WHERE bo.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await query(
      `SELECT boi.*, p.name as product_name, p.sku,
              m.name as meal_name, m.pieces_per_batch
       FROM branch_order_items boi
       JOIN products p ON boi.product_id = p.id
       JOIN meals m ON p.meal_id = m.id
       WHERE boi.branch_order_id = $1
       ORDER BY p.name`,
      [id]
    );

    order.items = itemsResult.rows;
    return order;
  }

  /**
   * Get order by branch and date
   */
  static async getByBranchAndDate(branchId, orderDate) {
    const result = await query(
      `SELECT bo.*, b.name as branch_name
       FROM branch_orders bo
       JOIN branches b ON bo.branch_id = b.id
       WHERE bo.branch_id = $1 AND bo.order_date = $2`,
      [branchId, orderDate]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const order = result.rows[0];

    // Get order items
    const itemsResult = await query(
      `SELECT boi.*, p.name as product_name, p.sku,
              m.name as meal_name, m.pieces_per_batch
       FROM branch_order_items boi
       JOIN products p ON boi.product_id = p.id
       JOIN meals m ON p.meal_id = m.id
       WHERE boi.branch_order_id = $1`,
      [order.id]
    );

    order.items = itemsResult.rows;
    return order;
  }

  /**
   * Create new order with items
   */
  static async create(orderData, items) {
    return await transaction(async (client) => {
      // Create order
      const orderResult = await client.query(
        `INSERT INTO branch_orders (branch_id, order_date, status, notes, submitted_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [orderData.branch_id, orderData.order_date, orderData.status || 'draft',
         orderData.notes, orderData.submitted_by]
      );

      const order = orderResult.rows[0];

      // Create order items
      if (items && items.length > 0) {
        for (const item of items) {
          await client.query(
            `INSERT INTO branch_order_items (branch_order_id, product_id, pieces_requested, notes)
             VALUES ($1, $2, $3, $4)`,
            [order.id, item.product_id, item.pieces_requested, item.notes]
          );
        }
      }

      return order;
    });
  }

  /**
   * Update order
   */
  static async update(id, orderData) {
    const { status, notes, confirmed_by } = orderData;
    const result = await query(
      `UPDATE branch_orders
       SET status = COALESCE($1, status),
           notes = COALESCE($2, notes),
           confirmed_by = COALESCE($3, confirmed_by),
           confirmed_at = CASE WHEN $1 = 'confirmed' THEN CURRENT_TIMESTAMP ELSE confirmed_at END,
           submitted_at = CASE WHEN $1 = 'submitted' THEN CURRENT_TIMESTAMP ELSE submitted_at END
       WHERE id = $4
       RETURNING *`,
      [status, notes, confirmed_by, id]
    );
    return result.rows[0];
  }

  /**
   * Update order item
   */
  static async updateItem(itemId, itemData) {
    const { pieces_requested, pieces_delivered, notes } = itemData;
    const result = await query(
      `UPDATE branch_order_items
       SET pieces_requested = COALESCE($1, pieces_requested),
           pieces_delivered = COALESCE($2, pieces_delivered),
           notes = COALESCE($3, notes)
       WHERE id = $4
       RETURNING *`,
      [pieces_requested, pieces_delivered, notes, itemId]
    );
    return result.rows[0];
  }

  /**
   * Delete order
   */
  static async delete(id) {
    const result = await query(
      'DELETE FROM branch_orders WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get daily production summary
   */
  static async getDailyProductionSummary(orderDate) {
    const result = await query(
      'SELECT * FROM v_daily_orders_summary WHERE order_date = $1',
      [orderDate]
    );
    return result.rows;
  }

  /**
   * Get orders by date range
   */
  static async getByDateRange(startDate, endDate, branchId = null) {
    let sql = `
      SELECT bo.*, b.name as branch_name,
             COUNT(boi.id) as item_count,
             SUM(boi.pieces_requested) as total_pieces
      FROM branch_orders bo
      JOIN branches b ON bo.branch_id = b.id
      LEFT JOIN branch_order_items boi ON bo.id = boi.branch_order_id
      WHERE bo.order_date BETWEEN $1 AND $2
    `;

    const params = [startDate, endDate];

    if (branchId) {
      sql += ' AND bo.branch_id = $3';
      params.push(branchId);
    }

    sql += ' GROUP BY bo.id, b.id ORDER BY bo.order_date DESC';

    const result = await query(sql, params);
    return result.rows;
  }
}

module.exports = Order;
