const { query } = require('../config/database');

class Branch {
  /**
   * Get all branches
   */
  static async getAll(activeOnly = false) {
    const sql = activeOnly
      ? 'SELECT * FROM branches WHERE active = true ORDER BY name'
      : 'SELECT * FROM branches ORDER BY name';
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get branch by ID
   */
  static async getById(id) {
    const result = await query(
      'SELECT * FROM branches WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get branch by code
   */
  static async getByCode(code) {
    const result = await query(
      'SELECT * FROM branches WHERE code = $1',
      [code]
    );
    return result.rows[0];
  }

  /**
   * Create new branch
   */
  static async create(branchData) {
    const { name, code, location, contact_phone, contact_email } = branchData;
    const result = await query(
      `INSERT INTO branches (name, code, location, contact_phone, contact_email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, code, location, contact_phone, contact_email]
    );
    return result.rows[0];
  }

  /**
   * Update branch
   */
  static async update(id, branchData) {
    const { name, code, location, contact_phone, contact_email, active } = branchData;
    const result = await query(
      `UPDATE branches
       SET name = COALESCE($1, name),
           code = COALESCE($2, code),
           location = COALESCE($3, location),
           contact_phone = COALESCE($4, contact_phone),
           contact_email = COALESCE($5, contact_email),
           active = COALESCE($6, active)
       WHERE id = $7
       RETURNING *`,
      [name, code, location, contact_phone, contact_email, active, id]
    );
    return result.rows[0];
  }

  /**
   * Delete branch (soft delete by setting active = false)
   */
  static async delete(id) {
    const result = await query(
      'UPDATE branches SET active = false WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get branch with statistics
   */
  static async getWithStats(id, date = new Date()) {
    const result = await query(
      `SELECT
        b.*,
        COUNT(DISTINCT u.id) as user_count,
        COUNT(DISTINCT bo.id) FILTER (WHERE bo.order_date = $2) as today_orders,
        COUNT(DISTINCT t.id) FILTER (
          WHERE (t.from_branch_id = b.id OR t.to_branch_id = b.id)
          AND t.transfer_date = $2
        ) as today_transfers
       FROM branches b
       LEFT JOIN users u ON b.id = u.branch_id AND u.active = true
       LEFT JOIN branch_orders bo ON b.id = bo.branch_id
       LEFT JOIN transfers t ON b.id = t.from_branch_id OR b.id = t.to_branch_id
       WHERE b.id = $1
       GROUP BY b.id`,
      [id, date.toISOString().split('T')[0]]
    );
    return result.rows[0];
  }
}

module.exports = Branch;
