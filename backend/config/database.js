require('../env');
const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max:                    20,
        idleTimeoutMillis:      30000,
        connectionTimeoutMillis: 10000,
      }
    : {
        host:     process.env.DB_HOST,
        port:     parseInt(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
        user:     process.env.DB_USER,
        password: process.env.DB_PASS,
        max:                    20,
        idleTimeoutMillis:      30000,
        connectionTimeoutMillis: 10000,
        ssl: false,
      }
);

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') console.log('PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

// Retry on startup
const connectWithRetry = async (retries = 5, delay = 3000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query('SELECT NOW()');
      console.log('Database connection verified');
      return;
    } catch (err) {
      console.warn(`DB connect attempt ${i}/${retries} failed: ${err.message}`);
      if (i === retries) {
        console.error('Could not connect to database. Exiting.');
        process.exit(1);
      }
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

const dbReady = connectWithRetry();
module.exports = pool;
module.exports.dbReady = dbReady;
