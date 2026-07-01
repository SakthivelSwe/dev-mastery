/**
 * GFG+ depth FEYNMAN / BUILD / SPACED REVIEW for all TypeScript topics.
 * Matches SKILL.md standards: real analogies, 5 deep Q&As, named build projects,
 * 12 spaced-review questions, code snippets in answers.
 *
 * Built in 5 batches per SKILL.md batching strategy (5 topics per batch).
 * Batch 1 of 5: Foundations.
 */
module.exports = {

  // ── 1. ts-intro ──────────────────────────────────────────────────────────
  'ts-intro': {
    feynman: `## FEYNMAN CHECK

### Explain TypeScript Like I'm 10 Years Old
> TypeScript is JavaScript with a SPELL-CHECKER for your data. You annotate \`name: string\`, \`age: number\`, and the TypeScript compiler reads your code at BUILD TIME — long before any user runs it — and screams if you try to pass a number where a string was expected, or call \`.toUpperCase()\` on \`null\`. Critically, all this type information is ERASED before the code reaches the browser — TS compiles to plain JS. So there is zero runtime cost. Types are a developer tool, not a runtime feature. This is why \`typeof user === "User"\` doesn't work — at runtime the User interface is gone, replaced by a plain object.

---

### 5 Deep Conceptual Questions

**Q1: What problem does TypeScript fundamentally solve that ESLint and unit tests don't?**
> **A:** It catches an entirely different class of bug — TYPE MISMATCHES — at compile time across module boundaries, with full intellisense as a side-effect. ESLint catches style and a few simple bugs (unused vars, no-unreachable); unit tests verify behaviour you remembered to test. TypeScript verifies that EVERY call site of EVERY function passes the right shape, every time, with zero runtime cost and no tests required. At Google scale, Microsoft reports TS prevents ~15% of bugs that would otherwise reach production.

**Q2: What is the ONE mental model that makes TypeScript click?**
> **A:** "Types are a parallel universe that describes the shape of values, erased before runtime." Every type — \`string\`, \`User\`, \`Promise<T>\`, \`keyof T\` — exists ONLY in the .ts source. The compiler reads the type universe, validates that your values are consistent, then THROWS THE TYPES AWAY. Output is plain ES2020+ JavaScript. Once you internalise the type/value split, you stop trying to do impossible things like \`if (typeof x === 'User')\` or storing types in variables.

**Q3: What is the most dangerous misconception about TypeScript? Show with code.**
> **A:** Believing TS checks types at runtime:
> \`\`\`ts
> // ❌ Wrong: assumes TS validates JSON at runtime
> interface User { name: string; age: number }
> const data: User = JSON.parse(apiResponse);   // TS trusts the cast — NO validation
> console.log(data.age.toFixed(2));   // 💥 if api sent age as a string
>
> // ✅ Right: use a runtime validator (zod, valibot, io-ts)
> import { z } from 'zod';
> const UserSchema = z.object({ name: z.string(), age: z.number() });
> const data = UserSchema.parse(JSON.parse(apiResponse));   // throws if invalid
> \`\`\`

**Q4: How does TypeScript interact with JavaScript's runtime at the engine level?**
> **A:** It doesn't — and that's the point. The TypeScript compiler (\`tsc\`) is a transpiler. It parses .ts, builds an AST, runs the type checker (which validates the type universe), emits .js with types stripped, and exits. V8 never sees a type. This is why decorators, enums, and namespaces — which DO emit runtime code — are different from regular type annotations: they have actual JS output. Pure types are zero bytes.

**Q5: One-sentence FAANG-grade definition?**
> **A:** "TypeScript is a structurally-typed, gradually-applied static type checker that transpiles to JavaScript — providing build-time type validation, IDE intellisense, and refactoring safety with zero runtime overhead, while requiring external runtime validators for any data crossing system boundaries (network, disk, user input)."`,
    build: `## BUILD

### 🏗️ Mini Project: Convert a Buggy JavaScript Module to TypeScript

**What you will build:** Take a real JavaScript user-service module with hidden bugs, convert it to TypeScript with proper types, and watch tsc surface the bugs at compile time.
**Why this project:** Forces you to see TS catch bugs that no JS tool would catch.
**Time estimate:** 25 minutes

---

#### Step 1 — Project Setup
\`\`\`bash
mkdir ts-intro && cd ts-intro
npm init -y
npm install --save-dev typescript @types/node
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/userService.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — The Module With Bugs (Typed Version)
\`\`\`ts
// src/userService.ts
export interface User {
  id: number;
  email: string;
  age: number;
  isAdmin: boolean;
}

export function findUser(users: User[], id: number): User | undefined {
  return users.find(u => u.id === id);
}

export function getDisplayName(user: User): string {
  // Bug in original JS: user.name didn't exist; original JS returned undefined silently
  return user.email.split('@')[0];
}

export function promoteToAdmin(user: User): User {
  return { ...user, isAdmin: true };
}
\`\`\`

#### Step 3 — Caller With a Type Mismatch
\`\`\`ts
// src/main.ts
import { findUser, getDisplayName, promoteToAdmin, type User } from './userService.js';

const users: User[] = [
  { id: 1, email: 'alice@dev.io', age: 30, isAdmin: false },
  { id: 2, email: 'bob@dev.io',   age: 25, isAdmin: false },
];

// TS will catch: "Argument of type 'string' is not assignable to type 'number'"
const found = findUser(users, '1');           // ❌ compile error
const promoted = promoteToAdmin({ id: 3, email: 'eve@dev.io' });  // ❌ missing age + isAdmin
console.log(getDisplayName(found));            // ❌ found can be undefined
\`\`\`

#### Step 4 — Error Handling: Fix Each Compile Error
\`\`\`ts
// src/main.ts (corrected)
const found = findUser(users, 1);
const promoted = promoteToAdmin({ id: 3, email: 'eve@dev.io', age: 28, isAdmin: false });
if (found) {
  console.log(getDisplayName(found));         // narrowed: now User, not User|undefined
} else {
  console.log('No user found');
}
\`\`\`

#### Step 5 — Tests + Verification
\`\`\`ts
// src/userService.test.ts
import { describe, it, expect } from 'vitest';
import { findUser, getDisplayName, promoteToAdmin } from './userService.js';

const sample = { id: 1, email: 'a@b.c', age: 20, isAdmin: false };

describe('userService', () => {
  it('findUser returns undefined for missing id', () => {
    expect(findUser([sample], 99)).toBeUndefined();
  });
  it('getDisplayName splits before @', () => {
    expect(getDisplayName(sample)).toBe('a');
  });
  it('promoteToAdmin sets isAdmin true (immutable)', () => {
    const promoted = promoteToAdmin(sample);
    expect(promoted.isAdmin).toBe(true);
    expect(sample.isAdmin).toBe(false);
  });
});
\`\`\`
\`\`\`bash
npx tsc --noEmit          # type check only
npx tsc                   # emit .js to dist/
node dist/main.js
\`\`\`

**Expected Output:**
\`\`\`
$ npx tsc --noEmit
src/main.ts:7:31 - error TS2345: Argument of type 'string' is not assignable to 'number'.
src/main.ts:8:35 - error TS2345: missing 'age', 'isAdmin'.
src/main.ts:9:27 - error TS2345: Argument of type 'undefined' is not assignable.
Found 3 errors.

# After fix:
$ npx tsc && node dist/main.js
alice
\`\`\`

**Stretch Challenges:**
- [ ] Enable \`"exactOptionalPropertyTypes": true\` and see what new errors appear
- [ ] Add a zod schema to validate User parsed from JSON at runtime
- [ ] Use \`satisfies\` to validate a literal without widening`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does TypeScript do at compile time vs runtime?
**Q2:** Name 3 things TypeScript catches that ESLint cannot.
**Q3:** Write a TS function \`add(a: number, b: number): number\`. From memory.

### Day 3 — Comprehension
**Q4:** Why doesn't \`typeof x === 'User'\` work for checking an interface?
**Q5:** A junior parses JSON with \`as User\` cast and gets runtime crashes. Diagnose.
**Q6:** Refactor this JS to TS, adding types:
\`\`\`js
function findById(items, id) { return items.find(i => i.id === id); }
\`\`\`

### Day 7 — Application
**Q7:** Convert a 50-line JS module to TS — what's the order of operations?
**Q8:** A PR adds \`any\` to silence an error. Why is this bad? Show the proper fix.
**Q9:** What is the cost of TS compilation on a 10k-file project? How is it mitigated?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every thing TypeScript validates and everything it doesn't validate."
**Q11:** Draw: how does the TS compilation pipeline (source → AST → check → emit) interact with the bundler?
**Q12:** ★ System design: "A 100-engineer team has 2M LOC of JavaScript. Plan the incremental TypeScript migration — what tools, what order, what risks?"`
  },

  // ── 2. basic-types ───────────────────────────────────────────────────────
  'basic-types': {
    feynman: `## FEYNMAN CHECK

### Explain TS Basic Types Like I'm 10 Years Old
> TypeScript's basic types are the LEGO BRICKS you build everything else from: \`string\`, \`number\` (no separate int/float — all numbers are 64-bit floats like JS), \`boolean\`, \`null\`, \`undefined\`, \`bigint\`, \`symbol\`, plus the special types \`any\` (escape hatch — disables checking), \`unknown\` (safe \`any\` — must narrow before use), \`void\` (function returns nothing), and \`never\` (function never returns — throws or loops forever). Literal types like \`'GET' | 'POST'\` are exact-string types — a variable typed \`'GET'\` can ONLY hold the string "GET". The non-obvious detail: when you write \`const x = "hi"\`, x is typed \`"hi"\` (literal). When you write \`let x = "hi"\`, x is typed \`string\` (widened) — because let can be reassigned.

---

### 5 Deep Conceptual Questions

**Q1: Why \`unknown\` instead of \`any\`?**
> **A:** \`any\` opts OUT of type checking — assigning \`any\` to anything works, calling \`.foo()\` on \`any\` is allowed. \`unknown\` keeps the type system honest — you can ASSIGN anything to unknown (it's a top type) but you can DO NOTHING with it until you NARROW it via \`typeof\` or \`instanceof\` or a custom type guard. Use \`unknown\` for JSON-parsed data, event payloads, and any input from outside your system; use \`any\` only as a temporary escape hatch during migration.

**Q2: Mental model for literal types?**
> **A:** A literal type is a type with EXACTLY ONE value. \`type Method = 'GET' | 'POST'\` is a union of two literal string types. Combined with \`const\` (which produces literal types) and \`as const\` (which makes objects deeply literal), you get exhaustive switch checking, autocomplete, and no string-typo bugs.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing \`null\` and \`undefined\` are interchangeable:
> \`\`\`ts
> // ❌ strict mode catches the difference
> interface User { name: string; phone: string | null }
> function call(u: User) {
>   if (u.phone) console.log(u.phone);    // OK
>   else console.log(u.phone.length);     // ❌ TS error: phone is null
> }
>
> // ✅ With strictNullChecks, null and undefined must be handled explicitly
> // Always prefer T | undefined for optionality; reserve T | null for "explicitly absent"
> \`\`\`

**Q4: How does \`never\` interact with type unions at compile time?**
> **A:** \`never\` is the EMPTY type — no value inhabits it. It's used as a return type for functions that throw or loop forever, and as the "default" in exhaustive switch checking: \`const _: never = x\` will compile only if x is \`never\` (i.e., all cases were handled). In unions, \`T | never\` simplifies to \`T\` — never is absorbed. Mapped types use \`never\` to FILTER keys: \`{ [K in keyof T as T[K] extends Function ? K : never]: T[K] }\` filters to only function-valued keys.

**Q5: FAANG-grade definition?**
> **A:** "TypeScript's primitive types map JavaScript's runtime types into the static type system, augmented by literal types (single-value subtypes of primitives), \`unknown\` (the safe top type requiring narrowing before use), \`never\` (the empty bottom type used for exhaustiveness checks), and special types \`any\` and \`void\` — all governed by strictNullChecks for null-safety and by literal widening rules in const vs let declarations."`,
    build: `## BUILD

### 🏗️ Mini Project: Type-Safe HTTP Client With Method Literals + Unknown JSON

**What you will build:** A fetch wrapper where the HTTP method is a literal union (\`'GET' | 'POST' | 'PUT' | 'DELETE'\`), responses are \`unknown\` until validated, and error states are exhaustively handled with \`never\`.
**Why this project:** Forces literal types, unknown narrowing, exhaustiveness checking — all in one tiny project.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-basic-types && cd ts-basic-types
npm init -y && npm install -D typescript
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/http.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — Type-Safe HTTP Client
\`\`\`ts
// src/http.ts
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type FetchResult =
  | { kind: 'ok'; data: unknown }
  | { kind: 'http_error'; status: number; message: string }
  | { kind: 'network_error'; cause: Error };

export async function request(
  method: Method,
  url: string,
  body?: unknown,            // unknown forces caller to be intentional
): Promise<FetchResult> {
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      return { kind: 'http_error', status: res.status, message: res.statusText };
    }
    const data: unknown = await res.json();
    return { kind: 'ok', data };
  } catch (e) {
    return { kind: 'network_error', cause: e as Error };
  }
}
\`\`\`

#### Step 3 — Caller With Exhaustive Switch
\`\`\`ts
// src/main.ts
import { request, type FetchResult } from './http.js';

function describe(result: FetchResult): string {
  switch (result.kind) {
    case 'ok':            return \`OK — body has \${JSON.stringify(result.data).length} bytes\`;
    case 'http_error':    return \`HTTP \${result.status}: \${result.message}\`;
    case 'network_error': return \`Network failure: \${result.cause.message}\`;
    default: {
      const _exhaustive: never = result;   // compile error if a kind was added but not handled
      return _exhaustive;
    }
  }
}

const r = await request('GET', 'https://api.github.com/users/torvalds');
console.log(describe(r));
\`\`\`

#### Step 4 — Error Handling: Narrow \`unknown\` Data Safely
\`\`\`ts
function isUserShape(x: unknown): x is { login: string; id: number } {
  return typeof x === 'object' && x !== null
      && 'login' in x && typeof (x as { login: unknown }).login === 'string'
      && 'id' in x    && typeof (x as { id:    unknown }).id    === 'number';
}

if (r.kind === 'ok' && isUserShape(r.data)) {
  console.log('GitHub login:', r.data.login, 'id:', r.data.id);
}
\`\`\`

#### Step 5 — Tests
\`\`\`ts
// src/http.test.ts
import { describe, it, expect } from 'vitest';
import { request } from './http.js';

describe('request', () => {
  it('returns http_error on 404', async () => {
    const r = await request('GET', 'https://httpstat.us/404');
    expect(r.kind).toBe('http_error');
    if (r.kind === 'http_error') expect(r.status).toBe(404);
  });
  it('returns network_error on bogus URL', async () => {
    const r = await request('GET', 'http://no-such-host.invalid');
    expect(r.kind).toBe('network_error');
  });
  it('rejects invalid Method at compile time', () => {
    // @ts-expect-error — 'PATCH' not in Method union
    request('PATCH', '/api');
  });
});
\`\`\`

**Expected Output:**
\`\`\`
OK — body has 1245 bytes
GitHub login: torvalds id: 1024025

# tsc must show error if you add a new kind without updating describe():
src/main.ts:13:12 - error TS2322: Type '{ kind: "timeout" }' is not assignable to type 'never'.
\`\`\`

**Stretch Challenges:**
- [ ] Add a \`'timeout'\` variant and confirm the never check fires
- [ ] Replace the hand-written guard with a zod schema
- [ ] Make \`request\` generic: \`<T>(...): Promise<FetchResult<T>>\` and require a validator`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between \`unknown\` and \`any\`?
**Q2:** What does \`as const\` do? Show with a 2-line example.
**Q3:** Write a literal-union type for HTTP methods. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`const x = 'hi'\` get type \`'hi'\` while \`let x = 'hi'\` gets type \`string\`?
**Q5:** A function returns \`null\` for "not found" — what should the return type be in strict mode?
**Q6:** Refactor to use \`unknown\` instead of \`any\`:
\`\`\`ts
function parse(json: string): any { return JSON.parse(json); }
\`\`\`

### Day 7 — Application
**Q7:** Build a typed event bus where event names are a literal union and payloads are inferred per name.
**Q8:** A PR has \`switch (x.kind)\` without exhaustiveness check. Show how \`never\` catches a missing case.
**Q9:** When should you use \`null\` vs \`undefined\` in TS API design?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through TypeScript's type hierarchy — top, bottom, primitives, literals."
**Q11:** Draw: how do literal widening, const assertions, and \`satisfies\` interact?
**Q12:** ★ System design: "Design the type API for a multi-tenant SaaS where tenant IDs, user IDs, and resource IDs are all numbers but MUST NOT be mixed up at compile time."`
  },

  // ── 3. arrays-and-tuples ─────────────────────────────────────────────────
  'arrays-and-tuples': {
    feynman: `## FEYNMAN CHECK

### Explain Arrays & Tuples Like I'm 10 Years Old
> An ARRAY in TS is a list where every element has the SAME type and the length can change: \`number[]\` or \`Array<number>\`. A TUPLE is a list where each POSITION has a specific type and the length is fixed: \`[string, number, boolean]\`. Tuples are perfect for "named returns" — \`useState\` returns \`[T, (next: T) => void]\` — a fixed pair where position 0 is the value and position 1 is the setter. Variadic tuples (TS 4.0+) let you express things like "an array starting with a string followed by any numbers" \`[string, ...number[]]\`. The non-obvious power: \`as const\` on a tuple LITERAL turns \`[1,2,3]\` from \`number[]\` into \`readonly [1, 2, 3]\` — a fully literal, frozen tuple usable as a type.

---

### 5 Deep Conceptual Questions

**Q1: When do you choose a tuple over an array?**
> **A:** Use a tuple when POSITION CARRIES MEANING and the length is known. \`[string, number]\` for "name + age", or \`[Promise<T>, AbortController]\` for "result + canceler". Use an array when items are interchangeable. The bug they prevent: \`const [val, set] = useState(0)\` would silently swap if \`useState\` returned \`(string|function)[]\` — the tuple type enforces that position 0 is the value.

**Q2: Mental model for variadic tuples?**
> **A:** A variadic tuple lets you SPREAD types: \`type WithName<T extends unknown[]> = [string, ...T]\`. This is how TS types functions like \`pipe(a, b, c, d, ...)\` where the output of one function feeds the next. It's also how \`Parameters<F>\` becomes useful — it's a tuple type, so you can prepend, append, or slice it.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing arrays in TS prevent index-out-of-bounds:
> \`\`\`ts
> // ❌ No bounds check — TS infers arr[99] as string, but it's actually undefined
> const arr: string[] = ['a', 'b'];
> const x = arr[99];                  // type 'string', value undefined → 💥
>
> // ✅ Use noUncheckedIndexedAccess for safety
> // "noUncheckedIndexedAccess": true in tsconfig
> const x = arr[99];                  // now type 'string | undefined'
> if (x) console.log(x.toUpperCase());
> \`\`\`

**Q4: How do readonly arrays and tuples differ at runtime?**
> **A:** Identical — readonly is a COMPILE-TIME only modifier. \`readonly number[]\` and \`ReadonlyArray<number>\` and \`readonly [1,2,3]\` all compile to the same JS as their mutable versions; only the compiler refuses \`.push\`, index assignment, etc. Use \`Object.freeze\` for actual runtime immutability. The reason readonly matters: it prevents bugs from cross-module mutation and enables better type inference.

**Q5: FAANG-grade definition?**
> **A:** "TypeScript arrays are homogeneous mutable lists typed as \`T[]\` or \`Array<T>\`; tuples are heterogeneous fixed-length (or variadic) lists where each position has its own type — both compile to identical JavaScript arrays at runtime, with readonly modifiers and \`as const\` assertions providing compile-time immutability and literal-type inference."`,
    build: `## BUILD

### 🏗️ Mini Project: Type-Safe Pipe Function Using Variadic Tuples

**What you will build:** A \`pipe\` function where the TYPE of the result is inferred from the chain of functions — output of \`f\` flows into input of \`g\`, with TS validating compatibility at every step.
**Why this project:** Forces variadic tuples, generic inference, and recursive types — the techniques behind RxJS, Redux Toolkit, and Lodash's typed fp.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-tuples && cd ts-tuples
npm init -y && npm install -D typescript
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/pipe.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — Variadic Pipe With Tuple Magic
\`\`\`ts
// src/pipe.ts
// Recursive helper: given a tuple of functions, validate input→output chain
type Chain<Fns extends readonly unknown[], Last = unknown> =
  Fns extends readonly [(arg: infer A) => infer B, ...infer Rest]
    ? readonly [(arg: A) => B, ...Chain<Rest, B>]
    : readonly [];

// Get the final output type
type ChainOutput<Fns> =
  Fns extends readonly [...unknown[], (arg: unknown) => infer Out] ? Out : never;

export function pipe<Fns extends readonly ((arg: any) => any)[]>(
  ...fns: Chain<Fns> extends Fns ? Fns : Chain<Fns>
): (input: Parameters<Fns[0]>[0]) => ChainOutput<Fns> {
  return (input) => fns.reduce((acc: unknown, fn) => fn(acc), input) as ChainOutput<Fns>;
}
\`\`\`

#### Step 3 — Use It With Compile-Time Validation
\`\`\`ts
// src/main.ts
import { pipe } from './pipe.js';

const double = (n: number) => n * 2;
const toStr  = (n: number) => n.toString();
const length = (s: string) => s.length;

const run = pipe(double, toStr, length);   // (input: number) => number
console.log(run(5));   // 1 — "10".length

// ❌ TS rejects chains that don't type-check
// const broken = pipe(double, length);   // length expects string, double returns number
\`\`\`

#### Step 4 — Error Handling: useState-like Tuple Pair
\`\`\`ts
type UseState<T> = readonly [T, (next: T | ((prev: T) => T)) => void];

export function useState<T>(initial: T): UseState<T> {
  let value = initial;
  const setter = (next: T | ((prev: T) => T)) => {
    value = typeof next === 'function' ? (next as (p: T) => T)(value) : next;
  };
  return [value, setter] as const;
}

// Caller — tuple destructuring with full type safety
const [count, setCount] = useState(0);
setCount(c => c + 1);
// setCount('hi');   // ❌ TS error: string not assignable to number
\`\`\`

#### Step 5 — Tests
\`\`\`ts
import { describe, it, expect } from 'vitest';
import { pipe, useState } from './pipe.js';

describe('pipe', () => {
  it('chains functions left-to-right', () => {
    const run = pipe((n: number) => n + 1, (n: number) => n * 2);
    expect(run(3)).toBe(8);
  });
  it('preserves types end-to-end', () => {
    const run = pipe((s: string) => s.length, (n: number) => n > 0);
    const r: boolean = run('hi');
    expect(r).toBe(true);
  });
});

describe('useState', () => {
  it('returns a tuple', () => {
    const [v, set] = useState(10);
    expect(v).toBe(10);
    expect(typeof set).toBe('function');
  });
});
\`\`\`

**Expected Output:**
\`\`\`
2     # from pipe(double, toStr, length)(5) = '10'.length = 2
1     # from useState counter

# tsc rejects mismatched chains:
src/main.ts:12:35 - error TS2345: Argument of type '(s: string) => number' is not assignable to '(arg: number) => any'.
\`\`\`

**Stretch Challenges:**
- [ ] Add an async \`pipeP\` variant that types Promise unwrapping at each step
- [ ] Implement \`flow\` (same as pipe but accepts a single tuple argument)
- [ ] Add overloads for 1-10 arguments and compare with the variadic version`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between \`number[]\` and \`[number, number]\`?
**Q2:** What does \`readonly\` mean for an array at runtime vs compile time?
**Q3:** Write a tuple type for \`[name: string, age: number]\` (labelled). From memory.

### Day 3 — Comprehension
**Q4:** When does \`as const\` change array inference? Show a 2-line example.
**Q5:** Why is \`useState\` typed as a tuple, not an object \`{ value, setValue }\`?
**Q6:** Refactor for safer indexing:
\`\`\`ts
const arr: number[] = [1, 2, 3];
const first = arr[10].toFixed(2);
\`\`\`

### Day 7 — Application
**Q7:** Build a typed \`zip\` function that takes 2-3 arrays and returns tuples preserving types.
**Q8:** A PR types React's \`useState\` as \`{value, set}\` — explain why the tuple form matters.
**Q9:** What does \`noUncheckedIndexedAccess\` cost in DX? When is it worth turning on?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how Redux Toolkit types its slice reducers using tuples + variadic generics."
**Q11:** Draw: how does \`...T\` in tuple types interact with function-Parameters inference?
**Q12:** ★ System design: "Type the public API of a typed RPC framework where each endpoint defines [input tuple, output type, errors]."`
  },

  // ── 4. objects-and-interfaces ────────────────────────────────────────────
  'objects-and-interfaces': {
    feynman: `## FEYNMAN CHECK

### Explain Objects & Interfaces Like I'm 10 Years Old
> An OBJECT TYPE describes the SHAPE of a JS object — its property names and the type of each value. \`interface\` and \`type\` are two ways to declare the same thing 95% of the time. Interfaces support DECLARATION MERGING (multiple \`interface User {...}\` statements combine into one) — useful for augmenting library types. Types (\`type X = {...}\`) cannot merge but CAN use unions, intersections, conditional types, mapped types — the full type-programming arsenal. TypeScript uses STRUCTURAL TYPING: if two objects have the same shape, they're compatible, even if their declarations are different. This is why "duck typing" works at compile time — if it has the right properties, TS treats it as the right type.

---

### 5 Deep Conceptual Questions

**Q1: When do you choose \`interface\` over \`type\`?**
> **A:** Choose \`interface\` for OBJECT-SHAPE types that other code may need to AUGMENT — public-facing APIs, things consumers extend. Choose \`type\` for everything else, especially unions, intersections, conditional types, mapped types, or any non-object shape. The performance difference is negligible. The merging behaviour of interfaces is both a feature (extending Window, Express Request) and a footgun (accidental cross-file merges).

**Q2: Mental model for structural typing?**
> **A:** TS checks "does object X have everything Y needs?" not "was X declared as Y?". If \`function greet(p: { name: string })\` and you pass \`{ name: 'Alice', age: 30 }\`, it works — \`age\` is extra but \`name\` is present. This is called STRUCTURAL ASSIGNABILITY. It enables enormous flexibility (no interface inheritance needed) but means you cannot prevent "duck-shaped" misuse without nominal-typing tricks (branded types).

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing excess properties are always allowed:
> \`\`\`ts
> interface User { name: string }
> function greet(u: User) { console.log(u.name); }
>
> // ❌ Direct literal: excess property check kicks in
> greet({ name: 'a', age: 99 });   // TS error: 'age' does not exist on User
>
> // ✅ Via variable: excess properties allowed (structural typing)
> const obj = { name: 'a', age: 99 };
> greet(obj);                       // OK — obj satisfies User's shape
> \`\`\`

**Q4: How do index signatures interact with named properties?**
> **A:** An index signature \`[key: string]: number\` says "any string key maps to a number." Every NAMED property must be assignable to that index type — \`{ name: string; [k: string]: number }\` is invalid because name is string but the index says number. Modern alternative: \`Record<string, number>\` or for partial dynamism use \`{ name: string } & { [k in Exclude<string, 'name'>]?: number }\`.

**Q5: FAANG-grade definition?**
> **A:** "TypeScript object types describe the structural shape of JavaScript objects via interfaces (which support declaration merging and extends-based inheritance) or type aliases (which support unions, intersections, and the full type-algebra), with structural assignability governing compatibility, excess-property checks tightening literal arguments, and index signatures expressing dynamic-key shapes — all erased at runtime to plain JS objects."`,
    build: `## BUILD

### 🏗️ Mini Project: Branded ID Types For a Multi-Tenant SaaS

**What you will build:** A type system where \`UserId\`, \`TenantId\`, and \`OrgId\` are all numbers at runtime but MUTUALLY INCOMPATIBLE at compile time — preventing the most common production data-leak bug in B2B SaaS.
**Why this project:** Forces interfaces, intersection types, branded types, and structural-vs-nominal reasoning.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-objects && cd ts-objects
npm init -y && npm install -D typescript
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/ids.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — Branded ID Types
\`\`\`ts
// src/ids.ts
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

export type UserId   = Brand<number, 'UserId'>;
export type TenantId = Brand<number, 'TenantId'>;
export type OrgId    = Brand<number, 'OrgId'>;

// Constructors — the ONLY way to create a branded value
export const UserId   = (n: number): UserId   => n as UserId;
export const TenantId = (n: number): TenantId => n as TenantId;
export const OrgId    = (n: number): OrgId    => n as OrgId;
\`\`\`

#### Step 3 — Repository Interface That Enforces Tenant Isolation
\`\`\`ts
// src/userRepo.ts
import { UserId, TenantId } from './ids.js';

export interface User {
  id: UserId;
  tenantId: TenantId;
  email: string;
}

export interface UserRepo {
  findById(tenantId: TenantId, userId: UserId): Promise<User | undefined>;
  list(tenantId: TenantId): Promise<User[]>;
}

// In-memory implementation
export const fakeRepo: UserRepo = {
  async findById(tenantId, userId) {
    return { id: userId, tenantId, email: \`u\${userId}@t\${tenantId}.io\` };
  },
  async list(tenantId) {
    return [{ id: UserId(1), tenantId, email: 'one@x.io' }];
  },
};
\`\`\`

#### Step 4 — Error Handling: Wrong-ID Bug Caught at Compile Time
\`\`\`ts
// src/main.ts
import { UserId, TenantId } from './ids.js';
import { fakeRepo } from './userRepo.js';

const t = TenantId(42);
const u = UserId(1);

await fakeRepo.findById(t, u);     // ✅ OK

// ❌ Common production bug: ID mix-up
// await fakeRepo.findById(u, t);
// → TS error: 'UserId' is not assignable to 'TenantId'

// ❌ Even plain number doesn't work
// await fakeRepo.findById(42, 1);
// → TS error: number is not assignable to TenantId

// ✅ Forced through constructor → impossible to typo
await fakeRepo.findById(TenantId(42), UserId(1));
\`\`\`

#### Step 5 — Tests
\`\`\`ts
import { describe, it, expect } from 'vitest';
import { UserId, TenantId } from './ids.js';
import { fakeRepo } from './userRepo.js';

describe('branded ids', () => {
  it('runtime values are plain numbers', () => {
    expect(typeof UserId(7)).toBe('number');
    expect(UserId(7)).toBe(7);
  });
  it('compile-time prevents mix-ups', () => {
    // Verified by @ts-expect-error in actual call sites
    expect(true).toBe(true);
  });
  it('repo accepts branded ids', async () => {
    const u = await fakeRepo.findById(TenantId(1), UserId(99));
    expect(u?.id).toBe(99);
    expect(u?.tenantId).toBe(1);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
# All three guard-rails active:
src/main.ts:11:32 - error TS2345: 'UserId' is not assignable to 'TenantId'.
src/main.ts:14:30 - error TS2345: number is not assignable to TenantId.

# Runtime — branded types vanish, just plain numbers:
{ id: 99, tenantId: 1, email: 'u99@t1.io' }
\`\`\`

**Stretch Challenges:**
- [ ] Add \`PaymentId\` and a function \`refund(payment: PaymentId)\` — verify it can't accept UserId
- [ ] Add zod schemas that produce branded types only after validation
- [ ] Profile compile-time overhead of branded types on a 100-file project`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between \`interface\` and \`type\`?
**Q2:** What is structural typing? Give a 3-line example.
**Q3:** Write an interface for a User with id (number), name (string), and optional email. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`{name:'a',age:99}\` work as a User in some cases but not others (excess property check)?
**Q5:** When would declaration merging save you? Show an example with Express \`Request\`.
**Q6:** Refactor for nominal typing:
\`\`\`ts
type UserId = number;
type OrgId = number;
function ban(userId: UserId, orgId: OrgId) { /* ... */ }
ban(orgId, userId);  // accidentally swapped — currently allowed
\`\`\`

### Day 7 — Application
**Q7:** Build a typed Repository pattern for two entities, enforcing tenant isolation via branded IDs.
**Q8:** A PR uses \`any\` for object payloads — show three concrete bugs branded types would catch.
**Q9:** Performance: how do branded types affect compile speed vs raw numbers?

### Day 14 — Synthesis
**Q10:** ★ Interview: "When should you use interfaces vs type aliases in a public TypeScript library?"
**Q11:** Draw: how does structural assignability differ from nominal subtyping (Java)?
**Q12:** ★ System design: "Type the data layer for a multi-tenant SaaS — IDs, foreign keys, query builders — preventing cross-tenant leaks at compile time."`
  },

  // ── 5. functions-ts ──────────────────────────────────────────────────────
  'functions-ts': {
    feynman: `## FEYNMAN CHECK

### Explain TS Functions Like I'm 10 Years Old
> A function type captures three things: PARAMETER types, RETURN type, and (sometimes) THIS type. \`(x: number, y: number) => number\` is a function type. TS supports OVERLOADS — multiple signatures for the same function — when one body handles several call patterns (\`document.createElement('div')\` returns HTMLDivElement, while \`document.createElement('a')\` returns HTMLAnchorElement). Variance matters: parameter types are CONTRAVARIANT (a function accepting \`Animal\` can be used where \`Dog\` is expected, NOT the other way), and return types are COVARIANT (a function returning \`Dog\` can be used where \`Animal\` is expected). The non-obvious detail: with \`strictFunctionTypes: false\` (default in non-strict), parameter variance becomes bivariant — a major source of subtle bugs.

---

### 5 Deep Conceptual Questions

**Q1: What problem do function overloads solve?**
> **A:** A single function signature can't express "if input is A, output is X; if input is B, output is Y." Overloads let you declare multiple input→output relationships, then write ONE implementation that handles all cases. DOM \`createElement\`, array \`reduce\`, and Lodash's \`_.get\` rely heavily on overloads. The 2024 alternative is to use CONDITIONAL types or function-generic constraints, which are often cleaner but harder to read for juniors.

**Q2: Mental model for parameter variance?**
> **A:** A function is "more permissive" (subtype) when it ACCEPTS MORE inputs and RETURNS LESS. \`(a: Animal) => Animal\` is a subtype of \`(a: Dog) => Mammal\` because Animal-accepting is broader than Dog-accepting (any caller passing a Dog is satisfied), and Mammal-returning is narrower than Animal-returning (any caller expecting Animal is satisfied). This is contravariance in parameters + covariance in returns = the Liskov Substitution Principle for functions.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing optional parameters are the same as defaults:
> \`\`\`ts
> // ❌ Optional: type includes undefined
> function greet(name?: string) { return \`Hi, \${name.toUpperCase()}\`; }   // 💥 if undefined
>
> // ✅ Default: type does NOT include undefined inside body
> function greet(name: string = 'guest') { return \`Hi, \${name.toUpperCase()}\`; }
>
> // ❌ Optional with default is still optional at call site, but inside the body it's defined
> function greet(name?: string = 'guest') { /* SyntaxError */ }
> \`\`\`

**Q4: How do generic functions infer types from arguments?**
> **A:** TS runs an INFERENCE algorithm: for each generic param, it looks at all places that param is used, gathers candidates from actual arguments, and unifies them. \`function pick<K extends keyof T, T>(obj: T, key: K)\` — when you call \`pick({a:1, b:2}, 'a')\`, TS infers T from obj's shape, K from the literal 'a' (narrowed to 'a' because the literal type was inferred). This is why type-parameter ORDER matters and why \`extends\` clauses act as both constraint and inference hint.

**Q5: FAANG-grade definition?**
> **A:** "A TypeScript function type is a signature \`(params) => return\` with contravariant parameter assignability and covariant return assignability under strictFunctionTypes — supporting overloads via multiple signatures + single implementation, generic inference via call-site argument unification, and rest/spread typed via tuple types — collectively enabling polymorphic APIs without runtime cost."`,
    build: `## BUILD

### 🏗️ Mini Project: Type-Safe Event Emitter With Inferred Payload Types

**What you will build:** A generic EventEmitter where \`.emit('user:login', payload)\` and \`.on('user:login', handler)\` are type-checked — wrong event name fails to compile, wrong payload shape fails to compile, handler receives correctly-typed payload.
**Why this project:** Forces generics with constraints, function types with inference, conditional types, and overloads.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-functions && cd ts-functions
npm init -y && npm install -D typescript
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/emitter.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — Typed EventEmitter
\`\`\`ts
// src/emitter.ts
export type EventMap = Record<string, unknown>;

export class TypedEmitter<E extends EventMap> {
  private listeners = new Map<keyof E, Array<(payload: any) => void>>();

  on<K extends keyof E>(event: K, handler: (payload: E[K]) => void): () => void {
    const list = this.listeners.get(event) ?? [];
    list.push(handler);
    this.listeners.set(event, list);
    // Returns a disposer — call to unsubscribe
    return () => {
      const next = (this.listeners.get(event) ?? []).filter(h => h !== handler);
      this.listeners.set(event, next);
    };
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    for (const h of this.listeners.get(event) ?? []) h(payload);
  }
}
\`\`\`

#### Step 3 — Define App Events
\`\`\`ts
// src/main.ts
import { TypedEmitter } from './emitter.js';

interface AppEvents {
  'user:login':  { userId: number; ts: number };
  'user:logout': { userId: number };
  'order:paid':  { orderId: string; amount: number; currency: 'USD' | 'EUR' };
}

const bus = new TypedEmitter<AppEvents>();

// Handler payload type is INFERRED from the event name literal
bus.on('user:login', (p) => {
  console.log(\`User \${p.userId} logged in at \${new Date(p.ts).toISOString()}\`);
});

bus.on('order:paid', (p) => {
  console.log(\`Order \${p.orderId}: \${p.amount} \${p.currency}\`);
});

bus.emit('user:login', { userId: 42, ts: Date.now() });
bus.emit('order:paid', { orderId: 'ORD-1', amount: 99, currency: 'USD' });
\`\`\`

#### Step 4 — Error Handling: Compile-Time Guard-Rails
\`\`\`ts
// ❌ Wrong event name
// bus.emit('user:foo', {} as any);    // TS2345: not assignable to '"user:login"|"user:logout"|"order:paid"'

// ❌ Wrong payload shape
// bus.emit('user:login', { userId: 'oops' });   // userId must be number

// ❌ Wrong currency literal
// bus.emit('order:paid', { orderId: 'X', amount: 1, currency: 'GBP' });   // 'GBP' not in 'USD'|'EUR'

// ✅ Disposers
const off = bus.on('user:logout', (p) => console.log('bye', p.userId));
off();   // unsubscribed
\`\`\`

#### Step 5 — Tests
\`\`\`ts
import { describe, it, expect, vi } from 'vitest';
import { TypedEmitter } from './emitter.js';

interface E { ping: { n: number } }

describe('TypedEmitter', () => {
  it('delivers payloads to handlers', () => {
    const bus = new TypedEmitter<E>();
    const spy = vi.fn();
    bus.on('ping', spy);
    bus.emit('ping', { n: 7 });
    expect(spy).toHaveBeenCalledWith({ n: 7 });
  });
  it('disposer removes the handler', () => {
    const bus = new TypedEmitter<E>();
    const spy = vi.fn();
    const off = bus.on('ping', spy);
    off();
    bus.emit('ping', { n: 1 });
    expect(spy).not.toHaveBeenCalled();
  });
  it('multiple handlers fire in registration order', () => {
    const bus = new TypedEmitter<E>();
    const calls: number[] = [];
    bus.on('ping', () => calls.push(1));
    bus.on('ping', () => calls.push(2));
    bus.emit('ping', { n: 0 });
    expect(calls).toEqual([1, 2]);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
User 42 logged in at 2026-06-26T08:15:00.000Z
Order ORD-1: 99 USD

# tsc rejects misuse:
src/main.ts:18:11 - error TS2345: '"user:foo"' is not assignable to keyof AppEvents.
src/main.ts:21:33 - error TS2322: Type 'string' is not assignable to 'number'.
src/main.ts:23:64 - error TS2322: '"GBP"' is not assignable to '"USD" | "EUR"'.
\`\`\`

**Stretch Challenges:**
- [ ] Add an \`once\` method that auto-disposes after the first emit
- [ ] Add wildcard listener \`on('*', handler)\` typed as a union of all payloads
- [ ] Add async emit that awaits all handlers and aggregates errors`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between optional parameter (\`x?: T\`) and default parameter (\`x: T = ...\`)?
**Q2:** What does \`strictFunctionTypes\` change about parameter assignability?
**Q3:** Write a generic identity function \`identity<T>(x: T): T\`. From memory.

### Day 3 — Comprehension
**Q4:** Explain covariance and contravariance with a Dog/Animal example.
**Q5:** A function overload silently picks the wrong signature — diagnose with an example.
**Q6:** Refactor to a single generic instead of overloads:
\`\`\`ts
function wrap(x: string): { value: string };
function wrap(x: number): { value: number };
function wrap(x: any): any { return { value: x }; }
\`\`\`

### Day 7 — Application
**Q7:** Build a typed routing API where path params are inferred from path string literal (\`'/users/:id'\` infers \`{ id: string }\`).
**Q8:** A PR uses \`Function\` as a type — explain why it's almost always wrong and what to use instead.
**Q9:** How does TS infer a generic when you DON'T pass type arguments? When does inference fail?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how Express's Request type is augmented by middleware in TypeScript."
**Q11:** Draw: how do overloads, generics, and conditional types relate as alternatives for polymorphism?
**Q12:** ★ System design: "Type the public API of a serverless function framework where handlers describe their event source, input schema, and output schema as types."`
  },

  // ── 6. union-and-intersection ────────────────────────────────────────────
  'union-and-intersection': {
    feynman: `## FEYNMAN CHECK

### Explain Unions & Intersections Like I'm 10 Years Old
> A UNION (\`A | B\`) says "this value is EITHER an A OR a B." You can only use what's COMMON to both until you narrow it. An INTERSECTION (\`A & B\`) says "this value is BOTH an A AND a B simultaneously" — must have ALL properties of both. Unions describe ALTERNATIVES (a Response is success OR error); intersections describe COMBINATIONS (a User & Admin has all user props plus admin props). The non-obvious twist: unions are like "or", but on object types you can only access the INTERSECTION of their properties (the common subset) — opposite of intuition. \`(Cat | Dog).bark()\` fails because not every member has bark; you must narrow with \`in 'bark'\` or a discriminant first.

---

### 5 Deep Conceptual Questions

**Q1: What problem do discriminated unions solve?**
> **A:** Modelling "one of N variants" with type-safe access. \`type Result = { kind: 'ok'; data: T } | { kind: 'err'; error: E }\` lets TS NARROW the type based on the \`kind\` literal: inside \`if (r.kind === 'ok')\`, TS knows r is the ok branch with \`data\` available. This eliminates null-check chains, makes pattern matching exhaustive (with \`never\` guards), and replaces error-prone \`if (err) ... else ...\` shapes with provably correct switch statements.

**Q2: Mental model for union narrowing?**
> **A:** TS uses CONTROL FLOW ANALYSIS — it tracks the type at every point based on the runtime checks you've performed. \`typeof x === 'string'\` narrows to string. \`'foo' in x\` narrows to objects with foo. \`x.kind === 'ok'\` narrows discriminated unions. The compiler runs this in your IDE in real-time. The narrowed type is REVERTED when you assign to the variable or call a function that mutates it.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing intersection of incompatible types is allowed:
> \`\`\`ts
> // ❌ Looks fine but produces \`never\`
> type Impossible = string & number;   // type is \`never\`
> const x: Impossible = ???;            // can't construct one
>
> // ❌ Mixing literal unions with intersection sneakily
> type WrongStatus = ('a' | 'b') & ('b' | 'c');   // narrows to 'b' only
>
> // ✅ Use union when alternatives, intersection when combining
> type LoggableUser = User & { log: () => void };
> \`\`\`

**Q4: How does narrowing interact with closures at runtime?**
> **A:** TS's control flow analysis is INTRA-FUNCTION. If you narrow \`x: string | null\` to string and then put \`() => x.length\` in a callback, TS may RE-WIDEN x to the original union inside the callback (because the callback could run later, after x changed). The fix is to capture the narrowed value in a const: \`const s = x; if (s) callback(() => s.length)\` — now s is provably \`string\` for the closure's lifetime.

**Q5: FAANG-grade definition?**
> **A:** "Union types (\`A | B\`) describe values that inhabit either type, accessing only the intersection of their public surface until narrowed; intersection types (\`A & B\`) describe values that simultaneously satisfy both type constraints — control-flow analysis narrows unions via typeof, instanceof, 'in', and discriminant property checks, producing the exhaustiveness guarantees that underpin algebraic data types (ADTs) in TypeScript."`,
    build: `## BUILD

### 🏗️ Mini Project: Result Monad For Type-Safe Error Handling

**What you will build:** A \`Result<T, E>\` discriminated union that replaces try/catch in app code, with helpers \`ok\`, \`err\`, \`map\`, \`mapErr\`, and \`unwrap\` — the same pattern Rust uses.
**Why this project:** Forces discriminated unions, narrowing, generics, and never-based exhaustiveness — the foundation of safe TS error handling.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-result && cd ts-result
npm init -y && npm install -D typescript vitest
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/result.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — The Result Type
\`\`\`ts
// src/result.ts
export type Result<T, E> =
  | { kind: 'ok';  value: T }
  | { kind: 'err'; error: E };

export const ok  = <T>(value: T): Result<T, never> => ({ kind: 'ok',  value });
export const err = <E>(error: E): Result<never, E> => ({ kind: 'err', error });

export function map<T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> {
  return r.kind === 'ok' ? ok(fn(r.value)) : r;
}

export function mapErr<T, E, F>(r: Result<T, E>, fn: (e: E) => F): Result<T, F> {
  return r.kind === 'err' ? err(fn(r.error)) : r;
}

export function flatMap<T, U, E>(r: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> {
  return r.kind === 'ok' ? fn(r.value) : r;
}

export function unwrap<T, E>(r: Result<T, E>): T {
  if (r.kind === 'ok') return r.value;
  throw new Error(\`unwrap on err: \${JSON.stringify(r.error)}\`);
}
\`\`\`

#### Step 3 — Use It (Replace try/catch)
\`\`\`ts
// src/main.ts
import { ok, err, map, flatMap, type Result } from './result.js';

type ApiError = { code: 'NOT_FOUND' | 'NETWORK' | 'INVALID'; message: string };

function fetchUser(id: number): Result<{ id: number; name: string }, ApiError> {
  if (id <= 0)         return err({ code: 'INVALID',   message: 'id must be positive' });
  if (id === 999)      return err({ code: 'NOT_FOUND', message: 'no such user' });
  return ok({ id, name: \`User \${id}\` });
}

const r = flatMap(fetchUser(42), u => ok({ ...u, name: u.name.toUpperCase() }));

// Exhaustive switch — TS forces handling both branches
switch (r.kind) {
  case 'ok':  console.log('Got:', r.value); break;
  case 'err': console.log('Failed:', r.error.code, '-', r.error.message); break;
}
\`\`\`

#### Step 4 — Error Handling: Exhaustiveness Check
\`\`\`ts
function describeError(e: ApiError): string {
  switch (e.code) {
    case 'NOT_FOUND': return 'Resource missing';
    case 'NETWORK':   return 'Try again later';
    case 'INVALID':   return e.message;
    default: {
      const _: never = e.code;   // catches missed cases at compile time
      return _;
    }
  }
}
\`\`\`

#### Step 5 — Tests
\`\`\`ts
import { describe, it, expect } from 'vitest';
import { ok, err, map, flatMap, unwrap } from './result.js';

describe('Result', () => {
  it('map transforms ok value', () => {
    expect(map(ok(2), n => n * 10)).toEqual({ kind: 'ok', value: 20 });
  });
  it('map skips err', () => {
    expect(map(err('boom'), (n: number) => n * 10)).toEqual({ kind: 'err', error: 'boom' });
  });
  it('flatMap chains results', () => {
    const r = flatMap(ok(2), n => n > 0 ? ok(n * 2) : err('neg'));
    expect(r).toEqual({ kind: 'ok', value: 4 });
  });
  it('unwrap throws on err', () => {
    expect(() => unwrap(err('x'))).toThrow();
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Got: { id: 42, name: 'USER 42' }

# Exhaustiveness check fires if you add a new ApiError code:
src/main.ts:25:21 - error TS2322: Type '"TIMEOUT"' is not assignable to type 'never'.
\`\`\`

**Stretch Challenges:**
- [ ] Add an \`asyncMap\` for Promise-wrapped Results
- [ ] Add \`Result.all([r1, r2, r3])\` that combines multiple Results
- [ ] Compare Result with Promise.allSettled — when is each better?`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between \`A | B\` and \`A & B\`?
**Q2:** Why can't you call \`.bar()\` on \`{a:1} | {b:2}\` without narrowing?
**Q3:** Write a discriminated union for \`Loading | Loaded | Error\`. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`'a' | 'b' & 'b' | 'c'\` reduce to \`'a' | 'b' | 'c'\` instead of just \`'b'\`?
**Q5:** A junior writes \`x.kind === 'ok' && x.value.length\` inside a callback — TS errors. Diagnose.
**Q6:** Refactor with a discriminated union:
\`\`\`ts
type Fetch = { isLoading: boolean; data?: User; error?: string };
\`\`\`

### Day 7 — Application
**Q7:** Build a typed state machine for a checkout flow using discriminated unions.
**Q8:** A PR uses \`any\` for fetch responses — replace with \`Result<T, ApiError>\`. Show the diff.
**Q9:** What does intersection \`User & Admin\` mean for assignability when both define a \`name: string\` differently?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through narrowing — every way TS does it, and the gotchas with closures."
**Q11:** Draw: how do unions, intersections, and discriminated unions correspond to algebraic data types?
**Q12:** ★ System design: "Model a workflow engine state graph (10+ states, 30+ transitions) with TypeScript discriminated unions — what trade-offs vs XState?"`
  },

  // ── 7. type-narrowing ────────────────────────────────────────────────────
  'type-narrowing': {
    feynman: `## FEYNMAN CHECK

### Explain Type Narrowing Like I'm 10 Years Old
> Narrowing is when TS WATCHES your runtime checks and TIGHTENS the variable's type within that branch. You start with \`x: string | number\`, you write \`if (typeof x === 'string')\`, and inside the if-block TS now treats x as \`string\` — autocomplete, no errors. Outside the if, x goes back to the union. The narrowers: \`typeof\` (primitives), \`instanceof\` (classes), \`in\` operator (property presence), discriminant property check (kind === 'ok'), \`Array.isArray\`, custom type guards \`function isX(v): v is X\`, and assertion functions \`function assertX(v): asserts v is X\`. The non-obvious power: narrowing flows through assignment, so \`const y = x; if (typeof y === 'string')\` narrows y, not x — copy semantics.

---

### 5 Deep Conceptual Questions

**Q1: Why are type guards safer than type casts?**
> **A:** A type cast (\`x as User\`) is a PROMISE to the compiler — "trust me, this is a User" — with zero runtime validation. A type guard (\`function isUser(x): x is User\`) is a FUNCTION that returns a boolean — and IF it returns true, TS narrows the type. The guard's body actually CHECKS the shape at runtime. Casts cause silent runtime crashes; guards convert "I think" into "I verified."

**Q2: Mental model for narrowing?**
> **A:** Think of TS as running a flow analysis: at every line, it has a current TYPE for every variable. Each runtime check NARROWS the type within the branch where the check is true. Assignments WIDEN it back. Closures may invalidate narrowing (the variable could change later). The narrowing is purely AT COMPILE TIME — at runtime your code looks identical to what you wrote.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing narrowing persists through closures:
> \`\`\`ts
> // ❌ Narrowing is lost in the callback
> function setup(value: string | null) {
>   if (value !== null) {
>     setTimeout(() => console.log(value.length));   // TS error: 'value' possibly null
>   }
> }
>
> // ✅ Capture in a const that can't be reassigned
> function setup(value: string | null) {
>   if (value !== null) {
>     const v = value;   // v is provably string
>     setTimeout(() => console.log(v.length));   // OK
>   }
> }
> \`\`\`

**Q4: How do assertion functions differ from type guards?**
> **A:** A type guard returns boolean and narrows in the if/else. An assertion function (\`function assert(c): asserts c\`) THROWS if the check fails — and afterward TS knows the type is narrowed for the REST of the scope. Use guards when you want to handle both paths; assertions when failure means program is broken (e.g., invariants, precondition checks). Assertion functions enable \`assert(user); user.foo\` patterns without nesting.

**Q5: FAANG-grade definition?**
> **A:** "Type narrowing is TypeScript's control-flow analysis algorithm that progressively refines a variable's type within a code branch based on type guards (typeof, instanceof, in, discriminant equality, user-defined predicates, assertion functions) — purely a compile-time mechanism with zero runtime cost, governed by definite-assignment analysis and invalidated by closures, reassignments, and function boundaries that may mutate the variable."`,
    build: `## BUILD

### 🏗️ Mini Project: Runtime JSON Validator With Custom Type Guards + Assertions

**What you will build:** A type-safe JSON parser that takes \`unknown\` input and produces typed values via user-defined type guards — no library, just TS narrowing primitives.
**Why this project:** Forces every form of narrowing TS supports.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-narrowing && cd ts-narrowing
npm init -y && npm install -D typescript vitest
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/guards.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — Type Guards Library
\`\`\`ts
// src/guards.ts
export function isString(v: unknown): v is string {
  return typeof v === 'string';
}
export function isNumber(v: unknown): v is number {
  return typeof v === 'number' && !Number.isNaN(v);
}
export function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
export function isArrayOf<T>(v: unknown, item: (x: unknown) => x is T): v is T[] {
  return Array.isArray(v) && v.every(item);
}
export function hasProp<K extends string>(v: unknown, key: K): v is Record<K, unknown> {
  return isObject(v) && key in v;
}
export function assertString(v: unknown): asserts v is string {
  if (!isString(v)) throw new TypeError('expected string, got ' + typeof v);
}
\`\`\`

#### Step 3 — Compose Guards For a Real Shape
\`\`\`ts
// src/main.ts
import { isString, isNumber, isObject, isArrayOf, hasProp } from './guards.js';

interface User { id: number; name: string; emails: string[] }

function isUser(v: unknown): v is User {
  return isObject(v)
    && hasProp(v, 'id')     && isNumber(v.id)
    && hasProp(v, 'name')   && isString(v.name)
    && hasProp(v, 'emails') && isArrayOf(v.emails, isString);
}

function parseUser(json: string): User {
  const data: unknown = JSON.parse(json);
  if (!isUser(data)) throw new Error('JSON does not match User shape');
  return data;   // narrowed to User from this point
}

console.log(parseUser('{"id":1,"name":"Ana","emails":["a@b.io"]}'));
\`\`\`

#### Step 4 — Error Handling: Assertion Function For Invariants
\`\`\`ts
function assertUser(v: unknown): asserts v is User {
  if (!isUser(v)) throw new Error('not a User: ' + JSON.stringify(v));
}

function process(raw: unknown) {
  assertUser(raw);
  // From here, TS knows raw is User WITHOUT nesting
  console.log(raw.name.toUpperCase(), raw.emails.length);
}

try { process({ id: 1, name: 'A', emails: [] }); } catch (e) { console.error(e); }
try { process({ id: 'oops' }); }                  catch (e) { console.error('caught'); }
\`\`\`

#### Step 5 — Tests
\`\`\`ts
import { describe, it, expect } from 'vitest';
import { isString, isArrayOf, isObject } from './guards.js';

describe('guards', () => {
  it('isString narrows', () => {
    const x: unknown = 'hello';
    expect(isString(x)).toBe(true);
    if (isString(x)) expect(x.toUpperCase()).toBe('HELLO');
  });
  it('isArrayOf composes', () => {
    expect(isArrayOf(['a', 'b'], isString)).toBe(true);
    expect(isArrayOf(['a', 1],   isString)).toBe(false);
  });
  it('isObject rejects null and arrays', () => {
    expect(isObject(null)).toBe(false);
    expect(isObject([1])).toBe(false);
    expect(isObject({ a: 1 })).toBe(true);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
{ id: 1, name: 'Ana', emails: ['a@b.io'] }
A 0
caught
\`\`\`

**Stretch Challenges:**
- [ ] Replace your hand-written guards with zod schemas and compare DX
- [ ] Add a discriminated-union guard for \`Result<T, E>\`
- [ ] Add an \`isExact\` variant that rejects excess properties`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Name 4 ways TS narrows types.
**Q2:** Difference between a type guard and an assertion function?
**Q3:** Write \`isNumber(v: unknown): v is number\`. From memory.

### Day 3 — Comprehension
**Q4:** Why does narrowing not survive into setTimeout callbacks?
**Q5:** A junior uses \`as User\` instead of writing a guard. Show two production bugs that result.
**Q6:** Refactor to use narrowing instead of casts:
\`\`\`ts
function process(x: unknown) {
  const u = x as { name: string };
  console.log(u.name);
}
\`\`\`

### Day 7 — Application
**Q7:** Build a typed \`partition(arr, predicate)\` that narrows each output array's type.
**Q8:** A PR adds \`Array.isArray\` to a generic — but TS still complains. Explain why and fix.
**Q9:** What does \`!\` (non-null assertion) do vs an actual narrowing check? When is \`!\` acceptable?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every narrowing mechanism and the bug it prevents."
**Q11:** Draw: how does control-flow analysis maintain per-line types in TS?
**Q12:** ★ System design: "Architect a runtime-validation layer for a public REST API — guards, assertions, or schemas. Pick and justify."`
  },

  // ── 8. enums-ts ──────────────────────────────────────────────────────────
  'enums-ts': {
    feynman: `## FEYNMAN CHECK

### Explain Enums Like I'm 10 Years Old
> Enums are NAMED CONSTANTS grouped together. \`enum Status { Active, Inactive, Banned }\` creates Status.Active = 0, Status.Inactive = 1, Status.Banned = 2 by default (numeric). \`enum Status { Active = 'active' }\` gives string values you control. Enums ARE one of the few TS features that emit RUNTIME code (a JS object) — unlike pure types which vanish. This makes them controversial: bigger bundles, harder to tree-shake, weird semantics. The modern alternative is \`const Status = { Active: 'active' } as const\` plus \`type Status = typeof Status[keyof typeof Status]\` — zero runtime cost, better type narrowing, easier to refactor. The TypeScript team now recommends literal unions over enums for most cases.

---

### 5 Deep Conceptual Questions

**Q1: Why do most modern TS codebases avoid enums?**
> **A:** Three reasons: (1) Runtime cost — enums emit a JS object that bundlers struggle to tree-shake. (2) Numeric enums allow assigning arbitrary numbers (\`status = 99\` is allowed even though no member equals 99) — broken type safety. (3) String literal unions (\`type Status = 'active' | 'banned'\`) give you the same compile-time safety with zero runtime, full tree-shaking, and better autocomplete. Const enums are a third option (inlined at compile time) but break isolatedModules.

**Q2: Mental model: enum vs const object vs literal union?**
> **A:** Literal unions (\`'a' | 'b'\`) are the purest types — zero runtime, no namespace. Const objects (\`as const\`) give you both the type and a runtime lookup. Enums give you a runtime two-way mapping (numeric reverse-lookup) but cost bundle size. Pick literal union by default; const object when you need a runtime values collection; enum only for backward compat or numeric flag enums.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing numeric enums are type-safe:
> \`\`\`ts
> // ❌ Any number is assignable to a numeric enum
> enum Status { Active = 0, Banned = 1 }
> const s: Status = 99;   // 💀 no error — silent corruption
>
> // ✅ String enum or literal union
> enum Status2 { Active = 'active', Banned = 'banned' }
> const s2: Status2 = 'unknown';   // ❌ now TS rejects
>
> type StatusU = 'active' | 'banned';
> const s3: StatusU = 'unknown';   // ❌ rejected
> \`\`\`

**Q4: How does \`const enum\` differ from regular enum at compile time?**
> **A:** A \`const enum\` is INLINED — calls to \`MyEnum.Active\` are replaced with the literal value during compilation, and no runtime object is emitted. Zero runtime cost. The downside: it breaks under \`isolatedModules: true\` (required by esbuild, swc, ts-loader's transpileOnly) because each file is compiled independently and can't see the enum's values. Modern build tooling forces you off const enums into literal unions or as-const objects.

**Q5: FAANG-grade definition?**
> **A:** "TypeScript enums are runtime-emitted named-constant collections with numeric reverse-mapping for numeric variants — providing both compile-time type-safety and runtime lookup, but at the cost of bundle size, broken tree-shaking, and unsafe numeric assignability — for which modern codebases substitute either literal-union types (compile-time only, zero runtime) or as-const objects (typed runtime values with full type safety)."`,
    build: `## BUILD

### 🏗️ Mini Project: Migrate an Enum to \`as const\` And Compare Outputs

**What you will build:** Define the same Status concept three ways (numeric enum, string enum, as-const object), compile each, and inspect the JS output to see bundle-size and tree-shaking differences.
**Why this project:** Forces you to SEE why enums lose to literal unions in modern bundlers.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-enums && cd ts-enums
npm init -y && npm install -D typescript
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/numeric.ts, src/string-enum.ts, src/as-const.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — Three Versions of the Same Idea
\`\`\`ts
// src/numeric.ts
export enum StatusNumeric { Active, Inactive, Banned }

// src/string-enum.ts
export enum StatusString {
  Active   = 'active',
  Inactive = 'inactive',
  Banned   = 'banned',
}

// src/as-const.ts
export const Status = {
  Active:   'active',
  Inactive: 'inactive',
  Banned:   'banned',
} as const;
export type Status = typeof Status[keyof typeof Status];   // 'active'|'inactive'|'banned'
\`\`\`

#### Step 3 — Usage Comparison
\`\`\`ts
// src/main.ts
import { StatusNumeric } from './numeric.js';
import { StatusString }  from './string-enum.js';
import { Status }        from './as-const.js';

// Numeric enum (DANGEROUS):
const a: StatusNumeric = 999;       // ❌❌❌ NO type error!
console.log(StatusNumeric.Active);  // 0
console.log(StatusNumeric[0]);      // 'Active' — reverse mapping (bundle cost)

// String enum (better):
const b: StatusString = 'active';
// const c: StatusString = 'unknown';   // ❌ TS error

// as-const literal union (best):
const d: Status = 'active';
// const e: Status = 'unknown';         // ❌ TS error
\`\`\`

#### Step 4 — Error Handling: Exhaustive Switch
\`\`\`ts
function describe(s: Status): string {
  switch (s) {
    case 'active':   return 'User is active';
    case 'inactive': return 'User is dormant';
    case 'banned':   return 'User is banned';
    default: {
      const _: never = s;
      return _;
    }
  }
}
console.log(describe(Status.Active));
\`\`\`

#### Step 5 — Tests + Bundle Size Inspection
\`\`\`bash
npx tsc
# Inspect outputs:
cat dist/numeric.js      # ~200 bytes — emits a full Status object with reverse mapping
cat dist/string-enum.js  # ~150 bytes — Status object without reverse mapping
cat dist/as-const.js     # ~100 bytes — just a frozen-ish object
\`\`\`
\`\`\`ts
import { describe, it, expect } from 'vitest';
import { Status } from './as-const.js';

describe('Status as const', () => {
  it('values are literal strings', () => {
    expect(Status.Active).toBe('active');
  });
  it('type narrows correctly', () => {
    const s: Status = 'banned';
    expect(s).toBe('banned');
  });
});
\`\`\`

**Expected Output:**
\`\`\`
0
Active
User is active

# bundle sizes (gzip):
numeric.js:     ~80 B  (has reverse mapping table)
string-enum.js: ~60 B
as-const.js:    ~40 B  (best, fully tree-shakable)
\`\`\`

**Stretch Challenges:**
- [ ] Try \`const enum Status\` and observe the inlined output — then enable isolatedModules and watch it break
- [ ] Build a numeric flag enum (bitwise — e.g. permissions) and compare to a Set<Permission>
- [ ] Migrate a real project's enums to as-const and measure bundle delta`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What's the default starting value of a numeric enum?
**Q2:** Why are enums controversial in modern TS codebases?
**Q3:** Write a Status using \`as const\` + literal-union type. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`const x: NumericEnum = 999\` not error?
**Q5:** What does \`const enum\` do, and why is it incompatible with isolatedModules?
**Q6:** Refactor this numeric enum to a typed literal-union:
\`\`\`ts
enum LogLevel { Debug, Info, Warn, Error }
function log(level: LogLevel, msg: string) { /* */ }
\`\`\`

### Day 7 — Application
**Q7:** Build a permissions system using a bitwise number enum (read=1, write=2, admin=4) and compare with a Set<Permission>.
**Q8:** A PR adds a string enum to a library. Explain what consumers must do to use it (tree-shaking risk).
**Q9:** What is the file-size cost per enum member at scale (1000 enums)?

### Day 14 — Synthesis
**Q10:** ★ Interview: "When would you choose enum vs literal union vs as-const object?"
**Q11:** Draw: bundle output diff for each of the three Status forms.
**Q12:** ★ System design: "Audit a 100k-line TS app for enum usage and plan migration to literal unions. What tooling, what risks?"`
  },

  // ── 9. classes-ts ────────────────────────────────────────────────────────
  'classes-ts': {
    feynman: `## FEYNMAN CHECK

### Explain TS Classes Like I'm 10 Years Old
> TS classes are JS classes WITH TYPES on their fields, methods, and constructor parameters. \`public\`, \`private\`, \`protected\`, \`readonly\` are TS access modifiers — checked at compile time, erased at runtime. Native JS \`#privateField\` syntax gives TRUE runtime privacy (not just compile-time). TS adds \`abstract\` classes (cannot be instantiated, force subclasses to implement abstract methods) and \`implements\` (verify a class matches an interface's shape). The non-obvious power: PARAMETER PROPERTIES — \`constructor(private name: string)\` auto-declares AND auto-assigns \`this.name\` in one line. The pitfall: TS \`private\` is compile-time only; \`(instance as any).privateField\` accesses it. Use JS \`#field\` for real privacy.

---

### 5 Deep Conceptual Questions

**Q1: Difference between TS \`private\` and JS \`#private\`?**
> **A:** \`private name: string\` is a COMPILE-TIME promise — TS errors if you access \`instance.name\` from outside, but at runtime the field is fully accessible via \`(instance as any).name\` or JSON.stringify or reflection. \`#name: string\` is true runtime privacy — V8 uses a per-instance hidden slot, not accessible by ANY means from outside. Use # for security-critical privacy; use private for clarity in trusted code.

**Q2: Mental model: classes vs interfaces?**
> **A:** Interfaces describe SHAPES (zero runtime). Classes describe SHAPES + IMPLEMENTATIONS (runtime code). A class can IMPLEMENT one or more interfaces — TS verifies the class has matching public methods. A class can EXTEND ONE base class. Use interfaces for contracts; use classes when you need shared implementation, private state, or inheritance.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Arrow methods bound at construction "fix" \`this\` wrongly:
> \`\`\`ts
> // ❌ Arrow on prototype — but no, this isn't on the prototype, it's per-instance
> class Counter {
>   count = 0;
>   increment = () => { this.count++; };   // bound per instance — memory cost
> }
> // Pro: this is always correct
> // Con: not on prototype, can't be overridden by subclass, ~3x memory per method
>
> // ✅ Standard method on prototype — bind at call site if needed
> class Counter {
>   count = 0;
>   increment() { this.count++; }
> }
> const c = new Counter();
> btn.onclick = c.increment.bind(c);   // or () => c.increment()
> \`\`\`

**Q4: How do TS abstract classes differ from interfaces at the runtime level?**
> **A:** An abstract class EMITS runtime code (a constructor function with prototype methods), unlike an interface (which emits nothing). You can call non-abstract methods on the abstract class via super, share state across subclasses, and use \`instanceof\` checks. Interfaces have none of these — they describe shapes only. Choose abstract class when subclasses share implementation; choose interface when subclasses don't share code.

**Q5: FAANG-grade definition?**
> **A:** "TypeScript classes are JavaScript classes augmented with compile-time access modifiers (public/private/protected/readonly), parameter-property shortcuts, abstract methods/classes, and implements clauses verifying interface conformance — emitting standard JavaScript class output at runtime, with true runtime privacy available only through native ECMAScript #private fields."`,
    build: `## BUILD

### 🏗️ Mini Project: Abstract Repository Pattern + Generic CRUD Mixin

**What you will build:** An abstract \`Repository<T>\` class with shared find/save logic, concrete \`UserRepository\` and \`OrderRepository\` extending it, and a generic Auditable mixin that adds \`auditLog\` to any class.
**Why this project:** Forces abstract, generics, mixins, parameter properties, access modifiers — every class feature.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-classes && cd ts-classes
npm init -y && npm install -D typescript vitest
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext --experimentalDecorators
ni src/repo.ts, src/user-repo.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — Abstract Repository
\`\`\`ts
// src/repo.ts
export interface Identifiable { id: number }

export abstract class Repository<T extends Identifiable> {
  // Parameter property — auto-declares and auto-assigns
  constructor(protected readonly entityName: string) {}

  #store = new Map<number, T>();   // true runtime private

  protected abstract validate(entity: T): void;

  save(entity: T): T {
    this.validate(entity);                  // subclass-provided
    this.#store.set(entity.id, entity);
    this.audit(\`SAVE \${this.entityName} #\${entity.id}\`);
    return entity;
  }

  find(id: number): T | undefined {
    return this.#store.get(id);
  }

  count(): number { return this.#store.size; }

  private audit(msg: string) {
    console.log(\`[\${new Date().toISOString()}] \${msg}\`);
  }
}
\`\`\`

#### Step 3 — Concrete Repositories
\`\`\`ts
// src/user-repo.ts
import { Repository, type Identifiable } from './repo.js';

export interface User extends Identifiable { name: string; email: string }
export interface Order extends Identifiable { userId: number; amount: number }

export class UserRepository extends Repository<User> {
  constructor() { super('User'); }
  protected validate(u: User) {
    if (!u.email.includes('@')) throw new Error('Invalid email');
  }
  findByEmail(email: string): User | undefined {
    for (let i = 0; i < this.count(); i++) {
      const u = this.find(i);
      if (u?.email === email) return u;
    }
    return undefined;
  }
}

export class OrderRepository extends Repository<Order> {
  constructor() { super('Order'); }
  protected validate(o: Order) {
    if (o.amount <= 0) throw new Error('amount must be positive');
  }
}
\`\`\`

#### Step 4 — Error Handling: Generic Mixin
\`\`\`ts
// src/main.ts
import { UserRepository, OrderRepository } from './user-repo.js';

type Constructor<T = {}> = new (...args: any[]) => T;

function Auditable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    auditLog: string[] = [];
    log(action: string) {
      const entry = \`\${new Date().toISOString()} \${action}\`;
      this.auditLog.push(entry);
      console.log('[AUDIT]', entry);
    }
  };
}

const AuditedUserRepo = Auditable(UserRepository);
const repo = new AuditedUserRepo();
repo.save({ id: 1, name: 'Ana', email: 'a@b.io' });
repo.log('User 1 created');
console.log(repo.auditLog);
\`\`\`

#### Step 5 — Tests
\`\`\`ts
import { describe, it, expect } from 'vitest';
import { UserRepository, OrderRepository } from './user-repo.js';

describe('Repositories', () => {
  it('save/find works', () => {
    const r = new UserRepository();
    r.save({ id: 1, name: 'A', email: 'a@b.io' });
    expect(r.find(1)?.name).toBe('A');
  });
  it('validate prevents bad input', () => {
    const r = new UserRepository();
    expect(() => r.save({ id: 2, name: 'B', email: 'noatsign' })).toThrow();
  });
  it('OrderRepo rejects zero amount', () => {
    const r = new OrderRepository();
    expect(() => r.save({ id: 1, userId: 1, amount: 0 })).toThrow();
  });
  it('cannot instantiate abstract Repository directly', () => {
    // @ts-expect-error — abstract class cannot be constructed
    new Repository('X');
  });
});
\`\`\`

**Expected Output:**
\`\`\`
[2026-06-26T12:00:00.000Z] SAVE User #1
[AUDIT] 2026-06-26T12:00:00.001Z User 1 created
[ '2026-06-26T12:00:00.001Z User 1 created' ]

# tsc rejects abstract instantiation:
src/main.ts:5:13 - error TS2511: Cannot create an instance of an abstract class.
\`\`\`

**Stretch Challenges:**
- [ ] Add a Soft-Delete mixin that overrides find to skip deleted entities
- [ ] Make the Auditable mixin generic over the action enum
- [ ] Replace TS \`private\` with native \`#private\` everywhere and observe TS errors`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between \`private\` and \`#private\` in TS?
**Q2:** What is a parameter property?
**Q3:** Write an abstract class \`Shape\` with abstract \`area()\` and concrete \`describe()\`. From memory.

### Day 3 — Comprehension
**Q4:** When would you use an abstract class instead of an interface?
**Q5:** A junior writes \`increment = () => this.count++\` for every method — explain the memory cost.
**Q6:** Refactor to use parameter properties:
\`\`\`ts
class User {
  constructor(name: string, age: number) {
    this.name = name; this.age = age;
  }
  name: string; age: number;
}
\`\`\`

### Day 7 — Application
**Q7:** Build a generic \`Cache<K, V>\` class with LRU eviction.
**Q8:** A PR uses \`implements\` — explain what it does NOT verify (vs class extension).
**Q9:** What is the runtime cost of an abstract class vs a regular class?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every TS class feature and when to use each over interfaces or plain objects."
**Q11:** Draw: mixin pattern via class-returning function — type flow for the constructor types.
**Q12:** ★ System design: "Choose classes vs hooks vs functional composition for a state-management library. Justify."`
  },

  // ── 10. utility-types ────────────────────────────────────────────────────
  'utility-types': {
    feynman: `## FEYNMAN CHECK

### Explain Utility Types Like I'm 10 Years Old
> Utility types are TYPE FUNCTIONS that TRANSFORM other types — built into TS, ready to use. \`Partial<T>\` makes every property optional. \`Required<T>\` makes every property required. \`Readonly<T>\` makes them readonly. \`Pick<T, K>\` selects a subset of keys. \`Omit<T, K>\` removes keys. \`Record<K, V>\` builds object types. \`Returntype<F>\`/\`Parameters<F>\` extract function pieces. \`Awaited<T>\` unwraps Promises. They're built using MAPPED TYPES and CONDITIONAL TYPES — you can read their source in lib.es5.d.ts. The non-obvious power: composing them — \`Readonly<Partial<Pick<User, 'name' | 'email'>>>\` says "an immutable, partial subset of User with only name and email" — useful for API patch payloads.

---

### 5 Deep Conceptual Questions

**Q1: What problem do utility types solve?**
> **A:** Repetition. Without them, defining "User but every field optional for PATCH endpoints" means writing \`interface UserPatch { id?: number; name?: string; ... }\` and keeping it in sync with User. \`Partial<User>\` does it in one expression that AUTO-UPDATES when User changes. This is type DRY — the source of truth is one interface; the utility types derive variants.

**Q2: Mental model for utility composition?**
> **A:** Utility types are PURE FUNCTIONS over types. Compose them like math: \`Readonly<Pick<User, 'id' | 'role'>>\` = "an immutable subtype with only id and role." \`NonNullable<T>\` removes null|undefined from a type. \`Awaited<Promise<Promise<number>>>\` recursively unwraps to number. The TypeScript Handbook is a reference; the real skill is knowing WHICH combination expresses your intent.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Confusing \`Pick\` and \`Omit\` semantics for unknown unions:
> \`\`\`ts
> type Animal = { name: string } | { tag: number };
> type N = Pick<Animal, 'name'>;   // ❌ TS error: 'name' missing from one branch
> type M = Omit<Animal, 'tag'>;    // produces { name: string } | { /* {} */ } — surprising
>
> // ✅ For unions, use a distributive helper
> type PickFromUnion<T, K extends keyof T> = T extends unknown ? Pick<T, K> : never;
> \`\`\`

**Q4: How does \`Awaited<T>\` work at compile time?**
> **A:** It's defined recursively using conditional types — if T is \`Promise<U>\`, return \`Awaited<U>\` (recurse); otherwise return T. This unwraps nested promises (\`Promise<Promise<number>>\` → number), matching the runtime behaviour of \`await\`. Before Awaited existed (TS 4.5+), you had \`UnwrapPromise<T>\` defined by hand in every codebase — Awaited standardised it.

**Q5: FAANG-grade definition?**
> **A:** "Utility types are TypeScript-provided type-level functions (mapped + conditional + infer combinations) that derive related types from a source type — \`Partial\`, \`Required\`, \`Readonly\`, \`Pick\`, \`Omit\`, \`Record\`, \`Exclude\`, \`Extract\`, \`Returntype\`, \`Parameters\`, \`Awaited\`, \`NonNullable\` — enabling type DRY by deriving variants instead of repeating field declarations, with composition handling complex transformations like API request/response shape derivation."`,
    build: `## BUILD

### 🏗️ Mini Project: REST API Type Toolkit Using Utility Types

**What you will build:** From ONE \`User\` interface, derive every type the REST API needs: \`CreateUserRequest\` (no id), \`UpdateUserRequest\` (partial, no id), \`UserResponse\` (readonly), \`UserPublic\` (omitting passwordHash). All using utility types — no copy-paste.
**Why this project:** Forces real composition of every common utility type in production.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-utility && cd ts-utility
npm init -y && npm install -D typescript vitest
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/user.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — Source of Truth + Derived Types
\`\`\`ts
// src/user.ts
export interface User {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  age: number;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

// Create: API caller provides everything except id and createdAt (server assigns)
export type CreateUserRequest = Omit<User, 'id' | 'createdAt'>;

// Update: everything optional, except id and createdAt cannot be sent
export type UpdateUserRequest = Partial<Omit<User, 'id' | 'createdAt'>>;

// Response: API returns the full user but immutable + no password
export type UserResponse = Readonly<Omit<User, 'passwordHash'>>;

// Public profile: a tiny subset for /users/:id/public
export type UserPublic = Pick<User, 'id' | 'name' | 'role'>;

// Index by role for fast lookup
export type UsersByRole = Record<User['role'], User[]>;
\`\`\`

#### Step 3 — Use The Derived Types
\`\`\`ts
// src/main.ts
import type {
  User, CreateUserRequest, UpdateUserRequest,
  UserResponse, UserPublic, UsersByRole,
} from './user.js';

function createUser(req: CreateUserRequest): User {
  return { id: 1, createdAt: new Date(), ...req };
}

function updateUser(id: number, patch: UpdateUserRequest): void {
  // ❌ patch.id = 5  → would error if we omitted Partial<>... but we Omit'd id from Update
  console.log('patching', id, patch);
}

function toPublic(u: User): UserPublic {
  return { id: u.id, name: u.name, role: u.role };
  // TypeScript ensures we don't leak passwordHash or email
}

const created = createUser({
  email: 'a@b.io', passwordHash: 'x', name: 'Ana', age: 30, role: 'user',
});
updateUser(created.id, { name: 'Anna' });
console.log(toPublic(created));
\`\`\`

#### Step 4 — Error Handling: Compile-Time Safety
\`\`\`ts
// ❌ Can't send id in create
// createUser({ id: 5, email: 'a@b.io', ... });   // TS error: 'id' not in CreateUserRequest

// ❌ Can't mutate UserResponse
const resp: UserResponse = { id: 1, email: 'a', name: 'n', age: 1, role: 'guest', createdAt: new Date() };
// resp.name = 'B';   // TS error: read-only

// ❌ UserPublic doesn't leak passwordHash
// const wrong: UserPublic = { id: 1, name: 'A', role: 'guest', passwordHash: 'x' };   // TS error

const groups: UsersByRole = { admin: [], user: [created], guest: [] };
console.log(groups);
\`\`\`

#### Step 5 — Tests
\`\`\`ts
import { describe, it, expectTypeOf } from 'vitest';
import type {
  User, CreateUserRequest, UpdateUserRequest,
  UserResponse, UserPublic,
} from './user.js';

describe('utility-derived types', () => {
  it('CreateUserRequest omits id and createdAt', () => {
    expectTypeOf<CreateUserRequest>().not.toHaveProperty('id');
    expectTypeOf<CreateUserRequest>().not.toHaveProperty('createdAt');
  });
  it('UpdateUserRequest makes everything optional', () => {
    expectTypeOf<UpdateUserRequest>().toEqualTypeOf<{
      email?: string; passwordHash?: string; name?: string; age?: number;
      role?: 'admin'|'user'|'guest';
    }>();
  });
  it('UserResponse is readonly and excludes password', () => {
    expectTypeOf<UserResponse>().not.toHaveProperty('passwordHash');
  });
  it('UserPublic is a 3-key projection', () => {
    expectTypeOf<keyof UserPublic>().toEqualTypeOf<'id' | 'name' | 'role'>();
  });
});
\`\`\`

**Expected Output:**
\`\`\`
patching 1 { name: 'Anna' }
{ id: 1, name: 'Ana', role: 'user' }

# tsc errors:
src/main.ts:N:N - error TS2353: 'passwordHash' does not exist in 'UserPublic'.
src/main.ts:N:N - error TS2540: Cannot assign to 'name' because it is read-only.
\`\`\`

**Stretch Challenges:**
- [ ] Add a DeepPartial utility for nested patch payloads
- [ ] Add Branded ID types and use Pick to derive id-only types
- [ ] Generate matching zod schemas from these TS types via zod's z.object inference`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does \`Partial<T>\` produce? What about \`Required<T>\`?
**Q2:** Difference between \`Pick<T, K>\` and \`Omit<T, K>\`?
**Q3:** Write \`Record<'admin' | 'user', boolean>\`. From memory.

### Day 3 — Comprehension
**Q4:** What does \`Awaited<Promise<Promise<number>>>\` resolve to?
**Q5:** Why does \`Pick<A | B, 'name'>\` sometimes error? Show the distributive fix.
**Q6:** Use utility types to derive a "patch" type from this:
\`\`\`ts
interface Profile { id: number; name: string; age: number; bio: string }
\`\`\`

### Day 7 — Application
**Q7:** Build a typed API client factory where input/output types are utility-derived from a single Entity.
**Q8:** A PR copy-pastes \`UserCreate\`, \`UserUpdate\`, \`UserResponse\` and they drift over time. Refactor with utilities.
**Q9:** What is the compile-time cost of deeply-composed utility types on a 500-interface project?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every TS utility type and the use case for each."
**Q11:** Draw: how is \`Partial<T>\` implemented under the hood (mapped type)?
**Q12:** ★ System design: "Architect a type-driven API layer where one Entity interface generates request/response/event types — and zod schemas at runtime."`
  },

  // ── 11. generics-ts ──────────────────────────────────────────────────────
  'generics-ts': {
    feynman: `## FEYNMAN CHECK

### Explain Generics Like I'm 10 Years Old
> Generics are TYPE VARIABLES — placeholders for types you'll fill in later. \`function identity<T>(x: T): T { return x; }\` says "give me any type T; I'll take an x of T and return a T." Call \`identity('hi')\` and T is inferred as 'hi'; call \`identity<number>(42)\` and T is number. Generics turn "this function works for one type" into "this function works for ANY type, with the type preserved end-to-end." Without generics, the only choice for "works for any type" is \`any\` — which destroys type safety. The non-obvious power: CONSTRAINTS (\`<T extends { length: number }>\`) let you require the placeholder type to have certain shape — combining flexibility with safety.

---

### 5 Deep Conceptual Questions

**Q1: What problem do generics solve that \`any\` doesn't?**
> **A:** Type preservation. \`function first(arr: any[]): any\` loses ALL information — output is any, no autocomplete, no protection. \`function first<T>(arr: T[]): T | undefined\` preserves the type: \`first([1,2,3])\` returns number|undefined; \`first(['a','b'])\` returns string|undefined. Generics are the ONLY way to express "the output type depends on the input type" without resorting to overloads.

**Q2: Mental model for generics?**
> **A:** Think "type-level function arguments." \`Array<T>\`, \`Promise<T>\`, \`Map<K,V>\` are type FUNCTIONS that take type ARGUMENTS. \`function pluck<T, K extends keyof T>(arr: T[], key: K): T[K][]\` says: T is the element type, K must be one of its keys, and the return is an array of that key's value type. Generic inference is TS unifying call-site arguments with the type variables.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing generics make a function "polymorphic" at runtime:
> \`\`\`ts
> // ❌ Generic types are ERASED — runtime can't check what T is
> function create<T>(): T { return {} as T; }   // returns {}, no actual T at runtime
> const u: User = create<User>();   // u = {}, will crash on u.name access
>
> // ✅ Pass a runtime witness (a factory or schema)
> function create<T>(factory: () => T): T { return factory(); }
> const u = create(() => ({ id: 1, name: 'A' }));
> \`\`\`

**Q4: How does TS infer generic type arguments?**
> **A:** Inference walks every CALL-SITE argument and gathers candidates for each type parameter. \`function pair<T, U>(t: T, u: U): [T, U]\` → \`pair('a', 1)\` produces candidates T='a' and U=1, both literal types (because string literals widen to string only when no constraint pins them). Constraints (\`extends\`) narrow inference: \`<K extends keyof T>\` forces TS to pick literal types for K to keep the keyof constraint satisfiable.

**Q5: FAANG-grade definition?**
> **A:** "Generics in TypeScript are parameterised types — type variables introduced via angle-bracket declarations, constrained via \`extends\` clauses, inferred at call sites through unification of argument types — enabling polymorphic APIs that preserve type information across function and class boundaries, with type erasure at compile time meaning runtime polymorphism requires runtime witnesses (factories, validators, schemas)."`,
    build: `## BUILD

### 🏗️ Mini Project: Generic In-Memory Cache With Type-Safe Keys + Values

**What you will build:** A \`Cache<K, V>\` class with TTL-based expiration, key-type and value-type parameters preserved end-to-end, and a generic \`memoize\` helper that wraps any function.
**Why this project:** Forces generic constraints, default type parameters, and class-level generic inference.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-generics && cd ts-generics
npm init -y && npm install -D typescript vitest
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/cache.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — Generic Cache
\`\`\`ts
// src/cache.ts
interface Entry<V> { value: V; expiresAt: number }

export class Cache<K, V> {
  private store = new Map<K, Entry<V>>();
  constructor(private defaultTtlMs: number = 60_000) {}

  set(key: K, value: V, ttlMs: number = this.defaultTtlMs): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  get(key: K): V | undefined {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (Date.now() > e.expiresAt) { this.store.delete(key); return undefined; }
    return e.value;
  }

  has(key: K): boolean { return this.get(key) !== undefined; }
  delete(key: K): boolean { return this.store.delete(key); }
  clear(): void { this.store.clear(); }
  get size(): number { return this.store.size; }
}
\`\`\`

#### Step 3 — Generic memoize Helper
\`\`\`ts
// src/main.ts
import { Cache } from './cache.js';

export function memoize<Args extends unknown[], Out>(
  fn: (...args: Args) => Out,
  keyFn: (...args: Args) => string = (...a) => JSON.stringify(a),
  ttlMs = 5000,
): (...args: Args) => Out {
  const cache = new Cache<string, Out>(ttlMs);
  return (...args) => {
    const k = keyFn(...args);
    const hit = cache.get(k);
    if (hit !== undefined) return hit;
    const out = fn(...args);
    cache.set(k, out);
    return out;
  };
}

// Use it on a slow function
function slowFib(n: number): number {
  if (n < 2) return n;
  return slowFib(n - 1) + slowFib(n - 2);
}
const fastFib = memoize(slowFib);
console.log(fastFib(35));   // First call slow
console.log(fastFib(35));   // Instant — cache hit
\`\`\`

#### Step 4 — Error Handling: Generic Constraints + Defaults
\`\`\`ts
// Constraint: K must be hashable to a string key
export class TypedCache<K extends string | number, V = unknown> {
  private store = new Map<K, V>();
  set(k: K, v: V) { this.store.set(k, v); }
  get(k: K): V | undefined { return this.store.get(k); }
}

const userCache = new TypedCache<number, { name: string }>();
userCache.set(1, { name: 'Ana' });
const u = userCache.get(1);   // type: { name: string } | undefined
\`\`\`

#### Step 5 — Tests
\`\`\`ts
import { describe, it, expect, vi } from 'vitest';
import { Cache } from './cache.js';
import { memoize } from './main.js';

describe('Cache', () => {
  it('stores and retrieves typed values', () => {
    const c = new Cache<string, number>();
    c.set('a', 1);
    expect(c.get('a')).toBe(1);
  });
  it('expires entries past TTL', () => {
    vi.useFakeTimers();
    const c = new Cache<string, number>(100);
    c.set('x', 99);
    vi.advanceTimersByTime(101);
    expect(c.get('x')).toBeUndefined();
    vi.useRealTimers();
  });
});

describe('memoize', () => {
  it('returns same value for same input', () => {
    let calls = 0;
    const fn = (n: number) => { calls++; return n * 2; };
    const m = memoize(fn);
    expect(m(5)).toBe(10);
    expect(m(5)).toBe(10);
    expect(calls).toBe(1);
  });
  it('different inputs trigger new calls', () => {
    let calls = 0;
    const m = memoize((n: number) => { calls++; return n; });
    m(1); m(2); m(1);
    expect(calls).toBe(2);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
9227465      # fib(35)
9227465      # cached instant

# Type inference flows perfectly:
TypedCache<number, { name: string }> → get(1) returns { name: string } | undefined
\`\`\`

**Stretch Challenges:**
- [ ] Add an LRU eviction policy with a max-size generic parameter
- [ ] Add async \`getOrFetch(key, () => Promise<V>)\` that handles concurrent calls (single-flight)
- [ ] Make memoize support async functions, with proper Promise unwrapping in types`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does \`<T extends keyof U>\` mean?
**Q2:** Default type parameter syntax — show an example.
**Q3:** Write generic \`first<T>(arr: T[]): T | undefined\`. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`first([1,2,3])\` infer T as number (not number|undefined)?
**Q5:** A junior writes \`function id(x: any): any\` instead of generic. Show three bugs that causes.
**Q6:** Refactor to be generic:
\`\`\`ts
function wrap(arr: number[]): { items: number[] } { return { items: arr }; }
\`\`\`

### Day 7 — Application
**Q7:** Build a generic Promise pool (max-concurrency executor) with full type safety.
**Q8:** A PR adds \`<T = any>\` as a default — explain why this is usually wrong.
**Q9:** What is the cost of generic instantiation in tsc compile time?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how React's useState is typed — inference, generic defaults, edge cases."
**Q11:** Draw: how does generic inference propagate through call chains like \`obs.map().filter().reduce()\`?
**Q12:** ★ System design: "Type the public API of a typed ORM where queries chain, models are entities, and every step preserves type information."`
  },

  // ── 12. advanced-generics ────────────────────────────────────────────────
  'advanced-generics': {
    feynman: `## FEYNMAN CHECK

### Explain Advanced Generics Like I'm 10 Years Old
> Advanced generics combine: VARIADIC tuples (\`<T extends unknown[]>\` to spread types), CONDITIONAL types (\`T extends U ? X : Y\` to branch at the type level), the \`infer\` keyword (to extract a type from inside another), and HIGHER-KINDED type tricks (TS doesn't have true HKTs, but workarounds exist via type families). With these you write type functions like \`Awaited<T>\`, \`Returntype<F>\`, \`Parameters<F>\` from scratch. You write typed builders where each method call REFINES the type. You write typed routing libraries that infer params from a URL string literal. The non-obvious limit: TS's type system is TURING-COMPLETE but capped — recursion depth is limited (~50 levels) and overly clever types kill compile speed.

---

### 5 Deep Conceptual Questions

**Q1: What problem do conditional types solve?**
> **A:** "If this type, then that type, otherwise something else" at the type level. \`type If<C, T, F> = C extends true ? T : F\`. Most utility types use them: \`NonNullable<T> = T extends null | undefined ? never : T\`. They enable type-level pattern matching, type-level if/else, and combined with \`infer\` they ENRICH types — e.g., extract the resolved type from a Promise: \`type Unwrap<T> = T extends Promise<infer U> ? U : T\`.

**Q2: Mental model for \`infer\`?**
> **A:** \`infer\` is "give a name to this part of the type so I can use it." \`T extends Array<infer Item> ? Item : never\` says "if T is an array of some Item type, give me that Item." You can have multiple infers: \`T extends (a: infer A) => infer R ? [A, R] : never\` extracts both argument type and return type from a function type.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Building deeply recursive types that kill compile speed:
> \`\`\`ts
> // ❌ DeepPartial via naive recursion — explodes on cyclic shapes
> type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };
> // For deeply nested types this can hit TS's recursion limit
>
> // ✅ Use distribution-aware constraints and depth limiters
> type DeepPartial<T, Depth extends number = 5> =
>   [Depth] extends [0] ? T
>   : { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K], Prev<Depth>> : T[K] };
> \`\`\`

**Q4: How do distributive conditional types work?**
> **A:** When a conditional type's checked type (the part before \`extends\`) is a NAKED type parameter, the conditional DISTRIBUTES over union members. \`type IsString<T> = T extends string ? true : false\`. Then \`IsString<'a' | 1>\` evaluates \`IsString<'a'> | IsString<1>\` = \`true | false\`. To DISABLE distribution, wrap in brackets: \`[T] extends [string]\` evaluates ONCE against the entire union.

**Q5: FAANG-grade definition?**
> **A:** "Advanced TypeScript generics combine variadic tuple types, conditional types with distributive semantics, the \`infer\` keyword for type extraction, and recursive type definitions (with depth limits) — collectively forming a Turing-complete type-level computation system that enables compile-time validation of URL params, SQL queries, state machine transitions, and dependent-typed APIs at the cost of compile-speed and developer cognitive load."`,
    build: `## BUILD

### 🏗️ Mini Project: Type-Safe URL Router That Infers Path Params From Strings

**What you will build:** A \`router.get('/users/:id/posts/:postId', handler)\` where TypeScript INFERS that handler's params are \`{ id: string; postId: string }\` — purely from the path string literal, no manual typing required.
**Why this project:** Forces template literal types, recursive conditional types, and infer extraction — every advanced-generic technique.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-advanced-generics && cd ts-advanced-generics
npm init -y && npm install -D typescript vitest
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/router.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — Path Param Extraction (Type-Level)
\`\`\`ts
// src/router.ts
// Extract param names from a path string literal
type ExtractParams<Path extends string> =
  Path extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? { [K in Param | keyof ExtractParams<\`/\${Rest}\`>]: string }
    : Path extends \`\${string}:\${infer Param}\`
      ? { [K in Param]: string }
      : {};

// Quick sanity:
type T1 = ExtractParams<'/users/:id'>;             // { id: string }
type T2 = ExtractParams<'/users/:id/posts/:pid'>;  // { id: string; pid: string }
type T3 = ExtractParams<'/static'>;                // {}

export type Handler<Path extends string> =
  (params: ExtractParams<Path>, query: Record<string, string>) => unknown;

export class Router {
  private routes = new Map<string, Handler<string>>();

  get<Path extends string>(path: Path, handler: Handler<Path>) {
    this.routes.set('GET ' + path, handler as Handler<string>);
  }
  post<Path extends string>(path: Path, handler: Handler<Path>) {
    this.routes.set('POST ' + path, handler as Handler<string>);
  }

  // Naive dispatch (real impl would parse the URL)
  dispatch(method: 'GET'|'POST', url: string, params: Record<string,string>, query: Record<string,string>) {
    const route = [...this.routes.keys()].find(k => k.startsWith(method));
    return this.routes.get(route!)?.(params as never, query);
  }
}
\`\`\`

#### Step 3 — Use The Router With Inferred Params
\`\`\`ts
// src/main.ts
import { Router } from './router.js';

const r = new Router();

r.get('/users/:id', (params, query) => {
  // params is typed { id: string }
  console.log('User:', params.id, 'query:', query);
});

r.get('/users/:userId/posts/:postId', (params) => {
  // params is typed { userId: string; postId: string }
  console.log('User:', params.userId, 'Post:', params.postId);
});

r.get('/health', (params) => {
  // params is typed {} — no inference needed
  console.log('OK');
});

// ❌ TS catches misspelled params at compile time
// r.get('/users/:id', (params) => console.log(params.idd));   // TS error
\`\`\`

#### Step 4 — Error Handling: Distributive Conditional Type
\`\`\`ts
// Make every value in params optional via distributive mapping
type Optionalize<P> = P extends Record<string, string>
  ? { [K in keyof P]?: P[K] }
  : never;

// Demo
type Required = { id: string; postId: string };
type Optional = Optionalize<Required>;   // { id?: string; postId?: string }

// Use [P] brackets to prevent distribution if needed
type AllStringsStrict<P> = [P] extends [Record<string, string>] ? true : false;
\`\`\`

#### Step 5 — Tests
\`\`\`ts
import { describe, it, expectTypeOf } from 'vitest';

type ExtractParams<Path extends string> =
  Path extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? { [K in Param | keyof ExtractParams<\`/\${Rest}\`>]: string }
    : Path extends \`\${string}:\${infer Param}\`
      ? { [K in Param]: string }
      : {};

describe('ExtractParams', () => {
  it('extracts single param', () => {
    expectTypeOf<ExtractParams<'/users/:id'>>().toEqualTypeOf<{ id: string }>();
  });
  it('extracts multiple params', () => {
    expectTypeOf<ExtractParams<'/users/:userId/posts/:postId'>>()
      .toEqualTypeOf<{ userId: string; postId: string }>();
  });
  it('returns empty object for paths without params', () => {
    expectTypeOf<ExtractParams<'/health'>>().toEqualTypeOf<{}>();
  });
});
\`\`\`

**Expected Output:**
\`\`\`
User: 42 query: {}
User: 1 Post: 99
OK

# TS rejects misspelled params:
src/main.ts:N:N - error TS2339: Property 'idd' does not exist on type '{ id: string }'.
\`\`\`

**Stretch Challenges:**
- [ ] Add optional params support (\`'/users/:id?'\` → \`{ id?: string }\`)
- [ ] Add wildcard support (\`'/files/*'\` → \`{ '*': string }\`)
- [ ] Use \`@ts-expect-error\` in tests to verify malformed routes fail compilation`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does the \`infer\` keyword do?
**Q2:** Conditional type syntax — \`T extends U ? A : B\` — when does it distribute?
**Q3:** Write \`Unwrap<T>\` that returns the inner type of a Promise. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`type X<T> = T extends string ? true : false\` then \`X<'a' | 1>\` give \`true | false\` instead of \`false\`?
**Q5:** A type triggers "Type instantiation is excessively deep" — diagnose with code.
**Q6:** Refactor to a single conditional type:
\`\`\`ts
type IsArr<T> = T extends Array<any> ? true : false;
type IsStr<T> = T extends string ? true : false;
type Either<T> = IsArr<T> extends true ? 'arr' : IsStr<T> extends true ? 'str' : 'other';
\`\`\`

### Day 7 — Application
**Q7:** Build a typed query-builder that infers SELECT column types from a string literal.
**Q8:** A PR's DeepPartial<T> kills compile time. Add a depth-limiter generic and benchmark.
**Q9:** When do \`[T] extends [U]\` brackets matter — show an example where omitting them changes behaviour.

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how the Type-Challenges repo's 'Awaited' challenge is solved."
**Q11:** Draw: the type evaluation tree for a 3-level recursive conditional type.
**Q12:** ★ System design: "Design a typed event bus that infers payload types from event-name strings parsed from a config object."`
  },

  // ── 13. conditional-types ────────────────────────────────────────────────
  'conditional-types': {
    feynman: `## FEYNMAN CHECK

### Explain Conditional Types Like I'm 10 Years Old
> Conditional types are IF-ELSE for types. \`T extends U ? X : Y\` means: at compile time, check if T is assignable to U; if yes, produce X; if no, produce Y. Combined with \`infer\` (to extract sub-types), conditional types let you write \`Returntype<F>\`, \`Parameters<F>\`, \`Awaited<T>\`. The crucial subtlety: when T is a UNION and appears NAKED on the left of extends, the conditional DISTRIBUTES — \`('a' | 'b') extends string ? true : false\` becomes \`true | true\` = \`true\`, but \`('a' | 1) extends string ? true : false\` becomes \`true | false\`. Wrap in brackets to disable: \`[('a'|1)] extends [string] ? true : false\` evaluates once = \`false\`.

---

### 5 Deep Conceptual Questions

**Q1: What problem do conditional types solve?**
> **A:** Type-level conditional logic. Without them, you cannot express "this function returns T if input is X, else Y." Conditional types are the foundation of every utility type and most production TS libraries — Redux Toolkit's createSlice, tRPC's procedure builders, zod's z.infer, Drizzle ORM's typed queries — all depend on conditional + infer to derive output types from input shapes.

**Q2: Mental model for distribution?**
> **A:** A NAKED type parameter on the LEFT of extends triggers DISTRIBUTION over unions. \`T extends string ? T[] : T\` applied to T = 'a' | 1 produces \`('a' extends string ? 'a'[] : 'a') | (1 extends string ? 1[] : 1)\` = \`'a'[] | 1\`. To EVALUATE ONCE for the whole union, bracket both sides: \`[T] extends [string]\` — now the whole T is checked as a single unit.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Forgetting distribution turns simple conditionals into surprising unions:
> \`\`\`ts
> // ❌ Trying to check "is T exactly string?"
> type IsString<T> = T extends string ? true : false;
> IsString<'a' | number>;   // = true | false (distributes) — WRONG
>
> // ✅ Disable distribution with brackets
> type IsStringStrict<T> = [T] extends [string] ? true : false;
> IsStringStrict<'a' | number>;   // = false (entire union is not string)
> \`\`\`

**Q4: How does \`infer\` interact with conditional types?**
> **A:** \`infer\` is only allowed inside the EXTENDS clause of a conditional. It pattern-matches part of the type and binds a name. \`T extends Promise<infer U> ? U : T\` says "if T is a Promise<something>, give that something the name U and use it." You can have multiple infers, even in nested positions: \`T extends (...args: infer A) => infer R ? { args: A; returns: R } : never\`.

**Q5: FAANG-grade definition?**
> **A:** "Conditional types are TypeScript's type-level ternary expressions \`T extends U ? X : Y\` — distributing over union members when T is a naked type parameter, supporting type extraction via the \`infer\` keyword inside the extends clause — collectively enabling the implementation of every utility type and the type-derivation patterns underpinning production ORMs, routers, and validators."`,
    build: `## BUILD

### 🏗️ Mini Project: Implement \`Returntype\`, \`Parameters\`, And \`Awaited\` From Scratch

**What you will build:** Re-implement TS's built-in utility types using only conditional types + infer, then build a type-level mini-VM that evaluates JSON Schema-style rules at compile time.
**Why this project:** Forces deep understanding of infer and distribution.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-conditional && cd ts-conditional
npm init -y && npm install -D typescript vitest
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/utils.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — Build Utility Types From Scratch
\`\`\`ts
// src/utils.ts
// 1. ReturnType
export type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;

// 2. Parameters
export type MyParameters<F> = F extends (...args: infer A) => any ? A : never;

// 3. Awaited (TS 4.5+)
export type MyAwaited<T> =
  T extends Promise<infer U>
    ? MyAwaited<U>                       // recurse for Promise<Promise<X>>
    : T;

// 4. First and Last in a tuple
export type First<T extends unknown[]> = T extends [infer F, ...unknown[]] ? F : never;
export type Last<T extends unknown[]>  = T extends [...unknown[], infer L] ? L : never;

// 5. NonNullable from scratch
export type MyNonNullable<T> = T extends null | undefined ? never : T;
\`\`\`

#### Step 3 — Use Them With Real Functions
\`\`\`ts
// src/main.ts
import type {
  MyReturnType, MyParameters, MyAwaited,
  First, Last, MyNonNullable,
} from './utils.js';

function greet(name: string, age: number): { hi: string } { return { hi: name }; }

type R = MyReturnType<typeof greet>;        // { hi: string }
type P = MyParameters<typeof greet>;        // [string, number]
type A = MyAwaited<Promise<Promise<number>>>;   // number
type F = First<[1, 2, 3]>;                  // 1
type L = Last<['a', 'b', 'c']>;            // 'c'
type N = MyNonNullable<string | null>;      // string

console.log('Types compile cleanly!');
\`\`\`

#### Step 4 — Error Handling: Distribution Demo
\`\`\`ts
// Distributive (default)
type ToArray<T> = T extends any ? T[] : never;
type Distributed = ToArray<string | number>;   // string[] | number[]

// Non-distributive
type ToArrayStrict<T> = [T] extends [any] ? T[] : never;
type Single = ToArrayStrict<string | number>;   // (string | number)[]

// Common bug fix: NonNullable wrongly distributing
type WrongNonNull<T> = T extends null ? never : T;   // distributes — for T=null|undefined this is undefined
type RightNonNull<T> = T extends null | undefined ? never : T;
\`\`\`

#### Step 5 — Tests
\`\`\`ts
import { describe, it, expectTypeOf } from 'vitest';
import type {
  MyReturnType, MyParameters, MyAwaited, First, Last,
} from './utils.js';

describe('conditional utility types', () => {
  it('ReturnType extracts return', () => {
    expectTypeOf<MyReturnType<() => number>>().toEqualTypeOf<number>();
  });
  it('Parameters extracts argument tuple', () => {
    expectTypeOf<MyParameters<(a: string, b: number) => void>>()
      .toEqualTypeOf<[string, number]>();
  });
  it('Awaited unwraps nested Promises', () => {
    expectTypeOf<MyAwaited<Promise<Promise<Promise<string>>>>>()
      .toEqualTypeOf<string>();
  });
  it('First and Last on tuples', () => {
    expectTypeOf<First<[1, 2, 3]>>().toEqualTypeOf<1>();
    expectTypeOf<Last<[1, 2, 3]>>().toEqualTypeOf<3>();
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Types compile cleanly!

# Test summary:
ReturnType extracts return     ✓
Parameters extracts arg tuple  ✓
Awaited unwraps Promises       ✓
First and Last on tuples       ✓
\`\`\`

**Stretch Challenges:**
- [ ] Implement \`ConstructorParameters<C>\` from scratch
- [ ] Build \`Flatten<T>\` that converts \`Array<Array<T>>\` to \`Array<T>\` recursively
- [ ] Build a type-level JSON parser that validates a literal string at compile time`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Syntax for a conditional type?
**Q2:** When does a conditional type DISTRIBUTE? How do you prevent it?
**Q3:** Write \`ReturnType<F>\` from scratch. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`type IsString<T> = T extends string ? true : false; IsString<'a'|number>\` give \`true | false\`?
**Q5:** A junior writes \`NonNullable<T> = T extends null ? never : T\` and misses undefined. Diagnose.
**Q6:** Implement \`UnwrapArray<T>\` that returns the element type:
\`\`\`ts
type X = UnwrapArray<number[]>;   // number
type Y = UnwrapArray<string>;     // string
\`\`\`

### Day 7 — Application
**Q7:** Build a type that converts \`{ a: string; b: number }\` to \`{ a: () => string; b: () => number }\`.
**Q8:** A PR has a deeply recursive conditional type — TS errors with "type instantiation excessively deep." Fix.
**Q9:** What is the compile-time cost of conditional types on a 1000-file project?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Implement \`Pick<T, K>\` using only conditional and mapped types."
**Q11:** Draw: evaluation tree for \`ConditionalA<ConditionalB<X>>\`.
**Q12:** ★ System design: "Design a tRPC-style API where input/output types are inferred from middleware composition. What conditional + infer patterns are needed?"`
  },

  // ── 14. mapped-types ─────────────────────────────────────────────────────
  'mapped-types': {
    feynman: `## FEYNMAN CHECK

### Explain Mapped Types Like I'm 10 Years Old
> A mapped type is a TYPE-LEVEL FOR LOOP over the keys of another type. \`{ [K in keyof T]: T[K] }\` says "for every key K in T, produce a property K with value T[K]" — that's just a copy. Add modifiers: \`{ [K in keyof T]?: T[K] }\` makes every prop optional (this IS \`Partial<T>\`). \`{ readonly [K in keyof T]: T[K] }\` makes them readonly. \`{ -readonly [K in keyof T]: T[K] }\` REMOVES readonly. \`{ [K in keyof T]: T[K] | null }\` makes every value nullable. KEY REMAPPING (TS 4.1+): \`{ [K in keyof T as \`get\${Capitalize<K & string>}\`]: () => T[K] }\` transforms \`{ name: string }\` into \`{ getName: () => string }\`. This is how Vue's typed reactivity and Mongoose's getter/setter types are built.

---

### 5 Deep Conceptual Questions

**Q1: What problem do mapped types solve?**
> **A:** Deriving NEW types from EXISTING types by transforming each property. Without them, you'd write \`Partial<User>\` by hand: \`{ id?: number; name?: string; email?: string; ... }\` — tedious and brittle. With mapped types, ONE definition (\`Partial<T> = { [K in keyof T]?: T[K] }\`) works for every type forever.

**Q2: Mental model for mapped types?**
> **A:** Iteration over keys. \`{ [K in Keys]: ValueExpr }\` is "for each K in Keys, produce a property K with type ValueExpr." Keys is usually \`keyof T\`. The value expression can use K (to reference the original) or T[K] (to reference the original's value type). Add \`?\` and \`readonly\` (with \`-\` to remove). Add \`as NewKey\` to rename.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Forgetting that mapped types preserve modifiers:
> \`\`\`ts
> // ❌ Doesn't actually remove optional flag
> type StripOptional<T> = { [K in keyof T]: T[K] };
> type Original = { a?: string; b: number };
> type Result = StripOptional<Original>;   // { a?: string; b: number } — still optional!
>
> // ✅ Use - modifier
> type StripOptional<T> = { [K in keyof T]-?: T[K] };
> // Note: this is essentially Required<T>
> \`\`\`

**Q4: How does key remapping interact with template literals?**
> **A:** Combined with template literals, key remapping enables "transform keys by string pattern" — \`as \`on\${Capitalize<K & string>}\`\` turns \`{ click }\` into \`{ onClick }\`. This is how event-handler types in React are typed (\`{ onClick, onMouseOver, ... }\` derived from a dom-events object). The TS 4.1+ \`as\` clause runs after the K binding, so you can compute the new key from K's value.

**Q5: FAANG-grade definition?**
> **A:** "Mapped types are type-level iterations over the keys of an object type, with optional/readonly modifiers (addable via no prefix, removable via -), and key remapping via the \`as\` clause combined with template literal types — collectively enabling Partial, Required, Readonly, Record, and the entire utility-type family, plus framework-level typing for reactive systems, event handlers, and ORM-derived shapes."`,
    build: `## BUILD

### 🏗️ Mini Project: Type-Safe Form-State Builder With Mapped Getters/Setters

**What you will build:** From \`interface User { name: string; age: number }\`, generate a form-state type with \`{ name, setName, age, setAge }\` and a typed factory function — all via mapped types and key remapping.
**Why this project:** Forces mapped types + key remapping + template literals — the foundation of typed React forms libraries.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-mapped && cd ts-mapped
npm init -y && npm install -D typescript vitest
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/form.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — Mapped Type Magic
\`\`\`ts
// src/form.ts
type Capitalize_<S extends string> = S extends \`\${infer F}\${infer R}\` ? \`\${Uppercase<F>}\${R}\` : S;

// For each key K, add { K: T[K]; setK: (v: T[K]) => void }
export type FormState<T> = {
  [K in keyof T]: T[K];
} & {
  [K in keyof T as \`set\${Capitalize_<K & string>}\`]: (value: T[K]) => void;
};

export function createForm<T extends Record<string, unknown>>(initial: T): FormState<T> {
  const state = { ...initial } as Record<string, unknown>;
  const setters: Record<string, (v: unknown) => void> = {};
  for (const key of Object.keys(initial)) {
    const setter = 'set' + key.charAt(0).toUpperCase() + key.slice(1);
    setters[setter] = (v) => { state[key] = v; };
  }
  return { ...state, ...setters } as FormState<T>;
}
\`\`\`

#### Step 3 — Use The Form Builder
\`\`\`ts
// src/main.ts
import { createForm } from './form.js';

interface User { name: string; age: number; email: string }

const form = createForm<User>({ name: 'Ana', age: 30, email: 'a@b.io' });

console.log(form.name);             // 'Ana'
form.setName('Anna');               // typed: setName(value: string) => void
form.setAge(31);                    // typed: setAge(value: number) => void
console.log(form.name, form.age);   // 'Anna' 31

// ❌ TS catches misuse
// form.setName(99);                // string expected
// form.setEmail = (v) => {};       // can't reassign — fine, runtime mutability is a different concern
\`\`\`

#### Step 4 — Error Handling: ReadOnly + Strip Modifiers
\`\`\`ts
// Make every prop readonly
type DeepReadonly<T> = { readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K] };

// Strip readonly + optional
type Mutable<T> = { -readonly [K in keyof T]-?: T[K] };

interface Frozen { readonly name?: string }
type Thawed = Mutable<Frozen>;   // { name: string }
\`\`\`

#### Step 5 — Tests
\`\`\`ts
import { describe, it, expect, expectTypeOf } from 'vitest';
import { createForm, type FormState } from './form.js';

describe('FormState', () => {
  it('generates setters at type level', () => {
    type F = FormState<{ name: string }>;
    expectTypeOf<F>().toHaveProperty('setName');
  });
  it('createForm exposes initial values', () => {
    const f = createForm({ x: 1, y: 'a' });
    expect(f.x).toBe(1);
    expect(f.y).toBe('a');
  });
  it('setters mutate fields', () => {
    const f = createForm({ count: 0 });
    f.setCount(5);
    expect(f.count).toBe(5);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Ana
Anna 31

Tests:
generates setters at type level   ✓
createForm exposes initial values ✓
setters mutate fields             ✓
\`\`\`

**Stretch Challenges:**
- [ ] Add validators via a second mapped type: \`{ validateName: (v) => boolean }\`
- [ ] Make the form-state reactive (Proxy-based) so setters trigger subscribers
- [ ] Filter properties by type: emit setters only for primitive-valued keys`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Syntax for a mapped type?
**Q2:** What do \`?\` and \`readonly\` modifiers do? How do you REMOVE them?
**Q3:** Write \`Partial<T>\` using a mapped type. From memory.

### Day 3 — Comprehension
**Q4:** What does \`as\` in a mapped type clause do?
**Q5:** A type \`{ [K in keyof T]?: T[K] }\` doesn't make a deeply nested object's fields optional — diagnose and fix.
**Q6:** Write a type that converts \`{ name: string; age: number }\` to \`{ getName: () => string; getAge: () => number }\`.

### Day 7 — Application
**Q7:** Build a typed Reactive store using mapped types + Proxy.
**Q8:** A PR adds DeepPartial without using mapped types — refactor.
**Q9:** What is the cost difference of \`Partial<T>\` vs writing the optional fields manually?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Implement Required, Readonly, and Mutable from scratch using mapped types."
**Q11:** Draw: type evaluation for a mapped type combined with key remapping + template literal.
**Q12:** ★ System design: "Architect a typed reactive framework where component state's setters/validators are auto-derived via mapped types from a single source schema."`
  },

  // ── 15. template-literal-types ───────────────────────────────────────────
  'template-literal-types': {
    feynman: `## FEYNMAN CHECK

### Explain Template Literal Types Like I'm 10 Years Old
> Template literal types let you BUILD string types from other string types using JS-style template syntax. \`type Greeting = \\\`Hello, \\\${string}\\\`\` matches any string starting with "Hello, ". \`type Event = \\\`on\\\${Capitalize<'click'|'hover'>}\\\`\` produces \`'onClick' | 'onHover'\`. Combined with INTRINSIC type modifiers (\`Uppercase\`, \`Lowercase\`, \`Capitalize\`, \`Uncapitalize\`), you can transform string types programmatically. The non-obvious power: when union types appear in interpolation positions, the result DISTRIBUTES — \`\\\`\\\${'a'|'b'}-\\\${'x'|'y'}\\\`\` produces \`'a-x' | 'a-y' | 'b-x' | 'b-y'\` (all combinations). This is how CSS-in-JS libraries type \`color-\${shade}\` props and how typed routers infer params from URL strings.

---

### 5 Deep Conceptual Questions

**Q1: What problem do template literal types solve?**
> **A:** Type-safe string composition. Without them, \`'red' | 'blue' | 'green'\` and \`'500' | '700' | '900'\` couldn't combine into \`'red-500' | 'red-700' | ...\` — you'd write each combination manually. They also enable parsing string types (extracting URL params, splitting CSV strings, transforming kebab-case to camelCase at the type level) — turning TypeScript into a string-processing language at compile time.

**Q2: Mental model for distribution in template literals?**
> **A:** When a union appears in an interpolation slot, every member of that union is plugged in, producing a new union of all combinations. \`\\\`\\\${'a' | 'b'}\\\`\` = \`'a' | 'b'\`. \`\\\`\\\${'a'|'b'}-\\\${'x'|'y'}\\\`\` = 4 strings. This makes Tailwind-style typed color tokens easy: \`\\\`bg-\\\${Color}-\\\${Shade}\\\`\` generates all valid utility class strings.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing \`\\\`Hello, \\\${string}\\\`\` matches any string with "Hello, " anywhere in it:
> \`\`\`ts
> // ❌ Template literal types must match STRUCTURE, not contain a substring
> type Greeting = \\\`Hello, \\\${string}\\\`;
> const a: Greeting = 'Hello, Ana';   // ✅ matches prefix
> const b: Greeting = 'Hello, ';      // ✅ matches prefix
> const c: Greeting = 'Hi, Hello, X'; // ❌ doesn't START with "Hello, "
>
> // For "contains" you need: \`\\\${string}Hello\\\${string}\` (slow on long strings)
> \`\`\`

**Q4: How does \`infer\` combine with template literal types?**
> **A:** \`T extends \\\`\\\${infer Head}-\\\${infer Tail}\\\` ? [Head, Tail] : never\` extracts substrings around a separator. This is the core of typed URL routers, CSV parsers, and CSS class generators. Combined with recursive conditional types: \`type Split<S, Sep> = S extends \\\`\\\${infer H}\\\${Sep}\\\${infer R}\\\` ? [H, ...Split<R, Sep>] : [S]\` splits a string literal into a tuple.

**Q5: FAANG-grade definition?**
> **A:** "Template literal types are TypeScript's compile-time string composition primitives — interpolating other types (with union distribution producing combinatorial results), supporting the intrinsic string transformers Uppercase/Lowercase/Capitalize/Uncapitalize, and combinable with \`infer\` for type-level string parsing — collectively enabling typed CSS utilities, URL routers, and string-derived API contracts."`,
    build: `## BUILD

### 🏗️ Mini Project: Typed CSS Utility Classes + i18n Key Validator

**What you will build:** A typed Tailwind-like class generator where \`bg-blue-500\` is a valid type but \`bg-purple-1000\` is not, and an i18n key validator where keys must match \`module.section.key\` format.
**Why this project:** Forces template literal distribution + intrinsic transformers + infer parsing — every advanced template-literal pattern.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-template-literal && cd ts-template-literal
npm init -y && npm install -D typescript vitest
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/css.ts, src/i18n.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — Typed CSS Utility Classes
\`\`\`ts
// src/css.ts
type Color   = 'red' | 'green' | 'blue' | 'yellow';
type Shade   = 100 | 300 | 500 | 700 | 900;
type Prefix  = 'bg' | 'text' | 'border';

// Distribution: all combinations produced
export type CssClass = \`\${Prefix}-\${Color}-\${Shade}\`;
//                       'bg-red-100' | 'bg-red-300' | ... | 'border-yellow-900'  (60 total)

export type Hover<C extends string> = \`hover:\${C}\`;
//   Hover<'bg-red-500'> = 'hover:bg-red-500'

export function cx(...classes: CssClass[]): string {
  return classes.join(' ');
}
\`\`\`

#### Step 3 — i18n Key Validator With Parsing
\`\`\`ts
// src/i18n.ts
// Must match "module.section.key" — three dot-separated parts
export type I18nKey = \`\${string}.\${string}.\${string}\`;

// Parse it back at the type level
export type ParseKey<K extends string> =
  K extends \`\${infer M}.\${infer S}.\${infer Leaf}\`
    ? { module: M; section: S; key: Leaf }
    : never;

type Parsed = ParseKey<'auth.signin.button.submit'>;
// { module: 'auth'; section: 'signin'; key: 'button.submit' } — note: rest goes into Leaf

// Stricter: allow only [a-z] and exact dots
type Strict = 'auth.signin.submit' | 'orders.cart.checkout';

export function t<K extends Strict>(key: K): string {
  const translations: Record<Strict, string> = {
    'auth.signin.submit':   'Sign in',
    'orders.cart.checkout': 'Checkout',
  };
  return translations[key];
}
\`\`\`

#### Step 4 — Error Handling: Compile-Time Rejection
\`\`\`ts
// src/main.ts
import { type CssClass, type Hover, cx } from './css.js';
import { t } from './i18n.js';

const a: CssClass = 'bg-blue-500';      // ✅
// const b: CssClass = 'bg-purple-500'; // ❌ purple not in Color
// const c: CssClass = 'bg-blue-1000';  // ❌ 1000 not in Shade

const h: Hover<'bg-red-500'> = 'hover:bg-red-500';

console.log(cx('bg-blue-500', 'text-yellow-700'));
console.log(t('auth.signin.submit'));   // ✅
// console.log(t('unknown.key'));       // ❌
\`\`\`

#### Step 5 — Tests
\`\`\`ts
import { describe, it, expectTypeOf } from 'vitest';
import type { CssClass, Hover } from './css.js';
import type { ParseKey } from './i18n.js';

describe('template literal types', () => {
  it('CssClass distributes over all combinations', () => {
    expectTypeOf<'bg-red-500'>().toMatchTypeOf<CssClass>();
    expectTypeOf<'text-green-700'>().toMatchTypeOf<CssClass>();
  });
  it('Hover prefixes correctly', () => {
    expectTypeOf<Hover<'bg-red-500'>>().toEqualTypeOf<'hover:bg-red-500'>();
  });
  it('ParseKey extracts module, section, key', () => {
    type P = ParseKey<'auth.signin.submit'>;
    expectTypeOf<P>().toEqualTypeOf<{ module: 'auth'; section: 'signin'; key: 'submit' }>();
  });
});
\`\`\`

**Expected Output:**
\`\`\`
bg-blue-500 text-yellow-700
Sign in

# tsc errors:
src/main.ts:N - error TS2322: '"bg-purple-500"' is not assignable to type 'CssClass'.
src/main.ts:N - error TS2345: '"unknown.key"' is not assignable to '"auth.signin.submit"|"orders.cart.checkout"'.
\`\`\`

**Stretch Challenges:**
- [ ] Build a typed SQL SELECT parser: \`'SELECT name, age FROM users'\` infers the column tuple
- [ ] Add CamelCase ↔ snake_case converter at the type level
- [ ] Generate API client method names from REST paths via template literals`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Syntax for a template literal type?
**Q2:** Name the four intrinsic string transformers.
**Q3:** Write a type that produces \`'on' + Capitalize<event>\` for events 'click' and 'hover'. From memory.

### Day 3 — Comprehension
**Q4:** How does union distribution work in template literal types? Show a 2-axis example.
**Q5:** Why does \`type X = \\\`Hello, \\\${string}\\\`\` not match \`'Hi, Hello, X'\`?
**Q6:** Build a Split<S, Sep> type that returns a tuple of substrings.

### Day 7 — Application
**Q7:** Build a type-safe path-param extractor for Express-style routes.
**Q8:** A PR adds a string union of 1000 entries to a template literal — explain the compile-speed cost.
**Q9:** How would you type CSS variable names like \`--space-1\` through \`--space-12\`?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how a typed router infers params from a path string at compile time."
**Q11:** Draw: combinatorial expansion of \`\\\`\\\${A|B}-\\\${X|Y|Z}\\\`\`.
**Q12:** ★ System design: "Type-safely model a query builder where SELECT columns, WHERE clauses, and JOIN tables are all parsed from string literals."`
  },

  // ── 16. tsconfig-deep ────────────────────────────────────────────────────
  'tsconfig-deep': {
    feynman: `## FEYNMAN CHECK

### Explain tsconfig Like I'm 10 Years Old
> \`tsconfig.json\` is the CONTROL PANEL for the TypeScript compiler. It tells tsc: which files to include, what JS version to emit (target), what module system (module), where to put output (outDir), and HUNDREDS of type-checking strictness flags. The most important: \`strict: true\` enables a bundle of safety checks (\`strictNullChecks\`, \`noImplicitAny\`, \`strictFunctionTypes\`, \`strictBindCallApply\`, \`strictPropertyInitialization\`, \`alwaysStrict\`, \`noImplicitThis\`). Enable strict on day one of every new project — adding it later means fixing thousands of errors. Path aliases (\`paths\`), composite project references, and incremental builds are the power features for monorepos.

---

### 5 Deep Conceptual Questions

**Q1: Why is \`"strict": true\` non-negotiable?**
> **A:** Without it, \`function add(a, b) { return a + b; }\` infers a and b as \`any\` — silently disabling type checking. \`null\` and \`undefined\` slip into types unnoticed. Class field initialization is unchecked. Function-type variance is permissive. Migration debt accrues. The TS team has stated \`strict: true\` should be the default for all new projects — it's a single opt-out flag if needed, but opt-in for individual flags is brittle.

**Q2: Mental model: what does each compilerOption affect?**
> **A:** Three categories: (1) **Type checking** — strict flags, noUnused*, exactOptionalPropertyTypes — controls how rigorous tsc is. (2) **Module emission** — target, module, moduleResolution, esModuleInterop, isolatedModules — controls what JS comes out and how. (3) **Workflow** — incremental, composite, paths, baseUrl, references — controls multi-project builds, watch mode, IDE performance.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing \`module\` and \`moduleResolution\` are the same thing:
> \`\`\`json
> // ❌ Mismatched module + moduleResolution causes mysterious "cannot find module" errors
> { "module": "ESNext", "moduleResolution": "Node" }
>
> // ✅ Modern combos (TS 5.x):
> { "module": "NodeNext",  "moduleResolution": "NodeNext"  }   // Node ESM/CJS interop
> { "module": "Bundler",   "moduleResolution": "Bundler"   }   // Vite, esbuild, webpack
> { "module": "ESNext",    "moduleResolution": "Bundler"   }   // browser bundles
> \`\`\`

**Q4: How do project references and incremental builds work?**
> **A:** \`composite: true\` + \`references: [...]\` lets you split a large codebase into "projects" — tsc builds them in dependency order, caches each project's output, and rebuilds only what changed. This turns a 60-second monorepo build into a 5-second incremental rebuild. Pair with \`tsc --build\` (not just tsc) to use the project references. Required for sane monorepos and necessary for \`isolatedDeclarations\` to be useful.

**Q5: FAANG-grade definition?**
> **A:** "tsconfig.json is the TypeScript compiler's configuration manifest — controlling type-checking strictness (the strict suite, noUnused checks, exactOptionalPropertyTypes), module emission semantics (target, module, moduleResolution, esModuleInterop, isolatedModules for transpile-only tools), workflow features (composite project references, incremental compilation, path aliases), and library-discovery (lib, types, typeRoots) — collectively determining what the compiler accepts as valid TypeScript and what JavaScript it produces."`,
    build: `## BUILD

### 🏗️ Mini Project: Production-Grade tsconfig For a Monorepo

**What you will build:** A real monorepo tsconfig setup with a base config, project references, path aliases, and full strict mode — the kind shipped by Vercel, Microsoft, and Shopify.
**Why this project:** Forces the production tsconfig patterns you cannot get from "tsc --init."
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-monorepo && cd ts-monorepo
mkdir packages\\ui packages\\core packages\\app
npm init -y
npm install -D typescript
ni tsconfig.base.json, tsconfig.json -ItemType File
ni packages\\ui\\tsconfig.json, packages\\core\\tsconfig.json, packages\\app\\tsconfig.json -ItemType File
\`\`\`

#### Step 2 — Base Config (Shared)
\`\`\`json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM"],

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    "esModuleInterop": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,

    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true,

    "baseUrl": ".",
    "paths": {
      "@ui/*":   ["packages/ui/src/*"],
      "@core/*": ["packages/core/src/*"]
    }
  }
}
\`\`\`

#### Step 3 — Per-Package Configs
\`\`\`json
// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir":  "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}

// packages/ui/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir":  "./dist",
    "rootDir": "./src",
    "jsx":     "react-jsx"
  },
  "include": ["src/**/*"],
  "references": [{ "path": "../core" }]
}

// packages/app/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir":  "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../core" },
    { "path": "../ui" }
  ]
}
\`\`\`

#### Step 4 — Root Aggregator
\`\`\`json
// tsconfig.json
{
  "files": [],
  "references": [
    { "path": "packages/core" },
    { "path": "packages/ui" },
    { "path": "packages/app" }
  ]
}
\`\`\`

#### Step 5 — Build & Verify
\`\`\`bash
# Create sample source
ni packages/core/src/index.ts -ItemType File
"export const greet = (n: string) => 'Hi, ' + n;" | Out-File packages/core/src/index.ts

# Build with project references
npx tsc --build

# Incremental: edit a file in core, rebuild — only core + dependents rebuild
echo "// touch" >> packages/core/src/index.ts
npx tsc --build   # ~ms — caches kicked in

# Inspect .tsbuildinfo files (the cache)
Get-ChildItem -Recurse -Filter "*.tsbuildinfo"
\`\`\`
\`\`\`json
// package.json (scripts)
{
  "scripts": {
    "build": "tsc --build",
    "clean": "tsc --build --clean",
    "watch": "tsc --build --watch"
  }
}
\`\`\`

**Expected Output:**
\`\`\`
# First build: full compile of all 3 projects
$ npx tsc --build
[~3s]

# Incremental build after touching core:
$ npx tsc --build
[~200ms]   # only core + dependents rebuilt

# Path aliases work:
import { Button } from '@ui/Button';   // resolves via tsconfig "paths"
\`\`\`

**Stretch Challenges:**
- [ ] Add \`isolatedDeclarations\` (TS 5.5+) and observe faster declaration emit
- [ ] Add a Vitest tsconfig that overrides to \`module: "ESNext"\`
- [ ] Profile build times with \`tsc --extendedDiagnostics\``,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does \`"strict": true\` enable? Name 3 of its sub-flags.
**Q2:** Difference between \`module\` and \`moduleResolution\`?
**Q3:** Write the minimum tsconfig for a Node 22 ESM project. From memory.

### Day 3 — Comprehension
**Q4:** Why is \`isolatedModules\` required for esbuild/swc and not for tsc alone?
**Q5:** A monorepo build takes 60s every time. Diagnose and propose project-references setup.
**Q6:** Refactor: this tsconfig has the strict flags disabled — re-enable them and list the migration steps.

### Day 7 — Application
**Q7:** Set up path aliases AND make them work for both runtime (\`tsx\`, Vitest) AND production builds.
**Q8:** A PR sets \`noUncheckedIndexedAccess: false\` — explain three bugs that re-emerge.
**Q9:** What does \`skipLibCheck: false\` cost on a real project? When is it worth it?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every flag in 'strict' and the production bug each prevents."
**Q11:** Draw: how do composite, references, and incremental interact in a monorepo build.
**Q12:** ★ System design: "Architect the tsconfig structure for a 50-package monorepo with browser, Node, and React Native targets."`
  },

  // ── 17. module-resolution ────────────────────────────────────────────────
  'module-resolution': {
    feynman: `## FEYNMAN CHECK

### Explain Module Resolution Like I'm 10 Years Old
> Module resolution is HOW TypeScript figures out what \`import { foo } from 'bar'\` actually points to on disk. There are several strategies: \`Node\` (CommonJS — the old way), \`NodeNext\` (modern Node ESM + CJS interop with file-extension rules), \`Bundler\` (mimics how Vite/webpack/esbuild resolve — no extension required, supports package.json "exports"), and \`Classic\` (deprecated). The non-obvious complexity: package.json's \`"exports"\` field controls what consumers can import, with conditional exports for ESM vs CJS, browser vs node, types vs runtime. A single missing "types" condition makes your library invisible to consumers' TypeScript.

---

### 5 Deep Conceptual Questions

**Q1: Why are there multiple module resolution strategies?**
> **A:** History. Node started CJS-only (Node strategy). Then ESM arrived with strict file-extension rules and a different resolution algorithm (NodeNext). Bundlers ignored both and invented their own conventions (omit extensions, support .ts directly, alias resolution). Bundler resolution (TS 5.0+) is the spec for the bundler world. Pick based on RUNTIME — Node app? NodeNext. Vite/Next.js? Bundler. Browser-only? Bundler. Legacy CJS? Node.

**Q2: Mental model for package.json "exports"?**
> **A:** \`exports\` is the PUBLIC API of a package. It maps subpath to file. Conditions (\`import\`, \`require\`, \`types\`, \`browser\`, \`node\`) let you provide different files based on consumer environment. \`"./foo": { "import": "./foo.mjs", "require": "./foo.cjs", "types": "./foo.d.ts" }\`. If a path is NOT in exports, consumers can't import it — even if the file exists. This replaces the older "main" + "module" + "browser" fields.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Forgetting the "types" condition in exports:
> \`\`\`json
> // ❌ Library works at runtime but consumers' TS shows "any" for everything
> { "exports": {
>     ".": { "import": "./dist/index.js" }     // no types condition!
> } }
>
> // ✅ Always include types — and it MUST be FIRST in the conditions object
> { "exports": {
>     ".": {
>       "types":  "./dist/index.d.ts",
>       "import": "./dist/index.js"
>     }
> } }
> \`\`\`

**Q4: How does TS find \`@types/*\` packages?**
> **A:** TS walks node_modules looking for \`@types/<package>\` declarations, then \`<package>/package.json\` "types" field, then \`<package>/index.d.ts\` by convention. Restrict with \`typeRoots\` (replaces all) or \`types\` (allowlist what to load). Crucial for monorepo perf: \`"types": []\` in test packages prevents accidentally pulling in node, jest, mocha types globally.

**Q5: FAANG-grade definition?**
> **A:** "TypeScript module resolution is the algorithm mapping import specifiers to file paths — selectable via the moduleResolution compilerOption (Node for legacy CommonJS, NodeNext for ESM-aware Node, Bundler for bundler-conventions, Classic deprecated) — interacting with package.json's exports field for public API definition (with the types condition mandatory and ordering-significant), and tsconfig paths/baseUrl for compile-time alias resolution."`,
    build: `## BUILD

### 🏗️ Mini Project: Publish a Dual ESM/CJS Library With Proper Types

**What you will build:** A small TypeScript library that publishes both ESM and CJS builds with type declarations, working correctly in Node 18+ (ESM), Node CJS, and bundlers.
**Why this project:** Forces real package.json exports configuration — the #1 source of "cannot find module" errors in 2026.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-dual-pkg && cd ts-dual-pkg
npm init -y
npm install -D typescript
ni src/index.ts, tsconfig.esm.json, tsconfig.cjs.json -ItemType File
\`\`\`

#### Step 2 — Source Code
\`\`\`ts
// src/index.ts
export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

export const VERSION = '1.0.0';
\`\`\`

#### Step 3 — Two Build Configs
\`\`\`json
// tsconfig.esm.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "outDir": "./dist/esm",
    "declaration": true,
    "declarationDir": "./dist/esm",
    "strict": true
  },
  "include": ["src/**/*"]
}

// tsconfig.cjs.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "outDir": "./dist/cjs",
    "declaration": true,
    "declarationDir": "./dist/cjs",
    "strict": true
  },
  "include": ["src/**/*"]
}
\`\`\`

#### Step 4 — Package.json Exports
\`\`\`json
// package.json
{
  "name": "my-greet-lib",
  "version": "1.0.0",
  "type": "module",
  "main":    "./dist/cjs/index.js",
  "module":  "./dist/esm/index.js",
  "types":   "./dist/esm/index.d.ts",
  "exports": {
    ".": {
      "types":   "./dist/esm/index.d.ts",
      "import":  "./dist/esm/index.js",
      "require": "./dist/cjs/index.js"
    },
    "./package.json": "./package.json"
  },
  "files": ["dist"],
  "scripts": {
    "build:esm": "tsc -p tsconfig.esm.json",
    "build:cjs": "tsc -p tsconfig.cjs.json && node -e \\"require('fs').writeFileSync('dist/cjs/package.json',JSON.stringify({type:'commonjs'}))\\"",
    "build": "npm run build:esm && npm run build:cjs"
  }
}
\`\`\`

#### Step 5 — Test Both Worlds
\`\`\`bash
npm run build

# Test ESM consumer
ni test-esm/index.mjs -ItemType File
@"
import { greet, VERSION } from 'my-greet-lib';
console.log(greet('ESM'), VERSION);
"@ | Out-File test-esm/index.mjs

# Test CJS consumer
ni test-cjs/index.cjs -ItemType File
@"
const { greet, VERSION } = require('my-greet-lib');
console.log(greet('CJS'), VERSION);
"@ | Out-File test-cjs/index.cjs

# (After npm link or local install)
node test-esm/index.mjs
node test-cjs/index.cjs
\`\`\`
\`\`\`bash
# Verify with publint
npx publint
# Verify with arethetypeswrong
npx @arethetypeswrong/cli .
\`\`\`

**Expected Output:**
\`\`\`
Hello, ESM! 1.0.0
Hello, CJS! 1.0.0

$ npx publint
✔ All exports point to valid files
✔ types condition is first
✔ ESM and CJS subpaths match

$ npx @arethetypeswrong/cli .
✔ Node 16+ (ESM):       ok
✔ Node 16+ (CJS):       ok
✔ Bundler:              ok
\`\`\`

**Stretch Challenges:**
- [ ] Add a "browser" condition that excludes Node-only APIs
- [ ] Add subpath exports: \`my-greet-lib/utils\`
- [ ] Run \`publint --strict\` and fix every warning`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Name the four moduleResolution values and when to use each.
**Q2:** Why must \`types\` be the FIRST condition in exports?
**Q3:** Write a minimal package.json exports for a dual ESM/CJS library. From memory.

### Day 3 — Comprehension
**Q4:** Why does omitting "types" from exports cause consumers' TS to show "any"?
**Q5:** A package import fails with "cannot find module" but the file exists — diagnose using the exports field.
**Q6:** Convert this CJS-only library to dual format:
\`\`\`json
{ "main": "./dist/index.js", "types": "./dist/index.d.ts" }
\`\`\`

### Day 7 — Application
**Q7:** Set up a TypeScript library that works in both Webpack 5 and Vite, Node 18 ESM, and Node 18 CJS.
**Q8:** A PR adds a new subpath but forgets to add it to exports. What breaks for consumers?
**Q9:** What is the cost of dual-publishing vs ESM-only in 2026?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through everything that can go wrong when publishing a TypeScript library to npm."
**Q11:** Draw: how does Node's ESM resolution differ from CJS — for example same import path.
**Q12:** ★ System design: "Architect a monorepo's publish pipeline where 20 packages depend on each other and must support React Native, Node, and the browser."`
  },

  // ── 18. declaration-files ────────────────────────────────────────────────
  'declaration-files': {
    feynman: `## FEYNMAN CHECK

### Explain Declaration Files Like I'm 10 Years Old
> A declaration file (\`.d.ts\`) is a TYPES-ONLY blueprint — no implementation, just the SHAPES. When you write TS source, the compiler can EMIT matching .d.ts files alongside .js — this is how libraries ship type information. When you use a JS-only library, you can WRITE a .d.ts file describing its shape so TS knows what's there. \`@types/foo\` packages on npm are community-maintained .d.ts for popular JS libraries (lodash, express, react-dom). Ambient declarations (\`declare module 'foo' { ... }\`) let you type a library inline. Triple-slash directives (\`/// <reference path="..." />\`) are legacy but still appear. The non-obvious power: declaration merging lets you AUGMENT existing types (extend Express's Request, add custom Window properties).

---

### 5 Deep Conceptual Questions

**Q1: When do you need to write a .d.ts file?**
> **A:** Three cases: (1) Your TS library publishing — \`declaration: true\` emits them automatically. (2) Using a JS-only library with no @types/* package — write your own .d.ts. (3) Augmenting global types — adding to \`window.myFoo\`, extending Express \`Request.user\`, adding custom CSS in JSX. For modern projects most libraries ship types; you usually only write .d.ts for project-specific augmentation.

**Q2: Mental model for declaration files?**
> **A:** Think of .d.ts as the "header file" of TypeScript (C analog). It describes WHAT exists without HOW. Pure types are erased at runtime; declaration files preserve them across compilation boundaries. They're how TS bridges to JS-only code, how IDE intellisense works for installed packages, and how libraries express their public API without forcing consumers to compile from source.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Putting \`import\` in an ambient declaration accidentally makes it a module:
> \`\`\`ts
> // ❌ The import makes this file a MODULE — globals don't apply globally
> import { type Foo } from './foo';
> declare global {
>   interface Window { myApp: { foo: Foo } }   // works only when imported, not globally
> }
>
> // ✅ Wrap in declare global { } and avoid top-level non-type imports
> // For augmentation, use 'export {}' to make it explicitly a module
> declare global {
>   interface Window { myApp: { foo: string } }
> }
> export {};   // makes the file a module
> \`\`\`

**Q4: How does declaration merging work for libraries like Express?**
> **A:** Express ships \`@types/express\` with \`interface Request { ... }\`. In your app, you write \`declare module 'express-serve-static-core' { interface Request { user?: User } }\` — TS MERGES this with the original interface, adding your custom \`user\` property. Now every \`req.user\` is typed across your codebase. This is the canonical pattern for typing middleware-added properties.

**Q5: FAANG-grade definition?**
> **A:** "Declaration files (.d.ts) are TypeScript's type-only header files describing the public shape of modules without implementation — emitted automatically by tsc with \`declaration: true\`, hand-written for type augmentation (declare global, declare module), distributed via @types/* packages for JavaScript libraries, and combined through declaration merging to extend third-party types in application code."`,
    build: `## BUILD

### 🏗️ Mini Project: Augment Express Request With Custom Properties + Type a JS-Only Library

**What you will build:** Extend Express's \`Request\` to include \`user\` and \`requestId\`, plus write a .d.ts for a hypothetical JS-only library — both in one project.
**Why this project:** Forces declaration merging and manual .d.ts writing — the two most common production .d.ts tasks.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-dts && cd ts-dts
npm init -y
npm install express
npm install -D typescript @types/express @types/node
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/types/express.d.ts, src/types/legacy-lib.d.ts, src/server.ts, lib/legacy.js -ItemType File
\`\`\`

#### Step 2 — Augment Express
\`\`\`ts
// src/types/express.d.ts
import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: number; email: string; role: 'admin' | 'user' };
    requestId: string;
  }
}
\`\`\`

#### Step 3 — Type a JS-Only Library
\`\`\`javascript
// lib/legacy.js (no types provided)
exports.computeChecksum = function(data) {
  return data.split('').reduce((a, c) => (a + c.charCodeAt(0)) % 256, 0);
};
exports.VERSION = '0.4.1';
\`\`\`
\`\`\`ts
// src/types/legacy-lib.d.ts
declare module 'legacy-lib' {
  export function computeChecksum(data: string): number;
  export const VERSION: string;
}
\`\`\`
\`\`\`json
// package.json (add "imports" for the local JS)
{ "imports": { "legacy-lib": "./lib/legacy.js" } }
\`\`\`

#### Step 4 — Use Both Augmentations
\`\`\`ts
// src/server.ts
import express, { type Request, type Response, type NextFunction } from 'express';
// @ts-ignore — local alias
import * as legacy from 'legacy-lib';

const app = express();

// Middleware: assign requestId + (fake) user
app.use((req: Request, _res: Response, next: NextFunction) => {
  req.requestId = Math.random().toString(36).slice(2);
  req.user = { id: 1, email: 'demo@example.com', role: 'admin' };
  next();
});

app.get('/profile', (req, res) => {
  // req.user is now typed — autocomplete works
  if (!req.user) return res.status(401).end();
  res.json({
    user: req.user,
    requestId: req.requestId,
    checksum: legacy.computeChecksum(req.user.email),
    libVersion: legacy.VERSION,
  });
});

app.listen(3000, () => console.log('Listening on 3000'));
\`\`\`

#### Step 5 — Tests + tsc Check
\`\`\`bash
npx tsc --noEmit   # must pass with strict mode

# Verify in src/server.ts:
#  - req.user.email autocompletes
#  - legacy.computeChecksum has type (string) => number, not any
\`\`\`
\`\`\`ts
// src/server.test.ts
import { describe, it, expectTypeOf } from 'vitest';
import type { Request } from 'express';

describe('declaration merging', () => {
  it('Request has user and requestId', () => {
    expectTypeOf<Request>().toHaveProperty('user');
    expectTypeOf<Request>().toHaveProperty('requestId');
  });
});
\`\`\`

**Expected Output:**
\`\`\`
$ npx tsc --noEmit
[no errors]

$ node dist/server.js
Listening on 3000

# req.user is fully typed — TS knows about email, role
# legacy.computeChecksum is typed (string) => number
\`\`\`

**Stretch Challenges:**
- [ ] Add custom CSS-in-JSX intrinsic attributes via \`declare namespace JSX\`
- [ ] Type a hypothetical \`window.myAnalytics\` global from a script tag
- [ ] Migrate the JS library to TS and remove the .d.ts file`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is a .d.ts file? Does it ship code?
**Q2:** What does \`declare module 'foo' { ... }\` do?
**Q3:** Write a declaration that adds \`window.myApp: { id: number }\`. From memory.

### Day 3 — Comprehension
**Q4:** Why does adding a top-level \`import\` to a .d.ts break global augmentation?
**Q5:** A junior types Express middleware additions but \`req.user\` is still \`any\` — diagnose.
**Q6:** Write a .d.ts for a CommonJS library exporting:
\`\`\`js
module.exports = { connect: (url) => Promise.resolve({ close: () => {} }) };
\`\`\`

### Day 7 — Application
**Q7:** Add full TS typing to a vanilla JS library by writing only .d.ts files (no source changes).
**Q8:** A PR ships a library without \`declaration: true\` — explain the consumer experience.
**Q9:** What is the cost of \`skipLibCheck: false\` on a project with 200 deps that ship .d.ts?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how to add types to a popular JS library that doesn't ship its own."
**Q11:** Draw: relationship between source .ts, emitted .js, emitted .d.ts, and consumer projects.
**Q12:** ★ System design: "Plan the .d.ts strategy for a polyglot codebase mixing JS and TS, with internal libraries and external SDKs."`
  },

  // ── 19. decorators-ts ────────────────────────────────────────────────────
  'decorators-ts': {
    feynman: `## FEYNMAN CHECK

### Explain Decorators Like I'm 10 Years Old
> A decorator is a function that ANNOTATES a class, method, field, or accessor — wrapping or modifying it without changing the original code. \`@Logger\` above a method runs Logger(method) at class-definition time. There are TWO versions: (1) The LEGACY decorators (\`experimentalDecorators: true\` + \`emitDecoratorMetadata\`) used by Angular, NestJS, TypeORM. (2) The STAGE-3 decorators (TC39 standard, TS 5.0+) — different API, different semantics, future-proof. They cannot easily coexist. Decorators are powerful — they enable Dependency Injection, ORM mappings, validation rules, RPC stubs — but at the cost of "magic" and complex bug surfaces. The TS 5.0 stage-3 decorators fixed many issues but are not yet supported by Angular as of TS 5.x.

---

### 5 Deep Conceptual Questions

**Q1: Why do frameworks like Angular, NestJS, TypeORM love decorators?**
> **A:** Decorators provide a declarative way to attach METADATA to classes/methods. Angular uses \`@Component\`, \`@Injectable\` to register classes with the DI container. TypeORM uses \`@Entity\`, \`@Column\` to map classes to database tables. NestJS uses \`@Controller\`, \`@Get\` to define HTTP routes. The runtime metadata (via \`reflect-metadata\`) lets the framework introspect what was decorated. Without decorators, all this metadata would need to be in separate config files or builder calls.

**Q2: Mental model for decorator execution order?**
> **A:** Decorators are FUNCTIONS that run at class DEFINITION time (once per class), not per instance. Order: field initializers → constructor → method decorators (in source order, bottom to top for stacked) → class decorator (last). With multiple stacked decorators \`@A @B method() {}\`, B runs first, then A wraps the result.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Mixing legacy and stage-3 decorators:
> \`\`\`ts
> // ❌ With experimentalDecorators: true, a stage-3 decorator silently fails
> function legacy(target: any, key: string, descriptor: PropertyDescriptor) { /* legacy */ }
> function stage3(value: Function, ctx: ClassMethodDecoratorContext) { /* stage 3 */ }
>
> class A {
>   @legacy
>   foo() {}
> }
> // If both decorators present, behaviour depends on the experimentalDecorators flag
>
> // ✅ Pick ONE — stage-3 for new projects, legacy ONLY when stuck with frameworks needing it
> \`\`\`

**Q4: How do stage-3 decorators differ from legacy?**
> **A:** Stage-3 decorators have a NEW SIGNATURE: \`(value, context) => newValue\`. The \`context\` carries metadata (\`kind\`, \`name\`, \`addInitializer\`). They support field decorators that return an initial-value function. They have NO emitDecoratorMetadata equivalent — frameworks must use \`context.metadata\` instead. They run later in class definition (after fields), with stricter ordering rules. Migration is non-trivial because the API surface is completely different.

**Q5: FAANG-grade definition?**
> **A:** "TypeScript decorators are functions applied to classes, methods, fields, and accessors at class-definition time — existing in two incompatible flavours: the legacy (\`experimentalDecorators\`) form used by Angular/Nest/TypeORM with reflect-metadata for runtime introspection, and the stage-3 standardised form (TS 5.0+) with a context-object API and built-in metadata support but limited framework adoption."`,
    build: `## BUILD

### 🏗️ Mini Project: Build a Mini DI Container Using Stage-3 Decorators

**What you will build:** A tiny dependency-injection system using stage-3 decorators — \`@Injectable\` marks a class as a service, \`@Inject\` resolves dependencies in the constructor — mimicking how Angular and NestJS work.
**Why this project:** Forces stage-3 decorator API (\`context.metadata\`, factory pattern, initializers) — the modern way.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-decorators && cd ts-decorators
npm init -y
npm install -D typescript vitest
# Stage-3 decorators need target ES2022+, NO experimentalDecorators
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/di.ts, src/services.ts, src/main.ts -ItemType File
\`\`\`

#### Step 2 — Mini DI Container
\`\`\`ts
// src/di.ts
const REGISTRY = new Map<string, new (...args: any[]) => any>();

export function Injectable(name: string) {
  return function <T extends new (...args: any[]) => any>(
    constructor: T,
    _ctx: ClassDecoratorContext,
  ): T {
    REGISTRY.set(name, constructor);
    return constructor;
  };
}

export function resolve<T>(name: string): T {
  const ctor = REGISTRY.get(name);
  if (!ctor) throw new Error(\`Service '\${name}' not registered\`);
  return new ctor();
}

// Method decorator: logs every call
export function LogCall<This, Args extends unknown[], Out>(
  originalMethod: (this: This, ...args: Args) => Out,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Out>,
) {
  const methodName = String(context.name);
  return function (this: This, ...args: Args): Out {
    console.log(\`→ \${methodName}(\${JSON.stringify(args)})\`);
    const result = originalMethod.call(this, ...args);
    console.log(\`← \${methodName} returned\`, result);
    return result;
  };
}
\`\`\`

#### Step 3 — Services Using The Decorators
\`\`\`ts
// src/services.ts
import { Injectable, LogCall } from './di.js';

@Injectable('logger')
export class Logger {
  @LogCall
  info(msg: string): string {
    console.log('[INFO]', msg);
    return msg;
  }
}

@Injectable('userService')
export class UserService {
  @LogCall
  findById(id: number) {
    return { id, name: \`User \${id}\` };
  }
}
\`\`\`

#### Step 4 — Error Handling: Resolve + Compose
\`\`\`ts
// src/main.ts
import './services.js';   // triggers decorator registration
import { resolve } from './di.js';
import type { Logger } from './services.js';
import type { UserService } from './services.js';

const logger = resolve<Logger>('logger');
const userService = resolve<UserService>('userService');

logger.info('App started');
const user = userService.findById(42);
console.log('Got:', user);

// Error path
try { resolve<unknown>('unregistered'); }
catch (e) { console.error('Expected:', (e as Error).message); }
\`\`\`

#### Step 5 — Tests
\`\`\`ts
import { describe, it, expect, vi } from 'vitest';
import { Injectable, LogCall, resolve } from './di.js';

describe('mini DI', () => {
  it('@Injectable registers and resolves', () => {
    @Injectable('test') class T { hello() { return 'hi'; } }
    expect(resolve<T>('test').hello()).toBe('hi');
  });

  it('@LogCall wraps method calls', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    @Injectable('greeter') class G {
      @LogCall greet(n: string) { return \`Hi \${n}\`; }
    }
    expect(resolve<G>('greeter').greet('Ana')).toBe('Hi Ana');
    expect(log).toHaveBeenCalledTimes(2);   // → and ← logs
    log.mockRestore();
  });

  it('resolving unknown service throws', () => {
    expect(() => resolve('nope')).toThrow();
  });
});
\`\`\`

**Expected Output:**
\`\`\`
→ info(["App started"])
[INFO] App started
← info returned App started
→ findById([42])
← findById returned { id: 42, name: 'User 42' }
Got: { id: 42, name: 'User 42' }
Expected: Service 'unregistered' not registered
\`\`\`

**Stretch Challenges:**
- [ ] Add @Inject so dependencies are auto-wired into constructors
- [ ] Add a @Cache decorator with TTL
- [ ] Compare with legacy decorators by enabling \`experimentalDecorators\` in a copy`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Two flavours of TS decorators — name them and the tsconfig flags involved.
**Q2:** When does a decorator function actually run?
**Q3:** Write a simple \`@Log\` method decorator that logs entry. From memory.

### Day 3 — Comprehension
**Q4:** Why is mixing legacy and stage-3 decorators broken?
**Q5:** A junior decorator returns nothing — why does the method break sometimes?
**Q6:** Refactor this legacy decorator to stage-3:
\`\`\`ts
function Log(target: any, key: string, desc: PropertyDescriptor) {
  const orig = desc.value;
  desc.value = function(...args:any[]) { console.log(key); return orig.apply(this, args); };
}
\`\`\`

### Day 7 — Application
**Q7:** Build a @Validate(schema) decorator that throws if arguments don't match.
**Q8:** A PR uses decorators in a library — explain why this is hostile to consumers.
**Q9:** What is the runtime cost of decorators per-class-instantiation?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how Angular's @Component decorator wires a class into the DI system."
**Q11:** Draw: decorator execution order for a class with field, method, and class decorators.
**Q12:** ★ System design: "Choose between decorators, HOFs, and config files for a typed validation framework. Justify."`
  },

  // ── 20. type-challenges ──────────────────────────────────────────────────
  'type-challenges': {
    feynman: `## FEYNMAN CHECK

### Explain Type Challenges Like I'm 10 Years Old
> Type-Challenges (github.com/type-challenges/type-challenges) is an open-source repository of TypeScript type-system puzzles ranging from "easy" (\`If<true, 'a', 'b'>\` = 'a') to "hell" (implement a SQL parser entirely at the type level). They're the equivalent of LeetCode for the TS type system. Solving them teaches you: conditional types, infer, recursive types, template literal types, mapped types, distribution, variance — the deep mechanics. The non-obvious payoff: 90% of "advanced TypeScript wizardry" in real libraries (zod, tRPC, Drizzle, React Hook Form) is built from techniques mastered in Type-Challenges. They're not academic — they directly upgrade your production code.

---

### 5 Deep Conceptual Questions

**Q1: Why do Type-Challenges matter beyond bragging rights?**
> **A:** Library authoring. If you've solved 30+ Type-Challenges, you can read and write production type-level code in libraries like tRPC (which uses recursive conditional types for procedure composition), zod (mapped types for schema inference), or Drizzle (template literals + variadic tuples for SQL types). Without that practice, those library types are inscrutable. Type-Challenges convert "I can read library code" into "I can WRITE library code."

**Q2: Mental model for solving a challenge?**
> **A:** Decompose into PRIMITIVES: (1) Need conditional logic? Use \`extends ? :\`. (2) Need to extract a part? Use \`infer\`. (3) Need to iterate? Use mapped type or recursive conditional. (4) Need to parse a string? Template literal + infer. (5) Need to operate on a tuple? Variadic tuple destructuring. Build small helpers, compose them, test with \`type _ = MySolution<TestInput>\` and check IDE hover.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing recursive type depth is unlimited:
> \`\`\`ts
> // ❌ Naive recursion hits TS depth limit (~50 levels)
> type Length<T extends unknown[]> = T extends [unknown, ...infer Rest] ? [unknown, ...Length<Rest>] : [];
> // For arrays of length 100+, TS errors: "Type instantiation is excessively deep"
>
> // ✅ Use tuple length operator (TS 4.0+) — O(1) at type level
> type Length<T extends unknown[]> = T['length'];
> \`\`\`

**Q4: How do you debug a type that "doesn't work"?**
> **A:** Hover in IDE — TS shows the resolved type. Use \`type _Test = MyType<Input>\` to materialise the result. Use \`Expect<Equal<MyResult, Expected>>\` helpers (from Type-Challenges utility types). Comment out parts of complex conditionals to bisect the failure. When in doubt, type \`type Debug = T\` and hover to see what T is at that point.

**Q5: FAANG-grade definition?**
> **A:** "Type-Challenges are TypeScript type-system puzzles whose solutions exercise conditional types, infer extraction, recursive type traversal, variadic tuple destructuring, template literal parsing, mapped type transformations, and distribution semantics — the same primitives underpinning production type derivations in modern TS libraries (tRPC, zod, Drizzle, React Hook Form, Astro), making them direct training for library-author-level TS fluency."`,
    build: `## BUILD

### 🏗️ Mini Project: Solve 5 Real Type-Challenges (Easy → Medium → Hard)

**What you will build:** Implement \`If\`, \`Pick\`, \`Awaited\`, \`DeepReadonly\`, and \`ParseUrlParams\` — exactly as they appear in the Type-Challenges repo — with passing tests.
**Why this project:** Forces every advanced type-system primitive in one focused 40-minute session.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-challenges && cd ts-challenges
npm init -y && npm install -D typescript vitest
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/challenges.ts, src/test-utils.ts -ItemType File
\`\`\`

#### Step 2 — Test Utilities (Same As Type-Challenges Repo)
\`\`\`ts
// src/test-utils.ts
export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;

export type Expect<T extends true> = T;
export type NotAny<T> = true extends (T extends never ? true : false) ? false : true;
\`\`\`

#### Step 3 — Challenge 1 (Easy): If
\`\`\`ts
// src/challenges.ts
import type { Expect, Equal } from './test-utils.js';

// If<C, T, F>: returns T if C is true, F otherwise
export type If<C extends boolean, T, F> = C extends true ? T : F;

// Tests
type T1 = Expect<Equal<If<true,  'a', 'b'>, 'a'>>;
type T2 = Expect<Equal<If<false, 'a', 'b'>, 'b'>>;
\`\`\`

#### Step 4 — Challenge 2-3 (Easy/Medium): Pick & Awaited
\`\`\`ts
// Pick: extract subset of keys
export type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Todo = { title: string; description: string; completed: boolean };
type T3 = Expect<Equal<MyPick<Todo, 'title'>, { title: string }>>;

// Awaited: unwrap nested Promises
export type MyAwaited<T> =
  T extends Promise<infer U>
    ? MyAwaited<U>
    : T extends { then: (onfulfilled: (value: infer V) => unknown) => unknown }
      ? MyAwaited<V>
      : T;

type T4 = Expect<Equal<MyAwaited<Promise<Promise<string>>>, string>>;
type T5 = Expect<Equal<MyAwaited<Promise<number>>,           number>>;
\`\`\`

#### Step 5 — Challenge 4-5 (Medium/Hard): DeepReadonly & ParseUrlParams
\`\`\`ts
// DeepReadonly: recursively
export type DeepReadonly<T> =
  T extends object
    ? T extends Function
      ? T
      : { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;

type T6 = Expect<Equal<
  DeepReadonly<{ a: { b: { c: number[] } } }>,
  { readonly a: { readonly b: { readonly c: readonly number[] } } }
>>;

// ParseUrlParams: extract :param names into a union
export type ParseUrlParams<S extends string> =
  S extends \`\${string}:\${infer Param}/\${infer Rest}\`
    ? Param | ParseUrlParams<\`/\${Rest}\`>
    : S extends \`\${string}:\${infer Param}\`
      ? Param
      : never;

type T7 = Expect<Equal<ParseUrlParams<'/users/:id'>,                'id'>>;
type T8 = Expect<Equal<ParseUrlParams<'/users/:userId/posts/:postId'>, 'userId' | 'postId'>>;
type T9 = Expect<Equal<ParseUrlParams<'/health'>,                    never>>;
\`\`\`

**Run:**
\`\`\`bash
npx tsc --noEmit    # all type-level tests must pass with zero errors
\`\`\`

**Expected Output:**
\`\`\`
$ npx tsc --noEmit
[no errors — every Expect<Equal<...>> resolves to true]

# Visit github.com/type-challenges/type-challenges and solve 5 more
# Recommended progression: Easy → Medium → Hard → Extreme → Hell
\`\`\`

**Stretch Challenges:**
- [ ] Solve "Flatten" (recursively flatten an array type)
- [ ] Solve "Camelcase" (snake_case → camelCase at type level)
- [ ] Solve "Trim Right" (template literal types + recursion)
- [ ] Tackle one "Hard" challenge of your choice from the repo`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Why solve Type-Challenges if you're not a library author?
**Q2:** What's the typical depth limit for recursive types in TS?
**Q3:** Write \`If<C extends boolean, T, F>\` from memory.

### Day 3 — Comprehension
**Q4:** Explain the trick behind \`Equal<X, Y>\` — why does it check assignability twice?
**Q5:** A challenge solution works for some inputs but fails for unions — diagnose distribution issue.
**Q6:** Implement \`Last<T extends unknown[]>\` that returns the last element type.

### Day 7 — Application
**Q7:** Build \`PromiseAll\` that takes a tuple of Promises and returns the resolved-value tuple.
**Q8:** Solve "Capitalize Words" from Type-Challenges (capitalize each word in a string literal).
**Q9:** When should a production library author REACH for Type-Challenges-style types vs simpler alternatives?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Implement TypeScript's built-in \`ReturnType\`, \`Parameters\`, and \`ConstructorParameters\` from scratch."
**Q11:** Draw: which 5 type-system primitives cover 90% of advanced TS code?
**Q12:** ★ System design: "You're authoring a typed RPC library similar to tRPC. Which Type-Challenges-level patterns will you need?"`
  },

  // ── 21. performance-ts ───────────────────────────────────────────────────
  'performance-ts': {
    feynman: `## FEYNMAN CHECK

### Explain TypeScript Performance Like I'm 10 Years Old
> TypeScript compilation has TWO costs: TYPE CHECKING (runs the type system to validate your code — can dominate on heavy generics) and EMIT (writes .js + .d.ts files — usually fast). On big projects (100k+ lines), tsc can take 60+ seconds. Speed-ups come from: \`incremental: true\` (cache prior results), \`composite\` + project references (rebuild only changed packages), \`skipLibCheck: true\` (don't deeply check dependencies' .d.ts), \`isolatedModules\` (allow esbuild/swc to transpile per-file, skip type check during dev), and AVOIDING type-system traps (deeply recursive generics, distributive conditionals over huge unions, unnecessary mapped types). The non-obvious trick: use \`tsc --extendedDiagnostics\` to see WHERE time is spent — usually 70% is in type checking, of which a handful of files dominate.

---

### 5 Deep Conceptual Questions

**Q1: What slows down tsc the most?**
> **A:** Three culprits ranked: (1) DEEP RECURSIVE CONDITIONAL TYPES — types that recursively descend into nested structures (\`DeepPartial\`, \`DeepReadonly\` on 6-level objects). (2) DISTRIBUTIVE CONDITIONALS OVER HUGE UNIONS — e.g., a literal union with 1000 members triggering a 1000-way distribution. (3) UNNECESSARY \`skipLibCheck: false\` — TS deeply checks every imported library's .d.ts. The fix order: enable skipLibCheck → cap recursion depth → break huge unions into branded primitives.

**Q2: Mental model for incremental compilation?**
> **A:** With \`incremental: true\`, tsc writes a \`.tsbuildinfo\` file recording what it knows about every file's dependencies and hashes. Next run, tsc reads the cache, walks the dependency graph, and skips files that didn't change AND whose deps didn't change. Project references extend this across multi-package monorepos. Result: 5-second incremental rebuilds even on huge codebases — provided your dependency graph isn't a fully-connected mess.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing \`type\` aliases are free:
> \`\`\`ts
> // ❌ This recursively distributes — exponential cost on deep nesting
> type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };
> type Bad = DeepPartial<{ a: { b: { c: { d: { e: number } } } } }>;   // expensive!
>
> // ✅ Cap depth to bound cost
> type DeepPartial<T, D extends number = 5> =
>   [D] extends [0] ? T :
>   { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K], Prev<D>> : T[K] };
> type Prev<N extends number> = [-1, 0, 1, 2, 3, 4][N] & number;
> \`\`\`

**Q4: How does \`skipLibCheck\` interact with project safety?**
> **A:** With \`skipLibCheck: true\`, TS does NOT type-check .d.ts files of installed libraries — it trusts them. Saves significant time (30-60% on dep-heavy projects). The risk: if a library's .d.ts has errors or conflicts with another library, you don't catch it. In practice this is rare and the speed-up dwarfs the risk. The TS team recommends \`skipLibCheck: true\` for almost all projects.

**Q5: FAANG-grade definition?**
> **A:** "TypeScript performance optimisation operates on two axes — compile-time cost reduction (incremental builds via .tsbuildinfo, composite project references, skipLibCheck for dependency caching, isolatedModules for parallel single-file transpile) and type-system cost reduction (depth-limited recursion, avoiding distributive conditionals over large unions, branded types instead of huge string unions) — measured and diagnosed via \`tsc --extendedDiagnostics\` and the TypeScript Trace Analyzer."`,
    build: `## BUILD

### 🏗️ Mini Project: Diagnose and Speed Up a Slow TS Build

**What you will build:** A project with deliberately slow type definitions, profile it with \`tsc --extendedDiagnostics\`, identify the bottlenecks, apply fixes, and measure the speed-up.
**Why this project:** Forces real performance-tuning workflow — diagnose → fix → verify.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir ts-perf && cd ts-perf
npm init -y && npm install -D typescript
npx tsc --init --strict --target ES2022 --module NodeNext --moduleResolution NodeNext
ni src/slow.ts, src/fast.ts -ItemType File
\`\`\`

#### Step 2 — Deliberately Slow Types
\`\`\`ts
// src/slow.ts — TYPE-LEVEL BOMBS
// 1. Deep recursion with no depth limit
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// 2. Distribution over a huge union
type HugeUnion =
  'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' |
  'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' |
  'u' | 'v' | 'w' | 'x' | 'y' | 'z';
type DistributeMe<T> = T extends string ? \`prefix-\${T}\` : never;
type Distributed = DistributeMe<HugeUnion>;   // 26-way distribution

// 3. Nested object that triggers DeepReadonly recursion
interface DeepNested {
  level1: {
    level2: {
      level3: {
        level4: {
          level5: { value: string };
        };
      };
    };
  };
}
const x: DeepReadonly<DeepNested> = {} as any;
\`\`\`

#### Step 3 — Diagnose
\`\`\`bash
npx tsc --noEmit --extendedDiagnostics
\`\`\`
Look at the output:
- \`Check time\`: time spent in type checking
- \`Total time\`: end-to-end
- \`Instantiations\`: count of type instantiations (huge = problem)
- \`Memory used\`: huge spikes = pathological types

#### Step 4 — Fix: Depth-Limited Recursion + Constrained Unions
\`\`\`ts
// src/fast.ts
// 1. Depth-bounded DeepReadonly
type Prev = [never, 0, 1, 2, 3, 4, 5][number];   // simple counter
type SafeDeepReadonly<T, Depth extends number = 5> =
  [Depth] extends [never] ? T :
  T extends object
    ? { readonly [K in keyof T]: SafeDeepReadonly<T[K], Prev[Depth & 0 | 1 | 2 | 3 | 4 | 5]> }
    : T;

// 2. Avoid distribution over huge unions — use a branded helper
type Brand<T, B> = T & { __brand?: B };
type SafeId = Brand<string, 'Id'>;   // single type, no 26-way explosion

const y: SafeDeepReadonly<{ a: { b: { c: number } } }> = {} as any;
\`\`\`

#### Step 5 — Verify Speed-Up + Tests
\`\`\`bash
# Before fix:
npx tsc --noEmit --extendedDiagnostics src/slow.ts
# After fix:
npx tsc --noEmit --extendedDiagnostics src/fast.ts
\`\`\`

\`\`\`json
// tsconfig.json — enable every speed-up
{
  "compilerOptions": {
    "strict": true,
    "incremental": true,
    "composite": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
\`\`\`
\`\`\`bash
# Subsequent builds should be near-instant
time npx tsc --noEmit
\`\`\`

**Expected Output:**
\`\`\`
# Diagnostics output before fix:
Files:              42
Lines:           10,432
Identifiers:     12,847
Symbols:         18,221
Instantiations:  214,389       ← TOO HIGH (deep recursion)
Memory used:    180,432 KB
Check time:        2.45 s
Total time:        2.61 s

# After fix:
Instantiations:   38,221       ← Reduced 5×
Memory used:     95,123 KB
Check time:        0.42 s
Total time:        0.59 s      ← 4× faster
\`\`\`

**Stretch Challenges:**
- [ ] Convert to project-references monorepo and observe incremental rebuilds
- [ ] Generate a TS trace with \`--generateTrace\` and open in chrome://tracing
- [ ] Use \`@typescript-eslint/no-explicit-any\` and benchmark its rule cost`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Name 3 tsconfig flags that speed up builds.
**Q2:** What does \`incremental: true\` do?
**Q3:** Command to get TS compile diagnostics. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`DeepPartial<T>\` get slow on deeply-nested types? What's the fix?
**Q5:** A junior turns \`skipLibCheck: false\` "for safety" and the build doubles in time. Diagnose.
**Q6:** Refactor for performance:
\`\`\`ts
type AllPaths<T> = T extends object ? { [K in keyof T]: AllPaths<T[K]> }[keyof T] | keyof T : never;
\`\`\`

### Day 7 — Application
**Q7:** Set up a monorepo with project references and benchmark incremental vs full rebuild.
**Q8:** A PR adds a 5000-member literal union for product IDs — the build slows 10×. Propose a fix.
**Q9:** What is the impact of \`isolatedModules\` on \`const enum\` and inline-only types?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through diagnosing a 90-second tsc build down to 10 seconds."
**Q11:** Draw: how does the project-references DAG control rebuild propagation?
**Q12:** ★ System design: "A 1M-LOC TS monorepo with 200 packages needs <30s CI builds. Pick a build strategy — tsc references, esbuild + tsc, swc + tsc, or Bazel + tsc."`
  }
};


