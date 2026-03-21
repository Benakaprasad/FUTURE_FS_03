const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();
const pool = require('../config/database');

const Lead                   = require('../models/Lead');
const { authenticate }       = require('../middleware/auth');
const { authorize }          = require('../middleware/role');
const { validate }           = require('../middleware/validate');
const { ROLE_GROUPS, ROLES } = require('../constants/roles');  
const { LEAD_STATUSES, LEAD_SOURCES } = require('../constants/statuses');

const leadRules = [
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('phone').optional().trim().matches(/^[0-9+\-\s]{7,15}$/),
  body('source').optional().isIn(LEAD_SOURCES),
  body('status').optional().isIn(LEAD_STATUSES),
  body('notes').optional().trim().isLength({ max: 1000 }),
];

// POST /api/leads/enquire — customers self-submit enquiries
router.post('/enquire',
  authenticate,
  authorize(ROLES.CUSTOMER),
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').trim().isEmail().normalizeEmail(),
    body('phone').optional().trim().matches(/^[0-9+\-\s]{7,15}$/),
    body('intent').trim().notEmpty().withMessage('Intent required'),
    body('preferred_time').optional().trim(),
    body('notes').optional().trim().isLength({ max: 1000 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, phone, intent, preferred_time, notes } = req.body;
      const lead = await Lead.create({
        name,
        email,
        phone:      phone || null,
        source:     'website',
        notes:      `Intent: ${intent}${preferred_time ? ` | Preferred time: ${preferred_time}` : ''}${notes ? `\n${notes}` : ''}`,
        created_by: null,
      });
      res.status(201).json({ message: 'Enquiry submitted', lead });
    } catch (err) { next(err); }
  }
);

// GET /api/leads/stats — before /:id
router.get('/stats',
  authenticate, authorize(ROLE_GROUPS.INTERNAL_STAFF),
  async (req, res, next) => {
    try {
      const stats = await Lead.getStats();
      res.json({ stats });
    } catch (err) { next(err); }
  }
);

// GET /api/leads
router.get('/',
  authenticate, authorize(ROLE_GROUPS.INTERNAL_STAFF),
  async (req, res, next) => {
    try {
      const { search, status } = req.query;
      const leads = await Lead.findAll({ search, status });
      res.json({ leads });
    } catch (err) { next(err); }
  }
);

// GET /api/leads/:id — after all named routes
router.get('/:id',
  authenticate, authorize(ROLE_GROUPS.INTERNAL_STAFF),
  async (req, res, next) => {
    try {
      const lead = await Lead.findById(req.params.id);
      if (!lead) return res.status(404).json({ error: 'Lead not found' });
      res.json({ lead });
    } catch (err) { next(err); }
  }
);

// POST /api/leads — admin manual entry
router.post('/',
  authenticate, authorize(ROLE_GROUPS.INTERNAL_STAFF),
  leadRules, validate,
  async (req, res, next) => {
    try {
      const { name, email, phone, source, notes } = req.body;
      const lead = await Lead.create({
        name, email, phone, source, notes,
        created_by: req.user.id,
      });
      res.status(201).json({ message: 'Lead created', lead });
    } catch (err) { next(err); }
  }
);

// PUT /api/leads/:id
router.put('/:id',
  authenticate, authorize(ROLE_GROUPS.INTERNAL_STAFF),
  leadRules, validate,
  async (req, res, next) => {
    try {
      const existing = await Lead.findById(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Lead not found' });

      const { name, email, phone, source, status, notes } = req.body;
      const lead = await Lead.update(req.params.id, { name, email, phone, source, status, notes });
      res.json({ message: 'Lead updated', lead });
    } catch (err) { next(err); }
  }
);

// PATCH /api/leads/:id/status
router.patch('/:id/status',
  authenticate, authorize(ROLE_GROUPS.INTERNAL_STAFF),
  [body('status').isIn(LEAD_STATUSES).withMessage('Invalid status')],
  validate,
  async (req, res, next) => {
    try {
      const lead = await Lead.updateStatus(req.params.id, req.body.status);
      if (!lead) return res.status(404).json({ error: 'Lead not found' });
      res.json({ message: 'Status updated', lead });
    } catch (err) { next(err); }
  }
);

// DELETE /api/leads/:id — admin only
router.delete('/:id',
  authenticate, authorize(ROLE_GROUPS.ADMIN_ONLY),
  async (req, res, next) => {
    try {
      const lead = await Lead.delete(req.params.id);
      if (!lead) return res.status(404).json({ error: 'Lead not found' });
      res.json({ message: 'Lead deleted' });
    } catch (err) { next(err); }
  }
);

// POST /api/leads/:id/convert — full transaction
router.post('/:id/convert',
  authenticate, authorize(ROLE_GROUPS.DECISION_MAKER),
  [
    body('membership_type').isIn(['monthly','quarterly','half_yearly','annual','student','corporate']).withMessage('Valid plan required'),
    body('start_date').notEmpty().isISO8601().withMessage('Start date required'),
    body('end_date').optional().isISO8601(),
    body('amount_paid').optional().isFloat({ min: 0 }),
    body('payment_status').optional().isIn(['pending','paid','partial']),
    body('admission_notes').optional().trim(),
    body('create_account').optional().isBoolean(),
    body('password').optional().isLength({ min: 8 }),
  ],
  validate,
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Get lead
      const lead = await Lead.findById(req.params.id);
      if (!lead) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Lead not found' });
      }
      if (lead.status === 'converted') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Lead already converted' });
      }

      let userId = lead.user_id;

      if (!userId) {
        const { rows: existing } = await client.query(
          `SELECT id FROM users WHERE email = $1`, [lead.email]
        );

        if (existing.length > 0) {
          userId = existing[0].id;
        } else {
          const bcrypt = require('bcrypt');
          const rawPassword = req.body.password || Math.random().toString(36).slice(-10) + 'Aa1!';
          const hashed = await bcrypt.hash(rawPassword, 12);

          const { rows: newUser } = await client.query(
            `INSERT INTO users (username, email, password, role, full_name, phone, is_active)
             VALUES ($1, $2, $3, 'customer', $4, $5, true)
             RETURNING id`,
            [
              lead.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') + '_' + Date.now().toString().slice(-4),
              lead.email,
              hashed,
              lead.name,
              lead.phone || null,
            ]
          );
          userId = newUser[0].id;
        }
      }

      const { rows: existingCustomer } = await client.query(
        `SELECT id FROM customers WHERE user_id = $1`, [userId]
      );

      let customerId;
      if (existingCustomer.length > 0) {
        customerId = existingCustomer[0].id;
        await client.query(
          `UPDATE customers SET status = 'active' WHERE id = $1`, [customerId]
        );
      } else {
        const { rows: newCustomer } = await client.query(
          `INSERT INTO customers (user_id, status) VALUES ($1, 'active') RETURNING id`,
          [userId]
        );
        customerId = newCustomer[0].id;
      }

      // 4. Check no active membership already exists
      const { rows: activeMem } = await client.query(
        `SELECT id FROM members WHERE customer_id = $1 AND status = 'active'`, [customerId]
      );
      if (activeMem.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'Customer already has an active membership' });
      }

      // 5. Create membership
      await client.query(
        `INSERT INTO members
           (customer_id, membership_type, start_date, end_date,
            payment_status, amount_paid, admission_notes, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          customerId,
          req.body.membership_type,
          req.body.start_date,
          req.body.end_date || null,
          req.body.payment_status || 'pending',
          req.body.amount_paid || null,
          req.body.admission_notes || null,
          req.user.id,
        ]
      );

      // 6. Mark lead as converted + link to user
      await client.query(
        `UPDATE leads SET status = 'converted', user_id = $1 WHERE id = $2`,
        [userId, lead.id]
      );

      await client.query('COMMIT');
      res.status(201).json({
        message: 'Lead converted to member successfully',
        user_id: userId,
        customer_id: customerId,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);

module.exports = router;