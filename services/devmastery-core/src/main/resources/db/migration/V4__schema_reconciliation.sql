-- =========================================================
-- V4 — Schema reconciliation patch
--
-- The legacy content-service ran its own V1–V3 migrations
-- which created tables WITHOUT some columns introduced by
-- devmastery-core. This migration adds all missing columns
-- using IF NOT EXISTS so it is safe to run on any DB state.
-- =========================================================

-- ─── code_examples: add expected_output ──────────────────
ALTER TABLE code_examples
    ADD COLUMN IF NOT EXISTS expected_output text;

-- ─── topics: add columns added in devmastery-core V1 ─────
-- (old content-service topics table may lack these)
ALTER TABLE topics
    ADD COLUMN IF NOT EXISTS why           text,
    ADD COLUMN IF NOT EXISTS theory        text,
    ADD COLUMN IF NOT EXISTS visual        text,
    ADD COLUMN IF NOT EXISTS real_world    text,
    ADD COLUMN IF NOT EXISTS interview     text,
    ADD COLUMN IF NOT EXISTS feynman       text,
    ADD COLUMN IF NOT EXISTS build         text,
    ADD COLUMN IF NOT EXISTS spaced_review text,
    ADD COLUMN IF NOT EXISTS xp_reward     int  NOT NULL DEFAULT 10,
    ADD COLUMN IF NOT EXISTS estimated_mins int NOT NULL DEFAULT 15,
    ADD COLUMN IF NOT EXISTS tags          jsonb;

-- ─── Ensure indexes exist (idempotent) ───────────────────
CREATE INDEX IF NOT EXISTS idx_topics_tags         ON topics USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_topics_status       ON topics (status);
CREATE INDEX IF NOT EXISTS idx_code_examples_topic ON code_examples (topic_id);

-- ─── users: ensure role + subscription columns exist ─────
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role         varchar(20) NOT NULL DEFAULT 'USER',
    ADD COLUMN IF NOT EXISTS subscription varchar(20) NOT NULL DEFAULT 'free';

-- ─── learning_paths: add accent_color + icon if missing ──
ALTER TABLE learning_paths
    ADD COLUMN IF NOT EXISTS icon         varchar(100),
    ADD COLUMN IF NOT EXISTS accent_color varchar(20),
    ADD COLUMN IF NOT EXISTS display_order int NOT NULL DEFAULT 0;
