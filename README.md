
```
FUTURE_FS_03
├─ backend
│  ├─ .env
│  ├─ .env.production
│  ├─ config
│  │  └─ database.js
│  ├─ constants
│  │  ├─ roles.js
│  │  └─ statuses.js
│  ├─ env.js
│  ├─ helpers
│  │  └─ notify.js
│  ├─ jobs
│  │  └─ cleanupTokens.js
│  ├─ middleware
│  │  ├─ auditLog.js
│  │  ├─ auth.js
│  │  ├─ rateLimiter.js
│  │  ├─ role.js
│  │  ├─ sanitize.js
│  │  └─ validate.js
│  ├─ migration.sql
│  ├─ models
│  │  ├─ Assignment.js
│  │  ├─ Customer.js
│  │  ├─ Lead.js
│  │  ├─ Member.js
│  │  ├─ Payment.js
│  │  ├─ Request.js
│  │  ├─ Token.js
│  │  ├─ Trainer.js
│  │  ├─ TrainerApplication.js
│  │  └─ User.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes
│  │  ├─ assignments.js
│  │  ├─ auth.js
│  │  ├─ customers.js
│  │  ├─ leads.js
│  │  ├─ members.js
│  │  ├─ payments.js
│  │  ├─ public.js
│  │  ├─ requests.js
│  │  ├─ trainerApplications.js
│  │  ├─ trainers.js
│  │  └─ users.js
│  └─ server.js
├─ frontend
│  ├─ .env
│  ├─ .env.production
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ images
│  │  │  ├─ sessions
│  │  │  │  ├─ boxing.jpg
│  │  │  │  ├─ cardio-conditioning.jpg
│  │  │  │  ├─ functional-training.jpg
│  │  │  │  ├─ hiit.jpg
│  │  │  │  ├─ personal-training.jpg
│  │  │  │  ├─ strength-training.jpg
│  │  │  │  ├─ yoga.jpg
│  │  │  │  └─ zumba.jpg
│  │  │  └─ trainers
│  │  │     ├─ trainer-1.jpg
│  │  │     ├─ trainer-2.jpg
│  │  │     ├─ trainer-3.jpg
│  │  │     └─ trainer-4.jpg
│  │  ├─ vido (1).mp4
│  │  ├─ vido (2).mp4
│  │  ├─ vido (3).mp4
│  │  ├─ vido (4).mp4
│  │  ├─ vido (5).mp4
│  │  ├─ vido (6).mp4
│  │  ├─ vido (7).mp4
│  │  ├─ vido (8).mp4
│  │  └─ vido (9).mp4
│  ├─ README.md
│  ├─ src
│  │  ├─ api
│  │  │  └─ axios.js
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ components
│  │  │  ├─ AdminUi.jsx
│  │  │  ├─ DashLayout.jsx
│  │  │  ├─ ProtectedRoute.jsx
│  │  │  └─ Sidebar.jsx
│  │  ├─ context
│  │  │  ├─ AuthContext.jsx
│  │  │  └─ NotificationContext.jsx
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  └─ pages
│  │     ├─ admin
│  │     │  ├─ Applications.jsx
│  │     │  ├─ Dashboard.jsx
│  │     │  ├─ Leads.jsx
│  │     │  ├─ Members.jsx
│  │     │  ├─ Payments.jsx
│  │     │  ├─ Requests.jsx
│  │     │  ├─ Trainers.jsx
│  │     │  └─ Users.jsx
│  │     ├─ auth
│  │     │  ├─ Login.jsx
│  │     │  └─ Register.jsx
│  │     ├─ customer
│  │     │  ├─ Dashboard.jsx
│  │     │  ├─ Membership.jsx
│  │     │  ├─ Profile.jsx
│  │     │  └─ Request.jsx
│  │     ├─ public
│  │     │  └─ Home.jsx
│  │     └─ trainer
│  │        ├─ Dashboard.jsx
│  │        ├─ Members.jsx
│  │        └─ Schedule.jsx
│  └─ vite.config.js
└─ README.md

```