-- V23__add_language_constraints_to_code_examples.sql
-- Enforces valid languages for the Code Lab feature.

ALTER TABLE code_examples
    ADD CONSTRAINT chk_code_examples_language
    CHECK (language IN ('java', 'python', 'javascript', 'cpp'));
