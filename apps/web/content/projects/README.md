# Real-World Projects Path

This is the "capstone" learning path — 10 guided end-to-end builds where
learners apply everything from DSA, system design, and backend into a
working, deployable service. Every project follows the **9-section
schema** (see [SKILL.md](../../../../SKILL.md)) and must score ≥ 90/100
in `npm run content:audit` before shipping.

## Ship list

| # | Slug | Level | Status | Teaches |
| - | ---- | ----- | ------ | ------- |
| 1 | [`project-url-shortener`](./project-url-shortener.mdx) | 3 | ✅ Shipped 100/100 | Hashing, base encoding, cache-aside, collision retry, circuit breaker |
| 2 | `project-lru-cache` | 2 |  Planned | Doubly-linked list + hash map, thread safety, eviction policies |
| 3 | `project-rate-limiter` | 3 |  Planned | Token bucket, leaky bucket, distributed rate limit via Redis Lua |
| 4 | `project-mini-ioc` | 4 |  Planned | Reflection, annotation scanning, dependency graph, circular refs |
| 5 | `project-chat` | 3 |  Planned | WebSockets, presence, message ordering, delivery guarantees |
| 6 | `project-search-engine` | 4 |  Planned | Inverted index, TF-IDF, BM25, tokenization, ranked retrieval |
| 7 | `project-jwt-auth` | 2 |  Planned | JWT internals, refresh tokens, revocation lists, key rotation |
| 8 | `project-task-scheduler` | 3 |  Planned | Priority queue, cron parsing, at-least-once vs exactly-once |
| 9 | `project-lsm-kv` | 5 |  Planned | Memtable, SSTables, compaction, bloom filters, WAL |
| 10 | `project-message-broker` | 5 |  Planned | Log-structured queues, consumer groups, offset commits |

## Design principles for every project topic

1. **End-to-end, not toy.** Each build is a real deployable service on
   Render + Supabase free tier. Nothing runs "only in memory".
2. **Four code levels** — from a 25-line single-file demo to a
   production-shape module with rate limits, circuit breakers, metrics,
   and structured logs. Level 4 must be copy-paste runnable.
3. **Named companies in REAL_WORLD.** Every project cites at least one
   real company that ships this pattern (Bitly, Discord, Cloudflare,
   Kafka, RocksDB, etc.) and one publicised failure they had with it.
4. **Interview loop coverage.** 5–7 Q&A pairs progressing Junior →
   Senior, ending with an SLA/scaling question the learner would face
   at staff level.
5. **BUILD is a real weekend.** Setup commands, checklist, `curl`
   verification snippets, expected output, three stretch goals.

## How to add a new project

1. Create `apps/web/content/projects/<slug>.mdx` following the schema
   in [`project-url-shortener.mdx`](./project-url-shortener.mdx).
2. Run `npm run content:audit` and confirm the score is ≥ 90.
3. Register the topic in the next Flyway migration
   (`V32__projects_topics.sql`) so it appears in the DB-driven roadmap.
4. Open a PR — CI will re-audit and fail if the score drops below the
   floor.

## Automated help

If a topic scores below 80, run:

```bash
GEMINI_API_KEY=... npm run content:autofix -- projects <slug>
npm run content:autofix:apply -- projects <slug> --dry-run
```

Review the diff and apply when happy.
