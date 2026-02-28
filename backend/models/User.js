const pool    = require('../config/database');
const bcrypt  = require('bcryptjs');

class User {
  // ── Find ────────────────────────────────────────────────────
  static async findById(id) {
    const { rows } = await pool.query(
      `SELECT id, username, email, role, full_name, phone,
              is_active, is_email_verified, created_by, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    return rows[0] || null;
  }

  static async findByUsername(username) {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username.toLowerCase()]
    );
    return rows[0] || null;
  }

  static async findAllByRole(role) {
    const { rows } = await pool.query(
      `SELECT id, username, email, role, full_name, phone,
              is_active, is_email_verified, created_at,
              created_by,
              (SELECT username FROM users u2
               WHERE u2.id = users.created_by) AS created_by_username
       FROM users
       WHERE role = $1
       ORDER BY created_at DESC`,
      [role]
    );
    return rows;
  }

  static async findAllStaff() {
    const { rows } = await pool.query(
      `SELECT id, username, email, role, full_name, phone,
              is_active, created_at,
              (SELECT username FROM users u2
               WHERE u2.id = users.created_by) AS created_by_username
       FROM users
       WHERE role IN ('manager','staff')
       ORDER BY role, created_at DESC`
    );
    return rows;
  }

  // ── Create ──────────────────────────────────────────────────
  static async create({ username, email, password, role = 'customer', full_name, phone, created_by = null }) {
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `INSERT INTO users
       (username, email, password, role, full_name, phone, created_by, is_active, is_email_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true, true)
     RETURNING id, username, email, role, full_name, phone,
               is_active, is_email_verified, created_at`,
    [
      username.toLowerCase(),
      email.toLowerCase(),
      hash,
      role,
      full_name || null,
      phone || null,
      created_by,
    ]
  );
  return rows[0];
}

  // ── Password ─────────────────────────────────────────────────
  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePassword(userId, newPassword) {
    const hash = await bcrypt.hash(newPassword, 12);
    const { rows } = await pool.query(
      `UPDATE users SET password = $1
       WHERE id = $2
       RETURNING id`,
      [hash, userId]
    );
    return rows[0] || null;
  }

  // ── Status ───────────────────────────────────────────────────
  static async deactivate(userId) {
    const { rows } = await pool.query(
      `UPDATE users SET is_active = false
       WHERE id = $1
       RETURNING id, username, is_active`,
      [userId]
    );
    return rows[0] || null;
  }

  static async reactivate(userId) {
    const { rows } = await pool.query(
      `UPDATE users SET is_active = true
       WHERE id = $1
       RETURNING id, username, is_active`,
      [userId]
    );
    return rows[0] || null;
  }

  static async verifyEmail(userId) {
    const { rows } = await pool.query(
      `UPDATE users SET is_email_verified = true
       WHERE id = $1
       RETURNING id`,
      [userId]
    );
    return rows[0] || null;
  }

  // ── Login Attempts ───────────────────────────────────────────
  static async recordLoginAttempt(email, ipAddress, success, userAgent = null) {
    await pool.query(
      `INSERT INTO login_attempts (email, ip_address, success, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [email.toLowerCase(), ipAddress, success, userAgent]
    );
  }

  static async countRecentFailedAttempts(email, ipAddress, minutes = 15) {
    const { rows } = await pool.query(
      `SELECT COUNT(*) AS count FROM login_attempts
       WHERE (email = $1 OR ip_address = $2)
         AND success = false
         AND attempted_at > NOW() - INTERVAL '${minutes} minutes'`,
      [email.toLowerCase(), ipAddress]
    );
    return parseInt(rows[0].count);
  }
}

module.exports = User;