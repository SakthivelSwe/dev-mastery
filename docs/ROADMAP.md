# DevMastery Roadmap
Single source of truth for what has shipped and what is next. Legacy specs live
in [`docs/archive/`](./archive/) — do not use them as the current plan.
Last updated: **July 6, 2026 — Round 7 (PDF Certificates)**
---
## ✅ Shipped
### Backend (`services/devmastery-core`)
- Modular monolith on Spring Boot 3.3 + Java 21 (Render free tier)
- Modules: `auth`, `content`, `progress`, `quiz`, `search`, `ai`, `profile`, `admin`, `patterns`, `storage`, `security`, `common`
- Cross-module communication via `ApplicationEvent` (Kafka seam preserved)
- Flyway migrations V1–V32 (baseline → streak freezes V29, interview sessions V30, projects path V31, certificates + quiz_difficulty V32)
- Gemini streaming chat via WebClient + SSE
- SM-2 spaced-repetition scheduler in `progress` module
- Streak + XP + badges + **freeze tokens** (auto-consumed after 1 missed day, +1 every 7-day streak, capped at 3)
- **Mock-interview persistence** — `interview_sessions` (JSONB transcript + scorecard) with `InterviewService` API + REST controller
- **AI rate limiter** — per-user daily quota (default 100/day) → HTTP 429 + `Retry-After`
- **Adaptive quiz difficulty** — per-user per-topic accuracy; after 5+ attempts: <60% → level down, >85% → level up
- **Certificates** — `CertificateService` + REST (`POST /v1/certificates/{pathSlug}`, `GET /v1/certificates`, `GET /v1/certificates/verify/{credentialId}`)
- **PDF certificates** — iText7 Community A4-landscape PDF (learner name, path, stats strip, QR code via ZXing); async upload to Supabase Storage via `CertificatePdfListener`
- **22 unit tests passing** (3 rate-limit + 5 interview parser + 10 streak-rules + 4 PDF generator)
### Frontend (`apps/web`)
- Next.js 15 App Router on Cloudflare Pages
- **PWA with offline reading** — `StaleWhileRevalidate` for topics (30-day cache, 500 entries), `NetworkFirst` for user endpoints, `/offline` fallback
- Learning-path browser + roadmap view + topic reader with the 9-section layout
- DSA visualizer library (30+ components)
- LeetCode-pattern browser at `/patterns`
- Live AI chat drawer on every topic (streams from `/v1/ai/chat`)
- **`/review`** — SM-2 recall queue with 1–5 rating buttons
- **`/interview`** — Mock interviewer + inline scorecard panel
- **`/interview/history`** and **`/interview/history/[id]`** — past sessions with transcript + scorecard
- **`/system-design/studio`** — Capacity Estimator + Requirements Workshop (4 case studies)
- **`/profile/certificates`** — Claim + list earned certificates; polls for PDF URL; public verification at `/certificates/verify/[credentialId]`
- **`/admin/content-health`** — audit report dashboard
- Dashboard: streak (current + longest + freeze count), XP + rank + daily-goal ring, reviews-due tile
- Sidebar footer: Dashboard · Spaced Review · Mock Interview · Design Studio · My Certificates
### Content (`apps/web/content/`)
- 788 topics across 25 paths, all following the 9-section schema
- **`projects/` capstone path** — 10 guided end-to-end builds, all 100/100 health:
  LRU Cache, JWT Auth, URL Shortener, Rate Limiter, Chat, Task Manager,
  Thread Pool, Mini IoC Container, Search Engine, Message Broker
- Automated audit tool: `npm run content:audit` → `apps/web/content/_audit/health.json`
- Baseline health: **74/100 average** (projects path 100/100), floor enforced in CI at 70
### CI / DevOps
- `.github/workflows/content-health.yml` — audits every PR, fails below floor, surfaces auto-fix candidates
- `.github/workflows/backend-tests.yml` — `./gradlew test` on every backend PR
### Android (`apps/android`)
- Kotlin + Compose shell against the same REST API
- Feature parity trailing web by 1–2 iterations
---
## 🚧 In-flight / next-up
### Immediate (this sprint)
1. **Community discussion threads** — V33 migration: `topic_comments` table + RLS; `CommentService` + `CommentController`; discussion panel on lesson pages (threaded, upvote, flagging).
### Mid-term (1–2 months)
2. **Android parity** — mirror `/review` and `/interview` screens in Compose.
3. **i18n scaffold** — `next-intl`, English first, then Hindi/Tamil.
4. **Content auto-fix bot round 2** — run `auto-fix-content.js` on the 708 red topics (target avg 80/100).
### Long-term (3+ months)
5. **Mentorship marketplace** — senior engineers can mark topics and answer "ask senior" flags.
6. **Employer dashboard** — verify certificate + see learner skills breakdown.
---
## 🎯 Product principles (immutable)
1. **Depth over breadth.** Every topic follows the 9-section schema; nothing ships shallow.
2. **Free-tier only.** Zero-cost monthly bill (Render + Supabase + Cloudflare + Gemini free).
3. **Modular seam preserved.** Every module has `api/` + `internal/` + `web/`.
4. **Learner engagement first.** Streaks, spaced review, mock interviews, XP — every feature closes a consumption → recall → application loop.
5. **AI is a mentor, not a crutch.** All AI features cite topic context and rate-limit per user.
---
## 📚 Related docs
- [README](../README.md) — architecture, deployment, cost
- [SKILL.md](../SKILL.md) — content-authoring rules (9-section schema)
- [Legacy specs](./archive/README.md) — historical reference only
