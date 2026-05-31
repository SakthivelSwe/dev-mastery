-- =========================================================================
-- V26: Publish Java Mastery Code Examples
-- =========================================================================

UPDATE code_examples
SET is_published = true
WHERE topic_slug IN (
  'java-intro',
  'data-types-and-variables',
  'operators-and-expressions',
  'control-flow'
);
