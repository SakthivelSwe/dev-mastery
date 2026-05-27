# DevMastery 🚀
> *From Zero to 10-Year Senior Engineer. Depth-first, concept-complete, AI-assisted learning.*

**100% Free Stack — Zero licensing cost at any scale.**

---

## Quick Start

### Prerequisites
| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 20 | https://nodejs.org |
| JDK 21 | LTS (Temurin) | https://adoptium.net |
| Docker Desktop | Latest | https://docker.com |
| Git | Latest | https://git-scm.com |

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_ORG/devmastery.git
cd devmastery
npm install
```

### 2. Configure Environment
```bash
cp .env.dev.example .env.dev
# Edit .env.dev — fill in your GEMINI_API_KEY and change all CHANGE_ME_ placeholders
```

### 3. Start Infrastructure
```bash
npm run infra:up
# Waits for all services to be healthy (PostgreSQL, Valkey, OpenSearch, Kafka, Judge0, MinIO)
```

### 4. Start Backend Services
```bash
cd services/content-service
./gradlew bootRun
# API running at http://localhost:8082
# Swagger UI: http://localhost:8082/swagger-ui.html
```

### 5. Start Web App
```bash
cd apps/web
npm run dev
# Web app running at http://localhost:3000
```

---

## Architecture

```
devmastery/
├── apps/
│   ├── web/          ← Next.js 14 (TypeScript, Tailwind, shadcn/ui)
│   └── android/      ← Kotlin + Jetpack Compose (Phase 3)
├── services/
│   ├── api-gateway/          ← Port 8080
│   ├── auth-service/         ← Port 8081
│   ├── content-service/      ← Port 8082  ✅ Phase 0
│   ├── progress-service/     ← Port 8083
│   ├── code-execution-service/ ← Port 8084
│   ├── ai-bot-service/       ← Port 8085
│   ├── quiz-service/         ← Port 8086
│   ├── notification-service/ ← Port 8087
│   ├── user-service/         ← Port 8088
│   └── search-service/       ← Port 8089
├── docker-compose.dev.yml    ← Full dev environment
├── turbo.json
└── package.json
```

## Technology Stack (100% Free)

| Layer | Technology |
|---|---|
| Web Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, D3.js, Framer Motion |
| Backend | Spring Boot 3.2, Java 21, Gradle, Flyway, MapStruct, Lombok |
| Database | PostgreSQL 16, Valkey 7.x, OpenSearch 2.x, MinIO |
| Messaging | Apache Kafka 3.x |
| AI | Google Gemini API (gemini-1.5-flash) — free tier 1M tokens/day |
| Android | Kotlin 2, Jetpack Compose, Hilt, Room, Coroutines |
| DevOps | Docker Compose, GitHub Actions, Oracle Cloud Always Free |

## Cost
```
Development:  ₹0 (Docker Compose local)
Production:   ₹0/month (Oracle Cloud Always Free — 4 OCPU, 24GB ARM)
Annual cost:  ~₹800 (domain name only)
```

---

## Project Phases

| Phase | Weeks | Status |
|---|---|---|
| **Phase 0** — Foundation, Monorepo, DB Schema, Content Service, Web Scaffold | 1–3 | 🔨 In Progress |
| **Phase 1** — Auth, Progress, DSA Visualizer, AI Bot | 4–8 | ⏳ Planned |
| **Phase 2** — Code Lab, Quiz Engine, Gamification | 9–12 | ⏳ Planned |
| **Phase 3** — Android App | 13–18 | ⏳ Planned |
| **Phase 4** — System Design, Mock Interview, Admin CMS | 19–24 | ⏳ Planned |
| **Phase 5** — Monitoring, Play Store, Beta Launch | 25–28 | ⏳ Planned |

---

## License
All components use 100% free and open-source licenses (MIT, Apache 2.0, LGPL).
