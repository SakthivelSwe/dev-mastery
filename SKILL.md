# DevMastery — Agent Skill File (SKILL.md)

> **HOW TO USE:** Drag this file into any new chat session.  
> Then type just the path name, e.g. `spring-boot` or `dsa` — the agent will automatically generate all missing sections and import to Supabase.
>
> **🔁 AUTO-CONTINUE RULE (critical):** When the user names a path, the agent processes **ALL batches autonomously** without asking "continue?" between batches. The agent only produces a final summary AFTER the path is fully imported and audited. See [📦 BATCHING STRATEGY](#-batching-strategy-mandatory-for-paths--6-topics).

---

## 🗂️ Project Location

```
C:\AI projects\dev-mastery
```

**Tech Stack:** Next.js (App Router) · Android (Kotlin) · Spring Boot services · Supabase (PostgreSQL)  
**Content path:** `apps/web/content/<path-slug>/`

---

## 🔌 Database Connection

```
postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

**Key tables:** `learning_paths` · `topics` · `lessons` (9 rows per topic when complete)

---

## 📁 Content Directory Status

```
apps/web/content/
  ├── angular/               (33)  ✅ complete
  ├── api-design/            (21)  ✅ complete
  ├── css/                   (30)  ✅ complete
  ├── design-system/         (29)  ✅ complete
  ├── docker/                (22)  ✅ complete
  ├── microservices/         (28)  ✅ complete
  ├── dsa/                   (54)  ✅ complete
  ├── full-stack/            (93)  ✅ complete
  ├── git-github/            (29)  ✅ complete
  ├── html/                  (17)  ✅ complete
  ├── java-mastery/          (68)  ✅ complete
  ├── javascript/            (42)  ✅ complete (GFG-depth)
  ├── kubernetes/            (27)  ✅ complete
  ├── leetcode-patterns/     (38)  ✅ complete (all 30 canonical patterns)
  ├── mongodb/               (16)  ✅ complete
  ├── nextjs/                (29)  ✅ complete
  ├── postgresql-dba/        (22)  ✅ complete
  ├── react/                 (31)  ✅ complete (GFG-depth)
  ├── software-architecture/ (19)  ✅ complete
  ├── spring-boot/           (34)  ✅ complete
  ├── sql/                   (27)  ✅ complete
  ├── system-design/         (32)  ✅ complete
  └── typescript/            (21)  ✅ complete (GFG-depth)
```

> Run `node scripts/auditAllPaths.js` for live status.

---

## 📋 The 9-Section Schema

Every `.mdx` file MUST have all 9 sections with **exact headings** in this order:

| # | Heading | DB type | Minimum depth |
|---|---------|---------|---------------|
| 1 | `## WHY` | `why` | 3-4 paragraphs: problem → solution → failure mode |
| 2 | `## THEORY` | `theory` | Full internals + **Mermaid/ASCII diagram** (mandatory) |
| 3 | `## VISUALIZATION_CONFIG` | `visual` | JSON with correct component + state key |
| 4 | `## CODE` | `code` | **4 levels**: Beginner → Intermediate → Advanced → Expert |
| 5 | `## REAL_WORLD` | `realworld` | Named company + production code + gotchas |
| 6 | `## INTERVIEW` | `interview` | **5-7 Q&A pairs** with full answers, Junior→Senior |
| 7 | `## FEYNMAN CHECK` | `feynman` | Real analogy + **5 deep Q&As** with full answers |
| 8 | `## BUILD` | `build` | Named mini-project: setup → implement → test → output |
| 9 | `## SPACED REVIEW` | `spacedreview` | **12 questions** across Day 1/3/7/14 |

### MDX Frontmatter
```mdx
---
slug: "topic-slug"
title: "Human Readable Title"
level: 2
---
```

---

## 🔬 SECTION-BY-SECTION DEPTH STANDARDS

### 1️⃣ WHY Section — Motivation & Real Pain (min 200 words)

**Must contain:**
- **Paragraph 1:** The specific PROBLEM that existed before this concept/tool — what developers had to do manually, what was fragile, what failed in production
- **Paragraph 2:** How this topic ELIMINATES that pain — what you no longer write, what the runtime/compiler now handles
- **Paragraph 3:** The real failure mode — what actually breaks in production at scale when this is ignored or misused (specific incident type, not vague)
- **Closing:** Why senior engineers must understand this — tied directly to the failure mode above

**DO NOT:** Write a single sentence. DO NOT say "it's important because it makes code reusable" without explaining WHY that matters.

---

### 2️⃣ THEORY Section — Internals + Diagrams (MOST CRITICAL — min 400 words)

**MANDATORY: Every THEORY section MUST include at least ONE visual diagram.**

#### 🔷 Mermaid Diagrams (use inside MDX code fences)

**Flowchart** — for processes, algorithms, request handling, decision flows:
````markdown
```mermaid
flowchart TD
    A[Client HTTP Request] --> B{JWT Valid?}
    B -->|Yes| C[Extract Claims]
    B -->|No| D[401 Unauthorized]
    C --> E{Role Check}
    E -->|Authorized| F[Route Handler]
    E -->|Forbidden| G[403 Forbidden]
    F --> H[Business Logic Layer]
    H --> I[(Database)]
    I --> J[Build Response]
    J --> K[Client]
```
````

**Sequence Diagram** — for request/response, auth flows, microservice calls:
````markdown
```mermaid
sequenceDiagram
    participant C as Client
    participant AG as API Gateway
    participant Auth as Auth Service
    participant S as Business Service
    participant DB as Database

    C->>AG: POST /api/order {token, body}
    AG->>Auth: validate_token(token)
    Auth-->>AG: {userId: 42, role: "user"}
    AG->>S: createOrder(userId=42, body)
    S->>DB: INSERT INTO orders ...
    DB-->>S: orderId=1001
    S-->>AG: {orderId: 1001, status: "pending"}
    AG-->>C: 201 Created {orderId: 1001}
```
````

**Class Diagram** — for OOP, design patterns, inheritance hierarchies:
````markdown
```mermaid
classDiagram
    class Shape {
        <<abstract>>
        #double x
        #double y
        +area() double*
        +perimeter() double*
        +move(dx, dy) void
    }
    class Circle {
        -double radius
        +area() double
        +perimeter() double
    }
    class Rectangle {
        -double width
        -double height
        +area() double
        +perimeter() double
    }
    Shape <|-- Circle
    Shape <|-- Rectangle
```
````

**State Diagram** — for lifecycles, state machines, promise states:
````markdown
```mermaid
stateDiagram-v2
    [*] --> Pending : new Promise()
    Pending --> Fulfilled : resolve(value)
    Pending --> Rejected : reject(error)
    Fulfilled --> [*]
    Rejected --> [*]

    note right of Pending
        Only state that
        can transition
    end note
```
````

**ER Diagram** — for databases, data modelling:
````markdown
```mermaid
erDiagram
    USER ||--o{ ORDER : "places"
    ORDER ||--|{ ORDER_LINE : "contains"
    PRODUCT ||--o{ ORDER_LINE : "in"

    USER {
        int id PK
        string email UK
        string password_hash
        timestamp created_at
    }
    ORDER {
        int id PK
        int user_id FK
        string status
        decimal total
        timestamp created_at
    }
```
````

**Git Graph** — for git topics:
````markdown
```mermaid
gitGraph
    commit id: "Initial commit"
    branch feature/auth
    checkout feature/auth
    commit id: "Add JWT middleware"
    commit id: "Add refresh tokens"
    checkout main
    branch hotfix/sql-injection
    commit id: "Sanitize inputs"
    checkout main
    merge hotfix/sql-injection id: "Security fix"
    merge feature/auth id: "Merge auth PR #47"
```
````

#### 🔷 ASCII Diagrams — for memory layouts, stack frames, internals

Use when you need to show memory layout, byte structure, or internal data representations:

```
## THEORY

### JavaScript Event Loop — Internal Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    JAVASCRIPT RUNTIME                        │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │   CALL STACK    │    │         HEAP MEMORY           │   │
│  │                 │    │                              │   │
│  │  fetchData()    │    │  {user: {id:1, name:"Alice"}} │   │
│  │  processJSON()  │    │  [1, 2, 3, 4, 5]             │   │
│  │  main()         │    │  function() {...}             │   │
│  └─────────────────┘    └──────────────────────────────┘   │
│           │                                                  │
│           ▼ When call stack empties...                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  EVENT LOOP                          │   │
│  │                                                     │   │
│  │  1. Check Microtask Queue (Promises)                │   │
│  │     ├── Drain ALL microtasks first                  │   │
│  │     └── [.then() cb] [.then() cb] [queueMicrotask] │   │
│  │                                                     │   │
│  │  2. Check Macrotask Queue (1 task per loop tick)    │   │
│  │     └── [setTimeout] [setInterval] [I/O cb]        │   │
│  │                                                     │   │
│  │  3. Browser: render frame (requestAnimationFrame)   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```
```

**THEORY section must also contain:**
1. **Step-by-step internal breakdown** — numbered steps of what actually happens at the runtime/OS/compiler level
2. **Comparison table** — key variations side by side (e.g., `var` vs `let` vs `const`)
3. **Common misconception** — "Most developers think X but actually Y because Z"
4. **Edge cases** — surprising behaviours, spec vs browser differences

---

### 3️⃣ VISUALIZATION_CONFIG — Select the Most Informative Component

**The diagram must show HOW it works internally, not just WHAT it is.**

```markdown
## VISUALIZATION_CONFIG

```json
{ "component": "COMPONENT_NAME", "state": "path-slug-topic-slug" }
```
```

**Component → What the diagram should show:**

| Component | Shows | Example state |
|-----------|-------|---------------|
| `FlowChart` | Internal process flow, decision trees, algorithm steps | `"js-event-loop-flow"` |
| `SequenceDiagram` | Time-ordered interactions between systems | `"spring-request-lifecycle"` |
| `UmlClassDiagram` | Class hierarchy, relationships, interface contracts | `"abstract-vs-interface"` |
| `StateMachine` | State transitions, lifecycle stages | `"promise-states"` |
| `NetworkDiagram` | Infrastructure topology, service mesh | `"kubernetes-pod-scheduling"` |
| `DatabaseSchema` | Table structure, relationships, ERD | `"sql-join-types"` |
| `TreeVisualization` | Tree/graph data structure states | `"dsa-bst-insert"` |
| `ConceptMap` | Conceptual relationships, architecture overview | `"system-design-caching-layers"` |
| `GitGraph` | Commit history, branch operations | `"git-rebase-vs-merge"` |
| `MemoryDiagram` | Heap/stack layout, GC roots | `"js-closure-memory"` |
| `CodeRunner` | Live code execution with output | `"js-closures"` |

---

### 4️⃣ CODE Section — MANDATORY 4 Progressive Levels

**Every CODE section MUST have exactly 4 numbered levels. Each level is complete and runnable.**

```markdown
## CODE

### Level 1 — Beginner: [Specific Descriptive Subtitle]
[15-25 lines]
[EVERY non-trivial line has a comment explaining WHY, not what]
[Uses only the most basic form of the concept]
[Student can copy-paste and it runs]

### Level 2 — Intermediate: [Specific Descriptive Subtitle]
[35-60 lines]
[Real pattern — actually useful in a project]
[Shows the concept solving a realistic problem]
[Introduces one layer of complexity: error handling OR generics OR async]

### Level 3 — Advanced: [Specific Descriptive Subtitle]
[60-100 lines]
[Production pattern: full error handling + edge cases + composability]
[Could appear verbatim in a real codebase]
[References a well-known library's approach]

### Level 4 — Expert / Production: [Specific Descriptive Subtitle]
[100+ lines — complete, self-contained module]
[Includes: all error handling, types/docs, tests, performance notes]
[Shows how this concept is used inside a real framework/library]
[Zero TODO stubs — every line is implemented]
```

**Non-negotiable rules:**
- ✅ Real variable names: `userRepository`, `jwtService`, `paymentGateway`
- ✅ Real import paths: `import { useState } from 'react'`
- ✅ Comments on every non-obvious line explaining the WHY
- ✅ Level 4 is fully runnable — paste into a file and execute
- ❌ `foo`, `bar`, `x`, `y`, `doSomething()`, `handleData()` — never
- ❌ `// ... rest of code` — always show the complete implementation
- ❌ `// TODO: implement` — never leave stubs

---

### 5️⃣ REAL_WORLD Section — Named Production Context

**Must contain ALL of these:**

1. **Named company/framework usage** — "Netflix uses X", "React's useState relies on Y internally"
2. **Production code pattern** — 25-50 lines, realistic, not a toy
3. **Production gotcha** — specific bug with wrong code ❌ and fixed code ✅
4. **Performance table** — time/space complexity table for the topic's operations

```markdown
## REAL_WORLD

### How [Named Company/Framework] Uses [TOPIC]
[2-3 paragraphs explaining the specific production context — what problem they had,
how this concept solved it, what would break without it at their scale]

```language
// Production pattern — [company/framework] [version]
// Context: [what this code does in their system]
[25-50 lines of production-pattern code with real naming]
```

### Production Gotcha: [Specific Bug Name]
This is the #1 production bug caused by misunderstanding [TOPIC]:

```language
// ❌ DANGEROUS — breaks under [specific condition]
[buggy code with comment explaining the race condition / memory leak / etc.]

// ✅ PRODUCTION-SAFE — fix and explanation
[corrected code]
```
**Why it happens:** [2-3 sentence explanation of the root cause]

### Performance Characteristics
| Operation | Time | Space | Notes |
|-----------|------|-------|-------|
| [Op 1] | O(1) | O(1) | [when/why] |
| [Op 2] | O(n) | O(n) | [when/why] |
| [Op 3] | O(log n) | O(1) | [when/why] |
```

---

### 6️⃣ INTERVIEW Section — 5-7 Q&A Pairs (Full Answers Required)

**Every answer MUST be 3+ sentences. One-liner answers are a rejection.**

```markdown
## INTERVIEW

**Q1 (Junior): [Definition or basic syntax question]**
A: [3-5 sentence answer. Cover what it is, how it works, and one non-obvious internal detail 
that separates a junior from a mid-level engineer. End with a practical consequence.]

**Q2 (Junior): [Common beginner confusion — what most people get wrong]**
A: [Address the misconception directly. Include a before/after code example.]

```language
// ❌ Common mistake
[wrong code]

// ✅ Correct approach
[right code]
```

**Q3 (Mid): [How it works internally / mechanism]**
A: [Explain what happens at the runtime/compiler/OS level. Not just what the API does, 
but what the engine does when you call it. Use specific terminology.]

**Q4 (Mid): [Compare/contrast with the closest related concept]**
A: [Structured comparison with real use-case examples for each. Include when each is the 
better choice and the performance/semantic difference.]

**Q5 (Senior): [Design pattern or architecture question]**
A: [Demonstrates understanding of the concept at system design level. References a pattern 
by name, explains the trade-off, and gives a production context.]

**Q6 (Senior): [Edge case or footgun]**
A: [Specific edge case that bites experienced developers. Code showing the bug and the fix.]

**Q7 (Senior+): [Large-scale or framework-internals question]**
A: [Shows understanding of how this concept behaves at 10x scale — caching, consistency, 
distributed concerns, or deep framework internals.]
```

---

### 7️⃣ FEYNMAN CHECK — Real Analogy + 5 Full Q&As

```markdown
## FEYNMAN CHECK

### Explain [TOPIC] Like I'm 10 Years Old
> [3-4 sentences with ONE specific, memorable analogy unique to this topic.
>  Must mention at least ONE non-obvious internal detail (not just the surface behaviour).
>  End with "This is why [specific real developer problem] happens."]

---

### 5 Deep Conceptual Questions

**Q1: What problem does [TOPIC] fundamentally solve, and why couldn't you solve it another way?**
> **A:** [3-5 sentences. Cover the mechanism, not just the purpose. Be specific about what 
>   the runtime or compiler does differently because of this concept.]

**Q2: What is the ONE mental model that makes everything about [TOPIC] click into place?**
> **A:** [The single insight that makes the tricky parts obvious. Be specific and concrete —
>   not "it's like a box" but a precise operational model.]

**Q3: What is the most dangerous misconception about [TOPIC]? Show it with code.**
> **A:** [Name the misconception. Show the bug it causes. Show the fix.]
> ```language
> // ❌ Based on the misconception
> [wrong code]
> 
> // ✅ Based on the correct mental model
> [right code]
> ```

**Q4: How does [TOPIC] interact with [most directly related adjacent concept] at the runtime level?**
> **A:** [Explain the interaction at the memory/execution level — what actually happens in 
>   the heap, call stack, or event queue when these two interact.]

**Q5: Write a one-sentence definition of [TOPIC] that a senior engineer at a FAANG company 
would find technically precise.**
> **A:** "[TOPIC] is [precise definition that captures: WHAT it is + HOW the mechanism works 
>   + WHY it produces the observable behaviour] — which is why [non-obvious consequence]."
```

---

### 8️⃣ BUILD Section — Complete, Runnable Mini-Project

```markdown
## BUILD

### 🏗️ Mini Project: [Specific Descriptive Project Name — not generic]

**What you will build:** [1-2 sentences describing the final runnable artifact]  
**Why this project:** [What specific internals of [TOPIC] this project forces you to understand]  
**Time estimate:** [15-60 minutes]

---

#### Step 1 — Project Setup
```bash
# Exact commands to initialize — no ambiguity
mkdir [project-name] && cd [project-name]
[exact setup commands]
touch [exact filenames]
```

#### Step 2 — Core Implementation
```language
// [Description of what this implements]
// Complete, runnable code — every non-trivial line commented
// 30-60 lines
[full implementation]
```

#### Step 3 — [Next Feature — adds the interesting part of the topic]
```language
// [What new concept this step introduces]
[complete code]
```

#### Step 4 — Error Handling & Edge Cases (always required)
```language
// Handle: null/undefined inputs, boundary conditions, concurrent access, etc.
[error handling code]
```

#### Step 5 — Tests
```language
// Minimal but real: verify core behaviour, not implementation details
// Each test has: Arrange, Act, Assert
[5-10 concrete tests]
```

**Expected Output:**
```
[Exact console output when the complete project runs correctly]
```

**Stretch Challenges:**
- [ ] [Challenge 1: significant complexity increase]
- [ ] [Challenge 2: adds a production concern — performance, concurrency, types]
- [ ] [Challenge 3: connects this topic to the next topic in the learning path]
```

---

### 9️⃣ SPACED REVIEW — 12 Questions Across 4 Days

```markdown
## SPACED REVIEW

> **How to use:** Answer each question from memory before reading ahead.  
> Reviewing at Day 1 → 3 → 7 → 14 intervals follows the Ebbinghaus forgetting curve 
> and locks concepts into long-term memory.

---

### Day 1 — Recall (immediately after learning)

**Q1:** Define [TOPIC] in one sentence that includes: (1) what it IS, (2) HOW the mechanism works, 
and (3) WHEN you need it. No IDE, from memory.

**Q2:** What are the two most critical properties of [TOPIC]? Explain what BREAKS in production 
if you misunderstand either one.

**Q3:** Write a 10-line code snippet demonstrating the most fundamental use of [TOPIC] — 
something that would pass a junior-level interview question. No autocomplete.

---

### Day 3 — Comprehension

**Q4:** What is the difference between [TOPIC] and [closest related concept]? Give one 
production scenario where choosing the wrong one causes a bug.

**Q5:** Describe the most common production bug caused by misusing [TOPIC]. Write both 
the broken version and the correct version.

**Q6:** Refactor this code to use [TOPIC] correctly:
```language
// Naive version — has a flaw related to [TOPIC]
[15-20 line example with a specific flaw]
```

---

### Day 7 — Application

**Q7:** Build [SPECIFIC SMALL THING] from scratch using only [TOPIC] — no libraries.  
Your implementation must handle at least [2-3 edge cases].

**Q8:** You are reviewing a PR. The code works in tests but you know it will cause a 
[specific production problem] at scale due to a [TOPIC] misuse. Describe the bug, 
the failure mode at scale, and the fix.

**Q9:** What is the time and space complexity of [TOPIC]'s core operation? Under what 
conditions does it degrade? How would you fix the degraded case?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Classic interview question: "[Most commonly asked TOPIC interview question 
phrased exactly as an interviewer would ask it at a FAANG company]"  
Give the complete answer you would say in an interview.

**Q11:** Draw the dependency graph: how does [TOPIC] relate to [3 other concepts in this 
learning path]? Which must you understand first? Which does [TOPIC] enable?

**Q12:** ★ System design: "You are designing [a relevant large-scale system]. 
How does [TOPIC] affect your architecture at 10 million users? 
What breaks first? What do you add to fix it?"
```

---

## 🚫 Content Anti-Patterns — NEVER DO THESE

### ❌ Vague one-liners
```
❌ "Closures are an important JavaScript concept."
✅ "A closure is a function that retains a LIVE REFERENCE (not a copy) to the variables
    in its enclosing scope — this is why the V8 garbage collector cannot reclaim those
    variables even after the outer function returns."
```

### ❌ Generic code examples
```
❌ function add(a, b) { return a + b; }  // "here's a simple example"
✅ Level 1 — Beginner: Counter factory using closures for data privacy
   [20+ lines, every line commented, demonstrates WHY closures are needed]
```

### ❌ Unnamed real-world references
```
❌ "Used by many large companies in production."
✅ "React's useState hook internally uses closures — each component call gets its 
    own closure over a slot in React's internal hooks array, which is why the rules 
    of hooks (don't call inside conditionals) exist: the slot index must be stable 
    across re-renders."
```

### ❌ Shallow interview answers
```
❌ Q: What is dependency injection? A: It's a design pattern.
✅ Q: What is dependency injection?
   A: Dependency injection is when an object receives its dependencies from an external
   source rather than constructing them itself, inverting the control of object creation
   (hence 'IoC — Inversion of Control'). The practical benefit is testability: in a test
   you inject a mock database instead of a real one, changing one line instead of
   restructuring the class. Spring's @Autowired, Angular's constructor injection, 
   and React's Context API are all DI implementations. The key trade-off: DI frameworks
   add startup overhead and can obscure the dependency graph — at Google scale, 
   tools like Dagger use compile-time DI to avoid this.
```

### ❌ Placeholder content
```
❌ "> [TOPIC] works by [mechanism step 1]. It operates on [core abstraction]."
✅ "> A Promise is a proxy for a value that doesn't exist yet — the JS engine stores 
   > the pending work in the microtask queue, which drains completely after every 
   > macrotask and before the next browser paint. This is why Promise callbacks always 
   > fire before setTimeout callbacks even at delay=0."
```

---

## ✅ Complete Section Depth Checklist

Verify every box before marking a section complete:

**WHY**
- [ ] Describes the pre-existing pain problem (not just "it's useful")
- [ ] Names the production failure mode
- [ ] Minimum 200 words

**THEORY**
- [ ] Has ≥1 Mermaid or ASCII diagram showing internal mechanism
- [ ] Has numbered step-by-step internal breakdown
- [ ] Has a comparison table (variations side-by-side)
- [ ] Addresses the most common misconception
- [ ] Minimum 400 words

**VISUALIZATION_CONFIG**
- [ ] Component is the most informative for this specific topic
- [ ] State key follows `"path-topic"` format

**CODE**
- [ ] Has exactly 4 levels (Beginner, Intermediate, Advanced, Expert/Production)
- [ ] Level 4 is ≥100 lines, fully runnable
- [ ] Every non-trivial line has a comment
- [ ] No `foo/bar/doThing` names
- [ ] No truncations or TODO stubs

**REAL_WORLD**
- [ ] Names a specific company, framework, or open-source project
- [ ] Production code pattern (25-50 lines, realistic naming)
- [ ] Has a "Production Gotcha" with ❌ wrong and ✅ fixed code
- [ ] Performance characteristics table

**INTERVIEW**
- [ ] Has 5-7 questions (not 2-3)
- [ ] Has Junior, Mid, AND Senior level questions
- [ ] Every answer is ≥3 sentences
- [ ] ≥2 answers include code snippets
- [ ] No one-liner answers

**FEYNMAN CHECK**
- [ ] Analogy is unique to this specific topic (not generic)
- [ ] Has 5 deep questions with full paragraph answers
- [ ] Q3 includes wrong vs right code example
- [ ] Zero placeholders

**BUILD**
- [ ] Has a named project (not "Build a utility")
- [ ] Step 1 = setup with real shell commands
- [ ] Step 4 = error handling (mandatory)
- [ ] Step 5 = tests (mandatory)
- [ ] Has "Expected Output" section
- [ ] All code is fully runnable

**SPACED REVIEW**
- [ ] Has 12 questions (3 per day × 4 days)
- [ ] Day 14 questions are interview/architecture grade
- [ ] ≥2 questions include a code snippet in the question itself

---

## 🔧 Available Scripts

| Script | Purpose | Command |
|--------|---------|---------|
| `auditAllPaths.js` | Section coverage for ALL 22 paths | `node scripts/auditAllPaths.js` |
| `writeSections.js` | Apply content module to MDX files | `node scripts/writeSections.js <path>` |
| `addMissingSections.js` | Add placeholder sections (fallback only) | `node scripts/addMissingSections.js <path>` |
| `importContentDirect.js` | Import MDX to Supabase | `node scripts/importContentDirect.js <path>` |
| `check_frontend.js` | Verify frontend section counts in DB | `node scripts/check_frontend.js` |

**Content modules:** `scripts/content/<path>-content.js`

---

## 🚀 Workflow — When User Types a Path Name

1. `node scripts/auditAllPaths.js` — identify exactly what is missing
2. `Get-ChildItem "apps\web\content\<path>" -Filter "*.mdx"` — list all topic filenames
3. Create `scripts/content/<path>-content.js` following ALL depth standards above
4. `node scripts/writeSections.js <path>`
5. `node scripts/importContentDirect.js <path>`
6. `node scripts/auditAllPaths.js` — confirm ✅

---

## 📦 BATCHING STRATEGY (MANDATORY for paths > 6 topics)

> **Why batching matters:** Generating SKILL.md-depth content for many topics in a single response causes the agent to time out, lose context, or produce shallow content. Batches of 5 keep each turn fast, focused, and high-quality.

### Batch Size Rules

| Total topics in path | Batches | Topics per batch |
|---------------------|---------|------------------|
| 1–6 | 1 batch | all in one turn |
| 7–10 | 2 batches | 5 + remainder |
| 11–20 | 3–4 batches | 5 per batch |
| 21–40 | 5–8 batches | 5 per batch |
| 41–60 | 9–12 batches | 5 per batch |
| 60+ | split into 5-topic batches | 5 per batch |

**Hard limit:** never put more than **5 topics** in a single `create_file` or `replace_string_in_file` call.

### The Batched Workflow — AUTO-CONTINUE (no user confirmation between batches)

> **CRITICAL RULE:** Once the user names a path, the agent processes **ALL batches autonomously in a single conversation turn loop** — *without* asking "should I continue?" between batches. The agent only stops when ALL batches are written AND the final import + audit are complete.

For a path with N topics (where N > 6):

#### Step 1 — Setup (first action only)
1. Run `node scripts/auditAllPaths.js` — confirm what is missing
2. Run `Get-ChildItem "apps\web\content\<path>" -Filter "*.mdx"` — list all N topics
3. **Announce the full plan once** (single brief message): *"Processing <path> in M batches of 5. Will auto-continue through all batches then import."*
4. Immediately proceed to Step 2 — do NOT wait for user input

#### Step 2 — Write Batch 1 (create_file)
- `create_file` with only the first 5 topics + closing `};`
- Immediately proceed to Step 3 in the same response if context allows, OR continue in the next assistant turn **without prompting the user**

#### Step 3 — Append Batches 2..M (replace_string_in_file)
- For EACH subsequent batch, use `replace_string_in_file`:
  - `oldString`: last 3-5 lines including closing `};`
  - `newString`: `},` + 5 new topic objects + `};`
- **Do not summarise progress between batches.** Just chain the tool calls.
- **Do not ask "continue?"** — the user has already authorised the entire path by naming it.
- If a single response cannot hold all remaining batches due to length, end the response with the LAST tool call still pending (no closing summary) — the system will auto-continue on the next agent turn without user prompt.

#### Step 4 — Apply & Import (after final batch)
1. `node -e "const c=require('./scripts/content/<path>-content.js'); console.log('Topics:', Object.keys(c).length)"` — verify count matches N
2. `node scripts/writeSections.js <path>`
3. `node scripts/importContentDirect.js <path>`
4. `node scripts/auditAllPaths.js` — confirm ✅ for the path
5. Update SKILL.md status table
6. **Now (and only now)** give the user a final summary message.

#### Token / Length Management
- If approaching response size limits mid-batch-sequence, **end the response cleanly between batches** (after a complete `replace_string_in_file` call) — do NOT write a "should I continue?" question.
- The next turn must resume with the next batch immediately. Treat any user message after a batch (even "ok", "continue", or empty) as the trigger to keep going to completion.
- If the user explicitly says "stop" or "pause", then stop. Otherwise: **keep going until the path is fully imported and audited.**

### Why exactly 5 (not 10 or 3)

- **5 topics × ~250 lines per topic = ~1250 lines** per tool call — fits comfortably in a single edit without truncation
- Each topic requires: feynman (5 deep Q&As) + build (5 steps with full code) + 12 spaced-review questions — roughly 200-300 lines
- 5 keeps the agent focused on one cohesive sub-theme (e.g., "DSA arrays batch", "DSA trees batch", "DSA graphs batch")
- Lower than 5 wastes turns on overhead; higher than 5 risks timeouts and shallow content

### Example: HTML (17 topics) → 4 batches

| Batch | Topics |
|-------|--------|
| 1 | html-intro, semantic-elements, text-elements, html-attributes, forms-html |
| 2 | form-validation, accessibility-html, links-and-images, list-elements, tables |
| 3 | meta-tags-and-seo, internationalization, html5-apis, template-slot, web-components |
| 4 | performance-html, pwa-manifest *(only 2 — that's fine, it's the remainder)* |

After batch 4, run `writeSections.js html` + `importContentDirect.js html` in one final turn.

### Example: DSA (54 topics) → 11 batches

| Batch | Topics |
|-------|--------|
| 1–11 | 5 topics each (last batch has 4) |

Group batches by **theme** when possible (arrays → linked-lists → stacks/queues → trees → graphs → DP → sorting) so each batch produces consistent, cohesive content.

### Example: full-stack (93 topics) → 19 batches

For paths this large, additionally:
- Announce the **full batch plan** in Turn 1 so the user can track progress
- After every 4 batches, run a mid-progress audit: `node -e "const c=require('./scripts/content/<path>-content.js'); console.log(Object.keys(c).length, '/', 93)"`
- Save and import incrementally if the user prefers — `writeSections.js` skips topics not yet in the content module

### Anti-patterns (DO NOT DO)

❌ Trying to write 17 topics in one `create_file` call — timeouts, truncation, shallow content  
❌ **Asking "should I continue?" between batches** — the user has already authorised the full path; auto-continue until done  
❌ **Writing a progress summary after every batch** — wastes tokens, slows completion; only summarise at the very end  
❌ Running `writeSections.js` after every batch — wastes turns; do it ONCE at the end  
❌ Skipping the brief plan announcement in the first response — user needs to see total batch count once  
❌ Combining 2 paths' batches in one turn — keep each path's batches sequential  
❌ Stopping mid-path because "the response is getting long" — instead, end the response after a clean batch boundary and resume immediately on the next turn without asking

---

**Content module format:**
```javascript
module.exports = {
  'topic-slug': {
    // Only add 'visual' if VISUALIZATION_CONFIG is missing in the MDX file
    visual: `## VISUALIZATION_CONFIG\n\n\`\`\`json\n{ "component": "FlowChart", "state": "path-topic-slug" }\n\`\`\``,

    feynman: `## FEYNMAN CHECK\n\n### Explain [Topic] Like I'm 10 Years Old\n> [3-4 sentence specific analogy. Non-obvious internal detail. End with real dev problem.]\n\n---\n\n### 5 Deep Conceptual Questions\n\n**Q1: ...**\n> **A:** [Full paragraph answer]\n\n**Q2: ...**\n> **A:** [Full paragraph answer]\n...`,

    build: `## BUILD\n\n### 🏗️ Mini Project: [Specific Named Project]\n\n**What you will build:** ...\n**Why this project:** ...\n\n---\n\n#### Step 1 — Setup\n\`\`\`bash\n[exact commands]\n\`\`\`\n\n#### Step 2 — Core Implementation\n\`\`\`language\n[complete 30-60 line implementation]\n\`\`\`\n\n#### Step 4 — Error Handling\n\`\`\`language\n[error handling]\n\`\`\`\n\n#### Step 5 — Tests\n\`\`\`language\n[tests]\n\`\`\`\n\n**Expected Output:**\n\`\`\`\n[exact output]\n\`\`\``,

    spacedReview: `## SPACED REVIEW\n\n### Day 1 — Recall\n\n**Q1:** ...\n**Q2:** ...\n**Q3:** ...\n\n### Day 3 — Comprehension\n\n**Q4:** ...\n**Q5:** ...\n**Q6:** ...\n\n### Day 7 — Application\n\n**Q7:** ...\n**Q8:** ...\n**Q9:** ...\n\n### Day 14 — Synthesis\n\n**Q10:** ★ ...\n**Q11:** ...\n**Q12:** ★ ...`
  }
};
```

---

## 📌 Path-Specific Visualization Guide

| Path | Primary Component | What the diagram should show |
|------|------------------|------------------------------|
| `spring-boot` | `FlowChart` / `UmlClassDiagram` | Bean lifecycle, filter chain, DI resolution tree |
| `java-mastery` | `UmlClassDiagram` / `FlowChart` | Class hierarchy, algorithm execution steps |
| `docker` | `SequenceDiagram` / `NetworkDiagram` | Build layers, container networking, compose topology |
| `kubernetes` | `NetworkDiagram` / `FlowChart` | Pod scheduling decision, service discovery |
| `system-design` | `ConceptMap` / `SequenceDiagram` | Component relationships, request path through system |
| `software-architecture` | `UmlClassDiagram` / `ConceptMap` | Pattern structure, SOLID principle violations |
| `dsa` | `TreeVisualization` / `FlowChart` | Data structure state after operation, algorithm steps |
| `leetcode-patterns` | `FlowChart` / `TreeVisualization` | Pattern recognition, recursion tree |
| `api-design` | `SequenceDiagram` / `FlowChart` | REST lifecycle, auth flow, rate limiting |
| `sql` | `DatabaseSchema` / `FlowChart` | Table ERD, query execution plan |
| `postgresql-dba` | `FlowChart` / `DatabaseSchema` | Index B-tree structure, vacuum process |
| `mongodb` | `DatabaseSchema` / `FlowChart` | Document model, aggregation pipeline stages |
| `git-github` | `GitGraph` / `FlowChart` | Branch history, conflict resolution process |
| `nextjs` | `FlowChart` / `SequenceDiagram` | SSR/SSG pipeline, data fetching waterfall |
| `design-system` | `ConceptMap` / `UmlClassDiagram` | Token hierarchy, component composition tree |
| `full-stack` | `SequenceDiagram` / `NetworkDiagram` | Full request lifecycle, system architecture |
| `javascript` | `FlowChart` / `CodeRunner` | Event loop, scope chain, prototype chain |
| `typescript` | `FlowChart` / `UmlClassDiagram` | Type narrowing flow, mapped type transformation |
| `react` | `FlowChart` / `SequenceDiagram` | Render cycle, reconciliation, hook execution order |
| `angular` | `FlowChart` / `UmlClassDiagram` | Change detection tree, DI injector hierarchy |

---

## 🎯 Remaining Work (Priority Order)

🎉 **ALL 23 PATHS COMPLETE** — no remaining work.

**Current DB lessons:** ~6,228 (verified 2026-07-01)
**Already ✅ complete:** angular, api-design, css, design-system, docker, dsa, full-stack, git-github, html, java-mastery, javascript, kubernetes, leetcode-patterns, microservices, mongodb, nextjs, postgresql-dba, react, software-architecture, spring-boot, sql, system-design, typescript

> **Note on DB topic counts:** Paths that share cross-path topics (full-stack references 51 topics owned by other paths; dsa/java-mastery share some java-specific topics) will show lower DB topic counts than MDX file counts. This is correct — topics are owned by one path in the DB. All 23 paths have **100% MDX section coverage** confirmed by `node scripts/auditAllPaths.js`.

---

## 🔄 Quick Reference Commands

```powershell
# Full audit of all paths
node scripts/auditAllPaths.js

# Process one path end-to-end
node scripts/writeSections.js <path>
node scripts/importContentDirect.js <path>

# Check DB lesson count
node -e "const {Client}=require('pg');const c=new Client({connectionString:'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres'});c.connect().then(()=>c.query('SELECT COUNT(*) FROM lessons')).then(r=>{console.log('Total:',r.rows[0].count);c.end()})"
```

