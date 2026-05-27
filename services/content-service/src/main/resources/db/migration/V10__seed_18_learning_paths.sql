-- =============================================================
-- V10: Seed Data — 18 Learning Paths
-- =============================================================

-- First, clear out old paths to avoid conflicts if they had different structure
DELETE FROM learning_paths;

INSERT INTO learning_paths (id, slug, title, description, level_min, level_max, icon, order_index, is_active)
VALUES
  (gen_random_uuid(), 'full-stack',          'Full Stack Developer',           'Complete path from beginner to full stack',      1, 5, 'layers',       1,  true),
  (gen_random_uuid(), 'java-mastery',         'Java Mastery',                   'Core Java to JVM internals and concurrency',     1, 5, 'coffee',       2,  true),
  (gen_random_uuid(), 'dsa',                  'Data Structures & Algorithms',   'Every DSA concept for interviews and beyond',    1, 5, 'git-branch',   3,  true),
  (gen_random_uuid(), 'leetcode-patterns',    'LeetCode Patterns',              'Solve any problem with 20 core patterns',        2, 5, 'code',         4,  true),
  (gen_random_uuid(), 'javascript',           'JavaScript',                     'From basics to engine internals',                1, 5, 'js',           5,  true),
  (gen_random_uuid(), 'typescript',           'TypeScript',                     'Type-safe JavaScript at any scale',              2, 4, 'type',         6,  true),
  (gen_random_uuid(), 'react',                'React',                          'Modern React: Hooks, patterns, performance',     2, 5, 'atom',         7,  true),
  (gen_random_uuid(), 'angular',              'Angular',                        'Enterprise Angular with RxJS & NgRx',            2, 5, 'angular',      8,  true),
  (gen_random_uuid(), 'spring-boot',          'Spring Boot',                    'REST to microservices with Spring ecosystem',    2, 5, 'leaf',         9,  true),
  (gen_random_uuid(), 'system-design',        'System Design',                  'Scale to millions: HLD for senior engineers',   3, 5, 'server',       10, true),
  (gen_random_uuid(), 'api-design',           'API Design',                     'REST, GraphQL, gRPC, versioning and security',  2, 4, 'zap',          11, true),
  (gen_random_uuid(), 'software-architecture','Software Architecture',          'SOLID, DDD, CQRS, microservices patterns',      3, 5, 'blueprint',    12, true),
  (gen_random_uuid(), 'html',                 'HTML',                           'Semantic HTML, accessibility, web standards',   1, 3, 'file-code',    13, true),
  (gen_random_uuid(), 'css',                  'CSS',                            'Flexbox, Grid, animations, responsive design',  1, 4, 'palette',      14, true),
  (gen_random_uuid(), 'sql',                  'SQL',                            'Queries to query optimization and indexing',    1, 4, 'database',     15, true),
  (gen_random_uuid(), 'postgresql-dba',       'PostgreSQL DBA',                 'Database administration, tuning, replication',  3, 5, 'hard-drive',   16, true),
  (gen_random_uuid(), 'mongodb',              'MongoDB',                        'NoSQL design, aggregation, and production ops', 2, 4, 'circle',       17, true),
  (gen_random_uuid(), 'design-system',        'Design System',                  'Tokens, components, accessibility, Storybook',  2, 4, 'layout',       18, true);