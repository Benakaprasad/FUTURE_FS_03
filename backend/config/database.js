require('../env');
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
  max:                20,
  idleTimeoutMillis:  30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('PostgreSQL connected');
  }
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
  process.exit(1);
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => console.log('Database connection verified'))
  .catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;