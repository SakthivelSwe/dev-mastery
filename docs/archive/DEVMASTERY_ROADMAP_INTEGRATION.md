# DevMastery — Complete Roadmap Integration Plan
> Covering all 18 roadmap.sh paths inside DevMastery Web + Android
> Every topic from every roadmap, organized level-by-level, with Antigravity prompts

---

## Summary

| # | Roadmap | Topics Count | Levels | Priority |
|---|---|---|---|---|
| 1 | Full Stack | 85 topics | 1–5 | P0 — Foundation path |
| 2 | Java Mastery | 72 topics | 1–5 | P0 — Core language |
| 3 | DSA | 68 topics | 1–5 | P0 — Interview critical |
| 4 | LeetCode Patterns | 52 topics | 2–5 | P0 — Interview critical |
| 5 | JavaScript | 65 topics | 1–5 | P0 — Web foundation |
| 6 | TypeScript | 48 topics | 2–4 | P1 |
| 7 | React | 55 topics | 2–5 | P1 |
| 8 | Angular | 58 topics | 2–5 | P1 |
| 9 | Spring Boot | 62 topics | 2–5 | P1 |
| 10 | System Design | 70 topics | 3–5 | P1 |
| 11 | API Design | 44 topics | 2–4 | P2 |
| 12 | Software Architecture | 50 topics | 3–5 | P2 |
| 13 | HTML | 38 topics | 1–3 | P2 |
| 14 | CSS | 52 topics | 1–4 | P2 |
| 15 | SQL | 45 topics | 1–4 | P2 |
| 16 | PostgreSQL DBA | 48 topics | 3–5 | P3 |
| 17 | MongoDB | 40 topics | 2–4 | P3 |
| 18 | Design System | 35 topics | 2–4 | P3 |
| **Total** | **18 paths** | **~989 topics** | 1–5 | — |

---

## Flyway Seed Plan (Learning Paths)

Add this to `V10__seed_learning_paths.sql`:

```sql
INSERT INTO learning_paths (id, slug, title, description, level_min, level_max, icon, order_index, is_active)
VALUES
  (gen_random_uuid(), 'full-stack',          'Full Stack Developer',           'Complete path from beginner to full stack',      1, 5, 'layers',       1,  true),
  (gen_random_uuid(), 'java-mastery',         'Java Mastery',                   'Core Java to JVM internals and concurrency',     1, 5, 'coffee',       2,  true),
  (gen_random_uuid(), 'dsa',                  'Data Structures & Algorithms',   'Every DSA concept for interviews and beyond',    1, 5, 'git-branch',   3,  true),
  (gen_random_uuid(), 'leetcode-patterns',    'LeetCode Patterns',              'Solve any problem with 20 core patterns',        2, 5, 'code',         4,  true),
  (gen_random_uuid(), 'javascript',           'JavaScript',                     'From basics to engine internals',                1, 5, 'js',           5,  true),
  (gen_random_uuid(), 'typescript',           'TypeScript',                     'Type-safe JavaScript at any scale',              2, 4, 'type',         6,  true),
  (gen_random_uuid(), 'react',                'React',                          'Modern React: Hooks, patterns, performance',     2, 5, 'atom',         7,  true),
  (gen_random_uuid(), 'angular',              'Angular',                        'Enterprise Angular with RxJS & NgRx',            2, 5, 'angular',      8,  true),
  (gen_random_uuid(), 'spring-boot',          'Spring Boot',                    'REST to microservices with Spring ecosystem',    2, 5, 'leaf',         9,  true),
  (gen_random_uuid(), 'system-design',        'System Design',                  'Scale to millions: HLD for senior engineers',   3, 5, 'server',       10, true),
  (gen_random_uuid(), 'api-design',           'API Design',                     'REST, GraphQL, gRPC, versioning and security',  2, 4, 'zap',          11, true),
  (gen_random_uuid(), 'software-architecture','Software Architecture',          'SOLID, DDD, CQRS, microservices patterns',      3, 5, 'blueprint',    12, true),
  (gen_random_uuid(), 'html',                 'HTML',                           'Semantic HTML, accessibility, web standards',   1, 3, 'file-code',    13, true),
  (gen_random_uuid(), 'css',                  'CSS',                            'Flexbox, Grid, animations, responsive design',  1, 4, 'palette',      14, true),
  (gen_random_uuid(), 'sql',                  'SQL',                            'Queries to query optimization and indexing',    1, 4, 'database',     15, true),
  (gen_random_uuid(), 'postgresql-dba',       'PostgreSQL DBA',                 'Database administration, tuning, replication',  3, 5, 'hard-drive',   16, true),
  (gen_random_uuid(), 'mongodb',              'MongoDB',                        'NoSQL design, aggregation, and production ops', 2, 4, 'circle',       17, true),
  (gen_random_uuid(), 'design-system',        'Design System',                  'Tokens, components, accessibility, Storybook',  2, 4, 'layout',       18, true);
```

---

## Path 1 — Full Stack Developer (85 topics)

### Level 1 — Foundation (How the web works)
```
internet-how-it-works          How the Internet works (TCP/IP, DNS, HTTP)
what-is-http                   HTTP vs HTTPS, request/response, status codes
browsers-and-how-they-work     Rendering pipeline: HTML → DOM → CSSOM → Paint
dns-and-how-it-works           DNS resolution, A records, CNAME, TTL
what-is-a-domain-name          Domains, TLDs, subdomains
what-is-hosting                Types: shared, VPS, dedicated, cloud
terminal-basics                Basic Linux commands, navigation, file ops
version-control-basics         Git: init, add, commit, push, pull, branch, merge
```

### Level 2 — Frontend Foundation
```
html-basics                    Semantic tags, forms, accessibility basics
css-basics                     Box model, Flexbox, Grid, responsive design
javascript-basics              Variables, functions, DOM manipulation, events
npm-and-package-managers       npm, yarn, pnpm, package.json, node_modules
module-bundlers                Webpack, Vite — what they do and why
browser-devtools               Network tab, console, Sources, Performance
fetch-and-xhr                  Fetch API, XMLHttpRequest, CORS
json-and-rest                  JSON format, REST principles, HTTP verbs
```

### Level 3 — Framework & Backend Basics
```
react-or-angular-basics        Component-based UI, props, state, events
typescript-basics              Types, interfaces, type inference
nodejs-basics                  Event loop, modules, npm scripts, Express basics
databases-intro                Relational vs NoSQL, SQL basics, CRUD
rest-api-design                Routes, HTTP methods, status codes, auth
authentication-basics          Sessions vs JWT, cookies, OAuth2 overview
git-workflow                   Branching strategies, PRs, code review, rebasing
docker-basics                  Images, containers, Dockerfile, Docker Compose
```

### Level 4 — Full Stack Integration
```
react-or-angular-advanced      State management, routing, performance
nextjs-or-nuxt                 SSR, SSG, ISR, App Router, API routes
spring-boot-or-nodejs-backend  RESTful APIs, middleware, error handling
orm-and-jpa                    Hibernate, entity relationships, JPQL
database-design                Normalization, indexing, foreign keys
api-security                   JWT, rate limiting, input validation, OWASP top 10
ci-cd-basics                   GitHub Actions, build pipelines, automated tests
cloud-basics                   AWS / GCP / Oracle basics, VMs, object storage
```

### Level 5 — Senior Full Stack
```
microservices-architecture     Service decomposition, inter-service comms
message-queues                 Kafka, event-driven architecture
caching-strategies             Redis/Valkey, cache patterns, CDN
container-orchestration        Kubernetes basics, deployments, services
monitoring-and-logging         Prometheus, Grafana, ELK/OpenSearch
performance-optimization       Profiling, lazy loading, DB query tuning
web-security-advanced          CSP, CSRF, XSS, SQL injection prevention
system-design-basics           Load balancing, horizontal scaling, CAP
```

---

## Path 2 — Java Mastery (72 topics)

### Level 1 — Core Java Fundamentals
```
java-intro                     JDK vs JRE vs JVM, first program, compilation
data-types-and-variables       Primitives, autoboxing, literals, casting
operators-and-expressions      Arithmetic, logical, bitwise, ternary
control-flow                   if/else, switch, for, while, do-while, break/continue
arrays                         1D, 2D, jagged arrays, Arrays utility class
strings                        String pool, immutability, StringBuilder, StringBuffer
methods                        Parameters, return types, varargs, overloading
oop-intro                      Classes, objects, constructors, this keyword
```

### Level 2 — Object-Oriented Programming
```
inheritance                    extends, super, method overriding, IS-A vs HAS-A
polymorphism                   Compile-time vs runtime, dynamic dispatch
abstraction                    Abstract classes, abstract methods
interfaces                     Interface definition, implements, default methods (Java 8+)
encapsulation                  Access modifiers: public/private/protected/default
inner-classes                  Static nested, inner, anonymous, local classes
enums                          Enum declaration, methods, EnumSet, EnumMap
generics                       Type parameters, bounded wildcards, type erasure
```

### Level 3 — Java Collections & Functional
```
collections-overview           Collection hierarchy: List, Set, Queue, Map
arraylist-vs-linkedlist        Internal structure, performance, when to use
hashmap-internals              Bucket array, hashCode, equals, load factor, resize
treemap-and-treeset            Red-Black tree, natural ordering, Comparator
linkedhashmap                  Insertion-order map, LRU cache pattern
priorityqueue                  MinHeap internals, poll/offer, Comparator
iterator-pattern               Iterator, ListIterator, fail-fast vs fail-safe
lambda-expressions             Functional interfaces, arrow syntax, method refs
streams-api                    map, filter, reduce, collect, flatMap, sorted
optional                       Avoiding NullPointerException, orElse, map, flatMap
functional-interfaces          Predicate, Function, Consumer, Supplier, BiFunction
comparator-and-comparable      Natural order vs custom order, chaining comparators
```

### Level 4 — Java Advanced
```
exception-handling             Checked vs unchecked, try-with-resources, custom
concurrency-basics             Thread, Runnable, synchronized, volatile
executorservice                ThreadPoolExecutor, Callable, Future, CompletableFuture
concurrency-utilities          CountDownLatch, CyclicBarrier, Semaphore, Lock
concurrent-collections         ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue
java-memory-model              Heap, stack, PermGen/Metaspace, GC roots
garbage-collection             GC algorithms: G1, ZGC, Shenandoah, tuning flags
reflection                     Class.forName, getDeclaredMethods, Proxy pattern
annotations                    Custom annotations, retention, @interface, processors
io-and-nio                     FileInputStream, BufferedReader, NIO channels, Paths
serialization                  Serializable, Externalizable, serialVersionUID
```

### Level 5 — JVM Internals & Patterns
```
jvm-architecture               ClassLoader, Execution Engine, JIT, bytecode
virtual-threads                Project Loom, virtual vs platform threads, structured concurrency
records-and-sealed-classes     Java 14+: records, sealed, permits, pattern matching
design-patterns-in-java        Singleton, Factory, Builder, Strategy, Observer in Java
java-modules                   JPMS, module-info.java, requires, exports
performance-tuning             Profiling with JFR, heap dumps, thread dumps, JVisualVM
testing-best-practices         JUnit 5, Mockito, Testcontainers, AssertJ, TDD
build-tools                    Maven lifecycle, Gradle tasks, dependency management
```

---

## Path 3 — DSA (68 topics)

### Level 1 — Arrays & Strings
```
array-basics                   Declaration, indexing, traversal, memory layout
array-operations               Insert, delete, rotate, reverse, two-pointer technique
sliding-window                 Fixed window, variable window, max subarray
prefix-sum                     Prefix array, range sum queries, difference array
string-basics                  Character arrays, String methods, palindrome check
string-manipulation            Reverse words, anagram check, frequency count
sorting-intro                  Bubble, Selection, Insertion sort — visualization + code
searching-intro                Linear search, binary search, binary search variants
```

### Level 2 — Core Data Structures
```
linked-list-singly             Node structure, insert/delete/search, reverse
linked-list-doubly             Prev pointer, bidirectional ops, LRU Cache
linked-list-circular           Circular traversal, Josephus problem
stack                          Array-based, push/pop, balanced parentheses, monotonic stack
queue                          Array/LL-based, enqueue/dequeue, circular queue
deque                          Double-ended queue, sliding window maximum
recursion-basics               Call stack, base case, recurrence relation
recursion-advanced             Subsets, permutations, combinations, memoization intro
```

### Level 3 — Trees & Heaps
```
binary-tree                    Node structure, traversals (inorder/preorder/postorder/level)
binary-search-tree             Insert, delete, search, validation, kth smallest
avl-tree                       Balance factor, rotations (LL/RR/LR/RL), insertion
red-black-tree                 Properties, rotations, insertion, Java TreeMap internals
segment-tree                   Build, point update, range query, lazy propagation
fenwick-tree                   BIT, prefix sum queries, update, applications
trie                           Insert, search, prefix search, autocomplete, word break
heap-minheap                   Heapify, insert, extract-min, heap sort
heap-maxheap                   Max operations, top-K elements, K closest points
priority-queue                 Java PriorityQueue internals, custom comparator, patterns
```

### Level 4 — Graphs & Advanced
```
graph-representation           Adjacency matrix, adjacency list, edge list
bfs                            Level-order, shortest path (unweighted), visited set
dfs                            Recursive/iterative, connected components, cycle detection
topological-sort               Kahn's algorithm, DFS-based, course scheduling
shortest-path-dijkstra         Greedy BFS, priority queue, distance array, negative edges
shortest-path-bellman-ford     DP approach, negative cycles, SPFA
shortest-path-floyd-warshall   All-pairs, DP table, O(V³)
minimum-spanning-tree-kruskal  Union-Find (DSU), sort edges, Kruskal's proof
minimum-spanning-tree-prim     Greedy, priority queue, dense vs sparse graphs
union-find                     Path compression, union by rank, cycle detection
dynamic-programming-intro      Memoization vs tabulation, optimal substructure, overlapping
dp-1d-problems                 Fibonacci, climbing stairs, coin change, house robber
dp-2d-problems                 Knapsack 0/1, subset sum, partition equal subset
dp-strings                     LCS, LPS, Edit Distance, Wildcard Matching
dp-trees                       Diameter, max path sum, house robber on tree
```

### Level 5 — Expert Algorithms
```
backtracking                   N-Queens, Sudoku, word search, generate parentheses
greedy-algorithms              Activity selection, fractional knapsack, job scheduling
divide-and-conquer             Merge sort, quick sort analysis, Master theorem
binary-search-advanced         Search in rotated, find peak, binary search on answer
bit-manipulation               AND/OR/XOR tricks, count set bits, power of 2, subsets
hashing-advanced               Rolling hash, Rabin-Karp, consistent hashing
string-algorithms              KMP, Z-algorithm, Rabin-Karp, suffix array
two-pointers-patterns          3Sum, container with most water, trapping rain water
monotonic-stack-patterns       Next greater element, stock span, largest rectangle
interval-problems              Merge intervals, meeting rooms, insert interval
```

---

## Path 4 — LeetCode Patterns (52 topics)

### Level 2 — Beginner Patterns
```
two-pointers-pattern           Opposite ends, same direction, fast-slow pointers
sliding-window-pattern         Fixed size, dynamic size, at-most K distinct
prefix-sum-pattern             Subarray sum equals K, product except self
binary-search-pattern          Classic, on answer, in rotated array
hashmap-frequency-pattern      Two sum, group anagrams, isomorphic strings
stack-pattern                  Valid parentheses, daily temperatures, next greater
```

### Level 3 — Intermediate Patterns
```
tree-traversal-pattern         Level order BFS, inorder/preorder/postorder DFS
merge-intervals-pattern        Overlapping, insert interval, minimum meeting rooms
kadane-algorithm               Maximum subarray, best time to buy and sell stock
fast-slow-pointers             Cycle detection (Floyd), middle of linked list
top-k-elements                 K largest, K closest, frequency sort (heap)
trie-pattern                   Word search II, implement trie, replace words
backtracking-pattern           Subsets, permutations, combinations, N-Queens
```

### Level 4 — Advanced Patterns
```
dp-knapsack-pattern            0/1 knapsack, unbounded, partition equal subset
dp-fibonacci-pattern           House robber I/II, decode ways, jump game
dp-palindrome-pattern          Longest palindromic substring, palindrome partitioning
dp-grid-pattern                Unique paths, minimum path sum, dungeon game
graph-bfs-pattern              Word ladder, walls and gates, rotten oranges
graph-dfs-pattern              Number of islands, pacific atlantic, clone graph
union-find-pattern             Number of provinces, redundant connection, accounts merge
```

### Level 5 — Expert Patterns
```
segment-tree-pattern           Range sum query mutable, the skyline problem
monotonic-stack-advanced       Largest rectangle histogram, max of min subarray
hard-dp                        Burst balloons, regular expression matching, edit distance
hard-graph                     Alien dictionary, critical connections, swim in rising water
hard-string                    Minimum window substring, sliding window maximum
```

---

## Path 5 — JavaScript (65 topics)

### Level 1 — JS Fundamentals
```
js-intro                       What is JS, script tag, browser vs Node, console
variables                      var vs let vs const, scope, hoisting, TDZ
data-types                     Primitive vs reference, typeof, null vs undefined
type-coercion                  Implicit/explicit conversion, == vs ===, truthy/falsy
operators                      Arithmetic, comparison, logical, nullish coalescing, optional chaining
control-flow-js                if/else, switch, ternary, short-circuit evaluation
loops                          for, while, do-while, for...in, for...of, break/continue
functions-basics               Declaration vs expression, arrow functions, default params
```

### Level 2 — Intermediate JS
```
arrays-in-js                   map, filter, reduce, find, findIndex, flat, flatMap
objects-in-js                  Properties, methods, shorthand, computed keys, spread
destructuring                  Array and object destructuring, rename, default, rest
spread-and-rest                Spreading arrays/objects, rest parameters
template-literals              Tagged templates, multiline strings, expressions
closures                       Lexical scope, closure creation, common patterns
this-keyword                   Implicit/explicit/default binding, arrow vs regular
prototype-chain                __proto__, Object.create, prototype inheritance
classes-in-js                  class syntax, constructor, extends, static, private fields
error-handling-js              try/catch/finally, Error types, custom errors, error propagation
```

### Level 3 — Async JavaScript
```
callbacks                      Callback pattern, callback hell, error-first callbacks
promises                       Creating, chaining, Promise.all/race/allSettled/any
async-await                    Syntactic sugar, error handling, sequential vs parallel
event-loop                     Call stack, task queue, microtask queue, Web APIs
settimeout-vs-setinterval      Timers, event loop interaction, clearTimeout
fetch-api                      GET/POST, headers, Response object, async patterns
xhr-and-ajax                   XMLHttpRequest, readyState, legacy patterns
generators                     function*, yield, iterator protocol, infinite sequences
```

### Level 4 — Advanced JS
```
modules-es6                    import/export, default vs named, dynamic import()
webpack-and-vite               Module bundling, tree shaking, code splitting
dom-manipulation               querySelector, createElement, event listeners, bubbling
web-apis                       localStorage, sessionStorage, IndexedDB, WebWorkers
regular-expressions            Patterns, flags, exec, test, replace, groups
functional-programming-js      Pure functions, immutability, compose, curry, memoize
design-patterns-js             Module, Observer, Pub/Sub, Factory, Singleton, Decorator
symbol-and-iterators           Symbol.iterator, custom iterators, Symbol.toPrimitive
proxy-and-reflect              Proxy handlers, traps, meta-programming, Reflect API
weakref-and-finalizationregistry Memory management, WeakMap, WeakSet, GC-friendly caches
```

### Level 5 — JS Engine Internals
```
v8-engine                      AST, Ignition interpreter, TurboFan JIT, hidden classes
memory-management-js           Stack vs heap in JS, GC, memory leaks, performance.memory
event-loop-deep                Microtasks vs macrotasks, rendering pipeline, requestAnimationFrame
performance-optimization-js    Debounce, throttle, virtual DOM concept, reflow/repaint
security-js                    XSS, CSRF, content security policy, sanitization
testing-js                     Jest, Vitest, Testing Library, mocking, coverage
```

---

## Path 6 — TypeScript (48 topics)

### Level 2 — TS Basics
```
ts-intro                       Why TypeScript, tsc compiler, tsconfig.json basics
basic-types                    string, number, boolean, null, undefined, any, unknown
arrays-and-tuples              Typed arrays, readonly, tuple, rest elements
objects-and-interfaces         Interface, type alias, optional properties, readonly
functions-ts                   Parameter types, return types, optional, default, overloads
union-and-intersection         Union types |, intersection &, discriminated unions
type-narrowing                 typeof, instanceof, in, is type guard, assertion functions
```

### Level 3 — Intermediate TS
```
generics-ts                    Generic functions, classes, constraints, defaults
enums-ts                       Const enum, numeric, string, computed members
classes-ts                     Access modifiers, abstract, implements, constructor shorthand
utility-types                  Partial, Required, Readonly, Pick, Omit, Record, Exclude, Extract
mapped-types                   keyof, in, as clause, remapping keys
conditional-types              T extends U ? X : Y, infer keyword, distributive
template-literal-types         String template types, Uppercase, Lowercase, Capitalize
```

### Level 4 — Advanced TS
```
declaration-files              .d.ts, DefinitelyTyped, ambient declarations, module augmentation
module-resolution              paths, baseUrl, moduleResolution, path aliases
advanced-generics              Variadic tuple types, higher-kinded types simulation
decorators-ts                  Class, method, property decorators, metadata (Reflect.metadata)
type-challenges                Easy to hard type-level programming challenges
tsconfig-deep                  strict, noImplicitAny, strictNullChecks, all compiler options
performance-ts                 skipLibCheck, project references, composite builds
```

---

## Path 7 — React (55 topics)

### Level 2 — React Fundamentals
```
react-intro                    What is React, virtual DOM, reconciliation, JSX
jsx                            JSX syntax, expressions, fragments, key prop
components                     Function components, naming, composition
props                          Passing data, PropTypes, children, spread props
state-usestate                 useState hook, immutable updates, batching
event-handling-react           Synthetic events, onClick, onChange, onSubmit
conditional-rendering          &&, ternary, early return patterns
list-rendering                 map + key, index vs id, dynamic lists
forms-react                    Controlled components, FormData, form submission
```

### Level 3 — Intermediate React
```
useeffect                      Side effects, dependency array, cleanup, strict mode
useref                         DOM refs, mutable values, forwardRef
usecontext                     Context API, Provider, Consumer, useContext hook
usememo-usecallback            Memoization, when to use, dependency arrays
custom-hooks                   Extracting logic, useLocalStorage, useFetch, useDebounce
react-router-v6                Route, Link, useNavigate, useParams, nested routes, loaders
lifting-state-up               State colocation, sibling communication, prop drilling
component-composition          Higher-order components, render props, slots pattern
```

### Level 4 — Advanced React
```
state-management-redux         Redux Toolkit: createSlice, configureStore, useSelector, useDispatch
state-management-zustand       Simple alternative, persist, devtools
react-query-tanstack           Server state, useQuery, useMutation, cache, invalidation
lazy-loading-suspense          React.lazy, Suspense, error boundaries, code splitting
portals                        ReactDOM.createPortal, modals, tooltips use case
concurrent-features            useTransition, useDeferredValue, startTransition
performance-react              React.memo, profiler, why-did-you-render, virtualization (react-window)
testing-react                  React Testing Library, userEvent, jest, mock providers
```

### Level 5 — React Expert
```
react-compiler                 React Forget, auto-memoization, compiler output
server-components              RSC, client vs server, streaming, use server, use client
react-19-features              useOptimistic, use hook, form actions, new APIs
nextjs-integration             App Router, Server Actions, Suspense in Next.js
micro-frontends-react          Module federation, single-spa, composition patterns
accessibility-react            ARIA, keyboard navigation, focus management, screen readers
```

---

## Path 8 — Angular (58 topics)

### Level 2 — Angular Fundamentals
```
angular-intro                  Angular CLI, workspace, project structure, NgModules
components-angular             @Component, template, styles, selector, lifecycle
templates                      Interpolation {{}}, property binding [], event binding ()
directives-built-in            *ngIf, *ngFor, *ngSwitch, ngClass, ngStyle
pipes                          Built-in pipes: date, currency, uppercase, async pipe
services-and-di                @Injectable, providers, injector hierarchy, singleton
http-client                    HttpClientModule, get/post, HttpParams, HttpHeaders
forms-template-driven          ngModel, FormsModule, ngForm, form validation
forms-reactive                 FormControl, FormGroup, FormBuilder, Validators, async validators
```

### Level 3 — Intermediate Angular
```
routing-angular                RouterModule, Routes, RouterLink, ActivatedRoute, Guards
lazy-loading-angular           loadChildren, loadComponent, preloading strategies
lifecycle-hooks                ngOnInit, ngOnChanges, ngOnDestroy, ngAfterViewInit
viewchild-contentchild         @ViewChild, @ContentChild, ElementRef, @ViewChildren
change-detection               Default vs OnPush, ChangeDetectorRef, markForCheck, detach
rxjs-in-angular                Observables, Subjects, BehaviorSubject, combineLatest, switchMap
interceptors                   HttpInterceptor, JWT injection, error handling, retry
guards                         CanActivate, CanDeactivate, CanLoad, resolve, functional guards
signals                        Angular Signals API, computed(), effect(), signal() — Angular 17+
```

### Level 4 — Advanced Angular
```
state-management-ngrx          Store, Actions, Reducers, Selectors, Effects, Entity
state-management-signals       Lightweight state with signals, no NgRx approach
standalone-components          No NgModule, standalone: true, importProvidersFrom
angular-universal              Server-side rendering, TransferState, hydration
angular-pwa                    Service Worker, offline caching, App Shell, push notifications
angular-material                Material components, theming, CDK
custom-directives              HostListener, HostBinding, Renderer2, attribute directives
testing-angular                TestBed, ComponentFixture, HttpClientTestingModule, spectator
performance-angular            TrackBy, OnPush strategy, virtual scrolling, lazy images
```

### Level 5 — Angular Expert
```
monorepo-nx                    Nx workspace, shared libs, generators, affected commands
micro-frontends-angular        Angular Module Federation, Webpack 5, shell + remote
angular-cdktesting             CDK Harnesses, testing complex components
zonejs-deep                    Zone.js internals, zoneless Angular, async context tracking
angular-compiler               Template compilation, Ivy, compilation output, AOT vs JIT
rxjs-advanced                  Marble testing, custom operators, multicasting, schedulers
```

---

## Path 9 — Spring Boot (62 topics)

### Level 2 — Spring Core
```
spring-intro                   IoC, DI, ApplicationContext, Bean lifecycle
spring-beans                   @Bean, @Component, @Service, @Repository, @Controller
dependency-injection           Constructor vs field vs setter injection, @Autowired, @Qualifier
component-scanning             @ComponentScan, base packages, filters
bean-scope                     Singleton, Prototype, Request, Session scope
spring-configuration           @Configuration, @PropertySource, @Value, YAML vs properties
spring-profiles                @Profile, application-{profile}.yml, active profiles
spring-events                  ApplicationEvent, @EventListener, async events
```

### Level 3 — Spring Boot REST
```
spring-boot-intro              Auto-configuration, starters, spring-boot-starter-web
rest-controllers               @RestController, @RequestMapping, @GetMapping etc.
request-response               @RequestBody, @ResponseBody, @PathVariable, @RequestParam
response-entity                ResponseEntity<T>, HttpStatus, headers
exception-handling-spring      @ControllerAdvice, @ExceptionHandler, ProblemDetail (RFC 9457)
validation-spring              @Valid, @NotNull, @Size, ConstraintViolationException, custom validators
springdoc-openapi               @Tag, @Operation, @ApiResponse, Swagger UI
content-negotiation            Accept header, MessageConverter, JSON/XML
```

### Level 4 — Spring Data & Security
```
spring-data-jpa                JpaRepository, PagingAndSortingRepository, derived queries
jpa-entity-mapping             @Entity, @Table, @Column, @Id, @GeneratedValue
jpa-relationships              @OneToMany, @ManyToOne, @ManyToMany, fetch types, cascade
jpql-and-criteria              @Query JPQL, native query, Criteria API, Specification
flyway-migrations              Versioned migrations, repeatable, undo, placeholders
spring-security-basics         SecurityFilterChain, UserDetailsService, PasswordEncoder
jwt-authentication             JwtFilter, token issuance, claims, refresh tokens
oauth2-spring                  Authorization Server, Resource Server, client credentials
spring-cache                   @Cacheable, @CacheEvict, @CachePut, CacheManager config
```

### Level 5 — Microservices & Production
```
spring-cloud-gateway           Route predicates, filters, rate limiting, circuit breaker
spring-kafka                   @KafkaListener, KafkaTemplate, consumer groups, partitions
resilience4j-spring            @CircuitBreaker, @Retry, @Bulkhead, @RateLimiter
spring-actuator                /health, /metrics, /info, custom endpoints, Prometheus scrape
testcontainers-spring          Real DB in tests, @SpringBootTest, @Testcontainers
spring-batch                   Job, Step, ItemReader, ItemProcessor, ItemWriter, scheduling
spring-webflux                 Reactive programming, Mono, Flux, WebClient, R2DBC
virtual-threads-spring         Project Loom integration, tomcat/undertow config, Spring 6.1+
grpc-spring                    Spring gRPC, Protocol Buffers, service definition, streaming
```

---

## Path 10 — System Design (70 topics)

### Level 3 — Fundamentals
```
sd-requirements                Functional vs non-functional requirements, back-of-envelope estimation
sd-scalability                 Vertical vs horizontal scaling, when to scale, bottlenecks
sd-load-balancing              Round robin, least connections, IP hash, health checks, L4 vs L7
sd-caching-intro               Why cache, cache hit/miss, cache levels, cache stampede
sd-cdn                         CDN architecture, push vs pull, edge caching, Cloudflare
sd-databases-overview          SQL vs NoSQL decision criteria, ACID, BASE
sd-cap-theorem                 Consistency, Availability, Partition tolerance — real examples
sd-back-of-envelope            Storage, bandwidth, QPS estimation, latency numbers by heart
```

### Level 4 — Deep Dives
```
sd-sql-databases               Indexes (B-Tree, Hash), query planning, N+1 problem, connection pooling
sd-nosql-databases             Document (MongoDB), Key-Value (Valkey), Wide-Column (Cassandra), Graph (Neo4j)
sd-database-replication        Master-slave, master-master, async vs sync, read replicas
sd-database-sharding           Horizontal partitioning, shard key, consistent hashing, hot spots
sd-database-indexing           Composite index, covering index, partial index, index selectivity
sd-transactions                ACID deep dive, isolation levels, deadlocks, 2PC, saga pattern
sd-caching-patterns            Cache-aside, write-through, write-back, write-around, TTL strategy
sd-message-queues              Kafka deep dive, partitions, consumer groups, exactly-once, pub/sub vs queue
sd-api-gateway                 Rate limiting algorithms: token bucket, leaky bucket, fixed window
sd-consistent-hashing          Virtual nodes, ring concept, hotspot avoidance, DHT
sd-distributed-id              UUID v4, Snowflake ID, ULID, Twitter Snowflake, trade-offs
sd-search-engines              Inverted index, relevance scoring, tokenization, OpenSearch/Elasticsearch
```

### Level 5 — Case Studies (HLD)
```
design-url-shortener           Requirements, capacity, base62, Valkey cache, analytics
design-twitter                 Timeline generation, fan-out on write vs read, CDN media
design-youtube                 Video encoding, CDN, adaptive bitrate, metadata, search
design-uber                    Geospatial indexing, QuadTree, ride matching, surge pricing
design-whatsapp                End-to-end encryption, message delivery, group chat, presence
design-google-search           Crawling, indexing, ranking, PageRank, real-time serving
design-netflix                 Microservices, chaos engineering, CDN, codec, recommendation
design-rate-limiter            Token bucket, Redis/Valkey sliding window, distributed counter
design-notification-system     Fan-out, Kafka topics, retry queues, push/email/SMS
design-distributed-cache       Consistent hashing, eviction, replication, Valkey internals
design-payment-system          Idempotency, double-spend prevention, 2PC, distributed locks
design-google-drive            Chunked upload, deduplication, metadata, conflict resolution
```

---

## Path 11 — API Design (44 topics)

### Level 2 — REST Fundamentals
```
rest-principles                Uniform interface, stateless, cacheable, layered, Richardson model
http-methods                   GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS — correct usage
status-codes                   1xx, 2xx, 3xx, 4xx, 5xx — all important codes with examples
url-design                     Resource naming, plural nouns, hierarchies, query strings
request-response-format        JSON:API, HAL, problem+json (RFC 9457), content negotiation
versioning-strategies          URI versioning, header versioning, query param, semantic versioning
```

### Level 3 — Intermediate API Design
```
authentication-api             API keys, Basic auth, Bearer tokens, OAuth2 flows
authorization-api              RBAC, ABAC, scope-based, JWT claims, middleware
pagination-api                 Offset/limit, cursor-based, keyset, Link header (RFC 5988)
filtering-sorting              Query DSL, OpenAPI filter params, sort fields
api-rate-limiting              429 status, X-RateLimit headers, retry-after, token bucket
api-caching                    ETag, Last-Modified, Cache-Control, conditional requests
error-handling-api             RFC 9457 problem details, error codes, human-readable messages
```

### Level 4 — Advanced API Patterns
```
graphql-basics                 Schema, Query, Mutation, Subscription, Resolver, N+1 problem
graphql-advanced               DataLoader, persisted queries, fragments, directives, Federation
grpc-basics                    Protocol Buffers, service.proto, client/server streaming, gRPC-web
websockets-api                 Handshake, frames, ping/pong, scaling with Pub/Sub
webhooks                       Event delivery, retry, idempotency, signature verification
api-documentation              OpenAPI 3.1, Swagger UI, Redoc, AsyncAPI for events
api-testing                    Postman, REST Assured, contract testing (Pact), load testing
api-security-advanced          OWASP API Security Top 10, injection, BOLA, BFLA
```

---

## Path 12 — Software Architecture (50 topics)

### Level 3 — Design Principles
```
solid-principles               SRP, OCP, LSP, ISP, DIP — Java code examples + violations
dry-kiss-yagni                 Don't repeat, Keep simple, You ain't gonna need it
clean-code                     Naming, functions, comments, formatting, error handling
code-smells                    Long method, large class, feature envy, data clumps, shotgun surgery
refactoring                    Extract method, extract class, move method, rename, inline
tdd-basics                     Red-Green-Refactor, test pyramid, unit vs integration vs E2E
```

### Level 4 — Architectural Patterns
```
layered-architecture           Presentation, Business, Data layers, dependencies rule
clean-architecture             Entities, Use Cases, Interface Adapters, Frameworks ring
hexagonal-architecture         Ports and Adapters, primary/secondary ports, testability
cqrs                           Command vs Query separation, eventual consistency, read models
event-sourcing                 Event store, replaying events, snapshots, projections
domain-driven-design           Ubiquitous language, Bounded Context, Aggregate, Entity, Value Object
microservices-patterns         Saga, Strangler Fig, Anti-corruption Layer, API Gateway, BFF
```

### Level 5 — Enterprise Architecture
```
distributed-transactions       2PC, Saga (choreography vs orchestration), outbox pattern
eventual-consistency           BASE, conflict resolution, vector clocks, CRDTs
observability                  Distributed tracing (OpenTelemetry), metrics, logs, traces
service-mesh                   Istio, Envoy, Linkerd, sidecar pattern, mTLS
platform-engineering           Internal developer platforms, golden paths, paved roads
arc42-documentation            System context, building block view, runtime, deployment view
```

---

## Path 13 — HTML (38 topics)

### Level 1 — HTML Fundamentals
```
html-intro                     DOCTYPE, html/head/body, character encoding, viewport meta
text-elements                  h1-h6, p, span, strong, em, mark, abbr, blockquote, pre, code
list-elements                  ul, ol, li, dl, dt, dd — when to use each
links-and-images               a href, target, rel, img src, alt, srcset, lazy loading
tables                         table, thead, tbody, tfoot, tr, th, td, colspan, rowspan, caption
forms-html                     form, input types, label, textarea, select, button, fieldset
semantic-elements              header, footer, main, nav, article, section, aside, figure, time
```

### Level 2 — Intermediate HTML
```
accessibility-html             ARIA roles, aria-label, aria-describedby, aria-live, tabindex, focus
meta-tags-and-seo              title, description, Open Graph, Twitter Card, canonical, robots
html5-apis                     Canvas, SVG, audio, video, track, picture, source
form-validation                required, pattern, min/max, type=email/tel/url, novalidate
html-attributes                data-*, class vs id, contenteditable, draggable, hidden
template-slot                  HTML template element, slot, Web Components intro
```

### Level 3 — Advanced HTML
```
web-components                 Custom elements, Shadow DOM, HTML templates, lifecycle
performance-html               defer vs async scripts, preload, prefetch, dns-prefetch, modulepreload
pwa-manifest                   manifest.json, icons, display, orientation, standalone
internationalization           lang attribute, dir, charset, BOM, RTL layouts
```

---

## Path 14 — CSS (52 topics)

### Level 1 — CSS Fundamentals
```
css-intro                      Inline, internal, external, cascade, specificity, inheritance
selectors                      Type, class, ID, attribute, pseudo-class, pseudo-element, combinators
box-model                      content, padding, border, margin, box-sizing, outline
colors                         Color keywords, hex, rgb, hsl, oklch, currentColor, opacity
typography                     font-family, font-size, font-weight, line-height, letter-spacing
backgrounds                    background-color, image, position, repeat, size, attachment, shorthand
units                          px, em, rem, %, vw, vh, vmin, vmax, ch, ex, dvh
```

### Level 2 — Layout
```
display-and-positioning        block, inline, inline-block, position: static/relative/absolute/fixed/sticky
flexbox                        flex container/item, flex-direction, justify-content, align-items, flex-wrap, order
css-grid                       grid-template, grid-area, grid-column/row, auto-fill/fit, minmax, subgrid
float-and-clear                Legacy float layout, clearfix, when to use today
css-variables                  --custom-props, var(), fallbacks, JavaScript integration
responsive-design              Media queries, mobile-first, breakpoints, fluid typography
```

### Level 3 — Advanced CSS
```
css-animations                 @keyframes, animation shorthand, timing functions, fill-mode, play-state
css-transitions                transition property, duration, timing, delay, GPU compositing
transforms                     translate, rotate, scale, skew, matrix, 3D transforms, perspective
filters-and-effects            filter, backdrop-filter, blend modes, clip-path, mask
pseudo-classes-advanced        :is(), :where(), :has(), :not(), :nth-child complex
pseudo-elements-advanced       ::before, ::after, ::selection, ::placeholder, ::first-line
css-functions                  calc(), clamp(), min(), max(), env(), attr()
custom-properties-advanced     Inheritance, @property, registered properties, Houdini
```

### Level 4 — CSS Tooling & Architecture
```
css-architecture               BEM, SMACSS, OOCSS, utility-first (Tailwind), CSS Modules
preprocessors                  Sass/SCSS: variables, nesting, mixins, extends, functions
postcss                        Autoprefixer, cssnano, postcss-preset-env, plugins
tailwind-deep                  Configuration, @apply, JIT, plugins, design tokens
css-in-js                      styled-components, Emotion, vanilla-extract, CSS Modules
css-performance                Critical CSS, render-blocking, will-change, contain, content-visibility
printing-css                   @media print, page-break, @page, hiding elements
```

---

## Path 15 — SQL (45 topics)

### Level 1 — SQL Basics
```
sql-intro                      What is SQL, RDBMS, tables, rows, columns, primary key
ddl-basics                     CREATE TABLE, DROP, ALTER, column constraints, data types
dml-basics                     INSERT, UPDATE, DELETE, SELECT, WHERE clause
select-deep                    DISTINCT, ORDER BY, LIMIT, OFFSET, column aliases
filtering                      WHERE conditions: =, !=, <, >, BETWEEN, IN, LIKE, IS NULL
aggregate-functions            COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING
```

### Level 2 — Intermediate SQL
```
joins                          INNER JOIN, LEFT/RIGHT/FULL OUTER JOIN, CROSS JOIN, self-join
subqueries                     Correlated, non-correlated, EXISTS, IN, scalar subqueries
set-operations                 UNION, UNION ALL, INTERSECT, EXCEPT
string-functions               CONCAT, SUBSTRING, UPPER, LOWER, TRIM, REPLACE, REGEXP_REPLACE
date-functions                 DATE_PART, EXTRACT, DATE_TRUNC, AGE, NOW, INTERVAL
null-handling                  IS NULL, IS NOT NULL, COALESCE, NULLIF, NVL
```

### Level 3 — Advanced SQL
```
window-functions               ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, FIRST_VALUE, PARTITION BY
cte                            WITH clause, recursive CTEs, readability vs performance
indexes                        B-Tree, Hash, partial, composite, covering, EXPLAIN ANALYZE
transactions                   BEGIN, COMMIT, ROLLBACK, SAVEPOINT, isolation levels (PostgreSQL)
views                          CREATE VIEW, updatable views, materialized views, refresh
stored-procedures              PL/pgSQL basics, parameters, loops, conditionals
triggers                       BEFORE/AFTER INSERT/UPDATE/DELETE, trigger functions
```

### Level 4 — SQL Optimization
```
query-optimization             Execution plan, seq scan vs index scan, statistics, VACUUM
normalization                  1NF, 2NF, 3NF, BCNF, denormalization trade-offs
schema-design                  ER diagrams, relationships, surrogate vs natural keys
partitioning-sql               Range, list, hash partitioning, partition pruning
json-in-sql                    JSONB in PostgreSQL, json_agg, json_build_object, operators
full-text-search-sql           to_tsvector, to_tsquery, GIN index, ranking
```

---

## Path 16 — PostgreSQL DBA (48 topics)

### Level 3 — PostgreSQL Internals
```
pg-architecture                Processes: postmaster, background workers, shared buffers
pg-storage                     MVCC, heap files, TOAST, page structure, free space map
pg-write-ahead-log             WAL segments, checkpoints, recovery, pg_wal directory
pg-configuration               postgresql.conf: shared_buffers, work_mem, max_connections, effective_cache_size
pg-vacuum                      Bloat, autovacuum, manual VACUUM, VACUUM FULL, visibility map
pg-statistics                  pg_stats, ANALYZE, statistics target, planner decisions
```

### Level 4 — DBA Operations
```
pg-backup                      pg_dump, pg_restore, pg_basebackup, continuous archiving, PITR
pg-replication                 Streaming replication, hot standby, replication slots, pg_hba.conf
pg-high-availability           Patroni, repmgr, pgBouncer connection pooling, failover
pg-extensions                  TimescaleDB, PostGIS, pg_stat_statements, pgcrypto, uuid-ossp
pg-roles-security              CREATE ROLE, GRANT, REVOKE, row-level security, pg_hba.conf
pg-monitoring                  pg_stat_activity, pg_locks, pg_stat_bgwriter, pgBadger, pganalyze
pg-logical-replication         Logical decoding, publications, subscriptions, CDC patterns
```

### Level 5 — Expert PostgreSQL
```
pg-performance-tuning          EXPLAIN ANALYZE, buffers, filter vs index cond, bitmap scans
pg-advanced-indexing           GIN, GiST, BRIN, expression indexes, partial indexes, index-only scans
pg-partitioning                Declarative partitioning, partition-wise join/aggregate
pg-jsonb-advanced              Operators, indexing, jsonb_path_query, JSON schema validation
pg-parallel-query              Parallel seq scan, parallel hash join, max_parallel_workers config
```

---

## Path 17 — MongoDB (40 topics)

### Level 2 — MongoDB Fundamentals
```
mongodb-intro                  Document model, collections, BSON, comparison with SQL
crud-operations                insertOne/Many, findOne/find, updateOne/Many, deleteOne/Many
query-operators                $eq, $ne, $gt, $lt, $in, $and, $or, $not, $exists, $type
update-operators               $set, $unset, $push, $pull, $addToSet, $inc, $rename, upsert
projections                    Include/exclude fields, $elemMatch, $slice
```

### Level 3 — Intermediate MongoDB
```
aggregation-pipeline           $match, $group, $project, $sort, $limit, $skip, $unwind, $lookup
aggregation-advanced           $facet, $bucket, $graphLookup, $merge, $out, window functions
indexes-mongodb                Single field, compound, multikey, text, geospatial, hashed, TTL index
schema-design                  Embedding vs referencing, 1-to-1/1-to-N/N-to-N patterns, schema versioning
transactions-mongodb           Multi-document ACID, session, commitTransaction, write concerns
```

### Level 4 — MongoDB Production
```
replication-mongodb            Replica sets, primary/secondary/arbiter, oplog, elections, read preferences
sharding-mongodb               Shard key selection, hash vs range, mongos, chunks, balancer
mongodb-atlas                  Atlas free tier, connection string, Atlas Search, Data API
mongodb-security               Authentication mechanisms, role-based access, network isolation, encryption
change-streams                 Watch collections, resume token, CDC with MongoDB
mongodb-performance            explain(), executionStats, indexStats, profiler, slow queries
```

---

## Path 18 — Design System (35 topics)

### Level 2 — Foundation
```
design-tokens                  Color, spacing, typography, shadow, border-radius as tokens
typography-system              Type scale, font stack, line height, responsive type
color-system                   Primary, semantic, neutral palettes, dark mode, accessibility contrast
spacing-system                 4px/8px grid, margin vs padding philosophy, layout spacing
iconography                    Icon sets, SVG sprites, accessibility, size tokens
```

### Level 3 — Component Library
```
button-component               Variants, sizes, states, loading, disabled, icon button
input-and-form-components      Text input, textarea, select, checkbox, radio, toggle, date picker
navigation-components          Navbar, sidebar, breadcrumb, tabs, pagination
feedback-components            Toast, alert, badge, progress, skeleton, spinner
modal-and-overlay              Dialog, drawer, popover, tooltip, dropdown
data-display                   Table, list, card, chip, avatar, stat display
```

### Level 4 — System Architecture
```
storybook                      Setup, stories, args, controls, actions, docs, accessibility addon
component-api-design           Props interface, compound components, render props, slots
theming-architecture           CSS custom properties, theme provider, multi-brand support
accessibility-system           WCAG 2.1 AA checklist, focus management, keyboard nav, color contrast
design-token-pipeline          Style Dictionary, Figma Tokens, theo, token transformation
versioning-and-publishing      npm publish, semantic versioning, CHANGELOG, peer dependencies
```

---

## Master Flyway Migration — Seeding All Topic Slugs

### V11__seed_all_topics_phase1.sql (excerpt showing pattern)

```sql
-- ============================================================
-- Seed topics for JAVA MASTERY path
-- ============================================================
DO $$
DECLARE
  path_id UUID;
BEGIN
  SELECT id INTO path_id FROM learning_paths WHERE slug = 'java-mastery';

  INSERT INTO topics (id, path_id, slug, title, level, estimated_mins, order_index, is_published, has_visualizer, has_code_lab)
  VALUES
    -- Level 1
    (gen_random_uuid(), path_id, 'java-intro',                'JDK vs JRE vs JVM',                1, 20, 1,  false, false, true),
    (gen_random_uuid(), path_id, 'data-types-and-variables',  'Data Types and Variables',          1, 25, 2,  false, false, true),
    (gen_random_uuid(), path_id, 'operators-and-expressions', 'Operators and Expressions',         1, 20, 3,  false, false, true),
    (gen_random_uuid(), path_id, 'control-flow',              'Control Flow',                      1, 30, 4,  false, false, true),
    (gen_random_uuid(), path_id, 'arrays',                    'Arrays in Java',                    1, 30, 5,  false, true,  true),
    (gen_random_uuid(), path_id, 'strings',                   'Strings — Immutability & Pool',     1, 35, 6,  false, false, true),
    (gen_random_uuid(), path_id, 'methods',                   'Methods and Overloading',           1, 25, 7,  false, false, true),
    (gen_random_uuid(), path_id, 'oop-intro',                 'OOP — Classes and Objects',         1, 40, 8,  false, false, true),
    -- Level 2
    (gen_random_uuid(), path_id, 'inheritance',               'Inheritance',                       2, 40, 9,  false, false, true),
    (gen_random_uuid(), path_id, 'polymorphism',              'Polymorphism',                      2, 35, 10, false, false, true),
    (gen_random_uuid(), path_id, 'abstraction',               'Abstraction',                       2, 30, 11, false, false, true),
    (gen_random_uuid(), path_id, 'interfaces',                'Interfaces (Java 8+)',              2, 40, 12, false, false, true),
    (gen_random_uuid(), path_id, 'encapsulation',             'Encapsulation',                     2, 25, 13, false, false, true),
    (gen_random_uuid(), path_id, 'generics',                  'Generics and Type Erasure',         2, 45, 14, false, false, true),
    -- Level 3
    (gen_random_uuid(), path_id, 'hashmap-internals',         'HashMap — Internal Working',        3, 50, 15, false, true,  true),
    (gen_random_uuid(), path_id, 'lambda-expressions',        'Lambda Expressions',                3, 40, 16, false, false, true),
    (gen_random_uuid(), path_id, 'streams-api',               'Streams API',                       3, 55, 17, false, false, true),
    (gen_random_uuid(), path_id, 'concurrency-basics',        'Concurrency Basics',                4, 60, 18, false, true,  true),
    (gen_random_uuid(), path_id, 'executorservice',           'ExecutorService & CompletableFuture',4,55, 19, false, false, true),
    (gen_random_uuid(), path_id, 'garbage-collection',        'Garbage Collection Deep Dive',      5, 60, 20, false, true,  false),
    (gen_random_uuid(), path_id, 'jvm-architecture',          'JVM Architecture Internals',        5, 65, 21, false, true,  false),
    (gen_random_uuid(), path_id, 'virtual-threads',           'Virtual Threads (Project Loom)',    5, 50, 22, false, false, true);
END $$;
```

> Repeat this pattern for all 18 paths. Full SQL for all paths is generated by Prompt 12 below.

---

## Updated Antigravity Agent Prompts

---

### PROMPT 11 — Seed All 18 Learning Paths Topics (Flyway)

```
You are an expert Spring Boot / PostgreSQL developer. Generate Flyway migration files to seed ALL topic data for DevMastery's 18 learning paths.

CONTEXT:
- Flyway Community Edition, PostgreSQL 16
- learning_paths table already seeded in V10
- This migration is V11__seed_topics_all_paths.sql
- topics table: (id UUID, path_id UUID, slug VARCHAR UNIQUE, title VARCHAR, level INT 1-5, estimated_mins INT, order_index INT, is_published BOOLEAN DEFAULT false, has_visualizer BOOLEAN, has_code_lab BOOLEAN)

GENERATE COMPLETE INSERT statements for all topics for these paths:

PATH: full-stack (85 topics across levels 1-5)
  Level 1: internet-how-it-works, what-is-http, browsers-and-how-they-work, dns-and-how-it-works, what-is-a-domain-name, what-is-hosting, terminal-basics, version-control-basics
  Level 2: html-basics, css-basics, javascript-basics, npm-and-package-managers, module-bundlers, browser-devtools, fetch-and-xhr, json-and-rest
  Level 3: react-or-angular-basics, typescript-basics, nodejs-basics, databases-intro, rest-api-design, authentication-basics, git-workflow, docker-basics
  Level 4: react-or-angular-advanced, nextjs-or-nuxt, spring-boot-or-nodejs-backend, orm-and-jpa, database-design, api-security, ci-cd-basics, cloud-basics
  Level 5: microservices-architecture, message-queues, caching-strategies, container-orchestration, monitoring-and-logging, performance-optimization, web-security-advanced, system-design-basics

PATH: dsa (68 topics across levels 1-5)
  has_visualizer = TRUE for: arrays, linked-list-singly, linked-list-doubly, stack, queue, binary-tree, binary-search-tree, avl-tree, segment-tree, heap-minheap, heap-maxheap, graph-representation, bfs, dfs, sorting algorithms
  Level 1: array-basics, array-operations, sliding-window, prefix-sum, string-basics, string-manipulation, sorting-intro, searching-intro
  Level 2: linked-list-singly, linked-list-doubly, linked-list-circular, stack, queue, deque, recursion-basics, recursion-advanced
  Level 3: binary-tree, binary-search-tree, avl-tree, red-black-tree, segment-tree, fenwick-tree, trie, heap-minheap, heap-maxheap, priority-queue
  Level 4: graph-representation, bfs, dfs, topological-sort, shortest-path-dijkstra, shortest-path-bellman-ford, shortest-path-floyd-warshall, minimum-spanning-tree-kruskal, minimum-spanning-tree-prim, union-find, dynamic-programming-intro, dp-1d-problems, dp-2d-problems, dp-strings, dp-trees
  Level 5: backtracking, greedy-algorithms, divide-and-conquer, binary-search-advanced, bit-manipulation, hashing-advanced, string-algorithms, two-pointers-patterns, monotonic-stack-patterns, interval-problems

PATH: leetcode-patterns (52 topics, levels 2-5)
  Level 2: two-pointers-pattern, sliding-window-pattern, prefix-sum-pattern, binary-search-pattern, hashmap-frequency-pattern, stack-pattern
  Level 3: tree-traversal-pattern, merge-intervals-pattern, kadane-algorithm, fast-slow-pointers, top-k-elements, trie-pattern, backtracking-pattern
  Level 4: dp-knapsack-pattern, dp-fibonacci-pattern, dp-palindrome-pattern, dp-grid-pattern, graph-bfs-pattern, graph-dfs-pattern, union-find-pattern
  Level 5: segment-tree-pattern, monotonic-stack-advanced, hard-dp, hard-graph, hard-string

PATH: javascript (65 topics, levels 1-5)
  [All topics from Path 5 list above — js-intro through testing-js]

PATH: typescript (48 topics, levels 2-4)
  [All topics from Path 6 list above]

[Repeat for all 18 paths]

REQUIREMENTS:
- Use DO $$ DECLARE path_id UUID; BEGIN ... END $$; blocks for each path
- Set estimated_mins: level 1 = 20-30, level 2 = 30-45, level 3 = 40-60, level 4 = 50-70, level 5 = 60-90
- has_visualizer = TRUE for all DSA algorithm topics (sorting, trees, graphs, heaps)
- has_code_lab = TRUE for all programming topics
- is_published = FALSE (content will be added separately)
- order_index increments sequentially per path
- Use gen_random_uuid() for all IDs
- Include SQL comments separating each path section
```

---

### PROMPT 12 — Content Service: Multi-Path API Support

```
You are an expert Spring Boot 3.2 developer. Update content-service to support all 18 learning paths.

CURRENT STATE: content-service has PathController, TopicController, LessonController for the original 3 paths.

NEW REQUIREMENTS:

1. Update TopicController — enhanced filtering:
   GET /v1/topics?pathSlug=dsa&level=3&hasVisualizer=true&tags=graph&page=0&size=20

   New query: TopicRepository.findByFilters(String pathSlug, Integer level, Boolean hasVisualizer, Boolean hasCodeLab, List<String> tags, Pageable pageable)
   Use @Query with dynamic JPQL (Specification API — Spring Data JPA):
   
   public class TopicSpecification {
     public static Specification<Topic> byPathSlug(String slug) { ... }
     public static Specification<Topic> byLevel(Integer level) { ... }
     public static Specification<Topic> hasVisualizer(Boolean hasVis) { ... }
     public static Specification<Topic> hasTags(List<String> tags) { ... }
   }

2. New endpoint: GET /v1/paths/{slug}/roadmap
   Returns the full path structure organized by level:
   {
     "path": { "slug": "dsa", "title": "...", "totalTopics": 68 },
     "levels": [
       {
         "level": 1,
         "label": "Foundation",
         "topicCount": 8,
         "completedCount": 3,   ← requires userId from JWT, 0 if anonymous
         "topics": [ { "slug": "...", "title": "...", "estimatedMins": 25, "completed": true } ]
       }
     ]
   }
   
   Cache: "devmastery:roadmap:{pathSlug}:{userId}" TTL 30min
   Valkey key is userId-aware — so personal progress is included

3. New endpoint: GET /v1/topics/search?q=hashmap&pathSlug=java-mastery
   Delegates to OpenSearch via search-service (internal WebClient call)
   Falls back to LIKE query on topic title if OpenSearch unavailable (Resilience4j fallback)

4. OpenSearch indexer — TopicIndexService.java:
   - On @EventListener(TopicPublishedEvent.class): index topic to OpenSearch
   - On topic update: partial update via PUT /{index}/_update/{id}
   - Index: devmastery_content
   - Document: { id, type:"topic", title, description, content (first 500 chars of theory lesson), tags, path_slug, level }
   
   OpenSearch client: org.opensearch.client:opensearch-java (Apache 2.0 — NOT elasticsearch-java)
   Config:
   opensearch:
     host: ${OPENSEARCH_HOST:localhost}
     port: ${OPENSEARCH_PORT:9200}
     scheme: http

5. Roadmap progress aggregation — calls progress-service internally:
   GET http://progress-service:8083/v1/internal/progress/{userId}/path/{pathSlug}
   Returns: Map<String, Boolean> { "topic-slug": true/false }
   Cache: Valkey "devmastery:progress:{userId}:{pathSlug}" TTL 15min

CONSTRAINTS:
- Use Feign client for progress-service calls (spring-cloud-openfeign — Apache 2.0)
- All inter-service calls have timeouts: connectTimeout=2s, readTimeout=5s
- CircuitBreaker on progress-service call — gracefully return empty progress on open circuit
```

---

### PROMPT 13 — DSA Visualizer: Complete All Algorithms

```
You are an expert Next.js / D3.js / TypeScript developer. Extend the DSA Visualizer to cover ALL algorithm categories in the DSA path (68 topics).

EXISTING: BSTVisualizer, SortingVisualizer, GraphVisualizer

ADD THESE VISUALIZERS:

1. /lib/visualizer/algorithms/linkedList.ts
   generateSinglyLinkedListSteps(operations: Operation[]): VisualizerStep[]
   Operations: INSERT_HEAD, INSERT_TAIL, INSERT_AT, DELETE_HEAD, DELETE_TAIL, DELETE_VAL, REVERSE, SEARCH
   Each step: { nodes: LinkedListNode[], pointers: { current, prev, next }, highlightedLines, explanation }
   
   LinkedListNode: { id, value, next: id | null, state: NodeState }
   States: 'default' | 'current' | 'comparing' | 'inserted' | 'deleted' | 'found'

2. /lib/visualizer/algorithms/stack.ts
   generateStackSteps(operations: StackOp[]): VisualizerStep[]
   Show: array of boxes stacked vertically, PUSH animates from top, POP fades from top
   Include: stack pointer, underflow/overflow detection

3. /lib/visualizer/algorithms/heap.ts
   generateHeapSteps(values: number[], type: 'min' | 'max'): VisualizerStep[]
   Show: both tree visualization (D3 tree layout) AND array representation below it
   Operations: INSERT (heapify-up), EXTRACT (heapify-down), BUILD_HEAP
   Highlight: parent-child comparisons, swaps in both tree and array

4. /lib/visualizer/algorithms/trie.ts
   generateTrieSteps(words: string[], operation: 'insert' | 'search' | 'startsWith'): VisualizerStep[]
   Show: tree of character nodes, path to current operation highlighted
   End of word nodes: different color

5. /lib/visualizer/algorithms/dp.ts
   generateDPTableSteps(problem: 'fibonacci' | 'knapsack' | 'lcs', input: DPInput): VisualizerStep[]
   Show: 2D table (JSONB grid), cell-by-cell fill animation
   Each step highlights: current cell, cells it depends on (arrows)
   Formula shown: text panel "dp[i][j] = dp[i-1][j] + dp[i][j-1]"

6. /lib/visualizer/algorithms/graph.ts — extend existing
   Add Dijkstra: show distance array + priority queue state alongside graph
   Add Prim's MST: highlight growing MST edges in green
   Add Topological Sort: show in-degree array, queue, output order

7. /components/visualizer/VisualizerRegistry.ts
   Map<slug, VisualizerComponent> — all visualizers registered here
   Used by TopicPage to auto-render the right visualizer for a topic

8. /components/visualizer/CustomInputPanel.tsx
   Reusable input UI for all visualizers:
   - Array input: comma-separated numbers + "Apply" button
   - Graph input: adjacency list editor (add/remove nodes+edges)
   - String input: text field for Trie
   - Number input: single value for heap operations

ANDROID (Compose Canvas — add alongside existing):
9. LinkedListCanvas.kt — horizontal chain of rounded rectangles with arrows
10. HeapCanvas.kt — tree layout + array row below canvas
11. DPTableCanvas.kt — grid of cells with colored fill animation

All visualizers must:
- Work with useVisualizerEngine hook (existing)
- Export typed VisualizerStep arrays
- Include code panel mapping (line highlights per step)
- Be registered in VisualizerRegistry
```

---

### PROMPT 14 — LeetCode Patterns Module (Full Stack)

```
You are a full-stack developer. Build the LeetCode Patterns module for DevMastery.

CONTEXT: This is Path 4 (leetcode-patterns) — teaches the 20 core patterns to solve any LeetCode problem.

BACKEND (quiz-service extension):

1. New entity: ProblemPattern
   Fields: id, slug, name, description, keyIndicators (TEXT[]), relatedProblems (UUID[])
   Example: { slug: "sliding-window", name: "Sliding Window", keyIndicators: ["subarray", "substring", "window", "contiguous"], relatedProblems: [...] }

2. New endpoint: GET /v1/patterns
   Returns all patterns with problem count and user's solve rate

3. GET /v1/patterns/{slug}/problems
   Returns problems tagged with this pattern, ordered by difficulty

4. Extend coding_problems table (V12 migration):
   ALTER TABLE coding_problems ADD COLUMN patterns TEXT[];
   ALTER TABLE coding_problems ADD COLUMN hints TEXT[];
   ALTER TABLE coding_problems ADD COLUMN approach_template TEXT;
   
   approach_template example for sliding-window:
   "1. Use two pointers (left, right)\n2. Expand right, shrink left when condition violated\n3. Track window state with a HashMap/variable\n4. Update answer at each valid window"

FRONTEND:

5. /app/patterns/page.tsx — Pattern Grid
   Cards for 20 patterns, each showing: pattern name, difficulty, problem count, user's completion %
   Click → /app/patterns/[slug]

6. /app/patterns/[slug]/page.tsx — Pattern Deep Dive
   Sections (uses the 6-layer model):
   
   WHY section: "When do you use this pattern? What clues in the problem tell you?"
   APPROACH section: Step-by-step template with visual diagram (Mermaid)
   VISUALIZER section: Custom PatternVisualizer showing pointer movement on array
   PROBLEMS section: List of 5-15 problems using this pattern (easy → hard)
   TRICKS section: Edge cases, common mistakes, time/space analysis
   INTERVIEW section: How to verbalize your approach to interviewer

7. PatternVisualizer.tsx
   Shows array with two pointer visualization:
   - Sliding window: left/right pointers, window highlighted
   - Two pointers: opposite-end pointers moving toward each other
   - Fast/slow: two pointers at different speeds (for cycle detection)
   Uses D3.js (existing) — add pattern-specific step generators

8. ProblemCard.tsx
   Displays: title, difficulty badge, company tags, completion status (✓/○)
   Click → opens CodeLabModal (Monaco editor + Judge0 CE execution in modal)
   Modal has: Problem description, Hints (reveal one at a time), Code editor, Test results

9. Progress tracking: when user solves a problem tagged with a pattern, pattern completion % increases
   Visual: circular progress around pattern card

ANDROID:
10. PatternsScreen.kt — LazyVerticalGrid of pattern cards
11. PatternDetailScreen.kt — same 6-layer structure, Canvas-based visualizer
12. Problem solving inline (WebView + Monaco for code, API for execution)
```

---

### PROMPT 15 — Progress Service: All 18 Paths Tracking

```
You are an expert Spring Boot 3.2 developer. Build the complete progress-service for DevMastery.

ENTITIES:
- UserProgress (user_id, topic_id, status, completion_pct, xp_earned)  ← already exists
- UserStreak (user_id, current_streak, longest_streak, last_activity, freeze_count) ← already exists

ADD:

1. PathProgressSummary — computed view (not a table):
   { pathSlug, totalTopics, completedTopics, inProgressTopics, completionPct, totalXp, estimatedMinsRemaining }
   Computed from user_progress + topics JOIN
   Cached: Valkey "devmastery:path-progress:{userId}:{pathSlug}", TTL 15min

2. ProgressController
   GET  /v1/progress/paths                    → all 18 paths summary for current user
   GET  /v1/progress/paths/{slug}             → single path detailed progress
   GET  /v1/progress/topics/{slug}            → topic progress status
   POST /v1/progress/topics/{slug}/start      → mark as IN_PROGRESS, set started_at
   POST /v1/progress/topics/{slug}/complete   → mark COMPLETED, award XP, update streak
   GET  /v1/progress/streak                   → current streak info
   GET  /v1/progress/summary                  → overall stats (total XP, paths started, badges)

3. Internal endpoints (called by content-service via Feign):
   GET  /v1/internal/progress/{userId}/path/{pathSlug}  → Map<topicSlug, Boolean>

4. XP System:
   Level 1 topic complete: 10 XP
   Level 2 topic complete: 20 XP
   Level 3 topic complete: 35 XP
   Level 4 topic complete: 50 XP
   Level 5 topic complete: 75 XP
   Quiz perfect score bonus: +50% XP
   Streak bonus: day 7 = +100 XP, day 30 = +500 XP

5. Streak Service:
   - On any topic/quiz/problem completion: call updateStreak(userId)
   - Compare last_activity DATE with current DATE
   - Same day: no change
   - Yesterday: increment current_streak
   - 2+ days ago: reset to 1 (unless freeze used)
   - Freeze: if freeze_count > 0 and gap = 2 days: use freeze, decrement freeze_count
   - Publish StreakUpdatedEvent to Kafka → notification-service sends push notification

6. Badge Awards:
   Track in user_badges table (V12 migration):
   CREATE TABLE user_badges (id UUID, user_id UUID FK, badge_slug VARCHAR, awarded_at TIMESTAMPTZ)
   
   Badge slugs and triggers:
   'first-topic'     → first topic completed
   'dsa-starter'     → first DSA topic completed
   'week-streak'     → 7-day streak reached
   'java-level-3'    → 5 Level-3 Java topics completed
   'speed-coder'     → solve a problem in < 5 minutes
   'path-complete'   → entire path 100% completed
   
   Publish BadgeAwardedEvent → notification-service

7. application.yml additions:
   xp:
     level-multipliers:
       1: 10
       2: 20
       3: 35
       4: 50
       5: 75
   streak:
     freeze-count-default: 1
     monthly-freeze-refill: true
```

---

### PROMPT 16 — Roadmap Visualization Component (Web)

```
You are an expert Next.js 14 / TypeScript / D3.js developer. Build the interactive Roadmap Visualization for DevMastery — a visual roadmap like roadmap.sh but integrated with user progress.

FILE: /components/roadmap/RoadmapCanvas.tsx

REQUIREMENTS:

1. SVG-based roadmap visualization (D3.js + React)
   - Nodes: topic boxes with rounded corners, color-coded by status
     - Not Started: bg-[#21262D], border-[#30363D]
     - In Progress: bg-[#1a2a1a], border-[#6DB33F] 
     - Completed: bg-[#6DB33F], text-black
     - Locked: bg-[#0D1117], opacity-50
   - Edges: directional arrows showing prerequisite flow (SVG path with arrowhead marker)
   - Levels displayed as horizontal swimlanes with level label on left

2. Data structure: RoadmapNode[]
   interface RoadmapNode {
     slug: string;
     title: string;
     level: number;
     position: { x: number; y: number };  // calculated, not stored
     prerequisites: string[];  // slugs
     status: 'not_started' | 'in_progress' | 'completed' | 'locked';
     hasVisualizer: boolean;
     estimatedMins: number;
   }

3. Interactions:
   - Click node → navigates to /learn/{pathSlug}/{topicSlug}
   - Hover node → tooltip: title, time, completion %, prerequisite count
   - Completed node → green checkmark overlay
   - Locked node → padlock icon, shows "Complete X first" on hover
   - Mobile pinch-to-zoom + pan (d3.zoom)

4. Layout algorithm:
   - Group nodes by level (1-5)
   - Within each level: evenly spaced horizontally
   - Level rows: 150px vertical spacing
   - Canvas auto-sizes to content

5. /app/paths/[slug]/roadmap/page.tsx
   - Fetches GET /v1/paths/{slug}/roadmap (from content-service Prompt 12)
   - Renders RoadmapCanvas with progress data
   - Toggle: "List View" | "Map View" (default: map)
   - "My Progress" panel on right: path completion %, XP earned, next recommended topic

6. /components/roadmap/RoadmapListView.tsx
   Accordion by level:
   Level 1 ▼ Foundation (8 topics, 3 completed)
     [topic cards with status, estimated time, visualizer/code badges]
   Level 2 ▼ ...

7. Export: "Download Roadmap" button → SVG download (entire canvas as SVG file)

ANDROID EQUIVALENT:
8. RoadmapScreen.kt — Compose Canvas rendering same layout
   LazyColumn for list view (default on mobile — map view too complex for small screen)
   Each topic: Card with status color, title, level badge, time estimate
```

---

### PROMPT 17 — Admin CMS: Content Authoring for All 18 Paths

```
You are an expert Next.js 14 full-stack developer. Build the Admin Content Management System for DevMastery. This allows authors to write the 6-layer content for all ~989 topics without touching the database directly.

PAGES:

1. /admin page.tsx — Dashboard
   Stats: Total topics, Published, Draft, Topics needing content (content_mdx IS NULL)
   Per-path completion table: Path name | Total | Published | % done
   Quick actions: "Continue writing last topic", "Topics with no content"

2. /admin/paths/[pathSlug]/topics — Topic List for a Path
   Table: order_index, title, level badge, has_visualizer icon, has_code_lab icon, published toggle, word count, last updated
   Bulk actions: Publish selected, Unpublish selected
   Filter: by level, by status (has content / no content)
   "New Topic" → /admin/topics/new?path=dsa

3. /admin/topics/[topicSlug]/edit — The Main Editor
   Layout: two-panel (editor left, preview right)
   
   TOP BAR: Topic metadata form
   - Title input, Slug (auto from title, editable)
   - Level selector (1-5), Estimated minutes
   - Tags multi-input
   - has_visualizer toggle → shows visualizer selector dropdown (all registered visualizers)
   - has_code_lab toggle
   - Publish button (requires all 6 sections have content)
   
   SECTION TABS (tabs across editor): WHY | THEORY | VISUAL | CODE | REAL WORLD | INTERVIEW
   
   Each section tab has:
   - Monaco MDX editor (left, 60%)
   - Live MDX preview (right, 40%) using @mdx-js/react dynamic render
   - Word count, estimated read time displayed below editor
   - "AI Assist" button: calls Gemini API to generate draft content for this section
     Prompt sent to Gemini: "Write the {section_type} section for a DevMastery topic about '{topic_title}'. 
     Level {level} (1=beginner, 5=expert). Follow the 6-layer teaching model. Include code examples. 
     Format as MDX."
   
   CODE SECTION special UI:
   - Multiple Monaco editors: one per level (Level 1 → Level 5)
   - Language selector per level
   - "Run to verify" button: executes against Judge0 CE, shows output
   
   INTERVIEW SECTION special UI:
   - Question/answer list editor
   - "Add Question" button: { question_text, answer_mdx, type: conceptual/coding/tricky, difficulty 1-5 }

4. Auto-save: debounced 30s PUT /admin/topics/{slug}/draft
   Saved indicator: "Saved 2s ago" | "Saving..." | "Save failed"

5. Content completeness checker:
   Before publish: check all 6 sections have > 100 words
   Show warning: "Theory section too short (45 words). Minimum 100 words required."

6. AI Assist implementation (Gemini API call from Next.js API route):
   POST /api/admin/ai-assist
   Body: { topicSlug, topicTitle, level, sectionType, pathSlug }
   Response: streaming MDX content from Gemini
   Model: gemini-1.5-flash (free tier)
   System prompt: "You are a senior developer writing educational MDX content for DevMastery, a programming learning platform. Write depth-first, complete explanations suitable for level {level} developers. Always include code examples. Never skip explanation."

BACKEND admin endpoints (add to content-service):
   @PreAuthorize("hasRole('ADMIN')")
   GET  /admin/topics/stats              — counts per path, published vs draft
   PUT  /admin/topics/{slug}/section     — save one section { sectionType, contentMdx }
   PUT  /admin/topics/{slug}/draft       — auto-save all sections
   POST /admin/topics/{slug}/publish     — validates + publishes
   POST /admin/topics/{slug}/unpublish
   POST /admin/topics                    — create new topic
```

---

## Development Order (Recommended)

Given that Phases 0–3 are complete, work in this order:

```
WEEK 1–2:   PROMPT 11 — Seed all 18 paths topics via Flyway
WEEK 3–4:   PROMPT 12 — Update content-service for all paths + OpenSearch
WEEK 5–6:   PROMPT 16 — Roadmap visualization (web + Android list view)
WEEK 7–8:   PROMPT 15 — Progress service for all 18 paths + XP + badges
WEEK 9–11:  PROMPT 13 — All DSA visualizer algorithms (all 15 visualizers)
WEEK 12–14: PROMPT 14 — LeetCode Patterns module
WEEK 15–17: PROMPT 17 — Admin CMS with Gemini AI Assist for content authoring
WEEK 18–20: Use Admin CMS to write content for all ~989 topics (parallel work)
WEEK 21–22: PROMPT 05 (updated) — AI Bot: context-aware for all 18 paths
WEEK 23–24: End-to-end testing, performance tuning, Play Store prep
```

---

## Total Content Count

```
18 Learning Paths
989 Topics (all with 6-layer content)
~6,000 Lessons (6 per topic average)
~2,000 Code Examples (2 per topic average)
~5,000 Quiz Questions (5 per topic average)
~450 Coding Problems (primarily DSA + LeetCode paths)
20 Guided Real-Time Projects

When complete:
DevMastery becomes the most comprehensive single platform
covering every major technology a developer needs — beginner to senior.
Zero cost. Fully owned. No subscription.
```

---

*End of DevMastery Roadmap Integration Plan v1.0*
*18 roadmap.sh paths · 989 topics · 7 Antigravity prompts · 0 cost*
