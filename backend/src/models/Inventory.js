const { query, transaction } = require('../config/database');

class Inventory {
  /**
   * Get inventory records with filters
   */
  static async getAll(filters = {}) {
    const { branch_id, product_id, start_date, end_date } = filters;

    let sql = `
      SELECT di.*, b.name as branch_name, p.name as product_name, p.sku,
             u.name as recorded_by_name
      FROM daily_inventory di
      JOIN branches b ON di.branch_id = b.id
      JOIN products p ON di.product_id = p.id
      LEFT JOIN users u ON di.recorded_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (branch_id) {
      sql += ` AND di.branch_id = $${paramCount++}`;
      params.push(branch_id);
    }

    if (product_id) {
      sql += ` AND di.product_id = $${paramCount++}`;
      params.push(product_id);
    }

    if (start_date) {
      sql += ` AND di.inventory_date >= $${paramCount++}`;
      params.push(start_date);
    }

    if (end_date) {
      sql += ` AND di.inventory_date <= $${paramCount++}`;
      params.push(end_date);
    }

    sql += ' ORDER BY di.inventory_date DESC, b.name, p.name';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Get inventory by ID
   */
  static async getById(id) {
    const result = await query(
      `SELECT di.*, b.name as branch_name, p.name as product_name,
              u.name as recorded_by_name
       FROM daily_inventory di
       JOIN branches b ON di.branch_id = b.id
       JOIN products p ON di.product_id = p.id
       LEFT JOIN users u ON di.recorded_by = u.id
       WHERE di.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get inventory for specific branch, product, and date
   */
  static async getByBranchProductDate(branchId, productId, inventoryDate) {
    const result = await query(
      `SELECT * FROM daily_inventory
       WHERE branch_id = $1 AND product_id = $2 AND inventory_date = $3`,
      [branchId, productId, inventoryDate]
    );
    return result.rows[0];
  }

  /**
   * Get current inventory for a branch
   */
  static async getCurrentByBranch(branchId) {
    const result = await query(
      `SELECT * FROM v_branch_inventory_current
       WHERE branch_id = $1`,
      [branchId]
    );
    return result.rows;
  }

  /**
   * Create inventory record
   */
  static async create(inventoryData) {
    const {
      branch_id, product_id, inventory_date, opening_stock, received,
      sold, transferred_out, transferred_in, damaged, closing_stock,
      recorded_by, notes
    } = inventoryData;

    const result = await query(
      `INSERT INTO daily_inventory (
        branch_id, product_id, inventory_date, opening_stock, received,
        sold, transferred_out, transferred_in, damaged, closing_stock,
        recorded_by, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [branch_id, product_id, inventory_date, opening_stock, received,
       sold, transferred_out, transferred_in, damaged, closing_stock,
       recorded_by, notes]
    );
    return result.rows[0];
  }

  /**
   * Update inventory record
   */
  static async update(id, inventoryData) {
    const {
      opening_stock, received, sold, transferred_out, transferred_in,
      damaged, closing_stock, notes
    } = inventoryData;

    const result = await query(
      `UPDATE daily_inventory
       SET opening_stock = COALESCE($1, opening_stock),
           received = COALESCE($2, received),
           sold = COALESCE($3, sold),
           transferred_out = COALESCE($4, transferred_out),
           transferred_in = COALESCE($5, transferred_in),
           damaged = COALESCE($6, damaged),
           closing_stock = COALESCE($7, closing_stock),
           notes = COALESCE($8, notes)
       WHERE id = $9
       RETURNING *`,
      [opening_stock, received, sold, transferred_out, transferred_in,
       damaged, closing_stock, notes, id]
    );
    return result.rows[0];
  }

  /**
   * Upsert (insert or update) inventory record
   */
  static async upsert(inventoryData) {
    const {
      branch_id, product_id, inventory_date, opening_stock, received,
      sold, transferred_out, transferred_in, damaged, closing_stock,
      recorded_by, notes
    } = inventoryData;

    const result = await query(
      `INSERT INTO daily_inventory (
        branch_id, product_id, inventory_date, opening_stock, received,
        sold, transferred_out, transferred_in, damaged, closing_stock,
        recorded_by, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (branch_id, product_id, inventory_date)
      DO UPDATE SET
        opening_stock = EXCLUDED.opening_stock,
        received = EXCLUDED.received,
        sold = EXCLUDED.sold,
        transferred_out = EXCLUDED.transferred_out,
        transferred_in = EXCLUDED.transferred_in,
        damaged = EXCLUDED.damaged,
        closing_stock = EXCLUDED.closing_stock,
        recorded_by = EXCLUDED.recorded_by,
        notes = EXCLUDED.notes
      RETURNING *`,
      [branch_id, product_id, inventory_date, opening_stock, received,
       sold, transferred_out, transferred_in, damaged, closing_stock,
       recorded_by, notes]
    );
    return result.rows[0];
  }

  /**
   * Calculate closing stock automatically
   */
  static calculateClosingStock(opening, received, sold, transferredOut, transferredIn, damaged) {
    return opening + received - sold - transferredOut + transferredIn - damaged;
  }

  /**
   * Get inventory summary for a date
   */
  static async getSummaryByDate(inventoryDate, branchId = null) {
    let sql = `
      SELECT b.name as branch_name,
             COUNT(DISTINCT di.product_id) as product_count,
             SUM(di.closing_stock) as total_closing_stock,
             SUM(di.sold) as total_sold,
             SUM(di.damaged) as total_damaged
      FROM daily_inventory di
      JOIN branches b ON di.branch_id = b.id
      WHERE di.inventory_date = $1
    `;

    const params = [inventoryDate];

    if (branchId) {
      sql += ' AND di.branch_id = $2';
      params.push(branchId);
    }

    sql += ' GROUP BY b.id, b.name ORDER BY b.name';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Delete inventory record
   */
  static async delete(id) {
    const result = await query(
      'DELETE FROM daily_inventory WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Inventory;
