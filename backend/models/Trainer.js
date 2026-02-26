const pool = require('../config/database');

class Trainer {
  static async findAll({ status } = {}) {
    let query = `
      SELECT t.*,
             u.username, u.email, u.full_name,
             u.phone,    u.is_active
      FROM trainers t
      JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      query += ` AND t.status = $1`;
      params.push(status);
    }
    query += ` ORDER BY t.created_at DESC`;
    const { rows } = await pool.query(query, params);
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT t.*, u.username, u.email, u.full_name, u.phone
       FROM trainers t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT t.*, u.username, u.email, u.full_name
       FROM trainers t
       JOIN users u ON t.user_id = u.id
       WHERE t.user_id = $1`,
      [userId]
    );
    return rows[0] || null;
  }

  static async create({ user_id, application_id, specialization,
    experience_years, certifications, bio, hourly_rate }) {
    const { rows } = await pool.query(
      `INSERT INTO trainers
         (user_id, application_id, specialization, experience_years,
          certifications, bio, hourly_rate)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [user_id, application_id || null, specialization || null,
       experience_years || null, certifications || null,
       bio || null, hourly_rate || null]
    );
    return rows[0];
  }

  static async update(id, { specialization, experience_years, certifications,
    bio, availability, max_clients, hourly_rate }) {
    const { rows } = await pool.query(
      `UPDATE trainers
       SET specialization=$1, experience_years=$2, certifications=$3,
           bio=$4, availability=$5, max_clients=$6, hourly_rate=$7
       WHERE id=$8
       RETURNING *`,
      [specialization || null, experience_years || null,
       certifications || null, bio || null, availability || null,
       max_clients || 20, hourly_rate || null, id]
    );
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    const { rows } = await pool.query(
      `UPDATE trainers SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return rows[0] || null;
  }

  static async getAssignedMembers(trainerUserId) {
    const { rows } = await pool.query(
      `SELECT m.*, u.full_name, u.email, u.phone,
              a.assigned_date, a.notes AS assignment_notes
       FROM assignments a
       JOIN members m      ON a.member_id = m.id
       JOIN customers c    ON m.customer_id = c.id
       JOIN users u        ON c.user_id = u.id
       WHERE a.trainer_id = $1
         AND a.status = 'active'`,
      [trainerUserId]
    );
    return rows;
  }
}

module.exports = Trainer;