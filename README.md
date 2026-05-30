# DevMastery — Setup & Integration Guide

> Master Every Technology. Miss Nothing. — Full-stack depth-first learning platform.

## 🏗️ Architecture

| Service | Port | Tech |
|---------|------|------|
| **Web Frontend** | 3000 | Next.js 14, TypeScript, Tailwind, Zustand |
| **auth-service** | 8081 | Spring Boot 3.2, JWT |
| **content-service** | 8082 | Spring Boot 3.2, Flyway, Valkey cache |
| **progress-service** | 8083 | Spring Boot 3.2, XP/streak/badges |
| **execution-service** | 8084 | Spring Boot + WebSocket + Judge0 CE |
| **ai-bot-service** | 8085 | Spring WebFlux + Gemini SSE streaming |

## 🚀 Quick Start

### 1. Start Infrastructure
```bash
docker-compose -f docker-compose.dev.yml up -d
```
Starts: PostgreSQL (5433), Valkey (6379), OpenSearch (9200), MinIO (9000), Judge0 CE (2358)

### 2. Frontend
```bash
cd apps/web && npm install
cp .env.example .env.local
npm run dev   # http://localhost:3000
```

### 3. Backend (each in separate terminal)
```bash
cd services/auth-service     && ./gradlew bootRun
cd services/content-service  && ./gradlew bootRun
cd services/progress-service && ./gradlew bootRun
cd services/execution-service && ./gradlew bootRun
cd services/ai-bot-service   && GEMINI_API_KEY=your_key ./gradlew bootRun
```

## 🔑 Key API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/auth/register` | POST | Create account |
| `/v1/auth/login` | POST | Login → JWT |
| `/v1/paths` | GET | List 18 learning paths |
| `/v1/paths/{slug}/roadmap` | GET | Path roadmap by levels |
| `/v1/topics/{slug}` | GET | Full topic + 9 lesson layers |
| `/v1/progress/layers/complete` | POST | Mark layer complete |
| `/v1/progress/summary` | GET | Dashboard XP/streak/progress |
| `ws://localhost:8084/ws/execute` | WS | Code execution (STOMP) |
| `/v1/ai/chat` | POST | Gemini SSE streaming chat |
| `/v1/ai/feynman/score` | POST | AI-score understanding |

## 🎨 Design System: "Terminal Precision"
- **bg-primary**: `#0D1117` · **bg-surface**: `#161B22` · **bg-elevated**: `#21262D`
- **accent-java**: `#F89820` · **accent-spring**: `#6DB33F` · **accent-ai**: `#4285F4`
- Fonts: **Syne** (display) · **DM Sans** (body) · **JetBrains Mono** (code)

## 🧩 9-Layer Teaching Model
`Why → Theory → Visualizer → Code Lab → Real World → Interview → Feynman → Build → Spaced Review`

## 📁 Frontend Structure
```
apps/web/src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/, register/     # Auth pages
│   ├── dashboard/            # Protected dashboard (Sidebar + Topbar)
│   ├── learn/
│   │   ├── [pathSlug]/roadmap/    # Path roadmap (list/map view)
│   │   └── [pathSlug]/[topicSlug]/ # Topic with 9 tabs
│   └── profile/              # User profile
├── components/
│   ├── shell/                # Sidebar, Topbar, CommandPalette
│   ├── topic/                # TopicPage, LessonNav, panels
│   ├── dashboard/            # Charts, PathCard, StatsBar
│   ├── roadmap/              # RoadmapCanvas (D3), RoadmapListView
│   └── visualizer/           # DSA algorithm visualizers
├── hooks/                    # useAiChat, useProgress, useCodeExecution
├── lib/                      # api.ts (all backend calls), pathMeta.ts
└── store/                    # useAuthStore (persist), useTopicStore
```
