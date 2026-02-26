const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const Assignment       = require('../models/Assignment');
const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/role');
const { validate }     = require('../middleware/validate');
const { ROLE_GROUPS }  = require('../constants/roles');

router.use(authenticate, authorize(ROLE_GROUPS.DECISION_MAKER));

// GET /api/assignments
router.get('/', async (req, res, next) => {
  try {
    const assignments = await Assignment.findAll({ status: req.query.status });
    res.json({ assignments });
  } catch (err) { next(err); }
});

// POST /api/assignments
router.post('/', [
  body('member_id').notEmpty().isInt(),
  body('trainer_id').notEmpty().isInt(),
  body('notes').optional().trim(),
], validate, async (req, res, next) => {
  try {
    const { member_id, trainer_id, notes } = req.body;
    const assignment = await Assignment.create({
      member_id, trainer_id, notes,
      created_by: req.user.id,
    });
    res.status(201).json({ message: 'Trainer assigned', assignment });
  } catch (err) {
    if (err.message?.includes('full capacity')) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// PATCH /api/assignments/:id/complete
router.patch('/:id/complete', async (req, res, next) => {
  try {
    const assignment = await Assignment.complete(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ message: 'Assignment completed', assignment });
  } catch (err) { next(err); }
});

module.exports = router;