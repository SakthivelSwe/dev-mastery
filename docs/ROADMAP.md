# DevMastery Roadmap

Single source of truth for what has shipped and what is next. Legacy specs live
in [`docs/archive/`](./archive/) — do not use them as the current plan.

Last updated: **July 6, 2026**

---

## ✅ Shipped

### Backend (`services/devmastery-core`)
- Modular monolith on Spring Boot 3.3 + Java 21 (Render free tier)
- Modules: `auth`, `content`, `progress`, `quiz`, `search`, `ai`, `profile`, `admin`, `patterns`, `storage`, `security`, `common`
- Cross-module communication via `ApplicationEvent` (Kafka seam preserved)
- Flyway migrations V1–V30 (baseline, full-text search, AI/profiles, reconciliation, patterns, microservices path, **streak freezes V29**, **interview sessions V30**)
- Gemini streaming chat via WebClient + SSE
- SM-2 spaced-repetition scheduler in `progress` module
- Streak + XP + badges + **freeze tokens** (auto-consumed after 1 missed day, +1 every 7-day streak, capped at 3)
- **Mock-interview persistence** — `interview_sessions` (JSONB transcript + scorecard) with `InterviewService` API + REST controller
- **AI rate limiter** — per-user daily quota (default 100/day) → HTTP 429

### Frontend (`apps/web`)
- Next.js 15 App Router on Cloudflare Pages
- **PWA with offline reading** — `@ducanh2912/next-pwa`; `StaleWhileRevalidate` for `/v1/topics/*` (30-day cache, 500 entries), `NetworkFirst` for user-specific endpoints, dedicated `/offline` fallback page, global offline banner.
- Learning-path browser + roadmap view + topic reader with the 9-section layout
- DSA visualizer library (30+ components in `components/visualizer`)
- LeetCode-pattern browser at `/patterns`
- Live AI chat drawer on every topic (streams from `/v1/ai/chat`)
- **`/review`** — SM-2 recall queue with 1–5 rating buttons
- **`/interview`** — Mock interviewer + inline scorecard panel
- **`/interview/history`** — Past mock-interview sessions with verdict pills
- **`/interview/history/[id]`** — Full session detail: transcript bubbles + structured scorecard
- **`/admin/content-health`** — visualizes the audit report
- Dashboard shows: streak (current + longest + ❄ freezes), XP + rank + XP-to-next-tier, daily-goal ring, reviews-due tile

### Content (`apps/web/content/`)
- 788 topics across 25 paths, all following the 9-section schema
- **`projects/` capstone path** — **10 guided end-to-end builds, all authored, all 100/100**:
  LRU Cache, JWT Auth, URL Shortener, Rate Limiter, Chat, Task Manager,
  Thread Pool, Mini IoC Container, Search Engine, Message Broker.
  Every project has 4-level code progression, 6 interview Q&As, 5 Feynman checks, 12 spaced-review items.
- Automated audit tool: `npm run content:audit` → `apps/web/content/_audit/health.json`
- Baseline health: **74/100 average** (projects path 100/100), floor enforced in CI at 70

### Frontend (`apps/web`)
- Next.js 15 App Router on Cloudflare Pages
- **PWA with offline reading** — `@ducanh2912/next-pwa`; `StaleWhileRevalidate` for `/v1/topics/*` (30-day cache, 500 entries), `NetworkFirst` for user-specific endpoints, dedicated `/offline` fallback page, global offline banner.
- Learning-path browser + roadmap view + topic reader with the 9-section layout
- DSA visualizer library (30+ components in `components/visualizer`)
- LeetCode-pattern browser at `/patterns`
- Live AI chat drawer on every topic (streams from `/v1/ai/chat`)
- **`/review`** — SM-2 recall queue with 1–5 rating buttons
- **`/interview`** — Mock interviewer + inline scorecard panel
- **`/interview/history`** — Past mock-interview sessions with verdict pills
- **`/interview/history/[id]`** — Full session detail: transcript bubbles + structured scorecard
- **`/system-design/studio`** — Capacity Estimator (back-of-envelope math) + Requirements Workshop (4 case studies: URL Shortener, Chat, News Feed, Ride-Sharing)
- **`/profile/certificates`** — Claim + list earned certificates; public verification at `/certificates/verify/[credentialId]`
- **`/admin/content-health`** — visualizes the audit report
- Dashboard shows: streak (current + longest + ❄ freezes), XP + rank + XP-to-next-tier, daily-goal ring, reviews-due tile
- Sidebar footer: Dashboard · Spaced Review · Mock Interview · Design Studio · My Certificates

### Backend (`services/devmastery-core`)
- Modular monolith on Spring Boot 3.3 + Java 21 (Render free tier)
- Modules: `auth`, `content`, `progress`, `quiz`, `search`, `ai`, `profile`, `admin`, `patterns`, `storage`, `security`, `common`
- Flyway migrations V1–V32 (baseline → **V32: certificates + adaptive quiz difficulty tables**)
- **Certificates module** — `CertificateService` + `CertificateController` with `POST /v1/certificates/{pathSlug}` (issue), `GET /v1/certificates` (list), `GET /v1/certificates/verify/{credentialId}` (public, no auth)
- **Adaptive quiz difficulty** — `QuizDifficultyEntity` tracks per-user per-topic accuracy; after 5+ attempts, difficulty level (1–4) auto-adjusts: < 60% accuracy → level down, > 85% → level up. Exposed via `GET /v1/quizzes/difficulty/{topicSlug}`
- **Mock-interview persistence** — `interview_sessions` (JSONB transcript + scorecard) with full CRUD + `POST /v1/interviews/{id}/grade`
- **AI rate limiter** — per-user daily quota (default 100/day) → HTTP 429 with `Retry-After`
- **Streak freeze tokens** — auto-consumed after 1 missed day, +1 every 7-day streak, capped at 3
- SM-2 spaced-repetition scheduler in `progress` module
- 18 unit tests passing (3 rate-limit + 5 interview parser + 10 streak-rules)

### CI / DevOps
- `.github/workflows/content-health.yml` — audits every PR, fails below floor, **surfaces auto-fix candidates** (top paths where running the fix bot would produce the biggest score lift)
- `.github/workflows/backend-tests.yml` — `./gradlew test` on every backend PR
- `.github/workflows/deploy-frontend.yml`, `keep-alive.yml`, `android-release.yml`

### Android (`apps/android`)
- Kotlin + Compose shell against the same REST API
- Feature parity trailing web by 1–2 iterations

---

## 🚧 In-flight / next-up

### Shipped this iteration (Round 5 — July 6 2026)
- **~~Real-world projects module~~** ✅ 10/10 projects authored, all 100/100 health score.
  LRU Cache, JWT Auth, URL Shortener, Rate Limiter, Chat, Task Manager, Thread Pool, Mini IoC, Search Engine, Message Broker.
- **~~System-Design Studio~~** ✅ `/system-design/studio` — interactive Capacity Estimator + Requirements Workshop (4 case studies).
- **~~Certificates~~** ✅ V32 migration + `CertificateService` + REST controller + profile page + public verification route.
- **~~Adaptive quiz difficulty~~** ✅ `QuizDifficultyEntity` + per-user accuracy tracking → auto-level ±1 after 5 attempts.
- **ProgressSummary freeze-count fix** ✅ constructor arity bug fixed; all 18 tests pass.

### Mid-term (1–2 months)
1. **PDF certificate generation** — iText Community, signed PDF, stored in Supabase Storage, `pdf_url` populated.
2. **Community layer** — Supabase table + RLS for topic-scoped discussion threads, upvote, "ask senior" flag.
3. **Android parity** — mirror `/review` and `/interview` screens in Compose.
4. **i18n scaffold** — `next-intl`, English first, then Hindi/Tamil.
5. **Content auto-fix bot round 2** — run `auto-fix-content.js` on the 708 red topics and measure score lift.

### Long-term (3+ months)
6. **i18n scaffold** — `next-intl`, English first, then Hindi/Tamil.
7. **Community layer** — Supabase table + RLS for topic-scoped discussion threads.
8. **Android parity** — mirror `/review` and `/interview` screens.

---

## 🎯 Product principles (immutable)

1. **Depth over breadth.** Every topic follows the 9-section schema; nothing ships shallow.
2. **Free-tier only.** Zero-cost monthly bill (Render + Supabase + Cloudflare + Gemini free). No credit card ever required to run the platform.
3. **Modular seam preserved.** Every module has `api/` + `internal/` + `web/` — extracting to a service later stays mechanical.
4. **Learner engagement first.** Streaks, spaced review, mock interviews, XP tiers — every feature closes a loop from consumption → recall → application.
5. **AI is a mentor, not a crutch.** All AI features cite topic context and rate-limit per user.

---

## 📚 Related docs

- [README](../README.md) — architecture, deployment, cost
- [SKILL.md](../SKILL.md) — content-authoring rules (9-section schema)
- [Legacy specs](./archive/README.md) — historical reference only

