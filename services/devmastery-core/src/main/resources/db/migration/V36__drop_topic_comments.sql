-- ─────────────────────────────────────────────────────────────
-- V36 — Remove the Community Discussion (topic comments) feature.
--
-- The community discussion feature (topic-scoped comments + upvotes)
-- has been removed from the application. This migration drops the
-- tables introduced in V33__topic_comments.sql.
--
-- V33 is intentionally left in place so Flyway history stays valid on
-- databases that already applied it; this migration reverses its effect.
-- Order matters: comment_upvotes references topic_comments.
-- ─────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS comment_upvotes;
DROP TABLE IF EXISTS topic_comments;

