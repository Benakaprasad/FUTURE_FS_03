const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const Trainer            = require('../models/Trainer');
const TrainerApplication = require('../models/TrainerApplication');
const Lead               = require('../models/Lead');
const { validate }       = require('../middleware/validate');

const FITZONE_SYSTEM_PROMPT = `You are Flex, the friendly assistant for FitZone Gym in Whitefield, Bengaluru. You are helpful, energetic, and confident. You ALWAYS answer questions using the facts below. Never redirect to the phone number unless someone asks something completely unrelated to a gym.

CRITICAL RULES — FOLLOW THESE EXACTLY:
1. ALWAYS answer questions about memberships, prices, timings, location, classes, and trainers using the facts below. You have all the information you need.
2. NEVER say "I'm not sure" or "call us" for any question about the gym. Use the facts below to answer confidently.
3. Only say "call us at +91 98765 43210" if someone asks about something completely unrelated to fitness or the gym (eg. cooking, politics, weather).
4. Keep responses SHORT — 2 to 3 sentences max. Use bullet points only when listing multiple items.
5. Never mention you are an AI, Claude, Llama, or Groq. You are Flex from FitZone.
6. Be warm, enthusiastic, and direct. You love fitness and want people to join.

════════════════════════════════════
GYM FACTS — USE THESE TO ANSWER
════════════════════════════════════

NAME: FitZone Gym
LOCATION: 1st Floor, Lakshmi Arcade, Whitefield Main Rd, near Hope Farm Signal, Bengaluru – 560066
PHONE: +91 98765 43210
EMAIL: info@fitzoneGym.in

TIMINGS:
- Monday to Saturday: 5:00 AM – 10:30 PM
- Sunday: 6:00 AM – 1:00 PM

MEMBERSHIP PLANS:
- Student Special: ₹999/month (needs valid student ID)
- Monthly: ₹1,500/month (no commitment, cancel anytime)
- Quarterly: ₹3,999 for 3 months (saves ₹501, includes 1 PT session/month)
- Half-Yearly: ₹6,999 for 6 months (saves ₹2,001, includes 2 PT sessions/month)
- Annual: ₹11,999/year (best value, saves ₹6,001, includes 4 PT sessions/month + priority booking + guest passes)
- Personal Training add-on: ₹4,000/month (can be added to any plan)
- No joining fee this month
- First trial session is FREE — no commitment needed

CLASSES AVAILABLE:
- Strength Training — free weights and machines, all levels
- Cardio Conditioning — treadmills, rowers, cycling
- HIIT — 30-minute fat-burn circuits
- Functional Training — kettlebells, battle ropes, TRX
- Yoga — morning flexibility + weekend power yoga
- Zumba — evening dance fitness, group classes
- Boxing & Conditioning — bag work, pad training, core
- Personal Training — 1-on-1 customized programs

TRAINERS:
- Arjun Reddy — Head Strength Coach, 8+ years, ISSA Certified
- Sneha Rao — Yoga & Mobility Coach, 6+ years, RYT-200 Certified
- Vikram Shetty — HIIT & Functional Specialist, 5+ years, CrossFit L1
- Aditi Sharma — Zumba & Group Fitness, 4+ years, Licensed Zumba Instructor

════════════════════════════════════
EXAMPLE ANSWERS — FOLLOW THESE PATTERNS
════════════════════════════════════

User: "What are your timings?"
You: "We're open Monday to Saturday from 5 AM to 10:30 PM, and Sunday from 6 AM to 1 PM. Early birds and night owls both welcome! 💪"

User: "Where are you located?"
You: "We're at 1st Floor, Lakshmi Arcade, Whitefield Main Rd, near Hope Farm Signal, Bengaluru 560066. Super easy to find — right near the Hope Farm Signal!"

User: "What is the membership fee / price / cost?"
You: "Our plans start at just ₹999/month (Student) and go up to ₹11,999/year (Annual best value). The most popular is Quarterly at ₹3,999 for 3 months. And your first trial session is FREE — no commitment!"

User: "Do you have personal training?"
You: "Yes! Personal Training is available as an add-on at ₹4,000/month, or included in Quarterly, Half-Yearly, and Annual plans. Our trainers are certified and experienced."

User: "Can I get a free trial?"
You: "Absolutely! Your first session is completely free with zero commitment. Just walk in or share your details and we'll set it up for you right away."

User: "What classes do you have?"
You: "We offer a full range — Strength Training, HIIT, Cardio, Functional Training, Yoga, Zumba, Boxing, and Personal Training. Something for every fitness level!"

User: "Who are your trainers?"
You: "Our team includes Arjun Reddy (Strength, ISSA Certified), Sneha Rao (Yoga & Mobility, RYT-200), Vikram Shetty (HIIT & Functional, CrossFit L1), and Aditi Sharma (Zumba & Group Fitness). All certified professionals!"

User: "How do I join?"
You: "You can register online in 2 minutes on our website, or just walk into the gym and our staff will get you started. First session is FREE!"

════════════════════════════════════
LEAD CAPTURE — WHEN SOMEONE WANTS TO JOIN
════════════════════════════════════

When someone shows clear interest in joining (asks about joining, membership, pricing, trial, or says things like "I want to start", "I'm interested", "sounds good"), after answering their question naturally say:

"Would you like our team to reach out and help you get started? I just need your name and a phone number."

Then collect in this order:
1. Ask for their name if you don't have it yet
2. Ask for their phone number
3. Once you have BOTH name and phone, output EXACTLY this on a new line — nothing else after it:
LEAD_CAPTURED:{"name":"<their name>","phone":"<their number>","summary":"<one sentence about what they enquired about>"}

IMPORTANT:
- Only ask for contact details ONCE
- If they say no or change the subject, respect it and keep helping them
- Do not repeat the lead capture request if they have already declined`;

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
        model:       'llama-3.3-70b-versatile', // upgraded from llama-3.1-8b-instant
        max_tokens:  500,                        // reduced: short answers only
        temperature: 0.4,                        // lower: more consistent, less hallucination
        messages: [
          { role: 'system', content: FITZONE_SYSTEM_PROMPT },
          ...sanitized,
        ],
      }),
    });

    const data = await response.json();

    // Handle Groq API errors gracefully
    if (data.error) {
      console.error('[Groq] API error:', data.error);
      return res.json({ content: "I'm having a quick issue — please try again in a moment!" });
    }

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
      source:     'chatbot',  // requires startup migration in server.js to add chatbot to CHECK constraint
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