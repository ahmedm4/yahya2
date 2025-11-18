const { query } = require('../config/database');

class Meal {
  /**
   * Get all meals
   */
  static async getAll(activeOnly = false) {
    const sql = activeOnly
      ? 'SELECT * FROM meals WHERE active = true ORDER BY name'
      : 'SELECT * FROM meals ORDER BY name';
    const result = await query(sql);
    return result.rows;
  }

  /**
   * Get meal by ID
   */
  static async getById(id) {
    const result = await query(
      'SELECT * FROM meals WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get meal by code
   */
  static async getByCode(code) {
    const result = await query(
      'SELECT * FROM meals WHERE code = $1',
      [code]
    );
    return result.rows[0];
  }

  /**
   * Create new meal
   */
  static async create(mealData) {
    const { name, code, description, trolleys_per_batch, pieces_per_trolley } = mealData;
    const result = await query(
      `INSERT INTO meals (name, code, description, trolleys_per_batch, pieces_per_trolley)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, code, description, trolleys_per_batch, pieces_per_trolley]
    );
    return result.rows[0];
  }

  /**
   * Update meal
   */
  static async update(id, mealData) {
    const { name, code, description, trolleys_per_batch, pieces_per_trolley, active } = mealData;
    const result = await query(
      `UPDATE meals
       SET name = COALESCE($1, name),
           code = COALESCE($2, code),
           description = COALESCE($3, description),
           trolleys_per_batch = COALESCE($4, trolleys_per_batch),
           pieces_per_trolley = COALESCE($5, pieces_per_trolley),
           active = COALESCE($6, active)
       WHERE id = $7
       RETURNING *`,
      [name, code, description, trolleys_per_batch, pieces_per_trolley, active, id]
    );
    return result.rows[0];
  }

  /**
   * Delete meal (soft delete)
   */
  static async delete(id) {
    const result = await query(
      'UPDATE meals SET active = false WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get meal with product count
   */
  static async getWithProductCount(id) {
    const result = await query(
      `SELECT m.*, COUNT(p.id) as product_count
       FROM meals m
       LEFT JOIN products p ON m.id = p.meal_id
       WHERE m.id = $1
       GROUP BY m.id`,
      [id]
    );
    return result.rows[0];
  }

  /**
   * Calculate pieces per batch (helper method)
   */
  static calculatePiecesPerBatch(trolleys, piecesPerTrolley) {
    return trolleys * piecesPerTrolley;
  }
}

module.exports = Meal;
