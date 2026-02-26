const pool = require('../config/database');

class Customer {
  static async findByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT c.*, u.username, u.email, u.full_name, u.phone, u.is_active
       FROM customers c
       JOIN users u ON c.user_id = u.id
       WHERE c.user_id = $1`,
      [userId]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT c.*, u.username, u.email, u.full_name, u.phone
       FROM customers c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  static async findAll({ status } = {}) {
    let query = `
      SELECT c.*, u.username, u.email, u.full_name, u.phone, u.is_active
      FROM customers c
      JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      query += ` AND c.status = $1`;
      params.push(status);
    }
    query += ` ORDER BY c.created_at DESC`;
    const { rows } = await pool.query(query, params);
    return rows;
  }

  static async create(userId) {
    const { rows } = await pool.query(
      `INSERT INTO customers (user_id) VALUES ($1)
       RETURNING *`,
      [userId]
    );
    return rows[0];
  }

  static async update(id, { date_of_birth, gender, address, emergency_contact, fitness_goals, medical_conditions }) {
    const { rows } = await pool.query(
      `UPDATE customers
       SET date_of_birth=$1, gender=$2, address=$3,
           emergency_contact=$4, fitness_goals=$5, medical_conditions=$6
       WHERE id=$7
       RETURNING *`,
      [date_of_birth || null, gender || null, address || null,
       emergency_contact || null, fitness_goals || null,
       medical_conditions || null, id]
    );
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    const { rows } = await pool.query(
      `UPDATE customers SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return rows[0] || null;
  }
}

module.exports = Customer;