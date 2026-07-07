-- V34: Many-to-many topic ↔ path so a single topic can appear in multiple learning paths
-- (e.g. `bfs` owned by dsa also appears on the full-stack roadmap).
--
-- Backwards compatible:
--   • `topics.path_id` is preserved as the topic's "primary" owner (used for pathTitle breadcrumb).
--   • Every row in `topics` gets a mirror row in `topic_paths` pointing at the same path,
--     so existing single-owner queries can be rewritten to join through the junction.

CREATE TABLE IF NOT EXISTS topic_paths (
    topic_id        uuid NOT NULL REFERENCES topics(id)          ON DELETE CASCADE,
    path_id         uuid NOT NULL REFERENCES learning_paths(id)  ON DELETE CASCADE,
    display_order   int,                        -- NULL → fall back to topics.display_order
    level_override  int,                        -- NULL → fall back to topics.level
    created_at      timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (topic_id, path_id)
);

CREATE INDEX IF NOT EXISTS idx_topic_paths_path  ON topic_paths (path_id);
CREATE INDEX IF NOT EXISTS idx_topic_paths_topic ON topic_paths (topic_id);

-- Backfill: every existing topic → mirror row for its current owner.
INSERT INTO topic_paths (topic_id, path_id, display_order, level_override)
SELECT t.id, t.path_id, t.order_index, t.level
FROM topics t
WHERE t.path_id IS NOT NULL
ON CONFLICT (topic_id, path_id) DO NOTHING;


