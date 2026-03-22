
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
│  │  ├─ emailTemplates.js
│  │  ├─ mailer.js
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
│  │  ├─ Reward.js
│  │  ├─ Token.js
│  │  ├─ Trainer.js
│  │  ├─ TrainerApplication.js
│  │  └─ User.js
│  ├─ nginx-fitzone.conf
│  ├─ nginx-http-block-additions.conf
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ proxy_params
│  ├─ routes
│  │  ├─ assignments.js
│  │  ├─ auth.js
│  │  ├─ customers.js
│  │  ├─ leads.js
│  │  ├─ members.js
│  │  ├─ notifications.js
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
│  │  ├─ favicon.svg
│  │  ├─ hero-loop.mp4
│  │  └─ images
│  │     ├─ about
│  │     │  ├─ boxing-ring.png
│  │     │  ├─ cardio-deck.png
│  │     │  ├─ deadlift-for-background-1.png
│  │     │  ├─ functional-training.png
│  │     │  ├─ group-classes.png
│  │     │  └─ strength-zone.png
│  │     ├─ sessions
│  │     │  ├─ boxing.png
│  │     │  ├─ cardio-conditioning.png
│  │     │  ├─ functional-training.png
│  │     │  ├─ hiit.png
│  │     │  ├─ personal-training.png
│  │     │  ├─ strength-training.png
│  │     │  ├─ yoga.png
│  │     │  └─ zumba.png
│  │     └─ trainers
│  │        ├─ female1.jpeg
│  │        ├─ female2.jpeg
│  │        ├─ male1.jpeg
│  │        └─ male2.jpeg
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
│  │  ├─ emailTemplates.js
│  │  ├─ mailer.js
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
│  │  ├─ Reward.js
│  │  ├─ Token.js
│  │  ├─ Trainer.js
│  │  ├─ TrainerApplication.js
│  │  └─ User.js
│  ├─ nginx-fitzone.conf
│  ├─ nginx-http-block-additions.conf
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ proxy_params
│  ├─ routes
│  │  ├─ assignments.js
│  │  ├─ auth.js
│  │  ├─ customers.js
│  │  ├─ leads.js
│  │  ├─ members.js
│  │  ├─ notifications.js
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
│  │  ├─ favicon.svg
│  │  ├─ hero-loop.mp4
│  │  └─ images
│  │     ├─ about
│  │     │  ├─ boxing-ring.png
│  │     │  ├─ cardio-deck.png
│  │     │  ├─ deadlift-for-background-1.png
│  │     │  ├─ functional-training.png
│  │     │  ├─ group-classes.png
│  │     │  └─ strength-zone.png
│  │     ├─ sessions
│  │     │  ├─ boxing.png
│  │     │  ├─ cardio-conditioning.png
│  │     │  ├─ functional-training.png
│  │     │  ├─ hiit.png
│  │     │  ├─ personal-training.png
│  │     │  ├─ strength-training.png
│  │     │  ├─ yoga.png
│  │     │  └─ zumba.png
│  │     └─ trainers
│  │        ├─ female1.jpeg
│  │        ├─ female2.jpeg
│  │        ├─ male1.jpeg
│  │        └─ male2.jpeg
│  ├─ README.md
│  ├─ src
│  │  ├─ api
│  │  │  └─ axios.js
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ components
│  │  │  ├─ AdminUi.jsx
│  │  │  ├─ DashLayout.jsx
│  │  │  ├─ FitZoneChatbot.jsx
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