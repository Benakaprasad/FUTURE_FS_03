require('../env');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendMail({ to, subject, html }) {
  try {
    await transporter.sendMail({
      from:    process.env.MAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`[mailer] Sent "${subject}" → ${to}`);
  } catch (err) {
    console.error('[mailer] Failed:', err.message);
  }
}

module.exports = { sendMail };