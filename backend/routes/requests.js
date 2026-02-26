const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const Request    = require('../models/Request');
const Member     = require('../models/Member');
const Customer   = require('../models/Customer');
const { authenticate }  = require('../middleware/auth');
const { authorize }     = require('../middleware/role');
const { validate }      = require('../middleware/validate');
const { ROLE_GROUPS }   = require('../constants/roles');
const { MEMBERSHIP_TYPES } = require('../constants/statuses');
const pool = require('../config/database');

router.use(authenticate);

// GET /api/requests — staff/manager/admin
router.get('/',
  authorize(ROLE_GROUPS.INTERNAL_STAFF),
  async (req, res, next) => {
    try {
      const { status } = req.query;
      const requests = await Request.findAll({ status });
      res.json({ requests });
    } catch (err) { next(err); }
  }
);

// GET /api/requests/my — customer sees own requests
router.get('/my', authorize('customer'), async (req, res, next) => {
  try {
    const customer = await Customer.findByUserId(req.user.id);
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });
    const requests = await Request.findByCustomerId(customer.id);
    res.json({ requests });
  } catch (err) { next(err); }
});

// GET /api/requests/:id
router.get('/:id',
  authorize(ROLE_GROUPS.INTERNAL_STAFF),
  async (req, res, next) => {
    try {
      const request = await Request.findById(req.params.id);
      if (!request) return res.status(404).json({ error: 'Request not found' });
      res.json({ request });
    } catch (err) { next(err); }
  }
);

// POST /api/requests — customer submits membership request
router.post('/', authorize('customer'), [
  body('membership_type').isIn(MEMBERSHIP_TYPES).withMessage('Invalid membership type'),
  body('message').optional().trim().isLength({ max: 500 }),
  body('preferred_trainer_id').optional().isInt(),
], validate, async (req, res, next) => {
  try {
    const customer = await Customer.findByUserId(req.user.id);
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });

    const request = await Request.create({
      customer_id:          customer.id,
      preferred_trainer_id: req.body.preferred_trainer_id || null,
      membership_type:      req.body.membership_type,
      message:              req.body.message,
    });

    await Customer.updateStatus(customer.id, 'pending_approval');

    res.status(201).json({ message: 'Membership request submitted', request });
  } catch (err) {
    // Partial unique index violation — already has open request
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'You already have a pending request. Wait for it to be reviewed.',
      });
    }
    next(err);
  }
});

// PATCH /api/requests/:id/approve — manager/admin
// Full transaction: approve request + create member + update customer status
router.patch('/:id/approve',
  authorize(ROLE_GROUPS.DECISION_MAKER), [
    body('admin_notes').optional().trim(),
    body('start_date').notEmpty().isISO8601().withMessage('Valid start date required'),
    body('end_date').optional().isISO8601(),
    body('amount_paid').optional().isFloat({ min: 0 }),
  ], validate,
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const request = await Request.findById(req.params.id);
      if (!request) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Request not found' });
      }
      if (request.status !== 'pending' && request.status !== 'reviewed') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Request already processed' });
      }

      // 1. Approve request
      await client.query(
        `UPDATE requests SET status='approved', reviewed_by=$1,
         reviewed_at=NOW(), admin_notes=$2 WHERE id=$3`,
        [req.user.id, req.body.admin_notes || null, req.params.id]
      );

      // 2. Create member
      await client.query(
        `INSERT INTO members
           (customer_id, membership_type, start_date, end_date,
            payment_status, amount_paid, request_id, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          request.customer_id,
          request.membership_type,
          req.body.start_date,
          req.body.end_date || null,
          req.body.amount_paid ? 'paid' : 'pending',
          req.body.amount_paid || null,
          request.id,
          req.user.id,
        ]
      );

      // 3. Update customer status to active
      await client.query(
        `UPDATE customers SET status='active' WHERE id=$1`,
        [request.customer_id]
      );

      await client.query('COMMIT');
      res.json({ message: 'Request approved and membership created' });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);

// PATCH /api/requests/:id/reject
router.patch('/:id/reject',
  authorize(ROLE_GROUPS.DECISION_MAKER), [
    body('admin_notes').optional().trim(),
  ], validate,
  async (req, res, next) => {
    try {
      const request = await Request.findById(req.params.id);
      if (!request) return res.status(404).json({ error: 'Request not found' });
      if (request.status !== 'pending' && request.status !== 'reviewed') {
        return res.status(400).json({ error: 'Request already processed' });
      }

      await Request.reject(req.params.id, req.user.id, req.body.admin_notes);
      await Customer.updateStatus(request.customer_id, 'registered');

      res.json({ message: 'Request rejected' });
    } catch (err) { next(err); }
  }
);

module.exports = router;