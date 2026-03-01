const cron = require('node-cron');
const pool = require('../config/database');

const runCleanup = async () => {
  console.log('[CRON] Running cleanup job...');
  const start = Date.now();
  try {
    const [, { rows }] = await Promise.all([
      pool.query('SELECT cleanup_expired_records()'),
      pool.query('SELECT expire_memberships()'),
    ]);
    const duration = Date.now() - start;
    console.log(`[CRON] Complete in ${duration}ms — expired ${rows[0].expire_memberships} memberships`);
  } catch (err) {
    console.error('[CRON] Cleanup failed:', err.message);
    // Don't rethrow — cron should keep running on next schedule
  }
};

// Run at 2AM daily
cron.schedule('0 2 * * *', runCleanup);

// Also run once on startup to catch any missed window (e.g. server was down at 2AM)
runCleanup();