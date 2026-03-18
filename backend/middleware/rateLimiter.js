require('../env');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { ipKeyGenerator } = require('express-rate-limit');
const Redis = require('ioredis');

const IS_PROD = process.env.NODE_ENV === 'production';

// ── Redis Client ──────────────────────────────────────────────
const redis = new Redis({
  host:                 process.env.REDIS_HOST     || '127.0.0.1',
  port:                 parseInt(process.env.REDIS_PORT) || 6379,
  password:             process.env.REDIS_PASSWORD || undefined,
  tls:                  process.env.REDIS_TLS === 'true' ? {} : undefined,
  lazyConnect:          true,
  enableOfflineQueue:   true,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(100 * Math.pow(2, times), 10000);
    console.warn(`[Redis] Reconnecting in ${delay}ms (attempt ${times})`);
    return delay;
  },
});

if (IS_PROD) {
  redis.connect()
    .then(() => { redisReady = true; console.log('[Redis] Connected ✓'); })
    .catch(err => console.error('[Redis] Failed to connect:', err.message));

  redis.on('ready',        ()    => { redisReady = true;  console.log('[Redis] Ready'); });
  redis.on('close',        ()    => { redisReady = false; console.warn('[Redis] Connection closed'); });
  redis.on('reconnecting', ()    => { redisReady = false; });
  redis.on('error',        (err) => console.error('[Redis] Error:', err.message));
} else {
  console.log('[Redis] Skipped in development — memory store active');
}

let redisReady = false;

// ── Store Factory ─────────────────────────────────────────────
const makeStore = (prefix) => {
  if (!IS_PROD) return undefined;  // memory store in dev
  return new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix:      `rl:${prefix}:`,
  });
};

// ── Key Generator ─────────────────────────────────────────────
const keyGenerator = (req) => {
  const forwarded = req.headers['x-forwarded-for']?.split(',')[0].trim();
  if (forwarded) return forwarded;
  return ipKeyGenerator(req);
};

// ── 429 Handler ───────────────────────────────────────────────
const rateLimitHandler = (_req, res, _next, options) => {
  res.status(429).json({
    error:      'Too many requests. Please slow down.',
    retryAfter: Math.ceil(options.windowMs / 1000 / 60),
    limit:      options.max,
  });
};

// ── Limiter Factory ───────────────────────────────────────────
const makeLimiter = (options) => {
  if (!IS_PROD) return (_req, _res, next) => next();  // no-op in dev
  return rateLimit({
    standardHeaders: true,
    legacyHeaders:   false,
    keyGenerator,
    handler:         rateLimitHandler,
    ...options,
  });
};

// ── Limiters ──────────────────────────────────────────────────
const globalLimiter = makeLimiter({
  windowMs: 5 * 60 * 1000,
  max:      300,
  store:    makeStore('global'),
  skip: (req) =>
    req.path.startsWith('/api/auth') ||
    req.path.startsWith('/api/notifications/stream'),
});

const authLimiter = makeLimiter({
  windowMs:               15 * 60 * 1000,
  max:                    10,
  store:                  makeStore('auth'),
  skipSuccessfulRequests: true,
});

const paymentLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max:      20,
  store:    makeStore('payment'),
});

const publicLimiter = makeLimiter({
  windowMs: 10 * 60 * 1000,
  max:      60,
  store:    makeStore('public'),
});

const writeLimiter = makeLimiter({
  windowMs: 10 * 60 * 1000,
  max:      30,
  store:    makeStore('write'),
});

module.exports = {
  globalLimiter,
  authLimiter,
  paymentLimiter,
  publicLimiter,
  writeLimiter,
  redis,
};
