const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const User             = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/role');
const { validate }     = require('../middleware/validate');
const { ROLE_GROUPS, ROLES } = require('../constants/roles');

// All user management — admin only
router.use(authenticate, authorize(ROLE_GROUPS.ADMIN_ONLY));

const createStaffRules = [
  body('username').trim().notEmpty().isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/),
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('role').isIn([ROLES.MANAGER, ROLES.STAFF])
    .withMessage('Can only create manager or staff accounts'),
  body('full_name').optional().trim().isLength({ max: 100 }),
  body('phone').optional().trim().matches(/^[0-9+\-\s]{7,15}$/),
];

// GET /api/users
router.get('/', async (req, res, next) => {
  try {
    const staff = await User.findAllStaff();
    res.json({ staff });
  } catch (err) { next(err); }
});

// POST /api/users — create manager or staff
router.post('/', createStaffRules, validate, async (req, res, next) => {
  try {
    const { username, email, password, role, full_name, phone } = req.body;

    const [existingEmail, existingUsername] = await Promise.all([
      User.findByEmail(email),
      User.findByUsername(username),
    ]);
    if (existingEmail)    return res.status(409).json({ error: 'Email already registered' });
    if (existingUsername) return res.status(409).json({ error: 'Username already taken' });

    const user = await User.create({
      username, email, password, role,
      full_name, phone,
      created_by: req.user.id,
    });

    res.status(201).json({ message: `${role} account created`, user });
  } catch (err) { next(err); }
});

// PATCH /api/users/:id/deactivate
router.patch('/:id/deactivate', async (req, res, next) => {
  try {
    // Prevent admin from deactivating themselves
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }
    const user = await User.deactivate(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deactivated', user });
  } catch (err) { next(err); }
});

// PATCH /api/users/:id/reactivate
router.patch('/:id/reactivate', async (req, res, next) => {
  try {
    const user = await User.reactivate(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User reactivated', user });
  } catch (err) { next(err); }
});

module.exports = router;