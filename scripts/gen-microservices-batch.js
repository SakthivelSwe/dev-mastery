const fs = require('fs');
const path = require('path');

const CONTENT_DIR = 'C:\\AI projects\\dev-mastery\\apps\\web\\content\\microservices';

function generateMdx(slug, title, level, sections) {
  return `---
slug: "${slug}"
title: "${title}"
level: ${level}
---

${sections.join('\n\n')}
`;
}

// ===========================
// ms-versioning
// ===========================
const versioningWhy = `## WHY

API versioning is the discipline of managing change in APIs so that existing consumers continue working when the API evolves. Without versioning strategy, every API change is a potential breaking change that forces all consumers to update simultaneously — a coordination tax that grows linearly with the number of consumers. The classic failure: a team renames a JSON field for clarity, deploys, and 15 downstream services start failing because their deserialization breaks silently. With a clear versioning strategy, breaking changes are introduced in a new version while the old version continues to work, giving consumers a migration window.

The specific pain versioning solves: **forced upgrade coupling**. Without versioning, an API change forces all consumers to update at the same time — defeating the microservices promise of independent deployment. With versioning, the producer team can publish v2 alongside v1, notify consumers, give them 3 months to migrate at their own pace, then deprecate v1. Consumer teams plan their migration into their own sprint cycles without any coordination with the producer team.

The production failure mode from missing versioning strategy is **the accidental breaking change cycle**: producer team refactors an API for clarity (good intent), breaks 10 consumer services (bad outcome), emergency rollback and coordination meeting (waste), cross-team negotiation over migration timeline (more waste), finally coordinated deploy (defeats independence). This cycle repeats every few months, accumulating relationship damage between teams. With versioning, all of this is replaced by: publish v2 alongside v1, deprecate v1, consumers migrate independently.

Senior engineers must understand: the three URI versioning strategies (URI path, header, content-type), backward-compatibility guarantees (which changes are safe vs breaking), deprecation process (headers, timelines, sunset headers per RFC 8594), and the relationship between versioning and consumer-driven contract testing.`;

const versioningTheory = `## THEORY

### Three API Versioning Strategies

\`\`\`mermaid
flowchart LR
    CLIENT[Client] --> GW[API Gateway]
    GW --> V1[v1 Controller\\n/v1/orders]
    GW --> V2[v2 Controller\\n/v2/orders]
    GW -->|Accept: application/vnd.shop.v2+json| HEADER_V[Header-Versioned Controller]
\`\`\`

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| **URI path** | \`/v1/orders\`, \`/v2/orders\` | Explicit, cacheable, easy to test | Pollutes URIs; REST purists object |
| **Request header** | \`Accept-Version: v2\` | Clean URIs | Harder to test (need header tool) |
| **Content-type** | \`Accept: application/vnd.shop.v2+json\` | RESTful | Verbose; most clients ignore it |

**Recommendation for microservices**: URI path versioning (\`/v1/\`, \`/v2/\`). It is the most explicit, easiest to debug in logs, and works with all HTTP clients including `curl` and browser fetch.

### Breaking vs Non-Breaking Changes

| Change | Breaking? | Reason |
|--------|-----------|--------|
| Add optional response field | ✅ Non-breaking | Consumers using \`@JsonIgnoreProperties(ignoreUnknown=true)\` handle this |
| Add optional request field | ✅ Non-breaking | Old clients don't send it; server uses default |
| Add new endpoint | ✅ Non-breaking | Old clients don't call it |
| Remove response field | ❌ Breaking | Old consumers expect it, get null |
| Rename field | ❌ Breaking | Always breaking in both directions |
| Add required request field | ❌ Breaking | Old clients don't send it |
| Remove endpoint | ❌ Breaking | Old clients call it, get 404 |
| Change field type | ❌ Usually breaking | Type mismatch on deserialization |

### Deprecation Process (RFC 8594)

\`\`\`
1. Publish v2 alongside v1 (running both simultaneously)
2. Add Deprecation header to all v1 responses:
   Deprecation: Sat, 01 Jan 2025 00:00:00 GMT
   Sunset: Mon, 01 Jul 2025 00:00:00 GMT
   Link: </v2/orders>; rel="successor-version"
3. Monitor v1 usage via API gateway metrics
4. Email all teams using v1 with migration guide and deadline
5. When v1 traffic = 0 (or deadline reached), decommission v1
\`\`\`

### Common Misconception

> "We can avoid versioning by always making backward-compatible changes."

**Reality:** While additive changes are safe, the real world eventually demands breaking changes — security redesigns, domain model corrections, performance optimisations that change response structure. Versioning is not about planning to make breaking changes; it's about having a safe path for the inevitable breaking changes. Teams that claim "we'll never break the API" either never iterate or break consumers unexpectedly.`;

const versioningViz = `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "FlowChart", "state": "microservices-ms-versioning" }
\`\`\``;

const versioningCode = `## CODE

### Level 1 — Beginner: URI Path Versioning

\`\`\`java
import org.springframework.web.bind.annotation.*;

// v1 API — kept for backward compatibility
@RestController
@RequestMapping("/v1/orders")
class OrderControllerV1 {
    @GetMapping("/{id}")
    public OrderV1 get(@PathVariable long id) {
        return new OrderV1(id, "CONFIRMED", "2024-06-25");  // v1: date as string
    }
}

// v2 API — new version with improved types
@RestController
@RequestMapping("/v2/orders")
class OrderControllerV2 {
    @GetMapping("/{id}")
    public OrderV2 get(@PathVariable long id) {
        return new OrderV2(id, "CONFIRMED", java.time.Instant.now(), 2999L, "USD");
    }
}

record OrderV1(long orderId, String status, String date) {}
record OrderV2(long orderId, String status, java.time.Instant createdAt,
               long totalCents, String currency) {}
\`\`\`

### Level 2 — Intermediate: Header Versioning with Negotiation

\`\`\`java
@RestController
@RequestMapping("/orders")
class VersionedOrderController {

    @GetMapping("/{id}")
    public Object get(
            @PathVariable long id,
            @RequestHeader(value = "Accept-Version", defaultValue = "v1") String version) {
        return switch (version) {
            case "v2" -> new OrderV2(id, "CONFIRMED", java.time.Instant.now(), 2999L, "USD");
            default  -> new OrderV1(id, "CONFIRMED", "2024-06-25");
        };
    }
}
\`\`\`

### Level 3 — Advanced: Deprecation Headers + Usage Tracking

\`\`\`java
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import io.micrometer.core.instrument.*;
import java.time.*;

@RestController
@RequestMapping("/v1/orders")
class DeprecatedOrderControllerV1 {

    private final MeterRegistry metrics;
    DeprecatedOrderControllerV1(MeterRegistry metrics) { this.metrics = metrics; }

    @GetMapping("/{id}")
    public ResponseEntity<OrderV1> get(@PathVariable long id) {
        // Track v1 usage so we know when it's safe to decommission
        metrics.counter("api.version.usage", "version", "v1", "endpoint", "GET /orders/{id}").increment();

        return ResponseEntity.ok()
            .header("Deprecation", "Sat, 01 Jan 2025 00:00:00 GMT")
            .header("Sunset", "Mon, 01 Jul 2025 00:00:00 GMT")
            .header("Link", "</v2/orders/" + id + ">; rel=\\"successor-version\\"")
            .body(new OrderV1(id, "CONFIRMED", "2024-06-25"));
    }
}
\`\`\`

### Level 4 — Expert / Production: Version Router with Metrics + Sunset Enforcement

\`\`\`java
package com.shop.orders.api;

import org.springframework.beans.factory.annotation.*;
import org.springframework.http.*;
import org.springframework.stereotype.*;
import org.springframework.web.bind.annotation.*;
import io.micrometer.core.instrument.*;
import java.time.*;
import java.util.*;

/**
 * Production version management: routes to the correct version handler,
 * tracks usage per version per consumer (via User-Agent or X-Consumer-ID header),
 * enforces sunset (returns 410 Gone after sunset date).
 */
@Component
class ApiVersionRouter {

    private final MeterRegistry metrics;
    // Configure version lifecycle in application.yml
    private final Map<String, Instant> sunsetDates = Map.of(
        "v1", Instant.parse("2025-07-01T00:00:00Z")
    );
    private final Map<String, Instant> deprecationDates = Map.of(
        "v1", Instant.parse("2025-01-01T00:00:00Z")
    );

    ApiVersionRouter(MeterRegistry metrics) { this.metrics = metrics; }

    public ResponseEntity.BodyBuilder versionedResponse(String version, String consumerId) {
        // Track per-version, per-consumer usage for migration planning
        metrics.counter("api.version.calls",
            "version", version,
            "consumer", consumerId != null ? consumerId : "unknown"
        ).increment();

        Instant sunset = sunsetDates.get(version);
        if (sunset != null && Instant.now().isAfter(sunset)) {
            // After sunset: return 410 Gone to force migration
            throw new org.springframework.web.server.ResponseStatusException(
                HttpStatus.GONE,
                "API " + version + " was sunset on " + sunset + ". Use /v2/");
        }

        ResponseEntity.BodyBuilder builder = ResponseEntity.ok();
        Instant dep = deprecationDates.get(version);
        if (dep != null) {
            builder.header("Deprecation", dep.toString());
            Instant sun = sunsetDates.get(version);
            if (sun != null) builder.header("Sunset", sun.toString());
        }
        return builder;
    }
}
\`\`\``;

const versioningRealWorld = `## REAL_WORLD

### How Stripe Manages 10+ Years of API Versions

Stripe has maintained backward compatibility for their API since 2011 using date-based versions (\`2024-06-01\`). Every API call specifies a version; Stripe maintains all historical versions. Their secret: the API transformer layer maps every request to the internal canonical model and every response back to the requested version. This means they can evolve the internal representation while preserving every public API version.

\`\`\`java
// Stripe-style version transformer
@RestController
class PaymentController {
    @PostMapping("/payments")
    public Object createPayment(
            @RequestHeader(value = "Stripe-Version", defaultValue = "2024-06-01") String version,
            @RequestBody Map<String, Object> body) {
        // Transform to internal model
        Payment internal = PaymentMapper.fromRequest(body, version);
        Payment created = paymentService.create(internal);
        // Transform internal model back to the requested version's response schema
        return PaymentMapper.toResponse(created, version);
    }
}
interface PaymentService { Payment create(Payment p); }
record Payment(String id, long amount, String currency, String status) {}
class PaymentMapper {
    static Payment fromRequest(Map<String, Object> body, String version) {
        // Handle field name differences between versions
        long amount = version.compareTo("2023-01-01") < 0
            ? ((Number) body.get("amount_in_cents")).longValue()
            : ((Number) body.get("amount")).longValue();
        return new Payment(null, amount, (String) body.get("currency"), "PENDING");
    }
    static Object toResponse(Payment p, String version) {
        if (version.compareTo("2023-01-01") < 0) {
            return Map.of("payment_id", p.id(), "amount_in_cents", p.amount());
        }
        return Map.of("id", p.id(), "amount", p.amount(), "currency", p.currency());
    }
}
\`\`\`

### Production Gotcha: Version Without Migration Path

\`\`\`
❌ Announcing deprecation without a migration guide:
Deprecation email: "v1 will be removed on July 1st. Please upgrade to v2."
No example code showing how v1 → v2 maps.
No migration guide explaining what changed.
Result: 30 consumer teams all open tickets asking for help on the same day.

✅ CORRECT — deprecation announcement includes:
1. What changed (diff of v1 vs v2 schemas)
2. Why it changed (context, not just technical spec)
3. Step-by-step migration examples in multiple languages
4. Office hours / Slack channel for migration questions
5. Automated script to detect v1 usage in consumer code
\`\`\`

### Performance Characteristics

| Aspect | Impact |
|--------|--------|
| Running 2 API versions simultaneously | 2× controller memory; negligible if business logic is shared |
| Version detection overhead | <0.1ms (header or path check) |
| Consumer migration time (with good guide) | Days to weeks |
| Consumer migration time (without guide) | Months to never |`;

const versioningInterview = `## INTERVIEW

**Q1 (Junior): What is API versioning and why do microservices need it?**
A: API versioning is the practice of maintaining multiple, simultaneously available versions of an API so consumers can continue using an older version while they migrate to a newer one. Microservices need it because independent deployment means a service can update its API at any time, but its consumers may not be ready to update simultaneously. Without versioning, any breaking API change forces all consumers to update in lockstep — defeating the independent deployment promise. Versioning gives consumers a migration window: the producer publishes v2, consumers migrate on their own schedule, then v1 is deprecated and removed.

**Q2 (Junior): What changes to an API are backward-compatible (non-breaking)?**
A: Non-breaking changes: (1) adding an optional response field; (2) adding an optional request field with a default value; (3) adding a new endpoint; (4) adding a new error code for a new edge case (if consumers use catch-all error handling). Breaking changes: removing or renaming any field, adding a required request field, removing an endpoint, changing a field's type, changing an error code meaning. The rule of thumb: additions are safe; removals and renames are breaking. This is why `@JsonIgnoreProperties(ignoreUnknown=true)` is mandatory on all consumer DTOs — it makes the consumer resilient to new fields being added.

**Q3 (Mid): Compare the three API versioning strategies. Which do you prefer and why?**
A: (1) **URI path versioning** (`/v1/orders`): explicit, cacheable by CDN, visible in logs, works with curl. Most widely used. Downside: "unclean" URIs by REST purist standards. (2) **Accept header versioning** (`Accept: application/vnd.shop.v2+json`): RESTful, clean URIs. Downside: invisible in browser address bar, requires non-trivial header setup in clients. (3) **Custom header** (`Accept-Version: v2`): simple, explicit. Non-standard header means some proxies may strip it. My preference: URI path for public-facing and cross-team APIs because it's the most debuggable (visible in access logs, easy to test with curl, easy to explain to non-specialists). Header versioning for partner/external APIs where URI cleanliness matters for developer experience.

**Q4 (Mid): How do you track and enforce API deprecation timelines?**
A: Four-step process: (1) **Announce**: add `Deprecation` and `Sunset` headers to all deprecated version responses; email all consumer team leads with the migration guide, deadline, and Slack channel for questions; (2) **Track**: measure v1 vs v2 call ratio per consumer (via API gateway metrics tagged by `X-Consumer-ID` or JWT `sub`); build a deprecation dashboard showing which consumers have migrated and which haven't; (3) **Remind**: automated weekly email to teams still on v1 showing their remaining usage; (4) **Enforce**: on the sunset date, return `410 Gone` from v1 endpoints with a message pointing to v2. For internal APIs: use Pact broker's can-i-deploy to verify all consumers are on v2 before removing v1. For external APIs (Stripe-style): never remove versions; maintain forever with backwards-compatibility transformer.

**Q5 (Senior): How do you handle semantic versioning for REST APIs vs library versioning?**
A: Library semver (major.minor.patch) maps cleanly to code. For REST APIs, the mapping is: **major version** = breaking change (remove/rename field, remove endpoint); **minor version** = additive non-breaking change (add field, add endpoint); **patch** = bug fix (fix incorrect value, fix documentation). In practice, most REST APIs only expose major versions in the URL — consumers care about breaking changes, not minor/patch. Internal services can get away with semantic version in the `info.version` of their OpenAPI spec without URI versioning, relying on contract tests (Pact) to catch breaking changes automatically. For public APIs: strict URI versioning for major versions, with OpenAPI spec tracking minor/patch for documentation; consumers subscribe to spec change notifications via the API catalogue.

**Q6 (Senior): A team adds a required field to a response schema. Is this a breaking change?**
A: Context-dependent. Adding a required field to a **request** body is always breaking — existing callers don't send the new field and will get 400 Bad Request. Adding a required field to a **response** body is usually non-breaking — the producer now always includes it, and consumers using `@JsonIgnoreProperties(ignoreUnknown=true)` will silently ignore it until they choose to use it. However, it can be breaking if the consumer is using strict schema validation that rejects unknown fields (rare but possible) or if the field is nullable in some states and the consumer depends on it being present. Safe migration for new required response fields: add it as nullable first (optional), verify no consumer complains, then mark it required in the spec. This two-step approach is safer than one-step.

**Q7 (Senior+): How does API versioning interact with database schema evolution at scale?**
A: When maintaining multiple API versions, the database schema must satisfy all active versions simultaneously. This creates three challenges: (1) **New field for v2**: add the column as nullable to avoid breaking v1 writes; v1 writes leave it null; v2 writes populate it — both can coexist; (2) **Removed field in v2**: v1 still reads/writes it; keep the column even though v2 doesn't use it; mark it deprecated in the schema; remove only when v1 is sunset; (3) **Type change (v1: string userId, v2: integer userId)**: maintain both columns (`user_id_v1 TEXT`, `user_id_v2 BIGINT`) with a migration job that populates both; v1 API reads v1 column, v2 reads v2 column. This multi-version schema maintenance is the hidden cost of API versioning — it's not just code, it's data. Tools: Flyway migration scripts, backward-compatible schema changes (always additive, never remove columns until all API versions that use them are sunset).`;

const versioningFeynman = `## FEYNMAN CHECK

### Explain API Versioning Like I'm 10 Years Old

> Imagine you make a toy and send instructions to your friends about how to use it. Then you improve the toy, but the new instructions are completely different from the old ones. Your friends who have the old instructions are now confused — nothing matches! **API versioning is like publishing both the old and new instructions at the same time.** Your new friends get the new instructions (v2), and your old friends keep using the old ones (v1) until they're ready to switch. You give everyone a date: "I'll stop explaining the old way on July 1st — please learn the new way before then." That way nobody is suddenly stuck with instructions that don't match their toy.

---

### 5 Deep Conceptual Questions

**Q1: Why is "we'll always be backward compatible" not a versioning strategy?**
> **A:** Backward compatibility is a goal, but it's not achievable indefinitely for any evolving API. Security requirements may demand field type changes. Domain model corrections may require renames. Performance improvements may change response structure. The question is not "will we ever break compatibility?" but "what happens when we inevitably do?" Without a versioning strategy, the answer is "coordinated emergency migration across all consumers." With a versioning strategy, the answer is "publish v2, give consumers a migration window, deprecate v1." The versioning strategy is the safety net for the inevitable.

**Q2: What is the ONE mental model for API versioning?**
> **A:** "APIs are public commitments, and commitments need a clear exit strategy." When you publish an API endpoint, you're committing to its behavior for all current consumers. The versioning strategy defines how you honour existing commitments while making new ones. v1 is the old commitment; v2 is the new commitment; deprecation is the process of retiring the old commitment with sufficient notice. Without this frame, teams make API changes casually, not realising they're breaking existing commitments. With this frame, every API change is evaluated: "does this change break existing commitments? If yes, I need a new version."

**Q3: What is the most dangerous versioning mistake? Show it.**
> **A:** Removing a field without a versioning strategy:
> \`\`\`java
> // ❌ Week 1: API returns { "userId": 42, "email": "a@b.com", "legacyCode": "ABC" }
> // Week 2: team removes legacyCode (it's unused, right?)
> // GET /orders/{id} now returns { "userId": 42, "email": "a@b.com" }
> // Consumer code: String code = order.getLegacyCode();
> //                auditLog.record(code.toUpperCase());  // NullPointerException in production
> //                // Nobody noticed because no contract tests
> 
> // ✅ CORRECT: never remove a field without versioning
> // Week 2: Mark deprecated in OpenAPI spec
> // Week 2-12: Run both, measure usage
> // Week 12: Remove in v2 only after verifying no consumer uses it
> \`\`\`

**Q4: How does versioning interact with event schemas in Kafka?**
> **A:** Kafka event schemas face the same versioning challenges as REST APIs, but with different tooling. For Avro-encoded Kafka events, the Confluent Schema Registry enforces compatibility rules: BACKWARD (new schema can read old data), FORWARD (old schema can read new data), or FULL (both). Breaking changes are blocked at publish time, not discover at consumer runtime. For JSON-encoded events, the same "additive only" rules apply, but there's no automatic enforcement. Production pattern: store Kafka topic schemas in Avro with the Schema Registry, enforce BACKWARD_TRANSITIVE compatibility (new schemas can read any previously published version), and use event versioning fields (`{ "eventType": "OrderPlaced", "schemaVersion": 2, "data": {...} }`) to allow consumers to route to different handlers based on schema version.

**Q5: One-sentence definition for a senior FAANG engineer.**
> **A:** "API versioning is the practice of maintaining multiple simultaneously-available API versions to give consumers a migration window for breaking changes, implemented via URI path (/v1/, /v2/), Accept header, or content-type negotiation, with breaking changes defined as any change that causes existing consumers to fail or receive different data than expected, governed by a deprecation process that includes Deprecation/Sunset response headers (RFC 8594), usage tracking per consumer via API gateway metrics, a migration guide published alongside the v2 announcement, and enforcement via either 410 Gone responses after sunset or Pact contract tests that verify all consumers have migrated before v1 code is removed."`;

const versioningBuild = `## BUILD

### 🏗️ Mini Project: Versioned Orders API

**What you will build:** An orders API running v1 and v2 simultaneously with deprecation headers and usage tracking.
**Why this project:** Forces you to implement the full deprecation workflow.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup

\`\`\`bash
mkdir versioned-api && cd versioned-api
mkdir -p src/main/java/com/api
\`\`\`

#### Step 2 — Core

\`\`\`java
package com.api;
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
public class App {
    public static void main(String[] args) { SpringApplication.run(App.class, args); }
}

@RestController @RequestMapping("/v1/orders")
class V1 {
    @GetMapping("/{id}")
    public ResponseEntity<OrderV1> get(@PathVariable long id) {
        return ResponseEntity.ok()
            .header("Deprecation", "2025-01-01T00:00:00Z")
            .header("Sunset", "2025-07-01T00:00:00Z")
            .body(new OrderV1(id, "CONFIRMED", "2024-06-25"));
    }
}

@RestController @RequestMapping("/v2/orders")
class V2 {
    @GetMapping("/{id}")
    public OrderV2 get(@PathVariable long id) {
        return new OrderV2(id, "CONFIRMED", java.time.Instant.now(), 2999L, "USD");
    }
}

record OrderV1(long orderId, String status, String date) {}
record OrderV2(long orderId, String status, java.time.Instant createdAt,
               long totalCents, String currency) {}
\`\`\`

#### Steps 3-5 — Tests

\`\`\`java
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.*;
import org.springframework.http.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class VersionedApiTest {
    @org.springframework.beans.factory.annotation.Autowired TestRestTemplate http;

    @Test void v1HasDeprecationHeader() {
        var resp = http.getForEntity("/v1/orders/1", String.class);
        assertNotNull(resp.getHeaders().getFirst("Deprecation"));
    }

    @Test void v2HasNoDeprecationHeader() {
        var resp = http.getForEntity("/v2/orders/1", String.class);
        assertNull(resp.getHeaders().getFirst("Deprecation"));
    }
}
\`\`\`

**Expected Output:**
\`\`\`
GET /v1/orders/1 → 200 OK + Deprecation: header + Sunset: header
GET /v2/orders/1 → 200 OK + {"orderId":1,"currency":"USD",...}
\`\`\`

**Stretch Challenges:**
- [ ] Implement 410 Gone enforcement after the sunset date
- [ ] Add per-consumer usage tracking via Micrometer
- [ ] Build a sunset dashboard showing v1 usage over time`;

const versioningSpacedReview = `## SPACED REVIEW

### Day 1 — Recall

**Q1:** Name the 3 API versioning strategies and one pro/con of each.

**Q2:** List 5 breaking changes and 3 non-breaking changes.

**Q3:** What HTTP headers indicate API deprecation? What RFC defines them?

### Day 3 — Comprehension

**Q4:** A team needs to rename \`user_id\` to \`customerId\`. Walk through the safe migration strategy.

**Q5:** Compare Stripe's date-based versioning to URI path versioning. When is each appropriate?

**Q6:** What is the correct response when an API endpoint is accessed after its sunset date?

### Day 7 — Application

**Q7:** Implement v1 and v2 of an order API simultaneously in Spring Boot with deprecation headers on v1.

**Q8:** Build a usage-tracking middleware that logs which API version each consumer is using.

**Q9:** Design a database migration strategy for removing a field that exists in v1 but not v2.

### Day 14 — Synthesis

**Q10:** ★ Classic interview: *"How do you manage API versioning in a microservices system with 40 consumer services?"*

**Q11:** Draw the timeline of a v2 API launch: announcement → both versions running → v1 deprecation → v1 sunset.

**Q12:** ★ System design: *"You run a public API used by 5,000 developers. How do you release a breaking change that affects 60% of endpoints without taking any consumer down?"*`;

const topics = {
  'ms-versioning': [
    versioningWhy, versioningTheory, versioningViz, versioningCode,
    versioningRealWorld, versioningInterview, versioningFeynman, versioningBuild, versioningSpacedReview
  ],
};

// Write each topic
let created = 0;
for (const [filename, sections] of Object.entries(topics)) {
  const info = filename.replace('ms-', '').replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  const slug = filename;
  const content = `---\nslug: "${slug}"\ntitle: "${info}"\nlevel: 3\n---\n\n${sections.join('\n\n')}`;
  const filePath = path.join(CONTENT_DIR, filename + '.mdx');
  fs.writeFileSync(filePath, content);
  console.log('Created:', filePath);
  created++;
}

console.log('Done. Created:', created, 'files');

