-- ================================================================
-- V38 — LeetCode auto-sync support tables
--       • Add leetcode_username to users table
--       • Create leetcode_solved_problems table to track synced solves
-- ================================================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS leetcode_username VARCHAR(100);

CREATE TABLE IF NOT EXISTS leetcode_solved_problems (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_title   VARCHAR(500) NOT NULL,
    difficulty      VARCHAR(10),
    synced_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
    xp_awarded      INTEGER DEFAULT 0,
    pattern_problem_id UUID REFERENCES pattern_problems(id) ON DELETE SET NULL,
    UNIQUE (user_id, problem_title)
);

CREATE INDEX IF NOT EXISTS idx_leetcode_solved_user ON leetcode_solved_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_leetcode_solved_problem ON leetcode_solved_problems(problem_title);

-- Track user's XP specifically from LeetCode syncs
ALTER TABLE pattern_problems
  ADD COLUMN IF NOT EXISTS xp_value INTEGER DEFAULT 10;

-- Set XP per difficulty
UPDATE pattern_problems SET xp_value = 10  WHERE difficulty = 'Easy';
UPDATE pattern_problems SET xp_value = 20  WHERE difficulty = 'Medium';
UPDATE pattern_problems SET xp_value = 40  WHERE difficulty = 'Hard';
