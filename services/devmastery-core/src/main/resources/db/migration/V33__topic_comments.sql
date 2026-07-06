-- =========================================================
-- V33 - Community discussion threads (topic-scoped comments)
--
-- NOTE: RLS is intentionally NOT enabled here. All access goes
-- through the Spring backend (/v1/comments/**) which enforces
-- ownership in CommentServiceImpl.requireOwned(). Enabling RLS
-- via Supabase's pooler role causes the migration to fail with
-- "permission denied" on Supabase-hosted Postgres.
-- =========================================================
-- Main comments table (supports threading via parent_id)
CREATE TABLE IF NOT EXISTS topic_comments (
    id              UUID        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_slug      TEXT        NOT NULL,
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id       UUID        REFERENCES topic_comments(id) ON DELETE CASCADE,
    body            TEXT        NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
    upvotes         INT         NOT NULL DEFAULT 0,
    is_flagged      BOOLEAN     NOT NULL DEFAULT FALSE,
    is_deleted      BOOLEAN     NOT NULL DEFAULT FALSE,   -- soft delete
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tc_topic_slug ON topic_comments (topic_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tc_parent     ON topic_comments (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tc_user       ON topic_comments (user_id);
-- Per-user upvote tracking (prevents double-voting)
CREATE TABLE IF NOT EXISTS comment_upvotes (
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment_id  UUID NOT NULL REFERENCES topic_comments(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, comment_id)
);
COMMENT ON TABLE topic_comments  IS 'Community discussion threads scoped to a topic slug';
COMMENT ON TABLE comment_upvotes IS 'Per-user upvote tracking to prevent double-voting';
