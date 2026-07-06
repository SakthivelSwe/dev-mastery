-- V31__projects_path.sql
-- Adds the "Real-World Projects" learning path — 10 guided end-to-end builds
-- where learners apply everything from DSA + system design + backend into a
-- working, deployable service. Only the first project is fully authored;
-- the rest are registered as skeletons so they appear in the roadmap with
-- an "in progress" status while content is being written.

-- ──────────────────────────────────────────────────────────────
-- 1. Learning path row
-- ──────────────────────────────────────────────────────────────

INSERT INTO learning_paths
  (id, slug, title, description, icon, accent_color, level_min, level_max,
   total_topics, estimated_hours, order_index, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000031'::uuid,
  'projects',
  'Real-World Projects',
  'Ten guided end-to-end builds that apply everything you learned. Each project ships with a 4-level code progression, an interview loop, and a weekend build checklist — deploy every one to Render + Supabase free tier.',
  'hammer',
  '#F97316',
  2, 5,
  10, 80, 25,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title           = EXCLUDED.title,
  description     = EXCLUDED.description,
  icon            = EXCLUDED.icon,
  accent_color    = EXCLUDED.accent_color,
  level_min       = EXCLUDED.level_min,
  level_max       = EXCLUDED.level_max,
  total_topics    = EXCLUDED.total_topics,
  estimated_hours = EXCLUDED.estimated_hours,
  order_index     = EXCLUDED.order_index,
  is_active       = true,
  updated_at      = now();

-- ──────────────────────────────────────────────────────────────
-- 2. The 10 projects — only the first is authored today
-- ──────────────────────────────────────────────────────────────

INSERT INTO topics
  (id, path_id, slug, title, description, level, estimated_mins, order_index,
   has_visualizer, has_code_lab, is_published)
SELECT
  gen_random_uuid(),
  (SELECT id FROM learning_paths WHERE slug = 'projects'),
  v.slug, v.title, v.description, v.level, v.mins, v.ord,
  v.viz, v.lab, v.published
FROM (VALUES
  -- ── Level 2 — Working Knowledge
  ('project-lru-cache',        'Build an LRU Cache from scratch',
   'Combine a hash map and a doubly-linked list to hit O(1) get/put. Add TTL, thread safety, and eviction hooks.',
   2, 90, 1,  false, true,  true),
  ('project-jwt-auth',         'Build a JWT Auth Service',
   'Access + refresh tokens, revocation lists, key rotation, and how to survive a leaked private key.',
   2, 120, 2, false, true,  true),

  -- ── Level 3 — Practitioner
  ('project-url-shortener',    'Build a URL Shortener (bit.ly clone)',
   'Hashing, base62, cache-aside, collision retry, circuit breaker. Ship the redirect path with a p99 under 100ms.',
   3, 240, 3, true,  true,  true),
  ('project-rate-limiter',     'Build a Distributed Rate Limiter',
   'Token bucket vs leaky bucket, Redis Lua for atomic decrement, per-user vs per-endpoint budgets.',
   3, 180, 4, true,  true,  true),
  ('project-chat',             'Build a Realtime Chat Backend',
   'WebSockets, presence, message ordering guarantees, at-least-once delivery, offline queue.',
   3, 240, 5, false, true,  true),
  ('project-task-manager',     'Build a Task Manager API (Todoist clone)',
   'CRUD with state machines, keyset pagination, optimistic locking, soft deletes, audit trails.',
   2, 180, 6, false, true,  true),

  -- ── Level 4 — Advanced
  ('project-thread-pool',      'Build a Thread Pool Executor',
   'BlockingQueue, worker lifecycle, rejection policies, graceful shutdown, virtual threads.',
   4, 240, 7, true,  true,  true),
  ('project-mini-ioc-container','Build a Mini Spring IoC Container',
   'Reflection, annotation scanning, dependency graph, circular reference detection, lifecycle callbacks.',
   4, 240, 8, true,  true,  true),
  ('project-search-engine',    'Build a Search Engine',
   'Tokenization, inverted index, TF-IDF + BM25 scoring, ranked retrieval, incremental indexing.',
   4, 300, 9, true,  true,  true),

  -- ── Level 5 — Expert
  ('project-message-broker',   'Build a Message Broker',
   'Log-structured queues, consumer groups, offset commits, back-pressure, exactly-once semantics.',
   5, 480, 10, true, true,  true)
) AS v(slug, title, description, level, mins, ord, viz, lab, published)
ON CONFLICT (slug) DO UPDATE SET
  path_id        = EXCLUDED.path_id,
  title          = EXCLUDED.title,
  description    = EXCLUDED.description,
  level          = EXCLUDED.level,
  estimated_mins = EXCLUDED.estimated_mins,
  order_index    = EXCLUDED.order_index,
  has_visualizer = EXCLUDED.has_visualizer,
  has_code_lab   = EXCLUDED.has_code_lab,
  is_published   = EXCLUDED.is_published,
  updated_at     = now();
