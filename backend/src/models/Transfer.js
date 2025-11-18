const { query, transaction } = require('../config/database');
const { generateTransferNumber } = require('../utils/helpers');

class Transfer {
  /**
   * Get all transfers with filters
   */
  static async getAll(filters = {}) {
    const { from_branch_id, to_branch_id, status, start_date, end_date } = filters;

    let sql = `
      SELECT t.*,
             bf.name as from_branch_name, bf.code as from_branch_code,
             bt.name as to_branch_name, bt.code as to_branch_code,
             p.name as product_name, p.sku,
             ur.name as requested_by_name,
             ua.name as approved_by_name
      FROM transfers t
      JOIN branches bf ON t.from_branch_id = bf.id
      JOIN branches bt ON t.to_branch_id = bt.id
      JOIN products p ON t.product_id = p.id
      LEFT JOIN users ur ON t.requested_by = ur.id
      LEFT JOIN users ua ON t.approved_by = ua.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (from_branch_id) {
      sql += ` AND t.from_branch_id = $${paramCount++}`;
      params.push(from_branch_id);
    }

    if (to_branch_id) {
      sql += ` AND t.to_branch_id = $${paramCount++}`;
      params.push(to_branch_id);
    }

    if (status) {
      sql += ` AND t.status = $${paramCount++}`;
      params.push(status);
    }

    if (start_date) {
      sql += ` AND t.transfer_date >= $${paramCount++}`;
      params.push(start_date);
    }

    if (end_date) {
      sql += ` AND t.transfer_date <= $${paramCount++}`;
      params.push(end_date);
    }

    sql += ' ORDER BY t.transfer_date DESC, t.created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Get transfer by ID
   */
  static async getById(id) {
    const result = await query(
      `SELECT t.*,
              bf.name as from_branch_name, bf.code as from_branch_code,
              bt.name as to_branch_name, bt.code as to_branch_code,
              p.name as product_name, p.sku,
              ur.name as requested_by_name,
              ua.name as approved_by_name
       FROM transfers t
       JOIN branches bf ON t.from_branch_id = bf.id
       JOIN branches bt ON t.to_branch_id = bt.id
       JOIN products p ON t.product_id = p.id
       LEFT JOIN users ur ON t.requested_by = ur.id
       LEFT JOIN users ua ON t.approved_by = ua.id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get transfer by transfer number
   */
  static async getByNumber(transferNumber) {
    const result = await query(
      `SELECT t.*,
              bf.name as from_branch_name,
              bt.name as to_branch_name,
              p.name as product_name
       FROM transfers t
       JOIN branches bf ON t.from_branch_id = bf.id
       JOIN branches bt ON t.to_branch_id = bt.id
       JOIN products p ON t.product_id = p.id
       WHERE t.transfer_number = $1`,
      [transferNumber]
    );
    return result.rows[0];
  }

  /**
   * Get pending transfers
   */
  static async getPending() {
    const result = await query(
      'SELECT * FROM v_pending_transfers'
    );
    return result.rows;
  }

  /**
   * Create new transfer
   */
  static async create(transferData) {
    const {
      from_branch_id, to_branch_id, product_id, pieces,
      transfer_date, requested_by, notes
    } = transferData;

    // Generate transfer number
    const dateStr = new Date(transfer_date).toISOString().split('T')[0].replace(/-/g, '');
    const countResult = await query(
      `SELECT COUNT(*) as count FROM transfers
       WHERE transfer_date = $1`,
      [transfer_date]
    );
    const sequenceNumber = parseInt(countResult.rows[0].count) + 1;
    const transferNumber = `TR-${dateStr}-${String(sequenceNumber).padStart(3, '0')}`;

    const result = await query(
      `INSERT INTO transfers (
        transfer_number, from_branch_id, to_branch_id, product_id,
        pieces, transfer_date, requested_by, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING *`,
      [transferNumber, from_branch_id, to_branch_id, product_id,
       pieces, transfer_date, requested_by, notes]
    );
    return result.rows[0];
  }

  /**
   * Update transfer status
   */
  static async updateStatus(id, status, userId) {
    const result = await query(
      `UPDATE transfers
       SET status = $1,
           approved_by = CASE WHEN $1 = 'approved' THEN $2 ELSE approved_by END,
           approved_at = CASE WHEN $1 = 'approved' THEN CURRENT_TIMESTAMP ELSE approved_at END,
           completed_at = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
       WHERE id = $3
       RETURNING *`,
      [status, userId, id]
    );
    return result.rows[0];
  }

  /**
   * Update transfer
   */
  static async update(id, transferData) {
    const { pieces, notes, status } = transferData;
    const result = await query(
      `UPDATE transfers
       SET pieces = COALESCE($1, pieces),
           notes = COALESCE($2, notes),
           status = COALESCE($3, status)
       WHERE id = $4
       RETURNING *`,
      [pieces, notes, status, id]
    );
    return result.rows[0];
  }

  /**
   * Approve transfer
   */
  static async approve(id, approvedBy) {
    return await this.updateStatus(id, 'approved', approvedBy);
  }

  /**
   * Reject transfer
   */
  static async reject(id, approvedBy) {
    return await this.updateStatus(id, 'rejected', approvedBy);
  }

  /**
   * Complete transfer
   */
  static async complete(id) {
    return await this.updateStatus(id, 'completed', null);
  }

  /**
   * Cancel transfer
   */
  static async cancel(id) {
    return await this.updateStatus(id, 'cancelled', null);
  }

  /**
   * Get transfers for a branch (sent or received)
   */
  static async getForBranch(branchId, direction = 'both') {
    let sql = `
      SELECT t.*,
             bf.name as from_branch_name,
             bt.name as to_branch_name,
             p.name as product_name
      FROM transfers t
      JOIN branches bf ON t.from_branch_id = bf.id
      JOIN branches bt ON t.to_branch_id = bt.id
      JOIN products p ON t.product_id = p.id
      WHERE
    `;

    if (direction === 'sent') {
      sql += ' t.from_branch_id = $1';
    } else if (direction === 'received') {
      sql += ' t.to_branch_id = $1';
    } else {
      sql += ' (t.from_branch_id = $1 OR t.to_branch_id = $1)';
    }

    sql += ' ORDER BY t.transfer_date DESC';

    const result = await query(sql, [branchId]);
    return result.rows;
  }

  /**
   * Delete transfer
   */
  static async delete(id) {
    const result = await query(
      'DELETE FROM transfers WHERE id = $1 AND status = $2 RETURNING *',
      [id, 'pending']
    );
    return result.rows[0];
  }
}

module.exports = Transfer;
