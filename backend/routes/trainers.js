const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const Trainer          = require('../models/Trainer');
const User             = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/role');
const { validate }     = require('../middleware/validate');
const { ROLE_GROUPS, ROLES } = require('../constants/roles');
const { TRAINER_STATUSES }   = require('../constants/statuses');

router.use(authenticate);

// GET /api/trainers — internal staff view
router.get('/',
  authorize(ROLE_GROUPS.INTERNAL_STAFF),
  async (req, res, next) => {
    try {
      const trainers = await Trainer.findAll({ status: req.query.status });
      res.json({ trainers });
    } catch (err) { next(err); }
  }
);

// GET /api/trainers/me — trainer sees own profile
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

// GET /api/trainers/me/members — trainer sees assigned members
router.get('/me/members',
  authorize(ROLES.TRAINER),
  async (req, res, next) => {
    try {
      const members = await Trainer.getAssignedMembers(req.user.id);
      res.json({ members });
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

// PUT /api/trainers/:id — manager/admin update
router.put('/:id',
  authorize(ROLE_GROUPS.DECISION_MAKER), [
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

// PUT /api/trainers/me/profile — trainer updates own profile
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

// PATCH /api/trainers/:id/status — admin only
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

router.get('/pending',
  authorize(ROLE_GROUPS.DECISION_MAKER),
  async (req, res, next) => {
    try {
      const { rows } = await require('../config/database').query(
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

// PATCH /api/trainers/:id/approve — admin/manager approves trainer
router.patch('/:id/approve',
  authorize(ROLE_GROUPS.DECISION_MAKER),
  async (req, res, next) => {
    const client = await require('../config/database').connect();
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
      await client.query('COMMIT');
      res.json({ message: 'Trainer approved', trainer: rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);

// PATCH /api/trainers/:id/reject — admin/manager rejects trainer
router.patch('/:id/reject',
  authorize(ROLE_GROUPS.DECISION_MAKER),
  async (req, res, next) => {
    try {
      const { rows } = await require('../config/database').query(
        `UPDATE trainers SET status = 'on_leave'
         WHERE id = $1 RETURNING *`,
        [req.params.id]
      );
      if (!rows[0]) return res.status(404).json({ error: 'Trainer not found' });
      res.json({ message: 'Trainer rejected', trainer: rows[0] });
    } catch (err) { next(err); }
  }
);

module.exports = router;