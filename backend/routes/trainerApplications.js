const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const TrainerApplication = require('../models/TrainerApplication');
const User               = require('../models/User');
const Trainer            = require('../models/Trainer');
const { authenticate }   = require('../middleware/auth');
const { authorize }      = require('../middleware/role');
const { validate }       = require('../middleware/validate');
const { ROLE_GROUPS }    = require('../constants/roles');
const pool = require('../config/database');

router.use(authenticate, authorize(ROLE_GROUPS.DECISION_MAKER));

// GET /api/trainer-applications
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const applications = await TrainerApplication.findAll({ status });
    res.json({ applications });
  } catch (err) { next(err); }
});

// GET /api/trainer-applications/:id
router.get('/:id', async (req, res, next) => {
  try {
    const application = await TrainerApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json({ application });
  } catch (err) { next(err); }
});

// PATCH /api/trainer-applications/:id/approve
// Full transaction: approve app + create user + create trainer profile
router.patch('/:id/approve', [
  body('admin_notes').optional().trim(),
  body('username').trim().notEmpty().withMessage('Username required for trainer account'),
  body('password').isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must have uppercase, lowercase and number'),
  body('hourly_rate').optional().isFloat({ min: 0 }),
], validate, async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const application = await TrainerApplication.findById(req.params.id);
    if (!application) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Application not found' });
    }
    if (application.status !== 'pending' && application.status !== 'reviewed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Application already processed' });
    }

    // Check username not taken
    const existingUser = await User.findByUsername(req.body.username);
    if (existingUser) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Username already taken' });
    }

    // 1. Create user account for trainer
    const bcrypt  = require('bcryptjs');
    const hash    = await bcrypt.hash(req.body.password, 12);

    const { rows: userRows } = await client.query(
      `INSERT INTO users
         (username, email, password, role, full_name, phone,
          is_active, is_email_verified, created_by)
       VALUES ($1,$2,$3,'trainer',$4,$5,true,true,$6)
       RETURNING id`,
      [
        req.body.username.toLowerCase(),
        application.email,
        hash,
        application.full_name,
        application.phone || null,
        req.user.id,
      ]
    );
    const newUserId = userRows[0].id;

    // 2. Create trainer profile
    await client.query(
      `INSERT INTO trainers
         (user_id, application_id, specialization, experience_years,
          certifications, bio, hourly_rate)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        newUserId,
        application.id,
        application.specialization || null,
        application.experience_years || null,
        application.certifications || null,
        application.bio || null,
        req.body.hourly_rate || null,
      ]
    );

    // 3. Update application status
    await client.query(
      `UPDATE trainer_applications
       SET status='approved', reviewed_by=$1,
           reviewed_at=NOW(), admin_notes=$2
       WHERE id=$3`,
      [req.user.id, req.body.admin_notes || null, application.id]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Application approved. Trainer account created.',
      trainer_username: req.body.username,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// PATCH /api/trainer-applications/:id/reject
router.patch('/:id/reject', [
  body('admin_notes').optional().trim(),
], validate, async (req, res, next) => {
  try {
    const application = await TrainerApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    if (application.status !== 'pending' && application.status !== 'reviewed') {
      return res.status(400).json({ error: 'Application already processed' });
    }

    await TrainerApplication.reject(
      req.params.id, req.user.id, req.body.admin_notes
    );
    res.json({ message: 'Application rejected' });
  } catch (err) { next(err); }
});

module.exports = router;