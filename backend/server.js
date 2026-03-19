require('./env');

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const compression  = require('compression');
const cookieParser = require('cookie-parser');
const hpp          = require('hpp');
const { v4: uuidv4 } = require('uuid');
const { sanitize } = require('./middleware/sanitize');
const path         = require('path');
const pool = require('./config/database');

const {
  init: initRateLimiter,
  globalLimiter,
  authLimiter,
  writeLimiter,
  paymentLimiter,
  publicLimiter,
  redis,
} = require('./middleware/rateLimiter');

// Routes
const authRoutes               = require('./routes/auth');
const leadRoutes               = require('./routes/leads');
const customerRoutes           = require('./routes/customers');
const requestRoutes            = require('./routes/requests');
const memberRoutes             = require('./routes/members');
const trainerApplicationRoutes = require('./routes/trainerApplications');
const trainerRoutes            = require('./routes/trainers');
const assignmentRoutes         = require('./routes/assignments');
const userRoutes               = require('./routes/users');
const publicRoutes             = require('./routes/public');
const paymentRoutes            = require('./routes/payments');
const { router: notificationRoutes } = require('./routes/notifications');

// Jobs
require('./jobs/cleanupTokens');

const PORT       = process.env.PORT     || 3000;
const IS_PROD    = process.env.NODE_ENV === 'production';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ── Graceful Shutdown State ───────────────────────────────────
let isShuttingDown = false;

const app = express();

// ── Trust Render / Nginx Proxy ────────────────────────────────
app.set('trust proxy', 1);

// ── Request ID & Response Time ────────────────────────────────
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  const start = Date.now();
  res.on('finish', () => {
    res.responseTime = Date.now() - start;
  });
  next();
});

// ── Readiness Gate ────────────────────────────────────────────
app.use((req, res, next) => {
  if (isShuttingDown) {
    res.set('Connection', 'close');
    return res.status(503).json({ error: 'Server is shutting down. Please retry.' });
  }
  next();
});

// ── 1. Security Headers ───────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy:     IS_PROD,
  crossOriginEmbedderPolicy: IS_PROD,
}));
app.disable('x-powered-by');

// ── 2. CORS ───────────────────────────────────────────────────
app.use(cors({
  origin:         CLIENT_URL,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:    true,
}));

// ── 3. Compression ────────────────────────────────────────────
app.use(compression());

// ── 4. Logging ────────────────────────────────────────────────
app.use(morgan(IS_PROD ? 'combined' : 'dev'));

// ── 5. Rate Limiting ──────────────────────────────────────────
// 5a. Auth — strict brute-force protection (10 req / 15 min, failures only)
app.use('/api/auth', authLimiter);

// 5b. Public — unauthenticated routes (60 req / 10 min)
app.use('/api/public', publicLimiter);

// 5c. Payments — high-value operations (20 req / 1 hour)
app.use('/api/payments', paymentLimiter);

// 5d. Sensitive writes — trainer applications (30 req / 10 min)
app.use('/api/trainer-applications', writeLimiter);

// 5e. Global catch-all (300 req / 5 min) — SSE stream excluded
app.use((req, res, next) => {
  if (req.path.startsWith('/api/notifications/stream')) return next();
  globalLimiter(req, res, next);
});

// ── 6. Body Parsing ───────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── 7. Sanitization ───────────────────────────────────────────
app.use(sanitize);
app.use(hpp());

// ── 8. Health / Readiness Checks ─────────────────────────────
app.get('/health', async (_req, res) => {
  let redisStatus = IS_PROD ? 'unreachable' : 'skipped';
  if (IS_PROD) {
    try {
      await redis.ping();
      redisStatus = 'connected';
    } catch {
      redisStatus = 'unreachable';
    }
  }

  res.status(200).json({
    success:     true,
    status:      'healthy',
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime:      Math.floor(process.uptime()),
    memory:      process.memoryUsage(),
    redis:       redisStatus,
  });
});

app.get('/ready', (_req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ ready: false, reason: 'shutting_down' });
  }
  res.status(200).json({ ready: true });
});

// ── 9. API Routes ─────────────────────────────────────────────
app.use('/api/auth',                 authRoutes);
app.use('/api/public',               publicRoutes);
app.use('/api/leads',                leadRoutes);
app.use('/api/customers',            customerRoutes);
app.use('/api/requests',             requestRoutes);
app.use('/api/members',              memberRoutes);
app.use('/api/trainer-applications', trainerApplicationRoutes);
app.use('/api/trainers',             trainerRoutes);
app.use('/api/assignments',          assignmentRoutes);
app.use('/api/users',                userRoutes);
app.use('/api/payments',             paymentRoutes);
app.use('/api/notifications',        notificationRoutes);

// ── 10. Serve Frontend (production) ───────────────────────────
if (IS_PROD) {
  app.use(express.static(path.join(__dirname, '../frontend/dist'), {
    maxAge: '7d',
    etag:   true,
  }));
  app.get('/{*path}', (_req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

// ── 11. 404 (dev only) ────────────────────────────────────────
if (!IS_PROD) {
  app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
  });
}

// ── 12. Global Error Handler ──────────────────────────────────
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || err.status || 500;

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, {
    statusCode,
    message: err.message,
    ...(IS_PROD ? {} : { stack: err.stack }),
  });

  res.status(statusCode).json({
    error: IS_PROD && statusCode === 500
      ? 'Something went wrong. Please try again later.'
      : err.message || 'Internal Server Error',
    ...(IS_PROD ? {} : { stack: err.stack }),
  });
});

// ── 13. Start ─────────────────────────────────────────────────
const SHUTDOWN_TIMEOUT = parseInt(process.env.SHUTDOWN_TIMEOUT_MS || '15000', 10);

pool.dbReady.then(async () => {                 // ← async added
  await initRateLimiter();                      // ← connects Redis + builds limiters

  const server = app.listen(PORT, () => {
    console.log('─────────────────────────────────────');
    console.log('  FitZone Gym CRM');
    console.log(`  ENV  : ${process.env.NODE_ENV || 'development'}`);
    console.log(`  PORT : ${PORT}`);
    console.log(`  API  : http://localhost:${PORT}/api`);
    console.log('─────────────────────────────────────');
  });

  // ── Graceful Shutdown ───────────────────────────────────────
  async function gracefulShutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`\n[shutdown] Received ${signal}. Starting graceful shutdown…`);

    server.close(async (err) => {
      if (err) {
        console.error('[shutdown] Error closing HTTP server:', err);
      } else {
        console.log('[shutdown] HTTP server closed — no new connections.');
      }

      try {
        await pool.end();
        console.log('[shutdown] DB pool closed.');
        if (IS_PROD) await redis.quit();
        console.log('[shutdown] Connections closed.');
      } catch (closeErr) {
        console.error('[shutdown] Error closing connections:', closeErr);
      }

      console.log('[shutdown] Clean exit. Goodbye 👋');
      process.exit(err ? 1 : 0);
    });

    setTimeout(() => {
      console.error(`[shutdown] Timeout (${SHUTDOWN_TIMEOUT}ms) exceeded — forcing exit.`);
      process.exit(1);
    }, SHUTDOWN_TIMEOUT).unref();
  }

  server.on('request', (req, res) => {
    if (isShuttingDown) res.setHeader('Connection', 'close');
  });

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[unhandledRejection]', { reason, promise });
    gracefulShutdown('unhandledRejection');
  });

  process.on('uncaughtException', (err) => {
    console.error('[uncaughtException]', err);
    gracefulShutdown('uncaughtException');
  });

}).catch(err => {
  console.error('Failed to connect to database on startup:', err.message);
  process.exit(1);
});