-- V30__interview_sessions.sql
-- Persists mock-interview transcripts so learners can revisit them and
-- so we can analyse which topics people practise most.

CREATE TABLE IF NOT EXISTS interview_sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL,
    topic_slug    VARCHAR(255) NOT NULL,
    target_level  VARCHAR(20)  NOT NULL,        -- junior | mid | senior | staff
    started_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    ended_at      TIMESTAMPTZ,
    verdict       VARCHAR(40),                  -- reject | lean_no | lean_yes | strong_hire
    score_json    JSONB,                        -- {"technical":8,"communication":7,...}
    transcript    JSONB NOT NULL DEFAULT '[]'::jsonb   -- [{role,content,at}, ...]
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user   ON interview_sessions (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_topic  ON interview_sessions (topic_slug);

COMMENT ON TABLE  interview_sessions           IS 'Mock-interview transcripts + scorecards produced by /interview';
COMMENT ON COLUMN interview_sessions.score_json IS 'JSON blob with per-dimension scores from the AI grader';
COMMENT ON COLUMN interview_sessions.transcript IS 'Array of {role:"user"|"model", content:string, at:iso8601}';

