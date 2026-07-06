-- V29__streak_freeze.sql
-- Adds "freeze tokens" to user_streaks so learners can protect a streak
-- through one missed day. Also records when a freeze was earned/consumed
-- for auditability.

ALTER TABLE user_streaks
    ADD COLUMN IF NOT EXISTS freeze_count      INT       NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_freeze_used  DATE               DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS total_freezes_used INT      NOT NULL DEFAULT 0;

COMMENT ON COLUMN user_streaks.freeze_count       IS 'Unused freezes available (max 3).';
COMMENT ON COLUMN user_streaks.last_freeze_used   IS 'Last date on which a freeze protected the streak.';
COMMENT ON COLUMN user_streaks.total_freezes_used IS 'Lifetime count of freezes redeemed.';

-- Grant every existing learner 1 starter freeze so they can taste the feature.
UPDATE user_streaks SET freeze_count = 1 WHERE freeze_count = 0;

