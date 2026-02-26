const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const Trainer            = require('../models/Trainer');
const TrainerApplication = require('../models/TrainerApplication');
const Lead               = require('../models/Lead');
const { validate }       = require('../middleware/validate');

// GET /api/public/trainers
router.get('/trainers', async (req, res, next) => {
  try {
    const trainers = await Trainer.findAll({ status: 'active' });
    // Strip sensitive info for public view
    const publicTrainers = trainers.map(t => ({
      id:               t.id,
      full_name:        t.full_name,
      specialization:   t.specialization,
      experience_years: t.experience_years,
      bio:              t.bio,
      profile_image_url: t.profile_image_url,
      hourly_rate:      t.hourly_rate,
      slots_available:  t.max_clients - t.current_clients,
    }));
    res.json({ trainers: publicTrainers });
  } catch (err) { next(err); }
});

// GET /api/public/trainers/:id
router.get('/trainers/:id', async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer || trainer.status !== 'active') {
      return res.status(404).json({ error: 'Trainer not found' });
    }
    res.json({
      trainer: {
        id:               trainer.id,
        full_name:        trainer.full_name,
        specialization:   trainer.specialization,
        experience_years: trainer.experience_years,
        certifications:   trainer.certifications,
        bio:              trainer.bio,
        profile_image_url: trainer.profile_image_url,
        hourly_rate:      trainer.hourly_rate,
        slots_available:  trainer.max_clients - trainer.current_clients,
      }
    });
  } catch (err) { next(err); }
});

// POST /api/public/enquiry — creates a lead (no auth)
router.post('/enquiry', [
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('phone').optional().trim().matches(/^[0-9+\-\s]{7,15}$/),
  body('notes').optional().trim().isLength({ max: 1000 }),
], validate, async (req, res, next) => {
  try {
    const { name, email, phone, notes } = req.body;
    const lead = await Lead.create({
      name, email, phone, notes,
      source:     'website',
      status:     'new',
      created_by: null,
    });
    res.status(201).json({
      message: 'Enquiry submitted successfully. We will contact you soon!',
      id: lead.id,
    });
  } catch (err) { next(err); }
});

// POST /api/public/trainer-apply
router.post('/trainer-apply', [
  body('full_name').trim().notEmpty().isLength({ max: 100 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('phone').optional().trim().matches(/^[0-9+\-\s]{7,15}$/),
  body('specialization').optional().trim().isLength({ max: 100 }),
  body('experience_years').optional().isInt({ min: 0, max: 50 }),
  body('certifications').optional().trim(),
  body('bio').optional().trim(),
  body('cover_letter').optional().trim(),
], validate, async (req, res, next) => {
  try {
    const application = await TrainerApplication.create(req.body);
    res.status(201).json({
      message: 'Application submitted successfully. We will review and contact you.',
      id: application.id,
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'An application with this email already exists',
      });
    }
    next(err);
  }
});

module.exports = router;