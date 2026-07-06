-- V32__certificates.sql
-- Completion certificates: issued when a learner completes all published
-- topics in a learning path (quiz_score average >= 70 and all topics
-- marked complete in user_topic_progress).
--
-- Certificates are read-only after issuance. A UUID credential_id is the
-- public verification token (no auth needed to verify at /certificates/:id).

CREATE TABLE IF NOT EXISTS certificates (
    id              UUID        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_id   UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    path_slug       TEXT        NOT NULL,
    path_title      TEXT        NOT NULL,
    issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_topics    INT         NOT NULL,
    avg_quiz_score  NUMERIC(5,2),
    pdf_url         TEXT,       -- Cloudflare R2 or Supabase storage URL once generated
    revoked         BOOLEAN     NOT NULL DEFAULT FALSE,
    revoked_reason  TEXT,
    UNIQUE (user_id, path_slug)  -- one certificate per user per path
);

CREATE INDEX certificates_user_idx ON certificates(user_id);
CREATE INDEX certificates_cred_idx ON certificates(credential_id);

-- Adaptive quiz difficulty per user per topic
-- Stores the running accuracy history used to adjust next-session difficulty.
CREATE TABLE IF NOT EXISTS quiz_difficulty (
    user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_slug      TEXT        NOT NULL,
    current_level   SMALLINT    NOT NULL DEFAULT 2 CHECK (current_level BETWEEN 1 AND 4),
    attempts        INT         NOT NULL DEFAULT 0,
    correct         INT         NOT NULL DEFAULT 0,
    last_updated    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, topic_slug)
);

COMMENT ON TABLE certificates IS 'Learning path completion certificates issued to learners';
COMMENT ON TABLE quiz_difficulty IS 'Per-user per-topic adaptive quiz difficulty tracker';

