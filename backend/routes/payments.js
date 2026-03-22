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
const { ROLE_GROUPS, ROLES }                = require('../constants/roles');
const { MEMBERSHIP_TYPES, PAYMENT_METHODS } = require('../constants/statuses');
const pool = require('../config/database');

const PLAN_MONTHS = {
  student:     1,
  monthly:     1,
  quarterly:   3,
  half_yearly: 6,
  annual:      12,
};

// ── POST /api/payments/create-order ───────────────────────────
router.post('/create-order',
  authenticate, authorize(ROLES.CUSTOMER),
  [
    body('amount').isFloat({ min: 1 }).withMessage('Valid amount required'),
    body('membership_type').isIn(MEMBERSHIP_TYPES).withMessage('Valid membership type required'),
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
        order_id:        order.id,
        amount:          order.amount,
        currency:        order.currency,
        payment_id:      payment.id,
        key_id:          process.env.RAZORPAY_KEY_ID,
        membership_type: req.body.membership_type,
      });
    } catch (err) { next(err); }
  }
);

// ── POST /api/payments/verify ─────────────────────────────────
router.post('/verify',
  authenticate, authorize(ROLES.CUSTOMER),
  [
    body('razorpay_order_id').notEmpty(),
    body('razorpay_payment_id').notEmpty(),
    body('razorpay_signature').notEmpty(),
    body('membership_type').isIn(MEMBERSHIP_TYPES).withMessage('Membership type required'),
  ], validate,
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        membership_type,
      } = req.body;

      // 1. Verify signature
      const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expected !== razorpay_signature) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
      }

      // 2. Mark payment as paid
      const payment = await Payment.verifyAndCapture(req.body);
      if (!payment) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Payment record not found' });
      }

      // 3. Get customer
      const customer = await Customer.findByUserId(req.user.id);
      if (!customer) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Customer profile not found' });
      }

      // 4. Calculate dates
      const months    = PLAN_MONTHS[membership_type] || 1;
      const startDate = new Date();
      const endDate   = new Date();
      endDate.setMonth(endDate.getMonth() + months);
      const fmt = (d) => d.toISOString().split('T')[0];

      // 5. ── UNIQUE constraint fix: update if exists, insert if first time ──
      const { rows: existingMember } = await client.query(
        `SELECT id FROM members WHERE customer_id = $1`,
        [customer.id]
      );

      let member;
      if (existingMember.length > 0) {
        // Renewal — update existing row
        const { rows: updated } = await client.query(
          `UPDATE members
           SET membership_type = $1,
               start_date      = $2,
               end_date        = $3,
               payment_status  = 'paid',
               amount_paid     = $4,
               status          = 'active',
               admission_notes = $5,
               updated_at      = NOW()
           WHERE customer_id = $6
           RETURNING *`,
          [
            membership_type,
            fmt(startDate),
            fmt(endDate),
            payment.amount,
            `Online payment · Razorpay ${razorpay_payment_id}`,
            customer.id,
          ]
        );
        member = updated[0];
      } else {
        // First membership — insert
        member = await Member.create({
          customer_id:     customer.id,
          membership_type: membership_type,
          start_date:      fmt(startDate),
          end_date:        fmt(endDate),
          payment_status:  'paid',
          amount_paid:     payment.amount,
          admission_notes: `Online payment · Razorpay ${razorpay_payment_id}`,
          request_id:      null,
          created_by:      null,
        });
      }

      // 6. Notify
      const customerName = customer.full_name || customer.username || `Customer #${customer.id}`;
      await notify.paymentReceived(customerName, payment.amount);

      await client.query('COMMIT');

      res.json({
        message: 'Payment verified. Membership activated! 🎉',
        member,
        payment,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      if (err.message === 'INVALID_SIGNATURE') {
        return res.status(400).json({ error: 'Payment verification failed' });
      }
      next(err);
    } finally {
      client.release();
    }
  }
);

// ── POST /api/payments/webhook ────────────────────────────────
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
        const { order_id, id: razorpay_payment_id } = event.payload.payment.entity;

        const { rows } = await pool.query(
          `UPDATE payments
           SET status = 'captured', razorpay_payment_id = $1
           WHERE razorpay_order_id = $2 AND status != 'captured'
           RETURNING customer_id, amount, membership_type`,
          [razorpay_payment_id, order_id]
        );

        if (rows[0]) {
          const { customer_id, amount: paidAmount, membership_type } = rows[0];
          const fmt = (d) => d.toISOString().split('T')[0];

          // Check if verify already handled this payment
          const { rows: alreadyHandled } = await pool.query(
            `SELECT id FROM members
             WHERE customer_id = $1
               AND admission_notes ILIKE $2`,
            [customer_id, `%${razorpay_payment_id}%`]
          );

          if (!alreadyHandled.length && membership_type) {
            const months = PLAN_MONTHS[membership_type] || 1;
            const start  = new Date();
            const end    = new Date();
            end.setMonth(end.getMonth() + months);

            const { rows: existingMember } = await pool.query(
              `SELECT id FROM members WHERE customer_id = $1`,
              [customer_id]
            );

            if (existingMember.length > 0) {
              // Renewal — update existing row
              await pool.query(
                `UPDATE members
                 SET membership_type = $1,
                     start_date      = $2,
                     end_date        = $3,
                     payment_status  = 'paid',
                     amount_paid     = $4,
                     status          = 'active',
                     admission_notes = $5,
                     updated_at      = NOW()
                 WHERE customer_id = $6`,
                [
                  membership_type,
                  fmt(start),
                  fmt(end),
                  paidAmount,   // payments table stores rupees
                  `Webhook capture · Razorpay ${razorpay_payment_id}`,
                  customer_id,
                ]
              );
            } else {
              // First membership — insert
              await Member.create({
                customer_id:     customer_id,
                membership_type: membership_type,
                start_date:      fmt(start),
                end_date:        fmt(end),
                payment_status:  'paid',
                amount_paid:     paidAmount,
                admission_notes: `Webhook capture · Razorpay ${razorpay_payment_id}`,
                request_id:      null,
                created_by:      null,
              });
            }
          }

          const customer     = await Customer.findById(customer_id);
          const customerName = customer?.full_name || customer?.username
                               || `Customer #${customer_id}`;
          await notify.paymentReceived(customerName, paidAmount);
        }
      }

      res.json({ received: true });
    } catch (err) { next(err); }
  }
);

// ── GET /api/payments ─────────────────────────────────────────
router.get('/',
  authenticate, authorize(ROLE_GROUPS.ADMIN_ONLY),
  async (req, res, next) => {
    try {
      const stats = await Payment.getRevenueStats();
      res.json({ stats });
    } catch (err) { next(err); }
  }
);

// ── POST /api/payments/manual ─────────────────────────────────
router.post('/manual',
  authenticate, authorize(ROLE_GROUPS.INTERNAL_STAFF),
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
