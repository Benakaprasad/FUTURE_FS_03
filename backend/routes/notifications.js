require('../env');
const express = require('express');
const router  = express.Router();
const pool    = require('../config/database');
const { authenticate } = require('../middleware/auth');

// ── SSE client registry ────────────────────────────────────────
// Map of role → Set of SSE response objects
const clients = new Map();

function getClients(role) {
  if (!clients.has(role)) clients.set(role, new Set());
  return clients.get(role);
}

// Called by notify.js after every DB insert
function pushToRole(role, notification) {
  const roleClients = clients.get(role);
  if (!roleClients) return;
  const payload = `data: ${JSON.stringify(notification)}\n\n`;
  roleClients.forEach((res) => {
    try { res.write(payload); } catch {}
  });
}

// ── GET /api/notifications/stream  (SSE) ──────────────────────
router.get('/stream', authenticate, (req, res) => {
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // nginx fix
  res.flushHeaders();

  // Send a heartbeat every 25s to keep connection alive
  const heartbeat = setInterval(() => {
    try { res.write(': ping\n\n'); } catch {}
  }, 25000);

  const role = req.user.role;
  getClients(role).add(res);

  req.on('close', () => {
    clearInterval(heartbeat);
    getClients(role).delete(res);
  });
});

// ── GET /api/notifications ─────────────────────────────────────
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM notifications
       WHERE target_role = $1
       ORDER BY is_read ASC, created_at DESC
       LIMIT 50`,
      [req.user.role]
    );
    res.json({ notifications: rows });
  } catch (err) { next(err); }
});

// ── PATCH /api/notifications/read-all ─────────────────────────
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE target_role = $1`,
      [req.user.role]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ── PATCH /api/notifications/:id/read ─────────────────────────
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND target_role = $2`,
      [req.params.id, req.user.role]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = { router, pushToRole };