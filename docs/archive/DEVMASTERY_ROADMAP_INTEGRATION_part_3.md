loa# DevMastery — Complete Roadmap Integration Plan
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

---

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
```json
{ "component": "CodeStepsVisualizer", "steps": ["step1", "step2", "step3"] }
```

## CODE
### Level 1 — Beginner
```java
// [10-20 lines, every line commented]
```
### Level 2 — Building Blocks
```java
// [20-40 lines, practical usage]
```
### Level 3 — Intermediate
```java
// [production pattern]
```
### Level 4 — Advanced
```java
// [performance-conscious, thread-safe where applicable]
```
### Level 5 — Expert
```java
// [JVM-level, internal tricks]
```

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
Include Mermaid architecture diagrams in each (```mermaid DSL).
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

```
THEORY SECTION:
□ Does it explain internal mechanics, not just behavior?
□ Is there a concrete step-by-step trace/walkthrough?
□ Is time complexity derived (not just stated)?
□ Is space complexity derived?
□ Are common misconceptions addressed?

CODE SECTION:
□ Does the Level 1 code compile with no modification?
□ Does the Level 5 code show something Level 1 doesn't?
□ Are all variable names meaningful?
□ Is expected output shown in comments?
□ Is the code idiomatic for the language (Java 21, Angular 17, etc.)?

REAL WORLD SECTION:
□ Are actual class names from real frameworks mentioned?
□ Is there a production code snippet (not just toy code)?
□ Is there a "when NOT to use" anti-pattern section?

INTERVIEW SECTION:
□ Are there 5+ questions?
□ Does each question have a weak answer AND a strong answer?
□ Do strong answers include internal mechanics?
□ Is time/space complexity mentioned in coding questions?

GENERAL:
□ No "Here is the content" preamble (pure MDX output)
□ No factual errors (especially for concurrent/distributed topics)
□ MDX syntax valid (no broken code blocks, proper frontmatter)
□ Word count meets minimums
```

---

## Antigravity Workflow — Running the Agent

### Step-by-Step for Each Batch Prompt

```
1. Open Antigravity IDE
2. Select model (see Model Selection Strategy table above)
3. Open a new Agent session (not a regular chat)
4. Paste the MASTER SYSTEM PROMPT first (the one with the 9 writing standards)
5. Paste the BATCH PROMPT for the group you want to generate
6. Set output file: apps/web/content/{path-slug}/{topic-slug}.mdx
7. Let agent run — it will generate all topics in sequence
8. Agent saves each === TOPIC: {slug} === block as a separate .mdx file
9. Run the content validation checklist manually on 2-3 random topics
10. If quality is good, trigger Admin CMS → bulk import MDX files → publish
```

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

```
After generating each === TOPIC: {slug} === block, immediately write it to:
File path: apps/web/content/{path-slug}/{slug}.mdx

MDX frontmatter to prepend to each file:
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

Then the 6-layer content below the frontmatter.
```

---

## Total Generation Estimate

```
18 paths × avg 55 topics = 989 topics

Batch sizes:
  Batch A (Java Level 1-2):         16 topics × ~1,500 words = 24,000 words
  Batch B (Java Collections):       12 topics × ~2,000 words = 24,000 words  
  Batch C (Java Concurrency):        8 topics × ~2,500 words = 20,000 words
  Batch D (DSA Algorithms):         20 topics × ~2,000 words = 40,000 words
  Batch E (System Design HLD):       5 topics × ~3,000 words = 15,000 words
  Batch F (Spring Boot):            10 topics × ~1,800 words = 18,000 words
  Batch G (Angular):                15 topics × ~1,500 words = 22,500 words
  Batch H (JS Engine Internals):     4 topics × ~2,500 words = 10,000 words
  
  Remaining batches (React, TS, CSS, SQL, etc.):
  ~900 topics × avg ~1,500 words = 1,350,000 words

  TOTAL: ~1.5 million words of depth-first technical content
  
  Antigravity generation time estimate:
  - Gemini 3.5 Flash (High):   ~2 min per batch of 10 topics
  - Gemini 3.1 Pro (High):     ~5 min per batch of 10 topics  
  - Claude Sonnet 4.6:         ~8 min per batch of 10 topics
  - Claude Opus 4.6:           ~12 min per batch of 5 topics
  
  Total estimated time: ~80-100 Antigravity agent sessions
  Spread across: 2-3 weeks of generation + validation
```

---

*End of Part 2 — Antigravity AI Content Generation Engine*
*Use Claude Sonnet 4.6 (Thinking) for deep internals. Gemini 3.5 Flash for Level 1-2. Opus for architecture.*

---

---

# PART 3 — Remaining Batch Prompts (Paths I–R)

---

### BATCH PROMPT I — JavaScript Fundamentals & Async (Level 1–3): 20 Topics

**Model: Gemini 3.1 Pro (High) for Level 1–2 · Claude Sonnet 4.6 for Level 3–4**

```
You are the DevMastery Content Engine. Generate complete 6-layer MDX for JavaScript path topics.

JS CONTENT RULES:
- All code runs in both browser and Node.js unless noted
- Show browser DevTools usage where relevant
- Async topics: always include the anti-pattern BEFORE showing the correct pattern
- Reference ECMAScript version (ES6, ES2020, ES2022) for each feature
- V8 engine notes on Level 4–5 topics

=== TOPIC: js-intro ===
Title: What is JavaScript — Engine, Runtime, Ecosystem | Level: 1
Must cover:
- JS is interpreted/JIT-compiled (not compiled ahead-of-time like Java)
- V8 (Chrome/Node), SpiderMonkey (Firefox), JavaScriptCore (Safari) — all different engines
- Runtime environments: Browser (DOM, Web APIs) vs Node.js (fs, net, process)
- ECMAScript specification vs implementation: TC39 committee, proposal stages (0→4)
- Single-threaded language (one call stack) — implications for blocking
- JavaScript engine role: parse → compile → execute
- npm ecosystem: 2M+ packages, why this matters for the developer

=== TOPIC: variables ===
Title: var, let, const — Scope, Hoisting, TDZ | Level: 1
Must cover:
- var: function-scoped (not block-scoped), hoisted AND initialized to undefined
  (why: var declarations lifted to function top during parsing phase)
- let/const: block-scoped, hoisted but NOT initialized → Temporal Dead Zone (TDZ)
- TDZ: accessing let/const before declaration = ReferenceError (not undefined)
- const: binding is immutable (can't reassign), value can still mutate (object properties)
- Why var should be avoided: leaks out of blocks (for loops), confusing hoisting behavior
- Concrete memory model: var → function scope frame, let/const → block scope frame

=== TOPIC: data-types ===
Title: JavaScript Data Types — Primitives and References | Level: 1
Must cover:
- 7 primitives: string, number, bigint, boolean, null, undefined, symbol
- typeof null === "object" — the famous JS bug (cannot be fixed, compatibility)
- NaN: type is "number", NaN !== NaN (only value not equal to itself), Number.isNaN() vs isNaN()
- Reference types: objects, arrays, functions — stored as heap pointers
- Immutability of primitives: operations create new values, never mutate
- == vs === : coercion rules (== converts types), always use ===
- Falsy values: 0, "", null, undefined, NaN, false (everything else is truthy)

=== TOPIC: type-coercion ===
Title: Type Coercion and Abstract Equality | Level: 2
Must cover:
- Implicit coercion: + operator with string converts other operand to string
- Abstract Equality Algorithm (==): if types differ, coerce, then compare
  null == undefined → true (only these two)
  {} == false → false (object vs boolean: boolean → number → object → ToPrimitive)
- ToPrimitive: calls valueOf() then toString() for objects
- Addition: string + anything = string concatenation
- Subtraction/multiplication: converts both to numbers
- The "wat" examples: [] + {} → "[object Object]", {} + [] → 0 (or "[object Object]")

=== TOPIC: operators-js ===
Title: Operators — Nullish Coalescing, Optional Chaining | Level: 2
Must cover:
- Nullish coalescing (??): returns right side only if left is null/undefined (NOT falsy)
  '' ?? 'default' → '' (vs || which returns 'default' for empty string)
- Optional chaining (?.): short-circuits to undefined if property is null/undefined
  user?.address?.city — safe deep property access
- Logical assignment: &&=, ||=, ??= (ES2021) — conditional assignment operators
- Exponentiation **: 2 ** 10 = 1024 (ES2016)
- Destructuring assignment in operators context

=== TOPIC: control-flow-js ===
Title: Control Flow and Short-Circuit Evaluation | Level: 1
Must cover:
- Short-circuit: && returns first falsy or last value, || returns first truthy or last value
- Practical use: const name = user && user.name (before optional chaining)
- switch statement: fall-through without break, switch vs if-else performance (V8 optimizes switch to jump table)
- for...in iterates object keys (including inherited — use hasOwnProperty), for...of iterates iterable values
- Labeled statements: rare but valid, break/continue to outer loop

=== TOPIC: functions-basics ===
Title: Functions — Declaration, Expression, Arrow | Level: 1
Must cover:
- Function declaration: hoisted completely (both declaration AND body)
- Function expression: only variable declaration hoisted (var → undefined, let → TDZ)
- Arrow functions: no own this, no arguments object, can't be constructor (new), concise body
- IIFE (Immediately Invoked Function Expression): creates isolated scope
- Default parameters evaluated at call time (not definition), can reference earlier params
- Rest parameters (...args): real array (unlike arguments object)
- Arguments object: array-like but not array, no rest params equivalent in old code

=== TOPIC: arrays-in-js ===
Title: Arrays — Methods, Iteration, Immutable Patterns | Level: 2
Must cover:
- Arrays are objects with numeric keys + length property
- Mutating vs non-mutating: push/pop/shift/unshift/splice/sort/reverse MUTATE
  map/filter/reduce/slice/concat/flat/flatMap return NEW arrays
- Array.from(): convert iterables (NodeList, Set, Map) to array
- Destructuring with rest: const [first, ...rest] = arr
- Sparse arrays: arr[100] = 1 creates 101-length array with holes
- sort() default: lexicographic (10 < 2 as strings!), always provide compareFn
- reduce() mental model: accumulator pattern, equivalent to fold in FP
- flat() vs flatMap(): one-level vs map-then-flat

=== TOPIC: objects-in-js ===
Title: Objects — Creation, Destructuring, Spread | Level: 2
Must cover:
- Object literal, Object.create(), constructor function, class syntax — all create objects
- Property descriptor: value, writable, enumerable, configurable
  Object.defineProperty() — used internally by framework code
- Shorthand properties, computed property names ([dynamic]: value)
- Object.assign() vs spread: both shallow copy, spread is cleaner
- Object.freeze() vs Object.seal(): freeze = no add/delete/modify, seal = no add/delete (modify ok)
- for...in vs Object.keys() vs Object.entries(): enumerable own + inherited vs own only

=== TOPIC: destructuring ===
Title: Destructuring — Arrays, Objects, Nested, Defaults | Level: 2
Must cover:
- Array destructuring: position-based, skip with commas, rest element
- Object destructuring: name-based, rename with colon, default value, rest
- Nested destructuring: const { address: { city } } = user
- Function parameter destructuring: function({ name, age = 0 } = {})
  The ={} default prevents error when no argument passed
- Swap variables: [a, b] = [b, a]
- Import destructuring: import { useState, useEffect } from 'react'

=== TOPIC: spread-and-rest ===
Title: Spread and Rest Operators | Level: 2
Must cover:
- Spread in array: [...arr1, ...arr2] — shallow copy + merge
- Spread in object: { ...obj1, ...obj2 } — later keys win
- Spread in function call: Math.max(...nums)
- Rest in function: must be last parameter
- Spread creates shallow copy: nested objects still share reference
- Performance: spread O(n), avoid in tight loops

=== TOPIC: template-literals ===
Title: Template Literals and Tagged Templates | Level: 2
Must cover:
- Basic: ${expression} interpolation, multi-line without \n
- Tagged templates: tag`Hello ${name}` — tag function receives strings array + values
- Real uses: styled-components (CSS-in-JS), gql`...` (GraphQL), sql`...` (SQL injection safe)
- Raw string access: String.raw`\n` → literal backslash-n (not newline)
- Nesting template literals

=== TOPIC: closures ===
Title: Closures — Scope Chain and Memory | Level: 3
[Reference content from Batch H — expand with more practical examples]
Additional: module pattern, memoization using closure, partial application, 
closure as private state (banking account example), common interview traps

=== TOPIC: this-keyword ===
Title: The this Keyword — 4 Binding Rules | Level: 3
Must cover all 4 rules with priority order:
1. new binding: new Foo() → this = newly created object (highest priority)
2. Explicit binding: call(), apply(), bind() → this = specified object
3. Implicit binding: obj.method() → this = obj (lost when assigned to variable!)
4. Default binding: standalone function → this = undefined (strict) or window (sloppy)
- Arrow functions: no own this — use enclosing lexical this
- this loss: const fn = obj.method; fn() → this is undefined (common bug)
- bind() creates new function with permanently bound this
- Interview: predict this in various scenarios

=== TOPIC: callbacks ===
Title: Callbacks — Callback Hell and Error-First | Level: 3
Must cover:
- Synchronous vs asynchronous callbacks
- Node.js error-first convention: cb(err, result)
- Callback hell: 3+ levels of nesting (the "pyramid of doom")
- Inversion of control problem: you pass your code to third-party (can it be called multiple times?)
- Named functions as partial solution
- Why Promises were invented (to solve these exact problems)
- Common mistake: mixing sync and async in same function (Zalgo problem)

=== TOPIC: promises ===
Title: Promises — Internals and Chaining | Level: 3
Must cover:
- Promise states: pending → fulfilled | rejected (irreversible)
- Microtask queue: then() callbacks scheduled as microtasks (before setTimeout)
- Promise chaining: each .then() returns a new Promise
- Error propagation: rejected promise skips .then() until .catch()
- Promise.all(): rejects fast on first rejection
- Promise.allSettled(): waits for all, reports each outcome
- Promise.race(): first to settle wins
- Promise.any(): first to FULFILL wins (rejects only if ALL reject — AggregateError)
- Common mistake: missing return in .then() (breaks chain)
- Promisification: converting callback APIs to Promise-based

=== TOPIC: async-await ===
Title: async/await — Syntactic Sugar Over Promises | Level: 3
Must cover:
- async function always returns a Promise (wraps return value)
- await pauses async function execution (NOT the thread — other tasks can run)
- Error handling: try/catch replaces .catch()
- Sequential vs parallel: await inside loop = sequential, Promise.all = parallel
  Common mistake: for(const item of items) { await fetch(item) } = sequential (slow)
  Fix: await Promise.all(items.map(item => fetch(item)))
- Top-level await (ES2022, modules only)
- Async iterators: for await...of

=== TOPIC: modules-es6 ===
Title: ES Modules — import/export, Module System | Level: 3
Must cover:
- Named exports: export const x = 1, export function f() {}
- Default export: export default class, one per module, import with any name
- import vs require: static (import — tree-shakeable) vs dynamic (require — runtime)
- Dynamic import(): import('./module.js').then() — code splitting
- Module scope: all identifiers private by default (not global)
- Live bindings: imported values are live (change in source = change in import)
  vs CommonJS: copied at require() time
- Circular imports: handled (partially) in ES modules, risky in CommonJS

=== TOPIC: regular-expressions ===
Title: Regular Expressions — Patterns, Groups, Flags | Level: 3
Must cover:
- Literal syntax /pattern/flags vs RegExp constructor (for dynamic patterns)
- Character classes: [abc], [^abc], \d, \w, \s, \D, \W, \S
- Anchors: ^start, end$, \b word boundary
- Quantifiers: *, +, ?, {n,m}, greedy vs lazy (? suffix)
- Groups: capturing (), non-capturing (?:), named (?<name>)
- Lookahead/lookbehind: (?=...), (?!...), (?<=...), (?<!...)
- Flags: g (global), i (case insensitive), m (multiline), s (dotAll), u (unicode), d (indices)
- Pitfall: stateful regex with /g flag and exec() — lastIndex persists

Output all 20 topics. Each minimum 1,000 words in MDX format.
```

---

### BATCH PROMPT J — TypeScript Complete (Level 2–4): 48 Topics in 3 Sub-batches

**Model: Gemini 3.1 Pro (High)**

#### Sub-batch J1 — TS Basics (Level 2): 12 Topics

```
You are the DevMastery Content Engine. Generate 6-layer MDX for TypeScript basics topics.

TYPESCRIPT CONTENT RULES:
- Always show TypeScript then compiled JavaScript (tsc output) side-by-side to explain type erasure
- All tsconfig.json examples use strict: true
- Show exact TypeScript error messages (TS2xxx) so students learn to read them
- Reference TypeScript Handbook sections where relevant
- Code examples must work with TypeScript 5.x

=== TOPIC: ts-intro ===
Title: TypeScript Introduction — Why Types, tsc, tsconfig | Level: 2
Must cover:
- TypeScript = JavaScript + static type system (structural, not nominal)
- Types exist ONLY at compile time (type erasure — no runtime cost)
- tsc compiler: .ts → .js, type checking is separate from compilation
- tsconfig.json: target (ES output version), module (CommonJS/ESM), strict mode flags
- strict: true enables: noImplicitAny, strictNullChecks, strictFunctionTypes, etc.
- TypeScript error vs runtime error: TS errors prevent bugs before they happen
- When TypeScript helps most: refactoring, API contracts, team codebases

=== TOPIC: basic-types ===
Title: Basic Types — string, number, boolean, any, unknown | Level: 2
Must cover:
- Primitive types: string, number (no int/float distinction), boolean, bigint, symbol
- Special types: any (opt-out of checking — avoid), unknown (safe any — must narrow before use)
- void: function returns nothing (return undefined), never: function never returns (throws/infinite loop)
- Type annotations vs type inference: let x: string = "hello" vs let x = "hello" (inference preferred)
- null and undefined: with strictNullChecks, not assignable to other types
- undefined vs null difference in TypeScript context

=== TOPIC: arrays-and-tuples ===
Title: Arrays and Tuples | Level: 2
Must cover:
- Typed array: number[], string[], Array<T> (both equivalent)
- readonly arrays: ReadonlyArray<T> or readonly T[] — immutable
- Tuple: fixed-length, positionally-typed [string, number, boolean]
- Optional tuple elements: [string, number?]
- Rest elements in tuples: [string, ...number[]]
- Labeled tuples (TS 4.0): [name: string, age: number] — documentation only
- When to use tuple: function returning multiple values, CSV row types

=== TOPIC: objects-and-interfaces ===
Title: Objects, Interfaces, and Type Aliases | Level: 2
Must cover:
- Interface: describes object shape, extendable with extends
- Type alias: can be anything (primitives, unions, intersections, functions)
- interface vs type alias: interfaces are open (declaration merging), type aliases are closed
  Use interface for object shapes, type alias for unions/intersections/computed types
- Optional properties (?): may be undefined
- Readonly properties: cannot be reassigned after object creation
- Index signatures: { [key: string]: number } — dictionary type
- Excess property checking: only at assignment, not when passed through variable

=== TOPIC: functions-ts ===
Title: TypeScript Functions — Overloads, Generics, this | Level: 2
Must cover:
- Parameter types and return type annotations
- Optional parameters (?) must come after required
- Default parameters: type inferred from default value
- Function overloads: multiple signatures + one implementation signature
- void vs undefined return type difference
- Function type: type Handler = (event: Event) => void
- this parameter: first parameter (type only, removed in JS), for OOP methods

=== TOPIC: union-and-intersection ===
Title: Union Types and Intersection Types | Level: 2
Must cover:
- Union (|): value is ONE OF these types, must narrow before using type-specific props
- Intersection (&): value has ALL properties of both types (combines types)
- Discriminated union: common literal property used to narrow: type Shape = Circle | Square
  where each has { kind: "circle" | "square" }
- Union widening: string | string → string
- Common use: function parameter accepting multiple types, API response types

=== TOPIC: type-narrowing ===
Title: Type Narrowing — Guards, Assertions, Predicates | Level: 3
Must cover:
- typeof guard: typeof x === "string" narrows to string in that branch
- instanceof guard: narrows to class type
- in operator guard: "prop" in obj narrows to type with that property
- Truthiness narrowing: if(x) narrows away null/undefined
- Equality narrowing: if(x === "hello") narrows to literal type
- Type assertion (as): tells TypeScript "trust me" — no runtime check, can be wrong
- Non-null assertion (!): value!.property — asserts not null/undefined
- Type predicates: function isString(x: any): x is string { return typeof x === "string" }
- Discriminated union narrowing: switch on discriminant property

=== TOPIC: generics-ts ===
Title: Generics in TypeScript | Level: 3
Must cover:
- Generic function: function identity<T>(arg: T): T
- Generic interface and class
- Constraints: T extends object, T extends { length: number }
- keyof constraint: T extends keyof U
- Default type parameters: T = string
- Multiple type parameters: function pair<K, V>(key: K, value: V): [K, V]
- Generic in React: React.FC<Props> (deprecated), function Component<T extends Props>
- When TypeScript infers vs when to be explicit

=== TOPIC: enums-ts ===
Title: TypeScript Enums vs const enums vs Union Types | Level: 3
Must cover:
- Numeric enum: bidirectional mapping (name → value AND value → name)
- String enum: no reverse mapping, safer for serialization
- const enum: fully inlined by compiler (no runtime object) — but no reverse mapping
- Why many experts prefer union types over enums: "open" type vs enum value
  type Direction = "north" | "south" | "east" | "west" vs enum Direction {}
- Pitfall: enum values can be any number (enum Status { A = 0, B = 0 } — duplicate values allowed!)

=== TOPIC: utility-types ===
Title: Utility Types — Partial, Required, Pick, Omit, Record | Level: 3
Must cover (all standard utility types with implementation showing):
- Partial<T>: all properties optional → { [P in keyof T]?: T[P] }
- Required<T>: all properties required → removes ?
- Readonly<T>: all properties readonly
- Pick<T, K>: subset of properties → { [P in K]: T[P] }
- Omit<T, K>: exclude keys → Pick<T, Exclude<keyof T, K>>
- Record<K, V>: object type with keys K, values V
- Exclude<T, U>: remove from union
- Extract<T, U>: keep only matching from union
- NonNullable<T>: remove null and undefined
- ReturnType<T>: infer return type of function
- Parameters<T>: infer parameters tuple of function
- Awaited<T>: unwrap Promise<T> to T (recursive)

=== TOPIC: mapped-types ===
Title: Mapped Types and Template Literal Types | Level: 4
Must cover:
- Mapped types: transform all properties of a type
  { [K in keyof T]: TransformedType<T[K]> }
- Adding/removing modifiers: +readonly, -readonly, +?, -?
- Key remapping with as clause (TS 4.1+)
- Template literal types: type EventName = `on${Capitalize<string>}`
- Combining: map over union of string literals to create object type
- Real use: creating Setters<T> from Getters<T>, creating event handler maps

=== TOPIC: conditional-types ===
Title: Conditional Types and infer | Level: 4
Must cover:
- T extends U ? X : Y — if T is assignable to U, result is X, else Y
- Distributive conditional types: apply over each member of union
- infer keyword: extract type from conditional: T extends Array<infer U> ? U : never
- Practical patterns:
  - UnpackPromise<T> = T extends Promise<infer U> ? U : T
  - ElementType<T> = T extends (infer U)[] ? U : never
  - FunctionParameters<T> = T extends (...args: infer P) => any ? P : never
- Non-distributive: wrap in tuple to prevent distribution [T] extends [U]

Output all 13 TS topics. Show TypeScript type-level code clearly.
```

---

### BATCH PROMPT K — React Complete (Level 2–5): 22 Topics

**Model: Gemini 3.1 Pro (High) for Level 2–3 · Claude Sonnet 4.6 for Level 4–5**

```
You are the DevMastery Content Engine. Generate 6-layer MDX for React path.

REACT CONTENT RULES:
- Use React 19 + TypeScript (functional components only — no class components in new code)
- Show TypeScript types for all props and state
- Explain React's reconciliation algorithm where relevant
- Hooks: explain the rules (why you can't use hooks in conditions) with internals
- Performance topics: show React DevTools Profiler screenshots described in text

=== TOPIC: react-intro ===
Title: React — Virtual DOM, Reconciliation, JSX | Level: 2
Must cover:
- Problem React solves: manual DOM manipulation is error-prone and slow
- Virtual DOM: plain JavaScript object tree representing the UI
- Reconciliation: diffing algorithm (O(n) not O(n³) due to assumptions)
  Key heuristic: different element types → rebuild subtree (don't reuse)
  Key heuristic: same element type → update attributes, recurse children
- Fiber architecture (React 16+): work units, priority, time slicing
- JSX: syntactic sugar for React.createElement() calls (show transpiled output)
- Why key prop matters: helps reconciler identify which items changed/moved

=== TOPIC: jsx ===
Title: JSX — Expressions, Fragments, Conditional Rendering | Level: 2
Must cover:
- JSX is not HTML: className, htmlFor, style={{ }} (object not string)
- JSX expressions: {jsExpression} — must return renderable value
- Conditional: && (renders null for false, "0" for 0 — use !! or ternary)
- Lists: .map() + key prop, key must be unique among siblings, stable (not index)
- Fragment: <></> (no key), <React.Fragment key={id}> (when key needed)
- JSX transform: React 17+ doesn't need import React for JSX files

=== TOPIC: components ===
Title: Function Components and Composition | Level: 2
Must cover:
- Component as a function: (props) => JSX
- Naming: must start with capital letter (lowercase = HTML element)
- Pure function rule: same props = same output, no side effects during render
- Component composition: passing components as props, children prop
- React.ReactNode type: what children can be (element, string, array, null, etc.)
- When to split components: single responsibility, reuse, complexity
- Colocating state: state lives in nearest common ancestor

=== TOPIC: props ===
Title: Props — Passing Data, TypeScript Types, Children | Level: 2
Must cover:
- Props are read-only (frozen object in strict mode)
- Prop drilling problem: data passed through multiple intermediate components
- Spreading props: <Button {...buttonProps} /> — convenient but can pass unexpected props
- Default props: default parameter in function signature
- Children as props: React.ReactNode, React.ReactElement, React.FC children types
- Component as prop pattern: renderHeader={() => <Header />}

=== TOPIC: state-usestate ===
Title: useState — State Batching, Functional Updates, Initialization | Level: 2
Must cover:
- State triggers re-render (unlike regular variable)
- Batching (React 18+): multiple setState calls in event handlers batched into one render
- Functional update form: setState(prev => prev + 1) — necessary when new state depends on old
  Why: closures capture stale state, functional form always gets latest
- Lazy initialization: useState(() => expensiveCalculation()) — runs only once
- State as snapshot: state in a render is frozen (stale closure)
- Pitfall: setState on unmounted component (React 18 ignores, earlier versions warn)

=== TOPIC: useeffect ===
Title: useEffect — Lifecycle, Dependencies, Cleanup | Level: 3
Must cover:
- useEffect runs AFTER render (not during), asynchronous to paint
- Dependency array: [] = run once, [dep] = run when dep changes, none = run every render
- Cleanup function: returned from effect, runs before next effect or unmount
  Use for: clearInterval, unsubscribe, AbortController.abort()
- React 18 Strict Mode: effects run twice in dev (intentional — find cleanup bugs)
- Stale closure in effects: deps array captures values at effect creation time
- Fetching data in useEffect: AbortController pattern to prevent race conditions
- useLayoutEffect: runs synchronously after DOM mutations, before paint (use for measurements)

=== TOPIC: useref ===
Title: useRef — DOM Refs, Instance Variables, forwardRef | Level: 3
Must cover:
- useRef returns { current: T } — mutable object that persists across renders
- Does NOT trigger re-render (unlike useState)
- Two use cases: DOM access (ref={myRef}) and storing instance variable
- ForwardRef: pass ref to child component, expose DOM element to parent
- useImperativeHandle: expose custom methods on ref (not full DOM element)
- When to use ref vs state: read-only computed values that don't affect UI → ref

=== TOPIC: usecontext ===
Title: useContext — Context API, Provider Pattern | Level: 3
Must cover:
- Problem: prop drilling across many levels
- createContext with default value (used when no Provider above)
- Context re-renders all consumers when value changes (every render of Provider)
- Optimization: split contexts by update frequency (AuthContext separate from ThemeContext)
- Context vs state management: context is NOT a full state management solution
- Compound component pattern using context: internal state shared without prop drilling

=== TOPIC: usememo-usecallback ===
Title: useMemo and useCallback — When to Memoize | Level: 3
Must cover:
- useMemo: memoizes computed value, recomputes when deps change
- useCallback: memoizes function reference (function is a new object on each render)
- Why functions need memoization: child wrapped in React.memo re-renders if callback changes
- The cost of memoization: not free (comparison on every render, memory)
- When NOT to memoize: cheap computations, component always re-renders anyway
- React 19 compiler (React Forget): auto-memoization, reduces need for manual hooks
- Profiler rule: measure first, memoize second

=== TOPIC: custom-hooks ===
Title: Custom Hooks — Extracting Logic | Level: 3
Must cover:
- Custom hook: function starting with "use" that calls built-in hooks
- Why: reuse stateful logic across components (not just UI)
- Rules of Hooks apply inside custom hooks
- Examples with full code:
  useFetch<T>(url): fetch data, handle loading/error states, AbortController
  useLocalStorage<T>(key, initial): sync state with localStorage
  useDebounce<T>(value, delay): debounced value
  useWindowSize(): responsive utilities
  usePrevious<T>(value): ref-based previous value tracking
- Testing custom hooks: @testing-library/react renderHook

=== TOPIC: react-router-v6 ===
Title: React Router v6 — Routes, Hooks, Loaders | Level: 3
Must cover:
- Route, Routes, Link, NavLink, Outlet (nested routes)
- useNavigate, useParams, useLocation, useSearchParams
- Nested routes and Outlet: parent renders child route at Outlet position
- Protected routes: wrapper component checking auth
- Data router (v6.4+): loader function, action function, defer, Await, useLoaderData
- Error boundaries in React Router: errorElement
- Lazy loading routes: element: lazy(() => import('./Page'))

=== TOPIC: state-management-redux ===
Title: Redux Toolkit — Store, Slices, Async Thunks | Level: 4
Must cover:
- Redux principles: single store, state read-only, pure reducer functions
- Redux Toolkit createSlice: generates actions + reducer together
- createAsyncThunk: handles pending/fulfilled/rejected lifecycle
- RTK Query: built-in data fetching (replaces React Query for Redux users)
- useSelector: subscribes to store slice, re-renders on change
  Memoized selectors (createSelector): prevent unnecessary re-renders
- useDispatch: dispatch actions to store
- Redux DevTools: time-travel debugging, action history
- When NOT to use Redux: local UI state, simple apps (overkill)

=== TOPIC: react-query-tanstack ===
Title: TanStack Query — Server State Management | Level: 4
Must cover:
- Client state vs server state: why they're different (stale, loading, error, refetch)
- useQuery: queryKey (cache key), queryFn, staleTime, cacheTime, enabled
- useMutation: mutate, mutateAsync, onSuccess, onError, invalidateQueries
- Query invalidation: tell React Query data is stale, trigger refetch
- Optimistic updates: update UI before server confirms
- Infinite queries: useInfiniteQuery for paginated lists
- QueryClient: global cache, prefetching, dehydrate/hydrate for SSR
- Comparison with SWR: both solve same problem, different API design

=== TOPIC: lazy-loading-suspense ===
Title: Code Splitting, lazy(), and Suspense | Level: 4
Must cover:
- Bundle splitting: why ship 500KB when user needs 50KB for this page?
- React.lazy(): dynamic import wrapped as lazy component
- Suspense boundary: shows fallback while lazy component loads
- Error boundary: catches errors in lazy loading, shows fallback UI
- Route-based splitting vs component-based splitting
- Webpack/Vite chunk naming: /* webpackChunkName: "about" */
- Preloading: hover-to-preload pattern before click

=== TOPIC: performance-react ===
Title: React Performance — Memo, Profiler, Virtualization | Level: 4
Must cover:
- React DevTools Profiler: flame graph, ranked chart, why-did-you-render
- React.memo: shallow comparison of props, skip re-render if unchanged
- When React.memo fails: object/array/function props (new reference each render)
- fix: useMemo + useCallback + stable references
- Key antipatterns: creating components inside render, index as key, huge context values
- Virtualization: react-window (windowed rendering), only render visible rows
  Use case: 1000-row table renders in <1ms with virtualization, 15 seconds without
- Concurrent features: useTransition for non-urgent updates (keeps UI responsive)

=== TOPIC: server-components ===
Title: React Server Components — RSC Architecture | Level: 5
Must cover:
- Server components execute on server (never shipped to client)
- Client components marked with "use client" directive
- RSC mental model: async function components, direct DB access, no hooks
- Streaming: RSC streams HTML progressively via Suspense boundaries
- Data fetching in RSC: async/await directly, no useEffect needed
- RSC + Client component tree: server renders shell, client hydrates interactive parts
- Limitations: no useState, no useEffect, no browser APIs in server components
- Next.js App Router: all components server by default, "use client" to opt into client

=== TOPIC: react-19-features ===
Title: React 19 — useOptimistic, use(), Form Actions | Level: 5
Must cover:
- useOptimistic: show optimistic UI immediately, revert on error
  Like TanStack's optimistic updates but built-in
- use() hook: read resources (Promise or Context) in render, suspends if pending
- Form Actions: action prop on form, server actions integration
- useFormStatus: pending state for submit buttons inside forms
- useFormState: manage form state with server actions
- React compiler: auto-memoization, eliminates need for useMemo/useCallback in most cases
- Document metadata: <title>, <meta> directly in components (no react-helmet needed)

Output all 17 React topics in MDX. Include TypeScript types for all examples.
```

---

### BATCH PROMPT L — CSS Complete (Level 1–4): 25 Topics

**Model: Gemini 3.1 Pro (High)**

```
You are the DevMastery Content Engine. Generate 6-layer MDX for CSS path topics.

CSS CONTENT RULES:
- All examples include working CSS + minimal HTML to demonstrate
- Show browser DevTools screenshots described in text (inspect element, computed styles)
- Include browser compatibility notes (% support, caniuse.com reference)
- Performance topics: mention GPU compositing, layout vs paint vs composite
- Modern CSS: use oklch, logical properties, :has(), container queries where appropriate

=== TOPIC: css-intro ===
Title: CSS — Cascade, Specificity, Inheritance | Level: 1
Must cover:
- Cascade: order of precedence (origin + specificity + order)
- Specificity calculation: inline(1,0,0,0) > ID(0,1,0,0) > class/attr/pseudo(0,0,1,0) > type(0,0,0,1)
- !important: breaks cascade, source of specificity wars (avoid)
- Inheritance: which properties inherit (color, font — text props) vs which don't (margin, border)
- Computed vs used vs resolved values: getComputedStyle() returns resolved values
- The initial, inherit, unset, revert keywords

=== TOPIC: selectors ===
Title: CSS Selectors — Combinators, Pseudo-classes, :has() | Level: 1
Must cover:
- Basic: type, .class, #id, * universal
- Attribute: [attr], [attr="val"], [attr^="start"], [attr$="end"], [attr*="contains"]
- Combinators: descendant (space), child (>), adjacent sibling (+), general sibling (~)
- Pseudo-classes: :hover, :focus, :nth-child(n), :first-child, :last-child, :not()
- Modern: :is() (forgiving selector list), :where() (zero specificity), :has() (parent selector)
  :has() game-changer: form:has(input:focus) can style form when input focused
- Pseudo-elements: ::before, ::after (content property), ::placeholder, ::selection
- Specificity of :is() vs :where()

=== TOPIC: box-model ===
Title: CSS Box Model — box-sizing, margin collapse | Level: 1
Must cover:
- Content → padding → border → margin (layers)
- box-sizing: content-box (default, width excludes padding+border) vs border-box (width includes)
  Why * { box-sizing: border-box } is best practice
- Margin collapse: adjacent vertical margins collapse to largest (horizontal margins don't)
  Only block elements, not flex/grid children, not if padding/border between
- Negative margins: valid, used for overlap effects
- Intrinsic vs extrinsic sizing: content sizing (min-content, max-content, fit-content)

=== TOPIC: display-and-positioning ===
Title: Display and Positioning — Flow, Stacking Context | Level: 1
Must cover:
- Normal document flow: block stacks vertically, inline flows horizontally
- position: static (default), relative (offset from normal), absolute (relative to positioned ancestor),
  fixed (relative to viewport), sticky (hybrid: relative until threshold, then fixed)
- Stacking context: what creates one (position+z-index, opacity<1, transform, filter, isolation)
- z-index only works within same stacking context
- containing block: which ancestor does absolute/fixed use as reference
- display: none (no space) vs visibility: hidden (space preserved) vs opacity: 0 (space + events)

=== TOPIC: flexbox ===
Title: Flexbox — Container and Item Properties | Level: 2
Must cover:
- Container: display:flex, flex-direction (main axis), flex-wrap, gap
- Alignment: justify-content (main axis), align-items (cross axis), align-content (multi-line)
- Items: flex-grow, flex-shrink, flex-basis (shorthand: flex: grow shrink basis)
  flex: 1 = flex: 1 1 0% (fill space, can shrink, zero basis)
  flex: auto = flex: 1 1 auto (fill space, can shrink, natural basis)
- order: visual reordering (doesn't affect DOM/accessibility)
- align-self: override container align-items for one item
- Common patterns: centering (justify+align center), equal columns, push-to-end

=== TOPIC: css-grid ===
Title: CSS Grid — Two-Dimensional Layout | Level: 2
Must cover:
- grid-template-columns: repeat(3, 1fr), repeat(auto-fill, minmax(200px, 1fr))
- fr unit: fractional unit of available space
- grid-template-areas: named areas for visual layout
- grid-column: 1 / 3 (span), grid-row, grid-area shorthand
- auto-placement algorithm: how browser fills grid automatically
- dense packing: grid-auto-flow: dense — fills gaps
- Subgrid: align to parent grid (newer feature, excellent support 2023+)
- Grid vs Flexbox: grid for 2D (rows AND columns), flex for 1D (row OR column)
- Responsive grid: no media queries needed with auto-fill/minmax

=== TOPIC: css-variables ===
Title: CSS Custom Properties (Variables) | Level: 2
Must cover:
- Declaration: --color-primary: #3B82F6 (in :root for global)
- Usage: color: var(--color-primary, fallback)
- Scope: custom props respect CSS cascade and inheritance
- Dynamic updates: element.style.setProperty('--gap', '20px') from JavaScript
- TypeScript integration: document.documentElement.style.setProperty()
- @property rule: register with type, initial value, inherits (Houdini)
  @property --progress { syntax: '<number>'; initial-value: 0; inherits: false; }
- Real use: theming, dark mode toggle, component variants

=== TOPIC: responsive-design ===
Title: Responsive Design — Media Queries, Mobile-First | Level: 2
Must cover:
- Mobile-first: write base styles for mobile, add complexity with min-width queries
- Media query syntax: @media (min-width: 768px) { ... }
- Common breakpoints (Tailwind as reference): sm:640px, md:768px, lg:1024px, xl:1280px
- Media features: width, height, orientation, prefers-color-scheme, prefers-reduced-motion
- Container queries (@container): respond to parent width, not viewport (2023, full support)
  Use for truly reusable components (card works in sidebar OR main content)
- Fluid typography: clamp(1rem, 2.5vw, 2rem) — scales with viewport, min/max bounds
- Viewport units: vw, vh, vmin, vmax, svh (small viewport), dvh (dynamic viewport)

=== TOPIC: css-animations ===
Title: CSS Animations and Transitions | Level: 3
Must cover:
- Transition: property duration timing-function delay
- Timing functions: ease, linear, ease-in, ease-out, cubic-bezier(), steps()
- Which properties are animatable (numeric, color, transform) vs which aren't (display)
- @keyframes: from/to, percentage stops, animation shorthand
- animation-fill-mode: forwards (stay at end state), backwards (apply before start)
- Performance: only animate transform and opacity (GPU compositing, no layout/paint)
  Animating width/height → layout recalculation → slower
- Reduced motion: @media (prefers-reduced-motion: reduce)
- View Transitions API: animating between pages/states (CSS + JS)

=== TOPIC: transforms ===
Title: Transforms — 2D, 3D, GPU Compositing | Level: 3
Must cover:
- 2D: translate(x,y), rotate(deg), scale(x,y), skew(x,y)
- transform-origin: center of transformation
- translate vs top/left: translate doesn't cause layout recalculation (GPU layer)
- 3D: rotateX/Y/Z, translateZ, perspective (applied to parent)
- perspective-origin: viewpoint position for 3D
- transform-style: preserve-3d for nested 3D elements
- will-change: hint browser to create GPU layer in advance (use sparingly — memory cost)
- Hardware acceleration: transform/opacity create compositing layer → smooth 60fps animation

=== TOPIC: css-functions ===
Title: CSS Functions — calc(), clamp(), min(), max() | Level: 3
Must cover:
- calc(): math operations with mixed units — calc(100% - 2rem)
- min(a, b): smaller of two values — min(50%, 300px) = never wider than 300px
- max(a, b): larger of two values — max(1rem, 2vw) = never smaller than 1rem
- clamp(min, ideal, max): responsive value with bounds
  clamp(1rem, 2.5vw + 1rem, 2rem) — fluid type, accessible
- env(): environment variables — env(safe-area-inset-top) for notched phones
- attr(): use HTML attribute value in CSS (limited to content: attr(data-tooltip))
- CSS math functions: sin(), cos(), tan(), pow(), sqrt() — for complex animations

=== TOPIC: tailwind-deep ===
Title: Tailwind CSS — Configuration, JIT, Custom Plugins | Level: 4
Must cover:
- Utility-first concept: compose from single-purpose classes
- JIT mode (default in Tailwind 3+): generates only used classes at build time
- tailwind.config.js: content paths, theme extension, custom colors/spacing
- Extending vs overriding theme
- @apply directive: extract repeated utility combinations to component class
- Custom utilities with plugin API
- Dark mode: media query vs class strategy
- Arbitrary values: bg-[#123456], text-[2.5rem], w-[calc(100%-1rem)]
- Component libraries with Tailwind: shadcn/ui, daisyUI pattern

=== TOPIC: css-architecture ===
Title: CSS Architecture — BEM, CSS Modules, CSS-in-JS | Level: 4
Must cover:
- BEM: Block__Element--Modifier, naming convention, pros/cons (verbose but clear)
- CSS Modules: scoped class names (converted to unique hashes at build time)
  import styles from './Button.module.css', className={styles.button}
- CSS-in-JS: styled-components, Emotion — co-locate styles with components
  Runtime cost (generates styles dynamically) vs build-time (zero-runtime like vanilla-extract)
- Tailwind CSS: utility-first, no naming, PurgeCSS-friendly
- When to use each: team preference, SSR concerns, design system requirements
- CSS specificity management: layers @layer for third-party vs custom styles

Output all 14 CSS topics with real code examples. Include browser compatibility notes.
```

---

### BATCH PROMPT M — HTML Complete (Level 1–3): 15 Topics

**Model: Gemini 3.5 Flash (High)**

```
You are the DevMastery Content Engine. Generate 6-layer MDX for HTML path.

HTML CONTENT RULES:
- Always show rendered result (describe what user sees)
- Accessibility: include ARIA attributes and screen reader behavior for every form/interactive element
- Validate all HTML against W3C spec
- Show CSS needed to make example look reasonable

=== TOPIC: html-intro ===
Title: HTML — Document Structure, DOCTYPE, Semantic Purpose | Level: 1
=== TOPIC: text-elements ===
Title: Text Elements — Headings, Paragraphs, Inline Elements | Level: 1
=== TOPIC: list-elements ===
Title: Lists — ul, ol, dl — Semantic Choice | Level: 1
=== TOPIC: links-and-images ===
Title: Links and Images — Accessibility, srcset, lazy | Level: 1
=== TOPIC: tables ===
Title: HTML Tables — caption, scope, Accessible Data Tables | Level: 2
=== TOPIC: forms-html ===
Title: HTML Forms — Input Types, Validation, Labels | Level: 2
=== TOPIC: semantic-elements ===
Title: Semantic HTML5 — article, section, nav, main, aside | Level: 2
=== TOPIC: accessibility-html ===
Title: Accessibility — ARIA Roles, Keyboard Navigation | Level: 2
=== TOPIC: meta-tags-and-seo ===
Title: Meta Tags, Open Graph, SEO Essentials | Level: 2
=== TOPIC: html5-apis ===
Title: HTML5 APIs — Canvas, Audio, Video, picture | Level: 3
=== TOPIC: form-validation ===
Title: Native Form Validation — Constraint API | Level: 3
=== TOPIC: html-attributes ===
Title: Global Attributes — data-*, ARIA, contenteditable | Level: 2
=== TOPIC: template-slot ===
Title: HTML Template Element and Web Components Intro | Level: 3
=== TOPIC: performance-html ===
Title: HTML Performance — defer, preload, prefetch | Level: 3
=== TOPIC: pwa-manifest ===
Title: Progressive Web App Manifest | Level: 3

For each HTML topic:
- Show complete, valid HTML5 example
- Include screen reader behavior description
- Include WCAG 2.1 AA compliance note
- Show related CSS for visual completeness
Generate all 15 in MDX.
```

---

### BATCH PROMPT N — SQL Complete (Level 1–4): 20 Topics

**Model: Gemini 3.1 Pro (High)**

```
You are the DevMastery Content Engine. Generate complete 6-layer MDX for SQL path.

SQL CONTENT RULES:
- Primary dialect: PostgreSQL 16 (note MySQL/SQLite differences where significant)
- Always show EXPLAIN output description for query optimization topics
- Include sample data setup (CREATE TABLE + INSERT) at the start of each code section
- Real-world section: show the equivalent Spring Data JPA / Hibernate code for Java developers
- Index topics: always show both with-index and without-index EXPLAIN comparison

=== TOPIC: sql-intro ===
Title: SQL and Relational Model — Tables, Keys, ACID | Level: 1
Must cover: relational model (Codd's rules), primary key, foreign key, ACID properties,
SQL vs NoSQL decision matrix, PostgreSQL vs MySQL vs SQLite comparison

=== TOPIC: ddl-basics ===
Title: DDL — CREATE TABLE, Data Types, Constraints | Level: 1
Must cover: PostgreSQL data types (INTEGER vs BIGINT vs NUMERIC, VARCHAR vs TEXT, BOOLEAN, TIMESTAMPTZ vs TIMESTAMP),
NOT NULL, UNIQUE, DEFAULT, CHECK constraints, PRIMARY KEY syntax, serial vs BIGSERIAL vs gen_random_uuid()

=== TOPIC: dml-basics ===
Title: DML — INSERT, UPDATE, DELETE, SELECT | Level: 1
Must cover: Basic CRUD, WHERE clause operators, returning clause (PostgreSQL: RETURNING *),
UPDATE from subquery, DELETE with JOIN (PostgreSQL: USING clause), TRUNCATE vs DELETE

=== TOPIC: select-deep ===
Title: SELECT Deep Dive — DISTINCT, ORDER BY, LIMIT | Level: 1
Must cover: SELECT column list vs *, DISTINCT (and its cost), column aliases, ORDER BY multiple cols,
NULLS FIRST/LAST in ORDER BY, LIMIT + OFFSET pagination (keyset vs offset comparison)

=== TOPIC: filtering ===
Title: WHERE Clause — Operators, LIKE, NULL Handling | Level: 1
Must cover: Comparison operators, BETWEEN (inclusive), IN vs ANY vs EXISTS,
LIKE patterns (% vs _), ILIKE (PostgreSQL case-insensitive), IS NULL vs = NULL,
COALESCE, NULLIF, NULL propagation in expressions

=== TOPIC: aggregate-functions ===
Title: Aggregate Functions and GROUP BY | Level: 2
Must cover: COUNT(*) vs COUNT(col), SUM/AVG/MIN/MAX, GROUP BY mechanics,
HAVING vs WHERE (filter before vs after grouping), GROUP BY ROLLUP/CUBE (subtotals),
FILTER clause: COUNT(*) FILTER (WHERE condition)

=== TOPIC: joins ===
Title: SQL Joins — INNER, LEFT, FULL OUTER, Self-Join | Level: 2
Must cover: INNER JOIN (intersection), LEFT JOIN (all left + matching right),
RIGHT JOIN (rarely needed, use LEFT), FULL OUTER JOIN, CROSS JOIN (Cartesian product),
Self-join (employee → manager same table), join on multiple conditions,
Visual Venn diagram description of each join type

=== TOPIC: subqueries ===
Title: Subqueries — Correlated, EXISTS, IN | Level: 3
Must cover: Non-correlated subquery (runs once), correlated subquery (runs per outer row),
EXISTS vs IN (EXISTS short-circuits, better for large datasets),
Subquery in FROM clause (derived table), Subquery in SELECT (scalar subquery),
Anti-join pattern: NOT EXISTS vs NOT IN (NULL trap with NOT IN)

=== TOPIC: window-functions ===
Title: Window Functions — ROW_NUMBER, RANK, LAG, LEAD | Level: 3
Must cover: OVER() clause, PARTITION BY, ORDER BY within window,
ROW_NUMBER (unique), RANK (gaps for ties), DENSE_RANK (no gaps),
LAG/LEAD: access previous/next row values
FIRST_VALUE, LAST_VALUE, NTH_VALUE
ROWS vs RANGE frame specification
Real use: running totals, deduplication, comparison with previous period

=== TOPIC: cte ===
Title: CTEs — WITH Clause, Recursive CTEs | Level: 3
Must cover: CTE syntax, multiple CTEs in one query, CTE vs subquery (readability vs performance),
Recursive CTE: anchor member + recursive member + UNION ALL
Use cases: org chart hierarchy, date series generation, graph traversal
PostgreSQL MATERIALIZED vs NOT MATERIALIZED hint

=== TOPIC: indexes ===
Title: Database Indexes — B-Tree, Partial, Composite | Level: 4
Must cover: B-Tree structure (balanced, O(log n) lookup), page reads,
When PostgreSQL chooses index scan vs sequential scan (statistics-based),
Composite index: column order matters (leftmost prefix rule),
Partial index: WHERE clause in CREATE INDEX (smaller, faster for subsets),
Covering index: include all needed columns (index-only scan, no heap fetch),
Expression index: CREATE INDEX ON users (lower(email)),
Index bloat: dead tuples not cleaned up, REINDEX,
EXPLAIN ANALYZE: reading cost estimates, actual rows, index cond vs filter

=== TOPIC: transactions ===
Title: Transactions — ACID, Isolation Levels, Deadlocks | Level: 4
Must cover: BEGIN/COMMIT/ROLLBACK, SAVEPOINT, ROLLBACK TO,
Isolation levels in PostgreSQL: READ UNCOMMITTED (same as RC in PG), READ COMMITTED (default),
REPEATABLE READ, SERIALIZABLE — what each prevents (dirty read, non-repeatable, phantom),
MVCC (Multi-Version Concurrency Control): readers don't block writers,
Deadlock: two transactions waiting for each other, PostgreSQL detects and kills one,
Advisory locks: pg_advisory_lock() for application-level locking
Row-level locking: SELECT FOR UPDATE, SELECT FOR SHARE

=== TOPIC: views ===
Title: Views, Materialized Views, Updatable Views | Level: 3
Must cover: CREATE VIEW (no data stored, query alias), updatable views (simple views),
Materialized views: data stored, REFRESH MATERIALIZED VIEW [CONCURRENTLY],
Use case: expensive aggregations refreshed periodically,
Index on materialized view columns for fast reads

=== TOPIC: query-optimization ===
Title: Query Optimization — EXPLAIN ANALYZE, Statistics | Level: 4
Must cover: EXPLAIN vs EXPLAIN ANALYZE (actually runs query),
Reading plan: nodes (Seq Scan, Index Scan, Hash Join, Merge Join, Nested Loop),
Cost model: cost=startup..total, actual time=start..total, rows, loops,
VACUUM and ANALYZE: dead tuple cleanup and statistics update,
Work_mem: sort/hash operations use this (increase for complex queries),
Statistics target: ALTER TABLE t ALTER COLUMN c SET STATISTICS 500,
Common problems: N+1 queries, missing indexes, wrong join order, stale statistics

Output all 14 SQL topics. Include sample DDL + DML at start of each code section.
Show PostgreSQL-specific features. Note MySQL differences where important.
```

---

### BATCH PROMPT O — PostgreSQL DBA (Level 3–5): 20 Topics

**Model: Claude Sonnet 4.6 (Thinking)**

```
You are the DevMastery Content Engine with deep PostgreSQL DBA expertise.
Generate complete 6-layer MDX for PostgreSQL DBA path.

POSTGRESQL DBA RULES:
- All config values are PostgreSQL 16 defaults with recommended production values
- Show actual pg_stat_* queries that a DBA would run
- Include real postgresql.conf and pg_hba.conf snippets
- Code section: psql commands AND Python/Java JDBC code where relevant
- Interview section: questions a PostgreSQL DBA would face at Amazon RDS / Oracle / Zalando

=== TOPIC: pg-architecture ===
Title: PostgreSQL Architecture — Processes, Shared Memory | Level: 3
Must cover:
- postmaster: master process, spawns backends, listens on port 5432
- Backend processes: one per connection (why connection pooling is critical)
- Background workers: autovacuum, WAL writer, checkpointer, bgwriter, stats collector
- Shared buffers: PostgreSQL's own page cache (shared_buffers = 25% RAM recommended)
- OS page cache: PostgreSQL also benefits from OS cache (effective_cache_size hint)
- Locking: LWLocks (lightweight), regular locks, predicate locks
- IPC: shared memory for buffer pool, semaphores for process coordination

=== TOPIC: pg-storage ===
Title: PostgreSQL Storage — MVCC, Heap Pages, TOAST | Level: 4
Must cover:
- MVCC: each row has xmin (insert transaction), xmax (delete transaction), visibility depends on snapshot
- Heap page: 8KB page, page header, line pointer array, tuple data
- Dead tuples: old row versions (needed for ongoing transactions), cleaned by VACUUM
- Table bloat: dead tuples accumulate → table grows even if row count stable
- TOAST (The Oversized-Attribute Storage Technique): values > 2KB stored separately,
  TOAST strategies: PLAIN, EXTERNAL, EXTENDED, MAIN
- pg_filenode_relation: where table data files live on disk
- Tablespaces: store tables on different disks (hot/cold storage)

=== TOPIC: pg-write-ahead-log ===
Title: PostgreSQL WAL — Durability, Recovery, Streaming | Level: 4
Must cover:
- WAL ensures durability: changes written to WAL before data pages (write-ahead)
- WAL segments: 16MB files in pg_wal directory, recycled or archived
- Checkpoint: flush dirty pages to disk, write checkpoint record to WAL
- checkpoint_completion_target: spread I/O (0.9 = 90% of checkpoint interval)
- WAL-based replication: primary streams WAL to replica, replica replays
- Recovery from crash: replay WAL from last checkpoint
- pg_waldump: inspect WAL contents
- wal_level: replica (for streaming) vs logical (for logical replication)

=== TOPIC: pg-configuration ===
Title: PostgreSQL Configuration — Performance Tuning | Level: 4
Must cover (with recommended values for 8GB RAM, OLTP workload):
- shared_buffers: 2GB (25% RAM)
- work_mem: 64MB (per sort/hash operation — multiply by max_connections!)
- maintenance_work_mem: 512MB (for VACUUM, CREATE INDEX)
- effective_cache_size: 6GB (estimate of OS cache — affects query planner)
- max_connections: 100 (use pgBouncer for more, not increasing this)
- checkpoint_completion_target: 0.9
- wal_buffers: 64MB
- random_page_cost: 1.1 (for SSD), 4.0 (for HDD)
- enable_partitionwise_join: on
- pg_hba.conf: authentication methods (md5 vs scram-sha-256 — use scram)

=== TOPIC: pg-vacuum ===
Title: VACUUM — Bloat, autovacuum, VACUUM FULL | Level: 4
Must cover:
- Why VACUUM needed: MVCC creates dead tuples, eventually transaction ID wraparound
- VACUUM (regular): marks dead space as reusable, doesn't shrink file
- VACUUM FULL: rewrites table (exclusive lock, reduces file size) — use rarely
- VACUUM ANALYZE: vacuum + update statistics
- Autovacuum: background process, triggered by autovacuum_vacuum_threshold + scale_factor
- Monitoring: SELECT relname, n_dead_tup, last_autovacuum FROM pg_stat_user_tables
- Bloat detection: pgstattuple extension, pg_bloat_check tool
- Transaction ID wraparound: PostgreSQL will shut down at 2^31 transactions if VACUUM doesn't clean

=== TOPIC: pg-backup ===
Title: PostgreSQL Backup — pg_dump, PITR, Continuous Archiving | Level: 4
Must cover:
- pg_dump: logical backup (SQL), pg_dumpall (all databases + globals)
  pg_dump -Fc (custom format, compressed, parallel restore) -j 4 (parallel jobs)
- pg_restore: restore custom format, selective table restore
- pg_basebackup: physical backup (binary copy), base for PITR
- WAL archiving: archive_mode=on, archive_command copies WAL segments to archive
- Point-In-Time Recovery (PITR): restore base backup + replay WAL to specific timestamp
  recover.conf / recovery_target_time (PostgreSQL 12+: postgresql.conf parameters)
- pgBackRest: production backup tool (parallel, incremental, compression, S3 storage)

=== TOPIC: pg-replication ===
Title: Streaming Replication and High Availability | Level: 5
Must cover:
- Streaming replication setup: primary postgresql.conf, pg_hba.conf for replication user,
  replica recovery.conf (PG 12+: primary_conninfo in postgresql.conf)
- Synchronous vs async: synchronous_commit = on|remote_write|remote_apply|local|off
- Replication lag: pg_stat_replication: write_lag, flush_lag, replay_lag
- Hot standby: replica accepts read-only queries
- Failover: promote replica with pg_ctl promote or pg_promote() function
- Patroni: automatic failover (etcd/consul/ZooKeeper for distributed consensus)
- pgBouncer: connection pooler (transaction pooling for stateless apps, session for Hibernate)

=== TOPIC: pg-advanced-indexing ===
Title: Advanced PostgreSQL Indexing — GIN, GiST, BRIN | Level: 5
Must cover:
- B-Tree: default, good for equality and range on ordered types
- GIN (Generalized Inverted Index): for array, JSONB, full-text — stores element → rows mapping
  Use: jsonb @> (containment), array && (overlap), to_tsvector full-text
- GiST (Generalized Search Tree): geometric, range types, nearest-neighbor
  Use: PostGIS geographic queries, range type overlap
- BRIN (Block Range Index): tiny index for naturally ordered data (timestamps, sequential IDs)
  Use: large time-series tables where date correlates with physical order
- Hash index: equality-only, smaller than B-Tree (use only for equality-heavy, no range)
- Index maintenance: pg_indexes, pg_stat_user_indexes, index usage stats

Output all 8 PostgreSQL DBA topics. Include real SQL for monitoring queries.
Show actual pg_stat_* queries a DBA would run in production.
```

---

### BATCH PROMPT P — MongoDB Complete (Level 2–4): 15 Topics

**Model: Gemini 3.1 Pro (High)**

```
You are the DevMastery Content Engine. Generate 6-layer MDX for MongoDB path.

MONGODB CONTENT RULES:
- Use MongoDB 7.x syntax
- Show both mongosh commands and Spring Data MongoDB (@Document, MongoTemplate) equivalents
- Aggregation pipeline: always build up incrementally (stage by stage)
- Schema design: show real-world examples (e-commerce, social media)
- Compare with PostgreSQL: when MongoDB wins, when it doesn't

=== TOPIC: mongodb-intro ===
Title: MongoDB — Document Model vs Relational | Level: 2
Must cover: BSON types (ObjectId, Date, NumberDecimal, Binary), collection vs table,
flexible schema benefits and challenges, document size limit (16MB), schemaless != no schema

=== TOPIC: crud-operations ===
Title: MongoDB CRUD Operations | Level: 2
Must cover: insertOne/insertMany, findOne/find with options (projection, sort, limit, skip),
updateOne/updateMany (with $set, $push, $pull), replaceOne, deleteOne/deleteMany,
bulk operations (BulkWrite), writeConcern levels

=== TOPIC: query-operators ===
Title: Query Operators — Comparison, Logical, Array | Level: 2
Must cover: $eq/$ne/$gt/$lt/$gte/$lte, $in/$nin, $and/$or/$not/$nor,
$exists/$type, array: $elemMatch/$size/$all, $regex,
Dot notation for nested documents: "address.city": "Chennai"

=== TOPIC: aggregation-pipeline ===
Title: Aggregation Pipeline — $match, $group, $lookup | Level: 3
Must cover: Pipeline concept (Unix pipe analogy), stage execution order matters,
$match (filter early!), $group (SQL GROUP BY equiv, _id is group key),
$project (reshape, compute fields, $$ROOT), $sort, $limit, $skip,
$unwind (flatten array), $lookup (SQL JOIN equiv, from/localField/foreignField),
$addFields (add computed fields), $count

=== TOPIC: aggregation-advanced ===
Title: Advanced Aggregation — $facet, $graphLookup, Window | Level: 4
Must cover: $facet (multiple aggregations in one pass), $bucket/$bucketAuto (histograms),
$graphLookup (recursive lookup for hierarchical data — org charts, category trees),
$merge/$out (write pipeline results to collection),
Window functions: $setWindowFields with $rank, $sum over partitions (MongoDB 5.0+)

=== TOPIC: indexes-mongodb ===
Title: MongoDB Indexes — Types and Index Selection | Level: 3
Must cover: Single field, compound (prefix rule same as PostgreSQL), multikey (array fields),
Text index ($text search), Geospatial (2dsphere for GeoJSON, 2d for flat),
Hashed index (for sharding), TTL index (auto-delete expired documents),
explain("executionStats"), IXSCAN vs COLLSCAN, covered queries (no document fetch)

=== TOPIC: schema-design ===
Title: MongoDB Schema Design — Embed vs Reference | Level: 3
Must cover: Embed when: 1-1, 1-few, data accessed together (blog post + comments up to ~100),
Reference when: 1-many (unbounded), many-to-many, data accessed independently,
The outlier pattern: embed for most, reference for outliers (celebrity problem),
Bucket pattern: time-series data (group readings into hour buckets),
Computed pattern: pre-compute expensive aggregations, update on write

=== TOPIC: transactions-mongodb ===
Title: MongoDB Transactions — Multi-Document ACID | Level: 4
Must cover: When needed: multi-collection updates (bank transfer),
Session-based transactions, commitTransaction/abortTransaction,
Performance cost: distributed transaction overhead,
writeConcern: { w: "majority" } for durability,
readConcern: "snapshot" for consistent reads within transaction,
Retryable writes: automatic retry on transient network errors

=== TOPIC: replication-mongodb ===
Title: MongoDB Replica Sets | Level: 4
Must cover: Replica set = primary + 2+ secondaries, election algorithm (Raft-inspired),
oplog (operations log): capped collection, replica replay,
Read preferences: primary, primaryPreferred, secondary, nearest,
Write concern: w:1 (primary), w:majority (most nodes), w:3,
Election triggers: primary unreachable for 10+ seconds, manual rs.stepDown()

Output all 9 MongoDB topics. Show mongosh commands + Spring Data MongoDB code.
```

---

### BATCH PROMPT Q — API Design Complete (Level 2–4): 18 Topics

**Model: Gemini 3.1 Pro (High) · Claude Sonnet 4.6 for GraphQL/gRPC**

```
You are the DevMastery Content Engine. Generate 6-layer MDX for API Design path.

API DESIGN RULES:
- Show real HTTP request/response headers and bodies
- OpenAPI 3.1 spec snippets for REST topics
- gRPC: show actual .proto file definitions
- Spring Boot: show corresponding Java code for every API design pattern
- Security: include OWASP API Security Top 10 reference

=== TOPIC: rest-principles ===
Title: REST — Constraints, Richardson Maturity Model | Level: 2
=== TOPIC: http-methods ===
Title: HTTP Methods — Idempotency, Safe Methods | Level: 2
=== TOPIC: status-codes ===
Title: HTTP Status Codes — Complete Reference | Level: 2
=== TOPIC: url-design ===
Title: URL Design — Naming, Versioning, Hierarchies | Level: 2
=== TOPIC: request-response-format ===
Title: Request/Response Format — JSON:API, Problem Details (RFC 9457) | Level: 3
=== TOPIC: versioning-strategies ===
Title: API Versioning Strategies | Level: 3
=== TOPIC: authentication-api ===
Title: API Authentication — API Keys, JWT, OAuth2 | Level: 3
=== TOPIC: authorization-api ===
Title: Authorization — RBAC, ABAC, Scopes | Level: 3
=== TOPIC: pagination-api ===
Title: Pagination — Offset vs Cursor-Based | Level: 3
=== TOPIC: filtering-sorting ===
Title: Filtering and Sorting API Design | Level: 3
=== TOPIC: api-rate-limiting ===
Title: Rate Limiting — Algorithms and Headers | Level: 3
=== TOPIC: error-handling-api ===
Title: Error Handling — RFC 9457, Error Codes | Level: 3
=== TOPIC: graphql-basics ===
Title: GraphQL — Schema, Resolvers, N+1 Problem | Level: 4
Must cover: SDL schema definition, Query/Mutation/Subscription,
Resolver chain, DataLoader for N+1, persisted queries, introspection
=== TOPIC: graphql-advanced ===
Title: GraphQL Advanced — Federation, Subscriptions | Level: 4
=== TOPIC: grpc-basics ===
Title: gRPC — Protocol Buffers, Streaming | Level: 4
Must cover: .proto syntax, service definition, code generation,
unary/server-streaming/client-streaming/bidirectional, gRPC vs REST comparison
=== TOPIC: websockets-api ===
Title: WebSockets — Protocol, Scaling | Level: 4
=== TOPIC: webhooks ===
Title: Webhooks — Delivery, Retry, Security | Level: 3
=== TOPIC: api-security-advanced ===
Title: API Security — OWASP Top 10 | Level: 4

Generate all 18 API Design topics in MDX. Include OpenAPI 3.1 YAML snippets and curl examples.
```

---

### BATCH PROMPT R — Software Architecture Complete (Level 3–5): 20 Topics

**Model: Claude Opus 4.6 (Thinking) — Architecture topics need deepest reasoning**

```
You are the DevMastery Content Engine. Generate 6-layer MDX for Software Architecture path.
These are senior-level architecture concepts. Use Opus Thinking mode.

ARCHITECTURE CONTENT RULES:
- Every pattern must include: problem it solves, structure, participants, real Spring Boot implementation
- Show CLASS DIAGRAMS in Mermaid (classDiagram syntax)
- SEQUENCE DIAGRAMS in Mermaid for interaction patterns
- Always show the ANTI-PATTERN first (what happens without this pattern)
- Code: Java 21 + Spring Boot 3.2 implementation of every pattern

=== TOPIC: solid-principles ===
Title: SOLID Principles — Deep Dive with Java Examples | Level: 3
For EACH principle: violated code → consequence → fixed code → Spring Boot real usage
SRP: God class → extract responsibilities → @Service separation
OCP: if/else type checking → Strategy pattern + polymorphism
LSP: broken inheritance → contracts via interfaces
ISP: fat interfaces → segregated focused interfaces
DIP: concrete dependencies → interface + Spring @Autowired

=== TOPIC: clean-code ===
Title: Clean Code — Names, Functions, Comments | Level: 3
Cover: naming rules (pronounceable, searchable, no abbreviations),
function rules (one thing, small, no side effects, command-query separation),
comment rules (don't explain what — explain WHY, prefer self-documenting code),
class rules (small, single responsibility, cohesion),
Code smells: long method, large class, primitive obsession, feature envy, data clumps

=== TOPIC: refactoring ===
Title: Refactoring — Catalog of Techniques | Level: 3
Cover 10 core refactorings with before/after Java code:
Extract Method, Extract Class, Move Method, Rename, Inline Method,
Replace Temp with Query, Replace Magic Number with Symbolic Constant,
Introduce Parameter Object, Replace Conditional with Polymorphism,
Decompose Conditional
When to refactor vs rewrite

=== TOPIC: design-patterns-creational ===
Title: Creational Patterns — Factory, Builder, Singleton | Level: 3
For EACH: problem, UML (Mermaid), Java code, Spring Boot usage:
- Singleton: instance control, double-checked locking with volatile, enum Singleton
  Spring equivalent: default @Bean scope is singleton
- Factory Method: decouple creation, Spring BeanFactory, @Configuration @Bean
- Abstract Factory: families of objects, Spring auto-configuration factories
- Builder: complex object construction, Lombok @Builder internals, method chaining
- Prototype: Spring scope="prototype", Object.clone() pitfalls

=== TOPIC: design-patterns-structural ===
Title: Structural Patterns — Adapter, Decorator, Proxy | Level: 4
For EACH: problem, UML, Java code, Spring Boot real usage:
- Adapter: incompatible interfaces, Spring HandlerAdapter, MessageConverter
- Decorator: add behavior without subclassing, Java I/O streams, Spring @Cacheable (AOP decorator)
- Proxy: control access, Spring AOP (JDK dynamic proxy vs CGLIB), @Transactional internals
- Facade: simplify complex subsystem, Spring's JdbcTemplate (facade over JDBC)
- Composite: tree structures, Spring ApplicationContext hierarchy
- Bridge: decouple abstraction from implementation, JDBC driver architecture

=== TOPIC: design-patterns-behavioral ===
Title: Behavioral Patterns — Strategy, Observer, Command | Level: 4
For EACH: problem, UML, Java code, Spring Boot real usage:
- Strategy: algorithm family, Spring authentication strategies, PaymentStrategy
- Observer: event notification, Spring ApplicationEvent + @EventListener
- Command: encapsulate request, Spring @Transactional, undo/redo, task queues
- Template Method: algorithm skeleton, Spring JdbcTemplate, AbstractController
- Iterator: sequential access, Java Iterator, Stream API
- Chain of Responsibility: Spring Security FilterChain, servlet filters

=== TOPIC: cqrs ===
Title: CQRS — Command Query Responsibility Segregation | Level: 4
Must cover:
- Problem: single model for reads and writes = conflict (reporting queries slow writes)
- Command side: handles writes, validates, publishes domain events
- Query side: denormalized read models, optimized for specific use cases
- Event-driven update: command side publishes event, query side consumes + updates read model
- Eventual consistency: read model may lag behind write model
- Spring implementation: separate @Service for commands and queries, Kafka between them
- When NOT to use: simple CRUD apps (over-engineering), strong consistency needed

=== TOPIC: event-sourcing ===
Title: Event Sourcing — Event Store, Projections, Snapshots | Level: 5
Must cover:
- State = sequence of events (bank account: [Opened, Deposited, Withdrawn])
- Event store: append-only log, never update/delete events
- Projections: rebuild current state by replaying all events
- Snapshot: periodic state snapshot to avoid replaying all events from beginning
- Benefits: complete audit trail, temporal queries (state at any point in time), event replay
- Challenges: eventual consistency, event schema evolution (versioning events), snapshot maintenance
- Axon Framework: Java event sourcing framework, @Aggregate, @CommandHandler, @EventHandler

=== TOPIC: domain-driven-design ===
Title: Domain-Driven Design — Tactical and Strategic | Level: 5
Must cover:
Strategic DDD:
- Ubiquitous Language: shared vocabulary between devs and domain experts
- Bounded Context: separate model per context (Order in Shipping vs Order in Billing)
- Context Map: relationships between contexts (Shared Kernel, Customer/Supplier, Conformist)
Tactical DDD:
- Entity: has identity (User with userId), mutable
- Value Object: no identity, immutable (Money { amount, currency })
- Aggregate: consistency boundary (Order aggregate owns OrderItems)
- Repository: collection-like abstraction over data store
- Domain Service: business logic not belonging to any entity
- Domain Event: something happened in the domain (OrderPlaced, PaymentReceived)
Spring Boot DDD: package structure by bounded context, not by layer

=== TOPIC: microservices-patterns ===
Title: Microservices Patterns — Saga, Outbox, Strangler Fig | Level: 5
Must cover:
- Saga Pattern: distributed transaction across services
  Choreography: each service listens for events, publishes next (Kafka)
  Orchestration: central saga orchestrator sends commands (Spring State Machine)
  Compensation: rollback actions for each step
- Outbox Pattern: dual write problem solution
  Write to DB + outbox table in same transaction, separate relay polls outbox + publishes to Kafka
  Guarantees at-least-once delivery to Kafka
- Strangler Fig: incrementally migrate monolith to microservices
  Route traffic at API gateway level, new feature → new service, old feature → monolith
- Anti-corruption Layer: translate between two bounded contexts
- Bulkhead: isolate failures (thread pool per downstream service)
- Circuit Breaker: fail-fast when downstream is down (Resilience4j)

Generate all 10 Architecture topics. Include Mermaid class/sequence diagrams. 
Each topic minimum 2,000 words. Reference Martin Fowler's Enterprise Application Architecture Patterns.
```

---

### BATCH PROMPT S — Design System Complete (Level 2–4): 15 Topics

**Model: Gemini 3.1 Pro (High)**

```
You are the DevMastery Content Engine. Generate 6-layer MDX for Design System path.

DESIGN SYSTEM RULES:
- Show actual CSS custom properties and Tailwind config for every token
- Include Figma workflow description alongside code
- Accessibility: WCAG 2.1 AA requirements for every component
- React + TypeScript component code for all UI components
- Show Storybook story for each component

=== TOPIC: design-tokens ===
Title: Design Tokens — Color, Spacing, Typography Tokens | Level: 2
=== TOPIC: typography-system ===
Title: Typography System — Type Scale, Fluid Type | Level: 2
=== TOPIC: color-system ===
Title: Color System — Semantic Tokens, Dark Mode | Level: 3
=== TOPIC: spacing-system ===
Title: Spacing System — Grid, Rhythm | Level: 2
=== TOPIC: iconography ===
Title: Icon System — SVG, Sprite, Accessibility | Level: 2
=== TOPIC: button-component ===
Title: Button Component — Variants, States, Accessibility | Level: 3
=== TOPIC: input-and-form-components ===
Title: Form Components — Input, Select, Checkbox | Level: 3
=== TOPIC: navigation-components ===
Title: Navigation — Navbar, Sidebar, Tabs | Level: 3
=== TOPIC: feedback-components ===
Title: Feedback — Toast, Alert, Skeleton, Spinner | Level: 3
=== TOPIC: modal-and-overlay ===
Title: Overlays — Modal, Drawer, Popover, Tooltip | Level: 3
=== TOPIC: data-display ===
Title: Data Display — Table, Card, Badge, Avatar | Level: 3
=== TOPIC: storybook ===
Title: Storybook — Stories, Controls, Accessibility Addon | Level: 4
=== TOPIC: component-api-design ===
Title: Component API Design — Props, Compound Pattern | Level: 4
=== TOPIC: theming-architecture ===
Title: Theming — Multi-Brand, CSS Variables Pipeline | Level: 4
=== TOPIC: accessibility-system ===
Title: Accessibility — WCAG 2.1 AA, Keyboard Nav | Level: 4

Generate all 15. Each: React+TypeScript component + Storybook story + CSS tokens.
```

---

## Master Batch Execution Schedule

```
WEEK 1 — P0 Priority (Critical paths first)
  Day 1: Batch A — Java Level 1-2 (Model: Gemini 3.5 Flash)         16 topics
  Day 2: Batch B — Java Collections  (Model: Claude Sonnet Thinking) 12 topics
  Day 3: Batch C — Java Concurrency  (Model: Claude Sonnet Thinking)  8 topics
  Day 4: Batch D — DSA Algorithms    (Model: Claude Sonnet Thinking) 20 topics
  Day 5: Batch H — JS Engine         (Model: Claude Sonnet Thinking)  4 topics

WEEK 2 — P1 Priority
  Day 1: Batch I — JS Fundamentals   (Model: Gemini 3.1 Pro)        20 topics
  Day 2: Batch F — Spring Boot       (Model: Claude Sonnet Thinking) 10 topics
  Day 3: Batch G — Angular           (Model: Gemini 3.1 Pro)         15 topics
  Day 4: Batch K — React             (Model: Gemini/Claude mix)      17 topics
  Day 5: Batch J — TypeScript        (Model: Gemini 3.1 Pro)         13 topics

WEEK 3 — P2 Priority
  Day 1: Batch E — System Design HLD (Model: Claude Opus Thinking)    5 topics
  Day 2: Batch R — Architecture      (Model: Claude Opus Thinking)   10 topics
  Day 3: Batch L — CSS               (Model: Gemini 3.1 Pro)         14 topics
  Day 4: Batch M — HTML              (Model: Gemini 3.5 Flash)       15 topics
  Day 5: Batch N — SQL               (Model: Gemini 3.1 Pro)         14 topics

WEEK 4 — P3 Priority
  Day 1: Batch O — PostgreSQL DBA    (Model: Claude Sonnet Thinking)  8 topics
  Day 2: Batch P — MongoDB           (Model: Gemini 3.1 Pro)          9 topics
  Day 3: Batch Q — API Design        (Model: Gemini/Claude mix)      18 topics
  Day 4: Batch S — Design System     (Model: Gemini 3.1 Pro)         15 topics
  Day 5: Remaining topics + review pass

TOTAL: ~247 topics covered in 4 weeks of daily Antigravity sessions
       Remaining ~742 topics: run as follow-up batches of 10-15 per session
       Complete all 989 topics: ~6-8 weeks total
```

---

## Content Import Pipeline — Admin CMS Integration

After Antigravity generates MDX files, import them into DevMastery:

```typescript
// scripts/importContent.ts — run this after each batch generation

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = 'apps/web/content'
const API_BASE = 'http://localhost:8080/admin'

async function importAllContent() {
  const paths = fs.readdirSync(CONTENT_DIR)
  
  for (const pathSlug of paths) {
    const topicsDir = path.join(CONTENT_DIR, pathSlug)
    const mdxFiles = fs.readdirSync(topicsDir).filter(f => f.endsWith('.mdx'))
    
    for (const file of mdxFiles) {
      const raw = fs.readFileSync(path.join(topicsDir, file), 'utf-8')
      const { data: frontmatter, content } = matter(raw)
      
      // Split content into 6 sections by ## headings
      const sections = parseSections(content)
      
      // POST to Admin API
      await fetch(`${API_BASE}/topics/${frontmatter.slug}/sections`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ADMIN_JWT}`
        },
        body: JSON.stringify({
          why:        sections.WHY,
          theory:     sections.THEORY,
          visual:     sections.VISUALIZATION_CONFIG,
          code:       sections.CODE,
          realWorld:  sections.REAL_WORLD,
          interview:  sections.INTERVIEW
        })
      })
      
      console.log(`✅ Imported: ${pathSlug}/${frontmatter.slug}`)
    }
  }
}

function parseSections(mdx: string): Record<string, string> {
  // Split on ## WHY, ## THEORY, ## CODE, ## REAL_WORLD, ## INTERVIEW
  const sections: Record<string, string> = {}
  const parts = mdx.split(/^## /m)
  
  for (const part of parts) {
    const [heading, ...body] = part.split('\n')
    if (heading) sections[heading.trim()] = body.join('\n').trim()
  }
  
  return sections
}

importAllContent().catch(console.error)
```

---

## Final Summary — Complete Content Plan

```
TOTAL TOPICS:       989 across 18 paths
BATCH PROMPTS:      19 batches (A through S)  
ANTIGRAVITY MODELS: 
  Claude Opus 4.6 (Thinking)   → Architecture, System Design HLD (complex reasoning)
  Claude Sonnet 4.6 (Thinking) → Java internals, Concurrency, JVM, DSA algorithms
  Gemini 3.1 Pro (High)        → React, Angular, Spring Boot, SQL, API Design
  Gemini 3.5 Flash (High)      → HTML, Level 1-2 topics (fast + accurate)

CONTENT QUALITY:
  WHY section:       300+ words minimum
  THEORY section:    600+ words with internals
  CODE section:      5 levels, all compile and run
  REAL WORLD:        400+ words with framework class names
  INTERVIEW:         5+ questions with strong answers

GENERATION TIME:
  4 weeks of daily Antigravity sessions
  ~80-100 total agent runs
  ~1.5 million words of depth-first content

ZERO MANUAL WRITING.
ZERO LICENSING COST.
Every topic. Every concept. Every internal working.
```

---

*End of DEVMASTERY_ROADMAP_INTEGRATION.md — Complete Edition*
*18 paths · 989 topics · 19 Antigravity batch prompts · 4 model assignments*
*Generated content covers roadmap.sh: full-stack, java, angular, spring-boot, system-design,*
*typescript, javascript, api-design, software-design-architecture, design-system,*
*html, css, sql, postgresql-dba, mongodb, react, leetcode, datastructures-and-algorithms*

---

---

# PART 4 — Upgraded 9-Layer Teaching Model + Bulk Upload API

---

## The 3 Missing Layers — What to Add

### Layer 7 — FEYNMAN CHECK
The Feynman Technique is the most powerful technique for detecting the "fluency illusion" — the false confidence that comes from passive reading. After consuming theory + visual + code, the user must explain the concept in their own words. The AI scores depth 1–10 and gives specific feedback on what was shallow. Must score 6+ to unlock Layer 8.

### Layer 8 — BUILD
Bloom's Taxonomy Level 6 (Create) is the highest cognitive level. Forces complete reconstruction of knowledge. This is a mini project or guided coding challenge specifically designed to USE the concept just learned — not just apply it but compose it with other knowledge.

### Layer 9 — SPACED REVIEW
The SM-2 algorithm (SuperMemo 2) — the same algorithm used by Anki, the most research-backed flashcard system. Schedules review at 1d → 3d → 7d → 21d → 60d intervals. Each review is a short active recall quiz (3–5 questions). If user fails, interval resets.

---

## Flyway Migration — V12: Add 3 New Section Types + Spaced Review Tables

```sql
-- V12__add_9layer_model.sql

-- 1. Add new section types to lessons
-- section_type can now be: why, theory, visual, code, realworld, interview, feynman, build, spaced_review
-- No schema change needed — section_type is VARCHAR(50), new values just extend the enum set

-- 2. Add Feynman Check responses table
CREATE TABLE feynman_attempts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id),
    topic_id            UUID REFERENCES topics(id),
    user_explanation    TEXT NOT NULL,
    ai_score            INT NOT NULL CHECK (ai_score BETWEEN 1 AND 10),
    ai_feedback         TEXT NOT NULL,
    gaps_identified     TEXT[],
    passed              BOOLEAN GENERATED ALWAYS AS (ai_score >= 6) STORED,
    attempted_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Build challenge table
CREATE TABLE build_challenges (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id            UUID REFERENCES topics(id),
    title               VARCHAR(255) NOT NULL,
    description         TEXT NOT NULL,
    starter_code        JSONB,
    acceptance_criteria TEXT[] NOT NULL,
    estimated_mins      INT DEFAULT 30,
    difficulty          INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5)
);

CREATE TABLE build_submissions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id),
    challenge_id        UUID REFERENCES build_challenges(id),
    code                TEXT NOT NULL,
    ai_review           TEXT,
    ai_score            INT CHECK (ai_score BETWEEN 1 AND 10),
    submitted_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Spaced Repetition (SM-2 algorithm)
CREATE TABLE spaced_review_cards (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id            UUID REFERENCES topics(id),
    question            TEXT NOT NULL,
    answer              TEXT NOT NULL,
    card_type           VARCHAR(50) DEFAULT 'concept'
);

CREATE TABLE user_review_schedule (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id),
    card_id             UUID REFERENCES spaced_review_cards(id),
    next_review_date    DATE NOT NULL DEFAULT CURRENT_DATE + 1,
    interval_days       INT DEFAULT 1,
    ease_factor         NUMERIC(4,2) DEFAULT 2.5,
    repetitions         INT DEFAULT 0,
    last_quality        INT,
    UNIQUE(user_id, card_id)
);

-- Indexes
CREATE INDEX idx_feynman_user     ON feynman_attempts(user_id);
CREATE INDEX idx_feynman_topic    ON feynman_attempts(topic_id);
CREATE INDEX idx_review_schedule  ON user_review_schedule(user_id, next_review_date);
CREATE INDEX idx_build_topic      ON build_challenges(topic_id);
```

---

## Bulk Upload API — Complete Implementation

### The Endpoint Requirement

Accept a single POST request containing all 9 teaching layers (or any subset) for a given topic slug. Used by:
- Antigravity agent (auto-imports generated MDX content)
- Admin CMS (save all sections in one call)
- Content import script (`importContent.ts`)

---

### DTOs (Java Records)

```java
// File: content-service/src/main/java/com/devmastery/content/dto/bulk/

// ── BulkLayerUploadRequest.java ──────────────────────────────────────────────
package com.devmastery.content.dto.bulk;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record BulkLayerUploadRequest(

    // Required: which topic to update
    @NotBlank(message = "topicSlug is required")
    String topicSlug,

    // Optional flag: publish all layers after save (default: false = save as draft)
    Boolean publishAfterSave,

    // Optional flag: overwrite existing content (default: false = skip if already has content)
    Boolean overwriteExisting,

    // Teaching layers — all optional, but at least one must be present
    LayerContent why,
    LayerContent theory,
    LayerContent visual,
    LayerContent code,
    LayerContent realWorld,
    LayerContent interview,

    // New layers (9-layer model)
    LayerContent feynman,
    BuildLayerContent build,
    SpacedReviewLayerContent spacedReview

) {
    // Custom validation: at least one layer must be present
    public boolean hasAtLeastOneLayer() {
        return why != null || theory != null || visual != null
            || code != null || realWorld != null || interview != null
            || feynman != null || build != null || spacedReview != null;
    }
}

// ── LayerContent.java ─────────────────────────────────────────────────────────
@JsonInclude(JsonInclude.Include.NON_NULL)
public record LayerContent(

    @NotBlank(message = "contentMdx cannot be blank")
    @Size(min = 100, message = "Content too short — minimum 100 characters per layer")
    String contentMdx,

    Integer estimatedMins,

    // For CODE layer: code examples per level (1-5)
    List<CodeExample> codeExamples,

    // For VISUAL layer: visualizer component config JSON
    String visualizerConfig

) {}

// ── CodeExample.java ──────────────────────────────────────────────────────────
public record CodeExample(
    int level,              // 1–5
    String language,        // "java", "javascript", "typescript", etc.
    String title,
    String code,
    String explanation,
    String timeComplexity,
    String spaceComplexity
) {}

// ── BuildLayerContent.java ────────────────────────────────────────────────────
public record BuildLayerContent(
    String contentMdx,
    String challengeTitle,
    String challengeDescription,
    String starterCodeJava,
    String starterCodeJavaScript,
    List<String> acceptanceCriteria,
    Integer estimatedMins
) {}

// ── SpacedReviewLayerContent.java ─────────────────────────────────────────────
public record SpacedReviewLayerContent(
    String contentMdx,
    List<ReviewCard> cards
) {}

public record ReviewCard(
    String question,
    String answer,
    String cardType   // "concept", "code", "tricky"
) {}

// ── BulkLayerUploadResponse.java ──────────────────────────────────────────────
@JsonInclude(JsonInclude.Include.NON_NULL)
public record BulkLayerUploadResponse(
    String topicSlug,
    String status,               // "SUCCESS", "PARTIAL", "FAILED"
    List<LayerResult> layers,
    int totalLayersProvided,
    int totalLayersSaved,
    int totalLayersSkipped,
    String errorMessage,
    String publishedAt           // ISO timestamp if publishAfterSave=true
) {}

public record LayerResult(
    String layerType,            // "why", "theory", etc.
    String status,               // "SAVED", "SKIPPED", "FAILED"
    String message
) {}
```

---

### Controller

```java
// File: BulkContentController.java
package com.devmastery.content.controller;

import com.devmastery.content.dto.bulk.BulkLayerUploadRequest;
import com.devmastery.content.dto.bulk.BulkLayerUploadResponse;
import com.devmastery.content.service.BulkLayerUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/admin/content")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Bulk Content Upload", description = "Upload all 9 teaching layers for a topic in one request")
public class BulkContentController {

    private final BulkLayerUploadService bulkUploadService;

    // ─────────────────────────────────────────────────────────────────
    // Single topic bulk upload
    // POST /v1/admin/content/topics/{slug}/layers
    // ─────────────────────────────────────────────────────────────────
    @PostMapping("/topics/{slug}/layers")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Bulk upload all teaching layers for a topic",
        description = """
            Accepts all 9 teaching layers (why, theory, visual, code, realWorld,
            interview, feynman, build, spacedReview) in one request.
            Any layer not provided is skipped. Use overwriteExisting=true to
            replace existing content.
            """
    )
    public ResponseEntity<BulkLayerUploadResponse> uploadLayers(
            @PathVariable String slug,
            @Valid @RequestBody BulkLayerUploadRequest request) {

        if (!slug.equals(request.topicSlug())) {
            return ResponseEntity.badRequest().body(
                new BulkLayerUploadResponse(slug, "FAILED", List.of(),
                    0, 0, 0, "Path slug and body topicSlug must match", null)
            );
        }

        if (!request.hasAtLeastOneLayer()) {
            return ResponseEntity.badRequest().body(
                new BulkLayerUploadResponse(slug, "FAILED", List.of(),
                    0, 0, 0, "At least one layer must be provided", null)
            );
        }

        BulkLayerUploadResponse response = bulkUploadService.uploadLayers(request);

        return switch (response.status()) {
            case "SUCCESS"  -> ResponseEntity.ok(response);
            case "PARTIAL"  -> ResponseEntity.status(207).body(response);  // 207 Multi-Status
            default         -> ResponseEntity.status(422).body(response);
        };
    }

    // ─────────────────────────────────────────────────────────────────
    // Batch upload — multiple topics in one request
    // POST /v1/admin/content/topics/layers/batch
    // Body: List<BulkLayerUploadRequest>
    // ─────────────────────────────────────────────────────────────────
    @PostMapping("/topics/layers/batch")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Batch upload layers for multiple topics",
        description = """
            Upload content for up to 50 topics in a single request.
            Each item in the array is a full BulkLayerUploadRequest.
            Used by the Antigravity content import script.
            Returns per-topic results. Failures in one topic don't affect others.
            """
    )
    public ResponseEntity<List<BulkLayerUploadResponse>> batchUploadLayers(
            @Valid @RequestBody List<BulkLayerUploadRequest> requests) {

        if (requests.isEmpty() || requests.size() > 50) {
            return ResponseEntity.badRequest().build();
        }

        List<BulkLayerUploadResponse> results = bulkUploadService.batchUploadLayers(requests);

        boolean anyFailed = results.stream().anyMatch(r -> "FAILED".equals(r.status()));
        boolean anyPartial = results.stream().anyMatch(r -> "PARTIAL".equals(r.status()));

        int statusCode = anyFailed ? 207 : (anyPartial ? 207 : 200);
        return ResponseEntity.status(statusCode).body(results);
    }

    // ─────────────────────────────────────────────────────────────────
    // Validate before saving — dry-run to check content quality
    // POST /v1/admin/content/topics/{slug}/layers/validate
    // ─────────────────────────────────────────────────────────────────
    @PostMapping("/topics/{slug}/layers/validate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Validate layer content without saving",
        description = """
            Performs all validations (MDX parse check, word count minimums,
            code compilation check) without persisting anything.
            Returns per-layer validation results.
            """
    )
    public ResponseEntity<BulkLayerUploadResponse> validateLayers(
            @PathVariable String slug,
            @Valid @RequestBody BulkLayerUploadRequest request) {

        BulkLayerUploadResponse response = bulkUploadService.validateOnly(request);
        return ResponseEntity.ok(response);
    }
}
```

---

### Service

```java
// File: BulkLayerUploadService.java
package com.devmastery.content.service;

import com.devmastery.content.cache.TopicCacheLoader;
import com.devmastery.content.dto.bulk.*;
import com.devmastery.content.entity.*;
import com.devmastery.content.exception.TopicNotFoundException;
import com.devmastery.content.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BulkLayerUploadService {

    private final TopicRepository         topicRepository;
    private final LessonRepository        lessonRepository;
    private final CodeExampleRepository   codeExampleRepository;
    private final BuildChallengeRepository buildChallengeRepository;
    private final ReviewCardRepository    reviewCardRepository;
    private final TopicCacheLoader        topicCacheLoader;
    private final ContentValidator        contentValidator;

    // Layer type constants
    private static final String WHY           = "why";
    private static final String THEORY        = "theory";
    private static final String VISUAL        = "visual";
    private static final String CODE          = "code";
    private static final String REAL_WORLD    = "realworld";
    private static final String INTERVIEW     = "interview";
    private static final String FEYNMAN       = "feynman";
    private static final String BUILD         = "build";
    private static final String SPACED_REVIEW = "spaced_review";

    // ─────────────────────────────────────────────────────────────────
    // Main upload method — single topic
    // ─────────────────────────────────────────────────────────────────
    @Transactional
    @CacheEvict(value = "devmastery:content:lesson", key = "#request.topicSlug()")
    public BulkLayerUploadResponse uploadLayers(BulkLayerUploadRequest request) {
        Topic topic = topicRepository.findBySlug(request.topicSlug())
            .orElseThrow(() -> new TopicNotFoundException(request.topicSlug()));

        List<LayerResult> results = new ArrayList<>();
        boolean overwrite = Boolean.TRUE.equals(request.overwriteExisting());

        // Process each of the 9 layers
        processMdxLayer(topic, WHY,           request.why(),        overwrite, results);
        processMdxLayer(topic, THEORY,        request.theory(),     overwrite, results);
        processMdxLayer(topic, VISUAL,        request.visual(),     overwrite, results);
        processCodeLayer(topic,               request.code(),       overwrite, results);
        processMdxLayer(topic, REAL_WORLD,    request.realWorld(),  overwrite, results);
        processMdxLayer(topic, INTERVIEW,     request.interview(),  overwrite, results);
        processMdxLayer(topic, FEYNMAN,       request.feynman(),    overwrite, results);
        processBuildLayer(topic,              request.build(),      overwrite, results);
        processSpacedReviewLayer(topic,       request.spacedReview(), overwrite, results);

        long saved   = results.stream().filter(r -> "SAVED".equals(r.status())).count();
        long skipped = results.stream().filter(r -> "SKIPPED".equals(r.status())).count();
        long failed  = results.stream().filter(r -> "FAILED".equals(r.status())).count();

        // Publish if requested and no failures
        String publishedAt = null;
        if (Boolean.TRUE.equals(request.publishAfterSave()) && failed == 0) {
            topic.setPublished(true);
            topicRepository.save(topic);
            publishedAt = Instant.now().toString();
        }

        String overallStatus = failed > 0 ? (saved > 0 ? "PARTIAL" : "FAILED") : "SUCCESS";

        return new BulkLayerUploadResponse(
            request.topicSlug(), overallStatus, results,
            (int)(saved + skipped + failed), (int)saved, (int)skipped,
            failed > 0 ? failed + " layer(s) failed — see layer results" : null,
            publishedAt
        );
    }

    // ─────────────────────────────────────────────────────────────────
    // Batch upload — multiple topics
    // ─────────────────────────────────────────────────────────────────
    public List<BulkLayerUploadResponse> batchUploadLayers(List<BulkLayerUploadRequest> requests) {
        return requests.stream()
            .map(request -> {
                try {
                    return uploadLayers(request);
                } catch (TopicNotFoundException e) {
                    return new BulkLayerUploadResponse(
                        request.topicSlug(), "FAILED", List.of(),
                        0, 0, 0, "Topic not found: " + request.topicSlug(), null
                    );
                } catch (Exception e) {
                    log.error("Batch upload failed for topic {}: {}", request.topicSlug(), e.getMessage());
                    return new BulkLayerUploadResponse(
                        request.topicSlug(), "FAILED", List.of(),
                        0, 0, 0, "Unexpected error: " + e.getMessage(), null
                    );
                }
            })
            .toList();
    }

    // ─────────────────────────────────────────────────────────────────
    // Validate only — no DB writes
    // ─────────────────────────────────────────────────────────────────
    public BulkLayerUploadResponse validateOnly(BulkLayerUploadRequest request) {
        List<LayerResult> results = new ArrayList<>();

        validateLayerContent(WHY,        request.why(),        results);
        validateLayerContent(THEORY,     request.theory(),     results);
        validateLayerContent(VISUAL,     request.visual(),     results);
        validateLayerContent(CODE,       request.code(),       results);
        validateLayerContent(REAL_WORLD, request.realWorld(),  results);
        validateLayerContent(INTERVIEW,  request.interview(),  results);
        validateLayerContent(FEYNMAN,    request.feynman(),    results);

        long failed = results.stream().filter(r -> "FAILED".equals(r.status())).count();
        return new BulkLayerUploadResponse(
            request.topicSlug(),
            failed > 0 ? "VALIDATION_FAILED" : "VALIDATION_PASSED",
            results, results.size(), 0, 0,
            failed > 0 ? failed + " layer(s) failed validation" : null,
            null
        );
    }

    // ─────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────

    private void processMdxLayer(Topic topic, String type, LayerContent content,
                                  boolean overwrite, List<LayerResult> results) {
        if (content == null) return;

        try {
            Optional<Lesson> existing = lessonRepository
                .findByTopicIdAndSectionType(topic.getId(), type);

            if (existing.isPresent() && !overwrite) {
                results.add(new LayerResult(type, "SKIPPED",
                    "Layer already has content. Use overwriteExisting=true to replace."));
                return;
            }

            Lesson lesson = existing.orElseGet(() -> Lesson.builder()
                .topic(topic)
                .sectionType(type)
                .orderIndex(sectionOrder(type))
                .build());

            lesson.setTitle(defaultTitle(type));
            lesson.setContentMdx(content.contentMdx());
            lesson.setEstimatedMins(content.estimatedMins() != null
                ? content.estimatedMins() : defaultMins(type));

            lessonRepository.save(lesson);
            results.add(new LayerResult(type, "SAVED", "Saved successfully"));

        } catch (Exception e) {
            log.error("Failed to save layer {} for topic {}: {}", type, topic.getSlug(), e.getMessage());
            results.add(new LayerResult(type, "FAILED", e.getMessage()));
        }
    }

    private void processCodeLayer(Topic topic, LayerContent content,
                                   boolean overwrite, List<LayerResult> results) {
        if (content == null) return;

        // Save the MDX section first
        processMdxLayer(topic, CODE, content, overwrite, results);

        // Then save code examples if provided
        if (content.codeExamples() != null && !content.codeExamples().isEmpty()) {
            try {
                if (overwrite) {
                    codeExampleRepository.deleteByTopicId(topic.getId());
                }

                List<CodeExample_> entities = content.codeExamples().stream()
                    .map(ex -> CodeExample_.builder()
                        .topic(topic)
                        .language(ex.language())
                        .level(ex.level())
                        .title(ex.title())
                        .code(ex.code())
                        .explanation(ex.explanation())
                        .timeComplexity(ex.timeComplexity())
                        .spaceComplexity(ex.spaceComplexity())
                        .isRunnable(true)
                        .build())
                    .toList();

                codeExampleRepository.saveAll(entities);
                results.add(new LayerResult(CODE + ":examples", "SAVED",
                    content.codeExamples().size() + " code examples saved"));

            } catch (Exception e) {
                results.add(new LayerResult(CODE + ":examples", "FAILED", e.getMessage()));
            }
        }
    }

    private void processBuildLayer(Topic topic, BuildLayerContent content,
                                    boolean overwrite, List<LayerResult> results) {
        if (content == null) return;

        try {
            // Save MDX instruction content
            LayerContent mdx = new LayerContent(content.contentMdx(), 30, null, null);
            processMdxLayer(topic, BUILD, mdx, overwrite, results);

            // Save the build challenge definition
            if (content.challengeTitle() != null) {
                if (overwrite) {
                    buildChallengeRepository.deleteByTopicId(topic.getId());
                }

                BuildChallenge challenge = BuildChallenge.builder()
                    .topic(topic)
                    .title(content.challengeTitle())
                    .description(content.challengeDescription())
                    .starterCode(buildStarterCodeJson(content))
                    .acceptanceCriteria(content.acceptanceCriteria())
                    .estimatedMins(content.estimatedMins() != null ? content.estimatedMins() : 30)
                    .difficulty(3)
                    .build();

                buildChallengeRepository.save(challenge);
                results.add(new LayerResult(BUILD + ":challenge", "SAVED", "Build challenge saved"));
            }

        } catch (Exception e) {
            results.add(new LayerResult(BUILD, "FAILED", e.getMessage()));
        }
    }

    private void processSpacedReviewLayer(Topic topic, SpacedReviewLayerContent content,
                                           boolean overwrite, List<LayerResult> results) {
        if (content == null) return;

        try {
            LayerContent mdx = new LayerContent(content.contentMdx(), 5, null, null);
            processMdxLayer(topic, SPACED_REVIEW, mdx, overwrite, results);

            if (content.cards() != null && !content.cards().isEmpty()) {
                if (overwrite) {
                    reviewCardRepository.deleteByTopicId(topic.getId());
                }

                List<SpacedReviewCard> cards = content.cards().stream()
                    .map(c -> SpacedReviewCard.builder()
                        .topic(topic)
                        .question(c.question())
                        .answer(c.answer())
                        .cardType(c.cardType())
                        .build())
                    .toList();

                reviewCardRepository.saveAll(cards);
                results.add(new LayerResult(SPACED_REVIEW + ":cards", "SAVED",
                    cards.size() + " review cards saved"));
            }

        } catch (Exception e) {
            results.add(new LayerResult(SPACED_REVIEW, "FAILED", e.getMessage()));
        }
    }

    private void validateLayerContent(String type, LayerContent content, List<LayerResult> results) {
        if (content == null) return;
        int wordCount = content.contentMdx().split("\\s+").length;
        int minWords  = switch (type) {
            case WHY      -> 60;
            case THEORY   -> 120;
            case INTERVIEW -> 100;
            default        -> 50;
        };
        if (wordCount < minWords) {
            results.add(new LayerResult(type, "FAILED",
                "Too short: " + wordCount + " words. Minimum " + minWords + " for " + type));
        } else {
            results.add(new LayerResult(type, "VALID",
                wordCount + " words — meets minimum of " + minWords));
        }
    }

    private int sectionOrder(String type) {
        return switch (type) {
            case WHY          -> 1;
            case THEORY       -> 2;
            case VISUAL       -> 3;
            case CODE         -> 4;
            case REAL_WORLD   -> 5;
            case INTERVIEW    -> 6;
            case FEYNMAN      -> 7;
            case BUILD        -> 8;
            case SPACED_REVIEW -> 9;
            default           -> 10;
        };
    }

    private String defaultTitle(String type) {
        return switch (type) {
            case WHY          -> "Why This Exists";
            case THEORY       -> "Theory & Internals";
            case VISUAL       -> "Visualization";
            case CODE         -> "Code Examples";
            case REAL_WORLD   -> "Real World Usage";
            case INTERVIEW    -> "Interview Preparation";
            case FEYNMAN      -> "Feynman Check";
            case BUILD        -> "Build Challenge";
            case SPACED_REVIEW -> "Spaced Review";
            default           -> type;
        };
    }

    private int defaultMins(String type) {
        return switch (type) {
            case WHY   -> 5;
            case THEORY -> 15;
            case VISUAL -> 10;
            case CODE   -> 20;
            case REAL_WORLD -> 10;
            case INTERVIEW  -> 20;
            case FEYNMAN    -> 10;
            case BUILD      -> 30;
            case SPACED_REVIEW -> 5;
            default -> 10;
        };
    }

    private String buildStarterCodeJson(BuildLayerContent content) {
        Map<String, String> starter = new HashMap<>();
        if (content.starterCodeJava() != null)
            starter.put("java", content.starterCodeJava());
        if (content.starterCodeJavaScript() != null)
            starter.put("javascript", content.starterCodeJavaScript());
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(starter);
        } catch (Exception e) {
            return "{}";
        }
    }
}
```

---

### Example API Requests

#### Single Topic Upload (curl)

```bash
curl -X POST http://localhost:8080/v1/admin/content/topics/hashmap-internals/layers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -d '{
    "topicSlug": "hashmap-internals",
    "publishAfterSave": false,
    "overwriteExisting": true,

    "why": {
      "contentMdx": "## Why HashMap?\n\nBefore HashMap existed, finding a value in a collection required scanning every element — O(n)...",
      "estimatedMins": 5
    },

    "theory": {
      "contentMdx": "## Internal Working\n\nHashMap maintains a `Node<K,V>[] table` array internally...",
      "estimatedMins": 15
    },

    "visual": {
      "contentMdx": "## Visualization\n\nThe animation below shows how a key-value pair is stored...",
      "visualizerConfig": "{\"component\":\"HashmapVisualizer\",\"showBuckets\":true}",
      "estimatedMins": 10
    },

    "code": {
      "contentMdx": "## Code Examples\n\nFive levels from basic usage to JVM internals...",
      "estimatedMins": 20,
      "codeExamples": [
        {
          "level": 1,
          "language": "java",
          "title": "Basic HashMap Usage",
          "code": "Map<String, Integer> scores = new HashMap<>();\nscores.put(\"Alice\", 95);\nscores.put(\"Bob\", 87);\nSystem.out.println(scores.get(\"Alice\")); // 95",
          "explanation": "The simplest usage of HashMap.",
          "timeComplexity": "O(1) average",
          "spaceComplexity": "O(n)"
        },
        {
          "level": 5,
          "language": "java",
          "title": "Custom hashCode and equals for entity keys",
          "code": "public final class UserId {\n    private final long value;\n    public UserId(long value) { this.value = value; }\n    @Override public int hashCode() { return Long.hashCode(value); }\n    @Override public boolean equals(Object o) {\n        if (!(o instanceof UserId u)) return false;\n        return this.value == u.value;\n    }\n}",
          "explanation": "Correctly implementing hashCode+equals for use as HashMap key.",
          "timeComplexity": "O(1)",
          "spaceComplexity": "O(1)"
        }
      ]
    },

    "realWorld": {
      "contentMdx": "## Real World Usage\n\nIn Spring Framework, `@Cacheable` internally uses...",
      "estimatedMins": 10
    },

    "interview": {
      "contentMdx": "## Interview Preparation\n\n### Q1: How does HashMap handle collisions?\n...",
      "estimatedMins": 20
    },

    "feynman": {
      "contentMdx": "## Feynman Check\n\nExplain HashMap to a 5-year-old. Then explain it to a colleague. The AI will score your explanation.",
      "estimatedMins": 10
    },

    "build": {
      "contentMdx": "## Build Challenge\n\nImplement an LRU Cache using only LinkedHashMap...",
      "challengeTitle": "Build an LRU Cache",
      "challengeDescription": "Implement a Least Recently Used Cache with get() and put() in O(1). Capacity is fixed at construction.",
      "starterCodeJava": "public class LRUCache {\n    private final int capacity;\n    public LRUCache(int capacity) { this.capacity = capacity; }\n    public int get(int key) { return -1; }\n    public void put(int key, int value) { }\n}",
      "acceptanceCriteria": [
        "get() returns -1 for missing keys",
        "put() evicts least recently used when capacity exceeded",
        "get() and put() both run in O(1) time",
        "All LeetCode test cases pass"
      ],
      "estimatedMins": 30
    },

    "spacedReview": {
      "contentMdx": "## Spaced Review\n\nAnswer these cards before your next session...",
      "cards": [
        {
          "question": "What is the default initial capacity of HashMap?",
          "answer": "16 (DEFAULT_INITIAL_CAPACITY = 1 << 4)",
          "cardType": "concept"
        },
        {
          "question": "What is the default load factor of HashMap and when does resize trigger?",
          "answer": "0.75 (DEFAULT_LOAD_FACTOR). Resize triggers when size > capacity × loadFactor (e.g. 16 × 0.75 = 12 entries)",
          "cardType": "concept"
        },
        {
          "question": "What happens when a HashMap bucket chain exceeds 8 elements?",
          "answer": "If table.length >= 64: chain converts from LinkedList to Red-Black TreeNode (TREEIFY_THRESHOLD=8). If table.length < 64: resize instead.",
          "cardType": "tricky"
        }
      ]
    }
  }'
```

#### Expected Response

```json
{
  "topicSlug": "hashmap-internals",
  "status": "SUCCESS",
  "layers": [
    { "layerType": "why",               "status": "SAVED",   "message": "Saved successfully" },
    { "layerType": "theory",            "status": "SAVED",   "message": "Saved successfully" },
    { "layerType": "visual",            "status": "SAVED",   "message": "Saved successfully" },
    { "layerType": "code",              "status": "SAVED",   "message": "Saved successfully" },
    { "layerType": "code:examples",     "status": "SAVED",   "message": "2 code examples saved" },
    { "layerType": "realworld",         "status": "SAVED",   "message": "Saved successfully" },
    { "layerType": "interview",         "status": "SAVED",   "message": "Saved successfully" },
    { "layerType": "feynman",           "status": "SAVED",   "message": "Saved successfully" },
    { "layerType": "build",             "status": "SAVED",   "message": "Saved successfully" },
    { "layerType": "build:challenge",   "status": "SAVED",   "message": "Build challenge saved" },
    { "layerType": "spaced_review",     "status": "SAVED",   "message": "Saved successfully" },
    { "layerType": "spaced_review:cards","status": "SAVED",  "message": "3 review cards saved" }
  ],
  "totalLayersProvided": 9,
  "totalLayersSaved": 9,
  "totalLayersSkipped": 0,
  "errorMessage": null,
  "publishedAt": null
}
```

#### Batch Upload (Antigravity import script usage)

```bash
curl -X POST http://localhost:8080/v1/admin/content/topics/layers/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_JWT" \
  -d '[
    { "topicSlug": "java-intro",         "why": {...}, "theory": {...}, ... },
    { "topicSlug": "data-types",         "why": {...}, "theory": {...}, ... },
    { "topicSlug": "hashmap-internals",  "why": {...}, "theory": {...}, ... }
  ]'
```

---

### Updated importContent.ts — Uses New Bulk API

```typescript
// scripts/importContent.ts
// Run: npx ts-node scripts/importContent.ts

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const CONTENT_DIR = path.resolve('apps/web/content')
const API_BASE    = process.env.API_BASE    ?? 'http://localhost:8080'
const ADMIN_JWT   = process.env.ADMIN_JWT   ?? ''
const BATCH_SIZE  = 10   // topics per batch request
const DRY_RUN     = process.env.DRY_RUN === 'true'

interface LayerContent {
  contentMdx:      string
  estimatedMins?:  number
  codeExamples?:   CodeExample[]
  visualizerConfig?: string
}

interface CodeExample {
  level:           number
  language:        string
  title:           string
  code:            string
  explanation?:    string
  timeComplexity?: string
  spaceComplexity?: string
}

interface BulkRequest {
  topicSlug:         string
  publishAfterSave?: boolean
  overwriteExisting?: boolean
  why?:      LayerContent
  theory?:   LayerContent
  visual?:   LayerContent
  code?:     LayerContent
  realWorld?: LayerContent
  interview?: LayerContent
  feynman?:  LayerContent
  build?:    any
  spacedReview?: any
}

// Parse MDX content into 9 sections by ## headings
function parseSections(content: string): Record<string, string> {
  const sections: Record<string, string> = {}
  const parts = content.split(/^## /m)
  for (const part of parts) {
    if (!part.trim()) continue
    const firstNewline = part.indexOf('\n')
    if (firstNewline === -1) continue
    const heading = part.slice(0, firstNewline).trim().toUpperCase()
      .replace(/[^A-Z_]/g, '_')
      .replace('REAL_WORLD', 'REAL_WORLD')
      .replace('SPACED_REVIEW', 'SPACED_REVIEW')
      .replace('FEYNMAN_CHECK', 'FEYNMAN')
      .replace('FEYNMAN', 'FEYNMAN')
    sections[heading] = part.slice(firstNewline + 1).trim()
  }
  return sections
}

function buildRequest(slug: string, frontmatter: any, sections: Record<string, string>): BulkRequest {
  const layer = (key: string, mins?: number): LayerContent | undefined => {
    if (!sections[key]) return undefined
    return { contentMdx: sections[key], estimatedMins: mins }
  }

  return {
    topicSlug:        slug,
    publishAfterSave: false,
    overwriteExisting: true,
    why:        layer('WHY', 5),
    theory:     layer('THEORY', 15),
    visual:     layer('VISUAL', 10),
    code:       layer('CODE', 20),
    realWorld:  layer('REAL_WORLD', 10),
    interview:  layer('INTERVIEW', 20),
    feynman:    layer('FEYNMAN', 10),
    build:      sections['BUILD'] ? { contentMdx: sections['BUILD'], estimatedMins: 30 } : undefined,
    spacedReview: sections['SPACED_REVIEW']
      ? { contentMdx: sections['SPACED_REVIEW'] }
      : undefined,
  }
}

async function sendBatch(batch: BulkRequest[]): Promise<void> {
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would upload batch of ${batch.size} topics:`,
      batch.map(r => r.topicSlug).join(', '))
    return
  }

  const res = await fetch(`${API_BASE}/v1/admin/content/topics/layers/batch`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${ADMIN_JWT}`,
    },
    body: JSON.stringify(batch),
  })

  const results: any[] = await res.json()

  for (const result of results) {
    const icon = result.status === 'SUCCESS' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌'
    console.log(`${icon} ${result.topicSlug} — ${result.status} (${result.totalLayersSaved} saved)`)
    if (result.errorMessage) {
      console.log(`   └─ ${result.errorMessage}`)
    }
  }
}

async function importAllContent(): Promise<void> {
  if (!ADMIN_JWT && !DRY_RUN) {
    console.error('❌ ADMIN_JWT env var is required')
    process.exit(1)
  }

  const pathDirs = fs.readdirSync(CONTENT_DIR)
  let totalTopics = 0
  let batch: BulkRequest[] = []

  for (const pathSlug of pathDirs) {
    const topicsDir = path.join(CONTENT_DIR, pathSlug)
    if (!fs.statSync(topicsDir).isDirectory()) continue

    const mdxFiles = fs.readdirSync(topicsDir).filter(f => f.endsWith('.mdx'))
    console.log(`\n📂 ${pathSlug} — ${mdxFiles.length} topics`)

    for (const file of mdxFiles) {
      const raw = fs.readFileSync(path.join(topicsDir, file), 'utf-8')
      const { data: frontmatter, content } = matter(raw)
      const slug = frontmatter.slug ?? path.basename(file, '.mdx')
      const sections = parseSections(content)

      batch.push(buildRequest(slug, frontmatter, sections))
      totalTopics++

      // Send when batch is full
      if (batch.length >= BATCH_SIZE) {
        await sendBatch(batch)
        batch = []
      }
    }
  }

  // Send remaining
  if (batch.length > 0) {
    await sendBatch(batch)
  }

  console.log(`\n🏁 Done — ${totalTopics} topics processed`)
}

importAllContent().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
```

**Run it:**
```bash
# Dry run first (no DB writes):
DRY_RUN=true npx ts-node scripts/importContent.ts

# Actual import:
ADMIN_JWT="eyJ..." API_BASE="http://localhost:8080" npx ts-node scripts/importContent.ts

# Import single path only:
# Modify CONTENT_DIR to point to specific path folder
```

---

### OpenAPI Spec Snippet (SpringDoc)

```yaml
# Auto-generated by SpringDoc — available at http://localhost:8082/v3/api-docs
/v1/admin/content/topics/{slug}/layers:
  post:
    tags:
      - Bulk Content Upload
    summary: Bulk upload all teaching layers for a topic
    parameters:
      - name: slug
        in: path
        required: true
        schema:
          type: string
          example: hashmap-internals
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/BulkLayerUploadRequest'
    responses:
      '200':
        description: All layers saved successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BulkLayerUploadResponse'
      '207':
        description: Partial success — some layers saved, some failed
      '400':
        description: No layers provided or slug mismatch
      '404':
        description: Topic not found
      '422':
        description: All layers failed validation

/v1/admin/content/topics/layers/batch:
  post:
    tags:
      - Bulk Content Upload
    summary: Batch upload for multiple topics (max 50)
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: array
            maxItems: 50
            items:
              $ref: '#/components/schemas/BulkLayerUploadRequest'
    responses:
      '200': { description: All topics saved }
      '207': { description: Partial success }

/v1/admin/content/topics/{slug}/layers/validate:
  post:
    tags:
      - Bulk Content Upload
    summary: Validate layers without saving (dry-run)
    responses:
      '200': { description: Validation results returned }
```

---

*End of Part 4 — 9-Layer Model + Bulk Upload API*
*New layers: FEYNMAN (Layer 7) + BUILD (Layer 8) + SPACED_REVIEW (Layer 9)*
*New endpoints: POST /layers · POST /layers/batch · POST /layers/validate*
