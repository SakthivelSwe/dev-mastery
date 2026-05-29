-- =============================================================
-- V4: Quiz Engine and Coding Problems
-- MCQ questions, user attempts, coding problems, code submissions.
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- QUIZ QUESTIONS
-- question_type: 'mcq' | 'coding' | 'truefalse' | 'fill'
-- options: JSONB array for MCQ: [{"key":"A","text":"..."},...]
-- difficulty: 1 (easy) → 5 (expert)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE quiz_questions (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id        UUID         NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    question_type   VARCHAR(50)  NOT NULL CHECK (question_type IN ('mcq', 'coding', 'truefalse', 'fill')),
    question_text   TEXT         NOT NULL,
    options         JSONB,                    -- [{"key":"A","text":"HashMap is thread-safe"},...]
    correct_answer  TEXT         NOT NULL,    -- For MCQ: 'A', 'B', etc. For others: full answer
    explanation     TEXT         NOT NULL,    -- Why this answer is correct (required)
    difficulty      INT          NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    company_tags    TEXT[]       DEFAULT '{}',-- e.g. ['amazon','google','flipkart']
    topic_tags      TEXT[]       DEFAULT '{}',-- e.g. ['hashing','collections']
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE quiz_questions IS 'Quiz questions for each topic. Includes MCQ, coding, true/false, and fill-in types.';
COMMENT ON COLUMN quiz_questions.explanation IS 'Mandatory: explains WHY the correct answer is right. Shown after user submits.';
COMMENT ON COLUMN quiz_questions.company_tags IS 'Companies that frequently ask this question: amazon, google, flipkart, etc.';

-- ─────────────────────────────────────────────────────────────
-- QUIZ ATTEMPTS
-- Records each time a user answers a question.
-- is_correct is computed at submission time.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE quiz_attempts (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id     UUID         NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    session_id      UUID,                    -- groups attempts in one quiz session
    user_answer     TEXT         NOT NULL,
    is_correct      BOOLEAN      NOT NULL,
    time_taken_secs INT          NOT NULL DEFAULT 0 CHECK (time_taken_secs >= 0),
    attempted_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE quiz_attempts IS 'Every quiz answer submitted by users. Used for adaptive difficulty calculation.';

-- ─────────────────────────────────────────────────────────────
-- CODING PROBLEMS
-- LeetCode-style problems with multiple test cases.
-- starter_code / solution_code: JSONB { "java": "...", "python": "..." }
-- test_cases: JSONB [{"input":"...", "expectedOutput":"...", "isHidden": false}]
-- ─────────────────────────────────────────────────────────────
CREATE TABLE coding_problems (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id         UUID         REFERENCES topics(id) ON DELETE SET NULL,
    title            VARCHAR(255) NOT NULL,
    slug             VARCHAR(255) UNIQUE NOT NULL,
    description      TEXT         NOT NULL,    -- Markdown problem statement
    difficulty       VARCHAR(20)  NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    starter_code     JSONB        NOT NULL DEFAULT '{}',  -- {"java":"class Solution {...}", "python":"def solution():"}
    solution_code    JSONB        NOT NULL DEFAULT '{}',  -- optimal solution per language
    test_cases       JSONB        NOT NULL DEFAULT '[]',  -- [{input, expectedOutput, isHidden}]
    constraints      TEXT,                     -- "1 ≤ n ≤ 10^5, 1 ≤ arr[i] ≤ 10^9"
    hints            TEXT[]       DEFAULT '{}',
    company_tags     TEXT[]       DEFAULT '{}',
    topic_tags       TEXT[]       DEFAULT '{}',
    time_complexity  VARCHAR(100),
    space_complexity VARCHAR(100),
    acceptance_rate  FLOAT        DEFAULT 0.0,
    is_published     BOOLEAN      NOT NULL DEFAULT FALSE,
    order_index      INT          NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE coding_problems IS 'Coding challenges with test cases. Executed via Judge0 CE self-hosted (free, unlimited).';
COMMENT ON COLUMN coding_problems.test_cases IS 'Array: [{input:"5\n[1,2,3]", expectedOutput:"6", isHidden:false}]. Hidden cases not shown to user.';

-- ─────────────────────────────────────────────────────────────
-- CODE SUBMISSIONS
-- Every code run + problem submission by a user.
-- status: 'accepted' | 'wrong_answer' | 'tle' | 'mle' | 'error' | 'compile_error'
-- ─────────────────────────────────────────────────────────────
CREATE TABLE code_submissions (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id      UUID         REFERENCES coding_problems(id) ON DELETE SET NULL,
    language        VARCHAR(50)  NOT NULL CHECK (language IN ('java', 'javascript', 'typescript', 'python', 'kotlin', 'sql')),
    code            TEXT         NOT NULL,
    status          VARCHAR(50)  NOT NULL CHECK (status IN ('accepted', 'wrong_answer', 'tle', 'mle', 'error', 'compile_error', 'pending')),
    runtime_ms      INT,
    memory_kb       INT,
    passed_cases    INT          NOT NULL DEFAULT 0,
    total_cases     INT          NOT NULL DEFAULT 0,
    error_message   TEXT,                    -- stderr or compile error output
    submitted_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE code_submissions IS 'All code submissions against problems. Executed via Judge0 CE. Code content is never logged.';
COMMENT ON COLUMN code_submissions.status IS 'Judge0 verdict: accepted, wrong_answer, tle, mle, error, compile_error';

-- ─────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────
CREATE INDEX idx_questions_topic      ON quiz_questions(topic_id);
CREATE INDEX idx_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX idx_questions_company    ON quiz_questions USING GIN(company_tags);
CREATE INDEX idx_questions_active     ON quiz_questions(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_attempts_user        ON quiz_attempts(user_id);
CREATE INDEX idx_attempts_question    ON quiz_attempts(question_id);
CREATE INDEX idx_attempts_session     ON quiz_attempts(session_id) WHERE session_id IS NOT NULL;

CREATE INDEX idx_problems_slug        ON coding_problems(slug);
CREATE INDEX idx_problems_difficulty  ON coding_problems(difficulty);
CREATE INDEX idx_problems_topic       ON coding_problems(topic_id);
CREATE INDEX idx_problems_company     ON coding_problems USING GIN(company_tags);
CREATE INDEX idx_problems_published   ON coding_problems(is_published) WHERE is_published = TRUE;

CREATE INDEX idx_submissions_user     ON code_submissions(user_id);
CREATE INDEX idx_submissions_problem  ON code_submissions(problem_id);
CREATE INDEX idx_submissions_status   ON code_submissions(user_id, status);
CREATE INDEX idx_submissions_date     ON code_submissions(submitted_at DESC);
