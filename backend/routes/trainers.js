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
// ─────────────────────────────────────────────────────────────
// Uses pool.query() only — no pool.connect() — so it works
// with any database.js export pattern (raw pool or query wrapper).
//
// Cascade when → inactive:
//   1. trainer.status = inactive
//   2. members.trainer_id = NULL   (unassigns all their members)
//   3. assignments.status = inactive (soft-closes, keeps history)
//   4. trainer.current_clients = 0
//
// Cascade when → active (reactivation):
//   Recalculates current_clients from live member count
//   so it's never stuck at 0 after reactivation.
// ─────────────────────────────────────────────────────────────
router.patch('/:id/status',
  authorize(ROLE_GROUPS.ADMIN_ONLY), [
    body('status')
      .isIn(TRAINER_STATUSES)
      .withMessage(`Status must be one of: ${TRAINER_STATUSES.join(', ')}`),
  ], validate,
  async (req, res, next) => {
    const { id }     = req.params;
    const { status } = req.body;

    try {
      // ── Step 1: update trainer status ──────────────────────
      const trainerResult = await pool.query(
        `UPDATE trainers
         SET    status     = $1,
                updated_at = NOW()
         WHERE  id = $2
         RETURNING *`,
        [status, id]
      );

      if (!trainerResult.rows[0]) {
        return res.status(404).json({ error: 'Trainer not found' });
      }

      let membersUnassigned = 0;

      // ── Step 2: inactive cascade ───────────────────────────
      if (status === 'inactive') {

        // Unlink all assigned members
        const unlinked = await pool.query(
          `UPDATE members
           SET    trainer_id = NULL,
                  updated_at = NOW()
           WHERE  trainer_id = $1`,
          [id]
        );
        membersUnassigned = unlinked.rowCount;

        // Soft-close active assignments (preserves history)
        await pool.query(
          `UPDATE assignments
           SET    status     = 'inactive',
                  updated_at = NOW()
           WHERE  trainer_id = $1
             AND  status     = 'active'`,
          [id]
        );

        // Zero out the capacity counter
        await pool.query(
          `UPDATE trainers
           SET    current_clients = 0,
                  updated_at      = NOW()
           WHERE  id = $1`,
          [id]
        );
      }

      // ── Step 3: reactivation — recalculate member count ────
      if (status === 'active') {
        await pool.query(
          `UPDATE trainers
           SET    current_clients = (
                    SELECT COUNT(*) FROM members
                    WHERE  trainer_id = $1
                  ),
                  updated_at = NOW()
           WHERE  id = $1`,
          [id]
        );
      }

      // Re-fetch the full trainer record so frontend gets
      // the updated current_clients value immediately
      const trainer = await Trainer.findById(id);

      return res.json({
        message:            `Trainer status updated to ${status}`,
        trainer,
        members_unassigned: membersUnassigned,
      });

    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/trainers/:id/approve
router.patch('/:id/approve',
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  async (req, res, next) => {
    let trainer = null;
    let user    = null;

    try {
      const { rows } = await pool.query(
        `UPDATE trainers SET status = 'active', updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [req.params.id]
      );
      if (!rows[0]) return res.status(404).json({ error: 'Trainer not found' });
      trainer = rows[0];
      user    = await User.findById(trainer.user_id);
    } catch (err) {
      return next(err);
    }

    // Email outside the DB operation so a mail failure
    // doesn't roll back the approval
    if (user) {
      try {
        await notify.trainerApproved({
          full_name: user.full_name,
          username:  user.username,
          email:     user.email,
        });
      } catch (mailErr) {
        console.error('[notify] trainerApproved failed:', mailErr.message);
      }
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
        `UPDATE trainers
         SET    status     = 'on_leave',
                notes      = $2,
                updated_at = NOW()
         WHERE  id = $1
         RETURNING *`,
        [req.params.id, notes || null]
      );
      if (!rows[0]) return res.status(404).json({ error: 'Trainer not found' });

      const trainer = rows[0];

      try {
        const user = await User.findById(trainer.user_id);
        if (user) {
          await notify.trainerRejected({
            full_name: user.full_name,
            username:  user.username,
            email:     user.email,
          }, notes || null);
        }
      } catch (mailErr) {
        console.error('[notify] trainerRejected failed:', mailErr.message);
      }

      res.json({ message: 'Trainer rejected', trainer });
    } catch (err) { next(err); }
  }
);

module.exports = router;