-- =========================================================
-- V1 — DevMastery core schema (monolith baseline)
-- Consolidates the per-service tables from the previous
-- microservices into a single, normalised schema.
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── AUTH ─────────────────────────────────────────────────
CREATE TABLE users (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email           varchar(255) NOT NULL UNIQUE,
    password_hash   varchar(255) NOT NULL,
    full_name       varchar(255),
    auth_provider   varchar(50)  NOT NULL DEFAULT 'local',
    role            varchar(20)  NOT NULL DEFAULT 'USER',
    subscription    varchar(20)  NOT NULL DEFAULT 'free',
    created_at      timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_email ON users (lower(email));

-- ─── CONTENT ──────────────────────────────────────────────
CREATE TABLE learning_paths (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            varchar(100) NOT NULL UNIQUE,
    title           varchar(255) NOT NULL,
    description     text,
    icon            varchar(100),
    accent_color    varchar(20),
    display_order   int NOT NULL DEFAULT 0
);

CREATE TABLE topics (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            varchar(150) NOT NULL UNIQUE,
    title           varchar(255) NOT NULL,
    path_id         uuid REFERENCES learning_paths(id) ON DELETE SET NULL,
    level           int NOT NULL DEFAULT 1,
    display_order   int NOT NULL DEFAULT 0,
    status          varchar(20) NOT NULL DEFAULT 'draft',
    xp_reward       int NOT NULL DEFAULT 10,
    estimated_mins  int NOT NULL DEFAULT 15,
    tags            jsonb,
    why             text,
    theory          text,
    visual          text,
    code            text,
    real_world      text,
    interview       text,
    feynman         text,
    build           text,
    spaced_review   text
);
CREATE INDEX idx_topics_path   ON topics (path_id);
CREATE INDEX idx_topics_status ON topics (status);
CREATE INDEX idx_topics_tags   ON topics USING gin (tags);

CREATE TABLE lessons (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id    uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    section     varchar(50)  NOT NULL,
    content     text
);
CREATE INDEX idx_lessons_topic ON lessons (topic_id);

CREATE TABLE code_examples (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id        uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    language        varchar(50) NOT NULL,
    code            text,
    explanation     text,
    expected_output text
);
CREATE INDEX idx_code_examples_topic ON code_examples (topic_id);

CREATE TABLE lesson_completions (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id     uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, lesson_id)
);

-- ─── PROGRESS / GAMIFICATION ──────────────────────────────
CREATE TABLE user_xp_events (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id    uuid,
    xp_amount   int  NOT NULL,
    event_type  varchar(50) NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_xp_user ON user_xp_events (user_id);

CREATE TABLE user_streaks (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_streak  int  NOT NULL DEFAULT 0,
    longest_streak  int  NOT NULL DEFAULT 0,
    last_activity_date date
);

CREATE TABLE user_badges (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_slug  varchar(100) NOT NULL,
    earned_at   timestamptz  NOT NULL DEFAULT now(),
    UNIQUE (user_id, badge_slug)
);

CREATE TABLE spaced_review_schedules (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id          uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    next_review_date  date NOT NULL,
    interval_days     int  NOT NULL DEFAULT 1,
    ease_factor       double precision NOT NULL DEFAULT 2.5,
    repetitions       int  NOT NULL DEFAULT 0,
    UNIQUE (user_id, topic_id)
);
CREATE INDEX idx_review_user_due ON spaced_review_schedules (user_id, next_review_date);

-- ─── QUIZ ─────────────────────────────────────────────────
CREATE TABLE quizzes (
    id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title     varchar(255) NOT NULL,
    topic_id  uuid REFERENCES topics(id) ON DELETE SET NULL
);

CREATE TABLE quiz_questions (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id         uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    prompt          text NOT NULL,
    options         jsonb NOT NULL,
    correct_option  varchar(255) NOT NULL,
    display_order   int  NOT NULL DEFAULT 0
);
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions (quiz_id);
