const pool = require('../config/database');

class Assignment {
  static async findAll({ status } = {}) {
    let query = `
      SELECT a.*,
             u.full_name  AS member_name,
             u.email      AS member_email,
             t.full_name  AS trainer_name
      FROM assignments a
      JOIN members m   ON a.member_id = m.id
      JOIN customers c ON m.customer_id = c.id
      JOIN users u     ON c.user_id = u.id
      JOIN users t     ON a.trainer_id = t.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      query += ` AND a.status = $1`;
      params.push(status);
    }
    query += ` ORDER BY a.assigned_date DESC`;
    const { rows } = await pool.query(query, params);
    return rows;
  }

  // Full transaction: assign + increment current_clients
  static async create({ member_id, trainer_id, notes, created_by }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Reassign any existing active assignment
      await client.query(
        `UPDATE assignments SET status='reassigned', end_date=CURRENT_DATE
         WHERE member_id=$1 AND status='active'`,
        [member_id]
      );

      // Create new assignment (trigger handles current_clients increment)
      const { rows } = await client.query(
        `INSERT INTO assignments
           (member_id, trainer_id, notes, created_by)
         VALUES ($1,$2,$3,$4)
         RETURNING *`,
        [member_id, trainer_id, notes || null, created_by]
      );

      await client.query('COMMIT');
      return rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async complete(id) {
    const { rows } = await pool.query(
      `UPDATE assignments
       SET status='completed', end_date=CURRENT_DATE
       WHERE id=$1
       RETURNING *`,
      [id]
    );
    return rows[0] || null;
  }
}

module.exports = Assignment;