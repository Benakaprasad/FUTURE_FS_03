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
  enableOfflineQueue:   false,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 5) return null;
    const delay = Math.min(100 * Math.pow(2, times), 10000);
    console.warn(`[Redis] Reconnecting in ${delay}ms (attempt ${times})`);
    return delay;
  },
});

let redisReady = false;

redis.on('ready',        ()    => { redisReady = true;  console.log('[Redis] Ready'); });
redis.on('close',        ()    => { redisReady = false; console.warn('[Redis] Connection closed'); });
redis.on('reconnecting', ()    => { redisReady = false; });
redis.on('error',        (err) => console.error('[Redis] Error:', err.message));

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

// ── Store Factory ─────────────────────────────────────────────
const makeStore = (prefix) => {
  if (!IS_PROD || !redisReady) return undefined;
  return new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix:      `rl:${prefix}:`,
  });
};

// ── No-op middleware for dev ──────────────────────────────────
const noop = (_req, _res, next) => next();

// ── Limiter placeholders (populated by init()) ────────────────
let globalLimiter  = noop;
let authLimiter    = noop;
let paymentLimiter = noop;
let publicLimiter  = noop;
let writeLimiter   = noop;

// ── init() — call this in server.js BEFORE registering routes ─
const init = async () => {
  if (IS_PROD) {
    try {
      await redis.connect();
      redisReady = true;
      console.log('[Redis] Connected ✓');
    } catch (err) {
      console.error('[Redis] Failed to connect — using memory store fallback:', err.message);
    }
  }

  if (!IS_PROD) return; // leave all limiters as noop in dev

  const makeLimiter = (options) =>
    rateLimit({
      standardHeaders: true,
      legacyHeaders:   false,
      keyGenerator,
      handler:         rateLimitHandler,
      ...options,
    });

  globalLimiter = makeLimiter({
    windowMs: 5 * 60 * 1000,
    max:      300,
    store:    makeStore('global'),
    skip: (req) =>
      req.path.startsWith('/api/auth') ||
      req.path.startsWith('/api/notifications/stream'),
  });

  authLimiter = makeLimiter({
    windowMs:               15 * 60 * 1000,
    max:                    10,
    store:                  makeStore('auth'),
    skipSuccessfulRequests: true,
  });

  paymentLimiter = makeLimiter({
    windowMs: 60 * 60 * 1000,
    max:      20,
    store:    makeStore('payment'),
  });

  publicLimiter = makeLimiter({
    windowMs: 10 * 60 * 1000,
    max:      60,
    store:    makeStore('public'),
  });

  writeLimiter = makeLimiter({
    windowMs: 10 * 60 * 1000,
    max:      30,
    store:    makeStore('write'),
  });

  console.log(`[RateLimit] Limiters ready (store: ${redisReady ? 'Redis' : 'memory'})`);
};

module.exports = {
  init,
  get globalLimiter()  { return globalLimiter;  },
  get authLimiter()    { return authLimiter;     },
  get paymentLimiter() { return paymentLimiter;  },
  get publicLimiter()  { return publicLimiter;   },
  get writeLimiter()   { return writeLimiter;    },
  redis,
};