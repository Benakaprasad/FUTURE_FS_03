const { sendMail }   = require('./mailer');
const emailTemplates = require('./emailTemplates');
const pool           = require('../config/database');

let pushToRole;
function getPush() {
  if (!pushToRole) ({ pushToRole } = require('../routes/notifications'));
  return pushToRole;
}

async function createNotification({ type, title, message, target_roles = ['admin'] }) {
  try {
    for (const role of target_roles) {
      const { rows } = await pool.query(
        `INSERT INTO notifications (type, title, message, target_role, is_read, created_at)
         VALUES ($1, $2, $3, $4, false, NOW())
         RETURNING *`,
        [type, title, message, role]
      );
      getPush()(role, rows[0]);
    }
  } catch (err) {
    console.error('[notify] Failed to create notification:', err.message);
  }
}

async function safeMail(to, subject, html) {
  try {
    await sendMail({ to, subject, html });
  } catch (err) {
    console.error('[notify] Email failed — will not retry:', err.message);
  }
}

module.exports = {

  // ── Admin only ────────────────────────────────────────────
  trainerRegistered: async (user) => {
    const { subject, html } = emailTemplates.trainerApplicationReceived(user);
    await safeMail(user.email, subject, html);
    return createNotification({
      type:         'trainer_registration',
      title:        '💪 New Trainer Application',
      message:      `${user.full_name || user.username} has applied to join as a trainer.`,
      target_roles: ['admin'],
    });
  },

  trainerApproved: async (user) => {
    const { subject, html } = emailTemplates.trainerApproved(user);
    await safeMail(user.email, subject, html);
    return createNotification({
      type:         'application_approved',
      title:        '✅ Trainer Approved',
      message:      `${user.full_name || user.username} has been approved and can now log in.`,
      target_roles: ['admin'],
    });
  },

  trainerRejected: async (user, notes = null) => {
    const { subject, html } = emailTemplates.trainerRejected({ ...user, notes });
    await safeMail(user.email, subject, html);
    return createNotification({
      type:         'application_rejected',
      title:        '❌ Trainer Rejected',
      message:      `${user.full_name || user.username}'s application was rejected.`,
      target_roles: ['admin'],
    });
  },

  staffCreated: (user) => createNotification({
    type:         'system',
    title:        '🔑 New Staff Account Created',
    message:      `${user.full_name || user.username} (${user.email}) was added as staff.`,
    target_roles: ['admin'],
  }),

  // ── Admin + Staff ─────────────────────────────────────────
  customerRegistered: async (user) => {
    const { subject, html } = emailTemplates.customerWelcome(user);
    await safeMail(user.email, subject, html);
    return createNotification({
      type:         'customer_registration',
      title:        '🏋️ New Member Registered',
      message:      `${user.full_name || user.username} (${user.email}) just created a member account.`,
      target_roles: ['admin', 'staff'],
    });
  },

  membershipRequest: (customer_name, plan_type) => createNotification({
    type:         'membership_request',
    title:        '📋 New Membership Request',
    message:      `${customer_name} has requested a ${plan_type} membership.`,
    target_roles: ['admin', 'staff'],
  }),

  membershipExpiring: (customer_name, days) => createNotification({
    type:         'expiry',
    title:        '⚠️ Membership Expiring Soon',
    message:      `${customer_name}'s membership expires in ${days} day${days === 1 ? '' : 's'}.`,
    target_roles: ['admin', 'staff'],
  }),

  paymentReceived: (customer_name, amount) => createNotification({
    type:         'payment',
    title:        '💳 Payment Received',
    message:      `₹${amount} received from ${customer_name}.`,
    target_roles: ['admin', 'staff'],
  }),
};