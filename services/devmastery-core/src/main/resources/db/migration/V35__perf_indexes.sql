-- ─────────────────────────────────────────────────────────────
-- V35 — Performance indexes on hot query columns.
--
-- Backend audit (Phase 18) flagged three tables where Spring Data
-- query methods scan by an un-indexed FK column. On Supabase free tier
-- these turn into seq-scans as row counts grow, which is exactly what
-- we want to avoid on Render free-tier CPU.
--
-- All statements are IF NOT EXISTS so re-running is safe. CONCURRENTLY
-- deliberately NOT used because Flyway wraps migrations in a single
-- transaction; a one-time seq-scan during initial deploy is acceptable.
-- ─────────────────────────────────────────────────────────────

-- TopicEntity.findByPathIdAndPublishedTrueOrderByDisplayOrder
-- Columns: path_id, is_published, order_index (verified via @Column annotations)
CREATE INDEX IF NOT EXISTS idx_topics_path_published_order
    ON topics (path_id, is_published, order_index);

-- LessonEntity.findByTopicIdOrderBySection (section column is section_type)
CREATE INDEX IF NOT EXISTS idx_lessons_topic_section
    ON lessons (topic_id, section_type);

-- SpacedReviewEntity.findByUserIdAndNextReviewDateLessThanEqual (spaced-review queue)
-- Table is "spaced_review_schedules" (see V1__baseline_schema.sql + SpacedReviewEntity @Table)
CREATE INDEX IF NOT EXISTS idx_spaced_reviews_user_due
    ON spaced_review_schedules (user_id, next_review_date);

-- Interview history: GET /v1/interviews orders by started_at DESC for user.
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_started
    ON interview_sessions (user_id, started_at DESC);

-- Certificates: GET /v1/certificates for the signed-in user.
CREATE INDEX IF NOT EXISTS idx_certificates_user_issued
    ON certificates (user_id, issued_at DESC);

-- Comments on a topic (public view) — sorted newest first.
-- NOTE: topic_comments uses topic_slug (not topic_id); the covering index
-- idx_tc_topic_slug ON topic_comments (topic_slug, created_at DESC) was already
-- created in V33__topic_comments.sql, so no duplicate index is needed here.
