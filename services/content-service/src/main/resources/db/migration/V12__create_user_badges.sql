-- =============================================================
-- V12: Gamification Badges
-- =============================================================

CREATE TABLE user_badges (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_slug      VARCHAR(100) NOT NULL,
    earned_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, badge_slug)
);

COMMENT ON TABLE user_badges IS 'Tracks achievement badges earned by users.';
COMMENT ON COLUMN user_badges.badge_slug IS 'Unique identifier for the badge (e.g., first-topic, dsa-starter, week-streak).';

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
