const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const notify               = require('../helpers/notify');
const Member               = require('../models/Member');
const Customer             = require('../models/Customer');
const { authenticate }     = require('../middleware/auth');
const { authorize }        = require('../middleware/role');
const { validate }         = require('../middleware/validate');
const { ROLE_GROUPS, ROLES }               = require('../constants/roles');
const { MEMBERSHIP_TYPES, MEMBER_STATUSES } = require('../constants/statuses');
const pool = require('../config/database');

router.use(authenticate);

// GET /api/members/my
router.get('/my', authorize(ROLES.CUSTOMER), async (req, res, next) => {
  try {
    const customer = await Customer.findByUserId(req.user.id);
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });

    const { rows } = await pool.query(
      `SELECT m.*,
              m.membership_type AS plan_type,
              u.full_name AS trainer_name
       FROM members m
       LEFT JOIN assignments a ON a.member_id = m.id AND a.status = 'active'
       LEFT JOIN users u ON u.id = a.trainer_id
       WHERE m.customer_id = $1
       ORDER BY m.created_at DESC`,
      [customer.id]
    );
    res.json({ members: rows });
  } catch (err) { next(err); }
});

// GET /api/members/expiring
router.get('/expiring',
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  async (req, res, next) => {
    try {
      const days    = parseInt(req.query.days) || 7;
      const members = await Member.getExpiringSoon(days);
      res.json({ members });
    } catch (err) { next(err); }
  }
);

// GET /api/members
router.get('/',
  authorize(ROLE_GROUPS.INTERNAL_STAFF),
  async (req, res, next) => {
    try {
      const members = await Member.findAll({ status: req.query.status });
      res.json({ members });
    } catch (err) { next(err); }
  }
);

// GET /api/members/:id
router.get('/:id',
  authorize(ROLE_GROUPS.INTERNAL_STAFF),
  async (req, res, next) => {
    try {
      const member = await Member.findById(req.params.id);
      if (!member) return res.status(404).json({ error: 'Member not found' });
      res.json({ member });
    } catch (err) { next(err); }
  }
);

// POST /api/members — manual walk-in creation
router.post('/',
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  [
    body('customer_id').notEmpty().isInt(),
    body('membership_type').isIn(MEMBERSHIP_TYPES),
    body('start_date').notEmpty().isISO8601(),
    body('end_date').optional().isISO8601(),
    body('amount_paid').optional().isFloat({ min: 0 }),
    body('admission_notes').optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { customer_id, membership_type, start_date, end_date,
              amount_paid, admission_notes } = req.body;

      const customer = await Customer.findById(customer_id);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });

      const existing = await Member.findByCustomerId(customer_id);
      if (existing && existing.status === 'active') {
        return res.status(409).json({ error: 'Customer already has an active membership' });
      }

      const member = await Member.create({
        customer_id, membership_type, start_date, end_date,
        payment_status: amount_paid ? 'paid' : 'pending',
        amount_paid, admission_notes,
        request_id:  null,
        created_by:  req.user.id,
      });

      await Customer.updateStatus(customer_id, 'active');

      // Notify admin — use customer name from the fetched customer object
      const customerName = customer.full_name || customer.username || `Customer #${customer_id}`;
      await notify.membershipRequest(customerName, membership_type);

      res.status(201).json({ message: 'Member created', member });
    } catch (err) { next(err); }
  }
);

// PATCH /api/members/:id/status
router.patch('/:id/status',
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  [
    body('status').isIn(MEMBER_STATUSES),
  ],
  validate,
  async (req, res, next) => {
    try {
      const member = await Member.updateStatus(req.params.id, req.body.status);
      if (!member) return res.status(404).json({ error: 'Member not found' });
      res.json({ message: 'Member status updated', member });
    } catch (err) { next(err); }
  }
);

// DELETE /api/members/:id
router.delete('/:id',
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  async (req, res, next) => {
    try {
      const member = await Member.findById(req.params.id);
      if (!member) return res.status(404).json({ error: 'Member not found' });
      await pool.query(`DELETE FROM members WHERE id=$1`, [req.params.id]);
      res.json({ message: 'Member deleted' });
    } catch (err) {
      if (err.code === '23503') {
        return res.status(400).json({
          error: 'Cannot delete member with active assignments. Reassign trainer first.',
        });
      }
      next(err);
    }
  }
);

module.exports = router;