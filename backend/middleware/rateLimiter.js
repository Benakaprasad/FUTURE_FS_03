require('../env');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis      = require('ioredis');

const redis = new Redis({
  host:     process.env.REDIS_HOST || '127.0.0.1',
  port:     parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  enableOfflineQueue: false, // fail fast if Redis is down
});

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

const makeStore = (prefix) => new RedisStore({
  sendCommand: (...args) => redis.call(...args),
  prefix,
});

const globalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  store:           makeStore('rl:global:'),
  skip:            (req) => req.path.startsWith('/api/auth'), // fix your double-limiting bug
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs:               15 * 60 * 1000,
  max:                    10,
  standardHeaders:        true,
  legacyHeaders:          false,
  store:                  makeStore('rl:auth:'),
  skipSuccessfulRequests: true, // successful logins don't count against limit
  message: { error: 'Too many auth attempts, please try again later.' },
});

const paymentLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,
  max:             20,
  standardHeaders: true,
  legacyHeaders:   false,
  store:           makeStore('rl:payment:'),
  message: { error: 'Too many payment requests, please try again later.' },
});

module.exports = { globalLimiter, authLimiter, paymentLimiter, redis };