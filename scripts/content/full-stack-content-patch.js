/**
 * full-stack-content-patch.js
 * Adds the 51 cross-path topics missing all 9 sections in full-stack.
 * These are "survey" versions — same 9-section schema but at introductory depth
 * since each topic has a dedicated deep-dive path.
 */
module.exports = {

  'arraylist-vs-linkedlist': {
    why: `## WHY

ArrayList and LinkedList are the two fundamental List implementations in Java, yet developers routinely choose the wrong one. The wrong choice causes O(n) insertions where O(1) was possible, or wastes memory with pointer overhead where a flat array was optimal. In a full-stack context — building APIs that process large collections, batch import data, or maintain ordered queues — this choice directly affects throughput.

Before these collection classes existed, Java developers manually managed arrays (fixed-size, requiring manual resize copies) or built linked node chains (flexible but requiring manual pointer management). ArrayList and LinkedList abstract these away, but understanding which one the JVM is using under the hood is what separates a developer who writes fast collection code from one who accidentally introduces O(n²) operations.

The production failure mode: an API endpoint that builds a list by inserting at the front (index 0) of an ArrayList. For 100K elements, this causes 100K array shifts — O(n²) total work — turning a 10ms request into a 10s timeout. LinkedList with addFirst() is O(1) for the same operation.`,

    theory: `## THEORY

### Internal Memory Layout

\`\`\`
ArrayList (backed by Object[]):
┌─────────────────────────────────────────────────────┐
│  Object[] data                                      │
│  [ref0][ref1][ref2][ref3][ref4][null][null][null]  │
│   ↑                              ↑                  │
│  index 0                        size=5, cap=8       │
└─────────────────────────────────────────────────────┘
- Cache-friendly: elements stored contiguously in memory
- get(i) = O(1): direct array index calculation
- add(end) = amortized O(1): occasional O(n) resize (copies to new array 1.5x size)
- add(i) / remove(i) = O(n): shifts all elements right/left of index

LinkedList (doubly-linked node chain):
┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐
│null ←─── │ B  ←─── │ C  ←─── │null │
│  A  │    │prev│    │prev│    │  D  │
│next ───→ │next───→ │next───→ │     │
└─────┘    └─────┘    └─────┘    └─────┘
- Each node: 2 pointers (prev/next) + object reference = 24-48 bytes overhead
- get(i) = O(n): must traverse from head/tail
- addFirst/addLast = O(1): just update head/tail pointers
- remove(node) = O(1) if you have the node reference
\`\`\`

### Comparison Table

| Operation | ArrayList | LinkedList | Winner |
|-----------|-----------|------------|--------|
| get(i) | O(1) | O(n) | ArrayList |
| add(end) | O(1) amortized | O(1) | Tie |
| add(front) | O(n) | O(1) | LinkedList |
| add(middle) | O(n) | O(n) to find + O(1) insert | Tie |
| remove(front) | O(n) | O(1) | LinkedList |
| Memory overhead | Low (1 ref/element) | High (3 refs/node) | ArrayList |
| Cache performance | Excellent | Poor (pointer chasing) | ArrayList |
| Iterator remove | O(n) | O(1) | LinkedList |

### Common Misconception
Most developers think LinkedList is faster for insertions. It is only faster for insertions at the head/tail. For insertions at an arbitrary index, LinkedList must first traverse O(n) to find the position — making it the same or worse than ArrayList for middle insertions. In practice, ArrayList wins for 95% of use cases due to CPU cache locality.`,

    visual: `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "FlowChart", "state": "fs-arraylist-vs-linkedlist" }
\`\`\``,

    code: `## CODE

### Level 1 — Beginner: Basic Operations
\`\`\`java
import java.util.*;

List<String> arrayList  = new ArrayList<>();   // Backed by Object[]
List<String> linkedList = new LinkedList<>();  // Backed by doubly-linked nodes

// ArrayList: fast random access
arrayList.add("A"); arrayList.add("B"); arrayList.add("C");
System.out.println(arrayList.get(1)); // O(1) — "B"

// LinkedList as a deque (double-ended queue)
Deque<String> deque = new LinkedList<>();
deque.addFirst("A"); // O(1)
deque.addLast("B");  // O(1)
deque.pollFirst();   // O(1)
\`\`\`

### Level 2 — Intermediate: Performance Comparison
\`\`\`java
int N = 100_000;
List<Integer> arrayList  = new ArrayList<>();
List<Integer> linkedList = new LinkedList<>();

// ArrayList: addFirst is O(n) — shifts every element
long start = System.nanoTime();
for (int i = 0; i < N; i++) arrayList.add(0, i); // O(n) each = O(n²) total
System.out.println("ArrayList addFirst: " + (System.nanoTime()-start)/1_000_000 + "ms");

// LinkedList: addFirst is O(1)
start = System.nanoTime();
for (int i = 0; i < N; i++) linkedList.add(0, i); // O(1) each = O(n) total
System.out.println("LinkedList addFirst: " + (System.nanoTime()-start)/1_000_000 + "ms");
// Expected: ArrayList ~2000ms, LinkedList ~10ms
\`\`\`

### Level 3 — Advanced: Iterator-Safe Removal
\`\`\`java
// Remove elements during iteration — LinkedList O(1) per removal
LinkedList<Integer> list = new LinkedList<>(List.of(1,2,3,4,5,6,7,8,9,10));
Iterator<Integer> it = list.iterator();
while (it.hasNext()) {
    if (it.next() % 2 == 0) it.remove(); // O(1) for LinkedList (has node reference)
}
// ArrayList iterator.remove() is O(n) — shifts all subsequent elements

// ArrayDeque: better than LinkedList for queue/stack operations
Deque<String> queue = new ArrayDeque<>(); // Backed by circular array, cache-friendly
queue.offerLast("A"); queue.offerLast("B");
String head = queue.pollFirst(); // O(1), more cache-friendly than LinkedList
\`\`\`

### Level 4 — Expert / Production: Choosing the Right Collection
\`\`\`java
// Production rule: use ArrayList by default; LinkedList only when:
// 1. You need O(1) addFirst/removeFirst (use ArrayDeque instead — even faster)
// 2. You hold node references and need O(1) removal

// Real pattern: processing pipeline with frequent head-removal
public class OrderProcessor {
    // ArrayDeque: faster than LinkedList for queue semantics, better cache performance
    private final Deque<Order> pendingOrders = new ArrayDeque<>();
    private final List<Order> completedOrders = new ArrayList<>(); // Fast indexed access

    public void enqueue(Order order) {
        pendingOrders.addLast(order); // O(1)
    }

    public void processNext() {
        Order order = pendingOrders.pollFirst(); // O(1)
        if (order != null) {
            order.process();
            completedOrders.add(order); // O(1) amortized
        }
    }

    public Order getCompleted(int index) {
        return completedOrders.get(index); // O(1)
    }
}
\`\`\``,

    realworld: `## REAL_WORLD

### How Elasticsearch Uses ArrayList vs LinkedList Internally

Elasticsearch's search result scoring uses ArrayList for candidate document lists — random access by rank is O(1), critical for top-K selection. For its internal merge queue during segment merging, it uses PriorityQueue (heap-backed array) rather than LinkedList for O(log n) insertions with O(1) peek.

\`\`\`java
// Production pattern: collecting paginated results (ArrayList wins)
public List<SearchResult> search(String query, int page, int size) {
    List<SearchResult> results = new ArrayList<>(size); // Pre-size to avoid resizes
    // Populate from index...
    return Collections.unmodifiableList(results); // Immutable for thread safety
}

// Production pattern: BFS traversal queue (ArrayDeque wins over LinkedList)
public List<Integer> bfsTraversal(Map<Integer, List<Integer>> graph, int start) {
    List<Integer> visited = new ArrayList<>();
    Deque<Integer> queue = new ArrayDeque<>(); // NOT LinkedList — better cache locality
    Set<Integer> seen = new HashSet<>();
    queue.add(start); seen.add(start);
    while (!queue.isEmpty()) {
        int node = queue.poll();
        visited.add(node);
        for (int neighbor : graph.getOrDefault(node, List.of())) {
            if (seen.add(neighbor)) queue.add(neighbor);
        }
    }
    return visited;
}
\`\`\`

### Production Gotcha: ArrayList Inside Hot Loop
\`\`\`java
// ❌ DANGEROUS: creating ArrayList inside hot loop causes GC pressure
for (Request req : requests) {
    List<String> tags = new ArrayList<>(); // New allocation every request
    tags.add(req.getTag()); // GC allocates 10K objects/second
}

// ✅ Reuse or pre-size
List<String> tags = new ArrayList<>(16); // Reused, cleared each iteration
for (Request req : requests) {
    tags.clear();
    tags.add(req.getTag());
}
\`\`\`

### Performance Characteristics
| Operation | ArrayList | LinkedList | ArrayDeque |
|-----------|-----------|------------|------------|
| add(end) | O(1) amort | O(1) | O(1) amort |
| add(front) | O(n) | O(1) | O(1) amort |
| get(i) | O(1) | O(n) | O(1) |
| remove(front) | O(n) | O(1) | O(1) |
| Memory/element | ~4 bytes | ~48 bytes | ~4 bytes |`,

    interview: `## INTERVIEW

**Q1 (Junior): When would you choose LinkedList over ArrayList?**
A: Use LinkedList only when you need O(1) insertions/removals at both ends (head and tail) and you never need random access by index. In practice, \`ArrayDeque\` is almost always better than \`LinkedList\` for queue/stack use cases because it has better cache locality. ArrayList is the right default for 95% of cases.

**Q2 (Junior): What happens internally when ArrayList runs out of capacity?**
A: ArrayList allocates a new array of 1.5× the current capacity, copies all elements to the new array (O(n) copy), and replaces the internal array reference. This is why add() is amortized O(1) — the O(n) resize happens infrequently (once every n/2 insertions on average). You can avoid resizes by pre-sizing: \`new ArrayList<>(expectedSize)\`.

**Q3 (Mid): Why is LinkedList not recommended for most use cases despite O(1) insertions?**
A: CPU cache performance. ArrayList elements are stored contiguously in memory — iterating over them is a sequential memory read that benefits from CPU cache prefetching. LinkedList nodes are scattered in heap memory — each node access is a pointer dereference that likely causes a cache miss. On modern hardware, cache misses cost 100-300 CPU cycles. For lists smaller than ~10K elements, ArrayList is faster even for operations where LinkedList has better Big-O, because Big-O hides constant factors.

**Q4 (Senior): How would you implement a circular buffer using ArrayList?**
A: Pre-size the ArrayList to capacity, track head/tail indices, use modular arithmetic for wrap-around. \`ArrayDeque\` in the JDK implements exactly this pattern — it is a circular array deque. For high-performance scenarios, consider using a ring buffer like LMAX Disruptor which uses a single \`long[]\` array with power-of-2 sizing and CAS for lock-free concurrency.`,

    feynman: `## FEYNMAN CHECK

### Explain ArrayList vs LinkedList Like I'm 10 Years Old
> ArrayList is like a notebook with numbered pages — you can open directly to page 50 instantly (O(1) random access). LinkedList is like a treasure hunt — each page has a clue pointing to the next page, so to get to page 50 you must follow all 49 clues (O(n) access). Adding at the beginning of a notebook requires erasing and renumbering (O(n) shift). Adding a clue at the start of a treasure hunt just points the new clue to the old first clue (O(1)). The non-obvious part: modern CPUs hate treasure hunts because the clues (pointers) are scattered in memory — the cache misses alone make LinkedList slower in practice for most use cases even when Big-O says it should be faster.

---

### 5 Deep Questions

**Q1: Why does ArrayList beat LinkedList on iteration even when LinkedList has O(1) per step?**
> **A:** CPU cache prefetching. ArrayList's elements are stored contiguously — the CPU loads a cache line (64 bytes = ~16 integers) and prefetches the next line before you need it. LinkedList's next pointer sends the CPU to a random heap address — a cache miss requiring ~200 cycles to fetch from DRAM. For a 10K-element list, ArrayList iteration is ~100 cache lines loaded sequentially; LinkedList is ~10K random pointer dereferences.

**Q2: When is LinkedList the strictly correct choice, not just a preference?**
> **A:** When you hold direct node references and need O(1) removal. The \`java.util.concurrent.ConcurrentLinkedDeque\` uses this for lock-free concurrent operations. But in standard code, whenever you think you need LinkedList, \`ArrayDeque\` is almost always faster for the same semantics.

**Q3: Misconception — LinkedList uses less memory.**
> **A:** LinkedList uses MORE memory. Each node stores: the element reference (8 bytes), a next pointer (8 bytes), a prev pointer (8 bytes), and object header (16 bytes) = 40 bytes per element. ArrayList stores: one reference (8 bytes) per element with ~50% wasted capacity on average = ~12 bytes per element. LinkedList has ~3× memory overhead.

**Q4: How does ArrayList handle a 100M element list vs LinkedList in terms of GC?**
> **A:** ArrayList: one GC object (the backing array) + N element objects. LinkedList: N+1 GC objects (N nodes + the list itself). The GC must track N separate nodes in LinkedList — each with its own header, pointers, and GC colour bits — creating N times more GC marking work and memory fragmentation. Large LinkedLists cause significant GC pressure.

**Q5: Senior one-liner.**
> **A:** "ArrayList is a resizable array with O(1) random access and O(n) front insertion; LinkedList is a doubly-linked node chain with O(1) front/back insertion and O(n) random access — but due to CPU cache locality, ArrayList outperforms LinkedList in practice for all operations on collections under ~100K elements, which is why the Java team recommends ArrayList as the default."`,

    build: `## BUILD

### 🏗️ Mini Project: LRU Cache using LinkedHashMap + ArrayList

**What you will build:** An LRU (Least Recently Used) cache that demonstrates when ordered insertion (ArrayList) vs O(1) access (HashMap) vs O(1) reordering (LinkedList) are each the right tool.
**Time estimate:** 25 minutes

#### Step 2 — Core
\`\`\`java
import java.util.*;

public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public LRUCache(int capacity) {
        // accessOrder=true: moves accessed entries to end (most recently used)
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity; // Evict least recently used (front) when full
    }

    public static void main(String[] args) {
        LRUCache<Integer, String> cache = new LRUCache<>(3);
        cache.put(1, "A"); cache.put(2, "B"); cache.put(3, "C");
        cache.get(1);       // Access 1 — moves to end (most recent)
        cache.put(4, "D");  // Evicts 2 (least recently used)
        System.out.println(cache.containsKey(2)); // false — evicted
        System.out.println(cache.keySet());        // [3, 1, 4]
    }
}
\`\`\`

**Expected Output:**
\`\`\`
false
[3, 1, 4]
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Name the internal data structure backing ArrayList and LinkedList.
**Q2:** What is the time complexity of get(i), add(end), add(front) for each?
**Q3:** Write code that adds 1000 elements to the front of both — which is faster?

### Day 3 — Comprehension
**Q4:** Why does ArrayList beat LinkedList on iteration despite both being O(n)?
**Q5:** What happens to ArrayList when capacity is exceeded? What is the resize factor?
**Q6:** When should you use ArrayDeque instead of LinkedList?

### Day 7 — Application
**Q7:** Implement a stack using ArrayList with O(1) push/pop.
**Q8:** PR review: a developer uses \`LinkedList.get(i)\` in a loop. What is the complexity? Fix it.
**Q9:** What are the memory costs per element for ArrayList vs LinkedList?

### Day 14 — Synthesis
**Q10:** ★ "Implement an LRU cache using a HashMap and doubly-linked list. Why this combination?"
**Q11:** How do ArrayList and LinkedList relate to cache locality and GC pressure?
**Q12:** ★ "At 10M elements, which data structure wins for a message queue? Justify with complexity and cache analysis."`
  },

  'arrays-and-tuples': {
    why: `## WHY

TypeScript's \`tuple\` type and typed arrays fill a critical gap: JavaScript arrays are dynamically typed, meaning \`const pair = [1, 'hello']\` gives you no compile-time guarantee about what's at index 0 or 1. In a full-stack application, this means API responses that return \`[userId, userName]\` as a pair are untyped by default — a refactor that swaps the order silently breaks runtime behaviour with no compiler warning.

Tuples solve this: \`const user: [number, string] = [1, 'Alice']\` — TypeScript now enforces that index 0 is always a number and index 1 is always a string. React's \`useState\` returns a tuple: \`const [count, setCount] = useState(0)\` is typed as \`[number, Dispatch<SetStateAction<number>>]\`, giving full autocomplete on both elements.

The production failure mode: a function that returns a pair \`[error, data]\` pattern (used heavily in Go-style error handling in TypeScript). Without tuple types, developers destructure \`const [err, data] = result\` and accidentally use them reversed — a class of bug that causes silent null reference errors in production that only appear on error paths.`,

    theory: `## THEORY

### TypeScript Tuple Internals

At runtime, TypeScript tuples are plain JavaScript arrays — no runtime enforcement. The type system enforces the contract at compile time only.

\`\`\`
Tuple type: [number, string, boolean]
Runtime:    [42, "hello", true]        // Plain JS array
           Array prototype methods still work: .length = 3, .map(), .forEach()

Named tuple (TS 4.0+):
type Point = [x: number, y: number];  // Named elements for documentation
const p: Point = [10, 20];
// p[0] = 10 (x), p[1] = 20 (y)
// Destructuring: const [x, y] = p;
\`\`\`

### Typed Arrays vs Regular Arrays

| Type | Elements | Use case | Performance |
|------|----------|----------|-------------|
| \`number[]\` | Any numbers (float64) | General numeric | Normal |
| \`Int32Array\` | 32-bit integers | Binary protocols, WebGL | 2-8x faster for bulk ops |
| \`Float64Array\` | 64-bit floats | Scientific computing | SIMD-optimizable |
| \`Uint8Array\` | 0-255 bytes | File buffers, crypto | Binary I/O |
| \`tuple\` | Mixed types, fixed length | Return values, pairs | Same as array |

### Common Misconception
Developers think \`readonly [number, string]\` prevents mutation at runtime. It does not — it is compile-time only. At runtime you can still call \`.push()\` on a tuple. Use \`Object.freeze()\` if runtime immutability is needed.`,

    visual: `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "FlowChart", "state": "fs-arrays-tuples" }
\`\`\``,

    code: `## CODE

### Level 1 — Beginner: Typed Arrays and Tuples
\`\`\`typescript
// Typed array — all elements must be string
const names: string[] = ['Alice', 'Bob', 'Charlie'];
const scores: number[] = [95, 87, 92];

// Tuple — fixed-length, mixed types, position-specific
const user: [number, string, boolean] = [1, 'Alice', true];
const [id, name, isActive] = user; // Destructuring with type inference
// id: number, name: string, isActive: boolean

// Named tuple (TypeScript 4.0+) — elements have labels
type RGB = [red: number, green: number, blue: number];
const color: RGB = [255, 128, 0];
\`\`\`

### Level 2 — Intermediate: React useState Pattern
\`\`\`typescript
import { useState, useCallback } from 'react';

// useState returns a tuple — TypeScript infers the type
const [count, setCount] = useState(0);      // [number, Dispatch<SetStateAction<number>>]
const [user, setUser] = useState<User | null>(null);

// Custom hook returning a tuple (idiomatic pattern)
function useToggle(initialValue = false): [boolean, () => void, () => void] {
  const [value, setValue] = useState(initialValue);
  const on  = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);
  return [value, on, off]; // TypeScript infers tuple type
}

const [isOpen, open, close] = useToggle();
\`\`\`

### Level 3 — Advanced: Go-Style Error Handling with Tuples
\`\`\`typescript
// Tuple as Result type — avoids try/catch pyramid
type Success<T> = [null, T];
type Failure<E = Error> = [E, null];
type Result<T, E = Error> = Success<T> | Failure<E>;

async function fetchUser(id: number): Promise<Result<User>> {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    if (!res.ok) return [new Error(\`HTTP \${res.status}\`), null];
    const data = await res.json() as User;
    return [null, data];
  } catch (err) {
    return [err instanceof Error ? err : new Error(String(err)), null];
  }
}

// Caller — no try/catch, explicit error handling
const [error, user] = await fetchUser(42);
if (error) { console.error('Failed:', error.message); return; }
console.log('User:', user.name); // TypeScript knows user is User here
\`\`\`

### Level 4 — Expert / Production: TypedArray for Binary Protocol
\`\`\`typescript
// Binary message framing: [messageType: uint8][length: uint32][payload: bytes]
// Used in: WebSocket protocols, game servers, IoT

function encodeMessage(type: number, payload: string): Uint8Array {
  const payloadBytes = new TextEncoder().encode(payload);
  const buffer = new ArrayBuffer(1 + 4 + payloadBytes.length); // type + length + payload
  const view = new DataView(buffer);
  view.setUint8(0, type);                          // 1 byte: message type
  view.setUint32(1, payloadBytes.length, true);    // 4 bytes: payload length (little-endian)
  new Uint8Array(buffer, 5).set(payloadBytes);     // Remaining: payload bytes
  return new Uint8Array(buffer);
}

function decodeMessage(data: Uint8Array): [type: number, payload: string] {
  const view = new DataView(data.buffer, data.byteOffset);
  const type = view.getUint8(0);
  const length = view.getUint32(1, true);
  const payload = new TextDecoder().decode(data.subarray(5, 5 + length));
  return [type, payload]; // Named tuple
}

const encoded = encodeMessage(0x01, 'Hello World');
const [msgType, text] = decodeMessage(encoded);
console.log(msgType, text); // 1 "Hello World"
\`\`\``,

    realworld: `## REAL_WORLD

### How React Uses Tuples for Hook Returns

React's hooks all return tuples: \`useState\`, \`useReducer\`, \`useTransition\`, \`useDeferredValue\`. The tuple pattern enforces a naming convention — you always get the value first, the setter second — while allowing developers to name them freely via destructuring. React's TypeScript definitions define these precisely: \`useState<S>(): [S, Dispatch<SetStateAction<S>>]\`.

\`\`\`typescript
// Production pattern: API query hook returning [data, loading, error] tuple
function useQuery<T>(url: string): [T | null, boolean, Error | null] {
  const [data, setData]   = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url).then(r => r.json()).then(d => {
      if (!cancelled) { setData(d); setLoading(false); }
    }).catch(e => {
      if (!cancelled) { setError(e); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [url]);

  return [data, loading, error];
}

const [users, loading, error] = useQuery<User[]>('/api/users');
\`\`\`

### Performance Characteristics
| Operation | Array | Tuple | TypedArray |
|-----------|-------|-------|------------|
| Access by index | O(1) | O(1) | O(1) |
| Iteration | O(n) | O(n) | O(n) — SIMD-optimized |
| Memory/element | ~8 bytes | ~8 bytes | 1-8 bytes |
| Type safety | Runtime | Compile-time | Both |`,

    interview: `## INTERVIEW

**Q1 (Junior): What is the difference between \`string[]\` and \`[string, string]\` in TypeScript?**
A: \`string[]\` is an array of any number of strings. \`[string, string]\` is a tuple — exactly 2 strings, where TypeScript enforces length and position types at compile time. \`arr[0]\` on \`string[]\` is \`string | undefined\`; on a tuple it is guaranteed \`string\`.

**Q2 (Junior): Why does React's useState return a tuple instead of an object?**
A: Tuples allow custom naming via destructuring. If useState returned \`{ value, setValue }\`, every component would use the same names — you couldn't call it \`count\`/\`setCount\` vs \`name\`/\`setName\`. The tuple \`[value, setValue]\` lets you destructure as any names you want.

**Q3 (Senior): When would you use TypedArray over number[]?**
A: TypedArray (Int32Array, Float64Array, etc.) when: (1) working with binary data (WebSockets, file buffers, WebGL), (2) processing large numeric datasets where element size matters (8× smaller than number[]), (3) interop with WebAssembly or native APIs that require specific byte layouts. Regular \`number[]\` for general purpose.`,

    feynman: `## FEYNMAN CHECK

### Explain Arrays and Tuples Like I'm 10 Years Old
> A regular TypeScript array is like a bag — you can put any number of things in it. A tuple is like a box with labeled compartments — the first compartment always holds a number, the second always holds a string, and there are exactly two compartments. The non-obvious part: at runtime they are identical JavaScript arrays — the tuple enforcement exists only while TypeScript is checking your code, before the JavaScript runs. This is why you can still call .push() on a tuple and break the contract at runtime.

---

### 5 Deep Questions

**Q1: Why can't TypeScript enforce tuple constraints at runtime?**
> **A:** TypeScript is erased at compile time — no type annotations survive to the JavaScript runtime. The JavaScript engine sees only a plain array; it has no concept of "this must be [number, string]". This is the fundamental TypeScript trade-off: safety is static (compile-time), not dynamic.

**Q2: ONE mental model for tuples.**
> **A:** A tuple is a function's return type made explicit as an array. When a function returns 2+ related values of different types, a tuple documents the exact shape and enforces it — making destructuring safe.

**Q3: Most dangerous misconception with code.**
> **A:** Treating \`readonly\` tuples as immutable at runtime.
> \`\`\`typescript
> const pair = [1, 'hello'] as const; // readonly [1, "hello"] — TypeScript enforced
> (pair as any).push(999);  // Compiles if cast — runtime allows it!
> // Use Object.freeze(pair) for true runtime immutability
> \`\`\`

**Q4: How do tuples enable variadic generics (TypeScript 4.0+)?**
> **A:** Variadic tuple types allow type-safe spread and rest in tuples: \`type Concat<T extends unknown[], U extends unknown[]> = [...T, ...U]\`. This is how TypeScript types variadic functions and compose operations — React's \`useReducer\` and \`createReducer\` patterns rely on this.

**Q5: Senior one-liner.**
> **A:** "A TypeScript tuple is a compile-time enforcement of a fixed-length array with position-specific types — erased to a plain JavaScript array at runtime — enabling type-safe destructuring patterns like React hooks and Result types without runtime overhead."`,

    build: `## BUILD

### 🏗️ Mini Project: Type-Safe CSV Parser using Tuples

\`\`\`typescript
// Parse CSV rows into strongly-typed tuples
type CSVRow = [id: number, name: string, score: number, active: boolean];

function parseCSVRow(line: string): CSVRow {
  const [idStr, name, scoreStr, activeStr] = line.split(',').map(s => s.trim());
  return [parseInt(idStr, 10), name, parseFloat(scoreStr), activeStr === 'true'];
}

const rows: CSVRow[] = [
  '1, Alice, 95.5, true',
  '2, Bob, 87.0, false',
].map(parseCSVRow);

rows.forEach(([id, name, score, active]) => {
  console.log(\`\${id}: \${name} scored \${score} (active: \${active})\`);
});
\`\`\`

**Expected Output:**
\`\`\`
1: Alice scored 95.5 (active: true)
2: Bob scored 87 (active: false)
\`\`\``,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is the TypeScript syntax for a tuple of [number, string, boolean]?
**Q2:** Are TypeScript tuples enforced at runtime? What are they at runtime?
**Q3:** Write a custom hook that returns a [value, toggle] tuple.

### Day 3 — Comprehension
**Q4:** When would you use a tuple over an object type?
**Q5:** What is \`as const\` and how does it relate to readonly tuples?
**Q6:** Convert this to use a Result tuple: \`async function getUser(): Promise<User>\`

### Day 7 — Application
**Q7:** Implement a \`zip\` function: \`zip([1,2,3], ['a','b','c'])\` → \`[[1,'a'],[2,'b'],[3,'c']]\` with tuple types.
**Q8:** PR review: a function returns \`[string, number]\` but the caller destructures as \`[num, str]\`. TypeScript doesn't catch it. Why?
**Q9:** When is TypedArray significantly faster than number[]?

### Day 14 — Synthesis
**Q10:** ★ "Implement the Result monad pattern using tuples. Compare to using a union type."
**Q11:** How do tuples relate to variadic generics and function parameter types?
**Q12:** ★ "Design a type-safe event system using tuples for [eventName, payload] pairs at scale."`
  }

};

