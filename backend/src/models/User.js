const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Get all users
   */
  static async getAll(includeInactive = false) {
    const sql = includeInactive
      ? `SELECT u.id, u.name, u.email, u.role, u.branch_id, u.active, u.last_login,
                u.created_at, b.name as branch_name
         FROM users u
         LEFT JOIN branches b ON u.branch_id = b.id
         ORDER BY u.name`
      : `SELECT u.id, u.name, u.email, u.role, u.branch_id, u.active, u.last_login,
                u.created_at, b.name as branch_name
         FROM users u
         LEFT JOIN branches b ON u.branch_id = b.id
         WHERE u.active = true
         ORDER BY u.name`;
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get user by ID
   */
  static async getById(id) {
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.branch_id, u.active, u.last_login,
              u.created_at, b.name as branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get user by email (for authentication)
   */
  static async getByEmail(email) {
    const result = await query(
      `SELECT u.*, b.name as branch_name
       FROM users u
       LEFT JOIN branches b ON u.branch_id = b.id
       WHERE u.email = $1`,
      [email]
    );
    return result.rows[0];
  }

  /**
   * Get users by branch
   */
  static async getByBranch(branchId) {
    const result = await query(
      `SELECT id, name, email, role, branch_id, active, last_login, created_at
       FROM users
       WHERE branch_id = $1 AND active = true
       ORDER BY name`,
      [branchId]
    );
    return result.rows;
  }

  /**
   * Create new user
   */
  static async create(userData) {
    const { name, email, password, role, branch_id } = userData;

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role, branch_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, branch_id, active, created_at`,
      [name, email, password_hash, role, branch_id]
    );
    return result.rows[0];
  }

  /**
   * Update user
   */
  static async update(id, userData) {
    const { name, email, role, branch_id, active } = userData;
    const result = await query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           branch_id = COALESCE($4, branch_id),
           active = COALESCE($5, active)
       WHERE id = $6
       RETURNING id, name, email, role, branch_id, active, updated_at`,
      [name, email, role, branch_id, active, id]
    );
    return result.rows[0];
  }

  /**
   * Update password
   */
  static async updatePassword(id, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, 10);
    const result = await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id',
      [password_hash, id]
    );
    return result.rows[0];
  }

  /**
   * Update last login
   */
  static async updateLastLogin(id) {
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Delete user (soft delete)
   */
  static async delete(id) {
    const result = await query(
      'UPDATE users SET active = false WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = User;
