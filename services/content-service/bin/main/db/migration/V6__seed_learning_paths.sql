-- =============================================================
-- V6: Seed Data — Learning Paths
-- Seeds the 7 DevMastery learning paths as per the spec.
-- Idempotent: uses INSERT ... ON CONFLICT DO NOTHING
-- =============================================================

INSERT INTO learning_paths (id, slug, title, description, icon, accent_color, level_min, level_max, estimated_hours, order_index, is_active)
VALUES
  (
    gen_random_uuid(),
    'java-mastery',
    'Java Mastery',
    'Core Java → OOP → Collections → Streams/Lambda → Concurrency → JVM Internals. Master Java from syntax to the JVM itself. The foundation for all backend development.',
    'java',
    '#F89820',
    1, 5,
    120,
    1,
    TRUE
  ),
  (
    gen_random_uuid(),
    'dsa-mastery',
    'DSA Mastery',
    'Arrays → Linked Lists → Stacks/Queues → Trees → Graphs → DP → Greedy → Backtracking. Language-agnostic, Java-primary. The path to cracking any coding interview.',
    'graph',
    '#A371F7',
    1, 5,
    100,
    2,
    TRUE
  ),
  (
    gen_random_uuid(),
    'spring-boot-mastery',
    'Spring Boot Mastery',
    'Spring Core → REST → JPA/Hibernate → Security → Microservices → Kafka → Valkey. Build production-grade backend systems with the world''s most popular Java framework.',
    'spring',
    '#6DB33F',
    2, 5,
    90,
    3,
    TRUE
  ),
  (
    gen_random_uuid(),
    'frontend-mastery',
    'Frontend Mastery',
    'HTML/CSS → JavaScript → TypeScript → React → Angular → Next.js → RxJS. From DOM basics to full-stack React applications and beyond.',
    'react',
    '#61DAFB',
    1, 5,
    80,
    4,
    TRUE
  ),
  (
    gen_random_uuid(),
    'system-design-mastery',
    'System Design Mastery',
    'Scalability → CAP Theorem → Caching → DB Sharding → Message Queues → Real Projects. Design systems that handle millions of users. Essential for senior roles.',
    'architecture',
    '#F89820',
    3, 5,
    60,
    5,
    TRUE
  ),
  (
    gen_random_uuid(),
    'design-patterns',
    'Design Patterns',
    'All 23 GoF patterns + Architectural patterns. Creational → Structural → Behavioral → Architectural → Anti-patterns. Write code that senior engineers respect.',
    'patterns',
    '#4285F4',
    2, 5,
    50,
    6,
    TRUE
  ),
  (
    gen_random_uuid(),
    'interview-preparation',
    'Interview Preparation',
    'Coding Rounds → LLD → HLD → Behavioral → Company-specific sets. 450 curated problems, 2000+ MCQs, mock interviews with AI. Crack any tech interview.',
    'interview',
    '#3FB950',
    2, 5,
    40,
    7,
    TRUE
  )
ON CONFLICT (slug) DO NOTHING;

-- Update total_topics counter (will be recalculated by trigger/service, but set initial value)
UPDATE learning_paths SET total_topics = 0 WHERE total_topics IS NULL;
