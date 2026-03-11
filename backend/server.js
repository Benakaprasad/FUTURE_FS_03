require('./env');

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const compression  = require('compression');
const cookieParser = require('cookie-parser');
const hpp          = require('hpp');
const { sanitize } = require('./middleware/sanitize');
const path         = require('path');

const { globalLimiter, authLimiter } = require('./middleware/rateLimiter');

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

// DB (adjust path to your actual db/prisma/mongoose connection export)
// const db = require('./db');

const PORT       = process.env.PORT     || 3000;
const IS_PROD    = process.env.NODE_ENV === 'production';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ── Graceful Shutdown State ───────────────────────────────────
let isShuttingDown = false;

const app = express();

// ── Trust Nginx Proxy ─────────────────────────────────────────
// Required so req.ip / rate-limiters see the real client IP
// (not 127.0.0.1) when sitting behind Nginx.
app.set('trust proxy', 1);

// ── Readiness Gate ────────────────────────────────────────────
// Reject new requests during shutdown so Nginx can drain cleanly.
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
app.use('/api/auth', authLimiter);

app.use((req, res, next) => {
  if (!IS_PROD) return next();
  if (req.path.startsWith('/api/auth')) return next();
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
// /health  → for Nginx upstream checks & monitoring dashboards
// /ready   → for orchestrators (PM2, k8s) — returns 503 during shutdown
app.get('/health', (_req, res) => {
  res.status(200).json({
    success:     true,
    status:      'healthy',
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime:      Math.floor(process.uptime()),
    memory:      process.memoryUsage(),
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
    maxAge: '7d',         // Let Nginx / CDN cache static assets
    etag:   true,
  }));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

// ── 11. 404 (dev only) ────────────────────────────────────────
if (!IS_PROD) {
  app.use((req, res) => {
    res.status(404).json({
      error: `Route ${req.method} ${req.originalUrl} not found`,
    });
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
const server = app.listen(PORT, () => {
  console.log('─────────────────────────────────────');
  console.log('  FitZone Gym CRM');
  console.log(`  ENV  : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  PORT : ${PORT}`);
  console.log(`  API  : http://localhost:${PORT}/api`);
  console.log('─────────────────────────────────────');
});

// ── 14. Graceful Shutdown ─────────────────────────────────────
// How it works:
//   1. Signal received (SIGTERM from PM2/systemd, SIGINT from Ctrl-C)
//   2. Mark server as shutting down → new requests get 503
//   3. Stop accepting new TCP connections
//   4. Wait up to SHUTDOWN_TIMEOUT for in-flight requests to finish
//   5. Close DB / other resources
//   6. Exit cleanly (code 0) or forcefully (code 1) on timeout

const SHUTDOWN_TIMEOUT = parseInt(process.env.SHUTDOWN_TIMEOUT_MS || '10000', 10);

async function gracefulShutdown(signal) {
  if (isShuttingDown) return; // prevent double-trigger
  isShuttingDown = true;

  console.log(`\n[shutdown] Received ${signal}. Starting graceful shutdown…`);

  // 1. Stop accepting new connections
  server.close(async (err) => {
    if (err) {
      console.error('[shutdown] Error closing HTTP server:', err);
    } else {
      console.log('[shutdown] HTTP server closed — no new connections.');
    }

    try {
      // 2. Close your DB connection here, e.g.:
      //    await db.disconnect();         // Mongoose
      //    await prisma.$disconnect();    // Prisma
      //    await pool.end();              // pg / mysql2
      console.log('[shutdown] Database connections closed.');
    } catch (dbErr) {
      console.error('[shutdown] Error closing DB connections:', dbErr);
    }

    console.log('[shutdown] Clean exit. Goodbye 👋');
    process.exit(err ? 1 : 0);
  });

  // Force-exit if connections are still open after timeout
  setTimeout(() => {
    console.error(`[shutdown] Timeout (${SHUTDOWN_TIMEOUT}ms) exceeded — forcing exit.`);
    process.exit(1);
  }, SHUTDOWN_TIMEOUT).unref(); // .unref() so this timer doesn't keep the loop alive on its own
}

// Handle keep-alive connections so server.close() can finish promptly
server.on('connection', (socket) => {
  socket.on('close', () => {}); // no-op, just ensure Node tracks the socket
});

// Keep-alive header trick: tell clients to close connections when shutting down
server.on('request', (req, res) => {
  if (isShuttingDown) {
    res.setHeader('Connection', 'close');
  }
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // PM2 / systemd stop
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));  // Ctrl-C in terminal

// Catch unhandled promise rejections — log and exit so the process manager restarts cleanly
process.on('unhandledRejection', (reason, promise) => {
  console.error('[unhandledRejection]', { reason, promise });
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  gracefulShutdown('uncaughtException');
});