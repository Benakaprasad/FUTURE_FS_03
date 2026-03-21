const express  = require('express');
const { body } = require('express-validator');
const crypto   = require('crypto');
const router   = express.Router();

const notify               = require('../helpers/notify');
const Payment              = require('../models/Payment');
const Member               = require('../models/Member');
const Customer             = require('../models/Customer');
const { authenticate }     = require('../middleware/auth');
const { authorize }        = require('../middleware/role');
const { validate }         = require('../middleware/validate');
const { ROLE_GROUPS, ROLES }              = require('../constants/roles');
const { MEMBERSHIP_TYPES, PAYMENT_METHODS } = require('../constants/statuses');
const pool = require('../config/database');

// POST /api/payments/create-order
router.post('/create-order',
  authenticate, authorize(ROLES.CUSTOMER),
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

// POST /api/payments/verify
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

      // Notify admin of online payment
      const customer     = await Customer.findById(payment.customer_id);
      const customerName = customer?.full_name || customer?.username || `Customer #${payment.customer_id}`;
      await notify.paymentReceived(customerName, payment.amount);

      res.json({ message: 'Payment verified successfully', payment });
    } catch (err) {
      if (err.message === 'INVALID_SIGNATURE') {
        return res.status(400).json({ error: 'Payment verification failed' });
      }
      next(err);
    }
  }
);

// POST /api/payments/webhook
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
        const { order_id, id: payment_id, amount } = event.payload.payment.entity;

        const { rows } = await pool.query(
          `UPDATE payments
           SET status='captured', razorpay_payment_id=$1
           WHERE razorpay_order_id=$2 AND status != 'captured'
           RETURNING customer_id, amount`,
          [payment_id, order_id]
        );

        // Notify admin via webhook capture too (idempotent — only fires if row updated)
        if (rows[0]) {
          const customer     = await Customer.findById(rows[0].customer_id);
          const customerName = customer?.full_name || customer?.username || `Customer #${rows[0].customer_id}`;
          await notify.paymentReceived(customerName, (rows[0].amount / 100).toFixed(2));
        }
      }

      res.json({ received: true });
    } catch (err) { next(err); }
  }
);

// GET /api/payments
router.get('/',
  authenticate, authorize(ROLE_GROUPS.DECISION_MAKER),
  async (req, res, next) => {
    try {
      const stats = await Payment.getRevenueStats();
      res.json({ stats });
    } catch (err) { next(err); }
  }
);

// POST /api/payments/manual
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
      const payment = await Payment.recordManual({ ...req.body, recorded_by: req.user.id });

      if (payment) {
        let customerName = `Customer #${req.body.customer_id || '?'}`;
        if (req.body.customer_id) {
          const customer = await Customer.findById(req.body.customer_id);
          customerName   = customer?.full_name || customer?.username || customerName;
        }
        await notify.paymentReceived(customerName, req.body.amount);
      }

      res.status(201).json({ message: 'Payment recorded', payment });
    } catch (err) { next(err); }
  }
);

module.exports = router;