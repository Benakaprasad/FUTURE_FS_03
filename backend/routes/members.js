const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const Member           = require('../models/Member');
const Customer         = require('../models/Customer');
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/role');
const { validate }     = require('../middleware/validate');
const { ROLE_GROUPS }  = require('../constants/roles');
const { MEMBERSHIP_TYPES, MEMBER_STATUSES } = require('../constants/statuses');

router.use(authenticate);

// GET /api/members — internal staff
router.get('/',
  authorize(ROLE_GROUPS.INTERNAL_STAFF),
  async (req, res, next) => {
    try {
      const members = await Member.findAll({ status: req.query.status });
      res.json({ members });
    } catch (err) { next(err); }
  }
);

// GET /api/members/my — customer sees own membership
router.get('/my', authorize('customer'), async (req, res, next) => {
  try {
    const customer = await Customer.findByUserId(req.user.id);
    if (!customer) return res.status(404).json({ error: 'Customer profile not found' });
    const member = await Member.findByCustomerId(customer.id);
    if (!member) return res.status(404).json({ error: 'No active membership found' });
    res.json({ member });
  } catch (err) { next(err); }
});

// GET /api/members/expiring
router.get('/expiring',
  authorize(ROLE_GROUPS.DECISION_MAKER),
  async (req, res, next) => {
    try {
      const days    = parseInt(req.query.days) || 7;
      const members = await Member.getExpiringSoon(days);
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

// POST /api/members — manual walk-in creation (manager/admin)
router.post('/',
  authorize(ROLE_GROUPS.DECISION_MAKER), [
    body('customer_id').notEmpty().isInt(),
    body('membership_type').isIn(MEMBERSHIP_TYPES),
    body('start_date').notEmpty().isISO8601(),
    body('end_date').optional().isISO8601(),
    body('amount_paid').optional().isFloat({ min: 0 }),
    body('admission_notes').optional().trim(),
  ], validate,
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
        request_id: null,
        created_by: req.user.id,
      });

      await Customer.updateStatus(customer_id, 'active');

      res.status(201).json({ message: 'Member created', member });
    } catch (err) { next(err); }
  }
);

// PATCH /api/members/:id/status
router.patch('/:id/status',
  authorize(ROLE_GROUPS.DECISION_MAKER), [
    body('status').isIn(MEMBER_STATUSES),
  ], validate,
  async (req, res, next) => {
    try {
      const member = await Member.updateStatus(req.params.id, req.body.status);
      if (!member) return res.status(404).json({ error: 'Member not found' });
      res.json({ message: 'Member status updated', member });
    } catch (err) { next(err); }
  }
);

// DELETE /api/members/:id — admin only
router.delete('/:id',
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  async (req, res, next) => {
    try {
      const member = await Member.findById(req.params.id);
      if (!member) return res.status(404).json({ error: 'Member not found' });
      // ON DELETE RESTRICT — DB will throw if assignments exist
      await require('../config/database').query(
        `DELETE FROM members WHERE id=$1`, [req.params.id]
      );
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