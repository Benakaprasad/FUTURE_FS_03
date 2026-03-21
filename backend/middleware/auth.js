require('../env');
const jwt  = require('jsonwebtoken');
const pool = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) ||
      req.query.token ||
      null;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { rows } = await pool.query(
      `SELECT id, username, email, role, is_active, is_email_verified
       FROM users WHERE id = $1`,
      [decoded.id]
    );

    if (!rows[0]) return res.status(401).json({ error: 'User no longer exists' });
    if (!rows[0].is_active) return res.status(401).json({ error: 'Account deactivated' });

    // 4. Attach user to request
    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate };