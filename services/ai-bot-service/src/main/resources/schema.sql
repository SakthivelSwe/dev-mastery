CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    topic_slug VARCHAR(255) NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    score INT,
    feedback TEXT,
    transcript JSONB NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
