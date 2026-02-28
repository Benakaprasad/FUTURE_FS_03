const pool = require('../config/database');

async function createNotification({ type, title, message, target_role = 'admin' }) {
  try {
    await pool.query(
      `INSERT INTO notifications (type, title, message, target_role, is_read, created_at)
       VALUES ($1, $2, $3, $4, false, NOW())`,
      [type, title, message, target_role]
    );
  } catch (err) {
    console.error('[notify] Failed to create notification:', err.message);
  }
}

module.exports = {
  trainerRegistered: (user) => createNotification({
    type:        'trainer_registration',
    title:       '💪 New Trainer Application',
    message:     `${user.full_name || user.username} has applied to join as a trainer. Review their profile.`,
    target_role: 'admin',
  }),

  customerRegistered: (user) => createNotification({
    type:        'customer_registration',
    title:       '🏋️ New Member Registered',
    message:     `${user.full_name || user.username} (${user.email}) just created a member account.`,
    target_role: 'admin',
  }),

  membershipRequest: (customer_name, plan_type) => createNotification({
    type:        'membership_request',
    title:       '📋 New Membership Request',
    message:     `${customer_name} has requested a ${plan_type} membership. Awaiting approval.`,
    target_role: 'admin',
  }),

  trainerApproved: (trainer_name) => createNotification({
    type:        'system',
    title:       '✅ Trainer Approved',
    message:     `${trainer_name} has been approved and now has full trainer dashboard access.`,
    target_role: 'admin',
  }),

  paymentReceived: (customer_name, amount) => createNotification({
    type:        'payment',
    title:       '💳 Payment Received',
    message:     `₹${amount} received from ${customer_name}.`,
    target_role: 'admin',
  }),

  membershipExpiring: (customer_name, days) => createNotification({
    type:        'expiry',
    title:       '⚠️ Membership Expiring Soon',
    message:     `${customer_name}'s membership expires in ${days} day${days === 1 ? '' : 's'}.`,
    target_role: 'admin',
  }),
};