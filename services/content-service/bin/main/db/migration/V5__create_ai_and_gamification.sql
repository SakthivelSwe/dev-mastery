-- =============================================================
-- V5: AI Bot Sessions and Gamification
-- AI conversation storage, streaks, XP, badges.
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- AI BOT SESSIONS
-- One session = one conversation context window.
-- Linked to a user and optionally a topic for context injection.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE ai_bot_sessions (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id        UUID         REFERENCES topics(id) ON DELETE SET NULL,
    mode            VARCHAR(50)  NOT NULL DEFAULT 'doubt_resolver'
                                 CHECK (mode IN ('doubt_resolver', 'code_debugger', 'quiz_generator', 'mock_interviewer', 'code_reviewer', 'concept_explainer')),
    started_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    total_messages  INT          NOT NULL DEFAULT 0,
    total_tokens    INT          NOT NULL DEFAULT 0    -- for daily budget tracking
);

COMMENT ON TABLE ai_bot_sessions IS 'AI bot conversation sessions. Each session maintains its own context window (last 20 messages).';
COMMENT ON COLUMN ai_bot_sessions.mode IS 'Bot mode determines system prompt behavior: doubt_resolver, code_debugger, mock_interviewer, etc.';
COMMENT ON COLUMN ai_bot_sessions.total_tokens IS 'Approximate token usage for daily budget enforcement (Gemini free: 1M tokens/day).';

-- ─────────────────────────────────────────────────────────────
-- AI BOT MESSAGES
-- Individual messages within a session.
-- role: 'user' | 'model' (Gemini uses 'model', not 'assistant')
-- ─────────────────────────────────────────────────────────────
CREATE TABLE ai_bot_messages (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID         NOT NULL REFERENCES ai_bot_sessions(id) ON DELETE CASCADE,
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('user', 'model')),
    content         TEXT         NOT NULL,
    token_count     INT          DEFAULT 0,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ai_bot_messages IS 'Individual messages in AI bot sessions. Role is user or model (Gemini terminology).';

-- ─────────────────────────────────────────────────────────────
-- USER STREAKS
-- One row per user. Tracks daily learning consistency.
-- freeze_count: "streak freeze" tokens to protect streak on missed days.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE user_streaks (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    current_streak  INT          NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak  INT          NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
    last_activity   DATE,
    freeze_count    INT          NOT NULL DEFAULT 1 CHECK (freeze_count >= 0),  -- start with 1 freeze
    total_xp        INT          NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
    badge_level     VARCHAR(50)  NOT NULL DEFAULT 'apprentice'
                                 CHECK (badge_level IN ('apprentice', 'journeyman', 'craftsman', 'architect', 'master')),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_streaks IS 'Daily learning streak tracking. Users get 1 freeze token at signup to protect streaks.';
COMMENT ON COLUMN user_streaks.freeze_count IS 'Streak freeze tokens. When used on a missed day, streak is preserved.';
COMMENT ON COLUMN user_streaks.badge_level IS 'Rank badge: apprentice → journeyman → craftsman → architect → master';

-- ─────────────────────────────────────────────────────────────
-- USER XP HISTORY
-- Audit trail of XP events. Used for leaderboard and history.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE user_xp_events (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type      VARCHAR(50)  NOT NULL CHECK (event_type IN ('lesson_complete', 'topic_complete', 'quiz_pass', 'problem_solved', 'streak_bonus', 'badge_earned')),
    xp_amount       INT          NOT NULL CHECK (xp_amount > 0),
    reference_id    UUID,                    -- topic_id, problem_id, etc.
    description     TEXT,
    earned_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_xp_events IS 'XP transaction log. Every XP award is recorded here for audit and leaderboard.';
COMMENT ON COLUMN user_xp_events.reference_id IS 'Points to the topic, problem, or quiz that generated this XP.';

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_ai_sessions_user      ON ai_bot_sessions(user_id);
CREATE INDEX idx_ai_sessions_topic     ON ai_bot_sessions(topic_id) WHERE topic_id IS NOT NULL;
CREATE INDEX idx_ai_sessions_started   ON ai_bot_sessions(started_at DESC);

CREATE INDEX idx_ai_messages_session   ON ai_bot_messages(session_id);
CREATE INDEX idx_ai_messages_created   ON ai_bot_messages(created_at);

CREATE INDEX idx_streaks_user          ON user_streaks(user_id);
CREATE INDEX idx_streaks_xp            ON user_streaks(total_xp DESC);    -- for leaderboard
CREATE INDEX idx_streaks_badge         ON user_streaks(badge_level);

CREATE INDEX idx_xp_events_user        ON user_xp_events(user_id);
CREATE INDEX idx_xp_events_date        ON user_xp_events(earned_at DESC);
CREATE INDEX idx_xp_events_type        ON user_xp_events(event_type);
