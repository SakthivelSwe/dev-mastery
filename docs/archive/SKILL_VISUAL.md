# DevMastery — Visualizer Skill Plan

> **Purpose** — Track the progress of adding interactive step-by-step visualizers to every topic.
> Run the batch scripts below to add or update visualizer configs in bulk without touching the web app code.
>
> **Architecture recap** — Each topic's `## VISUALIZATION_CONFIG` MDX section holds a fenced JSON block:
> ```json
> { "language": "java", "fileName": "Demo.java", "steps": [ ... ] }
> ```
> `VisualizerShell` detects this and delegates to `StepwiseVisualizer`, which renders:
> - ▶ Play / ⏸ Pause / ⏭ Step / ↺ Reset controls
> - Animated diagram (memory · threads · boxes · flow · sequence · threadpool)
> - Monaco code panel with per-step line highlights
> - Step narration (title + description)

---

## Progress Snapshot

| Path | Done | Total | % |
|------|------|-------|---|
| `java-mastery`  | 80 | 80 | **100%** ✅ |
| `spring-boot`   | 38 | 38 | **100%** ✅ |
| **Total**       | **118** | **118** | **100%** ✅ |

> Last updated: 2026-07-02. Run `node scripts/audit-visualizers.js` at any time to refresh this table.

---

## Batch Plan

Batches are processed via:
```bash
node scripts/apply-visualizer-configs.js --import
```
Each batch is a section inside `scripts/visualizer-configs.js` (or an extension file).
After adding a batch's entries to the config catalogue, run the command above.

### Java Mastery Batches

| Batch | Topics | Theme | Status |
|-------|--------|-------|--------|
| **JM-0** _(done)_ | threads-fundamentals, thread-lifecycle, creating-threads, thread-synchronization, locks-concurrency, volatile-atomic, executor-framework, thread-pools, completable-future, fork-join-framework, producer-consumer, deadlock-livelock-starvation, virtual-threads, concurrent-collections, data-types-and-variables | Threading | ✅ Done |
| **JM-1** _(done)_ | java-intro, variables, basic-types, data-types, operators-and-expressions, control-flow, methods, strings, arrays, arrays-and-tuples | Java Foundations | ✅ Done |
| **JM-2** _(done)_ | oop-intro, encapsulation, inheritance, polymorphism, abstraction, interfaces, inner-classes, records-and-sealed-classes, enums, generics | OOP | ✅ Done |
| **JM-3** _(done)_ | collections-overview, arraylist-vs-linkedlist, hashmap-internals, treemap-and-treeset, priorityqueue, comparator-and-comparable, optional, streams-api, lambda-expressions, functional-interfaces, closures | Collections & Streams | ✅ Done |
| **JM-4** _(done)_ | exception-handling, garbage-collection, jvm-architecture, solid-principles, dependency-injection, bfs, dfs | JVM + Design | ✅ Done |
| **JM-5** _(pending)_ | garbage-collection-mechanics, jvm-classloaders, reflection, serialization, io-and-nio, java-memory-model, java-modules, performance-tuning, annotations, build-tools | JVM Internals | 🔲 Pending |
| **JM-6** _(pending)_ | concurrency-basics, concurrency-utilities, executorservice, java-concurrency-deep-dive, iterator-pattern, linkedhashmap, wrapper-classes | Concurrency + Misc | 🔲 Pending |
| **JM-7** _(pending)_ | clean-code, design-patterns-in-java, testing-best-practices, spring-beans, spring-profiles, objects-and-interfaces, topological-sort | Architecture + Patterns | 🔲 Pending |
| **JM-8** _(pending)_ | design-rate-limiter, design-url-shortener, crud-operations | System Design | 🔲 Pending |

### Spring Boot Batches

| Batch | Topics | Theme | Status |
|-------|--------|-------|--------|
| **SB-0** _(done)_ | spring-async, spring-scheduled, spring-thread-pools, spring-virtual-threads | Threading | ✅ Done |
| **SB-1** _(done)_ | spring-intro, rest-controllers, spring-data-jpa, spring-security-basics, spring-actuator | Core | ✅ Done (partial) |
| **SB-2** _(pending)_ | spring-beans, spring-boot-intro, spring-configuration, component-scanning, bean-scope, spring-profiles, dependency-injection, request-response, response-entity, content-negotiation | Core Config | 🔲 Pending |
| **SB-3** _(pending)_ | jpa-entity-mapping, jpa-relationships, jpql-and-criteria, flyway-migrations, spring-cache | Data Layer | 🔲 Pending |
| **SB-4** _(pending)_ | jwt-authentication, oauth2-spring, exception-handling-spring, validation-spring, springdoc-openapi, grpc-spring | Security & API | 🔲 Pending |
| **SB-5** _(pending)_ | spring-events, spring-batch, spring-kafka, spring-webflux, spring-cloud-gateway, resilience4j-spring, testcontainers-spring, virtual-threads-spring | Messaging & Resilience | 🔲 Pending |

---

## Diagram Type Reference

| `kind` | Props | Best for |
|--------|-------|---------|
| `memory` | `stack[]`, `heap[]` | Variables, types, JVM memory, boxing, object refs |
| `threads` | `threads[]`, `monitor?` | Thread states, deadlock, synchronization |
| `boxes` | `title?`, `items[]` | Collections, choices, categories, API families |
| `flow` | `steps[]` | Algorithms, lifecycle, process stages |
| `sequence` | `actors[]`, `messages[]` | Method calls, DI, HTTP request/response |
| `threadpool` | `workers[]`, `queue[]`, `capacity` | ExecutorService, task queues, Kafka |

---

## How to Add a Visualizer to Any Topic

### 1. Add step config to `scripts/visualizer-configs.js`
```js
'your-topic-slug': {
  language: 'java',
  fileName: 'Demo.java',
  steps: [
    {
      title: 'Step 1 title',
      description: 'What is happening and why it matters.',
      code: `int x = 42;`,
      highlight: [1],
      diagram: { kind: 'memory', stack: [{ label: 'x', value: '42', type: 'int', highlight: true }], heap: [] }
    },
    // ... more steps
  ]
}
```

### 2. Apply and import
```bash
node scripts/apply-visualizer-configs.js --import
```

### 3. Verify in browser
Open `http://localhost:3000/learn/java-mastery/your-topic-slug` → click **Visualizer** tab.

---

## Audit Script

```bash
node scripts/audit-visualizers.js
```

Prints a table of all MDX files with ✅/🔲 status and step count.

---

## Auto-Continue Execution Order

Run these commands in sequence. Each produces `OK` lines and `>> Files: N` output.
If a command fails, fix the specific topic config and re-run just that batch.

```bash
# Batch JM-1  (Java Foundations)
node scripts/apply-visualizer-configs.js --import

# Batch JM-2  (OOP)
node scripts/apply-visualizer-configs.js --import

# ... (update visualizer-configs.js before each run)
```

> **Tip** — All batch configs live in `scripts/visualizer-configs.js` under their path key.
> The script auto-detects which files were changed and only re-imports those.

---

## Step Quality Checklist

Each topic's visualizer should:
- [ ] Have 5–6 steps (not more — screens get crowded)
- [ ] Step 1: "What problem does this solve / what is the concept?"
- [ ] Step 2–4: Core mechanism with a diagram that makes it visual
- [ ] Step 5: Real-world connection or gotcha
- [ ] Every step has a `code` snippet (even a one-liner)
- [ ] Key lines have `highlight: [line-numbers]`
- [ ] Diagram kind matches the content (memory for data, flow for algorithms, sequence for interactions)
- [ ] Description is 1–3 sentences — concise, not a lecture

