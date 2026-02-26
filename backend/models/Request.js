const pool = require('../config/database');

class Request {
  static async findAll({ status } = {}) {
    let query = `
      SELECT r.*,
             c.status AS customer_status,
             u.full_name AS customer_name,
             u.email     AS customer_email,
             rv.username AS reviewed_by_username
      FROM requests r
      JOIN customers c ON r.customer_id = c.id
      JOIN users u     ON c.user_id = u.id
      LEFT JOIN users rv ON r.reviewed_by = rv.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      query += ` AND r.status = $1`;
      params.push(status);
    }
    query += ` ORDER BY r.created_at DESC`;
    const { rows } = await pool.query(query, params);
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT r.*,
              u.full_name AS customer_name,
              u.email     AS customer_email
       FROM requests r
       JOIN customers c ON r.customer_id = c.id
       JOIN users u     ON c.user_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByCustomerId(customerId) {
    const { rows } = await pool.query(
      `SELECT * FROM requests
       WHERE customer_id = $1
       ORDER BY created_at DESC`,
      [customerId]
    );
    return rows;
  }

  static async create({ customer_id, preferred_trainer_id, membership_type, message }) {
    const { rows } = await pool.query(
      `INSERT INTO requests
         (customer_id, preferred_trainer_id, membership_type, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [customer_id, preferred_trainer_id || null,
       membership_type || null, message || null]
    );
    return rows[0];
  }

  static async approve(id, reviewedBy, adminNotes = null) {
    const { rows } = await pool.query(
      `UPDATE requests
       SET status='approved', reviewed_by=$1,
           reviewed_at=NOW(), admin_notes=$2
       WHERE id=$3
       RETURNING *`,
      [reviewedBy, adminNotes, id]
    );
    return rows[0] || null;
  }

  static async reject(id, reviewedBy, adminNotes = null) {
    const { rows } = await pool.query(
      `UPDATE requests
       SET status='rejected', reviewed_by=$1,
           reviewed_at=NOW(), admin_notes=$2
       WHERE id=$3
       RETURNING *`,
      [reviewedBy, adminNotes, id]
    );
    return rows[0] || null;
  }
}

module.exports = Request;