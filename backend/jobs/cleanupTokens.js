const cron = require('node-cron');
const pool = require('../config/database');

// Runs every day at 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('[CRON] Running cleanup job...');
  try {
    await pool.query('SELECT cleanup_expired_records()');
    console.log('[CRON] Cleanup complete');

    // Expire memberships whose end_date has passed
    const { rows } = await pool.query('SELECT expire_memberships()');
    console.log(`[CRON] Expired ${rows[0].expire_memberships} memberships`);
  } catch (err) {
    console.error('[CRON] Cleanup failed:', err.message);
  }
});