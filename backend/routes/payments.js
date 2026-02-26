const express  = require('express');
const { body } = require('express-validator');
const crypto   = require('crypto');
const router   = express.Router();

const Payment              = require('../models/Payment');
const Member               = require('../models/Member');
const Customer             = require('../models/Customer');
const { authenticate }     = require('../middleware/auth');
const { authorize }        = require('../middleware/role');
const { validate }         = require('../middleware/validate');
const { ROLE_GROUPS, ROLES } = require('../constants/roles');
const { MEMBERSHIP_TYPES, PAYMENT_METHODS } = require('../constants/statuses');
const { paymentLimiter }   = require('../middleware/rateLimiter');

// ── POST /api/payments/create-order (customer) ────────────────
router.post('/create-order',
  authenticate, authorize(ROLES.CUSTOMER),
  paymentLimiter,
  [
    body('amount').isFloat({ min: 1 }).withMessage('Valid amount required'),
    body('membership_type').isIn(MEMBERSHIP_TYPES),
  ], validate,
  async (req, res, next) => {
    try {
      const customer = await Customer.findByUserId(req.user.id);
      if (!customer) return res.status(404).json({ error: 'Customer profile not found' });

      const { order, payment } = await Payment.createOrder({
        amount:         req.body.amount,
        customerId:     customer.id,
        membershipType: req.body.membership_type,
      });

      res.status(201).json({
        order_id:   order.id,
        amount:     order.amount,
        currency:   order.currency,
        payment_id: payment.id,
        key_id:     process.env.RAZORPAY_KEY_ID,
      });
    } catch (err) { next(err); }
  }
);

// ── POST /api/payments/verify (customer) ─────────────────────
router.post('/verify',
  authenticate, authorize(ROLES.CUSTOMER),
  [
    body('razorpay_order_id').notEmpty(),
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_signature').notEmpty(),
  ], validate,
  async (req, res, next) => {
    try {
      const payment = await Payment.verifyAndCapture(req.body);
      if (!payment) return res.status(400).json({ error: 'Payment record not found' });
      res.json({ message: 'Payment verified successfully', payment });
    } catch (err) {
      if (err.message === 'INVALID_SIGNATURE') {
        return res.status(400).json({ error: 'Payment verification failed' });
      }
      next(err);
    }
  }
);

// ── POST /api/payments/webhook (Razorpay server → your server) ─
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const body      = req.body.toString();

      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (signature !== expected) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }

      const event = JSON.parse(body);

      if (event.event === 'payment.captured') {
        const { order_id, id: payment_id, signature: sig } = event.payload.payment.entity;
        // Idempotent — only update if still pending
        await require('../config/database').query(
          `UPDATE payments
           SET status='captured', razorpay_payment_id=$1
           WHERE razorpay_order_id=$2 AND status != 'captured'`,
          [payment_id, order_id]
        );
      }

      res.json({ received: true });
    } catch (err) { next(err); }
  }
);

// ── GET /api/payments (admin/manager) ────────────────────────
router.get('/',
  authenticate, authorize(ROLE_GROUPS.DECISION_MAKER),
  async (req, res, next) => {
    try {
      const stats = await Payment.getRevenueStats();
      res.json({ stats });
    } catch (err) { next(err); }
  }
);

// ── POST /api/payments/manual (admin/manager) ────────────────
router.post('/manual',
  authenticate, authorize(ROLE_GROUPS.DECISION_MAKER),
  [
    body('amount').isFloat({ min: 1 }),
    body('payment_method').isIn(PAYMENT_METHODS),
    body('membership_type').optional().isIn(MEMBERSHIP_TYPES),
    body('member_id').optional().isInt(),
    body('customer_id').optional().isInt(),
    body('notes').optional().trim(),
  ], validate,
  async (req, res, next) => {
    try {
      const payment = await Payment.recordManual({
        ...req.body,
        recorded_by: req.user.id,
      });
      res.status(201).json({ message: 'Payment recorded', payment });
    } catch (err) { next(err); }
  }
);

module.exports = router;
