const LEAD_STATUSES    = ['new', 'contacted', 'converted', 'dropped'];
const LEAD_SOURCES     = ['walk-in', 'website', 'referral', 'social', 'phone', 'other'];

const MEMBER_STATUSES  = ['active', 'expired', 'suspended', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'partial', 'refunded'];
const MEMBERSHIP_TYPES = ['monthly', 'quarterly', 'half_yearly', 'annual', 'student', 'corporate'];

const REQUEST_STATUSES = ['pending', 'reviewed', 'approved', 'rejected'];

const TRAINER_STATUSES      = ['active', 'on_leave', 'inactive'];
const APPLICATION_STATUSES  = ['pending', 'reviewed', 'approved', 'rejected'];

const PAYMENT_METHODS       = ['razorpay', 'cash', 'upi', 'card', 'netbanking', 'cheque', 'other'];
const RAZORPAY_STATUSES     = ['pending', 'created', 'captured', 'failed', 'refunded'];

const NOTIFICATION_TYPES = [
  'membership_approved', 'membership_rejected', 'membership_expiring',
  'payment_success',     'payment_failed',      'trainer_assigned',
  'application_approved','application_rejected', 'password_reset',
  'account_created',     'account_deactivated',  'general',
];

module.exports = {
  LEAD_STATUSES, LEAD_SOURCES,
  MEMBER_STATUSES, PAYMENT_STATUSES, MEMBERSHIP_TYPES,
  REQUEST_STATUSES, TRAINER_STATUSES, APPLICATION_STATUSES,
  PAYMENT_METHODS, RAZORPAY_STATUSES, NOTIFICATION_TYPES,
};