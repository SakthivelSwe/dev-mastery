
---

# PART 2 — Antigravity AI Content Generation Engine
> Use Antigravity IDE's AI models to auto-generate deep, internal-working level content for all 989 topics. Zero manual writing.

---

## Model Selection Strategy

Based on the models available in your Antigravity IDE, use this assignment:

| Content Type | Best Model | Why |
|---|---|---|
| JVM Internals, Concurrency, GC, Memory Model | **Claude Sonnet 4.6 (Thinking)** | Deep reasoning, traces internal mechanics step by step |
| System Design HLD, Distributed Systems, CAP | **Claude Sonnet 4.6 (Thinking)** | Thinks through trade-offs, not just surface answers |
| DSA — DP, Graph algorithms, proofs | **Claude Sonnet 4.6 (Thinking)** | Derives recurrences, explains why approach works |
| Architecture patterns, SOLID, DDD, CQRS | **Claude Opus 4.6 (Thinking)** | Strongest architectural reasoning |
| Spring Boot, Angular, React — Level 4–5 | **Claude Sonnet 4.6 (Thinking)** | Best framework internals knowledge |
| Java Level 1–3, JS, HTML, CSS, SQL basics | **Gemini 3.1 Pro (High)** | Fast, accurate, good structured output |
| Level 1–2 topics any path | **Gemini 3.5 Flash (High)** | Fastest, sufficient for beginner content |
| Code examples generation | **Gemini 3.1 Pro (High)** | Clean, compilable code output |
| Interview Q&A generation | **Gemini 3.1 Pro (High)** | Good at structured Q&A format |

---

## The Antigravity Content Agent — Master System Prompt

**Paste this as the SYSTEM prompt in Antigravity before running any content generation:**

```
You are DevMastery Content Engine — an expert technical writer and 10-year senior engineer 
writing educational content for DevMastery, a depth-first programming learning platform.

YOUR WRITING STANDARDS (non-negotiable):
1. NEVER write surface-level explanations. Always go to the internal mechanics.
   BAD: "HashMap stores key-value pairs"
   GOOD: "HashMap internally maintains a Node<K,V>[] table array (bucket array). 
          When you call put(key, value), the JVM computes key.hashCode(), then applies 
          (n-1) & hash to get the bucket index. If that bucket is empty, it creates a 
          new Node. If occupied (collision), it chains using a linked list — and from 
          Java 8+, converts to a red-black TreeNode when chain length > 8 (TREEIFY_THRESHOLD)."

2. Every conceptual claim must be followed by a concrete code example.
3. Explain WHY before HOW. Never skip the motivation.
4. For every algorithm: derive the time and space complexity from scratch, step by step.
5. Real-world usage: name the actual Spring Boot class / Angular service / Java API that uses this concept.
6. Interview section: write answers that would score 10/10 in a Google/Amazon interview — 
   not just correct but complete: approach, edge cases, follow-up questions, complexity.
7. MDX format: use ### subheadings, ```java code blocks, <Callout> components, tables.
8. Minimum word counts per section:
   WHY section:        300+ words
   THEORY section:     600+ words (internal mechanics mandatory)
   CODE section:       Full working code with line-by-line comments
   REAL WORLD section: 400+ words (name actual frameworks, classes, versions)
   INTERVIEW section:  500+ words (3+ questions, complete answers)
9. Level adaptation:
   Level 1: Use analogies (HashMap = library with shelf system), no jargon first
   Level 2: Introduce terminology with definitions
   Level 3: Internal mechanics, JDK source references
   Level 4: Edge cases, performance implications, production gotchas
   Level 5: JVM-level, benchmark data, compare with alternatives, when NOT to use

OUTPUT FORMAT: Pure MDX only. No preamble. No "Here is the content:". Start directly with content.
```

---

## Antigravity Agent Prompt Templates — Per Section Type

### For the WHY Section

```
TASK: Write the WHY section for DevMastery topic: "{TOPIC_TITLE}"
Path: {PATH_NAME} | Level: {LEVEL}

The WHY section must answer:
1. What problem existed BEFORE this concept was invented?
2. What was painful about the old approach? Give a real code example of the pain.
3. How does this concept solve that exact pain? Show the before vs after.
4. Why do developers need to understand this deeply (not just use it)?

EXAMPLE of the expected depth for WHY section of "HashMap":
---
Before HashMap existed (or if you used a plain array/list), searching for a value 
required scanning every element: O(n). Imagine storing 1 million user records and 
needing to find one by email. With a sorted array + binary search you'd get O(log n) 
but inserts are O(n) due to shifting. This is the fundamental tension: fast insert OR 
fast lookup, never both — until hash tables.

HashMap solves this by decoupling the storage location from the insertion order. 
It uses the key's mathematical fingerprint (hashCode) to compute exactly which 
"shelf" (bucket) to look in — making both insert and lookup O(1) average.
Without understanding this, you'll: use HashMap where TreeMap is needed (sorted order), 
write hashCode() implementations that cause catastrophic collision chains, 
misuse it in multithreaded code causing ConcurrentModificationException...
---

Write the WHY section for: {TOPIC_TITLE} at Level {LEVEL}
Minimum 300 words. MDX format.
```

---

### For the THEORY Section (most important — deepest content)

```
TASK: Write the THEORY section for DevMastery topic: "{TOPIC_TITLE}"
Path: {PATH_NAME} | Level: {LEVEL}

THE THEORY SECTION IS THE HEART OF THE TOPIC. It must cover ALL of:

□ Complete internal mechanics — how does it work inside the JVM/browser/engine?
□ Data structure / memory layout (draw with ASCII art if helpful)
□ Step-by-step walkthrough of the most important operation
□ Every important edge case and what happens internally
□ Time complexity: derive it, don't just state it
□ Space complexity: derive it, count every allocation
□ Comparison with alternatives (when is X better than Y?)
□ Common misconceptions — what do beginners get wrong?

INTERNAL MECHANICS REQUIREMENT:
For Java topics: Reference actual JDK source (OpenJDK). Name classes, methods, constants.
  Example: "HashMap.putVal() checks (p = tab[i = (n-1) & hash]) == null where n is table.length"
For JS topics: Reference V8 engine internals where applicable.
  Example: "V8 represents objects with hidden classes (Shapes) — adding properties in 
  different order creates different hidden classes, causing deoptimization"
For Spring Boot: Name the actual auto-configuration class.
  Example: "RedisAutoConfiguration creates a LettuceConnectionFactory bean when 
  spring-boot-starter-data-redis is on classpath and spring.data.redis.host is set"
For System Design: Include capacity estimation numbers.
  Example: "At 10,000 QPS with 1KB average payload: 10MB/s write throughput. 
  A single PostgreSQL instance handles ~5,000 writes/sec, so we need sharding."

Write the THEORY section for: {TOPIC_TITLE} at Level {LEVEL}
Minimum 600 words. MDX format. Include ASCII diagrams where helpful.
```

---

### For the CODE Section

```
TASK: Write the CODE section for DevMastery topic: "{TOPIC_TITLE}"
Path: {PATH_NAME} | Level: {LEVEL}
Primary Language: {LANGUAGE}

Generate code examples for ALL 5 levels, even if this topic is level {LEVEL}.
Label each block clearly.

LEVEL 1 — BEGINNER (simplest possible, heavy comments):
  - 10–20 lines max
  - Every single line commented
  - Use the most basic syntax only
  - No external libraries

LEVEL 2 — BUILDING BLOCKS (practical usage):
  - 20–40 lines
  - Shows real usage patterns
  - Comments on non-obvious lines

LEVEL 3 — INTERMEDIATE (production pattern):
  - 40–70 lines
  - Error handling included
  - Best practices shown (proper naming, structure)
  - Comments on design decisions

LEVEL 4 — ADVANCED (production-grade, real world):
  - 60–100 lines
  - Performance-conscious
  - Thread safety considered
  - Proper exception handling
  - Could go into a real codebase

LEVEL 5 — EXPERT (internals-aware, optimized):
  - Shows the internal trick or optimization
  - Benchmarks or performance notes in comments
  - References JDK/framework source
  - Production war story context

RULES FOR ALL CODE:
- Must compile and run without modification
- Use meaningful variable names (not x, y, temp)
- Include a main() method or test that demonstrates the output
- Show expected output in a comment at the bottom
- For Java: use Java 21 features where appropriate
- Never use deprecated APIs

Write all 5 levels for: {TOPIC_TITLE}
```

---

### For the REAL WORLD Section

```
TASK: Write the REAL WORLD section for DevMastery topic: "{TOPIC_TITLE}"
Path: {PATH_NAME} | Level: {LEVEL}

The REAL WORLD section must answer: "Where exactly does this appear in production code?"

STRUCTURE REQUIRED:
1. "You've already used this" — show how the developer has unknowingly used this concept
   (e.g., "Every time you call @Cacheable in Spring, you're using a HashMap internally")

2. Framework/Library usage — name EXACT classes:
   - For Java: Spring class, method, package (e.g., "org.springframework.cache.annotation.Cacheable")
   - For JS: npm package, function name, version
   - For SQL: PostgreSQL extension or query pattern

3. Production code snippet — show how this is used in a real Spring Boot / Angular service
   (not toy examples — a real service method with proper annotations)

4. When NOT to use this — production anti-patterns:
   - What mistake will a junior developer make with this?
   - What does the wrong usage look like?
   - What does it cost (performance, memory, correctness)?

5. Performance data — give real numbers:
   - "HashMap.get() is O(1) but under high collision degrades to O(n). 
      In production: always override hashCode() for entity keys"
   - "A N+1 query problem with JPA can turn a 50ms API into a 5000ms API"

Write the REAL WORLD section for: {TOPIC_TITLE}
Minimum 400 words. Include at least one production Spring Boot / real framework code snippet.
```

---

### For the INTERVIEW Section

```
TASK: Write the INTERVIEW section for DevMastery topic: "{TOPIC_TITLE}"
Path: {PATH_NAME} | Level: {LEVEL}

Generate a complete interview prep section with 5 questions minimum.

QUESTION TYPES (must include all types):
□ CONCEPTUAL: "Explain how X works internally"
□ CODING: A problem that requires implementing or using this concept
□ TRICKY: A common misconception or edge case question
□ COMPARISON: "X vs Y — when would you use each?"
□ SCENARIO: "In a system handling 1M requests/day, how would you use X?"

FOR EACH QUESTION provide:
- The question (as interviewer would ask it)
- ❌ WRONG ANSWER: What a junior/unprepared candidate says
- ✅ STRONG ANSWER: What scores a 10/10 (complete, with internal mechanics)
- FOLLOW-UP: The next question the interviewer asks (and its strong answer)
- DIFFICULTY: Easy / Medium / Hard
- COMPANIES: Which companies typically ask this (Google, Amazon, Flipkart, etc.)

EXAMPLE FORMAT:
---
### Q1: How does HashMap handle collisions internally?
**Difficulty:** Medium | **Companies:** Amazon, Flipkart, Goldman Sachs

❌ **Weak answer:** "It uses chaining — a linked list at each bucket"

✅ **Strong answer:** 
"HashMap uses a Node<K,V>[] array called table as the bucket array. 
When two keys hash to the same bucket index (computed as (n-1) & hash), 
HashMap chains them as a linked list starting from Java 1.0. 
The critical Java 8 optimization: when a single chain exceeds TREEIFY_THRESHOLD (8 nodes), 
it converts from LinkedList to a Red-Black TreeNode, changing worst-case lookup 
from O(n) to O(log n). This conversion only happens if the table size >= 64 
(MIN_TREEIFY_CAPACITY), otherwise it resizes instead. 
The tree reverts to a list when size drops below UNTREEIFY_THRESHOLD (6)."

**Follow-up:** "What is the time complexity of get() in the worst case?"
**Strong follow-up answer:** "O(log n) with Java 8+ due to tree conversion, 
O(n) with Java 7 and earlier. Average case is O(1)."
---

Write the INTERVIEW section for: {TOPIC_TITLE} Level {LEVEL}
Minimum 5 questions. All types covered. Full strong answers for each.
```

---

## Antigravity Batch Content Generation Prompts

These are the actual prompts to run in Antigravity as agent tasks.
Run one prompt per session. Each prompt generates a full group of related topics.

---

### BATCH PROMPT A — Java Core (Level 1–2): 16 Topics

**Model: Gemini 3.5 Flash (High)**

```
You are the DevMastery Content Engine. Generate complete 6-layer MDX content for the following 
16 Java Core topics (Level 1–2).

For EACH topic, generate ALL 6 sections in this exact MDX structure:

---
## WHY
[300+ words explaining the problem this concept solves]

## THEORY
[600+ words of internal mechanics, memory layout, step-by-step walkthrough, 
complexity derivation, edge cases, common misconceptions]

## VISUALIZATION_CONFIG
{
  "component": "CodeStepsVisualizer",
  "steps": ["step1", "step2", "step3"]
}

## CODE
### Level 1 — Beginner
// [10-20 lines, every line commented]

### Level 2 — Building Blocks
// [20-40 lines, practical usage]

### Level 3 — Intermediate
// [production pattern]

### Level 4 — Advanced
// [performance-conscious, thread-safe where applicable]

### Level 5 — Expert
// [JVM-level, internal tricks]

## REAL_WORLD
[400+ words: exact Spring Boot class names, production patterns, anti-patterns with code]

## INTERVIEW
[5+ questions: conceptual, coding, tricky, comparison, scenario — with full strong answers]

---

GENERATE FOR THESE TOPICS (label each with === TOPIC: {slug} ===):

=== TOPIC: java-intro ===
Title: JDK vs JRE vs JVM | Level: 1
Deep focus: JVM architecture (ClassLoader → Bytecode Verifier → Execution Engine → JIT),
what javac produces, .class file structure, how JVM loads and executes bytecode

=== TOPIC: data-types-and-variables ===
Title: Data Types and Variables | Level: 1
Deep focus: Primitive memory sizes on stack, Integer cache (-128 to 127), autoboxing pitfalls,
String pool and intern(), == vs equals() trap, literal assignment vs new

=== TOPIC: operators-and-expressions ===
Title: Operators and Expressions | Level: 1
Deep focus: Integer promotion rules, compound assignment hidden casts, bit shift operators
(signed >>, unsigned >>>), short-circuit evaluation, operator precedence traps

=== TOPIC: control-flow ===
Title: Control Flow | Level: 1
Deep focus: Switch expression (Java 14+) vs switch statement, enhanced switch with yield,
labeled break/continue, why fall-through exists, bytecode for if vs switch

=== TOPIC: arrays ===
Title: Arrays in Java | Level: 1
Deep focus: Arrays are objects on heap, length field not method, multi-dimensional = array of arrays,
Arrays.sort() uses dual-pivot quicksort, System.arraycopy() vs Arrays.copyOf() performance

=== TOPIC: strings ===
Title: Strings — Immutability and String Pool | Level: 1
Deep focus: String pool in Metaspace (Java 8+), intern() method, why String is immutable 
(security, thread safety, hashCode caching), StringBuilder vs StringBuffer vs String 
concatenation in loops (compiler optimization), String.format() vs + vs StringBuilder benchmark

=== TOPIC: methods ===
Title: Methods and Overloading | Level: 1  
Deep focus: Stack frame creation on each method call, parameter passing (always pass-by-value in Java,
reference types pass the reference value), varargs bytecode expansion, method overloading resolution rules

=== TOPIC: oop-intro ===
Title: OOP — Classes and Objects | Level: 1
Deep focus: Object layout in heap (mark word + class pointer + instance fields), object header size,
default constructor bytecode, this reference on stack, new keyword: memory allocation + constructor call + return ref

=== TOPIC: inheritance ===
Title: Inheritance | Level: 2
Deep focus: vtable (virtual method table) for dynamic dispatch, how JVM resolves overridden methods,
super() must be first in constructor (compiler enforced), constructor chaining up to Object,
diamond problem → why Java doesn't allow multiple class inheritance

=== TOPIC: polymorphism ===
Title: Polymorphism | Level: 2
Deep focus: Compile-time (overloading — resolved by compiler) vs Runtime (overriding — vtable lookup),
invokevirtual vs invokespecial bytecode instructions, Liskov Substitution Principle,
covariant return types (Java 5+), bridge methods for generics

=== TOPIC: abstraction ===
Title: Abstraction | Level: 2
Deep focus: abstract class vs interface design choice (has-a vs is-a), when abstract class wins
(shared state, constructor logic), JVM cannot instantiate abstract — throws InstantiationException,
template method pattern as primary use case

=== TOPIC: interfaces ===
Title: Interfaces — Default and Static Methods | Level: 2
Deep focus: Interface evolution problem (adding methods breaks implementors) → why default methods added in Java 8,
interface static methods, functional interface (@FunctionalInterface), SAM (Single Abstract Method) type,
how lambda is compiled to invokedynamic bytecode, not anonymous inner class

=== TOPIC: encapsulation ===
Title: Encapsulation | Level: 2
Deep focus: Java access control at bytecode level, package-private as default (most restrictive commonly misunderstood),
reflection bypasses access modifiers (setAccessible(true)), why encapsulation matters for caching
(e.g., String.hashCode cached in private hash field)

=== TOPIC: inner-classes ===
Title: Inner Classes | Level: 2
Deep focus: Non-static inner class holds implicit reference to outer (memory leak risk),
static nested class has no outer reference, anonymous class captures effectively-final variables,
how they're compiled (OuterClass$InnerClass.class), use in Builder and Iterator patterns

=== TOPIC: enums ===
Title: Enums | Level: 2
Deep focus: Enum is a class, each constant is a public static final instance,
values() creates a new array each call (cache it), EnumSet uses bit vector (ultra-fast),
EnumMap backed by array indexed by ordinal, ordinal() vs name() in switch,
serialization behavior of enums

=== TOPIC: generics ===
Title: Generics and Type Erasure | Level: 2
Deep focus: Type erasure — generics only at compile time, erased to Object (or bound) in bytecode,
why List<String> and List<Integer> are same at runtime, heap pollution, unchecked cast warnings,
wildcard ? extends T (upper bounded, covariant) vs ? super T (lower bounded, contravariant),
PECS — Producer Extends, Consumer Super

Output each topic fully. Start each with === TOPIC: {slug} ===.
Total output: ~15,000-20,000 words of pure MDX content.
```

---

### BATCH PROMPT B — Java Collections & Functional (Level 3): 12 Topics

**Model: Claude Sonnet 4.6 (Thinking)**

```
You are the DevMastery Content Engine (senior engineer, 10 years experience).
Generate complete 6-layer MDX content for these 12 Java Collections + Functional topics.
These are Level 3 — intermediate developers who understand OOP. Go deep into internals.

SPECIAL REQUIREMENTS FOR THIS BATCH:
- HashMap section MUST explain: bucket array, hash computation ((n-1) & hash), load factor 0.75, 
  resize doubling, Java 8 TreeNode conversion, Java 9 immutable maps
- Streams API section MUST explain: lazy evaluation (intermediate vs terminal ops), 
  internal spliterator, parallel stream ForkJoinPool, why streams can't be reused
- Every topic must reference OpenJDK source class names

=== TOPIC: collections-overview ===
Title: Java Collections Framework Overview | Level: 3
Cover: Full hierarchy diagram (Collection → List/Set/Queue, Map separate), 
iterable vs collection, fail-fast vs fail-safe iterators, when ConcurrentModificationException fires

=== TOPIC: arraylist-vs-linkedlist ===
Title: ArrayList vs LinkedList | Level: 3
Cover: ArrayList internal Object[] array, 1.5x growth factor, System.arraycopy on insert/delete,
LinkedList as doubly-linked with header sentinel node, cache locality (ArrayList wins in practice),
when LinkedList is actually faster (frequent insert at head/tail)

=== TOPIC: hashmap-internals ===
Title: HashMap — Complete Internal Working | Level: 3
Cover: Node<K,V>[] table, hash() method (key.hashCode() XOR with shift), bucket index calculation,
resize trigger (size > capacity * loadFactor), transfer to new array, Java 8 TreeNode treeification,
HashMap vs LinkedHashMap vs TreeMap, thread-unsafety (infinite loop in Java 7 resize)

=== TOPIC: treemap-and-treeset ===
Title: TreeMap and TreeSet | Level: 3
Cover: Red-Black tree (self-balancing BST) internals, Entry<K,V> with color flag,
compareTo() contract importance, NavigableMap operations (floorKey, ceilingKey, subMap),
O(log n) for all ops vs HashMap O(1), when sorted order is worth the cost

=== TOPIC: linkedhashmap ===
Title: LinkedHashMap and LRU Cache Pattern | Level: 3
Cover: Extends HashMap + doubly-linked list through all entries, access-order vs insertion-order,
removeEldestEntry() hook for implementing LRU Cache in 3 lines, used by Spring's LRU cache implementations

=== TOPIC: priorityqueue ===
Title: PriorityQueue and Heap Internals | Level: 3
Cover: Binary heap backed by Object[] queue array, siftUp on offer(), siftDown on poll(),
why natural ordering uses compareTo (not Comparator by default), 
Dijkstra's algorithm with PriorityQueue, top-K elements pattern

=== TOPIC: iterator-pattern ===
Title: Iterator Pattern — fail-fast vs fail-safe | Level: 3
Cover: Itr inner class in ArrayList, modCount field, expectedModCount check on next(),
ConcurrentModificationException trigger, fail-safe iterators (CopyOnWriteArrayList),
for-each loop as syntactic sugar for iterator (bytecode proves it)

=== TOPIC: lambda-expressions ===
Title: Lambda Expressions | Level: 3
Cover: Not anonymous classes — compiled to invokedynamic + LambdaMetafactory,
why no .class file created for lambdas (unlike anonymous classes),
effectively final requirement for captured variables, method references (4 types),
performance: first lambda invocation slower (bootstrap), subsequent calls fast

=== TOPIC: streams-api ===
Title: Streams API — Lazy Evaluation Internals | Level: 3
Cover: Pipeline of AbstractPipeline stages, lazy evaluation (nothing runs until terminal op),
ReferencePipeline.StatelessOp vs StatefulOp, spliterator characteristics,
parallel stream: ForkJoinPool.commonPool(), Spliterator.trySplit(),
when parallel is slower (small data, IO-bound, non-associative ops)

=== TOPIC: optional ===
Title: Optional | Level: 3
Cover: Wrapper around nullable value, NOT a replacement for null everywhere,
orElse() vs orElseGet() (orElse ALWAYS evaluates the argument — common bug),
flatMap for nested optionals, Optional in return type vs parameters debate,
serialization problem (Optional is not Serializable)

=== TOPIC: functional-interfaces ===
Title: Functional Interfaces | Level: 3  
Cover: @FunctionalInterface guarantee (compiler enforces single abstract method),
Predicate<T> (boolean test), Function<T,R> (apply + compose + andThen), 
Consumer<T> (accept, no return), Supplier<T> (get, no input),
BiFunction/BiPredicate/BiConsumer, primitive specializations (IntPredicate, LongFunction),
why primitive specializations exist (avoid autoboxing overhead)

=== TOPIC: comparator-and-comparable ===
Title: Comparator and Comparable | Level: 3
Cover: Comparable (natural order, in the class) vs Comparator (external, flexible),
Comparator.comparing() method reference pattern, chained thenComparing(),
reversed(), nullsFirst()/nullsLast(), total order requirement (violating causes TreeMap corruption),
sort stability (Arrays.sort for objects is stable — timsort)

Output ALL topics fully in MDX format. Reference OpenJDK classes where possible.
```

---

### BATCH PROMPT C — Java Concurrency (Level 4–5): 8 Topics

**Model: Claude Sonnet 4.6 (Thinking) — Use Thinking mode for this batch**

```
You are the DevMastery Content Engine.
These are Level 4–5 Java Concurrency topics. This is the hardest content to write correctly.
Use your full reasoning to ensure technical accuracy.

CRITICAL ACCURACY RULES FOR CONCURRENCY:
- Be precise about happens-before relationships (Java Memory Model)
- Don't oversimplify volatile (it's not just about visibility — it prevents reordering)
- synchronized intrinsic lock (monitor) uses mark word in object header — explain this
- All code examples must be thread-safe and correct — no subtle bugs
- Explain WHY the code is safe, not just that it is

=== TOPIC: concurrency-basics ===
Title: Concurrency Basics — Threads, Shared State, Race Conditions | Level: 4
Deep internal mechanics:
- Thread is mapped to OS thread (1:1 on HotSpot) — kernel thread creation cost
- JVM stack per thread (default 512KB-1MB), heap is shared
- Race condition: interleaving of non-atomic operations (i++ is 3 bytecode ops: getfield, iadd, putfield)
- Java Memory Model: each thread has working memory (registers/caches), main memory
- Visibility problem: thread writes to working memory, other threads read stale value from main memory
- synchronized: acquires monitor → triggers memory flush to main memory → guaranteed visibility
- volatile: write visible to all threads, prevents instruction reordering, NOT atomic for compound ops
- happens-before: the JMM guarantee (monitor unlock HB monitor lock, volatile write HB volatile read)

=== TOPIC: executorservice ===  
Title: ExecutorService, ThreadPool, CompletableFuture | Level: 4
Deep internals:
- ThreadPoolExecutor: corePoolSize, maximumPoolSize, keepAliveTime, workQueue, threadFactory, handler
- Task submission flow: if pool < core → new thread; else → queue; if queue full → new thread up to max; if max → rejection
- LinkedBlockingQueue (unbounded!) in Executors.newFixedThreadPool — OOM risk
- CompletableFuture: uses ForkJoinPool.commonPool() by default, NOT calling thread
- thenApply vs thenApplyAsync: sync (on completing thread) vs async (new pool thread)
- allOf vs anyOf return CompletableFuture<Void> — cast and join all for results
- Exception handling: exceptionally(), handle(), whenComplete() differences

=== TOPIC: concurrency-utilities ===
Title: CountDownLatch, CyclicBarrier, Semaphore, ReentrantLock | Level: 4
Deep internals:
- CountDownLatch: uses AbstractQueuedSynchronizer (AQS) state = count, await() parks thread, countDown() releases
- CyclicBarrier: uses ReentrantLock + Condition, reusable unlike CountDownLatch, generation concept
- Semaphore: AQS-based, permits, acquire() blocks if 0, release() increments, fair vs unfair
- ReentrantLock: same semantics as synchronized but with tryLock(), timed lock, interruptible lock
- Lock vs synchronized: Lock requires explicit unlock in finally block (resource leak risk)
- ReadWriteLock: ReentrantReadWriteLock, multiple readers OR single writer, not both

=== TOPIC: concurrent-collections ===
Title: ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue | Level: 4
Deep internals:
- ConcurrentHashMap Java 8: NO segment locking (Java 7), instead CAS for empty buckets,
  synchronized only on bin head (single node), Node/TreeNode/ReservationNode,
  size() uses LongAdder (distributed counter, no single hotspot)
- CopyOnWriteArrayList: every write creates a new array copy, reads never block, iterators see snapshot,
  use case: read-heavy, write-rare (event listeners, rarely-updated config)
- ArrayBlockingQueue: fixed-capacity array, two conditions (notFull, notEmpty), single ReentrantLock
- LinkedBlockingQueue: two locks (putLock, takeLock) — producer and consumer can proceed simultaneously

=== TOPIC: java-memory-model ===
Title: Java Memory Model — Happens-Before, Visibility, Reordering | Level: 5
Deep internals:
- JMM is a specification for what compilers/processors can reorder
- Three problems: visibility (stale values), atomicity (partial updates), reordering (unexpected order)
- volatile write: StoreStore + StoreLoad memory barriers, prevents processor reordering
- Processor reordering (x86 has strong model, ARM is weaker): JMM must account for all architectures
- Double-checked locking: broken without volatile (object reference can be seen before constructor runs)
- Safe publication idioms: static initializer, volatile field, final field in constructor

=== TOPIC: garbage-collection ===
Title: Garbage Collection — G1, ZGC, Shenandoah | Level: 5
Deep internals:
- GC roots: JVM stack references, static fields, JNI references, class loader refs
- Mark phase: tri-color marking (white=unvisited, gray=in queue, black=reachable + children scanned)
- G1GC: heap divided into equal-sized regions (1-32MB), Eden/Survivor/Old/Humongous,
  Remembered Sets (RSet) track cross-region references, Mixed GC collects young + some old
- ZGC: load barriers on pointer reads, colored pointers (44-bit address + 4 metadata bits),
  concurrent marking and relocation — pause < 1ms regardless of heap size
- GC tuning flags: -XX:+UseG1GC, -XX:MaxGCPauseMillis, -XX:G1HeapRegionSize
- GC log analysis: [GC pause (G1 Evacuation Pause) (young)] format

=== TOPIC: jvm-architecture ===
Title: JVM Architecture — ClassLoader, Execution Engine, JIT | Level: 5
Deep internals:
- Class loading: Bootstrap (rt.jar) → Extension (ext/) → Application (classpath), parent delegation
- Bytecode verification: type safety, stack consistency, no illegal jumps
- Interpreter: executes bytecode instruction by instruction (slow — no optimization)
- C1 compiler (client): fast compilation, basic optimizations, profiling counters
- C2 compiler (server): aggressive optimizations after 10,000 invocations (CompileThreshold),
  inlining (most impactful), escape analysis, scalar replacement, loop unrolling
- JIT deoptimization: uncommon trap when assumption violated (e.g., polymorphic call site becomes megamorphic)

=== TOPIC: virtual-threads ===
Title: Virtual Threads — Project Loom | Level: 5
Deep internals:
- Virtual thread is NOT a wrapper over OS thread — it's a Java object scheduled by JVM scheduler
- Carrier thread: the OS thread that actually runs (ForkJoinPool, FIFO scheduler)
- Mount/unmount: virtual thread mounts onto carrier, runs, blocks (e.g., on I/O) → unmounts, carrier free
- Continuation: captures virtual thread's stack as a heap object when unmounted
- Pinning: synchronized blocks and native calls pin virtual thread to carrier (use ReentrantLock instead)
- 1 million virtual threads: each needs ~1KB for stack (heap), vs 1MB for platform threads
- Don't pool virtual threads — create fresh ones, they're cheap: Executors.newVirtualThreadPerTaskExecutor()
- Spring Boot 3.2: server.tomcat.threads.virtual=true enables virtual threads for request handling

Output all 8 topics in full MDX format. Technical accuracy is paramount.
```

---

### BATCH PROMPT D — DSA Algorithms (Level 3–5): All Graph + DP Topics

**Model: Claude Sonnet 4.6 (Thinking)**

```
You are the DevMastery Content Engine — a competitive programmer and software engineer.
Generate complete 6-layer MDX for these DSA topics. 

SPECIAL REQUIREMENTS FOR DSA CONTENT:
- Derive every recurrence relation from scratch with explanation
- For every algorithm: trace through a concrete example step by step (show state at each step)
- Include the VISUALIZATION_CONFIG JSON that tells the DSA visualizer what to animate
- All code in Java 21 (primary) with equivalent Python in a comment block
- Time AND Space complexity: derive carefully, not just state
- Interview section: include the follow-up questions interviewers use to probe depth

=== TOPIC: bfs ===
Title: Breadth-First Search | Level: 3
Theory must cover:
- Queue data structure is the REASON BFS finds shortest path (FIFO = level-by-level exploration)
- Visited array/set is critical (without it: infinite loop on cycles)
- BFS tree vs BFS graph
- Level tracking: two-queue trick vs level counter
- Time: O(V+E) — prove it (each vertex enqueued once, each edge relaxed once)
- Space: O(V) — worst case full level on queue (complete binary tree: O(n/2) = O(n))
- When BFS finds shortest path vs when it doesn't (unweighted = yes, weighted = no → Dijkstra)

VISUALIZATION_CONFIG: show queue state alongside graph, node color transitions

=== TOPIC: dfs ===
Title: Depth-First Search | Level: 3
Theory must cover:
- Stack (call stack for recursive, explicit stack for iterative) is the reason DFS goes deep first
- Pre-order vs In-order vs Post-order DFS on trees
- DFS on graph: discovery time and finish time (used in topological sort)
- DFS tree edges vs back edges (cycle detection), forward edges, cross edges
- Connected components: run DFS from each unvisited node
- Recursive DFS risks: StackOverflowError for deep graphs (> 10,000 nodes on default stack)

=== TOPIC: topological-sort ===
Title: Topological Sort | Level: 4
Theory must cover:
- ONLY valid for DAG (Directed Acyclic Graph) — cycle means no valid topological order
- Kahn's BFS approach: in-degree array, queue of 0-in-degree nodes, decrement neighbors
- DFS approach: finish time ordering (reverse post-order)
- Cycle detection: if sorted size < V, a cycle exists
- Applications: build systems (Gradle task dependencies), course prerequisites, spreadsheet evaluation
- O(V+E) time, O(V) space

=== TOPIC: shortest-path-dijkstra ===
Title: Dijkstra's Algorithm | Level: 4
Theory must cover:
- Greedy property: why the nearest unvisited node is always finalized (proof by contradiction)
- Priority queue implementation vs naive O(V²) array scan
- Relaxation: dist[v] = min(dist[v], dist[u] + weight(u,v))
- Lazy deletion in min-heap (re-add outdated entries, skip if already finalized)
- WHY it fails on negative edges (hint: greedy assumption breaks)
- Time: O((V+E) log V) with binary heap, O(V²) with array
- Dijkstra vs Bellman-Ford vs SPFA tradeoffs

=== TOPIC: dynamic-programming-intro ===
Title: Dynamic Programming — Memoization vs Tabulation | Level: 4
Theory must cover:
- Two conditions: Optimal Substructure + Overlapping Subproblems (both required — show counterexamples)
- Top-down (memoization): recursion + cache. Time = O(unique states × work per state)
- Bottom-up (tabulation): fill table in dependency order. Often faster (no recursion overhead)
- State definition is the hardest part — how to identify what parameters define a unique subproblem
- State space size = product of each parameter's range
- Fibonacci: brute force O(2^n) → memo O(n) time O(n) space → tabulation O(n) → O(1) space

=== TOPIC: dp-1d-problems ===
Title: DP 1D Problems — House Robber, Coin Change, Climbing Stairs | Level: 4
For EACH problem cover: problem statement, state definition, recurrence, base case, trace example, code:
- Climbing Stairs: dp[i] = dp[i-1] + dp[i-2], Fibonacci in disguise
- House Robber: dp[i] = max(dp[i-1], dp[i-2] + nums[i]), O(1) space optimization
- Coin Change: unbounded knapsack, dp[amount] = min over all coins
- Coin Change II: count ways, ORDER matters vs doesn't (inner vs outer loop swap)

=== TOPIC: dp-2d-problems ===
Title: DP 2D — 0/1 Knapsack, Subset Sum, Edit Distance | Level: 4
For each: derive recurrence, draw the DP table for a small example, code Level 3-5:
- 0/1 Knapsack: dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w-wt[i]]), O(n) space trick
- Subset Sum: boolean DP table, same structure as knapsack
- Edit Distance (Levenshtein): dp[i][j] = cost of transforming s1[0..i] to s2[0..j]

=== TOPIC: backtracking ===
Title: Backtracking | Level: 5
Theory must cover:
- Backtracking = DFS on decision tree with pruning
- Three types: find ALL solutions, find ONE solution, count solutions
- Template: choose → explore → unchoose (undo choice)
- Pruning: where to add constraints to cut branches early
- Problems: N-Queens (row by row, check column+diagonal constraints), 
  Sudoku (try 1-9 per empty cell, prune by row/col/box), 
  Permutations (swap approach vs used[] array approach)
- Time complexity: worst case O(n!) for permutations, O(n^n) without pruning

Generate all topics in full MDX. Include VISUALIZATION_CONFIG for each algorithm topic.
Trace through concrete examples with arrays like [3,1,4,1,5,9] or graphs of 5-6 nodes.
```

---

### BATCH PROMPT E — System Design Case Studies (Level 5): All HLD Topics

**Model: Claude Opus 4.6 (Thinking) — Highest quality needed**

```
You are the DevMastery Content Engine with 10+ years distributed systems experience.
Generate COMPLETE system design case studies for DevMastery's System Design path.

THESE MUST BE SENIOR-LEVEL QUALITY. Each case study must:
1. Start with requirements gathering (functional + non-functional) — teach the student HOW to ask
2. Include back-of-envelope estimation with real calculations
3. Propose multiple design options and JUSTIFY the choice
4. Show the full architecture with component descriptions
5. Deep-dive into the 2–3 hardest sub-problems
6. Discuss failure scenarios and how the system handles them
7. Scale the design: what changes at 10x traffic?
8. Interview walk-through: how to present this in 45 minutes

=== TOPIC: design-url-shortener ===
Title: Design a URL Shortener (bit.ly) | Level: 5

REQUIREMENTS SECTION:
Functional: shorten URL, redirect, custom alias, expiry, analytics
Non-functional: 100M new URLs/day, 10:1 read:write (1B redirects/day), <10ms p99 redirect, 99.99% uptime

ESTIMATION:
- Write QPS: 100M / 86400 ≈ 1,160 writes/sec (peak: ~3,000/sec)
- Read QPS: 1B / 86400 ≈ 11,574 reads/sec (peak: ~35,000/sec)
- Storage: 100M × 500B (URL avg) = 50GB/day, 18TB/year
- Cache: 20% hot URLs = 11,574 × 0.2 × 500B ≈ hot URLs fit in ~10GB RAM

DESIGN DEEP DIVES:
1. ID generation: counter (single point of failure) vs UUID (too long) vs Base62 encoding of distributed counter
   → Snowflake-like ID: 41 bits timestamp + 10 bits machine ID + 12 bits sequence = 63 bits → Base62 → 7 chars
2. Redirect: 301 (cached by browser — reduces load but breaks analytics) vs 302 (hits server every time — analytics)
3. Valkey caching: Cache-aside pattern, cache most-accessed 20%, TTL = URL expiry time
4. Database: Write path → PostgreSQL (short_url, original_url, user_id, created_at, expires_at)
   Read path → Valkey cache → PostgreSQL if miss

FAILURE SCENARIOS: Valkey down (cold start), DB overload (connection pooling), URL expiry cleanup

=== TOPIC: design-rate-limiter ===
Title: Design a Rate Limiter | Level: 5

Cover all 4 algorithms with implementation:
1. Fixed Window Counter: simple but burst problem at window boundary
2. Sliding Window Log: accurate but O(requests) memory per user
3. Sliding Window Counter: hybrid — interpolated, O(1) memory
4. Token Bucket: allows bursting up to bucket size, Valkey + Lua script for atomicity
5. Leaky Bucket: output rate is constant (used for network shaping)

Redis/Valkey implementation with Lua script for atomic check-and-decrement:
Show the actual Lua script and explain why Lua is needed (atomicity — MULTI/EXEC can have race conditions)

Distributed rate limiting: sticky sessions vs centralized Valkey vs gossip protocol

=== TOPIC: design-notification-system ===  
Title: Design a Notification System | Level: 5

Channels: Push (FCM/APNs), Email (SMTP), SMS (Twilio), In-app
Architecture: Priority queues per channel in Kafka, retry with exponential backoff,
DLQ (Dead Letter Queue) for failed notifications, idempotency key to prevent duplicates,
fan-out: single event → multiple notifications for N users
Template engine: variable substitution, A/B testing support
Rate limiting per user (no notification spam), user preferences (opted out channels)

=== TOPIC: design-distributed-cache ===
Title: Design a Distributed Cache (Valkey/Redis-like) | Level: 5

Internals deep dive:
- Single-threaded event loop (why fast despite single thread): I/O multiplexing with epoll
- Data structures: ziplist/listpack vs hashtable/skiplist based on size threshold
- Consistent hashing with virtual nodes: adding/removing nodes only moves 1/N of keys
- Replication: async replication, replica lag, WAIT command for sync
- Eviction policies: LRU implementation (approximated: sample 5 random keys, evict least recent)
- Persistence: RDB (snapshot, compact) vs AOF (every write logged, crash safe)
- Cluster mode: 16384 hash slots, gossip protocol, MOVED redirect

=== TOPIC: design-twitter ===
Title: Design Twitter | Level: 5

The hard problem — Feed Generation:
- Fan-out on write (push): precompute timeline on tweet → fast read, slow write, wastes space for inactive users
- Fan-out on read (pull): read from all followees' tweets on timeline request → slow read
- Hybrid: fan-out for users with < 10K followers, pull for celebrities
- Twitter's actual approach (Celebrity Problem): separate "celebrity" feeds pulled at read time + regular feeds pushed

Database choices:
- Tweets: write-heavy → Cassandra (time-series, append-only, scales writes)
- Social graph: follows/followers → MySQL with graph queries, or Neo4j
- Timeline cache: Valkey sorted set (tweet_id as score = timestamp), ZADD, ZRANGE

Generate all 5 case studies in full depth. Each must be 2,000+ words.
Include Mermaid architecture diagrams in each.
```

---

### BATCH PROMPT F — Spring Boot Complete (Level 2–5): 20 Topics

**Model: Claude Sonnet 4.6 (Thinking)**

```
You are the DevMastery Content Engine. Generate 6-layer MDX for Spring Boot path topics.

SPRING BOOT CONTENT RULES:
- Reference actual Spring source classes (e.g., DispatcherServlet, AnnotationConfigApplicationContext)
- Show actual application.yml configuration
- All code must use Spring Boot 3.2 + Java 21
- @Bean, @Configuration examples must be complete runnable applications
- Include SonarQube-compliant code (no log-and-throw, proper exception handling)
- Security topics: never show insecure code without explaining why it's insecure

=== TOPIC: spring-beans ===
Title: Spring Beans — @Component, @Service, @Repository, @Controller | Level: 2
Internals: All 4 are @Component stereotypes, scanned by ClassPathScanningCandidateComponentProvider,
BeanDefinition registered in DefaultListableBeanFactory, why semantics matter (AOP advice hooks on @Repository for persistence exception translation)

=== TOPIC: dependency-injection ===
Title: Dependency Injection — Constructor vs Field vs Setter | Level: 2
Internals: Why constructor injection is best (immutable, detectable at startup, no reflection required),
field injection uses ReflectionUtils.setField() — requires Spring context to run (untestable standalone),
circular dependency: constructor DI catches at startup, field DI catches at first use (worse),
@Lazy annotation as circular dependency escape hatch

=== TOPIC: spring-profiles ===
Title: Spring Profiles | Level: 2
Internals: Environment abstraction, @Profile evaluated by ConfigurationCondition, 
profile activation: SPRING_PROFILES_ACTIVE env var vs spring.profiles.active property,
profile groups (Spring 2.4+), default profile fallback

=== TOPIC: rest-controllers ===
Title: @RestController and Request Mapping | Level: 3
Internals: @RestController = @Controller + @ResponseBody, DispatcherServlet routes to HandlerMapping,
RequestMappingHandlerMapping registers all @RequestMapping methods, HandlerAdapter invokes the method,
HttpMessageConverter converts return value to JSON (MappingJackson2HttpMessageConverter),
@RequestBody deserialization: Jackson ObjectMapper, @JsonProperty, @JsonIgnore

=== TOPIC: exception-handling-spring ===
Title: Exception Handling — @ControllerAdvice and Problem Details | Level: 3
Internals: @ExceptionHandler method registered in ExceptionHandlerExceptionResolver,
@ControllerAdvice is @Component + @ResponseBody + global scope,
RFC 9457 ProblemDetail (Spring 6): type, title, status, detail, instance,
Custom exceptions: extend RuntimeException (unchecked), include error code enum,
SonarQube S2139: catch-log-rethrow is an anti-pattern (log OR throw, not both)

=== TOPIC: spring-data-jpa ===
Title: Spring Data JPA — Repository Internals | Level: 4
Internals: JpaRepositoryFactoryBean creates a proxy at startup, derived query method parsing
(findByEmailAndName → WHERE email = ? AND name = ?), @Query JPQL vs native,
EntityManager first-level cache (persistence context), session-per-request pattern,
@Transactional: opens EntityManager, commits/rolls back, propagation levels
(REQUIRED creates new if none, REQUIRES_NEW always new, NESTED uses savepoint)

=== TOPIC: jpa-relationships ===
Title: JPA Relationships — FetchType and N+1 | Level: 4
Internals: LAZY loading uses proxy object (Hibernate's ByteBuddy proxy),
accessing LAZY field outside session = LazyInitializationException,
N+1 problem: findAll() = 1 query, then 1 query PER entity for lazy collection = N+1,
Fix: JOIN FETCH in @Query, @EntityGraph, @BatchSize, DTO projection,
CascadeType: PERSIST, MERGE, REMOVE, ALL — when to use each (REMOVE is dangerous on ManyToMany)

=== TOPIC: jwt-authentication ===
Title: JWT Authentication in Spring Security | Level: 4
Internals: JWT = base64(header).base64(payload).HMACSHA256(header+payload+secret),
JwtAuthenticationFilter extends OncePerRequestFilter,
SecurityContextHolder stores Authentication per thread (ThreadLocal),
JWT validation: signature check + expiry check,
Refresh token pattern: short-lived access token (15min) + long-lived refresh token (7 days)
stored in httpOnly cookie

=== TOPIC: spring-cache ===
Title: Spring Cache — @Cacheable Internals and Valkey | Level: 4
Internals: @Cacheable uses Spring AOP proxy, calls CacheInterceptor.invoke(),
CRITICAL: self-invocation bypass — calling @Cacheable method from same bean bypasses proxy,
Fix: inject self-reference OR use dedicated CacheLoader @Component (your existing pattern),
CacheManager: RedisCacheManager (for Valkey), CaffeineCacheManager (L1 local),
TTL configuration: RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(6))

=== TOPIC: spring-cloud-gateway ===
Title: Spring Cloud Gateway — Route Predicates and Filters | Level: 5
Internals: Built on Spring WebFlux (reactive, Netty), not Spring MVC (servlet-based),
RoutePredicateFactory: Path, Method, Header, Query, Host predicates,
GatewayFilter: AddRequestHeader, AddResponseHeader, CircuitBreaker, RateLimiter, Retry,
RequestRateLimiterGatewayFilterFactory: uses Valkey + Lua script (same as standalone rate limiter),
GlobalFilter vs GatewayFilter, filter ordering (Ordered interface)

Generate 10 of these fully — pick the 10 most important above. Each 1,500+ words MDX.
Include working code in all levels. Reference actual Spring 3.2 classes.
```

---

### BATCH PROMPT G — Angular Complete (Level 2–5): 15 Topics

**Model: Gemini 3.1 Pro (High)**

```
You are the DevMastery Content Engine. Generate 6-layer MDX for Angular path topics.

ANGULAR CONTENT RULES:
- Use Angular 17+ (standalone components as default)
- All code uses TypeScript 5.x
- RxJS topics must explain marble diagrams in text (operator behavior)
- Include Angular CLI commands where relevant
- Reference Angular source code (ChangeDetectorRef, ApplicationRef, etc.)

=== TOPIC: components-angular ===
=== TOPIC: templates ===
=== TOPIC: services-and-di ===
=== TOPIC: routing-angular ===
=== TOPIC: rxjs-in-angular ===
=== TOPIC: change-detection ===
=== TOPIC: signals ===
=== TOPIC: interceptors ===
=== TOPIC: guards ===
=== TOPIC: lazy-loading-angular ===
=== TOPIC: state-management-ngrx ===
=== TOPIC: standalone-components ===
=== TOPIC: testing-angular ===
=== TOPIC: rxjs-advanced ===
=== TOPIC: performance-angular ===

For each topic in this batch:
- signals section: Angular 17+ signals API (signal(), computed(), effect(), toSignal(), toObservable())
- All RxJS code: show marble diagrams in ASCII: source: ---1---2---3---|, result: ---2---4---6---|
- NgRx: use NgRx 17 with createFeature, createActionGroup, provideStore (functional API)

Generate all 15 topics. Each minimum 1,200 words.
```

---

### BATCH PROMPT H — JavaScript Engine Internals (Level 4–5)

**Model: Claude Sonnet 4.6 (Thinking)**

```
You are the DevMastery Content Engine. These are advanced JavaScript topics requiring 
V8 engine-level knowledge. Use Thinking mode — these explanations must be technically precise.

=== TOPIC: event-loop ===
Title: JavaScript Event Loop — Complete Internal Model | Level: 4
Must cover with precise detail:
- V8 Call Stack: LIFO, stack frames, stack overflow (recursion)
- Web APIs: setTimeout, fetch, DOM events — run OUTSIDE V8 in browser APIs / libuv in Node.js
- Callback Queue (Task Queue / Macrotask Queue): setTimeout callbacks, event callbacks
- Microtask Queue: Promise.then(), queueMicrotask(), MutationObserver
- EVENT LOOP ALGORITHM (precise):
  1. Execute current synchronous code (drain call stack)
  2. DRAIN microtask queue completely (all microtasks, including newly added ones)
  3. Take ONE task from macrotask queue
  4. DRAIN microtask queue again
  5. Render (browsers: 60fps = every 16.6ms)
  6. Repeat
- Implication: Promise.then() ALWAYS before setTimeout(fn, 0)
- Node.js event loop: 6 phases (timers, pending callbacks, idle/prepare, poll, check/setImmediate, close)

=== TOPIC: closures ===
Title: Closures — Lexical Scope and Variable Capture | Level: 3
Must cover:
- Lexical scope: function's scope determined at WRITE TIME, not call time
- Closure = function + reference to its surrounding lexical environment
- V8 internals: Closure object stores reference to HeapNumber/object in heap, not stack copy
- Classic bug: for(var i=0; i<3; i++) { setTimeout(() => console.log(i)) } → why prints 3,3,3
- Fix 1: let (block scope), Fix 2: IIFE, Fix 3: function factory
- Memory implication: closure keeps outer scope alive → memory leak if stored indefinitely
- Module pattern uses closure for private state

=== TOPIC: prototype-chain ===
Title: Prototype Chain | Level: 3
Must cover:
- Every object has [[Prototype]] internal slot (__proto__ accessor)
- Object.create(proto): creates object with proto as prototype
- Constructor function: new Foo() creates object with [[Prototype]] = Foo.prototype
- Property lookup: own properties first → prototype → prototype's prototype → null
- hasOwnProperty() vs in operator
- V8 hidden classes (Shapes): adding properties in same order = same Shape = fast property access,
  different order = different Shape = slower (deoptimization)

=== TOPIC: v8-engine ===
Title: V8 Engine Internals — JIT, Hidden Classes, Optimization | Level: 5
Must cover:
- Parsing: source → AST (Abstract Syntax Tree) via parser
- Ignition interpreter: AST → bytecode, executes, collects type feedback
- Sparkplug: quick tier-1 compiler (non-optimizing but fast to compile)
- Maglev: mid-tier JIT compiler (new in V8 2023)
- TurboFan: optimizing JIT, uses type feedback from Ignition
- Hidden Classes (Shapes/Maps): inline cache per property access
- Deoptimization: when assumption wrong (e.g., property type changes int→float), 
  fallback to bytecode (OSR - On-Stack Replacement)
- Inline caches: monomorphic (1 type = fast), polymorphic (2-4 types = ok), megamorphic (5+ = slow)

Generate all 4 topics in full MDX. V8 source file names where applicable.
```

---

## Content Quality Checklist

Before committing any Antigravity-generated content to DevMastery, validate against this checklist:

### THEORY SECTION
- [ ] Does it explain internal mechanics, not just behavior?
- [ ] Is there a concrete step-by-step trace/walkthrough?
- [ ] Is time complexity derived (not just stated)?
- [ ] Is space complexity derived?
- [ ] Are common misconceptions addressed?

### CODE SECTION
- [ ] Does the Level 1 code compile with no modification?
- [ ] Does the Level 5 code show something Level 1 doesn't?
- [ ] Are all variable names meaningful?
- [ ] Is expected output shown in comments?
- [ ] Is the code idiomatic for the language (Java 21, Angular 17, etc.)?

### REAL WORLD SECTION
- [ ] Are actual class names from real frameworks mentioned?
- [ ] Is there a production code snippet (not just toy code)?
- [ ] Is there a "when NOT to use" anti-pattern section?

### INTERVIEW SECTION
- [ ] Are there 5+ questions?
- [ ] Does each question have a weak answer AND a strong answer?
- [ ] Do strong answers include internal mechanics?
- [ ] Is time/space complexity mentioned in coding questions?

### GENERAL
- [ ] No "Here is the content" preamble (pure MDX output)
- [ ] No factual errors (especially for concurrent/distributed topics)
- [ ] MDX syntax valid (no broken code blocks, proper frontmatter)
- [ ] Word count meets minimums

---

## Antigravity Workflow — Running the Agent

### Step-by-Step for Each Batch Prompt

1. Open Antigravity IDE
2. Select model (see Model Selection Strategy table above)
3. Open a new Agent session (not a regular chat)
4. Paste the MASTER SYSTEM PROMPT first (the one with the 9 writing standards)
5. Paste the BATCH PROMPT for the group you want to generate
6. Set output file: `apps/web/content/{path-slug}/{topic-slug}.mdx`
7. Let agent run — it will generate all topics in sequence
8. Agent saves each `=== TOPIC: {slug} ===` block as a separate `.mdx` file
9. Run the content validation checklist manually on 2-3 random topics
10. If quality is good, trigger Admin CMS → bulk import MDX files → publish

### File Structure Agent Should Create

```
apps/web/content/
├── java-mastery/
│   ├── java-intro.mdx
│   ├── data-types-and-variables.mdx
│   ├── hashmap-internals.mdx
│   ├── concurrency-basics.mdx
│   └── ... (72 files)
├── dsa/
│   ├── array-basics.mdx
│   ├── bfs.mdx
│   ├── dynamic-programming-intro.mdx
│   └── ... (68 files)
├── javascript/
│   ├── event-loop.mdx
│   ├── closures.mdx
│   └── ... (65 files)
├── spring-boot/
│   ├── spring-beans.mdx
│   ├── hashmap-internals.mdx
│   └── ... (62 files)
└── ... (all 18 paths)
```

### Antigravity File Write Instruction (add to each batch prompt)

After generating each `=== TOPIC: {slug} ===` block, immediately write it to:  
File path: `apps/web/content/{path-slug}/{slug}.mdx`

MDX frontmatter to prepend to each file:

```yaml
---
slug: "{slug}"
title: "{title}"
path: "{path-slug}"
level: {level}
estimatedMins: {mins}
hasVisualizer: {true/false}
hasCodeLab: true
published: false
tags: [{tag1}, {tag2}]
---
```

Then the 6-layer content below the frontmatter.

---

## Total Generation Estimate

| Batch | Topics | Avg Words | Total Words |
|---|---|---|---|
| Batch A (Java Level 1-2) | 16 | ~1,500 | 24,000 |
| Batch B (Java Collections) | 12 | ~2,000 | 24,000 |
| Batch C (Java Concurrency) | 8 | ~2,500 | 20,000 |
| Batch D (DSA Algorithms) | 20 | ~2,000 | 40,000 |
| Batch E (System Design HLD) | 5 | ~3,000 | 15,000 |
| Batch F (Spring Boot) | 10 | ~1,800 | 18,000 |
| Batch G (Angular) | 15 | ~1,500 | 22,500 |
| Batch H (JS Engine Internals) | 4 | ~2,500 | 10,000 |
| Remaining batches (React, TS, CSS, SQL, etc.) | ~900 | ~1,500 | 1,350,000 |
| **TOTAL** | **~989** | | **~1.5M words** |

### Antigravity Generation Time Estimate

| Model | Speed |
|---|---|
| Gemini 3.5 Flash (High) | ~2 min per batch of 10 topics |
| Gemini 3.1 Pro (High) | ~5 min per batch of 10 topics |
| Claude Sonnet 4.6 | ~8 min per batch of 10 topics |
| Claude Opus 4.6 | ~12 min per batch of 5 topics |

**Total estimated time:** ~80–100 Antigravity agent sessions  
**Spread across:** 2–3 weeks of generation + validation

---

*End of Part 2 — Antigravity AI Content Generation Engine*  
*Use Claude Sonnet 4.6 (Thinking) for deep internals. Gemini 3.5 Flash for Level 1–2. Opus for architecture.*
