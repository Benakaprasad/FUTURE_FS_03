require('../env');
const express   = require('express');
const { body }  = require('express-validator');
const router    = express.Router();

const User     = require('../models/User');
const Token    = require('../models/Token');
const Customer = require('../models/Customer');
const Lead     = require('../models/Lead');
const { validate }      = require('../middleware/validate');
const { authenticate }  = require('../middleware/auth');
const { ROLES }         = require('../constants/roles');

// ── Validation Rules ─────────────────────────────────────────
const registerRules = [
  body('username')
    .trim().notEmpty().withMessage('Username required')
    .isLength({ min: 3, max: 50 }).withMessage('Username 3-50 chars')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username: letters, numbers, underscores only'),
  body('email')
    .trim().isEmail().withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password min 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must have uppercase, lowercase and number'),
  body('full_name')
    .optional().trim().isLength({ max: 100 }),
  body('phone')
    .optional().trim().matches(/^[0-9+\-\s]{7,15}$/)
    .withMessage('Invalid phone number'),
];

const loginRules = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
];

// ── POST /api/auth/register ───────────────────────────────────
router.post('/register', registerRules, validate, async (req, res, next) => {
  try {
    const { username, email, password, full_name, phone } = req.body;

    // Block role injection — register creates ONLY customers
    if (req.body.role && req.body.role !== ROLES.CUSTOMER) {
      return res.status(403).json({ error: 'Cannot self-register with that role' });
    }

    // Check duplicates
    const [existingEmail, existingUsername] = await Promise.all([
      User.findByEmail(email),
      User.findByUsername(username),
    ]);
    if (existingEmail)    return res.status(409).json({ error: 'Email already registered' });
    if (existingUsername) return res.status(409).json({ error: 'Username already taken' });

    // Create user
    const user = await User.create({
      username, email, password,
      role: ROLES.CUSTOMER,
      full_name, phone,
    });

    // Create customer profile
    await Customer.create(user.id);

    // Link any existing leads with this email
    await Lead.linkToUser(email, user.id);

    // Generate tokens
    const accessToken  = Token.generateAccessToken(user);
    const refreshToken = await Token.createRefreshToken(
      user.id, req.ip, req.headers['user-agent']
    );

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id:       user.id,
        username: user.username,
        email:    user.email,
        role:     user.role,
      },
      accessToken,
    });
  } catch (err) { next(err); }
});

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', loginRules, validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    // Check brute force — block after 5 failed attempts in 15 mins
    const failedAttempts = await User.countRecentFailedAttempts(email, ipAddress);
    if (failedAttempts >= 5) {
      return res.status(429).json({
        error: 'Too many failed attempts. Please try again in 15 minutes.',
      });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      await User.recordLoginAttempt(email, ipAddress, false, userAgent);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      await User.recordLoginAttempt(email, ipAddress, false, userAgent);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account deactivated. Contact admin.' });
    }

    // Record successful login
    await User.recordLoginAttempt(email, ipAddress, true, userAgent);

    // Generate tokens
    const accessToken  = Token.generateAccessToken(user);
    const refreshToken = await Token.createRefreshToken(user.id, ipAddress, userAgent);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user: {
        id:       user.id,
        username: user.username,
        email:    user.email,
        role:     user.role,
        full_name: user.full_name,
      },
      accessToken,
    });
  } catch (err) { next(err); }
});

// ── POST /api/auth/refresh ────────────────────────────────────
router.post('/refresh', async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken;
    if (!rawToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    // Find token in DB
    const tokenRecord = await Token.findRefreshToken(rawToken);
    if (!tokenRecord) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check expiry
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    // Check revoked
    if (tokenRecord.is_revoked) {
      return res.status(401).json({ error: 'Refresh token revoked' });
    }

    // Check user still active
    if (!tokenRecord.is_active) {
      return res.status(401).json({ error: 'Account deactivated' });
    }

    // Rotate token (detects reuse attacks)
    let newRefreshToken;
    try {
      newRefreshToken = await Token.rotateRefreshToken(
        rawToken,
        tokenRecord.user_id,
        req.ip,
        req.headers['user-agent']
      );
    } catch (err) {
      if (err.message === 'REUSE_DETECTED') {
        res.clearCookie('refreshToken');
        return res.status(401).json({
          error: 'Token reuse detected. Please login again.',
        });
      }
      throw err;
    }

    // Generate new access token
    const accessToken = Token.generateAccessToken({
      id:       tokenRecord.user_id,
      role:     tokenRecord.role,
      username: tokenRecord.username,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) { next(err); }
});

// ── POST /api/auth/logout ─────────────────────────────────────
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    await Token.revokeAllUserTokens(req.user.id);
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (err) { next(err); }
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
});

module.exports = router;