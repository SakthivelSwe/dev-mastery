-- =========================================================
-- V3 — AI conversations + profile + admin tables
-- =========================================================

-- AI chat history (replaces Redis-based session storage)
CREATE TABLE ai_conversations (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_slug  varchar(150),
    messages    jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_conv_user ON ai_conversations (user_id, updated_at DESC);

-- User profiles (extended info beyond auth)
CREATE TABLE user_profiles (
    user_id     uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio         text,
    avatar_url  varchar(500),
    github_url  varchar(255),
    linkedin_url varchar(255),
    timezone    varchar(50) DEFAULT 'UTC',
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Certificates issued
CREATE TABLE certificates (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    path_id     uuid NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    title       varchar(255) NOT NULL,
    issued_at   timestamptz NOT NULL DEFAULT now(),
    pdf_url     varchar(500),
    UNIQUE (user_id, path_id)
);
CREATE INDEX idx_certificates_user ON certificates (user_id);

-- External runner link templates (per language — admin configurable)
CREATE TABLE runner_templates (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    language    varchar(50) NOT NULL UNIQUE,
    name        varchar(100) NOT NULL,
    url_template varchar(500) NOT NULL,
    active      boolean NOT NULL DEFAULT true
);

-- Seed default runner templates
INSERT INTO runner_templates (language, name, url_template) VALUES
    ('java', 'OneCompiler', 'https://onecompiler.com/java'),
    ('javascript', 'JSFiddle', 'https://jsfiddle.net'),
    ('typescript', 'TypeScript Playground', 'https://www.typescriptlang.org/play'),
    ('python', 'Programiz', 'https://www.programiz.com/python-programming/online-compiler/'),
    ('kotlin', 'Kotlin Playground', 'https://play.kotlinlang.org'),
    ('sql', 'SQLite Online', 'https://sqliteonline.com'),
    ('html', 'CodePen', 'https://codepen.io/pen/'),
    ('css', 'CodePen', 'https://codepen.io/pen/');
