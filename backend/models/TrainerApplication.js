const pool = require('../config/database');

class TrainerApplication {
  static async findAll({ status } = {}) {
    let query = `
      SELECT ta.*,
             u.username AS reviewed_by_username
      FROM trainer_applications ta
      LEFT JOIN users u ON ta.reviewed_by = u.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      query += ` AND ta.status = $1`;
      params.push(status);
    }
    query += ` ORDER BY ta.created_at DESC`;
    const { rows } = await pool.query(query, params);
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT ta.*,
              u.username AS reviewed_by_username
       FROM trainer_applications ta
       LEFT JOIN users u ON ta.reviewed_by = u.id
       WHERE ta.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  static async create({ full_name, email, phone, specialization,
    experience_years, certifications, bio, resume_url, cover_letter }) {
    const { rows } = await pool.query(
      `INSERT INTO trainer_applications
         (full_name, email, phone, specialization, experience_years,
          certifications, bio, resume_url, cover_letter)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [full_name, email.toLowerCase(), phone || null, specialization || null,
       experience_years || null, certifications || null, bio || null,
       resume_url || null, cover_letter || null]
    );
    return rows[0];
  }

  static async approve(id, reviewedBy, adminNotes = null) {
    const { rows } = await pool.query(
      `UPDATE trainer_applications
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
      `UPDATE trainer_applications
       SET status='rejected', reviewed_by=$1,
           reviewed_at=NOW(), admin_notes=$2
       WHERE id=$3
       RETURNING *`,
      [reviewedBy, adminNotes, id]
    );
    return rows[0] || null;
  }
}

module.exports = TrainerApplication;