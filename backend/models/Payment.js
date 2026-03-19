// backend/models/Payment.js  (reward-aware version)
// Replaces your existing Payment.js entirely.

const pool     = require('../config/database');
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Reward   = require('./Reward');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class Payment {

  // ── Razorpay order creation — NOW reward-aware ──────────────
  static async createOrder({ amount, currency = 'INR', customerId, membershipType }) {
    const idempotencyKey = uuidv4();
    const receiptNumber  = `FZ-${Date.now()}`;

    // ── Check for applicable reward discount ──────────────────
    const { discountAmount, customerRewardId } =
      await Reward.getApplicableDiscount(customerId);

    const originalAmount  = Number(amount);
    // Never go below ₹1 (Razorpay minimum)
    const discountedAmount = Math.max(1, originalAmount - discountAmount);

    // ── Create Razorpay order with discounted amount ──────────
    const order = await razorpay.orders.create({
      amount:   Math.round(discountedAmount * 100), // paise
      currency,
      receipt:  receiptNumber,
      notes: {
        customer_id:      String(customerId),
        membership_type:  membershipType || '',
        original_amount:  String(originalAmount),
        discount_applied: String(discountAmount),
      },
    });

    // ── Store in DB ────────────────────────────────────────────
    const { rows } = await pool.query(
      `INSERT INTO payments
         (customer_id, razorpay_order_id, amount, currency,
          membership_type, status, receipt_number, idempotency_key,
          original_amount, discount_applied, customer_reward_id)
       VALUES ($1,$2,$3,$4,$5,'created',$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        customerId, order.id,
        discountedAmount,          // amount = what Razorpay charged
        currency,
        membershipType || null,
        receiptNumber,
        idempotencyKey,
        originalAmount,            // original before discount
        discountAmount,            // how much was knocked off
        customerRewardId || null,  // null if no discount
      ]
    );

    return {
      order,
      payment:         rows[0],
      originalAmount,
      discountAmount,
      discountedAmount,
      tierApplied:     customerRewardId ? true : false,
    };
  }

  // ── Verify + capture — marks discount as used ───────────────
  static async verifyAndCapture({
    razorpay_order_id, razorpay_payment_id, razorpay_signature,
  }) {
    // Verify HMAC signature
    const body     = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      throw new Error('INVALID_SIGNATURE');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update payment record
      const { rows } = await client.query(
        `UPDATE payments
         SET razorpay_payment_id=$1, razorpay_signature=$2,
             status='captured', payment_date=CURRENT_DATE,
             payment_method='razorpay'
         WHERE razorpay_order_id=$3
         RETURNING *`,
        [razorpay_payment_id, razorpay_signature, razorpay_order_id]
      );

      const payment = rows[0];
      if (!payment) throw new Error('PAYMENT_NOT_FOUND');

      // ── Mark reward discount as used (if one was applied) ───
      if (payment.customer_reward_id && payment.discount_applied > 0) {
        await Reward.markDiscountUsed(
          payment.customer_reward_id,
          payment.id,
          client
        );
      }

      await client.query('COMMIT');
      return payment;

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // ── All other methods unchanged ──────────────────────────────

  static async findByMemberId(memberId) {
    const { rows } = await pool.query(
      `SELECT * FROM payments WHERE member_id=$1
       ORDER BY created_at DESC`,
      [memberId]
    );
    return rows;
  }

  static async recordManual({
    member_id, customer_id, amount, payment_method,
    membership_type, notes, recorded_by,
  }) {
    const receiptNumber = `FZ-MANUAL-${Date.now()}`;
    const { rows } = await pool.query(
      `INSERT INTO payments
         (member_id, customer_id, amount, payment_method,
          membership_type, status, notes, receipt_number, recorded_by,
          original_amount, discount_applied)
       VALUES ($1,$2,$3,$4,$5,'captured',$6,$7,$8,$3,0)
       RETURNING *`,
      [
        member_id || null, customer_id || null, amount,
        payment_method, membership_type || null,
        notes || null, receiptNumber, recorded_by,
      ]
    );
    return rows[0];
  }

  static async getRevenueStats() {
    const { rows } = await pool.query(
      `SELECT
         SUM(amount)          FILTER (WHERE status='captured') AS total_revenue,
         SUM(original_amount) FILTER (WHERE status='captured') AS gross_revenue,
         SUM(discount_applied)FILTER (WHERE status='captured') AS total_discounts,
         COUNT(*)             FILTER (WHERE status='captured') AS total_transactions,
         SUM(amount) FILTER (
           WHERE status='captured'
           AND DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE)
         ) AS this_month_revenue
       FROM payments`
    );
    return rows[0];
  }
}

module.exports = Payment;