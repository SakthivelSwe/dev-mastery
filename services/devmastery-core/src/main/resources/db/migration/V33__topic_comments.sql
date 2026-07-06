-- =========================================================
-- V33 — Community discussion threads (topic-scoped comments)
-- =========================================================

-- Main comments table (supports threading via parent_id)
CREATE TABLE IF NOT EXISTS topic_comments (
    id              UUID        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_slug      TEXT        NOT NULL,
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id       UUID        REFERENCES topic_comments(id) ON DELETE CASCADE,
    body            TEXT        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
    upvotes         INT         NOT NULL DEFAULT 0,
    is_flagged      BOOLEAN     NOT NULL DEFAULT false,
    is_deleted      BOOLEAN     NOT NULL DEFAULT false,   -- soft delete
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tc_topic_slug    ON topic_comments (topic_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tc_parent        ON topic_comments (parent_id)   WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tc_user          ON topic_comments (user_id);

-- Per-user upvote tracking (prevents double-voting)
CREATE TABLE IF NOT EXISTS comment_upvotes (
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment_id  UUID NOT NULL REFERENCES topic_comments(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, comment_id)
);

-- Row-Level Security ─────────────────────────────────────────────────────────

ALTER TABLE topic_comments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_upvotes ENABLE ROW LEVEL SECURITY;

-- Anyone can read non-deleted, non-flagged comments
CREATE POLICY tc_select ON topic_comments
    FOR SELECT USING (is_deleted = false AND is_flagged = false);

-- Authenticated users can insert their own comments
CREATE POLICY tc_insert ON topic_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Authors can update their own body (edit within 15 min) — enforced in app layer
CREATE POLICY tc_update ON topic_comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Authors can soft-delete their own posts
CREATE POLICY tc_delete ON topic_comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Upvotes: each user can manage their own rows
CREATE POLICY cuv_select ON comment_upvotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cuv_insert ON comment_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cuv_delete ON comment_upvotes FOR DELETE USING (auth.uid() = user_id);

-- Trigger: keep updated_at current
CREATE OR REPLACE FUNCTION set_tc_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_tc_updated_at ON topic_comments;
CREATE TRIGGER trg_tc_updated_at
    BEFORE UPDATE ON topic_comments
    FOR EACH ROW EXECUTE FUNCTION set_tc_updated_at();

