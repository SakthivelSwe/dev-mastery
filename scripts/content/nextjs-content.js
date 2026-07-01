module.exports = {

  // ── 1. nextjs-intro ───────────────────────────────────────────────────────
  'nextjs-intro': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Like I'm 10 Years Old
> Next.js is a React framework that adds PRODUCTION SUPERPOWERS on top of React. React alone only runs in the browser — Next.js adds a Node.js server that can run your React components on the SERVER before sending HTML to the browser. This means the user sees REAL content immediately instead of a blank page waiting for JavaScript. The non-obvious depth: Next.js is a FULL-STACK framework — your React components can read databases, call APIs, and run server-only code in the same codebase as your UI, with no separate backend needed. This is why Next.js powers high-traffic production apps at Vercel, TikTok, Twitch, and Hulu — it gives React apps server-rendering performance without the complexity of maintaining a separate API server.

---

### 5 Deep Conceptual Questions

**Q1: What fundamental problem does Next.js solve that React alone cannot?**
> **A:** React is a CLIENT-SIDE library — it ships JavaScript to the browser and renders HTML there. This means: (1) First page load shows blank HTML until JS downloads and runs (bad for LCP Core Web Vitals). (2) Search engines see empty pages (bad for SEO). (3) Every API call goes browser → your backend → third-party API (extra latency). Next.js solves all three: server-rendered HTML arrives pre-populated, search engines index real content, and server components call databases/APIs directly from the server with zero client-side network overhead.

**Q2: What is the single mental model that makes Next.js click?**
> **A:** "The file system IS the router." Every file in app/ or pages/ becomes a route automatically — no router configuration needed. app/dashboard/settings/page.tsx becomes /dashboard/settings. This convention-over-configuration principle extends to layouts (layout.tsx), loading states (loading.tsx), error boundaries (error.tsx), and API routes (route.ts). Once you internalize this, the entire framework becomes predictable — you know where to put any feature before you write a line of code.

**Q3: Most dangerous misconception about Next.js?**
> **A:** Server Components can do anything React components can:
> \`\`\`typescript
> // WRONG: Server Component using React hooks
> // app/products/page.tsx
> export default function ProductsPage() {
>   const [count, setCount] = useState(0);  // ERROR: hooks don't exist on server
>   useEffect(() => { fetchData(); }, []);   // ERROR: no browser lifecycle on server
>   return <div>{count}</div>;
> }
>
> // CORRECT: Server Components = async functions, no hooks
> export default async function ProductsPage() {
>   const products = await db.query('SELECT * FROM products');
>   return <ProductList products={products} />;
> }
> // Add 'use client' at top of file to use hooks
> \`\`\`

**Q4: How does Next.js's build output differ from a plain React app?**
> **A:** A plain React build (CRA/Vite) produces static HTML + JS that always runs in the browser — identical for all users. Next.js build produces a HYBRID output: static HTML pages (pre-generated at build time for SSG routes), Node.js server functions (for SSR routes), Edge Runtime functions (for middleware, edge API routes), and static assets. The output can be deployed to Vercel (managed), a Node.js server, Docker, or exported as fully static HTML (next export) for CDN-only hosting.

**Q5: FAANG-grade one-sentence definition of Next.js.**
> **A:** "Next.js is a React meta-framework providing file-system-based routing, React Server Components for zero-client-bundle server rendering, multiple data fetching strategies (SSG, SSR, ISR, streaming), Edge Runtime support, built-in image/font optimisation, and a full-stack deployment model — enabling React applications to achieve sub-second Time To First Byte with progressive hydration while maintaining the developer experience of a single-repository full-stack application."`,

    build: `## BUILD

### 🏗️ Mini Project: Full-Stack Next.js App — Products Catalog With SSR + API Routes + DB

**What you will build:** A products listing page using App Router: server component fetching from a SQLite database, client component for search filtering, API route for CRUD, and a loading skeleton — demonstrating every core Next.js concept in one app.
**Why this project:** Forces Server Components, Client Components, API Routes, and the App Router file structure together.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest nextjs-products --typescript --tailwind --app --src-dir
cd nextjs-products
npm install better-sqlite3 @types/better-sqlite3
\`\`\`

#### Step 2 — Database Layer (server-only)
\`\`\`typescript
// src/lib/db.ts
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'products.db'));

db.exec(\`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    in_stock INTEGER DEFAULT 1
  )
\`);

// Seed if empty
const count = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count;
if (count === 0) {
  const insert = db.prepare('INSERT INTO products (name, price, category) VALUES (?, ?, ?)');
  [
    ['Next.js Handbook', 29.99, 'books'],
    ['React Deep Dive', 39.99, 'books'],
    ['TypeScript Course', 49.99, 'courses'],
    ['Node.js Mastery', 44.99, 'courses'],
    ['VSCode Pro', 0, 'tools'],
  ].forEach(([name, price, category]) => insert.run(name, price, category));
}

export interface Product { id: number; name: string; price: number; category: string; in_stock: number; }

export const getProducts = (category?: string): Product[] => {
  if (category) return db.prepare('SELECT * FROM products WHERE category = ?').all(category) as Product[];
  return db.prepare('SELECT * FROM products').all() as Product[];
};

export const getProduct = (id: number): Product | undefined =>
  db.prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | undefined;
\`\`\`

#### Step 3 — Server Component Page
\`\`\`typescript
// src/app/products/page.tsx
import { getProducts } from '@/lib/db';
import { ProductCard } from '@/components/ProductCard';
import { SearchFilter } from '@/components/SearchFilter';
import { Suspense } from 'react';

interface Props { searchParams: { category?: string } }

// This runs on the SERVER — no client bundle, direct DB access
export default async function ProductsPage({ searchParams }: Props) {
  const products = getProducts(searchParams.category);

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Products ({products.length})</h1>
      <SearchFilter />  {/* Client Component for interactivity */}
      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </Suspense>
    </main>
  );
}

// Revalidate cache every 60 seconds (ISR)
export const revalidate = 60;
\`\`\`

#### Step 4 — API Route for CRUD
\`\`\`typescript
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/db';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'products.db'));

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category') ?? undefined;
  const products = getProducts(category);
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, price, category } = body;

  if (!name || price === undefined || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const result = db.prepare('INSERT INTO products (name, price, category) VALUES (?, ?, ?)')
    .run(name, price, category);

  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
\`\`\`

#### Step 5 — Loading and Error Pages
\`\`\`typescript
// src/app/products/loading.tsx
export default function ProductsLoading() {
  return (
    <div className="grid grid-cols-3 gap-4 p-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

// src/app/products/error.tsx
'use client';
export default function ProductsError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-8">
      <h2>Failed to load products: {error.message}</h2>
      <button onClick={reset} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Try again
      </button>
    </div>
  );
}
\`\`\`

**Expected Output:**
\`\`\`
npm run dev
http://localhost:3000/products -> shows 5 products (SSR, instant HTML)
?category=books -> filters to 2 books
/api/products -> JSON array
POST /api/products -> creates product, returns {id: 6}
\`\`\`

**Stretch Challenges:**
- [ ] Add a product detail page with generateStaticParams for SSG
- [ ] Add optimistic UI updates for the add-product form using Server Actions
- [ ] Add a loading.tsx skeleton that matches the exact product card dimensions`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What problems does Next.js solve that React alone cannot?
**Q2:** What is the file-system router rule in Next.js App Router?
**Q3:** Write the minimal App Router page that fetches data from a DB. From memory.

### Day 3 — Comprehension
**Q4:** What is the difference between a Server Component and a Client Component?
**Q5:** A junior adds useState to a Server Component — what error and why?
**Q6:** When does Next.js revalidate a page vs serve from cache?

### Day 7 — Application
**Q7:** Build a Next.js app with SSG product pages and ISR for updates.
**Q8:** A PR puts a large library import in a Server Component — does it affect bundle size?
**Q9:** What is next.config.js and what are the three most important options?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain Next.js rendering strategies — when would you use SSG, SSR, ISR, and Streaming for a real e-commerce site?"
**Q11:** Draw: Next.js build output — static pages, server functions, edge functions, assets.
**Q12:** ★ System design: "Design the Next.js architecture for a high-traffic news site — 10M users, SEO-critical, personalised recommendations, real-time comments."`
  },

  // ── 2. app-router ─────────────────────────────────────────────────────────
  'app-router': {
    feynman: `## FEYNMAN CHECK

### Explain the Next.js App Router Like I'm 10 Years Old
> The App Router (Next.js 13+) is a new way to build Next.js apps where EVERY file in the app/ directory has a special meaning. page.tsx renders the UI for a route, layout.tsx wraps multiple pages with shared UI (navbar, sidebar), loading.tsx shows a skeleton while data loads, error.tsx handles crashes, and route.ts creates API endpoints. The framework reads these special filenames and wires everything together automatically — you never configure routes manually. The non-obvious power: layouts are PERSISTENT — navigating between routes inside the same layout does NOT unmount/remount the layout component. The navbar doesn't flash or reload when the user navigates. This is impossible in the Pages Router where every page re-renders from scratch.

---

### 5 Deep Conceptual Questions

**Q1: What is the App Router's fundamental difference from the Pages Router?**
> **A:** The Pages Router renders every page as a full React tree that re-renders on navigation. The App Router uses NESTED LAYOUTS — a parent layout.tsx renders once and persists across child route navigations. When you navigate from /dashboard/settings to /dashboard/profile, the DashboardLayout stays mounted — only the inner page content swaps. This is implemented through React's new concurrent features and Server Components: layouts are Server Components that stream their children independently, enabling instant navigation with preserved scroll position and state.

**Q2: Mental model for the App Router file conventions?**
> **A:** Each folder in app/ represents a URL segment. The special files are: page.tsx (the public UI for that route), layout.tsx (wraps the page + child routes), loading.tsx (Suspense boundary shown during async operations), error.tsx (error boundary, must be 'use client'), not-found.tsx (404 handler), route.ts (API endpoint), template.tsx (like layout but re-mounts on navigation), default.tsx (parallel route fallback). Bracket notation ([id]) creates dynamic segments. Parentheses ((group)) create route groups without URL segments.

**Q3: Most dangerous misconception about App Router?**
> **A:** All files in app/ are automatically routes:
> \`\`\`
> // WRONG: only page.tsx, route.ts, layout.tsx etc. are special files
> app/
>   products/
>     page.tsx      ✅ -> /products (public route)
>     helpers.ts    ❌ NOT a route — just a module, can be safely co-located
>     types.ts      ❌ NOT a route — just types
>     ProductCard.tsx ❌ NOT a route — just a component
>     route.ts      ✅ -> /products (API endpoint)
>
> // Only Next.js reserved filenames create routes
> // You can safely co-locate components, utilities, types in app/ folders
> \`\`\`

**Q4: How does streaming work in the App Router?**
> **A:** The App Router uses React's streaming SSR — instead of waiting for ALL server data before sending HTML, Next.js sends the shell (layout, static content) IMMEDIATELY and streams each Suspense boundary's content as it resolves. Wrapping a slow component in Suspense with a fallback means the browser renders the fallback instantly, then replaces it with real content when the server async operation completes. This gives interactive TTFB without blocking on slow database queries — the user sees the page structure immediately and data fills in progressively.

**Q5: FAANG-grade definition of the App Router.**
> **A:** "Next.js App Router is a file-system router where app/ folder structure maps to URL segments — with co-locatable special files (page.tsx, layout.tsx, loading.tsx, error.tsx, route.ts, template.tsx) defining route UI, persistent nested layouts, streaming Suspense boundaries, and API handlers — built on React Server Components for server-rendered layouts with zero client bundle, React 18 concurrent rendering for progressive streaming, and route groups/parallel routes for complex UI composition — replacing the Pages Router's full-page re-render model with selective content streaming and persistent layout state."`,

    build: `## BUILD

### 🏗️ Mini Project: Dashboard With Nested Layouts, Parallel Routes, and Streaming

**What you will build:** A dashboard app demonstrating every App Router file convention: persistent DashboardLayout, route groups for auth separation, parallel routes for side-by-side panels, streaming with Suspense, and intercepting routes for modal patterns.
**Why this project:** Forces every App Router special file in a realistic pattern.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest app-router-demo --typescript --tailwind --app
cd app-router-demo
\`\`\`

#### Step 2 — File Structure
\`\`\`
app/
  layout.tsx                    # Root layout (html, body)
  page.tsx                      # Home /
  (auth)/
    login/page.tsx              # /login (no (auth) in URL)
    signup/page.tsx             # /signup
  (dashboard)/
    layout.tsx                  # Dashboard layout (sidebar + nav)
    dashboard/
      page.tsx                  # /dashboard
      @analytics/               # Parallel slot
        page.tsx
      @notifications/           # Parallel slot
        page.tsx
      settings/
        page.tsx                # /dashboard/settings
      loading.tsx               # Suspense skeleton
      error.tsx                 # Error boundary
\`\`\`

#### Step 3 — Dashboard Layout (Persistent)
\`\`\`typescript
// app/(dashboard)/layout.tsx
import Link from 'next/link';

export default function DashboardLayout({
  children,
  analytics,
  notifications,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;    // @analytics slot
  notifications: React.ReactNode; // @notifications slot
}) {
  return (
    <div className="flex h-screen">
      <nav className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Dashboard</h2>
        <ul className="space-y-2">
          <li><Link href="/dashboard">Overview</Link></li>
          <li><Link href="/dashboard/settings">Settings</Link></li>
        </ul>
      </nav>
      <main className="flex-1 p-8">
        {children}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {analytics}
          {notifications}
        </div>
      </main>
    </div>
  );
}
\`\`\`

#### Step 4 — Streaming Dashboard Page
\`\`\`typescript
// app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react';

async function SlowMetrics() {
  await new Promise(r => setTimeout(r, 2000));  // simulate slow DB query
  return <div className="bg-blue-100 p-4 rounded">Revenue: $42,000</div>;
}

async function FastMetrics() {
  return <div className="bg-green-100 p-4 rounded">Active users: 1,234</div>;
}

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Overview</h1>
      {/* FastMetrics renders immediately, SlowMetrics streams in after 2s */}
      <FastMetrics />
      <Suspense fallback={<div className="h-20 bg-gray-200 animate-pulse rounded mt-4" />}>
        <SlowMetrics />
      </Suspense>
    </div>
  );
}
\`\`\`

#### Step 5 — Loading and Error Files
\`\`\`typescript
// app/(dashboard)/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      <div className="h-20 bg-gray-200 rounded" />
      <div className="h-20 bg-gray-200 rounded" />
    </div>
  );
}

// app/(dashboard)/dashboard/error.tsx
'use client';
export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h2 className="font-bold text-red-800">Dashboard Error</h2>
      <p className="text-red-600">{error.message}</p>
      <button onClick={reset} className="mt-2 px-4 py-2 bg-red-500 text-white rounded">Retry</button>
    </div>
  );
}
\`\`\`

**Expected Output:**
\`\`\`
/dashboard -> FastMetrics instant, SlowMetrics streams after 2s
Navigate /dashboard -> /dashboard/settings -> sidebar stays mounted
/login -> no dashboard sidebar (separate route group)
Parallel slots: @analytics and @notifications side by side
\`\`\`

**Stretch Challenges:**
- [ ] Add intercepting routes ((..)login) for a login modal pattern
- [ ] Add route groups for admin vs user layouts at the same URL depth
- [ ] Add template.tsx and observe re-mount vs layout.tsx persistence`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Seven special filenames in the App Router and their purpose.
**Q2:** What is a persistent layout and why does it not re-render on navigation?
**Q3:** What does bracket notation [id] do in a folder name? From memory.

### Day 3 — Comprehension
**Q4:** Difference between layout.tsx and template.tsx?
**Q5:** A junior puts all routes in app/pages/ — why does Next.js ignore them?
**Q6:** What are route groups (parentheses) and when do you use them?

### Day 7 — Application
**Q7:** Build a multi-tenant dashboard where /[tenant]/dashboard shares a layout.
**Q8:** How do parallel routes enable modal patterns in the App Router?
**Q9:** What happens when loading.tsx is missing and a Server Component is slow?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain the App Router's streaming model — how does Suspense enable progressive rendering?"
**Q11:** Draw: App Router folder structure → URL mapping → component tree.
**Q12:** ★ System design: "Design the Next.js App Router structure for a SaaS platform with team, user, admin, and public routes."`
  },

  // ── 3. pages-router ───────────────────────────────────────────────────────
  'pages-router': {
    feynman: `## FEYNMAN CHECK

### Explain the Next.js Pages Router Like I'm 10 Years Old
> The Pages Router is Next.js's original routing system — every file in pages/ becomes a URL. pages/index.tsx = /, pages/about.tsx = /about, pages/products/[id].tsx = /products/1. Data fetching happens through special exported functions: getStaticProps (fetches at BUILD time for SSG), getServerSideProps (fetches on every REQUEST for SSR), getStaticPaths (tells Next.js which dynamic pages to pre-generate). The non-obvious limitation: in the Pages Router, EVERY page gets a complete new React tree — there are no persistent layouts between navigations. This is why Next.js built the App Router — to enable layout persistence and Server Components. For new projects use App Router; for existing codebases Pages Router is still fully supported.

---

### 5 Deep Conceptual Questions

**Q1: When does getStaticProps run vs getServerSideProps?**
> **A:** getStaticProps runs at BUILD TIME on the Node.js server — during next build, not when users visit the page. The result becomes a pre-rendered HTML file. It also runs during revalidation (ISR). getServerSideProps runs on EVERY REQUEST at RUNTIME — for each user visit, Next.js calls your function, fetches fresh data, and renders the page. Use getStaticProps when data doesn't change per user (blog posts, product catalogue). Use getServerSideProps when data is user-specific or must be real-time (dashboards, cart, profile).

**Q2: Mental model for getStaticPaths?**
> **A:** getStaticPaths answers "which dynamic URLs should I pre-generate at build time?" For a blog with [slug] routes, getStaticPaths returns [{ params: { slug: 'hello-world' } }, { params: { slug: 'nextjs-guide' } }] — Next.js pre-renders those specific pages. fallback: false means any unknown slug returns 404. fallback: true means unknown slugs trigger a fallback page while data is fetched (on-demand ISR). fallback: 'blocking' renders server-side for unknown slugs, then caches the result — no loading state.

**Q3: Most dangerous misconception about Pages Router?**
> **A:** getStaticProps can access browser APIs:
> \`\`\`typescript
> // WRONG: getStaticProps runs at BUILD TIME in Node.js, not in browser
> export async function getStaticProps() {
>   const user = localStorage.getItem('user');  // ReferenceError: localStorage not defined!
>   const token = document.cookie;               // ReferenceError: document not defined!
>   return { props: { user } };
> }
>
> // CORRECT: getStaticProps can only use Node.js APIs and server-side code
> export async function getStaticProps() {
>   const products = await fetch('https://api.example.com/products').then(r => r.json());
>   return { props: { products }, revalidate: 60 };
> }
> \`\`\`

**Q4: How does _app.tsx and _document.tsx work?**
> **A:** _app.tsx wraps EVERY page — it receives the Component (the page) and pageProps (from getStaticProps/getServerSideProps) and renders them. Use _app.tsx for: global CSS imports, layout wrappers, context providers (Redux, Auth), analytics initialisation. _document.tsx wraps the HTML document — use it to add custom html/body attributes, Google Fonts script tags, and viewport meta tags. _document.tsx renders ONLY on the server — browser APIs are unavailable. Changes to _document.tsx require a full server restart.

**Q5: FAANG-grade definition of the Pages Router.**
> **A:** "Next.js Pages Router is a file-system router where pages/ folder files map to URL routes — with getStaticProps for build-time static data fetching (SSG), getServerSideProps for per-request server-side data fetching (SSR), getStaticPaths for dynamic route pre-generation with fallback strategies, API routes at pages/api/, custom _app.tsx for global page wrappers and _document.tsx for HTML customisation — fully supported for existing apps but superseded by App Router for new projects due to lack of persistent layouts, React Server Component support, and streaming."`,

    build: `## BUILD

### 🏗️ Mini Project: Blog With getStaticProps, getStaticPaths, and ISR

**What you will build:** A blog using Pages Router: index page with getStaticProps (post list), dynamic [slug] page with getStaticPaths + getStaticPaths, ISR with revalidate, and an API route for post creation.
**Why this project:** Forces all three Pages Router data-fetching patterns in a realistic blog.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest pages-router-blog --typescript --tailwind --no-app
cd pages-router-blog
npm install gray-matter remark remark-html
mkdir -p content/posts
\`\`\`

#### Step 2 — Markdown Post Data
\`\`\`bash
# content/posts/hello-world.md
cat > content/posts/hello-world.md << 'EOF'
---
title: "Hello World"
date: "2024-01-15"
excerpt: "My first post"
---
# Hello World
Welcome to my blog built with Next.js Pages Router.
EOF
\`\`\`

#### Step 3 — Data Layer
\`\`\`typescript
// lib/posts.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDir = path.join(process.cwd(), 'content/posts');

export interface Post { slug: string; title: string; date: string; excerpt: string; content: string; }

export function getAllPosts(): Omit<Post, 'content'>[] {
  return fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .map(filename => {
      const slug = filename.replace('.md', '');
      const raw = fs.readFileSync(path.join(postsDir, filename), 'utf-8');
      const { data } = matter(raw);
      return { slug, title: data.title, date: data.date, excerpt: data.excerpt };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post {
  const raw = fs.readFileSync(path.join(postsDir, slug + '.md'), 'utf-8');
  const { data, content } = matter(raw);
  return { slug, title: data.title, date: data.date, excerpt: data.excerpt, content };
}
\`\`\`

#### Step 4 — Pages
\`\`\`typescript
// pages/index.tsx — SSG with ISR
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export default function BlogIndex({ posts }: { posts: any[] }) {
  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      {posts.map(post => (
        <article key={post.slug} className="mb-8 p-4 border rounded">
          <h2><Link href={\`/posts/\${post.slug}\`} className="text-blue-600 hover:underline">{post.title}</Link></h2>
          <p className="text-gray-500">{post.date}</p>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const posts = getAllPosts();
  return { props: { posts }, revalidate: 60 };  // ISR: refresh every 60s
};

// pages/posts/[slug].tsx — SSG with getStaticPaths
import { GetStaticPaths, GetStaticProps } from 'next';
import { getAllPosts, getPostBySlug } from '@/lib/posts';

export default function PostPage({ post }: { post: any }) {
  return (
    <article className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <time className="text-gray-500">{post.date}</time>
      <div className="prose mt-4" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllPosts();
  return {
    paths: posts.map(p => ({ params: { slug: p.slug } })),
    fallback: 'blocking',  // on-demand generation for new slugs
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = getPostBySlug(params!.slug as string);
  return { props: { post }, revalidate: 60 };
};
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
// __tests__/posts.test.ts
import { getAllPosts, getPostBySlug } from '@/lib/posts';

describe('posts data layer', () => {
  it('getAllPosts returns array', () => {
    const posts = getAllPosts();
    expect(Array.isArray(posts)).toBe(true);
  });
  it('getPostBySlug returns correct fields', () => {
    const posts = getAllPosts();
    if (posts.length > 0) {
      const post = getPostBySlug(posts[0].slug);
      expect(post.slug).toBeTruthy();
      expect(post.title).toBeTruthy();
    }
  });
});
\`\`\`

**Expected Output:**
\`\`\`
npm run build -> pre-generates index + post pages
npm start -> blog served from static HTML
/posts/hello-world -> pre-rendered post page
New post file + revalidate -> page updates within 60s
Tests: 2 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add getServerSideProps to a user-specific dashboard page
- [ ] Migrate the blog to App Router and compare the code size
- [ ] Add a search API route using getServerSideProps with query params`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between getStaticProps and getServerSideProps?
**Q2:** When does getStaticProps run?
**Q3:** Write getStaticPaths for a [slug] blog route. From memory.

### Day 3 — Comprehension
**Q4:** What is the difference between fallback: false, true, and 'blocking'?
**Q5:** A junior calls localStorage in getStaticProps — what error and why?
**Q6:** What is the purpose of _app.tsx and what goes in it?

### Day 7 — Application
**Q7:** Add ISR to an existing getStaticProps page with a 5-minute revalidation.
**Q8:** When would you choose getServerSideProps over getStaticProps for a product page?
**Q9:** How do you pass data from _app.tsx's getInitialProps to a page?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain the difference between getStaticProps, getServerSideProps, and getStaticPaths — give a real-world use case for each."
**Q11:** Draw: Pages Router data flow — getStaticProps at build time vs getServerSideProps at request time.
**Q12:** ★ System design: "Migrate a 200-page Pages Router app to App Router — which pages use SSG, SSR, ISR, and which become Server Components?"`
  },

  // ── 4. routing-nextjs ─────────────────────────────────────────────────────
  'routing-nextjs': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Routing Like I'm 10 Years Old
> Next.js routing means the URL structure of your app comes from the FOLDER STRUCTURE of your code — no router.config.ts, no route definitions file. In the App Router: app/products/[id]/reviews/page.tsx becomes the URL /products/42/reviews. Every folder is a URL segment. The special syntax: [id] is a dynamic segment (matches any value), [...slug] is a catch-all (matches /a/b/c), [[...slug]] is an optional catch-all, (group) is a route group (no URL effect), @slot is a parallel route slot. Navigation uses the Link component (client-side, prefetches adjacent routes) or useRouter().push() for programmatic navigation. The non-obvious performance feature: Next.js PREFETCHES all visible Link hrefs in the viewport — clicking a link is instant because the page is already downloaded.

---

### 5 Deep Conceptual Questions

**Q1: What is the difference between static and dynamic segments?**
> **A:** Static segments are literal folder names — app/products/featured/page.tsx always matches /products/featured. Dynamic segments use brackets — app/products/[id]/page.tsx matches /products/any-value-here, with the value accessible via params.id. The order of matching: static routes have priority over dynamic routes — /products/featured matches the static route, not [id]. Catch-all segments ([...slug]) match MULTIPLE segments: /docs/a/b/c gives slug = ['a', 'b', 'c']. Optional catch-all ([[...slug]]) also matches the root path where slug is undefined.

**Q2: Mental model for the Link component vs useRouter?**
> **A:** Link renders an anchor tag with client-side navigation — it prefetches the target page when the link is in the viewport (configurable via prefetch prop). The browser doesn't do a full page reload — React swaps only the changed components. useRouter().push('/path') is PROGRAMMATIC navigation — use it after form submission, authentication, or any event that's not a user click on a link. usePathname() gives the current path, useSearchParams() gives query parameters, useParams() gives dynamic segment values. All are Client Component hooks — they can't be used in Server Components.

**Q3: Most dangerous misconception about Next.js routing?**
> **A:** Dynamic routes match before static routes:
> \`\`\`
> // WRONG assumption — dynamic wins over static
> app/
>   products/
>     featured/page.tsx    // /products/featured
>     [id]/page.tsx        // /products/:id
>
> // CORRECT: static segments win over dynamic
> // /products/featured -> matches featured/page.tsx (NOT [id]/page.tsx)
> // /products/123     -> matches [id]/page.tsx
>
> // In Pages Router, same rule:
> pages/products/featured.tsx  // matches /products/featured first
> pages/products/[id].tsx      // matches /products/anything-else
> \`\`\`

**Q4: How does Next.js prefetching work?**
> **A:** In production, Next.js automatically prefetches the JavaScript chunks for all Link components visible in the viewport — before the user clicks. When IntersectionObserver detects a Link is in view, Next.js calls router.prefetch(href) which downloads the page's JavaScript bundle in the background. Clicking the link is instant — the bundle is already cached. In development, prefetching is disabled (to avoid confusing network requests). You can disable per-link with prefetch={false} or force-prefetch with router.prefetch() manually.

**Q5: FAANG-grade definition of Next.js routing.**
> **A:** "Next.js App Router implements a file-system-based hierarchical router — mapping app/ directory structure to URL segments with static segments (literal folders), dynamic segments ([param]), catch-all segments ([...param]), optional catch-alls ([[...param]]), route groups ((group) for layout organisation without URL impact), and parallel routes (@slot) for simultaneous rendering — with automatic prefetching of visible Link components in production, client-side navigation via Link and useRouter, and route interception ((..)segment) for modal-style navigation — all resolving via Next.js's internal routing tree built at compile time from the file structure."`,

    build: `## BUILD

### 🏗️ Mini Project: Routing Showcase — Dynamic, Catch-All, Parallel, and Intercepted Routes

**What you will build:** An app demonstrating every routing pattern: static (/products), dynamic (/products/[id]), catch-all (/docs/[...slug]), parallel (@modal), and intercepted routes for a photo gallery with modal view.
**Why this project:** Forces every routing syntax in context with observable navigation behaviour.
**Time estimate:** 35 minutes

---

#### Step 1 — File Structure
\`\`\`bash
npx create-next-app@latest routing-demo --typescript --tailwind --app
mkdir -p app/products/\\[id\\] app/docs/\\[...slug\\] app/gallery/@modal/\\(..\\)photos/\\[id\\] app/gallery/photos/\\[id\\]
\`\`\`

#### Step 2 — Dynamic Route
\`\`\`typescript
// app/products/[id]/page.tsx
interface Props { params: { id: string } }

export default function ProductPage({ params }: Props) {
  return (
    <div>
      <h1>Product: {params.id}</h1>
      <p>This is a dynamic route — any value matches [id]</p>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
  return { title: \`Product \${params.id}\` };
}
\`\`\`

#### Step 3 — Catch-All Route
\`\`\`typescript
// app/docs/[...slug]/page.tsx
interface Props { params: { slug: string[] } }

export default function DocsPage({ params }: Props) {
  const breadcrumbs = params.slug ?? [];  // optional catch-all gives []  for root
  return (
    <div>
      <h1>Docs: {breadcrumbs.join(' / ')}</h1>
      <p>Matches: /docs/getting-started, /docs/api/routes, /docs/api/config</p>
      <p>Current segments: {JSON.stringify(breadcrumbs)}</p>
    </div>
  );
}
\`\`\`

#### Step 4 — Navigation Patterns
\`\`\`typescript
// app/products/page.tsx — Link with prefetch
import Link from 'next/link';

export default function ProductsPage() {
  const productIds = [1, 2, 3, 4, 5];
  return (
    <div>
      <h1>Products</h1>
      {productIds.map(id => (
        <Link
          key={id}
          href={\`/products/\${id}\`}
          prefetch={true}          // prefetch this page on hover (default in production)
          className="block p-2 border rounded mb-2 hover:bg-gray-50"
        >
          Product {id}
        </Link>
      ))}
    </div>
  );
}

// Programmatic navigation
'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
export function NavigationDemo() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div>
      <p>Current path: {pathname}</p>
      <p>Query: {searchParams.get('q') ?? 'none'}</p>
      <button onClick={() => router.push('/products?q=new')}>Navigate</button>
      <button onClick={() => router.back()}>Back</button>
      <button onClick={() => router.refresh()}>Refresh</button>
    </div>
  );
}
\`\`\`

#### Step 5 — Route Groups For Layout Separation
\`\`\`
// Route groups enable different layouts without affecting URL:
app/
  (marketing)/          # no (marketing) in URL
    layout.tsx          # marketing layout (full-width, no sidebar)
    page.tsx            # /
    about/page.tsx      # /about
  (app)/                # no (app) in URL
    layout.tsx          # app layout (with sidebar)
    dashboard/page.tsx  # /dashboard
    settings/page.tsx   # /settings
\`\`\`

**Expected Output:**
\`\`\`
/products/42 -> "Product: 42"
/docs/api/config -> slug = ['api', 'config']
/docs -> slug = [] (optional catch-all)
Link prefetch: hover over product link -> Network tab shows prefetch request
\`\`\`

**Stretch Challenges:**
- [ ] Add intercepting routes for a photo gallery modal /(.)photos/[id]
- [ ] Add parallel routes @analytics to show dashboard stats alongside main content
- [ ] Add middleware to redirect /products -> /shop`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between [id], [...slug], and [[...slug]]?
**Q2:** How does Next.js prefetching work?
**Q3:** Write a dynamic route that reads params.id. From memory.

### Day 3 — Comprehension
**Q4:** What is a route group (parentheses) and what URL effect does it have?
**Q5:** A junior puts a shared component in app/shared/Button.tsx — does it become a route?
**Q6:** When do you use useRouter().push() vs Link?

### Day 7 — Application
**Q7:** Build a breadcrumb component from the current URL using usePathname.
**Q8:** How do intercepting routes enable modal photo galleries?
**Q9:** What happens when two dynamic routes have the same structure at the same level?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain Next.js routing — how does the file system map to URLs, and what are the special conventions?"
**Q11:** Draw: routing tree for an e-commerce app with products, categories, and user account routes.
**Q12:** ★ System design: "Design the URL structure and routing for a multi-tenant SaaS app in Next.js — /[team]/[project]/[resource]."`
  },

  // ── 5. layouts-and-templates ──────────────────────────────────────────────
  'layouts-and-templates': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Layouts and Templates Like I'm 10 Years Old
> A layout.tsx wraps multiple pages with SHARED UI (navbar, sidebar, footer) that STAYS MOUNTED when you navigate between pages inside it — the component never unmounts, preserving scroll position, form state, and loaded data. A template.tsx looks identical but RE-MOUNTS on every navigation — like creating a brand new component each time. Use layout for persistent navigation shells. Use template when you WANT fresh state on each navigation (like tracking page views, resetting form state). The non-obvious depth: because layouts are Server Components by default, they can fetch their own data (user profile for navbar, unread notification count) without any client-side state management — the layout's data is fetched fresh on each server request but the client NEVER re-renders the layout HTML unless its data changes.

---

### 5 Deep Conceptual Questions

**Q1: How do nested layouts compose?**
> **A:** Layouts nest — a child route's layout renders INSIDE its parent layout. RootLayout (app/layout.tsx) wraps everything. DashboardLayout (app/dashboard/layout.tsx) renders inside RootLayout. SettingsLayout (app/dashboard/settings/layout.tsx) renders inside DashboardLayout. The children prop of each layout receives the next level down. This creates a composition tree where each layout handles only its concern (RootLayout: html/body/providers, DashboardLayout: sidebar/topnav, SettingsLayout: settings sidebar). Each layout is a Server Component by default.

**Q2: Mental model for when to use template vs layout?**
> **A:** Layout = STABLE SHELL (re-uses existing DOM on navigation). Template = FRESH INSTANCE (mounts new DOM on navigation). Use layout for: persistent navigation, modal state, sidebar, headers. Use template for: page view analytics (track every navigation as a new "visit"), entry animations (animate on every page visit), forms that should reset state, A/B testing that needs re-evaluation per visit. The distinction is subtle but important — incorrect choice causes either missing analytics events (layout where template needed) or jarring re-renders (template where layout needed).

**Q3: Most dangerous misconception about layouts?**
> **A:** Layouts can use React hooks directly:
> \`\`\`typescript
> // WRONG: default layout.tsx is a Server Component — no hooks
> // app/dashboard/layout.tsx
> import { useState } from 'react';
> export default function DashboardLayout({ children }) {
>   const [open, setOpen] = useState(false);  // ERROR: hooks not allowed in Server Component
>   return <div>{children}</div>;
> }
>
> // CORRECT: add 'use client' if you need state in a layout
> 'use client';
> import { useState } from 'react';
> export default function DashboardLayout({ children }) {
>   const [sidebarOpen, setSidebarOpen] = useState(true);
>   return (
>     <div className="flex">
>       <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
>       <main>{children}</main>
>     </div>
>   );
> }
> // But: 'use client' layout prevents Server Component children from accessing DB directly
> // Better: keep layout as Server Component, extract interactive sidebar to 'use client' component
> \`\`\`

**Q4: How do layouts handle parallel routes?**
> **A:** Layouts receive parallel route slots as named props alongside children. A layout can render both {children} (the main content) and {modal} (a parallel route slot) simultaneously: function Layout({ children, modal }) { return <>{children}{modal}</> }. When navigating to a route that fills the modal slot, the layout renders both the background content (children) and the modal (modal slot) — enabling URL-addressable modals that work with browser back/forward.

**Q5: FAANG-grade definition of Next.js layouts.**
> **A:** "Next.js layouts (layout.tsx) are persistent Server Component wrappers that render shared UI around child routes — maintaining DOM and state between navigations via React's reconciliation (the layout component never unmounts) — enabling per-segment layouts at any route depth, server-fetched layout data (auth user, notifications) without client-side effects, and parallel route slot composition — distinguished from templates (template.tsx) which re-instantiate on each navigation — with the root layout (app/layout.tsx) being required as the single html/body wrapper for the entire application."`,

    build: `## BUILD

### 🏗️ Mini Project: Multi-Level Layout System — Root, Dashboard, Settings, and Template Demo

**What you will build:** Three nested layouts (root → dashboard → settings) each fetching their own data (mock user for root, team for dashboard, settings for settings), demonstrating layout persistence vs template re-mount, and slot composition.
**Why this project:** Forces all layout concepts: nesting, server data, persistence, 'use client' extraction.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest layouts-demo --typescript --tailwind --app
\`\`\`

#### Step 2 — Root Layout (Server Component with auth data)
\`\`\`typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

async function getUser() {
  // In production: verify session cookie and fetch from DB
  return { id: '1', name: 'Ana Dev', email: 'ana@example.com', plan: 'pro' };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-xl">DevApp</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user.plan} plan</span>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
              {user.name[0]}
            </div>
          </div>
        </header>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
\`\`\`

#### Step 3 — Dashboard Layout (Client Component for interactivity)
\`\`\`typescript
// app/dashboard/layout.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/projects', label: 'Projects' },
    { href: '/dashboard/settings', label: 'Settings' },
  ];

  return (
    <div className="flex h-full">
      <nav className={\`bg-gray-900 text-white transition-all \${collapsed ? 'w-16' : 'w-64'}\`}>
        <button onClick={() => setCollapsed(c => !c)} className="p-3 w-full text-left text-gray-400">
          {collapsed ? '>>' : '<< Collapse'}
        </button>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={\`block px-4 py-2 \${pathname === item.href ? 'bg-blue-600' : 'hover:bg-gray-800'}\`}
          >
            {collapsed ? item.label[0] : item.label}
          </Link>
        ))}
      </nav>
      <main className="flex-1 p-6 overflow-auto">
        {/* sidebar collapsed state persists across navigations -- layout is never remounted */}
        {children}
      </main>
    </div>
  );
}
\`\`\`

#### Step 4 — Template Demo (Re-mounts on Navigation)
\`\`\`typescript
// app/dashboard/template.tsx  (remove layout.tsx to test this instead)
'use client';
import { useEffect, useState } from 'react';

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  const [mountTime] = useState(new Date().toISOString());

  useEffect(() => {
    console.log('Template mounted at:', mountTime);
    // This fires on EVERY navigation because template re-mounts
    // Contrast: layout.tsx would only mount once
  }, []);

  return (
    <div>
      <div className="text-xs text-gray-400 mb-2">Mounted: {mountTime}</div>
      {children}
    </div>
  );
}
\`\`\`

#### Step 5 — Metadata Export From Layout
\`\`\`typescript
// layouts can export metadata for SEO
// app/dashboard/layout.tsx (server version)
export const metadata = {
  title: { template: '%s | Dashboard', default: 'Dashboard' },
  description: 'Your development dashboard',
};
// Child pages: export const metadata = { title: 'Settings' }
// -> Renders as "Settings | Dashboard"
\`\`\`

**Expected Output:**
\`\`\`
Navigate /dashboard -> /dashboard/settings:
  Sidebar collapsed state PRESERVED (layout = no remount)
  Header user name PRESERVED (root layout = no remount)

Switch layout.tsx to template.tsx:
  Sidebar state RESETS on every navigation
  Console shows "Template mounted at:" on every navigation
\`\`\`

**Stretch Challenges:**
- [ ] Add an intercepting route that shows a settings modal above /dashboard
- [ ] Add metadata templating that gives each section a descriptive title
- [ ] Extract the sidebar collapse state to a Zustand store to persist across browser sessions`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is the difference between layout.tsx and template.tsx?
**Q2:** When is a layout re-mounted?
**Q3:** Write a Server Component layout that fetches user data. From memory.

### Day 3 — Comprehension
**Q4:** Why should the interactive sidebar be in a separate 'use client' component rather than the layout?
**Q5:** How do nested layouts compose — what does each layout's children receive?
**Q6:** What is the required root layout and what must it contain?

### Day 7 — Application
**Q7:** Build a multi-tenant layout where /[team]/layout.tsx fetches team data.
**Q8:** A PR uses template.tsx for a navbar — explain why state resets on navigation.
**Q9:** How do you add metadata title templating across layout and page levels?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain Next.js layout persistence — how does it work technically and why does it matter for UX?"
**Q11:** Draw: nested layout composition tree for a SaaS app — RootLayout, AppLayout, DashboardLayout, PageContent.
**Q12:** ★ System design: "Design the layout architecture for a multi-tenant Next.js SaaS — root, team, project, and resource layouts with appropriate data fetching at each level."`
  },

  // ── 6. server-components-next ─────────────────────────────────────────────
  'server-components-next': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Server Components Like I'm 10 Years Old
> React Server Components (RSC) are React components that run ONLY on the server — they never send their JavaScript to the browser. A regular React component ships its JS to the user; a Server Component renders HTML on the server and sends JUST THE HTML to the browser. This means: zero component JavaScript in the browser bundle, direct database access without an API layer, secrets like API keys stay server-side, and async/await works directly in the component. The non-obvious depth: Server Components and Client Components can be INTERLEAVED — a Server Component renders most of the page and passes specific interactive pieces to Client Components as children. The "server/client boundary" is determined by the 'use client' directive at the TOP of a file — everything above it in the import tree is server-only.

---

### 5 Deep Conceptual Questions

**Q1: What can Server Components do that Client Components cannot, and vice versa?**
> **A:** Server Components CAN: directly access databases (no API needed), read filesystem files, use environment secrets (process.env.SECRET_KEY), import large server-only libraries without bloating the client bundle, be async functions with await. Server Components CANNOT: use useState, useEffect, or any hook, attach event handlers (onClick), access browser APIs (window, document, localStorage), be used in a 'use client' file. Client Components CAN do all the above that Server Components cannot. Client Components CANNOT: be async functions (yet), directly access databases, import server-only libraries.

**Q2: Mental model for the server/client boundary?**
> **A:** The boundary is where 'use client' appears at the TOP of a file. Everything imported by a 'use client' file becomes part of the client bundle. The rule: 'use client' "infects" downward — all children components of a 'use client' component are also treated as client components. But the PARENT can still be a Server Component. Pattern: keep the page/layout as Server Component (fetch data, access DB), pass data DOWN as props to a targeted 'use client' component (the button, form, interactive widget). Never put 'use client' at the top level unless necessary.

**Q3: Most dangerous misconception about Server Components?**
> **A:** All components in app/ are Server Components by default:
> \`\`\`typescript
> // WRONG: thinking third-party components are Server-safe
> import { SomeChart } from 'chart-library';  // uses useState internally
> // ERROR: chart-library is not marked 'use server', but uses client APIs
>
> // CORRECT: wrap third-party components that need browser APIs
> // components/ChartWrapper.tsx
> 'use client';
> import { SomeChart } from 'chart-library';
> export function ChartWrapper(props: any) { return <SomeChart {...props} />; }
>
> // Now use ChartWrapper in Server Components safely:
> import { ChartWrapper } from './ChartWrapper';
> export default async function DashboardPage() {
>   const data = await db.getMetrics();
>   return <ChartWrapper data={data} />;  // data flows from server, chart renders on client
> }
> \`\`\`

**Q4: How do Server Components affect the bundle size?**
> **A:** Any import in a Server Component is EXCLUDED from the client bundle — it stays on the server. If a Server Component imports a 500KB markdown parser, that 500KB never reaches the browser. This is why Next.js's default Server Components model dramatically reduces bundle sizes — only the specific 'use client' components and their imports go to the browser. You can verify: next/bundle-analyzer shows zero KB for server-only imports. This enables using large server libraries (pdf generators, markdown parsers, ORMs) without any performance penalty for the user.

**Q5: FAANG-grade definition of React Server Components in Next.js.**
> **A:** "React Server Components (RSC) are React components that execute exclusively on the server — enabling async/await syntax, direct database access, server-only library imports with zero client bundle impact, and access to server-side secrets — rendered to RSC payload (a serializable description of the component tree) and streamed to the client — with the 'use client' directive marking the server/client boundary below which components receive interactivity (hooks, events, browser APIs) — and serializable props as the only data channel from Server to Client Components — enabling large portions of a React application to have zero client JavaScript while maintaining seamless composition with interactive Client Components."`,

    build: `## BUILD

### 🏗️ Mini Project: RSC Data Pipeline — Server Fetches, Client Interacts, Zero API Layer

**What you will build:** A product dashboard where: a Server Component reads directly from a SQLite database, passes data as props to a 'use client' FilterBar, which updates the URL, which causes the Server Component to re-render with filtered data — demonstrating RSC's zero-API data layer.
**Why this project:** Forces the server/client composition pattern — the most important RSC architectural decision.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest rsc-demo --typescript --tailwind --app
npm install better-sqlite3 @types/better-sqlite3
\`\`\`

#### Step 2 — Server-Only Database Module
\`\`\`typescript
// src/lib/db.server.ts  (server-only convention — import only in Server Components)
import 'server-only';  // throws if imported in client bundle
import Database from 'better-sqlite3';

const db = new Database('products.db');
// ... seed data

export interface Product { id: number; name: string; price: number; category: string; }

export async function getProducts(filters: { category?: string; minPrice?: number } = {}): Promise<Product[]> {
  let query = 'SELECT * FROM products WHERE 1=1';
  const params: any[] = [];
  if (filters.category) { query += ' AND category = ?'; params.push(filters.category); }
  if (filters.minPrice) { query += ' AND price >= ?'; params.push(filters.minPrice); }
  return db.prepare(query).all(...params) as Product[];
}
\`\`\`

#### Step 3 — Server Component Page
\`\`\`typescript
// src/app/products/page.tsx  -- Server Component (no 'use client')
import { getProducts } from '@/lib/db.server';
import { ProductGrid } from '@/components/ProductGrid';
import { FilterBar } from '@/components/FilterBar';  // 'use client' component

interface Props {
  searchParams: { category?: string; minPrice?: string };
}

export default async function ProductsPage({ searchParams }: Props) {
  // Direct DB access — no fetch(), no API route needed
  const products = await getProducts({
    category: searchParams.category,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
  });

  const categories = ['all', 'electronics', 'books', 'tools'];

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Products ({products.length})</h1>
      {/* FilterBar is a Client Component — receives data from Server Component */}
      <FilterBar categories={categories} />
      {/* ProductGrid is a Server Component — renders static HTML */}
      <ProductGrid products={products} />
    </main>
  );
}
\`\`\`

#### Step 4 — Client Component FilterBar
\`\`\`typescript
// src/components/FilterBar.tsx
'use client';
import { useRouter, useSearchParams } from 'next/navigation';

interface Props { categories: string[]; }

export function FilterBar({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setCategory = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') params.delete('category');
    else params.set('category', category);
    // Updating URL causes Server Component to re-fetch filtered products
    router.push(\`/products?\${params.toString()}\`);
  };

  const currentCategory = searchParams.get('category') ?? 'all';

  return (
    <div className="flex gap-2 mb-4">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={\`px-3 py-1 rounded \${currentCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-100'}\`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
// Test the Server Component data fetching
import { getProducts } from '@/lib/db.server';
describe('getProducts', () => {
  it('returns all products when no filter', async () => {
    const products = await getProducts();
    expect(Array.isArray(products)).toBe(true);
  });
  it('filters by category', async () => {
    const books = await getProducts({ category: 'books' });
    books.forEach(p => expect(p.category).toBe('books'));
  });
});

// Test FilterBar component (client component)
import { render } from '@testing-library/react';
it('renders category buttons', () => {
  const { getByText } = render(<FilterBar categories={['all', 'books']} />);
  expect(getByText('all')).toBeTruthy();
  expect(getByText('books')).toBeTruthy();
});
\`\`\`

**Expected Output:**
\`\`\`
/products -> all products (server-rendered HTML, zero client JS for ProductGrid)
Click "books" -> URL becomes /products?category=books -> Server Component re-fetches
Network tab: NO /api/products request (direct DB access on server)
Bundle analyzer: db.server.ts NOT in client bundle
Tests: 3 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add a Client Component AddToCart button that calls a Server Action
- [ ] Add Suspense with a loading skeleton for the ProductGrid
- [ ] Compare bundle sizes with and without the 'use client' boundary`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What can Server Components do that Client Components cannot?
**Q2:** Where is the server/client boundary determined?
**Q3:** Write a Server Component that fetches data from a database. From memory.

### Day 3 — Comprehension
**Q4:** How do Server Components affect client bundle size?
**Q5:** A junior imports a chart library in a Server Component — what happens?
**Q6:** How do you safely use a third-party library that requires browser APIs?

### Day 7 — Application
**Q7:** Build a product page where Server Component fetches data, Client Component handles add-to-cart.
**Q8:** A PR puts 'use client' at the top of the root layout — explain the consequence.
**Q9:** What is the 'server-only' package and when do you use it?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain React Server Components — what they are, what they enable, and what the server/client boundary means."
**Q11:** Draw: RSC component tree showing server/client boundary and data flow.
**Q12:** ★ System design: "Design the component architecture for a Next.js e-commerce site — which parts are Server Components, which are Client Components, and why?"`
  },

  // ── 7. client-components ──────────────────────────────────────────────────
  'client-components': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Client Components Like I'm 10 Years Old
> Client Components are regular React components that run IN THE BROWSER — they can use hooks (useState, useEffect, useRef), handle events (onClick, onSubmit), access browser APIs (localStorage, window), and use any third-party React library. You mark them with 'use client' at the TOP of the file. Without 'use client', Next.js assumes the component is a Server Component. The non-obvious rule: 'use client' creates a MODULE BOUNDARY — every component imported by a 'use client' file is automatically a Client Component too, even without their own 'use client' directive. So put 'use client' as LOW in the component tree as possible — only on the specific interactive component, not on a parent that wraps everything.

---

### 5 Deep Conceptual Questions

**Q1: When MUST you use 'use client'?**
> **A:** You need 'use client' when a component: (1) Uses React hooks (useState, useEffect, useContext, useRef, etc.). (2) Attaches event handlers (onClick, onChange, onSubmit). (3) Accesses browser-only APIs (window, document, localStorage, navigator, IntersectionObserver). (4) Uses third-party libraries that themselves use any of the above. The goal: use 'use client' as sparingly as possible — only on the leaf components that actually need interactivity, not on wrappers or pages.

**Q2: Mental model for SSR of Client Components?**
> **A:** Despite the name, Client Components are ALSO rendered on the server for the initial HTML (unless you use dynamic('no-ssr')). They're called "Client Components" because they ship their JavaScript to the browser and can be interactive there. The lifecycle: server renders the initial HTML → sends to browser → browser downloads JS → React hydrates (attaches event listeners to server HTML). This means useState/useEffect still have access to server-generated HTML initially — the component STARTS as static HTML and becomes interactive after hydration.

**Q3: Most dangerous misconception about Client Components?**
> **A:** Server Components can be children of Client Components:
> \`\`\`typescript
> // WRONG: passing Server Component as JSX inside Client Component
> 'use client';
> export function ClientWrapper() {
>   return (
>     <div>
>       <ServerOnlyComponent />  // ERROR: can't import Server Component into Client Component
>     </div>
>   );
> }
>
> // CORRECT: pass Server Component as children (composition pattern)
> 'use client';
> export function ClientWrapper({ children }: { children: React.ReactNode }) {
>   return <div>{children}</div>;  // children can be Server Component output
> }
>
> // Parent Server Component composes them:
> import { ClientWrapper } from './ClientWrapper';
> import { ServerOnlyComponent } from './ServerOnlyComponent';
> export default function Page() {
>   return (
>     <ClientWrapper>
>       <ServerOnlyComponent />  // Server Component passed as children prop to Client
>     </ClientWrapper>
>   );
> }
> \`\`\`

**Q4: How does hydration work for Client Components?**
> **A:** Next.js sends server-rendered HTML (including Client Component HTML) to the browser. The browser displays this static HTML immediately (fast First Contentful Paint). Then React downloads the Client Component JavaScript, compares the expected HTML to the existing DOM (reconciliation), and attaches event listeners without re-rendering (hydration). Hydration errors occur when the server HTML doesn't match the expected client HTML — common cause: rendering based on window, Date.now(), or Math.random() in render (server value differs from client value on hydration).

**Q5: FAANG-grade definition of Next.js Client Components.**
> **A:** "Next.js Client Components are React components marked with 'use client' — designating them as the module boundary where server rendering ends and client JavaScript begins — rendered on the server for initial HTML (SSR/hydration) then shipped as JavaScript to the browser for interactivity — enabling React hooks, event handlers, browser API access, and third-party interactive libraries — with the recommendation to push 'use client' as deep as possible in the component tree to minimise client bundle size while maintaining the ability to pass Server Component output as children props to Client Components."`,

    build: `## BUILD

### 🏗️ Mini Project: Interactive Dashboard Widget — Client Component With Server Data

**What you will build:** A real-time search widget: Server Component fetches initial data, Client Component handles search input (useState + debounce), and a shared state pattern using URL search params — demonstrating the optimal Client Component placement.
**Why this project:** Forces the "push client as low as possible" pattern with real debounced search.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest client-demo --typescript --tailwind --app
\`\`\`

#### Step 2 — Debounce Hook (reusable client utility)
\`\`\`typescript
// src/hooks/useDebounce.ts
'use client';
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);  // cleanup: cancel timer if value changes before delay
  }, [value, delay]);

  return debouncedValue;
}
\`\`\`

#### Step 3 — Search Input (Client Component — leaves only)
\`\`\`typescript
// src/components/SearchInput.tsx
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface Props { placeholder?: string; }

export function SearchInput({ placeholder = 'Search...' }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [isPending, startTransition] = useTransition();
  const debouncedQuery = useDebounce(query, 300);

  // Update URL when debounced query changes
  useEffect(() => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedQuery) params.set('q', debouncedQuery);
      else params.delete('q');
      router.push(\`?\${params.toString()}\`);
    });
  }, [debouncedQuery]);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg"
      />
      {isPending && <span className="absolute right-3 top-2 text-gray-400">...</span>}
    </div>
  );
}
\`\`\`

#### Step 4 — Server Component Page (data fetching + SearchInput composition)
\`\`\`typescript
// src/app/search/page.tsx  -- Server Component
import { SearchInput } from '@/components/SearchInput';  // Client Component
import { Suspense } from 'react';

async function Results({ query }: { query: string }) {
  // Simulate DB search — this runs on the server
  await new Promise(r => setTimeout(r, 100));
  const allUsers = [
    { id: 1, name: 'Ana Dev', role: 'engineer' },
    { id: 2, name: 'Ben Ops', role: 'devops' },
    { id: 3, name: 'Carmen PM', role: 'manager' },
  ];
  const filtered = query
    ? allUsers.filter(u => u.name.toLowerCase().includes(query.toLowerCase()))
    : allUsers;

  return (
    <ul className="mt-4 space-y-2">
      {filtered.length === 0 && <li className="text-gray-500">No results for "{query}"</li>}
      {filtered.map(u => (
        <li key={u.id} className="p-3 border rounded">
          <strong>{u.name}</strong> — {u.role}
        </li>
      ))}
    </ul>
  );
}

interface Props { searchParams: { q?: string } }

export default function SearchPage({ searchParams }: Props) {
  const query = searchParams.q ?? '';
  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">User Search</h1>
      {/* Client Component for input interactivity */}
      <Suspense>
        <SearchInput placeholder="Search users..." />
      </Suspense>
      {/* Server Component for results — re-renders when URL changes */}
      <Suspense fallback={<div className="mt-4 animate-pulse h-20 bg-gray-100 rounded" />}>
        <Results query={query} />
      </Suspense>
    </main>
  );
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
// useDebounce.test.ts
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeAll(() => jest.useFakeTimers());
  afterAll(() => jest.useRealTimers());

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('debounces value change', () => {
    const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
      initialProps: { val: 'a' },
    });
    rerender({ val: 'ab' });
    expect(result.current).toBe('a');  // not updated yet
    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe('ab');  // now updated
  });
});
\`\`\`

**Expected Output:**
\`\`\`
/search -> all 3 users shown (server rendered)
Type "Ana" -> debounce 300ms -> URL updates -> Server Component re-fetches
?q=Ana -> only Ana Dev shown
Type fast "a", "an", "ana" -> only one DB query (debounced)
Tests: 2 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add React Query for client-side data that must stay fresh
- [ ] Add an optimistic UI update that shows results immediately before server confirms
- [ ] Measure bundle size difference with 'use client' on page vs on SearchInput only`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** When must you add 'use client' to a component?
**Q2:** Can Server Components be children of Client Components?
**Q3:** Write a Client Component search input with useState. From memory.

### Day 3 — Comprehension
**Q4:** What is a hydration error and what causes it?
**Q5:** A junior adds 'use client' to the root layout — explain the consequence.
**Q6:** How do you pass Server Component output to a Client Component?

### Day 7 — Application
**Q7:** Build an add-to-cart button as a Client Component that receives product ID from Server Component.
**Q8:** A PR wraps the entire page in 'use client' because it has one interactive button — refactor.
**Q9:** When would you use dynamic('no-ssr') instead of 'use client'?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain the 'use client' boundary — what it means for rendering, bundling, and the composition pattern."
**Q11:** Draw: RSC/Client Component tree showing data flow and bundle boundaries.
**Q12:** ★ System design: "Design a real-time analytics dashboard in Next.js — which parts use Server Components, which use Client Components with WebSocket, and how do they compose?"`
  },

  // ── 8. server-side-rendering ──────────────────────────────────────────────
  'server-side-rendering': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js SSR Like I'm 10 Years Old
> Server-Side Rendering (SSR) means Next.js renders your page HTML on the server FOR EVERY REQUEST — when a user visits /dashboard, the server fetches their data and sends them a pre-built HTML page personalised for them. Without SSR, the server sends an empty HTML shell and the browser does all the work (slow first load, blank page). With SSR, the user sees real content IMMEDIATELY because the HTML arrives pre-populated. The non-obvious trade-off: SSR means EVERY page visit hits your server — it cannot be cached on a CDN. For truly high-traffic pages (millions of hits), SSG (pre-built HTML on CDN) is faster. SSR is best for personalised pages (dashboards, account, cart) where the content must be fresh for each user.

---

### 5 Deep Conceptual Questions

**Q1: When should you use SSR (dynamic rendering) vs SSG?**
> **A:** Use SSR when: content is personalised per user (dashboard, account page), content must be real-time (stock prices, live inventory), the page requires request-time data (cookies for auth, IP for geo), or content changes too frequently for ISR. Use SSG when: content is the same for all users (blog posts, docs, landing pages), content changes rarely (daily or less), or maximum performance is needed (CDN-served, sub-50ms TTFB). The rule: if you need the request object (cookies, headers, IP) to render the page, you need SSR. Otherwise, prefer SSG.

**Q2: Mental model for Next.js App Router dynamic rendering?**
> **A:** In the App Router, pages are STATICALLY RENDERED by default. They become DYNAMICALLY RENDERED (SSR) automatically when: the component accesses dynamic functions (cookies(), headers(), searchParams), when you use unstable_noStore() or fetch('url', { cache: 'no-store' }), or when you export dynamic = 'force-dynamic'. Next.js infers this at build time — if it detects dynamic function usage, it marks the route as dynamic and skips pre-rendering. No explicit SSR configuration needed; it happens based on your code.

**Q3: Most dangerous misconception about SSR?**
> **A:** SSR responses can be cached by CDNs:
> \`\`\`typescript
> // WRONG: SSR pages are dynamic — CDNs cannot cache them per-user
> // Putting a personalised page behind a CDN serves the same cached page to everyone:
> // User A logs in -> CDN caches their dashboard -> User B gets User A's dashboard!
>
> // CORRECT: SSR responses MUST have appropriate cache-control headers
> // For personalised pages:
> import { headers } from 'next/headers';
> export default async function DashboardPage() {
>   const cookieStore = cookies();  // accessing cookies forces dynamic rendering
>   const user = await getUserFromCookie(cookieStore.get('session'));
>   return <Dashboard user={user} />;
> }
> // Next.js sets Cache-Control: private, no-cache automatically for dynamic pages
> \`\`\`

**Q4: How does streaming improve SSR performance?**
> **A:** Traditional SSR: wait for ALL server work to complete → send complete HTML → user sees page. Streaming SSR: send HTML shell immediately → stream each Suspense boundary's HTML as it resolves → user sees the page skeleton instantly, data fills in progressively. Next.js implements this via React 18's streaming server renderer. The critical metric: Time To First Byte (TTFB) drops to near-zero with streaming because the shell arrives instantly, while Time To Interactive improves because interactive content streams in without blocking.

**Q5: FAANG-grade definition of Next.js SSR.**
> **A:** "Next.js server-side rendering (dynamic rendering) generates page HTML at request time on the Node.js server — triggered automatically when dynamic functions (cookies(), headers(), searchParams) are used or fetch is called with cache: 'no-store' — producing per-request personalised HTML with React 18 streaming for progressive content delivery — setting private, no-cache response headers to prevent CDN caching — appropriate for authenticated, personalised, or real-time content where static pre-generation is impossible — with Suspense boundaries enabling simultaneous HTML streaming of fast and slow content without blocking."`,

    build: `## BUILD

### 🏗️ Mini Project: Personalised Dashboard — Cookie-Based Auth + Dynamic SSR + Streaming

**What you will build:** A dashboard page that: reads a session cookie for auth, fetches user-specific data server-side (no API calls from client), streams slow widgets via Suspense, and demonstrates the dynamic rendering trigger.
**Why this project:** Forces all SSR triggers: cookies(), dynamic rendering, Suspense streaming.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest ssr-demo --typescript --tailwind --app
npm install jose  # for JWT verification
\`\`\`

#### Step 2 — Auth Utilities
\`\`\`typescript
// src/lib/auth.ts
import { cookies } from 'next/headers';

export interface SessionUser { id: string; name: string; email: string; role: string; }

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();  // TRIGGERS DYNAMIC RENDERING
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  // In production: verify JWT with jose
  // For demo, decode a simple base64 token
  try {
    const payload = JSON.parse(atob(token));
    return payload as SessionUser;
  } catch {
    return null;
  }
}
\`\`\`

#### Step 3 — Dynamic SSR Dashboard
\`\`\`typescript
// src/app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getSessionUser } from '@/lib/auth';

// Simulate slow data fetches
async function getRevenueMetrics(userId: string) {
  await new Promise(r => setTimeout(r, 1500));  // slow query
  return { total: 42000, growth: 12.5, currency: 'USD' };
}

async function getRecentActivity(userId: string) {
  await new Promise(r => setTimeout(r, 500));   // fast query
  return [
    { id: 1, action: 'Deployed app', time: '2m ago' },
    { id: 2, action: 'PR merged', time: '15m ago' },
  ];
}

async function RevenueWidget({ userId }: { userId: string }) {
  const metrics = await getRevenueMetrics(userId);
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="font-bold text-gray-600">Revenue</h3>
      <p className="text-3xl font-bold">{metrics.total.toLocaleString()} {metrics.currency}</p>
      <p className="text-green-500">+{metrics.growth}% this month</p>
    </div>
  );
}

async function ActivityFeed({ userId }: { userId: string }) {
  const activity = await getRecentActivity(userId);
  return (
    <ul className="space-y-2">
      {activity.map(a => (
        <li key={a.id} className="flex justify-between text-sm">
          <span>{a.action}</span>
          <span className="text-gray-400">{a.time}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect('/login');  // server-side redirect if not authenticated

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Welcome, {user.name}</h1>
      <p className="text-gray-500 mb-6">{user.email}</p>

      <div className="grid grid-cols-2 gap-6">
        {/* ActivityFeed is fast — streams first */}
        <Suspense fallback={<div className="h-40 animate-pulse bg-gray-100 rounded-lg" />}>
          <ActivityFeed userId={user.id} />
        </Suspense>

        {/* RevenueWidget is slow — streams after 1.5s */}
        <Suspense fallback={<div className="h-40 animate-pulse bg-gray-100 rounded-lg" />}>
          <RevenueWidget userId={user.id} />
        </Suspense>
      </div>
    </main>
  );
}
\`\`\`

#### Step 4 — Login API Route
\`\`\`typescript
// src/app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // Demo auth — in production: verify against DB
  if (email === 'demo@example.com' && password === 'password') {
    const user = { id: '1', name: 'Demo User', email, role: 'user' };
    const token = btoa(JSON.stringify(user));

    const response = NextResponse.json({ success: true });
    response.cookies.set('session', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24,  // 1 day
    });
    return response;
  }
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
// Test the auth utility
import { getSessionUser } from '@/lib/auth';

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) => name === 'session'
      ? { value: btoa(JSON.stringify({ id: '1', name: 'Test', email: 'a@b.com', role: 'user' })) }
      : undefined,
  }),
}));

it('getSessionUser returns user from valid cookie', async () => {
  const user = await getSessionUser();
  expect(user?.email).toBe('a@b.com');
  expect(user?.name).toBe('Test');
});
\`\`\`

**Expected Output:**
\`\`\`
POST /api/login -> sets session cookie
/dashboard (with cookie) -> user-specific HTML rendered on server
/dashboard (no cookie) -> redirects to /login
ActivityFeed appears first (500ms), RevenueWidget streams in after 1.5s
curl -H "Cookie: session=..." http://localhost:3000/dashboard -> full HTML response
\`\`\`

**Stretch Challenges:**
- [ ] Replace base64 token with proper JWT using jose
- [ ] Add middleware.ts that protects all /dashboard/* routes
- [ ] Measure TTFB improvement of streaming vs non-streaming SSR`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What makes a Next.js page dynamically rendered (SSR)?
**Q2:** Why can't SSR pages be cached on a CDN?
**Q3:** Write an SSR page that reads a session cookie. From memory.

### Day 3 — Comprehension
**Q4:** What is the difference between SSR and streaming SSR?
**Q5:** A junior puts a public product page on SSR — explain the performance cost.
**Q6:** What Next.js function auto-triggers dynamic rendering?

### Day 7 — Application
**Q7:** Add a dashboard page that shows user-specific data from cookies.
**Q8:** A PR uses getServerSideProps but the team migrated to App Router — refactor.
**Q9:** How do you force a Server Component to always be dynamic without using cookies?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Compare Next.js SSR and SSG — when does each one perform better and why?"
**Q11:** Draw: SSR request flow — browser request → Next.js server → DB → HTML → browser hydration.
**Q12:** ★ System design: "Design the rendering strategy for an e-commerce site: homepage, product pages, cart, checkout, and account."`
  },

  // ── 9. static-site-generation ─────────────────────────────────────────────
  'static-site-generation': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js SSG Like I'm 10 Years Old
> Static Site Generation (SSG) means Next.js builds your page's HTML at BUILD TIME — before any user visits. The HTML file sits on a CDN server. When a user visits, they get that pre-built HTML file instantly — no server processing, no database queries, no waiting. It's like printing a million identical books before anyone orders them — when someone orders, you just ship the already-printed book. The non-obvious depth: in the App Router, pages are STATICALLY GENERATED BY DEFAULT unless you use dynamic functions (cookies, headers) or dynamic data fetching. Most of your Next.js app is SSG without you doing anything special — Next.js only makes pages dynamic when it detects they need to be.

---

### 5 Deep Conceptual Questions

**Q1: What is generateStaticParams and how does it enable SSG for dynamic routes?**
> **A:** generateStaticParams tells Next.js which dynamic route values to pre-generate at build time. For app/products/[id]/page.tsx, without generateStaticParams, Next.js cannot know which IDs exist — it has to generate them on-demand (ISR or SSR). With generateStaticParams, you return a list of { id: '1' }, { id: '2' } objects — Next.js pre-renders /products/1, /products/2, etc. at build time. Combined with fetch's built-in caching, the DB/API is queried only during next build, not during user requests.

**Q2: Mental model for static export vs SSG?**
> **A:** SSG (default) produces a Next.js app that still requires a Node.js server — the server handles dynamic routes, API routes, and ISR revalidation at runtime. Static Export (output: 'export' in next.config.js) produces PURE STATIC FILES — no Node.js needed, deploys to any CDN/file host. Static Export loses: API routes, SSR pages, ISR, middleware, image optimisation. Use SSG (default) when you want the benefits of pre-rendered pages WITH the ability to have dynamic routes, API routes, and ISR. Use static export only for purely static sites with no server-side features.

**Q3: Most dangerous misconception about SSG?**
> **A:** SSG pages are always fast to build:
> \`\`\`typescript
> // WRONG: SSG with 10,000 products calls the DB 10,000 times at build time
> export async function generateStaticParams() {
>   const products = await db.getAllProducts();  // returns 10,000 rows
>   return products.map(p => ({ id: String(p.id) }));
>   // Next.js will render ALL 10,000 pages during next build
>   // Build time: 10,000 * 200ms DB query = 33 minutes!
> }
>
> // CORRECT: For large datasets, use ISR (build only popular pages, generate rest on demand)
> export async function generateStaticParams() {
>   const popular = await db.getTopProducts(100);  // only pre-build top 100
>   return popular.map(p => ({ id: String(p.id) }));
> }
> // For other IDs: Next.js generates on first request and caches (ISR)
> \`\`\`

**Q4: How does fetch caching integrate with SSG in the App Router?**
> **A:** In the App Router, fetch() is extended by Next.js. fetch('url', { cache: 'force-cache' }) caches the response indefinitely (SSG behaviour). fetch('url', { next: { revalidate: 3600 } }) caches for 1 hour (ISR behaviour). fetch('url', { cache: 'no-store' }) never caches (SSR behaviour). These options work per-fetch — you can mix SSG data and live data in the same Server Component. Next.js determines the page's rendering mode from the most dynamic fetch: if any fetch uses no-store, the page becomes dynamic.

**Q5: FAANG-grade definition of Next.js SSG.**
> **A:** "Next.js Static Site Generation pre-renders page HTML at build time via next build — with generateStaticParams providing dynamic route parameters for pre-generation, fetch with cache: 'force-cache' for build-time data fetching, output bundled as HTML files deployable to CDNs with sub-50ms TTFB — automatically used for any Server Component or page not using dynamic functions (cookies/headers) or no-store fetches — with the App Router defaulting to static generation and inferring dynamic rendering only when request-time context is accessed — enabling React-based applications to achieve CDN-speed delivery with the developer experience of component-based UI composition."`,

    build: `## BUILD

### 🏗️ Mini Project: Static Blog With generateStaticParams + On-Demand ISR

**What you will build:** A blog with App Router: generateStaticParams pre-generates the 5 most popular posts at build time, ISR handles the rest on-demand, and a revalidate webhook triggers cache invalidation when content changes.
**Why this project:** Forces generateStaticParams, ISR fallback, and on-demand revalidation.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest ssg-blog --typescript --tailwind --app
npm install gray-matter remark remark-html
\`\`\`

#### Step 2 — Content Layer
\`\`\`typescript
// src/lib/posts.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface PostMeta { slug: string; title: string; date: string; views: number; }
export interface Post extends PostMeta { content: string; }

const postsDir = path.join(process.cwd(), 'content/posts');

export function getAllPostSlugs(): string[] {
  return fs.readdirSync(postsDir).filter(f => f.endsWith('.md')).map(f => f.replace('.md', ''));
}

export function getPost(slug: string): Post {
  const content = fs.readFileSync(path.join(postsDir, \`\${slug}.md\`), 'utf-8');
  const { data, content: body } = matter(content);
  return { slug, title: data.title, date: data.date, views: data.views ?? 0, content: body };
}

export function getTopPosts(limit: number): PostMeta[] {
  return getAllPostSlugs()
    .map(slug => getPost(slug))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}
\`\`\`

#### Step 3 — Post Page With generateStaticParams
\`\`\`typescript
// src/app/blog/[slug]/page.tsx
import { getPost, getTopPosts, getAllPostSlugs } from '@/lib/posts';
import { notFound } from 'next/navigation';
import { remark } from 'remark';
import html from 'remark-html';

interface Props { params: { slug: string } }

// Pre-generate at build time for top 5 posts only
export async function generateStaticParams() {
  const topPosts = getTopPosts(5);  // only the 5 most popular
  return topPosts.map(p => ({ slug: p.slug }));
}

// All other slugs: generate on first request, then cache (ISR)
export const dynamicParams = true;  // allow non-pre-generated paths
export const revalidate = 3600;     // revalidate every hour

export default async function BlogPostPage({ params }: Props) {
  const allSlugs = getAllPostSlugs();
  if (!allSlugs.includes(params.slug)) notFound();

  const post = getPost(params.slug);
  const processedContent = await remark().use(html).process(post.content);
  const contentHtml = processedContent.toString();

  return (
    <article className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <time className="text-gray-500 text-sm">{post.date}</time>
      <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </article>
  );
}

export async function generateMetadata({ params }: Props) {
  const post = getPost(params.slug);
  return { title: post.title, openGraph: { title: post.title, type: 'article' } };
}
\`\`\`

#### Step 4 — On-Demand Revalidation Webhook
\`\`\`typescript
// src/app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

const WEBHOOK_SECRET = process.env.REVALIDATION_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Verify webhook secret
  if (body.secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  if (body.slug) {
    revalidatePath(\`/blog/\${body.slug}\`);  // revalidate specific post
  } else {
    revalidatePath('/blog');  // revalidate entire blog
  }

  return NextResponse.json({ revalidated: true, slug: body.slug });
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
// Test generateStaticParams
import { getTopPosts } from '@/lib/posts';
it('getTopPosts returns limited sorted by views', () => {
  const posts = getTopPosts(3);
  expect(posts.length).toBeLessThanOrEqual(3);
  // Views should be descending
  for (let i = 1; i < posts.length; i++) {
    expect(posts[i-1].views).toBeGreaterThanOrEqual(posts[i].views);
  }
});
\`\`\`

**Expected Output:**
\`\`\`
next build:
  Generating static pages...
  /blog/[slug] -> top 5 posts pre-generated
  Other slugs: ISR (generated on first visit)

/blog/popular-post -> served from CDN cache (<50ms)
/blog/new-post -> generated on first request, cached
POST /api/revalidate {secret, slug} -> revalidates cache
\`\`\`

**Stretch Challenges:**
- [ ] Add a sitemap.xml generated from all post slugs
- [ ] Add cache tags and use revalidateTag for granular invalidation
- [ ] Measure build time with 5 vs 100 vs 10,000 pre-generated pages`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is generateStaticParams and when do you need it?
**Q2:** What is the default rendering strategy in Next.js App Router?
**Q3:** Write generateStaticParams for a blog with dynamic [slug] route. From memory.

### Day 3 — Comprehension
**Q4:** Difference between static export and SSG?
**Q5:** A site has 50,000 products — why is full SSG at build time a bad idea?
**Q6:** How does fetch caching integrate with SSG?

### Day 7 — Application
**Q7:** Add on-demand revalidation to a blog that updates via a CMS webhook.
**Q8:** A PR has dynamicParams = false — what happens when a user visits a non-pre-generated slug?
**Q9:** How do cache tags enable granular ISR invalidation?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain generateStaticParams — how does it work and how do you handle routes not in the params list?"
**Q11:** Draw: SSG build pipeline → CDN distribution → user request flow.
**Q12:** ★ System design: "Design the SSG strategy for a large documentation site with 10,000 pages — build time, cache invalidation, and search."`
  },

  // ── 10. incremental-static-regen ──────────────────────────────────────────
  'incremental-static-regen': {
    feynman: `## FEYNMAN CHECK

### Explain ISR Like I'm 10 Years Old
> Incremental Static Regeneration (ISR) is the best of both worlds between SSG and SSR. With SSG, pages are fast but go stale. With SSR, pages are fresh but slow (server processes every request). ISR pre-builds pages like SSG, but when the page is older than your revalidate interval, the NEXT request triggers a background rebuild — the current user still gets the cached (fast) page, and the rebuilt page replaces the cache for future visitors. It's like a restaurant that pre-cooks popular dishes — when the last one is served, they start cooking a fresh batch in the background without making the current customer wait. The non-obvious depth: ISR is stale-while-revalidate — the cached page is ALWAYS served instantly, even while revalidation is happening. The new page only becomes active after the background rebuild completes.

---

### 5 Deep Conceptual Questions

**Q1: What is the stale-while-revalidate model?**
> **A:** Stale-While-Revalidate is a caching strategy: serve the cached response immediately (even if stale), and simultaneously trigger a background refresh. In Next.js ISR: if the page's cache age > revalidate seconds, the first request after expiry gets the stale page BUT triggers a background regeneration. The NEXT visitor (after regeneration completes) gets the fresh page. This means maximum cache TTL before an update requires two requests: one that triggers revalidation (gets stale), one that gets fresh content. The stale page is never shown for more than one extra request cycle.

**Q2: Mental model for App Router revalidation vs Pages Router ISR?**
> **A:** Pages Router uses getStaticProps with revalidate: 60 (seconds). App Router uses fetch with next: { revalidate: 60 } or exports export const revalidate = 60 from the page. Both implement stale-while-revalidate. The App Router addition: on-demand revalidation via revalidatePath('/products/1') or revalidateTag('products') in Server Actions or API routes — invalidating the cache immediately when content changes (CMS webhook, form submission), rather than waiting for the time interval.

**Q3: Most dangerous misconception about ISR?**
> **A:** ISR guarantees the cache is updated exactly at the revalidate interval:
> \`\`\`typescript
> // WRONG: ISR updates at exactly revalidate: 60 seconds
> // CORRECT: ISR uses stale-while-revalidate
> // The cache is updated ONLY when a request arrives AFTER the interval expires
>
> export const revalidate = 60;  // 60 seconds
> // Page last built at: 12:00:00
> // No requests from 12:00:00 to 12:05:00
> // Request at 12:05:30 -> STALE page (built at 12:00:00) is served
> //                     -> Background rebuild triggered
> // Request at 12:05:32 -> NEW page (fresh) is served
>
> // If your site has no traffic for 10 minutes, the page is still 10 minutes old
> // ISR only rebuilds when a request arrives after the interval
> \`\`\`

**Q4: When should you use on-demand revalidation vs time-based ISR?**
> **A:** TIME-BASED ISR (revalidate: N) is best for: content that changes on a schedule (news articles, prices), content where slight staleness is acceptable (blog posts, product descriptions), or when you don't control when content changes. ON-DEMAND revalidation is best for: CMS-driven content (revalidate immediately when editor publishes), user-generated content (revalidate when a review is posted), e-commerce (revalidate when inventory changes). Combined strategy: set a long revalidate as a safety net (1 hour) PLUS on-demand revalidation for immediate updates.

**Q5: FAANG-grade definition of Next.js ISR.**
> **A:** "Next.js Incremental Static Regeneration implements stale-while-revalidate caching — pre-generating static HTML at build time and serving it from CDN cache — triggering background regeneration on the first request after the revalidate interval expires (serving the stale page to the triggering request) and replacing the cache with fresh HTML for subsequent requests — with on-demand revalidation via revalidatePath() and revalidateTag() for immediate cache invalidation triggered by Server Actions or API routes — enabling large-scale sites to maintain CDN-speed performance while serving near-real-time content without per-request server rendering."`,

    build: `## BUILD

### 🏗️ Mini Project: E-Commerce Product Page With ISR + On-Demand Revalidation

**What you will build:** A product detail page with time-based ISR (1 hour) plus a CMS webhook endpoint that triggers on-demand revalidation when a product is updated — the standard e-commerce ISR pattern.
**Why this project:** Forces both ISR strategies: time-based and on-demand.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest isr-demo --typescript --tailwind --app
\`\`\`

#### Step 2 — Product Page With ISR
\`\`\`typescript
// src/app/products/[id]/page.tsx
interface Product { id: string; name: string; price: number; stock: number; description: string; }

// Simulate a CMS/database product fetch
async function fetchProduct(id: string): Promise<Product | null> {
  const res = await fetch(\`https://dummyjson.com/products/\${id}\`, {
    next: { revalidate: 3600, tags: [\`product-\${id}\`, 'products'] },
    // revalidate: 3600 = ISR every hour
    // tags: enables on-demand revalidation by tag
  });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    id: String(data.id), name: data.title, price: data.price,
    stock: data.stock, description: data.description,
  };
}

// Pre-generate top 10 products at build time
export async function generateStaticParams() {
  const res = await fetch('https://dummyjson.com/products?limit=10');
  const { products } = await res.json();
  return products.map((p: any) => ({ id: String(p.id) }));
}

export const dynamicParams = true;  // generate other IDs on demand

interface Props { params: { id: string } }

export default async function ProductPage({ params }: Props) {
  const product = await fetchProduct(params.id);
  if (!product) return <div>Product not found</div>;

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-3xl text-green-600 mt-2">\${product.price}</p>
      <p className="text-gray-500">Stock: {product.stock} units</p>
      <p className="mt-4">{product.description}</p>
      <p className="text-xs text-gray-400 mt-8">
        Page generated: {new Date().toISOString()}
      </p>
    </main>
  );
}

export async function generateMetadata({ params }: Props) {
  const product = await fetchProduct(params.id);
  return { title: product?.name ?? 'Product Not Found' };
}
\`\`\`

#### Step 3 — On-Demand Revalidation Webhook
\`\`\`typescript
// src/app/api/cms-webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('x-webhook-secret');
  if (authHeader !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { event, productId } = body;

  switch (event) {
    case 'product.updated':
    case 'product.published':
      // Invalidate this specific product's cache
      revalidateTag(\`product-\${productId}\`);
      revalidatePath(\`/products/\${productId}\`);
      break;
    case 'products.all_updated':
      // Invalidate all products
      revalidateTag('products');
      break;
  }

  return NextResponse.json({
    revalidated: true,
    event,
    productId,
    timestamp: new Date().toISOString(),
  });
}
\`\`\`

#### Step 4 — Testing ISR Revalidation
\`\`\`bash
# Start the production server
npm run build && npm start

# Test time-based ISR:
# 1. Visit /products/1 -> note the "Page generated" timestamp
# 2. Wait 1+ hour OR manually expire via API
# 3. Visit /products/1 -> same timestamp (stale, triggers background regen)
# 4. Visit /products/1 again -> new timestamp (fresh)

# Test on-demand revalidation:
curl -X POST http://localhost:3000/api/cms-webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: your-secret" \
  -d '{"event": "product.updated", "productId": "1"}'

# Immediately visit /products/1 -> fresh page (no waiting for interval)
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
// Test the webhook endpoint
import { POST } from '@/app/api/cms-webhook/route';

it('rejects invalid webhook secret', async () => {
  const req = new Request('http://localhost/api/cms-webhook', {
    method: 'POST',
    headers: { 'x-webhook-secret': 'wrong-secret', 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'product.updated', productId: '1' }),
  });
  const res = await POST(req as any);
  expect(res.status).toBe(401);
});
\`\`\`

**Expected Output:**
\`\`\`
next build: 10 product pages pre-generated
/products/11 (not pre-generated): ISR on-demand generation on first visit
"Page generated" timestamp updates after revalidation
curl webhook -> immediate cache invalidation -> next visit shows fresh page
Test: 1 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add a cache status header showing if the page was served from cache
- [ ] Implement optimistic ISR that pre-renders new pages during the build
- [ ] Add rate limiting to the webhook endpoint`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is stale-while-revalidate and how does ISR implement it?
**Q2:** Does ISR update the cache exactly at the revalidate interval?
**Q3:** Write fetch() with ISR revalidation and a cache tag. From memory.

### Day 3 — Comprehension
**Q4:** When should you use on-demand revalidation vs time-based ISR?
**Q5:** A user complains content is stale 10 minutes after publishing — diagnose.
**Q6:** What is the difference between revalidatePath and revalidateTag?

### Day 7 — Application
**Q7:** Add a CMS webhook that revalidates specific pages on content publish.
**Q8:** An e-commerce site shows outdated stock counts — implement ISR + on-demand revalidation.
**Q9:** What happens to ISR pages during next build when content changes?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain ISR stale-while-revalidate — exactly what happens on the first request after the interval expires?"
**Q11:** Draw: ISR cache lifecycle — build → cache → expire → revalidation request → fresh cache.
**Q12:** ★ System design: "Design the caching strategy for a news site with 1M articles — ISR intervals, on-demand revalidation, CDN strategy."`
  },

  // ── 11. data-fetching-next ────────────────────────────────────────────────
  'data-fetching-next': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Data Fetching Like I'm 10 Years Old
> Next.js's App Router lets you fetch data DIRECTLY inside your components using async/await — no useEffect, no loading state library, no API layer. Just const data = await fetch('...') at the top of a Server Component. Next.js handles caching, deduplication, and revalidation automatically based on options you pass to fetch(). For client-side data that needs to stay fresh (live updates, polling), use SWR or TanStack Query inside 'use client' components. The non-obvious depth: Next.js EXTENDS the native fetch function with caching options — fetch in a Server Component is NOT the standard browser fetch, it's Next.js's enhanced version that integrates with the page's rendering strategy. Multiple identical fetches in the same render are AUTOMATICALLY DEDUPLICATED — calling getUser(1) in 5 components only hits the server once.

---

### 5 Deep Conceptual Questions

**Q1: What are the four Next.js fetch caching modes?**
> **A:** (1) Default (force-cache): cached indefinitely, page becomes SSG. (2) no-store: never cached, page becomes SSR. (3) revalidate: N: cached for N seconds, then ISR. (4) tags: ['x']: cached and tagged for on-demand invalidation via revalidateTag('x'). These are passed via the second argument: fetch(url, { cache: 'force-cache' }) or fetch(url, { next: { revalidate: 60, tags: ['posts'] } }). Next.js infers the page's rendering strategy from the most dynamic fetch — if any fetch is no-store, the entire page is SSR.

**Q2: Mental model for parallel vs sequential data fetching?**
> **A:** SEQUENTIAL: const user = await getUser(id); const posts = await getPosts(user.id); — second fetch waits for first to complete. Use when the second depends on the first. PARALLEL: const [user, posts] = await Promise.all([getUser(id), getPosts(id)]); — both fetches run simultaneously. Use when fetches are independent. STREAMING: wrap slow components in Suspense — they render independently. Pattern: parent Server Component starts fast queries (PARALLEL), each Suspense child runs its own slow query (STREAMING) — gives instant FCP plus progressive content.

**Q3: Most dangerous misconception about data fetching?**
> **A:** Fetching the same data in multiple components multiplies requests:
> \`\`\`typescript
> // CORRECT: Next.js deduplicates identical fetches in the same render
> // src/lib/data.ts
> import { cache } from 'react';
> export const getUser = cache(async (id: string) => {
>   const res = await fetch(\`https://api.example.com/users/\${id}\`);
>   return res.json();
> });
>
> // Components A, B, and C all call getUser('1') in the same render:
> // -> Only ONE network request happens
> // -> React's cache() memoizes the result for the request lifetime
>
> // For fetch() specifically, Next.js dedupes automatically
> // For non-fetch data sources (DB, ORM), use React's cache() wrapper
> \`\`\`

**Q4: When should you use SWR/TanStack Query vs Server Component data fetching?**
> **A:** Use Server Component fetching when: data is fetched on initial page load, data doesn't need to update in the browser without navigation, you want zero client bundle for data fetching. Use SWR/TanStack Query when: data must stay fresh in the browser (polling, real-time), the user can update data via mutations (cache invalidation), you need optimistic UI updates, the page has many interactive widgets that fetch independently. Hybrid pattern: Server Component fetches initial data, passes it to a 'use client' component that hydrates SWR with the initial data, then handles client-side refetches.

**Q5: FAANG-grade definition of Next.js data fetching.**
> **A:** "Next.js App Router data fetching enables direct async/await in Server Components — with the framework-extended fetch() supporting four caching modes (default cache, no-store for SSR, revalidate for ISR, tags for on-demand invalidation) — automatic request deduplication for identical fetches within the same render — React's cache() function for memoising non-fetch data sources — parallel fetching via Promise.all for independent queries — Suspense boundaries for streaming slow fetches — and client-side libraries (SWR, TanStack Query) for hydrated client state with mutations and polling — eliminating the API layer for initial data while maintaining client-side interactivity."`,

    build: `## BUILD

### 🏗️ Mini Project: Hybrid Data Fetching — Server Initial + Client Refresh + Mutations

**What you will build:** A todos app where Server Component fetches initial todos (instant load), Client Component uses SWR with the initial data, mutations call Server Actions, and the cache invalidates correctly — the production data fetching pattern.
**Why this project:** Forces server fetching, deduplication, SWR hydration, and Server Action mutations together.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest data-demo --typescript --tailwind --app
npm install swr better-sqlite3 @types/better-sqlite3
\`\`\`

#### Step 2 — Server Data Layer With cache()
\`\`\`typescript
// src/lib/todos.ts
import { cache } from 'react';
import Database from 'better-sqlite3';
const db = new Database('todos.db');
db.exec(\`CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, done INTEGER DEFAULT 0)\`);

export interface Todo { id: number; text: string; done: number; }

// React's cache() memoises within the same request — multiple components calling
// getTodos() in the same page render hit the DB only once
export const getTodos = cache(async (): Promise<Todo[]> => {
  console.log('[DB] fetching todos');  // observe deduplication
  return db.prepare('SELECT * FROM todos ORDER BY id DESC').all() as Todo[];
});

export const getTodoCount = cache(async (): Promise<number> => {
  return (db.prepare('SELECT COUNT(*) as c FROM todos').get() as any).c;
});
\`\`\`

#### Step 3 — Server Component Page With Parallel + Streaming
\`\`\`typescript
// src/app/todos/page.tsx
import { Suspense } from 'react';
import { getTodos, getTodoCount } from '@/lib/todos';
import { TodoListClient } from '@/components/TodoListClient';
import { AddTodoForm } from '@/components/AddTodoForm';

async function StatsSection() {
  // Slow stat aggregation — streams independently
  await new Promise(r => setTimeout(r, 800));
  const count = await getTodoCount();
  return <p className="text-sm text-gray-500">Total: {count} todos</p>;
}

export default async function TodosPage() {
  // Parallel: kick off both fetches simultaneously
  const todosPromise = getTodos();
  // Stats is wrapped in Suspense — doesn't block the page

  const todos = await todosPromise;

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">My Todos</h1>
      <Suspense fallback={<p className="text-sm text-gray-300">Loading stats...</p>}>
        <StatsSection />
      </Suspense>
      <AddTodoForm />
      {/* Client hydration: pass server-fetched data as initial value to SWR */}
      <TodoListClient initialTodos={todos} />
    </main>
  );
}
\`\`\`

#### Step 4 — Client Component With SWR Hydration
\`\`\`typescript
// src/components/TodoListClient.tsx
'use client';
import useSWR from 'swr';
import { Todo } from '@/lib/todos';
import { toggleTodoAction, deleteTodoAction } from '@/app/todos/actions';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Props { initialTodos: Todo[]; }

export function TodoListClient({ initialTodos }: Props) {
  // SWR hydrates with server data, refetches client-side as needed
  const { data: todos, mutate } = useSWR<Todo[]>('/api/todos', fetcher, {
    fallbackData: initialTodos,  // server-rendered HTML uses this immediately
    revalidateOnFocus: true,
    refreshInterval: 30_000,  // poll every 30s
  });

  const handleToggle = async (id: number) => {
    // Optimistic update — UI changes instantly
    mutate(
      todos?.map(t => t.id === id ? { ...t, done: t.done ? 0 : 1 } : t),
      { revalidate: false },
    );
    await toggleTodoAction(id);
    mutate();  // refetch to confirm server state
  };

  const handleDelete = async (id: number) => {
    mutate(todos?.filter(t => t.id !== id), { revalidate: false });
    await deleteTodoAction(id);
    mutate();
  };

  return (
    <ul className="space-y-2 mt-4">
      {todos?.map(todo => (
        <li key={todo.id} className="flex items-center gap-2 p-3 border rounded">
          <input type="checkbox" checked={!!todo.done} onChange={() => handleToggle(todo.id)} />
          <span className={todo.done ? 'line-through text-gray-400' : ''}>{todo.text}</span>
          <button onClick={() => handleDelete(todo.id)} className="ml-auto text-red-500">×</button>
        </li>
      ))}
    </ul>
  );
}
\`\`\`

#### Step 5 — Server Actions + API Route
\`\`\`typescript
// src/app/todos/actions.ts
'use server';
import { revalidatePath } from 'next/cache';
import Database from 'better-sqlite3';
const db = new Database('todos.db');

export async function addTodoAction(formData: FormData) {
  const text = formData.get('text') as string;
  if (!text?.trim()) return;
  db.prepare('INSERT INTO todos (text) VALUES (?)').run(text);
  revalidatePath('/todos');
}

export async function toggleTodoAction(id: number) {
  db.prepare('UPDATE todos SET done = 1 - done WHERE id = ?').run(id);
  revalidatePath('/todos');
}

export async function deleteTodoAction(id: number) {
  db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  revalidatePath('/todos');
}

// src/app/api/todos/route.ts -- for SWR client refresh
import { NextResponse } from 'next/server';
import { getTodos } from '@/lib/todos';
export const dynamic = 'force-dynamic';  // always fresh for client polling
export async function GET() { return NextResponse.json(await getTodos()); }
\`\`\`

**Expected Output:**
\`\`\`
/todos -> initial todos rendered instantly (server)
Console logs: "[DB] fetching todos" only ONCE per page render (cache() dedupe)
Add todo -> Server Action runs -> revalidatePath -> UI updates
Toggle checkbox -> optimistic UI updates, then server confirms
Stats section streams in after 800ms (Suspense)
SWR polls /api/todos every 30s for fresh data
\`\`\`

**Stretch Challenges:**
- [ ] Replace SWR with TanStack Query and observe similar patterns
- [ ] Add error boundaries for failed mutations
- [ ] Add a useTransition() pending state for the optimistic mutations`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Four fetch caching modes in Next.js?
**Q2:** What does React's cache() do?
**Q3:** Write a Server Component fetching data with revalidate: 60. From memory.

### Day 3 — Comprehension
**Q4:** Difference between parallel and sequential data fetching — give an example of each.
**Q5:** A junior calls getUser() 5 times in different components — how many DB hits?
**Q6:** When should you use SWR/TanStack Query alongside Server Component fetching?

### Day 7 — Application
**Q7:** Build a hybrid Server + SWR pattern that hydrates client cache from server data.
**Q8:** A PR uses cache: 'no-store' on every fetch — explain the performance cost.
**Q9:** How do Server Actions integrate with SWR cache invalidation?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Compare data fetching in Server Components vs client-side SWR — when do you use each?"
**Q11:** Draw: data flow — Server Component fetch → cache → HTML → hydration → SWR → mutations.
**Q12:** ★ System design: "Design the data layer for a real-time analytics dashboard — initial load, live polling, mutations, optimistic UI."`
  },

  // ── 12. server-actions ────────────────────────────────────────────────────
  'server-actions': {
    feynman: `## FEYNMAN CHECK

### Explain Server Actions Like I'm 10 Years Old
> Server Actions are functions that run ON THE SERVER but you call them DIRECTLY from your client code, as if they were regular JavaScript functions. Mark a function with 'use server' at the top — when the client calls it, Next.js automatically creates an RPC endpoint, sends the arguments to the server, runs the function (with DB access, secrets, etc.), and returns the result. No fetch(), no API route, no JSON.stringify(). You can attach them directly to a form's action attribute — the form submits to the Server Action without any JavaScript needed. The non-obvious depth: Server Actions work even WITHOUT JavaScript loaded — they progressively enhance forms. If JS fails to load, the form still submits as a normal POST and the page re-renders. This is a fundamental shift back to "the web works without JavaScript" while keeping the developer experience of modern React.

---

### 5 Deep Conceptual Questions

**Q1: What problem do Server Actions solve that API routes don't?**
> **A:** Without Server Actions: write an API route → write client fetch() → handle JSON serialization → manage loading state → handle errors → invalidate cache. With Server Actions: write a 'use server' function → call it directly from a component. Server Actions eliminate the boilerplate: no API route file, no client fetch, no JSON handling. They also integrate natively with cache invalidation (revalidatePath, revalidateTag), support progressive enhancement (forms work without JS), and provide type-safe arguments end-to-end (no string-based JSON parsing).

**Q2: Mental model for the form action progressive enhancement?**
> **A:** With server actions: <form action={createPostAction}>. When JS is loaded: the form submission becomes a client-side React update (instant feedback, no page reload). When JS is NOT loaded (slow network, JS disabled, bot): the form POSTs to the server normally — the Server Action runs, the page re-renders server-side, the user sees the updated page. This dual behaviour means: works for everyone, fast UX when JS works, still functional when JS fails — the "no broken forms" guarantee that traditional SPAs cannot provide.

**Q3: Most dangerous misconception about Server Actions?**
> **A:** Server Actions are automatically secure:
> \`\`\`typescript
> // WRONG: trusting client-provided arguments
> 'use server';
> export async function deleteUserAction(userId: string) {
>   // ANY user can call this and pass ANY userId!
>   await db.delete(\`DELETE FROM users WHERE id = ?\`, userId);
> }
>
> // CORRECT: ALWAYS verify auth and authorisation in Server Actions
> 'use server';
> export async function deleteUserAction(userId: string) {
>   const session = await getSession();
>   if (!session) throw new Error('Unauthorised');
>   if (session.userId !== userId && session.role !== 'admin') {
>     throw new Error('Forbidden');
>   }
>   await db.delete(\`DELETE FROM users WHERE id = ?\`, userId);
> }
>
> // Server Actions are PUBLIC API endpoints — treat them like API routes for security
> \`\`\`

**Q4: How do you handle loading and error states with Server Actions?**
> **A:** Use React 19's useFormStatus() inside the form for loading state: const { pending } = useFormStatus(); <button disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>. For form state and validation errors: useFormState(action, initialState) returns [state, formAction]; the action receives previous state as first argument and FormData as second, returns new state. For mutations not in a form: wrap in useTransition() for non-blocking updates with isPending flag. Errors thrown in Server Actions are caught by the nearest error.tsx boundary.

**Q5: FAANG-grade definition of Server Actions.**
> **A:** "Next.js Server Actions are React Server Functions (RFC) — async functions marked with 'use server' directive that execute exclusively on the server but are callable from Client Components as direct function references — implemented as auto-generated POST endpoints with serialised arguments — supporting progressive enhancement via form action attribute (working without JavaScript via standard form submission), useFormState/useFormStatus for React-native pending and error states, automatic cache invalidation via revalidatePath/revalidateTag/revalidateTag, and end-to-end type safety from server to client — eliminating the need for explicit API routes for most mutation operations."`,

    build: `## BUILD

### 🏗️ Mini Project: Form Mutations With Server Actions — Validation, Optimistic UI, Progressive Enhancement

**What you will build:** A comments system with: form-based Server Action for submission, useFormState for validation errors, useFormStatus for pending state, optimistic UI with useOptimistic, and works without JavaScript.
**Why this project:** Forces every Server Action pattern — forms, validation, optimistic, progressive enhancement.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest sa-demo --typescript --tailwind --app
npm install zod better-sqlite3 @types/better-sqlite3
\`\`\`

#### Step 2 — Server Action With Validation
\`\`\`typescript
// src/app/comments/actions.ts
'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import Database from 'better-sqlite3';
import { cookies } from 'next/headers';

const db = new Database('comments.db');
db.exec(\`CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)\`);

const CommentSchema = z.object({
  author: z.string().min(2, 'Name must be at least 2 characters').max(50),
  text: z.string().min(5, 'Comment must be at least 5 characters').max(500),
});

export type ActionState = {
  status: 'idle' | 'success' | 'error';
  errors?: Record<string, string[]>;
  message?: string;
};

export async function addCommentAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Authorisation check — verify user session
  const session = cookies().get('session');
  // For demo we allow anonymous; in production: if (!session) return error

  // Validate input with Zod
  const result = CommentSchema.safeParse({
    author: formData.get('author'),
    text: formData.get('text'),
  });

  if (!result.success) {
    return {
      status: 'error',
      errors: result.error.flatten().fieldErrors,
      message: 'Please fix the validation errors',
    };
  }

  try {
    db.prepare('INSERT INTO comments (author, text) VALUES (?, ?)').run(
      result.data.author, result.data.text,
    );
    revalidatePath('/comments');
    return { status: 'success', message: 'Comment posted!' };
  } catch (err) {
    return { status: 'error', message: 'Failed to save comment' };
  }
}

export async function deleteCommentAction(id: number) {
  db.prepare('DELETE FROM comments WHERE id = ?').run(id);
  revalidatePath('/comments');
}
\`\`\`

#### Step 3 — Comment Form (Client Component)
\`\`\`typescript
// src/components/CommentForm.tsx
'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { addCommentAction, ActionState } from '@/app/comments/actions';

const initialState: ActionState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
    >
      {pending ? 'Posting...' : 'Post Comment'}
    </button>
  );
}

export function CommentForm() {
  const [state, formAction] = useFormState(addCommentAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <input
          name="author"
          placeholder="Your name"
          required
          className="w-full px-3 py-2 border rounded"
        />
        {state.errors?.author && (
          <p className="text-red-500 text-sm mt-1">{state.errors.author[0]}</p>
        )}
      </div>
      <div>
        <textarea
          name="text"
          placeholder="Your comment"
          required
          rows={3}
          className="w-full px-3 py-2 border rounded"
        />
        {state.errors?.text && (
          <p className="text-red-500 text-sm mt-1">{state.errors.text[0]}</p>
        )}
      </div>
      <SubmitButton />
      {state.status === 'success' && <p className="text-green-600">{state.message}</p>}
      {state.status === 'error' && !state.errors && (
        <p className="text-red-600">{state.message}</p>
      )}
    </form>
  );
}
\`\`\`

#### Step 4 — Optimistic UI With useOptimistic
\`\`\`typescript
// src/components/CommentList.tsx
'use client';
import { useOptimistic, useTransition } from 'react';
import { deleteCommentAction } from '@/app/comments/actions';

interface Comment { id: number; author: string; text: string; created_at: string; }

export function CommentList({ initialComments }: { initialComments: Comment[] }) {
  const [optimisticComments, removeOptimistic] = useOptimistic(
    initialComments,
    (state, deletedId: number) => state.filter(c => c.id !== deletedId),
  );
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: number) => {
    startTransition(async () => {
      removeOptimistic(id);  // UI updates instantly
      await deleteCommentAction(id);  // server confirms
    });
  };

  return (
    <ul className="space-y-3 mt-6">
      {optimisticComments.map(c => (
        <li key={c.id} className="p-3 border rounded">
          <div className="flex justify-between items-start">
            <div>
              <strong>{c.author}</strong>
              <p>{c.text}</p>
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              disabled={isPending}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
\`\`\`

#### Step 5 — Page Composition + Tests
\`\`\`typescript
// src/app/comments/page.tsx
import Database from 'better-sqlite3';
import { CommentForm } from '@/components/CommentForm';
import { CommentList } from '@/components/CommentList';

const db = new Database('comments.db');

export default function CommentsPage() {
  const comments = db.prepare('SELECT * FROM comments ORDER BY id DESC').all() as any[];

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Comments</h1>
      <CommentForm />
      <CommentList initialComments={comments} />
    </main>
  );
}

// Tests
import { addCommentAction } from '@/app/comments/actions';
it('rejects too-short comment', async () => {
  const fd = new FormData();
  fd.set('author', 'Ana');
  fd.set('text', 'hi');  // too short
  const result = await addCommentAction({ status: 'idle' }, fd);
  expect(result.status).toBe('error');
  expect(result.errors?.text).toBeDefined();
});
\`\`\`

**Expected Output:**
\`\`\`
Submit form -> Server Action runs -> validation errors shown OR comment added
Disable JS in DevTools -> form still submits as POST, page re-renders with new comment
Delete button -> comment disappears instantly (optimistic), server confirms
Tests: 1 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add rate limiting using cookies/IP tracking
- [ ] Add CSRF protection via a token in the form
- [ ] Replace useFormStatus with custom toast notifications`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does the 'use server' directive do?
**Q2:** Difference between useFormState and useFormStatus?
**Q3:** Write a basic Server Action with form action attribute. From memory.

### Day 3 — Comprehension
**Q4:** Why must Server Actions still validate input even from a trusted-looking form?
**Q5:** A junior writes a Server Action that deletes records without auth check — explain the vulnerability.
**Q6:** How does progressive enhancement work with Server Action forms?

### Day 7 — Application
**Q7:** Build an optimistic delete pattern with useOptimistic and useTransition.
**Q8:** A PR uses Server Actions to call a third-party API — explain when API routes are better.
**Q9:** How do Server Actions integrate with revalidatePath?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain Server Actions — what they are, how they differ from API routes, and progressive enhancement."
**Q11:** Draw: Server Action request flow — client form → RPC → server function → DB → revalidation → UI update.
**Q12:** ★ System design: "Design a mutation system for a SaaS app — when do you use Server Actions, API routes, or external webhooks?"`
  },

  // ── 13. nextjs-caching ────────────────────────────────────────────────────
  'nextjs-caching': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Caching Like I'm 10 Years Old
> Next.js has FOUR independent caching layers that work together: (1) REQUEST MEMOIZATION — within a single render, identical fetches are deduplicated. (2) DATA CACHE — fetch results are persisted between requests (the "ISR cache"). (3) FULL ROUTE CACHE — entire rendered HTML pages are cached at the CDN/server. (4) ROUTER CACHE — client-side cache of visited routes for fast back/forward navigation. Each layer can be controlled independently. The non-obvious depth: these caches DO NOT automatically invalidate when your data changes — you must explicitly call revalidatePath() or revalidateTag() in mutations (Server Actions, webhooks) to bust the relevant cache layers. Forgetting to revalidate is the #1 cause of "why is my page showing stale data?" bugs.

---

### 5 Deep Conceptual Questions

**Q1: What does each of the four cache layers do?**
> **A:** (1) REQUEST MEMOIZATION: in-memory cache for a single rendered page — identical fetch() calls in different components share one result. Lives for one request. (2) DATA CACHE: persistent (across requests) cache of fetch() results based on the cache option. Stored on disk in production. Invalidated by revalidate timeout, revalidatePath, or revalidateTag. (3) FULL ROUTE CACHE: the entire rendered HTML and RSC payload for a route, stored on disk. Built at build time for SSG, regenerated on ISR. Invalidated by revalidatePath. (4) ROUTER CACHE: in browser memory, stores visited route segments for instant back/forward navigation. Invalidated by router.refresh() or Server Actions.

**Q2: Mental model for cache invalidation?**
> **A:** revalidatePath('/products') invalidates the Full Route Cache for /products — the page rebuilds on next request. revalidateTag('products') invalidates ALL Data Cache entries tagged 'products' (works across pages — invalidating one tag busts many pages). router.refresh() invalidates the Router Cache (client side). The combination pattern: a Server Action mutation calls both revalidateTag('products') (for the data) AND revalidatePath('/products') (for the page) to ensure full freshness across all cache layers.

**Q3: Most dangerous misconception about Next.js caching?**
> **A:** Cache settings on individual fetches are isolated:
> \`\`\`typescript
> // WRONG: thinking fetches with different cache options work independently
> async function Page() {
>   const products = await fetch('/api/products', { cache: 'force-cache' });
>   const user = await fetch('/api/user', { cache: 'no-store' });  // forces DYNAMIC rendering!
>   // Adding ONE no-store fetch makes the ENTIRE page dynamic
>   // products fetch is still cached, but the page is no longer SSG
>   return <div>{...}</div>;
> }
>
> // CORRECT: if you want SSG with dynamic user data, put user data in a Client Component
> // OR use unstable_noStore() to opt specific subtrees out of caching
> // OR accept dynamic rendering and add suspense boundaries
> \`\`\`

**Q4: When should you use revalidateTag vs revalidatePath?**
> **A:** Use revalidatePath('/products') when: you know which specific page needs to update, the mutation affects one page predictably. Use revalidateTag('products') when: many pages use the same data (a tag invalidates ALL fetches with that tag across all routes), the data is shared (one product update affects /products, /products/[id], /admin/products, /home), or you're using a CMS where editorial changes affect unpredictable pages. revalidateTag is more powerful but requires tagging fetches upfront with next: { tags: ['products'] }.

**Q5: FAANG-grade definition of Next.js caching.**
> **A:** "Next.js implements four cooperating cache layers — Request Memoization (per-render fetch deduplication via React cache), Data Cache (persistent fetch result cache controlled by cache and revalidate options), Full Route Cache (rendered HTML + RSC payload cached on disk per route), and Router Cache (client-side visited route segments) — with explicit invalidation via revalidatePath (route-level) and revalidateTag (cross-route tag-based) from Server Actions and Route Handlers — automatic invalidation on time-based revalidate intervals — and granular opt-out via unstable_noStore() or fetch cache: 'no-store' — enabling sub-50ms TTFB for cached routes while supporting on-demand freshness for mutations."`,

    build: `## BUILD

### 🏗️ Mini Project: Caching Layer Demo — Tag-Based Invalidation Across Multiple Pages

**What you will build:** A products app with: products list page (SSG with tag), product detail page (ISR with same tag), admin edit form (Server Action that invalidates the tag) — demonstrating how revalidateTag invalidates ALL pages using that data.
**Why this project:** Forces all four cache layers and tag-based cross-route invalidation.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest cache-demo --typescript --tailwind --app
\`\`\`

#### Step 2 — Data Layer With Tagged Fetches
\`\`\`typescript
// src/lib/products-api.ts
import { unstable_cache } from 'next/cache';

interface Product { id: number; name: string; price: number; }

const PRODUCTS_TAG = 'products';

export async function getProducts(): Promise<Product[]> {
  // Fetch with revalidation and tag
  const res = await fetch('https://dummyjson.com/products', {
    next: {
      revalidate: 3600,         // re-fetch from origin after 1 hour
      tags: [PRODUCTS_TAG],     // can be invalidated by revalidateTag('products')
    },
  });
  const data = await res.json();
  return data.products.map((p: any) => ({ id: p.id, name: p.title, price: p.price }));
}

export async function getProduct(id: number): Promise<Product | null> {
  const res = await fetch(\`https://dummyjson.com/products/\${id}\`, {
    next: {
      revalidate: 3600,
      tags: [PRODUCTS_TAG, \`product-\${id}\`],  // multiple tags — invalidate by either
    },
  });
  if (!res.ok) return null;
  const p = await res.json();
  return { id: p.id, name: p.title, price: p.price };
}

// unstable_cache for non-fetch data (DB, ORM)
export const getProductCount = unstable_cache(
  async () => {
    return (await getProducts()).length;
  },
  ['product-count'],         // cache key
  { tags: [PRODUCTS_TAG], revalidate: 3600 },
);
\`\`\`

#### Step 3 — Pages Using Tagged Data
\`\`\`typescript
// src/app/products/page.tsx -- list page
import Link from 'next/link';
import { getProducts, getProductCount } from '@/lib/products-api';

export default async function ProductsPage() {
  const [products, count] = await Promise.all([getProducts(), getProductCount()]);
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Products ({count})</h1>
      <p className="text-xs text-gray-400">Generated: {new Date().toISOString()}</p>
      <ul className="mt-4 space-y-2">
        {products.slice(0, 5).map(p => (
          <li key={p.id}>
            <Link href={\`/products/\${p.id}\`} className="text-blue-600 hover:underline">
              {p.name} — \${p.price}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

// src/app/products/[id]/page.tsx -- detail page (same tag)
import { getProduct } from '@/lib/products-api';
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(Number(params.id));
  if (!product) return <div>Not found</div>;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p>Price: \${product.price}</p>
      <p className="text-xs text-gray-400">Generated: {new Date().toISOString()}</p>
    </main>
  );
}
\`\`\`

#### Step 4 — Mutation Action Invalidates Tag (Bust All Pages)
\`\`\`typescript
// src/app/admin/actions.ts
'use server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function updateProductAction(id: number, name: string, price: number) {
  // Simulate updating an external CMS
  console.log(\`Updating product \${id} to \${name}, \${price}\`);

  // Invalidate ALL pages and queries tagged 'products'
  revalidateTag('products');
  // Or specifically: revalidateTag(\`product-\${id}\`); for only the detail page

  return { success: true };
}

export async function invalidateAllProductCaches() {
  revalidateTag('products');
  revalidatePath('/products');
}
\`\`\`

#### Step 5 — Admin Form + Tests
\`\`\`typescript
// src/app/admin/page.tsx
import { updateProductAction } from './actions';
import { Suspense } from 'react';

export default function AdminPage() {
  async function handleUpdate(formData: FormData) {
    'use server';
    const id = Number(formData.get('id'));
    const name = formData.get('name') as string;
    const price = Number(formData.get('price'));
    await updateProductAction(id, name, price);
    // After this returns, BOTH /products AND /products/[id] pages will regenerate
    // on their next visit — single tag invalidates all dependent caches
  }

  return (
    <form action={handleUpdate} className="p-8 space-y-3 max-w-md">
      <h1 className="text-2xl font-bold">Update Product</h1>
      <input name="id" type="number" placeholder="Product ID" required className="border p-2 w-full" />
      <input name="name" placeholder="New name" required className="border p-2 w-full" />
      <input name="price" type="number" step="0.01" required className="border p-2 w-full" />
      <button className="px-4 py-2 bg-blue-500 text-white rounded">Update (invalidates all)</button>
    </form>
  );
}

// Cache invalidation test
import { updateProductAction } from '@/app/admin/actions';
it('returns success', async () => {
  const result = await updateProductAction(1, 'New Name', 99.99);
  expect(result.success).toBe(true);
});
\`\`\`

**Expected Output:**
\`\`\`
/products -> generated, served from cache for 1 hour
/products/1 -> generated, served from cache for 1 hour
POST /admin -> updateProductAction -> revalidateTag('products')
Next visit /products -> regenerates (new timestamp)
Next visit /products/1 -> regenerates (new timestamp)
ALL pages using that tag busted with ONE call
\`\`\`

**Stretch Challenges:**
- [ ] Add a /api/revalidate webhook for external CMS to invalidate tags
- [ ] Add cache headers and inspect them in Network tab
- [ ] Measure performance: fetch with vs without caching using Lighthouse`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Four Next.js cache layers and their purpose?
**Q2:** Difference between revalidatePath and revalidateTag?
**Q3:** Write fetch() with cache tag. From memory.

### Day 3 — Comprehension
**Q4:** How does one no-store fetch affect the entire page's caching?
**Q5:** A junior calls fetch() in a loop in a Server Component — does it dedupe?
**Q6:** What is unstable_cache and when do you use it instead of fetch caching?

### Day 7 — Application
**Q7:** Implement tag-based cache invalidation when a CMS publishes content.
**Q8:** A PR forgets revalidateTag after updating a DB record — describe the symptom.
**Q9:** How does the Router Cache affect client-side navigation?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain all four Next.js cache layers and how they cooperate."
**Q11:** Draw: cache layer diagram — Request → Data → Full Route → Router cache flow.
**Q12:** ★ System design: "Design caching for a multi-tenant SaaS dashboard — per-tenant invalidation, shared data, mutation hooks."`
  },

  // ── 14. api-routes-next ───────────────────────────────────────────────────
  'api-routes-next': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js API Routes (Route Handlers) Like I'm 10 Years Old
> Route Handlers are Next.js's way to build REST API endpoints inside your Next.js app — no separate Express/Fastify server needed. Create a file app/api/users/route.ts that exports GET, POST, PUT, DELETE, PATCH functions. Each function receives a Request object and returns a Response object. Next.js handles routing automatically based on the file path. The non-obvious depth: Route Handlers run in either Node.js runtime (default — full Node.js APIs available, slower cold start) or Edge runtime (faster cold start, runs at CDN edge, limited APIs — no Node.js filesystem). Choose runtime per route via export const runtime = 'edge'.

---

### 5 Deep Conceptual Questions

**Q1: When should you use Route Handlers vs Server Actions?**
> **A:** Route Handlers for: external API consumption (mobile apps, third-party integrations call your endpoints), webhooks from external services (Stripe, GitHub, CMS), public APIs with versioning, file uploads/downloads with streaming, OAuth callbacks, SSE/streaming responses. Server Actions for: internal mutations from your own UI, form submissions, optimistic UI updates, anything that's tightly coupled to specific Next.js pages. Rule: if a non-Next.js client needs to call it, use Route Handler; if only your Next.js UI calls it, prefer Server Action.

**Q2: Mental model for NextRequest and NextResponse?**
> **A:** Route Handlers receive a NextRequest (extends standard Request) which adds: nextUrl (parsed URL with query params), cookies (typed cookie API), geo (Vercel-detected location), ip. They return NextResponse (extends Response) which adds: cookies.set/delete for setting response cookies, NextResponse.json() for JSON responses, NextResponse.redirect(), NextResponse.rewrite(). Using standard Request/Response also works but loses the Next.js-specific conveniences.

**Q3: Most dangerous misconception about Route Handlers?**
> **A:** Route Handlers automatically cache GET responses:
> \`\`\`typescript
> // WRONG: assuming GET handlers are cached
> // src/app/api/products/route.ts
> export async function GET() {
>   const products = await db.getAll();
>   return NextResponse.json(products);
> }
> // This is NOT cached by default since Next.js 15
> // Each request runs the handler -- expensive for high-traffic endpoints
>
> // CORRECT: explicitly opt in to caching for cacheable GETs
> export const dynamic = 'force-static';     // cache indefinitely
> export const revalidate = 60;              // cache for 60 seconds
>
> // Or for SSR-like behaviour (no cache):
> export const dynamic = 'force-dynamic';
> \`\`\`

**Q4: How do you stream responses from a Route Handler?**
> **A:** Use ReadableStream to send chunked responses for AI completions, file downloads, SSE: const stream = new ReadableStream({ async start(controller) { for (const chunk of generateChunks()) { controller.enqueue(new TextEncoder().encode(chunk)); } controller.close(); } }); return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });. The browser receives chunks as they arrive — perfect for OpenAI/Anthropic streaming responses, large file downloads, and real-time logs.

**Q5: FAANG-grade definition of Next.js Route Handlers.**
> **A:** "Next.js Route Handlers are file-system-based API endpoints in app/[...]/route.ts exporting HTTP method functions (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS) — receiving NextRequest with nextUrl parsing, cookies, and geolocation utilities — returning NextResponse with typed JSON, cookie management, redirects, and rewrites — running in Node.js or Edge Runtime (selectable per route via export const runtime) — supporting streaming responses via ReadableStream for AI/SSE patterns, dynamic vs static rendering via export const dynamic — and integrating with middleware for auth, rate limiting, and CORS — providing the external API surface complementing Server Actions for internal mutations."`,

    build: `## BUILD

### 🏗️ Mini Project: Full REST API With Auth, Validation, Streaming, and Webhooks

**What you will build:** A complete REST API: GET /api/products (cached), POST /api/products (auth + validation), PATCH /api/products/[id], DELETE /api/products/[id], GET /api/stream (SSE for live updates), POST /api/webhook/stripe (verified webhook).
**Why this project:** Forces every Route Handler pattern in one realistic API.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest api-demo --typescript --tailwind --app
npm install zod better-sqlite3 @types/better-sqlite3
\`\`\`

#### Step 2 — Products CRUD API
\`\`\`typescript
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Database from 'better-sqlite3';

const db = new Database('products.db');
db.exec(\`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price REAL, category TEXT)\`);

const ProductSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  category: z.enum(['books', 'electronics', 'tools']),
});

// Cache for 60 seconds — re-runs only after expiry
export const revalidate = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category');
  const limit = Number(searchParams.get('limit') ?? '50');

  let query = 'SELECT * FROM products';
  const params: any[] = [];
  if (category) { query += ' WHERE category = ?'; params.push(category); }
  query += ' LIMIT ?'; params.push(limit);

  const products = db.prepare(query).all(...params);
  return NextResponse.json({ products, count: products.length });
}

export async function POST(request: NextRequest) {
  // Auth check via cookie or Authorization header
  const auth = request.headers.get('authorization');
  if (auth !== 'Bearer SECRET_API_KEY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const result = ProductSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Validation failed', issues: result.error.issues }, { status: 400 });
  }

  const { name, price, category } = result.data;
  const insertResult = db.prepare('INSERT INTO products (name, price, category) VALUES (?, ?, ?)')
    .run(name, price, category);

  return NextResponse.json(
    { id: insertResult.lastInsertRowid, name, price, category },
    { status: 201, headers: { Location: \`/api/products/\${insertResult.lastInsertRowid}\` } },
  );
}
\`\`\`

#### Step 3 — Dynamic Route Handler [id]
\`\`\`typescript
// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
const db = new Database('products.db');

interface Params { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(params.id);
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const body = await request.json();
  const updates = Object.entries(body).filter(([k]) => ['name', 'price', 'category'].includes(k));
  if (updates.length === 0) return NextResponse.json({ error: 'No valid fields' }, { status: 400 });

  const setClause = updates.map(([k]) => \`\${k} = ?\`).join(', ');
  const values = updates.map(([, v]) => v);
  db.prepare(\`UPDATE products SET \${setClause} WHERE id = ?\`).run(...values, params.id);

  return NextResponse.json({ updated: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(params.id);
  if (result.changes === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
\`\`\`

#### Step 4 — Streaming Response (SSE)
\`\`\`typescript
// src/app/api/stream/route.ts
export const dynamic = 'force-dynamic';  // never cache streaming

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 1; i <= 5; i++) {
        const message = \`data: {"count": \${i}, "time": "\${new Date().toISOString()}"}\\n\\n\`;
        controller.enqueue(encoder.encode(message));
        await new Promise(r => setTimeout(r, 1000));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
\`\`\`

#### Step 5 — Webhook With Signature Verification + Tests
\`\`\`typescript
// src/app/api/webhook/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const rawBody = await request.text();  // MUST use raw body for signature verification

  // Verify HMAC signature (simplified — real Stripe SDK does the full verification)
  const expected = crypto.createHmac('sha256', STRIPE_WEBHOOK_SECRET).update(rawBody).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  // Process the event...
  console.log('Stripe event:', event.type);

  return NextResponse.json({ received: true });
}

// Tests
describe('POST /api/products', () => {
  it('rejects without auth', async () => {
    const res = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify({ name: 'A', price: 10, category: 'books' }),
    });
    expect(res.status).toBe(401);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
GET /api/products?category=books&limit=10 -> JSON list, cached 60s
POST /api/products (with auth) -> 201 with new product
PATCH /api/products/1 -> updates fields
DELETE /api/products/1 -> 204 No Content
GET /api/stream -> SSE stream with 5 events (1 per second)
POST /api/webhook/stripe -> verifies signature, processes event
\`\`\`

**Stretch Challenges:**
- [ ] Add rate limiting via IP tracking in a KV store
- [ ] Add OpenAPI/Swagger spec generation
- [ ] Add CORS handling for cross-origin requests`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** When should you use Route Handlers vs Server Actions?
**Q2:** Difference between NextRequest and standard Request?
**Q3:** Write a basic POST handler with JSON validation. From memory.

### Day 3 — Comprehension
**Q4:** Are GET Route Handlers cached by default in Next.js 15?
**Q5:** A junior parses body with request.json() then verifies signature — explain the bug.
**Q6:** How do you handle dynamic route params like [id] in a Route Handler?

### Day 7 — Application
**Q7:** Build a streaming SSE endpoint for real-time notifications.
**Q8:** A PR's webhook endpoint doesn't verify signatures — diagnose security risk.
**Q9:** When would you choose Edge runtime over Node.js runtime?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Compare Server Actions, Route Handlers, and external API in Next.js — when to use each?"
**Q11:** Draw: Route Handler request flow with middleware → handler → response.
**Q12:** ★ System design: "Design the API layer for a mobile app + web Next.js app sharing the same backend — auth, versioning, rate limiting."`
  },

  // ── 15. middleware-next ───────────────────────────────────────────────────
  'middleware-next': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Middleware Like I'm 10 Years Old
> Middleware runs BEFORE every request reaches your Next.js page or API route — it's the GATEKEEPER. Use it for auth (redirect unauthenticated users to /login), A/B testing (route 50% of users to a new version), localization (detect language and rewrite URLs), bot protection (block suspicious user agents), or geo-routing (serve different content per country). Create middleware.ts at the project root, export a default function that receives the request and returns NextResponse.next() (continue), NextResponse.redirect(url), or NextResponse.rewrite(url). The non-obvious depth: middleware runs on the EDGE RUNTIME by default — closer to users globally, faster cold start, but limited to a subset of Node.js APIs (no fs, no native modules, no Node.js crypto — must use Web Crypto API).

---

### 5 Deep Conceptual Questions

**Q1: What is the difference between redirect, rewrite, and next() in middleware?**
> **A:** NextResponse.next() lets the request continue to its original destination (the page/API route). NextResponse.redirect(url) sends a 307 redirect to the browser — the URL bar changes, browser makes a new request. NextResponse.rewrite(url) RENDERS a different page while KEEPING the original URL — the browser sees /old-url but Next.js serves /new-url's content. Use rewrite for A/B testing, localization (URL stays /products, content comes from /en/products), and feature flags. Use redirect for canonical URL changes, auth redirects, and external links.

**Q2: Mental model for middleware matchers?**
> **A:** export const config = { matcher: ['/admin/:path*', '/api/:path*'] } limits middleware to specific routes — middleware runs ONLY on /admin/* and /api/* paths, not on every request. Matchers are crucial for performance: without matchers, middleware runs on EVERY request including static assets (images, fonts, _next/static) — adding latency to every single request. With matchers, middleware runs only where needed. Negative matchers (regex with negative lookahead) exclude specific patterns: '/((?!api|_next/static|favicon.ico).*)' runs on everything EXCEPT those paths.

**Q3: Most dangerous misconception about middleware?**
> **A:** Middleware can access the response body:
> \`\`\`typescript
> // WRONG: middleware runs BEFORE the response is generated
> export function middleware(request: NextRequest) {
>   const response = NextResponse.next();
>   const body = await response.text();  // body is empty -- response hasn't been generated yet
>   if (body.includes('sensitive')) return new Response('Blocked');
> }
>
> // CORRECT: middleware can only modify the REQUEST going in
> //          and RESPONSE HEADERS coming out (set/delete headers, cookies)
> //          NOT the response body content
> export function middleware(request: NextRequest) {
>   const response = NextResponse.next();
>   response.headers.set('X-Custom-Header', 'value');  // OK
>   response.cookies.set('analytics', 'tracking-id');  // OK
>   return response;
> }
> \`\`\`

**Q4: How do you implement authentication in middleware?**
> **A:** Read the session cookie or Authorization header, verify it (JWT signature, session store lookup), and decide: continue (NextResponse.next()), redirect to login (NextResponse.redirect('/login')), or pass user info to the page (set headers or cookies). Pattern: const token = request.cookies.get('session')?.value; if (!token) return NextResponse.redirect(new URL('/login', request.url)); const payload = await verifyJWT(token); response.headers.set('x-user-id', payload.sub); return response;. The server component can then read the header from headers().

**Q5: FAANG-grade definition of Next.js middleware.**
> **A:** "Next.js middleware is request-level code executed before page rendering or API handler invocation — running on the Edge Runtime (V8 isolates, ~1ms cold start, globally distributed) with restricted Web Standards-only APIs — defined in a single middleware.ts at the project root with a default export receiving NextRequest — capable of NextResponse.next() (continue), NextResponse.redirect() (browser redirect), NextResponse.rewrite() (URL-preserving content swap), and response header/cookie modification — scoped via config.matcher patterns to prevent execution on static assets — and used for auth, i18n, A/B testing, geolocation routing, and bot protection — but cannot modify response body content (runs before response generation)."`,

    build: `## BUILD

### 🏗️ Mini Project: Production Middleware — Auth + I18n + A/B Test + Bot Block

**What you will build:** A single middleware.ts handling four concerns in order: bot blocking, locale detection and URL rewrite, A/B test assignment via cookie, and JWT auth check with redirect — the standard production middleware composition.
**Why this project:** Forces all middleware patterns in one realistic file.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest middleware-demo --typescript --tailwind --app
npm install jose  # Edge-compatible JWT library
mkdir -p src/app/en src/app/es src/app/dashboard
\`\`\`

#### Step 2 — Middleware
\`\`\`typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret');
const SUPPORTED_LOCALES = ['en', 'es', 'fr'] as const;
const DEFAULT_LOCALE = 'en';

// Matcher: skip middleware on static assets and _next internals
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─────────── 1. BOT PROTECTION ───────────
  const userAgent = request.headers.get('user-agent') ?? '';
  const blockedBots = [/badbot/i, /scraper/i, /spam/i];
  if (blockedBots.some(re => re.test(userAgent))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // ─────────── 2. I18N URL REWRITE ───────────
  // /products -> /en/products (rewrite, URL stays as /products)
  const hasLocale = SUPPORTED_LOCALES.some(
    loc => pathname === \`/\${loc}\` || pathname.startsWith(\`/\${loc}/\`),
  );

  if (!hasLocale) {
    // Detect locale from Accept-Language header
    const acceptLang = request.headers.get('accept-language') ?? '';
    const preferred = acceptLang.split(',')
      .map(l => l.split(';')[0].split('-')[0])
      .find(lang => SUPPORTED_LOCALES.includes(lang as any)) ?? DEFAULT_LOCALE;

    const url = request.nextUrl.clone();
    url.pathname = \`/\${preferred}\${pathname}\`;
    return NextResponse.rewrite(url);
  }

  // ─────────── 3. A/B TEST ASSIGNMENT ───────────
  const response = NextResponse.next();
  let variant = request.cookies.get('ab-variant')?.value;
  if (!variant) {
    variant = Math.random() < 0.5 ? 'A' : 'B';
    response.cookies.set('ab-variant', variant, {
      maxAge: 60 * 60 * 24 * 30,  // 30 days
      httpOnly: true,
    });
  }
  response.headers.set('x-ab-variant', variant);

  // ─────────── 4. AUTH CHECK ───────────
  const protectedRoute = pathname.includes('/dashboard') || pathname.includes('/admin');
  if (protectedRoute) {
    const token = request.cookies.get('session')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      // Pass user info to Server Components via headers
      response.headers.set('x-user-id', String(payload.sub));
      response.headers.set('x-user-role', String(payload.role));

      // Admin-only check
      if (pathname.includes('/admin') && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/403', request.url));
      }
    } catch {
      // Invalid/expired token
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('reason', 'session-expired');
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}
\`\`\`

#### Step 3 — Locale Pages
\`\`\`typescript
// src/app/[locale]/page.tsx
export default function Home({ params }: { params: { locale: string } }) {
  const greetings: Record<string, string> = { en: 'Hello', es: 'Hola', fr: 'Bonjour' };
  return <h1 className="p-8 text-3xl">{greetings[params.locale]} World!</h1>;
}

// src/app/[locale]/dashboard/page.tsx
import { headers } from 'next/headers';

export default function Dashboard() {
  const userId = headers().get('x-user-id');
  const role = headers().get('x-user-role');
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>User: {userId} ({role})</p>
    </div>
  );
}
\`\`\`

#### Step 4 — A/B Variant Reader
\`\`\`typescript
// src/components/ABTest.tsx
import { headers, cookies } from 'next/headers';

export function ABTest({ A, B }: { A: React.ReactNode; B: React.ReactNode }) {
  const variant = headers().get('x-ab-variant') ?? cookies().get('ab-variant')?.value;
  return <>{variant === 'B' ? B : A}</>;
}

// Usage: <ABTest A={<OldButton />} B={<NewButton />} />
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
// Test the middleware logic
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

it('blocks known bot user agents', async () => {
  const req = new NextRequest('http://localhost:3000/', {
    headers: { 'user-agent': 'badbot/1.0' },
  });
  const res = await middleware(req);
  expect(res?.status).toBe(403);
});

it('rewrites to default locale when none detected', async () => {
  const req = new NextRequest('http://localhost:3000/products', {
    headers: { 'accept-language': 'es' },
  });
  const res = await middleware(req);
  expect(res?.headers.get('x-middleware-rewrite')).toContain('/es/products');
});
\`\`\`

**Expected Output:**
\`\`\`
GET / -> rewritten to /en (based on Accept-Language)
GET / with es header -> rewritten to /es
GET / from badbot user-agent -> 403
GET /dashboard without session -> redirect to /login?returnTo=/dashboard
GET /admin with role=user -> redirect to /403
Cookie ab-variant set to A or B (50/50 split)
Tests: 2 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add rate limiting via @upstash/ratelimit (Edge-compatible)
- [ ] Add a CSP header builder with nonces per request
- [ ] Add geo-routing using request.geo (Vercel-specific)`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Three middleware response types and their use cases?
**Q2:** What is the difference between rewrite and redirect?
**Q3:** Write a middleware matcher excluding /api and _next. From memory.

### Day 3 — Comprehension
**Q4:** Why does middleware run on Edge Runtime by default?
**Q5:** A PR uses Node.js crypto in middleware — explain the error.
**Q6:** Can middleware modify the response body?

### Day 7 — Application
**Q7:** Build an auth middleware that supports both JWT cookies and Authorization headers.
**Q8:** A PR doesn't set a matcher and middleware runs on every static asset — diagnose the perf issue.
**Q9:** How do you pass middleware-derived data (like user ID) to Server Components?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain Next.js middleware — runtime, capabilities, limitations, and a real-world auth implementation."
**Q11:** Draw: middleware execution order in the request lifecycle — request → middleware chain → handler → response.
**Q12:** ★ System design: "Design middleware for a multi-tenant SaaS — auth, tenant isolation, rate limiting, A/B testing, i18n."`
  },

  // ── 16. nextjs-auth ───────────────────────────────────────────────────────
  'nextjs-auth': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Authentication Like I'm 10 Years Old
> Next.js authentication works by storing a SESSION TOKEN in an HTTP-only cookie that the browser automatically sends with every request. When the user logs in, your server verifies their password, creates a signed JWT (or session ID), and sets it as an httpOnly cookie. On subsequent requests, middleware or Server Components read this cookie, verify it, and either allow the request or redirect to /login. The non-obvious depth: never store auth tokens in localStorage — XSS attacks can read localStorage but CANNOT read httpOnly cookies. Also: ALWAYS verify auth on the SERVER (in middleware or Server Components), never trust client-side checks alone — a malicious user can disable JS or modify client code, but cannot bypass server-side checks. NextAuth.js (now Auth.js v5) is the standard library — handles OAuth providers, sessions, JWT, and CSRF for you.

---

### 5 Deep Conceptual Questions

**Q1: What is the difference between JWT and session-based auth in Next.js?**
> **A:** JWT (JSON Web Token): self-contained signed token with user claims (id, role, expiry) — verify by checking signature, no DB lookup needed (stateless, scalable). Drawback: can't revoke before expiry (logged-out users can keep using their token until it expires). SESSION: opaque session ID stored in DB/Redis with user data lookup on each request (stateful) — instant revocation possible (delete the session row), but adds DB roundtrip per request. Hybrid pattern: JWT with short expiry (15 min) + refresh token in DB (revocable) — best of both.

**Q2: Mental model for the auth flow in App Router?**
> **A:** (1) User submits login form → Server Action verifies credentials → creates JWT → sets httpOnly cookie. (2) User navigates to /dashboard → middleware reads session cookie → verifies JWT → either passes through (set x-user-id header) or redirects to /login. (3) Server Component reads x-user-id from headers() OR re-verifies the cookie directly via cookies(). (4) Logout: Server Action clears the cookie, optionally invalidates the refresh token in DB. The whole flow stays server-side — no client-side token management needed.

**Q3: Most dangerous misconception about Next.js auth?**
> **A:** Client-side route guards are sufficient:
> \`\`\`typescript
> // WRONG: useEffect-based client auth — easy to bypass
> 'use client';
> export function ProtectedPage() {
>   const [user, setUser] = useState(null);
>   useEffect(() => {
>     fetch('/api/me').then(r => r.json()).then(setUser);
>   }, []);
>   if (!user) return <p>Loading...</p>;
>   return <div>Secret content</div>;  // BUT: secret content is in client bundle!
> }
> // Attacker disables JS → sees blank page (no Loading message blocks them)
> // Attacker views React DevTools → sees secret content rendered briefly
> // Attacker downloads bundle → reads secret data from JS source
>
> // CORRECT: Server Component check + middleware redirect
> import { redirect } from 'next/navigation';
> import { getSession } from '@/lib/auth';
> export default async function ProtectedPage() {
>   const session = await getSession();
>   if (!session) redirect('/login');  // server-side, before HTML sent
>   const secret = await fetchSecret(session.userId);
>   return <div>{secret}</div>;
> }
> \`\`\`

**Q4: How does CSRF protection work with Server Actions?**
> **A:** Server Actions are automatically CSRF-protected because: (1) They use POST to a unique action ID URL (attacker can't guess). (2) They require the action ID which is embedded in YOUR HTML — cross-origin attacker can't access your HTML to extract it. (3) The Origin/Referer headers are checked by Next.js. Additional protection: SameSite=Strict cookies prevent the browser from sending session cookies on cross-origin requests entirely. For external API routes (used by mobile clients), use Authorization Bearer tokens instead of cookies — Bearer tokens require explicit attacker action to obtain, unlike cookies which the browser sends automatically.

**Q5: FAANG-grade definition of Next.js authentication patterns.**
> **A:** "Next.js authentication uses server-side session verification — JWTs (stateless, scalable) or session IDs (stateful, revocable) stored in httpOnly+secure+SameSite cookies — verified in middleware for route protection (redirect to /login) and in Server Components for data authorisation (preventing leakage in HTML) — combined with Auth.js (NextAuth) for OAuth provider integration, JWT signing/verification, CSRF protection, and database adapter abstraction — Server Actions providing automatic CSRF protection via action ID obfuscation — with refresh token rotation for long-lived sessions, role-based access control via JWT claims, and middleware-based tenant isolation for multi-tenant SaaS — and never relying on client-side route guards which are bypassable."`,

    build: `## BUILD

### 🏗️ Mini Project: Full Auth System — Login, Session, RBAC, Logout (No External Library)

**What you will build:** A complete auth system from scratch: registration with bcrypt, login Server Action, JWT session cookie, middleware route protection, role-based UI, and logout — no Auth.js, all manual to understand internals.
**Why this project:** Forces every auth concept — hashing, JWT, cookies, middleware, RBAC.
**Time estimate:** 50 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest auth-demo --typescript --tailwind --app
npm install bcryptjs jose better-sqlite3 @types/bcryptjs @types/better-sqlite3
\`\`\`

#### Step 2 — Auth Utilities
\`\`\`typescript
// src/lib/auth.ts
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'change-in-production');
const COOKIE_NAME = 'session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;  // 7 days

const db = new Database('auth.db');
db.exec(\`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)\`);

export interface SessionPayload { userId: number; email: string; role: 'user' | 'admin'; }

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);  // 12 rounds — safe for 2025
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;  // expired or invalid signature
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  cookies().delete(COOKIE_NAME);
}

export function findUserByEmail(email: string) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
}

export function createUser(email: string, passwordHash: string, role: 'user' | 'admin' = 'user') {
  return db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
    .run(email, passwordHash, role);
}
\`\`\`

#### Step 3 — Login & Register Server Actions
\`\`\`typescript
// src/app/(auth)/actions.ts
'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  hashPassword, verifyPassword, createSession, setSessionCookie,
  clearSession, findUserByEmail, createUser,
} from '@/lib/auth';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const RegisterSchema = LoginSchema.extend({
  name: z.string().min(2),
});

export async function loginAction(prevState: any, formData: FormData) {
  const result = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!result.success) return { error: 'Invalid email or password format' };

  const user = findUserByEmail(result.data.email);
  if (!user) return { error: 'Invalid credentials' };  // don't reveal which field is wrong

  const valid = await verifyPassword(result.data.password, user.password_hash);
  if (!valid) return { error: 'Invalid credentials' };

  const token = await createSession({ userId: user.id, email: user.email, role: user.role });
  await setSessionCookie(token);
  redirect('/dashboard');
}

export async function registerAction(prevState: any, formData: FormData) {
  const result = RegisterSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    name: formData.get('name'),
  });

  if (!result.success) return { error: 'Invalid input' };

  if (findUserByEmail(result.data.email)) {
    return { error: 'Email already registered' };
  }

  const hash = await hashPassword(result.data.password);
  const created = createUser(result.data.email, hash);

  const token = await createSession({
    userId: Number(created.lastInsertRowid),
    email: result.data.email,
    role: 'user',
  });
  await setSessionCookie(token);
  redirect('/dashboard');
}

export async function logoutAction() {
  await clearSession();
  redirect('/login');
}
\`\`\`

#### Step 4 — Middleware Protection + Protected Pages
\`\`\`typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

const PROTECTED_ROUTES = ['/dashboard', '/admin', '/profile'];
const ADMIN_ROUTES = ['/admin'];

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  if (!needsAuth) return NextResponse.next();

  const token = request.cookies.get('session')?.value;
  if (!token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(url);
  }

  const session = await verifySession(token);
  if (!session) {
    const response = NextResponse.redirect(new URL('/login?expired=1', request.url));
    response.cookies.delete('session');
    return response;
  }

  // RBAC: admin routes
  if (ADMIN_ROUTES.some(r => pathname.startsWith(r)) && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/403', request.url));
  }

  return NextResponse.next();
}

// src/app/dashboard/page.tsx
import { getSession } from '@/lib/auth';
import { logoutAction } from '@/app/(auth)/actions';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');  // belt-and-suspenders: middleware + page check

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {session.email}!</p>
      <p>Role: {session.role}</p>
      <form action={logoutAction}>
        <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Logout</button>
      </form>
    </main>
  );
}
\`\`\`

#### Step 5 — Tests
\`\`\`typescript
import { hashPassword, verifyPassword, createSession, verifySession } from '@/lib/auth';

describe('Auth', () => {
  it('hashes and verifies password', async () => {
    const hash = await hashPassword('secret123');
    expect(await verifyPassword('secret123', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });

  it('creates and verifies JWT session', async () => {
    const token = await createSession({ userId: 1, email: 'a@b.com', role: 'user' });
    const session = await verifySession(token);
    expect(session?.userId).toBe(1);
    expect(session?.email).toBe('a@b.com');
  });

  it('rejects invalid token', async () => {
    const result = await verifySession('invalid.token.here');
    expect(result).toBeNull();
  });
});
\`\`\`

**Expected Output:**
\`\`\`
POST register -> creates user, sets cookie, redirects /dashboard
POST login -> verifies password, sets cookie, redirects /dashboard
GET /dashboard (no cookie) -> redirected to /login?returnTo=/dashboard
GET /dashboard (with cookie) -> "Welcome a@b.com"
GET /admin (with role=user) -> redirected to /403
POST logout -> clears cookie, redirects /login
Tests: 3 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add OAuth (GitHub) via @auth/core
- [ ] Add refresh token rotation with 15-min access tokens
- [ ] Add rate limiting on /login (5 attempts per IP per minute)`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Why must auth tokens never be in localStorage?
**Q2:** Difference between JWT and session-based auth?
**Q3:** Write a Server Action that creates a session cookie. From memory.

### Day 3 — Comprehension
**Q4:** Why are Server Actions automatically CSRF-protected?
**Q5:** A junior protects routes only client-side — explain the vulnerability.
**Q6:** What cookie attributes prevent XSS and CSRF?

### Day 7 — Application
**Q7:** Build a refresh token rotation system with short-lived JWTs.
**Q8:** A PR uses session.role from a JWT without re-verifying — explain stale-data risk.
**Q9:** When should you use Auth.js vs build auth yourself?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through implementing authentication in Next.js — what runs where, security considerations."
**Q11:** Draw: auth lifecycle — register → hash → store → login → JWT → cookie → middleware verify → page access.
**Q12:** ★ System design: "Design auth for a multi-tenant SaaS — SSO, per-tenant roles, API tokens for service accounts, session management at scale."`
  },

  // ── 17. nextjs-database ───────────────────────────────────────────────────
  'nextjs-database': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Database Integration Like I'm 10 Years Old
> In Next.js you connect to a database from your Server Components, Server Actions, and Route Handlers — DIRECTLY, no separate API layer needed. Most apps use an ORM (Prisma, Drizzle) which generates type-safe query builders from your database schema. Server Components import the ORM client and run queries inline: const users = await prisma.user.findMany(). The non-obvious depth: NEVER create a new DB connection per request — connection pools are limited (typically 100 connections for Postgres, ~10 for serverless platforms like Vercel). Create a SINGLETON ORM client at module load time, and use globalThis to prevent multiple instances during HMR development. Without this, you'll exhaust the connection pool within minutes and your app will crash with "too many connections" errors.

---

### 5 Deep Conceptual Questions

**Q1: How do you prevent connection exhaustion in development hot-reload?**
> **A:** Next.js HMR re-executes module code on file changes — without a singleton pattern, EACH save creates a new ORM client (new pool of connections). Within minutes you exhaust Postgres' max_connections. Solution: store the client on globalThis (preserved across HMR cycles):
> \`\`\`typescript
> import { PrismaClient } from '@prisma/client';
> const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
> export const prisma = globalForPrisma.prisma ?? new PrismaClient();
> if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
> \`\`\`
> In production, modules load once — singleton happens naturally. The trick is HMR-safe development.

**Q2: Mental model for serverless DB connections?**
> **A:** Serverless functions (Vercel, AWS Lambda) spawn many concurrent instances — each one opens its own DB connections. With Vercel scaling to 1000 concurrent functions, each opening 5 connections, you need 5000 connection slots — Postgres maxes at 100 by default! Solutions: (1) Connection pooler like PgBouncer or Supabase's pooler — multiplexes many app connections onto few DB connections. (2) HTTP-based DB drivers (Neon serverless, Turso) — no persistent connections, each query is a separate HTTP request. (3) Prisma Accelerate or Drizzle's HTTP driver — proxy layer that pools connections.

**Q3: Most dangerous misconception about ORM in Next.js?**
> **A:** ORM queries in Server Components are always safe from SQL injection:
> \`\`\`typescript
> // CORRECT: parameterised queries (Prisma does this automatically)
> const users = await prisma.user.findMany({ where: { email: userInput } });
> // -> Prisma escapes userInput safely
>
> // WRONG: raw queries with template literals
> const users = await prisma.$queryRaw\`SELECT * FROM users WHERE email = \${userInput}\`;
> // Wait — Prisma's $queryRaw with template literal IS parameterised, this is SAFE
>
> // DANGEROUS: $queryRawUnsafe with concatenation
> const users = await prisma.$queryRawUnsafe(\`SELECT * FROM users WHERE email = '\${userInput}'\`);
> // -> SQL injection vulnerability! userInput is concatenated as raw SQL
> // Attack: userInput = "'; DROP TABLE users; --"
> \`\`\`

**Q4: How should you handle transactions in Server Components?**
> **A:** Wrap multi-step operations in transactions for atomicity: await prisma.$transaction(async (tx) => { await tx.user.update(...); await tx.account.create(...); }) — if either fails, BOTH roll back. Important: transactions hold a connection from the pool for their entire duration — long transactions exhaust the pool. Keep transactions SHORT (< 1 second), do all heavy computation BEFORE the transaction, and use raw SQL (BEGIN/COMMIT) only for complex scenarios. Server Components are read-only in spirit — most transactions belong in Server Actions or Route Handlers (mutations), not in page rendering.

**Q5: FAANG-grade definition of Next.js database integration patterns.**
> **A:** "Next.js database integration uses singleton ORM clients (Prisma, Drizzle, Kysely) instantiated at module load with HMR-safe globalThis pattern — direct query execution in Server Components for reads and Server Actions for mutations — connection pooling via PgBouncer/Supabase Pooler or HTTP-based drivers (Neon Serverless, Turso) to handle serverless function concurrency exceeding native DB connection limits — parameterised queries via ORM query builders or template-literal $queryRaw for safety from SQL injection — transactions for atomic multi-step operations with strict duration constraints — and React's cache() for request-level deduplication of identical queries across components in a single render."`,

    build: `## BUILD

### 🏗️ Mini Project: Production DB Setup — Prisma + Postgres + Connection Pool + Transactions

**What you will build:** A blog API with Prisma + Postgres: HMR-safe singleton client, type-safe queries, transactional post + tags creation, raw SQL for analytics, and connection pool monitoring.
**Why this project:** Forces every production database pattern.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest db-demo --typescript --tailwind --app
cd db-demo
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql
\`\`\`

\`\`\`prisma
// prisma/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String
  posts     Post[]
  createdAt DateTime  @default(now())
}

model Post {
  id        Int       @id @default(autoincrement())
  title     String
  content   String
  published Boolean   @default(false)
  authorId  Int
  author    User      @relation(fields: [authorId], references: [id])
  tags      Tag[]
  createdAt DateTime  @default(now())
  @@index([authorId, published])
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}
\`\`\`

\`\`\`bash
npx prisma migrate dev --name init
npx prisma generate
\`\`\`

#### Step 2 — HMR-Safe Singleton Client
\`\`\`typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Cleanup on shutdown (graceful)
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
\`\`\`

#### Step 3 — Type-Safe Server Component Queries
\`\`\`typescript
// src/app/posts/page.tsx
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

// cache() dedupes identical calls within one render
const getPublishedPosts = cache(async (limit: number = 10) => {
  return prisma.post.findMany({
    where: { published: true },
    include: { author: { select: { name: true } }, tags: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
});

export default async function PostsPage() {
  const posts = await getPublishedPosts(20);
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Latest Posts ({posts.length})</h1>
      {posts.map(post => (
        <article key={post.id} className="mb-6 pb-6 border-b">
          <h2 className="text-xl font-semibold">
            <Link href={\`/posts/\${post.id}\`} className="hover:underline">{post.title}</Link>
          </h2>
          <p className="text-sm text-gray-500">
            By {post.author.name} · {post.tags.map(t => t.name).join(', ')}
          </p>
          <p className="mt-2">{post.content.slice(0, 200)}...</p>
        </article>
      ))}
    </main>
  );
}
\`\`\`

#### Step 4 — Transactions in Server Actions
\`\`\`typescript
// src/app/posts/actions.ts
'use server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CreatePostSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  tags: z.array(z.string()).max(5),
  authorEmail: z.string().email(),
});

export async function createPostAction(input: z.infer<typeof CreatePostSchema>) {
  const data = CreatePostSchema.parse(input);

  // Transaction: ensure user, post, and tag connections are all atomic
  const result = await prisma.$transaction(async (tx) => {
    // 1. Upsert author
    const author = await tx.user.upsert({
      where: { email: data.authorEmail },
      update: {},
      create: { email: data.authorEmail, name: data.authorEmail.split('@')[0] },
    });

    // 2. Upsert tags (parallel inside transaction)
    const tags = await Promise.all(
      data.tags.map(name =>
        tx.tag.upsert({ where: { name }, update: {}, create: { name } })
      )
    );

    // 3. Create post connected to author and tags
    const post = await tx.post.create({
      data: {
        title: data.title,
        content: data.content,
        published: true,
        author: { connect: { id: author.id } },
        tags: { connect: tags.map(t => ({ id: t.id })) },
      },
      include: { author: true, tags: true },
    });

    return post;
  }, {
    maxWait: 5000,  // wait up to 5s to start transaction
    timeout: 10000, // transaction must complete within 10s
  });

  revalidatePath('/posts');
  return { success: true, postId: result.id };
}
\`\`\`

#### Step 5 — Raw SQL + Tests
\`\`\`typescript
// src/lib/analytics.ts
import { prisma } from '@/lib/prisma';

// Raw SQL for analytics queries (Prisma's ORM is over-abstraction for aggregates)
export async function getPostsByDay(days: number = 30) {
  return prisma.$queryRaw<Array<{ day: Date; count: bigint }>>\`
    SELECT
      DATE_TRUNC('day', "createdAt") AS day,
      COUNT(*) AS count
    FROM "Post"
    WHERE "createdAt" > NOW() - INTERVAL '1 day' * \${days}
      AND "published" = true
    GROUP BY day
    ORDER BY day DESC
  \`;
  // Template literal IS parameterised — safe from SQL injection
}

// Tests
import { prisma } from '@/lib/prisma';

describe('Database', () => {
  beforeEach(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
  });

  it('creates post in transaction', async () => {
    const { createPostAction } = await import('@/app/posts/actions');
    const result = await createPostAction({
      title: 'Test Post', content: 'Lorem ipsum dolor sit amet',
      tags: ['test'], authorEmail: 'test@example.com',
    });
    expect(result.success).toBe(true);
    const count = await prisma.post.count();
    expect(count).toBe(1);
  });

  it('rolls back on transaction failure', async () => {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.create({ data: { email: 'a@b.com', name: 'A' } });
        throw new Error('Forced failure');
      });
    } catch {}
    const user = await prisma.user.findUnique({ where: { email: 'a@b.com' } });
    expect(user).toBeNull();  // rolled back
  });
});
\`\`\`

**Expected Output:**
\`\`\`
npx prisma migrate dev -> creates tables
/posts -> renders posts with author and tags
createPostAction -> atomic insert of user + tags + post
HMR save 100 times -> only ONE Prisma client (singleton)
getPostsByDay(7) -> aggregated daily counts (raw SQL)
Tests: 2 passed
\`\`\`

**Stretch Challenges:**
- [ ] Switch to Drizzle ORM and compare DX
- [ ] Add Prisma Accelerate for global query caching
- [ ] Add pgBouncer in docker-compose for connection pooling`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Why use a singleton ORM client in Next.js?
**Q2:** Difference between $queryRaw and $queryRawUnsafe?
**Q3:** Write the HMR-safe Prisma singleton pattern. From memory.

### Day 3 — Comprehension
**Q4:** How do serverless functions cause connection exhaustion?
**Q5:** A PR creates new PrismaClient() inside an API route — diagnose.
**Q6:** When are ORM queries safe from SQL injection?

### Day 7 — Application
**Q7:** Build an atomic transfer between two accounts using prisma.$transaction.
**Q8:** A PR puts a long transaction in a Server Component page — explain pool exhaustion.
**Q9:** When should you use raw SQL vs ORM?

### Day 14 — Synthesis
**Q10:** ★ Interview: "How do you handle DB connections in serverless Next.js — connection pooling strategies?"
**Q11:** Draw: connection pool — app instances → PgBouncer → Postgres.
**Q12:** ★ System design: "Design the database layer for a Next.js SaaS — multi-tenant isolation, connection pooling, read replicas, migrations."`
  },

  // ── 18. nextjs-forms ──────────────────────────────────────────────────────
  'nextjs-forms': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Forms Like I'm 10 Years Old
> Next.js forms use the standard HTML <form> tag but with a Server Action as the action prop: <form action={createPost}>. When submitted, the Server Action runs on the server, accesses the database, and returns either a success state or validation errors. React 19's useFormState hook captures the action's return value for error display. useFormStatus gives you the pending state during submission. The big win: forms work WITHOUT JavaScript loaded — pure HTML POST submission falls back to a server-rendered response. The non-obvious depth: file uploads work the same way — Server Actions receive FormData with files, you process them server-side (validate size/type, save to S3, store URL in DB). No multipart parsing library needed, no API endpoint to write — the entire upload flow is one Server Action.

---

### 5 Deep Conceptual Questions

**Q1: How does form validation work end-to-end?**
> **A:** Three layers: (1) BROWSER: HTML5 required, pattern, minLength attributes — instant feedback, but bypassable. (2) CLIENT JS: React + Zod schema for live validation as user types — better UX, also bypassable. (3) SERVER: ALWAYS re-validate in the Server Action with the same Zod schema — non-bypassable, source of truth. Pattern: share the Zod schema between client and server via a /lib/validation.ts module — single source of truth, type-safe on both sides. Server Action returns { errors: result.error.flatten().fieldErrors } which useFormState exposes to the form for inline display.

**Q2: Mental model for useFormState + useFormStatus?**
> **A:** useFormState(action, initialState) wraps a Server Action — returns [state, formAction]. Pass formAction to <form action={formAction}>. The state is whatever your action returns (success/error object). useFormStatus is called INSIDE a child of the form (typically the submit button) — returns { pending, data, method, action }. Pattern: put useFormStatus in a separate SubmitButton component (it must be a CHILD of the form, not the form itself) — pending becomes true during submission, false when complete. This lets you disable buttons and show spinners without managing state yourself.

**Q3: Most dangerous misconception about forms?**
> **A:** Server Actions automatically prevent double-submission:
> \`\`\`typescript
> // WRONG: assuming user can't double-click submit
> 'use server';
> export async function chargeCardAction(formData: FormData) {
>   await chargeCustomer(formData.get('amount'));  // What if user clicks twice in 100ms?
> }
> // Result: charged twice -> furious customer
>
> // CORRECT: idempotency via unique request token + DB constraint
> 'use server';
> export async function chargeCardAction(formData: FormData) {
>   const idempotencyKey = formData.get('idempotency_key') as string;
>   if (!idempotencyKey) throw new Error('Missing idempotency key');
>
>   const existing = await db.charge.findUnique({ where: { idempotencyKey } });
>   if (existing) return existing;  // already processed, return same result
>
>   return db.charge.create({
>     data: { idempotencyKey, amount: Number(formData.get('amount')) }
>   });
> }
>
> // Form: <input type="hidden" name="idempotency_key" value={crypto.randomUUID()} />
> \`\`\`

**Q4: How do you handle file uploads with Server Actions?**
> **A:** <form action={uploadAction} encType="multipart/form-data"><input type="file" name="avatar" /></form>. In the Server Action: const file = formData.get('avatar') as File; const buffer = Buffer.from(await file.arrayBuffer()); — now you have the file bytes. Validate type/size (if (file.size > 5_000_000) throw 'Too large'), upload to S3/Cloudinary, store the URL. Multiple files: input multiple → formData.getAll('avatar'). The Server Action automatically handles multipart parsing — no formidable/multer needed. For large files (>4MB), use direct browser-to-S3 uploads (presigned URLs) to avoid the Next.js function size limit.

**Q5: FAANG-grade definition of Next.js forms.**
> **A:** "Next.js forms use standard HTML form elements with Server Actions as the action attribute — enabling progressive enhancement (functional without JavaScript via standard form submission) — with React 19's useFormState capturing action return values for inline validation errors, useFormStatus exposing submission pending state in child components — server-side Zod validation as the source of truth — automatic CSRF protection via Server Action ID obfuscation — multipart file upload handling via FormData.get() returning File objects — idempotency patterns via client-generated UUIDs for safe retries — and the optimistic UI pattern via useOptimistic for instant feedback before server confirmation — eliminating the traditional API endpoint + client fetch + JSON serialisation boilerplate."`,

    build: `## BUILD

### 🏗️ Mini Project: Production Form — Validation, File Upload, Optimistic UI, Progressive Enhancement

**What you will build:** A profile editor form with text fields, avatar upload, Zod validation shared client/server, useFormState errors, useFormStatus loading, useOptimistic preview, and works without JS.
**Why this project:** Forces every modern Next.js form pattern.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest forms-demo --typescript --tailwind --app
npm install zod better-sqlite3 @types/better-sqlite3
mkdir -p public/uploads
\`\`\`

#### Step 2 — Shared Validation Schema
\`\`\`typescript
// src/lib/validation.ts
import { z } from 'zod';

export const ProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;

export const MAX_AVATAR_SIZE = 2 * 1024 * 1024;  // 2MB
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
\`\`\`

#### Step 3 — Server Action With File Upload
\`\`\`typescript
// src/app/profile/actions.ts
'use server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { ProfileSchema, MAX_AVATAR_SIZE, ALLOWED_TYPES } from '@/lib/validation';
import Database from 'better-sqlite3';

const db = new Database('profiles.db');
db.exec(\`CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY,
  name TEXT, email TEXT, bio TEXT, avatar_url TEXT,
  updated_at TEXT
)\`);

export type FormState = {
  status: 'idle' | 'success' | 'error';
  errors?: Record<string, string[]>;
  message?: string;
  profile?: any;
};

export async function updateProfileAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // Validate text fields
  const result = ProfileSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    bio: formData.get('bio') || undefined,
  });

  if (!result.success) {
    return {
      status: 'error',
      errors: result.error.flatten().fieldErrors,
      message: 'Please fix the errors below',
    };
  }

  // Handle file upload
  let avatarUrl: string | undefined;
  const avatar = formData.get('avatar') as File | null;
  if (avatar && avatar.size > 0) {
    if (avatar.size > MAX_AVATAR_SIZE) {
      return { status: 'error', message: 'Avatar must be less than 2MB' };
    }
    if (!ALLOWED_TYPES.includes(avatar.type)) {
      return { status: 'error', message: 'Avatar must be JPEG, PNG, or WebP' };
    }

    const buffer = Buffer.from(await avatar.arrayBuffer());
    const ext = avatar.type.split('/')[1];
    const filename = \`avatar-\${Date.now()}.\${ext}\`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);
    avatarUrl = \`/uploads/\${filename}\`;
  }

  // Idempotency check (prevent double-submission)
  const idempotencyKey = formData.get('idempotency_key') as string;
  // ... lookup and skip if exists

  // Save to DB
  db.prepare(\`INSERT OR REPLACE INTO profiles (id, name, email, bio, avatar_url, updated_at)
    VALUES (1, ?, ?, ?, ?, ?)\`).run(
    result.data.name, result.data.email, result.data.bio ?? '',
    avatarUrl ?? null, new Date().toISOString(),
  );

  const updated = db.prepare('SELECT * FROM profiles WHERE id = 1').get();
  revalidatePath('/profile');
  return { status: 'success', message: 'Profile updated', profile: updated };
}
\`\`\`

#### Step 4 — Client Form With All Patterns
\`\`\`typescript
// src/components/ProfileForm.tsx
'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { useState } from 'react';
import { updateProfileAction, FormState } from '@/app/profile/actions';
import { ProfileSchema } from '@/lib/validation';

const initialState: FormState = { status: 'idle' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
    >
      {pending ? 'Saving...' : 'Save Profile'}
    </button>
  );
}

interface Props { initialProfile: any; }

export function ProfileForm({ initialProfile }: Props) {
  const [state, formAction] = useFormState(updateProfileAction, initialState);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(initialProfile?.avatar_url);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const validateField = (name: string, value: string) => {
    try {
      const fieldSchema = ProfileSchema.shape[name as keyof typeof ProfileSchema.shape];
      fieldSchema?.parse(value);
      setClientErrors(prev => ({ ...prev, [name]: '' }));
    } catch (err: any) {
      setClientErrors(prev => ({ ...prev, [name]: err.errors?.[0]?.message ?? '' }));
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-4 max-w-md">
      <input type="hidden" name="idempotency_key" value={idempotencyKey} />

      <div>
        <label className="block text-sm font-medium mb-1">Avatar</label>
        {avatarPreview && (
          <img src={avatarPreview} alt="Preview" className="w-20 h-20 rounded-full mb-2 object-cover" />
        )}
        <input type="file" name="avatar" accept="image/*" onChange={handleFile} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          name="name"
          defaultValue={initialProfile?.name}
          onBlur={e => validateField('name', e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        {(clientErrors.name || state.errors?.name?.[0]) && (
          <p className="text-red-500 text-sm mt-1">{clientErrors.name || state.errors?.name?.[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          name="email" type="email"
          defaultValue={initialProfile?.email}
          onBlur={e => validateField('email', e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        {(clientErrors.email || state.errors?.email?.[0]) && (
          <p className="text-red-500 text-sm mt-1">{clientErrors.email || state.errors?.email?.[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea
          name="bio" rows={3}
          defaultValue={initialProfile?.bio}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <SubmitButton />

      {state.status === 'success' && (
        <p className="text-green-600">{state.message}</p>
      )}
      {state.status === 'error' && !state.errors && (
        <p className="text-red-600">{state.message}</p>
      )}
    </form>
  );
}
\`\`\`

#### Step 5 — Page + Tests
\`\`\`typescript
// src/app/profile/page.tsx
import Database from 'better-sqlite3';
import { ProfileForm } from '@/components/ProfileForm';

const db = new Database('profiles.db');

export default function ProfilePage() {
  const profile = db.prepare('SELECT * FROM profiles WHERE id = 1').get();
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <ProfileForm initialProfile={profile} />
    </main>
  );
}

// Tests
import { updateProfileAction } from '@/app/profile/actions';
it('rejects too-short name', async () => {
  const fd = new FormData();
  fd.set('name', 'A');
  fd.set('email', 'a@b.com');
  const result = await updateProfileAction({ status: 'idle' }, fd);
  expect(result.status).toBe('error');
  expect(result.errors?.name).toBeDefined();
});
\`\`\`

**Expected Output:**
\`\`\`
Submit form -> Server Action validates, uploads avatar, saves to DB
Avatar preview shows before submit (URL.createObjectURL)
Pending state: button shows "Saving..." during submission
Validation errors: shown inline next to fields
Disable JS -> form still POSTs, server validates and re-renders
Tests: 1 passed
\`\`\`

**Stretch Challenges:**
- [ ] Replace local file upload with presigned S3 URLs
- [ ] Add useOptimistic for instant preview before server confirms
- [ ] Add a multi-step form wizard with shared schema`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between useFormState and useFormStatus?
**Q2:** Three layers of form validation and why all are needed?
**Q3:** Write a Server Action that handles a file upload. From memory.

### Day 3 — Comprehension
**Q4:** How do you prevent double-form-submission charges?
**Q5:** A PR validates only client-side with Zod — diagnose the security issue.
**Q6:** Why must useFormStatus be in a CHILD of the form?

### Day 7 — Application
**Q7:** Build a multi-step wizard sharing a single Zod schema across steps.
**Q8:** A PR uses formidable to parse uploads — refactor to native Server Actions.
**Q9:** When should large uploads go directly to S3 instead of through Next.js?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through a production form in Next.js — validation, errors, uploads, optimistic UI, idempotency."
**Q11:** Draw: form submission lifecycle — HTML form → Server Action → validation → DB → revalidation.
**Q12:** ★ System design: "Design a complex form system for a job-application platform — multi-step, file uploads, async validation, draft auto-save."`
  },

  // ── 19. parallel-routes ───────────────────────────────────────────────────
  'parallel-routes': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Parallel Routes Like I'm 10 Years Old
> Parallel routes let you render MULTIPLE pages in the SAME LAYOUT simultaneously, each fetching their own data independently. Define a folder like @notifications inside your route — the layout receives it as a named prop alongside children. Navigating to /dashboard/notifications/[id] populates the @notifications slot WITHOUT changing the main content. Combined with intercepting routes, this enables URL-addressable modals: clicking a tweet shows it in a modal that lives in a parallel slot — bookmarkable, shareable, with browser back button working correctly. The non-obvious depth: each parallel slot has its OWN loading.tsx, error.tsx, and Suspense boundary — meaning if the notifications slot is slow, only that slot shows a skeleton while the main content remains interactive. Errors in one slot don't break the others.

---

### 5 Deep Conceptual Questions

**Q1: What is the difference between parallel routes and conditional rendering?**
> **A:** Conditional rendering: { showModal && <Modal /> } — the modal state lives in React, isn't in the URL, doesn't survive page refresh, no browser back button support. Parallel routes: the modal IS the URL — /tweets/(.)tweet/123 — refreshing shows the modal, sharing the URL shows the modal, browser back closes it. Parallel routes also enable independent loading/error states per slot (impossible with conditional rendering — one error crashes the whole tree). Parallel routes work seamlessly with Server Components (each slot can independently fetch server data).

**Q2: Mental model for default.tsx and slot fallbacks?**
> **A:** When a parallel slot has no active route, Next.js renders its default.tsx. If default.tsx doesn't exist, Next.js renders nothing for that slot — but on hard navigation/refresh, this causes a 404! Always provide default.tsx that exports default function Default() { return null; } at minimum. The pattern: each parallel slot has a default.tsx (rendered when slot is empty), a (..)path/[id]/page.tsx (rendered when the slot has an active route), and optionally loading.tsx + error.tsx for independent feedback. Without default.tsx, parallel routes break on hard refresh — common bug.

**Q3: Most dangerous misconception about parallel routes?**
> **A:** Parallel routes share state across slots:
> \`\`\`typescript
> // WRONG: assuming slots can communicate via React Context
> // app/(dashboard)/layout.tsx
> export default function Layout({ children, analytics, notifications }) {
>   const [count, setCount] = useState(0);  // ERROR: layout is Server Component
>   // Even if Client Component, you can't share state to slots:
>   // children, analytics, notifications are SEPARATE React trees
>   return (...);
> }
>
> // CORRECT: slots are INDEPENDENT React trees
> // For shared state: use URL state (searchParams), cookies, or a shared store (Zustand/Jotai)
> // For shared data: fetch it in the layout and pass via props to each slot
> // -> Wait, slots are not children you compose — they're rendered by the layout from named props
> //    The layout determines composition; slots cannot receive runtime props from siblings
>
> // The clean pattern: each slot is independent; share via URL or persistent storage
> \`\`\`

**Q4: How do parallel routes implement URL-addressable modals?**
> **A:** Combine parallel routes with intercepting routes ((.) prefix). Structure: app/feed/page.tsx (feed list), app/feed/@modal/(..)post/[id]/page.tsx (intercepted modal version), app/post/[id]/page.tsx (full page version). Navigation: clicking from /feed → /post/123 is INTERCEPTED — the URL becomes /post/123 but instead of navigating away from /feed, the modal slot renders the post on top. Refreshing /post/123 directly hits the full page (no interception on hard navigation). Sharing /post/123 works for both contexts. Browser back closes the modal (returns to /feed).

**Q5: FAANG-grade definition of parallel routes.**
> **A:** "Next.js parallel routes (@slot folder convention) enable simultaneous rendering of multiple independent route trees within a shared layout — each slot receiving its own loading.tsx, error.tsx, default.tsx (mandatory fallback for empty slots on hard navigation), and route handlers — accessible as named props to the parent layout component — implemented via React's component composition where the layout determines slot placement — enabling sophisticated UI patterns like URL-addressable modals (via intercepting routes), conditional rendering based on auth state, parallel dashboards with independent data fetching, and multi-pane layouts with independent navigation — without sharing state between slots (each tree is isolated)."`,

    build: `## BUILD

### 🏗️ Mini Project: Twitter-Style Feed With Intercepted Modal + Parallel Analytics Slot

**What you will build:** A feed page with: main timeline (children), notifications slot (@notifications), and a clicked-tweet modal via intercepting parallel route. Refreshing on the modal URL shows the full page; sharing works for both.
**Why this project:** Forces parallel routes + intercepting routes + default.tsx — the modal pattern.
**Time estimate:** 40 minutes

---

#### Step 1 — File Structure
\`\`\`bash
npx create-next-app@latest parallel-demo --typescript --tailwind --app
\`\`\`

\`\`\`
src/app/
  layout.tsx
  page.tsx
  feed/
    layout.tsx              # has slots: {children, modal, notifications}
    page.tsx                # main timeline
    @notifications/
      default.tsx           # default content when slot empty
      page.tsx              # /feed/notifications -> sidebar with notifications
      loading.tsx
    @modal/
      default.tsx           # MUST EXIST — renders nothing when no modal open
      (..)tweet/
        [id]/
          page.tsx          # intercepted route — renders as modal
    tweet/
      [id]/
        page.tsx            # full tweet page (when navigated directly)
\`\`\`

#### Step 2 — Feed Layout With Three Slots
\`\`\`typescript
// src/app/feed/layout.tsx
interface Props {
  children: React.ReactNode;
  modal: React.ReactNode;
  notifications: React.ReactNode;
}

export default function FeedLayout({ children, modal, notifications }: Props) {
  return (
    <div className="grid grid-cols-12 max-w-6xl mx-auto">
      {/* Main timeline (children = page.tsx) */}
      <main className="col-span-8 border-r min-h-screen">
        {children}
      </main>

      {/* Notifications sidebar (parallel slot) */}
      <aside className="col-span-4 p-4">
        <h2 className="font-bold text-lg mb-3">Notifications</h2>
        {notifications}
      </aside>

      {/* Modal overlay (intercepted route shows here) */}
      {modal}
    </div>
  );
}
\`\`\`

#### Step 3 — Default Slot Fallbacks
\`\`\`typescript
// src/app/feed/@notifications/default.tsx
export default function NotificationsDefault() {
  return <p className="text-sm text-gray-500">No new notifications</p>;
}

// src/app/feed/@modal/default.tsx
// CRITICAL: this MUST exist or refresh breaks parallel routes
export default function ModalDefault() {
  return null;
}

// src/app/feed/@notifications/page.tsx
async function getNotifications() {
  await new Promise(r => setTimeout(r, 200));
  return [
    { id: 1, text: 'Ana followed you' },
    { id: 2, text: 'Ben replied to your tweet' },
  ];
}

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  return (
    <ul className="space-y-2">
      {notifications.map(n => (
        <li key={n.id} className="text-sm p-2 bg-blue-50 rounded">{n.text}</li>
      ))}
    </ul>
  );
}

// src/app/feed/@notifications/loading.tsx — slot-specific loading
export default function NotificationsLoading() {
  return <div className="animate-pulse h-20 bg-gray-100 rounded" />;
}
\`\`\`

#### Step 4 — Intercepting Modal Route
\`\`\`typescript
// src/app/feed/@modal/(..)tweet/[id]/page.tsx
// (..) means "intercept route from one level up": /tweet/[id] in parent route
import Link from 'next/link';
import { getTweet } from '@/lib/tweets';

interface Props { params: { id: string } }

export default async function TweetModal({ params }: Props) {
  const tweet = await getTweet(params.id);
  if (!tweet) return null;

  return (
    <>
      {/* Backdrop with link back to feed */}
      <Link href="/feed" className="fixed inset-0 bg-black/50 z-40" />

      {/* Modal content */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 pointer-events-auto shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <strong>{tweet.author}</strong>
            <Link href="/feed" className="text-gray-500 hover:text-black">×</Link>
          </div>
          <p>{tweet.text}</p>
          <p className="text-xs text-gray-400 mt-3">{tweet.createdAt}</p>
        </div>
      </div>
    </>
  );
}

// src/app/feed/tweet/[id]/page.tsx — full page (hard navigation/refresh)
import { getTweet } from '@/lib/tweets';

export default async function TweetFullPage({ params }: { params: { id: string } }) {
  const tweet = await getTweet(params.id);
  return (
    <article className="max-w-xl mx-auto p-8">
      <h1 className="font-bold text-xl">{tweet?.author}</h1>
      <p className="text-lg mt-4">{tweet?.text}</p>
    </article>
  );
}
\`\`\`

#### Step 5 — Feed Page With Tweet Links
\`\`\`typescript
// src/app/feed/page.tsx
import Link from 'next/link';
import { getTweets } from '@/lib/tweets';

export default async function FeedPage() {
  const tweets = await getTweets();
  return (
    <div className="divide-y">
      {tweets.map(tweet => (
        <Link
          key={tweet.id}
          href={\`/feed/tweet/\${tweet.id}\`}
          className="block p-4 hover:bg-gray-50"
        >
          <strong>{tweet.author}</strong>
          <p>{tweet.text}</p>
          <p className="text-xs text-gray-400 mt-1">{tweet.createdAt}</p>
        </Link>
      ))}
    </div>
  );
}

// src/lib/tweets.ts
const TWEETS = [
  { id: '1', author: '@ana', text: 'Server Components are amazing!', createdAt: '2m ago' },
  { id: '2', author: '@ben', text: 'Parallel routes finally clicked for me.', createdAt: '15m ago' },
  { id: '3', author: '@cara', text: 'Next.js 15 ships today.', createdAt: '1h ago' },
];
export async function getTweets() { return TWEETS; }
export async function getTweet(id: string) { return TWEETS.find(t => t.id === id); }
\`\`\`

**Expected Output:**
\`\`\`
/feed -> shows timeline + notifications sidebar
Click a tweet -> URL becomes /feed/tweet/1, modal opens (intercepted)
Refresh /feed/tweet/1 -> shows full page (interception only on soft nav)
Click backdrop or × -> closes modal, URL returns to /feed
Browser back -> closes modal (URL history works)
@notifications slot loads independently with its own loading.tsx
\`\`\`

**Stretch Challenges:**
- [ ] Add a third parallel slot for trending topics
- [ ] Add error.tsx to one slot and see independent error handling
- [ ] Add conditional slot rendering based on auth (logged-in vs guest)`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is the @folder syntax for?
**Q2:** Why is default.tsx mandatory for parallel slots?
**Q3:** Write a layout that receives two parallel slot props. From memory.

### Day 3 — Comprehension
**Q4:** Difference between parallel routes and conditional rendering?
**Q5:** A PR's parallel route breaks on hard refresh — what's likely missing?
**Q6:** How do (..) intercepting routes enable URL-addressable modals?

### Day 7 — Application
**Q7:** Build a photo gallery where clicking opens an intercepted modal route.
**Q8:** A PR shares state between parallel slots via Context — explain why it doesn't work.
**Q9:** How do you handle slot-specific loading and error states?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain parallel routes and intercepting routes — when do you use them in production?"
**Q11:** Draw: file structure for a Twitter-clone with feed, modal, notifications, and trending slots.
**Q12:** ★ System design: "Design a dashboard with 4 independent panels using parallel routes — auth, data isolation, real-time updates."`
  },

  // ── 20. nextjs-streaming ──────────────────────────────────────────────────
  'nextjs-streaming': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Streaming Like I'm 10 Years Old
> Streaming means the server sends parts of the HTML response AS THEY BECOME READY, instead of waiting for everything to be ready and sending one big response at the end. Wrap a slow Server Component in <Suspense fallback={<Skeleton />}>. Next.js sends the shell + skeleton immediately, then streams the real content when the slow data resolves. The user sees the page structure in 100ms instead of waiting 3 seconds for the slowest API. This is enabled by React 18's renderToReadableStream() — HTML is delivered in chunks, each Suspense boundary becoming a chunk. The non-obvious depth: streaming changes nothing about your code — you just wrap components in Suspense. React and Next.js handle the entire streaming protocol, out-of-order chunk delivery, and client-side reconciliation automatically. Old SSR (and Pages Router) couldn't do this — they had to wait for ALL data before sending any HTML.

---

### 5 Deep Conceptual Questions

**Q1: What is the difference between streaming SSR and traditional SSR?**
> **A:** Traditional SSR: server waits for ALL async work (DB queries, API calls) → renders complete HTML → sends in one response. Slow components block the entire page TTFB. Streaming SSR: server starts sending HTML IMMEDIATELY (the shell + fallbacks) → keeps the connection open → streams Suspense boundary contents as they resolve. TTFB drops to near-zero (just the shell). The user perceives a 5x faster page load even if total render time is identical, because the structure appears instantly and content fills in. Streaming requires HTTP/1.1 chunked transfer encoding (universally supported).

**Q2: Mental model for how Suspense + streaming work together?**
> **A:** Each <Suspense fallback={...}> is a STREAMING BOUNDARY. When the server renders, it: (1) Renders everything outside Suspense → sends to client immediately. (2) For Suspense children, sends the FALLBACK now and queues the real content for streaming. (3) When the async work inside Suspense completes, renders the real HTML and streams it with a script tag that tells React "replace fallback X with content Y". The client sees: skeleton → loading → smooth replacement. No JavaScript loading state libraries (SWR, React Query) needed — Suspense IS the loading state.

**Q3: Most dangerous misconception about streaming?**
> **A:** Streaming improves total response time:
> \`\`\`typescript
> // WRONG: assuming streaming makes things faster overall
> // Streaming changes WHEN bytes arrive, not the TOTAL time
> //
> // Traditional SSR: 3 second wait, then 50KB HTML in 100ms
> //                  Total: 3.1s to interactive
> //
> // Streaming SSR:  100ms shell, then progressive chunks over 3 seconds
> //                  Total: 3.1s to fully interactive
> //                  BUT: user sees content at 100ms, perceives 30x faster
> //
> // Key insight: streaming improves PERCEIVED performance and Time-To-First-Byte
> // It does NOT reduce total server work or total transfer time
> // Slow database queries are still slow — streaming just doesn't block other content
> \`\`\`

**Q4: How do you optimise the streaming granularity?**
> **A:** Each Suspense boundary creates a streaming chunk. TOO COARSE (one big Suspense around the whole page): all content waits for the slowest part — no benefit. TOO FINE (Suspense around each line): overhead from too many chunks. SWEET SPOT: one Suspense per independent data fetch. Pattern: layout.tsx renders the shell, page.tsx orchestrates Suspense boundaries around independently-fetching widgets (RevenueChart, ActivityFeed, RecentOrders). Each widget streams independently — fast ones appear first, slow ones get their own skeleton. Avoid Suspense around components with no async work — it adds overhead without benefit.

**Q5: FAANG-grade definition of Next.js streaming.**
> **A:** "Next.js streaming SSR leverages React 18's renderToReadableStream() to deliver HTML in chunks over HTTP/1.1 chunked transfer encoding — sending the initial shell with Suspense fallbacks immediately (sub-100ms TTFB) — buffering and streaming each Suspense boundary's content as its async work resolves with inline scripts instructing React to replace fallbacks — supporting out-of-order chunk delivery (fast components can arrive before slow ones declared earlier) — automatically enabled for any Server Component wrapped in Suspense without code changes — improving perceived performance and Core Web Vitals (LCP, INP) while total render time remains constant — and enabling progressive hydration where interactive components become live as their JavaScript loads."`,

    build: `## BUILD

### 🏗️ Mini Project: Streaming Dashboard — Independent Widgets With Granular Suspense

**What you will build:** A dashboard with 4 widgets fetching data at different speeds (100ms, 500ms, 1500ms, 3000ms) — each in its own Suspense boundary so users see content progressively. Compare to a non-streaming version where everything waits for the slowest fetch.
**Why this project:** Forces the granular Suspense pattern that gives streaming its real benefit.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest streaming-demo --typescript --tailwind --app
\`\`\`

#### Step 2 — Simulated Data Fetchers
\`\`\`typescript
// src/lib/data.ts
async function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export async function getFastStats() {
  await delay(100);
  return { activeUsers: 1234, signupsToday: 42 };
}

export async function getRevenueData() {
  await delay(500);
  return { mtdRevenue: 42_318, growth: 12.5 };
}

export async function getRecentActivity() {
  await delay(1500);
  return [
    { id: 1, action: 'PR merged', user: 'ana', time: '5m' },
    { id: 2, action: 'Deploy succeeded', user: 'ben', time: '12m' },
    { id: 3, action: 'New user signed up', user: 'cara', time: '18m' },
  ];
}

export async function getMonthlyChart() {
  await delay(3000);  // SLOW — analytics aggregate query
  return Array.from({ length: 30 }, (_, i) => ({ day: i + 1, value: Math.random() * 100 }));
}
\`\`\`

#### Step 3 — Independent Widgets
\`\`\`typescript
// src/components/Widgets.tsx
import { getFastStats, getRevenueData, getRecentActivity, getMonthlyChart } from '@/lib/data';

export async function FastStats() {
  const data = await getFastStats();
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="font-bold text-gray-600">Active Users</h3>
      <p className="text-3xl font-bold">{data.activeUsers.toLocaleString()}</p>
      <p className="text-sm text-green-600">+{data.signupsToday} signups today</p>
    </div>
  );
}

export async function RevenueWidget() {
  const data = await getRevenueData();
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="font-bold text-gray-600">Revenue (MTD)</h3>
      <p className="text-3xl font-bold">\${data.mtdRevenue.toLocaleString()}</p>
      <p className="text-sm text-green-600">+{data.growth}% MoM</p>
    </div>
  );
}

export async function ActivityFeed() {
  const activity = await getRecentActivity();
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="font-bold text-gray-600 mb-3">Recent Activity</h3>
      <ul className="space-y-2">
        {activity.map(a => (
          <li key={a.id} className="text-sm">
            <strong>{a.user}</strong> {a.action} <span className="text-gray-400">— {a.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function MonthlyChart() {
  const data = await getMonthlyChart();
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="font-bold text-gray-600 mb-3">Last 30 Days</h3>
      <div className="flex items-end gap-1 h-24">
        {data.map(d => (
          <div
            key={d.day}
            className="bg-blue-500 flex-1"
            style={{ height: \`\${(d.value / max) * 100}%\` }}
            title={\`Day \${d.day}: \${d.value.toFixed(1)}\`}
          />
        ))}
      </div>
    </div>
  );
}

// Generic skeleton fallback
export function WidgetSkeleton() {
  return (
    <div className="bg-gray-100 rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
    </div>
  );
}
\`\`\`

#### Step 4 — Streaming Page With Granular Suspense
\`\`\`typescript
// src/app/dashboard/page.tsx
import { Suspense } from 'react';
import {
  FastStats, RevenueWidget, ActivityFeed, MonthlyChart, WidgetSkeleton,
} from '@/components/Widgets';

export default function DashboardPage() {
  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-sm text-gray-400 mb-4">Page TTFB: instant (streaming SSR)</p>

      <div className="grid grid-cols-2 gap-4">
        {/* FAST: appears at ~100ms */}
        <Suspense fallback={<WidgetSkeleton />}>
          <FastStats />
        </Suspense>

        {/* MEDIUM: appears at ~500ms */}
        <Suspense fallback={<WidgetSkeleton />}>
          <RevenueWidget />
        </Suspense>

        {/* SLOW: appears at ~1500ms */}
        <Suspense fallback={<WidgetSkeleton />}>
          <ActivityFeed />
        </Suspense>

        {/* VERY SLOW: appears at ~3000ms */}
        <Suspense fallback={<WidgetSkeleton />}>
          <MonthlyChart />
        </Suspense>
      </div>
    </main>
  );
}
\`\`\`

#### Step 5 — Non-Streaming Comparison + Tests
\`\`\`typescript
// src/app/dashboard-blocking/page.tsx -- NO Suspense, blocks on slowest
import { FastStats, RevenueWidget, ActivityFeed, MonthlyChart } from '@/components/Widgets';

export default async function BlockingDashboard() {
  // All 4 fetches run in parallel via component render, BUT page waits for ALL
  return (
    <main className="p-8">
      <h1>Blocking Dashboard (no streaming)</h1>
      <div className="grid grid-cols-2 gap-4">
        <FastStats />        {/* awaits 100ms */}
        <RevenueWidget />    {/* awaits 500ms */}
        <ActivityFeed />     {/* awaits 1500ms */}
        <MonthlyChart />     {/* awaits 3000ms — page waits for this */}
      </div>
      {/* Total time to first byte: ~3000ms (waits for slowest) */}
    </main>
  );
}

// Test: verify Suspense boundaries enable streaming
import { render, screen } from '@testing-library/react';
it('renders skeleton fallbacks initially', () => {
  // In real browser, the user sees skeletons first, then content
  // Jest renders synchronously so we can verify the structure
  expect(true).toBe(true);  // streaming is a runtime behaviour
});
\`\`\`

**Expected Output:**
\`\`\`
/dashboard (streaming):
  T+0ms: page shell + 4 skeletons appear (instant TTFB)
  T+100ms: FastStats replaces its skeleton
  T+500ms: RevenueWidget replaces its skeleton
  T+1500ms: ActivityFeed replaces its skeleton
  T+3000ms: MonthlyChart replaces its skeleton

/dashboard-blocking (no Suspense):
  T+0ms: blank page, waiting...
  T+3000ms: ALL widgets appear at once (TTFB = 3000ms)

Network tab: see HTML response stream in chunks over 3 seconds
\`\`\`

**Stretch Challenges:**
- [ ] Add a custom loading.tsx for the page-level skeleton
- [ ] Add useTransition + useState client component that streams updates
- [ ] Measure TTFB difference with Lighthouse Performance audit`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does Suspense + streaming do for page loading?
**Q2:** Does streaming reduce total response time?
**Q3:** Write a page with two Suspense boundaries for independent widgets. From memory.

### Day 3 — Comprehension
**Q4:** Difference between traditional SSR and streaming SSR?
**Q5:** A PR wraps the entire page in one Suspense — explain why it's useless.
**Q6:** What HTTP feature enables streaming?

### Day 7 — Application
**Q7:** Build a streaming product page with fast (header) and slow (recommendations) widgets.
**Q8:** A PR has many tiny Suspense boundaries — explain the overhead.
**Q9:** How does loading.tsx relate to Suspense?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain streaming SSR — how does it work technically and what user-perceived benefits does it provide?"
**Q11:** Draw: streaming timeline — shell → fallbacks → progressive content arrival.
**Q12:** ★ System design: "Design a news article page with streaming — article body, related articles, comments, ads — what streams when?"`
  },

  // ── 21. nextjs-image ──────────────────────────────────────────────────────
  'nextjs-image': {
    feynman: `## FEYNMAN CHECK

### Explain next/image Like I'm 10 Years Old
> next/image is a drop-in replacement for the <img> tag that does FIVE production optimisations automatically: (1) Lazy loading — images outside the viewport don't download until you scroll near them. (2) Modern format conversion — JPEG/PNG served as WebP/AVIF when the browser supports it (often 30-50% smaller). (3) Responsive sizes — multiple resolutions generated, browser picks the right one for the device. (4) Layout shift prevention — reserves space based on width/height so the page doesn't jump when images load. (5) Blur placeholder — shows a tiny blurred preview while the real image downloads. The non-obvious depth: next/image processes images on-demand via /\\_next/image — first request triggers transformation (resize + format conversion + caching), subsequent requests serve the cached version. Without next/image, you'd need: a CDN, an image processing service, manual srcset generation, IntersectionObserver code, and CSS aspect-ratio boxes — next/image gives all of this with one component.

---

### 5 Deep Conceptual Questions

**Q1: How does next/image prevent Cumulative Layout Shift (CLS)?**
> **A:** CLS happens when an image loads after the page renders — the page reflows to make room, pushing content down. Browsers can't reserve space without knowing dimensions. next/image REQUIRES width and height props (or fill mode with a parent that has aspect-ratio), and renders a properly-sized placeholder div BEFORE the image loads. When the image arrives, it slots into the reserved space — zero layout shift. This is critical for Core Web Vitals: CLS > 0.1 fails Google's "Good" threshold, hurting SEO and user experience.

**Q2: Mental model for the sizes prop?**
> **A:** The sizes prop tells the browser the IMAGE'S DISPLAY WIDTH at each viewport size, so the browser can pick the right resolution from srcset. Example: sizes="(max-width: 768px) 100vw, 50vw" means "on mobile (≤768px), image is 100% viewport width; on desktop, 50%". The browser then requests the appropriate resolution: a 1920px-wide monitor showing the image at 50vw needs 960px → browser requests the 960w variant from srcset. Without correct sizes, the browser uses 100vw (worst case) and downloads the biggest image — wasted bandwidth and slower LCP.

**Q3: Most dangerous misconception about next/image?**
> **A:** External image URLs work automatically:
> \`\`\`typescript
> // WRONG: next/image refuses external URLs by default for security
> <Image src="https://example.com/photo.jpg" width={400} height={300} />
> // ERROR: Invalid src prop, hostname not configured in next.config.js
>
> // CORRECT: configure remote patterns in next.config.js
> // next.config.js
> module.exports = {
>   images: {
>     remotePatterns: [
>       { protocol: 'https', hostname: 'example.com', pathname: '/photos/**' },
>       { protocol: 'https', hostname: '**.amazonaws.com' },  // any S3 bucket
>     ],
>   },
> };
>
> // Why? next/image processes the URL through /_next/image
> // Without an allowlist, attackers could use your server as an open image proxy
> // and abuse it to attack other sites or rack up your bandwidth bill
> \`\`\`

**Q4: When should you use fill mode vs explicit width/height?**
> **A:** Use width/height for KNOWN-SIZE images (logos, avatars, thumbnails — fixed dimensions). Use fill={true} for IMAGES THAT FILL THEIR CONTAINER (hero images, card backgrounds — size depends on parent CSS). With fill, the parent MUST have position: relative (or absolute/fixed) and a defined size (height or aspect-ratio). Common pattern: <div className="relative aspect-video"><Image src="..." fill className="object-cover" /></div>. Without parent position: relative, the image escapes the layout. Without parent size, fill mode has nothing to fill.

**Q5: FAANG-grade definition of next/image.**
> **A:** "Next.js next/image is a React component wrapping <img> with automatic image optimisation — generating responsive srcset (multiple resolutions), serving modern formats (WebP/AVIF) based on Accept header negotiation, lazy-loading via IntersectionObserver below-the-fold, reserving layout space via mandatory width/height or fill mode (preventing CLS), and providing inline blur placeholder via base64 LQIP — processing happens on-demand at /\\_next/image with on-disk caching after first request — configurable via remotePatterns in next.config.js for security (prevents open proxy abuse) — and integrating with Vercel's image optimisation infrastructure (edge-cached, globally distributed) or self-hosted via sharp library — eliminating the need for a separate image CDN, transformation service, srcset generation, and lazy-loading code."`,

    build: `## BUILD

### 🏗️ Mini Project: Production Image Gallery — Hero, Grid, Avatars, Remote Images

**What you will build:** An image gallery showcasing every next/image pattern: hero image with fill, responsive grid with sizes, avatar circles with priority, remote S3 images with remotePatterns, blur placeholders, and CLS measurement.
**Why this project:** Forces every production image scenario.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest image-demo --typescript --tailwind --app
mkdir -p public/photos
# Download a few sample images into public/photos
\`\`\`

#### Step 2 — next.config.js With Remote Patterns
\`\`\`javascript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],  // serve modern formats first
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
};
\`\`\`

#### Step 3 — Hero Image With fill + priority
\`\`\`typescript
// src/components/Hero.tsx
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative h-[60vh] w-full">
      {/* fill mode: image fills the parent (must be position: relative + height) */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920"
        alt="Mountain landscape at sunset"
        fill
        priority  // preload this image — above the fold, critical for LCP
        sizes="100vw"
        className="object-cover"
        // Blur placeholder while loading
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/..."
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <h1 className="text-5xl font-bold text-white">Explore the World</h1>
      </div>
    </section>
  );
}
\`\`\`

#### Step 4 — Responsive Grid With sizes
\`\`\`typescript
// src/components/PhotoGrid.tsx
import Image from 'next/image';

interface Photo { id: string; url: string; alt: string; width: number; height: number; }

const PHOTOS: Photo[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', alt: 'Forest path', width: 800, height: 600 },
  { id: '2', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', alt: 'Lake reflection', width: 800, height: 600 },
  { id: '3', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800', alt: 'Foggy mountains', width: 800, height: 600 },
  // ... add more
];

export function PhotoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-8">
      {PHOTOS.map(photo => (
        <div key={photo.id} className="relative aspect-[4/3] rounded-lg overflow-hidden">
          <Image
            src={photo.url}
            alt={photo.alt}
            fill
            // sizes tells browser the actual display width at each breakpoint
            // mobile: 1 column = 100vw, tablet: 2 cols = 50vw, desktop: 3 cols = 33vw
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover hover:scale-105 transition-transform"
            loading="lazy"  // default for non-priority images
          />
        </div>
      ))}
    </div>
  );
}
\`\`\`

#### Step 5 — Avatars With Explicit Dimensions + Page + Tests
\`\`\`typescript
// src/components/Avatar.tsx
import Image from 'next/image';

interface Props { src: string; name: string; size?: 32 | 48 | 64 | 96; }

export function Avatar({ src, name, size = 48 }: Props) {
  return (
    <Image
      src={src}
      alt={\`\${name}'s avatar\`}
      width={size}
      height={size}
      className="rounded-full"
      // Small images don't need srcset; force size
      sizes={\`\${size}px\`}
    />
  );
}

// src/app/page.tsx
import { Hero } from '@/components/Hero';
import { PhotoGrid } from '@/components/PhotoGrid';
import { Avatar } from '@/components/Avatar';

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Team</h2>
        <div className="flex gap-3">
          {['ana', 'ben', 'cara'].map(name => (
            <Avatar
              key={name}
              src={\`https://i.pravatar.cc/96?u=\${name}\`}
              name={name}
              size={48}
            />
          ))}
        </div>
      </div>
      <PhotoGrid />
    </>
  );
}

// Tests — visual regression / CLS measurement
// Use Lighthouse CLI: npx lighthouse http://localhost:3000 --only-categories=performance
// Verify CLS < 0.1 (good), LCP < 2.5s (good)
\`\`\`

**Expected Output:**
\`\`\`
Page loads: hero appears instantly (priority + preload)
Grid images: lazy-load as you scroll (Network tab shows requests on scroll)
Format negotiation: Chrome receives AVIF, Safari receives WebP, IE11 receives JPEG
Responsive: mobile device gets 750w image, desktop gets 1920w
Layout shift: 0 (width/height reserves space)
Lighthouse: Performance 95+, CLS 0
\`\`\`

**Stretch Challenges:**
- [ ] Generate blur placeholders programmatically with plaiceholder library
- [ ] Add a custom image loader (Cloudinary, Imgix)
- [ ] Implement a lightbox using parallel routes`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Five optimisations next/image does automatically?
**Q2:** What does the sizes prop control?
**Q3:** Write an Image component with fill mode. From memory.

### Day 3 — Comprehension
**Q4:** Why does next/image require width and height?
**Q5:** A PR uses external image URL but gets a hostname error — fix.
**Q6:** When should you use priority on an Image?

### Day 7 — Application
**Q7:** Build a responsive grid where images use the correct srcset variants per breakpoint.
**Q8:** A PR's CLS is 0.4 (poor) due to images — diagnose and fix.
**Q9:** How does next/image differ from a raw <img> tag for performance?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain how next/image improves Core Web Vitals — LCP, CLS, and bandwidth optimisations."
**Q11:** Draw: image request flow — browser → next/image route → cache → optimised response.
**Q12:** ★ System design: "Design image delivery for an e-commerce site with 1M product images — storage, CDN, transformations, lazy loading."`
  },

  // ── 22. nextjs-fonts ──────────────────────────────────────────────────────
  'nextjs-fonts': {
    feynman: `## FEYNMAN CHECK

### Explain next/font Like I'm 10 Years Old
> next/font is Next.js's font system that AUTOMATICALLY: (1) Downloads Google Fonts at BUILD TIME and self-hosts them — no runtime fetch from fonts.googleapis.com (faster, more private, no DNS lookup). (2) Subsets the font to only the characters you need — reducing file size by 50-90%. (3) Eliminates layout shift via the size-adjust CSS descriptor — fallback fonts are styled to match the web font's metrics, so swapping doesn't shift text. (4) Preloads the font for above-the-fold content — appears instantly. (5) Provides a CSS variable for the font — works with Tailwind's font-family classes. The non-obvious depth: in production, next/font ELIMINATES the third-party request to Google entirely — fonts are bundled with your deployment, served from your CDN, with the same caching as your other static assets. This is a huge GDPR win (no IP sent to Google) and a performance win (no extra DNS lookup, TLS handshake, or external dependency).

---

### 5 Deep Conceptual Questions

**Q1: What is FOUT and FOIT, and how does next/font prevent them?**
> **A:** FOUT (Flash of Unstyled Text): text appears in a fallback font, then snaps to the web font when it loads — jarring visual shift. FOIT (Flash of Invisible Text): text is hidden until the web font loads — page appears broken if font is slow. next/font uses the size-adjust CSS descriptor + ascent-override + descent-override + line-gap-override to make the FALLBACK FONT (typically Arial) have IDENTICAL METRICS to the web font. When the web font loads, the swap is invisible — same line height, same x-height, same character widths. Result: zero CLS from font loading, no FOUT/FOIT.

**Q2: Mental model for variable fonts with next/font?**
> **A:** Variable fonts contain MULTIPLE WEIGHTS/STYLES in one file via interpolation axes (wght, wdth, slnt). const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' }) loads one file supporting weights 100-900. In CSS: var(--font-inter) gives the font-family. font-weight: 350 (any decimal value!) works because the variable font interpolates. Trade-off: variable font file is larger than a single weight (~50KB vs 15KB), but smaller than loading 9 separate weights (~135KB). Use variable for design systems needing many weights; use single weight for simple sites.

**Q3: Most dangerous misconception about font loading?**
> **A:** font-display: swap is always the best choice:
> \`\`\`css
> /* font-display options trade off FOUT vs FOIT */
>
> /* block: hide text up to 3s, then swap — risk of FOIT */
> /* swap: show fallback immediately, swap when ready — risk of FOUT */
> /* fallback: brief block (100ms), then swap if loaded within 3s, else stay fallback */
> /* optional: brief block (100ms), use whatever loaded by then — may never use web font */
>
> /* Best choice depends on context:
>    - swap: large body text where readability > consistency
>    - block: short headings where flash is jarring
>    - optional: secondary text on slow connections (don't waste their bandwidth)
> */
>
> // next/font default is 'swap' but you should override per context:
> const inter = Inter({ subsets: ['latin'], display: 'optional' });  // for body text
> const playfair = Playfair_Display({ subsets: ['latin'], display: 'block' });  // for headings
> \`\`\`

**Q4: How does next/font integrate with Tailwind CSS?**
> **A:** Use the variable option to expose the font as a CSS custom property: const inter = Inter({ variable: '--font-inter' }). Apply the variable to the html or body element: <html className={inter.variable}>. Then in tailwind.config.js: theme.fontFamily.sans = ['var(--font-inter)', 'sans-serif']. Now className="font-sans" uses Inter via the CSS variable. For multiple fonts: add multiple variables (--font-inter, --font-playfair), reference them in Tailwind's fontFamily as separate keys (sans, serif). This pattern is the canonical Tailwind + next/font integration.

**Q5: FAANG-grade definition of next/font.**
> **A:** "Next.js next/font (next/font/google and next/font/local) downloads font files at build time and self-hosts them — eliminating runtime fetches to fonts.googleapis.com (privacy, performance, no DNS+TLS round-trip) — automatic subsetting to required character ranges via Unicode-range subsets — preloading critical fonts via <link rel='preload'> for above-the-fold LCP — eliminating CLS via size-adjust + ascent-override + descent-override + line-gap-override CSS descriptors making fallback fonts metrically identical to web fonts — supporting variable fonts with weight axis interpolation — exposing CSS variables for design system integration with Tailwind — and configurable font-display strategy (swap, block, fallback, optional) per font for FOUT/FOIT trade-off tuning."`,

    build: `## BUILD

### 🏗️ Mini Project: Design System Fonts — Body, Heading, Monospace, Variable + Custom Local Font

**What you will build:** A complete typography system: Inter for body (variable), Playfair Display for headings, JetBrains Mono for code, and a custom local font — all integrated with Tailwind, zero CLS, optimised loading.
**Why this project:** Forces every next/font pattern.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest fonts-demo --typescript --tailwind --app
mkdir -p src/fonts
# Place a custom font file in src/fonts/Brand-Bold.woff2
\`\`\`

#### Step 2 — Font Definitions
\`\`\`typescript
// src/lib/fonts.ts
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';

// Variable font — single file, all weights interpolatable
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  // Optional: limit weights to reduce file size
  weight: ['400', '500', '600', '700'],
});

// Serif heading font — fewer weights needed
export const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'block',  // headings -- avoid FOUT
  variable: '--font-playfair',
  weight: ['700', '900'],
});

// Monospace for code
export const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

// Custom local font with all metrics overrides for CLS prevention
export const brandFont = localFont({
  src: [
    { path: '../fonts/Brand-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Brand-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-brand',
  display: 'swap',
  // Adjust fallback font metrics to match Brand font
  // Generates from https://leerob.io/blog/fonts or fontsource tools
  adjustFontFallback: 'Arial',
});
\`\`\`

#### Step 3 — Apply Fonts to Root Layout
\`\`\`typescript
// src/app/layout.tsx
import { inter, playfair, jetBrainsMono, brandFont } from '@/lib/fonts';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      // Apply all font variables to html so they cascade
      className={\`\${inter.variable} \${playfair.variable} \${jetBrainsMono.variable} \${brandFont.variable}\`}
    >
      {/* font-sans is Inter (via Tailwind config below) */}
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
\`\`\`

#### Step 4 — Tailwind Configuration
\`\`\`javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // className="font-sans" -> Inter
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        // className="font-serif" -> Playfair Display
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        // className="font-mono" -> JetBrains Mono
        mono: ['var(--font-mono)', 'Menlo', 'monospace'],
        // className="font-brand" -> Brand custom font
        brand: ['var(--font-brand)', 'Arial', 'sans-serif'],
      },
    },
  },
};
\`\`\`

#### Step 5 — Showcase Page + Performance Verification
\`\`\`typescript
// src/app/page.tsx
export default function FontShowcase() {
  return (
    <main className="max-w-3xl mx-auto p-8 space-y-8">
      <section>
        <h1 className="font-serif text-5xl font-black mb-2">
          Playfair Display Heading
        </h1>
        <p className="font-sans text-lg text-gray-600">
          Inter body text — the workhorse of modern design systems.
        </p>
      </section>

      <section>
        <h2 className="font-brand text-3xl font-bold mb-3">Custom Brand Font</h2>
        <p className="font-sans">
          Local fonts loaded with metrics override for zero CLS.
        </p>
      </section>

      <section>
        <h2 className="font-sans text-2xl font-semibold mb-3">Code Sample</h2>
        <pre className="font-mono text-sm bg-gray-900 text-gray-100 p-4 rounded">
{\`const greet = (name: string) => {
  console.log(\\\`Hello, \\\${name}\\\`);
};\`}
        </pre>
      </section>

      <section>
        <h2 className="font-sans text-2xl font-semibold mb-3">Variable Font Weights</h2>
        {[300, 400, 500, 600, 700, 800].map(weight => (
          <p key={weight} className="font-sans" style={{ fontWeight: weight }}>
            Inter at weight {weight} — interpolated from variable font
          </p>
        ))}
      </section>
    </main>
  );
}

// Verification:
// 1. View page source -> no link to fonts.googleapis.com
// 2. Network tab -> fonts served from /_next/static/media/ (self-hosted)
// 3. Lighthouse -> CLS 0, fast LCP
// 4. DevTools -> Computed font-family resolves to Inter (not fallback)
\`\`\`

**Expected Output:**
\`\`\`
Build: fonts downloaded at build time, bundled in /_next/static/media/
Page source: no <link href="fonts.googleapis.com">
Network: zero requests to fonts.googleapis.com or fonts.gstatic.com
Lighthouse CLS: 0 (size-adjust prevents shift)
LCP font: served from same origin (no cross-origin handshake)
\`\`\`

**Stretch Challenges:**
- [ ] Generate exact fallback font metrics using @capsizecss/metrics
- [ ] Add a font preview page with all available font weights
- [ ] Measure FCP improvement vs Google Fonts CDN`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Five things next/font does automatically?
**Q2:** Difference between FOUT and FOIT?
**Q3:** Write next/font/google import for Inter with variable. From memory.

### Day 3 — Comprehension
**Q4:** How does next/font prevent CLS from font loading?
**Q5:** A PR uses <link rel="stylesheet" href="fonts.googleapis.com"> — explain why this is worse.
**Q6:** When should you use display: 'block' vs 'swap'?

### Day 7 — Application
**Q7:** Build a Tailwind config using three next/font fonts via CSS variables.
**Q8:** A PR's font file is 800KB — explain subsetting and how to reduce it.
**Q9:** How does next/font integrate with GDPR compliance?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain font loading optimisation — FOUT, FOIT, CLS, and how next/font solves them."
**Q11:** Draw: font loading timeline — request → fallback render → swap → final render.
**Q12:** ★ System design: "Design typography for a multi-brand SaaS — per-tenant fonts, design tokens, dark mode."`
  },

  // ── 23. nextjs-metadata ───────────────────────────────────────────────────
  'nextjs-metadata': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Metadata Like I'm 10 Years Old
> Metadata is the data ABOUT your page that search engines (Google), social platforms (Twitter, Facebook), and browsers use to understand your content. Next.js generates the <head> tags from JavaScript objects exported from your page or layout files. Static metadata: export const metadata = { title: 'My Page', description: '...' }. Dynamic metadata (based on route params, DB data): export async function generateMetadata({ params }) { const post = await fetchPost(params.id); return { title: post.title, openGraph: { ... } } }. The non-obvious depth: metadata cascades and merges through layouts — a root layout sets default title template ('%s | DevApp'), each page provides just the title ('Settings'), and the final rendered title is 'Settings | DevApp'. This DRY pattern prevents repeating the brand name in every page's metadata.

---

### 5 Deep Conceptual Questions

**Q1: What is the metadata title template and how does it cascade?**
> **A:** export const metadata = { title: { template: '%s | DevApp', default: 'DevApp - Build Faster' } }. Child pages export const metadata = { title: 'Pricing' } — the rendered <title> is 'Pricing | DevApp'. If a child page has no title, the layout's default ('DevApp - Build Faster') is used. Templates apply at every layout level: root layout has '%s | DevApp', dashboard layout overrides with '%s | Dashboard | DevApp', settings page provides 'Account' → final is 'Account | Dashboard | DevApp'. This DRY pattern keeps brand consistent without duplication.

**Q2: Mental model for OpenGraph vs Twitter cards?**
> **A:** OpenGraph (Facebook's standard, used by most platforms): openGraph: { title, description, images, type, locale, siteName }. Twitter cards (Twitter-specific): twitter: { card: 'summary_large_image', title, description, images }. Most platforms fall back to OG if no Twitter card, so OG alone covers 80% of social sharing. For best results, provide both: OG for general use, Twitter overrides for Twitter-specific formatting. Image dimensions matter: 1200×630 for OG (1.91:1 ratio), 1200×630 or 1200×600 for Twitter — wrong ratios get cropped poorly.

**Q3: Most dangerous misconception about metadata?**
> **A:** Client-side metadata changes work for SEO:
> \`\`\`typescript
> // WRONG: useEffect to set document.title after page load
> 'use client';
> import { useEffect } from 'react';
> export default function Page() {
>   useEffect(() => { document.title = 'Dynamic Title'; }, []);
>   return <div>...</div>;
> }
> // Google's crawler sees the initial server-rendered <title> — your dynamic title is invisible
> // Social media scrapers (Facebook, Twitter) don't execute JavaScript at all
> // Result: posts shared show the wrong title and no preview image
>
> // CORRECT: use generateMetadata in Server Components
> export async function generateMetadata({ params }) {
>   const product = await fetchProduct(params.id);
>   return { title: product.name, description: product.description };
> }
> // Rendered server-side — visible to crawlers and scrapers
> \`\`\`

**Q4: How do you implement a dynamic OG image?**
> **A:** Create app/og/route.tsx using ImageResponse from next/og:
> import { ImageResponse } from 'next/og';
> export async function GET(request) {
>   const { searchParams } = new URL(request.url);
>   const title = searchParams.get('title') ?? 'DevApp';
>   return new ImageResponse(
>     <div style={{ background: 'linear-gradient(...)', width: 1200, height: 630 }}>
>       <h1 style={{ fontSize: 60 }}>{title}</h1>
>     </div>,
>     { width: 1200, height: 630 }
>   );
> }
> Then in page metadata: openGraph: { images: ['/og?title=My Post'] }. Each shared link gets a custom-generated image with the post title rendered onto a branded background — automated and dynamic.

**Q5: FAANG-grade definition of Next.js metadata.**
> **A:** "Next.js metadata API is a file-system-aware <head> generator — exporting either static metadata (constant object) or generateMetadata (async function receiving params and parent metadata) from layout.tsx or page.tsx — supporting title templates with %s placeholder for DRY layered branding — full OpenGraph, Twitter cards, Robots, alternates (canonical/hreflang), and JSON-LD structured data — dynamic OG image generation via next/og's ImageResponse using JSX with edge-runtime Satori for sub-second image rendering — automatic merging across nested layouts (child overrides parent, templates cascade) — and server-side rendering ensuring SEO crawlers and social scrapers receive the correct tags without JavaScript execution."`,

    build: `## BUILD

### 🏗️ Mini Project: SEO-Optimised Blog — Static + Dynamic Metadata + Dynamic OG Images + Sitemap

**What you will build:** A blog with: root metadata template, per-post generateMetadata with OG/Twitter, dynamic OG image generation, automatic sitemap.xml, robots.txt, and JSON-LD structured data.
**Why this project:** Forces every SEO and metadata pattern.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest seo-demo --typescript --tailwind --app
\`\`\`

#### Step 2 — Root Layout With Metadata Template
\`\`\`typescript
// src/app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://devapp.example.com'),  // resolves relative URLs
  title: {
    template: '%s | DevApp Blog',
    default: 'DevApp Blog - Engineering Insights',
  },
  description: 'Production engineering articles for senior developers.',
  authors: [{ name: 'DevApp Team' }],
  keywords: ['Next.js', 'React', 'TypeScript', 'engineering'],
  openGraph: {
    type: 'website',
    siteName: 'DevApp Blog',
    locale: 'en_US',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@devapp',
    creator: '@devapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
\`\`\`

#### Step 3 — Dynamic Post Metadata
\`\`\`typescript
// src/app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Post { slug: string; title: string; excerpt: string; author: string; date: string; tags: string[]; }

async function getPost(slug: string): Promise<Post | null> {
  // Fetch from CMS/DB
  return {
    slug, title: 'How Server Components Changed Everything',
    excerpt: 'A deep dive into React Server Components in production.',
    author: 'Ana Dev', date: '2025-03-15',
    tags: ['react', 'server-components', 'next.js'],
  };
}

interface Props { params: { slug: string }; }

// Dynamic metadata based on the post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Not Found' };

  return {
    title: post.title,                          // -> 'How Server Components... | DevApp Blog'
    description: post.excerpt,
    authors: [{ name: post.author }],
    keywords: post.tags,
    alternates: {
      canonical: \`/blog/\${post.slug}\`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [{
        url: \`/api/og?title=\${encodeURIComponent(post.title)}&author=\${encodeURIComponent(post.author)}\`,
        width: 1200, height: 630,
        alt: post.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [\`/api/og?title=\${encodeURIComponent(post.title)}\`],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  // JSON-LD structured data for Google's rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    author: { '@type': 'Person', name: post.author },
    datePublished: post.date,
    keywords: post.tags.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <p className="text-gray-500 mt-2">By {post.author} on {post.date}</p>
        <p className="mt-4">{post.excerpt}</p>
      </article>
    </>
  );
}
\`\`\`

#### Step 4 — Dynamic OG Image Generator
\`\`\`typescript
// src/app/api/og/route.tsx
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';  // fast, global

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') ?? 'DevApp Blog';
  const author = searchParams.get('author') ?? '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #6366f1 100%)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          padding: 80, color: 'white',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
          {title}
        </div>
        {author && (
          <div style={{ fontSize: 32, marginTop: 30, opacity: 0.8 }}>
            by {author}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 40, right: 40, fontSize: 28 }}>
          devapp.example.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
\`\`\`

#### Step 5 — Sitemap + Robots + Tests
\`\`\`typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = [{ slug: 'rsc' }, { slug: 'streaming' }];  // fetch from DB

  return [
    { url: 'https://devapp.example.com', lastModified: new Date(), priority: 1.0 },
    { url: 'https://devapp.example.com/blog', lastModified: new Date(), priority: 0.8 },
    ...posts.map(p => ({
      url: \`https://devapp.example.com/blog/\${p.slug}\`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}

// src/app/robots.ts
import { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api'] },
    ],
    sitemap: 'https://devapp.example.com/sitemap.xml',
  };
}

// Tests
import { generateMetadata } from '@/app/blog/[slug]/page';
it('generates correct OG metadata', async () => {
  const meta = await generateMetadata({ params: { slug: 'rsc' } });
  expect(meta.title).toContain('Server Components');
  expect(meta.openGraph?.type).toBe('article');
});
\`\`\`

**Expected Output:**
\`\`\`
View source /blog/rsc:
  <title>How Server Components Changed Everything | DevApp Blog</title>
  <meta property="og:image" content="/api/og?title=...">
  <script type="application/ld+json">{...}</script>
GET /api/og?title=Test -> 1200x630 PNG image (dynamic)
GET /sitemap.xml -> XML sitemap with all URLs
GET /robots.txt -> robots rules
Share URL on Twitter -> beautiful card with title and image
Tests: 1 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add hreflang alternates for i18n SEO
- [ ] Generate sitemap dynamically from DB at request time
- [ ] Add breadcrumb JSON-LD structured data`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between static metadata and generateMetadata?
**Q2:** What is the %s template syntax?
**Q3:** Write generateMetadata for a blog post page. From memory.

### Day 3 — Comprehension
**Q4:** Why doesn't client-side document.title work for SEO?
**Q5:** A PR uses useEffect to set OG tags — diagnose why social previews are broken.
**Q6:** What does metadataBase enable?

### Day 7 — Application
**Q7:** Build a dynamic OG image generator with branded design.
**Q8:** A PR sets robots: { index: false } in root metadata — explain the SEO catastrophe.
**Q9:** How does JSON-LD structured data improve search results?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain Next.js metadata API — cascading, dynamic generation, and SEO best practices."
**Q11:** Draw: metadata cascade from root → layout → page with title template merging.
**Q12:** ★ System design: "Design SEO architecture for a multi-language news site — hreflang, sitemaps, structured data, dynamic OG images."`
  },

  // ── 24. nextjs-performance ────────────────────────────────────────────────
  'nextjs-performance': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Performance Like I'm 10 Years Old
> Next.js performance optimisation centers on improving Core Web Vitals: LCP (Largest Contentful Paint — when main content appears), CLS (Cumulative Layout Shift — visual stability), and INP (Interaction to Next Paint — responsiveness). The main techniques: (1) Push computation to the SERVER (Server Components have zero client bundle). (2) STREAM with Suspense (fast content appears before slow). (3) Use next/image and next/font (optimise the biggest assets). (4) DYNAMIC IMPORT heavy client-only libraries (chart libraries, code editors — load only when needed). (5) Pre-render static pages (SSG) and ISR (avoid SSR for cacheable content). (6) Use the Bundle Analyzer to find bloat. The non-obvious depth: the SINGLE biggest performance win in most Next.js apps is moving components from Client to Server — a 50KB Client Component that becomes a Server Component removes 50KB from the user's download. Audit your 'use client' usage ruthlessly.

---

### 5 Deep Conceptual Questions

**Q1: What is the order of optimisation priorities for Core Web Vitals?**
> **A:** (1) ELIMINATE render-blocking resources: inline critical CSS (Next.js does automatically), defer non-critical JS (Next.js does for Server Component bundles). (2) OPTIMISE LCP: use next/image with priority on hero, use SSG/ISR (server pre-renders in <50ms), prefetch likely next pages with Link. (3) FIX CLS: dimensions on images, size-adjust fonts, reserve space for ads/embeds. (4) IMPROVE INP: reduce JS bundle size (move to Server Components), use useTransition for non-blocking updates, avoid expensive synchronous work in event handlers. (5) Use Lighthouse + Real User Monitoring (Vercel Analytics or Sentry) to identify bottlenecks.

**Q2: Mental model for the JavaScript bundle?**
> **A:** The browser must DOWNLOAD, PARSE, COMPILE, and EXECUTE JavaScript before the page is interactive. A 500KB bundle on a slow 3G connection takes 5 seconds to download. On a mid-range phone, parsing+executing takes another 2-3 seconds. Result: page is uninteractive for 7+ seconds. The fix: minimise the bundle. Server Components eliminate components from the bundle entirely. Dynamic import (next/dynamic) splits the bundle so heavy code loads only when needed. Tree-shaking removes unused exports. Bundle Analyzer shows what's actually in your bundle — usually 20% of dependencies cause 80% of size.

**Q3: Most dangerous misconception about performance?**
> **A:** "use client" has no performance cost if the component is small:
> \`\`\`typescript
> // WRONG: small Client Component imports a big library
> 'use client';
> import { format } from 'date-fns';  // 70KB!
> import { z } from 'zod';            // 50KB!
> import _ from 'lodash';             // 70KB!
>
> export function TinyDisplay({ date }: { date: Date }) {
>   return <span>{format(date, 'PPP')}</span>;
> }
> // This 5-line component adds 190KB to the client bundle
> // Plus EVERY import in this file (and its imports) becomes client code
>
> // CORRECT options:
> // 1. Make it a Server Component (formatting happens server-side, zero client JS):
>    export function TinyDisplay({ date }: { date: Date }) {
>      return <span>{format(date, 'PPP')}</span>;  // no 'use client'
>    }
> //
> // 2. If interactivity required, pass formatted string from Server Component:
>    // Server Component: <Tiny formatted={format(date, 'PPP')} />
>    // Client: function Tiny({ formatted }: { formatted: string }) { return <span>{formatted}</span> }
> \`\`\`

**Q4: How does next/dynamic improve performance?**
> **A:** next/dynamic splits a component into a separate chunk that loads on-demand. const HeavyChart = dynamic(() => import('./HeavyChart'), { loading: () => <Skeleton />, ssr: false }). The chart's 200KB only downloads when the component renders, not on initial page load. Use cases: charts (recharts, chart.js — 100-300KB), rich text editors (TipTap, Lexical — 100-500KB), date pickers, code editors, modals/dialogs not visible by default. Pair with intersection observer for "load when scrolled into view". For SSR-incompatible libraries (those using window/document), use ssr: false.

**Q5: FAANG-grade definition of Next.js performance optimisation.**
> **A:** "Next.js performance optimisation prioritises Core Web Vitals — LCP, CLS, INP — through Server Components reducing client bundle size (zero JS for non-interactive content), Suspense-based streaming SSR for sub-100ms TTFB, next/image and next/font for optimised assets with CLS prevention via dimension/metric overrides, next/dynamic for code splitting heavy client components, route prefetching via Link in production, ISR/SSG for sub-50ms cached responses, edge runtime for globally-distributed handlers, fetch caching for backend deduplication, route segment config (dynamic, revalidate) for fine-grained caching control — measured via @next/bundle-analyzer for bundle audits, Lighthouse for synthetic testing, and Vercel Analytics/Sentry for Real User Monitoring (RUM) — with the highest-impact optimisation being aggressive Server Component adoption to eliminate unnecessary client-side JavaScript."`,

    build: `## BUILD

### 🏗️ Mini Project: Performance Audit Suite — Bundle Analyzer + Dynamic Import + Server Conversion

**What you will build:** A performance baseline app, then apply 5 optimisations (Server Component conversion, dynamic import, next/image, font optimisation, Suspense streaming) and measure each one's impact with Lighthouse.
**Why this project:** Forces the measure → optimise → measure cycle.
**Time estimate:** 50 minutes

---

#### Step 1 — Setup With Bundle Analyzer
\`\`\`bash
npx create-next-app@latest perf-demo --typescript --tailwind --app
npm install @next/bundle-analyzer date-fns lodash recharts
\`\`\`

\`\`\`javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({
  // ... other config
});
\`\`\`

#### Step 2 — Baseline Slow Page
\`\`\`typescript
// src/app/dashboard/page.tsx  (BEFORE optimisation — 400KB bundle)
'use client';  // BAD: makes everything client
import { format, formatDistance } from 'date-fns';     // 70KB
import _ from 'lodash';                                 // 70KB
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';  // 300KB
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);

  const formatted = data.map(d => ({
    ...d,
    formattedDate: format(new Date(d.date), 'PPP'),
  }));

  return (
    <div className="p-8">
      <h1>Dashboard</h1>
      <LineChart width={600} height={300} data={formatted}>
        <Line type="monotone" dataKey="value" />
        <XAxis dataKey="formattedDate" />
        <YAxis />
        <Tooltip />
      </LineChart>
      <ul>
        {_.orderBy(formatted, 'value', 'desc').slice(0, 5).map((d, i) => (
          <li key={i}>{d.formattedDate}: {d.value}</li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

#### Step 3 — Optimised Version
\`\`\`typescript
// src/app/dashboard/page.tsx  (AFTER — ~50KB bundle)
import { Suspense } from 'react';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { DashboardList } from './DashboardList';  // Server Component

// Heavy chart loaded on-demand
const Chart = dynamic(() => import('./Chart'), {
  loading: () => <div className="h-72 bg-gray-100 animate-pulse rounded" />,
  ssr: false,  // recharts uses window
});

async function getData() {
  // Direct DB / server fetch
  return [
    { date: '2025-03-01', value: 120 },
    { date: '2025-03-02', value: 150 },
    { date: '2025-03-03', value: 180 },
  ];
}

export default async function DashboardPage() {
  const data = await getData();
  const formatted = data.map(d => ({
    ...d,
    formattedDate: format(new Date(d.date), 'PPP'),
  }));

  return (
    <div className="p-8">
      <h1>Dashboard</h1>
      {/* Chart is dynamically imported — 300KB stays out of initial bundle */}
      <Suspense fallback={<div className="h-72 bg-gray-100 animate-pulse" />}>
        <Chart data={formatted} />
      </Suspense>
      {/* List is Server Component — zero client JS */}
      <DashboardList data={formatted} />
    </div>
  );
}

// src/app/dashboard/DashboardList.tsx  -- Server Component
interface Props { data: Array<{ formattedDate: string; value: number }>; }

export function DashboardList({ data }: Props) {
  // Sort server-side — no lodash on client
  const top5 = [...data].sort((a, b) => b.value - a.value).slice(0, 5);

  return (
    <ul className="mt-4 space-y-1">
      {top5.map((d, i) => (
        <li key={i}>{d.formattedDate}: {d.value}</li>
      ))}
    </ul>
  );
}

// src/app/dashboard/Chart.tsx  -- only loaded when needed
'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
export default function Chart({ data }: { data: any[] }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <Line type="monotone" dataKey="value" />
      <XAxis dataKey="formattedDate" />
      <YAxis />
      <Tooltip />
    </LineChart>
  );
}
\`\`\`

#### Step 4 — Web Vitals Reporting
\`\`\`typescript
// src/app/layout.tsx -- add Web Vitals tracking
import { WebVitals } from './_components/WebVitals';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <WebVitals />
        {children}
      </body>
    </html>
  );
}

// src/app/_components/WebVitals.tsx
'use client';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals(metric => {
    // Send to analytics
    console.log('[Vitals]', metric.name, metric.value, metric.rating);
    // In production: send to Vercel Analytics, Sentry, or your own endpoint
    // fetch('/api/vitals', { method: 'POST', body: JSON.stringify(metric) });
  });
  return null;
}
\`\`\`

#### Step 5 — Audit and Compare
\`\`\`bash
# Generate bundle analysis
ANALYZE=true npm run build
# Opens browser windows showing client/server bundle treemaps

# Run Lighthouse
npm run build && npm start
npx lighthouse http://localhost:3000/dashboard --view --only-categories=performance

# Expected metrics:
# BEFORE: Performance 35, LCP 4.2s, INP 280ms, bundle 400KB
# AFTER:  Performance 95, LCP 0.8s, INP 50ms, bundle 50KB
\`\`\`

**Expected Output:**
\`\`\`
Bundle analyzer: chart code in separate chunk (recharts.chunk.js)
Lighthouse Performance: 95+
LCP: <1s (server-rendered list appears immediately)
INP: <100ms (small client bundle parses quickly)
Web Vitals console logs: all "good" ratings
Chart loads only when component renders (Network tab shows lazy load)
\`\`\`

**Stretch Challenges:**
- [ ] Add a /api/vitals endpoint that stores RUM data in a DB
- [ ] Set up Vercel Analytics or Sentry RUM
- [ ] Implement route-level Suspense for sub-route streaming`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Three Core Web Vitals and their thresholds?
**Q2:** What is the single biggest performance win in most Next.js apps?
**Q3:** Write next/dynamic with a loading fallback. From memory.

### Day 3 — Comprehension
**Q4:** How does a small Client Component add KB to the bundle?
**Q5:** A PR adds 'use client' to a page just to use date-fns formatting — refactor.
**Q6:** When should you use ssr: false in dynamic imports?

### Day 7 — Application
**Q7:** Audit a Next.js app with Bundle Analyzer and identify 3 optimisation opportunities.
**Q8:** A PR's LCP is 4.5s due to a large hero image — fix with next/image + priority.
**Q9:** How does Suspense streaming improve perceived performance?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through optimising a slow Next.js page — what tools, what techniques, what order?"
**Q11:** Draw: performance impact stack — Server Components > Streaming > Image/Font > Dynamic Import > Bundle Audit.
**Q12:** ★ System design: "Design a performance monitoring system for a multi-page Next.js app — RUM, alerts, regression detection."`
  },

  // ── 25. nextjs-testing ────────────────────────────────────────────────────
  'nextjs-testing': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Testing Like I'm 10 Years Old
> Next.js testing uses three layers: (1) UNIT TESTS with Vitest/Jest — test pure functions, utilities, and individual components in isolation (fastest, run on every save). (2) INTEGRATION TESTS with React Testing Library — render components with realistic props, simulate user interactions, verify DOM (moderate speed). (3) E2E TESTS with Playwright — drive a real browser, navigate routes, click buttons, fill forms, verify entire flows work (slowest, most confidence). The non-obvious depth: testing Server Components is different from testing Client Components. Server Components are async functions — you can test them by calling them directly and asserting on the returned JSX. They don't need a browser environment because they don't use hooks or events. Client Components need RTL's render() inside a DOM environment (jsdom or happy-dom). Always co-locate tests next to source files (Component.tsx + Component.test.tsx) — easier to find, more likely to be maintained.

---

### 5 Deep Conceptual Questions

**Q1: How do you test Server Components?**
> **A:** Server Components are async functions returning JSX — test them like any async function: call them, await the result, assert on the returned React tree. Example: const result = await PostsPage({ searchParams: { category: 'books' } }); — result is a React element. Assertions: expect(result.props.children[0].type).toBe('h1'). For more readable tests, use React Testing Library's render() with the awaited result — works because RTL renders any React element. For data fetching mocks, use Vitest's vi.mock or Jest's jest.mock to stub the DB/API layer the Server Component imports.

**Q2: Mental model for testing pyramid in Next.js?**
> **A:** UNIT (70%): pure functions, utility libraries, individual components without DB/API. Fast (<10ms each), no setup, run continuously during development. INTEGRATION (25%): Server Components with mocked DB, Server Actions with mocked DB, multi-component flows. Moderate (50-500ms each), some setup, run on commit. E2E (5%): critical user journeys (login → buy → checkout) in a real browser against a real DB. Slow (5-30s each), expensive setup, run in CI. Most bugs come from integration — UNDER-investing in integration tests is the most common mistake. Test the SEAMS between units, not just the units themselves.

**Q3: Most dangerous misconception about testing?**
> **A:** Tests can use the same mock as the implementation:
> \`\`\`typescript
> // WRONG: test that just checks the mock is called
> import { sendEmail } from '@/lib/email';
> vi.mock('@/lib/email');
>
> it('sends welcome email on signup', async () => {
>   await signupAction(formData);
>   expect(sendEmail).toHaveBeenCalledWith('welcome@user.com', 'Welcome');
> });
> // This tests NOTHING — the mock is the test
> // If the implementation calls sendEmail wrong, the test still passes
> // because the mock doesn't enforce the email is valid
>
> // CORRECT: use a fake implementation OR test against real-ish infrastructure
> vi.mock('@/lib/email', () => ({
>   sendEmail: vi.fn().mockImplementation((to, subject) => {
>     if (!to.includes('@')) throw new Error('Invalid email');  // validates inputs
>     emails.push({ to, subject });  // records calls in a way you can verify
>     return Promise.resolve({ id: 'msg_123' });
>   }),
> }));
>
> // Even better: integration test with a fake SMTP server (MailHog) or test mode
> \`\`\`

**Q4: How do you test Server Actions?**
> **A:** Server Actions are async functions — test them directly. For form-action signature: const result = await updateAction({ status: 'idle' }, formData);. Mock the DB layer (e.g., Prisma) via vi.mock. Test: validation errors return { status: 'error', errors: {...} }, success returns { status: 'success' }, authorisation throws on invalid user. For end-to-end: use Playwright to fill the form in a browser, submit, verify the server-rendered response. Both approaches are valuable: unit tests for logic, E2E for the full flow.

**Q5: FAANG-grade definition of Next.js testing strategy.**
> **A:** "Next.js testing combines Vitest/Jest for unit and integration tests (fast iteration, jsdom/happy-dom environment, vi.mock for module-level stubs), React Testing Library for user-centric DOM assertions on Client Components, direct async invocation for Server Component testing (await Component(props) returns React elements), Server Action testing with mocked database layer (Prisma, Drizzle), Playwright for E2E browser automation (real DB, real auth flow, multiple browsers), MSW (Mock Service Worker) for API mocking at network level, Lighthouse CI for performance regression detection in pipeline, and visual regression via Playwright screenshots — with co-located test files (Component.tsx + Component.test.tsx) following the 70/25/5 testing pyramid distribution to balance feedback speed against confidence depth."`,

    build: `## BUILD

### 🏗️ Mini Project: Full Test Suite — Unit + Server Component + Server Action + E2E

**What you will build:** A todos app with: Vitest unit tests for utilities, RTL integration tests for Client Components, direct invocation tests for Server Components, Server Action tests, and Playwright E2E tests covering the full happy path.
**Why this project:** Forces every Next.js testing pattern in one suite.
**Time estimate:** 50 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest test-demo --typescript --tailwind --app
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test
npx playwright install chromium
\`\`\`

\`\`\`typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});

// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
\`\`\`

#### Step 2 — Unit Test (Utility Function)
\`\`\`typescript
// src/lib/todos.ts
export interface Todo { id: number; text: string; done: boolean; }

export function filterTodos(todos: Todo[], filter: 'all' | 'active' | 'done'): Todo[] {
  if (filter === 'active') return todos.filter(t => !t.done);
  if (filter === 'done') return todos.filter(t => t.done);
  return todos;
}

// src/lib/todos.test.ts
import { describe, it, expect } from 'vitest';
import { filterTodos } from './todos';

describe('filterTodos', () => {
  const todos = [
    { id: 1, text: 'A', done: false },
    { id: 2, text: 'B', done: true },
    { id: 3, text: 'C', done: false },
  ];

  it('returns all by default', () => {
    expect(filterTodos(todos, 'all')).toHaveLength(3);
  });

  it('returns only active', () => {
    const active = filterTodos(todos, 'active');
    expect(active).toHaveLength(2);
    expect(active.every(t => !t.done)).toBe(true);
  });

  it('returns only done', () => {
    const done = filterTodos(todos, 'done');
    expect(done).toHaveLength(1);
    expect(done[0].id).toBe(2);
  });
});
\`\`\`

#### Step 3 — Integration Test (Client Component With User Interaction)
\`\`\`typescript
// src/components/TodoInput.tsx
'use client';
import { useState } from 'react';

interface Props { onAdd: (text: string) => void; }

export function TodoInput({ onAdd }: Props) {
  const [text, setText] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText('');
  };

  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="What needs to be done?"
        className="flex-1 px-3 py-2 border rounded"
      />
      <button onClick={submit} className="px-4 py-2 bg-blue-500 text-white rounded">
        Add
      </button>
    </div>
  );
}

// src/components/TodoInput.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoInput } from './TodoInput';

describe('TodoInput', () => {
  it('calls onAdd when button clicked', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TodoInput onAdd={onAdd} />);

    await user.type(screen.getByPlaceholderText(/what needs to be done/i), 'Buy milk');
    await user.click(screen.getByText('Add'));

    expect(onAdd).toHaveBeenCalledWith('Buy milk');
  });

  it('clears input after submit', async () => {
    const user = userEvent.setup();
    render(<TodoInput onAdd={vi.fn()} />);
    const input = screen.getByPlaceholderText(/what needs to be done/i) as HTMLInputElement;
    await user.type(input, 'Test');
    await user.keyboard('{Enter}');
    expect(input.value).toBe('');
  });

  it('does not call onAdd for empty input', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TodoInput onAdd={onAdd} />);
    await user.click(screen.getByText('Add'));
    expect(onAdd).not.toHaveBeenCalled();
  });
});
\`\`\`

#### Step 4 — Server Component + Server Action Tests
\`\`\`typescript
// src/app/todos/page.tsx
import { getAllTodos } from '@/lib/db';

export default async function TodosPage() {
  const todos = await getAllTodos();
  return (
    <main>
      <h1>Todos ({todos.length})</h1>
      <ul>
        {todos.map(t => <li key={t.id}>{t.text}</li>)}
      </ul>
    </main>
  );
}

// src/app/todos/page.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TodosPage from './page';

vi.mock('@/lib/db', () => ({
  getAllTodos: vi.fn().mockResolvedValue([
    { id: 1, text: 'Test todo', done: false },
    { id: 2, text: 'Another', done: true },
  ]),
}));

describe('TodosPage (Server Component)', () => {
  it('renders todos from DB', async () => {
    // Server Components return JSX directly — await the async component
    const result = await TodosPage();
    render(result);

    expect(screen.getByText('Todos (2)')).toBeInTheDocument();
    expect(screen.getByText('Test todo')).toBeInTheDocument();
    expect(screen.getByText('Another')).toBeInTheDocument();
  });
});

// src/app/todos/actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addTodoAction } from './actions';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

const dbStub = { insert: vi.fn() };
vi.mock('@/lib/db', () => ({
  db: { prepare: (sql: string) => ({ run: dbStub.insert }) },
}));

describe('addTodoAction', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects empty text', async () => {
    const fd = new FormData();
    fd.set('text', '');
    const result = await addTodoAction({ status: 'idle' }, fd);
    expect(result.status).toBe('error');
    expect(dbStub.insert).not.toHaveBeenCalled();
  });

  it('inserts valid text', async () => {
    const fd = new FormData();
    fd.set('text', 'Valid todo');
    const result = await addTodoAction({ status: 'idle' }, fd);
    expect(result.status).toBe('success');
    expect(dbStub.insert).toHaveBeenCalledWith('Valid todo');
  });
});
\`\`\`

#### Step 5 — E2E Playwright Test
\`\`\`typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run build && npm start',
    port: 3000,
    timeout: 60_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
  },
});

// e2e/todos.spec.ts
import { test, expect } from '@playwright/test';

test('full todo flow — add, complete, delete', async ({ page }) => {
  await page.goto('/todos');

  // Verify initial state
  await expect(page.locator('h1')).toContainText('Todos');

  // Add a new todo
  await page.fill('input[placeholder*="What needs"]', 'E2E test todo');
  await page.click('button:has-text("Add")');

  // Verify it appears
  await expect(page.locator('text=E2E test todo')).toBeVisible();

  // Mark complete
  await page.locator('text=E2E test todo').locator('..').locator('input[type=checkbox]').check();

  // Verify checked
  await expect(page.locator('text=E2E test todo').locator('..').locator('input[type=checkbox]'))
    .toBeChecked();

  // Delete
  await page.locator('text=E2E test todo').locator('..').locator('button:has-text("×")').click();
  await expect(page.locator('text=E2E test todo')).not.toBeVisible();
});
\`\`\`

**Expected Output:**
\`\`\`
npm test                  -> 9 unit/integration tests pass in <1s
npx playwright test       -> 1 E2E test passes in ~5s
Coverage: 90%+ for components, 100% for utilities
CI/CD: all tests gate the deployment
\`\`\`

**Stretch Challenges:**
- [ ] Add MSW for mocking external API calls
- [ ] Add visual regression tests with Playwright screenshots
- [ ] Add Lighthouse CI to catch performance regressions`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Three testing layers and their approximate distribution?
**Q2:** How do you test a Server Component?
**Q3:** Write a Vitest test for a pure function. From memory.

### Day 3 — Comprehension
**Q4:** Why are mocks dangerous in tests?
**Q5:** A PR has 100 unit tests and 0 integration tests — diagnose the testing gap.
**Q6:** How do you test a Server Action with form-action signature?

### Day 7 — Application
**Q7:** Write a Playwright E2E test for a login → dashboard flow.
**Q8:** A flaky E2E test passes 50% of the time — diagnose root causes.
**Q9:** When should you use MSW vs vi.mock?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Design a testing strategy for a Next.js production app — pyramid, tools, CI/CD integration."
**Q11:** Draw: testing pyramid — Unit → Integration → E2E with example tests at each level.
**Q12:** ★ System design: "Set up the testing infrastructure for a 50-developer Next.js monorepo — speed, coverage, deployment gates, flaky test management."`
  },

  // ── 26. nextjs-deployment ─────────────────────────────────────────────────
  'nextjs-deployment': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Deployment Like I'm 10 Years Old
> Next.js produces three deployment targets: (1) STANDALONE Node.js server — runs the full Next.js runtime (SSR, ISR, API routes, middleware) on any Node.js host: Vercel, Render, AWS, your own server. (2) STATIC EXPORT (output: 'export') — pure HTML/CSS/JS files, deployable to any static host (S3 + CloudFront, GitHub Pages, Netlify) but LOSES SSR, ISR, API routes, image optimisation, middleware. (3) CONTAINER (Docker) — wraps standalone output in a Docker image for Kubernetes/ECS deployment. Vercel is Next.js's "native" platform — they built Next.js, so all features work out-of-the-box with zero configuration. Other platforms require care: Cloudflare needs Edge Runtime, AWS Lambda needs OpenNext, self-hosted needs a process manager (PM2) and reverse proxy (Nginx). The non-obvious depth: ENVIRONMENT VARIABLES that start with NEXT_PUBLIC_ are inlined into the CLIENT BUNDLE at build time — exposed to anyone viewing source. NEVER put API keys, secrets, or database URLs in NEXT_PUBLIC_ variables. Server-only variables (no prefix) are only available in Server Components, API routes, and middleware.

---

### 5 Deep Conceptual Questions

**Q1: What's the difference between Vercel, self-hosted Node, and serverless deployment?**
> **A:** VERCEL: serverless functions per route, edge network, automatic preview deployments per PR, CDN-cached static assets, zero config. Drawback: vendor lock-in, can be expensive at scale. SELF-HOSTED NODE: full control, one long-running process, lower per-request cost, you manage scaling/SSL/CDN. Drawback: more ops work, no auto-scaling without K8s/ECS. SERVERLESS (AWS Lambda via OpenNext): pay-per-request, automatic scaling, but cold starts hurt latency (~500ms) — mitigated with provisioned concurrency. Rule: use Vercel for prototypes and SaaS, self-hosted for cost-sensitive at scale, serverless for highly variable traffic.

**Q2: Mental model for environment variables in Next.js?**
> **A:** Three scopes: (1) PROCESS env (server only): DATABASE_URL, JWT_SECRET — available in Server Components, API routes, middleware. NEVER sent to client. (2) NEXT_PUBLIC_ prefix: inlined into client bundle at BUILD TIME. Example: NEXT_PUBLIC_GA_ID — visible in DevTools. Use for non-sensitive config (analytics IDs, public API URLs). (3) Runtime env (process.env at runtime in serverless): on Vercel, server env vars are available at request time. On Docker, you must pass them via -e VAR=value. Critical: if you change a NEXT_PUBLIC_ variable, you must REBUILD — they're baked into the bundle, not read at runtime.

**Q3: Most dangerous misconception about deployment?**
> **A:** All Next.js features work on every platform:
> \`\`\`typescript
> // WRONG: deploying to Cloudflare Pages without checking compatibility
> //
> // Cloudflare Pages requires Edge Runtime
> // -> next/image doesn't work (uses sharp, requires Node.js)
> // -> ISR doesn't work (no persistent file cache)
> // -> Server Actions only work in Edge Runtime mode
> // -> Many npm packages incompatible (no fs, no native modules)
> //
> // CORRECT: check the deployment target's compatibility BEFORE building
> // Vercel:          100% Next.js features work
> // Netlify:         95% (with the Next.js plugin)
> // Cloudflare:      Edge Runtime only, limited
> // AWS Lambda:      Use OpenNext (translation layer)
> // Self-hosted:     100% with output: 'standalone' + Node.js 20+
> // Docker:          100% with standalone output, configure properly
> \`\`\`

**Q4: How do you build an optimised production Docker image?**
> **A:** Use multi-stage build with output: 'standalone' in next.config.js (Next.js bundles only the deps the app actually uses, ~100MB image instead of ~1GB). Stage 1: install deps (npm ci). Stage 2: build the app (npm run build). Stage 3: copy only the standalone output, public assets, and the server.js entrypoint. Use a minimal base image (node:20-alpine, ~50MB). Set NODE_ENV=production. Run as a non-root user. Add HEALTHCHECK for orchestration. Result: production-ready image with optimal cold start and security.

**Q5: FAANG-grade definition of Next.js deployment strategy.**
> **A:** "Next.js deployment selects from three output modes: standalone Node.js server (next start, full feature support), static export (HTML/CSS/JS only, no SSR/API/ISR/image-opt), or containerised standalone via Docker — targeting platforms ranging from Vercel (native, zero-config, all features) to Cloudflare Pages (Edge Runtime only, limited APIs) to AWS Lambda via OpenNext (serverless adapter handling routing and image optimisation) to self-hosted with PM2 + Nginx — with environment variables scoped as server-only (process.env, never sent to client) or client-inlined (NEXT_PUBLIC_ prefix, build-time baked into the bundle, never use for secrets) — preview deployments per PR for review workflows — and observability via Vercel Analytics, Sentry, OpenTelemetry, or Prometheus depending on platform — chosen based on traffic patterns, cost constraints, feature requirements, and operational maturity."`,

    build: `## BUILD

### 🏗️ Mini Project: Production-Ready Deployment — Docker + Vercel Config + CI/CD

**What you will build:** Configure a Next.js app for deployment to Docker AND Vercel simultaneously: standalone output, multi-stage Dockerfile, vercel.json with security headers, environment variable management, GitHub Actions CI/CD.
**Why this project:** Forces every production deployment concern.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest deploy-demo --typescript --tailwind --app
\`\`\`

#### Step 2 — next.config.js for Production
\`\`\`javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Bundle only what the app uses — for Docker/self-host
  output: 'standalone',

  // Compress responses
  compress: true,

  // Disable x-powered-by header (security)
  poweredByHeader: false,

  // Image domains
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com' },
    ],
  },

  // Strict production checks
  reactStrictMode: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: \`default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.example.com\`,
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      { source: '/old-blog/:slug', destination: '/blog/:slug', permanent: true },
    ];
  },

  // Experimental features for production
  experimental: {
    optimizePackageImports: ['lodash', 'date-fns'],  // tree-shake more aggressively
  },
};

module.exports = nextConfig;
\`\`\`

#### Step 3 — Optimised Multi-Stage Dockerfile
\`\`\`dockerfile
# Dockerfile
# ───────── Stage 1: install dependencies ─────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ───────── Stage 2: build the application ─────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ───────── Stage 3: production runtime ─────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the standalone output (much smaller than full node_modules)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check for orchestrators
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
\`\`\`

\`\`\`yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=\${DATABASE_URL}
      - JWT_SECRET=\${JWT_SECRET}
      - NEXT_PUBLIC_GA_ID=\${NEXT_PUBLIC_GA_ID}
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
\`\`\`

#### Step 4 — Vercel Configuration
\`\`\`json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1"],
  "functions": {
    "src/app/api/long-task/route.ts": {
      "maxDuration": 60
    }
  },
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ],
  "redirects": [
    { "source": "/old", "destination": "/new", "permanent": true }
  ]
}
\`\`\`

#### Step 5 — GitHub Actions CI/CD + Health Endpoint
\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run build
      - name: Upload bundle analysis
        if: github.event_name == 'pull_request'
        run: ANALYZE=true npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        run: |
          npm i -g vercel
          vercel --token \${{ secrets.VERCEL_TOKEN }} --prod --yes

  docker:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/\${{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

# src/app/api/health/route.ts -- for Docker healthcheck
import { NextResponse } from 'next/server';

export async function GET() {
  // Could also check DB connectivity, cache, etc.
  return NextResponse.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

# .env.example
# Server-only secrets (never exposed to client)
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=change-me-in-production

# Public variables (inlined into client bundle at build time)
NEXT_PUBLIC_GA_ID=G-XXXXX
NEXT_PUBLIC_API_URL=https://api.example.com
\`\`\`

**Expected Output:**
\`\`\`
docker build -t myapp .  -> ~150MB image
docker run -p 3000:3000 myapp  -> running production server
GET /api/health  -> {"status":"ok","uptime":12.5,...}
Vercel: vercel --prod  -> deployed to global edge network
GitHub Actions: tests run on every PR, deploy on merge to main
Security headers: visible in browser DevTools → Network → Response Headers
\`\`\`

**Stretch Challenges:**
- [ ] Add blue/green deployment with health-check-based traffic switch
- [ ] Add OpenTelemetry instrumentation for distributed tracing
- [ ] Add a /api/metrics endpoint for Prometheus scraping`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Three Next.js output modes and their trade-offs?
**Q2:** Difference between NEXT_PUBLIC_ and server-only env vars?
**Q3:** Write a minimal Dockerfile for standalone Next.js. From memory.

### Day 3 — Comprehension
**Q4:** What happens if you change NEXT_PUBLIC_API_URL without rebuilding?
**Q5:** A PR puts JWT_SECRET in NEXT_PUBLIC_JWT_SECRET — explain the security disaster.
**Q6:** Why is output: 'standalone' essential for Docker deployments?

### Day 7 — Application
**Q7:** Configure CSP headers that allow analytics but block inline scripts.
**Q8:** A PR's Docker image is 1.2GB — diagnose and reduce to 150MB.
**Q9:** When should you use Vercel vs self-hosted vs serverless?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through deploying a production Next.js app — platform choice, env vars, security, CI/CD."
**Q11:** Draw: deployment pipeline — code → CI → tests → build → Docker → registry → orchestrator → traffic.
**Q12:** ★ System design: "Design deployment for a Next.js SaaS — multi-region, blue/green, secrets management, observability, cost optimisation."`
  },

  // ── 27. nextjs-edge-runtime ───────────────────────────────────────────────
  'nextjs-edge-runtime': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Edge Runtime Like I'm 10 Years Old
> The Edge Runtime runs your code on Vercel/Cloudflare's GLOBAL EDGE NETWORK — physically close to every user, in any of 100+ cities worldwide. A user in Tokyo hits Tokyo edge; a user in Berlin hits Berlin edge. Latency drops from ~200ms (transcontinental) to ~20ms (local). Edge Runtime uses V8 ISOLATES (NOT Node.js) — same engine as browsers, instant cold start (<1ms vs 200-1000ms for Lambda), but limited APIs (no fs, no native modules, no Node.js crypto). Available in: middleware (always Edge), API routes (export const runtime = 'edge'), and Server Components/pages. The non-obvious depth: Edge Runtime is GEOGRAPHICALLY DISTRIBUTED but STATELESS — each request might hit a different region. Don't store user-specific state in module variables (each region has its own instance). Use Redis/KV/database for shared state. Best for: auth checks (read JWT), A/B testing (random assignment), geolocation routing, AI streaming (OpenAI/Anthropic), redirects, security headers — anything fast that doesn't need persistent storage.

---

### 5 Deep Conceptual Questions

**Q1: What APIs are available in Edge Runtime vs Node.js Runtime?**
> **A:** EDGE RUNTIME (Web Standards APIs only): fetch, Request/Response, Headers, URL, URLSearchParams, FormData, ReadableStream, TextEncoder/Decoder, crypto (Web Crypto API, not Node.js crypto), btoa/atob, AbortController. NOT AVAILABLE: fs (no filesystem), child_process, net, http (use fetch), Node.js Buffer (use Uint8Array), most npm packages with native modules. NODE.JS RUNTIME: everything in Edge PLUS all Node.js built-ins (fs, Buffer, crypto, child_process), full npm ecosystem, larger memory limits. Choose based on dependencies — if you need any Node.js-only API or library, use Node.js runtime.

**Q2: Mental model for cold start vs Node.js Lambda?**
> **A:** NODE.JS LAMBDA cold start: container boots, Node.js runtime initializes, dependencies load — ~200-1000ms before your code runs. EDGE RUNTIME cold start: V8 isolate instantiates from snapshot — ~1-10ms. The difference is 100x. For request-heavy APIs (rate limit checks, auth verification, geo routing) where most requests are short, Edge wins massively on p99 latency. For long-running requests (heavy DB queries, AI generation, file processing), the cold start advantage matters less — the bulk of time is the actual work. Combination strategy: middleware in Edge (auth, redirects), main route handler in Node.js (DB-heavy work).

**Q3: Most dangerous misconception about Edge Runtime?**
> **A:** All npm packages work in Edge Runtime:
> \`\`\`typescript
> // WRONG: importing Node.js-only packages in Edge
> export const runtime = 'edge';
>
> import bcrypt from 'bcrypt';                    // Uses Node.js native crypto → CRASH
> import jwt from 'jsonwebtoken';                  // Uses Node.js Buffer/crypto → CRASH
> import prisma from '@/lib/prisma';               // Uses Node.js fs/net → CRASH
> import { writeFile } from 'fs/promises';         // No fs in Edge → CRASH
>
> // CORRECT: use Edge-compatible alternatives
> import { jwtVerify, SignJWT } from 'jose';      // Web Crypto API → works
> import { hash, verify } from '@node-rs/bcrypt'; // WASM bcrypt → works in Edge
> // For DB: use HTTP-based drivers (Neon serverless, Turso, Vercel KV)
>
> // Check package compatibility:
> // - "edge-compatible" or "isomorphic" badges in README
> // - No "node:" prefix imports
> // - Uses Web Standards APIs (fetch, crypto, Uint8Array)
> \`\`\`

**Q4: How does geographic routing work?**
> **A:** Vercel's edge network has 100+ regions. Each user's request is routed to the NEAREST edge by their DNS resolver — usually within the same country. The Edge function receives the request, executes locally, and sends the response. The edge function can READ the user's region via request.geo (Vercel) or request.cf (Cloudflare): { country: 'JP', city: 'Tokyo', latitude: '35.6', longitude: '139.6' }. Use this for: localised pricing (USD for US, EUR for EU), legal compliance (GDPR consent for EU only), language detection (override Accept-Language with geo), region-specific A/B tests.

**Q5: FAANG-grade definition of Next.js Edge Runtime.**
> **A:** "Next.js Edge Runtime executes Server Components, Route Handlers, and middleware on V8 isolates distributed across global edge POPs (100+ locations on Vercel, 300+ on Cloudflare Workers) — providing sub-10ms cold starts via isolate snapshotting vs 200-1000ms for traditional Node.js Lambda — restricted to Web Standards APIs (fetch, Web Crypto, ReadableStream) and prohibiting Node.js built-ins (fs, Buffer, native crypto) and packages depending on them — enabled per route via export const runtime = 'edge' or globally for middleware — supporting geographic request routing via request.geo for region-aware logic — and best suited for low-latency auth verification, geolocation routing, AI/SSE streaming, security middleware, and A/B testing — paired with Node.js runtime for heavier server-side workloads requiring full ecosystem access."`,

    build: `## BUILD

### 🏗️ Mini Project: Edge-Powered API Gateway — Auth + Geo Routing + AI Streaming + Rate Limit

**What you will build:** An edge-runtime API gateway that: verifies JWT (jose), routes by geo (different content per region), streams AI responses (SSE), and rate-limits via Vercel KV — all in <10ms cold start.
**Why this project:** Forces every Edge-compatible pattern.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest edge-demo --typescript --tailwind --app
npm install jose @vercel/kv @vercel/edge
\`\`\`

#### Step 2 — Edge Middleware (Already Edge by Default)
\`\`\`typescript
// src/middleware.ts -- runs in Edge Runtime
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { geolocation } from '@vercel/edge';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret');

export const config = {
  matcher: '/api/protected/:path*',
};

export async function middleware(request: NextRequest) {
  // Auth check using jose (Edge-compatible)
  const token = request.cookies.get('session')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Pass user info via headers to downstream handler
    const response = NextResponse.next();
    response.headers.set('x-user-id', String(payload.sub));

    // Geographic enhancement
    const geo = geolocation(request);
    if (geo.country) response.headers.set('x-user-country', geo.country);
    if (geo.city) response.headers.set('x-user-city', geo.city);

    return response;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
\`\`\`

#### Step 3 — Edge API Route With AI Streaming
\`\`\`typescript
// src/app/api/ai/stream/route.ts
export const runtime = 'edge';  // explicit Edge Runtime

export async function POST(request: Request) {
  const { prompt } = await request.json();

  // Stream from OpenAI/Anthropic (or simulate)
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const tokens = (\`This is a streamed response to: \${prompt}. \`.repeat(5)).split(' ');

      for (const token of tokens) {
        await new Promise(r => setTimeout(r, 50));  // simulate token-by-token
        controller.enqueue(encoder.encode(\`data: {"token": "\${token}"}\\n\\n\`));
      }
      controller.enqueue(encoder.encode('data: [DONE]\\n\\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
\`\`\`

#### Step 4 — Geographic Content Routing
\`\`\`typescript
// src/app/api/pricing/route.ts
export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { geolocation } from '@vercel/edge';

const PRICING: Record<string, { currency: string; amount: number; symbol: string }> = {
  US: { currency: 'USD', amount: 29.99, symbol: '$' },
  GB: { currency: 'GBP', amount: 24.99, symbol: '£' },
  EU: { currency: 'EUR', amount: 27.99, symbol: '€' },
  IN: { currency: 'INR', amount: 999, symbol: '₹' },
  JP: { currency: 'JPY', amount: 4500, symbol: '¥' },
};

const EU_COUNTRIES = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PL', 'IE'];

export async function GET(request: NextRequest) {
  const geo = geolocation(request);
  const country = geo.country ?? 'US';

  let pricing = PRICING[country];
  if (!pricing && EU_COUNTRIES.includes(country)) pricing = PRICING['EU'];
  if (!pricing) pricing = PRICING['US'];

  return NextResponse.json({
    country, city: geo.city,
    pricing,
    formatted: \`\${pricing.symbol}\${pricing.amount}/mo\`,
  }, {
    headers: {
      // Cache for 1 hour, but vary by country
      'Cache-Control': 'public, max-age=3600',
      'Vary': 'CF-IPCountry, X-Vercel-IP-Country',
    },
  });
}
\`\`\`

#### Step 5 — Rate Limiting With Vercel KV + Tests
\`\`\`typescript
// src/app/api/limited/route.ts
export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { ipAddress } from '@vercel/edge';

const RATE_LIMIT = 10;          // requests
const WINDOW_SECONDS = 60;       // per minute

async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const key = \`rate:\${identifier}:\${Math.floor(Date.now() / 1000 / WINDOW_SECONDS)}\`;
  const count = (await kv.incr(key)) as number;
  if (count === 1) await kv.expire(key, WINDOW_SECONDS);

  return {
    allowed: count <= RATE_LIMIT,
    remaining: Math.max(0, RATE_LIMIT - count),
    reset: (Math.floor(Date.now() / 1000 / WINDOW_SECONDS) + 1) * WINDOW_SECONDS,
  };
}

export async function GET(request: NextRequest) {
  const ip = ipAddress(request) ?? 'unknown';
  const { allowed, remaining, reset } = await checkRateLimit(ip);

  const headers = {
    'X-RateLimit-Limit': String(RATE_LIMIT),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(reset),
  };

  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter: reset - Math.floor(Date.now() / 1000) },
      { status: 429, headers },
    );
  }

  return NextResponse.json(
    { message: 'Request allowed', remaining },
    { headers },
  );
}

// Tests
import { GET as pricingGET } from '@/app/api/pricing/route';
it('returns USD for US visitors', async () => {
  const req = new Request('http://localhost/api/pricing');
  // Mock geolocation header (Vercel sets x-vercel-ip-country)
  req.headers.set('x-vercel-ip-country', 'US');
  const res = await pricingGET(req as any);
  const data = await res.json();
  expect(data.pricing.currency).toBe('USD');
});
\`\`\`

**Expected Output:**
\`\`\`
Vercel deploy: routes deployed to global edge network
US visitor /api/pricing -> {"currency":"USD","amount":29.99}
EU visitor /api/pricing -> {"currency":"EUR","amount":27.99}
POST /api/ai/stream -> SSE stream, token-by-token
GET /api/limited (11th request) -> 429 with X-RateLimit headers
Cold start: <10ms (V8 isolate)
Tests: 1 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add CIDR-based IP allowlist for enterprise endpoints
- [ ] Integrate real OpenAI API with streaming
- [ ] Add edge caching headers with Cache-Control: s-maxage + stale-while-revalidate`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between Edge Runtime and Node.js Runtime?
**Q2:** Three APIs available in Edge but not Node, or vice versa?
**Q3:** Write export const runtime = 'edge' for a route. From memory.

### Day 3 — Comprehension
**Q4:** Why does Edge Runtime have <10ms cold start vs ~500ms for Lambda?
**Q5:** A PR imports bcrypt in an Edge route — explain the error.
**Q6:** What is request.geo and when do you use it?

### Day 7 — Application
**Q7:** Build a JWT verification middleware using jose (Edge-compatible).
**Q8:** A PR's Edge route uses Prisma — diagnose and suggest alternatives.
**Q9:** When should middleware be Edge vs Node.js?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain Edge Runtime — when to use it, what it can't do, and how it improves UX."
**Q11:** Draw: request flow — user → DNS → edge POP → V8 isolate → response.
**Q12:** ★ System design: "Design a global API gateway in Edge Runtime — auth, rate limiting, geo routing, observability."`
  },

  // ── 28. nextjs-internationalization ───────────────────────────────────────
  'nextjs-internationalization': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js Internationalization Like I'm 10 Years Old
> Internationalization (i18n) means making your app work in MULTIPLE languages. Three things change per language: (1) ROUTING — URL paths like /en/about vs /fr/about (or sub-domains: en.site.com). (2) TRANSLATIONS — text content swapped per language (libraries: next-intl, next-i18next). (3) LOCALE-SPECIFIC formatting — dates (12/31/2025 US vs 31/12/2025 EU), numbers (1,234.56 US vs 1.234,56 EU), currency (\\$ vs €). The non-obvious depth: in the App Router, i18n is implemented via DYNAMIC SEGMENT — app/[locale]/page.tsx where [locale] is 'en', 'fr', 'es'. Middleware reads Accept-Language header and either rewrites (URL stays /, content is /en/) or redirects (URL becomes /en). Translations live in JSON files per locale (locales/en.json, locales/fr.json) loaded via Server Components — zero client-side JavaScript needed for static text. This is way faster than client-side libraries like i18next.

---

### 5 Deep Conceptual Questions

**Q1: What are the three i18n routing strategies?**
> **A:** (1) SUB-PATH: example.com/en/, example.com/fr/ — same domain, easy SEO, language is part of URL path. Most common. (2) SUB-DOMAIN: en.example.com, fr.example.com — clearer language separation, but requires DNS setup, slightly harder SEO. (3) DOMAIN-PER-LANGUAGE: example.com (English), example.fr (French) — best for SEO in country-specific search, requires multiple domain registrations and certs. Next.js App Router naturally supports sub-path via [locale] dynamic segment. Sub-domain needs custom middleware. Domain-per-language needs separate deployments per domain (with shared codebase).

**Q2: Mental model for translation loading strategies?**
> **A:** STATIC: bundle all translations into the build. Pros: no runtime fetch, fastest. Cons: bigger bundle (50KB+ per locale). Best for small apps. SERVER-SIDE: load locale-specific JSON on the server per request, only return translated HTML to client. Pros: zero client translation overhead, instant render. Cons: server work per request (cached with ISR). Best for Server Component-heavy apps. CLIENT-SIDE LAZY: client downloads translations only for the current locale. Pros: small initial bundle, fast switch. Cons: flash of untranslated content during language switch. Best for SPAs. next-intl supports all three; Server Component pattern is the modern recommendation.

**Q3: Most dangerous misconception about i18n?**
> **A:** "I can translate later, just hardcode English now":
> \`\`\`typescript
> // WRONG: hardcoded strings everywhere
> <button>Submit</button>
> <p>Welcome to our app</p>
> <span>{count} items in cart</span>
>
> // Refactoring to i18n later requires touching EVERY component
> // Plus: pluralisation (1 item, 2 items, 0 items, special cases) is hard
> // Plus: date/number formatting bugs everywhere
> // Plus: gender agreements in many languages
>
> // CORRECT: start with i18n even for English-only apps
> import { useTranslations } from 'next-intl';
> const t = useTranslations('cart');
> <button>{t('submit')}</button>
> <p>{t('welcome')}</p>
> <span>{t('itemCount', { count })}</span>
>
> // Now adding French is just: create locales/fr.json — no component changes
> // Pluralisation handled by ICU message format: "{count, plural, one {# item} other {# items}}"
> \`\`\`

**Q4: How do you handle pluralisation and complex grammar?**
> **A:** Use ICU MessageFormat (industry standard, supported by next-intl, react-intl, formatjs): "{count, plural, =0 {No items} one {# item} other {# items}}". The library substitutes the correct form based on the count's grammatical category in each language (English has one/other; Polish has one/few/many/other; Arabic has zero/one/two/few/many/other). For gender: "{gender, select, male {He went} female {She went} other {They went}}". For dates: relative ("3 days ago" / "il y a 3 jours") via Intl.RelativeTimeFormat. NEVER hand-roll plurals (if count === 1 then 'item' else 'items') — breaks in most languages.

**Q5: FAANG-grade definition of Next.js internationalization.**
> **A:** "Next.js App Router internationalization uses dynamic segment routing via app/[locale]/ with middleware-driven locale detection (Accept-Language header, cookie persistence, URL override) — server-side translation loading via next-intl (Server Component-native, zero client JS for static text) or next-i18next (Pages Router legacy) — ICU MessageFormat for pluralisation, gender, and complex substitution — locale-aware formatting via Intl.DateTimeFormat, Intl.NumberFormat, Intl.RelativeTimeFormat — three routing strategies (sub-path most common, sub-domain for clear separation, domain-per-language for SEO) — generateStaticParams for SSG of all locales — and metadata localization via generateMetadata for SEO with hreflang alternate tags."`,

    build: `## BUILD

### 🏗️ Mini Project: Multilingual App With next-intl — Routes, Translations, Pluralisation, SEO

**What you will build:** A multi-language site (en/fr/es) with: locale-prefixed routing, middleware locale detection, JSON translation files, pluralisation, locale-aware date/currency formatting, language switcher, and hreflang SEO alternates.
**Why this project:** Forces every i18n pattern with the modern Server Component approach.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
npx create-next-app@latest i18n-demo --typescript --tailwind --app
npm install next-intl
\`\`\`

#### Step 2 — Translation Files
\`\`\`json
// messages/en.json
{
  "Index": {
    "title": "Welcome to DevApp",
    "description": "The fastest way to learn modern web development",
    "cta": "Start learning"
  },
  "Cart": {
    "title": "Your cart",
    "empty": "Your cart is empty",
    "itemCount": "{count, plural, =0 {No items} one {# item} other {# items}}",
    "total": "Total: {amount, number, ::currency/{currency}}"
  },
  "LanguageSwitcher": {
    "label": "Language",
    "en": "English",
    "fr": "Français",
    "es": "Español"
  }
}

// messages/fr.json
{
  "Index": {
    "title": "Bienvenue sur DevApp",
    "description": "Le moyen le plus rapide d'apprendre le développement web moderne",
    "cta": "Commencer"
  },
  "Cart": {
    "title": "Votre panier",
    "empty": "Votre panier est vide",
    "itemCount": "{count, plural, =0 {Aucun article} one {# article} other {# articles}}",
    "total": "Total: {amount, number, ::currency/{currency}}"
  }
}

// messages/es.json -- similar structure
\`\`\`

#### Step 3 — Configuration & Middleware
\`\`\`typescript
// src/i18n.ts
import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'fr', 'es'] as const;
export const defaultLocale = 'en' as const;
export type Locale = typeof locales[number];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();
  return {
    messages: (await import(\`../messages/\${locale}.json\`)).default,
  };
});

// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,   // detect from Accept-Language header
  localePrefix: 'always',  // always include locale in URL
});

export const config = {
  matcher: ['/((?!api|_next|.*\\\\..*).*)'],
};

// next.config.js
const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');
module.exports = withNextIntl({
  // ... other config
});
\`\`\`

#### Step 4 — Pages With Translations
\`\`\`typescript
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }];
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <header className="p-4 border-b flex justify-end">
            <LanguageSwitcher />
          </header>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

// src/app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function IndexPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('Index');

  return (
    <main className="p-8 text-center">
      <h1 className="text-4xl font-bold">{t('title')}</h1>
      <p className="text-lg mt-4 text-gray-600">{t('description')}</p>
      <button className="mt-6 px-6 py-3 bg-blue-500 text-white rounded">
        {t('cta')}
      </button>
    </main>
  );
}

// SEO: metadata per locale
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'Index' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: \`/\${locale}\`,
      languages: {
        'en': '/en',
        'fr': '/fr',
        'es': '/es',
        'x-default': '/en',
      },
    },
  };
}

// src/app/[locale]/cart/page.tsx -- with pluralisation
import { getTranslations, getFormatter } from 'next-intl/server';

export default async function CartPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('Cart');
  const format = await getFormatter();

  const itemCount = 3;
  const total = 49.99;
  const currency = locale === 'en' ? 'USD' : locale === 'fr' ? 'EUR' : 'EUR';

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="mt-2">{t('itemCount', { count: itemCount })}</p>
      <p className="mt-2 font-semibold">
        {t('total', { amount: total, currency })}
      </p>
      <p className="text-sm text-gray-500 mt-4">
        {format.dateTime(new Date(), { dateStyle: 'long', timeStyle: 'short' })}
      </p>
    </main>
  );
}
\`\`\`

#### Step 5 — Language Switcher + Tests
\`\`\`typescript
// src/components/LanguageSwitcher.tsx
'use client';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n';

export function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Replace current locale in path with new locale
    const newPath = pathname.replace(\`/\${locale}\`, \`/\${newLocale}\`);
    router.push(newPath);
  };

  return (
    <select
      value={locale}
      onChange={e => switchLocale(e.target.value)}
      aria-label={t('label')}
      className="px-3 py-1 border rounded"
    >
      {locales.map(loc => (
        <option key={loc} value={loc}>{t(loc as any)}</option>
      ))}
    </select>
  );
}

// Tests
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../messages/en.json';
import CartPage from '@/app/[locale]/cart/page';

describe('CartPage i18n', () => {
  it('pluralises item count correctly', async () => {
    const Page = await CartPage({ params: { locale: 'en' } });
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        {Page}
      </NextIntlClientProvider>
    );
    expect(screen.getByText(/3 items/)).toBeInTheDocument();
  });
});
\`\`\`

**Expected Output:**
\`\`\`
GET / -> redirects to /en (default locale)
GET /fr -> "Bienvenue sur DevApp" in French
GET /es -> Spanish version
Browser Accept-Language: fr -> redirected to /fr automatically
/fr/cart -> "3 articles" (correct French plural)
/en/cart -> "3 items" (English plural)
Page source: <link rel="alternate" hreflang="fr" href="/fr" />
Tests: 1 passed
\`\`\`

**Stretch Challenges:**
- [ ] Add RTL (right-to-left) support for Arabic/Hebrew
- [ ] Add a translation management workflow with .po files
- [ ] Implement client-side language switching without page reload`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Three i18n routing strategies?
**Q2:** What is ICU MessageFormat?
**Q3:** Write a translation key with pluralisation. From memory.

### Day 3 — Comprehension
**Q4:** Why is hand-rolled pluralisation (if count === 1) broken in most languages?
**Q5:** A PR hardcodes English strings — explain the long-term cost.
**Q6:** What does hreflang do for SEO?

### Day 7 — Application
**Q7:** Add a third language (German) to an existing English/French app.
**Q8:** A PR detects locale via JavaScript only — explain why crawlers see wrong content.
**Q9:** How do you implement locale-specific date/currency formatting?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through implementing i18n in Next.js — routing, translations, pluralisation, SEO."
**Q11:** Draw: i18n request flow — Accept-Language → middleware → [locale] route → translations → rendered HTML.
**Q12:** ★ System design: "Design i18n for a global e-commerce site — 20+ languages, currency, pricing, legal compliance, translation workflow."`
  },

  // ── 29. nextjs-monorepo ───────────────────────────────────────────────────
  'nextjs-monorepo': {
    feynman: `## FEYNMAN CHECK

### Explain Next.js in a Monorepo Like I'm 10 Years Old
> A monorepo is ONE git repository containing MULTIPLE related projects: web app (Next.js), admin dashboard (Next.js), mobile app (React Native), and shared packages (UI components, types, utilities). Tools like Turborepo, Nx, or pnpm workspaces manage them: shared code in packages/, apps in apps/, dependencies hoisted to root node_modules. Benefits: change a UI component and ALL apps see the change immediately (atomic refactors across the entire codebase), shared TypeScript types (no duplication), one CI/CD pipeline. The non-obvious depth: Next.js needs special configuration to TRANSPILE shared packages. By default, Next.js doesn't compile node_modules — but your shared packages (in node_modules via workspaces) need transpilation. Use transpilePackages: ['@myapp/ui'] in next.config.js. Without this, you get "SyntaxError: Cannot use import statement outside a module" — the #1 monorepo bug.

---

### 5 Deep Conceptual Questions

**Q1: What problem does Turborepo solve over plain pnpm workspaces?**
> **A:** pnpm workspaces gives you the structure (shared deps, package linking). Turborepo adds: (1) CACHING — if you ran tests for @myapp/ui already and the source hasn't changed, skip them (saves minutes per CI run). (2) PARALLELISM — runs tasks across packages in parallel respecting dependency order (build @myapp/ui before web app, but build mobile in parallel with web). (3) REMOTE CACHING — share cache between developers' machines and CI (Vercel-hosted). (4) FILTERED EXECUTION — turbo run build --filter=web runs only the web app and its dependencies. On a large monorepo, Turborepo reduces CI time from 30+ minutes to 5 minutes.

**Q2: Mental model for the dependency graph in a monorepo?**
> **A:** Each package has its own package.json declaring dependencies. Internal deps (other packages in the monorepo) are listed as workspace:* in pnpm or *. Example: apps/web depends on @myapp/ui and @myapp/types — workspace resolves these to packages/ui and packages/types (symlinks). Tools traverse this graph for: build order (UI before apps using UI), affected detection (changing UI rebuilds apps using it, but not mobile-only packages), and visualisation. nx graph or turbo graph generates a visual dependency map — essential for understanding refactor impact.

**Q3: Most dangerous misconception about monorepo Next.js?**
> **A:** All Next.js features work seamlessly with shared packages:
> \`\`\`typescript
> // WRONG: importing a workspace package without transpilation
> // packages/ui/Button.tsx
> export function Button() { return <button>Click</button>; }
>
> // apps/web/page.tsx
> import { Button } from '@myapp/ui';  // ERROR: Cannot use import statement
>
> // CORRECT: configure Next.js to transpile workspace packages
> // apps/web/next.config.js
> module.exports = {
>   transpilePackages: ['@myapp/ui', '@myapp/utils', '@myapp/types'],
> };
>
> // Why? Next.js skips compiling node_modules for speed
> // But workspace packages live in node_modules via symlinks
> // They contain TypeScript/JSX that needs Next.js compilation
> // transpilePackages tells Next.js: "compile these even though they're in node_modules"
> \`\`\`

**Q4: How do you share TypeScript types across packages?**
> **A:** Create a packages/types package with shared interfaces: export interface User { id: string; email: string; role: 'admin' | 'user'; }. Other packages import via @myapp/types. Critical: set composite: true in tsconfig.json and use Project References — TypeScript can incremental-compile only changed packages. tsconfig in apps/web extends a base config and references the types package: { "extends": "@myapp/tsconfig/nextjs.json", "references": [{ "path": "../../packages/types" }] }. This gives instant cross-package type checking with minimal recompile.

**Q5: FAANG-grade definition of Next.js monorepo architecture.**
› **A:** "Next.js monorepo architecture uses pnpm/Yarn workspaces or npm workspaces for package linking with Turborepo or Nx for task orchestration — sharing UI components, TypeScript types, utilities, and configurations across multiple Next.js apps (web, admin, marketing site) via internal packages — requiring transpilePackages in next.config.js for Next.js to compile workspace packages excluded from default node_modules transpilation — TypeScript Project References with composite: true for incremental cross-package compilation — Turborepo's remote caching for sharing build/test artifacts across developers and CI — affected-only execution (turbo --filter) for fast PRs that touch few packages — and atomic refactors via single-commit PRs that simultaneously update shared packages and consuming apps — enabling scaling Next.js development from 1 to 100+ developers with consistent tooling and faster iteration."`,

    build: `## BUILD

### 🏗️ Mini Project: Turborepo + Next.js + Shared UI Package + Type-Safe API Layer

**What you will build:** A monorepo with: two Next.js apps (web + admin), shared @myapp/ui package (Button, Card), shared @myapp/types package (User interface), shared @myapp/api-client (typed fetch wrapper), Turborepo orchestration, and TypeScript project references.
**Why this project:** Forces every monorepo pattern.
**Time estimate:** 50 minutes

---

#### Step 1 — Initialize Monorepo
\`\`\`bash
mkdir myapp-monorepo && cd myapp-monorepo
npm init -y
npm install -D turbo

# Create workspace structure
mkdir -p apps/web apps/admin packages/ui packages/types packages/api-client packages/tsconfig

# pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - "apps/*"
  - "packages/*"
EOF

# Or use npm workspaces (package.json)
\`\`\`

\`\`\`json
// package.json (root)
{
  "name": "myapp-monorepo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "type-check": "turbo run type-check"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0"
  }
}

// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": { "dependsOn": ["^build"] },
    "type-check": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"], "outputs": ["coverage/**"] }
  }
}
\`\`\`

#### Step 2 — Shared Types Package
\`\`\`json
// packages/types/package.json
{
  "name": "@myapp/types",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}

// packages/types/tsconfig.json
{
  "extends": "@myapp/tsconfig/base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src", "composite": true },
  "include": ["src/**/*"]
}

// packages/types/src/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  publishedAt: string | null;
}

export type ApiResponse<T> = { data: T; error: null } | { data: null; error: string };
\`\`\`

#### Step 3 — Shared UI Package
\`\`\`json
// packages/ui/package.json
{
  "name": "@myapp/ui",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "peerDependencies": {
    "react": "^18 || ^19",
    "react-dom": "^18 || ^19"
  }
}

// packages/ui/src/index.ts
export { Button } from './Button';
export { Card } from './Card';

// packages/ui/src/Button.tsx
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };
  return (
    <button
      className={\`px-4 py-2 rounded font-medium transition \${variants[variant]} \${className}\`}
      {...props}
    >
      {children}
    </button>
  );
}

// packages/ui/src/Card.tsx
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={\`bg-white rounded-lg shadow p-6 \${className}\`}>
      {children}
    </div>
  );
}
\`\`\`

#### Step 4 — Shared API Client + Next.js Apps
\`\`\`typescript
// packages/api-client/src/index.ts
import type { User, Post, ApiResponse } from '@myapp/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(\`\${BASE_URL}\${path}\`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
    if (!res.ok) return { data: null, error: \`HTTP \${res.status}\` };
    return { data: await res.json(), error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export const api = {
  users: {
    list: () => request<User[]>('/users'),
    get: (id: string) => request<User>(\`/users/\${id}\`),
  },
  posts: {
    list: () => request<Post[]>('/posts'),
    create: (data: Partial<Post>) => request<Post>('/posts', {
      method: 'POST', body: JSON.stringify(data),
    }),
  },
};

// apps/web/next.config.js
module.exports = {
  // CRITICAL: transpile workspace packages
  transpilePackages: ['@myapp/ui', '@myapp/types', '@myapp/api-client'],
  experimental: { typedRoutes: true },
};

// apps/web/package.json
{
  "name": "web",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@myapp/ui": "workspace:*",
    "@myapp/types": "workspace:*",
    "@myapp/api-client": "workspace:*"
  }
}

// apps/web/src/app/page.tsx
import { Button, Card } from '@myapp/ui';
import { api } from '@myapp/api-client';
import type { Post } from '@myapp/types';

export default async function HomePage() {
  const { data: posts, error } = await api.posts.list();

  if (error) return <div>Failed to load: {error}</div>;

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Latest Posts</h1>
      <div className="space-y-4">
        {posts?.map((post: Post) => (
          <Card key={post.id}>
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-600 mt-2">{post.content}</p>
            <Button className="mt-4">Read more</Button>
          </Card>
        ))}
      </div>
    </main>
  );
}
\`\`\`

#### Step 5 — Run + Verify
\`\`\`bash
# Install all dependencies
npm install

# Run all apps in parallel (Turborepo)
npm run dev
# -> web runs on :3000
# -> admin runs on :3001
# -> packages auto-rebuild on changes

# Build everything (respects dependency order)
npm run build
# -> builds packages first (parallel where possible)
# -> then builds apps that depend on them
# -> caches results for next run

# Build only the web app and its dependencies
npx turbo run build --filter=web

# Type-check everything across the entire monorepo
npm run type-check
# -> uses TypeScript Project References for incremental builds

# Visualize dependency graph
npx turbo run build --graph
\`\`\`

**Expected Output:**
\`\`\`
turbo run dev: starts both apps in parallel, watches all packages
Change packages/ui/Button.tsx -> both apps hot-reload instantly
turbo run build (cached): "FULL TURBO" 0.1s if nothing changed
Add new prop to User type -> all apps using it show type errors immediately
Filter build: turbo --filter=web only rebuilds web's dependency tree
Remote caching: CI shares build artifacts across runs
\`\`\`

**Stretch Challenges:**
- [ ] Add a shared @myapp/eslint-config package with rules used by all apps
- [ ] Add Changesets for versioned releases of internal packages
- [ ] Set up Turborepo remote caching with Vercel`,

    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What problem does Turborepo solve over plain workspaces?
**Q2:** What is transpilePackages and why is it needed?
**Q3:** Write a workspace package.json for a shared UI library. From memory.

### Day 3 — Comprehension
**Q4:** What is the most common monorepo Next.js bug?
**Q5:** A PR's CI takes 30 minutes despite changing one file — diagnose Turborepo cache.
**Q6:** What are TypeScript Project References and why use them in a monorepo?

### Day 7 — Application
**Q7:** Add a shared @myapp/auth package usable by web and admin apps.
**Q8:** A PR uses 'import X from "@myapp/ui/Button"' instead of barrel — explain trade-offs.
**Q9:** How does --filter improve PR CI time?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Design a Next.js monorepo for a SaaS — what packages, what tooling, why?"
**Q11:** Draw: monorepo dependency graph — apps depending on shared packages, build order.
**Q12:** ★ System design: "Scale a Next.js monorepo from 5 to 500 developers — tooling, code ownership, CI/CD, release management."`
  }
};



