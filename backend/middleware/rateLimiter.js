const rateLimit = require('express-rate-limit');

// General API limiter
const globalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests, please try again later.' },
});

// Strict limiter for auth routes
const authLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many auth attempts, please try again later.' },
});

// Payment routes limiter
const paymentLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             20,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many payment requests, please try again later.' },
});

module.exports = { globalLimiter, authLimiter, paymentLimiter };