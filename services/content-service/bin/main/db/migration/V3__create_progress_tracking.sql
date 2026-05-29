-- =============================================================
-- V3: User Progress Tracking
-- Tracks completion of topics and lessons, time spent, XP earned.
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- USER PROGRESS (per topic)
-- status: 'not_started' | 'in_progress' | 'completed'
-- xp_earned: accumulated when topic is completed
-- ─────────────────────────────────────────────────────────────
CREATE TABLE user_progress (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id        UUID         NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    status          VARCHAR(50)  NOT NULL DEFAULT 'not_started'
                                 CHECK (status IN ('not_started', 'in_progress', 'completed')),
    completion_pct  INT          NOT NULL DEFAULT 0 CHECK (completion_pct BETWEEN 0 AND 100),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    xp_earned       INT          NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, topic_id)
);

COMMENT ON TABLE user_progress IS 'Tracks each user''s progress per topic. Updated as lessons are completed.';
COMMENT ON COLUMN user_progress.completion_pct IS 'Percentage of lessons completed (0-100). Auto-calculated when lessons are marked complete.';
COMMENT ON COLUMN user_progress.xp_earned IS 'XP awarded when topic status transitions to completed.';

-- ─────────────────────────────────────────────────────────────
-- LESSON COMPLETIONS (per lesson)
-- Granular completion tracking. Drives completion_pct in user_progress.
-- time_spent_secs: seconds the user spent on this lesson section.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE lesson_completions (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id       UUID         NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    time_spent_secs INT          NOT NULL DEFAULT 0 CHECK (time_spent_secs >= 0),

    UNIQUE (user_id, lesson_id)
);

COMMENT ON TABLE lesson_completions IS 'Records when a user completes each lesson section. Used to calculate topic completion_pct.';
COMMENT ON COLUMN lesson_completions.time_spent_secs IS 'Time user actively spent on this lesson, tracked client-side.';

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_progress_user_id      ON user_progress(user_id);
CREATE INDEX idx_progress_topic_id     ON user_progress(topic_id);
CREATE INDEX idx_progress_status       ON user_progress(user_id, status);
CREATE INDEX idx_progress_completed_at ON user_progress(completed_at) WHERE completed_at IS NOT NULL;

CREATE INDEX idx_completions_user      ON lesson_completions(user_id);
CREATE INDEX idx_completions_lesson    ON lesson_completions(lesson_id);
CREATE INDEX idx_completions_date      ON lesson_completions(completed_at DESC);
