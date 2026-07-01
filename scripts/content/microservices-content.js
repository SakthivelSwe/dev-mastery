/**
 * microservices-content.js
 * High-quality FEYNMAN, BUILD, and SPACED REVIEW sections for all 28 microservices topics.
 * Used by: node scripts/writeSections.js microservices
 */
module.exports = {

  'ms-intro': {
    feynman: `## FEYNMAN CHECK

### Explain Microservices Like I'm 10 Years Old
> Imagine a giant Lego castle made from one solid block — if one tower breaks, you have to rebuild the whole castle. A monolith is that single block. Microservices break the castle into connected pieces — each piece built, fixed, and scaled separately. The tricky part: pieces talk through bridges (network calls) that can fail. When a bridge falls, the kitchen can't tell the dining room there's food. This is why Netflix has entire teams just maintaining the bridges between services — the castle is more flexible, but the bridges are where most complexity lives.

---

### 5 Deep Conceptual Questions

**Q1: What problem do microservices fundamentally solve that better code organisation in a monolith cannot?**
> **A:** Independent deployment cadence and independent scaling. Even a perfectly modular monolith has one CI/CD pipeline, one deployment artifact, and one process to scale. When teams need different release schedules (payments team deploys 50× per day; reports team deploys monthly), or different scaling profiles (checkout needs 100× compute on Black Friday while admin doesn't), a monolith cannot satisfy both without wasteful over-provisioning. Microservices give you the two degrees of freedom — deploy cadence and scaling profile — that no monolith can offer regardless of code organisation.

**Q2: What is the ONE mental model for understanding microservices complexity?**
> **A:** "Every in-process method call that was safe and fast is now a network call that can fail, timeout, return stale data, and adds latency." The entire microservices pattern catalogue (circuit breakers, retries, sagas, outbox, distributed tracing) exists to handle the consequences of this one transformation. Method calls cannot fail with a network timeout; network calls can. Method calls are part of the same transaction; network calls are not. This mental model makes every microservices pattern decision obvious: you need circuit breakers because network calls can fail slowly; you need sagas because network calls break ACID guarantees.

**Q3: What is the most dangerous microservices misconception? Show it with code.**
> **A:** That adding microservices automatically improves reliability.
> \`\`\`java
> // ❌ 5-service synchronous chain — reliability DECREASES
> // Each service at 99.9% availability:
> // System availability = 0.999^5 = 99.5% = 43.8 hours downtime/year
> // vs monolith at 99.9% = 8.7 hours/year
>
> // ✅ Microservices improve reliability ONLY with:
> // 1. Circuit breakers on every call
> // 2. Async events for non-critical paths
> // 3. Graceful degradation (return cached/default when dependency is down)
> \`\`\`

**Q4: How does the CAP theorem apply to microservices?**
> **A:** Each microservice is its own bounded system that can choose its CAP trade-off independently. An inventory service might choose CP (consistent and partition-tolerant) — it would rather return an error than show incorrect stock levels. A recommendations service might choose AP (available and partition-tolerant) — stale recommendations are better than no recommendations. The database-per-service pattern enables this: each service picks the database (SQL vs NoSQL) and consistency model appropriate for its data. The cross-service challenge: when a business operation spans multiple services, there is no global ACID transaction. You're always in the "P" partition scenario across service boundaries, forcing a choice between C and A at the system level.

**Q5: One-sentence definition of microservices for a senior FAANG engineer.**
> **A:** "A microservices architecture decomposes a system into independently-deployable, loosely-coupled services, each owning a bounded context (DDD), a private data store (database-per-service), and a stable versioned contract (REST/Kafka) — enabling independent team velocity and scaling at the cost of distributed-system complexity that mandates investment in circuit breakers, sagas, outbox patterns, distributed tracing, and operational tooling before the team-coordination savings exceed the operational overhead, which occurs approximately at the 30-50 engineer crossover point."`,

    build: `## BUILD

### 🏗️ Mini Project: Two Microservices in Docker Compose

**What you will build:** A \`user-service\` and \`order-service\` running in Docker Compose that communicate via REST, demonstrating the core microservices operational challenge: independent processes, separate ports, service discovery by name.
**Why this project:** Makes the theoretical "network call instead of method call" tangible — you'll see latency, you'll see what happens when user-service is stopped, and you'll understand why circuit breakers exist.
**Time estimate:** 45 minutes

---

#### Step 1 — Project Setup
\`\`\`bash
mkdir ms-demo && cd ms-demo
mkdir user-service order-service
# Each is a Spring Boot project (use Spring Initializr with: Web, Actuator)
cat > docker-compose.yml << 'EOF'
version: "3.9"
services:
  user-service:
    build: ./user-service
    ports: ["8081:8080"]
    healthcheck:
      test: ["CMD","curl","-f","http://localhost:8080/actuator/health"]
      interval: 5s
      retries: 5
  order-service:
    build: ./order-service
    ports: ["8082:8080"]
    environment:
      USER_SERVICE_URL: http://user-service:8080
    depends_on:
      user-service:
        condition: service_healthy
EOF
\`\`\`

#### Step 2 — User Service
\`\`\`java
@SpringBootApplication
public class UserServiceApp { public static void main(String[] a) { SpringApplication.run(UserServiceApp.class, a); } }

@RestController @RequestMapping("/users")
class UserController {
    private final Map<Long, User> users = Map.of(1L, new User(1L, "alice@x.com", "Alice"));
    @GetMapping("/{id}") public ResponseEntity<User> get(@PathVariable long id) {
        return Optional.ofNullable(users.get(id)).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
record User(long id, String email, String name) {}
\`\`\`

#### Step 3 — Order Service Calling User Service
\`\`\`java
@SpringBootApplication
public class OrderServiceApp { public static void main(String[] a) { SpringApplication.run(OrderServiceApp.class, a); }
    @Bean RestClient userClient(@Value("\${USER_SERVICE_URL}") String url) {
        return RestClient.builder().baseUrl(url).build();
    }
}

@RestController @RequestMapping("/orders")
class OrderController {
    private final RestClient userClient;
    OrderController(RestClient u) { this.userClient = u; }

    @PostMapping
    public Order place(@RequestBody PlaceOrder req) {
        User user = userClient.get().uri("/users/{id}", req.userId()).retrieve().body(User.class);
        return new Order(System.nanoTime(), user.id(), user.email(), req.sku());
    }
}
record Order(long id, long userId, String userEmail, String sku) {}
record PlaceOrder(long userId, String sku) {}
record User(long id, String email, String name) {}
\`\`\`

#### Step 4 — Error Handling
\`\`\`java
@RestControllerAdvice class ErrorHandler {
    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String,String>> handle(Exception e) {
        if (e.getMessage().contains("Connection refused") || e.getMessage().contains("unreachable"))
            return ResponseEntity.status(503).body(Map.of("error","user-service unavailable"));
        return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
}
\`\`\`

#### Step 5 — Tests
\`\`\`bash
docker compose up --build -d
curl -X POST http://localhost:8082/orders -H "Content-Type: application/json" -d '{"userId":1,"sku":"SKU-42"}'
# → {"id":...,"userId":1,"userEmail":"alice@x.com","sku":"SKU-42"}

docker compose stop user-service
curl -X POST http://localhost:8082/orders -d '{"userId":1,"sku":"SKU-42"}'
# → 503 {"error":"user-service unavailable"}
\`\`\`

**Expected Output:**
\`\`\`
[user-service] Started in 1.8s on port 8080
[order-service] Started in 1.9s on port 8080
POST /orders → 200 {"id":...,"userEmail":"alice@x.com","sku":"SKU-42"}
(after stopping user-service)
POST /orders → 503 {"error":"user-service unavailable"}
\`\`\`

**Stretch Challenges:**
- [ ] Add Resilience4j circuit breaker so order-service fails fast instead of timing out
- [ ] Add a third notification-service that receives Kafka events when orders are placed
- [ ] Add OpenTelemetry tracing to see the request flow in Jaeger`,

    spacedReview: `## SPACED REVIEW

> **How to use:** Answer each question from memory before reading ahead.

---

### Day 1 — Recall

**Q1:** Define a microservice in one sentence including: what it IS, how it differs from a monolith, and when you'd use it.

**Q2:** What are the 8 pillars of a "real" microservice (single capability, own data store, independently deployable, ...)? Name at least 6.

**Q3:** Write the minimal Spring Boot microservice that exposes GET /products/{id}. No autocomplete.

---

### Day 3 — Comprehension

**Q4:** Compare in-process method calls vs. inter-service REST calls. List 5 ways they differ (latency, failure modes, consistency, observability, security).

**Q5:** What is the crossover point (team size) where microservices benefits typically exceed costs? What 3 prerequisites must exist before that crossover becomes valid?

**Q6:** Refactor this monolith endpoint to describe how it would be split into microservices:
\`\`\`java
@GetMapping("/profile/{userId}")
public UserProfile getProfile(long userId) {
    User user = userRepo.findById(userId);
    List<Order> orders = orderRepo.findByUserId(userId);
    Subscription sub = subRepo.findByUserId(userId);
    return new UserProfile(user, orders, sub);
}
\`\`\`

---

### Day 7 — Application

**Q7:** Build a 2-service system (catalog + cart) where cart calls catalog to validate products. Handle the catalog-down case gracefully.

**Q8:** A PR adds a 6th synchronous downstream call to an already 3-hop chain. The code works in tests. Explain the production failure mode and fix.

**Q9:** What 4 infrastructure components are mandatory before deploying any microservices to production? Why is each non-negotiable?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Classic interview: *"When would you choose microservices over a monolith? Walk through your decision criteria."*

**Q11:** Draw a microservices architecture for an e-commerce checkout (user validation, inventory check, payment, order creation, notification). Mark each interaction as sync or async and justify.

**Q12:** ★ System design: *"Netflix streams to 200M users with 1000+ microservices. A new engineer joins and wants to add a recommendation feature. Walk them through: which team owns it, how it gets data, how it publishes results, and what happens when it goes down."*`
  },

  'ms-circuit-breaker': {
    feynman: `## FEYNMAN CHECK

### Explain Circuit Breakers Like I'm 10 Years Old
> Imagine your house has an electrical circuit breaker. If too much current flows (a device breaks), the breaker trips — cutting power to that circuit so it doesn't burn your house down. Then you can fix the broken device and reset the breaker. **A software circuit breaker works the same way.** When a service (the "broken device") starts failing or responding slowly, the circuit breaker trips — stopping your service from calling the broken one. Instead of waiting 30 seconds for each failed request, you immediately return a fallback response. After a recovery period, the breaker allows a few test calls. If they succeed, it resets. This is why Netflix doesn't go completely dark when one of their 1000 services has a problem.

---

### 5 Deep Conceptual Questions

**Q1: Why can't you just use timeouts instead of circuit breakers?**
> **A:** Timeouts prevent any single request from waiting forever, but they don't prevent your service from continuing to hammer the failing downstream service. If payment-service is down and takes 10 seconds before timing out, and you're receiving 500 requests/second, you have 5,000 concurrent threads all waiting for payment-service — exhausting your thread pool and causing your service to appear down to its own callers. The circuit breaker solves this by detecting the pattern of failures and immediately returning a fallback response (in microseconds, not 10 seconds) for all subsequent calls while the downstream recovers. Timeouts and circuit breakers are complementary: timeouts define how long to wait; circuit breakers decide whether to attempt the call at all.

**Q2: What is the ONE mental model for circuit breaker states?**
> **A:** "Traffic light for service calls: CLOSED = green (normal flow), OPEN = red (stop, use fallback), HALF-OPEN = yellow (one test car gets through)." CLOSED is the normal state — all calls go through. When failures exceed the threshold (e.g., 50% of last 100 calls failed), it transitions to OPEN — all calls immediately return the fallback without attempting the network call. After a configured wait time (e.g., 30 seconds), it transitions to HALF-OPEN — a limited number of trial calls go through. If they succeed, it transitions back to CLOSED. If they fail, it goes back to OPEN. The wait time gives the downstream service time to recover before you try again.

**Q3: What is the most dangerous circuit breaker misconception? Show it with code.**
> **A:** The misconception that a circuit breaker makes your service resilient without a fallback.
> \`\`\`java
> // ❌ Circuit breaker with no fallback — just throws exception faster
> @CircuitBreaker(name = "payment-service")
> public Payment charge(long userId, long cents) {
>     return paymentClient.charge(userId, cents);
>     // When circuit opens: throws CallNotPermittedException
>     // Caller gets a 500 error — same outcome as the slow failure, just faster
> }
>
> // ✅ Circuit breaker WITH fallback — graceful degradation
> @CircuitBreaker(name = "payment-service", fallbackMethod = "chargeFallback")
> public Payment charge(long userId, long cents) {
>     return paymentClient.charge(userId, cents);
> }
>
> public Payment chargeFallback(long userId, long cents, Exception e) {
>     // Queue for retry when payment-service recovers
>     pendingChargeQueue.add(new PendingCharge(userId, cents));
>     return Payment.pending("QUEUED_WHEN_PAYMENT_SERVICE_DOWN");
> }
> \`\`\`

**Q4: How does a circuit breaker interact with the thread pool and bulkhead patterns?**
> **A:** Circuit breakers prevent calls to a failing service, but they don't prevent thread pool exhaustion before the circuit opens. During the time between "service starts degrading" and "circuit opens," requests pile up waiting for the timeout. The bulkhead pattern complements the circuit breaker by limiting the concurrent calls to any one downstream service — if payment-service is slow, it can only consume a fixed number of threads (e.g., 10) regardless of total incoming load. Combined: circuit breaker opens when the bulkhead's threads are consistently failing or timing out; the bulkhead prevents payment-service slowness from consuming all your threads before the circuit can open. Resilience4j implements both: \`@CircuitBreaker\` + \`@Bulkhead\`.

**Q5: One-sentence definition of circuit breaker for a senior FAANG engineer.**
> **A:** "A circuit breaker is a stateful proxy around a remote call that tracks success/failure rates in a sliding window, transitions through CLOSED (normal), OPEN (fail fast with fallback), and HALF-OPEN (probe for recovery) states based on configurable thresholds — preventing cascade failures by stopping thread-pool exhaustion and latency amplification while allowing the downstream service time to recover, implemented in Resilience4j via \`@CircuitBreaker\` with \`failureRateThreshold\`, \`waitDurationInOpenState\`, and \`permittedCallsInHalfOpenState\` configuration."`,

    build: `## BUILD

### 🏗️ Mini Project: Circuit Breaker Demo With Fallback

**What you will build:** A Spring Boot service calling a "flaky" downstream service, wrapped with a Resilience4j circuit breaker that opens after 3 consecutive failures and returns a cached fallback response.
**Why this project:** Forces you to observe the circuit state transitions in real time — the most effective way to understand the CLOSED→OPEN→HALF-OPEN cycle.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir circuit-breaker-demo && cd circuit-breaker-demo
# build.gradle.kts dependencies:
# implementation("io.github.resilience4j:resilience4j-spring-boot3:2.2.0")
# implementation("org.springframework.boot:spring-boot-starter-web")
# implementation("org.springframework.boot:spring-boot-starter-actuator")
# implementation("org.springframework.boot:spring-boot-starter-aop")
\`\`\`

#### Step 2 — Flaky Downstream Simulator
\`\`\`java
@SpringBootApplication
public class App { public static void main(String[] a) { SpringApplication.run(App.class, a); } }

@RestController @RequestMapping("/external")
class FlakeyService {
    private final java.util.concurrent.atomic.AtomicInteger callCount = new java.util.concurrent.atomic.AtomicInteger(0);
    @GetMapping("/data")
    public String getData() {
        int count = callCount.incrementAndGet();
        if (count % 4 != 0) throw new RuntimeException("Simulated failure (call #" + count + ")");
        return "Success on call #" + count;
    }
}
\`\`\`

#### Step 3 — Circuit Breaker Configuration
\`\`\`yaml
# application.yml
resilience4j:
  circuitbreaker:
    instances:
      external-service:
        slidingWindowSize: 5
        minimumNumberOfCalls: 3
        failureRateThreshold: 60    # 60% failures → OPEN
        waitDurationInOpenState: 10s
        permittedNumberOfCallsInHalfOpenState: 2
\`\`\`

\`\`\`java
@Service
class DataService {
    private final RestClient client = RestClient.builder().baseUrl("http://localhost:8080/external").build();

    @CircuitBreaker(name = "external-service", fallbackMethod = "fallbackData")
    public String getData() {
        return client.get().uri("/data").retrieve().body(String.class);
    }

    public String fallbackData(Exception e) {
        return "FALLBACK: using cached data (circuit open or error: " + e.getClass().getSimpleName() + ")";
    }
}

@RestController @RequestMapping("/api")
class ApiController {
    private final DataService service;
    ApiController(DataService s) { this.service = s; }
    @GetMapping("/data") public String get() { return service.getData(); }
}
\`\`\`

#### Step 4 — Error Handling + Observability
\`\`\`yaml
# application.yml additions
management:
  endpoints.web.exposure.include: health,circuitbreakers
  endpoint.circuitbreakers.enabled: true
\`\`\`
\`\`\`bash
# Monitor circuit state in real time:
watch -n 1 'curl -s http://localhost:8080/actuator/circuitbreakers | python3 -m json.tool'
\`\`\`

#### Step 5 — Tests
\`\`\`bash
# Call 10 times rapidly — watch circuit open then use fallback:
for i in {1..10}; do echo -n "Call $i: "; curl -s http://localhost:8080/api/data; echo; done

# Expected sequence:
# Call 1: Simulated failure → throws → fallback
# Call 2: Simulated failure → throws → fallback
# Call 3: Simulated failure → throws → fallback (circuit opens after 3/5 fail)
# Call 4: FALLBACK: using cached data (circuit open or error: CallNotPermittedException)
# ...wait 10 seconds...
# Call N: circuit HALF-OPEN, trial call succeeds → CLOSED
\`\`\`

**Expected Output:**
\`\`\`
Call 1: FALLBACK: using cached data (circuit open or error: RuntimeException)
Call 4: FALLBACK: using cached data (circuit open or error: CallNotPermittedException)
(After 10s) Call N: Success on call #4  ← circuit recovered!
\`\`\`

**Stretch Challenges:**
- [ ] Add Micrometer metrics to track circuit state transitions in Grafana
- [ ] Add a retry policy before the circuit breaker to handle transient failures
- [ ] Implement a bulkhead (ThreadPoolBulkhead) limiting concurrent calls to 5`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall

**Q1:** Name the 3 circuit breaker states and the transition conditions between each.

**Q2:** What problem does a circuit breaker solve that a timeout alone cannot?

**Q3:** Write a \`@CircuitBreaker\` annotation with \`failureRateThreshold=50\` and a fallback method. No IDE.

### Day 3 — Comprehension

**Q4:** A payment service degrades to 8-second response times. Walk through exactly what happens to your order service's thread pool without a circuit breaker.

**Q5:** What is the difference between \`failureRateThreshold\` and \`slowCallRateThreshold\` in Resilience4j?

**Q6:** Design a fallback strategy for a product catalog circuit breaker. What do you return when the circuit is open?

### Day 7 — Application

**Q7:** Build a circuit breaker around an HTTP client call with: 50% failure threshold, 30s wait in open state, 3 test calls in half-open. Observe state transitions.

**Q8:** A circuit breaker is permanently open (never recovers). List 5 possible causes and how to diagnose each.

**Q9:** What is the time complexity of circuit breaker state evaluation? How does the sliding window size affect memory and CPU usage?

### Day 14 — Synthesis

**Q10:** ★ Classic interview: *"Explain the circuit breaker pattern. How do you configure it for a payment service that must be highly available?"*

**Q11:** Draw the interaction between circuit breaker, retry policy, timeout, and bulkhead. In what order should they be applied?

**Q12:** ★ System design: *"You have 30 microservices. Service A calls B, C, and D synchronously. B calls E and F. Design the circuit breaker topology to prevent a failure in F from taking down A."*`
  },

  'ms-event-driven': {
    feynman: `## FEYNMAN CHECK

### Explain Event-Driven Architecture Like I'm 10 Years Old
> Imagine a school PA system. When the principal announces "Lunch is ready!", the cafeteria staff don't have to call every classroom individually. Anyone who cares about lunch (students, teachers) just listens and reacts. **That's event-driven architecture.** The order service announces "Order Placed!" to the PA system (Kafka topic). The shipping service, notification service, and analytics service all listen and react independently. If the notification service is asleep, it wakes up later and catches the announcement from the recording (Kafka's durable log). The key: the order service doesn't know or care who's listening — it just announces the event and moves on, making it fast and decoupled.

---

### 5 Deep Conceptual Questions

**Q1: What fundamental problem does event-driven architecture solve that synchronous REST cannot?**
> **A:** Temporal coupling. In synchronous REST, the caller and callee must be available at the same time — if notification-service is down when order-service calls it, the call fails and the order either fails or the notification is lost. Events solve this with a durable message log (Kafka): the producer writes the event to the log; the consumer reads it whenever it's available, even hours later after a restart. The producer never knows or cares about consumer availability. This temporal decoupling enables: (1) consumers to scale independently; (2) consumers to be deployed/restarted without affecting producers; (3) new consumers to subscribe to historical events they missed; (4) fan-out — one event triggers 5 different reactions without the producer knowing about any of them.

**Q2: What is the ONE mental model for event-driven vs. synchronous communication?**
> **A:** "Commands need an answer now; events announce what happened." A command (\`POST /payments\`) waits for an answer (payment authorized or rejected) because the caller needs it to proceed. An event ("PaymentCompleted") announces something that happened; whoever cares can react whenever they want. The mental model: events are like newspaper headlines — the newspaper doesn't call every reader; it publishes the headline, and anyone interested reads it when they want. Apply this model: "Does my caller need to know the result before continuing?" → synchronous. "Is this a side-effect that can happen later?" → event.

**Q3: What is the most dangerous event-driven misconception? Show it.**
> **A:** That Kafka guarantees exactly-once processing by default.
> \`\`\`java
> // ❌ DANGEROUS — default Kafka consumer without idempotency
> @KafkaListener(topics = "orders.placed")
> public void onOrderPlaced(OrderPlacedEvent event) {
>     emailService.sendConfirmation(event.userEmail(), event.orderId());
>     // If this consumer crashes AFTER sending email but BEFORE committing offset:
>     // Kafka replays the event → user gets TWO confirmation emails
>     // Kafka default: at-least-once delivery
> }
>
> // ✅ IDEMPOTENT consumer — deduplication by event ID
> @KafkaListener(topics = "orders.placed")
> public void onOrderPlaced(OrderPlacedEvent event) {
>     if (processedEvents.contains(event.eventId())) return;  // already processed
>     emailService.sendConfirmation(event.userEmail(), event.orderId());
>     processedEvents.add(event.eventId());  // record as processed (in DB, atomically)
> }
> \`\`\`

**Q4: How does Kafka's log structure interact with consumer group offset management?**
> **A:** Kafka stores events in an immutable, append-only log partitioned across brokers. Each partition has a sequential offset. Consumer groups track their offset per partition — the position up to which they've processed events. When a consumer restarts, it resumes from the committed offset. If the consumer crashes between processing and committing the offset, the event is re-delivered (at-least-once). If the consumer commits before processing completes, the event may be skipped (at-most-once). Exactly-once requires: process the event + commit the offset atomically in the same database transaction (using Kafka's transactional producer or storing the offset in your own DB alongside the business data). Consumer groups enable load balancing: with N partitions and N consumers, each consumer owns one partition; adding more consumers than partitions results in idle consumers.

**Q5: One-sentence definition of event-driven architecture for a senior FAANG engineer.**
> **A:** "Event-driven architecture is a design style where services communicate by publishing immutable domain events to a durable, ordered log (Kafka topic), consuming them asynchronously at their own pace — enabling temporal decoupling (consumers can be offline), fan-out (one event triggers N independent reactions), event replay (new consumers bootstrap from history), and independent scaling — at the cost of eventual consistency (consumers lag behind producers), idempotency requirements (at-least-once delivery means duplicate processing must be handled), and increased debugging complexity (no linear stack trace across async event boundaries)."`,

    build: `## BUILD

### 🏗️ Mini Project: Order Event Pipeline With Kafka

**What you will build:** An order-service that publishes \`OrderPlaced\` events to Kafka, and a notification-service that subscribes and logs email confirmations — demonstrating temporal decoupling (notification-service can be stopped and restarted without losing events).
**Why this project:** Forces you to experience the defining characteristic of event-driven architecture: publish once, consume asynchronously, survive consumer restarts.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir event-demo && cd event-demo
cat > docker-compose.yml << 'EOF'
version: "3.9"
services:
  kafka:
    image: confluentinc/cp-kafka:7.6.0
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_NODE_ID: 1
      CLUSTER_ID: MkU3OEVBNTcwNTJENDM2Qk
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    ports: ["9092:9092"]
EOF
docker compose up -d kafka
\`\`\`

#### Step 2 — Order Service (Producer)
\`\`\`java
// order-service/src/main/java/com/demo/OrderServiceApp.java
@SpringBootApplication
public class OrderServiceApp { public static void main(String[] a) { SpringApplication.run(OrderServiceApp.class, a); } }

record OrderPlacedEvent(String eventId, long orderId, String userEmail, String sku, java.time.Instant occurredAt) {}

@RestController @RequestMapping("/orders")
class OrderController {
    private final KafkaTemplate<String, OrderPlacedEvent> kafka;
    OrderController(KafkaTemplate<String, OrderPlacedEvent> kafka) { this.kafka = kafka; }

    @PostMapping
    public Map<String, Object> place(@RequestBody Map<String, String> req) {
        long orderId = System.nanoTime();
        OrderPlacedEvent event = new OrderPlacedEvent(
            java.util.UUID.randomUUID().toString(), orderId,
            req.get("email"), req.get("sku"), java.time.Instant.now());
        kafka.send("orders.placed", String.valueOf(orderId), event);
        return Map.of("orderId", orderId, "status", "PENDING", "eventPublished", true);
    }
}
\`\`\`

#### Step 3 — Notification Service (Consumer)
\`\`\`java
// notification-service/src/main/java/com/demo/NotificationApp.java
@SpringBootApplication
public class NotificationApp { public static void main(String[] a) { SpringApplication.run(NotificationApp.class, a); } }

@Component
class OrderEventConsumer {
    private final Set<String> processed = java.util.Collections.synchronizedSet(new java.util.HashSet<>());

    @KafkaListener(topics = "orders.placed", groupId = "notification-service")
    public void onOrderPlaced(OrderPlacedEvent event) {
        if (processed.contains(event.eventId())) {
            System.out.println("[SKIP] Duplicate event: " + event.eventId());
            return;
        }
        // Simulate sending email
        System.out.printf("[EMAIL] Sending confirmation to %s for order %d%n",
            event.userEmail(), event.orderId());
        processed.add(event.eventId());
    }
}
record OrderPlacedEvent(String eventId, long orderId, String userEmail, String sku, java.time.Instant occurredAt) {}
\`\`\`

#### Step 4 — Demonstrate Temporal Decoupling
\`\`\`bash
# Start both services, place 5 orders:
curl -X POST :8081/orders -d '{"email":"alice@x.com","sku":"SKU-1"}' -H "Content-Type: application/json"
# Notification service prints: [EMAIL] Sending confirmation to alice@x.com

# Stop notification-service. Place 3 more orders:
curl -X POST :8081/orders -d '{"email":"bob@x.com","sku":"SKU-2"}'
# No notification yet (service is down) — but events are in Kafka!

# Restart notification-service — it catches up from Kafka:
# [EMAIL] Sending confirmation to bob@x.com  ← catches up!
\`\`\`

#### Step 5 — Tests
\`\`\`java
@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = "orders.placed")
class OrderEventTest {
    @Autowired KafkaTemplate<String, String> kafka;

    @Test
    void publishedEventIsConsumed() throws Exception {
        kafka.send("orders.placed", """
            {"eventId":"test-1","orderId":42,"userEmail":"test@x.com","sku":"SKU-T","occurredAt":"2024-01-01T00:00:00Z"}
        """);
        Thread.sleep(500);
        // Verify consumer processed it (check logs or a mock bean)
        assertTrue(true); // In real test: verify via CountDownLatch or mock
    }
}
\`\`\`

**Stretch Challenges:**
- [ ] Add the outbox pattern to ensure orders and events are written atomically
- [ ] Add a dead-letter topic for events that fail after 3 processing attempts
- [ ] Add consumer lag monitoring to see how far behind the consumer is`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall

**Q1:** What is Kafka's core abstraction? Define: topic, partition, offset, consumer group.

**Q2:** When should you use async events vs synchronous REST between services?

**Q3:** Write a \`@KafkaListener\` that consumes \`OrderPlacedEvent\` messages idempotently.

### Day 3 — Comprehension

**Q4:** What delivery guarantee does Kafka provide by default? How do you achieve exactly-once processing?

**Q5:** Describe the fan-out pattern. Give a real e-commerce example with 4 consumers for one event.

**Q6:** A notification consumer is processing events 2 hours behind the producer. Diagnose 5 possible causes.

### Day 7 — Application

**Q7:** Implement an idempotent Kafka consumer that processes payment events without sending duplicate notifications. Handle the crash-between-process-and-commit scenario.

**Q8:** A team converts a synchronous REST call to async Kafka. What new failure modes are introduced? How do you handle each?

**Q9:** Design the Kafka topic partitioning strategy for an order processing system handling 1M orders/day.

### Day 14 — Synthesis

**Q10:** ★ Classic interview: *"Compare synchronous REST and event-driven Kafka for inter-service communication. When would you choose each?"*

**Q11:** Draw the event flow for an e-commerce checkout: payment → inventory → shipping → notification. Mark which hops are sync and which are async and justify.

**Q12:** ★ System design: *"Design the event-driven data pipeline for a ride-sharing app (Uber-style) processing 10M ride events per day. Include topic design, consumer groups, partitioning strategy, and failure handling."*`
  },

  'ms-service-discovery': {
    feynman: `## FEYNMAN CHECK

### Explain Service Discovery Like I'm 10 Years Old
> Imagine moving to a new city. You need to find the nearest pizza restaurant. Before smartphones: memorize the address. But if the restaurant moves? You're stuck. Service discovery is like Google Maps for microservices — each restaurant (service) registers its current address when it opens, and anyone who needs pizza (a client service) looks up the current address instead of having a hardcoded one. If the restaurant moves (a pod restarts with a new IP), it re-registers its new address. The map (service registry) is always current. **This is why microservices use Eureka or Kubernetes DNS instead of hardcoding IP addresses** — because containers restart constantly with new IPs, and any service could be on any host at any time.

---

### 5 Deep Conceptual Questions

**Q1: Why does service discovery become necessary when you have more than 3 services?**
> **A:** Below 3 services, hardcoded URLs in \`application.yml\` are manageable. Above that, the operational burden explodes: every time a service is deployed to a new host, restarted in a container, or scaled to a new instance, all its callers need updated configuration. In a Kubernetes environment where pods restart on every deploy, the IP address changes every few minutes. Service discovery solves this by inverting control: instead of callers knowing the address, the service registers its current address, and callers look it up dynamically. This is especially critical at scale: Netflix's 1000 services each have multiple instances; managing 10,000 individual IP addresses statically would be impossible.

**Q2: What is the ONE mental model for client-side vs server-side load balancing?**
> **A:** "Who decides which instance to call?" Server-side load balancing (nginx, AWS ALB): the caller sends the request to one address; the load balancer decides which backend instance handles it — the caller has no knowledge of instances. Client-side load balancing (Spring Cloud LoadBalancer, Ribbon): the caller retrieves the list of instances from the service registry and decides which instance to call — enabling smarter load-balancing strategies (prefer instances in the same availability zone, prefer instances with lower latency) because the caller has more context. Kubernetes DNS is server-side (the Kubernetes service abstraction is a virtual IP that load-balances to pod IPs). Eureka with Spring Cloud LoadBalancer is client-side.

**Q3: What is the most dangerous service discovery misconception? Show it.**
> **A:** That the service registry provides health checking that eliminates the need for circuit breakers.
> \`\`\`java
> // ❌ Assuming registry-registered = healthy
> // Eureka may know about a service, but the service could be:
> // - Running but degraded (GC pause consuming all CPU)
> // - Responding to health checks but business endpoints returning errors
> // - In the process of shutting down gracefully
>
> // Service discovery: tells you WHERE a service is (address)
> // Circuit breaker: decides WHETHER to call based on recent success/failure history
>
> // ✅ CORRECT — both are needed for different concerns
> @FeignClient(name = "payment-service")  // ← service discovery
> @CircuitBreaker(name = "payment-service") // ← resilience
> interface PaymentClient {
>     @GetMapping("/payments/{id}")
>     Payment getPayment(@PathVariable long id);
> }
> \`\`\`

**Q4: How does Kubernetes service discovery differ from Eureka?**
> **A:** Eureka is an application-level service registry: services explicitly register on startup by calling the Eureka REST API; callers query Eureka to get instance addresses; heartbeats maintain registration. It requires code (Spring Cloud \`@EnableDiscoveryClient\`), a running Eureka server, and handles its own health management. Kubernetes DNS-based service discovery is infrastructure-level: when you create a Kubernetes \`Service\` resource, Kubernetes automatically creates a DNS entry (\`service-name.namespace.svc.cluster.local\`) that routes to healthy pods; no application code needed; pod health is managed by readiness probes at the platform level. For new Spring Boot microservices on Kubernetes: use Kubernetes DNS (zero code changes) unless you need cross-cluster discovery or advanced load-balancing strategies.

**Q5: One-sentence definition for a senior FAANG engineer.**
> **A:** "Service discovery is the mechanism by which microservices dynamically locate each other's network addresses — implemented either via client-side discovery (services register in a registry like Eureka; callers query the registry and load-balance across instances) or server-side discovery (infrastructure like Kubernetes DNS provides a stable virtual address that routes to healthy instances) — enabling services to function correctly as pods restart, scale horizontally, or migrate between hosts without requiring configuration changes in callers."`,

    build: `## BUILD

### 🏗️ Mini Project: Service Discovery With Spring Cloud + Eureka

**What you will build:** A Eureka server, a \`product-service\` that registers itself, and an \`order-service\` that discovers \`product-service\` by name and calls it without hardcoded IP addresses.
**Why this project:** Forces you to experience why service discovery is necessary: kill and restart \`product-service\` — the IP changes but \`order-service\` keeps working because it discovers the new address.
**Time estimate:** 30 minutes

---

#### Step 1 — Eureka Server
\`\`\`java
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApp { public static void main(String[] a) { SpringApplication.run(EurekaServerApp.class, a); } }
// application.yml:
// server.port: 8761
// eureka.client.register-with-eureka: false
// eureka.client.fetch-registry: false
\`\`\`

#### Step 2 — Product Service (Registers with Eureka)
\`\`\`java
@SpringBootApplication
@EnableDiscoveryClient
public class ProductApp { public static void main(String[] a) { SpringApplication.run(ProductApp.class, a); } }

@RestController @RequestMapping("/products")
class ProductController {
    @GetMapping("/{id}") public Map<String, Object> get(@PathVariable long id) {
        return Map.of("id", id, "name", "Widget", "price", 9.99,
            "servedByPort", System.getProperty("server.port", "unknown"));
    }
}
// application.yml:
// spring.application.name: product-service
// eureka.client.service-url.defaultZone: http://localhost:8761/eureka
\`\`\`

#### Step 3 — Order Service (Discovers Product Service)
\`\`\`java
@SpringBootApplication
@EnableDiscoveryClient
public class OrderApp { public static void main(String[] a) { SpringApplication.run(OrderApp.class, a); }
    @Bean @LoadBalanced RestClient.Builder builder() { return RestClient.builder(); }
    @Bean RestClient productClient(RestClient.Builder b) { return b.baseUrl("http://product-service").build(); }
}

@RestController @RequestMapping("/orders")
class OrderController {
    private final RestClient productClient;
    OrderController(RestClient c) { this.productClient = c; }
    @PostMapping
    public Map<String, Object> place(@RequestBody Map<String, Object> req) {
        // "product-service" is resolved by Eureka — no hardcoded IP!
        var product = productClient.get().uri("/products/{id}", req.get("productId")).retrieve().body(Map.class);
        return Map.of("orderId", System.nanoTime(), "product", product, "status", "PENDING");
    }
}
\`\`\`

#### Step 4 — Demonstrate Discovery
\`\`\`bash
# Start Eureka, then product-service on port 8082, then order-service on 8083
# Place an order — order-service discovers product-service via Eureka:
curl -X POST http://localhost:8083/orders -d '{"productId":1}' -H "Content-Type: application/json"
# Kill product-service and restart on port 8084 (different IP/port)
# Wait 30 seconds for Eureka re-registration
# Place another order — it still works! (discovered new address)
\`\`\`

#### Step 5 — Tests
\`\`\`java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ServiceDiscoveryTest {
    @Test void registersWithEureka() { /* verify registration via Eureka REST API */ assertTrue(true); }
}
\`\`\`

**Stretch Challenges:**
- [ ] Start 3 instances of product-service and observe load balancing across them
- [ ] Replace Eureka with Kubernetes DNS (simpler, zero code)
- [ ] Add a Consul service registry as an alternative to Eureka`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall

**Q1:** What problem does service discovery solve? Why can't you hardcode IP addresses in microservices?

**Q2:** Compare client-side vs server-side service discovery. Name one tool for each.

**Q3:** What is the difference between service registration (Eureka) and service DNS (Kubernetes)?

### Day 3 — Comprehension

**Q4:** A service is registered in Eureka but its actual endpoint is returning 500 errors. Does Eureka remove it? What should you add?

**Q5:** What happens when the Eureka server goes down? Can services still call each other?

**Q6:** Compare Eureka vs Kubernetes DNS vs Consul for service discovery. When would you choose each?

### Day 7 — Application

**Q7:** Set up Eureka server, product-service (registered), and order-service (discovers via \`@LoadBalanced\`). Demonstrate that no IPs are hardcoded.

**Q8:** A microservice fails to register with Eureka on startup. List 5 possible causes and how to diagnose each.

**Q9:** Design the service discovery strategy for a microservices system spanning 3 AWS regions.

### Day 14 — Synthesis

**Q10:** ★ Classic interview: *"How does service discovery work in Kubernetes vs Spring Cloud Eureka? What are the trade-offs?"*

**Q11:** Draw the service discovery flow for a request from client → API gateway → order-service → product-service.

**Q12:** ★ System design: *"You have 100 microservices on Kubernetes. Service A needs to call Service B. Walk through every network hop from the HTTP request leaving Service A to reaching Service B's pod, including how DNS resolution and load balancing work."*`
  },

  'ms-api-gateway': {
    feynman: `## FEYNMAN CHECK

### Explain API Gateway Like I'm 10 Years Old
> Imagine a hotel's front desk. All guests (clients) check in at the front desk, which then directs them to the right room (service). The front desk also checks if guests have a reservation (authentication), makes sure they're not making too many requests (rate limiting), and handles checkout (response caching). Without a front desk, guests would wander the hotel corridors knocking on every door. **An API gateway is the front desk for your microservices.** One address, one authentication check, one rate limiter — then the gateway routes the request to the right microservice. This is why every large microservices company (Netflix Zuul → Spring Cloud Gateway, AWS API Gateway, Kong) has a gateway layer: it's the single controlled entry point.

---

### 5 Deep Conceptual Questions

**Q1: What problems does an API gateway solve that individual service endpoints cannot?**
> **A:** An API gateway solves the client integration problem: without it, a mobile app must know the addresses, authentication requirements, and protocols of every microservice it calls. If you have 20 services, the mobile app has 20 dependencies. The gateway reduces this to 1: one address, one auth protocol, one TLS certificate. It also enables: (1) cross-cutting concerns applied once (rate limiting, CORS, logging, auth token validation) rather than 20 times; (2) API composition for clients that need data from multiple services; (3) protocol translation (mobile sends REST; some services speak gRPC — gateway translates); (4) traffic shaping (canary deploys, A/B testing).

**Q2: What is the ONE mental model for API gateway vs service mesh?**
> **A:** "Gateway is for North-South traffic (external to internal); mesh is for East-West traffic (internal to internal)." The API gateway sits at the edge — all traffic from the outside world goes through it. It handles auth, rate limiting, routing for external callers. The service mesh (Istio, Linkerd) sits between internal services — it handles mutual TLS, retries, circuit breaking, and observability for service-to-service calls. You need both: the gateway is the front door, the mesh is the internal hallways. Without the gateway, external clients hit your services directly. Without the mesh, internal service communication lacks observability and resilience.

**Q3: What is the most dangerous API gateway misconception? Show it.**
> **A:** That moving business logic into the gateway simplifies architecture.
> \`\`\`java
> // ❌ Gateway doing business logic — becomes a bottleneck and monolith
> public class OrderEnrichmentFilter extends AbstractGatewayFilterFactory<Object> {
>     public GatewayFilter apply(Object config) {
>         return (exchange, chain) -> {
>             // ❌ Fetching user from DB inside the gateway
>             // ❌ Calculating pricing inside the gateway
>             // ❌ Validating inventory inside the gateway
>             // Now the gateway is a distributed monolith
>             return chain.filter(exchange);
>         };
>     }
> }
>
> // ✅ Gateway does only cross-cutting concerns:
> // - Authentication (validate JWT)
> // - Rate limiting (count requests per client)
> // - Routing (forward to correct service based on path)
> // - Logging (record all requests for audit)
> // Business logic stays in the microservices!
> \`\`\`

**Q4: How does an API gateway implement canary deployments?**
> **A:** The gateway can route a percentage of traffic to different service versions. Example: route 5% of requests to \`order-service-v2\` and 95% to \`order-service-v1\` based on request weight or header values. In Spring Cloud Gateway: \`WeightRoutePredicateFactory\` splits traffic by configured weights. In Kubernetes with Istio: \`VirtualService\` defines traffic weights per subset. The gateway enables this without any changes to the services or clients — it's purely a routing decision. Combined with feature flags and monitoring (compare error rates between v1 and v2), this enables safe production validation of new service versions.

**Q5: One-sentence definition for a senior FAANG engineer.**
> **A:** "An API gateway is a reverse proxy at the edge of a microservices system that provides a single, controlled entry point for all external traffic — handling authentication (JWT validation), rate limiting (per-client request budgets), routing (path-based to different services), protocol translation (REST to gRPC), TLS termination, and cross-cutting concerns — implementing the Backend-for-Frontend pattern for different client types (mobile BFF, web BFF), enabling canary deployments via traffic splitting, and reducing the client's service coupling from N services to 1 gateway address."`,

    build: `## BUILD

### 🏗️ Mini Project: Spring Cloud Gateway With Auth, Rate Limiting, and Routing

**What you will build:** A Spring Cloud Gateway that routes \`/users/**\` to user-service and \`/orders/**\` to order-service, validates JWT tokens on all routes, and applies per-client rate limiting.
**Why this project:** Forces you to implement the three most critical gateway features in one place.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir api-gateway-demo && cd api-gateway-demo
# build.gradle.kts:
# implementation("org.springframework.cloud:spring-cloud-starter-gateway")
# implementation("org.springframework.boot:spring-boot-starter-data-redis-reactive")
\`\`\`

#### Step 2 — Gateway Configuration
\`\`\`yaml
# application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: users
          uri: http://localhost:8081
          predicates: [Path=/users/**]
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
        - id: orders
          uri: http://localhost:8082
          predicates: [Path=/orders/**]
          filters:
            - name: CircuitBreaker
              args:
                name: orders-cb
                fallbackUri: forward:/fallback/orders
\`\`\`

#### Step 3 — JWT Filter
\`\`\`java
@SpringBootApplication
public class GatewayApp { public static void main(String[] a) { SpringApplication.run(GatewayApp.class, a); } }

@Component
class JwtAuthFilter implements GlobalFilter {
    @Override
    public reactor.core.publisher.Mono<Void> filter(
            org.springframework.web.server.ServerWebExchange exchange,
            org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        if (path.startsWith("/actuator") || path.startsWith("/fallback")) return chain.filter(exchange);
        String auth = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (auth == null || !auth.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        // In production: validate JWT signature and expiry
        return chain.filter(exchange);
    }
}

@RestController @RequestMapping("/fallback")
class FallbackController {
    @GetMapping("/orders") public Map<String, String> ordersFallback() {
        return Map.of("message", "Orders service temporarily unavailable", "status", "degraded");
    }
}
\`\`\`

#### Step 4 — Error Handling
\`\`\`yaml
spring.cloud.gateway.default-filters:
  - name: Retry
    args:
      retries: 3
      statuses: BAD_GATEWAY,SERVICE_UNAVAILABLE
      methods: GET
\`\`\`

#### Step 5 — Tests
\`\`\`bash
# Without token: 401
curl http://localhost:8080/orders
# → 401 Unauthorized

# With token: routes to order-service
curl -H "Authorization: Bearer fake-token" http://localhost:8080/orders/1
# → 200 from order-service

# Actuator: no auth needed
curl http://localhost:8080/actuator/health  # → 200
\`\`\`

**Stretch Challenges:**
- [ ] Add a BFF (Backend-for-Frontend) route that aggregates user + orders in one response
- [ ] Implement rate limiting backed by Redis using IP address as the key
- [ ] Add request/response logging with correlation IDs for distributed tracing`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall

**Q1:** Name 5 concerns an API gateway handles that individual services shouldn't duplicate.

**Q2:** What is the difference between an API gateway and a load balancer?

**Q3:** Write a Spring Cloud Gateway route that forwards \`/products/**\` to \`http://product-service:8080\`.

### Day 3 — Comprehension

**Q4:** When should you use a BFF (Backend-for-Frontend) pattern vs a single API gateway for all clients?

**Q5:** How does an API gateway enable canary deployments? What routing configuration is needed?

**Q6:** An API gateway is a single point of failure. How do you make it highly available in production?

### Day 7 — Application

**Q7:** Configure Spring Cloud Gateway with: JWT auth filter, rate limiting (10 req/s per client), and circuit breaker fallback for a downstream service.

**Q8:** A mobile app needs data from 3 microservices in one screen. Design the API composition approach at the gateway layer.

**Q9:** Measure and compare the latency overhead added by routing through the API gateway vs direct service calls.

### Day 14 — Synthesis

**Q10:** ★ Classic interview: *"How would you design an API gateway for 50 microservices with 100K requests/second?"*

**Q11:** Compare API gateway (North-South) vs service mesh (East-West). Draw the traffic flow for an external request that touches 3 internal services.

**Q12:** ★ System design: *"Design the API gateway layer for a fintech platform with: mobile apps, web apps, third-party partners, and internal admin tools — all needing different auth, rate limiting, and API versioning."*`
  },

  'ms-saga-pattern': {
    feynman: `## FEYNMAN CHECK

### Explain the Saga Pattern Like I'm 10 Years Old
> Imagine you're booking a vacation: you buy plane tickets, reserve a hotel, and rent a car. Each step with a different company. If the car rental falls through AFTER you've bought tickets and reserved the hotel, you can't just "undo" the flight ticket like a database rollback — the airline has already charged you. You have to call the airline and ask for a refund (a compensating action). **The Saga pattern is this vacation booking problem in code.** When a distributed transaction spans multiple services (each with their own database), you can't use a single ACID transaction. Instead: execute each step, and if any step fails, run compensating actions to undo the successful steps. It's a choreography of forward steps and backward (compensating) steps.

---

### 5 Deep Conceptual Questions

**Q1: Why can't you use a regular database transaction across multiple microservices?**
> **A:** A database transaction requires all participating data stores to be the same database engine under the same transaction coordinator — or to use two-phase commit (2PC) across distributed databases. In microservices, each service has its own database (database-per-service rule), so there is no shared transaction coordinator. 2PC is theoretically possible but practically abandoned: it blocks all participating resources during coordination, is a single point of failure (the coordinator), and is devastatingly slow at scale. The saga pattern accepts that distributed consistency must be eventual, not atomic — each service executes its local ACID transaction, and compensating transactions handle failure paths.

**Q2: What is the ONE mental model for saga choreography vs orchestration?**
> **A:** "Choreography: services react to events like musicians reading the same sheet music independently. Orchestration: one conductor tells each musician what to play and when." Choreography: each service listens for events and publishes events in response — no central controller. Orchestration: a saga orchestrator calls each service in sequence and handles compensation on failure. Choreography is more resilient (no single point of failure) but harder to visualize (you must trace event subscriptions to understand the flow). Orchestration is easier to understand and debug (one place shows the flow) but the orchestrator is a knowledge hotspot.

**Q3: What is the most dangerous saga misconception? Show it.**
> **A:** That compensating transactions restore the system to exactly its original state.
> \`\`\`java
> // ❌ DANGEROUS assumption — compensation ≠ rollback
> // Scenario: payment processed ($100 charged), then inventory reservation fails
> // Compensation: refund the $100
>
> // BUT: between charge and refund, the customer may have:
> // - Received a charge notification (now gets a confusing refund notification)
> // - Had their credit limit temporarily reduced
> // - Had the payment processed by Stripe and now needs a refund not a void
>
> // Compensating transactions are BEST-EFFORT, not ATOMIC UNDO
> // The user sees BOTH the charge AND the refund — not a clean undo.
>
> // ✅ CORRECT mental model:
> // Compensation makes the BUSINESS outcome correct (user gets their money back)
> // not technically identical to the pre-transaction state
> // Design your UX and notifications to handle both the forward and backward paths
> \`\`\`

**Q4: How does the saga pattern interact with idempotency?**
> **A:** Saga steps and compensation steps MUST be idempotent because event-driven sagas use at-least-once delivery — a step may be executed multiple times due to retries or crashes. If the \`charge-payment\` step runs twice, the user gets double-charged. Each saga step needs: (1) an idempotency key (usually the saga ID + step ID); (2) a check at the start: "have I already completed this step for this saga ID?"; (3) return the cached result if so. This is why the outbox pattern is so important for sagas — the outbox guarantees events are published exactly once and gives each event a stable, replayable ID. Without idempotency, a saga implementation that crashes and retries will produce incorrect business outcomes.

**Q5: One-sentence definition for a senior FAANG engineer.**
> **A:** "The Saga pattern is a distributed transaction management technique that decomposes a multi-service business operation into a sequence of local ACID transactions, each publishing domain events (choreography) or responding to orchestrator calls (orchestration), with compensating transactions defined for each step to handle failure and restore business consistency — accepting eventual consistency and the visibility of intermediate states (unlike ACID atomicity) and requiring idempotency at every step because at-least-once event delivery means steps may execute multiple times."`,

    build: `## BUILD

### 🏗️ Mini Project: Order Saga (Choreography Style)

**What you will build:** A 3-step saga: OrderPlaced → PaymentService charges → InventoryService reserves → or compensates on failure. Uses Kafka events for choreography.
**Why this project:** Forces you to design the forward path AND the compensating actions, making the saga's complexity (and why it's worth it) concrete.
**Time estimate:** 40 minutes

---

#### Step 1 — Saga Events
\`\`\`java
record OrderPlaced(String sagaId, long orderId, long userId, String sku, int qty, long priceCents) {}
record PaymentCompleted(String sagaId, long orderId, String authCode) {}
record PaymentFailed(String sagaId, long orderId, String reason) {}
record InventoryReserved(String sagaId, long orderId, String sku, int qty) {}
record InventoryFailed(String sagaId, long orderId, String reason) {}
record PaymentRefunded(String sagaId, long orderId, String reason) {}  // compensation
\`\`\`

#### Step 2 — Order Service (Initiates Saga)
\`\`\`java
@Service
class OrderSagaInitiator {
    private final KafkaTemplate<String, Object> kafka;
    OrderSagaInitiator(KafkaTemplate<String, Object> kafka) { this.kafka = kafka; }

    @Transactional
    public void placeOrder(long userId, String sku, int qty, long priceCents) {
        String sagaId = java.util.UUID.randomUUID().toString();
        long orderId = System.nanoTime();
        // Step 1: Save order in PENDING state (local ACID)
        // orderRepo.save(new Order(orderId, sagaId, "PENDING"))
        // Step 1b: Publish event to kick off saga
        kafka.send("orders.saga", new OrderPlaced(sagaId, orderId, userId, sku, qty, priceCents));
    }
}
\`\`\`

#### Step 3 — Payment Service (Forward + Compensating)
\`\`\`java
@Component
class PaymentSagaHandler {
    private final KafkaTemplate<String, Object> kafka;
    PaymentSagaHandler(KafkaTemplate<String, Object> kafka) { this.kafka = kafka; }

    @KafkaListener(topics = "orders.saga", groupId = "payment-service")
    public void onOrderPlaced(OrderPlaced event) {
        try {
            // Charge the customer (idempotent via sagaId)
            String authCode = chargePayment(event.userId(), event.priceCents(), event.sagaId());
            kafka.send("orders.saga", new PaymentCompleted(event.sagaId(), event.orderId(), authCode));
        } catch (Exception e) {
            kafka.send("orders.saga", new PaymentFailed(event.sagaId(), event.orderId(), e.getMessage()));
        }
    }

    // COMPENSATION: called when inventory fails AFTER payment succeeded
    @KafkaListener(topics = "orders.saga", groupId = "payment-service-compensate")
    public void onInventoryFailed(InventoryFailed event) {
        refundPayment(event.sagaId());  // compensating transaction
        kafka.send("orders.saga", new PaymentRefunded(event.sagaId(), event.orderId(), "inventory failed"));
    }

    private String chargePayment(long userId, long cents, String idempotencyKey) { return "AUTH-" + idempotencyKey.substring(0, 8); }
    private void refundPayment(String sagaId) { System.out.println("Refunding saga " + sagaId); }
}
\`\`\`

#### Step 4 — Inventory Service (Final Step)
\`\`\`java
@Component
class InventorySagaHandler {
    private final KafkaTemplate<String, Object> kafka;
    InventorySagaHandler(KafkaTemplate<String, Object> kafka) { this.kafka = kafka; }

    @KafkaListener(topics = "orders.saga", groupId = "inventory-service")
    public void onPaymentCompleted(PaymentCompleted event) {
        boolean reserved = attemptReservation(event.orderId());
        if (reserved)
            kafka.send("orders.saga", new InventoryReserved(event.sagaId(), event.orderId(), "SKU-1", 1));
        else
            kafka.send("orders.saga", new InventoryFailed(event.sagaId(), event.orderId(), "out of stock"));
    }
    private boolean attemptReservation(long orderId) { return Math.random() > 0.3; }
}
\`\`\`

#### Step 5 — Test the Compensation Path
\`\`\`bash
# Run the saga 10 times (30% will fail at inventory step)
# Observe:
# - Forward path: OrderPlaced → PaymentCompleted → InventoryReserved
# - Backward path: OrderPlaced → PaymentCompleted → InventoryFailed → PaymentRefunded
# Both paths must leave the system in a consistent state
\`\`\`

**Stretch Challenges:**
- [ ] Convert to orchestration style using a dedicated saga orchestrator service
- [ ] Add a saga state machine that tracks the current step and handles retries
- [ ] Implement the outbox pattern to make saga event publishing atomic with DB writes`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall

**Q1:** What problem does the saga pattern solve? Why can't you use a database transaction?

**Q2:** Compare saga choreography vs orchestration. Name one pro and one con of each.

**Q3:** What are compensating transactions? Give an example for an order-payment-inventory saga.

### Day 3 — Comprehension

**Q4:** Why must every saga step be idempotent? What happens if it's not?

**Q5:** Describe the "lost message" failure scenario in a choreography saga and how to prevent it.

**Q6:** Design the compensation flow for: user registers → sends welcome email → creates default preferences. What compensates if preferences creation fails?

### Day 7 — Application

**Q7:** Implement a 3-step saga (order → payment → inventory) with compensation on failure. Show both the happy path and the failure+compensation path.

**Q8:** A saga gets stuck in a permanent "in-progress" state. How do you detect it and what do you do?

**Q9:** Compare the saga pattern with two-phase commit (2PC). Why is 2PC rarely used in microservices?

### Day 14 — Synthesis

**Q10:** ★ Classic interview: *"How do you handle distributed transactions in microservices? Walk through the saga pattern."*

**Q11:** Draw the choreography saga for booking a flight + hotel + car rental. Show all forward events and all compensating events.

**Q12:** ★ System design: *"Design the payment saga for an e-commerce checkout: charge card, reserve inventory, create shipment, send confirmation. Handle 5 different failure scenarios with compensating transactions."*`
  },

  'ms-outbox-pattern': {
    feynman: `## FEYNMAN CHECK

### Explain the Outbox Pattern Like I'm 10 Years Old
> Imagine you write a letter (event) and put it in your personal outbox tray. A mail carrier (background job) comes by regularly, picks up letters from your outbox, and delivers them to the post office (Kafka). **The key**: writing the letter and putting it in your outbox happens in ONE atomic step. Either both happen or neither happens. If the mail carrier crashes after picking up your letter but before reaching the post office, they'll come back and pick it up again (retry). This is the outbox pattern: write your database record AND your outbox event in the same database transaction. The background job delivers the event separately. Without this pattern: the database write succeeds but Kafka publish fails → your order exists in the DB but nobody downstream knows about it.

---

### 5 Deep Conceptual Questions

**Q1: What is the dual-write problem and why is it unsolvable without the outbox?**
> **A:** Dual-write: writing to two different systems (database + Kafka) that have no shared transaction coordinator. If you write to the DB first and then publish to Kafka: the DB write can succeed and the Kafka publish can fail (Kafka down, network blip, application crash between the two steps) → event never published, downstream services never notified, data is inconsistent. If you publish to Kafka first and then write to DB: Kafka publish succeeds and DB write fails → event published for an order that doesn't exist → downstream services process a ghost order. The outbox solves this by writing the event to an outbox TABLE (same DB, same transaction as the business data). The ACID transaction guarantees both happen or neither. A separate process reads the outbox table and publishes to Kafka — retrying until successful.

**Q2: What is the ONE mental model for the outbox pattern?**
> **A:** "Use your existing database as a reliable message queue for one hop." The database transaction provides the atomicity you need; a background relay (polling or Debezium CDC) provides the delivery to Kafka. Think of the outbox table as a reliable staging area: events are committed atomically with business data, then asynchronously promoted to Kafka. The critical property: the event is never lost (it's in the database, durably, as soon as the transaction commits) and the Kafka publish is eventually consistent (happens asynchronously, may have a few seconds of delay). If Kafka is down, events queue in the outbox table; when Kafka recovers, they're all delivered.

**Q3: What is the most dangerous outbox misconception? Show it.**
> **A:** That polling the outbox table every 500ms is too slow for real-time requirements.
> \`\`\`java
> // ❌ MISCONCEPTION — "outbox polling is too slow, I'll just dual-write"
> @Transactional
> public Order placeOrder(PlaceOrderRequest req) {
>     Order order = orderRepo.save(new Order(req));
>     kafka.send("orders.placed", new OrderPlaced(order.id())).get(); // dual-write!
>     // If this throws: order saved, Kafka not notified → INCONSISTENT STATE
>     return order;
> }
>
> // ✅ CORRECT — outbox polling at 500ms is 500ms delay, not a disaster
> // Most event-driven systems tolerate seconds to minutes of latency
> // The 500ms is the processing delay, not the user-perceived latency
> // The user gets the HTTP response immediately when the order is saved;
> // downstream processing happens asynchronously
> @Transactional
> public Order placeOrder(PlaceOrderRequest req) {
>     Order order = orderRepo.save(new Order(req));
>     outboxRepo.save(new OutboxEvent("OrderPlaced", order.id(), serialize(order)));
>     return order;  // HTTP response returned; outbox delivers event asynchronously
> }
> \`\`\`

**Q4: How does Debezium CDC differ from polling-based outbox?**
> **A:** Polling-based outbox: a background job (\`@Scheduled\`) queries the outbox table (e.g., every 500ms) for unpublished events, publishes them to Kafka, and marks them as published. Simple to implement, adds periodic DB load. Debezium CDC (Change Data Capture): reads the database's binary replication log (PostgreSQL WAL, MySQL binlog) and streams every row change as a Kafka event in real-time (sub-millisecond latency). No polling — purely event-driven at the DB level. Debezium advantages: lower latency, no polling load, captures ALL changes (not just outbox table). Debezium complexity: requires read access to the DB replication log, additional infrastructure component, schema evolution requires careful management. For most teams: polling outbox is simpler and sufficient. For high-throughput systems (>10K events/s): Debezium scales better.

**Q5: One-sentence definition for a senior FAANG engineer.**
> **A:** "The transactional outbox pattern solves the dual-write problem by writing domain events to an outbox table within the same database transaction as business data, guaranteeing atomic consistency (either both the business record and outbox event are committed or neither is), then using a separate relay process (polling-based \`@Scheduled\` publisher or Debezium CDC reading the WAL) to asynchronously publish outbox events to Kafka — ensuring at-least-once delivery with eventual consistency and no risk of lost events due to application crashes between DB write and Kafka publish."`,

    build: `## BUILD

### 🏗️ Mini Project: Transactional Outbox With Spring Boot

**What you will build:** An order service that saves orders and outbox events in one transaction, plus a background publisher that relays outbox events to a mock Kafka, demonstrating that orders and events are always in sync even if the publisher crashes.
**Why this project:** Makes the atomic guarantee tangible — crash the publisher mid-relay and observe that events are re-delivered, never lost.
**Time estimate:** 35 minutes

---

#### Step 1 — Schema
\`\`\`sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE outbox_events (
    id BIGSERIAL PRIMARY KEY,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id BIGINT NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    published BOOLEAN NOT NULL DEFAULT FALSE
);
\`\`\`

#### Step 2 — Atomic Write
\`\`\`java
@Service
class OrderService {
    private final OrderRepository orders;
    private final OutboxRepository outbox;
    OrderService(OrderRepository orders, OutboxRepository outbox) { this.orders = orders; this.outbox = outbox; }

    @Transactional  // BOTH inserts happen atomically or neither does
    public Order placeOrder(long customerId, String sku) {
        Order order = orders.save(new Order(customerId, "PENDING"));

        // Outbox event written in SAME transaction as the order
        OutboxEvent event = new OutboxEvent(
            "order", order.id(), "OrderPlaced",
            String.format("""{"orderId":%d,"customerId":%d,"sku":"%s"}""", order.id(), customerId, sku)
        );
        outbox.save(event);

        return order;  // HTTP response returned immediately — Kafka publish is async
    }
}
\`\`\`

#### Step 3 — Background Publisher
\`\`\`java
@Component
@Slf4j
class OutboxPublisher {
    private final OutboxRepository outbox;
    OutboxPublisher(OutboxRepository outbox) { this.outbox = outbox; }

    @Scheduled(fixedDelay = 500)  // poll every 500ms
    @Transactional
    public void publish() {
        List<OutboxEvent> pending = outbox.findTop100ByPublishedFalseOrderByCreatedAtAsc();
        for (OutboxEvent event : pending) {
            try {
                // In production: kafkaTemplate.send(event.eventType(), event.payload()).get()
                log.info("[KAFKA] Publishing {} for aggregate {}: {}",
                    event.eventType(), event.aggregateId(), event.payload());
                event.setPublished(true);
                outbox.save(event);
            } catch (Exception e) {
                log.error("[KAFKA] Failed to publish event {}: {}", event.id(), e.getMessage());
                break;  // stop processing; retry entire batch next tick
            }
        }
    }
}
\`\`\`

#### Step 4 — Demonstrate Atomicity
\`\`\`bash
# Place an order — both order and outbox event are saved atomically:
curl -X POST http://localhost:8080/orders -d '{"customerId":1,"sku":"SKU-42"}'
# → {"id":1,"status":"PENDING"}
# Log: [KAFKA] Publishing OrderPlaced for aggregate 1

# Simulate publisher crash (kill the app after order saved, before publish)
# Restart the app — outbox publisher picks up unpublished events:
# → [KAFKA] Publishing OrderPlaced for aggregate 1  ← replayed!
\`\`\`

#### Step 5 — Tests
\`\`\`java
@DataJpaTest
class OutboxAtomicityTest {
    @Autowired OrderRepository orders;
    @Autowired OutboxRepository outbox;
    @Autowired TestEntityManager em;

    @Test
    void orderAndOutboxEventSavedAtomically() {
        Order order = orders.save(new Order(1L, "PENDING"));
        outbox.save(new OutboxEvent("order", order.id(), "OrderPlaced", "{}"));
        em.flush();
        assertEquals(1, orders.count());
        assertEquals(1, outbox.count());
        assertFalse(outbox.findAll().get(0).published());
    }
}
\`\`\`

**Stretch Challenges:**
- [ ] Implement Debezium CDC instead of polling
- [ ] Add a dead-letter mechanism for events that fail after 5 publish attempts
- [ ] Monitor outbox table size to alert when publisher is falling behind`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall

**Q1:** What is the dual-write problem? Why does it cause data inconsistency?

**Q2:** Describe the outbox pattern in 3 sentences: the write step, the relay step, the guarantee.

**Q3:** Write the SQL schema for an outbox_events table with the minimum required columns.

### Day 3 — Comprehension

**Q4:** Compare polling-based outbox vs Debezium CDC. When would you choose each?

**Q5:** An outbox event fails to publish to Kafka after 5 retries. What do you do?

**Q6:** The outbox publisher is 30 minutes behind due to high order volume. What are the consequences and how do you fix it?

### Day 7 — Application

**Q7:** Implement the full outbox pattern: order service saves order + outbox event atomically; scheduler publishes pending events; idempotent publisher marks events as published.

**Q8:** A developer asks "why not just use a Kafka transaction instead of outbox?" How do you answer?

**Q9:** Design an outbox monitoring system that alerts when: (1) publisher lag exceeds 5 minutes, (2) any event fails 3+ times.

### Day 14 — Synthesis

**Q10:** ★ Classic interview: *"How do you reliably publish events to Kafka when saving to a database? Explain the outbox pattern."*

**Q11:** Draw the sequence diagram for the outbox pattern including: business write, outbox write, background publisher, Kafka, consumer.

**Q12:** ★ System design: *"Design the event publishing infrastructure for an e-commerce platform processing 50K orders/hour. Include: atomicity guarantee, publisher throughput, failure handling, monitoring."*`
  },

  'ms-distributed-tracing': {
    feynman: `## FEYNMAN CHECK

### Explain Distributed Tracing Like I'm 10 Years Old
> Imagine you order a pizza. The pizzeria (service A) takes your order, the kitchen (service B) makes it, and the delivery driver (service C) brings it. If something goes wrong — it's cold when it arrives — you want to know where the problem happened. Was it a slow kitchen? A bad driver? A long wait at your building? **Distributed tracing is like GPS tracking for every step of your pizza order.** Each step gets a timestamp and a connection to the previous step. You can replay the entire journey and see exactly where the delay was. In software: each request gets a unique \`trace-id\`; every service adds a \`span\` showing how long that service took. Jaeger displays the whole trace as a waterfall diagram.

---

### 5 Deep Conceptual Questions

**Q1: What makes distributed tracing fundamentally different from logging?**
> **A:** Logs are per-service, text-based, without cross-service correlation by default. When a request spans 5 services, you have 5 separate log files with timestamps that you must manually correlate. Even with structured logging, you must grep all 5 logs and sort by timestamp. Distributed tracing adds a \`trace-id\` that is propagated across all services via HTTP headers (\`traceparent\` in OpenTelemetry, \`X-B3-TraceId\` in Zipkin). Every span — each unit of work within a service — is tagged with this trace ID. The tracing backend (Jaeger, Zipkin) collects all spans and assembles them into a waterfall showing the complete request lifecycle across all services. Logs tell you WHAT happened; traces tell you WHERE and HOW LONG each part took.

**Q2: What is the ONE mental model for understanding trace-spans-context?**
> **A:** "A trace is a directed acyclic graph (DAG) of operations that together serve one user request." The trace has a unique \`trace-id\` (shared across all services). Each service operation is a \`span\` with its own \`span-id\`, plus a \`parent-span-id\` linking it to the calling operation. The trace context (trace-id + span-id) is propagated via the \`traceparent\` header in every HTTP call and Kafka message header. The mental model: the trace is the complete story; each span is a chapter; the parent-span-id connects chapters. Jaeger/Zipkin reads all chapters and reconstructs the complete story.

**Q3: What is the most dangerous distributed tracing misconception? Show it.**
> **A:** That adding a tracing library automatically instruments all your code.
> \`\`\`java
> // ❌ INCOMPLETE — Spring Boot + Micrometer Tracing handles HTTP and Kafka automatically
> // BUT: custom code is NOT traced unless you add spans explicitly
>
> @Service
> class PaymentService {
>     public void processPayment(long orderId) {
>         validateOrder(orderId);           // ← no span, invisible in traces
>         chargeCard(orderId);              // ← no span, invisible in traces
>         sendConfirmation(orderId);        // ← no span, invisible in traces
>         // The trace shows "PaymentService: 800ms" as a black box
>         // You can't tell which of the 3 steps took 750ms
>     }
> }
>
> // ✅ CORRECT — add custom spans for significant operations
> @Service
> class PaymentService {
>     private final Tracer tracer;
>
>     public void processPayment(long orderId) {
>         try (Span span = tracer.nextSpan().name("validate-order").start()) {
>             validateOrder(orderId);
>         }
>         try (Span span = tracer.nextSpan().name("charge-card").start()) {
>             chargeCard(orderId);
>         }
>         // Now Jaeger shows each step's duration independently
>     }
> }
> \`\`\`

**Q4: How does sampling affect trace completeness at scale?**
> **A:** At 100K requests/second, recording every trace would generate 10 million spans/second — far more than any trace backend can store or query efficiently. Sampling controls what fraction of requests are fully traced. Head-based sampling decides at the trace entry point (API gateway) whether to trace the request — simple but may miss important rare events (errors). Tail-based sampling (Jaeger's smart sampler, OpenTelemetry's tail sampler) makes the decision AFTER the trace completes, preferring to keep traces with errors or high latency. At Netflix scale: sample 0.01% of normal traffic but 100% of error traces. Production config: always sample errors and slow requests (\`sampleRate=0.1\` + \`alwaysSampleErrors=true\`).

**Q5: One-sentence definition for a senior FAANG engineer.**
> **A:** "Distributed tracing is an observability technique that propagates a unique trace context (trace-id, span-id via the W3C traceparent header) across all services involved in handling one user request, with each service recording spans (individual operations with start/end timestamps, metadata, and parent-span references) that a backend (Jaeger, Zipkin) assembles into a DAG visualised as a waterfall diagram — enabling engineers to identify latency bottlenecks, error sources, and dependency patterns across service boundaries that are invisible in per-service logs or metrics."`,

    build: `## BUILD

### 🏗️ Mini Project: Distributed Tracing With OpenTelemetry + Jaeger

**What you will build:** Two Spring Boot services with OpenTelemetry auto-instrumentation, sending traces to Jaeger, so you can see the complete request flow in the Jaeger UI.
**Why this project:** Makes cross-service debugging visual — after running the demo, you can see exactly which service and which operation consumed time on a multi-service request.
**Time estimate:** 30 minutes

---

#### Step 1 — Jaeger + Both Services
\`\`\`bash
# Start Jaeger (all-in-one for dev)
docker run -d --name jaeger -p 16686:16686 -p 4317:4317 jaegertracing/all-in-one:1.52

mkdir tracing-demo && cd tracing-demo
# build.gradle.kts (both services):
# implementation("io.micrometer:micrometer-tracing-bridge-otel")
# implementation("io.opentelemetry.instrumentation:opentelemetry-spring-boot-starter:2.3.0")
# implementation("io.opentelemetry:opentelemetry-exporter-otlp")
\`\`\`

#### Step 2 — Service Configuration
\`\`\`yaml
# application.yml (both services, different app names)
spring.application.name: order-service  # or product-service
management.tracing:
  sampling.probability: 1.0  # trace ALL requests in dev
otel:
  exporter.otlp.endpoint: http://localhost:4317
  resource.attributes:
    service.name: \${spring.application.name}
\`\`\`

#### Step 3 — Traced Services
\`\`\`java
// product-service
@RestController @RequestMapping("/products")
class ProductController {
    @Autowired io.micrometer.tracing.Tracer tracer;

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable long id) {
        // Add custom span for the DB lookup simulation
        var span = tracer.nextSpan().name("product-db-lookup").start();
        try {
            Thread.sleep(50);  // simulate DB query
            return Map.of("id", id, "name", "Widget", "price", 9.99);
        } catch (InterruptedException e) { Thread.currentThread().interrupt(); return Map.of(); }
        finally { span.end(); }
    }
}

// order-service (calls product-service — trace context propagated automatically)
@RestController @RequestMapping("/orders")
class OrderController {
    private final RestClient productClient = RestClient.create("http://localhost:8082");

    @PostMapping
    public Map<String, Object> place(@RequestBody Map<String, Object> req) {
        // RestClient automatically propagates traceparent header!
        var product = productClient.get().uri("/products/{id}", req.get("productId"))
            .retrieve().body(Map.class);
        return Map.of("orderId", System.nanoTime(), "product", product);
    }
}
\`\`\`

#### Step 4 — Observe in Jaeger UI
\`\`\`bash
curl -X POST http://localhost:8081/orders -d '{"productId":1}' -H "Content-Type: application/json"
# Open http://localhost:16686 → Service: order-service → Find Traces
# → See: order-service (root) → product-service (child span)
# → Both spans show duration, metadata, and parent-child relationship
\`\`\`

#### Step 5 — Tests
\`\`\`java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class TracingTest {
    @Test
    void requestHasTraceId() {
        // In real test: verify traceparent header is in outgoing requests
        // and trace appears in Jaeger (using Jaeger test API)
        assertTrue(true);
    }
}
\`\`\`

**Stretch Challenges:**
- [ ] Add custom span attributes (orderId, userId) visible in Jaeger
- [ ] Configure tail-based sampling: always sample errors, sample 1% of normal traffic
- [ ] Add trace context propagation through Kafka messages`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall

**Q1:** What is a trace? What is a span? How are they related via trace-id and span-id?

**Q2:** What HTTP header propagates trace context between services? What standard defines it?

**Q3:** Why can't you debug cross-service latency issues with logs alone?

### Day 3 — Comprehension

**Q4:** Compare head-based vs tail-based sampling. When is each appropriate?

**Q5:** What operations does Spring Boot auto-instrument via OpenTelemetry? What do you need to add manually?

**Q6:** A request takes 800ms but the service logs show only 50ms of work. How do you diagnose this?

### Day 7 — Application

**Q7:** Instrument a Spring Boot service with OpenTelemetry: auto-instrument HTTP calls, add custom spans for DB queries and business logic.

**Q8:** Design the tracing strategy for a system processing 100K requests/second. Include sampling rates for normal, slow, and error traces.

**Q9:** A distributed trace shows 400ms of "gap" between span A ending and span B starting. What could cause this gap?

### Day 14 — Synthesis

**Q10:** ★ Classic interview: *"A user reports slow checkout. How do you use distributed tracing to diagnose it in a 15-service system?"*

**Q11:** Draw the trace waterfall for: GET /orders/{id} → order-service → product-service → pricing-service. Mark each span with expected duration.

**Q12:** ★ System design: *"Design the observability stack for 100 microservices: what tracing backend, what sampling strategy, what alerts do you configure, and how do you correlate traces with logs and metrics?"*`
  },

  'ms-distributed-tx': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Distributed Transactions Like I'm 10 Years Old\n> Imagine 3 piggy banks (databases) in 3 different rooms. You want to move $10 from piggy bank A to B, and give $5 to C, all at once. In one room, you'd use a single safe. But across 3 rooms, you must go room by room — if you collapse between rooms 2 and 3, A and B are updated but C is not. **Distributed transactions solve this.** The saga pattern: each room makes its change independently, and if a later step fails, compensating actions undo earlier steps. No global lock; no coordinator bottleneck; eventual consistency with explicit compensation.`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Saga State Machine\n\n**What you will build:** A Java state machine tracking a 3-step transaction.\n**Why this project:** Forces you to enumerate all forward and backward state transitions.\n**Time estimate:** 25 minutes\n\n---\n\n#### Steps 1-5\n\n\`\`\`java\npublic class SagaStateMachine {\n    public enum State { INITIATED, PAYMENT_PENDING, PAYMENT_OK, INVENTORY_PENDING, COMPLETED, CANCELLING, CANCELLED }\n    public static State transition(State s, String event) {\n        return switch (s + ":" + event) {\n            case "INITIATED:pay" -> State.PAYMENT_PENDING;\n            case "PAYMENT_PENDING:ok" -> State.PAYMENT_OK;\n            case "PAYMENT_PENDING:fail" -> State.CANCELLED;\n            case "PAYMENT_OK:reserve" -> State.INVENTORY_PENDING;\n            case "INVENTORY_PENDING:ok" -> State.COMPLETED;\n            case "INVENTORY_PENDING:fail" -> State.CANCELLING;\n            case "CANCELLING:refunded" -> State.CANCELLED;\n            default -> throw new IllegalStateException(s + ":" + event);\n        };\n    }\n    public static void main(String[] args) {\n        var state = State.INITIATED;\n        state = transition(state, "pay"); state = transition(state, "ok");\n        state = transition(state, "reserve"); state = transition(state, "fail");\n        state = transition(state, "refunded");\n        System.out.println("Final: " + state); // CANCELLED\n    }\n}\n\`\`\`\n\n**Stretch Challenges:**\n- [ ] Persist state to DB with Flyway migration\n- [ ] Add timeout detection for stuck PAYMENT_PENDING states`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1 — Recall\n\n**Q1:** Why doesn't @Transactional work across two microservices?\n**Q2:** What is 2PC? Why is it not used in microservices?\n**Q3:** Name all states an order passes through in a 3-step saga.\n\n### Day 3 — Comprehension\n\n**Q4:** Compare 2PC vs saga on 3 dimensions: latency, failure handling, scalability.\n**Q5:** What is the "read your own writes" problem and 3 solutions?\n**Q6:** Design compensating transactions for order-payment-inventory saga.\n\n### Day 7 — Application\n\n**Q7:** Implement a saga state machine with all forward and backward transitions.\n**Q8:** A saga is stuck in PAYMENT_PENDING for 10 minutes. How do you recover?\n**Q9:** Compare choreography vs orchestration saga for a 5-step booking workflow.\n\n### Day 14 — Synthesis\n\n**Q10:** ★ Classic interview: *"How do you handle multi-service transactions in microservices?"*\n**Q11:** Draw all forward and backward paths for: payment + inventory + shipping saga.\n**Q12:** ★ System design: *"Design a bank transfer system across 3 microservices. Handle every failure scenario with compensating transactions."*`
  },

  'ms-inter-service-comm': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Synchronous Inter-Service Calls Like I'm 10 Years Old\n> Imagine calling a friend on the phone to ask a question. You wait on the line until they answer — that's synchronous. Sending them a text message and doing other things while you wait is async. **Synchronous inter-service calls are the phone calls of microservices** — you send an HTTP request and wait for the response before continuing. Spring Boot's \`RestClient\` is your phone; service discovery tells you the number; circuit breakers hang up if the call takes too long. The danger: if your friend is stuck in traffic (slow service), you're stuck waiting too — which is why circuit breakers and timeouts are non-negotiable for any synchronous call.`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Resilient RestClient With Timeout + Retry\n\n**What you will build:** A Spring Boot service that calls another via RestClient with timeout, retry, and circuit breaker.\n**Why this project:** Forces you to implement all 3 resilience layers for synchronous calls.\n**Time estimate:** 25 minutes\n\n---\n\n\`\`\`java\n@SpringBootApplication\npublic class App { public static void main(String[] a) { SpringApplication.run(App.class, a); } }\n\n@Service\nclass UserClient {\n    private final RestClient client;\n    private final CircuitBreaker cb;\n\n    UserClient(@Value("\${user.service.url}") String url) {\n        this.client = RestClient.builder().baseUrl(url)\n            .requestInterceptor((req, body, execution) -> {\n                req.getHeaders().set("X-Request-Timeout", "2000");\n                return execution.execute(req, body);\n            }).build();\n        this.cb = CircuitBreaker.ofDefaults("user-service");\n    }\n\n    public User getUser(long id) {\n        return cb.executeSupplier(() ->\n            client.get().uri("/users/{id}", id).retrieve().body(User.class));\n    }\n\n    public User getUserWithFallback(long id) {\n        try { return getUser(id); } catch (Exception e) { return User.anonymous(); }\n    }\n}\n\nrecord User(long id, String email, String name) {\n    static User anonymous() { return new User(0, "anonymous@x.com", "Guest"); }\n}\n\`\`\`\n\n**Stretch Challenges:**\n- [ ] Add Resilience4j retry (3 attempts with exponential backoff)\n- [ ] Add \`@LoadBalanced\` RestClient for client-side load balancing\n- [ ] Measure P99 latency of the inter-service call`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1 — Recall\n\n**Q1:** What is synchronous inter-service communication? When should you use it vs async events?\n**Q2:** List 4 failure modes specific to HTTP inter-service calls (not present in in-process calls).\n**Q3:** Write a Spring Boot RestClient call to GET /users/{id} from user-service.\n\n### Day 3 — Comprehension\n\n**Q4:** Compare RestClient vs WebClient vs FeignClient. When do you use each?\n**Q5:** What is a timeout? What is a deadline? How do they differ in a service chain?\n**Q6:** A service chain has 5 hops each with a 30s timeout. What is the maximum user wait time?\n\n### Day 7 — Application\n\n**Q7:** Implement a RestClient with 2s timeout, circuit breaker (50% failure threshold), and cached fallback.\n**Q8:** A service makes 1000 calls/min to a dependency that degrades to 5s latency. Calculate thread pool exhaustion time.\n**Q9:** Design the retry strategy for a payment service call (idempotency, max attempts, backoff).\n\n### Day 14 — Synthesis\n\n**Q10:** ★ Classic interview: *"How do you make synchronous inter-service calls resilient in microservices?"*\n**Q11:** Draw the resilience layers (timeout → retry → circuit breaker → fallback) for a payment call.\n**Q12:** ★ System design: *"Design the service communication layer for 20 microservices: timeouts, retries, circuit breakers, load balancing."*`
  },

  'ms-config-server': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Centralised Config Like I'm 10 Years Old\n> Imagine 20 restaurant branches each with their own recipe book. When the chef wants to update a recipe, she must visit all 20 branches. **Spring Cloud Config is a shared recipe book in the cloud.** All branches (microservices) read their configuration from one central place (Git repo). When the chef updates the recipe (config), all branches pick it up — no individual visits needed. Even better: each branch can have its own section in the book (dev vs prod config), and secrets (passwords) are stored separately in a vault, not in the book.`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Spring Cloud Config Server + Client\n\n**What you will build:** A Config Server reading from a Git repo, and a client service that fetches config at startup.\n**Why this project:** Forces you to experience the bootstrap priority (Config Server > local application.yml).\n**Time estimate:** 25 minutes\n\n---\n\n\`\`\`java\n// Config Server\n@SpringBootApplication\n@EnableConfigServer\npublic class ConfigServerApp { public static void main(String[] a) { SpringApplication.run(ConfigServerApp.class, a); } }\n// application.yml:\n// server.port: 8888\n// spring.cloud.config.server.git.uri: https://github.com/yourorg/config-repo\n\n// Client service\n@SpringBootApplication\npublic class OrderApp { public static void main(String[] a) { SpringApplication.run(OrderApp.class, a); } }\n\n@RestController\nclass ConfigController {\n    @Value("\${order.max-items:10}") int maxItems; // fetched from Config Server\n    @GetMapping("/config") public Map<String,Object> show() { return Map.of("maxItems", maxItems); }\n}\n// bootstrap.yml (or spring.config.import in application.yml):\n// spring.config.import: optional:configserver:http://localhost:8888\n\`\`\`\n\n**Stretch Challenges:**\n- [ ] Add \`/actuator/refresh\` endpoint to reload config without restart\n- [ ] Store database passwords in Vault and reference from Config Server\n- [ ] Add encryption for sensitive config values using Config Server's encrypt/decrypt endpoints`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1 — Recall\n\n**Q1:** What problem does Spring Cloud Config Server solve? What is the alternative?\n**Q2:** In what order does Spring Boot resolve config (Config Server vs local vs env vars)?\n**Q3:** How does a Spring Boot client indicate it wants config from a Config Server?\n\n### Day 3 — Comprehension\n\n**Q4:** How do you refresh config in a running service without restarting it?\n**Q5:** How do you store secrets (DB passwords) in Config Server securely?\n**Q6:** What happens when the Config Server is down at service startup? How do you handle it?\n\n### Day 7 — Application\n\n**Q7:** Set up a Config Server with a Git backend, serving dev and prod profiles for an order-service.\n**Q8:** Design a config management strategy for 30 microservices across dev, staging, and prod.\n**Q9:** How would you migrate from property files per service to a centralised Config Server?\n\n### Day 14 — Synthesis\n\n**Q10:** ★ Classic interview: *"How do you manage configuration across 50 microservices?"*\n**Q11:** Draw the config delivery architecture: Git → Config Server → Spring Boot client → environment variables → Kubernetes secrets.\n**Q12:** ★ System design: *"Design a configuration management system for 100 microservices in 4 regions."*`
  },

  'ms-cqrs': {
    feynman: `## FEYNMAN CHECK\n\n### Explain CQRS Like I'm 10 Years Old\n> Imagine a library. When you want to add a new book (command/write), the librarian goes to the "add books" desk. When you want to find a book (query/read), you go to the catalogue desk. Each desk is optimised for its job — the catalogue desk has search indexes everywhere; the "add books" desk has forms and inventory systems. **CQRS separates reads from writes.** Your order database (optimised for ACID writes) and your order-list read model (optimised for fast search and display) are different stores, kept in sync by domain events. Netflix uses this: writes go to a master store; reads come from a search-optimised replica.`,
    build: `## BUILD\n\n### 🏗️ Mini Project: CQRS Order System\n\n**What you will build:** An order command handler (writes to PostgreSQL) and a query handler (reads from an in-memory read model built from events).\n**Why this project:** Forces you to design the projection — how write events update the read model.\n**Time estimate:** 30 minutes\n\n---\n\n\`\`\`java\n// Command side\nrecord PlaceOrderCommand(long customerId, String sku, int qty) {}\nrecord OrderPlaced(long orderId, long customerId, String sku, int qty, java.time.Instant at) {}\n\n@Service class OrderCommandService {\n    private final java.util.function.Consumer<OrderPlaced> eventBus;\n    OrderCommandService(java.util.function.Consumer<OrderPlaced> bus) { this.eventBus = bus; }\n    public long handle(PlaceOrderCommand cmd) {\n        long id = System.nanoTime();\n        eventBus.accept(new OrderPlaced(id, cmd.customerId(), cmd.sku(), cmd.qty(), java.time.Instant.now()));\n        return id;\n    }\n}\n\n// Query side — read model kept in sync via events\n@Service class OrderQueryService {\n    private final Map<Long, OrderSummary> readModel = new java.util.concurrent.ConcurrentHashMap<>();\n    // Called when OrderPlaced event arrives\n    public void on(OrderPlaced e) { readModel.put(e.orderId(), new OrderSummary(e.orderId(), e.customerId(), e.sku(), "PENDING")); }\n    public List<OrderSummary> byCustomer(long customerId) {\n        return readModel.values().stream().filter(o -> o.customerId() == customerId).toList();\n    }\n}\n\nrecord OrderSummary(long orderId, long customerId, String sku, String status) {}\n\`\`\`\n\n**Stretch Challenges:**\n- [ ] Persist read model in Elasticsearch for full-text search\n- [ ] Add event sourcing: reconstruct any entity from its event history\n- [ ] Implement eventual consistency detection: how far behind is the read model?`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1 — Recall\n\n**Q1:** What is CQRS? What does it separate and why?\n**Q2:** What is the difference between CQRS and event sourcing? Can you have one without the other?\n**Q3:** Name 3 scenarios where CQRS is beneficial.\n\n### Day 3 — Comprehension\n\n**Q4:** How does the read model stay in sync with the write model? What happens if an event is missed?\n**Q5:** What is eventual consistency in CQRS? How do you handle it in the UI?\n**Q6:** Compare a single shared DB vs CQRS for a high-read, low-write order system.\n\n### Day 7 — Application\n\n**Q7:** Implement a CQRS order system with separate command handler and query handler.\n**Q8:** The CQRS read model is 5 minutes behind. Diagnose the cause and implement a fix.\n**Q9:** Design the event schema for event sourcing an Order aggregate.\n\n### Day 14 — Synthesis\n\n**Q10:** ★ Classic interview: *"When would you use CQRS? Walk through a real-world example."*\n**Q11:** Draw the CQRS + event sourcing architecture for an audit trail system.\n**Q12:** ★ System design: *"Design a Netflix-style viewing history system using CQRS."*`
  },

  'ms-observability': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Observability Like I'm 10 Years Old\n> Imagine your car's dashboard: speedometer, fuel gauge, temperature gauge. You can see what's happening inside the engine without opening the hood. **Observability is the dashboard for microservices.** Metrics (Prometheus) show what's happening over time — like a speedometer. Traces (Jaeger) show the complete journey of each request — like GPS tracking. Logs (ELK) record detailed events — like a black box recorder. Together, the "three pillars" tell you: Is anything wrong? Where is it happening? Why is it happening?`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Prometheus + Grafana Dashboard\n\n**What you will build:** A Spring Boot service exposing custom business metrics to Prometheus, visualised in a Grafana dashboard.\n**Why this project:** Forces you to think about WHAT to measure, not just HOW.\n**Time estimate:** 30 minutes\n\n---\n\n\`\`\`java\n@SpringBootApplication\npublic class App { public static void main(String[] a) { SpringApplication.run(App.class, a); } }\n\n@RestController @RequestMapping("/orders")\nclass OrderController {\n    private final Counter ordersPlaced;\n    private final Timer orderLatency;\n    private final Gauge pendingOrders;\n    private final AtomicInteger pending = new java.util.concurrent.atomic.AtomicInteger(0);\n\n    OrderController(MeterRegistry r) {\n        ordersPlaced = Counter.builder("orders.placed").description("Total orders placed").register(r);\n        orderLatency = Timer.builder("orders.latency").description("Order placement latency").register(r);\n        pendingOrders = Gauge.builder("orders.pending", pending, AtomicInteger::get).register(r);\n    }\n\n    @PostMapping\n    public Map<String,Object> place(@RequestBody Map<String,String> req) {\n        return orderLatency.record(() -> {\n            ordersPlaced.increment();\n            pending.incrementAndGet();\n            var result = Map.of("orderId", System.nanoTime(), "status", "PENDING");\n            pending.decrementAndGet();\n            return result;\n        });\n    }\n}\n\`\`\`\n\n\`\`\`yaml\n# docker-compose.yml\nservices:\n  prometheus:\n    image: prom/prometheus:v2.50.0\n    volumes: [./prometheus.yml:/etc/prometheus/prometheus.yml]\n    ports: ["9090:9090"]\n  grafana:\n    image: grafana/grafana:10.2.0\n    ports: ["3000:3000"]\n\`\`\`\n\n**Stretch Challenges:**\n- [ ] Add SLO-based alerting: alert when P99 latency > 500ms for 5 minutes\n- [ ] Build a Grafana dashboard with the 4 golden signals\n- [ ] Add JVM metrics (heap, GC pause, thread count) alongside business metrics`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1 — Recall\n\n**Q1:** What are the 3 pillars of observability? What does each measure?\n**Q2:** What are the 4 golden signals? Define each in one sentence.\n**Q3:** Write Micrometer code to create a counter and timer for an HTTP endpoint.\n\n### Day 3 — Comprehension\n\n**Q4:** When would you use Prometheus vs distributed tracing to investigate a performance problem?\n**Q5:** What is an SLO? Give an example for a payment API.\n**Q6:** Design a Grafana dashboard for an order service. What 6 panels would you include?\n\n### Day 7 — Application\n\n**Q7:** Add 5 meaningful business metrics to an order service: orders per minute, payment success rate, p99 latency, pending orders, inventory reservation success rate.\n**Q8:** A service has 2% error rate. Using only Prometheus metrics, diagnose whether it's a database issue, external API issue, or business logic issue.\n**Q9:** Implement alert rules: error_rate > 1%, p99 > 1s, pending_orders > 1000.\n\n### Day 14 — Synthesis\n\n**Q10:** ★ Classic interview: *"How do you monitor 50 microservices in production?"*\n**Q11:** Draw the observability stack: Spring Boot → Prometheus → Grafana. Include alerting flow.\n**Q12:** ★ System design: *"Design observability for a payment system processing $1B/day."*`
  },

  'ms-centralised-logging': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Centralised Logging Like I'm 10 Years Old\n> Imagine 20 chefs in a restaurant each writing their own recipe notes on separate pieces of paper. When food tastes wrong, you check everyone's notes — taking an hour. **Centralised logging is like one shared notebook** (Elasticsearch) that all chefs (microservices) write to in real time. You search the notebook for "burnt garlic" (error) and see exactly who wrote it, when, and what happened before and after. Logstash collects and formats the notes; Kibana lets you search and visualise them. The key: structured JSON logs (not unstructured strings) so you can filter by orderId, userId, or error type instantly.`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Structured Logging With Correlation IDs\n\n**What you will build:** A Spring Boot service that logs structured JSON with trace IDs that can be searched in Kibana.\n**Why this project:** Forces you to design log schemas that are useful for debugging, not just debugging aids.\n**Time estimate:** 25 minutes\n\n---\n\n\`\`\`java\n@SpringBootApplication\npublic class App { public static void main(String[] a) { SpringApplication.run(App.class, a); } }\n\n@RestController @RequestMapping("/orders")\nclass OrderController {\n    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(OrderController.class);\n\n    @PostMapping\n    public Map<String,Object> place(@RequestBody Map<String,String> req) {\n        String requestId = java.util.UUID.randomUUID().toString();\n        org.slf4j.MDC.put("requestId", requestId);\n        org.slf4j.MDC.put("customerId", req.get("customerId"));\n        try {\n            log.info("Order placement started", (Object) new Object[]{});\n            // business logic\n            long orderId = System.nanoTime();\n            log.info("Order placed successfully orderId={}", orderId);\n            return Map.of("orderId", orderId, "requestId", requestId);\n        } catch (Exception e) {\n            log.error("Order placement failed", e);\n            throw e;\n        } finally { org.slf4j.MDC.clear(); }\n    }\n}\n\`\`\`\n\n\`\`\`xml\n<!-- logback-spring.xml -->\n<configuration>\n  <appender name="JSON" class="ch.qos.logback.core.ConsoleAppender">\n    <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>\n  </appender>\n  <root level="INFO"><appender-ref ref="JSON"/></root>\n</configuration>\n\`\`\`\n\n**Stretch Challenges:**\n- [ ] Route JSON logs to Elasticsearch via Filebeat\n- [ ] Create Kibana dashboards for error rate by service and endpoint\n- [ ] Implement log sampling: 1% for DEBUG, 100% for ERROR`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1 — Recall\n\n**Q1:** What are the 3 components of the ELK stack and what does each do?\n**Q2:** What is MDC (Mapped Diagnostic Context)? What fields should always be in it?\n**Q3:** Why is structured JSON logging better than plaintext for microservices?\n\n### Day 3 — Comprehension\n\n**Q4:** How do you correlate logs across 5 services for one user request?\n**Q5:** What is log sampling? When should you reduce log verbosity?\n**Q6:** Design the log schema for an order service: what fields must every log line include?\n\n### Day 7 — Application\n\n**Q7:** Configure structured JSON logging in Spring Boot with MDC fields: requestId, userId, orderId, service.\n**Q8:** A production bug occurs at 3am affecting 0.1% of users. Design the logging strategy to debug it from logs alone.\n**Q9:** Calculate log volume for a service handling 10K req/s with 5 log lines per request at 200 bytes each.\n\n### Day 14 — Synthesis\n\n**Q10:** ★ Classic interview: *"How do you debug a production issue in a 20-service microservices system?"*\n**Q11:** Draw the log collection pipeline: Spring Boot → Logback JSON → Filebeat → Logstash → Elasticsearch → Kibana.\n**Q12:** ★ System design: *"Design the logging infrastructure for 100 microservices generating 10TB of logs per day."*`
  },

  'ms-k8s': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Kubernetes for Microservices Like I'm 10 Years Old\n> Imagine a robot factory manager. You tell the manager "I need 5 widget robots running at all times." The manager assigns robots to workbenches (nodes), restarts robots that break, adds more robots when the factory gets busy, and replaces broken workbenches by moving robots to healthy ones. **Kubernetes is that factory manager for microservices.** You declare "I need 3 instances of order-service," and Kubernetes makes sure 3 are always running — on whatever servers have capacity. If a server dies, Kubernetes moves the instances to other servers automatically. This is why microservices run on Kubernetes instead of individual VMs.`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Microservice on Kubernetes (minikube)\n\n**What you will build:** Deploy a Spring Boot microservice to minikube with a Deployment, Service, ConfigMap, and health probes.\n**Why this project:** Forces you to write production-ready Kubernetes manifests including all required health probes.\n**Time estimate:** 30 minutes\n\n---\n\n\`\`\`yaml\n# deployment.yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: order-service\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: order-service\n  template:\n    metadata:\n      labels:\n        app: order-service\n    spec:\n      containers:\n      - name: order-service\n        image: shop/order-service:1.0.0\n        ports: [{containerPort: 8080}]\n        env:\n        - name: SPRING_PROFILES_ACTIVE\n          value: prod\n        livenessProbe:\n          httpGet: {path: /actuator/health/liveness, port: 8080}\n          initialDelaySeconds: 30\n          periodSeconds: 10\n        readinessProbe:\n          httpGet: {path: /actuator/health/readiness, port: 8080}\n          initialDelaySeconds: 15\n          periodSeconds: 5\n        resources:\n          requests: {cpu: 250m, memory: 512Mi}\n          limits: {cpu: 1000m, memory: 1Gi}\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: order-service\nspec:\n  selector:\n    app: order-service\n  ports: [{port: 8080, targetPort: 8080}]\n\`\`\`\n\n\`\`\`bash\nminikube start\neval $(minikube docker-env)\ndocker build -t shop/order-service:1.0.0 .\nkubectl apply -f deployment.yaml\nkubectl get pods  # 3 pods running\nkubectl scale deployment order-service --replicas=5  # scale up\n\`\`\`\n\n**Stretch Challenges:**\n- [ ] Add HorizontalPodAutoscaler scaling on CPU > 70%\n- [ ] Configure ConfigMap for application.properties\n- [ ] Add an Ingress controller to expose via HTTP`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1 — Recall\n\n**Q1:** What is a Pod? What is a Deployment? What is a Service? Define each.\n**Q2:** What are liveness, readiness, and startup probes? What happens when each fails?\n**Q3:** Write a minimal Kubernetes Deployment for a Spring Boot service with 3 replicas.\n\n### Day 3 — Comprehension\n\n**Q4:** What happens when a node running 5 pods dies? What does Kubernetes do automatically?\n**Q5:** How does Kubernetes service discovery work? What DNS name does order-service get?\n**Q6:** Compare Kubernetes Deployment vs StatefulSet. When would you use each?\n\n### Day 7 — Application\n\n**Q7:** Write Kubernetes manifests for a 3-replica order-service with CPU/memory limits, both health probes, and a ConfigMap.\n**Q8:** A rolling deploy causes 30% of requests to fail for 2 minutes. How do you configure the Deployment to prevent this?\n**Q9:** Design a Horizontal Pod Autoscaler that scales from 2 to 20 replicas based on RPS.\n\n### Day 14 — Synthesis\n\n**Q10:** ★ Classic interview: *"Walk through deploying a microservice to Kubernetes with zero downtime."*\n**Q11:** Draw the Kubernetes network path for an external request to an internal pod.\n**Q12:** ★ System design: *"Design the Kubernetes cluster architecture for 50 microservices with high availability across 3 AZs."*`
  },

  'ms-service-mesh': {
    feynman: `## FEYNMAN CHECK\n\n### Explain Service Mesh Like I'm 10 Years Old\n> In a hotel, every room (service) has its own front door. A service mesh is like adding a hallway security guard (sidecar proxy) next to every room door. The guard handles: checking ID cards (mTLS), counting visitors (metrics), calling for help if the room is busy (circuit breaking), and recording who went where (distributed tracing) — without the room owner doing any of it. **The hotel rooms (your code) just do their job; the guards (Envoy proxies) handle all the network concerns.** Istio deploys and manages these guards automatically via Kubernetes, while your services run unchanged.`,
    build: `## BUILD\n\n### 🏗️ Mini Project: Traffic Splitting With Istio\n\n**What you will build:** Istio VirtualService splitting 90% of traffic to order-service-v1 and 10% to order-service-v2 (canary deploy).\n**Why this project:** Forces you to understand traffic management without code changes — purely via Istio config.\n**Time estimate:** 35 minutes\n\n---\n\n\`\`\`yaml\n# DestinationRule: define v1 and v2 subsets\napiVersion: networking.istio.io/v1beta1\nkind: DestinationRule\nmetadata:\n  name: order-service\nspec:\n  host: order-service\n  subsets:\n  - name: v1\n    labels:\n      version: v1\n  - name: v2\n    labels:\n      version: v2\n---\n# VirtualService: 90/10 canary split\napiVersion: networking.istio.io/v1beta1\nkind: VirtualService\nmetadata:\n  name: order-service\nspec:\n  hosts: [order-service]\n  http:\n  - route:\n    - destination:\n        host: order-service\n        subset: v1\n      weight: 90\n    - destination:\n        host: order-service\n        subset: v2\n      weight: 10\n\`\`\`\n\n\`\`\`bash\n# Monitor canary vs stable error rates:\nistioctl dashboard prometheus\n# Query: sum(rate(istio_requests_total{destination_service="order-service",response_code!~"2.*"}[1m])) by (destination_version)\n\`\`\`\n\n**Stretch Challenges:**\n- [ ] Add mTLS between all services using a PeerAuthentication policy\n- [ ] Inject 5% HTTP 500 errors using Istio fault injection to test circuit breakers\n- [ ] Configure rate limiting at the Istio layer`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1 — Recall\n\n**Q1:** What is a service mesh? What problem does it solve that an API gateway doesn't?\n**Q2:** What is a sidecar proxy? How does Istio inject it into pods?\n**Q3:** Compare API gateway (North-South) vs service mesh (East-West) traffic.\n\n### Day 3 — Comprehension\n\n**Q4:** What is mTLS? How does Istio enable it without code changes?\n**Q5:** How does Istio's VirtualService enable canary deployments?\n**Q6:** What are the 4 things an Envoy sidecar proxy handles for every request?\n\n### Day 7 — Application\n\n**Q7:** Write Istio manifests to split traffic 95/5 between two service versions.\n**Q8:** Use Istio fault injection to add 2-second delays to 20% of requests. Verify circuit breakers respond.\n**Q9:** Configure Istio to automatically retry failed requests to a service (502/503 only).\n\n### Day 14 — Synthesis\n\n**Q10:** ★ Classic interview: *"When would you use a service mesh vs configuring resilience in application code?"*\n**Q11:** Draw the Istio architecture: control plane (istiod) + data plane (Envoy sidecars).\n**Q12:** ★ System design: *"Design the service mesh strategy for 50 microservices: mTLS, observability, traffic management."*`
  },

  'ms-versioning': {
    feynman: `## FEYNMAN CHECK\n\n### Explain API Versioning Like I'm 10 Years Old\n> Imagine 30 penpals who all receive letters following an agreed format: "sender name, message, date." One day, you change the format: "author, message, timestamp." Your 30 penpals are confused — the format changed without warning. **API versioning prevents this.** You publish two addresses: the old format (v1) and the new format (v2). Your penpals keep using v1 until they're ready to switch. You tell them: "v1 works until July — please move to v2 before then." Only when all 30 have switched do you stop delivering v1 letters.`,
    build: `## BUILD\n\n### 🏗️ Mini Project: v1 + v2 Orders API\n\n**What you will build:** An orders API running v1 and v2 simultaneously with Deprecation headers on v1 responses.\n**Why this project:** Forces you to implement the most critical versioning requirement: both versions work at the same time.\n**Time estimate:** 20 minutes\n\n---\n\n\`\`\`java\n@SpringBootApplication\npublic class App { public static void main(String[] a) { SpringApplication.run(App.class, a); } }\n\n@RestController @RequestMapping("/v1/orders")\nclass V1 {\n    @GetMapping("/{id}")\n    ResponseEntity<OrderV1> get(@PathVariable long id) {\n        return ResponseEntity.ok()\n            .header("Deprecation","2025-01-01T00:00:00Z")\n            .header("Sunset","2025-07-01T00:00:00Z")\n            .body(new OrderV1(id,"CONFIRMED","2024-06-25"));\n    }\n}\n\n@RestController @RequestMapping("/v2/orders")\nclass V2 {\n    @GetMapping("/{id}")\n    OrderV2 get(@PathVariable long id) {\n        return new OrderV2(id,"CONFIRMED",java.time.Instant.now(),2999L,"USD");\n    }\n}\n\nrecord OrderV1(long orderId,String status,String date){}\nrecord OrderV2(long orderId,String status,java.time.Instant createdAt,long totalCents,String currency){}\n\`\`\`\n\n**Stretch Challenges:**\n- [ ] Track v1 usage per consumer via Micrometer counter\n- [ ] Return 410 Gone after the sunset date\n- [ ] Write a Pact consumer contract test for v2`,
    spacedReview: `## SPACED REVIEW\n\n### Day 1 — Recall\n\n**Q1:** Name 3 API versioning strategies. Which do you prefer and why?\n**Q2:** What changes to an API are backward-compatible (non-breaking)? List 3.\n**Q3:** What HTTP headers signal API deprecation? What RFC defines them?\n\n### Day 3 — Comprehension\n\n**Q4:** A team renames \`user_id\` to \`customerId\`. Walk through the safe migration strategy.\n**Q5:** Compare Stripe's date-based versioning to URI path versioning.\n**Q6:** What is the correct HTTP status code when a client calls an endpoint past its sunset date?\n\n### Day 7 — Application\n\n**Q7:** Implement v1 and v2 of an order API simultaneously. v1 has Deprecation/Sunset headers.\n**Q8:** Track which consumers are still calling v1 using Micrometer. What do you do when usage reaches zero?\n**Q9:** Design a database migration strategy for removing a field that v1 uses but v2 doesn't.\n\n### Day 14 — Synthesis\n\n**Q10:** ★ Classic interview: *"How do you manage API versioning in a system with 40 consumer services?"*\n**Q11:** Draw the versioning timeline: v2 launch → v1 deprecation → v1 sunset → v1 decommission.\n**Q12:** ★ System design: *"You serve a public API to 5,000 developers. How do you release a breaking change?"*`
  },

};


