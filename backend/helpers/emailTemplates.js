const BASE = (content) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <style>
      body { margin:0; padding:0; background:#0a0a0a; font-family:'Helvetica Neue',Arial,sans-serif; color:#fff; }
      .wrap { max-width:560px; margin:0 auto; padding:40px 20px; }
      .logo { font-size:28px; font-weight:900; letter-spacing:4px; color:#FF1A1A; margin-bottom:4px; }
      .logo-sub { font-size:10px; letter-spacing:6px; color:rgba(255,255,255,0.3); margin-bottom:32px; }
      .card { background:#111; border:1px solid rgba(255,255,255,0.07); border-radius:16px; padding:32px; }
      .accent { color:#FF1A1A; }
      .accent-green { color:#22C55E; }
      .accent-amber { color:#FFB800; }
      .accent-blue  { color:#00C2FF; }
      h1 { font-size:26px; letter-spacing:2px; margin:0 0 8px; }
      p  { font-size:14px; line-height:1.8; color:rgba(255,255,255,0.55); margin:0 0 16px; }
      .badge { display:inline-block; padding:4px 14px; border-radius:100px; font-size:11px; font-weight:700; letter-spacing:2px; }
      .badge-amber { background:rgba(255,184,0,0.1); border:1px solid rgba(255,184,0,0.3); color:#FFB800; }
      .badge-green { background:rgba(34,197,94,0.1);  border:1px solid rgba(34,197,94,0.3);  color:#22C55E; }
      .badge-red   { background:rgba(255,26,26,0.1);  border:1px solid rgba(255,26,26,0.3);  color:#FF1A1A; }
      .divider { height:1px; background:rgba(255,255,255,0.06); margin:24px 0; }
      .step { display:flex; gap:12px; align-items:flex-start; margin-bottom:12px; }
      .step-num { width:24px; height:24px; border-radius:50%; background:rgba(255,26,26,0.15); border:1px solid rgba(255,26,26,0.3); color:#FF1A1A; font-size:11px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
      .step-text { font-size:13px; color:rgba(255,255,255,0.5); line-height:1.6; }
      .cred-box { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:16px 20px; margin:16px 0; }
      .cred-row { font-size:13px; color:rgba(255,255,255,0.4); margin-bottom:6px; }
      .cred-val { color:#fff; font-weight:700; font-size:15px; }
      .footer { margin-top:32px; text-align:center; font-size:11px; color:rgba(255,255,255,0.15); line-height:1.8; }
      .btn { display:inline-block; padding:12px 28px; background:#FF1A1A; color:#fff; text-decoration:none; border-radius:8px; font-weight:800; font-size:13px; letter-spacing:2px; margin-top:8px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="logo">FITZONE</div>
      <div class="logo-sub">GYM · EST. 2018</div>
      <div class="card">${content}</div>
      <div class="footer">
        FitZone Gym · This is an automated message, please do not reply.<br/>
        © ${new Date().getFullYear()} FitZone Gym. All rights reserved.
      </div>
    </div>
  </body>
  </html>
`;

// ── Customer welcome ──────────────────────────────────────────────────────────
const customerWelcome = ({ full_name, username, email }) => ({
  subject: '🏋️ Welcome to FitZone Gym!',
  html: BASE(`
    <span class="badge badge-green" style="margin-bottom:20px;">ACCOUNT CREATED</span>
    <h1>WELCOME,<br/><span class="accent-green">${(full_name || username).toUpperCase()}!</span></h1>
    <p>You're officially part of the FitZone family. Your member account is ready — head to your dashboard to explore memberships, request a trainer, and track your progress.</p>
    <div class="divider"></div>
    <p style="font-size:12px;letter-spacing:2px;color:rgba(255,255,255,0.25);margin-bottom:10px;">YOUR LOGIN DETAILS</p>
    <div class="cred-box">
      <div class="cred-row">Email &nbsp;<span class="cred-val">${email}</span></div>
      <div class="cred-row">Username &nbsp;<span class="cred-val">${username}</span></div>
    </div>
    <p>Use the button below to log in anytime.</p>
    <a href="${process.env.FRONTEND_URL}/login" class="btn">LOG IN TO DASHBOARD</a>
    <div class="divider"></div>
    <p style="font-size:12px;color:rgba(255,255,255,0.3);">
      🎯 Visit us at the gym for a free fitness assessment on your first visit.<br/>
      No joining fee this month — your membership starts when you're ready.
    </p>
  `),
});

// ── Trainer application received ──────────────────────────────────────────────
const trainerApplicationReceived = ({ full_name, username, email }) => ({
  subject: '📋 FitZone — Trainer Application Received',
  html: BASE(`
    <span class="badge badge-amber" style="margin-bottom:20px;">APPLICATION RECEIVED</span>
    <h1>HI, <span class="accent">${(full_name || username).toUpperCase()}!</span></h1>
    <p>Thank you for applying to join FitZone Gym as a trainer. We've received your application and our management team will review your qualifications shortly.</p>
    <div class="divider"></div>
    <p style="font-size:12px;letter-spacing:2px;color:rgba(255,255,255,0.25);margin-bottom:14px;">WHAT HAPPENS NEXT</p>
    ${[
      'Our team reviews your profile, certifications & experience online',
      'Visit FitZone Gym in person with your <strong style="color:#fff">original ID proof</strong> & <strong style="color:#fff">certification documents</strong>',
      'Staff verifies your documents and uploads them to the system',
      'Admin approves your profile — you\'ll be notified immediately',
      'Once approved, log in with your credentials below',
    ].map((s, i) => `
      <div class="step">
        <div class="step-num">${i + 1}</div>
        <div class="step-text">${s}</div>
      </div>
    `).join('')}
    <div class="divider"></div>
    <p style="font-size:12px;letter-spacing:2px;color:rgba(255,255,255,0.25);margin-bottom:10px;">YOUR LOGIN DETAILS (ACTIVE AFTER APPROVAL)</p>
    <div class="cred-box">
      <div class="cred-row">Email &nbsp;<span class="cred-val">${email}</span></div>
      <div class="cred-row">Username &nbsp;<span class="cred-val">${username}</span></div>
      <div class="cred-row" style="margin-top:8px;font-size:12px;color:rgba(255,184,0,0.7);">⚠️ You can only log in after your application is approved.</div>
    </div>
  `),
});

// ── Trainer approved ──────────────────────────────────────────────────────────
const trainerApproved = ({ full_name, username, email }) => ({
  subject: '✅ FitZone — Your Trainer Application is Approved!',
  html: BASE(`
    <span class="badge badge-green" style="margin-bottom:20px;">APPLICATION APPROVED</span>
    <h1>CONGRATULATIONS,<br/><span class="accent-green">${(full_name || username).toUpperCase()}!</span></h1>
    <p>Your trainer application has been reviewed and approved by FitZone management. You now have full access to your trainer dashboard.</p>
    <div class="divider"></div>
    <p style="font-size:12px;letter-spacing:2px;color:rgba(255,255,255,0.25);margin-bottom:10px;">LOG IN WITH YOUR CREDENTIALS</p>
    <div class="cred-box">
      <div class="cred-row">Email &nbsp;<span class="cred-val">${email}</span></div>
      <div class="cred-row">Username &nbsp;<span class="cred-val">${username}</span></div>
    </div>
    <a href="${process.env.FRONTEND_URL}/login" class="btn">ACCESS YOUR DASHBOARD</a>
    <div class="divider"></div>
    <p style="font-size:12px;color:rgba(255,255,255,0.3);">
      From your dashboard you can view assigned members, manage your schedule, and update your profile.<br/><br/>
      Welcome to the FitZone team. Let's get to work. 💪
    </p>
  `),
});

// ── Trainer rejected ──────────────────────────────────────────────────────────
const trainerRejected = ({ full_name, username, email, notes }) => ({
  subject: 'FitZone — Update on Your Trainer Application',
  html: BASE(`
    <span class="badge badge-red" style="margin-bottom:20px;">APPLICATION REVIEWED</span>
    <h1>HI, <span class="accent">${(full_name || username).toUpperCase()}</span></h1>
    <p>Thank you for taking the time to apply as a trainer at FitZone Gym. After careful review of your qualifications and experience, we are unable to move forward with your application at this time.</p>
    ${notes ? `
    <div class="divider"></div>
    <p style="font-size:12px;letter-spacing:2px;color:rgba(255,255,255,0.25);margin-bottom:10px;">NOTE FROM MANAGEMENT</p>
    <div class="cred-box">
      <p style="font-style:italic;color:rgba(255,255,255,0.6);margin:0;">"${notes}"</p>
    </div>
    ` : ''}
    <div class="divider"></div>
    <p style="font-size:12px;letter-spacing:2px;color:rgba(255,255,255,0.25);margin-bottom:14px;">INTERESTED IN REAPPLYING?</p>
    ${[
      'Strengthen your certifications and hands-on experience',
      'Visit FitZone Gym in person during working hours',
      'Carry Aadhar card, address proof & updated certificates',
      'Meet our management team for a physical review',
    ].map((s, i) => `
      <div class="step">
        <div class="step-num">${i + 1}</div>
        <div class="step-text">${s}</div>
      </div>
    `).join('')}
    <p style="margin-top:16px;font-size:13px;color:rgba(255,255,255,0.3);">We appreciate your interest in FitZone Gym and wish you the best in your fitness career.</p>
  `),
});

module.exports = {
  customerWelcome,
  trainerApplicationReceived,
  trainerApproved,
  trainerRejected,
};