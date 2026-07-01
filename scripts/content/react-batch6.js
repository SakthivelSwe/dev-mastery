// Batch 6 — topics 26-31
module.exports = {
  'server-components': {
    feynman: `## FEYNMAN CHECK

### Explain React Server Components Like I'm 10 Years Old
> Server Components run ON THE SERVER — they can directly access databases, read files, and fetch data without sending JavaScript to the browser. Only their HTML output is sent. Client Components (\`'use client'\` directive) run in the browser and can use useState, useEffect, events. The non-obvious depth: Server Components have zero client-side JavaScript by default — they don't contribute to the JS bundle. A page can mix both: layout (Server Component, zero JS) wrapping an interactive counter (Client Component, small JS). This is the biggest shift in React since hooks — the component tree now spans TWO environments.

---

### 5 Deep Conceptual Questions

**Q1: What are the key differences between Server and Client Components?**
> **A:** SERVER: renders on server, can use async/await directly, accesses databases/file system/secrets, contributes 0 bytes to JS bundle, no useState/useEffect/events/browser APIs. CLIENT (\`'use client'\`): renders in browser, can use hooks, event handlers, browser APIs, localStorage. The decision rule: is this component interactive? Yes → Client. No → keep Server (default). Server Components can import Client Components; Client Components CANNOT import Server Components directly (but can render them via children prop).

**Q2: How does data fetching change with Server Components?**
> **A:** In Client Components, data fetch = useEffect + loading state + error state + race condition + cache. In Server Components: \`const data = await db.query('SELECT ...')\` — directly in the component function. No loading state needed (component doesn't render until data is ready). No API route needed for the data (direct DB access). React caches Server Component renders and deduplicates concurrent requests (React's fetch() wrapper in Next.js). This eliminates the client-server waterfall: no roundtrip from browser to API to database.

**Q3: Most dangerous misconception?**
> **A:** All components should be Server Components:
> \`\`\`tsx
> // ❌ WRONG: Server Component with useState
> // async-server-component.tsx (no 'use client')
> import { useState } from 'react'; // ERROR: hooks don't work in Server Components
> export async function Counter() {
>   const [count, setCount] = useState(0);  // throws at build time
>   return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
> }
>
> // ✅ CORRECT: split at the interactivity boundary
> // page.tsx — Server Component (can fetch DB directly)
> import { Counter } from './Counter';  // Client Component
> import { db } from '@/lib/db';
> export default async function Page() {
>   const initialCount = await db.getCount();  // direct DB access
>   return <Counter initialCount={initialCount} />;  // passes data as props
> }
>
> // Counter.tsx — MUST have 'use client' for interactivity
> 'use client';
> import { useState } from 'react';
> export function Counter({ initialCount }: { initialCount: number }) {
>   const [count, setCount] = useState(initialCount);
>   return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
> }
> \`\`\`

**Q4: What is streaming and Suspense in Server Components?**
> **A:** Without streaming: browser waits for the entire page to render on server before receiving any HTML. With streaming + Suspense: React sends the shell (layout, nav) immediately, then streams each Suspense boundary's resolved content as it completes. A slow database query for a blog post sidebar doesn't block the main article content from rendering. Next.js implements this via the App Router: wrap slow sections in \`<Suspense fallback={<Skeleton />}>\` and they stream in after the fast parts. Result: faster Time-to-First-Byte and better perceived performance.

**Q5: FAANG-grade definition.**
> **A:** "React Server Components are a React architecture (implemented in Next.js App Router) splitting components into two environments: Server Components (default, render on server, async/await data fetching with direct DB/file access, zero client JavaScript) and Client Components ('use client' directive, browser-side, hooks/events/browser APIs) — composable with Server Components passing serialisable props and children to Client Components — enabling elimination of API routes for data fetching (direct DB access in component), JS bundle reduction (Server Components contribute 0 bytes), and streaming via Suspense boundaries (shell renders immediately, slow components stream in) — with the constraint that Client Components cannot import Server Components (only render them as children), and Server Component props must be serialisable (no functions, class instances, or circular refs)."`,
    build: `## BUILD

### 🏗️ Mini Project: Next.js App Router Page — Server + Client Components

**What you will build:** A Next.js page with Server Component (DB fetch, 0 JS), a streaming Suspense boundary, and an interactive Client Component — showing the complete server/client split.
**Time estimate:** 30 minutes

---

#### Step 1
\`\`\`bash
npx create-next-app@latest sc-demo --typescript --tailwind --app && cd sc-demo
\`\`\`

#### Step 2 — Server Component Page (Direct DB-like Fetch)
\`\`\`tsx
// app/users/page.tsx — Server Component (no 'use client')
import { Suspense } from 'react';
import { UserList } from './UserList';
import { UserListSkeleton } from './UserListSkeleton';
import { LikeButton } from './LikeButton';  // Client Component

// This function runs on the SERVER — could be db.query() in real app
async function getUsers() {
  const res = await fetch('https://jsonplaceholder.typicode.com/users', {
    next: { revalidate: 60 }  // ISR: revalidate every 60 seconds
  });
  return res.json() as Promise<Array<{ id: number; name: string; email: string }>>;
}

// Server Component: async, direct data access, 0 client JS
export default async function UsersPage() {
  // Data fetched on server — no loading state, no useEffect
  const users = await getUsers();

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Users (Server Component)</h1>
      <p className="text-sm text-gray-500 mb-4">
        This page has 0 client-side JS from the page itself.
        Only LikeButton contributes to the bundle.
      </p>

      {/* Static server-rendered user list */}
      <ul className="border rounded mb-6">
        {users.map(user => (
          <li key={user.id} className="p-3 border-b flex justify-between items-center">
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            {/* Client Component embedded in Server Component */}
            <LikeButton userId={user.id} />
          </li>
        ))}
      </ul>

      {/* Streaming: slow component doesn't block above content */}
      <Suspense fallback={<UserListSkeleton />}>
        <SlowSection />
      </Suspense>
    </main>
  );
}

// Simulates a slow database query
async function SlowSection() {
  await new Promise(r => setTimeout(r, 2000));  // 2s delay
  return (
    <div className="p-4 bg-green-50 rounded">
      <p>This section streamed in after 2 seconds — page was usable immediately!</p>
    </div>
  );
}
\`\`\`

#### Step 3 — Client Component (Interactivity)
\`\`\`tsx
// app/users/LikeButton.tsx
'use client';  // REQUIRED for useState, event handlers
import { useState } from 'react';

export function LikeButton({ userId }: { userId: number }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  const toggle = () => {
    setLiked(l => !l);
    setCount(c => liked ? c - 1 : c + 1);
  };

  return (
    <button onClick={toggle}
      className={\`px-3 py-1 rounded text-sm \${liked ? 'bg-red-100 text-red-600' : 'bg-gray-100'}\`}>
      {liked ? '❤️' : '🤍'} {count > 0 ? count : ''}
    </button>
  );
}

// app/users/UserListSkeleton.tsx — Server Component (no 'use client')
export function UserListSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {[1,2,3].map(i => (
        <div key={i} className="h-16 bg-gray-200 rounded" />
      ))}
    </div>
  );
}
\`\`\`

#### Step 4 — Demonstrate Bundle Size Difference
\`\`\`bash
# Build and check bundle
npm run build
# Look at .next/server/ (Server Component output) vs .next/static/ (Client JS)
# LikeButton.js in static/ — small interactive bundle
# UsersPage is NOT in static/ — it's in server/ — contributes 0 bytes to browser
\`\`\`

**Expected Output:**
\`\`\`
Page loads: user list renders instantly (server HTML)
Like buttons are interactive (Client Component JS loaded)
After 2 seconds: streaming Suspense resolves, green box appears
Network tab: no getUsers API call from browser (server fetched it)
\`\`\``,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What can Server Components do that Client Components cannot?
**Q2:** What does 'use client' do?
**Q3:** Write a Server Component that fetches data directly. From memory.

### Day 3 — Comprehension
**Q4:** Can Client Components import Server Components?
**Q5:** A PR adds useState to a Server Component — what happens?
**Q6:** How does streaming work with Suspense in Server Components?

### Day 7 — Application
**Q7:** Split a dashboard page: server-rendered stats + client interactive chart.
**Q8:** A PR has a useEffect fetch in every page component — migrate to Server Components.
**Q9:** How do you pass non-serialisable data from Server to Client?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain React Server Components — what problem do they solve?"
**Q11:** Draw: RSC architecture — server renders → HTML stream → client hydrates Client Components only.
**Q12:** ★ System design: "Design a Next.js app for 1M users — which pages are RSC vs Client, where does data fetch?"`
  },

  'concurrent-features': {
    feynman: `## FEYNMAN CHECK

### Explain React Concurrent Features Like I'm 10 Years Old
> React 18 introduced CONCURRENT RENDERING: React can pause, interrupt, and restart rendering work based on priority. \`startTransition\` marks an update as LOW PRIORITY (interruptible). \`useDeferredValue\` delays a value update so urgent renders happen first. \`Suspense\` for data fetching lets components "wait" while a parent shows a fallback. Together, they make UIs feel instant: typing in a search box stays instant (high priority) while filtering 10K results renders in the background (low priority, interruptible).

---

### 5 Deep Conceptual Questions

**Q1: What is the difference between urgent and transition updates?**
> **A:** URGENT (direct interactions): typing, clicking, pressing — users expect immediate visual feedback. TRANSITION (secondary effects): filtering a large list, navigating to a new tab, rendering search results — users tolerate slight delay. \`startTransition(() => setSearchResults(filtered))\` marks the results update as a transition — React renders it at lower priority, keeps the input responsive, and will ABANDON the in-progress render if a new keystroke arrives (restarts with fresh value). The UI never feels blocked.

**Q2: useTransition vs useDeferredValue?**
> **A:** \`useTransition\`: wraps the STATE UPDATE — you control when to mark it as a transition: \`const [isPending, start] = useTransition(); start(() => setState(v))\`. Use when you own the state setter. \`useDeferredValue\`: wraps the VALUE — React automatically defers the value: \`const deferred = useDeferredValue(query)\`. Use when you receive a value from a parent (can't control the setter). Both produce similar results — \`useTransition\` is more explicit; \`useDeferredValue\` is for consumer components that can't modify the update site.

**Q3: Most dangerous misconception?**
> **A:** startTransition makes state updates async:
> \`\`\`tsx
> // ❌ WRONG: thinking startTransition is like setTimeout
> startTransition(() => {
>   setResults(filter(query));  // This is still synchronous!
>   // startTransition just marks it as low-priority, doesn't defer execution
> });
>
> // The difference: WITHOUT startTransition
> // setQuery('ab') → render immediately → blocks main thread for 200ms
> // User types 'abc' → has to wait for 200ms render first → laggy
>
> // WITH startTransition
> // setQuery('ab') → renders immediately (urgent)
> // startTransition(() => setResults(filter('ab'))) → marks as low priority
> // User types 'abc' → React INTERRUPTS the 'ab' results render
> // → re-renders with 'abc' → result shows 'abc' filter, never 'ab'
> \`\`\`

**Q4: How does Suspense for data fetching work in React 18?**
> **A:** A component can "suspend" by throwing a Promise. React catches it, shows the nearest Suspense boundary's fallback, and re-tries when the Promise resolves. Libraries implement this: React Query's \`useSuspenseQuery\` throws a Promise when data isn't ready; your component renders only when data is available (no isLoading check). Server-side: Next.js App Router uses Suspense + streaming — the server sends the Suspense boundary shell immediately, then streams the resolved content. This is the "declarative loading" model.

**Q5: FAANG-grade definition.**
> **A:** "React 18 concurrent features implement cooperative multitasking in the React renderer — startTransition marks state updates as interruptible transitions (low priority, discardable if superseded by new updates) keeping urgent interactions (typing, clicking) responsive while heavy renders run in background — useDeferredValue defers a value for rendering while showing the stale value, ideal for consumer components that don't own the update site — Suspense in concurrent mode catches thrown Promises for declarative loading states (no isLoading boolean, component simply renders when data is ready) — and automatic batching in React 18 groups all state updates (including setTimeout, native events, Promises) into single re-renders, reducing cascading re-renders — collectively enabling jank-free UIs for search, filtering, navigation, and data loading without manual optimisation."`,
    build: `## BUILD

### 🏗️ Mini Project: Instant Search With startTransition + useDeferredValue

**What you will build:** A search box over 50,000 items — input stays instant (urgent), results filter in background (transition), with isPending indicator.
**Time estimate:** 25 minutes

---

#### Step 1
\`\`\`bash
npm create vite@latest concurrent-demo -- --template react-ts && cd concurrent-demo && npm install
\`\`\`

#### Step 2 — Heavy Filter Function
\`\`\`ts
// src/items.ts
export const items = Array.from({ length: 50_000 }, (_, i) => ({
  id: i, label: 'Item ' + i,
  tags: ['alpha','beta','gamma','delta'][i % 4],
}));

// Artificially slow — simulates expensive filter
export function heavyFilter(list: typeof items, q: string) {
  if (!q) return list.slice(0, 20);
  return list.filter(i => {
    for (let k = 0; k < 100; k++) Math.sqrt(k);  // CPU work
    return i.label.toLowerCase().includes(q.toLowerCase());
  }).slice(0, 50);
}
\`\`\`

#### Step 3 — App With Transition
\`\`\`tsx
// src/App.tsx
import { useState, useTransition, useDeferredValue, useMemo, memo } from 'react';
import { items, heavyFilter } from './items';

// Memoised item — only re-renders when label/isPending changes
const ResultItem = memo(({ label, isPending }: { label: string; isPending: boolean }) => (
  <li className={\`p-2 border-b transition-opacity \${isPending ? 'opacity-40' : 'opacity-100'}\`}>{label}</li>
));

export default function App() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // Deferred version — trails behind query, triggers stale-list rendering
  const deferredQuery = useDeferredValue(query);

  // Heavy work runs with deferred value — won't block input
  const results = useMemo(() => heavyFilter(items, deferredQuery), [deferredQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);  // urgent — input updates instantly
    startTransition(() => {
      // Nothing here — useDeferredValue handles deferral automatically
      // If using startTransition with setState instead:
      // startTransition(() => setDeferredQuery(e.target.value));
    });
  };

  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Concurrent Search (50K items)</h1>
      <p className="text-sm text-gray-500 mb-4">
        Type rapidly — input never lags. Results may momentarily show stale list (isPending: {String(isPending)}).
      </p>
      <input value={query} onChange={handleChange} placeholder="Search..."
        className={\`w-full px-3 py-2 border rounded mb-2 \${isPending ? 'border-blue-300' : ''}\`} />
      <p className="text-xs text-gray-400 mb-2">
        Showing: "{deferredQuery}" results ({results.length}) {isPending && '⏳ updating...'}
      </p>
      <ul className="border rounded max-h-80 overflow-auto">
        {results.map(r => <ResultItem key={r.id} label={r.label} isPending={isPending} />)}
      </ul>
    </main>
  );
}
\`\`\`

**Expected Output:**
\`\`\`
Type rapidly "it" → input updates INSTANTLY
Stale results shown momentarily (opacity reduced)
After short pause → fresh results appear
isPending: true while results computing
Without startTransition/useDeferredValue: input would lag noticeably
\`\`\``,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does startTransition do?
**Q2:** Difference between useTransition and useDeferredValue?
**Q3:** Write an instant search with startTransition. From memory.

### Day 3 — Comprehension
**Q4:** Is startTransition async like setTimeout?
**Q5:** When does React abandon a transition render?
**Q6:** How does Suspense for data work with concurrent mode?

### Day 7 — Application
**Q7:** Build a tab switch that shows old tab while new tab loads (useDeferredValue).
**Q8:** A search box lags on every keystroke — apply concurrent fix.
**Q9:** When should you NOT use startTransition?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain React 18 concurrent features — startTransition, Suspense, streaming."
**Q11:** Draw: urgent vs transition update — interrupt, restart, commit.
**Q12:** ★ System design: "Design UX for a real-time collaborative doc editor — React concurrent, optimistic, conflict resolution."`
  },

  'micro-frontends-react': {
    feynman: `## FEYNMAN CHECK

### Explain Micro-Frontends Like I'm 10 Years Old
> Micro-frontends split a large frontend app into INDEPENDENT pieces — each piece owned by a separate team, deployed independently, and possibly using different frameworks. Like microservices for the UI. In React: Module Federation (Webpack) lets one app consume another app's components at RUNTIME without rebuilding. App shell (host) loads Checkout (remote) which loads Cart (remote) — each deployed separately. The non-obvious depth: the hard problems are shared dependencies (both apps need React but only one version should load), routing (who controls the URL), and cross-app communication (how does Checkout know the cart changed?). Most micro-frontend problems are organisational, not technical.

---

### 5 Deep Conceptual Questions

**Q1: What are the main micro-frontend integration patterns?**
> **A:** BUILD-TIME (npm package): shared components as npm packages — teams publish, others install and rebuild. Simple but tight coupling (rebuild required for updates). RUNTIME via Module Federation: components loaded dynamically at runtime — no rebuild of host app. Iframe: complete isolation — security, no JS conflicts, but limited integration (no shared state, URL). Web Components (Custom Elements): framework-agnostic, good for leaf components. Single-SPA: routing-based orchestration. Reality: Module Federation for React-to-React sharing; iframes for complete isolation (payment widgets, third-party embeds).

**Q2: How does Module Federation handle shared dependencies?**
> **A:** Each federated module declares its dependencies (react, react-dom). Module Federation negotiates at runtime: if the host already loaded React 18.3.0 and the remote requires React 18.x, they share the same instance (prevents two React copies loading). If versions are incompatible (host: 18, remote: 17), they load separately — potentially breaking hook rules (React hooks must use ONE React instance). Always set \`singleton: true\` for React in the shared config, and ensure all remotes use compatible versions.

**Q3: Most dangerous misconception?**
> **A:** Micro-frontends are always better:
> \`\`\`
> ❌ Micro-frontend for a 5-person team on a single product
> Reality: massive overhead — separate CI/CD, shared dep management, routing coordination,
> cross-app state sharing, integration testing complexity, performance overhead
> (multiple bundles, multiple React instances risk, extra network requests)
>
> ✅ Micro-frontends when:
> - 3+ teams working on different domains (checkout, product, account) independently
> - Different release cadences (billing deploys weekly, product deploys daily)
> - Different tech stacks per team (legacy AngularJS + new React)
> - You'd otherwise coordinate merges across 20 engineers constantly
>
> ✅ For a single team: use a monorepo with well-designed module boundaries instead
> \`\`\`

**Q4: How do micro-frontends communicate?**
> **A:** Options (least to most coupling): (1) URL params (routing-based — cleanest, no direct coupling). (2) Custom events (window.dispatchEvent — loose coupling, but global). (3) Shared state store (Redux/Zustand singleton loaded once — tight coupling but direct). (4) Shared service (auth service injected into all MFEs). (5) Props via host orchestration (host passes data to remotes via Module Federation's exposeConfig). Best practice: use URL for route state, custom events or a shared event bus for cross-domain events, avoid shared state stores.

**Q5: FAANG-grade definition.**
> **A:** "Micro-frontends decompose frontend monoliths into independently deployable, team-owned UI fragments — integrated via four main patterns: build-time (npm package, rebuild required), runtime (Module Federation, dynamic loading at runtime, dependency negotiation via singleton semantics), iframe (complete isolation, limited integration), and Web Components (framework-agnostic) — with Webpack Module Federation as the leading React solution (host consumes remote-exposed components at runtime, shared React/ReactDOM prevent duplicate instances) — solving team autonomy, release cadence independence, and incremental migration of legacy apps — but introducing: routing coordination, cross-app state management, version compatibility enforcement, duplicate dependency risk, and integration testing complexity — most appropriate for organisations with 3+ autonomous teams on distinct domain boundaries, not for single-team products where a well-structured monorepo is simpler."`,
    build: `## BUILD

### 🏗️ Mini Project: Module Federation Host + Remote

**What you will build:** Two Vite apps: Host (app shell) and Remote (exposes a CartWidget). Host loads CartWidget at runtime from Remote — no rebuild when Remote changes.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup Two Apps
\`\`\`bash
mkdir mfe-demo && cd mfe-demo
npm create vite@latest host -- --template react-ts
npm create vite@latest remote -- --template react-ts
cd remote && npm install
cd ../host && npm install
# Install Module Federation plugin for Vite
cd ../remote && npm install @originjs/vite-plugin-federation
cd ../host && npm install @originjs/vite-plugin-federation
\`\`\`

#### Step 2 — Remote App (Exposes CartWidget)
\`\`\`ts
// remote/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'remote',
      filename: 'remoteEntry.js',
      exposes: {
        './CartWidget': './src/CartWidget',
      },
      shared: ['react', 'react-dom'],  // share single React instance
    }),
  ],
  build: { target: 'esnext' },
  preview: { port: 5001 },
});

// remote/src/CartWidget.tsx
import { useState } from 'react';

export function CartWidget() {
  const [items, setItems] = useState<string[]>([]);
  const products = ['Book', 'Pen', 'Notebook'];
  return (
    <div className="border rounded p-4 bg-blue-50">
      <h3 className="font-bold mb-2">🛒 Cart Widget (from Remote)</h3>
      <p className="text-xs text-gray-500 mb-2">Loaded at runtime via Module Federation</p>
      <div className="flex gap-2 mb-2">
        {products.map(p => (
          <button key={p} onClick={() => setItems([...items, p])}
            className="px-2 py-1 bg-blue-500 text-white rounded text-sm">{p}</button>
        ))}
      </div>
      <ul className="text-sm">
        {items.map((item, i) => <li key={i}>• {item}</li>)}
      </ul>
      <p className="text-sm font-bold mt-2">Items: {items.length}</p>
    </div>
  );
}
export default CartWidget;
\`\`\`

#### Step 3 — Host App (Consumes Remote)
\`\`\`ts
// host/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host',
      remotes: {
        remote: 'http://localhost:5001/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  build: { target: 'esnext' },
});

// host/src/App.tsx
import { lazy, Suspense } from 'react';

// Loaded from REMOTE at runtime — not in host bundle
const CartWidget = lazy(() => import('remote/CartWidget'));

export default function App() {
  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Host App Shell</h1>
      <p className="text-sm text-gray-500 mb-4">
        This app shell loads CartWidget from a SEPARATE deployed app (Remote) at runtime.
        You can update the Remote without rebuilding the Host.
      </p>

      <div className="mb-4 p-4 bg-gray-50 border rounded">
        <h2 className="font-bold">Local Component (in Host bundle)</h2>
        <p>This renders from the host app's code.</p>
      </div>

      <Suspense fallback={<div className="animate-pulse h-40 bg-gray-200 rounded" />}>
        <CartWidget />
      </Suspense>
    </main>
  );
}
\`\`\`

#### Step 4 — Run Both
\`\`\`bash
# Terminal 1: build and serve Remote
cd remote && npm run build && npm run preview
# Remote available at http://localhost:5001

# Terminal 2: run Host (dev mode)
cd host && npm run dev
# Host at http://localhost:5173 — loads CartWidget from Remote at runtime
\`\`\`

**Expected Output:**
\`\`\`
Host loads → "Cart Widget (from Remote)" appears (loaded from localhost:5001)
Add items → state works (same React instance shared)
Network tab: remoteEntry.js fetched from :5001 — lazy, on demand
Stop Remote server → CartWidget shows Suspense fallback
Update CartWidget text → rebuild Remote → Host shows updated text (no Host rebuild)
\`\`\``,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What problem do micro-frontends solve?
**Q2:** How does Module Federation share React between host and remote?
**Q3:** What are the 4 micro-frontend integration patterns?

### Day 3 — Comprehension
**Q4:** When should you NOT use micro-frontends?
**Q5:** Two MFEs load React twice — diagnose (singleton config).
**Q6:** How do micro-frontends communicate across domain boundaries?

### Day 7 — Application
**Q7:** Add cross-app event bus: remote emits 'cart:updated', host listens.
**Q8:** A PR loads React twice in MFE setup — fix shared singleton config.
**Q9:** How do you test a component consumed via Module Federation?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through Module Federation — host, remote, shared deps, runtime loading."
**Q11:** Draw: Module Federation — host bundle, remote entry, runtime negotiation, shared React.
**Q12:** ★ System design: "Design micro-frontend architecture for a bank portal — teams, boundaries, communication, CI/CD."`
  },

  'react-19-features': {
    feynman: `## FEYNMAN CHECK

### Explain React 19 Features Like I'm 10 Years Old
> React 19 (released 2024) adds: ACTIONS (async form handlers replacing useMutation patterns), the \`use()\` hook (reads Promises and Context in any order, eliminates many useEffect patterns), FORM ACTIONS (\`<form action={serverAction}>\` for seamless server-side form handling), improved error handling, and ref as a prop (no more forwardRef for function components). The non-obvious depth: Actions bring server mutation directly into React's mental model — \`<form action={async (formData) => { 'use server'; await db.insert(formData); }}\` — the action runs on the server, React handles the pending/error state automatically via useFormStatus and useActionState.

---

### 5 Deep Conceptual Questions

**Q1: What is the useActionState hook and how does it replace patterns?**
> **A:** \`useActionState(action, initialState)\` returns \`[state, dispatch, isPending]\`. You pass it a server or client action; calling dispatch(formData) calls the action and updates state with the result. Replaces: manual loading state (\`const [isPending, startTransition] = useTransition()\`), manual error state, and the \`useMutation\` pattern for forms. The action receives \`(previousState, formData)\` — state accumulates across submissions. Example: form validation that returns errors as state, which re-renders the form with error messages — no useEffect, no separate state.

**Q2: What does the use() hook do?**
> **A:** \`use(promise)\` reads a Promise inside a component — React suspends the component until the Promise resolves. \`use(Context)\` reads a Context (same as useContext but usable inside conditionals and loops). Unlike useEffect, \`use(promise)\` is truly first-class — the component doesn't mount until the data is ready. Example: \`const user = use(fetchUser(id))\` — no isLoading, no useEffect, just the value. The Promise must be created OUTSIDE the component (stable reference) or memoised, otherwise it recreates on every render.

**Q3: Most dangerous misconception?**
> **A:** React 19's ref as prop eliminates forwardRef entirely:
> \`\`\`tsx
> // ✅ React 19: ref is just a prop — no forwardRef needed
> function Input({ ref, ...props }: React.ComponentProps<'input'> & { ref?: React.Ref<HTMLInputElement> }) {
>   return <input ref={ref} {...props} />;
> }
>
> // Usage (same as before — consumer side unchanged)
> const ref = useRef<HTMLInputElement>(null);
> <Input ref={ref} placeholder="x" />
>
> // Old way (still works, just unnecessary for function components):
> const Input = forwardRef<HTMLInputElement, Props>((props, ref) => <input ref={ref} {...props} />);
>
> // BUT: if your library supports React 18 users, keep forwardRef for backward compat
> \`\`\`

**Q4: How do Server Actions in React 19 change form handling?**
> **A:** Server Actions are async functions marked with \`'use server'\` that run on the server when called from the client. \`<form action={serverAction}>\` — form submission calls the server function directly (Next.js handles the RPC layer). React 19 adds: \`useFormStatus\` hook inside the form to get pending state (disable submit button); \`useActionState\` to handle return value (validation errors, success message); optimistic updates via \`useOptimistic\`. Result: form submit → server DB call → state update — no API route, no fetch, no useEffect.

**Q5: FAANG-grade definition.**
> **A:** "React 19 introduces Actions (async functions as event handlers with automatic pending/error management via useActionState and useFormStatus), the \`use()\` hook (first-class Promise/Context reading in any position including conditionals, replacing many useEffect patterns), ref-as-prop for function components (eliminating forwardRef wrapper), Server Actions (server-side async functions called directly from forms/event handlers via framework RPC — Next.js), improved error handling (better hydration error messages, ErrorBoundary reset), and useOptimistic (instant UI updates while async operations are pending with automatic rollback) — collectively reducing the boilerplate for async mutation patterns, form handling, and data fetching, and completing the vision of React as a full-stack framework when paired with Server Components."`,
    build: `## BUILD

### 🏗️ Mini Project: Contact Form With React 19 Actions + useActionState

**What you will build:** A contact form using useActionState (replaces useState+isPending pattern), useFormStatus for the submit button, and optimistic UI with useOptimistic.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup (Next.js for Server Actions)
\`\`\`bash
npx create-next-app@latest r19-demo --typescript --tailwind --app && cd r19-demo
# Ensure React 19 in package.json (Next.js 15+ ships with React 19)
\`\`\`

#### Step 2 — Server Action
\`\`\`ts
// app/actions.ts
'use server';
import { z } from 'zod';
const schema = z.object({ name: z.string().min(2), email: z.string().email(), message: z.string().min(10) });

export async function sendContact(prevState: { error?: string; success?: boolean }, formData: FormData) {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { error: result.error.issues[0].message };
  await new Promise(r => setTimeout(r, 1000));  // simulate DB save
  return { success: true };
}
\`\`\`

#### Step 3 — Form With useActionState + useFormStatus
\`\`\`tsx
// app/contact/page.tsx
import { ContactForm } from './ContactForm';
export default function ContactPage() {
  return (
    <main className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <ContactForm />
    </main>
  );
}

// app/contact/ContactForm.tsx
'use client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { sendContact } from '../actions';

// Separate Submit component to access useFormStatus (must be inside <form>)
function SubmitButton() {
  const { pending } = useFormStatus();  // reads pending state of parent form action
  return (
    <button type="submit" disabled={pending}
      className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
      {pending ? 'Sending...' : 'Send Message'}
    </button>
  );
}

export function ContactForm() {
  // useActionState: manages state returned from action + isPending
  const [state, dispatch, isPending] = useActionState(sendContact, {});

  if (state.success) {
    return (
      <div className="p-4 bg-green-50 border border-green-300 rounded">
        <p className="text-green-700 font-bold">✓ Message sent!</p>
      </div>
    );
  }

  return (
    <form action={dispatch}>
      {state.error && (
        <div role="alert" className="mb-3 p-3 bg-red-50 text-red-600 rounded text-sm">
          {state.error}
        </div>
      )}

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
        <input id="name" name="name" required className="w-full px-3 py-2 border rounded" />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="w-full px-3 py-2 border rounded" />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1" htmlFor="message">Message</label>
        <textarea id="message" name="message" rows={4} required
          className="w-full px-3 py-2 border rounded" />
      </div>

      <SubmitButton />
    </form>
  );
}
\`\`\`

**Expected Output:**
\`\`\`
Submit with short message → error shown via useActionState
Submit with valid data → "Sending..." (useFormStatus.pending=true)
After 1s → "✓ Message sent!"
No useState, no useEffect, no fetch — action runs on server
\`\`\``,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does useActionState do?
**Q2:** How does ref-as-prop change in React 19?
**Q3:** Write a form with useActionState. From memory.

### Day 3 — Comprehension
**Q4:** What is useFormStatus and why must it be in a child component?
**Q5:** How does use(promise) differ from useEffect fetching?
**Q6:** What is useOptimistic?

### Day 7 — Application
**Q7:** Build a delete confirmation using useOptimistic (instant removal, rollback on error).
**Q8:** Migrate a useState+fetch form to useActionState.
**Q9:** How do Server Actions handle file uploads?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through React 19 Actions — client actions vs server actions."
**Q11:** Draw: Server Action flow — form submit → RPC → server function → return state → re-render.
**Q12:** ★ System design: "Design a full-stack form wizard in Next.js 15 — steps, validation, server actions, optimistic."`
  },

  'react-compiler': {
    feynman: `## FEYNMAN CHECK

### Explain React Compiler Like I'm 10 Years Old
> React Compiler (released 2024, stable 2025) is a BUILD-TIME tool that automatically adds optimal memoisation to your React code. It reads your components and hooks, figures out which values are stable vs which change, and inserts \`useMemo\` / \`useCallback\` / \`React.memo\` in the compiled output — so you don't have to. Your source code stays clean; the compiled output is fully optimised. The non-obvious depth: the Compiler can only optimise code that follows the Rules of React (no mutation of props/state, no reading stale closures). It will SKIP (bail out from optimising) components that violate the rules — and tell you why in compiler output.

---

### 5 Deep Conceptual Questions

**Q1: What does React Compiler actually do to your code?**
> **A:** The Compiler analyses your component's dataflow — which values depend on which other values. It inserts \`c()\` calls (compiler's internal caching primitive, similar to useMemo but more granular) wrapping every expression that can be cached. Example: \`const greeting = \`Hello, \${name}\`\` becomes \`const greeting = c(name, () => \`Hello, \${name}\`)\`. Outputs: compiled .js files with caching primitives, source maps preserved. No runtime library changes — just optimised compiled output.

**Q2: How does the Compiler interact with existing useMemo/useCallback?**
> **A:** The Compiler ignores existing manual useMemo/useCallback — it doesn't double-wrap. But with Compiler enabled, manual memoisation is redundant. Migration: enable Compiler → run your test suite → if all passes, remove manual useMemo/useCallback (they become noise). The \`eslint-plugin-react-compiler\` will report components the Compiler bailed out on — fix those violations, then manual memoisation is fully removable.

**Q3: Most dangerous misconception?**
> **A:** React Compiler fixes all performance problems:
> \`\`\`tsx
> // ❌ Compiler CANNOT optimise: mutating props or state
> function BadComponent({ items }: { items: string[] }) {
>   items.push('extra');  // ← MUTATION — Compiler bails out, no optimisation
>   return <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>;
> }
>
> // ❌ Compiler CANNOT optimise: impure render (side effect in render)
> function BadComponent() {
>   document.title = 'Page loaded';  // ← side effect in render body — bail out
>   return <div>Hello</div>;
> }
>
> // ✅ Compiler optimises: pure, Rules-of-React-compliant code
> function GoodComponent({ items }: { items: string[] }) {
>   const enriched = [...items, 'extra'];  // new array — pure
>   return <ul>{enriched.map(i => <li key={i}>{i}</li>)}</ul>;
>   // Compiler: caches enriched when items reference stable, skips re-render
> }
> \`\`\`

**Q4: What is the migration path for existing codebases?**
> **A:** (1) Enable \`eslint-plugin-react-compiler\` — see violations without touching code. (2) Fix violations (mutations, side effects in render). (3) Enable the Babel/SWC plugin for the compiler. (4) Run test suite — most apps pass without changes if they follow Rules of React. (5) Incrementally remove manual useMemo/useCallback (Compiler makes them redundant). (6) Validate with React DevTools Profiler — components should show 0 extra re-renders. The Compiler is opt-in per directory or component via \`'use no memo'\` to exclude specific components.

**Q5: FAANG-grade definition.**
> **A:** "React Compiler is a build-time optimisation tool that statically analyses component dataflow to automatically insert optimal caching primitives (equivalent to useMemo/useCallback/React.memo) in compiled output — eliminating manual memoisation boilerplate while preserving source code clarity — operating on Rules-of-React-compliant code (pure renders, no prop/state mutation, no side effects in render body) and bailing out gracefully on violations (reporting via eslint-plugin-react-compiler) — outputting cached React code with fine-grained invalidation (more granular than manual useMemo) — requiring no runtime changes (works with React 17+) — making manual useMemo/useCallback/React.memo an anti-pattern in Compiler-enabled codebases — and representing the React team's long-term solution to the memoisation burden that motivated Zustand, Jotai, and other libraries to advertise performance as a selling point."`,
    build: `## BUILD

### 🏗️ Mini Project: Before/After React Compiler Demo

**What you will build:** A component tree with manual memoisation (before), then the Compiler-optimised version (after) — showing the cleanup and validation.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup With Compiler
\`\`\`bash
npm create vite@latest compiler-demo -- --template react-ts
cd compiler-demo
npm install babel-plugin-react-compiler@beta eslint-plugin-react-compiler@beta
\`\`\`

#### Step 2 — Configure Compiler (Vite + Babel)
\`\`\`ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', {}],
        ],
      },
    }),
  ],
});
\`\`\`

#### Step 3 — Before: Manual Memoisation (Verbose)
\`\`\`tsx
// src/BeforeCompiler.tsx — manual memoisation everywhere
import { useState, useMemo, useCallback, memo } from 'react';

const ITEMS = Array.from({ length: 100 }, (_, i) => ({ id: i, name: 'Item '+i, price: i * 1.5 }));

const ExpensiveItem = memo(function Item({ name, price, onSelect }: { name: string; price: number; onSelect: (n: string) => void }) {
  return <li className="p-2 border-b"><button onClick={() => onSelect(name)}>{name} — \${price.toFixed(2)}</button></li>;
});

export function BeforeCompiler() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const [counter, setCounter] = useState(0);

  // Manual memoisation — required without Compiler
  const filtered = useMemo(() => ITEMS.filter(i => i.name.toLowerCase().includes(query.toLowerCase())), [query]);
  const handleSelect = useCallback((name: string) => setSelected(name), []);

  return (
    <div className="p-4 border rounded">
      <h2 className="font-bold mb-2">Before Compiler (manual memo)</h2>
      <button onClick={() => setCounter(c => c + 1)} className="mb-2 px-2 py-1 bg-gray-100 rounded">Counter: {counter}</button>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter..." className="w-full border px-2 py-1 rounded mb-2" />
      <p className="text-sm mb-1">Selected: {selected || '(none)'}</p>
      <ul className="max-h-40 overflow-auto border rounded">
        {filtered.slice(0, 20).map(i => <ExpensiveItem key={i.id} name={i.name} price={i.price} onSelect={handleSelect} />)}
      </ul>
    </div>
  );
}
\`\`\`

#### Step 4 — After: Compiler-Optimised (Clean)
\`\`\`tsx
// src/AfterCompiler.tsx — no manual memoisation needed
import { useState } from 'react';

const ITEMS = Array.from({ length: 100 }, (_, i) => ({ id: i, name: 'Item '+i, price: i * 1.5 }));

// No React.memo needed — Compiler handles it
function Item({ name, price, onSelect }: { name: string; price: number; onSelect: (n: string) => void }) {
  return <li className="p-2 border-b"><button onClick={() => onSelect(name)}>{name} — \${price.toFixed(2)}</button></li>;
}

export function AfterCompiler() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const [counter, setCounter] = useState(0);

  // No useMemo needed — Compiler caches this automatically
  const filtered = ITEMS.filter(i => i.name.toLowerCase().includes(query.toLowerCase()));

  // No useCallback needed — Compiler generates stable ref automatically
  const handleSelect = (name: string) => setSelected(name);

  return (
    <div className="p-4 border rounded">
      <h2 className="font-bold mb-2">After Compiler (clean code)</h2>
      <button onClick={() => setCounter(c => c + 1)} className="mb-2 px-2 py-1 bg-gray-100 rounded">Counter: {counter}</button>
      <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter..." className="w-full border px-2 py-1 rounded mb-2" />
      <p className="text-sm mb-1">Selected: {selected || '(none)'}</p>
      <ul className="max-h-40 overflow-auto border rounded">
        {filtered.slice(0, 20).map(i => <Item key={i.id} name={i.name} price={i.price} onSelect={handleSelect} />)}
      </ul>
    </div>
  );
}
\`\`\`

#### Step 5 — Side-by-Side + Violation Test
\`\`\`tsx
// src/App.tsx
import { BeforeCompiler } from './BeforeCompiler';
import { AfterCompiler } from './AfterCompiler';

export default function App() {
  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">React Compiler Demo</h1>
      <p className="text-sm text-gray-600 mb-4">
        Open React DevTools Profiler. Click Counter in each panel and compare renders.
        After Compiler: same performance as Before, but ZERO manual memoisation in source.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <BeforeCompiler />
        <AfterCompiler />
      </div>
    </main>
  );
}
// To test Compiler violation detection:
// Add items.push('x') to AfterCompiler — Compiler bails, eslint-plugin warns
\`\`\`

**Expected Output:**
\`\`\`
Both panels behave identically — same performance
AfterCompiler source: no useMemo, useCallback, or memo calls
React DevTools: compiled output shows _c() caching primitives in AfterCompiler
Click Counter: 0 Item re-renders in both (Compiler memoised automatically)
\`\`\``,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does React Compiler do?
**Q2:** What code does the Compiler bail out on?
**Q3:** Write a component that benefits from Compiler optimisation. From memory.

### Day 3 — Comprehension
**Q4:** How do you migrate from manual useMemo to Compiler?
**Q5:** A component mutates a prop — show why Compiler skips it.
**Q6:** What is 'use no memo' directive?

### Day 7 — Application
**Q7:** Enable Compiler on an existing app, fix violations.
**Q8:** Identify 3 patterns in your codebase where Compiler would skip.
**Q9:** How do you verify Compiler is working via DevTools?

### Day 14 — Synthesis
**Q10:** ★ Interview: "How does React Compiler work and what does it change about performance optimisation?"
**Q11:** Draw: Compiler pipeline — JSX source → dataflow analysis → caching primitives → compiled output.
**Q12:** ★ System design: "Plan migration of a 500-component codebase to React Compiler — tooling, testing, phased rollout."`
  }
};

