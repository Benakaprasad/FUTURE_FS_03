const pool    = require('../config/database');
const Razorpay = require('razorpay');
const crypto  = require('crypto');
const { v4: uuidv4 } = require('uuid');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class Payment {
  // ── Razorpay ─────────────────────────────────────────────────
  static async createOrder({ amount, currency = 'INR', customerId, membershipType }) {
    const idempotencyKey = uuidv4();
    const receiptNumber  = `FZ-${Date.now()}`;

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // paise
      currency,
      receipt:  receiptNumber,
    });

    // Store in DB with status=created
    const { rows } = await pool.query(
      `INSERT INTO payments
         (customer_id, razorpay_order_id, amount, currency,
          membership_type, status, receipt_number, idempotency_key)
       VALUES ($1,$2,$3,$4,$5,'created',$6,$7)
       RETURNING *`,
      [customerId, order.id, amount, currency,
       membershipType || null, receiptNumber, idempotencyKey]
    );

    return { order, payment: rows[0] };
  }

  static async verifyAndCapture({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    // Verify HMAC signature
    const body      = razorpay_order_id + '|' + razorpay_payment_id;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      throw new Error('INVALID_SIGNATURE');
    }

    // Update payment record
    const { rows } = await pool.query(
      `UPDATE payments
       SET razorpay_payment_id=$1, razorpay_signature=$2,
           status='captured', payment_date=CURRENT_DATE,
           payment_method='razorpay'
       WHERE razorpay_order_id=$3
       RETURNING *`,
      [razorpay_payment_id, razorpay_signature, razorpay_order_id]
    );

    return rows[0] || null;
  }

  static async findByMemberId(memberId) {
    const { rows } = await pool.query(
      `SELECT * FROM payments WHERE member_id=$1
       ORDER BY created_at DESC`,
      [memberId]
    );
    return rows;
  }

  static async recordManual({ member_id, customer_id, amount, payment_method,
    membership_type, notes, recorded_by }) {
    const receiptNumber = `FZ-MANUAL-${Date.now()}`;
    const { rows } = await pool.query(
      `INSERT INTO payments
         (member_id, customer_id, amount, payment_method,
          membership_type, status, notes, receipt_number, recorded_by)
       VALUES ($1,$2,$3,$4,$5,'captured',$6,$7,$8)
       RETURNING *`,
      [member_id || null, customer_id || null, amount, payment_method,
       membership_type || null, notes || null, receiptNumber, recorded_by]
    );
    return rows[0];
  }

  static async getRevenueStats() {
    const { rows } = await pool.query(
      `SELECT
         SUM(amount) FILTER (WHERE status='captured') AS total_revenue,
         COUNT(*)    FILTER (WHERE status='captured') AS total_transactions,
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