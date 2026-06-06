-- =========================================================
-- V2 — PostgreSQL full-text search
-- Replaces OpenSearch. Adds tsvector columns + GIN indexes
-- and triggers that keep them in sync on INSERT/UPDATE.
-- =========================================================

-- ─── topics.search_vector ────────────────────────────────
ALTER TABLE topics ADD COLUMN search_vector tsvector;

UPDATE topics SET search_vector =
    setweight(to_tsvector('english', coalesce(title,'')),  'A') ||
    setweight(to_tsvector('english', coalesce(why,'')),    'B') ||
    setweight(to_tsvector('english', coalesce(theory,'')), 'C') ||
    setweight(to_tsvector('english', coalesce(interview,'')), 'D');

CREATE INDEX idx_topics_fts ON topics USING gin (search_vector);

CREATE OR REPLACE FUNCTION topics_tsv_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
      setweight(to_tsvector('english', coalesce(NEW.title,'')),  'A') ||
      setweight(to_tsvector('english', coalesce(NEW.why,'')),    'B') ||
      setweight(to_tsvector('english', coalesce(NEW.theory,'')), 'C') ||
      setweight(to_tsvector('english', coalesce(NEW.interview,'')), 'D');
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_topics_tsv
    BEFORE INSERT OR UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION topics_tsv_trigger();

-- ─── lessons.search_vector ───────────────────────────────
ALTER TABLE lessons ADD COLUMN search_vector tsvector;
UPDATE lessons SET search_vector = to_tsvector('english', coalesce(content,''));
CREATE INDEX idx_lessons_fts ON lessons USING gin (search_vector);

CREATE OR REPLACE FUNCTION lessons_tsv_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.content,''));
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_lessons_tsv
    BEFORE INSERT OR UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION lessons_tsv_trigger();

-- ─── code_examples.search_vector ─────────────────────────
ALTER TABLE code_examples ADD COLUMN search_vector tsvector;

UPDATE code_examples SET search_vector =
    setweight(to_tsvector('english', coalesce(explanation,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(language,'')),    'B') ||
    setweight(to_tsvector('english', coalesce(code,'')),        'C');

CREATE INDEX idx_code_examples_fts ON code_examples USING gin (search_vector);

CREATE OR REPLACE FUNCTION code_examples_tsv_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
      setweight(to_tsvector('english', coalesce(NEW.explanation,'')), 'A') ||
      setweight(to_tsvector('english', coalesce(NEW.language,'')),    'B') ||
      setweight(to_tsvector('english', coalesce(NEW.code,'')),        'C');
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_code_examples_tsv
    BEFORE INSERT OR UPDATE ON code_examples
    FOR EACH ROW EXECUTE FUNCTION code_examples_tsv_trigger();
