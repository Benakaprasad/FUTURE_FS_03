const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const notify             = require('../helpers/notify');
const Trainer            = require('../models/Trainer');
const User               = require('../models/User');
const { authenticate }   = require('../middleware/auth');
const { authorize }      = require('../middleware/role');
const { validate }       = require('../middleware/validate');
const { ROLE_GROUPS, ROLES }  = require('../constants/roles');
const { TRAINER_STATUSES }    = require('../constants/statuses');
const pool = require('../config/database');

router.use(authenticate);

// GET /api/trainers
router.get('/',
  authorize(ROLE_GROUPS.INTERNAL_STAFF),
  async (req, res, next) => {
    try {
      const trainers = await Trainer.findAll({ status: req.query.status });
      res.json({ trainers });
    } catch (err) { next(err); }
  }
);

// GET /api/trainers/me
router.get('/me',
  authorize(ROLES.TRAINER),
  async (req, res, next) => {
    try {
      const trainer = await Trainer.findByUserId(req.user.id);
      if (!trainer) return res.status(404).json({ error: 'Trainer profile not found' });
      res.json({ trainer });
    } catch (err) { next(err); }
  }
);

// GET /api/trainers/me/members
router.get('/me/members',
  authorize(ROLES.TRAINER),
  async (req, res, next) => {
    try {
      const members = await Trainer.getAssignedMembers(req.user.id);
      res.json({ members });
    } catch (err) { next(err); }
  }
);

// GET /api/trainers/pending
router.get('/pending',
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  async (req, res, next) => {
    try {
      const { rows } = await pool.query(
        `SELECT t.*, u.username, u.email, u.full_name, u.phone, u.created_at as registered_at
         FROM trainers t
         JOIN users u ON t.user_id = u.id
         WHERE t.status = 'inactive'
         ORDER BY u.created_at DESC`
      );
      res.json({ trainers: rows });
    } catch (err) { next(err); }
  }
);

// GET /api/trainers/:id
router.get('/:id',
  authorize(ROLE_GROUPS.INTERNAL_STAFF),
  async (req, res, next) => {
    try {
      const trainer = await Trainer.findById(req.params.id);
      if (!trainer) return res.status(404).json({ error: 'Trainer not found' });
      res.json({ trainer });
    } catch (err) { next(err); }
  }
);

// PUT /api/trainers/:id
router.put('/:id',
  authorize(ROLE_GROUPS.ADMIN_ONLY), [
    body('specialization').optional().trim().isLength({ max: 100 }),
    body('experience_years').optional().isInt({ min: 0, max: 50 }),
    body('max_clients').optional().isInt({ min: 1 }),
    body('hourly_rate').optional().isFloat({ min: 0 }),
  ], validate,
  async (req, res, next) => {
    try {
      const trainer = await Trainer.update(req.params.id, req.body);
      if (!trainer) return res.status(404).json({ error: 'Trainer not found' });
      res.json({ message: 'Trainer updated', trainer });
    } catch (err) { next(err); }
  }
);

// PUT /api/trainers/me/profile
router.put('/me/profile',
  authorize(ROLES.TRAINER), [
    body('bio').optional().trim(),
    body('availability').optional().trim(),
    body('specialization').optional().trim(),
  ], validate,
  async (req, res, next) => {
    try {
      const trainer = await Trainer.findByUserId(req.user.id);
      if (!trainer) return res.status(404).json({ error: 'Trainer profile not found' });
      const updated = await Trainer.update(trainer.id, req.body);
      res.json({ message: 'Profile updated', trainer: updated });
    } catch (err) { next(err); }
  }
);

// PATCH /api/trainers/:id/status
router.patch('/:id/status',
  authorize(ROLE_GROUPS.ADMIN_ONLY), [
    body('status').isIn(TRAINER_STATUSES),
  ], validate,
  async (req, res, next) => {
    try {
      const trainer = await Trainer.updateStatus(req.params.id, req.body.status);
      if (!trainer) return res.status(404).json({ error: 'Trainer not found' });
      res.json({ message: 'Trainer status updated', trainer });
    } catch (err) { next(err); }
  }
);

// PATCH /api/trainers/:id/approve
router.patch('/:id/approve',
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  async (req, res, next) => {
    const client = await pool.connect();
    let trainer  = null;
    let user     = null;

    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `UPDATE trainers SET status = 'active'
         WHERE id = $1 RETURNING *`,
        [req.params.id]
      );
      if (!rows[0]) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Trainer not found' });
      }
      trainer = rows[0];

      // Fetch user details for the email
      user = await User.findById(trainer.user_id);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
      return;
    } finally {
      client.release();
    }

    // ── Outside transaction — email + SSE ─────────────────
    if (user) {
      await notify.trainerApproved({
        full_name: user.full_name,
        username:  user.username,
        email:     user.email,
      });
    }

    res.json({ message: 'Trainer approved', trainer });
  }
);

// PATCH /api/trainers/:id/reject
router.patch('/:id/reject',
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  async (req, res, next) => {
    try {
      const { notes } = req.body;

      const { rows } = await pool.query(
        `UPDATE trainers SET status = 'on_leave', notes = $2
         WHERE id = $1 RETURNING *`,
        [req.params.id, notes || null]
      );
      if (!rows[0]) return res.status(404).json({ error: 'Trainer not found' });

      const trainer = rows[0];

      // Fetch user for email
      const user = await User.findById(trainer.user_id);
      if (user) {
        await notify.trainerRejected({
          full_name: user.full_name,
          username:  user.username,
          email:     user.email,
        }, notes || null);
      }

      res.json({ message: 'Trainer rejected', trainer });
    } catch (err) { next(err); }
  }
);

module.exports = router;