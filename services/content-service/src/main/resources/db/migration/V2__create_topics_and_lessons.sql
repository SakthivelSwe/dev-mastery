-- =============================================================
-- V2: Topics, Lessons, and Code Examples
-- The core content structure. Every topic has 6 lesson sections
-- following the 6-Layer Teaching Model.
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- TOPICS
-- A topic is a single concept (e.g., "HashMap Internal Working").
-- Belongs to a learning path, has a difficulty level 1–5.
-- section_types: why, theory, visual, code, realworld, interview
-- ─────────────────────────────────────────────────────────────
CREATE TABLE topics (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    path_id         UUID         NOT NULL REFERENCES learning_paths(id) ON DELETE RESTRICT,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    level           INT          NOT NULL CHECK (level BETWEEN 1 AND 5),
    estimated_mins  INT          NOT NULL CHECK (estimated_mins > 0),
    order_index     INT          NOT NULL,
    has_visualizer  BOOLEAN      NOT NULL DEFAULT FALSE,
    has_code_lab    BOOLEAN      NOT NULL DEFAULT FALSE,
    is_published    BOOLEAN      NOT NULL DEFAULT FALSE,
    tags            TEXT[]       DEFAULT '{}',
    prerequisite_ids UUID[]      DEFAULT '{}',   -- topic IDs that should be completed first
    thumbnail_url   TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE topics IS 'Individual learning topics within a path. Each topic contains 6 lesson sections following the 6-Layer Teaching Model.';
COMMENT ON COLUMN topics.level IS '1=Foundation, 2=Building Blocks, 3=Intermediate, 4=Advanced, 5=Expert';
COMMENT ON COLUMN topics.has_visualizer IS 'Whether this topic has an interactive DSA/algorithm visualizer component.';
COMMENT ON COLUMN topics.prerequisite_ids IS 'Array of topic UUIDs the user should complete before this topic.';

-- ─────────────────────────────────────────────────────────────
-- LESSONS
-- Each topic has up to 6 lessons, one per section type.
-- content_mdx stores the full MDX content for that section.
-- section_type: 'why' | 'theory' | 'visual' | 'code' | 'realworld' | 'interview'
-- ─────────────────────────────────────────────────────────────
CREATE TABLE lessons (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id        UUID         NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    section_type    VARCHAR(50)  NOT NULL CHECK (section_type IN ('why', 'theory', 'visual', 'code', 'realworld', 'interview')),
    title           VARCHAR(255) NOT NULL,
    content_mdx     TEXT         NOT NULL DEFAULT '',
    order_index     INT          NOT NULL,
    estimated_mins  INT          NOT NULL DEFAULT 5,
    is_published    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    UNIQUE (topic_id, section_type)    -- one lesson per section type per topic
);

COMMENT ON TABLE lessons IS 'Individual lesson sections within a topic. Each topic has exactly 6 sections: why, theory, visual, code, realworld, interview.';
COMMENT ON COLUMN lessons.content_mdx IS 'Full MDX content for this lesson section. Supports React components for visualizers.';
COMMENT ON COLUMN lessons.section_type IS 'One of: why, theory, visual, code, realworld, interview — the 6-Layer Teaching Model.';

-- ─────────────────────────────────────────────────────────────
-- CODE EXAMPLES
-- Runnable code snippets associated with a lesson.
-- Multiple examples per lesson, one per difficulty level.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE code_examples (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id         UUID         NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    lesson_id        UUID         REFERENCES lessons(id) ON DELETE SET NULL,
    language         VARCHAR(50)  NOT NULL CHECK (language IN ('java', 'javascript', 'typescript', 'python', 'kotlin', 'sql')),
    level            INT          NOT NULL CHECK (level BETWEEN 1 AND 5),
    title            VARCHAR(255) NOT NULL,
    code             TEXT         NOT NULL,
    explanation      TEXT,
    time_complexity  VARCHAR(50),
    space_complexity VARCHAR(50),
    is_runnable      BOOLEAN      NOT NULL DEFAULT TRUE,
    order_index      INT          NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE code_examples IS 'Runnable code snippets for topics. Multiple examples per topic at different difficulty levels.';
COMMENT ON COLUMN code_examples.level IS 'Code difficulty: 1=Beginner usage, 3=Intermediate override, 5=Expert internals';
COMMENT ON COLUMN code_examples.is_runnable IS 'Whether this snippet can be executed via Judge0 CE code execution service.';

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_topics_path_id    ON topics(path_id);
CREATE INDEX idx_topics_slug       ON topics(slug);
CREATE INDEX idx_topics_level      ON topics(level);
CREATE INDEX idx_topics_published  ON topics(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_topics_order      ON topics(path_id, order_index);
CREATE INDEX idx_topics_tags       ON topics USING GIN(tags);

CREATE INDEX idx_lessons_topic_id  ON lessons(topic_id);
CREATE INDEX idx_lessons_order     ON lessons(topic_id, order_index);

CREATE INDEX idx_code_topic        ON code_examples(topic_id);
CREATE INDEX idx_code_lesson       ON code_examples(lesson_id);
CREATE INDEX idx_code_language     ON code_examples(language);
