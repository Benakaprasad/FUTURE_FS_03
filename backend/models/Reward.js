const pool = require('../config/database');

const TIER_MAP = {
  warming_up: { minWpm: 0,   maxWpm: 49,  discount: 0,   lockerDays: 0,  ptSessions: 0 },
  solid:      { minWpm: 50,  maxWpm: 79,  discount: 0,   lockerDays: 30, ptSessions: 0 },
  pro:        { minWpm: 80,  maxWpm: 99,  discount: 300, lockerDays: 30, ptSessions: 0 },
  elite:      { minWpm: 100, maxWpm: null,discount: 500, lockerDays: 30, ptSessions: 1 },
};

/**
 * Resolve tier key from peak WPM.
 * Matches the frontend REWARD_TIERS logic exactly.
 */
function resolveTierKey(peakWpm) {
  const wpm = Number(peakWpm) || 0;
  if (wpm >= 100) return 'elite';
  if (wpm >= 80)  return 'pro';
  if (wpm >= 50)  return 'solid';
  return 'warming_up';
}

class Reward {

  /**
   * Get the full reward record for a customer (with tier details joined).
   */
  static async findByCustomerId(customerId) {
    const { rows } = await pool.query(
      `SELECT
         cr.*,
         rt.label            AS tier_label,
         rt.color_hex        AS tier_color,
         rt.free_assessment,
         rt.joining_fee_waived
       FROM customer_rewards cr
       JOIN reward_tiers rt ON rt.tier_key = cr.tier_key
       WHERE cr.customer_id = $1`,
      [customerId]
    );
    return rows[0] || null;
  }

  /**
   * Get all redemptions for a customer (newest first).
   */
  static async getRedemptions(customerId) {
    const { rows } = await pool.query(
      `SELECT * FROM reward_redemptions
       WHERE customer_id = $1
       ORDER BY redeemed_at DESC`,
      [customerId]
    );
    return rows;
  }

  /**
   * Create a customer_rewards row at registration time.
   * Called inside the same DB transaction as customer INSERT.
   *
   * @param {object} opts
   * @param {number} opts.customerId
   * @param {number} opts.peakWpm
   * @param {number} opts.accuracy     - 0-100
   * @param {number} opts.phrasesTyped
   * @param {boolean} opts.bonusRoundDone
   * @param {object} [opts.client]     - pg PoolClient for transaction
   */
  static async createForCustomer({
    customerId, peakWpm, accuracy, phrasesTyped, bonusRoundDone, client,
  }) {
    const db       = client || pool;
    const tierKey  = resolveTierKey(peakWpm);
    const tierConf = TIER_MAP[tierKey];

    const { rows } = await db.query(
      `INSERT INTO customer_rewards (
         customer_id, tier_key,
         peak_wpm, accuracy, phrases_typed, bonus_round_done,
         discount_amount,
         locker_free_days_remaining,
         pt_sessions_remaining,
         expires_at
       ) VALUES (
         $1, $2,
         $3, $4, $5, $6,
         $7,
         $8,
         $9,
         NOW() + INTERVAL '1 day'
       )
       ON CONFLICT (customer_id) DO UPDATE SET
         tier_key                   = EXCLUDED.tier_key,
         peak_wpm                   = EXCLUDED.peak_wpm,
         accuracy                   = EXCLUDED.accuracy,
         phrases_typed              = EXCLUDED.phrases_typed,
         bonus_round_done           = EXCLUDED.bonus_round_done,
         discount_amount            = EXCLUDED.discount_amount,
         locker_free_days_remaining = EXCLUDED.locker_free_days_remaining,
         pt_sessions_remaining      = EXCLUDED.pt_sessions_remaining,
         discount_used              = false,
         is_expired                 = false,
         expires_at                 = NOW() + INTERVAL '1 day',
         updated_at                 = NOW()
       RETURNING *`,
      [
        customerId, tierKey,
        peakWpm, accuracy, phrasesTyped, bonusRoundDone || false,
        tierConf.discount,
        tierConf.lockerDays,
        tierConf.ptSessions,
      ]
    );
    return rows[0];
  }

  /**
   * Returns the effective discount for a customer if they have a valid,
   * unused, non-expired reward. Returns 0 if no discount applies.
   *
   * @param {number} customerId
   * @returns {{ discountAmount: number, customerRewardId: number|null }}
   */
  static async getApplicableDiscount(customerId) {
    const { rows } = await pool.query(
      `SELECT id, discount_amount
       FROM customer_rewards
       WHERE customer_id   = $1
         AND discount_used = false
         AND is_expired    = false
         AND discount_amount > 0
         AND expires_at   > NOW()
       LIMIT 1`,
      [customerId]
    );

    if (!rows.length) return { discountAmount: 0, customerRewardId: null };
    return {
      discountAmount:   Number(rows[0].discount_amount),
      customerRewardId: rows[0].id,
    };
  }

  /**
   * Mark the discount as used.
   * Called inside the same DB transaction as payment capture.
   *
   * @param {number} customerRewardId
   * @param {number} paymentId
   * @param {object} [client] - pg PoolClient
   */
  static async markDiscountUsed(customerRewardId, paymentId, client) {
    const db = client || pool;
    await db.query(
      `UPDATE customer_rewards
       SET discount_used    = true,
           discount_used_at = NOW()
       WHERE id = $1`,
      [customerRewardId]
    );

    // Log the redemption
    await db.query(
      `INSERT INTO reward_redemptions (
         customer_reward_id, customer_id,
         redemption_type, amount_value, payment_id
       )
       SELECT $1, customer_id, 'discount', discount_amount, $2
       FROM customer_rewards WHERE id = $1`,
      [customerRewardId, paymentId]
    );
  }

  /**
   * After a member row is created, copy locker / PT perks onto it.
   * Called inside the same DB transaction as members INSERT.
   *
   * @param {number} memberId
   * @param {number} customerId
   * @param {object} [client] - pg PoolClient
   */
  static async applyPerksToMember(memberId, customerId, client) {
    const db = client || pool;

    const { rows } = await db.query(
      `SELECT id, tier_key, locker_free_days_remaining, pt_sessions_remaining
       FROM customer_rewards
       WHERE customer_id = $1
         AND is_expired  = false`,
      [customerId]
    );

    if (!rows.length) return;

    const reward       = rows[0];
    const lockerDays   = reward.locker_free_days_remaining;
    const ptSessions   = reward.pt_sessions_remaining;

    // Update the member row
    await db.query(
      `UPDATE members
       SET locker_free_until  = CASE WHEN $2 > 0
                                     THEN CURRENT_DATE + ($2 || ' days')::INTERVAL
                                     ELSE NULL END,
           pt_sessions_credit = $3,
           reward_tier        = $4
       WHERE id = $1`,
      [memberId, lockerDays, ptSessions, reward.tier_key]
    );

    if (lockerDays > 0) {
      await db.query(
        `INSERT INTO reward_redemptions (
           customer_reward_id, customer_id,
           redemption_type, days_value
         ) VALUES ($1, $2, 'locker_access', $3)`,
        [reward.id, customerId, lockerDays]
      );
    }

    if (ptSessions > 0) {
      await db.query(
        `INSERT INTO reward_redemptions (
           customer_reward_id, customer_id,
           redemption_type, sessions_value
         ) VALUES ($1, $2, 'pt_session', $3)`,
        [reward.id, customerId, ptSessions]
      );
    }
  }

  static resolveTierKey = resolveTierKey;
  static TIER_MAP       = TIER_MAP;
}

module.exports = Reward;