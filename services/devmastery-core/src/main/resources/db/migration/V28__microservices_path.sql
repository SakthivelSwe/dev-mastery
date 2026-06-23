-- V28__microservices_path.sql
-- Adds the "Microservices with Spring" learning path (28 topics, 5 levels)
-- and deep content for 3 hero topics.

-- ──────────────────────────────────────────────────────────────
-- 1. Learning path row
-- ──────────────────────────────────────────────────────────────

INSERT INTO learning_paths
  (id, slug, title, description, icon, accent_color, level_min, level_max,
   total_topics, estimated_hours, order_index, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000028'::uuid,
  'microservices',
  'Microservices with Spring',
  'Design and ship production-grade microservices using Spring Boot, Spring Cloud, Resilience4j, Kafka and Kubernetes.',
  'server',
  '#6db33f',
  1, 5,
  28, 120, 20,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  title          = EXCLUDED.title,
  description    = EXCLUDED.description,
  icon           = EXCLUDED.icon,
  accent_color   = EXCLUDED.accent_color,
  level_min      = EXCLUDED.level_min,
  level_max      = EXCLUDED.level_max,
  total_topics   = EXCLUDED.total_topics,
  estimated_hours= EXCLUDED.estimated_hours,
  order_index    = EXCLUDED.order_index,
  is_active      = true,
  updated_at     = now();

-- ──────────────────────────────────────────────────────────────
-- 2. Topics (28) — use `ms-` slug prefix to keep globally unique
-- ──────────────────────────────────────────────────────────────

INSERT INTO topics
  (id, path_id, slug, title, description, level, estimated_mins, order_index,
   has_visualizer, has_code_lab, is_published)
SELECT
  gen_random_uuid(),
  (SELECT id FROM learning_paths WHERE slug='microservices'),
  v.slug, v.title, v.description, v.level, v.mins, v.ord,
  v.viz, v.lab, true
FROM (VALUES
  -- ── Level 1 — Foundation
  ('ms-intro',                  'What is a Microservice?',                'Definition, characteristics, and what makes a service "micro".', 1, 25, 1,  true,  false),
  ('ms-monolith-vs',            'Monolith vs Microservices',              'When does a monolith stop scaling? Trade-offs both ways.',       1, 25, 2,  false, false),
  ('ms-soa-vs-ms',              'SOA vs Microservices',                   'How microservices differ from classic SOA and ESBs.',            1, 20, 3,  false, false),
  ('ms-pros-cons',              'Pros and Cons',                          'The honest list — what you gain, what it costs.',                1, 20, 4,  false, false),
  ('ms-when-not',               'When NOT to use Microservices',          'Premature decomposition is the root of many evils.',             1, 20, 5,  false, false),
  ('ms-bounded-contexts',       'Bounded Contexts (DDD)',                 'Why service boundaries follow business boundaries.',             1, 30, 6,  false, false),
  ('ms-arch-overview',          'Architecture Patterns Overview',         'A tour of the building blocks you''ll meet next.',               1, 25, 7,  true,  false),
  ('ms-conway-law',             'Conway''s Law',                          'Your architecture mirrors your team structure. Plan for it.',    1, 15, 8,  false, false),

  -- ── Level 2 — Working Knowledge
  ('ms-spring-boot',            'Spring Boot for Microservices',          'Bootstrapping a production-ready service in minutes.',           2, 30, 9,  false, true),
  ('ms-rest-apis',              'REST APIs for Microservices',            'Resource design, status codes, idempotency, content negotiation.',2,30, 10, false, true),
  ('ms-json-dtos',              'JSON, DTOs and Contracts',               'Why your wire format is a public API and how to evolve it.',     2, 25, 11, false, true),
  ('ms-openapi',                'OpenAPI / Swagger',                      'Specify-first development and contract testing.',                2, 25, 12, false, true),
  ('ms-inter-service-comm',     'Synchronous Inter-Service Calls',        'WebClient, RestTemplate, Feign — and the failure modes.',        2, 30, 13, false, true),
  ('ms-versioning',             'Versioning APIs',                        'URI, header, media-type. Backwards-compatible evolution.',       2, 20, 14, false, false),

  -- ── Level 3 — Practitioner
  ('ms-service-discovery',      'Service Discovery (Eureka)',             'How services find each other in a dynamic cluster.',             3, 35, 15, true,  true),
  ('ms-api-gateway',            'API Gateway (Spring Cloud Gateway)',     'The single front door — routing, auth, rate-limiting.',          3, 35, 16, true,  true),
  ('ms-config-server',          'Centralised Config (Spring Cloud Config)','Externalised configuration with hot refresh.',                  3, 25, 17, false, true),
  ('ms-circuit-breaker',        'Circuit Breaker (Resilience4j)',         'Fail fast, recover gracefully. The hystrix successor.',          3, 35, 18, true,  true),
  ('ms-distributed-tracing',    'Distributed Tracing (Sleuth + Zipkin)',  'Follow a request as it hops across services.',                   3, 30, 19, false, false),
  ('ms-centralised-logging',    'Centralised Logging (ELK stack)',        'One place to grep. Structured logs and correlation IDs.',        3, 25, 20, false, false),

  -- ── Level 4 — Advanced
  ('ms-event-driven',           'Event-Driven Architecture (Kafka)',      'From request/response to streams of facts.',                     4, 40, 21, true,  true),
  ('ms-saga-pattern',           'Saga Pattern',                           'Long-running business transactions without 2PC.',                4, 35, 22, true,  false),
  ('ms-cqrs',                   'CQRS and Event Sourcing',                'Separate writes from reads. Replay your history.',               4, 40, 23, false, false),
  ('ms-distributed-tx',         'Distributed Transactions',               'Why 2PC isn''t the answer. ACID vs BASE.',                       4, 30, 24, false, false),
  ('ms-outbox-pattern',         'Transactional Outbox Pattern',           'Reliable event publishing without dual-write.',                  4, 30, 25, true,  true),

  -- ── Level 5 — Expert
  ('ms-service-mesh',           'Service Mesh (Istio / Linkerd)',         'Pull cross-cutting concerns out of your apps.',                  5, 40, 26, true,  false),
  ('ms-k8s',                    'Kubernetes for Microservices',           'Deployments, services, ingress, autoscaling.',                   5, 50, 27, true,  true),
  ('ms-observability',          'Observability (Prometheus + Grafana)',   'Metrics, alerts, SLO/SLI/SLA, the three pillars.',               5, 40, 28, false, false)
) AS v(slug, title, description, level, mins, ord, viz, lab)
WHERE NOT EXISTS (SELECT 1 FROM topics t WHERE t.slug = v.slug);

-- ──────────────────────────────────────────────────────────────
-- 3. Hero topic #1 — "What is a Microservice?"
-- ──────────────────────────────────────────────────────────────

INSERT INTO lessons (id, topic_id, section_type, title, content_mdx, order_index, is_published)
SELECT gen_random_uuid(), t.id, 'why', 'Why it matters',
$WHY1$
# Why microservices matter

A **microservice** is a small, independently deployable service that owns one business
capability end-to-end. It speaks to the outside world through a versioned API and owns
its own data.

That sounds tame on paper. In practice, this architectural style reshapes:

- **How teams ship.** Each team owns a service. They release on their own cadence — no
  monthly "release train" with 14 squads queueing for merge.
- **How you scale.** The hot path (say, *search*) can run 80 replicas while *invoicing*
  runs 2. You scale the bottleneck, not the whole monolith.
- **How you fail.** A bug in *recommendations* won't take down *checkout* — provided you
  designed the failure boundaries properly. (Most teams get this part wrong on the first try.)
- **How you choose tools.** *Notifications* can be in Go with Redis; *billing* can be in
  Java with PostgreSQL. The contract is the API, not the runtime.

## The pain microservices solve

Two failure modes in large monoliths:

1. **The deployment bottleneck.** 30+ engineers landing code in one repo means painful
   merges, week-long QA cycles, and a release any one team can block.
2. **The coupling tax.** A change in the `Customer` class ripples through 14 unrelated
   modules. Engineers stop refactoring because the blast radius is unknowable.

Microservices trade *that* pain for **operational complexity**: now you have 30 services to
deploy, monitor, and debug across a network that fails silently. The exchange is only
worth it past a certain team size and traffic level — usually **>50 engineers** or
**>1M req/day**. Below that, a well-modularised monolith is faster and cheaper.

## Where this fits on your path

You'll move from "what is a service" → "how do they find each other" → "how do they
survive a partial outage" → "how do they coordinate work that spans multiple services".
By the end of this path you'll be able to design, ship and operate a small fleet of
services on Kubernetes with proper observability.
$WHY1$, 1, true
FROM topics t
WHERE t.slug='ms-intro'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.topic_id=t.id AND l.section_type='why');


INSERT INTO lessons (id, topic_id, section_type, title, content_mdx, order_index, is_published)
SELECT gen_random_uuid(), t.id, 'theory', 'Theory & Concepts',
$THEORY1$
# Defining a microservice

The most-cited definition is from **Sam Newman** (*Building Microservices*):

> *"Microservices are small, autonomous services that work together, modelled around
> a business domain."*

Unpacking each adjective:

## 1. Small

"Small" is a property of the **scope** and the **team**, not the lines of code.
A good rule of thumb: a single 2-pizza team should be able to **own**, **rewrite**,
and **operate** the service. If understanding the service requires three people on
a call, it's too big.

## 2. Autonomous

A service can be **deployed independently**. To deploy `orders` you do not need to
release `payments` at the same time. This is the single biggest payoff and the
single most common thing teams get wrong (they end up with a "distributed monolith"
where 5 services release together every Friday).

Autonomy implies:
- **No shared database.** Each service owns its tables. Cross-service reads happen via
  APIs or events, never via direct SQL.
- **Backwards-compatible APIs.** You can't coordinate releases, so you can't break
  callers.

## 3. Modelled around a business domain

Services follow **bounded contexts** from Domain-Driven Design — natural seams in the
business, *not* technical seams. A common anti-pattern is splitting by layer
(`/customer-api`, `/customer-service`, `/customer-db`); that gives you the worst of
both worlds.

## A picture

```mermaid
graph LR
  Browser[Mobile / Web] --> GW[API Gateway]
  GW --> Catalog[Catalog Service]
  GW --> Cart[Cart Service]
  GW --> Order[Order Service]
  Order --> Payment[Payment Service]
  Order --> Inventory[Inventory Service]
  Catalog --- CatalogDB[(Catalog DB)]
  Cart --- CartDB[(Cart Cache)]
  Order --- OrderDB[(Order DB)]
  Payment --- PaymentDB[(Payment DB)]
  Inventory --- InvDB[(Inventory DB)]
```

Each service has its **own** data store. The arrows are network calls — every one of
them can fail, be slow, or return stale data. Internalising that is the single most
important mental shift.

## The "8 fallacies of distributed computing"

Peter Deutsch's list — every microservice engineer should know it by heart:

1. The network is reliable.
2. Latency is zero.
3. Bandwidth is infinite.
4. The network is secure.
5. Topology doesn't change.
6. There is one administrator.
7. Transport cost is zero.
8. The network is homogeneous.

**All eight are false.** Every pattern in this learning path exists to compensate for one
or more of them. Service discovery exists because (5) is false. Circuit breakers exist
because (1) and (2) are false. The outbox pattern exists because (1) is false at the
moment you publish an event.

## A minimal Spring Boot microservice

```java
@SpringBootApplication
public class OrdersApplication {
  public static void main(String[] args) {
    SpringApplication.run(OrdersApplication.class, args);
  }
}

@RestController
@RequestMapping("/v1/orders")
class OrderController {
  private final OrderService orders;
  OrderController(OrderService orders) { this.orders = orders; }

  @PostMapping
  ResponseEntity<OrderView> create(@RequestBody @Valid CreateOrderRequest req) {
    Order o = orders.create(req);
    return ResponseEntity
        .created(URI.create("/v1/orders/" + o.id()))
        .body(OrderView.from(o));
  }

  @GetMapping("/{id}")
  OrderView get(@PathVariable UUID id) {
    return OrderView.from(orders.findById(id));
  }
}
```

This is technically a microservice if it owns the `orders` domain end-to-end and is
deployed independently. **Being small alone is not enough** — a service that shares
a database with `payments` is not autonomous and therefore not a microservice; it's a
shared library wearing a network address.
$THEORY1$, 2, true
FROM topics t
WHERE t.slug='ms-intro'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.topic_id=t.id AND l.section_type='theory');


INSERT INTO lessons (id, topic_id, section_type, title, content_mdx, order_index, is_published)
SELECT gen_random_uuid(), t.id, 'realworld', 'Real World',
$RW1$
# How real companies do it

## Netflix (the original poster child)

Netflix moved from a single Oracle-backed Java monolith to **~700 microservices** between
2009 and 2016. The migration was driven by a single database outage in 2008 that took
the whole site down for three days. Every Netflix product team owns a handful of services
deployed via Spinnaker; SRE provides the platform (Eureka, Hystrix, Zuul — all of which
became open-source standards).

**Key takeaway:** they invested 5+ years in *platform* (deploy, discovery, observability)
before they reached the smooth state we read about in blog posts.

## Amazon's "2-pizza teams"

Bezos famously mandated in 2002 that all internal teams expose their data through service
interfaces, and that no team should be larger than two pizzas can feed. That decree is what
later became AWS — the internal services were so well-designed they could be sold to
external customers.

## Uber's "Domain-Oriented Microservice Architecture"

After scaling to 2,200+ microservices and discovering it had over-decomposed, Uber moved
to **DOMA** — grouping services into a smaller number of cohesive domains (Rider,
Driver, Trip, Payments) with well-defined "layers" inside each. A cautionary tale: more
services ≠ better.

## When you should *not* go microservices

- **Team size < 20 engineers.** A modular monolith ships faster. Use Spring Modulith or
  similar packaging discipline.
- **No on-call culture yet.** Microservices fail in ways that page humans at 3 AM. If
  your org isn't ready for that, you'll have a worse experience than the monolith.
- **No CI/CD pipeline.** If you can't deploy a single service in under 15 minutes with
  zero downtime, you'll feel every cost of microservices and zero of the benefits.

## The "DevMastery" platform itself

This very platform was originally split into 6 microservices (auth, content, progress,
execution, ai-bot, search) — and then **consolidated into a modular monolith** because the
team is one person. The path you're on now exists *as* a monolith. That's not a failure;
it's the right choice for the size. Microservices are a tool, not a religion.
$RW1$, 3, true
FROM topics t
WHERE t.slug='ms-intro'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.topic_id=t.id AND l.section_type='realworld');


INSERT INTO lessons (id, topic_id, section_type, title, content_mdx, order_index, is_published)
SELECT gen_random_uuid(), t.id, 'interview', 'Interview Prep',
$INT1$
# Interview questions

## Q1 — Define a microservice in one sentence.

> A small, independently-deployable service that owns one business capability end-to-end,
> including its own data, and communicates with other services through versioned APIs or
> events.

The three keywords interviewers listen for: **independent deployment**, **owns its data**,
**single business capability**. Miss any one of those and you'll be asked a follow-up.

## Q2 — How do you decide service boundaries?

Use **bounded contexts** from DDD. Map the language the business uses ("order", "customer",
"shipment") and look for places where the same word means different things in different
parts of the org — those are boundaries. Avoid splitting by technical layer
(api/service/dao) — that yields distributed monoliths.

## Q3 — When would you choose a monolith over microservices?

- Team size below ~20 engineers.
- Low and predictable traffic.
- Single business domain with no clearly-separable subdomains.
- No mature CI/CD or observability platform.

Strong answers acknowledge that **modular monoliths** (e.g. Spring Modulith) capture
most of the architecture benefits without the operational cost.

## Q4 — What's a "distributed monolith"?

A system that has microservices but loses their key property — independent deployment.
Symptoms: services release together, share a database, share DTOs in a common JAR.
You pay the cost of microservices and reap none of the benefits.

## Q5 — Name three failure modes that don't exist in monoliths.

- **Network partitions:** a service is up but unreachable.
- **Cascading failures:** slow service A blocks all callers, which block all of *their*
  callers. (Solved by circuit breakers + timeouts.)
- **Inconsistent data:** writes succeed in service A and fail in service B because there's
  no shared transaction. (Solved by sagas / outbox.)

## Q6 — Spring Boot + Spring Cloud: which is which?

- **Spring Boot** = an opinionated way to package a Java app: auto-configuration,
  embedded Tomcat, sensible defaults. It does *not* know anything about microservices.
- **Spring Cloud** = a collection of libraries on top of Spring Boot for **microservice
  cross-cutting concerns**: discovery (Eureka/Consul), config (Config Server), gateway,
  resilience (Resilience4j), tracing (Sleuth).

You can write microservices in plain Spring Boot — Spring Cloud just gives you common
patterns out of the box.
$INT1$, 4, true
FROM topics t
WHERE t.slug='ms-intro'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.topic_id=t.id AND l.section_type='interview');


-- ──────────────────────────────────────────────────────────────
-- 4. Hero topic #2 — "Service Discovery (Eureka)"
-- ──────────────────────────────────────────────────────────────

INSERT INTO lessons (id, topic_id, section_type, title, content_mdx, order_index, is_published)
SELECT gen_random_uuid(), t.id, 'why', 'Why it matters',
$WHY2$
# Why service discovery matters

In a static deployment with two boxes, you hard-code `orders.example.com` and `payments.example.com`
and call it a day. In a microservices cluster, **instances appear and disappear constantly**:

- Auto-scaling brings up new replicas during peak hours.
- Rolling deployments kill old pods and replace them with new ones every few minutes.
- A failed health-check terminates an unhealthy instance — its IP is gone.
- Spot instances can vanish with 2-minute notice.

You **cannot** put a fresh IP address into config every time something rolls. You need a
**dynamic registry** that knows the live set of instances for each logical service, and
clients (or a gateway) that look it up at call time.

Service discovery is the answer. Without it, you cannot operate more than a handful of
services. With it, you can run thousands.
$WHY2$, 1, true
FROM topics t
WHERE t.slug='ms-service-discovery'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.topic_id=t.id AND l.section_type='why');


INSERT INTO lessons (id, topic_id, section_type, title, content_mdx, order_index, is_published)
SELECT gen_random_uuid(), t.id, 'theory', 'Theory & Concepts',
$THEORY2$
# How service discovery works

## The two flavours

### Client-side discovery (Eureka, Consul)

The **client** asks a registry for the list of healthy instances, picks one (round-robin,
weighted, etc.), and calls it directly.

```mermaid
sequenceDiagram
  participant C as Client (Order Service)
  participant R as Registry (Eureka)
  participant I as Inventory Instance #3
  C->>R: GET /apps/INVENTORY
  R-->>C: [10.0.1.4:8080, 10.0.1.5:8080, 10.0.1.6:8080]
  C->>C: load-balance, pick :8080 on 10.0.1.5
  C->>I: GET /v1/stock/SKU-42
  I-->>C: 200 OK {qty: 17}
```

**Pros:** simple to reason about, no extra network hop, client controls load-balancing.
**Cons:** every language needs a client library; if the registry is down you cache last
known and pray.

### Server-side discovery (Kubernetes Service, AWS ELB)

The **client** calls a fixed virtual IP. A load-balancer (kube-proxy, ELB) holds the
registry and forwards.

```mermaid
sequenceDiagram
  participant C as Client
  participant LB as Service VIP / LB
  participant I as Inventory Pod
  C->>LB: GET /v1/stock/SKU-42
  LB->>LB: lookup healthy pods for "inventory"
  LB->>I: forward request
  I-->>LB: 200 OK
  LB-->>C: 200 OK
```

**Pros:** language-agnostic, transparent to clients.
**Cons:** extra hop adds ~1 ms; LB itself becomes a critical dependency.

In Kubernetes, server-side discovery is built-in via the `Service` resource and DNS:
`inventory.default.svc.cluster.local` always resolves to a live pod. Most modern stacks use
this. **Eureka is mostly historical** but still common in legacy Spring Cloud installations
and worth knowing for interviews.

## How Eureka works

Eureka has two components:

1. **Eureka Server** — holds the registry. Usually run as a 3-node cluster (peers
   replicate to each other).
2. **Eureka Client** — embedded in every service. On startup it **registers** itself with
   the server, then **sends a heartbeat every 30 s**. If a heartbeat is missed for 90 s, the
   server **evicts** the instance.

Clients also **pull the registry every 30 s** and cache it locally. So even if the server
goes down, in-flight calls keep working — they just use slightly stale data. This is
deliberate: Eureka chose AP (availability + partition tolerance) over CP in CAP terms.

## Wiring it up in Spring

Server side (one Spring Boot app):

```java
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApp {
  public static void main(String[] args) {
    SpringApplication.run(EurekaServerApp.class, args);
  }
}
```

```yaml
# application.yml of the server
server:
  port: 8761
eureka:
  client:
    register-with-eureka: false
    fetch-registry: false
```

Client side (any service that wants to be discoverable):

```yaml
spring:
  application:
    name: inventory-service   # ← logical service ID in the registry
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

Just the dependency + this config is enough. Spring Cloud auto-registers on startup.

## Calling another service by name

With a load-balanced `WebClient`:

```java
@Configuration
class WebClientConfig {
  @Bean
  @LoadBalanced            // ← magic: enables service-name resolution
  WebClient.Builder webClientBuilder() {
    return WebClient.builder();
  }
}

@Service
class OrderService {
  private final WebClient web;
  OrderService(WebClient.Builder b) {
    this.web = b.baseUrl("http://inventory-service").build();
    //                              ^^^^^^^^^^^^^^^^^^
    //               This is the *service name*, not a host. Spring Cloud LoadBalancer
    //               resolves it through Eureka and picks a live instance.
  }

  Mono<StockView> checkStock(String sku) {
    return web.get().uri("/v1/stock/{sku}", sku)
              .retrieve()
              .bodyToMono(StockView.class);
  }
}
```

## Common gotchas

- **Heartbeat interval too long.** Default 30 s means a dead instance can take 90 s to be
  evicted. During that window, ~33% of calls fail. Lower it (down to 5 s) in latency-sensitive
  systems — at the cost of more registry traffic.
- **Self-preservation mode.** If too many heartbeats are missed at once (e.g. network blip),
  Eureka assumes the *network* is broken, not the instances, and **stops evicting**. This is
  good for stability but bad if your services *did* genuinely die. Tune `renewal-percent-threshold`.
- **Cache staleness during deploy.** A client may call an instance that the server has
  evicted but the client hasn't yet refreshed. Always combine discovery with a **circuit
  breaker + retry**.
$THEORY2$, 2, true
FROM topics t
WHERE t.slug='ms-service-discovery'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.topic_id=t.id AND l.section_type='theory');


INSERT INTO lessons (id, topic_id, section_type, title, content_mdx, order_index, is_published)
SELECT gen_random_uuid(), t.id, 'realworld', 'Real World',
$RW2$
# In production

## The single registry isn't enough

A single Eureka server is a single point of failure. Every production deployment runs at
least **3 peer nodes** in different availability zones. Peers replicate registrations to
each other — clients can talk to any one.

## Don't use Eureka in Kubernetes

If you're already on Kubernetes, **don't run Eureka.** Kubernetes Services already provide
discovery via DNS + kube-proxy. Running Eureka on top is duplicate plumbing that adds
failure modes. Use `inventory-service.default.svc.cluster.local` directly.

The exception: hybrid deployments where some services run on Kubernetes and others on
VMs — Eureka can be the bridge.

## Discovery in service meshes

Istio / Linkerd register sidecars automatically. From the application's point of view it
calls `http://inventory` and the sidecar handles discovery, retries, and mTLS. This is
where most large deployments are heading.

## A war story

A team I worked with had Eureka heartbeats at the default 30 s. They deployed a hotfix
that crashed `payments` on startup. Eureka evicted the instances after 90 s — but during
those 90 s, 100% of `/checkout` traffic went to dead instances. Circuit breakers (Resilience4j)
saved them — within 5 s the breaker tripped open and they fell back to a queued retry. The
incident never reached customers.

**Lesson:** discovery + circuit breakers are not optional features, they are partners.
$RW2$, 3, true
FROM topics t
WHERE t.slug='ms-service-discovery'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.topic_id=t.id AND l.section_type='realworld');


INSERT INTO lessons (id, topic_id, section_type, title, content_mdx, order_index, is_published)
SELECT gen_random_uuid(), t.id, 'interview', 'Interview Prep',
$INT2$
# Interview questions

## Q1 — Why can't services just use hard-coded URLs?

Instances are ephemeral. IPs change on every deploy, auto-scale event, and pod restart.
DNS alone is often not enough because TTLs cache stale records and standard DNS doesn't
do health-aware load-balancing.

## Q2 — Client-side vs server-side discovery — trade-offs?

| | Client-side (Eureka) | Server-side (k8s Service) |
|---|---|---|
| Extra hop | No | Yes (~1 ms) |
| Client library required | Yes (per language) | No |
| Load-balancing control | Client | LB |
| Resilient if registry down | Cached registry on client | Depends on LB |
| Typical in 2026 | Legacy Spring stacks | Kubernetes-native |

## Q3 — What is CAP and where does Eureka sit?

Consistency, Availability, Partition-tolerance — pick two during a network partition.
**Eureka chose AP**: clients keep working off stale data when the registry is unreachable,
at the cost of seeing instances that no longer exist.
**Consul / etcd chose CP**: they refuse reads/writes during a partition rather than serve
stale data.

For service discovery, AP is almost always the right choice because false-stale data is
fixed cheaply (a retry + circuit breaker), while refusing to serve traffic during a partition
is catastrophic.

## Q4 — How would you migrate from Eureka to Kubernetes-native discovery?

1. Deploy services into Kubernetes alongside the existing Eureka cluster.
2. Have services keep registering with Eureka **and** be reachable via a k8s Service.
3. Migrate clients one at a time to use the k8s DNS name.
4. Once all clients are migrated, stop registering with Eureka and tear it down.

This is a classic **strangler-fig migration** — replace one slice at a time, run both for
a while, then remove the old one.

## Q5 — What's "self-preservation mode" and when does it backfire?

If Eureka sees more than ~15% of clients missing heartbeats simultaneously, it assumes its
own connection to clients is broken (network issue) and **stops evicting** any instances.
This protects against false eviction during a partition, but it also means that if you have
a real mass outage, dead instances stay in the registry. Tune
`eureka.server.enable-self-preservation` and the threshold based on your fleet size.
$INT2$, 4, true
FROM topics t
WHERE t.slug='ms-service-discovery'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.topic_id=t.id AND l.section_type='interview');


-- ──────────────────────────────────────────────────────────────
-- 5. Hero topic #3 — "Circuit Breaker (Resilience4j)"
-- ──────────────────────────────────────────────────────────────

INSERT INTO lessons (id, topic_id, section_type, title, content_mdx, order_index, is_published)
SELECT gen_random_uuid(), t.id, 'why', 'Why it matters',
$WHY3$
# Why circuit breakers matter

Picture a busy checkout service that calls `payments` for every order. `payments` starts
returning in 5 s instead of 50 ms because its database is slow.

Without protection:

1. Checkout's HTTP client waits the full 5 s per request.
2. Tomcat's worker threads pile up waiting for responses.
3. After ~30 s, **every worker thread in checkout is blocked on payments.**
4. New requests can't get a thread — checkout now serves 503.
5. The load-balancer marks checkout unhealthy; traffic shifts to other replicas.
6. **Those** fill up too. The whole site is down.

This is a **cascading failure** — one slow dependency took down healthy services
that were never directly at fault. It is the #1 way distributed systems die.

A **circuit breaker** sits between checkout and payments. When it observes failures
beyond a threshold, it **trips open** — subsequent calls fail immediately (1 ms, no thread
held) instead of waiting. After a cooldown, it lets a small number of probe calls through;
if they succeed, the circuit closes. Checkout stays responsive, the operator gets
paged, and the blast radius is contained.

Without circuit breakers you don't really have microservices — you have a row of dominoes.
$WHY3$, 1, true
FROM topics t
WHERE t.slug='ms-circuit-breaker'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.topic_id=t.id AND l.section_type='why');


INSERT INTO lessons (id, topic_id, section_type, title, content_mdx, order_index, is_published)
SELECT gen_random_uuid(), t.id, 'theory', 'Theory & Concepts',
$THEORY3$
# The circuit breaker pattern

## The state machine

A circuit breaker is a tiny state machine with three states:

```mermaid
stateDiagram-v2
  [*] --> Closed
  Closed --> Open: failure rate ≥ threshold
  Open --> HalfOpen: after wait-duration
  HalfOpen --> Closed: probe calls succeed
  HalfOpen --> Open: probe calls fail
```

- **Closed.** Calls flow through. The breaker counts successes and failures in a sliding
  window. If the failure rate exceeds the configured threshold (typically 50% over the
  last 100 calls), it trips → **Open**.
- **Open.** Calls fail immediately without touching the downstream service. They return
  a `CallNotPermittedException` (or a fallback you've defined). After a wait-duration
  (typically 30 s) the breaker moves → **Half-Open**.
- **Half-Open.** A configurable number of probe calls (e.g. 5) are allowed through. If
  they mostly succeed, the breaker returns to **Closed**; if they fail, back to **Open**.

The genius of half-open is that you **don't punish a recovered service with a flood of
queued traffic**. You probe gently first.

## Resilience4j

Resilience4j is the modern successor to Netflix Hystrix (which is in maintenance mode
since 2018). It's lightweight (no thread pool by default), functional, and integrates
with Spring Boot, Reactor, and CompletableFuture.

### Configuration

```yaml
# application.yml
resilience4j:
  circuitbreaker:
    instances:
      payments:
        sliding-window-type: COUNT_BASED
        sliding-window-size: 100
        failure-rate-threshold: 50         # %
        slow-call-rate-threshold: 80       # %
        slow-call-duration-threshold: 2s
        wait-duration-in-open-state: 30s
        permitted-number-of-calls-in-half-open-state: 5
        minimum-number-of-calls: 20        # ignore until we have stats
  timelimiter:
    instances:
      payments:
        timeout-duration: 3s
```

Key knobs:

- `sliding-window-size` — how many calls form the rolling stats window. Too small =
  jittery (one bad batch flips the breaker). Too large = sluggish to react.
- `minimum-number-of-calls` — ignore the threshold until at least this many calls have
  happened. Prevents tripping on the first 2/3 failures during startup.
- `slow-call-rate-threshold` — *slow* calls also count toward tripping the breaker, not
  just *failed* ones. Critical for the cascading-failure scenario above where everything
  is "slow but successful" until threads run out.

### Wrapping a call

```java
@Service
class PaymentClient {
  private final WebClient web;
  private final CircuitBreaker breaker;
  private final TimeLimiter   limiter;

  PaymentClient(WebClient.Builder b,
                CircuitBreakerRegistry cbReg,
                TimeLimiterRegistry tlReg) {
    this.web     = b.baseUrl("http://payments").build();
    this.breaker = cbReg.circuitBreaker("payments");
    this.limiter = tlReg.timeLimiter("payments");
  }

  CompletableFuture<PaymentResult> charge(ChargeRequest req) {
    Supplier<CompletableFuture<PaymentResult>> call = () ->
        web.post().uri("/v1/charges")
           .bodyValue(req)
           .retrieve()
           .bodyToMono(PaymentResult.class)
           .toFuture();

    // Wrap with time-limiter, then circuit-breaker, then fallback
    return Decorators.ofSupplier(call)
        .withCircuitBreaker(breaker)
        .withFallback(List.of(CallNotPermittedException.class, TimeoutException.class),
                      ex -> CompletableFuture.completedFuture(PaymentResult.queued(req.id())))
        .get();
  }
}
```

### The annotation-driven shortcut

```java
@CircuitBreaker(name = "payments", fallbackMethod = "fallbackCharge")
@TimeLimiter   (name = "payments")
public CompletableFuture<PaymentResult> charge(ChargeRequest req) {
  return web.post().uri("/v1/charges").bodyValue(req).retrieve()
            .bodyToMono(PaymentResult.class).toFuture();
}

private CompletableFuture<PaymentResult> fallbackCharge(ChargeRequest req, Throwable ex) {
  log.warn("payments unavailable, queuing charge", ex);
  return CompletableFuture.completedFuture(PaymentResult.queued(req.id()));
}
```

The fallback **must** have the same signature plus a trailing `Throwable` (or specific
exception type). The fallback is your chance to:

- Return cached data.
- Return a "deferred" or "queued" response.
- Switch to a slower-but-working backup.
- Return a polite 503 with a `Retry-After`.

What the fallback should **never** do: call the same downstream service (infinite recursion)
or throw a different exception that lets the outage propagate.

## Pairing with retries

A common pattern:

```mermaid
graph LR
  A[Caller] --> B[Retry: 3x with backoff]
  B --> C[Circuit Breaker]
  C --> D[Time Limiter]
  D --> E[Bulkhead]
  E --> F[Downstream]
```

Order matters: **retry inside breaker**, not outside. If you retry outside the breaker,
each retry consumes one breaker slot — your circuit trips on a single user's bad luck
rather than on a real outage.
$THEORY3$, 2, true
FROM topics t
WHERE t.slug='ms-circuit-breaker'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.topic_id=t.id AND l.section_type='theory');


INSERT INTO lessons (id, topic_id, section_type, title, content_mdx, order_index, is_published)
SELECT gen_random_uuid(), t.id, 'realworld', 'Real World',
$RW3$
# In production

## What a real failure looks like

A typical incident timeline with circuit breakers:

- **t=0.** Downstream service `payments` DB starts hitting connection-pool limits.
  P99 latency goes from 50 ms → 2 s.
- **t=10s.** Resilience4j's slow-call detector picks it up. Slow-call rate climbs past 80%.
- **t=15s.** Breaker trips open. New calls fail in 1 ms with a queued fallback.
- **t=15s.** PagerDuty fires on the metric `resilience4j_circuitbreaker_state{name="payments"} == 1`.
- **t=2 min.** On-call engineer rotates the DB connection pool. `payments` recovers.
- **t=2 min 45s.** Breaker enters half-open, probes succeed, breaker closes.
- **t=3 min.** Normal traffic resumes. Queued charges drain through the fallback.

Total customer-visible impact: charges took an extra ~2 minutes to settle. Without the
breaker, checkout would have been down for the full 2 min 45 s.

## Metrics to alert on

Wire Resilience4j to Micrometer → Prometheus:

```java
@Bean
TaggedCircuitBreakerMetrics circuitBreakerMetrics(
    CircuitBreakerRegistry registry, MeterRegistry meters) {
  return TaggedCircuitBreakerMetrics
      .ofCircuitBreakerRegistry(registry)
      .bindTo(meters);
}
```

Useful alerts:

- `resilience4j_circuitbreaker_state{state="open"} > 0` — page immediately.
- `rate(resilience4j_circuitbreaker_calls_total{kind="failed"}[5m]) > 0.2 * total` —
  warning before tripping.
- Half-open transitions per hour — frequent flapping indicates wrong thresholds.

## Common mistakes

1. **No fallback.** The breaker trips but throws — caller still 5xx's. Always define a
   fallback even if it's "return cached + log."
2. **Same breaker for many endpoints.** One slow endpoint trips the breaker for *all* calls
   to that service. Use one breaker per `(service, operation)` for fine-grained protection.
3. **Threshold too tight.** A 5% failure threshold trips constantly on normal noise (timeouts,
   404s, etc.). 50% is the documented default for a reason.
4. **No `minimum-number-of-calls`.** First 3 calls fail (typical for cold start), breaker
   trips before the service is really up.
5. **Treating 4xx as failure.** A 400 Bad Request from the caller's own malformed payload
   is not the downstream service's fault and shouldn't count toward tripping. Use
   `recordExceptions` / `ignoreExceptions` to be specific.
$RW3$, 3, true
FROM topics t
WHERE t.slug='ms-circuit-breaker'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.topic_id=t.id AND l.section_type='realworld');


INSERT INTO lessons (id, topic_id, section_type, title, content_mdx, order_index, is_published)
SELECT gen_random_uuid(), t.id, 'interview', 'Interview Prep',
$INT3$
# Interview questions

## Q1 — What problem does a circuit breaker solve?

Cascading failures. A single slow or failing downstream dependency would otherwise consume
all threads/connections in upstream services, taking them down. The breaker fails fast
when it sees the downstream is unhealthy, freeing resources upstream.

## Q2 — Walk me through the three states.

- **Closed:** calls flow through, breaker watches the failure rate.
- **Open:** all calls fail immediately. After a wait-duration, transitions to half-open.
- **Half-Open:** allows a small number of probes. Success → closed. Failure → back to open.

The half-open state matters because it prevents flooding a recovered service.

## Q3 — Why is timeout configuration separate from the breaker?

A request that takes 30 s without a timeout looks "in flight" — never counts as a failure
until something else (TCP keepalive, client cancellation) breaks it. You need a **time
limiter** wrapping the call so that long calls are *converted* to failures the breaker
can observe. Resilience4j ships these as separate, composable modules.

## Q4 — Retry vs circuit breaker — when to use which?

- **Retry** handles **transient** failures: brief network blip, single replica restart.
  Always with **exponential backoff and jitter** to avoid retry storms.
- **Circuit breaker** handles **sustained** failures: downstream actually down or slow.
  Stops you wasting work.

Use both, with retry **inside** the breaker. A handful of retries shouldn't trip the breaker
on one user's bad luck; only sustained failure should.

## Q5 — How would you test a circuit breaker?

- **Unit:** force a `CircuitBreaker` to open via `transitionToOpenState()` and assert the
  fallback runs.
- **Integration:** with WireMock, simulate the downstream returning 5xx for the first N
  calls, assert the breaker opens after the threshold and the fallback is used.
- **Production:** chaos engineering. Tools like Chaos Monkey or Gremlin can inject latency
  or 5xx into a percentage of traffic on staging to verify the breaker behaves under load.

## Q6 — Hystrix vs Resilience4j?

- **Hystrix:** Netflix, in maintenance mode since 2018. Used thread-pool isolation by
  default (one pool per dependency), which adds context switches.
- **Resilience4j:** lightweight, functional, composable modules (CircuitBreaker, Retry,
  RateLimiter, Bulkhead, TimeLimiter), no thread-pool by default. Recommended for new code.

If interviewing for a legacy Spring Cloud Netflix stack you may still encounter Hystrix —
know the migration path.
$INT3$, 4, true
FROM topics t
WHERE t.slug='ms-circuit-breaker'
  AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.topic_id=t.id AND l.section_type='interview');


-- ──────────────────────────────────────────────────────────────
-- 6. Bookkeeping — log this migration
-- ──────────────────────────────────────────────────────────────

-- (Flyway updates flyway_schema_history automatically.)

