-- V39 — Drop event type check constraint on user_xp_events
--
-- The legacy database (or previous Supabase setup) had a check constraint
-- restricting event_type to a specific set (like 'topic_completed', 'quiz_completed').
-- We introduced 'lesson_completed' recently which causes a constraint violation.
-- Dropping this constraint to allow the new event type.
-- =========================================================

ALTER TABLE user_xp_events 
    DROP CONSTRAINT IF EXISTS user_xp_events_event_type_check;
