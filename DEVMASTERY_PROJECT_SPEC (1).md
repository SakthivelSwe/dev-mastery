# DevMastery — Complete Project Specification (100% Free Stack)
> *From Zero to 10-Year Senior Engineer. Depth-first, concept-complete, AI-assisted learning.*
> **All technologies in this document are 100% free and open source. Zero licensing cost at any scale.**

---

## Free Stack Summary (Quick Reference)

| What was paid | Free replacement used | License |
|---|---|---|
| Redis 7.4+ (license changed) | **Valkey 7.x** (Linux Foundation fork) | Apache 2.0 |
| Elasticsearch (Elastic License) | **OpenSearch 2.x** (AWS fork) | Apache 2.0 |
| Claude API (paid per token) | **Google Gemini API — gemini-1.5-flash** (free tier: 1M tokens/day) | Free tier |
| Judge0 RapidAPI (100/day limit) | **Judge0 CE self-hosted** (open source) | Apache 2.0 |
| AWS S3 (paid storage) | **MinIO** (self-hosted S3-compatible) | AGPL 3.0 |
| AWS EKS / GKE (paid Kubernetes) | **K3s** (lightweight Kubernetes, self-hosted) | Apache 2.0 |
| AWS Secrets Manager (paid) | **HashiCorp Vault Community** (self-hosted) | BUSL 1.1 (free self-host) |
| Sentry (paid beyond limits) | **GlitchTip** (open source Sentry alternative) | MIT |
| Supabase Storage (paid beyond 500MB) | **MinIO** (self-hosted, unlimited) | AGPL 3.0 |

**Hosting strategy (zero cost):**
- Development: Docker Compose on your local machine (ASUS TUF A15 — already set up)
- Production: **Oracle Cloud Always Free** — 4 OCPU + 24 GB ARM VM permanently free — enough to run everything

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Philosophy & Learning Architecture](#2-core-philosophy--learning-architecture)
3. [Full Technology Stack](#3-full-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Module Breakdown](#5-module-breakdown)
6. [Database Design](#6-database-design)
7. [API Design Strategy](#7-api-design-strategy)
8. [UI/UX Design System](#8-uiux-design-system)
9. [Android App Specification](#9-android-app-specification)
10. [AI Bot Architecture](#10-ai-bot-architecture)
11. [DevOps & Infrastructure](#11-devops--infrastructure)
12. [Project Phases & Milestones](#12-project-phases--milestones)
13. [Antigravity Agent Prompts — Module by Module](#13-antigravity-agent-prompts--module-by-module)

---

## 1. Project Overview

### 1.1 Application Name
**DevMastery** — *Master Every Technology. Miss Nothing.*

### 1.2 Mission Statement
DevMastery is a structured, depth-first learning platform that takes any developer — from complete beginner to 2-year working professional — and systematically builds them into a 10–12 year senior-level engineer. Every concept is taught in complete depth: theory, code, visualization, real-world usage, interview perspective, and system-level thinking. Nothing is skipped. Nothing is left as "an exercise for the reader."

### 1.3 Target Audience
| Persona | Background | Goal |
|---|---|---|
| Absolute Beginner | No coding background | Learn Java, OOP, DSA from scratch |
| Junior Developer | 0–2 years | Fill gaps, master DSA, crack interviews |
| Mid-level Developer | 2–5 years | Learn system design, design patterns, advanced frameworks |
| Senior Aspirant | 5–8 years | Architecture, distributed systems, real project depth |

### 1.4 Platforms
- **Web Application** — Next.js 14 (Desktop + Tablet + Mobile responsive)
- **Android App** — Kotlin + Jetpack Compose (Native)
- **Backend** — Spring Boot 3.x microservices (Java 21)
- **AI Bot** — Google Gemini API free tier (gemini-1.5-flash) integrated across all surfaces

---

## 2. Core Philosophy & Learning Architecture

### 2.1 The 6-Layer Teaching Model
Every single topic is taught across 6 layers. No exceptions.

```
Layer 1: WHY          → Why does this concept exist? What problem does it solve?
Layer 2: THEORY       → Complete conceptual explanation with real analogies
Layer 3: VISUAL       → Animated step-by-step visualization (DSA, flow, memory)
Layer 4: CODE         → Runnable code with inline comments, beginner → expert versions
Layer 5: REAL WORLD   → How this is used in production (e.g., HashMap in Spring Cache)
Layer 6: INTERVIEW    → All question types: conceptual, coding, tricky edge cases
```

### 2.2 Learning Paths
```
PATH A: Java Mastery
  → Core Java → OOP → Collections → Streams/Lambda → Concurrency → JVM Internals

PATH B: DSA Mastery (language-agnostic, Java-primary)
  → Arrays → Linked Lists → Stacks/Queues → Trees → Graphs → DP → Greedy → Backtracking

PATH C: Spring Boot Mastery
  → Spring Core → REST → JPA/Hibernate → Security → Microservices → Kafka → Valkey/Redis

PATH D: Frontend Mastery
  → HTML/CSS → JavaScript → TypeScript → React → Angular → Next.js → RxJS

PATH E: System Design Mastery
  → Scalability → CAP Theorem → Caching → DB Sharding → Message Queues → Real Projects

PATH F: Design Patterns
  → Creational → Structural → Behavioral → Architectural → Anti-patterns

PATH G: Interview Preparation
  → Coding Rounds → LLD → HLD → Behavioral → Company-specific sets
```

### 2.3 Difficulty Levels
- **Level 1 — Foundation**: Pure beginner, no assumptions
- **Level 2 — Building Blocks**: Basic programming knowledge assumed
- **Level 3 — Intermediate**: Can write basic applications
- **Level 4 — Advanced**: Production-aware developer
- **Level 5 — Expert**: Architecture-level thinker, senior-ready

---

## 3. Full Technology Stack (100% Free)

### 3.1 Frontend — Web
| Concern | Technology | License | Cost |
|---|---|---|---|
| Framework | **Next.js 14** (App Router) | MIT | Free |
| Language | **TypeScript 5.x** | Apache 2.0 | Free |
| Styling | **Tailwind CSS 3.x** | MIT | Free |
| Components | **shadcn/ui** | MIT | Free |
| Visualization | **D3.js v7** | ISC | Free |
| Animations | **Framer Motion 11** | MIT | Free |
| Code Editor | **Monaco Editor** (VS Code engine) | MIT | Free |
| Code Execution | **Judge0 CE** (self-hosted) | Apache 2.0 | Free |
| Diagrams | **Mermaid.js** | MIT | Free |
| Math/Complexity | **KaTeX** | MIT | Free |
| State Management | **Zustand** | MIT | Free |
| Data Fetching | **TanStack Query v5** | MIT | Free |
| Auth Client | **NextAuth.js v5** | ISC | Free |
| Charts | **Recharts** | MIT | Free |
| Markdown | **MDX** | MIT | Free |
| Hosting | **Vercel Free Tier** (or self-host on Oracle Cloud) | — | Free |

### 3.2 Backend — Microservices (Spring Boot 3.x)
| Service | Responsibility | Port |
|---|---|---|
| `api-gateway` | Routing, rate limiting, auth filter | 8080 |
| `auth-service` | JWT issuance, OAuth2, user sessions | 8081 |
| `content-service` | Topics, lessons, code examples, theory | 8082 |
| `progress-service` | User progress, streaks, milestones | 8083 |
| `code-execution-service` | Wraps Judge0 CE, sandbox management | 8084 |
| `ai-bot-service` | Gemini API proxy, context management | 8085 |
| `quiz-service` | MCQs, coding challenges, assessments | 8086 |
| `notification-service` | Email (SMTP free), push, in-app | 8087 |
| `user-service` | Profiles, preferences, subscriptions | 8088 |
| `search-service` | Full-text search via OpenSearch | 8089 |

**Backend tech stack (all Apache 2.0 / free):**
```
Language:        Java 21 LTS — Eclipse Temurin (free OpenJDK distribution)
Framework:       Spring Boot 3.2.x                  Apache 2.0
Build Tool:      Gradle 8.x (Kotlin DSL)             Apache 2.0
ORM:             Spring Data JPA + Hibernate 6.x     LGPL (free)
Migration:       Flyway Community Edition             Apache 2.0
Validation:      Hibernate Validator                  Apache 2.0
Security:        Spring Security 6 + JJWT 0.12       Apache 2.0
Messaging:       Apache Kafka 3.x                    Apache 2.0
Caching:         Valkey 7.x (via Lettuce client)     Apache 2.0
Reactive HTTP:   Spring WebClient                    Apache 2.0
API Docs:        SpringDoc OpenAPI 3.0               Apache 2.0
Logging:         SLF4J + Logback (JSON structured)   MIT / LGPL
Circuit Breaker: Resilience4j                        Apache 2.0
Testing:         JUnit 5, Mockito 5, Testcontainers  EPL / MIT
Code Tools:      Lombok, MapStruct                   MIT / Apache 2.0
Email:           JavaMailSender + Gmail SMTP          Free (500/day)
```

### 3.3 Database Layer (All Free)
| Store | Technology | License | Self-hosted |
|---|---|---|---|
| Primary DB | **PostgreSQL 16** | PostgreSQL License | Yes |
| Cache | **Valkey 7.x** | Apache 2.0 | Yes |
| Search | **OpenSearch 2.x** | Apache 2.0 | Yes |
| File Storage | **MinIO** | AGPL 3.0 | Yes |
| Time-series | **TimescaleDB Community** | Apache 2.0 | Yes (PostgreSQL extension) |
| CDN | **Cloudflare Free** | — | No (free SaaS) |

> **Why OpenSearch over Elasticsearch?**
> Amazon forked Elasticsearch in 2021 when Elastic changed its license. OpenSearch is 100% Apache 2.0, maintained by AWS + community, has the identical query API — your Spring Boot code doesn't change at all.

> **Why Valkey over Redis?**
> Redis Ltd changed its license to RSAL/SSPL in March 2024. Valkey is the Linux Foundation fork, Apache 2.0 forever, maintained by AWS, Google, Oracle, Ericsson engineers. Drop-in replacement — Spring Boot's `spring-data-redis` works with Valkey without any code change.

### 3.4 Android App (All Free)
| Concern | Technology | License |
|---|---|---|
| Language | **Kotlin 2.x** | Apache 2.0 |
| UI | **Jetpack Compose** (Material 3) | Apache 2.0 |
| Architecture | **MVVM + Clean Architecture** | — |
| Navigation | **Compose Navigation** | Apache 2.0 |
| DI | **Hilt** (Dagger) | Apache 2.0 |
| Networking | **Retrofit 2 + OkHttp 4** | Apache 2.0 |
| Serialization | **Kotlin Serialization** | Apache 2.0 |
| Async | **Kotlin Coroutines + Flow** | Apache 2.0 |
| Local DB | **Room** (SQLite) | Apache 2.0 |
| Code Highlight | **Highlight.js** (WebView) | BSD |
| AI Bot | **Gemini API free tier** | Free |
| Auth | **Google Sign-In + JWT** | Apache 2.0 |
| Push | **Firebase Cloud Messaging** | Free (Spark plan) |
| Offline | **WorkManager + Room sync** | Apache 2.0 |
| Play Store | **Google Play** (one-time $25 registration) | — |

### 3.5 AI Bot — Google Gemini API (Free Tier)
| Model | Free Tier Limits | Best For |
|---|---|---|
| **gemini-1.5-flash** | 15 RPM, 1,000,000 tokens/day | AI Bot (fast, free, sufficient) |
| gemini-1.5-pro | 2 RPM, 50 req/day | Complex system design explanations |

**Free tier is more than enough for launch:**
- 1 million tokens/day = ~3,000–5,000 AI bot conversations per day for free
- No credit card required to get started
- Get API key at: https://aistudio.google.com/app/apikey

**Fallback (fully offline, for dev):** Ollama with `qwen2.5-coder:14b` or `llama3.1:8b` — you already have this running on your ASUS TUF A15.

### 3.6 DevOps & Infrastructure (All Free)
| Tool | Purpose | License |
|---|---|---|
| **Docker + Docker Compose** | Local dev + production containers | Apache 2.0 |
| **K3s** | Lightweight Kubernetes for self-hosting | Apache 2.0 |
| **Oracle Cloud Always Free** | Production hosting (4 OCPU, 24GB ARM VM) | Free forever |
| **GitHub Actions** | CI/CD (free for public repos, 2000 min/month private) | — |
| **SonarQube Community** | Code quality gates (self-hosted) | LGPL |
| **Prometheus + Grafana** | Metrics and alerting (self-hosted) | Apache 2.0 |
| **OpenSearch Dashboards** | Log analytics (replaces Kibana) | Apache 2.0 |
| **Filebeat** | Log shipping | Apache 2.0 |
| **GlitchTip** | Error tracking (open source Sentry, self-hosted) | MIT |
| **HashiCorp Vault Community** | Secrets management (self-hosted) | BUSL 1.1 (free self-host) |
| **Nginx** | Reverse proxy / ingress | BSD |
| **Certbot + Let's Encrypt** | Free SSL certificates | Apache 2.0 |
| **Cloudflare Free** | DNS + CDN + DDoS protection | Free |

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│   [Next.js Web App]        [Android Kotlin App]             │
└────────────┬───────────────────────┬────────────────────────┘
             │ HTTPS/WSS             │ HTTPS/WSS
             ▼                       ▼
┌────────────────────────────────────────────────────────────┐
│         Cloudflare (free) — DNS + CDN + DDoS               │
└──────────────────────┬─────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────┐
│          Nginx Reverse Proxy (Oracle Cloud ARM VM)          │
│          Let's Encrypt SSL certificate (free)               │
└──────────────────────┬─────────────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────────────┐
│                API GATEWAY (8080)                           │
│       Rate Limiting · JWT Auth Filter · Routing            │
└─────┬──────┬──────┬──────┬──────┬──────┬──────┬────────────┘
      │      │      │      │      │      │      │
      ▼      ▼      ▼      ▼      ▼      ▼      ▼
  [auth] [content] [progress] [quiz] [code-exec] [ai-bot] [user]
      │      │          │      │         │          │      │
      └──────┴──────────┴──────┴─────────┘          │      │
                       │                             │      │
           ┌───────────▼──────────┐      ┌──────────▼──────▼──────┐
           │   PostgreSQL 16      │      │  Google Gemini API      │
           │   Valkey 7.x         │      │  (Free tier — external) │
           │   OpenSearch 2.x     │      └─────────────────────────┘
           │   MinIO              │
           │   Apache Kafka       │
           └──────────────────────┘
               (all self-hosted on
               Oracle Cloud Always Free ARM VM)
```

### 4.2 Oracle Cloud Always Free — Resource Allocation
Oracle gives you this **forever free** with no expiry:

```
ARM Ampere A1 VM:
  CPU:    4 OCPU (Ampere ARM)
  RAM:    24 GB
  Disk:   200 GB block storage
  
  Allocate:
  ├── API Gateway + Auth Service:     0.5 OCPU, 1GB RAM
  ├── Content + Progress Service:     0.5 OCPU, 2GB RAM
  ├── Code Execution (Judge0 CE):     1 OCPU,   4GB RAM   ← needs resources for sandboxing
  ├── AI Bot + Quiz + User services:  0.5 OCPU, 2GB RAM
  ├── PostgreSQL 16:                  0.5 OCPU, 4GB RAM
  ├── Valkey 7.x:                     0.25 OCPU, 1GB RAM
  ├── OpenSearch 2.x:                 0.5 OCPU, 4GB RAM   ← memory hungry
  ├── Apache Kafka + Zookeeper:       0.25 OCPU, 2GB RAM
  └── MinIO + Nginx + Monitoring:     0.5 OCPU, 4GB RAM

AMD x86 VM (also always free, separate):
  CPU:  1/8 OCPU
  RAM:  1 GB
  Use:  Certbot renewal cron, lightweight tasks
```

### 4.3 Caching Strategy (Valkey)
```
L1: In-memory (Caffeine)     → Hot content per JVM node, 1000 entries, 0 network cost
L2: Valkey 7.x               → Cross-service shared cache, TTL-based
L3: Cloudflare Free CDN      → Static assets, Next.js static pages
```

Named Cache Zones (Valkey):
```
devmastery:content:topics              TTL: 24h
devmastery:content:lesson:{id}         TTL: 6h
devmastery:progress:{userId}           TTL: 30min
devmastery:quiz:{userId}               TTL: 1h
devmastery:code:exec:{hash}            TTL: 5min   ← dedup identical submissions
devmastery:search:popular              TTL: 1h
devmastery:ai:context:{userId}         TTL: 15min  ← Gemini conversation context
devmastery:user:profile:{id}           TTL: 1h
devmastery:ai:ratelimit:{userId}:{date} TTL: 24h   ← daily usage counter
```

---

## 5. Module Breakdown

### 5.1 Module 1: Learning Path Dashboard
**Features:**
- Skill assessment quiz on first login (30 questions, adaptive)
- Auto-generated learning path based on results
- Progress rings per technology path
- Daily streak tracking (GitHub-style contribution graph)
- Estimated completion time per path
- "What to learn today" smart recommendation (rule-based, no AI cost)

---

### 5.2 Module 2: DSA Visualizer
**Visualizations (minimum):**
```
Arrays:       Insert, Delete, Search, Rotate, Sliding Window
Linked List:  Singly, Doubly, Circular — Insert, Delete, Reverse
Stack/Queue:  Push, Pop, BFS, DFS queue visualization
Trees:        BST Insert/Delete/Search, AVL Rotations, Segment Tree
Heaps:        MinHeap, MaxHeap, Heapify, Priority Queue
Graphs:       DFS, BFS, Dijkstra, Kruskal, Prim, Floyd-Warshall, Topological Sort
Sorting:      Bubble, Selection, Insertion, Merge, Quick, Heap, Radix, Counting
Searching:    Linear, Binary, Interpolation
DP:           Fibonacci table build, Knapsack table, LCS matrix
Hashing:      Hash function, Collision resolution (chaining, open addressing)
```

**Visualizer Features:**
- Speed control (0.25x → 4x)
- Step-by-step mode (< > navigation)
- Memory address view panel
- Time/Space complexity badge updates per step
- Custom input (user enters their own values)
- Code panel synchronized — highlighted line moves with animation

**Tech:** D3.js v7 (web) + Custom Compose Canvas (Android) — both free

---

### 5.3 Module 3: Theory Engine
**Content structure per topic (MDX-based):**
```yaml
topic:
  id: "java-hashmap-internal"
  title: "HashMap — Internal Working"
  level: 3
  estimated_minutes: 45

  sections:
    - type: "why"
      content: "MDX — why HashMap exists, problem it solves"

    - type: "concept"
      content: "Bucket array + Entry node + hashCode + equals — complete explanation"

    - type: "visualization"
      component: "HashmapVisualizer"

    - type: "code"
      language: "java"
      levels:
        1: "Simple put/get usage"
        3: "Custom hashCode/equals override"
        5: "ConcurrentHashMap segment locking internals"

    - type: "real_world"
      content: "Used in Spring @Cacheable, JPA first-level cache, Hibernate Session..."

    - type: "interview"
      questions:
        - q: "What happens when two keys have same hashCode?"
          type: "conceptual"
        - q: "Implement a custom LRU Cache"
          type: "coding"
```

---

### 5.4 Module 4: Code Lab (In-Browser IDE)
**Features:**
- Monaco Editor (VS Code engine — free MIT)
- Languages: Java, JavaScript, TypeScript, Python, Kotlin, SQL
- Judge0 CE (self-hosted) for sandboxed execution — unlimited, free
- Pre-loaded templates per lesson
- Diff view: "Your Code vs Optimal Code"
- "Explain My Code" → AI Bot explains user's code
- Save snippet to personal library

**Execution flow:**
```
User clicks Run
  → POST /code-execution-service/execute
  → Check Valkey cache by code hash (5min TTL)
  → Cache miss → submit to self-hosted Judge0 CE
  → Poll Judge0 for result (500ms interval)
  → Return: stdout, stderr, execution time, memory
  → Cache result in Valkey
```

**Judge0 CE self-hosting** (Docker Compose, runs on Oracle Cloud free VM):
```yaml
# docker-compose.judge0.yml
services:
  judge0-server:
    image: judge0/judge0:latest
    ports: ["2358:2358"]
    environment:
      REDIS_URL: redis://valkey:6379
      POSTGRES_URL: postgresql://postgres:5432/judge0
  judge0-workers:
    image: judge0/judge0:latest
    command: ["./scripts/workers"]
    privileged: true   # required for sandbox isolation
```

---

### 5.5 Module 5: Real-Time Projects
**10 guided end-to-end projects:**
```
Project 1:  URL Shortener             (Hashing, DB, REST, Caching, Base62)
Project 2:  LRU Cache                 (LinkedHashMap, Design Patterns)
Project 3:  Thread Pool               (Java Concurrency, ExecutorService)
Project 4:  Mini Spring IoC Container (Reflection, Annotations)
Project 5:  E-Commerce Cart Service   (Spring Boot, JPA, Valkey)
Project 6:  Real-time Chat            (WebSocket, Kafka, Spring Boot)
Project 7:  Search Engine             (OpenSearch, Trie, Ranking)
Project 8:  Rate Limiter              (Valkey Token Bucket, Spring AOP)
Project 9:  Authentication System     (JWT, Spring Security, OAuth2)
Project 10: Full-Stack Task Manager   (Angular + Spring Boot + PostgreSQL)
```

Each project:
- Architecture diagram (Mermaid — free)
- Step-by-step guided build (each step = lesson with code + explanation)
- "Common mistakes" section
- Final production-grade version with tests
- "Design this at scale" interview follow-up

---

### 5.6 Module 6: System Design
**Topics:**
```
Foundations:
  - Horizontal vs Vertical Scaling
  - Load Balancing strategies
  - CAP Theorem with real examples
  - Consistency patterns

Storage:
  - SQL vs NoSQL decision guide
  - Database indexing deep dive
  - Sharding strategies
  - Replication patterns

Caching:
  - Cache-aside, write-through, write-back
  - Eviction: LRU, LFU, FIFO
  - Valkey vs Memcached comparison

Messaging:
  - Kafka architecture deep dive
  - Event sourcing and CQRS
  - Message queue patterns

Case Studies (complete HLD):
  - Design Twitter/X
  - Design Netflix
  - Design Uber
  - Design WhatsApp
  - Design Google Search
  - Design a Distributed Cache
```

---

### 5.7 Module 7: Design Patterns
**All 23 GoF patterns + Architectural patterns.**

Per pattern:
- Intent and problem solved
- UML class diagram (Mermaid — free)
- Java implementation (clean)
- Spring Boot real usage (Factory → BeanFactory, Observer → ApplicationEvent)
- When to use / When NOT to use
- Interview traps

---

### 5.8 Module 8: Interview Preparation
- **DSA Practice**: 450-problem curated list, tagged by company + difficulty + pattern
- **LLD Round**: 20 OO design problems (Parking Lot, BookMyShow, Chess, etc.)
- **HLD Round**: System design mock with structured framework
- **Conceptual MCQs**: 2000+ questions across all technologies
- **Mock Interview Mode**: Gemini AI plays interviewer, scores responses
- **Company-wise Sets**: Amazon, Google, Flipkart, Infosys, TCS, Wipro patterns

---

### 5.9 Module 9: AI Bot (DevMastery Mentor)
**Powered by Google Gemini API — free tier (gemini-1.5-flash)**

**Capabilities:**
- Answers doubts in depth matching user's current level
- Debugs code and explains every error line by line
- Generates quiz questions on any topic
- Plays mock interviewer
- Explains visualization steps in natural language
- "Teach me this differently" — re-explains any concept with new analogy
- Remembers last 20 messages per session
- Daily usage: 1 million tokens/day free = ~3,000–5,000 conversations

**Offline fallback (dev environment):**
- Ollama with `qwen2.5-coder:14b` (already running on your ASUS TUF A15)
- Same Spring Boot service, just switch endpoint via env var

---

### 5.10 Module 10: Progress & Gamification
- Daily streak with freeze protection
- XP per lesson, quiz, code challenge
- Level badges: Apprentice → Journeyman → Craftsman → Architect → Master
- Weekly leaderboard
- Certificates: PDF generated with **iText Community** (AGPL — free)
- "Knowledge Map" radar chart
- Study reminders via FCM (Firebase free) + SMTP email (Gmail SMTP free)

---

## 6. Database Design

### 6.1 PostgreSQL Schema (Core Tables)

```sql
-- Users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    avatar_url      TEXT,
    auth_provider   VARCHAR(50) NOT NULL,   -- 'google', 'github', 'email'
    subscription    VARCHAR(50) DEFAULT 'free',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Learning Paths
CREATE TABLE learning_paths (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(100) UNIQUE NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    level_min       INT NOT NULL,
    level_max       INT NOT NULL,
    icon            VARCHAR(100),
    total_topics    INT DEFAULT 0,
    order_index     INT NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE
);

-- Topics
CREATE TABLE topics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_id         UUID REFERENCES learning_paths(id),
    slug            VARCHAR(255) UNIQUE NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    level           INT NOT NULL CHECK (level BETWEEN 1 AND 5),
    estimated_mins  INT NOT NULL,
    order_index     INT NOT NULL,
    has_visualizer  BOOLEAN DEFAULT FALSE,
    has_code_lab    BOOLEAN DEFAULT FALSE,
    is_published    BOOLEAN DEFAULT FALSE,
    tags            TEXT[],
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons (sections within a topic)
CREATE TABLE lessons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id        UUID REFERENCES topics(id),
    section_type    VARCHAR(50) NOT NULL,   -- 'why','theory','visual','code','realworld','interview'
    title           VARCHAR(255) NOT NULL,
    content_mdx     TEXT NOT NULL,
    order_index     INT NOT NULL,
    estimated_mins  INT DEFAULT 5
);

-- Code Examples
CREATE TABLE code_examples (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id        UUID REFERENCES topics(id),
    lesson_id       UUID REFERENCES lessons(id),
    language        VARCHAR(50) NOT NULL,
    level           INT NOT NULL CHECK (level BETWEEN 1 AND 5),
    title           VARCHAR(255) NOT NULL,
    code            TEXT NOT NULL,
    explanation     TEXT,
    time_complexity VARCHAR(50),
    space_complexity VARCHAR(50),
    is_runnable     BOOLEAN DEFAULT TRUE
);

-- User Progress
CREATE TABLE user_progress (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    topic_id        UUID REFERENCES topics(id),
    status          VARCHAR(50) DEFAULT 'not_started',
    completion_pct  INT DEFAULT 0,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    xp_earned       INT DEFAULT 0,
    UNIQUE (user_id, topic_id)
);

-- Lesson Completions
CREATE TABLE lesson_completions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    lesson_id       UUID REFERENCES lessons(id),
    completed_at    TIMESTAMPTZ DEFAULT NOW(),
    time_spent_secs INT DEFAULT 0,
    UNIQUE (user_id, lesson_id)
);

-- Quiz Questions
CREATE TABLE quiz_questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id        UUID REFERENCES topics(id),
    question_type   VARCHAR(50) NOT NULL,   -- 'mcq','coding','truefalse','fill'
    question_text   TEXT NOT NULL,
    options         JSONB,
    correct_answer  TEXT,
    explanation     TEXT NOT NULL,
    difficulty      INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    company_tags    TEXT[],
    topic_tags      TEXT[]
);

-- Quiz Attempts
CREATE TABLE quiz_attempts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    question_id     UUID REFERENCES quiz_questions(id),
    user_answer     TEXT NOT NULL,
    is_correct      BOOLEAN NOT NULL,
    attempted_at    TIMESTAMPTZ DEFAULT NOW(),
    time_taken_secs INT DEFAULT 0
);

-- Coding Problems
CREATE TABLE coding_problems (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id        UUID REFERENCES topics(id),
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT NOT NULL,
    difficulty      VARCHAR(20) NOT NULL,   -- 'easy','medium','hard'
    starter_code    JSONB,                  -- {java:'...', python:'...'}
    solution_code   JSONB,
    test_cases      JSONB NOT NULL,
    constraints     TEXT,
    hints           TEXT[],
    company_tags    TEXT[],
    time_complexity VARCHAR(100),
    space_complexity VARCHAR(100)
);

-- Code Submissions
CREATE TABLE code_submissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    problem_id      UUID REFERENCES coding_problems(id),
    language        VARCHAR(50) NOT NULL,
    code            TEXT NOT NULL,
    status          VARCHAR(50) NOT NULL,   -- 'accepted','wrong_answer','tle','mle','error'
    runtime_ms      INT,
    memory_kb       INT,
    passed_cases    INT DEFAULT 0,
    total_cases     INT DEFAULT 0,
    submitted_at    TIMESTAMPTZ DEFAULT NOW()
);

-- User Streaks
CREATE TABLE user_streaks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) UNIQUE,
    current_streak  INT DEFAULT 0,
    longest_streak  INT DEFAULT 0,
    last_activity   DATE,
    freeze_count    INT DEFAULT 1
);

-- AI Bot Sessions
CREATE TABLE ai_bot_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    topic_id        UUID REFERENCES topics(id),
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    total_messages  INT DEFAULT 0
);

CREATE TABLE ai_bot_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID REFERENCES ai_bot_sessions(id),
    role            VARCHAR(20) NOT NULL,   -- 'user','model'
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_topics_path     ON topics(path_id);
CREATE INDEX idx_topics_slug     ON topics(slug);
CREATE INDEX idx_topics_level    ON topics(level);
CREATE INDEX idx_lessons_topic   ON lessons(topic_id);
CREATE INDEX idx_progress_user   ON user_progress(user_id);
CREATE INDEX idx_submissions_user ON code_submissions(user_id);
CREATE INDEX idx_ai_session_user ON ai_bot_sessions(user_id);
```

### 6.2 OpenSearch Index Structure

```json
{
  "index": "devmastery_content",
  "mappings": {
    "properties": {
      "id":          { "type": "keyword" },
      "type":        { "type": "keyword" },
      "title":       { "type": "text", "analyzer": "english" },
      "description": { "type": "text", "analyzer": "english" },
      "content":     { "type": "text", "analyzer": "english" },
      "tags":        { "type": "keyword" },
      "path_slug":   { "type": "keyword" },
      "level":       { "type": "integer" },
      "popularity":  { "type": "float" }
    }
  }
}
```

> **Spring Boot OpenSearch config** — identical to Elasticsearch, just change the URL:
> ```yaml
> opensearch:
>   uris: http://localhost:9200
> # spring-data-elasticsearch client works with OpenSearch — same REST API
> ```

---

## 7. API Design Strategy

### 7.1 REST API Conventions
```
Base URL: https://api.devmastery.in/v1

GET    /paths                          — List all learning paths
GET    /paths/{slug}/topics            — Topics in a path
GET    /topics/{slug}                  — Full topic with lessons
GET    /topics/{slug}/lessons          — All lessons for topic
POST   /progress/topics/{id}/complete  — Mark topic complete
GET    /users/me/progress              — All user progress
POST   /code/execute                   — Execute code (Judge0 CE)
POST   /code/problems/{id}/submit      — Submit solution
GET    /quiz/topics/{id}/questions     — Quiz for a topic
POST   /quiz/attempt                   — Submit quiz answer
GET    /ai/sessions                    — Get AI bot sessions
POST   /ai/sessions                    — Start AI session
POST   /ai/sessions/{id}/messages      — Send message to AI bot
GET    /search?q=hashmap&type=topic    — Search via OpenSearch
```

### 7.2 WebSocket Events
```
Channel: /ws/code-execution/{submissionId}
  QUEUED     → { position: 3 }
  RUNNING    → {}
  COMPLETED  → { output, time_ms, memory_kb, status }
  ERROR      → { message }

Channel: /ws/ai-bot/{sessionId}
  AI_TYPING  → {}
  AI_CHUNK   → { text: "partial response chunk" }   (streaming SSE)
  AI_DONE    → {}
```

---

## 8. UI/UX Design System

### 8.1 Design Language: "Terminal Precision"
Dark-first, professional — like VS Code meets a premium learning platform.

```css
/* Color Tokens */
--bg-primary:       #0D1117;
--bg-surface:       #161B22;
--bg-elevated:      #21262D;
--border-default:   #30363D;
--text-primary:     #F0F6FC;
--text-secondary:   #8B949E;

/* Brand Accents */
--accent-java:      #F89820;
--accent-spring:    #6DB33F;
--accent-react:     #61DAFB;
--accent-angular:   #DD0031;
--accent-kotlin:    #7F52FF;
--accent-ai:        #4285F4;   /* Google blue — matches Gemini brand */

/* Semantic */
--success:          #3FB950;
--warning:          #D29922;
--error:            #F85149;

/* Typography */
--font-code:        'JetBrains Mono', monospace;
--font-display:     'Syne', sans-serif;
--font-body:        'DM Sans', sans-serif;
```

### 8.2 Page Layouts

**Topic Page:**
```
┌──────────────────────────────────────────────────────────┐
│  Breadcrumb: Java Mastery > Collections > HashMap        │
│  Progress: ████████░░ 80%                                │
├─────────────────────────────┬────────────────────────────┤
│  LESSON SECTIONS            │  CONTENT AREA              │
│  ○ Why                      │  [MDX rendered content]    │
│  ○ Theory                   │  [Visualizer component]    │
│  ● Code Lab       ←active   │  [Monaco Editor]           │
│  ○ Real World               │  [Test results]            │
│  ○ Interview Prep           │                            │
├─────────────────────────────┴────────────────────────────┤
│  ◄ Previous: LinkedList          Next: TreeMap ►         │
└──────────────────────────────────────────────────────────┘
│  AI Mentor Bot (Gemini — bottom drawer, expandable)       │
│  "Ask anything about HashMap..."                          │
└──────────────────────────────────────────────────────────┘
```

**DSA Visualizer:**
```
┌─────────────────────────────────────────────────────────┐
│  [Algorithm selector]  Speed: ●──○ 1x  [Step Mode]      │
├────────────────────────────────┬────────────────────────┤
│  D3.js VISUALIZATION CANVAS    │  CODE PANEL (Monaco)   │
│  (animated)                    │  line 12 highlighted   │
├────────────────────────────────┴────────────────────────┤
│  T(n): O(log n)  S(n): O(1)  Step: 3/7  [◄] [►]        │
├─────────────────────────────────────────────────────────┤
│  Step: "Comparing 42 with root 50. 42 < 50,             │
│  traversing LEFT subtree..."                             │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Android App Specification

### 9.1 App Architecture
```
com.devmastery.android
├── app/                   — Application class, Hilt DI setup
├── core/
│   ├── network/           — Retrofit, OkHttp, JWT interceptor
│   ├── database/          — Room DAOs, entities
│   ├── datastore/         — Preferences DataStore (user settings)
│   └── common/            — Extension functions, utils
├── features/
│   ├── auth/              — Google Sign-In + JWT
│   ├── dashboard/         — Home, progress overview, streak
│   ├── paths/             — Learning path browser
│   ├── topic/             — Full topic reader (6 sections)
│   ├── visualizer/        — DSA Canvas composables
│   ├── codelab/           — Code viewer + WebView execution
│   ├── quiz/              — Quiz + problem screens
│   ├── aibot/             — Gemini-powered chat screen
│   └── profile/           — User profile, radar chart, settings
└── ui/
    ├── theme/             — Material 3 color tokens
    └── components/        — Shared composables
```

### 9.2 Offline-First Strategy
```
On WIFI:   Pre-fetch next 3 topics, cache in Room
Offline:   Serve from Room; queue progress events locally
On sync:   WorkManager flushes event queue to server
Conflict:  Server wins for progress; local wins for AI drafts
```

### 9.3 Gemini Integration (Android)
```kotlin
// build.gradle.kts
implementation("com.google.ai.client.generativeai:generativeai:0.7.0")
// This is Google's official free Kotlin SDK for Gemini

// AiBotViewModel.kt
val generativeModel = GenerativeModel(
    modelName = "gemini-1.5-flash",
    apiKey = BuildConfig.GEMINI_API_KEY,  // from local.properties (not committed)
    generationConfig = generationConfig {
        temperature = 0.7f
        maxOutputTokens = 1024
    }
)

fun sendMessage(userMessage: String, topicContext: String) {
    viewModelScope.launch {
        val chat = generativeModel.startChat(history = sessionHistory)
        val response = chat.sendMessageStream(
            "$topicContext\n\nUser question: $userMessage"
        )
        response.collect { chunk ->
            _uiState.update { it.appendChunk(chunk.text ?: "") }
        }
    }
}
```

---

## 10. AI Bot Architecture (Gemini — Free)

### 10.1 System Prompt Design
```
You are DevMentor, an expert programming teacher in the DevMastery learning platform.
Currently helping a user studying: {current_topic}
Their skill level is: {user_level} (1=beginner, 5=expert)

Teaching rules:
1. NEVER give one-line answers. Explain everything in depth.
2. Match explanation depth to skill level. Beginners get analogies. Experts get internals.
3. Always include a runnable code example for any technical concept.
4. When debugging: explain WHY the error occurred, not just how to fix it.
5. For interview questions: give structured answers (Approach → Code → Complexity → Edge Cases).
6. Always mention time/space complexity for any algorithm discussion.
7. For design questions: constraints → capacity estimates → components → trade-offs.

Topic context: {topic_content_summary}
User recent progress: {progress_summary}
```

### 10.2 AI Bot Modes
| Mode | Trigger phrase | Behavior |
|---|---|---|
| Doubt Resolver | "Explain...", "I don't understand..." | Deep explanation with analogies |
| Code Debugger | User pastes code with error | Line-by-line debug walkthrough |
| Quiz Generator | "Test me on..." | Adaptive questions for current topic |
| Mock Interviewer | "Interview me on..." | Strict interviewer role |
| Code Reviewer | After code submission | Review time/space/style |
| Concept Explainer | "What is...", "How does..." | Layered explanation |

### 10.3 Gemini API Integration (Spring Boot)

```java
// ai-bot-service — GeminiApiClient.java
@Component
public class GeminiApiClient {

    private static final String BASE_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent";

    @Value("${gemini.api.key}")
    private String apiKey;

    private final WebClient webClient;

    public Flux<String> streamChat(String systemPrompt, List<GeminiMessage> history, String userMessage) {
        var requestBody = GeminiRequest.builder()
            .systemInstruction(new SystemInstruction(systemPrompt))
            .contents(buildContents(history, userMessage))
            .generationConfig(GenerationConfig.builder()
                .temperature(0.7f)
                .maxOutputTokens(1024)
                .build())
            .build();

        return webClient.post()
            .uri(BASE_URL + "?key=" + apiKey + "&alt=sse")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToFlux(String.class)
            .map(this::extractTextChunk)
            .filter(StringUtils::hasText);
    }
}
```

```yaml
# application.yml
gemini:
  api:
    key: ${GEMINI_API_KEY}      # from HashiCorp Vault / env var
  rate-limit:
    free-tier-daily: 1000       # daily message limit per user (well within Gemini free quota)
    requests-per-minute: 15     # match Gemini free tier RPM
```

### 10.4 Context Window Management
```
System prompt:           ~800 tokens
Topic context summary:   ~400 tokens
Last 20 messages:        ~4000 tokens
Current page content:    ~800 tokens
────────────────────────────────────
Total per request:       ~6000 tokens  (well within Gemini 1.5-flash 1M context)

Summarization trigger:   At message 25, summarize older messages into 200-token
                         session memory, reset message window
```

### 10.5 Daily Free Token Budget
```
Gemini free tier: 1,000,000 tokens/day
Per conversation (avg):  ~500 tokens input + 500 output = ~1,000 tokens
Daily capacity:          ~1,000 full conversations per day free

For a new platform with 100-500 daily active users: completely free.
Scales cost-free until you hit ~1,000 simultaneous power users.
```

---

## 11. DevOps & Infrastructure (100% Free)

### 11.1 Production Hosting: Oracle Cloud Always Free

Oracle provides this VM permanently free — no credit card charge, no expiry:
```
Instance: VM.Standard.A1.Flex (ARM Ampere)
OCPU:     4
RAM:      24 GB
Storage:  200 GB
Network:  10 TB/month outbound (more than enough for a learning app)
IP:       1 free public IP

Sign up: cloud.oracle.com → "Always Free" tier
```

### 11.2 Docker Compose Production Setup
```yaml
# docker-compose.prod.yml (runs on Oracle Cloud free VM)
version: "3.9"

services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - certbot-certs:/etc/letsencrypt
    depends_on: [api-gateway]

  certbot:
    image: certbot/certbot
    volumes:
      - certbot-certs:/etc/letsencrypt
    command: certonly --webroot --webroot-path=/var/www/html
             --email your@email.com -d devmastery.in --non-interactive --agree-tos

  api-gateway:
    build: ./services/api-gateway
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - VAULT_ADDR=http://vault:8200

  content-service:
    build: ./services/content-service

  auth-service:
    build: ./services/auth-service

  code-execution-service:
    build: ./services/code-execution-service
    privileged: true   # required for Judge0 sandbox

  ai-bot-service:
    build: ./services/ai-bot-service
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}

  postgres:
    image: postgres:16-alpine
    volumes: [postgres-data:/var/lib/postgresql/data]
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

  valkey:
    image: valkey/valkey:7-alpine
    volumes: [valkey-data:/data]
    command: valkey-server --appendonly yes

  opensearch:
    image: opensearchproject/opensearch:2.13.0
    environment:
      - discovery.type=single-node
      - DISABLE_SECURITY_PLUGIN=true   # OK for internal-only access
      - "OPENSEARCH_JAVA_OPTS=-Xms1g -Xmx2g"
    volumes: [opensearch-data:/usr/share/opensearch/data]

  kafka:
    image: apache/kafka:3.7.0
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
    volumes: [kafka-data:/var/lib/kafka/data]

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes: [minio-data:/data]
    ports: ["9000:9000", "9001:9001"]

  vault:
    image: hashicorp/vault:1.17
    cap_add: [IPC_LOCK]
    volumes: [vault-data:/vault/data]
    command: server -config=/vault/config/vault.hcl

  prometheus:
    image: prom/prometheus:latest
    volumes: [./prometheus.yml:/etc/prometheus/prometheus.yml]

  grafana:
    image: grafana/grafana:latest
    volumes: [grafana-data:/var/lib/grafana]
    ports: ["3001:3000"]

  glitchtip:
    image: glitchtip/glitchtip:latest   # free open source Sentry
    environment:
      DATABASE_URL: postgresql://postgres:5432/glitchtip
    ports: ["8010:8000"]

  judge0-server:
    image: judge0/judge0:latest
    ports: ["2358:2358"]
    environment:
      REDIS_URL: redis://valkey:6379
      POSTGRES_URL: postgresql://postgres:5432/judge0

  judge0-workers:
    image: judge0/judge0:latest
    command: ["./scripts/workers"]
    privileged: true

volumes:
  postgres-data:
  valkey-data:
  opensearch-data:
  kafka-data:
  minio-data:
  vault-data:
  grafana-data:
  certbot-certs:
```

### 11.3 CI/CD Pipeline (GitHub Actions — Free)
```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '21', distribution: 'temurin' }
      - name: Run tests
        run: ./gradlew test jacocoTestReport
      - name: SonarQube scan
        run: ./gradlew sonar
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: http://your-sonarqube-instance   # self-hosted free

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker images
        run: docker compose build

      - name: Deploy to Oracle Cloud
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.ORACLE_HOST }}
          username: ubuntu
          key: ${{ secrets.ORACLE_SSH_KEY }}
          script: |
            cd /app/devmastery
            git pull origin main
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml up -d --no-downtime
```

### 11.4 Free SSL Certificate (Let's Encrypt + Certbot)
```bash
# On Oracle Cloud VM — one command to get free SSL:
docker run --rm -v certbot-certs:/etc/letsencrypt certbot/certbot \
  certonly --standalone -d devmastery.in -d www.devmastery.in \
  --email your@email.com --agree-tos --non-interactive

# Auto-renewal cron (runs every 60 days):
0 0 1 * * docker run --rm certbot/certbot renew && docker restart nginx
```

### 11.5 Cost Summary
```
Oracle Cloud Always Free VM:    ₹0/month  (4 OCPU, 24GB RAM, 200GB)
Gemini API (free tier):         ₹0/month  (1M tokens/day)
Cloudflare Free CDN:            ₹0/month
GitHub Actions (public repo):   ₹0/month
Let's Encrypt SSL:              ₹0/month
Firebase FCM (push):            ₹0/month
Domain name devmastery.in:      ~₹800/year (Namecheap/GoDaddy — the only cost)
────────────────────────────────────────────────────────────
Total monthly operating cost:   ₹0
Total annual cost:              ~₹800 (domain only)
```

---

## 12. Project Phases & Milestones

### Phase 0 — Foundation (Weeks 1–3)
- [ ] Monorepo setup (Turborepo — free, MIT)
- [ ] Docker Compose local dev environment (all services)
- [ ] PostgreSQL schema (Flyway V1–V5 migrations)
- [ ] Auth service (JWT + Google OAuth2)
- [ ] API Gateway (Spring Cloud Gateway)
- [ ] GitHub Actions CI/CD pipeline
- [ ] Next.js 14 scaffold + shadcn/ui + Tailwind design tokens
- [ ] Oracle Cloud Always Free VM provisioned

### Phase 1 — MVP Content (Weeks 4–8)
- [ ] Content service + MDX rendering
- [ ] 3 complete learning paths (Java Core, DSA, Spring Boot)
- [ ] 20 topics fully authored across 6 layers
- [ ] DSA Visualizer (10 algorithms, D3.js)
- [ ] Progress tracking (Valkey + PostgreSQL)
- [ ] Gemini AI Bot (Doubt Resolver mode)

### Phase 2 — Code Lab + Quiz (Weeks 9–12)
- [ ] Monaco Editor integration
- [ ] Judge0 CE self-hosted setup
- [ ] 50 coding problems with test cases
- [ ] Quiz engine (MCQ + fill-in)
- [ ] Streak system + XP gamification
- [ ] OpenSearch full-text search

### Phase 3 — Android App (Weeks 13–18)
- [ ] Android project (Kotlin + Compose)
- [ ] Auth, Dashboard, Topic Reader
- [ ] Offline-first (Room + WorkManager)
- [ ] DSA Visualizer (Canvas composables)
- [ ] Gemini AI Bot chat screen
- [ ] FCM push notifications (free Spark plan)

### Phase 4 — Advanced Modules (Weeks 19–24)
- [ ] System Design module
- [ ] Mock Interview mode (Gemini as interviewer)
- [ ] Real-time projects (5 guided projects)
- [ ] Certificate generation (iText Community — free)
- [ ] Admin CMS for content management

### Phase 5 — Scale & Polish (Weeks 25–28)
- [ ] Performance tuning (sub-200ms API P99)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] GlitchTip error tracking setup
- [ ] Grafana dashboards for monitoring
- [ ] Play Store deployment ($25 one-time registration)
- [ ] Beta launch with 100 users

---

## 13. Antigravity Agent Prompts — Module by Module

> All prompts updated to use the 100% free stack:
> Valkey instead of Redis, OpenSearch instead of Elasticsearch,
> Gemini API instead of Claude API, Judge0 CE self-hosted instead of RapidAPI.

---

### PROMPT 01 — PostgreSQL Schema Migration (Flyway)

```
You are an expert Java/Spring Boot engineer. Create Flyway migration scripts for the DevMastery platform.

CONTEXT:
- Spring Boot 3.2 + Hibernate 6 + Flyway Community Edition 9 (Apache 2.0 — free)
- PostgreSQL 16
- Row-level multi-tenancy (user_id FK isolation — no schema-per-tenant needed here)
- Location: src/main/resources/db/migration/
- Pattern: V{n}__{description}.sql

CREATE THESE MIGRATION FILES:

V1__create_users_and_paths.sql
  - users (id UUID PK DEFAULT gen_random_uuid(), email UNIQUE, name, avatar_url, auth_provider, subscription DEFAULT 'free', created_at, updated_at)
  - learning_paths (id, slug UNIQUE, title, description, level_min INT, level_max INT, order_index, is_active BOOLEAN DEFAULT TRUE)
  - Indexes: users(email), learning_paths(slug)

V2__create_topics_and_lessons.sql
  - topics (id, path_id FK→learning_paths, slug UNIQUE, title, description, level INT CHECK(1-5), estimated_mins, order_index, has_visualizer, has_code_lab, is_published, tags TEXT[], created_at)
  - lessons (id, topic_id FK→topics, section_type VARCHAR(50), title, content_mdx TEXT NOT NULL, order_index, estimated_mins DEFAULT 5)
  - code_examples (id, topic_id FK, lesson_id FK, language, level INT CHECK(1-5), title, code TEXT, explanation, time_complexity, space_complexity, is_runnable BOOLEAN DEFAULT TRUE)
  - Indexes: topics(path_id), topics(slug), topics(level), lessons(topic_id)

V3__create_progress_tracking.sql
  - user_progress (id, user_id FK→users, topic_id FK→topics, status VARCHAR(50) DEFAULT 'not_started', completion_pct INT DEFAULT 0, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, xp_earned INT DEFAULT 0)
  - UNIQUE(user_id, topic_id)
  - lesson_completions (id, user_id FK, lesson_id FK, completed_at TIMESTAMPTZ DEFAULT NOW(), time_spent_secs INT DEFAULT 0)
  - UNIQUE(user_id, lesson_id)

V4__create_quiz_and_problems.sql
  - quiz_questions (id, topic_id FK, question_type VARCHAR(50), question_text TEXT, options JSONB, correct_answer TEXT, explanation TEXT NOT NULL, difficulty INT CHECK(1-5), company_tags TEXT[], topic_tags TEXT[])
  - quiz_attempts (id, user_id FK, question_id FK, user_answer TEXT, is_correct BOOLEAN, attempted_at TIMESTAMPTZ DEFAULT NOW(), time_taken_secs INT DEFAULT 0)
  - coding_problems (id, topic_id FK, title, slug UNIQUE, description TEXT, difficulty VARCHAR(20), starter_code JSONB, solution_code JSONB, test_cases JSONB NOT NULL, constraints TEXT, hints TEXT[], company_tags TEXT[], time_complexity, space_complexity)
  - code_submissions (id, user_id FK, problem_id FK, language VARCHAR(50), code TEXT, status VARCHAR(50), runtime_ms INT, memory_kb INT, passed_cases INT DEFAULT 0, total_cases INT DEFAULT 0, submitted_at TIMESTAMPTZ DEFAULT NOW())

V5__create_ai_and_gamification.sql
  - ai_bot_sessions (id, user_id FK, topic_id FK, started_at TIMESTAMPTZ DEFAULT NOW(), ended_at TIMESTAMPTZ, total_messages INT DEFAULT 0)
  - ai_bot_messages (id, session_id FK→ai_bot_sessions, role VARCHAR(20), content TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())
  - user_streaks (id, user_id FK UNIQUE, current_streak INT DEFAULT 0, longest_streak INT DEFAULT 0, last_activity DATE, freeze_count INT DEFAULT 1)

REQUIREMENTS:
- All IDs: UUID DEFAULT gen_random_uuid()
- All timestamps: TIMESTAMPTZ DEFAULT NOW()
- No Hibernate DDL auto (spring.jpa.hibernate.ddl-auto=validate)
- SQL comments on each table explaining its purpose
- Check constraints where specified
```

---

### PROMPT 02 — Content Service (Spring Boot + Valkey Cache)

```
You are an expert Spring Boot 3.2 developer. Build the content-service microservice for DevMastery.
Stack: Java 21, Spring Boot 3.2, Spring Data JPA, Flyway, Valkey (via spring-data-redis — same client works), Lombok, MapStruct.

PROJECT STRUCTURE:
src/main/java/com/devmastery/content/
  ├── ContentServiceApplication.java
  ├── config/         (CacheConfig, SecurityConfig, OpenApiConfig)
  ├── controller/     (PathController, TopicController, LessonController)
  ├── service/        (PathService, TopicService, LessonService)
  ├── cache/          (TopicCacheLoader — dedicated @Component for @Cacheable, avoids AOP proxy bypass)
  ├── repository/     (LearningPathRepository, TopicRepository, LessonRepository)
  ├── entity/         (LearningPath, Topic, Lesson, CodeExample)
  ├── dto/            (PathResponse, TopicResponse, LessonResponse — Java records)
  ├── mapper/         (MapStruct mappers)
  └── exception/      (GlobalExceptionHandler, TopicNotFoundException)

IMPLEMENT:

1. LearningPath entity + PathController
   - GET /v1/paths — list all active paths (ordered by order_index)
   - GET /v1/paths/{slug} — path details + paginated topics (20 per page)

2. Topic entity + TopicController
   - GET /v1/topics — list with filters: pathSlug, level, hasVisualizer, isPublished (Pageable)
   - GET /v1/topics/{slug} — full topic with all lessons and code examples

3. Caching with Valkey:
   Cache names: "devmastery:content:topics" (TTL 24h), "devmastery:content:lesson:{id}" (TTL 6h)

   CRITICAL PATTERN — avoid Spring AOP self-invocation proxy bypass:
   Create TopicCacheLoader.java as a separate @Component:
   
   @Component
   public class TopicCacheLoader {
       @Autowired private TopicRepository topicRepository;
       
       @Cacheable(value = "devmastery:content:lesson", key = "#slug")
       public Topic loadTopic(String slug) {
           return topicRepository.findBySlug(slug)
               .orElseThrow(() -> new TopicNotFoundException(slug));
       }
   }
   
   TopicService then calls topicCacheLoader.loadTopic(slug) — NOT this.loadTopic(slug).
   This guarantees the Spring proxy intercepts the call and @Cacheable fires correctly.

4. CacheConfig.java:
   - spring.cache.type=redis (spring-data-redis works with Valkey — identical protocol)
   - spring.data.redis.host=${VALKEY_HOST:localhost}
   - spring.data.redis.port=${VALKEY_PORT:6379}
   - TTL config via RedisCacheConfiguration beans per cache name

5. application.yml:
   spring:
     cache:
       type: redis
     data:
       redis:
         host: ${VALKEY_HOST:localhost}
         port: ${VALKEY_PORT:6379}
     jpa:
       hibernate:
         ddl-auto: validate
     flyway:
       enabled: true
       locations: classpath:db/migration

SONARQUBE COMPLIANCE (your existing rules):
   - No log-and-throw S2139: catch and log OR throw, never both
   - No Serializable transient S1948: DTOs are records (not Serializable), entities don't implement Serializable
   - All @RequiredArgsConstructor (Lombok) — no @Autowired
   - GlobalExceptionHandler returns: { "error": "TOPIC_NOT_FOUND", "message": "...", "timestamp": "..." }
```

---

### PROMPT 03 — DSA Visualizer (Next.js 14 + D3.js)

```
You are an expert Next.js 14 / TypeScript / D3.js developer. Build the DSA Visualizer module.

TECH: Next.js 14 App Router, TypeScript 5, D3.js v7 (free ISC), Framer Motion 11 (free MIT), Tailwind CSS, shadcn/ui, Monaco Editor (free MIT).

CREATE:

1. /app/visualizer/page.tsx
   - Algorithm category cards grid: Arrays, Linked Lists, Trees, Graphs, Sorting, Searching, DP, Hashing
   - URL routing: /visualizer?algo=bst&input=50,30,70,20,40

2. /components/visualizer/VisualizerShell.tsx
   - Canvas (left 60%) + synchronized code panel (right 40%)
   - Controls: Speed slider 0.25x–4x, Step mode toggle, Play/Pause/Reset buttons
   - Complexity badges: T(n) and S(n) — update per step
   - Step explanation panel (plain English description of what's happening)

3. /components/visualizer/algorithms/BSTVisualizer.tsx
   - D3 tree layout rendering BST nodes
   - Animated insert: highlight path, show comparison at each node with color change
   - Animated search: same traversal highlighting
   - Animated delete: 3 cases shown (leaf, one child, two children)
   - Custom input: user types comma-separated numbers → visualizer rebuilds

4. /components/visualizer/algorithms/SortingVisualizer.tsx
   - Bar chart for Bubble, Selection, Insertion, Merge, Quick Sort
   - Colors: comparing=yellow (#D29922), swapping=red (#F85149), sorted=green (#3FB950)
   - Step-by-step shows array state snapshot

5. /hooks/useVisualizerEngine.ts
   - useVisualizerEngine(algorithm, inputData, speed)
   - Returns: { currentStep, totalSteps, stepExplanation, isPlaying, play, pause, stepForward, stepBack, reset }
   - Generates ALL steps upfront on input change (useMemo)
   - Animation: requestAnimationFrame loop, interval adjusted by speed multiplier

6. /lib/visualizer/bst.ts
   - Pure TypeScript: generateBSTSteps(values: number[]): VisualizerStep[]
   - Each step: { nodeStates: Map<number, NodeState>, highlightedLines: number[], explanation: string, complexity: ComplexityInfo }
   - NodeState: 'default' | 'comparing' | 'visiting' | 'found' | 'inserted'
   - NO DOM manipulation — pure data

DESIGN (dark theme — matches design system):
   - bg-[#0D1117] canvas background
   - Nodes: circle r=20, fill #161B22, stroke per NodeState, JetBrains Mono font
   - Smooth D3 transitions: 300ms ease for step mode
   - Monaco: readOnly=true, theme='vs-dark', current line highlighted (decorations API)
   - Mobile (<768px): stack canvas and code vertically
```

---

### PROMPT 04 — Code Execution Service (Spring Boot + Judge0 CE Self-Hosted)

```
You are an expert Spring Boot 3.2 developer. Build the code-execution-service.
Judge0 CE is self-hosted (Apache 2.0) — no API key needed, unlimited executions free.

IMPLEMENT:

1. Judge0Client.java (WebClient-based)
   URL: http://judge0-server:2358 (internal Docker network — no external API)
   - POST /submissions?wait=false → { token }
   - GET /submissions/{token} → { stdout, stderr, status, time, memory, compile_output }
   - Language IDs map: Java=62, JavaScript=63, Python=71, Kotlin=78, SQL=82, TypeScript=74

2. CodeExecutionService.java
   - executeCode(ExecuteRequest req): ExecuteResponse
   - Cache key: SHA-256 hash of (language + code + stdin) → Valkey key "devmastery:code:exec:{hash}", TTL 5 min
   - On cache miss: submit to Judge0 CE, poll every 500ms (max 20 attempts), cache+return result
   - Response: { stdout, stderr, status, executionTimeMs, memoryKb, compilationError }

3. CodeSubmissionService.java
   - submitSolution(SubmitRequest req): SubmissionResult
   - Run code against ALL test cases (visible + hidden) sequentially
   - Compare stdout.trim() vs expectedOutput.trim()
   - Result: { status, passedCases, totalCases, failedTestCase, runtimeMs }
   - Save to code_submissions table

4. ExecutionController.java
   - POST /v1/execute — run arbitrary code (rate limit: 10/min per user)
   - POST /v1/problems/{id}/submit — submit solution
   - userId extracted from JWT SecurityContext — never from request body

5. WebSocket status events (Spring WebSocket STOMP):
   /topic/execution/{submissionId}
   Events: QUEUED → RUNNING → COMPLETED | ERROR

6. @Async execution (Spring TaskExecutor):
   - Judge0 polling runs in @Async thread pool (not blocking main thread)
   - ThreadPoolTaskExecutor: corePoolSize=5, maxPoolSize=20, queueCapacity=100

7. Resilience4j circuit breaker on Judge0Client:
   - failureRateThreshold=50, waitDurationInOpenState=30s
   - Fallback: throw CodeExecutionUnavailableException

8. application.yml:
   judge0:
     base-url: ${JUDGE0_BASE_URL:http://judge0-server:2358}
     poll-interval-ms: 500
     max-poll-attempts: 20
     timeout-seconds: 15

   valkey:
     host: ${VALKEY_HOST:localhost}
     port: ${VALKEY_PORT:6379}

CONSTRAINTS:
   - NO external API calls outside docker network — Judge0 CE is self-hosted
   - Never log user code content
   - Execution timeout hard limit: 15 seconds
```

---

### PROMPT 05 — AI Bot Service (Spring Boot + Google Gemini API Free)

```
You are an expert Spring Boot 3.2 developer. Build the ai-bot-service using Google Gemini API (free tier).

Gemini free tier (gemini-1.5-flash): 15 RPM, 1,000,000 tokens/day — sufficient for launch.
API endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent
No SDK needed — plain WebClient POST with JSON.

IMPLEMENT:

1. GeminiApiClient.java (Spring WebClient)
   Request format:
   {
     "system_instruction": { "parts": [{ "text": "{systemPrompt}" }] },
     "contents": [
       { "role": "user", "parts": [{ "text": "..." }] },
       { "role": "model", "parts": [{ "text": "..." }] }
     ],
     "generationConfig": {
       "temperature": 0.7,
       "maxOutputTokens": 1024
     }
   }
   
   NOTE: Gemini uses role="model" for assistant (not "assistant" like OpenAI/Claude).
   
   Streaming: add ?key={apiKey}&alt=sse to URL → returns Server-Sent Events
   Each SSE event: JSON with candidates[0].content.parts[0].text containing text chunk
   
   Method: Flux<String> streamChat(String apiKey, GeminiRequest request)

2. SystemPromptBuilder.java
   - buildSystemPrompt(String topicTitle, String topicSummary, int userLevel, String userName): String
   - Template with teaching rules (depth-matched to userLevel)
   - Keep under 800 tokens to maximize context for conversation history

3. BotSessionService.java
   - createSession(UUID userId, UUID topicId): AiBotSession
   - addMessage(UUID sessionId, String role, String content): AiBotMessage
   - getSessionHistory(UUID sessionId): last 20 messages as List<GeminiMessage>
   - summarizeSession(UUID sessionId): call Gemini to summarize when messages > 20

4. AiBotController.java
   - POST /v1/ai/sessions — create session
   - POST /v1/ai/sessions/{id}/messages — send message, return SSE stream
   - GET /v1/ai/sessions/{id}/history — return message list

5. SSE Streaming endpoint:
   @PostMapping(value = "/v1/ai/sessions/{id}/messages",
                produces = MediaType.TEXT_EVENT_STREAM_VALUE)
   public Flux<ServerSentEvent<String>> sendMessage(
           @PathVariable UUID id,
           @RequestBody MessageRequest request,
           Authentication auth) {
       UUID userId = extractUserId(auth);
       checkRateLimit(userId);  // Valkey counter
       
       return geminiApiClient
           .streamChat(apiKey, buildRequest(id, request, userId))
           .map(chunk -> ServerSentEvent.<String>builder()
               .data("{\"chunk\":\"" + escapeJson(chunk) + "\",\"done\":false}")
               .build())
           .concatWith(Mono.just(
               ServerSentEvent.<String>builder()
                   .data("{\"chunk\":\"\",\"done\":true}")
                   .build()))
           .doOnComplete(() -> saveAssembledResponse(id));
   }

6. Rate limiting (Valkey):
   Key: "devmastery:ai:ratelimit:{userId}:{date}"
   Free users: 100 messages/day (stays well within Gemini 1M token/day limit)
   When exceeded: 429 response { "error": "DAILY_LIMIT_REACHED", "resetAt": "2024-xx-xx" }

7. Topic context injection:
   - Call content-service internally: GET http://content-service:8082/v1/topics/{slug}/summary
   - Cache summary in Valkey: "devmastery:ai:context:{topicSlug}", TTL 1h
   - Inject into system prompt for each session

8. application.yml:
   gemini:
     api:
       key: ${GEMINI_API_KEY}
       base-url: https://generativelanguage.googleapis.com/v1beta
       model: gemini-1.5-flash
       max-output-tokens: 1024
       temperature: 0.7
   ai-bot:
     daily-message-limit: 100
     session-idle-timeout-minutes: 30
     context-window-messages: 20

IMPORTANT: GEMINI_API_KEY loaded from HashiCorp Vault (free self-hosted) via Spring Cloud Vault.
Never commit API key to git. Never log it.
```

---

### PROMPT 06 — Next.js Topic Page (Full Interactive UI)

```
You are an expert Next.js 14 / TypeScript developer. Build the Topic learning page for DevMastery.

TECH: Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query v5, Framer Motion 11, MDX, Monaco Editor (all free MIT/Apache).

FILES TO CREATE:

1. /app/learn/[pathSlug]/[topicSlug]/page.tsx (Server Component shell)
   - Fetches topic metadata for SEO (generateMetadata)
   - Suspense boundary wrapping TopicPage client component

2. /components/topic/TopicPage.tsx (Client Component)
   Layout:
   - Left sidebar (240px): LessonNav with 6 section items + completion rings
   - Main content (flex-1): renders current section
   - Right panel (collapsible 320px): GeminiAiBotDrawer
   - Bottom bar: previous/next topic navigation
   - State via useTopicStore (Zustand)

3. LessonNav.tsx
   - 6 sections: Why, Theory, Visualization, Code Lab, Real World, Interview
   - Each: icon (Lucide — free MIT), title, estimated minutes, checkmark when complete
   - Active = highlighted with var(--accent-java) = #F89820 left border
   - Interview section locked until Code Lab complete (padlock icon)

4. CodeLabSection.tsx (Monaco Editor + Judge0 CE)
   - react-monaco-editor, language selector, level selector (Beginner/Intermediate/Advanced)
   - Run button → POST /api/code/execute → output panel
   - Output: stdout, stderr, execution time, memory
   - "Explain My Code" → opens AI bot with code pre-filled as context
   - "View Solution" locked until 2 attempts
   - Diff mode: user code ↔ optimal solution side by side

5. GeminiAiBotDrawer.tsx
   - Collapsible drawer: right side desktop, bottom sheet mobile
   - SSE streaming: EventSource to /api/ai/sessions/{id}/messages
   - Render chunks as they stream in (append to message)
   - Mode selector: [Doubt Resolver] [Debug Code] [Test Me] [Interview]
   - Topic context sent automatically from useTopicStore

6. useTopicProgress.ts
   - Tracks time per section (starts timer on mount)
   - POST /api/progress/lessons/{id}/complete on completion
   - Debounced 5s to avoid excessive API calls

7. useCodeExecution.ts
   - executeCode(code, language): Promise<ExecutionResult>
   - 30s timeout, loading/error states
   - Cache last result in sessionStorage by code hash

DESIGN (matches design system):
   - bg-[#0D1117] page, bg-[#161B22] surface cards
   - JetBrains Mono for all code, DM Sans for prose
   - Framer Motion: section transitions fade + translateY(8px)
   - Completion animation: confetti on all 6 sections complete (canvas-confetti — free MIT)
```

---

### PROMPT 07 — Android: Topic Reader (Jetpack Compose + Gemini SDK)

```
You are an expert Android / Kotlin / Jetpack Compose developer. Build the Topic Reader screen.

TECH: Kotlin 2, Jetpack Compose Material 3, Hilt, Retrofit 2, Room, Coroutines + Flow,
      Google Generative AI SDK for Kotlin (free — com.google.ai.client.generativeai:generativeai:0.7.0)

IMPLEMENT:

1. TopicReaderViewModel.kt (Hilt ViewModel)
   - topicState: StateFlow<UiState<TopicDetail>>
   - currentSection: StateFlow<SectionType> — enum: WHY, THEORY, VISUAL, CODE, REALWORLD, INTERVIEW
   - completedSections: StateFlow<Set<SectionType>>
   - loadTopic(slug: String) — Room first, then API if stale (>1h)
   - markSectionComplete(section: SectionType) — Room save + API queue

2. TopicReaderScreen.kt
   - Scaffold + TopAppBar (title, back, bookmark icon from Material Icons free)
   - HorizontalPager for 6 sections (swipe left/right)
   - Bottom tab row: 6 dots with completion indication
   - Each page: separate @Composable per SectionType

3. VisualizerSectionPage.kt (Custom Canvas)
   BSTCanvas composable:
   - Canvas{} with drawCircle, drawLine, drawIntoCanvas for node+edge rendering
   - AnimationSpec: tween(durationMillis=300) for highlight transitions
   - rememberCoroutineScope + animateFloatAsState for smooth color interpolation
   - Controls Row: Play/Pause FAB, StepForward/StepBack IconButtons, Speed BottomSheet

4. CodeLabSectionPage.kt
   - WebView loading Monaco Editor from local assets (offline-capable)
   - Assets: app/src/main/assets/monaco/index.html + editor JS bundle
   - JavascriptInterface: AppBridge.onCodeChanged(code), AppBridge.runCode()
   - Run → POST to /v1/execute API → BottomSheet: stdout, status badge, runtime

5. AiBotSheet.kt (Gemini SDK — completely free)
   import com.google.ai.client.generativeai.GenerativeModel
   import com.google.ai.client.generativeai.type.generationConfig

   val model = GenerativeModel(
       modelName = "gemini-1.5-flash",
       apiKey = BuildConfig.GEMINI_API_KEY,  // from local.properties
       generationConfig = generationConfig {
           temperature = 0.7f
           maxOutputTokens = 1024
       }
   )
   
   val chat = model.startChat(history = chatHistory)
   
   // Streaming:
   chat.sendMessageStream(userMessage).collect { chunk ->
       _messages.update { list -> list.updateLast(it + (chunk.text ?: "")) }
   }
   
   UI: LazyColumn (chat messages) + TextField + Send IconButton
   Streaming renders chunks as they arrive (character-by-character feel)

6. Room entities: TopicEntity, LessonEntity, UserProgressEntity, AiBotCacheEntity
7. WorkManager: SyncProgressWorker (WIFI + NOT_LOW_BATTERY constraints)
8. Offline banner: ConnectivityObserver (StateFlow<Boolean>) → show "Offline — showing cached content"

CONSTRAINTS:
   - All colors: MaterialTheme.colorScheme tokens — no hardcoded hex
   - No API calls in Composables — all in ViewModel
   - Target SDK 34, min SDK 26
   - GEMINI_API_KEY in local.properties (gitignored), accessed via BuildConfig
```

---

### PROMPT 08 — Quiz Engine (Full Stack — Free)

```
You are a full-stack Java/Next.js developer. Build the Quiz Engine for DevMastery.

BACKEND (quiz-service, Spring Boot 3.2, all free):

1. QuizQuestion entity + JPA repository
   Filter: topicId, difficulty, questionType, companyTag
   Randomization: Spring Data Pageable with native query ORDER BY RANDOM() LIMIT ?

2. QuizSessionService
   - startSession(userId, topicId, count=10): creates QuizSession in DB
   - getNextQuestion(sessionId): unanswered question from session
   - submitAnswer(sessionId, questionId, answer): validate, save QuizAttempt
     Return: { isCorrect: boolean, explanation: String, correctAnswer: String }
   - completeSession(sessionId): calculates score, XP = score * 10, saves to user_progress

3. Adaptive difficulty:
   - Query quiz_attempts for user+topic: compute accuracy = correct/total
   - accuracy > 80% → next session difficulty + 1 (max 5)
   - accuracy < 40% → next session difficulty - 1 (min 1)
   - Store in Valkey: "devmastery:quiz:difficulty:{userId}:{topicId}", TTL 7 days

4. QuizController
   POST /v1/quiz/sessions           — start session
   GET  /v1/quiz/sessions/{id}/next — next question
   POST /v1/quiz/sessions/{id}/answers — submit answer
   GET  /v1/quiz/sessions/{id}/results — final results + breakdown

FRONTEND (Next.js 14, all free):

5. /app/quiz/[topicSlug]/page.tsx
   - QuizCard: question text + 4 MCQ options (A/B/C/D keyboard shortcuts)
   - Timer: 60-second countdown per question (auto-submit on 0)
   - Progress bar: "Question 3 of 10"
   - After submit: show explanation + correct answer highlighted (green)
   - Cannot go back to previous questions

6. /app/quiz/[topicSlug]/results/page.tsx
   - Score card: X/10 correct, XP earned, time taken
   - Question-by-question breakdown: user answer | correct answer | explanation
   - "Study weak topics" — links to lessons where user scored < 50%
   - "Try Again" → new randomized session

7. useQuizSession.ts (TanStack Query)
   - Manages session lifecycle via mutations
   - Timer countdown via useEffect + setInterval
   - Warns on page navigation with beforeunload event
   - Auto-submits if timer reaches 0
```

---

### PROMPT 09 — System Design Module

```
You are an expert developer and technical writer. Build the System Design module for DevMastery.

CONTENT: Create TypeScript content objects for 3 complete system design case studies.

1. "Design a URL Shortener"
   6 layers:
   - WHY: "Understanding why URL shortening requires distributed systems thinking from the start"
   - THEORY: Functional requirements (shorten URL, redirect, analytics), Non-functional (100M URLs/day, <10ms redirect, 99.99% uptime)
   - VISUAL: Mermaid DSL for: Client → Cloudflare CDN → Load Balancer → App Servers → Valkey Cache → PostgreSQL
   - CODE:
     Level 2 (beginner): Simple HashMap in-memory shortener in Java
     Level 4 (advanced): Distributed Base62 shortener, Valkey cache-aside, PostgreSQL persistence, Spring Boot
   - REAL WORLD: How Bitly, TinyURL handle this; counter-based vs hash-based approaches
   - INTERVIEW: "What if we need 100 billion URLs?", "How to handle custom aliases?", "How to implement analytics without slowing down redirects?"

2. "Design a Distributed Cache (Valkey/Redis-like)"
   - Include: consistent hashing ring visualization, LRU eviction algorithm, replication lag handling

3. "Design a Notification System"
   - Kafka for async delivery, retry queues, push + email + SMS channels, rate limiting per user

FRONTEND COMPONENTS:

4. CapacityEstimator.tsx (React, no external deps — pure TypeScript math)
   Inputs: DAU (slider), Read:Write ratio (slider), Avg payload size (input), Retention days (input)
   Outputs (live calculations):
   - Reads per second = (DAU × daily_reads) / 86400
   - Writes per second = (DAU × daily_writes) / 86400
   - Storage per year = writes_per_day × payload_size × 365 (in GB/TB)
   - Bandwidth = (reads/s + writes/s) × payload_size (in Mbps)
   Show calculation formula below each result (educational)

5. MermaidDiagram.tsx
   - Dynamic import: import('mermaid') with ssr: false
   - Render diagram from string prop
   - Dark theme: mermaid.initialize({ theme: 'dark', themeVariables: { background: '#0D1117' } })

6. RequirementsWorkshop.tsx (Interactive)
   - Step 1: User clicks which requirements they would ask (functional/non-functional checklist)
   - Step 2: System reveals which requirements are correct/missed with explanations
   - Step 3: Capacity calculator pre-fills with chosen requirements
   Teaches students HOW to gather requirements in system design interviews

CONSTRAINTS:
   - Mermaid.js: dynamic import only (ssr: false) — prevents hydration errors
   - CapacityEstimator: pure math in TypeScript, Math.round() all displayed numbers
   - No react-flow dependency (keep bundle small)
```

---

### PROMPT 10 — Admin CMS + Deployment Config

```
You are a full-stack developer. Build the Admin CMS and complete Docker deployment config for DevMastery.

PART A — Admin CMS (Next.js 14):
Access: /admin (middleware checks role=ADMIN in JWT, redirects /login if not)

1. /admin/topics — DataTable (title, path, level, published, edit/delete actions)
2. /admin/topics/new and /admin/topics/[id]/edit
   - MDX editor: Monaco (left pane) + live MDX preview (right pane, @mdx-js/react)
   - Tab per section type: WHY, THEORY, VISUAL, CODE, REALWORLD, INTERVIEW
   - has_visualizer toggle → select component from dropdown
   - Auto-save draft every 30s (debounced PUT)
   - Save Draft / Publish buttons

3. /admin/problems — Problem editor with test case runner
   - Run test cases against solution via Judge0 CE (self-hosted — free)
   - Shows pass/fail per test case before publishing

4. /admin/analytics — Recharts dashboard (free MIT)
   - Line chart: Daily active users (7-day)
   - Bar chart: Topic completion rates (top 20)
   - Pie chart: AI bot query categories
   - All data from PostgreSQL aggregation queries via admin API

BACKEND admin endpoints (content-service):
   @PreAuthorize("hasRole('ADMIN')")
   POST  /admin/topics
   PUT   /admin/topics/{id}
   POST  /admin/topics/{id}/publish
   DELETE /admin/topics/{id}
   GET   /admin/analytics/summary

PART B — Complete Docker Compose for Local Dev (free, runs on your ASUS TUF A15):

Create docker-compose.dev.yml with:
   - postgres:16-alpine          port 5432
   - valkey/valkey:7-alpine      port 6379   (NOT redis — use valkey image)
   - opensearchproject/opensearch:2.13.0  port 9200  (NOT elasticsearch)
   - apache/kafka:3.7.0          port 9092
   - judge0/judge0 (server)      port 2358   (self-hosted, free, Apache 2.0)
   - judge0/judge0 (workers)     privileged: true
   - minio/minio:latest          port 9000 (S3-compatible, free AGPL)
   - hashicorp/vault:1.17        port 8200
   - prom/prometheus:latest      port 9090
   - grafana/grafana:latest      port 3001

Include:
   - .env.dev.example with all required env vars (no real values — placeholders only)
   - health checks on postgres, valkey, opensearch
   - depends_on with condition: service_healthy
   - Named volumes for all persistent data
   - Single command to start everything: docker compose -f docker-compose.dev.yml up -d

PART C — Environment Variables Reference:
   POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
   VALKEY_HOST, VALKEY_PORT
   OPENSEARCH_HOST, OPENSEARCH_PORT
   KAFKA_BOOTSTRAP_SERVERS
   JUDGE0_BASE_URL=http://judge0-server:2358
   MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY
   GEMINI_API_KEY          ← get free from aistudio.google.com/app/apikey
   JWT_SECRET
   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET   ← Google OAuth2 (free)

NOTE: GEMINI_API_KEY goes in local.properties (Android) and .env.local (Next.js) — both gitignored.
Never commit API keys.
```

---

*End of DevMastery Project Specification v2.0 — 100% Free Stack*

---

**Document Info**
- Version: 2.0 — Free Stack Edition
- Updated: May 2026
- Changes from v1.0: Valkey replaces Redis, OpenSearch replaces Elasticsearch, Gemini free API replaces Claude API, Judge0 CE self-hosted replaces RapidAPI, MinIO replaces AWS S3, K3s + Oracle Cloud replaces AWS EKS, GlitchTip replaces Sentry
- Annual cost: ~₹800 (domain name only)
- 10 complete Antigravity Agent Prompts — ready to paste
