const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();
const pool     = require('../config/database');

const Lead                   = require('../models/Lead');
const notify                 = require('../helpers/notify');
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

// ── POST /api/leads/enquire — logged-in customer self-submits ──
router.post('/enquire',
  authenticate,
  authorize(ROLES.CUSTOMER),
  [
    body('intent').trim().notEmpty().withMessage('Intent required'),
    body('phone').optional().trim().matches(/^[0-9+\-\s]{7,15}$/),
    body('preferred_time').optional().trim(),
    body('notes').optional().trim().isLength({ max: 1000 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { intent, phone, preferred_time, notes } = req.body;

      const noteText = [
        `Intent: ${intent}`,
        preferred_time ? `Preferred contact time: ${preferred_time}` : null,
        notes || null,
      ].filter(Boolean).join('\n');

      // ── Dedup: if an open lead already exists for this user, append to it ──
      const { rows: existing } = await pool.query(
        `SELECT id FROM leads
         WHERE user_id = $1
           AND status NOT IN ('converted', 'dropped')
         ORDER BY created_at DESC
         LIMIT 1`,
        [req.user.id]
      );

      if (existing.length > 0) {
        // Append follow-up note to existing lead instead of creating a duplicate
        await pool.query(
          `UPDATE leads
           SET notes      = COALESCE(notes, '') || $1,
               updated_at = NOW()
           WHERE id = $2`,
          [`\n---\nFollow-up (${new Date().toLocaleDateString('en-IN')}): ${noteText}`, existing[0].id]
        );

        await notify.registeredUserEnquiry(
          req.user.full_name || req.user.username,
          `follow-up — ${intent}`
        );

        return res.status(200).json({
          message: 'Enquiry updated — our team will follow up.',
          lead_id: existing[0].id,
          is_followup: true,
        });
      }

      // ── No existing open lead — create a fresh one ──
      const lead = await Lead.create({
        name:       req.user.full_name || req.user.username,
        email:      req.user.email,
        phone:      phone || null,
        source:     'website',
        notes:      noteText,
        status:     'new',
        user_id:    req.user.id,
        created_by: null,
      });

      await notify.registeredUserEnquiry(
        req.user.full_name || req.user.username,
        intent
      );

      res.status(201).json({ message: 'Enquiry submitted', lead, is_followup: false });
    } catch (err) { next(err); }
  }
);

// ── GET /api/leads/stats ───────────────────────────────────────
router.get('/stats',
  authenticate, authorize(ROLE_GROUPS.INTERNAL_STAFF),
  async (req, res, next) => {
    try {
      const stats = await Lead.getStats();
      res.json({ stats });
    } catch (err) { next(err); }
  }
);

// ── GET /api/leads ─────────────────────────────────────────────
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

// ── GET /api/leads/:id ─────────────────────────────────────────
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

// ── POST /api/leads — admin manual entry ──────────────────────
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

// ── PUT /api/leads/:id ─────────────────────────────────────────
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

// ── PATCH /api/leads/:id/status ───────────────────────────────
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

// ── DELETE /api/leads/:id ─────────────────────────────────────
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

// ── POST /api/leads/:id/convert ───────────────────────────────
router.post('/:id/convert',
  authenticate, authorize(ROLE_GROUPS.ADMIN_ONLY),
  [
    body('membership_type').isIn(['monthly','quarterly','half_yearly','annual','student','corporate']),
    body('start_date').notEmpty().isISO8601(),
    body('end_date').optional().isISO8601(),
    body('amount_paid').optional().isFloat({ min: 0 }),
    body('payment_status').optional().isIn(['pending','paid','partial']),
    body('admission_notes').optional().trim(),
    body('password').optional().isLength({ min: 8 }),
  ],
  validate,
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const lead = await Lead.findById(req.params.id);
      if (!lead) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Lead not found' });
      }
      if (lead.status === 'converted') {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Lead already converted' });
      }

      // ── Step 1: Resolve or create user account ──
      let userId = lead.user_id; // already set if they registered

      if (!userId) {
        const { rows: existingUser } = await client.query(
          `SELECT id FROM users WHERE email = $1`,
          [lead.email]
        );

        if (existingUser.length > 0) {
          userId = existingUser[0].id;
        } else {
          const bcrypt = require('bcryptjs');
          const raw    = req.body.password || Math.random().toString(36).slice(-10) + 'Aa1!';
          const hash   = await bcrypt.hash(raw, 12);
          const { rows: newUser } = await client.query(
            `INSERT INTO users (username, email, password, role, full_name, phone, is_active)
             VALUES ($1,$2,$3,'customer',$4,$5,true) RETURNING id`,
            [
              lead.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') + '_' + Date.now().toString().slice(-4),
              lead.email, hash, lead.name, lead.phone || null,
            ]
          );
          userId = newUser[0].id;
        }
      }

      // ── Step 2: Resolve or create customer record ──
      const { rows: existingCustomer } = await client.query(
        `SELECT id FROM customers WHERE user_id = $1`,
        [userId]
      );

      let customerId;
      if (existingCustomer.length > 0) {
        customerId = existingCustomer[0].id;
        await client.query(
          `UPDATE customers SET status = 'active' WHERE id = $1`,
          [customerId]
        );
      } else {
        const { rows: newCustomer } = await client.query(
          `INSERT INTO customers (user_id, status) VALUES ($1, 'active') RETURNING id`,
          [userId]
        );
        customerId = newCustomer[0].id;
      }

      // ── Step 3: Check no active membership already exists ──
      const { rows: activeMem } = await client.query(
        `SELECT id FROM members WHERE customer_id = $1 AND status = 'active'`,
        [customerId]
      );
      if (activeMem.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'Customer already has an active membership' });
      }

      // ── Step 4: Create membership ──
      await client.query(
        `INSERT INTO members
           (customer_id, membership_type, start_date, end_date,
            payment_status, amount_paid, admission_notes, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          customerId,
          req.body.membership_type,
          req.body.start_date,
          req.body.end_date     || null,
          req.body.payment_status || 'pending',
          req.body.amount_paid  || null,
          req.body.admission_notes || null,
          req.user.id,
        ]
      );

      // ── Step 5: Mark lead as converted ──
      await client.query(
        `UPDATE leads SET status = 'converted', user_id = $1 WHERE id = $2`,
        [userId, lead.id]
      );

      await client.query('COMMIT');
      res.status(201).json({
        message: 'Lead converted to member successfully',
        user_id:     userId,
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