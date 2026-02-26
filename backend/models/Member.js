const pool = require('../config/database');

class Member {
  static async findAll({ status } = {}) {
    let query = `
      SELECT m.*,
             u.full_name, u.email, u.phone,
             u.username,
             c.status AS customer_status,
             c.fitness_goals
      FROM members m
      JOIN customers c ON m.customer_id = c.id
      JOIN users u     ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      query += ` AND m.status = $1`;
      params.push(status);
    }
    query += ` ORDER BY m.created_at DESC`;
    const { rows } = await pool.query(query, params);
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT m.*,
              u.full_name, u.email, u.phone, u.username,
              c.fitness_goals, c.medical_conditions,
              c.status AS customer_status
       FROM members m
       JOIN customers c ON m.customer_id = c.id
       JOIN users u     ON c.user_id = u.id
       WHERE m.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByCustomerId(customerId) {
    const { rows } = await pool.query(
      `SELECT * FROM members WHERE customer_id = $1`,
      [customerId]
    );
    return rows[0] || null;
  }

  static async create({ customer_id, membership_type, start_date, end_date,
    payment_status, amount_paid, admission_notes, request_id, created_by }) {
    const { rows } = await pool.query(
      `INSERT INTO members
         (customer_id, membership_type, start_date, end_date,
          payment_status, amount_paid, admission_notes, request_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [customer_id, membership_type, start_date, end_date || null,
       payment_status || 'pending', amount_paid || null,
       admission_notes || null, request_id || null, created_by]
    );
    return rows[0];
  }

  static async update(id, fields) {
    const { membership_type, end_date, payment_status, amount_paid,
            status, admission_notes } = fields;
    const { rows } = await pool.query(
      `UPDATE members
       SET membership_type=$1, end_date=$2, payment_status=$3,
           amount_paid=$4, status=$5, admission_notes=$6
       WHERE id=$7
       RETURNING *`,
      [membership_type, end_date || null, payment_status,
       amount_paid || null, status, admission_notes || null, id]
    );
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    const { rows } = await pool.query(
      `UPDATE members SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return rows[0] || null;
  }

  static async getExpiringSoon(days = 7) {
    const { rows } = await pool.query(
      `SELECT m.*, u.full_name, u.email
       FROM members m
       JOIN customers c ON m.customer_id = c.id
       JOIN users u     ON c.user_id = u.id
       WHERE m.status = 'active'
         AND m.end_date IS NOT NULL
         AND m.end_date <= CURRENT_DATE + INTERVAL '${days} days'
         AND m.end_date >= CURRENT_DATE`
    );
    return rows;
  }
}

module.exports = Member;