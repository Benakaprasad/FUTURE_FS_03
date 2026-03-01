require('../env');
const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');

const redis = new Redis({
  host:        process.env.REDIS_HOST || '127.0.0.1',
  port:        parseInt(process.env.REDIS_PORT) || 6379,
  password:    process.env.REDIS_PASSWORD || undefined,
  tls:         {},
  lazyConnect: true,
  enableOfflineQueue: true,
});

redis.connect()
  .then(() => console.log('[Redis] Connected'))
  .catch(err => console.error('[Redis] Failed to connect:', err.message));

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

// Memory store is fine for rate limiting on a single server
const globalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  skip:            (req) => req.path.startsWith('/api/auth'),
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs:               15 * 60 * 1000,
  max:                    10,
  standardHeaders:        true,
  legacyHeaders:          false,
  skipSuccessfulRequests: true,
  message: { error: 'Too many auth attempts, please try again later.' },
});

const paymentLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             20,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many payment requests, please try again later.' },
});

module.exports = { globalLimiter, authLimiter, paymentLimiter, redis };