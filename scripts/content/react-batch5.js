// Batch 5 — topics 21-25
module.exports = {
  'state-management-redux': {
    feynman: `## FEYNMAN CHECK

### Explain Redux Like I'm 10 Years Old
> Redux is a CENTRALISED STATE STORE. One JavaScript object holds ALL app state. You change it only by dispatching ACTIONS (\`{ type: 'cart/addItem', payload: item }\`). A REDUCER handles each action and returns NEW state (never mutates old). Components subscribe via SELECTORS. Redux Toolkit (RTK) is the modern Redux — it eliminates boilerplate, uses Immer for "mutate-but-immutable" syntax, and includes RTK Query for server state. Classic Redux with switch/case is legacy.

---

### 5 Deep Conceptual Questions

**Q1: When should you use Redux vs Context vs Zustand vs local state?**
> **A:** LOCAL STATE: component-specific. CONTEXT: low-frequency cross-cutting (auth, theme) — no fine-grained subscription. ZUSTAND: simplest global state with selectors, no boilerplate, 90% of apps. REDUX (RTK): large teams with complex state — time-travel debugging, strict action pattern, RTK Query for server state, complex async. Start with local → Context → Zustand → Redux. Add Redux when: multiple devs share complex state, time-travel debugging needed, or RTK Query replaces complex data fetching.

**Q2: What is the Redux data flow?**
> **A:** ONE-WAY FLOW: (1) Component dispatches Action. (2) Redux passes Action to all Reducers. (3) Matching Reducer returns new state immutably. (4) Store saves new state. (5) Selectors recompute. (6) Subscribed components re-render. Like a database transaction log — every change recorded, replayable. Time-travel: step through action log to see any historical state.

**Q3: Most dangerous misconception about Redux?**
> **A:** Putting everything in Redux:
> \`\`\`tsx
> // ❌ Redux for local UI state — expensive, unnecessary
> const uiSlice = createSlice({
>   name: 'ui',
>   initialState: { modalOpen: false, inputValue: '' },
>   reducers: { setModalOpen: (s, a) => { s.modalOpen = a.payload; } }
> });
> // Every keystroke dispatches to global Redux store — 2ms overhead per keystroke
>
> // ✅ useState for UI-only concerns
> const [modalOpen, setModalOpen] = useState(false);
> const [input, setInput] = useState('');
> // Redux for: user session, cart, server-fetched data, cross-feature concerns
> \`\`\`

**Q4: How does RTK Query differ from Redux Thunk?**
> **A:** RTK Query is purpose-built: define an API with \`createApi\`, use \`useGetUserQuery(id)\` in components. It handles: caching (same query from 10 components = 1 request), invalidation (mutation triggers refetch), loading/error states, optimistic updates, polling. Replaces manually written thunks + loading/error state slices + cache management. Much of what React Query does, integrated in Redux.

**Q5: FAANG-grade definition of Redux.**
> **A:** "Redux is a predictable state container implementing Flux architecture — single immutable store updated via dispatched plain-object Actions processed by pure Reducers — implemented via Redux Toolkit (RTK) with Immer for apparent-mutation syntax, createSlice for reducer+action-creator definition, and RTK Query for declarative server-state management — providing time-travel debugging, auditable action log, strict separation of concerns — appropriate for large-team codebases with complex shared state — overkill for apps served by Context + Zustand."`,
    build: `## BUILD

### 🏗️ Mini Project: Shopping Cart With Redux Toolkit + RTK Query

**What you will build:** A shop using RTK: product listing (RTK Query), cart management (createSlice), memoised selectors, Redux DevTools.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
npm create vite@latest redux-demo -- --template react-ts
cd redux-demo && npm install @reduxjs/toolkit react-redux
\`\`\`

#### Step 2 — Cart Slice + Selectors
\`\`\`ts
// src/store/cartSlice.ts
import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
interface CartItem { id: number; name: string; price: number; quantity: number; }
interface CartState { items: CartItem[]; }

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] } as CartState,
  reducers: {
    addItem(state, { payload }: PayloadAction<Omit<CartItem, 'quantity'>>) {
      const ex = state.items.find(i => i.id === payload.id);
      if (ex) ex.quantity++;
      else state.items.push({ ...payload, quantity: 1 });
    },
    removeItem(state, { payload }: PayloadAction<number>) {
      state.items = state.items.filter(i => i.id !== payload);
    },
    clearCart(state) { state.items = []; },
  },
});

const selectItems = (s: { cart: CartState }) => s.cart.items;
export const selectCartTotal = createSelector(selectItems, items =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0)
);
export const selectCartCount = createSelector(selectItems, items =>
  items.reduce((sum, i) => sum + i.quantity, 0)
);
export const { addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
\`\`\`

#### Step 3 — RTK Query API
\`\`\`ts
// src/store/productsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
interface Product { id: number; title: string; price: number; image: string; }

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://fakestoreapi.com/' }),
  endpoints: b => ({ getProducts: b.query<Product[], void>({ query: () => 'products?limit=8' }) }),
});
export const { useGetProductsQuery } = productsApi;

// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import { productsApi } from './productsApi';
export const store = configureStore({
  reducer: { cart: cartReducer, [productsApi.reducerPath]: productsApi.reducer },
  middleware: gDM => gDM().concat(productsApi.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
\`\`\`

#### Step 4 — Components
\`\`\`tsx
// src/App.tsx
import { Provider } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './store';
import { addItem, removeItem, clearCart, selectCartTotal, selectCartCount } from './store/cartSlice';
import { useGetProductsQuery } from './store/productsApi';

function ProductList() {
  const { data, isLoading } = useGetProductsQuery();
  const dispatch = useDispatch();
  if (isLoading) return <div className="p-4">Loading...</div>;
  return (
    <div className="grid grid-cols-2 gap-3">
      {data?.map(p => (
        <div key={p.id} className="border rounded p-3">
          <img src={p.image} alt={p.title} className="h-20 object-contain mx-auto" />
          <p className="text-sm font-medium mt-2 line-clamp-2">{p.title}</p>
          <p className="text-blue-600">\${p.price}</p>
          <button onClick={() => dispatch(addItem({ id: p.id, name: p.title, price: p.price }))}
            className="mt-2 w-full bg-blue-500 text-white rounded py-1 text-sm">Add</button>
        </div>
      ))}
    </div>
  );
}

function CartPanel() {
  const dispatch = useDispatch();
  const items = useSelector((s: RootState) => s.cart.items);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);
  return (
    <aside className="border rounded p-4 w-64">
      <h2 className="font-bold mb-2">Cart ({count})</h2>
      {items.map(i => (
        <div key={i.id} className="flex justify-between text-sm mb-1">
          <span className="flex-1 truncate">{i.name} ×{i.quantity}</span>
          <button onClick={() => dispatch(removeItem(i.id))} className="text-red-400">×</button>
        </div>
      ))}
      <hr className="my-2" />
      <p className="font-bold">Total: \${total.toFixed(2)}</p>
      <button onClick={() => dispatch(clearCart())} className="text-xs text-red-400 mt-1">Clear</button>
    </aside>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <main className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Shop — Redux Toolkit</h1>
        <div className="flex gap-4"><ProductList /><CartPanel /></div>
      </main>
    </Provider>
  );
}
\`\`\`

#### Step 5 — Tests
\`\`\`ts
import { describe, it, expect } from 'vitest';
import cartReducer, { addItem, clearCart, selectCartTotal } from './store/cartSlice';

describe('cartSlice', () => {
  it('adds item', () => {
    const s = cartReducer({ items: [] }, addItem({ id: 1, name: 'Book', price: 10 }));
    expect(s.items[0].quantity).toBe(1);
  });
  it('increments on duplicate', () => {
    let s = cartReducer({ items: [] }, addItem({ id: 1, name: 'Book', price: 10 }));
    s = cartReducer(s, addItem({ id: 1, name: 'Book', price: 10 }));
    expect(s.items[0].quantity).toBe(2);
  });
  it('clears cart', () => {
    let s = cartReducer({ items: [] }, addItem({ id: 1, name: 'Book', price: 10 }));
    s = cartReducer(s, clearCart());
    expect(s.items).toHaveLength(0);
  });
  it('calculates total', () => {
    const s = { cart: { items: [{ id: 1, name: 'B', price: 10, quantity: 2 }] } };
    expect(selectCartTotal(s)).toBe(20);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Products load from API (RTK Query — cached on revisit)
Add → cart panel updates, total recalculates
Redux DevTools: every dispatched action visible, time-travel works
Tests: 4 passed
\`\`\``,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** 4 core concepts of Redux?
**Q2:** What does Immer do in Redux Toolkit?
**Q3:** Write a createSlice with add/remove. From memory.

### Day 3 — Comprehension
**Q4:** Redux vs Zustand — when to choose each?
**Q5:** A PR puts form input value in Redux — diagnose.
**Q6:** How does RTK Query differ from a thunk?

### Day 7 — Application
**Q7:** Add RTK Query mutation (checkout) with cache invalidation.
**Q8:** A selector runs expensive filter every render — fix with createSelector.
**Q9:** How do you persist Redux state to localStorage?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through Redux data flow end-to-end."
**Q11:** Draw: action → reducer → store → selector → component → dispatch.
**Q12:** ★ System design: "Design Redux architecture for a multi-module SaaS — slices, selectors, RTK Query."`
  },

  'state-management-zustand': {
    feynman: `## FEYNMAN CHECK

### Explain Zustand Like I'm 10 Years Old
> Zustand: \`const useStore = create((set) => ({ count: 0, inc: () => set(s => ({ count: s.count + 1 })) }))\`. Then any component: \`const count = useStore(s => s.count)\`. No Provider, no actions, no reducers. The SELECTOR (\`s => s.count\`) is critical — the component only re-renders when \`s.count\` changes. Subscribing without a selector (\`useStore()\`) re-renders on ANY store change. Selectors are the performance key.

---

### 5 Deep Conceptual Questions

**Q1: How does Zustand avoid Context's re-render problem?**
> **A:** Context re-renders all consumers when any part changes. Zustand uses publish-subscribe with equality checks: each component's selector runs after every update; result compared with previous via Object.is. Same ref = no re-render. Different ref = re-render. With Context you'd need 10 split contexts for the same granularity; with Zustand, write a precise selector.

**Q2: Mental model — set vs get vs immer?**
> **A:** \`set({ count: 5 })\` — partial merge (keeps other fields). \`set(fn)\` — updater: \`set(s => ({ count: s.count + 1 }))\`. \`get()\` — read current state inside actions: \`const reset = () => set({ count: get().initial })\`. IMMER middleware: \`set(s => { s.nested.deep = value })\` without manual spreading — cleaner for deeply nested state.

**Q3: Most dangerous misconception?**
> **A:** No selector is fine:
> \`\`\`tsx
> // ❌ BAD: re-renders on every store change
> const store = useCartStore();  // entire store object
> return <span>{store.items.length}</span>;
>
> // ✅ GOOD: precise selector
> const count = useCartStore(s => s.items.length);
>
> // ✅ Multiple values: shallow equality
> import { shallow } from 'zustand/shallow';
> const { items, total } = useCartStore(
>   s => ({ items: s.items, total: s.total }), shallow
> );
> \`\`\`

**Q4: How do you structure Zustand for a large app?**
> **A:** SLICE PATTERN: separate files per domain, combined in one store: \`create<Combined>()((...a) => ({ ...createCartSlice(...a), ...createAuthSlice(...a) }))\`. PERSIST: \`persist(creator, { name: 'cart', storage: createJSONStorage(() => localStorage) })\`. DEVTOOLS: \`devtools(creator)\` shows in Redux DevTools. IMMER: nested updates without spread. Never put server-fetched data in Zustand — use React Query.

**Q5: FAANG-grade definition.**
> **A:** "Zustand is a minimal React state library implementing publish-subscribe (\`create(creator)\` returns a hook) — components subscribe via selector functions, re-rendering only when selected value changes (Object.is or shallow) — avoiding Context's all-or-nothing re-renders without Provider boilerplate — supporting action co-location, middleware (persist, devtools, immer), and slice pattern — appropriate for client-side shared state while delegating server state to React Query/RTK Query."`,
    build: `## BUILD

### 🏗️ Mini Project: Cart + Auth With Zustand

**What you will build:** Two separate Zustand stores — cart (immer + devtools) and auth (persist) — with precise selectors demonstrating re-render isolation.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
npm create vite@latest zustand-demo -- --template react-ts && cd zustand-demo && npm install zustand immer
\`\`\`

#### Step 2 — Stores
\`\`\`ts
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
interface AuthState { user: { name: string } | null; login: (n: string) => void; logout: () => void; }
export const useAuthStore = create<AuthState>()(
  persist(
    set => ({ user: null, login: name => set({ user: { name } }), logout: () => set({ user: null }) }),
    { name: 'auth', storage: createJSONStorage(() => localStorage) }
  )
);

// src/stores/cartStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { createSelector } from '@reduxjs/toolkit';  // or use custom memoisation

interface Item { id: number; name: string; price: number; qty: number; }
interface CartState { items: Item[]; addItem: (i: Omit<Item,'qty'>) => void; removeItem: (id: number) => void; clear: () => void; }

export const useCartStore = create<CartState>()(
  devtools(immer(set => ({
    items: [],
    addItem: item => set(s => {
      const ex = s.items.find(i => i.id === item.id);
      if (ex) ex.qty++;
      else s.items.push({ ...item, qty: 1 });
    }),
    removeItem: id => set(s => { s.items = s.items.filter(i => i.id !== id); }),
    clear: () => set(s => { s.items = []; }),
  })), { name: 'cart' })
);

export const selectTotal = (s: CartState) => s.items.reduce((sum, i) => sum + i.price * i.qty, 0);
export const selectCount = (s: CartState) => s.items.reduce((sum, i) => sum + i.qty, 0);
\`\`\`

#### Step 3 — App
\`\`\`tsx
// src/App.tsx
import { shallow } from 'zustand/shallow';
import { useCartStore, selectTotal, selectCount } from './stores/cartStore';
import { useAuthStore } from './stores/authStore';

const products = [{ id: 1, name: 'Book', price: 12 }, { id: 2, name: 'Pen', price: 3 }];

function CartBadge() {
  const count = useCartStore(selectCount);  // only re-renders on count change
  return <span className="bg-red-500 text-white rounded-full px-1 text-xs">{count}</span>;
}

function CartPanel() {
  const { items, removeItem, clear } = useCartStore(
    s => ({ items: s.items, removeItem: s.removeItem, clear: s.clear }), shallow
  );
  const total = useCartStore(selectTotal);
  return (
    <aside className="border rounded p-4 w-56">
      <h2 className="font-bold mb-2">Cart</h2>
      {items.length === 0 ? <p className="text-gray-400">Empty</p> : (
        <>
          {items.map(i => (
            <div key={i.id} className="flex justify-between text-sm mb-1">
              <span>{i.name} ×{i.qty}</span>
              <button onClick={() => removeItem(i.id)} className="text-red-400">×</button>
            </div>
          ))}
          <hr className="my-1" />
          <p className="font-bold text-sm">\${total.toFixed(2)}</p>
          <button onClick={clear} className="text-xs text-red-400">Clear</button>
        </>
      )}
    </aside>
  );
}

export default function App() {
  const user = useAuthStore(s => s.user);
  const { login, logout } = useAuthStore(s => ({ login: s.login, logout: s.logout }), shallow);
  const addItem = useCartStore(s => s.addItem);

  return (
    <main className="max-w-2xl mx-auto p-4">
      <header className="flex justify-between mb-4">
        <h1 className="font-bold">Shop <CartBadge /></h1>
        {user
          ? <div className="flex gap-2"><span>Hi {user.name}</span><button onClick={logout} className="text-red-500 text-sm">Logout</button></div>
          : <button onClick={() => login('Ana')} className="px-2 py-1 bg-blue-500 text-white rounded text-sm">Login</button>
        }
      </header>
      <div className="flex gap-4">
        <div className="flex-1 grid grid-cols-2 gap-2">
          {products.map(p => (
            <div key={p.id} className="border rounded p-3">
              <p className="font-medium">{p.name}</p>
              <p className="text-blue-500">\${p.price}</p>
              <button onClick={() => addItem(p)} className="mt-1 w-full bg-blue-500 text-white rounded py-1 text-sm">Add</button>
            </div>
          ))}
        </div>
        <CartPanel />
      </div>
    </main>
  );
}
\`\`\`

#### Step 5 — Tests
\`\`\`ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore, selectTotal } from './stores/cartStore';

describe('cartStore', () => {
  beforeEach(() => useCartStore.setState({ items: [] }));
  it('adds item', () => {
    useCartStore.getState().addItem({ id: 1, name: 'B', price: 10 });
    expect(useCartStore.getState().items).toHaveLength(1);
  });
  it('calculates total', () => {
    useCartStore.getState().addItem({ id: 1, name: 'B', price: 10 });
    useCartStore.getState().addItem({ id: 1, name: 'B', price: 10 });
    expect(selectTotal(useCartStore.getState())).toBe(20);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Login → user name appears, persists across page refresh
Add products → cart badge + panel update
Redux DevTools shows "cart" store
Tests: 2 passed
\`\`\``,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is a Zustand selector?
**Q2:** How do you subscribe to multiple values safely?
**Q3:** Write a Zustand store with add/remove. From memory.

### Day 3 — Comprehension
**Q4:** Zustand vs Redux — when to choose each?
**Q5:** A PR subscribes without selector — diagnose.
**Q6:** How does persist middleware work?

### Day 7 — Application
**Q7:** Add undo functionality to a Zustand store.
**Q8:** PR uses Zustand for API data — propose React Query.
**Q9:** How do you access Zustand state outside React?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Compare Zustand vs Redux — when would you choose each?"
**Q11:** Draw: selector subscription — update → selector → same ref → skip / new ref → re-render.
**Q12:** ★ System design: "Design state for a real-time collaborative editor — Zustand vs CRDT vs Yjs."`
  },

  'react-router-v6': {
    feynman: `## FEYNMAN CHECK

### Explain React Router v6 Like I'm 10 Years Old
> React Router v6 maps URL paths to React components: \`<Route path="/users/:id" element={<UserDetail />} />\`. When URL changes, React Router renders the matching component — no page reload. v6 introduced nested routing: a parent route renders children in an \`<Outlet />\` (AppLayout → nav + Outlet → child routes). The data API (loaders, actions) fetches data BEFORE rendering — no loading spinner in components, no useEffect waterfall.

---

### 5 Deep Conceptual Questions

**Q1: What are loaders and actions?**
> **A:** LOADERS: async functions that run before the component renders. Navigate to \`/users/42\` → router calls \`loader({ params: { id: '42' } })\` — data arrives before component mounts. ACTIONS: handle form submissions (POST/PUT/DELETE via \`<Form method="post">\`) — router calls action with FormData, returns result, router re-validates (re-runs loader). Together they eliminate useEffect data fetching, manual loading states, and race conditions.

**Q2: Mental model — nested routes and Outlet?**
> **A:** \`<Outlet />\` renders the matched child route. Parent always renders; child renders inside Outlet. AppLayout → Outlet → DashboardLayout → Outlet → Page. Enables shared layouts without repeating nav/sidebar JSX. Index routes (\`<Route index element={<Home />} />\`) render when the parent path matches with no further segment.

**Q3: Most dangerous misconception?**
> **A:** useNavigate for all navigation:
> \`\`\`tsx
> // ❌ onClick navigate — breaks right-click, keyboard, accessibility
> <div onClick={() => navigate('/products/1')}>Product</div>
>
> // ✅ Use Link or NavLink — real anchor elements
> <Link to="/products/1">Product</Link>
> // useNavigate for: post-submit redirect, conditional navigation only
> \`\`\`

**Q4: How do you protect routes?**
> **A:** LOADER guard: \`loader: async () => { if (!auth()) throw redirect('/login'); return data; }\` — redirect before render, no flicker. LAYOUT ROUTE: a wrapper layout with a guard loader — all children inherit protection without repeating. COMPONENT guard: \`<RequireAuth>\` wrapper — works but can flicker.

**Q5: FAANG-grade definition.**
> **A:** "React Router v6: URL-to-component mapping with nested routes (Outlet), data API (loader before render, action for mutations with automatic revalidation), NavLink for active styling, lazy() for code-split routes, useParams/useSearchParams/useLoaderData/useActionData hooks — with Link as primary navigation (real anchor, keyboard/a11y correct) and useNavigate only for programmatic redirects — eliminating useEffect data-fetching waterfalls via the loader/action pattern."`,
    build: `## BUILD

### 🏗️ Mini Project: Multi-Page App With Nested Routes + Loaders + Protected Routes

**What you will build:** AppLayout (nav+outlet), /dashboard (auth loader guard), /users/:id (loader), contact form (action).
**Time estimate:** 30 minutes

---

#### Step 1
\`\`\`bash
npm create vite@latest router-demo -- --template react-ts && cd router-demo && npm install react-router-dom
\`\`\`

#### Step 2 — Route Config
\`\`\`tsx
// src/main.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { Home } from './pages/Home';
import { UserDetail, userLoader } from './pages/UserDetail';
import { Dashboard } from './pages/Dashboard';
import { Contact, contactAction } from './pages/Contact';
import { ErrorPage } from './ErrorPage';

const getUser = () => JSON.parse(localStorage.getItem('user') ?? 'null');

const router = createBrowserRouter([{
  path: '/', element: <AppLayout />, errorElement: <ErrorPage />,
  children: [
    { index: true, element: <Home /> },
    { path: 'users/:id', element: <UserDetail />, loader: userLoader },
    {
      path: 'dashboard', element: <Dashboard />,
      loader: async () => {
        if (!getUser()) throw new Response('', { status: 401 });
        return { stats: { users: 1200, revenue: 54000 } };
      },
    },
    { path: 'contact', element: <Contact />, action: contactAction },
  ],
}]);

import { createRoot } from 'react-dom/client';
createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);

// src/AppLayout.tsx
import { NavLink, Outlet } from 'react-router-dom';
export function AppLayout() {
  const user = JSON.parse(localStorage.getItem('user') ?? 'null');
  return (
    <div>
      <header className="flex gap-4 p-4 border-b">
        {['/', '/dashboard', '/contact'].map(p => (
          <NavLink key={p} to={p} end={p==='/'} className={({isActive}) => isActive ? 'underline font-bold' : ''}>
            {p === '/' ? 'Home' : p.slice(1)}
          </NavLink>
        ))}
        <div className="ml-auto">
          {user
            ? <button onClick={() => { localStorage.removeItem('user'); location.reload(); }}>Logout</button>
            : <button onClick={() => { localStorage.setItem('user', JSON.stringify({name:'Ana'})); location.reload(); }}
                className="px-2 py-1 bg-blue-500 text-white rounded">Login</button>
          }
        </div>
      </header>
      <main className="max-w-2xl mx-auto p-4"><Outlet /></main>
    </div>
  );
}
// src/ErrorPage.tsx
import { useRouteError } from 'react-router-dom';
export function ErrorPage() {
  const e = useRouteError() as { status?: number };
  return <div className="p-8 text-center"><h1>{e?.status === 401 ? '401 — Login Required' : 'Not Found'}</h1></div>;
}
\`\`\`

#### Step 3 — Pages
\`\`\`tsx
// src/pages/Home.tsx
import { Link } from 'react-router-dom';
export function Home() {
  return <div><h1 className="text-xl font-bold mb-4">Home</h1>{[1,2,3].map(id => <Link key={id} to={'/users/'+id} className="mr-2 px-2 py-1 bg-gray-100 rounded">User {id}</Link>)}</div>;
}

// src/pages/UserDetail.tsx
import { useLoaderData, Link } from 'react-router-dom';
export async function userLoader({ params }: any) {
  const r = await fetch('https://jsonplaceholder.typicode.com/users/'+params.id);
  if (!r.ok) throw new Response('Not Found', { status: 404 });
  return r.json();
}
export function UserDetail() {
  const user = useLoaderData() as { name: string; email: string };
  return <div><Link to="/" className="text-blue-500 text-sm">← Back</Link><h1 className="text-xl font-bold mt-2">{user.name}</h1><p>{user.email}</p></div>;
}

// src/pages/Dashboard.tsx
import { useLoaderData } from 'react-router-dom';
export function Dashboard() {
  const { stats } = useLoaderData() as { stats: Record<string, number> };
  return (
    <div><h1 className="text-xl font-bold mb-4">Dashboard (Protected)</h1>
      <div className="flex gap-4">
        {Object.entries(stats).map(([k,v]) => (
          <div key={k} className="border rounded p-4 text-center"><p className="text-2xl font-bold">{v.toLocaleString()}</p><p className="text-gray-500 capitalize">{k}</p></div>
        ))}
      </div>
    </div>
  );
}

// src/pages/Contact.tsx
import { Form, useActionData } from 'react-router-dom';
export async function contactAction({ request }: any) {
  const data = await request.formData();
  const email = data.get('email') as string;
  if (!email.includes('@')) return { error: 'Invalid email' };
  return { success: true };
}
export function Contact() {
  const result = useActionData() as { success?: boolean; error?: string } | undefined;
  return (
    <div><h1 className="text-xl font-bold mb-4">Contact</h1>
      {result?.success && <p className="text-green-600 mb-2">Sent!</p>}
      {result?.error && <p className="text-red-500 mb-2">{result.error}</p>}
      <Form method="post" className="flex gap-2">
        <input name="email" placeholder="email@example.com" className="flex-1 border px-2 py-1 rounded" />
        <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded">Send</button>
      </Form>
    </div>
  );
}
\`\`\`

**Expected Output:**
\`\`\`
/ shows Home, NavLink underlined
Click User 1 → UserDetail (data from loader, no spinner in component)
Dashboard without login → 401 Error page
Login → Dashboard accessible
Contact submit → action validates, returns error or success
\`\`\``,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is Outlet in React Router?
**Q2:** Loader vs useEffect for data fetching?
**Q3:** Write nested routes with layout. From memory.

### Day 3 — Comprehension
**Q4:** useNavigate vs Link — when to use each?
**Q5:** Migrate a protected route from useEffect redirect to loader redirect.
**Q6:** What does errorElement handle?

### Day 7 — Application
**Q7:** Build tab layout with nested routes (each tab is a route).
**Q8:** A component fetches in useEffect — migrate to loader.
**Q9:** How do you pass data between routes without URL params?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain React Router's data API — loaders, actions, revalidation."
**Q11:** Draw: nested route tree — AppLayout → DashboardLayout → Outlet → Page.
**Q12:** ★ System design: "Design routing for a complex SaaS — auth, lazy, loaders, error boundaries."`
  },

  'react-query-tanstack': {
    feynman: `## FEYNMAN CHECK

### Explain TanStack Query Like I'm 10 Years Old
> TanStack Query manages server state. \`useQuery({ queryKey: ['user', id], queryFn: () => fetchUser(id) })\` returns \`{ data, isLoading, error }\`. React Query caches by \`queryKey\`. 10 components requesting same key = 1 network call. Cache has \`staleTime\` — after expiry, background refetch silently updates. \`useMutation\` handles writes. It solves: loading states, deduplication, caching, background updates, optimistic updates, refetch on window focus — all declaratively, eliminating 90% of useEffect data fetching.

---

### 5 Deep Conceptual Questions

**Q1: How does queryKey determine caching?**
> **A:** queryKey is the cache key — a serialisable array. \`['user', 1]\` and \`['user', 2]\` are separate entries. Changing any key element causes a new fetch. Must contain ALL variables queryFn depends on (same as useEffect deps). Hierarchical: \`queryClient.invalidateQueries({ queryKey: ['user'] })\` invalidates ALL user queries.

**Q2: staleTime vs gcTime?**
> **A:** STALETIME: how long data is FRESH — no background refetch during this window. After: STALE — refetch runs in background on next access, user sees old data first. GCTIME (formerly cacheTime): how long UNUSED cache entries stay in memory. Default gcTime=5min. Pattern: \`staleTime: 60_000\` (1min fresh), \`gcTime: 300_000\` (5min in memory). Navigate away and back within 1min → no refetch.

**Q3: Most dangerous misconception?**
> **A:** Mutation automatically updates cache:
> \`\`\`tsx
> // ❌ Mutation fires but stale data stays — no cache update
> const { mutate } = useMutation({ mutationFn: updateUser });
> // List still shows old name until page refresh
>
> // ✅ Invalidate after success
> const qc = useQueryClient();
> const { mutate } = useMutation({
>   mutationFn: updateUser,
>   onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
> });
>
> // ✅ Optimistic update with rollback
> const { mutate } = useMutation({
>   mutationFn: updateUser,
>   onMutate: async (newUser) => {
>     await qc.cancelQueries({ queryKey: ['users'] });
>     const snapshot = qc.getQueryData<User[]>(['users']);
>     qc.setQueryData<User[]>(['users'], prev => prev!.map(u => u.id === newUser.id ? newUser : u));
>     return { snapshot };
>   },
>   onError: (_, __, ctx) => qc.setQueryData(['users'], ctx?.snapshot),
>   onSettled: () => qc.invalidateQueries({ queryKey: ['users'] }),
> });
> \`\`\`

**Q4: How do you implement infinite scroll?**
> **A:** \`useInfiniteQuery\` with \`initialPageParam\`, \`getNextPageParam\` (extracts next cursor from each page), \`fetchNextPage()\` triggered by IntersectionObserver at the bottom. React Query manages the pages array; navigating away and back restores all pages without refetch.

**Q5: FAANG-grade definition.**
> **A:** "TanStack Query: server-state library with declarative data fetching — queryKey as cache ID, staleTime controls refetch trigger, gcTime controls garbage collection, deduplication (single request per key), automatic refetch on window focus/reconnect/invalidation — useMutation with onMutate optimistic update + rollback pattern — eliminating useEffect boilerplate for loading/error/caching/sync — and extending to infinite scroll via useInfiniteQuery and suspense via useSuspenseQuery."`,
    build: `## BUILD

### 🏗️ Mini Project: Users CRUD — useQuery, useMutation, Optimistic Updates

**What you will build:** Users list with cached fetch, add/delete with optimistic updates, cache invalidation, React Query DevTools.
**Time estimate:** 35 minutes

---

#### Step 1
\`\`\`bash
npm create vite@latest rq-demo -- --template react-ts
cd rq-demo && npm install @tanstack/react-query @tanstack/react-query-devtools
\`\`\`

#### Step 2 — Setup + API
\`\`\`tsx
// src/main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRoot } from 'react-dom/client';
import App from './App';
const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={qc}><App /><ReactQueryDevtools /></QueryClientProvider>
);

// src/api.ts
export interface User { id: number; name: string; email: string; }
const BASE = 'https://jsonplaceholder.typicode.com';
export const getUsers = (): Promise<User[]> => fetch(BASE+'/users').then(r => r.json());
export const createUser = (d: Omit<User,'id'>): Promise<User> =>
  fetch(BASE+'/users', { method:'POST', body: JSON.stringify(d), headers: {'Content-Type':'application/json'} }).then(r => r.json());
export const deleteUser = (id: number) =>
  fetch(BASE+'/users/'+id, { method:'DELETE' }).then(() => {});
\`\`\`

#### Step 3 — App
\`\`\`tsx
// src/App.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, deleteUser, User } from './api';

const KEYS = { users: () => ['users'] as const };

export default function App() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const { data: users, isLoading, isFetching } = useQuery({ queryKey: KEYS.users(), queryFn: getUsers });

  const addMutation = useMutation({
    mutationFn: createUser,
    onMutate: async (newUser) => {
      await qc.cancelQueries({ queryKey: KEYS.users() });
      const snap = qc.getQueryData<User[]>(KEYS.users());
      qc.setQueryData<User[]>(KEYS.users(), p => [...(p??[]), { ...newUser, id: -Date.now() }]);
      return { snap };
    },
    onError: (_, __, ctx) => qc.setQueryData(KEYS.users(), ctx?.snap),
    onSettled: () => qc.invalidateQueries({ queryKey: KEYS.users() }),
  });

  const delMutation = useMutation({
    mutationFn: deleteUser,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEYS.users() });
      const snap = qc.getQueryData<User[]>(KEYS.users());
      qc.setQueryData<User[]>(KEYS.users(), p => p?.filter(u => u.id !== id));
      return { snap };
    },
    onError: (_, __, ctx) => qc.setQueryData(KEYS.users(), ctx?.snap),
    onSettled: () => qc.invalidateQueries({ queryKey: KEYS.users() }),
  });

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Users {isFetching && <span className="text-xs text-gray-400">(syncing...)</span>}</h1>
      <div className="flex gap-2 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="flex-1 border px-2 py-1 rounded" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="flex-1 border px-2 py-1 rounded" />
        <button onClick={() => { addMutation.mutate({ name, email }); setName(''); setEmail(''); }}
          disabled={addMutation.isPending} className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50">
          {addMutation.isPending ? '...' : 'Add'}
        </button>
      </div>
      <ul className="border rounded">
        {users?.map(u => (
          <li key={u.id} className={\`flex justify-between p-3 border-b \${u.id < 0 ? 'opacity-50' : ''}\`}>
            <div><p className="font-medium">{u.name}</p><p className="text-sm text-gray-500">{u.email}</p></div>
            <button onClick={() => delMutation.mutate(u.id)} className="text-red-500">Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
\`\`\`

**Expected Output:**
\`\`\`
Users load from API, cached for 30s
Add: appears instantly (optimistic, grayed), then syncs
Delete: disappears instantly, syncs in background
React Query DevTools: see cache, staleTime, observer count
Tests via renderHook with custom QueryClient wrapper
\`\`\``,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is queryKey?
**Q2:** staleTime vs gcTime?
**Q3:** Write useQuery with loading/error. From memory.

### Day 3 — Comprehension
**Q4:** How do you invalidate cache after mutation?
**Q5:** Mutation fires but list doesn't update — diagnose.
**Q6:** When does React Query auto-refetch?

### Day 7 — Application
**Q7:** Implement optimistic like button (instant +1, rollback on error).
**Q8:** PR fetches in useEffect — migrate to React Query.
**Q9:** How does deduplication work with 10 components sharing a query key?

### Day 14 — Synthesis
**Q10:** ★ Interview: "What is server state and why does React Query handle it better than useState+useEffect?"
**Q11:** Draw: cache lifecycle — fresh → stale → background refetch → gcTime expiry.
**Q12:** ★ System design: "Dashboard updating every 5s — staleTime, refetchInterval, background updates."`
  },

  'testing-react': {
    feynman: `## FEYNMAN CHECK

### Explain React Testing Library Like I'm 10 Years Old
> RTL says: test what users SEE and DO, not implementation. Render a component, query DOM as a user would (\`getByRole('button', { name: 'Submit' })\`), interact (\`await user.click(button)\`), assert (\`expect(screen.getByText('Saved')).toBeInTheDocument()\`). RTL makes testing implementation details HARD on purpose — because those change on refactor. Tests that test behaviour survive refactors.

---

### 5 Deep Conceptual Questions

**Q1: Testing trophy — where do component tests sit?**
> **A:** Static (TypeScript/ESLint) → Unit (pure functions, hooks) → Integration (components + dependencies = RTL sweet spot) → E2E (Playwright/Cypress). RTL tests are INTEGRATION — render component with real children/hooks/context, test combined behaviour. Unit tests that mock everything test implementation, not behaviour.

**Q2: Query hierarchy?**
> **A:** getByRole → getByLabelText → getByPlaceholderText → getByText → getByDisplayValue → getByAltText → getByTestId (last resort). Priority mirrors how users find elements. findBy = async (waits), queryBy = no-throw (use for absence), getAllBy/findAllBy for multiples.

**Q3: Most dangerous misconception?**
> **A:** Testing state/implementation details:
> \`\`\`tsx
> // ❌ Implementation — breaks on refactor
> test('increments', () => {
>   const { container } = render(<Counter />);
>   expect(container.querySelector('.state')).toHaveTextContent('0');
>   // Breaks when you rename the class
> });
>
> // ✅ Behaviour — survives useState→useReducer refactor
> test('displays count and increments on click', async () => {
>   const user = userEvent.setup();
>   render(<Counter />);
>   expect(screen.getByRole('heading', { name: /count: 0/i })).toBeInTheDocument();
>   await user.click(screen.getByRole('button', { name: /increment/i }));
>   expect(screen.getByRole('heading', { name: /count: 1/i })).toBeInTheDocument();
> });
> \`\`\`

**Q4: How do you test async + custom hooks?**
> **A:** Async: \`await screen.findByText('Result')\` (waits automatically) or \`await waitFor(() => expect(...))\`. Mock fetch with \`vi.fn().mockResolvedValue(...)\`. Custom hooks: \`renderHook\` from RTL. Context: wrap in Provider. React Query: fresh QueryClient per test with \`{ retry: false }\`.

**Q5: FAANG-grade definition.**
> **A:** "RTL: behaviour-over-implementation testing — semantic queries (getByRole > labelText > text > testId), @testing-library/user-event for realistic interactions, Arrange-Act-Assert structure — components tested with real dependencies (integration layer) — async via findBy/waitFor — custom hooks via renderHook — mocking only external I/O — tests survive refactors because they test observable output, not internal state."`,
    build: `## BUILD

### 🏗️ Mini Project: Full Test Suite for Search Component

**What you will build:** Complete RTL test suite — rendering, async, error, filter, callbacks, accessibility queries.
**Time estimate:** 30 minutes

---

#### Step 1
\`\`\`bash
npm create vite@latest rtl-demo -- --template react-ts
cd rtl-demo && npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom vitest jsdom
\`\`\`

#### Step 2 — Component Under Test
\`\`\`tsx
// src/UserSearch.tsx
import { useState, useEffect, useId } from 'react';
export interface User { id: number; name: string; active: boolean; }

export function UserSearch({ onSelect }: { onSelect?: (u: User) => void }) {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [filter, setFilter] = useState<'all'|'active'>('all');
  const id = useId();

  useEffect(() => {
    if (!q.trim()) { setUsers([]); return; }
    const ctrl = new AbortController();
    setLoading(true); setError(null);
    fetch('/api/users?q='+encodeURIComponent(q), { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then((d: User[]) => { setUsers(d); setLoading(false); })
      .catch(e => { if (e.name !== 'AbortError') { setError(e.message); setLoading(false); } });
    return () => ctrl.abort();
  }, [q]);

  const visible = filter === 'active' ? users.filter(u => u.active) : users;

  return (
    <section aria-label="User search">
      <label htmlFor={id}>Search users</label>
      <input id={id} value={q} onChange={e => setQ(e.target.value)} placeholder="Type to search..." />
      <div role="group" aria-label="Filter">
        {(['all','active'] as const).map(f => (
          <label key={f}><input type="radio" name="filter" value={f} checked={filter===f} onChange={() => setFilter(f)} /> {f}</label>
        ))}
      </div>
      {error && <p role="alert">{error}</p>}
      {loading && <p aria-live="polite">Searching...</p>}
      {!loading && visible.length === 0 && q && <p role="status">No users found for "{q}"</p>}
      <ul aria-label="Search results">
        {visible.map(u => (
          <li key={u.id}><button onClick={() => onSelect?.(u)}>{u.name}{!u.active && ' (inactive)'}</button></li>
        ))}
      </ul>
    </section>
  );
}
\`\`\`

#### Step 3 — Complete Test Suite
\`\`\`tsx
// src/UserSearch.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserSearch, User } from './UserSearch';

const mockUsers: User[] = [
  { id: 1, name: 'Ana', active: true },
  { id: 2, name: 'Ben', active: true },
  { id: 3, name: 'Carla', active: false },
];

const setup = (props = {}) => ({ user: userEvent.setup(), ...render(<UserSearch {...props} />) });

afterEach(() => vi.restoreAllMocks());

describe('UserSearch', () => {
  it('renders accessible label', () => {
    setup();
    expect(screen.getByLabelText('Search users')).toBeInTheDocument();
  });

  it('shows loading while fetching', async () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    const { user } = setup();
    await user.type(screen.getByLabelText('Search users'), 'a');
    expect(await screen.findByText('Searching...')).toBeInTheDocument();
  });

  it('shows results after fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockUsers) }));
    const { user } = setup();
    await user.type(screen.getByLabelText('Search users'), 'a');
    const list = await screen.findByRole('list', { name: 'Search results' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });

  it('shows error on failed fetch', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const { user } = setup();
    await user.type(screen.getByLabelText('Search users'), 'x');
    expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 500');
  });

  it('shows empty state', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) }));
    const { user } = setup();
    await user.type(screen.getByLabelText('Search users'), 'xyz');
    expect(await screen.findByRole('status')).toHaveTextContent(/no users/i);
  });

  it('filters active only', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockUsers) }));
    const { user } = setup();
    await user.type(screen.getByLabelText('Search users'), 'a');
    await screen.findByText('Ana');
    await user.click(screen.getByLabelText('active'));
    expect(screen.queryByText(/Carla/)).not.toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
  });

  it('calls onSelect with correct user', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockUsers) }));
    const onSelect = vi.fn();
    const { user } = setup({ onSelect });
    await user.type(screen.getByLabelText('Search users'), 'a');
    await screen.findByText('Ana');
    await user.click(screen.getByRole('button', { name: /Ana/i }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ana' }));
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Tests: 7 passed

getByLabelText — not by ID
findByRole — async wait
role="alert" / role="status" — semantic
getByRole button with name — user-centric
queryBy — absence assertions
\`\`\``,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** RTL query hierarchy?
**Q2:** getBy vs queryBy vs findBy?
**Q3:** Write a button increment test. From memory.

### Day 3 — Comprehension
**Q4:** Why does RTL discourage testing implementation?
**Q5:** PR uses getByTestId everywhere — propose better queries.
**Q6:** How do you test a component using React Query?

### Day 7 — Application
**Q7:** Write test suite for a form: render, fill, invalid submit, valid submit.
**Q8:** Test uses fireEvent instead of userEvent — diagnose.
**Q9:** How do you test a custom hook?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Testing trophy — where do React component tests fit?"
**Q11:** Draw: test types — unit/hook → integration/component → E2E; cost vs confidence.
**Q12:** ★ System design: "Testing strategy for a 200-component design system — unit, integration, visual regression, accessibility."`
  }
};

