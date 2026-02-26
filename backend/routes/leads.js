const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const Lead               = require('../models/Lead');
const { authenticate }   = require('../middleware/auth');
const { authorize }      = require('../middleware/role');
const { validate }       = require('../middleware/validate');
const { ROLE_GROUPS }    = require('../constants/roles');
const { LEAD_STATUSES, LEAD_SOURCES } = require('../constants/statuses');

const leadRules = [
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('phone').optional().trim().matches(/^[0-9+\-\s]{7,15}$/),
  body('source').optional().isIn(LEAD_SOURCES),
  body('status').optional().isIn(LEAD_STATUSES),
  body('notes').optional().trim().isLength({ max: 1000 }),
];

// All lead routes require auth + internal staff
router.use(authenticate, authorize(ROLE_GROUPS.INTERNAL_STAFF));

// GET /api/leads
router.get('/', async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const leads = await Lead.findAll({ search, status });
    res.json({ leads });
  } catch (err) { next(err); }
});

// GET /api/leads/stats
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await Lead.getStats();
    res.json({ stats });
  } catch (err) { next(err); }
});

// GET /api/leads/:id
router.get('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json({ lead });
  } catch (err) { next(err); }
});

// POST /api/leads
router.post('/', leadRules, validate, async (req, res, next) => {
  try {
    const { name, email, phone, source, notes } = req.body;
    const lead = await Lead.create({
      name, email, phone, source, notes,
      created_by: req.user.id,
    });
    res.status(201).json({ message: 'Lead created', lead });
  } catch (err) { next(err); }
});

// PUT /api/leads/:id
router.put('/:id', leadRules, validate, async (req, res, next) => {
  try {
    const existing = await Lead.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Lead not found' });

    const { name, email, phone, source, status, notes } = req.body;
    const lead = await Lead.update(req.params.id, {
      name, email, phone, source, status, notes,
    });
    res.json({ message: 'Lead updated', lead });
  } catch (err) { next(err); }
});

// PATCH /api/leads/:id/status
router.patch('/:id/status',
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
  authorize(ROLE_GROUPS.ADMIN_ONLY),
  async (req, res, next) => {
    try {
      const lead = await Lead.delete(req.params.id);
      if (!lead) return res.status(404).json({ error: 'Lead not found' });
      res.json({ message: 'Lead deleted' });
    } catch (err) { next(err); }
  }
);

module.exports = router;