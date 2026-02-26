const pool   = require('../config/database');
const crypto = require('crypto');
const jwt    = require('jsonwebtoken');

class Token {
  // ── Helpers ──────────────────────────────────────────────────
  static hashToken(rawToken) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  static generateRawToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  // ── Access Token ─────────────────────────────────────────────
  static generateAccessToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
    );
  }

  // ── Refresh Token ─────────────────────────────────────────────
  static async createRefreshToken(userId, ipAddress = null, userAgent = null) {
    const rawToken  = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await pool.query(
      `INSERT INTO refresh_tokens
         (user_id, token_hash, expires_at, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, tokenHash, expiresAt, ipAddress, userAgent]
    );

    return rawToken; // Return raw — never store raw
  }

  static async findRefreshToken(rawToken) {
    const tokenHash = this.hashToken(rawToken);
    const { rows }  = await pool.query(
      `SELECT rt.*, u.id AS user_id, u.role, u.username,
              u.is_active, u.is_email_verified
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.token_hash = $1`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  static async rotateRefreshToken(oldRawToken, userId, ipAddress, userAgent) {
    const client = await require('../config/database').connect();
    try {
      await client.query('BEGIN');

      // Revoke old token
      const oldHash = this.hashToken(oldRawToken);
      const { rowCount } = await client.query(
        `UPDATE refresh_tokens
         SET is_revoked = true, last_used_at = NOW()
         WHERE token_hash = $1 AND is_revoked = false`,
        [oldHash]
      );

      // Detect reuse attack — token already revoked
      if (rowCount === 0) {
        // Revoke ALL tokens for this user
        await client.query(
          `UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1`,
          [userId]
        );
        await client.query('COMMIT');
        throw new Error('REUSE_DETECTED');
      }

      // Issue new token
      const newRawToken  = this.generateRawToken();
      const newTokenHash = this.hashToken(newRawToken);
      const expiresAt    = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await client.query(
        `INSERT INTO refresh_tokens
           (user_id, token_hash, expires_at, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, newTokenHash, expiresAt, ipAddress, userAgent]
      );

      await client.query('COMMIT');
      return newRawToken;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async revokeAllUserTokens(userId) {
    await pool.query(
      `UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1`,
      [userId]
    );
  }

  // ── Password Reset ───────────────────────────────────────────
  static async createPasswordResetToken(userId) {
    const rawToken  = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any existing reset tokens for this user
    await pool.query(
      `DELETE FROM password_resets WHERE user_id = $1`,
      [userId]
    );

    await pool.query(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );

    return rawToken;
  }

  static async findPasswordResetToken(rawToken) {
    const tokenHash = this.hashToken(rawToken);
    const { rows }  = await pool.query(
      `SELECT * FROM password_resets
       WHERE token_hash = $1
         AND expires_at > NOW()
         AND used_at IS NULL`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  static async markPasswordResetUsed(id) {
    await pool.query(
      `UPDATE password_resets SET used_at = NOW() WHERE id = $1`,
      [id]
    );
  }

  // ── Email Verification ───────────────────────────────────────
  static async createEmailVerificationToken(userId) {
    const rawToken  = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.query(
      `INSERT INTO email_verifications (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [userId, tokenHash, expiresAt]
    );

    return rawToken;
  }

  static async findEmailVerificationToken(rawToken) {
    const tokenHash = this.hashToken(rawToken);
    const { rows }  = await pool.query(
      `SELECT * FROM email_verifications
       WHERE token_hash = $1
         AND expires_at > NOW()
         AND verified_at IS NULL`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  static async markEmailVerified(id) {
    await pool.query(
      `UPDATE email_verifications SET verified_at = NOW() WHERE id = $1`,
      [id]
    );
  }
}

module.exports = Token;