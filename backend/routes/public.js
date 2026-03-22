const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const Trainer            = require('../models/Trainer');
const TrainerApplication = require('../models/TrainerApplication');
const Lead               = require('../models/Lead');
const { validate }       = require('../middleware/validate');

const FITZONE_SYSTEM_PROMPT = `You are the FitZone Gym assistant — a friendly, energetic, no-nonsense chatbot for FitZone Gym in Whitefield, Bengaluru.

YOUR JOB:
- Answer questions about the gym honestly and helpfully
- Detect when someone is genuinely interested in joining
- When they show interest, naturally collect their name and phone number
- Keep responses SHORT — 2-3 sentences max unless listing prices

GYM KNOWLEDGE BASE:

LOCATION: 1st Floor, Lakshmi Arcade, Whitefield Main Rd, near Hope Farm Signal, Bengaluru – 560066

TIMINGS:
- Monday to Saturday: 5:00 AM – 10:30 PM
- Sunday: 6:00 AM – 1:00 PM

MEMBERSHIP PLANS:
- Student Special: ₹999/month (valid student ID required)
- Monthly: ₹1,500/month (no commitment, cancel anytime)
- Quarterly: ₹3,999 for 3 months (save ₹501, includes 1 PT session/month)
- Half-Yearly: ₹6,999 for 6 months (save ₹2,001, includes 2 PT sessions/month)
- Annual: ₹11,999/year (best value, save ₹6,001, includes 4 PT sessions/month + priority booking + guest passes)
- Personal Training add-on: ₹4,000/month
- No joining fee this month
- First session is free

CLASSES & SESSIONS:
- Strength Training (all levels, free weights & machines)
- Cardio Conditioning (treadmills, rowers, cycling — fat loss focused)
- HIIT (30-minute fat-burn circuits)
- Functional Training (kettlebells, battle ropes, TRX)
- Yoga (morning flexibility, weekend power yoga)
- Zumba (evening dance fitness, group classes)
- Boxing & Conditioning (bag work, pad training, core)
- Personal Training (1-on-1 customized programs)

TRAINERS:
- Arjun Reddy — Head Strength Coach, 8+ years, ISSA Certified
- Sneha Rao — Yoga & Mobility Coach, 6+ years, RYT-200 Certified
- Vikram Shetty — HIIT & Functional Specialist, 5+ years, CrossFit L1
- Aditi Sharma — Zumba & Group Fitness, 4+ years, Licensed Zumba Instructor

CONTACT:
- Phone: +91 98765 43210
- Email: info@fitzoneGym.in

BUYING INTENT SIGNALS — when someone asks about:
- Membership prices or plans
- How to join or register
- Trial visit or free session
- Specific trainer availability
- Starting a fitness journey

When you detect buying intent, after answering their question say something like:
"Would you like our team to reach out with more details or to book your free session? I just need your name and phone number."

LEAD CAPTURE FLOW:
- First ask for their name naturally
- Then ask for their phone number
- Once you have both, respond EXACTLY with this JSON on a new line (nothing else after it):
LEAD_CAPTURED:{"name":"<name>","phone":"<phone>","summary":"<1 sentence about what they asked>"}

RULES:
- Never make up information not in the knowledge base
- If asked something you don't know, say "I'm not sure about that — call us at +91 98765 43210 or visit the gym"
- Keep the FitZone brand tone: direct, energetic, no fluff
- Don't be pushy — only ask for contact info once
- Never mention you are Claude or an AI model
- Never mention you are Llama, Groq, or any AI model`;

// GET /api/public/trainers
router.get('/trainers', async (req, res, next) => {
  try {
    const trainers = await Trainer.findAll({ status: 'active' });
    const publicTrainers = trainers.map(t => ({
      id:                t.id,
      full_name:         t.full_name,
      specialization:    t.specialization,
      experience_years:  t.experience_years,
      bio:               t.bio,
      profile_image_url: t.profile_image_url,
      hourly_rate:       t.hourly_rate,
      slots_available:   t.max_clients - t.current_clients,
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
        id:                trainer.id,
        full_name:         trainer.full_name,
        specialization:    trainer.specialization,
        experience_years:  trainer.experience_years,
        certifications:    trainer.certifications,
        bio:               trainer.bio,
        profile_image_url: trainer.profile_image_url,
        hourly_rate:       trainer.hourly_rate,
        slots_available:   trainer.max_clients - trainer.current_clients,
      }
    });
  } catch (err) { next(err); }
});

// POST /api/public/enquiry
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

// POST /api/public/chat — Groq proxy
router.post('/chat', [
  body('messages').isArray({ min: 1 }).withMessage('Messages required'),
], validate, async (req, res, next) => {
  try {
    const { messages } = req.body;

    const sanitized = messages
      .filter(m => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
      .slice(-20);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model:      'llama-3.1-8b-instant',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: FITZONE_SYSTEM_PROMPT },
          ...sanitized,
        ],
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    res.json({ content: text });
  } catch (err) {
    next(err);
  }
});

// POST /api/public/chatbot-lead
router.post('/chatbot-lead', [
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('phone').trim().matches(/^[0-9+\-\s]{7,15}$/).withMessage('Valid phone required'),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('summary').optional().trim().isLength({ max: 1000 }),
], validate, async (req, res, next) => {
  try {
    const { name, phone, email, summary } = req.body;
    const lead = await Lead.create({
      name,
      email:      email || `chatbot_${Date.now()}@noemail.com`,
      phone:      phone || null,
      notes:      summary || null,
      source:     'chatbot',
      status:     'new',
      created_by: null,
    });

    const notify = require('../helpers/notify');
    await notify.chatbotLead(name, summary);

    res.status(201).json({ message: 'Lead captured', id: lead.id });
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