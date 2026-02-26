const pool = require('../config/database');

class Lead {
  static async findAll({ search, status, createdBy } = {}) {
    let query = `
      SELECT l.*,
             u.username AS created_by_username,
             u.full_name AS created_by_fullname
      FROM leads l
      LEFT JOIN users u ON l.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let i = 1;

    if (search) {
      query += ` AND (l.name ILIKE $${i} OR l.email ILIKE $${i})`;
      params.push(`%${search}%`);
      i++;
    }
    if (status) {
      query += ` AND l.status = $${i}`;
      params.push(status);
      i++;
    }
    if (createdBy) {
      query += ` AND l.created_by = $${i}`;
      params.push(createdBy);
      i++;
    }

    query += ` ORDER BY l.created_at DESC`;
    const { rows } = await pool.query(query, params);
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT l.*,
              u.username AS created_by_username
       FROM leads l
       LEFT JOIN users u ON l.created_by = u.id
       WHERE l.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  static async create({ name, email, phone, source, status, notes, created_by }) {
    const { rows } = await pool.query(
      `INSERT INTO leads (name, email, phone, source, status, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, email, phone || null, source || 'walk-in',
       status || 'new', notes || null, created_by]
    );
    return rows[0];
  }

  static async update(id, { name, email, phone, source, status, notes }) {
    const { rows } = await pool.query(
      `UPDATE leads
       SET name=$1, email=$2, phone=$3, source=$4, status=$5, notes=$6
       WHERE id=$7
       RETURNING *`,
      [name, email, phone || null, source, status, notes || null, id]
    );
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    const { rows } = await pool.query(
      `UPDATE leads SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return rows[0] || null;
  }

  static async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM leads WHERE id = $1 RETURNING id`,
      [id]
    );
    return rows[0] || null;
  }

  static async linkToUser(email, userId) {
    await pool.query(
      `UPDATE leads SET user_id = $1
       WHERE email = $2 AND user_id IS NULL`,
      [userId, email.toLowerCase()]
    );
  }

  static async getStats() {
    const { rows } = await pool.query(
      `SELECT status, COUNT(*) AS count
       FROM leads GROUP BY status`
    );
    return rows;
  }
}

module.exports = Lead;