-- =============================================================
-- V17: Expand 6-Layer model to 9-Layer model
-- Add feynman, build, and spacedreview section types
-- =============================================================

-- Drop the old constraint
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_section_type_check;

-- Add the new constraint with 9 layers
ALTER TABLE lessons ADD CONSTRAINT lessons_section_type_check CHECK (
    section_type IN ('why', 'theory', 'visual', 'code', 'realworld', 'interview', 'feynman', 'build', 'spacedreview')
);

COMMENT ON COLUMN lessons.section_type IS 'One of: why, theory, visual, code, realworld, interview, feynman, build, spacedreview — the 9-Layer Teaching Model.';
