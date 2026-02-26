require('./env');

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const compression  = require('compression');
const cookieParser = require('cookie-parser');
const hpp          = require('hpp');
const {sanitize} = require('./middleware/sanitize');
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

// Jobs
require('./jobs/cleanupTokens');

const PORT     = process.env.PORT     || 3000;
const IS_PROD  = process.env.NODE_ENV === 'production';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();

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
app.use(globalLimiter);
app.use('/api/auth', authLimiter);

// ── 6. Body Parsing ───────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── 7. Sanitization ───────────────────────────────────────────
app.use(sanitize);
app.use(hpp());

// ── 8. Health Check ───────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success:     true,
    status:      'healthy',
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
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

// ── 10. Serve Frontend (production) ───────────────────────────
if (IS_PROD) {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
}

// ── 11. 404 (dev only — prod handled by React Router above) ───
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
app.listen(PORT, () => {
  console.log('─────────────────────────────────────');
  console.log('  FitZone Gym CRM');
  console.log(`  ENV  : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  PORT : ${PORT}`);
  console.log(`  API  : http://localhost:${PORT}/api`);
  console.log('─────────────────────────────────────');
});