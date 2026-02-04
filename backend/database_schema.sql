-- ============================================================================
-- PCOS TRACKING SYSTEM - IMPROVED DATABASE SCHEMA
-- ============================================================================
-- This schema includes proper foreign keys, indexes, constraints, and triggers
-- for data integrity and performance optimization
-- ============================================================================

-- Drop existing tables if recreating
-- DROP TABLE IF EXISTS chat_messages;
-- DROP TABLE IF EXISTS daily_logs;
-- DROP TABLE IF EXISTS otp_tokens;
-- DROP TABLE IF EXISTS cycle_data;
-- DROP TABLE IF EXISTS users;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Stores user account information with email verification status
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_email_format CHECK (email LIKE '%@%.%'),
    CONSTRAINT chk_name_length CHECK (LENGTH(name) >= 2),
    CONSTRAINT chk_verification_logic CHECK (
        (is_verified = 1 AND is_active = 1) OR 
        (is_verified = 0)
    )
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON users(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- ============================================================================
-- OTP_TOKENS TABLE
-- ============================================================================
-- Stores one-time passwords for email verification
-- ============================================================================

CREATE TABLE IF NOT EXISTS otp_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    otp_expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_used BOOLEAN NOT NULL DEFAULT 0,
    used_at TIMESTAMP,
    ip_address VARCHAR(45),
    
    -- Foreign Key
    CONSTRAINT fk_otp_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_otp_code_format CHECK (LENGTH(otp_code) = 6),
    CONSTRAINT chk_otp_expiry CHECK (otp_expires_at > created_at),
    CONSTRAINT chk_otp_used_logic CHECK (
        (is_used = 1 AND used_at IS NOT NULL) OR 
        (is_used = 0 AND used_at IS NULL)
    )
);

-- Indexes for otp_tokens table
CREATE INDEX IF NOT EXISTS idx_otp_user_id ON otp_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_code ON otp_tokens(otp_code);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_tokens(otp_expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_is_used ON otp_tokens(is_used);
CREATE INDEX IF NOT EXISTS idx_otp_created_at ON otp_tokens(created_at DESC);

-- ============================================================================
-- DAILY_LOGS TABLE
-- ============================================================================
-- Stores daily symptom tracking data
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    log_date DATE NOT NULL,
    
    -- PCOS Tracking Fields
    period_status VARCHAR(20) DEFAULT 'none',
    mood INTEGER DEFAULT 3,
    acne INTEGER DEFAULT 0,
    hairfall INTEGER DEFAULT 0,
    weight DECIMAL(5,2),
    sleep_hours DECIMAL(4,2),
    cravings INTEGER DEFAULT 0,
    pain_level INTEGER DEFAULT 0,
    exercise_minutes INTEGER DEFAULT 0,
    water_intake_ml INTEGER DEFAULT 0,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_log_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_period_status CHECK (period_status IN ('none', 'spotting', 'period')),
    CONSTRAINT chk_mood_range CHECK (mood BETWEEN 1 AND 5),
    CONSTRAINT chk_acne_range CHECK (acne BETWEEN 0 AND 5),
    CONSTRAINT chk_hairfall_range CHECK (hairfall BETWEEN 0 AND 5),
    CONSTRAINT chk_cravings_range CHECK (cravings BETWEEN 0 AND 5),
    CONSTRAINT chk_pain_range CHECK (pain_level BETWEEN 0 AND 5),
    CONSTRAINT chk_weight_positive CHECK (weight IS NULL OR weight > 0),
    CONSTRAINT chk_sleep_range CHECK (sleep_hours IS NULL OR (sleep_hours >= 0 AND sleep_hours <= 24)),
    CONSTRAINT chk_exercise_positive CHECK (exercise_minutes >= 0),
    CONSTRAINT chk_water_positive CHECK (water_intake_ml >= 0),
    
    -- Unique constraint: one log per user per day
    CONSTRAINT uq_user_date UNIQUE (user_id, log_date)
);

-- Indexes for daily_logs table
CREATE INDEX IF NOT EXISTS idx_log_user_id ON daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_log_date ON daily_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_log_user_date ON daily_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_log_period_status ON daily_logs(period_status);
CREATE INDEX IF NOT EXISTS idx_log_created_at ON daily_logs(created_at DESC);

-- ============================================================================
-- CHAT_MESSAGES TABLE
-- ============================================================================
-- Stores AI chat conversation history
-- ============================================================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    model_used VARCHAR(50),
    response_time DECIMAL(6,2),
    tokens_used INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_chat_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_message_length CHECK (LENGTH(message) > 0),
    CONSTRAINT chk_response_length CHECK (LENGTH(response) > 0),
    CONSTRAINT chk_response_time_positive CHECK (response_time IS NULL OR response_time > 0),
    CONSTRAINT chk_tokens_positive CHECK (tokens_used IS NULL OR tokens_used > 0)
);

-- Indexes for chat_messages table
CREATE INDEX IF NOT EXISTS idx_chat_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_model_used ON chat_messages(model_used);
CREATE INDEX IF NOT EXISTS idx_chat_user_created ON chat_messages(user_id, created_at DESC);

-- ============================================================================
-- CYCLE_DATA TABLE
-- ============================================================================
-- Stores menstrual cycle tracking information
-- ============================================================================

CREATE TABLE IF NOT EXISTS cycle_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    cycle_start DATE NOT NULL,
    cycle_end DATE,
    cycle_length INTEGER,
    flow_intensity VARCHAR(20),
    symptoms TEXT,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_cycle_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_cycle_dates CHECK (cycle_end IS NULL OR cycle_end >= cycle_start),
    CONSTRAINT chk_cycle_length CHECK (cycle_length IS NULL OR (cycle_length >= 1 AND cycle_length <= 90)),
    CONSTRAINT chk_flow_intensity CHECK (
        flow_intensity IS NULL OR 
        flow_intensity IN ('light', 'moderate', 'heavy', 'very_heavy')
    )
);

-- Indexes for cycle_data table
CREATE INDEX IF NOT EXISTS idx_cycle_user_id ON cycle_data(user_id);
CREATE INDEX IF NOT EXISTS idx_cycle_start ON cycle_data(cycle_start DESC);
CREATE INDEX IF NOT EXISTS idx_cycle_user_start ON cycle_data(user_id, cycle_start DESC);

-- ============================================================================
-- USER_SESSIONS TABLE (NEW)
-- ============================================================================
-- Tracks user login sessions for security and analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    
    -- Foreign Key
    CONSTRAINT fk_session_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_session_expiry CHECK (expires_at > created_at)
);

-- Indexes for user_sessions table
CREATE INDEX IF NOT EXISTS idx_session_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_session_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_session_is_active ON user_sessions(is_active);

-- ============================================================================
-- USER_PREFERENCES TABLE (NEW)
-- ============================================================================
-- Stores user preferences and settings
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    email_notifications BOOLEAN DEFAULT 1,
    push_notifications BOOLEAN DEFAULT 0,
    preferred_ai_model VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    CONSTRAINT fk_pref_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_theme CHECK (theme IN ('light', 'dark', 'auto')),
    CONSTRAINT chk_language CHECK (LENGTH(language) >= 2)
);

-- Index for user_preferences table
CREATE INDEX IF NOT EXISTS idx_pref_user_id ON user_preferences(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
-- Automatic timestamp updates and data integrity enforcement
-- ============================================================================

-- Trigger: Update users.updated_at on modification
CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger: Update daily_logs.updated_at on modification
CREATE TRIGGER IF NOT EXISTS trg_logs_updated_at
AFTER UPDATE ON daily_logs
FOR EACH ROW
BEGIN
    UPDATE daily_logs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger: Update cycle_data.updated_at on modification
CREATE TRIGGER IF NOT EXISTS trg_cycle_updated_at
AFTER UPDATE ON cycle_data
FOR EACH ROW
BEGIN
    UPDATE cycle_data SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger: Update user_preferences.updated_at on modification
CREATE TRIGGER IF NOT EXISTS trg_pref_updated_at
AFTER UPDATE ON user_preferences
FOR EACH ROW
BEGIN
    UPDATE user_preferences SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger: Set OTP used_at timestamp when marked as used
CREATE TRIGGER IF NOT EXISTS trg_otp_used_at
AFTER UPDATE OF is_used ON otp_tokens
FOR EACH ROW
WHEN NEW.is_used = 1 AND OLD.is_used = 0
BEGIN
    UPDATE otp_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger: Update users.last_login_at on successful login
-- (This would be called from application code, but we can track session creation)
CREATE TRIGGER IF NOT EXISTS trg_user_last_login
AFTER INSERT ON user_sessions
FOR EACH ROW
BEGIN
    UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = NEW.user_id;
END;

-- Trigger: Create default preferences when user is created
CREATE TRIGGER IF NOT EXISTS trg_create_user_preferences
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO user_preferences (user_id) VALUES (NEW.id);
END;

-- ============================================================================
-- VIEWS
-- ============================================================================
-- Convenient views for common queries
-- ============================================================================

-- View: User summary with statistics
CREATE VIEW IF NOT EXISTS v_user_summary AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.is_verified,
    u.created_at,
    u.last_login_at,
    COUNT(DISTINCT dl.id) as total_logs,
    COUNT(DISTINCT cm.id) as total_chats,
    COUNT(DISTINCT cd.id) as total_cycles,
    MAX(dl.log_date) as last_log_date
FROM users u
LEFT JOIN daily_logs dl ON u.id = dl.user_id
LEFT JOIN chat_messages cm ON u.id = cm.user_id
LEFT JOIN cycle_data cd ON u.id = cd.user_id
GROUP BY u.id;

-- View: Recent activity
CREATE VIEW IF NOT EXISTS v_recent_activity AS
SELECT 
    'log' as activity_type,
    dl.user_id,
    u.email,
    'Daily log for ' || dl.log_date as description,
    dl.created_at
FROM daily_logs dl
JOIN users u ON dl.user_id = u.id
UNION ALL
SELECT 
    'chat' as activity_type,
    cm.user_id,
    u.email,
    'Chat: ' || SUBSTR(cm.message, 1, 50) || '...' as description,
    cm.created_at
FROM chat_messages cm
JOIN users u ON cm.user_id = u.id
ORDER BY created_at DESC
LIMIT 50;

-- View: Active OTP tokens
CREATE VIEW IF NOT EXISTS v_active_otp_tokens AS
SELECT 
    ot.id,
    ot.user_id,
    u.email,
    ot.otp_code,
    ot.otp_expires_at,
    ot.created_at,
    CASE 
        WHEN ot.otp_expires_at > CURRENT_TIMESTAMP THEN 'valid'
        ELSE 'expired'
    END as status
FROM otp_tokens ot
JOIN users u ON ot.user_id = u.id
WHERE ot.is_used = 0;

-- ============================================================================
-- SAMPLE QUERIES
-- ============================================================================

-- Get user with all their data
-- SELECT * FROM v_user_summary WHERE email = 'user@example.com';

-- Get recent activity for a user
-- SELECT * FROM v_recent_activity WHERE user_id = 1;

-- Get active OTP tokens
-- SELECT * FROM v_active_otp_tokens;

-- Get user's logs for last 30 days
-- SELECT * FROM daily_logs 
-- WHERE user_id = 1 
-- AND log_date >= DATE('now', '-30 days')
-- ORDER BY log_date DESC;

-- Get user's chat history
-- SELECT * FROM chat_messages 
-- WHERE user_id = 1 
-- ORDER BY created_at DESC 
-- LIMIT 50;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
