CREATE TABLE spaced_review_schedules (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    topic_id UUID NOT NULL,
    topic_slug VARCHAR(255) NOT NULL,
    easiness_factor REAL NOT NULL DEFAULT 2.5,
    interval_days INTEGER NOT NULL DEFAULT 0,
    repetitions INTEGER NOT NULL DEFAULT 0,
    next_review_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, topic_id)
);

CREATE INDEX idx_spaced_review_next_review ON spaced_review_schedules(user_id, next_review_date);
