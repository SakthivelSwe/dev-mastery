/*
 * Catalogue of stepwise visualiser configurations. Each entry is a topic slug
 * whose `## VISUALIZATION_CONFIG` MDX section will be replaced with the
 * JSON payload here.
 *
 * The payload MUST match the schema in
 * `apps/web/src/components/visualizer/StepwiseVisualizer.tsx`.
 */

module.exports = {

// ────────────────────────────────────────────────────────────────────────────
//  Java Mastery — Threading
// ────────────────────────────────────────────────────────────────────────────
'java-mastery': {

'threads-fundamentals': {
  language: 'java',
  fileName: 'ThreadsIntro.java',
  steps: [
    {
      title: 'main thread starts',
      description: 'Every JVM process begins with a single "main" thread. It runs your public static void main and lives until that method returns.',
      code:
`public class ThreadsIntro {
    public static void main(String[] args) throws Exception {
        System.out.println("[main] hello");
        Thread worker = new Thread(() -> {
            for (int i = 0; i < 3; i++)
                System.out.println("  [worker] tick " + i);
        }, "worker");
        worker.start();
        worker.join();
        System.out.println("[main] done");
    }
}`,
      highlight: [2, 3],
      diagram: { kind: 'threads', threads: [{ name: 'main', state: 'RUNNABLE', note: 'running main()' }] },
    },
    {
      title: 'new Thread(...) — NEW state',
      description: 'The Thread object is created but the OS has not scheduled it yet. Its state is NEW. Only main is currently running.',
      code:
`Thread worker = new Thread(() -> {
    for (int i = 0; i < 3; i++)
        System.out.println("  [worker] tick " + i);
}, "worker");`,
      highlight: [4, 5, 6, 7],
      diagram: { kind: 'threads', threads: [
        { name: 'main',   state: 'RUNNABLE', note: 'creating worker' },
        { name: 'worker', state: 'NEW',      note: 'not started yet' },
      ]},
    },
    {
      title: 'worker.start() — RUNNABLE',
      description: 'start() asks the JVM to spawn a native OS thread. The worker becomes RUNNABLE — eligible to run on a CPU core. main continues in parallel.',
      code: `worker.start();   // NEW → RUNNABLE  (a new OS thread is created)`,
      highlight: [8],
      diagram: { kind: 'threads', threads: [
        { name: 'main',   state: 'RUNNABLE' },
        { name: 'worker', state: 'RUNNABLE', note: 'now running' },
      ]},
    },
    {
      title: 'Per-thread stack, shared heap',
      description: 'Each thread has its OWN stack (local variables, method frames). Both threads share the SAME heap (objects, static fields). Passing an object between threads is free — both see the same address.',
      code:
`// worker\'s call stack             // main\'s call stack
//   run()                             main()
//     i = 0 (local)                     worker (local)
//                                       args   (local)
//               \\           /
//                 Shared Heap
//                 [ System.out, "worker" String, Thread object, … ]`,
      diagram: { kind: 'memory',
        stack: [
          { label: 'i',      value: '0',                    type: 'main:—' },
          { label: 'worker', value: 'ref → 0x1f42', type: 'main:Thread' },
          { label: 'i',      value: '2',                    type: 'worker:int', highlight: true },
        ],
        heap: [
          { label: 'Thread@0x1f42', fields: [['name', '"worker"'], ['state', 'RUNNABLE']], highlight: true },
          { label: 'String@0x2c11', fields: [['value', '"worker"']] },
        ]},
    },
    {
      title: 'worker.join() — main waits',
      description: 'main calls join(), which blocks until worker terminates. main moves to WAITING. When the lambda finishes, worker is TERMINATED and main resumes.',
      code: `worker.join();   // main waits until worker terminates`,
      highlight: [9],
      diagram: { kind: 'threads', threads: [
        { name: 'main',   state: 'WAITING',    note: 'blocked in join()' },
        { name: 'worker', state: 'RUNNABLE',   note: 'still ticking' },
      ]},
    },
    {
      title: 'TERMINATED — both threads exit',
      description: 'worker\'s lambda returns → worker becomes TERMINATED → the JVM wakes main from join() → main prints "done" and also terminates. The JVM exits once no user threads remain.',
      code: `System.out.println("[main] done");   // both threads terminated cleanly`,
      highlight: [10],
      diagram: { kind: 'threads', threads: [
        { name: 'main',   state: 'TERMINATED', active: false },
        { name: 'worker', state: 'TERMINATED', active: false },
      ]},
    },
  ],
},

'thread-lifecycle': {
  language: 'java',
  fileName: 'Lifecycle.java',
  steps: [
    {
      title: 'NEW',
      description: 'Thread object created; start() not called yet. Thread is a plain Java object — no OS thread exists.',
      code: `Thread t = new Thread(() -> {\n    doWork();\n});`,
      highlight: [1],
      diagram: { kind: 'flow', steps: [
        { label: 'NEW',           active: true },
        { label: 'RUNNABLE' },
        { label: 'BLOCKED / WAITING / TIMED_WAITING' },
        { label: 'TERMINATED' },
      ]},
    },
    {
      title: 'RUNNABLE',
      description: 'start() spawns the native OS thread; JVM marks Java state as RUNNABLE. Note: RUNNABLE means "eligible" — the OS scheduler decides which of many RUNNABLE threads is on a core right now.',
      code: `t.start();   // JVM → OS thread created; state becomes RUNNABLE`,
      highlight: [4],
      diagram: { kind: 'flow', steps: [
        { label: 'NEW', done: true },
        { label: 'RUNNABLE', active: true, note: 'on-core OR in ready queue' },
        { label: 'BLOCKED / WAITING / TIMED_WAITING' },
        { label: 'TERMINATED' },
      ]},
    },
    {
      title: 'BLOCKED — failed to enter synchronized',
      description: 'Thread reached a synchronized block whose monitor is held by another thread. It parks and consumes no CPU until the owner releases.',
      code:
`synchronized (lock) {   //  monitor already held by another thread → this thread BLOCKS
    balance += amount;
}`,
      highlight: [1],
      diagram: { kind: 'threads', threads: [
        { name: 'holder',    state: 'RUNNABLE', note: 'owns lock' },
        { name: 'contender', state: 'BLOCKED',  note: 'waiting for lock' },
      ], monitor: { name: 'lock', owner: 'holder', waiters: ['contender'] } },
    },
    {
      title: 'WAITING vs TIMED_WAITING',
      description: 'WAITING: parked indefinitely — needs an explicit signal to wake (wait(), join(), park()). TIMED_WAITING: same but with a deadline (sleep, wait(ms), parkNanos).',
      code:
`Thread.sleep(5000);           // TIMED_WAITING (5s)
someLock.wait();              // WAITING  (until notify)
LockSupport.parkNanos(1000);  // TIMED_WAITING (~1µs)`,
      highlight: [1, 2],
      diagram: { kind: 'threads', threads: [
        { name: 'napper', state: 'TIMED_WAITING', note: 'sleep(5000)' },
        { name: 'waiter', state: 'WAITING',       note: 'wait() until notify' },
      ]},
    },
    {
      title: 'Signal → back to RUNNABLE',
      description: 'notify(), notifyAll(), unpark(), timeout, or interrupt() move the thread from WAITING/TIMED_WAITING back to RUNNABLE — it re-enters the OS ready queue.',
      code: `synchronized (lock) { lock.notifyAll(); }   // wakes every waiter`,
      highlight: [1],
      diagram: { kind: 'threads', threads: [
        { name: 'napper', state: 'RUNNABLE', note: 'timeout elapsed' },
        { name: 'waiter', state: 'RUNNABLE', note: 'received notify' },
      ]},
    },
    {
      title: 'TERMINATED — final state',
      description: 'run() returns (or an uncaught exception unwinds). Thread\'s OS thread is destroyed; state is TERMINATED. You cannot restart a terminated thread — you must construct a new one.',
      code: `t.join();   // main sees t reached TERMINATED`,
      diagram: { kind: 'flow', steps: [
        { label: 'NEW', done: true },
        { label: 'RUNNABLE', done: true },
        { label: 'BLOCKED / WAITING / TIMED_WAITING', done: true },
        { label: 'TERMINATED', active: true },
      ]},
    },
  ],
},

'creating-threads': {
  language: 'java',
  fileName: 'CreatingThreads.java',
  steps: [
    {
      title: 'Way 1 — extends Thread (avoid)',
      description: 'Subclass Thread and override run(). Works, but couples your domain class to the framework and blocks single inheritance for anything else.',
      code:
`class DownloadThread extends Thread {
    @Override public void run() { fetch(url); }
}
new DownloadThread().start();`,
      highlight: [1, 2, 3, 4],
      diagram: { kind: 'boxes', title: 'extends Thread', items: [
        { label: 'Thread',          value: 'framework class' },
        { label: 'DownloadThread',  value: 'your class' , highlight: true },
        { label: '.start()',        value: '→ new OS thread' },
      ]},
    },
    {
      title: 'Way 2 — implements Runnable (idiomatic)',
      description: 'A Runnable is any (void, no-args) function. Decoupled from Thread. Same class can be scheduled by ANY executor.',
      code:
`Runnable r = () -> fetch(url);
new Thread(r, "download-1").start();`,
      highlight: [1, 2],
      diagram: { kind: 'boxes', title: 'Runnable = a lambda / class', items: [
        { label: 'Runnable',  value: 'void run()', highlight: true },
        { label: 'new Thread(r)' },
        { label: '.start()',  value: '→ new OS thread' },
      ]},
    },
    {
      title: 'Way 3 — Callable<T> + Future<T>',
      description: 'Callable can RETURN a value and throw checked exceptions — unlike Runnable. Submit to an ExecutorService; get a Future<T> handle.',
      code:
`ExecutorService exec = Executors.newFixedThreadPool(4);
Future<Integer> f = exec.submit(() -> {
    Thread.sleep(200);
    return 6 * 7;
});
int result = f.get();   // blocks until done, returns 42`,
      highlight: [2, 3, 4, 5, 6],
      diagram: { kind: 'sequence', actors: ['caller', 'ExecutorService', 'worker'],
        messages: [
          { from: 'caller',          to: 'ExecutorService', label: 'submit(callable)' },
          { from: 'ExecutorService', to: 'worker',          label: 'run task' },
          { from: 'worker',          to: 'ExecutorService', label: 'return 42' },
          { from: 'ExecutorService', to: 'caller',          label: 'future.get() → 42' },
        ]},
    },
    {
      title: 'Way 4 — ExecutorService (prod default)',
      description: 'Reuses a fixed pool of threads. NEVER call `new Thread()` in a request handler — it uncaps concurrency and OOMs under load.',
      code:
`ExecutorService pool = Executors.newFixedThreadPool(8);
for (Url url : urls) pool.submit(() -> fetch(url));
pool.shutdown();`,
      highlight: [1, 2, 3],
      diagram: { kind: 'threadpool', capacity: 6, workers: [
        { name: 'worker-1', state: 'RUNNABLE' },
        { name: 'worker-2', state: 'RUNNABLE' },
        { name: 'worker-3', state: 'RUNNABLE' },
        { name: 'worker-4', state: 'WAITING', note: 'idle' },
      ], queue: [
        { label: 'T5', value: 'fetch(url5)' },
        { label: 'T6', value: 'fetch(url6)' },
      ]},
    },
    {
      title: 'Way 5 — Virtual thread (Java 21+)',
      description: 'Cheap. Millions per JVM. Use for I/O-bound blocking work. See the "virtual-threads" topic for full details.',
      code:
`try (ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor()) {
    for (Url url : urls) exec.submit(() -> fetch(url));
}   // shuts down cleanly`,
      highlight: [1, 2, 3],
      diagram: { kind: 'threads', threads: [
        { name: 'vt-#31', state: 'RUNNABLE', note: 'virtual' },
        { name: 'vt-#32', state: 'RUNNABLE', note: 'virtual' },
        { name: 'vt-#33', state: 'WAITING',  note: 'parked · cheap' },
      ]},
    },
  ],
},

'thread-synchronization': {
  language: 'java',
  fileName: 'SyncCounter.java',
  steps: [
    {
      title: 'Two threads, no sync → race',
      description: 'counter++ is read + add + write. Both threads read the same value, add 1, write 1. One increment is lost.',
      code:
`static int counter = 0;

void bump() {
    counter++;         // NOT atomic: read, add, write
}`,
      highlight: [4],
      diagram: { kind: 'sequence', actors: ['T1', 'counter', 'T2'],
        messages: [
          { from: 'T1', to: 'counter', label: 'read 0' },
          { from: 'T2', to: 'counter', label: 'read 0' },
          { from: 'T1', to: 'counter', label: 'write 1' },
          { from: 'T2', to: 'counter', label: 'write 1 (lost)' },
        ]},
    },
    {
      title: 'synchronized — the monitor turnstile',
      description: 'Every object has an intrinsic monitor. Wrap the critical section in synchronized(lock) — only one thread at a time can hold the monitor.',
      code:
`private final Object lock = new Object();

void bump() {
    synchronized (lock) {   // acquire monitor
        counter++;
    }                        // release monitor
}`,
      highlight: [4, 5, 6],
      diagram: { kind: 'threads', threads: [
        { name: 'T1', state: 'RUNNABLE', note: 'owns monitor · bumps counter' },
        { name: 'T2', state: 'BLOCKED',  note: 'waiting for monitor' },
      ], monitor: { name: 'lock', owner: 'T1', waiters: ['T2'] } },
    },
    {
      title: 'wait() releases the monitor',
      description: 'Inside a synchronized block, wait() atomically releases the monitor AND parks the thread. Another thread can enter and mutate state, then call notify().',
      code:
`synchronized (queue) {
    while (queue.isEmpty()) {
        queue.wait();       // releases monitor, blocks
    }
    return queue.remove();
}`,
      highlight: [2, 3],
      diagram: { kind: 'threads', threads: [
        { name: 'consumer', state: 'WAITING',  note: 'inside wait()' },
        { name: 'producer', state: 'RUNNABLE', note: 'about to put + notify' },
      ], monitor: { name: 'queue', owner: '(free)', waiters: ['consumer'] } },
    },
    {
      title: 'notify() → consumer wakes',
      description: 'producer calls queue.notify() (or notifyAll()) inside its own synchronized block. The consumer wakes, re-acquires the monitor, re-checks the while, and proceeds.',
      code:
`synchronized (queue) {
    queue.add(item);
    queue.notifyAll();      // wake all waiters
}`,
      highlight: [1, 2, 3],
      diagram: { kind: 'threads', threads: [
        { name: 'consumer', state: 'RUNNABLE', note: 'woken, holds monitor' },
        { name: 'producer', state: 'RUNNABLE', note: 'released monitor' },
      ]},
    },
    {
      title: 'Use a dedicated final lock object',
      description: 'Never synchronize on `this`, on `String` literals, or on boxed primitives — anyone can synchronize on those objects and deadlock you. Use a private final Object.',
      code:
`class BankAccount {
    private final Object balanceLock = new Object();   // safe
    private long cents;

    public void deposit(long c) {
        synchronized (balanceLock) { cents += c; }
    }
}`,
      highlight: [2, 5, 6],
      diagram: { kind: 'boxes', title: 'Lock target choice', items: [
        { label: 'private final Object', highlight: true, color: '#10b981' },
        { label: 'this', color: '#ef4444' },
        { label: '"literal"', color: '#ef4444' },
        { label: 'Integer.valueOf(1)', color: '#ef4444' },
      ]},
    },
  ],
},

'locks-concurrency': {
  language: 'java',
  fileName: 'Locks.java',
  steps: [
    {
      title: 'ReentrantLock — synchronized on steroids',
      description: 'Same semantics as synchronized (mutual exclusion + reentrancy) but adds tryLock, timeouts, interruptible acquire, fairness, and multiple conditions.',
      code:
`Lock lock = new ReentrantLock();
lock.lock();
try {
    // critical section
} finally {
    lock.unlock();   // MUST be in finally
}`,
      highlight: [2, 3, 4, 5, 6],
      diagram: { kind: 'threads', threads: [
        { name: 'T1', state: 'RUNNABLE', note: 'holds ReentrantLock' },
        { name: 'T2', state: 'WAITING',  note: 'lock.lock() parks here' },
      ]},
    },
    {
      title: 'tryLock(200ms) — give up instead of hang',
      description: 'The request thread should never block indefinitely. tryLock with timeout returns false if it can\'t grab the lock — the caller responds with a 503 or degrades gracefully.',
      code:
`if (lock.tryLock(200, MILLISECONDS)) {
    try { transfer(); } finally { lock.unlock(); }
} else {
    metrics.increment("lock.timeout");
    return Response.serviceUnavailable();
}`,
      highlight: [1, 4, 5],
      diagram: { kind: 'flow', steps: [
        { label: 'tryLock(200ms)', done: true },
        { label: 'acquired?', active: true, note: 'branch on outcome' },
        { label: 'YES → do work → unlock', done: true },
        { label: 'NO → return 503' },
      ]},
    },
    {
      title: 'ReadWriteLock — many readers, one writer',
      description: 'Read-heavy config caches use ReadWriteLock. Any number of readers pass concurrently; a writer temporarily blocks NEW readers until it finishes.',
      code:
`ReadWriteLock rw = new ReentrantReadWriteLock();
Lock r = rw.readLock();
Lock w = rw.writeLock();

// hot path
r.lock(); try { return config.get(key); } finally { r.unlock(); }

// rare reload
w.lock(); try { config.putAll(fresh); } finally { w.unlock(); }`,
      highlight: [5, 8],
      diagram: { kind: 'threads', threads: [
        { name: 'reader-1', state: 'RUNNABLE', note: 'holds read lock' },
        { name: 'reader-2', state: 'RUNNABLE', note: 'holds read lock' },
        { name: 'reader-3', state: 'RUNNABLE', note: 'holds read lock' },
        { name: 'writer',   state: 'WAITING',  note: 'waits for readers to drain' },
      ]},
    },
    {
      title: 'StampedLock — optimistic read',
      description: 'For hyper-hot getters. Grab a stamp WITHOUT locking, read the fields, then validate. If a writer sneaked in, retry with pessimistic read.',
      code:
`long stamp = sl.tryOptimisticRead();
double cx = x, cy = y;
if (!sl.validate(stamp)) {
    stamp = sl.readLock();
    try { cx = x; cy = y; } finally { sl.unlockRead(stamp); }
}`,
      highlight: [1, 2, 3],
      diagram: { kind: 'flow', steps: [
        { label: 'tryOptimisticRead() — no lock', done: true },
        { label: 'read fields', done: true },
        { label: 'validate(stamp) — did a writer sneak in?', active: true },
        { label: 'YES → retry with readLock()' },
      ]},
    },
    {
      title: 'Condition — replaces wait/notify',
      description: 'One ReentrantLock can host multiple Conditions. producers wait on notFull, consumers on notEmpty — no more "wake everyone and re-check".',
      code:
`Lock lock = new ReentrantLock();
Condition notFull  = lock.newCondition();
Condition notEmpty = lock.newCondition();

// consumer
lock.lock();
try { while (q.isEmpty()) notEmpty.await(); q.remove(); notFull.signal(); }
finally { lock.unlock(); }`,
      highlight: [2, 3, 7],
      diagram: { kind: 'boxes', title: 'Two waiting rooms · one lock', items: [
        { label: 'notFull',  value: 'producers wait',   color: '#f59e0b' },
        { label: 'notEmpty', value: 'consumers wait',   color: '#10b981' },
      ]},
    },
  ],
},

'volatile-atomic': {
  language: 'java',
  fileName: 'VolatileAtomic.java',
  steps: [
    {
      title: 'The visibility bug',
      description: 'Without volatile, the JIT may hoist the read of `running` out of the loop — reader never sees the flip. The worker spins forever.',
      code:
`static boolean running = true;

Thread worker = new Thread(() -> {
    while (running) { /* ... */ }   // JIT may optimise to while(true)!
});`,
      highlight: [1, 4],
      diagram: { kind: 'memory',
        stack: [{ label: 'running (cached)', value: 'true', type: 'CPU-cache', highlight: true }],
        heap:  [{ label: 'static running',   fields: [['value', 'false — updated by main']], highlight: true }],
      },
    },
    {
      title: 'volatile — publish + republish',
      description: 'Adding volatile forces every write to be published to main memory and every read to fetch it. Establishes a happens-before edge between the writer and the reader.',
      code:
`static volatile boolean running = true;

// main
running = false;   // publish · visible immediately to all threads`,
      highlight: [1, 4],
      diagram: { kind: 'sequence', actors: ['main', 'main-memory', 'worker'], messages: [
        { from: 'main',        to: 'main-memory', label: 'volatile write: running=false' },
        { from: 'main-memory', to: 'worker',      label: 'volatile read: running=false' },
      ]},
    },
    {
      title: 'volatile is NOT enough for counter++',
      description: 'volatile makes each individual read and write visible. But `counter++` is three ops: read, add, write. Two threads can still both read the same value and lose an increment.',
      code:
`static volatile int counter = 0;
// Thread 1               // Thread 2
counter++;                counter++;
// read 0, add 1, write 1 // read 0, add 1, write 1  → LOST INCREMENT`,
      highlight: [3, 4, 5],
      diagram: { kind: 'boxes', title: 'Not enough', items: [
        { label: 'visibility', color: '#10b981', value: '✓ volatile' },
        { label: 'atomic++',   color: '#ef4444', value: '✗ still racy' },
      ]},
    },
    {
      title: 'AtomicInteger.incrementAndGet — CAS',
      description: 'AtomicInteger uses a hardware compare-and-swap. The increment is atomic. No lock, no context switch — just a retry loop that almost always succeeds on the first attempt.',
      code:
`AtomicInteger counter = new AtomicInteger();
counter.incrementAndGet();   // atomic ++

// Under the hood:
// do {
//   int old = get();
//   int next = old + 1;
// } while (!compareAndSet(old, next));`,
      highlight: [1, 2],
      diagram: { kind: 'flow', steps: [
        { label: 'read current value (old)', done: true },
        { label: 'compute new value (old+1)', done: true },
        { label: 'CAS(old → new)', active: true },
        { label: 'success? → done · else → retry' },
      ]},
    },
    {
      title: 'LongAdder — striped counter for hot writes',
      description: 'On 16+ cores, AtomicLong becomes a cache-line hotspot. LongAdder shards writes across an array of cells (per-thread). Reads are slower (walks all cells) but writes are ~10× faster under contention.',
      code:
`LongAdder adder = new LongAdder();
adder.increment();      // per-thread cell → tiny contention
adder.increment();
long total = adder.sum();   // sums cells`,
      highlight: [1, 2, 3, 4],
      diagram: { kind: 'boxes', title: 'LongAdder cells', items: [
        { label: 'cell[0]', value: '2317', color: '#818cf8' },
        { label: 'cell[1]', value: '2201', color: '#818cf8' },
        { label: 'cell[2]', value: '2119', color: '#818cf8' },
        { label: 'cell[3]', value: '2408', color: '#818cf8' },
        { label: 'sum()',   value: '9045', color: '#10b981', highlight: true },
      ]},
    },
  ],
},

'executor-framework': {
  language: 'java',
  fileName: 'Executors.java',
  steps: [
    {
      title: 'Submit → queue',
      description: 'Caller calls pool.submit(task). If a worker is free (below corePoolSize) it runs immediately; otherwise the task goes into the queue.',
      code: `ExecutorService pool = new ThreadPoolExecutor(
    2, 4, 60, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(3));
pool.submit(() -> handle(request));`,
      highlight: [4],
      diagram: { kind: 'threadpool', capacity: 3, workers: [
        { name: 'worker-1', state: 'RUNNABLE' },
        { name: 'worker-2', state: 'RUNNABLE' },
      ], queue: [ { label: 'T3' } ]},
    },
    {
      title: 'Queue full → grow pool up to max',
      description: 'When the queue is FULL AND submissions keep arriving, the executor spawns extra workers up to maximumPoolSize.',
      code: `new ThreadPoolExecutor(
    2,        // core
    4,        // max — extra 2 workers when queue is full
    60, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(3));`,
      highlight: [1, 2, 3, 4, 5],
      diagram: { kind: 'threadpool', capacity: 3, workers: [
        { name: 'worker-1', state: 'RUNNABLE' },
        { name: 'worker-2', state: 'RUNNABLE' },
        { name: 'worker-3', state: 'RUNNABLE', note: 'spawned (queue full)' },
        { name: 'worker-4', state: 'RUNNABLE', note: 'spawned (queue full)' },
      ], queue: [{ label: 'T3' }, { label: 'T4' }, { label: 'T5' }]},
    },
    {
      title: 'Beyond max → rejection policy',
      description: 'Queue is full AND all max workers are busy → the RejectedExecutionHandler decides: abort (throw), callerRuns (submit thread does the work), discard, or discardOldest.',
      code: `new ThreadPoolExecutor(
    ...,
    new ThreadPoolExecutor.CallerRunsPolicy());   // back-pressure`,
      highlight: [3],
      diagram: { kind: 'boxes', title: 'Rejection policies', items: [
        { label: 'AbortPolicy',        color: '#ef4444', value: 'throws' },
        { label: 'CallerRunsPolicy',   color: '#10b981', value: 'submitter runs it', highlight: true },
        { label: 'DiscardPolicy',      color: '#f59e0b', value: 'silently drop new' },
        { label: 'DiscardOldestPolicy',color: '#f59e0b', value: 'drop head, retry submit' },
      ]},
    },
    {
      title: 'submit vs execute — the Future',
      description: 'execute(Runnable) is fire-and-forget. submit(Callable<T>) returns a Future<T> — .get() blocks until the result arrives OR the task throws (wrapped in ExecutionException).',
      code:
`Future<Integer> f = pool.submit(() -> 6 * 7);
int result = f.get();   // 42
try { pool.submit(this::mightFail).get(); }
catch (ExecutionException ee) { log.error("task failed", ee.getCause()); }`,
      highlight: [1, 2, 3, 4],
      diagram: { kind: 'sequence', actors: ['caller', 'pool', 'worker'], messages: [
        { from: 'caller', to: 'pool',   label: 'submit(callable)' },
        { from: 'pool',   to: 'worker', label: 'run' },
        { from: 'worker', to: 'pool',   label: 'return 42' },
        { from: 'pool',   to: 'caller', label: 'future.get() → 42' },
      ]},
    },
    {
      title: 'Graceful shutdown',
      description: 'shutdown() → stop accepting new; awaitTermination → wait for in-flight to finish; shutdownNow() → interrupt what\'s still running.',
      code:
`pool.shutdown();
if (!pool.awaitTermination(30, SECONDS)) {
    pool.shutdownNow();
    pool.awaitTermination(10, SECONDS);
}`,
      highlight: [1, 2, 3, 4, 5],
      diagram: { kind: 'flow', steps: [
        { label: 'shutdown() — reject new tasks', done: true },
        { label: 'await 30s for in-flight', done: true },
        { label: 'still running? shutdownNow() — interrupt', active: true },
        { label: 'await 10s for cleanup' },
      ]},
    },
  ],
},

'thread-pools': {
  language: 'java',
  fileName: 'PoolSizing.java',
  steps: [
    {
      title: 'The sizing formula',
      description: 'Goetz\'s formula for I/O-bound work: Nthreads = Ncores × Ucpu × (1 + W/C). W = avg wait per task. C = avg CPU per task. Ucpu = target 0.7–0.9.',
      code:
`// 4-core box, task = 40ms DB call + 5ms Java compute
int cores = 4;
double W = 40, C = 5, U = 0.8;
int nThreads = (int)(cores * U * (1 + W / C));   // ≈ 29`,
      highlight: [3, 4],
      diagram: { kind: 'boxes', title: 'Formula inputs', items: [
        { label: 'Ncpu',  value: '4',    color: '#818cf8' },
        { label: 'Ucpu',  value: '0.8',  color: '#818cf8' },
        { label: 'W (ms)',value: '40',   color: '#f59e0b' },
        { label: 'C (ms)',value: '5',    color: '#f59e0b' },
        { label: 'N',     value: '≈ 29', color: '#10b981', highlight: true },
      ]},
    },
    {
      title: 'FIXED pool — bounded threads, unbounded queue (danger)',
      description: 'Executors.newFixedThreadPool(N) uses an unbounded LinkedBlockingQueue. Under a burst, tasks pile up in memory → OOM before anyone gets rejected.',
      code: `ExecutorService pool = Executors.newFixedThreadPool(10);
// queue = LinkedBlockingQueue<>()  ← Integer.MAX_VALUE capacity!`,
      highlight: [1, 2],
      diagram: { kind: 'threadpool', capacity: 20, workers: [
        { name: 'w-1', state: 'RUNNABLE' }, { name: 'w-2', state: 'RUNNABLE' },
        { name: 'w-3', state: 'RUNNABLE' }, { name: 'w-4', state: 'RUNNABLE' },
      ], queue: Array.from({length: 18}, (_, i) => ({ label: 'T' + (i+5), highlight: i > 10 }))},
    },
    {
      title: 'CACHED pool — unbounded threads (danger²)',
      description: 'Executors.newCachedThreadPool: max = Integer.MAX_VALUE, SynchronousQueue. On a burst of 10 000 blocking tasks it spawns 10 000 OS threads and OOMs.',
      code: `ExecutorService pool = Executors.newCachedThreadPool();
// max=MAX_VALUE, SynchronousQueue(hand-off)`,
      highlight: [1, 2],
      diagram: { kind: 'threadpool', capacity: 0, workers: [
        { name: 'w-1',   state: 'RUNNABLE' }, { name: 'w-2',   state: 'RUNNABLE' },
        { name: 'w-3',   state: 'RUNNABLE' }, { name: 'w-4',   state: 'RUNNABLE' },
        { name: 'w-500', state: 'RUNNABLE', note: '…thousands' },
      ], queue: []},
    },
    {
      title: 'Production pattern — bounded queue + CallerRuns',
      description: 'Explicit ThreadPoolExecutor with bounded queue AND back-pressure. When the queue is full and max is reached, the submitter runs the task itself — throughput self-limits gracefully.',
      code:
`new ThreadPoolExecutor(
    20, 40, 60, TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(200),
    namedFactory("outbound"),
    new ThreadPoolExecutor.CallerRunsPolicy());`,
      highlight: [1, 2, 3, 4, 5],
      diagram: { kind: 'threadpool', capacity: 12, workers: [
        { name: 'w-1', state: 'RUNNABLE' }, { name: 'w-2', state: 'RUNNABLE' },
        { name: 'w-3', state: 'RUNNABLE' }, { name: 'w-4', state: 'RUNNABLE' },
      ], queue: [ { label: 'T5', highlight: true }, { label: 'T6' }, { label: 'T7' } ]},
    },
    {
      title: 'Bulkhead — pool per failure domain',
      description: 'Never share ONE pool across fast/slow work. Separate pools for DB, external partner, and CPU-heavy tasks so a stuck partner API doesn\'t starve DB reads.',
      code:
`@Bean("dbPool")      ThreadPoolTaskExecutor dbPool()       { ... 20/40/500 ... }
@Bean("partnerPool") ThreadPoolTaskExecutor partnerPool()  { ... 10/10/50  ... }
@Bean("cpuPool")     ThreadPoolTaskExecutor cpuPool()      { ... cores/cores/100 ... }`,
      highlight: [1, 2, 3],
      diagram: { kind: 'boxes', title: 'Bulkheads', items: [
        { label: 'dbPool',      value: '20/40/500', color: '#10b981' },
        { label: 'partnerPool', value: '10/10/50',  color: '#f59e0b' },
        { label: 'cpuPool',     value: 'N+1/N+1/100', color: '#818cf8' },
      ]},
    },
  ],
},

'completable-future': {
  language: 'java',
  fileName: 'CFPipeline.java',
  steps: [
    {
      title: 'supplyAsync — start on a background pool',
      description: 'A CompletableFuture starts on your Executor (or ForkJoinPool.commonPool if omitted). The caller thread is free immediately.',
      code:
`CompletableFuture<String> cf = CompletableFuture
    .supplyAsync(() -> loadUser(id), userExecutor);`,
      highlight: [1, 2],
      diagram: { kind: 'sequence', actors: ['caller', 'userExecutor'], messages: [
        { from: 'caller',       to: 'userExecutor', label: 'supplyAsync' },
        { from: 'userExecutor', to: 'caller',       label: 'return CF (not yet complete)' },
      ]},
    },
    {
      title: 'thenApply — transform the value',
      description: 'thenApply runs its function ON the thread that completed the previous stage. Use thenApplyAsync(fn, exec) to hop back to your own pool.',
      code:
`cf.thenApply(user -> user.name().toUpperCase())
  .thenAccept(name -> log.info("hello {}", name));`,
      highlight: [1, 2],
      diagram: { kind: 'flow', steps: [
        { label: 'supplyAsync — loadUser(id)', done: true },
        { label: 'thenApply — .name().toUpperCase()', active: true },
        { label: 'thenAccept — log' },
      ]},
    },
    {
      title: 'thenCombine — merge two parallel calls',
      description: 'Fire user AND address CFs in parallel; combine when both complete. Combiner runs on whichever thread completed last.',
      code:
`var userCF    = supplyAsync(() -> loadUser(id),    pool);
var addressCF = supplyAsync(() -> loadAddress(id), pool);
var profile   = userCF.thenCombine(addressCF, Profile::new);`,
      highlight: [1, 2, 3],
      diagram: { kind: 'sequence', actors: ['caller', 'userService', 'addressService'], messages: [
        { from: 'caller',         to: 'userService',    label: 'loadUser' },
        { from: 'caller',         to: 'addressService', label: 'loadAddress' },
        { from: 'userService',    to: 'caller',         label: '↩' },
        { from: 'addressService', to: 'caller',         label: '↩' },
      ]},
    },
    {
      title: 'exceptionally — fallback',
      description: 'Any exception in the upstream chain flows into exceptionally. Return a fallback value of the same type. Or use `handle` for finer control.',
      code:
`cf.thenApply(User::name)
  .exceptionally(t -> "guest")   // any upstream failure → "guest"
  .thenAccept(System.out::println);`,
      highlight: [1, 2, 3],
      diagram: { kind: 'flow', steps: [
        { label: 'supplyAsync — loadUser(id)', done: true, note: 'throws NotFound' },
        { label: 'thenApply — User::name', done: true },
        { label: 'exceptionally — "guest"', active: true },
      ]},
    },
    {
      title: 'Timeouts — orTimeout / completeOnTimeout',
      description: 'Every call needs a budget. orTimeout completes exceptionally with TimeoutException; completeOnTimeout falls back to a value. Underlying task is NOT cancelled — you must do that yourself if you need to.',
      code:
`recCF.completeOnTimeout(List.of(), 500, MILLISECONDS)   // best-effort
     .exceptionally(t -> List.of());`,
      highlight: [1, 2],
      diagram: { kind: 'boxes', title: 'Timeouts', items: [
        { label: 'orTimeout',           value: 'fail after N ms',    color: '#f59e0b' },
        { label: 'completeOnTimeout',   value: 'fallback after N ms', color: '#10b981' },
      ]},
    },
  ],
},

'fork-join-framework': {
  language: 'java',
  fileName: 'ParallelSum.java',
  steps: [
    {
      title: 'Divide the array',
      description: 'compute() checks if the slice is small enough. If yes, sum it sequentially. If no, split into two halves.',
      code:
`static final int THRESHOLD = 10_000;

protected Long compute() {
    if (hi - lo <= THRESHOLD) return sequentialSum();
    int mid = (lo + hi) >>> 1;
    ...
}`,
      highlight: [3, 4, 5, 6],
      diagram: { kind: 'boxes', title: 'Split', items: [
        { label: '[0 .. 10M]', color: '#818cf8', value: 'root' },
        { label: '[0 .. 5M]',  color: '#818cf8' },
        { label: '[5M .. 10M]',color: '#818cf8' },
      ]},
    },
    {
      title: 'fork one · compute the other',
      description: 'Idiomatic: fork() the left half onto the worker\'s deque; call compute() on the right half directly on THIS worker. Avoids the overhead of forking both.',
      code:
`ParallelSum left  = new ParallelSum(arr, lo, mid);
ParallelSum right = new ParallelSum(arr, mid, hi);
left.fork();
long rightSum = right.compute();
long leftSum  = left.join();
return leftSum + rightSum;`,
      highlight: [3, 4, 5],
      diagram: { kind: 'boxes', title: 'This worker\'s deque', items: [
        { label: 'left (forked)', color: '#f59e0b', highlight: true },
      ]},
    },
    {
      title: 'Work stealing',
      description: 'Idle workers steal from the BOTTOM of a busy worker\'s deque. Owner pushes/pops from the TOP (LIFO, cache-friendly). Steals rarely collide with the owner.',
      code:
`// worker-A deque:   [T5, T4, T3]   push/pop from top
//                            ↑
//                         steal ←── worker-B (idle)
//                         from bottom (FIFO)`,
      diagram: { kind: 'boxes', title: 'A\'s deque · B steals from bottom', items: [
        { label: 'T5', color: '#818cf8', value: 'top (owner)' },
        { label: 'T4', color: '#818cf8' },
        { label: 'T3', color: '#f59e0b', value: 'stolen by B ↗', highlight: true },
      ]},
    },
    {
      title: 'Combine',
      description: 'Each level combines left + right on its way up. leftSum + rightSum at each recursion returns the total to its parent.',
      code: `return leftSum + rightSum;   // combine phase`,
      highlight: [1],
      diagram: { kind: 'boxes', title: 'Combine tree', items: [
        { label: 'sum[0..5M]', value: '12500000' },
        { label: 'sum[5M..10M]', value: '37500000' },
        { label: 'root', value: '50000000', color: '#10b981', highlight: true },
      ]},
    },
    {
      title: 'When Fork/Join is WRONG',
      description: 'Blocking I/O: pool sizes to N-1 cores; a blocked worker cannot steal. Use ThreadPoolExecutor instead.\nSmall workloads: fork overhead dominates below ~10 μs / task.\nUnbalanced trees: one worker does most of the work.',
      code: `// If tasks BLOCK on I/O, use a plain ThreadPoolExecutor,\n// not ForkJoinPool.`,
      diagram: { kind: 'boxes', title: 'Anti-patterns', items: [
        { label: 'Blocking I/O',       color: '#ef4444' },
        { label: 'Small workloads',    color: '#ef4444' },
        { label: 'Deeply unbalanced',  color: '#ef4444' },
        { label: 'Balanced compute',   color: '#10b981', highlight: true },
      ]},
    },
  ],
},

'producer-consumer': {
  language: 'java',
  fileName: 'PC.java',
  steps: [
    {
      title: 'Bounded buffer',
      description: 'A fixed-capacity BlockingQueue between producer(s) and consumer(s). It smooths bursts AND provides back-pressure — full queue blocks the producer.',
      code: `BlockingQueue<Order> q = new LinkedBlockingQueue<>(100);`,
      highlight: [1],
      diagram: { kind: 'threadpool', capacity: 10, workers: [
        { name: 'producer', state: 'RUNNABLE' },
        { name: 'consumer', state: 'RUNNABLE' },
      ], queue: [{label: 'A'}, {label: 'B'}, {label: 'C'}, {label: 'D'}]},
    },
    {
      title: 'put() — blocks if full',
      description: 'Producer calls q.put(item). If the queue is full, put blocks until a consumer removes one — natural back-pressure.',
      code:
`while (true) {
    Order o = accept();
    q.put(o);           // blocks when q.size() == capacity
}`,
      highlight: [3],
      diagram: { kind: 'threads', threads: [
        { name: 'producer', state: 'WAITING', note: 'q full, put() blocks' },
        { name: 'consumer', state: 'RUNNABLE', note: 'processing 1 item' },
      ]},
    },
    {
      title: 'take() — blocks if empty',
      description: 'Consumer calls q.take(). If the queue is empty, take blocks until a producer adds one.',
      code:
`while (running) {
    Order o = q.take();   // blocks when empty
    charge(o);
}`,
      highlight: [2],
      diagram: { kind: 'threads', threads: [
        { name: 'producer', state: 'RUNNABLE', note: 'idle' },
        { name: 'consumer', state: 'WAITING',  note: 'q empty, take() blocks' },
      ]},
    },
    {
      title: 'Poison pill for clean shutdown',
      description: 'Producers push N sentinel objects (one per consumer). Each consumer, on seeing a poison pill, exits its loop. No shared flag needed.',
      code:
`static final Order POISON = new Order(-1);

// producer done
for (int i = 0; i < nConsumers; i++) q.put(POISON);

// consumer
Order o = q.take();
if (o == POISON) return;   // clean exit`,
      highlight: [1, 4, 8],
      diagram: { kind: 'boxes', title: 'Queue', items: [
        { label: 'A' }, { label: 'B' },
        { label: '💊', highlight: true, color: '#ef4444', value: 'poison' },
        { label: '💊', highlight: true, color: '#ef4444', value: 'poison' },
      ]},
    },
    {
      title: 'The pattern IS a thread pool',
      description: 'The ThreadPoolExecutor + LinkedBlockingQueue combination is exactly the producer-consumer pattern. Every executor.submit() is a producer; every worker is a consumer.',
      code:
`ThreadPoolExecutor pool = new ThreadPoolExecutor(
    4, 4, 0, TimeUnit.MILLISECONDS,
    new LinkedBlockingQueue<>(50),
    new ThreadPoolExecutor.CallerRunsPolicy());
pool.submit(task);   // producer`,
      highlight: [1, 2, 3, 4, 5],
      diagram: { kind: 'threadpool', capacity: 8, workers: [
        { name: 'worker-1', state: 'RUNNABLE' },
        { name: 'worker-2', state: 'RUNNABLE' },
        { name: 'worker-3', state: 'WAITING', note: 'idle' },
        { name: 'worker-4', state: 'WAITING', note: 'idle' },
      ], queue: [{label:'T5'}, {label:'T6'}, {label:'T7'}]},
    },
  ],
},

'deadlock-livelock-starvation': {
  language: 'java',
  fileName: 'Hazards.java',
  steps: [
    {
      title: 'Deadlock — the circular wait',
      description: 'Thread-1 holds lockA, wants lockB. Thread-2 holds lockB, wants lockA. Neither can proceed. Both consume 0 CPU. Deadlock.',
      code:
`// Thread 1                      // Thread 2
synchronized (lockA) {           synchronized (lockB) {
    synchronized (lockB) {           synchronized (lockA) {  // 💀
        ...                              ...`,
      highlight: [1, 2, 3, 4, 5],
      diagram: { kind: 'threads', threads: [
        { name: 'thread-1', state: 'BLOCKED', note: 'holds A, wants B' },
        { name: 'thread-2', state: 'BLOCKED', note: 'holds B, wants A' },
      ]},
    },
    {
      title: 'Fix 1 — Lock ordering',
      description: 'Give every lock a numeric ID. Always acquire the LOWER-ID lock first. Now one thread waits for the other; no cycle.',
      code:
`long lo = Math.min(a.id, b.id);
long hi = Math.max(a.id, b.id);
synchronized (lockFor(lo)) {
    synchronized (lockFor(hi)) {
        transfer(a, b, amount);
    }
}`,
      highlight: [1, 2, 3, 4],
      diagram: { kind: 'flow', steps: [
        { label: 'compute min(id)',    done: true },
        { label: 'lock the LOWER first', done: true },
        { label: 'then lock the HIGHER', active: true },
        { label: 'safe — no cycle possible' },
      ]},
    },
    {
      title: 'Fix 2 — tryLock with back-off',
      description: 'If you can\'t control lock order, use tryLock(timeout). If the second lock isn\'t available in time, release the first and retry with random back-off.',
      code:
`while (true) {
    if (lockA.tryLock(50, MS)) try {
        if (lockB.tryLock(50, MS)) try {
            doWork(); return;
        } finally { lockB.unlock(); }
    } finally { lockA.unlock(); }
    Thread.sleep(random.nextInt(20) + 5);   // jitter avoids livelock
}`,
      highlight: [8],
      diagram: { kind: 'flow', steps: [
        { label: 'tryLock A (50ms)',           active: true },
        { label: 'tryLock B (50ms)' },
        { label: 'both — do work + release' },
        { label: 'timeout → release A + sleep(random) + retry' },
      ]},
    },
    {
      title: 'Livelock — polite starvation',
      description: 'Both threads back off in lockstep, forever. RUNNABLE, 100% CPU, ZERO forward progress. The random back-off in the previous step is what breaks the symmetry.',
      code: `// Both threads: acquire, notice contention, release, retry, ... forever`,
      diagram: { kind: 'threads', threads: [
        { name: 'thread-1', state: 'RUNNABLE', note: 'polite retry loop' },
        { name: 'thread-2', state: 'RUNNABLE', note: 'polite retry loop' },
      ]},
    },
    {
      title: 'Starvation & detection',
      description: 'One thread never wins the race — often caused by unfair locks or priority inversion. Detect deadlocks live via ThreadMXBean.findDeadlockedThreads() → run every few seconds as a health check.',
      code:
`long[] ids = ManagementFactory.getThreadMXBean().findDeadlockedThreads();
if (ids != null) alert("DEADLOCK on threads: " + Arrays.toString(ids));`,
      highlight: [1, 2],
      diagram: { kind: 'boxes', title: 'Live diagnostics', items: [
        { label: 'jstack <pid>',      color: '#818cf8' },
        { label: 'findDeadlockedThreads()', color: '#10b981', highlight: true },
        { label: 'JFR / async-profiler',  color: '#818cf8' },
      ]},
    },
  ],
},

'virtual-threads': {
  language: 'java',
  fileName: 'VirtualThreads.java',
  steps: [
    {
      title: 'Platform threads — 1:1 with OS',
      description: 'Every Thread is a native OS thread. ~1 MB stack, ~1 ms creation. Practical limit: 10-20 thousand.',
      code:
`Thread t = new Thread(() -> handle(req));
t.start();
// Native OS thread created. Costly.`,
      highlight: [1, 2],
      diagram: { kind: 'boxes', title: 'Old model (1:1)', items: [
        { label: 'Thread',   value: '1 MB stack', color: '#ef4444' },
        { label: 'OS thread',value: 'kernel',      color: '#ef4444' },
        { label: 'CPU core' },
      ]},
    },
    {
      title: 'Virtual threads — M:N',
      description: 'A virtual thread is a lightweight Java object scheduled by the JVM on a small pool of platform CARRIER threads. Millions per JVM. Cost: ~1 KB heap, ~1 µs creation.',
      code:
`Thread.ofVirtual().start(() -> handle(req));
// JVM parks/mounts the virtual thread on any carrier`,
      highlight: [1, 2],
      diagram: { kind: 'boxes', title: 'New model (M:N)', items: [
        { label: 'vt1', color: '#818cf8' }, { label: 'vt2', color: '#818cf8' },
        { label: 'vt3', color: '#818cf8' }, { label: 'vt4', color: '#818cf8' },
        { label: '↕ carrier', color: '#10b981', highlight: true },
        { label: 'CPU core' },
      ]},
    },
    {
      title: 'Blocking is cheap — the JVM unmounts',
      description: 'When a virtual thread calls a blocking JDK API (Socket, HTTP, JDBC), the JVM unmounts the virtual thread — copies its stack to the heap — and frees the carrier for another virtual thread.',
      code:
`Thread.ofVirtual().start(() -> {
    HttpResponse<String> r = client.send(req, ofString());
    process(r);
});`,
      highlight: [2],
      diagram: { kind: 'sequence', actors: ['vt', 'JVM', 'carrier', 'OS'], messages: [
        { from: 'vt',      to: 'OS',       label: 'socket.read()' },
        { from: 'JVM',     to: 'carrier',  label: 'unmount vt' },
        { from: 'carrier', to: 'JVM',      label: 'ready for another vt' },
        { from: 'OS',      to: 'JVM',      label: 'data ready' },
        { from: 'JVM',     to: 'vt',       label: 'remount + resume' },
      ]},
    },
    {
      title: 'Pinning — the one footgun',
      description: 'A virtual thread canNOT be unmounted while holding a synchronized monitor or inside JNI. Blocking there PINS the carrier. Fix: use ReentrantLock instead of synchronized on hot paths.',
      code:
`// PINNING
synchronized (lock) {
    slowHttpCall();      // carrier is stuck!
}

// FIXED
Lock l = new ReentrantLock();
l.lock(); try { slowHttpCall(); } finally { l.unlock(); }
// Detect: -Djdk.tracePinnedThreads=full`,
      highlight: [2, 3, 4, 8, 9],
      diagram: { kind: 'boxes', title: 'Pinning triggers', items: [
        { label: 'synchronized', color: '#ef4444', highlight: true },
        { label: 'JNI',          color: '#ef4444' },
        { label: 'ReentrantLock', color: '#10b981' },
        { label: 'BlockingQueue', color: '#10b981' },
      ]},
    },
    {
      title: 'newVirtualThreadPerTaskExecutor',
      description: 'The recommended production API. Executes each task on a fresh virtual thread. Do NOT pool virtual threads — they are cheap and pooling defeats the point (and leaks ThreadLocal state).',
      code:
`try (ExecutorService exec = Executors.newVirtualThreadPerTaskExecutor()) {
    for (URL url : urls) exec.submit(() -> fetch(url));
}   // try-with-resources → clean shutdown`,
      highlight: [1, 2, 3],
      diagram: { kind: 'threadpool', capacity: 10, workers: [
        { name: 'carrier-1', state: 'RUNNABLE' },
        { name: 'carrier-2', state: 'RUNNABLE' },
        { name: 'carrier-3', state: 'RUNNABLE' },
        { name: 'carrier-4', state: 'RUNNABLE' },
      ], queue: Array.from({length: 8}, (_, i) => ({ label: 'vt' + (i + 5) }))},
    },
  ],
},

'concurrent-collections': {
  language: 'java',
  fileName: 'ConcurrentColl.java',
  steps: [
    {
      title: 'synchronizedMap — single lock, single lane',
      description: 'Collections.synchronizedMap wraps every op in ONE mutex. All reads and writes serialize on that single lock — 8 threads → 1 lane.',
      code:
`Map<K,V> m = Collections.synchronizedMap(new HashMap<>());
m.put(k, v);   // acquires the ONE global mutex`,
      highlight: [1, 2],
      diagram: { kind: 'threads', threads: [
        { name: 'T1', state: 'RUNNABLE', note: 'in map.put' },
        { name: 'T2', state: 'BLOCKED',  note: 'waiting on map mutex' },
        { name: 'T3', state: 'BLOCKED',  note: 'waiting on map mutex' },
        { name: 'T4', state: 'BLOCKED',  note: 'waiting on map mutex' },
      ]},
    },
    {
      title: 'ConcurrentHashMap — per-bucket lock',
      description: 'CHM stripes locks across buckets. Two writers touching DIFFERENT buckets pass concurrently. Reads are lock-free (volatile fields).',
      code:
`ConcurrentHashMap<K,V> chm = new ConcurrentHashMap<>();
chm.put(k1, v1);   // locks bucket[hash(k1) % N]
chm.put(k2, v2);   // locks bucket[hash(k2) % N] — no contention`,
      highlight: [2, 3],
      diagram: { kind: 'boxes', title: 'Buckets (independent locks)', items: [
        { label: 'b0', color: '#10b981', value: 'T1' },
        { label: 'b1', color: '#10b981', value: 'T2' },
        { label: 'b2' }, { label: 'b3' },
        { label: 'b4', color: '#10b981', value: 'T3' },
        { label: 'b5' }, { label: 'b6' },
      ]},
    },
    {
      title: 'merge — atomic counter update',
      description: 'The classic word-count in one atomic call. No lost updates, no external synchronization.',
      code:
`ConcurrentHashMap<String, Long> counts = new ConcurrentHashMap<>();
for (String w : words) counts.merge(w, 1L, Long::sum);`,
      highlight: [1, 2],
      diagram: { kind: 'sequence', actors: ['T1', 'chm', 'T2'], messages: [
        { from: 'T1', to: 'chm', label: 'merge("foo", 1, sum)' },
        { from: 'T2', to: 'chm', label: 'merge("foo", 1, sum)' },
        { from: 'chm', to: 'T1', label: '→ 1' },
        { from: 'chm', to: 'T2', label: '→ 2 (no lost update)' },
      ]},
    },
    {
      title: 'computeIfAbsent — at-most-once loader',
      description: 'Perfect for lazy caches. The function is guaranteed to run AT MOST ONCE per key across all threads. No external locking needed.',
      code:
`V v = cache.computeIfAbsent(key, k -> loader.apply(k));
// loader is called ONCE per key even under heavy contention`,
      highlight: [1, 2],
      diagram: { kind: 'threads', threads: [
        { name: 'T1', state: 'RUNNABLE', note: 'computes value for "foo"' },
        { name: 'T2', state: 'WAITING',  note: 'waits inside cIfA on same key' },
        { name: 'T3', state: 'RUNNABLE', note: 'different key — no wait' },
      ]},
    },
    {
      title: 'CopyOnWriteArrayList — many readers, rare writers',
      description: 'Every write copies the whole array. Zero-cost reads (snapshot). Perfect for listener lists / config observers where writes are rare.',
      code:
`CopyOnWriteArrayList<Listener> ls = new CopyOnWriteArrayList<>();
ls.add(listener);   // O(n) — copies the entire array

for (Listener l : ls) l.onEvent(e);   // O(1) unsynchronized read`,
      highlight: [1, 2, 4],
      diagram: { kind: 'boxes', title: 'Read-heavy · Write-rare', items: [
        { label: 'read',  value: 'lock-free', color: '#10b981', highlight: true },
        { label: 'write', value: 'O(n) copy', color: '#f59e0b' },
        { label: 'iter',  value: 'snapshot',  color: '#10b981' },
      ]},
    },
  ],
},

// ─── Fix the broken screen the user showed ─────────────────────────────
'data-types-and-variables': {
  language: 'java',
  fileName: 'Variables.java',
  steps: [
    {
      title: 'Declare a primitive int',
      description: 'A primitive int is stored directly on the thread stack. It takes exactly 4 bytes. No object header, no heap allocation — just the raw 4-byte value 42.',
      code:
`public class Variables {
    public static void main(String[] args) {
        int x = 42;
    }
}`,
      highlight: [3],
      diagram: { kind: 'memory',
        stack: [{ label: 'x', value: '42', type: 'int', highlight: true }],
        heap:  [],
      },
    },
    {
      title: 'Declare a reference type — String',
      description: 'Object references live on the stack. The actual char data lives on the heap. The stack cell holds a pointer (address) to the heap object.',
      code:
`String name = "Alice";
// stack: name = 0x1c40  (a pointer)
// heap:  0x1c40 -> String { value = "Alice" }`,
      highlight: [1, 2, 3],
      diagram: { kind: 'memory',
        stack: [
          { label: 'x',    value: '42',      type: 'int' },
          { label: 'name', value: '→ 0x1c40', type: 'ref', highlight: true },
        ],
        heap: [
          { label: 'String@0x1c40', fields: [['value', '"Alice"']], highlight: true },
        ]},
    },
    {
      title: 'Autoboxing — primitive → wrapper',
      description: 'Assigning an int to an Integer field/reference causes autoboxing. The JVM allocates an Integer object on the HEAP and puts a reference to it on the stack.',
      code: `Integer boxed = x;        // autoboxing: Integer.valueOf(42)
// stack: boxed = 0x2a3f
// heap:  0x2a3f -> Integer { value = 42 }`,
      highlight: [1, 2, 3],
      diagram: { kind: 'memory',
        stack: [
          { label: 'x',     value: '42',      type: 'int' },
          { label: 'name',  value: '→ 0x1c40', type: 'ref' },
          { label: 'boxed', value: '→ 0x2a3f', type: 'Integer', highlight: true },
        ],
        heap: [
          { label: 'String@0x1c40',  fields: [['value', '"Alice"']] },
          { label: 'Integer@0x2a3f', fields: [['value', '42']], highlight: true },
        ]},
    },
    {
      title: 'Integer cache — the == trap',
      description: 'For values in -128..127, Integer.valueOf returns a CACHED Integer. So `Integer.valueOf(42) == Integer.valueOf(42)` is true — but `Integer.valueOf(200) == Integer.valueOf(200)` is FALSE. Always use .equals for boxed types.',
      code:
`Integer a = 100, b = 100;
System.out.println(a == b);     // true — cached
Integer c = 200, d = 200;
System.out.println(c == d);     // false — new objects
System.out.println(c.equals(d)); // true — value comparison`,
      highlight: [1, 2, 3, 4, 5],
      diagram: { kind: 'boxes', title: 'Integer cache · –128 .. 127', items: [
        { label: '-128', color: '#818cf8' }, { label: '...', color: '#818cf8' },
        { label: '42',   color: '#10b981', highlight: true },
        { label: '100',  color: '#10b981' }, { label: '127',  color: '#818cf8' },
        { label: '200',  color: '#ef4444', value: 'NOT cached' },
      ]},
    },
    {
      title: 'Wrapper utility methods',
      description: 'Wrappers expose helpful static utilities: Integer.parseInt, Integer.max, Integer.bitCount, etc. And Integer.MAX_VALUE is the largest 32-bit int (2^31 - 1 = 2147483647).',
      code:
`int    n   = Integer.parseInt("42");   // parse
int    max = Integer.MAX_VALUE;         // 2^31 - 1
int    bit = Integer.bitCount(29);      // count 1-bits: 4
String hex = Integer.toHexString(255);  // "ff"`,
      highlight: [1, 2, 3, 4],
      diagram: { kind: 'boxes', title: 'Utility methods', items: [
        { label: 'parseInt',    color: '#818cf8' },
        { label: 'MAX_VALUE',   color: '#818cf8', value: '2147483647' },
        { label: 'bitCount',    color: '#818cf8' },
        { label: 'toHexString', color: '#818cf8' },
      ]},
    },
  ],
},

},   // end java-mastery

// ────────────────────────────────────────────────────────────────────────────
//  Spring Boot — Threading
// ────────────────────────────────────────────────────────────────────────────
'spring-boot': {

'spring-async': {
  language: 'java',
  fileName: 'AsyncFlow.java',
  steps: [
    {
      title: 'Controller returns immediately',
      description: 'The @RestController receives a request. It calls an @Async method, which the Spring AOP proxy reroutes onto a background TaskExecutor. The request thread is free.',
      code:
`@PostMapping("/register")
public ResponseEntity<Void> register(@RequestBody User u) {
    userRepo.save(u);
    emailService.sendWelcomeAsync(u);   // fires and forgets
    return ResponseEntity.accepted().build();
}`,
      highlight: [3, 4, 5],
      diagram: { kind: 'sequence', actors: ['client', 'controller', 'emailExecutor'], messages: [
        { from: 'client',     to: 'controller',   label: 'POST /register' },
        { from: 'controller', to: 'emailExecutor', label: 'submit sendWelcome' },
        { from: 'controller', to: 'client',       label: '202 Accepted (fast)' },
      ]},
    },
    {
      title: '@Async on the method',
      description: 'The service is a normal Spring bean. @Async tells Spring to intercept calls through a proxy and dispatch to a TaskExecutor. Return type CompletableFuture<T> gives the caller a handle to the result.',
      code:
`@Service
class EmailService {
    @Async("emailExecutor")
    public CompletableFuture<Boolean> sendWelcomeAsync(User u) {
        smtp.send(u.email(), template.render(u));
        return CompletableFuture.completedFuture(true);
    }
}`,
      highlight: [3, 4, 5, 6, 7],
      diagram: { kind: 'boxes', title: 'What @Async does', items: [
        { label: 'AOP proxy', color: '#818cf8' },
        { label: 'submit → TaskExecutor', color: '#10b981', highlight: true },
        { label: 'CompletableFuture', color: '#818cf8' },
      ]},
    },
    {
      title: 'Bounded executor — never SimpleAsyncTaskExecutor',
      description: 'The default @Async executor is SimpleAsyncTaskExecutor — it spawns unbounded threads. Always define your own bounded ThreadPoolTaskExecutor with CallerRunsPolicy.',
      code:
`@Bean("emailExecutor")
public Executor emailExecutor() {
    ThreadPoolTaskExecutor e = new ThreadPoolTaskExecutor();
    e.setCorePoolSize(5);
    e.setMaxPoolSize(10);
    e.setQueueCapacity(500);
    e.setThreadNamePrefix("email-");
    e.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
    e.initialize();
    return e;
}`,
      highlight: [4, 5, 6, 8],
      diagram: { kind: 'threadpool', capacity: 10, workers: [
        { name: 'email-1', state: 'RUNNABLE' },
        { name: 'email-2', state: 'RUNNABLE' },
        { name: 'email-3', state: 'WAITING', note: 'idle' },
        { name: 'email-4', state: 'WAITING', note: 'idle' },
        { name: 'email-5', state: 'WAITING', note: 'idle' },
      ], queue: [ { label: 'msg6' }, { label: 'msg7' } ]},
    },
    {
      title: 'The self-invocation trap',
      description: 'Calling an @Async method on `this` from within the SAME bean bypasses the proxy — the call runs SYNCHRONOUSLY. Split into two beans, or fetch the proxy via ApplicationContext.',
      code:
`@Service
class Bad {
    @Async public CompletableFuture<Void> heavy() { ... }

    public void go() {
        heavy();   // BUG: bypasses proxy, runs synchronously
    }
}`,
      highlight: [5, 6, 7],
      diagram: { kind: 'boxes', title: 'this.heavy() ≠ proxy.heavy()', items: [
        { label: 'this.heavy()',   color: '#ef4444', value: 'sync (bug)' },
        { label: 'other.heavy()',  color: '#10b981', value: 'async (via proxy)', highlight: true },
        { label: 'ctx.getBean(Bad).heavy()', color: '#10b981', value: 'async (fetch proxy)' },
      ]},
    },
    {
      title: 'MDC / SecurityContext propagation',
      description: 'By default the request thread\'s MDC (log context) and SecurityContext are NOT visible to the async thread. Fix with a TaskDecorator that copies both before running the task.',
      code:
`class ContextDecorator implements TaskDecorator {
    public Runnable decorate(Runnable r) {
        var mdc = MDC.getCopyOfContextMap();
        var sec = SecurityContextHolder.getContext();
        return () -> {
            try {
                if (mdc != null) MDC.setContextMap(mdc);
                SecurityContextHolder.setContext(sec);
                r.run();
            } finally { MDC.clear(); SecurityContextHolder.clearContext(); }
        };
    }
}`,
      highlight: [3, 4, 6, 7, 8],
      diagram: { kind: 'sequence', actors: ['request-thread', 'decorator', 'async-thread'], messages: [
        { from: 'request-thread', to: 'decorator',    label: 'capture MDC + Security' },
        { from: 'decorator',      to: 'async-thread', label: 'restore + run task' },
        { from: 'async-thread',   to: 'decorator',    label: 'finally: clear' },
      ]},
    },
  ],
},

'spring-scheduled': {
  language: 'java',
  fileName: 'Scheduler.java',
  steps: [
    {
      title: 'Enable and annotate',
      description: 'Add @EnableScheduling once. Then any @Component method annotated @Scheduled(...) becomes a timer.',
      code:
`@SpringBootApplication
@EnableScheduling
class App { public static void main(String[] a) { SpringApplication.run(App.class, a); } }

@Component
class Jobs {
    @Scheduled(fixedRate = 30_000)   // every 30s
    public void heartbeat() { metrics.gauge("up", 1); }
}`,
      highlight: [2, 6, 7, 8],
      diagram: { kind: 'flow', steps: [
        { label: '@EnableScheduling', done: true },
        { label: '@Scheduled(fixedRate = 30_000)', active: true },
        { label: 'ThreadPoolTaskScheduler fires it' },
      ]},
    },
    {
      title: 'fixedRate vs fixedDelay',
      description: 'fixedRate: start every N ms — successive runs can queue if the task takes longer than N. fixedDelay: wait N ms AFTER the previous run finishes — no queueing.',
      code:
`@Scheduled(fixedRate  = 5000)    // start every 5s (may overlap)
public void fast() { }

@Scheduled(fixedDelay = 5000)    // wait 5s after finish
public void slow() throws Exception { Thread.sleep(3000); }`,
      highlight: [1, 4],
      diagram: { kind: 'sequence', actors: ['fixedRate', 'fixedDelay'], messages: [
        { from: 'fixedRate',  to: 'fixedRate',  label: 't=0 · start' },
        { from: 'fixedRate',  to: 'fixedRate',  label: 't=5 · start (regardless of prev)' },
        { from: 'fixedDelay', to: 'fixedDelay', label: 't=0 · start' },
        { from: 'fixedDelay', to: 'fixedDelay', label: 't=8 · start (3s work + 5s delay)' },
      ]},
    },
    {
      title: 'Spring cron — SIX fields, not five',
      description: 'Spring cron has `second minute hour day-of-month month day-of-week` — six fields. Copy-pasting a Unix cron (5 fields) is a classic bug. Always specify a timezone.',
      code:
`@Scheduled(cron = "0 0 2 * * *", zone = "UTC")   // 02:00 UTC daily
public void nightlyBatch() { ... }

@Scheduled(cron = "0 */5 * * * MON-FRI", zone = "UTC")   // every 5min · weekdays
public void reconcile() { ... }`,
      highlight: [1, 4],
      diagram: { kind: 'boxes', title: 'Cron fields', items: [
        { label: 'second' }, { label: 'minute' }, { label: 'hour' },
        { label: 'day-of-month' }, { label: 'month' }, { label: 'day-of-week' },
      ]},
    },
    {
      title: 'Sizing the scheduler pool',
      description: 'The DEFAULT scheduler is single-threaded — a slow @Scheduled method blocks ALL others. Always configure pool size = at least the number of concurrent scheduled methods.',
      code:
`spring:
  task:
    scheduling:
      pool:
        size: 10
      thread-name-prefix: sched-`,
      language: 'yaml',
      highlight: [3, 4, 5],
      diagram: { kind: 'threadpool', capacity: 0, workers: [
        { name: 'sched-1', state: 'RUNNABLE', note: 'nightlyBatch' },
        { name: 'sched-2', state: 'RUNNABLE', note: 'reconcile' },
        { name: 'sched-3', state: 'WAITING',  note: 'idle' },
      ], queue: []},
    },
    {
      title: 'Distributed lock — ShedLock',
      description: 'With N replicas, a @Scheduled method fires N times. ShedLock writes a row to a shared DB — exactly ONE replica wins and runs. The others skip. Idempotency requires this.',
      code:
`@Scheduled(cron = "0 0 2 * * *", zone = "UTC")
@SchedulerLock(name = "sendInvoices", lockAtMostFor = "PT2H", lockAtLeastFor = "PT10M")
public void sendMonthlyInvoices() { ... }`,
      highlight: [1, 2, 3],
      diagram: { kind: 'threads', threads: [
        { name: 'replica-1', state: 'RUNNABLE',    note: 'holds ShedLock row' },
        { name: 'replica-2', state: 'TERMINATED', active: false, note: 'sees row locked → skip' },
        { name: 'replica-3', state: 'TERMINATED', active: false, note: 'sees row locked → skip' },
      ]},
    },
  ],
},

'spring-thread-pools': {
  language: 'java',
  fileName: 'PoolsConfig.java',
  steps: [
    {
      title: 'Tomcat request pool',
      description: 'Every HTTP request runs on a Tomcat worker thread. Configure size in application.yml. Formula: Ncpu × Ucpu × (1 + W/C).',
      code:
`server:
  tomcat:
    threads:
      max: 200
      min-spare: 10
    max-connections: 8192
    accept-count: 100`,
      language: 'yaml',
      highlight: [4, 5],
      diagram: { kind: 'threadpool', capacity: 100, workers: [
        { name: 'http-nio-1', state: 'RUNNABLE' },
        { name: 'http-nio-2', state: 'RUNNABLE' },
        { name: 'http-nio-3', state: 'RUNNABLE' },
        { name: 'http-nio-4', state: 'WAITING', note: 'idle' },
      ], queue: [
        { label: 'req5' }, { label: 'req6' }, { label: 'req7' }, { label: 'req8' },
      ]},
    },
    {
      title: 'ThreadPoolTaskExecutor — for @Async',
      description: 'Spring\'s wrapper around ThreadPoolExecutor. Adds lifecycle hooks, TaskDecorator, and Micrometer metrics. Always bounded, always CallerRunsPolicy.',
      code:
`@Bean("outbound")
ThreadPoolTaskExecutor outboundExecutor() {
    ThreadPoolTaskExecutor e = new ThreadPoolTaskExecutor();
    e.setCorePoolSize(20);
    e.setMaxPoolSize(40);
    e.setQueueCapacity(200);
    e.setThreadNamePrefix("outbound-");
    e.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
    e.setWaitForTasksToCompleteOnShutdown(true);
    e.setAwaitTerminationSeconds(30);
    e.initialize();
    return e;
}`,
      highlight: [4, 5, 6, 8, 9, 10],
      diagram: { kind: 'threadpool', capacity: 10, workers: [
        { name: 'outbound-1', state: 'RUNNABLE' },
        { name: 'outbound-2', state: 'RUNNABLE' },
        { name: 'outbound-3', state: 'RUNNABLE' },
      ], queue: [ { label: 'T4' }, { label: 'T5' } ]},
    },
    {
      title: 'ThreadPoolTaskScheduler — for @Scheduled',
      description: 'Separate pool for @Scheduled methods. Sizing = the number of scheduled methods that might overlap.',
      code:
`@Bean
ThreadPoolTaskScheduler taskScheduler() {
    ThreadPoolTaskScheduler s = new ThreadPoolTaskScheduler();
    s.setPoolSize(10);
    s.setThreadNamePrefix("sched-");
    s.setRemoveOnCancelPolicy(true);
    return s;
}`,
      highlight: [4, 5, 6],
      diagram: { kind: 'threadpool', capacity: 0, workers: [
        { name: 'sched-1', state: 'RUNNABLE' },
        { name: 'sched-2', state: 'WAITING' },
        { name: 'sched-3', state: 'WAITING' },
      ], queue: []},
    },
    {
      title: 'Bulkhead — one pool per failure domain',
      description: 'Never share a single executor across fast/slow work. Split into dbPool, partnerPool, cpuPool — a stuck partner API cannot starve the DB path.',
      code:
`@Bean("dbPool")      TPTaskExec dbPool()      { ... 20/40/500 CallerRuns ... }
@Bean("partnerPool") TPTaskExec partnerPool() { ... 10/10/50 CallerRuns ... }
@Bean("cpuPool")     TPTaskExec cpuPool()     { ... N/N/100 Abort ... }`,
      highlight: [1, 2, 3],
      diagram: { kind: 'boxes', title: 'Bulkheads', items: [
        { label: 'dbPool',      color: '#10b981' },
        { label: 'partnerPool', color: '#f59e0b' },
        { label: 'cpuPool',     color: '#818cf8' },
      ]},
    },
    {
      title: 'Micrometer observability',
      description: 'With Micrometer, every ThreadPoolTaskExecutor auto-exposes queue depth, active count, and completed count. Dashboards alert BEFORE the pool saturates.',
      code:
`ExecutorServiceMetrics.monitor(registry, e.getThreadPoolExecutor(), "outbound");
// exposes:
// executor_pool_size{name="outbound"}
// executor_active_threads{name="outbound"}
// executor_queued_tasks{name="outbound"}`,
      highlight: [1, 3, 4, 5],
      diagram: { kind: 'boxes', title: 'Metrics per pool', items: [
        { label: 'active',    color: '#10b981' },
        { label: 'queued',    color: '#f59e0b', highlight: true },
        { label: 'poolSize',  color: '#818cf8' },
        { label: 'completed', color: '#818cf8' },
      ]},
    },
  ],
},

'spring-virtual-threads': {
  language: 'java',
  fileName: 'Config.java',
  steps: [
    {
      title: 'Enable in one line',
      description: 'Spring Boot 3.2+ on Java 21+: one YAML flag switches Tomcat, @Async default executor, and @Scheduled scheduler to virtual threads.',
      code:
`spring:
  threads:
    virtual:
      enabled: true`,
      language: 'yaml',
      highlight: [4],
      diagram: { kind: 'boxes', title: 'One flag — three swaps', items: [
        { label: 'Tomcat executor',    color: '#10b981', highlight: true },
        { label: '@Async default',     color: '#10b981' },
        { label: '@Scheduled sched',   color: '#10b981' },
      ]},
    },
    {
      title: 'Before — 200 platform threads',
      description: 'Default Tomcat pool is 200. A slow endpoint (2s per request) can serve at most ~100 req/s before requests start timing out.',
      code:
`server:
  tomcat:
    threads: { max: 200 }
# Under load: 200 threads busy, next requests queue and time out.`,
      language: 'yaml',
      highlight: [1, 2, 3, 4],
      diagram: { kind: 'threadpool', capacity: 20, workers: [
        { name: 'http-1',   state: 'RUNNABLE' },
        { name: 'http-2',   state: 'RUNNABLE' },
        { name: 'http-3',   state: 'RUNNABLE' },
        { name: 'http-200', state: 'RUNNABLE' },
      ], queue: Array.from({length: 18}, (_, i) => ({ label: 'req' + i, highlight: i > 12 }))},
    },
    {
      title: 'After — unbounded virtual threads',
      description: 'Tomcat swaps its request executor for newVirtualThreadPerTaskExecutor. Each request runs on its own virtual thread. Blocking JPA / RestClient / JDBC all work unchanged.',
      code:
`// (No code change on the endpoint!)
@GetMapping("/slow")
public String slow() {
    String body = restClient.get()
        .uri("https://httpbin.org/delay/2").retrieve().body(String.class);
    return "ok " + Thread.currentThread().isVirtual();   // → true
}`,
      highlight: [4, 5, 6],
      diagram: { kind: 'threadpool', capacity: 10, workers: [
        { name: 'carrier-1', state: 'RUNNABLE', note: '2 vts mounted' },
        { name: 'carrier-2', state: 'RUNNABLE', note: '1 vt mounted' },
      ], queue: [ { label: 'vt-38' }, { label: 'vt-39' }, { label: 'vt-40' }, { label: 'vt-41' } ]},
    },
    {
      title: 'Pinning — detect and fix',
      description: 'A virtual thread cannot be unmounted while holding a `synchronized` monitor. That pins the carrier. Detect with -Djdk.tracePinnedThreads=full, then replace with ReentrantLock.',
      code:
`// PIN — carrier is stuck for 2s
synchronized (cacheLock) {
    return restClient.get()...body(String.class);
}

// FIX
lock.lock();
try { return restClient.get()...body(String.class); }
finally { lock.unlock(); }`,
      highlight: [2, 3, 4, 7, 8, 9],
      diagram: { kind: 'boxes', title: 'Pinning triggers', items: [
        { label: 'synchronized + blocking I/O', color: '#ef4444', highlight: true },
        { label: 'JNI + blocking I/O',          color: '#ef4444' },
        { label: 'ReentrantLock + blocking I/O',color: '#10b981' },
      ]},
    },
    {
      title: 'When virtual threads DON\'T help',
      description: 'CPU-bound work: no speedup — same carriers underneath. WebFlux: still preferable for SSE / WebSocket / end-to-end reactive back-pressure. Everything else — plain REST + JPA — virtual threads win.',
      code:
`// STILL use ForkJoin for CPU
parallelStream()... // don\'t force onto virtual threads

// STILL WebFlux for streaming
@GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<Event> stream() { return sse; }`,
      diagram: { kind: 'boxes', title: 'Choose your model', items: [
        { label: 'Blocking REST + JPA',   color: '#10b981', value: 'Virtual threads', highlight: true },
        { label: 'CPU-bound compute',      color: '#818cf8', value: 'ForkJoinPool' },
        { label: 'SSE / WebSocket / R2DBC',color: '#818cf8', value: 'WebFlux' },
      ]},
    },
  ],
},

},   // end spring-boot

};

