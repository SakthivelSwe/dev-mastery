# DevMastery 🚀

> **From Zero to Senior Engineer.** A depth-first, AI-assisted learning platform.

**Architecture:** Modular monolith &nbsp;|&nbsp; **Cost:** $0/month &nbsp;|&nbsp; **Credit card:** Not required

---

## Cost Breakdown — $0/month, No Credit Card

| Service | Plan | Cost | Card Required? |
| ------- | ---- | ---- | -------------- |
| **Render** (backend) | Free Web Service | $0 | No |
| **Supabase** (database + storage) | Free | $0 | No |
| **Cloudflare Pages** (frontend) | Free | $0 | No |
| **Google Gemini** (AI) | Free tier | $0 | No |
| **UptimeRobot** (keep-alive) | Free | $0 | No |
| **Total** | | **$0/month** | **No** |

### Free Tier Limits (more than enough for 1–10 users)

| Resource | Limit |
| -------- | ----- |
| Render RAM | 512 MB |
| Supabase DB | 500 MB |
| Supabase Storage | 1 GB |
| Supabase connections | 60 direct / unlimited via pooler |
| Gemini API | 15 RPM, 1M tokens/day |
| Cloudflare Pages | Unlimited requests, 500 builds/month |

---

## Tech Stack

| Layer | Technology | Host |
| ----- | ---------- | ---- |
| Frontend | Next.js 14 (TS, Tailwind, shadcn/ui) | Cloudflare Pages |
| Backend | Spring Boot 3.3 + Java 21 | Render Free |
| Database | PostgreSQL 16 (Flyway) | Supabase |
| Storage | Supabase Storage REST API | Supabase |
| AI | Gemini 1.5 Flash | Google |
| Cache | Caffeine (in-JVM) | Render |
| Search | PostgreSQL tsvector + GIN | Supabase |
| Code runner | External playground links | Client-side |

---

## Repository Layout

```
dev-mastery/
├── apps/
│   ├── web/                       Next.js 14 → Cloudflare Pages
│   └── android/                   Kotlin + Compose (same REST API)
├── services/
│   └── devmastery-core/           ⭐ Modular Monolith (Spring Boot)
│       ├── src/main/java/com/devmastery/
│       │   ├── auth/       ─┐
│       │   ├── content/      │  Each module:
│       │   ├── progress/     │    api/      ← public interface
│       │   ├── quiz/         │    internal/ ← entities, repos, impl (package-private)
│       │   ├── search/       │    web/      ← REST controllers
│       │   ├── ai/           │
│       │   ├── profile/      │
│       │   ├── admin/      ─┘
│       │   ├── storage/           Supabase Storage (REST API)
│       │   ├── common/            Shared DTOs, exceptions, events
│       │   ├── security/          JWT filter, SecurityFilterChain
│       │   └── config/            Cache, CORS, OpenAPI, warmup
│       ├── src/main/resources/
│       │   ├── application.yml
│       │   ├── application-dev.yml
│       │   ├── application-prod.yml
│       │   └── db/migration/
│       │       ├── V1__baseline_schema.sql
│       │       ├── V2__fulltext_search.sql
│       │       └── V3__ai_profiles_certificates.sql
│       ├── Dockerfile             Multi-stage, 512MB optimised
│       ├── render.yaml            Render blueprint
│       └── .env.example
├── docker-compose.dev.yml         Postgres only (local dev)
└── README.md                      (this file)
```

### Module Boundary Rules

1. Each module exposes a **public service interface** in `<module>/api/`.
2. `internal/` classes are **package-private** — no external module may import them.
3. Cross-module calls go through interfaces only.
4. Side effects flow as Spring `ApplicationEvent`s (e.g. `LessonCompletedEvent`),
   handled asynchronously by `@EventListener`s — **same seam for future microservice extraction.**

---

## Local Development

### Prerequisites

| Tool | Version |
| ---- | ------- |
| JDK | 21 |
| Node.js | ≥ 20 |
| Docker | any |

### 1. Start Postgres

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. Run the backend

```bash
cd services/devmastery-core
cp .env.example .env
# Fill in: JWT_SECRET (any 32+ chars), GEMINI_API_KEY
# For local dev, DATABASE_URL defaults to localhost:5433 via application-dev.yml

./gradlew bootRun
# Backend:    http://localhost:8080
# Swagger:    http://localhost:8080/swagger-ui.html
# Health:     http://localhost:8080/actuator/health
# Warmup:     http://localhost:8080/api/warmup
```

### 3. Run the web app

```bash
cd apps/web
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8080
npm install && npm run dev
# Frontend:   http://localhost:3000
```

---

## Production Deployment

### Step A: Supabase (Database + Storage)

1. Go to https://supabase.com → Create account (GitHub sign-in, **no credit card**).
2. Create new project → select region closest to Render (Oregon = US West).
3. Note down the **database password** you set.
4. Go to **Project Settings → Database**:
   - Copy the **Transaction Pooler** connection string (port 6543).
   - Convert to JDBC format: `jdbc:postgresql://aws-0-us-west-1.pooler.supabase.com:6543/postgres?user=postgres.YOURREF&password=YOURPASS`
5. Go to **Project Settings → API** → copy `URL` and `service_role` key.
6. Create storage buckets (Supabase dashboard → Storage):
   - `avatars` (public)
   - `certificates` (public)
   - `attachments` (private)
7. Set bucket policies in Storage → Policies:
   - Avatars: allow public read, authenticated upload
   - Certificates: allow public read, service-role upload only

**Limits:** 500 MB database, 1 GB storage. More than sufficient for 1–10 users.

**Keep-alive:** The `/api/warmup` endpoint runs `SELECT 1` on every ping —
this prevents Supabase from pausing the project (7-day inactivity threshold).

### Step B: Render (Backend)

1. Go to https://render.com → Sign up with GitHub (**no credit card needed**).
2. **New → Blueprint** → connect your GitHub repo.
3. Point at `services/devmastery-core/render.yaml`.
4. Render prompts for env vars. Fill in from your Supabase project:
   - `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `ALLOWED_ORIGINS` = `https://your-app.pages.dev`
5. Deploy. First build takes ~5 min. Health check at `/actuator/health`.

**Cold start:** Free dynos sleep after 15 min. First request after sleep takes 30–60s.
Mitigated by UptimeRobot (Step D below).

**JVM tuning in Dockerfile:**
```
-Xmx350m -Xms128m -XX:+UseSerialGC -XX:TieredStopAtLevel=1
```
This fits comfortably within Render's 512 MB RAM cap.

### Step C: Cloudflare Pages (Frontend)

1. Go to https://dash.cloudflare.com → Sign up (**no credit card for Pages**).
2. **Workers & Pages → Create → Pages → Connect to Git**.
3. Select repo, root directory: `apps/web`.
4. Build settings:
   - Framework: **Next.js**
   - Build command: `npm install && npm run build`
   - Build output: `.next`
5. Environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://devmastery-core.onrender.com`
   - `NODE_VERSION` = `20`
6. Deploy. Add custom domain in Pages settings if desired.

### Step D: UptimeRobot (Keep-alive — prevents spin-down + DB pause)

1. Go to https://uptimerobot.com → Create free account (**no credit card**).
2. **Add New Monitor**:
   - Type: **HTTP(s)**
   - URL: `https://devmastery-core.onrender.com/api/warmup`
   - Interval: **Every 14 minutes** (prevents Render from sleeping)
3. This achieves TWO things:
   - Keeps Render from spinning down the dyno
   - Keeps Supabase database active (warmup endpoint runs `SELECT 1`)

---

## Architecture: Before → After

### Before (over-engineered microservices)

```
Web ──HTTP──▶ Gateway ──┐
                         ├── auth-service        (8081)
                         ├── content-service     (8082, Feign→progress)
                         ├── progress-service    (8083, Kafka→streak events)
                         ├── ai-bot-service      (8084, WebClient→content)
                         ├── execution-service   (8085, WebSocket→Judge0)
                         └── search-service      (8089)
Infrastructure:
  PostgreSQL, Valkey, OpenSearch, Kafka, MinIO,
  Judge0, Vault, Prometheus, Grafana
Components: 6+ services + 8 infra. Cost: $$$/month.
```

### After (modular monolith — free, production-ready)

```
Browser ──HTTPS──▶ Cloudflare Pages (Next.js)
                         │
                         ▼ HTTPS
                   ┌───────────────────────────────────────┐
                   │     devmastery-core (single JVM)      │
                   │  ┌─────┬───────┬────────┬────┬─────┐ │
                   │  │auth │content│progress│quiz│search│ │
                   │  ├─────┴───────┴────────┴────┴─────┤ │
                   │  │  ai  │ profile │ admin │ storage │ │
                   │  ├──────┴────────┴───────┴─────────┤ │
                   │  │   security  │  common (events)  │ │
                   │  ├─────────────┴───────────────────┤ │
                   │  │  Caffeine cache │ Spring Events  │ │
                   │  └─────────────────────────────────┘ │
                   └──────┬─────────────────┬─────────────┘
                          │ JDBC            │ REST
                          ▼                 ▼
                  ┌──────────────┐   ┌──────────────┐
                  │   Supabase   │   │   Supabase   │
                  │  PostgreSQL  │   │   Storage    │
                  └──────────────┘   └──────────────┘
                          ▲
                          │ HTTPS
                   Gemini 1.5 Flash (Google)

Components: 1 web service + 1 managed platform.
Cost: $0/month. No credit card. No Docker in prod.
```

---

## API Surface (Android-compatible — no breaking changes)

| Path | Module | Notes |
| ---- | ------ | ----- |
| `POST /v1/auth/register` | auth | unchanged |
| `POST /v1/auth/login` | auth | unchanged |
| `GET /v1/auth/me` | auth | unchanged |
| `GET /v1/topics` | content | unchanged |
| `GET /v1/topics/{slug}` | content | adds `tryOnlineUrl` in code examples |
| `GET /v1/topics/{id}/lessons` | content | unchanged |
| `POST /v1/lessons/{id}/complete` | content | unchanged |
| `GET /v1/paths` | content | unchanged |
| `GET /v1/paths/{slug}` | content | unchanged |
| `GET /v1/search?q=` | search | unchanged (PG full-text instead of OpenSearch) |
| `GET /v1/progress/summary` | progress | unchanged |
| `GET /v1/progress/reviews/due` | progress | unchanged |
| `POST /v1/progress/reviews/{topicId}` | progress | unchanged |
| `GET /v1/quizzes/{id}` | quiz | unchanged |
| `POST /v1/quizzes/{id}/submit` | quiz | unchanged |
| `POST /v1/ai/chat` (SSE) | ai | unchanged |
| `POST /v1/ai/feynman/score` | ai | unchanged |
| `GET /v1/profile` | profile | **new** |
| `PUT /v1/profile` | profile | **new** |
| `POST /v1/profile/avatar` | profile | **new** |
| `GET /v1/admin/dashboard` | admin | **new** (ADMIN role) |
| `PUT /v1/admin/topics/{slug}/section` | admin | unchanged |
| `GET /v1/admin/runners` | admin | **new** (ADMIN role) |
| `PUT /v1/admin/runners/{language}` | admin | **new** (ADMIN role) |
| `GET /api/warmup` | config | **new** (public — UptimeRobot target) |

**Android app:** Update `BASE_URL` from per-service ports to single Render URL. All
request/response contracts are identical.

---

## Removed Components

| Component | Replaced With |
| --------- | ------------- |
| Kafka | Spring `ApplicationEventPublisher` + `@EventListener` |
| OpenSearch | PostgreSQL `tsvector` + GIN indexes |
| Judge0 / execution-service | External "Try Online →" links |
| Redis / Valkey | Caffeine in-memory cache |
| Vault | Render environment variables |
| MinIO | Supabase Storage REST API |
| Cloudflare R2 | Supabase Storage (R2 requires credit card) |
| Prometheus + Grafana | Spring Boot Actuator only |
| Kubernetes / Helm | Render + Cloudflare Pages |
| API Gateway + Feign | Single monolith (direct method calls) |

---

## Caveats & Known Behaviors

1. **Cold start:** Render free tier spins down after 15 min idle. First request
   takes 30–60s. UptimeRobot pings (every 14 min) prevent this during active hours.

2. **Cache loss:** Caffeine is in-process. When Render spins down, cache is cleared.
   Next request rebuilds cache from Supabase. Acceptable for 1–10 users.

3. **Supabase pause:** Free projects pause after 7 days without DB activity.
   The `/api/warmup` endpoint (pinged every 14 min by UptimeRobot) runs `SELECT 1`
   and prevents this.

4. **Storage limit:** 1 GB on Supabase free tier. Avatars + certificates only.
   No video storage. 200KB max per upload enforced in code.

5. **Database limit:** 500 MB. For text-based learning content with 1–10 users,
   typical usage is 10–50 MB.

6. **Lazy initialization:** Enabled in prod to reduce cold-start time. First request
   to a previously-unused module may be slightly slower.

---

## Future Microservice Extraction

Because every module already:
- Exposes only a service interface
- Has no cross-module entity/repository access
- Communicates via application events

Extracting any module into a separate service is mechanical:
1. Move the package to a new Gradle project
2. Replace the local service call with an HTTP client implementing the same interface
3. Replace `ApplicationEventPublisher` with a message broker
# DevMastery 🚀

> **From Zero to Senior Engineer.** A depth-first, AI-assisted learning platform.

**Architecture:** Modular monolith. **Cost:** ₹0/month (100% free tiers).

---

## TL;DR

| Layer        | Tech                                       | Host                              |
| ------------ | ------------------------------------------ | --------------------------------- |
| Frontend     | Next.js 14 (TS, Tailwind, shadcn/ui)       | **Cloudflare Pages** (free)       |
| Backend      | Spring Boot 3.3 + Java 21 (modular monolith) | **Render** Web Service (free)   |
| Database     | PostgreSQL 16 + Flyway                     | **Supabase** (free, 500 MB)       |
| Object store | S3-compatible API                          | **Cloudflare R2** (free, 10 GB)   |
| AI Mentor    | Gemini 1.5 Flash                           | Google AI Studio (free 1M tok/d)  |
| Cache        | Caffeine (in-process)                      | inside the JVM                    |
| Search       | PostgreSQL `tsvector` + GIN                | inside Supabase                   |
| Code runner  | OneCompiler / JSFiddle / Programiz links   | client-side redirect              |

No Kafka. No OpenSearch. No Vault. No Redis. No Judge0. No Kubernetes. No Docker Compose in prod.

---

## Repository layout

```
dev-mastery/
├── apps/
│   ├── web/                       Next.js 14 (Cloudflare Pages)
│   └── android/                   Kotlin + Compose (consumes same REST API)
├── services/
│   └── devmastery-core/           ⭐ The modular monolith (Spring Boot)
│       ├── src/main/java/com/devmastery/
│       │   ├── auth/      ──┐
│       │   ├── content/     │   Each module has:
│       │   ├── progress/    │     api/        ← public service interfaces
│       │   ├── quiz/        │     internal/   ← entities, repos, impl (package-private)
│       │   ├── search/      │     web/        ← REST controllers
│       │   ├── ai/        ──┘
│       │   ├── storage/           Cloudflare R2 (S3 SDK)
│       │   ├── common/            Shared DTOs, exceptions, application events
│       │   ├── security/          JWT filter, SecurityFilterChain
│       │   └── config/            Caffeine cache names, CORS, OpenAPI
│       ├── src/main/resources/
│       │   ├── application.yml
│       │   ├── application-dev.yml
│       │   ├── application-prod.yml
│       │   └── db/migration/
│       │       ├── V1__baseline_schema.sql
│       │       └── V2__fulltext_search.sql
│       ├── Dockerfile             Multi-stage, ~220 MB final image
│       ├── render.yaml            Render blueprint (free tier)
│       └── .env.example
├── docker-compose.dev.yml         Postgres only (for local dev)
└── README.md                      (this file)
```

### Module boundary rules

1. Each module exposes a **public service interface** in `<module>/api/`.
2. `internal/` classes are **package-private** — no external module may import them.
3. Cross-module calls go through interfaces (`AuthService`, `ContentService`, …).
4. Side-effects flow as Spring `ApplicationEvent`s (e.g. `LessonCompletedEvent`),
   handled asynchronously by `@EventListener`s in other modules — **the same seam
   you'd later extract into a queue when splitting into microservices.**

---

## Local development

### Prerequisites

| Tool       | Version |
| ---------- | ------- |
| JDK        | 21      |
| Node.js    | ≥ 20    |
| Docker     | any     |

### 1. Start Postgres

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 2. Run the backend

```bash
cd services/devmastery-core
cp .env.example .env                # fill in JWT_SECRET, GEMINI_API_KEY at minimum
./gradlew bootRun                   # http://localhost:8080
# Swagger UI:  http://localhost:8080/swagger-ui.html
# Health:      http://localhost:8080/actuator/health
```

> Don't have Supabase yet? The `dev` profile defaults to the local Docker Postgres
> on port 5433.

### 3. Run the web app

```bash
cd apps/web
cp .env.example .env.local          # NEXT_PUBLIC_API_URL=http://localhost:8080
npm install
npm run dev                         # http://localhost:3000
```

---

## Deployment

### A. Supabase (database)

1. Create a project at <https://supabase.com> (free tier).
2. Project Settings → Database → **Connection string → JDBC**. Copy it.
   It looks like `jdbc:postgresql://db.<ref>.supabase.co:5432/postgres?sslmode=require`.
3. Save the database password — you'll need it in Render.
4. Flyway runs automatically on first boot of the backend and creates all tables.

### B. Cloudflare R2 (object storage)

1. Cloudflare dashboard → **R2** → Create bucket `devmastery-assets`.
2. **Manage R2 API Tokens** → Create token with **Object Read & Write** on that bucket.
3. Save `Account ID`, `Access Key ID`, `Secret Access Key`.
4. (Optional) Attach a custom domain to the bucket for public asset URLs;
   put it in `R2_PUBLIC_URL`. If omitted, the backend returns presigned URLs.
5. CORS — add this rule via the R2 dashboard:
   ```json
   [{ "AllowedOrigins": ["https://devmastery.pages.dev"],
      "AllowedMethods": ["GET","PUT","HEAD"],
      "AllowedHeaders": ["*"], "MaxAgeSeconds": 3600 }]
   ```

### C. Render (backend)

1. Push the repo to GitHub.
2. Render dashboard → **New → Blueprint** → point at `services/devmastery-core/render.yaml`.
3. Render reads the blueprint and prompts for the `sync: false` env vars
   (`DATABASE_URL`, `R2_*`, `GEMINI_API_KEY`, `ALLOWED_ORIGINS`).
4. First deploy builds the multi-stage Dockerfile (~5 min). Health check
   `/actuator/health` must return `UP`.

> Free dynos sleep after 15 min of inactivity. First request after sleep takes ~30 s.
> Acceptable for 1–10 concurrent users.

### D. Cloudflare Pages (frontend)

1. Cloudflare dashboard → **Workers & Pages → Create application → Pages → Connect to Git**.
2. Select the repo, root directory `apps/web`.
3. Build settings:
   - Framework preset: **Next.js**
   - Build command: `npm install && npm run build`
   - Build output: `.next`
4. Environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://devmastery-core.onrender.com`
   - `NODE_VERSION` = `20`
5. Deploy. After the first build, add a custom domain if desired.

---

## Architecture: before → after

### Before (microservices)

```
            ┌──────────┐
Web ──HTTP──▶  Gateway │──┐
            └──────────┘  │
                ┌─────────┼──── Feign ────┐
                ▼         ▼               ▼
            ┌────────┐ ┌──────────┐ ┌──────────┐
            │ auth   │ │ content  │ │ progress │
            └────────┘ └──────────┘ └──────────┘
                          │ Kafka ▲
                          ▼       │
                       OpenSearch │
                          ▲       │
                          └─Index─┘
            ┌────────┐ ┌──────────┐ ┌──────────┐
            │ ai-bot │ │execution │ │ search   │
            └────────┘ └──────────┘ └──────────┘
                          │
                          ▼ HTTP
                       Judge0  ──> Postgres-judge0
            ┌────────┐ ┌──────────┐
            │ Valkey │ │  MinIO   │
            └────────┘ └──────────┘
                  ┌─────────────────┐
                  │ Vault, Kafka UI │
                  │ Prometheus      │
                  │ Grafana, K3s    │
                  └─────────────────┘
Components: 10 services + 8 infra deps. Infra cost: $$$/month.
```

### After (modular monolith)

```
Browser ──HTTPS──▶ ┌────────────────────────────────────────┐
                   │      devmastery-core (single JVM)      │
                   │ ┌──────┬───────┬────────┬─────┬──────┐ │
                   │ │ auth │content│progress│quiz │search│ │
                   │ ├──────┴───────┴────────┴─────┴──────┤ │
                   │ │   ai   │  storage  │  Caffeine    │ │
                   │ ├────────┴──────┬─────┴──────────────┤ │
                   │ │  security    │  common (events)   │ │
                   │ └──────────────┴────────────────────┘ │
                   └──────┬─────────────────┬──────────────┘
                          │                 │
                          ▼ JDBC            ▼ S3 API
                  ┌──────────────┐   ┌──────────────┐
                  │  Supabase    │   │ Cloudflare R2│
                  │  Postgres    │   │  (assets)    │
                  └──────────────┘   └──────────────┘
                          ▲
                          │ HTTPS
                          └──── Gemini 1.5 Flash (Google)

Cross-module: ApplicationEventPublisher → @EventListener (in-JVM, async).
External code execution: client redirect → OneCompiler/Programiz.
Components: 1 web service. Infra cost: $0/month.
```

---

## API surface (unchanged for clients)

| Path                              | Old service        | Now in module |
| --------------------------------- | ------------------ | ------------- |
| `POST /v1/auth/register`          | auth-service       | `auth`        |
| `POST /v1/auth/login`             | auth-service       | `auth`        |
| `GET  /v1/topics`                 | content-service    | `content`     |
| `GET  /v1/topics/{slug}`          | content-service    | `content`     |
| `GET  /v1/paths`                  | content-service    | `content`     |
| `POST /v1/lessons/{id}/complete`  | content-service    | `content`     |
| `GET  /v1/progress/summary`       | progress-service   | `progress`    |
| `GET  /v1/progress/reviews/due`   | progress-service   | `progress`    |
| `GET  /v1/quizzes/{id}`           | (new)              | `quiz`        |
| `GET  /v1/search?q=`              | search-service     | `search`      |
| `POST /v1/ai/chat`  (SSE)         | ai-bot-service     | `ai`          |
| `POST /v1/ai/feynman/score`       | ai-bot-service     | `ai`          |

The Android app and the web app keep working with no changes other than
pointing all `*_API_URL` env vars at a single host.

---

## Future microservice extraction (when/if needed)

Because every module already:
- exposes a service interface,
- has no shared entities/repositories with other modules, and
- communicates via application events,

extracting (say) the `ai` module into its own service is a mechanical refactor:

1. Move `com.devmastery.ai.*` into a new Gradle project.
2. Replace `@Service GeminiAiService` with an HTTP client implementing `AiService`.
3. Replace the in-process `ApplicationEventPublisher` for AI-related events with a
   message broker producer (e.g. RabbitMQ on CloudAMQP free tier).

No business logic changes required.
