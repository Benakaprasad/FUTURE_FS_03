const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const Customer         = require('../models/Customer');
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/role');
const { validate }     = require('../middleware/validate');
const { ROLE_GROUPS, ROLES } = require('../constants/roles');

router.use(authenticate);

// GET /api/customers — internal staff
router.get('/',
  authorize(ROLE_GROUPS.INTERNAL_STAFF),
  async (req, res, next) => {
    try {
      const customers = await Customer.findAll({ status: req.query.status });
      res.json({ customers });
    } catch (err) { next(err); }
  }
);

// GET /api/customers/me — customer sees own profile
router.get('/me', authorize(ROLES.CUSTOMER), async (req, res, next) => {
  try {
    const customer = await Customer.findByUserId(req.user.id);
    if (!customer) return res.status(404).json({ error: 'Profile not found' });
    res.json({ customer });
  } catch (err) { next(err); }
});

// PUT /api/customers/me — customer updates own profile
router.put('/me', authorize(ROLES.CUSTOMER), [
  body('date_of_birth').optional().isISO8601(),
  body('gender').optional().isIn(['male','female','other','prefer_not_to_say']),
  body('address').optional().trim().isLength({ max: 500 }),
  body('emergency_contact').optional().trim(),
  body('fitness_goals').optional().trim(),
  body('medical_conditions').optional().trim(),
], validate, async (req, res, next) => {
  try {
    const customer = await Customer.findByUserId(req.user.id);
    if (!customer) return res.status(404).json({ error: 'Profile not found' });
    const updated = await Customer.update(customer.id, req.body);
    res.json({ message: 'Profile updated', customer: updated });
  } catch (err) { next(err); }
});

// GET /api/customers/:id — internal staff
router.get('/:id',
  authorize(ROLE_GROUPS.INTERNAL_STAFF),
  async (req, res, next) => {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      res.json({ customer });
    } catch (err) { next(err); }
  }
);

module.exports = router;