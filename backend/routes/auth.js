require('../env');
const express   = require('express');
const { body }  = require('express-validator');
const router    = express.Router();

const User     = require('../models/User');
const Token    = require('../models/Token');
const Customer = require('../models/Customer');
const Lead     = require('../models/Lead');
const Reward   = require('../models/Reward');          // ← NEW
const { validate }      = require('../middleware/validate');
const { authenticate }  = require('../middleware/auth');
const { ROLES }         = require('../constants/roles');
const pool = require('../config/database');
const notify = require('../helpers/notify');
const { redis } = require('../middleware/rateLimiter');

const IS_PROD = process.env.NODE_ENV === 'production';

// ── Cookie options ────────────────────────────────────────────
const refreshCookieOptions = {
  httpOnly: true,
  secure:   IS_PROD,
  sameSite: IS_PROD ? 'none' : 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000,
};

// ── Validation Rules ──────────────────────────────────────────
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

    const requestedRole = req.body.role || ROLES.CUSTOMER;
    const allowedRoles  = [ROLES.CUSTOMER, ROLES.TRAINER];

    if (!allowedRoles.includes(requestedRole)) {
      return res.status(403).json({ error: 'Cannot self-register with that role' });
    }

    const [existingEmail, existingUsername] = await Promise.all([
      User.findByEmail(email),
      User.findByUsername(username),
    ]);
    if (existingEmail)    return res.status(409).json({ error: 'Email already registered' });
    if (existingUsername) return res.status(409).json({ error: 'Username already taken' });

    const user = await User.create({
      username, email, password, role: requestedRole, full_name, phone,
    });

    if (requestedRole === ROLES.TRAINER) {
      await notify.trainerRegistered(user);
      await pool.query(
        `INSERT INTO trainers
           (user_id, status, specialization, experience_years,
            certifications, bio, availability, hourly_rate)
         VALUES ($1, 'inactive', $2, $3, $4, $5, $6, $7)`,
        [
          user.id,
          req.body.specialization   || null,
          req.body.experience_years || null,
          req.body.certifications   || null,
          req.body.bio              || null,
          req.body.availability     || null,
          req.body.hourly_rate      || null,
        ]
      );
    } else {
      // ── CUSTOMER PATH ─────────────────────────────────────
      await notify.customerRegistered(user);

      // 1. Create the customer row (your existing call)
      const customer = await Customer.create(user.id);

      // 2. Save reward — always runs, even if user skipped the game
      await Reward.createForCustomer({
        customerId:     customer.id,
        peakWpm:        Number(req.body.reward_peak_wpm)    || 0,
        accuracy:       Number(req.body.reward_accuracy)    || 0,
        phrasesTyped:   Number(req.body.reward_phrases_typed) || 0,
        bonusRoundDone: req.body.reward_bonus_round === true ||
                        req.body.reward_bonus_round === 'true',
      });
    }

    await Lead.linkToUser(email, user.id);

    const accessToken  = Token.generateAccessToken(user);
    const refreshToken = await Token.createRefreshToken(
      user.id, req.ip, req.headers['user-agent']
    );

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id:        user.id,
        username:  user.username,
        email:     user.email,
        role:      user.role,
        full_name: user.full_name || null,
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

    const failedAttempts = await User.countRecentFailedAttempts(email, ipAddress);
    if (failedAttempts >= 5) {
      return res.status(429).json({
        error: 'Too many failed attempts. Please try again in 15 minutes.',
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      await User.recordLoginAttempt(email, ipAddress, false, userAgent);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      await User.recordLoginAttempt(email, ipAddress, false, userAgent);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account deactivated. Contact admin.' });
    }

    await User.recordLoginAttempt(email, ipAddress, true, userAgent);

    const accessToken  = Token.generateAccessToken(user);
    const refreshToken = await Token.createRefreshToken(user.id, ipAddress, userAgent);

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    res.json({
      message: 'Login successful',
      user: {
        id:        user.id,
        username:  user.username,
        email:     user.email,
        role:      user.role,
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

    const tokenRecord = await Token.findRefreshToken(rawToken);
    if (!tokenRecord) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    if (tokenRecord.is_revoked) {
      return res.status(401).json({ error: 'Refresh token revoked' });
    }

    if (!tokenRecord.is_active) {
      return res.status(401).json({ error: 'Account deactivated' });
    }

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
        res.clearCookie('refreshToken', refreshCookieOptions);
        return res.status(401).json({
          error: 'Token reuse detected. Please login again.',
        });
      }
      throw err;
    }

    const accessToken = Token.generateAccessToken({
      id:       tokenRecord.user_id,
      role:     tokenRecord.role,
      username: tokenRecord.username,
    });

    res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);

    res.json({
      accessToken,
      user: {
        id:        tokenRecord.user_id,
        username:  tokenRecord.username,
        email:     tokenRecord.email,
        role:      tokenRecord.role,
        full_name: tokenRecord.full_name || null,
      },
    });
  } catch (err) { next(err); }
});

// ── POST /api/auth/logout ─────────────────────────────────────
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    await Promise.all([
      Token.revokeAllUserTokens(req.user.id),
      redis.del(`user:${req.user.id}`),
    ]);
    res.clearCookie('refreshToken', refreshCookieOptions);
    res.json({ message: 'Logged out successfully' });
  } catch (err) { next(err); }
});

// ── GET /api/auth/me ──────────────────────────────────────────
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const cacheKey = `user:${req.user.id}`;

    const cached = await redis.get(cacheKey);
    if (cached) return res.json({ user: JSON.parse(cached) });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await redis.setex(cacheKey, 300, JSON.stringify(user));
    res.json({ user });
  } catch (err) { next(err); }
});

module.exports = router;