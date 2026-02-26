-- ============================================================
-- FITZONE GYM — COMPLETE PRODUCTION DATABASE MIGRATION
-- Version: 3.0 (Final)
-- Run on a fresh PostgreSQL database
-- ============================================================

-- Step 1: Create database (run as postgres superuser, then connect)
-- CREATE DATABASE fitzonegym;
-- \c fitzonegym

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- SHARED updated_at TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TABLE 1: users
-- Central auth table for all roles
-- ============================================================
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50)  UNIQUE NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'customer',
    full_name   VARCHAR(100),
    phone       VARCHAR(15),
    is_active   BOOLEAN      DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    created_by  INTEGER,     -- FK added after table exists (self-ref)
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_role CHECK (
        role IN ('admin','manager','staff','trainer','customer')
    ),
    CONSTRAINT check_phone_format CHECK (
        phone IS NULL OR phone ~ '^[0-9+\-\s]{7,15}$'
    )
);

-- Self-referential FK for created_by
ALTER TABLE users
    ADD CONSTRAINT fk_users_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_users_email      ON users(email);
CREATE INDEX idx_users_role       ON users(role);
CREATE INDEX idx_users_is_active  ON users(is_active);
CREATE INDEX idx_users_created_by ON users(created_by);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE 2: email_verifications
-- Email verification tokens for new registrations
-- ============================================================
CREATE TABLE email_verifications (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_verif_user_id    ON email_verifications(user_id);
CREATE INDEX idx_email_verif_token      ON email_verifications(token_hash);
CREATE INDEX idx_email_verif_expires_at ON email_verifications(expires_at);


-- ============================================================
-- TABLE 3: refresh_tokens
-- DB-backed rotating refresh tokens (never store raw token)
-- ============================================================
CREATE TABLE refresh_tokens (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash   VARCHAR(255) NOT NULL UNIQUE,
    expires_at   TIMESTAMP NOT NULL,
    is_revoked   BOOLEAN   DEFAULT false,
    last_used_at TIMESTAMP,
    ip_address   VARCHAR(45),
    user_agent   TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id     ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash  ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at  ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_is_revoked  ON refresh_tokens(is_revoked);


-- ============================================================
-- TABLE 4: password_resets
-- Forgot password flow tokens
-- ============================================================
CREATE TABLE password_resets (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    used_at     TIMESTAMP,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_token   ON password_resets(token_hash);
CREATE INDEX idx_password_resets_expires ON password_resets(expires_at);


-- ============================================================
-- TABLE 5: login_attempts
-- Brute force protection — track failed logins per IP + email
-- ============================================================
CREATE TABLE login_attempts (
    id           SERIAL PRIMARY KEY,
    email        VARCHAR(100) NOT NULL,
    ip_address   VARCHAR(45)  NOT NULL,
    success      BOOLEAN      DEFAULT false,
    user_agent   TEXT,
    attempted_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_attempts_email        ON login_attempts(email);
CREATE INDEX idx_login_attempts_ip           ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at DESC);
CREATE INDEX idx_login_attempts_success      ON login_attempts(success);


-- ============================================================
-- TABLE 6: leads
-- CRM enquiry tracking — walk-ins, website, referrals
-- ============================================================
CREATE TABLE leads (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL,
    phone       VARCHAR(15),
    source      VARCHAR(50)  DEFAULT 'walk-in',
    status      VARCHAR(20)  DEFAULT 'new',
    notes       TEXT,
    user_id     INTEGER      REFERENCES users(id) ON DELETE SET NULL,
    created_by  INTEGER      REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_lead_status CHECK (
        status IN ('new','contacted','converted','dropped')
    ),
    CONSTRAINT check_lead_source CHECK (
        source IN ('walk-in','website','referral','social','phone','other')
    )
);

CREATE INDEX idx_leads_status      ON leads(status);
CREATE INDEX idx_leads_email       ON leads(email);
CREATE INDEX idx_leads_created_at  ON leads(created_at DESC);
CREATE INDEX idx_leads_user_id     ON leads(user_id);
CREATE INDEX idx_leads_created_by  ON leads(created_by);
CREATE INDEX idx_leads_name_trgm   ON leads USING gin(name gin_trgm_ops);

CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE 7: customers
-- Customer profiles (created on register)
-- ============================================================
CREATE TABLE customers (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth       DATE,
    gender              VARCHAR(20),
    address             TEXT,
    emergency_contact   VARCHAR(15),
    fitness_goals       TEXT,
    medical_conditions  TEXT,
    status              VARCHAR(30) DEFAULT 'registered',
    created_at          TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_customer_status CHECK (
        status IN ('registered','pending_approval','active','inactive')
    ),
    CONSTRAINT check_gender CHECK (
        gender IN ('male','female','other','prefer_not_to_say')
    ),
    CONSTRAINT check_age CHECK (
        date_of_birth IS NULL OR
        date_of_birth <= CURRENT_DATE - INTERVAL '13 years'
    )
);

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_status  ON customers(status);

CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE 8: requests
-- Membership requests submitted by customers
-- ============================================================
CREATE TABLE requests (
    id                   SERIAL PRIMARY KEY,
    customer_id          INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    preferred_trainer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    membership_type      VARCHAR(50),
    message              TEXT,
    status               VARCHAR(20) DEFAULT 'pending',
    admin_notes          TEXT,
    reviewed_by          INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at          TIMESTAMP,
    created_at           TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_request_status CHECK (
        status IN ('pending','reviewed','approved','rejected')
    ),
    CONSTRAINT check_membership_type CHECK (
        membership_type IN (
            'monthly','quarterly','half_yearly','annual','student','corporate'
        )
    )
);

-- One open request per customer at a time (DB enforced)
CREATE UNIQUE INDEX idx_one_active_request
    ON requests(customer_id)
    WHERE status IN ('pending','reviewed');

CREATE INDEX idx_requests_customer_id ON requests(customer_id);
CREATE INDEX idx_requests_status      ON requests(status);
CREATE INDEX idx_requests_created_at  ON requests(created_at DESC);
CREATE INDEX idx_requests_reviewed_by ON requests(reviewed_by);

CREATE TRIGGER trg_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE 9: members
-- Active gym members (from approved request OR manual walk-in)
-- ============================================================
CREATE TABLE members (
    id               SERIAL PRIMARY KEY,
    customer_id      INTEGER UNIQUE NOT NULL
                     REFERENCES customers(id) ON DELETE RESTRICT,
    membership_type  VARCHAR(50)   NOT NULL,
    start_date       DATE          NOT NULL,
    end_date         DATE,
    payment_status   VARCHAR(20)   DEFAULT 'pending',
    amount_paid      DECIMAL(10,2) CHECK (amount_paid >= 0),
    status           VARCHAR(20)   DEFAULT 'active',
    admission_notes  TEXT,
    request_id       INTEGER       REFERENCES requests(id) ON DELETE SET NULL,
    created_by       INTEGER       REFERENCES users(id) ON DELETE SET NULL,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_member_status CHECK (
        status IN ('active','expired','suspended','cancelled')
    ),
    CONSTRAINT check_payment_status CHECK (
        payment_status IN ('pending','paid','partial','refunded')
    ),
    CONSTRAINT check_member_membership_type CHECK (
        membership_type IN (
            'monthly','quarterly','half_yearly','annual','student','corporate'
        )
    ),
    CONSTRAINT check_dates CHECK (
        end_date IS NULL OR end_date > start_date
    )
);

CREATE INDEX idx_members_customer_id ON members(customer_id);
CREATE INDEX idx_members_status      ON members(status);
CREATE INDEX idx_members_end_date    ON members(end_date);
CREATE INDEX idx_members_created_by  ON members(created_by);
CREATE INDEX idx_members_request_id  ON members(request_id);

CREATE TRIGGER trg_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE 10: trainer_applications
-- Public trainer job applications (no auth required to submit)
-- ============================================================
CREATE TABLE trainer_applications (
    id                SERIAL PRIMARY KEY,
    full_name         VARCHAR(100) NOT NULL,
    email             VARCHAR(100) UNIQUE NOT NULL,
    phone             VARCHAR(15),
    specialization    VARCHAR(100),
    experience_years  INTEGER CHECK (
        experience_years >= 0 AND experience_years <= 50
    ),
    certifications    TEXT,
    bio               TEXT,
    resume_url        VARCHAR(500),
    cover_letter      TEXT,
    status            VARCHAR(20) DEFAULT 'pending',
    reviewed_by       INTEGER     REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at       TIMESTAMP,
    admin_notes       TEXT,
    created_at        TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    -- No updated_at: applications are immutable after submission

    CONSTRAINT check_application_status CHECK (
        status IN ('pending','reviewed','approved','rejected')
    )
);

CREATE INDEX idx_trainer_apps_email      ON trainer_applications(email);
CREATE INDEX idx_trainer_apps_status     ON trainer_applications(status);
CREATE INDEX idx_trainer_apps_created_at ON trainer_applications(created_at DESC);


-- ============================================================
-- TABLE 11: trainers
-- Trainer profiles (created automatically on application approval)
-- ============================================================
CREATE TABLE trainers (
    id                SERIAL PRIMARY KEY,
    user_id           INTEGER UNIQUE NOT NULL
                      REFERENCES users(id) ON DELETE CASCADE,
    application_id    INTEGER UNIQUE
                      REFERENCES trainer_applications(id) ON DELETE SET NULL,
    specialization    VARCHAR(100),
    experience_years  INTEGER CHECK (experience_years >= 0),
    certifications    TEXT,
    bio               TEXT,
    profile_image_url VARCHAR(500),
    availability      TEXT,
    max_clients       INTEGER       DEFAULT 20 CHECK (max_clients > 0),
    current_clients   INTEGER       DEFAULT 0  CHECK (current_clients >= 0),
    hourly_rate       DECIMAL(10,2) CHECK (hourly_rate >= 0),
    status            VARCHAR(20)   DEFAULT 'active',
    created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_trainer_status CHECK (
        status IN ('active','on_leave','inactive')
    ),
    CONSTRAINT check_trainer_capacity CHECK (
        current_clients <= max_clients
    )
);

CREATE INDEX idx_trainers_user_id        ON trainers(user_id);
CREATE INDEX idx_trainers_status         ON trainers(status);
CREATE INDEX idx_trainers_application_id ON trainers(application_id);

CREATE TRIGGER trg_trainers_updated_at
    BEFORE UPDATE ON trainers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE 12: assignments
-- Trainer ↔ Member links (one active per member at a time)
-- ============================================================
CREATE TABLE assignments (
    id             SERIAL PRIMARY KEY,
    member_id      INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    trainer_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_date  DATE      NOT NULL DEFAULT CURRENT_DATE,
    end_date       DATE,
    notes          TEXT,
    status         VARCHAR(20) DEFAULT 'active',
    created_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_assignment_status CHECK (
        status IN ('active','completed','reassigned')
    ),
    CONSTRAINT check_assignment_dates CHECK (
        end_date IS NULL OR end_date > assigned_date
    )
);

-- One active trainer per member at a time (DB enforced)
CREATE UNIQUE INDEX idx_one_active_assignment
    ON assignments(member_id)
    WHERE status = 'active';

CREATE INDEX idx_assignments_member_id     ON assignments(member_id);
CREATE INDEX idx_assignments_trainer_id    ON assignments(trainer_id);
CREATE INDEX idx_assignments_status        ON assignments(status);
CREATE INDEX idx_assignments_assigned_date ON assignments(assigned_date DESC);


-- ============================================================
-- TABLE 13: payments
-- Razorpay orders + manual payments + full transaction history
-- ============================================================
CREATE TABLE payments (
    id                   SERIAL PRIMARY KEY,
    member_id            INTEGER REFERENCES members(id) ON DELETE RESTRICT,
    customer_id          INTEGER REFERENCES customers(id) ON DELETE RESTRICT,
    razorpay_order_id    VARCHAR(100) UNIQUE,
    razorpay_payment_id  VARCHAR(100) UNIQUE,
    razorpay_signature   VARCHAR(255),
    idempotency_key      VARCHAR(100) UNIQUE,
    amount               DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency             VARCHAR(10)   DEFAULT 'INR',
    payment_method       VARCHAR(30)   DEFAULT 'razorpay',
    payment_date         DATE          DEFAULT CURRENT_DATE,
    receipt_number       VARCHAR(100)  UNIQUE,
    membership_type      VARCHAR(50),
    status               VARCHAR(20)   DEFAULT 'pending',
    failure_reason       TEXT,
    notes                TEXT,
    recorded_by          INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_payment_status CHECK (
        status IN ('pending','created','captured','failed','refunded')
    ),
    CONSTRAINT check_payment_method CHECK (
        payment_method IN (
            'razorpay','cash','upi','card','netbanking','cheque','other'
        )
    ),
    CONSTRAINT check_payment_membership_type CHECK (
        membership_type IN (
            'monthly','quarterly','half_yearly','annual','student','corporate'
        )
    )
);

CREATE INDEX idx_payments_member_id           ON payments(member_id);
CREATE INDEX idx_payments_customer_id         ON payments(customer_id);
CREATE INDEX idx_payments_razorpay_order_id   ON payments(razorpay_order_id);
CREATE INDEX idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX idx_payments_status              ON payments(status);
CREATE INDEX idx_payments_date                ON payments(payment_date DESC);
CREATE INDEX idx_payments_recorded_by         ON payments(recorded_by);

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE 14: refunds
-- Razorpay refund tracking
-- ============================================================
CREATE TABLE refunds (
    id                  SERIAL PRIMARY KEY,
    payment_id          INTEGER NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    razorpay_refund_id  VARCHAR(100) UNIQUE,
    amount              DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    reason              TEXT,
    status              VARCHAR(20) DEFAULT 'pending',
    initiated_by        INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_refund_status CHECK (
        status IN ('pending','processed','failed')
    )
);

CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX idx_refunds_status     ON refunds(status);

CREATE TRIGGER trg_refunds_updated_at
    BEFORE UPDATE ON refunds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE 15: attendance
-- Daily check-in/check-out tracking
-- ============================================================
CREATE TABLE attendance (
    id          SERIAL PRIMARY KEY,
    member_id   INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    check_in    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out   TIMESTAMP,
    recorded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_checkout_after_checkin CHECK (
        check_out IS NULL OR check_out > check_in
    )
);

-- One check-in per member per day
CREATE UNIQUE INDEX idx_one_checkin_per_day
    ON attendance(member_id, DATE(check_in));

CREATE INDEX idx_attendance_member_id ON attendance(member_id);
CREATE INDEX idx_attendance_check_in  ON attendance(check_in DESC);
CREATE INDEX idx_attendance_recorded_by ON attendance(recorded_by);


-- ============================================================
-- TABLE 16: trainer_schedules
-- Weekly availability slots — required for class booking
-- ============================================================
CREATE TABLE trainer_schedules (
    id            SERIAL PRIMARY KEY,
    trainer_id    INTEGER NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    day_of_week   INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time    TIME NOT NULL,
    end_time      TIME NOT NULL,
    is_available  BOOLEAN   DEFAULT true,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_schedule_times CHECK (end_time > start_time),
    CONSTRAINT unique_trainer_slot   UNIQUE (trainer_id, day_of_week, start_time)
);

-- 0=Sunday 1=Monday 2=Tuesday 3=Wednesday 4=Thursday 5=Friday 6=Saturday

CREATE INDEX idx_schedules_trainer_id ON trainer_schedules(trainer_id);
CREATE INDEX idx_schedules_day        ON trainer_schedules(day_of_week);

CREATE TRIGGER trg_schedules_updated_at
    BEFORE UPDATE ON trainer_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE 17: notifications
-- In-app + email notification log for all users
-- ============================================================
CREATE TABLE notifications (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50)  NOT NULL,
    title       VARCHAR(200) NOT NULL,
    message     TEXT,
    is_read     BOOLEAN   DEFAULT false,
    sent_at     TIMESTAMP,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_notif_type CHECK (
        type IN (
            'membership_approved','membership_rejected','membership_expiring',
            'payment_success','payment_failed','trainer_assigned',
            'application_approved','application_rejected','password_reset',
            'account_created','account_deactivated','general'
        )
    )
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type    ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);


-- ============================================================
-- TABLE 18: audit_log
-- Full change history — who changed what and when
-- ============================================================
CREATE TABLE audit_log (
    id          SERIAL PRIMARY KEY,
    table_name  VARCHAR(100) NOT NULL,
    record_id   INTEGER,
    action      VARCHAR(20)  NOT NULL,
    old_data    JSONB,
    new_data    JSONB,
    changed_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    changed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_action CHECK (
        action IN ('INSERT','UPDATE','DELETE')
    )
);

CREATE INDEX idx_audit_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_record_id  ON audit_log(record_id);
CREATE INDEX idx_audit_changed_by ON audit_log(changed_by);
CREATE INDEX idx_audit_changed_at ON audit_log(changed_at DESC);
-- JSONB indexes for fast data search
CREATE INDEX idx_audit_old_data   ON audit_log USING gin(old_data);
CREATE INDEX idx_audit_new_data   ON audit_log USING gin(new_data);


-- ============================================================
-- MEMBERSHIP EXPIRY AUTO-UPDATE FUNCTION
-- Called by cron job: marks active members as expired
-- ============================================================
CREATE OR REPLACE FUNCTION expire_memberships()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE members
    SET status = 'expired'
    WHERE status = 'active'
      AND end_date IS NOT NULL
      AND end_date < CURRENT_DATE;

    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TRAINER CAPACITY GUARD FUNCTION
-- Prevents over-assignment at DB level
-- ============================================================
CREATE OR REPLACE FUNCTION check_trainer_capacity_on_assign()
RETURNS TRIGGER AS $$
DECLARE
    v_current INTEGER;
    v_max     INTEGER;
BEGIN
    SELECT current_clients, max_clients
    INTO v_current, v_max
    FROM trainers
    WHERE user_id = NEW.trainer_id;

    IF v_current >= v_max THEN
        RAISE EXCEPTION 'Trainer is at full capacity (% / %)', v_current, v_max;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_trainer_capacity
    BEFORE INSERT ON assignments
    FOR EACH ROW
    WHEN (NEW.status = 'active')
    EXECUTE FUNCTION check_trainer_capacity_on_assign();


-- ============================================================
-- AUTO INCREMENT/DECREMENT trainer current_clients
-- ============================================================
CREATE OR REPLACE FUNCTION sync_trainer_client_count()
RETURNS TRIGGER AS $$
BEGIN
    -- New active assignment → increment
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE trainers SET current_clients = current_clients + 1
        WHERE user_id = NEW.trainer_id;

    -- Assignment completed or reassigned → decrement
    ELSIF TG_OP = 'UPDATE'
        AND OLD.status = 'active'
        AND NEW.status IN ('completed','reassigned') THEN
        UPDATE trainers SET current_clients = GREATEST(current_clients - 1, 0)
        WHERE user_id = NEW.trainer_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_trainer_clients
    AFTER INSERT OR UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION sync_trainer_client_count();


-- ============================================================
-- DEFAULT ADMIN ACCOUNT
-- Password: Admin@FitZone2024
-- Hash: bcrypt rounds=12
-- CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN
-- ============================================================
INSERT INTO users (
    username, email, password, role,
    full_name, is_active, is_email_verified
) VALUES (
    'fitzone_admin',
    'admin@fitzonegym.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iYL.',
    'admin',
    'FitZone Administrator',
    true,
    true
) ON CONFLICT (email) DO NOTHING;


-- ============================================================
-- CLEANUP FUNCTION (called by node-cron daily)
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_records()
RETURNS VOID AS $$
BEGIN
    -- Remove expired/revoked refresh tokens
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW() OR is_revoked = true;

    -- Remove expired password reset tokens
    DELETE FROM password_resets
    WHERE expires_at < NOW();

    -- Remove expired email verification tokens
    DELETE FROM email_verifications
    WHERE expires_at < NOW() AND verified_at IS NULL;

    -- Remove old login attempts (keep 24 hours)
    DELETE FROM login_attempts
    WHERE attempted_at < NOW() - INTERVAL '24 hours';

    -- Archive old audit logs (keep 90 days)
    DELETE FROM audit_log
    WHERE changed_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- VERIFY SETUP
-- ============================================================
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c
     WHERE c.table_name = t.table_name
     AND c.table_schema = 'public') AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT COUNT(*) AS total_indexes
FROM pg_indexes
WHERE schemaname = 'public';

SELECT COUNT(*) AS total_triggers
FROM information_schema.triggers
WHERE trigger_schema = 'public';

SELECT COUNT(*) AS total_functions
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION';

-- Expected results:
-- Tables  : 18
-- Indexes : 50+
-- Triggers: 10+
-- Functions: 5