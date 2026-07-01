/**
 * GFG+ depth FEYNMAN / BUILD / SPACED REVIEW for all JavaScript topics.
 * Matches SKILL.md standards: real analogies, 5 deep Q&As, named build projects,
 * 12 spaced-review questions, code snippets in answers.
 *
 * Built in 9 batches per SKILL.md batching strategy (5 topics per batch).
 * Batch 1 of 9: Foundations.
 */
module.exports = {

  // ── 1. js-intro ──────────────────────────────────────────────────────────
  'js-intro': {
    feynman: `## FEYNMAN CHECK

### Explain JavaScript Like I'm 10 Years Old
> JavaScript is the LANGUAGE the browser speaks. HTML is the SKELETON, CSS is the SKIN, and JS is the MUSCLES that make things move — click a button, animate a menu, fetch data from a server, update the page without reload. Originally invented in 10 days (1995, Brendan Eich at Netscape), it was meant for small scripts; today it runs entire applications (Gmail, Figma, VS Code), servers (Node.js), mobile apps (React Native), and even embedded devices. The non-obvious detail: JavaScript is SINGLE-THREADED but NON-BLOCKING — it does one thing at a time but never waits idle for I/O, using the event loop to schedule work. This is why "callback hell" and async/await even exist.

---

### 5 Deep Conceptual Questions

**Q1: What problem does JavaScript fundamentally solve?**
> **A:** Client-side interactivity. Before JS (1995), every form click meant a full page reload from the server — login form, search box, even a calculator. JavaScript ran code IN THE BROWSER, mutating the DOM live. Combined later with AJAX (XMLHttpRequest, 2005) and JSON, this enabled the entire single-page-app revolution. Today JS is the only language that runs natively in every browser — its monopoly is the reason WebAssembly even exists (to give other languages a path in).

**Q2: What mental model unlocks JavaScript?**
> **A:** "One thread, one stack, an event loop, and a queue of work waiting to run." Everything in JS executes on a single thread. Synchronous code runs to completion on the call stack. Async operations (timers, fetch, promises) are scheduled by the runtime and pushed back onto the queue when ready. The event loop pulls one task at a time when the stack is empty. Once you internalise this, await/then/setTimeout/race-conditions all make sense.

**Q3: Most dangerous misconception?**
> **A:** Thinking JavaScript is the same as Java:
> \`\`\`js
> // JS is NOT a typed, classical OOP language
> // ❌ Wrong assumption
> int count = 0;             // syntax error — no static types
>
> // ✅ JS is dynamic; types are attached to VALUES, not variables
> let count = 0;             // count is currently number
> count = 'zero';            // now count is string — no error
>
> // JS uses PROTOTYPAL inheritance, not class hierarchies
> // class syntax (ES6) is sugar over prototypes
> \`\`\`

**Q4: How does JavaScript interact with the browser runtime?**
> **A:** The browser provides JS with: (1) the DOM API (document.*) for mutating HTML; (2) Web APIs (fetch, setTimeout, localStorage, Geolocation, IndexedDB) — these are NOT part of the JS language, they're host-environment additions implemented in C++ inside the browser; (3) the event loop that schedules JS execution between paint frames. Node.js replaces the browser host with its own APIs (fs, http, process), so the same language runs in a totally different environment.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript is a single-threaded, prototypal, dynamically-typed, garbage-collected scripting language with a non-blocking concurrency model built on the event loop — embedded inside host environments (browsers, Node.js, Deno, Bun, Cloudflare Workers) that provide the I/O, DOM, and timer APIs the language itself does not specify."`,
    build: `## BUILD

### 🏗️ Mini Project: Interactive To-Do With Persistence — Pure Vanilla JS

**What you will build:** A working to-do app with add/toggle/delete, persisted to localStorage, with keyboard shortcuts — written in ~80 lines of vanilla JS, no frameworks.
**Why this project:** Forces every JS fundamental in one tiny artifact: variables, DOM API, event listeners, JSON, localStorage, array methods.
**Time estimate:** 30 minutes

---

#### Step 1 — Project Setup
\`\`\`bash
mkdir js-todo && cd js-todo
ni index.html, app.js, style.css -ItemType File
\`\`\`

#### Step 2 — HTML Shell
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
  <h1>Todos</h1>
  <form id="form"><input id="input" placeholder="What needs doing?" autofocus required></form>
  <ul id="list"></ul>
  <p id="footer"><span id="remaining"></span> · <button id="clear">Clear done</button></p>
  <script src="app.js"></script>
</body>
</html>
\`\`\`

#### Step 3 — Core JS
\`\`\`js
// app.js — vanilla JS, ES2022
const KEY = 'todos.v1';

/** @type {{id:string;text:string;done:boolean}[]} */
let todos = JSON.parse(localStorage.getItem(KEY) ?? '[]');

const $form     = document.getElementById('form');
const $input    = document.getElementById('input');
const $list     = document.getElementById('list');
const $remaining = document.getElementById('remaining');
const $clear    = document.getElementById('clear');

function persist() { localStorage.setItem(KEY, JSON.stringify(todos)); }

function render() {
  $list.innerHTML = todos.map(t => \`
    <li data-id="\${t.id}" class="\${t.done ? 'done' : ''}">
      <input type="checkbox" \${t.done ? 'checked' : ''}>
      <span>\${t.text.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</span>
      <button class="del">×</button>
    </li>\`).join('');
  $remaining.textContent = \`\${todos.filter(t => !t.done).length} left\`;
  persist();
}

$form.addEventListener('submit', e => {
  e.preventDefault();
  const text = $input.value.trim();
  if (!text) return;
  todos.push({ id: crypto.randomUUID(), text, done: false });
  $input.value = '';
  render();
});
\`\`\`

#### Step 4 — Error Handling: Delegated Events + Safety
\`\`\`js
// Event delegation — one listener on <ul>, handles every <li>
$list.addEventListener('click', e => {
  const li = e.target.closest('li');
  if (!li) return;
  const id = li.dataset.id;
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  if (e.target.matches('input[type=checkbox]')) { todo.done = e.target.checked; render(); }
  if (e.target.matches('.del'))                  { todos = todos.filter(t => t.id !== id); render(); }
});

$clear.addEventListener('click', () => {
  todos = todos.filter(t => !t.done);
  render();
});

// Keyboard shortcut: Ctrl+/ focuses input
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === '/') { e.preventDefault(); $input.focus(); }
});

// First paint
render();
\`\`\`

#### Step 5 — Tests
\`\`\`js
// app.test.js  (run with: npx vitest --environment=happy-dom)
import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('todo app', () => {
  beforeEach(() => {
    document.body.innerHTML = '<form id="form"><input id="input"></form><ul id="list"></ul><span id="remaining"></span><button id="clear"></button>';
    localStorage.clear();
  });
  it('adds a todo on form submit', () => {
    require('./app.js');
    const input = document.getElementById('input');
    const form  = document.getElementById('form');
    input.value = 'Buy milk';
    form.dispatchEvent(new Event('submit'));
    expect(document.querySelectorAll('li').length).toBe(1);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
- Type "Buy milk", press Enter → li appears, "1 left"
- Tick checkbox → strikethrough, "0 left"
- × button removes the item
- Reload the page → todos persist (localStorage)
- Ctrl+/ jumps focus to input
\`\`\`

**Stretch Challenges:**
- [ ] Add edit-in-place (double-click li to edit)
- [ ] Filter by all / active / done via querystring
- [ ] Sync across browser tabs using the storage event`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What three things made JavaScript different from other languages in 1995?
**Q2:** Is JavaScript single-threaded or multi-threaded? What enables concurrency?
**Q3:** Write 5 lines: declare a variable, assign an object, mutate a property, log it. From memory.

### Day 3 — Comprehension
**Q4:** Difference between the JS language and "browser APIs" like setTimeout / fetch / DOM?
**Q5:** A junior writes blocking \`while(Date.now() - start < 5000)\` to "wait 5 seconds." Diagnose.
**Q6:** Refactor for safety:
\`\`\`js
function show(html) { document.body.innerHTML = html; }
show(userInput);   // XSS!
\`\`\`

### Day 7 — Application
**Q7:** Build a stopwatch with start/stop/reset using setInterval and DOM APIs.
**Q8:** A PR uses \`new Date()\` for unique IDs. Why is this fragile in 2026?
**Q9:** What's the cost of mutating innerHTML inside a loop? How do you batch?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Why is JavaScript single-threaded — and how does that affect how you write performant UI?"
**Q11:** Draw: runtime architecture — JS engine, web APIs, callback queue, microtask queue, event loop.
**Q12:** ★ System design: "Pick the runtime (browser / Node / Deno / Bun / Workers) for: (a) a static blog, (b) a real-time chat, (c) an image-thumbnailer, (d) a CLI tool. Justify each."`
  },

  // ── 2. variables ─────────────────────────────────────────────────────────
  'variables': {
    feynman: `## FEYNMAN CHECK

### Explain Variables Like I'm 10 Years Old
> A variable is a LABELED BOX that holds a value. JavaScript has three declaration keywords: \`var\` (the old one — function-scoped, hoisted, can be redeclared, mostly avoid), \`let\` (block-scoped, can be reassigned but not redeclared), and \`const\` (block-scoped, cannot be reassigned — though contents of an object CAN still be mutated). The non-obvious detail: \`const\` does NOT mean "the value is immutable" — it means "the BINDING is immutable." \`const arr = [1,2,3]; arr.push(4)\` is legal — arr still points to the same array, which now contains 4. To freeze the contents, use \`Object.freeze\` (shallow) or a structural-sharing immutable library. The other key thing: TDZ (Temporal Dead Zone) — accessing let/const before declaration throws ReferenceError, unlike var which silently returns undefined.

---

### 5 Deep Conceptual Questions

**Q1: Why was \`let\` added if \`var\` already existed?**
> **A:** \`var\` is FUNCTION-scoped (not block-scoped), HOISTED to the top of its function (returning undefined before its line), and can be redeclared silently. This caused thousands of production bugs: a \`var i\` inside a for-loop leaks out, a \`var\` shadowing in a deeply nested block invisibly affects the outer scope. \`let\` (ES2015) fixed all this — block scope, temporal dead zone, no redeclaration. \`const\` extended let with reassignment prevention. Modern code uses const by default, let when reassignment is needed, var only in legacy code.

**Q2: Mental model for the Temporal Dead Zone (TDZ)?**
> **A:** Between the START of a block and the DECLARATION line of a let/const, the variable EXISTS but cannot be accessed — touching it throws ReferenceError. This is intentional: it prevents silent bugs from referring to variables before they're initialised. The compiler statically allocates the binding at parse time, but only "activates" it at the declaration line. var instead initialises with undefined at the start of the function — no TDZ, but you get undefined when you expected a value.

**Q3: Most dangerous misconception?**
> **A:** Thinking \`const\` makes the value immutable:
> \`\`\`js
> // ❌ const only locks the BINDING, not the value
> const user = { name: 'Ana' };
> user.name = 'Bob';   // ✅ no error — object contents are mutable
> user = {};            // ❌ TypeError: Assignment to constant variable
>
> // ✅ For deep immutability, use Object.freeze (shallow) or libraries
> const user = Object.freeze({ name: 'Ana', address: { city: 'NYC' } });
> user.name = 'Bob';   // silently ignored in non-strict; throws in strict
> user.address.city = 'LA';   // ⚠️ NOT frozen — Object.freeze is shallow
> \`\`\`

**Q4: How does scoping interact with closures and the JS engine?**
> **A:** Every function call creates a "Lexical Environment" — a record of the bindings visible inside that scope. Inner functions capture a REFERENCE to the enclosing Lexical Environment, not a snapshot of values. This is why \`for (var i=0; i<3; i++) setTimeout(() => console.log(i))\` logs 3,3,3 (var i is one shared binding) but \`for (let i=0; i<3; i++) ...\` logs 0,1,2 (let creates a NEW binding per iteration). V8 optimises this with "scope chains" — inlining when possible, falling back to walks.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript variables are bindings between identifiers and values within a scope — declared via var (function-scoped, hoisted, no TDZ), let (block-scoped, TDZ-protected, mutable binding), or const (block-scoped, TDZ-protected, immutable binding to a possibly-mutable value) — with closures capturing references to enclosing lexical environments and the JS engine optimising scope chains for property-access performance."`,
    build: `## BUILD

### 🏗️ Mini Project: Closure-Counter Demonstrating var/let/const Scope Differences

**What you will build:** A page with three side-by-side counters demonstrating the for-loop closure trap with var vs let, plus a "frozen vs unfrozen" comparison so you can SEE why const doesn't make objects immutable.
**Why this project:** Forces hands-on experience with the most-asked JS variable interview questions.
**Time estimate:** 20 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-vars && cd js-vars
ni index.html, app.js -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>
  <h1>Variable Scope Demo</h1>
  <button id="run">Run all three</button>
  <pre id="out"></pre>
  <script src="app.js"></script>
</body></html>
\`\`\`

#### Step 3 — The Three Demos
\`\`\`js
const out = document.getElementById('out');
const log = (msg) => { out.textContent += msg + '\\n'; };

document.getElementById('run').onclick = () => {
  out.textContent = '';

  // ─── Demo 1: var leaks past for-loop ─────────────────
  log('--- var in for-loop ---');
  for (var i = 0; i < 3; i++) {
    setTimeout(() => log('var i = ' + i), 0);
  }
  log('After loop, i = ' + i + ' (var leaked!)');

  // ─── Demo 2: let scoped per iteration ────────────────
  setTimeout(() => {
    log('\\n--- let in for-loop ---');
    for (let j = 0; j < 3; j++) {
      setTimeout(() => log('let j = ' + j), 10);
    }
    try { log('After loop, j = ' + j); }
    catch (e) { log('After loop: j is NOT defined outside (' + e.name + ')'); }
  }, 50);

  // ─── Demo 3: const doesn't freeze objects ────────────
  setTimeout(() => {
    log('\\n--- const + object ---');
    const user = { name: 'Ana' };
    user.name = 'Bob';                // ✅ allowed
    log('user.name after mutation: ' + user.name);
    try { user = {}; }                // ❌ throws
    catch (e) { log('Re-assignment: ' + e.message); }

    const frozen = Object.freeze({ name: 'Ana' });
    frozen.name = 'Bob';              // silently ignored
    log('frozen.name after attempt: ' + frozen.name);
  }, 200);
};
\`\`\`

#### Step 4 — Error Handling: TDZ Demo
\`\`\`js
// Add a button that demonstrates the Temporal Dead Zone
document.body.insertAdjacentHTML('beforeend',
  '<button id="tdz">Trigger TDZ error</button>');
document.getElementById('tdz').onclick = () => {
  try {
    console.log(x);     // ❌ ReferenceError — let x is in TDZ
    let x = 5;
  } catch (e) {
    log('\\nTDZ: ' + e.message);
  }
};
\`\`\`

#### Step 5 — Tests
\`\`\`js
// vars.test.js (Vitest)
import { describe, it, expect } from 'vitest';

describe('variable semantics', () => {
  it('var leaks out of for-loop', () => {
    for (var i = 0; i < 3; i++) {}
    expect(i).toBe(3);
  });
  it('let is block-scoped', () => {
    for (let j = 0; j < 3; j++) {}
    expect(typeof j).toBe('undefined');
  });
  it('const allows object mutation, blocks reassignment', () => {
    const obj = { n: 1 };
    obj.n = 2;
    expect(obj.n).toBe(2);
    expect(() => { /* @ts-expect-error */ obj = {}; }).toThrow();
  });
  it('Object.freeze is shallow only', () => {
    const f = Object.freeze({ inner: { v: 1 } });
    f.inner.v = 2;             // not frozen
    expect(f.inner.v).toBe(2);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
--- var in for-loop ---
After loop, i = 3 (var leaked!)
var i = 3
var i = 3
var i = 3

--- let in for-loop ---
After loop: j is NOT defined outside (ReferenceError)
let j = 0
let j = 1
let j = 2

--- const + object ---
user.name after mutation: Bob
Re-assignment: Assignment to constant variable.
frozen.name after attempt: Ana
\`\`\`

**Stretch Challenges:**
- [ ] Add a "var hoisting" demo: log a var BEFORE its declaration
- [ ] Show a closure escape pattern using an IIFE to capture var per iteration
- [ ] Deep-freeze a nested object with a recursive helper and prove every level is frozen`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between var, let, and const in one table.
**Q2:** What is the Temporal Dead Zone?
**Q3:** Write 3 lines: declare a const object, mutate a property, try to reassign and catch the error. From memory.

### Day 3 — Comprehension
**Q4:** \`for (var i=0; i<3; i++) setTimeout(() => console.log(i))\` logs what? Why? Fix it with one keyword change.
**Q5:** A junior says "const makes things immutable" — show two lines that disprove this.
**Q6:** Refactor for clarity and safety:
\`\`\`js
var items = [];
for (var i = 0; i < array.length; i++) {
  var item = array[i];
  items.push(item);
}
\`\`\`

### Day 7 — Application
**Q7:** Write a function that, given a number n, returns an array of n functions each returning their own index — without IIFE.
**Q8:** A PR uses \`var\` throughout — explain three classes of bugs it can introduce vs let/const.
**Q9:** What is the performance cost of declaring inside a hot loop (let vs reusing a single binding outside)?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through the lexical environment created when a function expression captures a variable from its enclosing scope — at runtime."
**Q11:** Draw: scope chain for a 3-level nested function accessing variables from each level.
**Q12:** ★ System design: "Architect a module-loading system that prevents global pollution and naming conflicts across 200 contributors. Show how let/const/modules combine."`
  },

  // ── 3. data-types ────────────────────────────────────────────────────────
  'data-types': {
    feynman: `## FEYNMAN CHECK

### Explain JS Data Types Like I'm 10 Years Old
> JavaScript has 8 types — 7 PRIMITIVES (\`string\`, \`number\`, \`bigint\`, \`boolean\`, \`undefined\`, \`null\`, \`symbol\`) and 1 OBJECT type (which covers everything else: arrays, functions, dates, regexps, Maps, Sets, plain objects). Primitives are IMMUTABLE and PASSED BY VALUE — \`let a = 5; let b = a; b = 6\` leaves a as 5. Objects are MUTABLE and PASSED BY REFERENCE — two variables can point to the SAME underlying object. The non-obvious detail: \`typeof null === 'object'\` is a famous bug from JS's first month that can never be fixed without breaking the web. \`typeof NaN === 'number'\`. \`typeof []\` is also 'object' — use \`Array.isArray()\` for arrays. \`number\` is always a 64-bit IEEE 754 float — there is no separate int type, which is why 0.1 + 0.2 !== 0.3.

---

### 5 Deep Conceptual Questions

**Q1: Why does \`0.1 + 0.2\` equal \`0.30000000000000004\`?**
> **A:** JavaScript numbers are IEEE 754 double-precision floats. 0.1 cannot be represented exactly in binary (just like 1/3 cannot be exact in decimal); it's a repeating fraction approximated to ~17 significant digits. When you add two approximations, the rounding errors add up. The fix for money: use integers in cents (\`19_99\` cents = $19.99), use BigInt for arbitrary integer precision, or use a decimal library (Decimal.js).

**Q2: Mental model for primitives vs objects?**
> **A:** A primitive value is COPIED when assigned or passed; modifying the copy does NOT affect the original. An object is a REFERENCE — both variables point to the SAME memory location. \`let a = {x:1}; let b = a; b.x = 5\` → a.x is also 5 because a and b reference the same object. This is why "immutable update patterns" (\`{...obj, x: 5}\`) matter — they create a new object rather than mutate.

**Q3: Most dangerous misconception?**
> **A:** \`typeof null === 'object'\`:
> \`\`\`js
> // ❌ Famous bug — typeof null is 'object', not 'null'
> typeof null;        // 'object'
> typeof undefined;   // 'undefined'
> typeof [];          // 'object' (yes, arrays are objects)
> typeof function(){};// 'function' (special case)
> typeof NaN;         // 'number' (NaN is a number)
>
> // ✅ Robust type checks
> Array.isArray(x);                          // for arrays
> x === null;                                 // for null
> Object.prototype.toString.call(x);         // returns '[object Date]', '[object RegExp]', etc.
> \`\`\`

**Q4: How does the JS engine store these types internally?**
> **A:** V8 uses TAGGED POINTERS — every value is a 64-bit pointer where the LOW BITS indicate the type tag (e.g., 1 = small integer "Smi", 0 = pointer to heap object). Small integers (-2^31 to 2^31-1) are stored INLINE in the pointer — no heap allocation, blazing fast. Floats, large numbers, strings, and objects live on the heap with a hidden "Map" pointer at offset 0 describing the shape (used for property-access optimisation). This is why monomorphic code (same shape) is 10× faster than polymorphic.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript values are typed at runtime as one of 7 primitive types (string, number, bigint, boolean, undefined, null, symbol) or as an object — primitives are immutable and copy-by-value, objects are mutable references stored on the heap with V8 hidden classes describing their shape — with type coercion governed by abstract equality and string/number conversion algorithms that produce many of the language's famous footguns."`,
    build: `## BUILD

### 🏗️ Mini Project: Money Library That Avoids Float Errors

**What you will build:** A small Money class that stores amounts as INTEGER cents internally — avoiding the 0.1 + 0.2 problem — with add/subtract/format methods and currency-symbol support.
**Why this project:** Forces understanding of float limits, integer math, and the primitive-vs-object distinction.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-money && cd js-money
npm init -y
npm install -D vitest
ni money.js, money.test.js -ItemType File
\`\`\`

#### Step 2 — Money Class
\`\`\`js
// money.js
export class Money {
  /** @param {number} cents - integer cents (NOT dollars) */
  constructor(cents, currency = 'USD') {
    if (!Number.isInteger(cents)) {
      throw new TypeError(\`Money requires integer cents, got \${cents}\`);
    }
    this._cents = cents;
    this._currency = currency;
    Object.freeze(this);   // immutable
  }

  static fromDollars(dollars, currency = 'USD') {
    // Multiply by 100 then round to avoid 1.10 * 100 = 110.00000000000001
    return new Money(Math.round(dollars * 100), currency);
  }

  add(other) {
    this._sameCurrency(other);
    return new Money(this._cents + other._cents, this._currency);
  }

  subtract(other) {
    this._sameCurrency(other);
    return new Money(this._cents - other._cents, this._currency);
  }

  multiply(factor) {
    return new Money(Math.round(this._cents * factor), this._currency);
  }

  format(locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
      style: 'currency', currency: this._currency,
    }).format(this._cents / 100);
  }

  _sameCurrency(other) {
    if (this._currency !== other._currency) {
      throw new Error(\`Currency mismatch: \${this._currency} vs \${other._currency}\`);
    }
  }
}
\`\`\`

#### Step 3 — Float Bug Demo (Before)
\`\`\`js
// demo.js
console.log('Float math:', 0.1 + 0.2);          // 0.30000000000000004
console.log('Float compare:', 0.1 + 0.2 === 0.3); // false

import { Money } from './money.js';
const a = Money.fromDollars(0.10);
const b = Money.fromDollars(0.20);
const c = a.add(b);
console.log('Money math:', c.format());          // $0.30 — exact
\`\`\`

#### Step 4 — Error Handling: BigInt for Very Large Amounts
\`\`\`js
// For amounts > Number.MAX_SAFE_INTEGER (2^53 - 1)
export class BigMoney {
  constructor(cents) {
    this._cents = typeof cents === 'bigint' ? cents : BigInt(cents);
  }
  add(other) { return new BigMoney(this._cents + other._cents); }
  toString() { return (this._cents / 100n) + '.' + String(this._cents % 100n).padStart(2, '0'); }
}

const huge = new BigMoney(10n ** 20n);
const more = new BigMoney(50n);
console.log(huge.add(more).toString());
\`\`\`

#### Step 5 — Tests
\`\`\`js
// money.test.js
import { describe, it, expect } from 'vitest';
import { Money } from './money.js';

describe('Money', () => {
  it('avoids 0.1 + 0.2 float bug', () => {
    const a = Money.fromDollars(0.10);
    const b = Money.fromDollars(0.20);
    expect(a.add(b).format()).toBe('$0.30');
  });
  it('rejects non-integer cents', () => {
    expect(() => new Money(1.5)).toThrow(TypeError);
  });
  it('is immutable (frozen)', () => {
    const m = new Money(100);
    expect(() => { m._cents = 999; }).toThrow();
  });
  it('refuses to mix currencies', () => {
    const usd = new Money(100, 'USD');
    const eur = new Money(100, 'EUR');
    expect(() => usd.add(eur)).toThrow(/Currency mismatch/);
  });
  it('multiply rounds correctly', () => {
    const m = Money.fromDollars(10);
    expect(m.multiply(0.30).format()).toBe('$3.00');
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Float math: 0.30000000000000004
Float compare: false
Money math: $0.30

# All tests pass:
✓ avoids 0.1 + 0.2 float bug
✓ rejects non-integer cents
✓ is immutable (frozen)
✓ refuses to mix currencies
✓ multiply rounds correctly
\`\`\`

**Stretch Challenges:**
- [ ] Add a Currency exchange method that pulls rates from an API
- [ ] Make Money serialise/deserialise to JSON safely
- [ ] Compare Money to Stripe's amount handling (smallest currency unit)`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Name the 7 primitive types in JS.
**Q2:** Why does \`typeof null\` return \`'object'\`?
**Q3:** Write a one-liner that proves \`0.1 + 0.2 !== 0.3\`. From memory.

### Day 3 — Comprehension
**Q4:** Difference between pass-by-value and pass-by-reference. Give a 4-line example for each.
**Q5:** A junior compares two arrays with \`===\` and gets unexpected false. Diagnose.
**Q6:** Refactor for safety:
\`\`\`js
const price = 19.99;
const tax = price * 0.10;
const total = price + tax;   // 21.989000000000003 — leaked to UI!
\`\`\`

### Day 7 — Application
**Q7:** Build an immutable Set wrapper using \`Object.freeze\` and \`structuredClone\`.
**Q8:** A PR adds \`if (x == null)\` — explain what types this matches and why it's actually clever.
**Q9:** When should you reach for BigInt instead of number?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every implicit type coercion JavaScript performs in equality comparisons."
**Q11:** Draw: how V8 stores small integers vs floats vs strings — Smi tagging, heap pointers, hidden classes.
**Q12:** ★ System design: "Design the money/currency layer for a global payments SaaS — what types, what precision, what serialisation?"`
  },

  // ── 4. operators ─────────────────────────────────────────────────────────
  'operators': {
    feynman: `## FEYNMAN CHECK

### Explain JS Operators Like I'm 10 Years Old
> Operators are the SHORTCUTS for transforming values: arithmetic (\`+ - * / % **\`), comparison (\`< > <= >= == === != !==\`), logical (\`&& || !\`), assignment (\`= += ??=\`), bitwise (\`& | ^ ~ << >>\`), and modern shorthands (\`?.\` optional chaining, \`??\` nullish coalescing, \`?.()\` optional call, \`?.[]\` optional index). The non-obvious subtleties: \`==\` does TYPE COERCION (\`'5' == 5\` is true), \`===\` does not (always use === unless you have a specific reason). \`||\` returns the FIRST TRUTHY operand (not boolean) — so \`0 || 'default'\` returns 'default' even when 0 was valid. \`??\` returns the right side ONLY for null/undefined — \`0 ?? 'default'\` returns 0 (the fix for the || footgun).

---

### 5 Deep Conceptual Questions

**Q1: Why prefer \`===\` over \`==\`?**
> **A:** \`==\` performs the Abstract Equality Comparison Algorithm — a chain of type coercions: number-vs-string converts string to number; boolean-vs-anything converts boolean to number; object-vs-primitive calls \`.valueOf()\` then \`.toString()\`. The result is famous bugs: \`'' == 0\` (true), \`'0' == false\` (true), \`[] == 0\` (true), \`null == undefined\` (true but \`null == 0\` is false). \`===\` skips all coercion — types must match, then values. Always === unless you specifically want null|undefined matching, in which case \`x == null\` is the canonical idiom.

**Q2: Mental model for \`||\` vs \`??\`?**
> **A:** \`a || b\` returns a if a is TRUTHY, else b. \`a ?? b\` returns a if a is NEITHER null NOR undefined, else b. The difference matters when 0, '', false, NaN are VALID values: \`config.timeout || 5000\` overrides 0; \`config.timeout ?? 5000\` preserves 0. Same for empty string in form defaults. Modern rule: use \`??\` for "default if missing", \`||\` only for "default if falsy" (rare).

**Q3: Most dangerous misconception?**
> **A:** Believing \`+\` is commutative across types:
> \`\`\`js
> // ❌ String concatenation hijacks arithmetic
> 1 + 2 + '3';   // '33'  (left to right: 1+2=3, then '3'+'3'='33')
> '1' + 2 + 3;   // '123' (left to right: '1'+2='12', then '12'+3='123')
>
> // ✅ Be explicit
> Number(a) + Number(b);
> // Or: a + b when both are guaranteed numbers via prior validation
> \`\`\`

**Q4: How does optional chaining interact with the engine at runtime?**
> **A:** \`obj?.prop\` is sugar for \`(obj === null || obj === undefined) ? undefined : obj.prop\`. V8 compiles it to a short-circuit branch. Critically, optional chaining ONLY short-circuits at the \`?.\` itself — \`a?.b.c.d\` becomes undefined if a is nullish, but if a is defined and b is undefined, accessing \`.c\` on undefined still throws. Use \`a?.b?.c?.d\` for chains where every step could be nullish.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript operators are infix, prefix, or postfix expression productions evaluated per the ECMAScript abstract operations — arithmetic via IEEE 754 float ops, equality via the Abstract or Strict Equality Comparison Algorithms, logical \`||\`/\`&&\` returning the first short-circuit operand value (not boolean), nullish \`??\` short-circuiting only on null/undefined, optional chaining \`?.\` short-circuiting member access — collectively producing several of the language's most cited footguns when type coercion is misunderstood."`,
    build: `## BUILD

### 🏗️ Mini Project: Safe Config Resolver Using ??, ?., and Logical Assignment

**What you will build:** A config-resolver that merges user, project, and default config layers safely — preserving 0/false/'' as valid values, handling missing nested paths, using modern operators (??=, ||=, ?.()).
**Why this project:** Forces every modern operator in a real config-loading scenario.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-operators && cd js-operators
npm init -y
npm install -D vitest
ni config.js, config.test.js -ItemType File
\`\`\`

#### Step 2 — Config Resolver
\`\`\`js
// config.js
export const DEFAULTS = {
  port: 3000,
  timeout: 5000,
  retries: 3,
  features: { dark: true, beta: false },
  hooks:    { onError: null, onReady: null },
};

export function resolveConfig(user = {}, project = {}) {
  const result = structuredClone(DEFAULTS);

  // Use ?? so explicit 0/false/'' are preserved
  result.port    = user.port    ?? project.port    ?? DEFAULTS.port;
  result.timeout = user.timeout ?? project.timeout ?? DEFAULTS.timeout;
  result.retries = user.retries ?? project.retries ?? DEFAULTS.retries;

  // Deep merge features safely
  result.features = {
    ...DEFAULTS.features,
    ...(project.features ?? {}),
    ...(user.features    ?? {}),
  };

  // Optional callbacks — only assign if defined
  result.hooks.onError ??= project.hooks?.onError ?? user.hooks?.onError;
  result.hooks.onReady ??= project.hooks?.onReady ?? user.hooks?.onReady;

  return result;
}

export function fire(config, name, ...args) {
  // Optional call: invokes only if function exists
  config.hooks?.[name]?.(...args);
}
\`\`\`

#### Step 3 — Demo Showing || vs ?? Difference
\`\`\`js
// demo.js
import { resolveConfig, fire } from './config.js';

// User explicitly sets port=0 (use system-assigned port) and retries=0 (no retry)
const cfg = resolveConfig(
  { port: 0, retries: 0, features: { dark: false } },
  { timeout: 10_000, hooks: { onReady: () => console.log('ready!') } },
);

console.log(cfg);
// Expected: port=0 (preserved!), retries=0 (preserved!), timeout=10000, dark=false

fire(cfg, 'onReady');    // → 'ready!'
fire(cfg, 'onError', new Error('x'));   // silent — no onError defined

// Show the || bug equivalent
const buggy = {
  port:    0  || 3000,   // 3000 (wrong!)
  retries: 0  || 3,      // 3    (wrong!)
};
console.log('Buggy version:', buggy);
\`\`\`

#### Step 4 — Error Handling: Logical Assignment Operators
\`\`\`js
// Initialise lazily — only assign if currently undefined
const cache = {};
function getOrInit(key, factory) {
  cache[key] ??= factory();   // ??= : assign only if currently null/undefined
  return cache[key];
}

const v1 = getOrInit('user', () => ({ id: 1, fetchedAt: Date.now() }));
const v2 = getOrInit('user', () => ({ id: 2, fetchedAt: Date.now() }));
console.log(v1 === v2);  // true — factory NOT re-invoked

// Other shortcuts
let flags = 0b0110;
flags &&= 0b0100;   // assign only if currently truthy
flags ||= 0b0001;   // assign only if currently falsy
console.log(flags.toString(2));
\`\`\`

#### Step 5 — Tests
\`\`\`js
// config.test.js
import { describe, it, expect, vi } from 'vitest';
import { resolveConfig, fire } from './config.js';

describe('resolveConfig', () => {
  it('preserves 0 from user (uses ?? not ||)', () => {
    const c = resolveConfig({ port: 0 });
    expect(c.port).toBe(0);
  });
  it('falls back through user → project → default', () => {
    const c = resolveConfig({}, { timeout: 7000 });
    expect(c.timeout).toBe(7000);
    expect(c.port).toBe(3000);
  });
  it('user features override project features', () => {
    const c = resolveConfig({ features: { dark: false } }, { features: { dark: true, beta: true } });
    expect(c.features.dark).toBe(false);
    expect(c.features.beta).toBe(true);   // from project
  });
});

describe('fire (optional call)', () => {
  it('invokes existing hook', () => {
    const onReady = vi.fn();
    fire({ hooks: { onReady } }, 'onReady', 1, 2);
    expect(onReady).toHaveBeenCalledWith(1, 2);
  });
  it('no-ops on missing hook', () => {
    expect(() => fire({ hooks: {} }, 'onError', 'x')).not.toThrow();
  });
});
\`\`\`

**Expected Output:**
\`\`\`
{
  port: 0,
  timeout: 10000,
  retries: 0,
  features: { dark: false, beta: false },
  hooks: { onError: null, onReady: [Function] }
}
ready!
Buggy version: { port: 3000, retries: 3 }
true
100
\`\`\`

**Stretch Challenges:**
- [ ] Add an env-variable layer (highest priority)
- [ ] Validate config against a schema and throw on unknown keys
- [ ] Support hot-reloading via the storage event`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between \`==\` and \`===\`?
**Q2:** What does \`0 || 'a'\` return? \`0 ?? 'a'\`?
**Q3:** Write a single line that safely reads \`user.address.city\` when any level could be null. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`'1' + 2\` give \`'12'\` but \`'1' * 2\` gives \`2\`?
**Q5:** A junior writes \`if (count == null)\` — what does this match? Why is it idiomatic?
**Q6:** Refactor to use \`??\` and \`??=\`:
\`\`\`js
let timeout = userTimeout;
if (timeout === undefined || timeout === null) timeout = 5000;
\`\`\`

### Day 7 — Application
**Q7:** Build a function that merges N config objects preserving 0/false values.
**Q8:** A PR uses \`obj?.method()\` — explain when this throws vs returns undefined.
**Q9:** What's the cost of optional chaining vs nested if-checks at runtime?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every type-coercion case in the \`==\` operator."
**Q11:** Draw: short-circuit evaluation tree for \`a && b || c ?? d\`.
**Q12:** ★ System design: "Design a feature-flag system where flag values include null, false, 0, '', and complex objects — pick the right operators."`
  },

  // ── 5. control-flow-js ───────────────────────────────────────────────────
  'control-flow-js': {
    feynman: `## FEYNMAN CHECK

### Explain Control Flow Like I'm 10 Years Old
> Control flow is HOW your program DECIDES what to do next. JS gives you: \`if/else\` (branch on truthy/falsy), \`switch\` (multi-way branch on equality), ternary \`? :\` (compact if/else expression), \`try/catch/finally\` (handle errors), and \`throw\` (signal errors). The non-obvious detail: switch uses \`===\` (strict equality) — \`case 1\` does NOT match string '1'. Switch cases FALL THROUGH unless you \`break\` or \`return\` — a frequent bug. Modern JS prefers OBJECT LOOKUPS and EARLY RETURNS over deep switch/if chains. \`try/catch\` only catches SYNCHRONOUS throws and PROMISES THAT YOU AWAIT — fire-and-forget async errors slip past.

---

### 5 Deep Conceptual Questions

**Q1: When should you use switch vs if-else vs object lookup?**
> **A:** Use OBJECT LOOKUP \`actions[type]?.()\` for "map type to handler" — cleanest, fastest (O(1) hash), tree-shakable, no fall-through bugs. Use SWITCH when you need fall-through intentionally or pattern-matching that an object can't express. Use IF-ELSE for actual ranges/conditions (\`if (n > 100)\`). Modern codebases use ternaries for expressions, early returns for guard clauses, switch only when truly needed.

**Q2: Mental model for try/catch and async?**
> **A:** A try/catch catches anything that THROWS SYNCHRONOUSLY in its body, OR is awaited and rejects. \`try { setTimeout(() => { throw new Error() }) }\` does NOT catch — the throw happens in a separate event-loop tick. \`try { await fetch('/bad') }\` catches the rejection. Modern advice: don't pepper try/catch everywhere; let unhandled errors bubble to global error handlers (window.onerror, process.on('unhandledRejection')), catch only when you can RECOVER.

**Q3: Most dangerous misconception?**
> **A:** Switch fall-through:
> \`\`\`js
> // ❌ Forgot break — fall-through silently runs next case
> switch (status) {
>   case 'pending':
>     showSpinner();
>     // forgot break!
>   case 'error':
>     showError();        // runs even when status is 'pending'!
>     break;
>   case 'success':
>     hideSpinner();
>     break;
> }
>
> // ✅ Always use return or break, OR refactor to object lookup
> const handlers = { pending: showSpinner, error: showError, success: hideSpinner };
> handlers[status]?.();
> \`\`\`

**Q4: How does try/catch interact with the JS engine's optimisation?**
> **A:** Historically (pre-2018), code inside try blocks was DE-OPTIMISED in V8 — try blocks couldn't be optimised by Crankshaft. Modern V8 (Turbofan, 2018+) handles try/catch fully. So "avoid try/catch in hot loops" is OUTDATED advice. However, throwing is still expensive — capturing a stack trace costs microseconds, much more than returning a Result type. For control flow, use return values; for exceptional errors, throw.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript control flow comprises branching constructs (if/else, switch with strict-equality dispatch and explicit fall-through, ternary expressions), iteration (for, while, do-while, for-of, for-in), exception handling (try/catch/finally with throw, scoped to synchronous + awaited async), and labelled break/continue for nested loop control — collectively forming the imperative skeleton onto which modern JS layers functional patterns like Array.map/filter/reduce."`,
    build: `## BUILD

### 🏗️ Mini Project: Order State Machine With Exhaustive Switch + Error Recovery

**What you will build:** A small order-processing state machine: \`pending → paid → shipped → delivered\` with exhaustive switch handling, retry-on-error logic, and a guard-clause refactor showing the "early return" pattern.
**Why this project:** Forces switch with default+throw exhaustiveness, try/catch recovery, and object-lookup alternative.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-control && cd js-control
npm init -y
npm install -D vitest
ni order.js, order.test.js -ItemType File
\`\`\`

#### Step 2 — State Machine With Switch
\`\`\`js
// order.js
export function nextState(currentState) {
  switch (currentState) {
    case 'pending':   return 'paid';
    case 'paid':      return 'shipped';
    case 'shipped':   return 'delivered';
    case 'delivered': return 'delivered';  // terminal
    case 'cancelled': return 'cancelled';  // terminal
    default:
      // Exhaustiveness check — runtime error if a new state was added
      throw new Error(\`Unknown order state: \${currentState}\`);
  }
}

// Equivalent object-lookup version — cleaner, tree-shakable
const TRANSITIONS = {
  pending:   'paid',
  paid:      'shipped',
  shipped:   'delivered',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

export function nextStateLookup(s) {
  const next = TRANSITIONS[s];
  if (next === undefined) throw new Error(\`Unknown state: \${s}\`);
  return next;
}
\`\`\`

#### Step 3 — Process Order With Retry
\`\`\`js
// processor.js
export async function processOrder(orderId, attempt = 1) {
  const MAX_ATTEMPTS = 3;
  try {
    const order = await fetchOrder(orderId);
    if (!order)            return { status: 'error', reason: 'not_found' };
    if (order.cancelled)   return { status: 'noop',  reason: 'already_cancelled' };

    // Guard clauses — early return, no nested ifs
    const newState = nextState(order.state);
    await persistState(orderId, newState);
    return { status: 'ok', newState };
  } catch (err) {
    // Recoverable: retry up to MAX_ATTEMPTS
    if (err.name === 'NetworkError' && attempt < MAX_ATTEMPTS) {
      await new Promise(r => setTimeout(r, 2 ** attempt * 100));
      return processOrder(orderId, attempt + 1);
    }
    return { status: 'error', reason: err.message };
  } finally {
    console.log(\`Processed order \${orderId} (attempt \${attempt})\`);
  }
}

async function fetchOrder(id) { /* stub */ return { id, state: 'pending', cancelled: false }; }
async function persistState(id, state) { /* stub */ }
\`\`\`

#### Step 4 — Error Handling: Async Try/Catch Gotcha
\`\`\`js
// ❌ This does NOT catch the timer's throw
async function badAsync() {
  try {
    setTimeout(() => { throw new Error('boom'); }, 0);  // uncaught — escapes try
  } catch (e) {
    console.log('caught:', e.message);   // never runs
  }
}

// ✅ Wrap in a Promise so you can await it
function laterError() {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('boom')), 0));
}
async function goodAsync() {
  try { await laterError(); }
  catch (e) { console.log('caught:', e.message); }   // ✅ runs
}
\`\`\`

#### Step 5 — Tests
\`\`\`js
// order.test.js
import { describe, it, expect } from 'vitest';
import { nextState, nextStateLookup } from './order.js';

describe('nextState', () => {
  it('advances through every state', () => {
    expect(nextState('pending'))   .toBe('paid');
    expect(nextState('paid'))      .toBe('shipped');
    expect(nextState('shipped'))   .toBe('delivered');
    expect(nextState('delivered')) .toBe('delivered');
  });
  it('throws on unknown state', () => {
    expect(() => nextState('unknown')).toThrow(/Unknown order state/);
  });
});

describe('nextStateLookup', () => {
  it('matches switch behaviour', () => {
    expect(nextStateLookup('paid')).toBe('shipped');
  });
  it('throws on missing state', () => {
    expect(() => nextStateLookup('phantom')).toThrow();
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Processed order 42 (attempt 1)
{ status: 'ok', newState: 'paid' }

# Tests:
✓ advances through every state
✓ throws on unknown state
✓ object lookup matches switch behaviour
\`\`\`

**Stretch Challenges:**
- [ ] Add transition guards (e.g., can only ship if paid)
- [ ] Convert to XState for visualisable state charts
- [ ] Add audit-log middleware that wraps every transition`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Does switch use \`==\` or \`===\` for matching?
**Q2:** What does \`try { setTimeout(() => { throw 'x' }) }\` catch?
**Q3:** Write an exhaustive switch on \`'a' | 'b' | 'c'\` that throws on default. From memory.

### Day 3 — Comprehension
**Q4:** When would you choose switch over an object lookup?
**Q5:** A junior writes \`if (user) if (user.address) if (user.address.city) ...\` — refactor with guard clauses.
**Q6:** Refactor without nested if-else:
\`\`\`js
function getDiscount(user) {
  if (user.tier === 'gold') return 0.20;
  else if (user.tier === 'silver') return 0.10;
  else return 0;
}
\`\`\`

### Day 7 — Application
**Q7:** Build a retry-with-exponential-backoff wrapper using try/catch.
**Q8:** A PR throws a string \`throw 'error'\` instead of \`throw new Error('error')\`. Why is this bad?
**Q9:** What is the cost of throwing in modern V8 (vs returning a Result type)?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how async/await rethrowing differs from synchronous throw."
**Q11:** Draw: control-flow graph for try/catch/finally with a return inside try AND finally.
**Q12:** ★ System design: "Design the error-handling strategy for a server that calls 10 downstream services — what bubbles, what retries, what circuit-breaks?"`
  },

  // ── 6. functions-basics ──────────────────────────────────────────────────
  'functions-basics': {
    feynman: `## FEYNMAN CHECK

### Explain JS Functions Like I'm 10 Years Old
> A function is a REUSABLE BLOCK OF CODE that takes inputs (parameters) and returns an output. JS has FOUR ways to declare them: function declaration (\`function f(){}\` — hoisted, gets a name), function expression (\`const f = function(){}\` — not hoisted, name optional), arrow function (\`const f = () => {}\` — no own \`this\`, no \`arguments\`, no \`new\`, compact), and method shorthand inside objects (\`{ f() {} }\`). Functions in JS are FIRST-CLASS VALUES — you can pass them as arguments, return them from other functions, store them in arrays, attach them as object properties. The non-obvious detail: every function has a \`length\` property (number of declared params before the first default), a \`name\` property (often inferred from assignment), and access to \`arguments\` (except arrow functions).

---

### 5 Deep Conceptual Questions

**Q1: When do you use function declaration vs arrow vs expression?**
> **A:** Use ARROW for: callbacks, methods that need lexical \`this\` (React render functions, array methods), short pure expressions. Use FUNCTION DECLARATION for: top-level utilities you want hoisted, anything that benefits from a stack trace name, generators. Use METHOD SHORTHAND in object literals. Avoid bare function expressions (\`const f = function(){}\`) — arrows are shorter and the lack of \`this\` is usually what you want.

**Q2: Mental model for hoisting?**
> **A:** \`function declaration\` is hoisted with its full body — you can call it BEFORE its source line. \`function expression\` and arrow function assigned to \`var\` are partially hoisted (the var binding is hoisted to undefined). \`let/const\` arrow functions are in TDZ before the line. Modern style: prefer arrows + const for safety, even though it means defining helpers above their callers (or extracting them).

**Q3: Most dangerous misconception?**
> **A:** Default parameters are evaluated lazily — once per call:
> \`\`\`js
> // ❌ Trap: shared default mutable object
> function append(item, list = []) { list.push(item); return list; }
> append(1);   // [1]
> append(2);   // [2]  — defaults are CREATED PER CALL, not shared
>
> // BUT — outer scope mutation can bite:
> function counter(start = ++globalSeed) { return start; }   // globalSeed advances per call
>
> // ✅ Default expressions can also reference earlier params
> function range(start, end = start + 10) { return [start, end]; }
> \`\`\`

**Q4: How do arrow functions differ from regular functions at runtime?**
> **A:** Arrow functions do not bind their own \`this\` — they capture it from the enclosing lexical scope (closure-style). They have no \`arguments\` (use rest params \`...args\`), no \`prototype\` property (can't be used with \`new\`), and no \`super\`. They are slightly cheaper to construct (no prototype object). React encourages arrows in render methods specifically BECAUSE they preserve \`this\`; class component methods that need handling outside (event handlers) require .bind or arrow class fields.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript functions are first-class callable objects with closures over their lexical environment — declared via function declarations (hoisted), function expressions (assigned), arrow functions (lexical-this, no arguments, no prototype, no new), or method shorthand — with parameter defaults evaluated per-call, rest parameters collecting variadic arguments into a real array, and IIFEs providing pre-modules scope isolation."`,
    build: `## BUILD

### 🏗️ Mini Project: Function Combinator Library — pipe, compose, curry, partial

**What you will build:** A small functional-utilities library implementing pipe, compose, curry, partial, and once — the building blocks behind RxJS, Ramda, and Lodash/fp.
**Why this project:** Forces deep practice with higher-order functions, closures, rest params, and currying.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-funcs && cd js-funcs
npm init -y
npm install -D vitest
ni combinators.js, combinators.test.js -ItemType File
\`\`\`

#### Step 2 — Core Combinators
\`\`\`js
// combinators.js

// pipe(f, g, h)(x) = h(g(f(x)))  — left-to-right
export const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

// compose(f, g, h)(x) = f(g(h(x)))  — right-to-left (mathematical)
export const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);

// curry(fn) — fn(a, b, c) becomes fn(a)(b)(c) or fn(a, b)(c) etc.
export function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...more) => curried.apply(this, [...args, ...more]);
  };
}

// partial(fn, ...preset) — locks the first few arguments
export const partial = (fn, ...preset) => (...rest) => fn(...preset, ...rest);

// once(fn) — runs fn at most one time, caches the result
export function once(fn) {
  let called = false, value;
  return function (...args) {
    if (called) return value;
    called = true;
    value = fn.apply(this, args);
    return value;
  };
}
\`\`\`

#### Step 3 — Use Them For Data Transformation
\`\`\`js
// demo.js
import { pipe, compose, curry, partial, once } from './combinators.js';

const trim   = (s) => s.trim();
const lower  = (s) => s.toLowerCase();
const slugify = pipe(trim, lower, (s) => s.replace(/\\s+/g, '-'));
console.log(slugify('  Hello World  '));   // 'hello-world'

const add = curry((a, b, c) => a + b + c);
console.log(add(1)(2)(3));   // 6
console.log(add(1, 2)(3));   // 6
console.log(add(1)(2, 3));   // 6

const greet = (greeting, name) => \`\${greeting}, \${name}!\`;
const hello = partial(greet, 'Hello');
console.log(hello('Ana'));   // 'Hello, Ana!'

const initDb = once(() => { console.log('actually connecting...'); return { connected: true }; });
initDb();  // 'actually connecting...'
initDb();  // (silent — returns cached value)
\`\`\`

#### Step 4 — Error Handling: Tap and Trace
\`\`\`js
// tap(fn) runs side effect, returns the value unchanged — useful in pipes
export const tap = (fn) => (x) => { fn(x); return x; };

// trace(label) - debugging helper
export const trace = (label) => (x) => { console.log(label, x); return x; };

const debugSlug = pipe(
  trace('1. input'),
  trim,
  trace('2. trimmed'),
  lower,
  trace('3. lowered'),
  (s) => s.replace(/\\s+/g, '-'),
  trace('4. result'),
);
debugSlug('  Hello World  ');
\`\`\`

#### Step 5 — Tests
\`\`\`js
// combinators.test.js
import { describe, it, expect, vi } from 'vitest';
import { pipe, compose, curry, partial, once } from './combinators.js';

describe('pipe', () => {
  it('applies left-to-right', () => {
    const f = pipe((n) => n + 1, (n) => n * 2);
    expect(f(3)).toBe(8);   // (3+1)*2
  });
  it('returns input when no fns', () => {
    expect(pipe()(42)).toBe(42);
  });
});

describe('compose', () => {
  it('applies right-to-left (mathematical)', () => {
    const f = compose((n) => n + 1, (n) => n * 2);
    expect(f(3)).toBe(7);   // (3*2)+1
  });
});

describe('curry', () => {
  it('respects original arity', () => {
    const add3 = curry((a, b, c) => a + b + c);
    expect(add3(1)(2)(3)).toBe(6);
    expect(add3(1, 2, 3)).toBe(6);
    expect(add3(1, 2)(3)).toBe(6);
  });
});

describe('once', () => {
  it('invokes the underlying fn at most once', () => {
    const spy = vi.fn(() => 42);
    const wrapped = once(spy);
    expect(wrapped()).toBe(42);
    expect(wrapped()).toBe(42);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
hello-world
6 6 6
Hello, Ana!
actually connecting...

1. input   '  Hello World  '
2. trimmed 'Hello World'
3. lowered 'hello world'
4. result  'hello-world'

# All 7 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add an async-pipe that awaits Promises between stages
- [ ] Add memoize(fn, keyFn) using a Map
- [ ] Convert combinators to TypeScript with full type inference (variadic tuples)`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Four ways to declare a function in JS.
**Q2:** What does \`fn.length\` return?
**Q3:** Write a one-liner pipe of three functions. From memory.

### Day 3 — Comprehension
**Q4:** Why doesn't an arrow function bind its own \`this\`?
**Q5:** A junior writes \`function f({a, b} = {})\` and is confused by defaults. Diagnose.
**Q6:** Refactor to use rest params + arrow:
\`\`\`js
function sum() {
  var total = 0;
  for (var i = 0; i < arguments.length; i++) total += arguments[i];
  return total;
}
\`\`\`

### Day 7 — Application
**Q7:** Build a debounce + throttle pair with proper closure and cleanup.
**Q8:** A PR uses arrow function as a React class method — explain memory cost vs prototype methods.
**Q9:** What's the performance cost of currying vs a plain N-ary function?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Implement curry — handling any arity, partial application, and binding."
**Q11:** Draw: closure created by \`once(fn)\` — what's captured in the environment record?
**Q12:** ★ System design: "Type the public API of a composable middleware pipeline (Express/Koa style) with full type inference."`
  },

  // ── 7. closures ──────────────────────────────────────────────────────────
  'closures': {
    feynman: `## FEYNMAN CHECK

### Explain Closures Like I'm 10 Years Old
> A closure is a FUNCTION + ITS REMEMBERED SURROUNDING SCOPE. When you create a function inside another function, the inner function REMEMBERS the variables from the outer function — even AFTER the outer function returns. The outer function's local variables are kept alive in memory specifically because the inner function still has a LIVE REFERENCE to them (not a copy). This is how you implement: private state in modules, factory functions, partial application, callbacks that remember context, React hooks (every \`useState\` slot is a closure over a position in a per-component array). The non-obvious detail: the V8 garbage collector cannot reclaim closed-over variables until ALL closures referencing them are themselves garbage — this is how memory leaks creep in (a forgotten event listener keeps a giant object alive).

---

### 5 Deep Conceptual Questions

**Q1: What problem do closures fundamentally solve?**
> **A:** DATA PRIVACY without classes, and STATE PERSISTENCE without globals. Before closures (in languages that lack them), the only way to maintain state across function calls was global variables (polluting namespace, hard to test) or passing state explicitly through every call. Closures let an inner function "carry" its own scoped state. This is how every module-pattern, callback-based event handler, and React hook works under the hood.

**Q2: Mental model for closures?**
> **A:** "Every function is BORN with a HIDDEN POINTER to the lexical environment that existed when it was created." That environment is a key→value map of all the bindings in the enclosing scopes. When the function later runs, variable lookups walk that scope chain. Crucially, multiple closures created in the same outer call SHARE the same lexical environment — \`let counter = (() => { let n = 0; return { inc: () => n++, get: () => n }; })()\` — inc and get see the SAME n.

**Q3: Most dangerous misconception?**
> **A:** Closures capture VALUES at creation time:
> \`\`\`js
> // ❌ Classic for-loop trap
> for (var i = 0; i < 3; i++) {
>   setTimeout(() => console.log(i), 0);   // logs 3, 3, 3
> }
>
> // ✅ Closures capture REFERENCES to bindings — let creates a NEW binding per iteration
> for (let i = 0; i < 3; i++) {
>   setTimeout(() => console.log(i), 0);   // logs 0, 1, 2
> }
> \`\`\`

**Q4: How do closures interact with the garbage collector?**
> **A:** A closed-over variable is kept alive as long as any reachable function STILL REFERENCES IT. If an inner function captures a 100MB array and that function is stored on a global event listener, the 100MB cannot be freed until the listener is removed. The fix: always remove listeners when components unmount; avoid capturing large objects in long-lived closures; use WeakMap/WeakRef for caches that should not prevent collection.

**Q5: FAANG-grade definition?**
> **A:** "A closure is a function bundled with its surrounding lexical environment — every JavaScript function captures the bindings of its enclosing scopes at creation time and retains a LIVE REFERENCE (not a snapshot) to them — enabling data encapsulation, module patterns, partial application, and stateful callbacks, while inadvertently extending the lifetime of captured variables until all closures referencing them are themselves unreachable."`,
    build: `## BUILD

### 🏗️ Mini Project: Build useState From Scratch (React-Style Hook)

**What you will build:** A working clone of React's useState that uses a CLOSURE over a hook-slot array — exactly how React tracks state per component across re-renders.
**Why this project:** Forces the exact closure pattern that powers every React hook.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-closures && cd js-closures
npm init -y
npm install -D vitest
ni useState.js, useState.test.js -ItemType File
\`\`\`

#### Step 2 — Mini React Renderer + useState
\`\`\`js
// useState.js
let currentComponent = null;

export function createRenderer() {
  const componentStates = new Map();   // component -> { hooks: [], index: 0 }

  function render(componentFn, name = 'Anon') {
    currentComponent = { name };
    const state = componentStates.get(name) ?? { hooks: [], index: 0 };
    state.index = 0;
    componentStates.set(name, state);

    // Closure: useState below captures 'state' via currentComponent lookup
    const output = componentFn();
    currentComponent = null;
    return output;
  }

  function useState(initial) {
    const state = componentStates.get(currentComponent.name);
    const slotIndex = state.index++;            // CRITICAL: order matters!
    if (state.hooks[slotIndex] === undefined) {
      state.hooks[slotIndex] = initial;
    }
    const setter = (next) => {
      state.hooks[slotIndex] =
        typeof next === 'function' ? next(state.hooks[slotIndex]) : next;
      console.log(\`[\${currentComponent?.name ?? 'next render'}] slot \${slotIndex} = \`, state.hooks[slotIndex]);
    };
    return [state.hooks[slotIndex], setter];
  }

  return { render, useState };
}
\`\`\`

#### Step 3 — Use The Hook
\`\`\`js
// demo.js
import { createRenderer } from './useState.js';

const { render, useState } = createRenderer();

function Counter() {
  const [count, setCount]   = useState(0);
  const [name,  setName]    = useState('Ana');
  console.log(\`Counter rendered with count=\${count}, name=\${name}\`);
  return { count, name, setCount, setName };
}

const r1 = render(Counter, 'C1');     // count=0, name='Ana'
r1.setCount(5);
r1.setName('Bob');
const r2 = render(Counter, 'C1');     // count=5, name='Bob' (state persisted!)
r2.setCount((prev) => prev + 1);
const r3 = render(Counter, 'C1');     // count=6
\`\`\`

#### Step 4 — Error Handling: Counter Factory (Classic Closure)
\`\`\`js
// factory.js — the canonical closure example
export function makeCounter(start = 0, step = 1) {
  let count = start;   // captured by all three returned closures
  return {
    inc:   () => (count += step),
    dec:   () => (count -= step),
    value: () => count,
    reset: () => (count = start),
  };
}

const c = makeCounter(10, 2);
console.log(c.value());   // 10
c.inc(); c.inc(); c.dec();
console.log(c.value());   // 12 (10+2+2-2)
c.reset();
console.log(c.value());   // 10
\`\`\`

#### Step 5 — Tests
\`\`\`js
// useState.test.js
import { describe, it, expect } from 'vitest';
import { createRenderer } from './useState.js';
import { makeCounter } from './factory.js';

describe('useState (hook simulation)', () => {
  it('persists state across renders', () => {
    const { render, useState } = createRenderer();
    let setCount;
    function App() { const [c, set] = useState(0); setCount = set; return c; }

    expect(render(App, 'A')).toBe(0);
    setCount(5);
    expect(render(App, 'A')).toBe(5);
  });
  it('supports functional updates', () => {
    const { render, useState } = createRenderer();
    let setCount;
    function App() { const [c, set] = useState(0); setCount = set; return c; }
    render(App, 'B');
    setCount(c => c + 10);
    expect(render(App, 'B')).toBe(10);
  });
});

describe('makeCounter (closure factory)', () => {
  it('two counters have INDEPENDENT state', () => {
    const a = makeCounter();
    const b = makeCounter();
    a.inc(); a.inc();
    expect(a.value()).toBe(2);
    expect(b.value()).toBe(0);
  });
  it('inc, dec, reset share the same count', () => {
    const c = makeCounter(10);
    c.inc(); c.inc(); c.dec();
    expect(c.value()).toBe(11);
    c.reset();
    expect(c.value()).toBe(10);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Counter rendered with count=0, name=Ana
[C1] slot 0 =  5
[C1] slot 1 =  Bob
Counter rendered with count=5, name=Bob
[C1] slot 0 =  6
Counter rendered with count=6, name=Bob

Tests:
✓ persists state across renders
✓ supports functional updates
✓ two counters have INDEPENDENT state
✓ inc, dec, reset share the same count
\`\`\`

**Stretch Challenges:**
- [ ] Add useEffect with dependency-array semantics
- [ ] Detect "hook called outside component" and throw
- [ ] Build a memory leak: capture a 10MB array in a long-lived closure, then fix with WeakRef`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Define a closure in one sentence (mention "live reference").
**Q2:** What does \`for (var i...) setTimeout(...)\` log vs \`for (let i...)\`?
**Q3:** Write a counter factory using closure. From memory.

### Day 3 — Comprehension
**Q4:** Why does React forbid calling hooks inside conditionals? (Hint: hook slot index)
**Q5:** A junior says "let inside a for-loop is slow" — measure and refute.
**Q6:** Refactor to use closure for private state:
\`\`\`js
let count = 0;
window.increment = () => count++;
window.getCount  = () => count;
\`\`\`

### Day 7 — Application
**Q7:** Build a memoize(fn) using a closure over a Map cache.
**Q8:** A PR creates 1000 modal dialogs each with an inline onClose listener; memory keeps growing. Diagnose.
**Q9:** What is the memory cost of one closure? Of 100,000 closures?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how every React useState call links to a specific closure-captured slot."
**Q11:** Draw: the scope chain when an inner function inside three levels of nesting accesses a var from the outermost.
**Q12:** ★ System design: "Implement a job-queue library where each task captures context via closures. What memory risks arise at 10k tasks?"`
  },

  // ── 8. this-keyword ──────────────────────────────────────────────────────
  'this-keyword': {
    feynman: `## FEYNMAN CHECK

### Explain \`this\` Like I'm 10 Years Old
> \`this\` is JavaScript's MOST CONFUSING keyword because its value depends on HOW the function was CALLED, not where it was DEFINED. Five rules: (1) Method call \`obj.method()\` → this = obj. (2) Standalone call \`f()\` → this = undefined in strict mode, globalThis in sloppy mode. (3) Constructor \`new F()\` → this = the new instance. (4) Explicit binding \`f.call(ctx)\`, \`f.apply(ctx)\`, \`f.bind(ctx)\` → this = ctx. (5) Arrow function \`() => this\` → this = whatever it was in the SURROUNDING scope (lexical \`this\`, no rebinding). The non-obvious detail: \`event.target.onclick = obj.method\` LOSES this because it gets called as a plain function, not as a method. The fix: \`obj.method.bind(obj)\` or \`() => obj.method()\`.

---

### 5 Deep Conceptual Questions

**Q1: Why is \`this\` determined at call time, not definition time?**
> **A:** Because the same function can be invoked many ways: as a method, as a callback, as a constructor. A function defined inside a class isn't "owned" by the class — it's just a function attached to the prototype. JavaScript decided at design time that \`this\` would be passed implicitly with every call, like a hidden first argument. This is incredibly flexible (a function can serve any object) but a constant source of bugs (callbacks lose context).

**Q2: Mental model for \`this\`?**
> **A:** Read every call site as "WHO IS THE LEFT SIDE OF THE DOT?". \`user.greet()\` → user. \`greet()\` → nothing (undefined/global). \`btn.onclick = user.greet; btn.click()\` → btn (the new left side at click time). Arrow functions skip this whole resolution — they SUBSTITUTE the enclosing function's \`this\`.

**Q3: Most dangerous misconception?**
> **A:** Methods passed as callbacks keep their \`this\`:
> \`\`\`js
> // ❌ this is lost when method is detached
> class Logger {
>   constructor(prefix) { this.prefix = prefix; }
>   log(msg) { console.log(this.prefix, msg); }
> }
> const l = new Logger('[APP]');
> setTimeout(l.log, 0, 'hi');   // TypeError: Cannot read 'prefix' of undefined
>
> // ✅ Three fixes:
> setTimeout(l.log.bind(l), 0, 'hi');         // bind
> setTimeout(() => l.log('hi'), 0);           // arrow wrapper
> // Or: use arrow class field
> class Logger { log = (msg) => console.log(this.prefix, msg); }
> \`\`\`

**Q4: How does \`bind\` differ from \`call\` and \`apply\`?**
> **A:** \`call(ctx, a, b, c)\` invokes the function IMMEDIATELY with ctx as this and arguments spread. \`apply(ctx, [a, b, c])\` is identical but takes an ARRAY of args (useful before spread syntax). \`bind(ctx, a)\` returns a NEW FUNCTION with \`this\` permanently locked to ctx and args partially applied — never re-binds. The bound function's bind/call/apply can no longer change its this — bind is irreversible (without going back to the original function).

**Q5: FAANG-grade definition?**
> **A:** "JavaScript's \`this\` is the implicit context argument passed to a function at call time — determined by the invocation pattern (method call binds to the receiver, standalone call binds to undefined in strict mode or globalThis in sloppy mode, constructor call binds to the new instance, explicit binding via call/apply/bind, arrow functions lexically inherit from enclosing scope) — making it the most-confused keyword in the language and the source of countless callback bugs solved by arrow functions or explicit binding."`,
    build: `## BUILD

### 🏗️ Mini Project: Mini Event Emitter Demonstrating Every \`this\` Pattern

**What you will build:** A reusable EventEmitter where listeners can be method references, arrow functions, bound functions, and class methods — with a debugger that logs the value of \`this\` in each case.
**Why this project:** Forces every \`this\` pattern in real code.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-this && cd js-this
npm init -y
npm install -D vitest
ni emitter.js, emitter.test.js -ItemType File
\`\`\`

#### Step 2 — EventEmitter
\`\`\`js
// emitter.js
export class EventEmitter {
  constructor() { this.listeners = new Map(); }
  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(handler);
    return () => this.off(event, handler);
  }
  off(event, handler) {
    const arr = this.listeners.get(event) ?? [];
    const i = arr.indexOf(handler);
    if (i >= 0) arr.splice(i, 1);
  }
  emit(event, ...args) {
    // Each handler is called as a PLAIN FUNCTION — this defaults
    for (const h of this.listeners.get(event) ?? []) h(...args);
  }
}
\`\`\`

#### Step 3 — Demo Every Binding Pattern
\`\`\`js
// demo.js
import { EventEmitter } from './emitter.js';

const bus = new EventEmitter();

// ─── Pattern 1: regular function — this = undefined (strict)
bus.on('p1', function() { console.log('Pattern 1:', this); });

// ─── Pattern 2: arrow function — this = enclosing module/file scope
bus.on('p2', () => console.log('Pattern 2:', this ?? 'undefined'));

// ─── Pattern 3: class method passed raw — loses this!
class Logger {
  constructor(prefix) { this.prefix = prefix; }
  log(msg) { console.log('Pattern 3 (raw):', this?.prefix, msg); }
}
const l = new Logger('[APP]');
bus.on('p3', l.log);                  // ❌ this lost → undefined.prefix throws

// ─── Pattern 4: bind — this locked forever
bus.on('p4', l.log.bind(l));          // ✅

// ─── Pattern 5: arrow wrapper — this preserved by closure
bus.on('p5', (msg) => l.log(msg));    // ✅

// ─── Pattern 6: arrow class field — bound at construction
class LoggerBound {
  constructor(prefix) { this.prefix = prefix; }
  log = (msg) => console.log('Pattern 6 (arrow field):', this.prefix, msg);
}
const lb = new LoggerBound('[BOUND]');
bus.on('p6', lb.log);                 // ✅ this captured

bus.emit('p1');
bus.emit('p2');
try { bus.emit('p3', 'hi'); } catch (e) { console.log('Pattern 3 threw:', e.message); }
bus.emit('p4', 'hi');
bus.emit('p5', 'hi');
bus.emit('p6', 'hi');
\`\`\`

#### Step 4 — Error Handling: call / apply / bind
\`\`\`js
function describe(adjective, noun) {
  return \`I am a \${adjective} \${noun}, name: \${this?.name}\`;
}

const user = { name: 'Ana' };
console.log(describe.call (user, 'happy', 'developer'));   // call
console.log(describe.apply(user, ['busy',  'coder']));     // apply
const bound = describe.bind(user, 'curious');
console.log(bound('learner'));                              // bind (partial)

// Bind is irreversible
const rebind = bound.bind({ name: 'NotAna' });
console.log(rebind('reader'));    // still says 'Ana' — bind locks the first
\`\`\`

#### Step 5 — Tests
\`\`\`js
// emitter.test.js
import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from './emitter.js';

describe('this binding patterns', () => {
  it('arrow class field preserves this when detached', () => {
    class L { constructor() { this.x = 42; } get = () => this.x; }
    const inst = new L();
    const ref = inst.get;       // detach
    expect(ref()).toBe(42);     // arrow field → still bound
  });
  it('regular method loses this when detached', () => {
    class L { constructor() { this.x = 42; } get() { return this?.x; } }
    const inst = new L();
    const ref = inst.get;
    expect(ref()).toBeUndefined();
  });
  it('bind locks this irreversibly', () => {
    function f() { return this.tag; }
    const a = f.bind({ tag: 'A' });
    const b = a.bind({ tag: 'B' });   // re-bind ignored
    expect(b()).toBe('A');
  });
  it('emit calls handlers as plain functions', () => {
    const bus = new EventEmitter();
    bus.on('x', function() { return this; });
    // tested via not throwing
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Pattern 1: undefined
Pattern 2: undefined
Pattern 3 threw: Cannot read properties of undefined (reading 'prefix')
Pattern 4 (raw): [APP] hi
Pattern 5 (raw): [APP] hi
Pattern 6 (arrow field): [BOUND] hi

I am a happy developer, name: Ana
I am a busy coder, name: Ana
I am a curious learner, name: Ana
I am a curious reader, name: Ana
\`\`\`

**Stretch Challenges:**
- [ ] Make EventEmitter call handlers with a fixed \`this\` you pass to on(ctx, event, handler)
- [ ] Write a wrapper that throws if a class method is detached
- [ ] Profile arrow-class-field vs prototype methods at 100k instances`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Five rules that determine \`this\`.
**Q2:** What does \`(function(){return this}).call(undefined)\` return in strict mode?
**Q3:** Write a class method bound via arrow field. From memory.

### Day 3 — Comprehension
**Q4:** Why is \`fetch(...).then(this.handle)\` a bug and how do you fix it?
**Q5:** A junior writes \`btn.onclick = obj.method\` and clicks crash with \`this is undefined\`. Diagnose.
**Q6:** Refactor with arrow class field:
\`\`\`js
class Comp {
  constructor() { this.handleClick = this.handleClick.bind(this); }
  handleClick() { console.log(this.state); }
}
\`\`\`

### Day 7 — Application
**Q7:** Implement bind(ctx) from scratch (don't use Function.prototype.bind).
**Q8:** A PR creates 50,000 React class instances with bound methods — memory soars. Why?
**Q9:** What's the cost of arrow class fields vs prototype methods?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain every way \`this\` can be undefined in modern code."
**Q11:** Draw: decision tree for \`this\` resolution at every call site.
**Q12:** ★ System design: "Architect a plugin system where third-party callbacks need access to the host context — what binding strategy?"`
  },

  // ── 9. callbacks ─────────────────────────────────────────────────────────
  'callbacks': {
    feynman: `## FEYNMAN CHECK

### Explain Callbacks Like I'm 10 Years Old
> A callback is a FUNCTION YOU PASS TO ANOTHER FUNCTION so it can call YOU back when something happens. Synchronous: \`[1,2,3].map(x => x*2)\` — map calls your callback immediately for each element. Asynchronous: \`setTimeout(fn, 1000)\` — the runtime invokes fn LATER. Node.js classically used "error-first callbacks" \`(err, result) => ...\` — every API took a callback whose FIRST arg was the error (or null). Before Promises this led to "callback hell" — deeply nested error handling, hard to compose. Modern code rarely writes raw callbacks for async — Promises and async/await are the answer. But callbacks are STILL EVERYWHERE for sync: array methods, event listeners, sort comparators.

---

### 5 Deep Conceptual Questions

**Q1: Why did the JS ecosystem move away from callbacks for async?**
> **A:** Three pains: (1) NESTING — chaining async ops produced "pyramid of doom" 6+ levels deep. (2) ERROR HANDLING — you had to check err in every callback; one forgotten check meant silent failures. (3) COMPOSITION — combining 5 concurrent operations required manual coordination (counter pattern). Promises (ES6) solved nesting via .then chains. async/await (ES2017) made async look synchronous. Today raw callbacks survive only for sync APIs and event listeners.

**Q2: Mental model for sync vs async callbacks?**
> **A:** SYNC callbacks run BEFORE the calling function returns: \`arr.forEach(cb)\` finishes cb on every element before forEach returns. ASYNC callbacks are SCHEDULED — pushed onto the macrotask or microtask queue, run later when the event loop pulls them. Always document which one your API uses — mixing the two ("Zalgo") is a famous anti-pattern that breaks invariants. Node.js's process.nextTick made fs.readFile callbacks deterministically async.

**Q3: Most dangerous misconception?**
> **A:** Errors in async callbacks bubble like sync errors:
> \`\`\`js
> // ❌ This try/catch does NOTHING — the throw is async
> try {
>   setTimeout(() => { throw new Error('boom'); }, 0);
> } catch (e) {
>   console.log('caught:', e.message);   // never runs
> }
> // The error becomes an "unhandledRejection" / "uncaughtException"
>
> // ✅ Catch inside the callback or use a Promise
> setTimeout(() => {
>   try { riskyOp(); } catch (e) { console.error(e); }
> }, 0);
> \`\`\`

**Q4: How do callbacks interact with the event loop?**
> **A:** When you call setTimeout(cb), the runtime asks the OS for a timer. When it fires, cb is pushed to the MACROTASK queue. The event loop picks the next macrotask when the call stack is empty AND all microtasks have drained. So \`setTimeout(cb, 0)\` is "run after the current sync code AND all queued promises." Promise .then callbacks go to the MICROTASK queue (drained between macrotasks) — that's why they always fire before any setTimeout.

**Q5: FAANG-grade definition?**
> **A:** "A callback is a function passed as an argument to another function, invoked synchronously by sync APIs (Array.map, sort) or asynchronously by I/O APIs (setTimeout, fs.readFile, event listeners) — historically the standard async pattern with error-first \`(err, result)\` conventions, largely superseded by Promises and async/await for chaining and error propagation, but retained for sync iteration, event handling, and library APIs that need fine-grained scheduling control."`,
    build: `## BUILD

### 🏗️ Mini Project: Convert Callback-Based File API To Promises

**What you will build:** Take a fake callback-style file system API (\`fs.readFile(path, cb)\`), wrap it in a Promise version using \`promisify\`, then use it with async/await — exactly how Node.js libraries migrated.
**Why this project:** Forces the historical pattern AND the modern migration in one project.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-callbacks && cd js-callbacks
npm init -y
npm install -D vitest
ni fakeFs.js, promisify.js, demo.js, callbacks.test.js -ItemType File
\`\`\`

#### Step 2 — Fake Callback-Style FS
\`\`\`js
// fakeFs.js — classic Node.js error-first callback API
const store = new Map();

export function writeFile(path, content, cb) {
  setTimeout(() => {
    try {
      if (typeof path !== 'string') return cb(new TypeError('path must be a string'));
      store.set(path, content);
      cb(null);
    } catch (e) {
      cb(e);
    }
  }, 10);
}

export function readFile(path, cb) {
  setTimeout(() => {
    if (!store.has(path)) return cb(new Error(\`ENOENT: \${path}\`));
    cb(null, store.get(path));
  }, 10);
}

export function deleteFile(path, cb) {
  setTimeout(() => {
    if (!store.delete(path)) return cb(new Error(\`ENOENT: \${path}\`));
    cb(null);
  }, 10);
}
\`\`\`

#### Step 3 — promisify (Like util.promisify)
\`\`\`js
// promisify.js
export function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn.call(this, ...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}
\`\`\`

#### Step 4 — Error Handling: Callback Hell vs Async/Await
\`\`\`js
// demo.js
import * as cbFs from './fakeFs.js';
import { promisify } from './promisify.js';

// ─── Old way: callback hell ────────────────────────
function oldWay() {
  cbFs.writeFile('a.txt', 'hello', (err) => {
    if (err) return console.error(err);
    cbFs.readFile('a.txt', (err, content) => {
      if (err) return console.error(err);
      cbFs.writeFile('b.txt', content.toUpperCase(), (err) => {
        if (err) return console.error(err);
        cbFs.deleteFile('a.txt', (err) => {
          if (err) return console.error(err);
          console.log('Old way: done');
        });
      });
    });
  });
}

// ─── New way: async/await ─────────────────────────
const writeFile  = promisify(cbFs.writeFile);
const readFile   = promisify(cbFs.readFile);
const deleteFile = promisify(cbFs.deleteFile);

async function newWay() {
  try {
    await writeFile('a.txt', 'hello');
    const content = await readFile('a.txt');
    await writeFile('b.txt', content.toUpperCase());
    await deleteFile('a.txt');
    console.log('New way: done');
  } catch (err) {
    console.error(err);
  }
}

oldWay();
newWay();
\`\`\`

#### Step 5 — Tests
\`\`\`js
// callbacks.test.js
import { describe, it, expect, vi } from 'vitest';
import * as fs from './fakeFs.js';
import { promisify } from './promisify.js';

describe('callback fs', () => {
  it('readFile returns content via callback', () => new Promise((done) => {
    fs.writeFile('t.txt', 'hi', () => {
      fs.readFile('t.txt', (err, c) => {
        expect(err).toBeNull();
        expect(c).toBe('hi');
        done();
      });
    });
  }));
  it('error-first: invalid path triggers err arg', () => new Promise((done) => {
    fs.writeFile(123, 'x', (err) => {
      expect(err).toBeInstanceOf(TypeError);
      done();
    });
  }));
});

describe('promisify', () => {
  it('converts error-first callback to resolved Promise', async () => {
    const readFile = promisify(fs.readFile);
    await promisify(fs.writeFile)('p.txt', 'ok');
    const v = await readFile('p.txt');
    expect(v).toBe('ok');
  });
  it('converts error to rejection', async () => {
    const readFile = promisify(fs.readFile);
    await expect(readFile('missing.txt')).rejects.toThrow(/ENOENT/);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Old way: done
New way: done

Tests:
✓ readFile returns content via callback
✓ error-first: invalid path triggers err arg
✓ promisify converts error-first callback to resolved Promise
✓ promisify converts error to rejection
\`\`\`

**Stretch Challenges:**
- [ ] Add a callbackify(asyncFn) that goes the other direction
- [ ] Add timeout/cancel to your promisified versions
- [ ] Implement an "always-async" guarantee using process.nextTick / queueMicrotask`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is the "error-first callback" convention?
**Q2:** Does \`Array.map(cb)\` invoke cb sync or async?
**Q3:** Write a setTimeout that logs 'hi' after 500ms. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`try { setTimeout(() => { throw new Error() }) } catch(e) {}\` not catch?
**Q5:** A junior writes "Zalgo" code — a function that calls cb sync sometimes and async other times. Why is this bad?
**Q6:** Refactor with promisify + async/await:
\`\`\`js
fs.readFile('a', (e, a) => {
  if (e) throw e;
  fs.readFile('b', (e, b) => {
    if (e) throw e;
    console.log(a + b);
  });
});
\`\`\`

### Day 7 — Application
**Q7:** Implement parallelCallback(fns, finalCb) — runs all fns in parallel, finalCb gets results array.
**Q8:** A PR adds a callback API to a new library — explain why you'd insist on Promise return instead.
**Q9:** What's the call-stack depth cost of deeply nested callbacks vs Promise chains?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain the differences between callbacks, Promises, async/await, and event-emitter patterns for async code."
**Q11:** Draw: callback queue vs microtask queue ordering for nested setTimeout + Promise.
**Q12:** ★ System design: "Migrate a 500-file callback-based legacy codebase to Promises — what tooling, what order, what risks?"`
  },

  // ── 10. spread-and-rest ──────────────────────────────────────────────────
  'spread-and-rest': {
    feynman: `## FEYNMAN CHECK

### Explain Spread & Rest Like I'm 10 Years Old
> Spread \`...x\` UNPACKS an iterable (array, string, Set, Map, NodeList, generator) into individual values. Rest \`...x\` PACKS multiple values into a single array. SAME syntax, OPPOSITE meaning depending on context. In a function CALL or array LITERAL: spread. In a function PARAMETER or destructuring TARGET: rest. \`Math.max(...[1,2,3])\` → spread (unpacks). \`function f(...args)\` → rest (collects). Spread for objects (\`{ ...obj }\`) appeared in ES2018 — copies own enumerable properties, used for immutable updates everywhere in Redux/React. The non-obvious detail: spread is SHALLOW — \`{...{a:{b:1}}}\` shares the inner object reference. Use structuredClone or libraries for deep copies.

---

### 5 Deep Conceptual Questions

**Q1: When did spread/rest become important to JavaScript code?**
> **A:** React + Redux popularised IMMUTABLE updates around 2015. The rule was "never mutate state directly" — but until spread, copying an array or object was verbose (Object.assign({}, prev, {x: 5})). Spread \`{...prev, x: 5}\` made it one line. Variadic functions also became cleaner: \`function logAll(...args)\` replaced the awkward \`arguments\` keyword (which arrows don't even have).

**Q2: Mental model for the syntax overload?**
> **A:** Look at the CONTEXT. If \`...x\` appears where VALUES go (call args, array literal, object literal), it SPREADS. If \`...x\` appears where BINDINGS go (function params, destructuring targets), it COLLECTS. \`[head, ...tail]\` = rest in destructuring (collect remaining). \`[...arr, ...other]\` = spread (unpack into new array). They never appear in the same role — context disambiguates.

**Q3: Most dangerous misconception?**
> **A:** Object spread does a DEEP copy:
> \`\`\`js
> // ❌ Shallow only — nested objects share references
> const original = { name: 'Ana', addr: { city: 'NYC' } };
> const copy = { ...original };
> copy.addr.city = 'LA';
> console.log(original.addr.city);   // 'LA' — mutation leaked!
>
> // ✅ For deep copy
> const deep = structuredClone(original);   // built-in since 2022
> // Or for plain JSON: JSON.parse(JSON.stringify(original))   — loses Date/Map/Set
> // Or use a library (lodash.cloneDeep) — handles cycles + special types
> \`\`\`

**Q4: How does spread interact with Symbol.iterator?**
> **A:** Array spread \`[...x]\` calls x[Symbol.iterator]() — works for any iterable (string → array of chars, Set → array of values, Map → array of [k,v] tuples, generators, NodeLists, TypedArrays). \`{...x}\` does NOT use Symbol.iterator — it copies OWN ENUMERABLE PROPERTIES (string-keyed, not Symbol-keyed). This means \`{...new Map([['a',1]])}\` gives \`{}\` (Map's entries aren't enumerable props), while \`[...new Map(...)]\` gives the tuple array.

**Q5: FAANG-grade definition?**
> **A:** "Spread (\`...\`) syntax unpacks iterables into individual values within array literals, object literals, and function call arguments; rest (\`...\`) syntax collects remaining values into a real array within function parameters and destructuring patterns — both providing the syntactic foundation for immutable update patterns, variadic functions, and array/object copying — with object spread copying own enumerable string-keyed properties shallowly, mandating structuredClone or libraries for deep copies."`,
    build: `## BUILD

### 🏗️ Mini Project: Immutable State Updater Library (Redux-Style)

**What you will build:** A tiny library with helpers \`update(state, path, value)\`, \`merge(state, partial)\`, \`removeAt(arr, index)\`, \`insertAt(arr, index, value)\` — all using spread/rest, never mutating.
**Why this project:** Forces every spread/rest pattern that powers React + Redux + Immer.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-spread && cd js-spread
npm init -y
npm install -D vitest
ni immutable.js, immutable.test.js -ItemType File
\`\`\`

#### Step 2 — Immutable Helpers
\`\`\`js
// immutable.js

// Shallow merge — { ...state, ...patch }
export const merge = (state, patch) => ({ ...state, ...patch });

// Insert at index — never mutates
export const insertAt = (arr, index, ...items) =>
  [...arr.slice(0, index), ...items, ...arr.slice(index)];

// Remove at index — never mutates
export const removeAt = (arr, index) =>
  [...arr.slice(0, index), ...arr.slice(index + 1)];

// Update item at index — never mutates
export const updateAt = (arr, index, updater) =>
  arr.map((item, i) => (i === index ? updater(item) : item));

// Deep set at a path — never mutates
export function setIn(obj, path, value) {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const current = obj?.[head] ?? (typeof path[1] === 'number' ? [] : {});
  return Array.isArray(obj)
    ? [...obj.slice(0, head), setIn(current, rest, value), ...obj.slice(head + 1)]
    : { ...obj, [head]: setIn(current, rest, value) };
}
\`\`\`

#### Step 3 — Use Them For State Updates
\`\`\`js
// demo.js
import { merge, insertAt, removeAt, updateAt, setIn } from './immutable.js';

const state = {
  user: { name: 'Ana', age: 30 },
  todos: [
    { id: 1, text: 'Buy milk',    done: false },
    { id: 2, text: 'Write tests', done: false },
  ],
};

// Merge a partial update
const s1 = merge(state, { theme: 'dark' });

// Insert a new todo
const s2 = setIn(s1, ['todos'], insertAt(s1.todos, 1, { id: 3, text: 'Refactor', done: false }));

// Toggle a todo done flag
const s3 = setIn(s2, ['todos', 0, 'done'], true);

// Remove a todo
const s4 = setIn(s3, ['todos'], removeAt(s3.todos, 2));

// Update age
const s5 = setIn(s4, ['user', 'age'], 31);

console.log('original:', state);
console.log('updated:', s5);
console.log('originals untouched:', state.user.age === 30, state.todos.length === 2);
\`\`\`

#### Step 4 — Error Handling: Variadic Args + Rest in Destructuring
\`\`\`js
// Rest in function params — collects extra args
export function logger(level, ...messages) {
  console.log(\`[\${level}]\`, ...messages);   // spread back out into call
}
logger('INFO', 'hello', 'world', { x: 1 });

// Rest in destructuring — collects "everything else"
const { name, ...withoutName } = { name: 'Ana', age: 30, role: 'admin' };
console.log('without name:', withoutName);   // { age: 30, role: 'admin' }

const [first, second, ...tail] = [10, 20, 30, 40, 50];
console.log('tail:', tail);   // [30, 40, 50]

// Combine: object spread + rest
const { _internal, ...publicShape } = { _internal: 'secret', name: 'Ana', email: 'a@b.io' };
\`\`\`

#### Step 5 — Tests
\`\`\`js
// immutable.test.js
import { describe, it, expect } from 'vitest';
import { merge, insertAt, removeAt, updateAt, setIn } from './immutable.js';

describe('immutable helpers', () => {
  it('merge does not mutate original', () => {
    const a = { x: 1 };
    const b = merge(a, { y: 2 });
    expect(b).toEqual({ x: 1, y: 2 });
    expect(a).toEqual({ x: 1 });
  });
  it('insertAt creates new array', () => {
    const a = [1, 2, 3];
    const b = insertAt(a, 1, 99);
    expect(b).toEqual([1, 99, 2, 3]);
    expect(a).toEqual([1, 2, 3]);
  });
  it('removeAt creates new array', () => {
    const a = [1, 2, 3];
    expect(removeAt(a, 1)).toEqual([1, 3]);
    expect(a).toEqual([1, 2, 3]);
  });
  it('updateAt only changes the targeted index', () => {
    const a = [1, 2, 3];
    const b = updateAt(a, 1, (n) => n * 10);
    expect(b).toEqual([1, 20, 3]);
    expect(b[0] === a[0]).toBe(true);   // unchanged refs preserved (cheap re-renders)
  });
  it('setIn updates nested path immutably', () => {
    const s = { user: { addr: { city: 'NYC' } } };
    const s2 = setIn(s, ['user', 'addr', 'city'], 'LA');
    expect(s2.user.addr.city).toBe('LA');
    expect(s.user.addr.city).toBe('NYC');   // unchanged
    expect(s2.user.addr === s.user.addr).toBe(false);   // new ref at each level
  });
});
\`\`\`

**Expected Output:**
\`\`\`
original: { user: { name: 'Ana', age: 30 }, todos: [...2 items] }
updated:  { user: { name: 'Ana', age: 31 }, theme: 'dark', todos: [...2 items] }
originals untouched: true true

# 5/5 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add structural sharing tracking — count how many references are reused
- [ ] Benchmark against Immer for the same updates
- [ ] Add removeIn(obj, path) symmetric to setIn`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does \`...\` mean in different positions?
**Q2:** Is object spread shallow or deep?
**Q3:** Write a function that takes a function and any args, calls it, and logs. Use rest + spread. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`{...new Map([['a',1]])}\` return \`{}\`?
**Q5:** A junior writes \`const copy = { ...state }; copy.list.push(x)\` — explain the bug.
**Q6:** Refactor for immutability:
\`\`\`js
state.users[0].age = 31;
state.users.push(newUser);
\`\`\`

### Day 7 — Application
**Q7:** Build an updateIn(obj, path, updater) using only spread + recursion.
**Q8:** A PR uses Object.assign({}, ...partials) — refactor with spread and explain the difference.
**Q9:** What's the cost of deep updates with spread vs Immer (proxy-based)?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Implement Redux's combineReducers using rest + spread."
**Q11:** Draw: structural sharing in an immutable tree update (which nodes change, which don't).
**Q12:** ★ System design: "Architect immutable state management for a complex form with 200 fields and undo/redo. Spread vs Immer vs Immutable.js."`
  },

  // ── 11. objects-in-js ────────────────────────────────────────────────────
  'objects-in-js': {
    feynman: `## FEYNMAN CHECK

### Explain JS Objects Like I'm 10 Years Old
> A JS object is a DICTIONARY — a collection of key-value pairs. Keys are STRINGS (or Symbols); values can be anything. Three creation patterns: literal \`{a:1}\`, \`Object.create(proto)\` (with custom prototype), and constructor calls \`new Thing()\`. Every object has a hidden \`[[Prototype]]\` link (accessed via \`Object.getPrototypeOf\` or the deprecated \`__proto__\`) that points to another object — this is how method lookup works. The non-obvious power: property DESCRIPTORS. Every property has metadata: \`writable\`, \`enumerable\`, \`configurable\`, plus optional \`get\`/\`set\` accessors. \`Object.defineProperty(obj, 'x', { value: 1, writable: false })\` creates a read-only x. V8 optimises objects using HIDDEN CLASSES — adding properties in a CONSISTENT ORDER reuses the same hidden class (fast); inconsistent shape forces megamorphic dispatch (slow).

---

### 5 Deep Conceptual Questions

**Q1: When do you choose plain object vs Map vs Set?**
> **A:** Plain object \`{}\` for STRUCTURED records with KNOWN string keys (configs, DTOs, JSON). Map for arbitrary keys (incl. object keys), key insertion order preservation, frequent add/delete, and large key spaces. Set for uniqueness checks (\`set.has(x)\` is O(1)). Object property access is faster on tiny known-shape objects (V8 inline cache); Map is faster as the collection grows or keys are dynamic. Records & Tuples (TC39 stage 2) will provide deeply-immutable structural-equality alternatives someday.

**Q2: Mental model for property lookup?**
> **A:** When you read \`obj.x\`, the engine: (1) Checks obj's own properties (hash + hidden class). (2) If absent, walks the [[Prototype]] chain — checking each ancestor's own properties. (3) Returns undefined if not found anywhere. Writing \`obj.x = 5\` ALWAYS creates an own property on obj (it doesn't walk the chain to find where to write — except for accessors). This is why \`Array.prototype.push = ...\` adds push to ALL arrays.

**Q3: Most dangerous misconception?**
> **A:** Objects compared by \`===\` check value equality:
> \`\`\`js
> // ❌ Object equality is by REFERENCE, not contents
> { x: 1 } === { x: 1 }    // false — different objects
> [1, 2] === [1, 2]        // false
>
> // ✅ Deep equality requires explicit comparison
> JSON.stringify(a) === JSON.stringify(b)  // works for plain JSON, breaks on Date/Map/Set/cycles
> // Or use lodash isEqual, or write your own:
> function deepEq(a, b) {
>   if (a === b) return true;
>   if (typeof a !== 'object' || a === null) return false;
>   const keys = Object.keys(a);
>   if (keys.length !== Object.keys(b).length) return false;
>   return keys.every(k => deepEq(a[k], b[k]));
> }
> \`\`\`

**Q4: How do V8 hidden classes work?**
> **A:** When you create \`{a:1}\`, V8 assigns it Hidden Class C0. When you add b: \`obj.b=2\`, V8 creates Hidden Class C1 = C0 + b. Every object created the SAME WAY (same property order) shares the same hidden class. Property access compiles to "load from offset N" — blazing fast. Adding properties in DIFFERENT order (e.g. some objects get a-then-b, others b-then-a) creates DIFFERENT hidden classes — the inline cache becomes polymorphic, then megamorphic, 10-100× slower. Lesson: initialise all properties in the constructor in the same order.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript objects are mutable dictionaries of string-keyed (and symbol-keyed) properties, each with descriptor metadata (value/getter/setter, writable, enumerable, configurable), linked via the [[Prototype]] chain to a single prototype object for method inheritance — created via literals, Object.create, constructor invocations, or class instantiation — and optimised by V8's hidden classes when property shape is initialised consistently across instances."`,
    build: `## BUILD

### 🏗️ Mini Project: Observable Object With Getters, Setters, and Property Descriptors

**What you will build:** A reactive object proxy-free clone where assigning to a property automatically notifies subscribers — using only Object.defineProperty and getters/setters, no Proxy.
**Why this project:** Forces deep understanding of property descriptors and accessor properties.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-objects && cd js-objects
npm init -y && npm install -D vitest
ni reactive.js, reactive.test.js -ItemType File
\`\`\`

#### Step 2 — Reactive Object
\`\`\`js
// reactive.js
export function reactive(initial) {
  const data = { ...initial };
  const subscribers = new Map();   // key -> Set<callback>
  const target = {};

  for (const key of Object.keys(initial)) {
    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: false,
      get() { return data[key]; },
      set(newValue) {
        if (data[key] === newValue) return;        // no-op on same value
        const oldValue = data[key];
        data[key] = newValue;
        for (const cb of subscribers.get(key) ?? []) cb(newValue, oldValue);
      },
    });
  }

  target.$on = (key, cb) => {
    if (!subscribers.has(key)) subscribers.set(key, new Set());
    subscribers.get(key).add(cb);
    return () => subscribers.get(key).delete(cb);
  };

  return target;
}
\`\`\`

#### Step 3 — Use The Reactive Object
\`\`\`js
// demo.js
import { reactive } from './reactive.js';

const state = reactive({ count: 0, name: 'Ana' });

state.$on('count', (n, old) => console.log(\`count: \${old} → \${n}\`));
state.$on('name',  (n, old) => console.log(\`name: \${old} → \${n}\`));

state.count = 1;       // logs: count: 0 → 1
state.count = 1;       // no log (no change)
state.count++;         // logs: count: 1 → 2
state.name = 'Bob';    // logs: name: Ana → Bob

// Property descriptor introspection
console.log(Object.getOwnPropertyDescriptor(state, 'count'));
// { get, set, enumerable: true, configurable: false }

// Cannot delete
try { delete state.count; } catch (e) { console.log('delete failed:', e.message); }
\`\`\`

#### Step 4 — Error Handling: Computed Properties + Symbol Keys
\`\`\`js
// Computed property names — key from variable
const key = 'dynamic_' + Date.now();
const obj = { [key]: 'value' };

// Symbol keys — invisible to JSON, Object.keys, for...in
const SECRET = Symbol('secret');
const user = { name: 'Ana', [SECRET]: 'hidden-token' };
console.log(Object.keys(user));               // ['name']  — SECRET hidden
console.log(JSON.stringify(user));            // {"name":"Ana"}  — SECRET stripped
console.log(Object.getOwnPropertySymbols(user)); // [Symbol(secret)] — explicit lookup
console.log(user[SECRET]);                    // 'hidden-token' if you have the symbol
\`\`\`

#### Step 5 — Tests
\`\`\`js
// reactive.test.js
import { describe, it, expect, vi } from 'vitest';
import { reactive } from './reactive.js';

describe('reactive', () => {
  it('fires subscriber on change', () => {
    const s = reactive({ x: 0 });
    const spy = vi.fn();
    s.$on('x', spy);
    s.x = 5;
    expect(spy).toHaveBeenCalledWith(5, 0);
  });
  it('does not fire on same value', () => {
    const s = reactive({ x: 1 });
    const spy = vi.fn();
    s.$on('x', spy);
    s.x = 1;
    expect(spy).not.toHaveBeenCalled();
  });
  it('disposer removes subscriber', () => {
    const s = reactive({ x: 0 });
    const spy = vi.fn();
    const off = s.$on('x', spy);
    off();
    s.x = 1;
    expect(spy).not.toHaveBeenCalled();
  });
  it('properties are not configurable', () => {
    const s = reactive({ x: 0 });
    expect(() => Object.defineProperty(s, 'x', { value: 99 })).toThrow();
  });
});
\`\`\`

**Expected Output:**
\`\`\`
count: 0 → 1
count: 1 → 2
name: Ana → Bob
{ get: [Function], set: [Function], enumerable: true, configurable: false }
delete failed: Cannot delete property 'count' of #<Object>

# 4/4 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Rewrite using Proxy — easier syntax for arbitrary keys
- [ ] Add nested reactivity (changes inside obj.user.name fire)
- [ ] Add computed properties: derived values that auto-update`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Three ways to create an object.
**Q2:** What does \`Object.getOwnPropertyDescriptor\` return?
**Q3:** Write a one-liner that creates an object with a getter and a setter. From memory.

### Day 3 — Comprehension
**Q4:** Why do \`{x:1} === {x:1}\` return false?
**Q5:** A junior writes objects in inconsistent property order across instances — V8 perf tanks. Diagnose.
**Q6:** Refactor to read-only fields:
\`\`\`js
class Config { constructor(opts) { Object.assign(this, opts); } }
const c = new Config({ url: '/api' });
c.url = '/hacker';   // should not be allowed
\`\`\`

### Day 7 — Application
**Q7:** Build a freezeDeep(obj) that recursively freezes nested objects.
**Q8:** A PR uses an object as a Map (\`map['key'] = val\`) — what bugs does it cause?
**Q9:** Object vs Map lookup performance — when does Map win?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through V8's hidden classes and inline caches."
**Q11:** Draw: prototype chain for \`Array → Array.prototype → Object.prototype → null\`.
**Q12:** ★ System design: "Design a config-merging system across 5 sources where every property is typed and frozen on read."`
  },

  // ── 12. arrays-in-js ─────────────────────────────────────────────────────
  'arrays-in-js': {
    feynman: `## FEYNMAN CHECK

### Explain JS Arrays Like I'm 10 Years Old
> JS arrays are special OBJECTS where the keys are numeric strings ('0', '1', '2') and there's a magic \`length\` property. They are NOT typed (unlike C arrays); a single array can hold numbers, strings, objects, functions mixed. The 30+ array methods divide into two camps: MUTATING (\`push\`, \`pop\`, \`splice\`, \`sort\`, \`reverse\`) and NON-MUTATING (\`map\`, \`filter\`, \`reduce\`, \`slice\`, \`concat\`, \`flatMap\`, the new \`toSorted\`, \`toReversed\`, \`toSpliced\`, \`with\`). Modern functional code prefers non-mutating. The non-obvious detail: \`arr.sort()\` is in-place AND defaults to LEXICOGRAPHIC string comparison — so \`[10,1,2].sort()\` returns \`[1,10,2]\` (sorted as strings). Always pass a comparator: \`arr.sort((a,b) => a - b)\`.

---

### 5 Deep Conceptual Questions

**Q1: When do you choose forEach vs for vs for-of vs map/filter/reduce?**
> **A:** Use \`map/filter/reduce\` when TRANSFORMING data into new arrays (declarative, composable). Use \`for-of\` when iterating with side effects or needing \`break\`/\`continue\`/early return. Use classic \`for (let i = 0; ...)\` only when you need the index AND mutating the array AND it's a perf-critical hot loop. \`forEach\` is rarely the right choice — it's the worst of both worlds (no return value, no break, harder to reason about than map/for-of).

**Q2: Mental model for reduce?**
> **A:** Reduce is a FOLD — it walks the array maintaining an ACCUMULATOR, applying a binary op to (acc, currentItem) → newAcc. Initial value matters: \`reduce((a,b) => a+b)\` on \`[]\` throws; \`reduce((a,b) => a+b, 0)\` returns 0. Almost every other array method can be implemented via reduce — map, filter, find, even forEach. But explicit map/filter is usually clearer; reach for reduce when reducing to a single value or grouping (groupBy implementations).

**Q3: Most dangerous misconception?**
> **A:** Mutating methods return the array (so chaining isn't always safe):
> \`\`\`js
> // ❌ sort() MUTATES the original AND returns it
> const arr = [3, 1, 2];
> const sorted = arr.sort();
> arr.push(99);
> console.log(sorted);   // [1, 2, 3, 99]  — sorted is the SAME array as arr!
>
> // ✅ Use toSorted (ES2023) or copy first
> const arr = [3, 1, 2];
> const sorted = arr.toSorted();          // new array
> // Or: const sorted = [...arr].sort();
> \`\`\`

**Q4: How do array holes interact with array methods?**
> **A:** Arrays can have HOLES: \`const a = [1, , 3]\` (notice the missing middle). Some methods SKIP holes (map, filter, forEach, reduce); others FILL them with undefined (Array.from, spread); others treat holes as undefined (find, includes). \`[1, , 3].map(x => x*2)\` gives \`[2, <empty>, 6]\` (hole preserved). Sparse arrays are a footgun — prefer dense arrays or use \`Array(n).fill(undefined)\`.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript arrays are dense or sparse heterogeneous indexed collections — special objects with a numeric-string key space and an auto-managed length property — supporting both mutating in-place operations (push, pop, sort, splice, reverse) and non-mutating transformations (map, filter, reduce, slice, concat, flatMap), augmented in ES2023 by toSorted/toReversed/toSpliced/with for immutable variants — backed by V8's PACKED_SMI / PACKED / HOLEY internal element-kinds for performance."`,
    build: `## BUILD

### 🏗️ Mini Project: Implement Map / Filter / Reduce From Scratch

**What you will build:** Polyfill the three core functional array methods using only for-loops, then build groupBy and partition on top of them — exactly how Lodash works internally.
**Why this project:** Forces understanding of the iteration protocol and the building blocks of functional JS.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-arrays && cd js-arrays
npm init -y && npm install -D vitest
ni functional.js, functional.test.js -ItemType File
\`\`\`

#### Step 2 — Polyfill Implementations
\`\`\`js
// functional.js
export function map(arr, fn) {
  const out = new Array(arr.length);   // pre-allocate for perf
  for (let i = 0; i < arr.length; i++) {
    if (i in arr) out[i] = fn(arr[i], i, arr);   // 'in' check respects holes
  }
  return out;
}

export function filter(arr, predicate) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    if (i in arr && predicate(arr[i], i, arr)) out.push(arr[i]);
  }
  return out;
}

export function reduce(arr, reducer, initial) {
  let acc = initial;
  let start = 0;
  if (arguments.length < 3) {
    if (arr.length === 0) throw new TypeError('Reduce of empty array with no initial value');
    acc = arr[0];
    start = 1;
  }
  for (let i = start; i < arr.length; i++) {
    if (i in arr) acc = reducer(acc, arr[i], i, arr);
  }
  return acc;
}
\`\`\`

#### Step 3 — Build groupBy and partition On Top
\`\`\`js
// higher.js
import { reduce } from './functional.js';

// groupBy(arr, keyFn) -> { key: [items] }
export function groupBy(arr, keyFn) {
  return reduce(arr, (acc, item) => {
    const key = keyFn(item);
    (acc[key] ??= []).push(item);
    return acc;
  }, {});
}

// partition(arr, predicate) -> [matching, nonMatching]
export function partition(arr, predicate) {
  return reduce(arr, (acc, item) => {
    acc[predicate(item) ? 0 : 1].push(item);
    return acc;
  }, [[], []]);
}

// Demo
const users = [
  { name: 'Ana',  role: 'admin', age: 30 },
  { name: 'Bob',  role: 'user',  age: 25 },
  { name: 'Eve',  role: 'admin', age: 35 },
  { name: 'Tom',  role: 'user',  age: 40 },
];

console.log(groupBy(users, u => u.role));
// { admin: [Ana, Eve], user: [Bob, Tom] }

const [adults, minors] = partition(users, u => u.age >= 30);
console.log('adults:', adults.length, 'minors:', minors.length);
\`\`\`

#### Step 4 — Error Handling: Empty Array + Holes
\`\`\`js
// Edge cases
import { reduce, map, filter } from './functional.js';

try { reduce([], (a, b) => a + b); } catch (e) { console.log('OK:', e.message); }
console.log(reduce([], (a, b) => a + b, 0));   // 0

// Holes preserved
const sparse = [1, , 3];
console.log(map(sparse, x => x * 2));      // [2, <empty>, 6]
console.log(filter(sparse, x => x));        // [1, 3] — skips hole
\`\`\`

#### Step 5 — Tests
\`\`\`js
// functional.test.js
import { describe, it, expect } from 'vitest';
import { map, filter, reduce } from './functional.js';
import { groupBy, partition } from './higher.js';

describe('functional helpers', () => {
  it('map transforms each element', () => {
    expect(map([1, 2, 3], x => x * 2)).toEqual([2, 4, 6]);
  });
  it('filter keeps matching', () => {
    expect(filter([1, 2, 3, 4], x => x % 2 === 0)).toEqual([2, 4]);
  });
  it('reduce sums with initial value', () => {
    expect(reduce([1, 2, 3, 4], (a, b) => a + b, 0)).toBe(10);
  });
  it('reduce throws on empty without initial', () => {
    expect(() => reduce([], (a, b) => a + b)).toThrow();
  });
});

describe('groupBy', () => {
  it('groups by key function', () => {
    const r = groupBy([{ k: 'a', v: 1 }, { k: 'b', v: 2 }, { k: 'a', v: 3 }], x => x.k);
    expect(r.a).toHaveLength(2);
    expect(r.b).toHaveLength(1);
  });
});

describe('partition', () => {
  it('splits into matching and non-matching', () => {
    const [evens, odds] = partition([1, 2, 3, 4], n => n % 2 === 0);
    expect(evens).toEqual([2, 4]);
    expect(odds).toEqual([1, 3]);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
{ admin: [...2 items], user: [...2 items] }
adults: 3 minors: 1
OK: Reduce of empty array with no initial value
0
[ 2, <1 empty item>, 6 ]
[ 1, 3 ]

# 7/7 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Implement chunked(arr, size) using reduce
- [ ] Add unique(arr, keyFn) preserving order
- [ ] Profile your map vs native map on 1M elements — measure the gap`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Mutating vs non-mutating array methods — name 3 of each.
**Q2:** Default sort behaviour on \`[10, 1, 2]\`?
**Q3:** Write \`unique(arr)\` using Set in one line. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`reduce(arr, fn)\` throw on empty arrays?
**Q5:** A junior writes \`arr.sort()\` to sort numbers — Tom gets \`[10, 1, 2]\`. Diagnose.
**Q6:** Refactor for immutability:
\`\`\`js
const top3 = scores.sort((a,b) => b-a).slice(0, 3);
\`\`\`

### Day 7 — Application
**Q7:** Implement \`flatten(arr, depth)\` recursively.
**Q8:** A PR uses \`Array(1000).fill({})\` — explain the shared-reference bug.
**Q9:** What's the cost of map+filter+reduce chain vs a single for-loop?

### Day 14 — Synthesis
**Q10:** ★ Interview: "When would you use the new ES2023 toSorted/toReversed/with vs the mutating versions?"
**Q11:** Draw: how V8's element kinds (PACKED_SMI → PACKED → HOLEY) transition based on operations.
**Q12:** ★ System design: "Pipeline 10M records through 5 transformations — pick between for-loops, array chains, generators, and streams."`
  },

  // ── 13. classes-in-js ────────────────────────────────────────────────────
  'classes-in-js': {
    feynman: `## FEYNMAN CHECK

### Explain JS Classes Like I'm 10 Years Old
> JS classes (ES2015) are SYNTACTIC SUGAR over the prototype system. \`class Dog extends Animal {}\` compiles to a constructor function + prototype linkage. Modern classes have: constructor, instance fields, static fields/methods, getters/setters, true private fields (\`#name\`, ES2022 — actually private, not just convention), and inheritance via \`extends\` + \`super\`. The non-obvious detail: classes are NOT hoisted (unlike function declarations) — accessing before the class statement throws ReferenceError (TDZ). \`class X {}\` always runs in strict mode regardless of file-level setting. And methods defined in the class body are NON-ENUMERABLE — they don't show up in \`for...in\` loops or \`Object.keys\`.

---

### 5 Deep Conceptual Questions

**Q1: When do you choose class vs factory function vs plain object?**
> **A:** Use CLASS when you have STATEFUL OBJECTS with shared methods, hierarchy via extends, or framework requirements (Web Components, Spring). Use FACTORY function when you want true privacy via closures, easier composition over inheritance, no \`this\` confusion. Use PLAIN OBJECTS when no methods needed. Modern React/Vue compose state via hooks/refs instead of classes; backend Node.js still uses classes heavily (ORMs, services).

**Q2: Mental model for super and extends?**
> **A:** \`class Cat extends Animal\` makes \`Cat.prototype\` inherit from \`Animal.prototype\` (instance methods), and \`Cat\` itself inherit from \`Animal\` (static methods). \`super()\` in the constructor calls Animal's constructor and BINDS \`this\`. You cannot use \`this\` before \`super()\`. \`super.method()\` in an instance method calls the parent's version. \`super.staticMethod()\` in a static method calls the parent's static.

**Q3: Most dangerous misconception?**
> **A:** Class methods are bound to instances:
> \`\`\`js
> // ❌ Method loses this when detached
> class Counter {
>   count = 0;
>   inc() { this.count++; }    // prototype method — this NOT bound
> }
> const c = new Counter();
> const ref = c.inc;
> ref();   // TypeError: Cannot read 'count' of undefined
>
> // ✅ Arrow class field is bound at construction
> class CounterBound {
>   count = 0;
>   inc = () => { this.count++; }   // arrow field — per-instance, bound
> }
> // Trade-off: arrow fields use more memory (one function per instance vs shared prototype)
> \`\`\`

**Q4: How do true private fields differ from underscore convention?**
> **A:** \`_name\` is just a CONVENTION — anyone can read \`obj._name\`. \`#name\` (ES2022) is a HARD private field — accessing \`obj.#name\` from outside the class throws SyntaxError at parse time. Private fields exist in a separate WeakMap-like slot per instance, invisible to JSON, reflection, console.log, Proxy traps. Subclasses cannot access parent's privates. Use # for security/encapsulation that MATTERS; _ remains acceptable for "internal but introspectable".

**Q5: FAANG-grade definition?**
> **A:** "JavaScript classes are syntactic sugar over prototype-based inheritance — desugaring into a constructor function plus prototype methods — featuring instance fields, static fields/methods, getters/setters, hard private fields (#) with per-instance hidden slots, extends-based prototype chaining with super for parent invocation, and strict-mode-by-default semantics — distinct from class-based languages by lacking interfaces, traits, abstract enforcement, or method overloading at the language level."`,
    build: `## BUILD

### 🏗️ Mini Project: User Class With Private Fields, Static Factory, Getters, And Inheritance

**What you will build:** A complete User class with hard-private password storage, static "fromJSON" factory, computed display-name getter, and an AdminUser subclass with extra capabilities.
**Why this project:** Forces every modern class feature (private #, static, getters, extends, super, instanceof).
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-classes && cd js-classes
npm init -y && npm install -D vitest
ni user.js, user.test.js -ItemType File
\`\`\`

#### Step 2 — Base User Class
\`\`\`js
// user.js
export class User {
  // True private fields (#)
  #passwordHash;
  #createdAt;

  // Public instance fields
  id;
  email;
  name;

  constructor({ id, email, name, passwordHash }) {
    if (!email.includes('@')) throw new TypeError('Invalid email');
    this.id    = id;
    this.email = email;
    this.name  = name;
    this.#passwordHash = passwordHash;
    this.#createdAt    = new Date();
  }

  // Computed accessor
  get displayName() { return this.name || this.email.split('@')[0]; }

  get createdAt() { return this.#createdAt; }   // controlled exposure

  verifyPassword(plain) {
    return hash(plain) === this.#passwordHash;
  }

  toJSON() {
    // Notice: #passwordHash and #createdAt are NOT serialised — security
    return { id: this.id, email: this.email, name: this.name };
  }

  static fromJSON(json) {
    return new User({ ...JSON.parse(json), passwordHash: hash('default') });
  }
}

function hash(s) { return 'sha256$' + s.split('').reverse().join(''); }
\`\`\`

#### Step 3 — Subclass With extends + super
\`\`\`js
// admin.js
import { User } from './user.js';

export class AdminUser extends User {
  #permissions;

  constructor(opts) {
    super(opts);   // must come before any 'this' access
    this.#permissions = new Set(opts.permissions ?? ['read']);
  }

  hasPermission(perm) { return this.#permissions.has(perm); }
  grant(perm)         { this.#permissions.add(perm); }
  revoke(perm)        { this.#permissions.delete(perm); }

  // Override + extend parent
  toJSON() {
    return { ...super.toJSON(), permissions: [...this.#permissions] };
  }

  // Static factory using parent's parsing
  static promote(user, perms = ['read', 'write']) {
    return new AdminUser({
      id: user.id, email: user.email, name: user.name,
      passwordHash: 'preserved',
      permissions: perms,
    });
  }
}
\`\`\`

#### Step 4 — Error Handling: Private Field Access + instanceof
\`\`\`js
// demo.js
import { User } from './user.js';
import { AdminUser } from './admin.js';

const u = new User({ id: 1, email: 'ana@dev.io', name: 'Ana', passwordHash: 'x' });
console.log(u.displayName);          // 'Ana'
console.log(u.verifyPassword('y'));   // false

const a = AdminUser.promote(u, ['read', 'write', 'delete']);
console.log(a.hasPermission('delete'));   // true
console.log(JSON.stringify(a));            // includes permissions, NOT private fields

console.log(a instanceof AdminUser);   // true
console.log(a instanceof User);         // true (chain)

// ❌ Private fields cannot be accessed from outside
try { console.log(u.#passwordHash); } catch (e) { console.log('hidden!'); }
// Actually: SyntaxError at parse time — you can't even write that line

// ❌ Cannot use this before super()
class Bad extends User { constructor(o) { /* this.x = 1; */ super(o); } }
\`\`\`

#### Step 5 — Tests
\`\`\`js
// user.test.js
import { describe, it, expect } from 'vitest';
import { User } from './user.js';
import { AdminUser } from './admin.js';

describe('User', () => {
  it('rejects invalid email', () => {
    expect(() => new User({ id: 1, email: 'noatsign', name: 'X', passwordHash: 'x' })).toThrow();
  });
  it('toJSON does not leak private fields', () => {
    const u = new User({ id: 1, email: 'a@b.io', name: 'X', passwordHash: 'secret' });
    const json = JSON.stringify(u);
    expect(json).not.toContain('passwordHash');
    expect(json).not.toContain('secret');
  });
  it('displayName uses email when name is empty', () => {
    const u = new User({ id: 1, email: 'ana@dev.io', name: '', passwordHash: 'x' });
    expect(u.displayName).toBe('ana');
  });
});

describe('AdminUser', () => {
  it('extends User (instanceof chain)', () => {
    const a = new AdminUser({ id: 1, email: 'a@b.io', name: 'A', passwordHash: 'x' });
    expect(a).toBeInstanceOf(User);
    expect(a).toBeInstanceOf(AdminUser);
  });
  it('grant/revoke updates permissions', () => {
    const a = new AdminUser({ id: 1, email: 'a@b.io', name: 'A', passwordHash: 'x' });
    a.grant('write');
    expect(a.hasPermission('write')).toBe(true);
    a.revoke('write');
    expect(a.hasPermission('write')).toBe(false);
  });
  it('overridden toJSON includes permissions', () => {
    const a = new AdminUser({ id: 1, email: 'a@b.io', name: 'A', passwordHash: 'x', permissions: ['read'] });
    expect(JSON.parse(JSON.stringify(a)).permissions).toEqual(['read']);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Ana
false
true
{"id":1,"email":"ana@dev.io","name":"Ana","permissions":["read","write","delete"]}
true
true
hidden!

# 6/6 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add a Mixin pattern for sharing capabilities across unrelated classes
- [ ] Add an abstract Repository base class that throws if save() isn't overridden
- [ ] Profile prototype method vs arrow class field at 100k instances`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between \`#field\` and \`_field\`?
**Q2:** Can a class use \`this\` before \`super()\` in the constructor?
**Q3:** Write a class with a static factory method. From memory.

### Day 3 — Comprehension
**Q4:** Why are class methods non-enumerable?
**Q5:** A junior assigns \`this.inc = this.inc.bind(this)\` in every constructor — show the cleaner alternative.
**Q6:** Refactor to use private fields:
\`\`\`js
class Wallet {
  constructor(amt) { this._balance = amt; }
  get balance() { return this._balance; }
}
\`\`\`

### Day 7 — Application
**Q7:** Build an abstract Repository<T> base class with abstract save() that throws if not overridden.
**Q8:** A PR uses inheritance 5 levels deep — explain why composition is usually better.
**Q9:** Cost of arrow class fields vs prototype methods at scale?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how \`class X extends Y\` compiles to prototype-chain code under the hood."
**Q11:** Draw: prototype chain for an AdminUser instance (instance → AdminUser.prototype → User.prototype → Object.prototype → null).
**Q12:** ★ System design: "Choose class vs hook-based composition for a state library — when does each win?"`
  },

  // ── 14. prototype-chain ──────────────────────────────────────────────────
  'prototype-chain': {
    feynman: `## FEYNMAN CHECK

### Explain Prototype Chain Like I'm 10 Years Old
> Every JS object has a hidden link \`[[Prototype]]\` to ANOTHER object — its prototype. When you access \`obj.foo\`, the engine first checks obj's OWN properties. If missing, it checks \`Object.getPrototypeOf(obj).foo\`. If still missing, it walks UP the chain until it reaches \`null\`. This is JavaScript's INHERITANCE mechanism — older than classes, more flexible, still underneath every class. Built-ins: \`[1,2,3]\` → Array.prototype → Object.prototype → null. \`"hello"\` → String.prototype → Object.prototype → null. \`class Cat extends Animal\` just sets \`Cat.prototype.__proto__ = Animal.prototype\`. The non-obvious payoff: you can add methods to ALL existing arrays via \`Array.prototype.myMethod = ...\` (but please don't, in production — it pollutes globals).

---

### 5 Deep Conceptual Questions

**Q1: Why does JavaScript use prototypal inheritance instead of class inheritance?**
> **A:** Historical accident — Brendan Eich wanted Self-style prototypes (1990s research language) and was asked to "make it look like Java." The result: prototype mechanism under the hood, class syntax bolted on top. The advantage: more dynamic — you can add methods at runtime, delegate to ANOTHER object, change prototype mid-life. The disadvantage: harder to reason about than classical OOP, easier to subtly break performance via shape changes.

**Q2: Mental model for the chain?**
> **A:** Three things to remember: (1) Every value has a prototype (except null at the chain's end). (2) Method lookup walks UP the chain; property writes always create OWN properties on the instance. (3) \`instanceof\` checks if a constructor's .prototype appears anywhere in the chain. Once you internalise "lookup walks up, writes stay local", every weird inheritance bug clicks.

**Q3: Most dangerous misconception?**
> **A:** Mutating Array.prototype:
> \`\`\`js
> // ❌ Polluting prototype affects EVERY array in the program
> Array.prototype.first = function() { return this[0]; };
> [1, 2, 3].first();   // 1 — works for everyone
> for (const x in [1, 2, 3]) console.log(x);   // '0', '1', '2', 'first' — leaked!
>
> // ✅ Use a free function or Object.defineProperty with enumerable:false
> Object.defineProperty(Array.prototype, 'first', {
>   value: function() { return this[0]; },
>   enumerable: false,
> });
> // Better: avoid prototype mutation entirely — wrap in a utility function
> \`\`\`

**Q4: How do hasOwnProperty, in, and Object.keys differ?**
> **A:** \`'x' in obj\` checks own OR inherited properties. \`obj.hasOwnProperty('x')\` checks only own (but breaks if hasOwnProperty was overridden — use \`Object.hasOwn(obj, 'x')\` ES2022). \`Object.keys(obj)\` returns own ENUMERABLE string keys. \`for...in\` walks own + inherited enumerable string keys (gotcha for polluted prototypes). For arrays use \`for...of\` (iterator) or indexed for-loop, not for-in.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript's prototype chain is the language's inheritance mechanism — every object has an internal [[Prototype]] reference to another object (or null), and property access walks the chain until found — with classes (\`extends\`) configuring chain links syntactically, and Object.create / Object.setPrototypeOf manipulating them programmatically — providing dynamic, mutable inheritance that classes desugar onto."`,
    build: `## BUILD

### 🏗️ Mini Project: Build instanceof, Object.create, And A Class Polyfill From Scratch

**What you will build:** Implement \`Object.create(proto)\`, an \`isInstanceOf(obj, ctor)\` that walks the chain, and a tiny class-like factory using only prototype links — exposing exactly how class syntax compiles.
**Why this project:** Forces hands-on prototype-chain manipulation — what every "JS internals" interview question tests.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-proto && cd js-proto
npm init -y && npm install -D vitest
ni proto.js, proto.test.js -ItemType File
\`\`\`

#### Step 2 — Polyfills
\`\`\`js
// proto.js

// Object.create — links the new object's [[Prototype]] to the given proto
export function create(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
}

// instanceof — walks the chain
export function isInstanceOf(obj, ctor) {
  let cur = Object.getPrototypeOf(obj);
  while (cur !== null) {
    if (cur === ctor.prototype) return true;
    cur = Object.getPrototypeOf(cur);
  }
  return false;
}

// Tiny "class" using only prototypes
export function defineClass({ init, methods = {}, parent = null }) {
  function Ctor(...args) {
    if (parent) parent.call(this, ...args);
    if (init)   init.call(this, ...args);
  }
  if (parent) {
    Ctor.prototype = create(parent.prototype);   // chain to parent
    Ctor.prototype.constructor = Ctor;
  }
  for (const [name, fn] of Object.entries(methods)) {
    Object.defineProperty(Ctor.prototype, name, { value: fn, enumerable: false });
  }
  return Ctor;
}
\`\`\`

#### Step 3 — Use The Factory To Build A Class Hierarchy
\`\`\`js
// demo.js
import { defineClass, isInstanceOf } from './proto.js';

const Animal = defineClass({
  init(name) { this.name = name; },
  methods: {
    describe() { return \`I am \${this.name}, a \${this.constructor.name}\`; },
  },
});

const Dog = defineClass({
  parent: Animal,
  init(name, breed) { this.breed = breed; },
  methods: {
    bark() { return \`\${this.name} the \${this.breed} barks!\`; },
  },
});

const rex = new Dog('Rex', 'corgi');
console.log(rex.describe());     // from Animal.prototype
console.log(rex.bark());          // from Dog.prototype

// Walk the chain manually
let cur = rex;
while (cur !== null) {
  console.log('chain:', cur);
  cur = Object.getPrototypeOf(cur);
}

console.log(isInstanceOf(rex, Dog));    // true
console.log(isInstanceOf(rex, Animal)); // true
console.log(rex instanceof Dog);         // true (native check matches)
\`\`\`

#### Step 4 — Error Handling: hasOwn vs in
\`\`\`js
// hasOwn.js
const proto = { inherited: true };
const obj   = Object.create(proto);
obj.own = true;

console.log('inherited' in obj);                     // true
console.log(Object.hasOwn(obj, 'inherited'));        // false
console.log(Object.hasOwn(obj, 'own'));              // true

// Buggy old pattern — breaks if obj has its own hasOwnProperty
const bad = { hasOwnProperty: () => 'lol' };
console.log(bad.hasOwnProperty('x'));                // 'lol' !!! shadowed
console.log(Object.prototype.hasOwnProperty.call(bad, 'x'));   // false — safe
console.log(Object.hasOwn(bad, 'x'));                // false — safest modern check
\`\`\`

#### Step 5 — Tests
\`\`\`js
// proto.test.js
import { describe, it, expect } from 'vitest';
import { create, isInstanceOf, defineClass } from './proto.js';

describe('create', () => {
  it('links prototype', () => {
    const proto = { greet() { return 'hi'; } };
    const obj = create(proto);
    expect(obj.greet()).toBe('hi');
    expect(Object.getPrototypeOf(obj)).toBe(proto);
  });
});

describe('isInstanceOf', () => {
  it('matches direct constructor', () => {
    const Animal = defineClass({ init(n) { this.n = n; } });
    const a = new Animal('rex');
    expect(isInstanceOf(a, Animal)).toBe(true);
  });
  it('walks the chain to parent', () => {
    const A = defineClass({ init() {} });
    const B = defineClass({ parent: A, init() {} });
    const b = new B();
    expect(isInstanceOf(b, A)).toBe(true);
    expect(isInstanceOf(b, B)).toBe(true);
  });
  it('returns false when not in chain', () => {
    const X = defineClass({ init() {} });
    const Y = defineClass({ init() {} });
    expect(isInstanceOf(new X(), Y)).toBe(false);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
I am Rex, a Ctor
Rex the corgi barks!
chain: Dog { name: 'Rex', breed: 'corgi' }
chain: { bark: [Function] }       # Dog.prototype
chain: { describe: [Function] }   # Animal.prototype
chain: [Object: null prototype] {}  # Object.prototype
chain: null
true true true
\`\`\`

**Stretch Challenges:**
- [ ] Implement \`super.method()\` calls in defineClass
- [ ] Add a mixin helper that copies methods from another object's prototype
- [ ] Detect prototype-pollution (\`obj.__proto__.polluted\`) and throw`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Where does the prototype chain end?
**Q2:** Difference between \`obj.hasOwnProperty('x')\` and \`'x' in obj\`?
**Q3:** Write \`Object.create(proto)\` using only constructor functions. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`Array.prototype.x = ...\` cause for-in bugs?
**Q5:** A junior says "instanceof checks the class" — explain why that's only partly true.
**Q6:** Refactor to use Object.create instead of new:
\`\`\`js
function User(name) { this.name = name; }
User.prototype.greet = function() { return 'hi ' + this.name; };
\`\`\`

### Day 7 — Application
**Q7:** Build a mixin system that composes methods from multiple sources.
**Q8:** A PR uses prototype mutation for a "global polyfill" — show 3 risks.
**Q9:** What's the lookup cost for property access at chain depth 1 vs 5 vs 10?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Compile \`class A extends B\` to ES5 prototype code."
**Q11:** Draw: prototype chain diagram for an array literal vs a Set instance.
**Q12:** ★ System design: "Frameworks like jQuery extended Array.prototype heavily — what tradeoffs and modern alternatives?"`
  },

  // ── 15. destructuring ────────────────────────────────────────────────────
  'destructuring': {
    feynman: `## FEYNMAN CHECK

### Explain Destructuring Like I'm 10 Years Old
> Destructuring is SYNTAX SUGAR for pulling values out of arrays/objects into named variables in ONE line. \`const {name, age} = user\` is equivalent to \`const name = user.name; const age = user.age\`. \`const [first, second] = arr\` pulls the first two array elements. With defaults: \`const {timeout = 5000} = config\`. With renaming: \`const {n: name} = obj\`. With nested: \`const {addr: {city}} = user\`. With rest: \`const [head, ...tail] = arr\`. The non-obvious detail: destructuring on \`undefined\` or \`null\` THROWS — \`const {x} = null\` is TypeError. Always provide a default: \`const {x} = config ?? {}\`. Object destructuring in function PARAMS is the modern way to express named arguments without losing IDE help.

---

### 5 Deep Conceptual Questions

**Q1: When is destructuring worth it vs plain property access?**
> **A:** Use destructuring when you're pulling MORE THAN ONE value, OR you want defaults, OR you want renaming. For a single value, \`config.url\` is clearer than \`const {url} = config\`. For function parameters with 3+ options, destructuring is far better than a positional argument list — call sites are self-documenting (\`fetch(url, { method: 'POST', headers })\`).

**Q2: Mental model for destructuring?**
> **A:** Read destructuring as "describe the SHAPE on the left, JS will try to MATCH it on the right." \`const {a, b: {c}} = obj\` says: obj must have a property a (extract it), and a property b (which itself must have a c — extract that). It's pattern-matching-lite. Defaults apply when the value is undefined (not null, not 0, not ''). Renaming reverses syntax intuition: \`const {a: x} = {a: 5}\` means "extract a, call it x" — x = 5.

**Q3: Most dangerous misconception?**
> **A:** Destructuring null:
> \`\`\`js
> // ❌ Throws TypeError
> const { x } = null;          // TypeError: Cannot destructure property 'x' of 'null'
> const { x } = undefined;     // Same
>
> // ❌ Also: defaults only fire on undefined, not null
> const { count = 0 } = { count: null };
> console.log(count);           // null — default did NOT apply
>
> // ✅ Defend against null AND missing
> const { count = 0 } = obj ?? {};
> // Or normalise: const count = obj?.count ?? 0;
> \`\`\`

**Q4: How does parameter destructuring interact with arity?**
> **A:** \`function f({a, b})\` declares ONE parameter (an object). \`f.length\` is 1. The default arity-zero case: \`function f({a, b} = {})\` lets you call f() without args. Without the \`= {}\`, calling f() throws because you can't destructure undefined. The pattern \`function f({a = 1, b = 2} = {})\` is the canonical "named args with defaults" — every modern lib uses it.

**Q5: FAANG-grade definition?**
> **A:** "Destructuring assignment is JavaScript syntax that extracts values from arrays (positional) or objects (by key) into individual bindings — supporting defaults (for undefined), renaming via \`prop: localName\`, nested patterns, rest collection, and use in function parameters as the idiomatic named-arguments pattern — throwing TypeError when destructuring null or undefined without a fallback."`,
    build: `## BUILD

### 🏗️ Mini Project: Robust Options Parser With Defaults, Renaming, Nested Destructuring

**What you will build:** A reusable \`parseOptions\` factory that accepts schemas and produces fully-typed options resolvers with defaults — like the pattern in Express, axios, and webpack configs.
**Why this project:** Forces every destructuring pattern in one realistic API design.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-destructure && cd js-destructure
npm init -y && npm install -D vitest
ni options.js, options.test.js -ItemType File
\`\`\`

#### Step 2 — Real Function With Full Destructuring
\`\`\`js
// options.js

// HTTP fetch wrapper — every option destructured, defaulted, validated
export async function request(url, {
  method = 'GET',
  headers = {},
  body,
  timeout = 5000,
  retries: { count: retryCount = 3, delay: retryDelay = 1000 } = {},
  signal,
} = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  // Combine external signal with our timeout
  signal?.addEventListener('abort', () => controller.abort());

  let lastErr;
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      const res = await fetch(url, {
        method, headers, body, signal: controller.signal,
      });
      clearTimeout(timer);
      return res;
    } catch (e) {
      lastErr = e;
      if (attempt < retryCount) await new Promise(r => setTimeout(r, retryDelay));
    }
  }
  clearTimeout(timer);
  throw lastErr;
}

// Demo: every form of destructuring in call sites
const cfg = {
  url: 'https://api.example.com',
  retries: { count: 5, delay: 2000 },
};

// 1. Destructure from object literal
const { url, retries: { count } = {} } = cfg;
console.log('URL:', url, 'retries:', count);

// 2. With rename + default
const { url: endpoint = '/fallback' } = cfg;

// 3. From function return
function getCoords() { return [37.7749, -122.4194]; }
const [lat, lng] = getCoords();
console.log({ lat, lng });

// 4. Swap variables
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b);   // 2 1
\`\`\`

#### Step 3 — Schema-Driven Options
\`\`\`js
// schema.js
export function defineOptions(schema) {
  return (input = {}) => {
    const out = {};
    for (const [key, { default: def, required, validate }] of Object.entries(schema)) {
      const value = input[key] !== undefined ? input[key] : def;
      if (required && value === undefined) {
        throw new Error(\`Missing required option: \${key}\`);
      }
      if (validate && !validate(value)) {
        throw new Error(\`Invalid option: \${key}\`);
      }
      out[key] = value;
    }
    return out;
  };
}

const parseDbConfig = defineOptions({
  host: { default: 'localhost' },
  port: { default: 5432, validate: (n) => Number.isInteger(n) && n > 0 },
  user: { required: true },
  pool: { default: 10 },
});

console.log(parseDbConfig({ user: 'admin' }));
\`\`\`

#### Step 4 — Error Handling: Destructure From Maybe-Null
\`\`\`js
// safe.js — defensive destructuring
function getProfile(user) {
  // ❌ Throws if user is null/undefined:
  // const { name, email } = user;

  // ✅ Default to empty object to allow destructuring
  const { name = '<unknown>', email = '<none>' } = user ?? {};

  // ✅ For deeper nesting, combine optional chaining + ??
  const street = user?.address?.street ?? '<no street>';
  return { name, email, street };
}

console.log(getProfile(null));
console.log(getProfile({ name: 'Ana' }));
console.log(getProfile({ name: 'Ana', address: { street: 'Main St' } }));
\`\`\`

#### Step 5 — Tests
\`\`\`js
// options.test.js
import { describe, it, expect } from 'vitest';
import { defineOptions } from './schema.js';

describe('defineOptions', () => {
  const parse = defineOptions({
    a: { default: 1 },
    b: { required: true },
    c: { default: 'x', validate: (s) => typeof s === 'string' },
  });

  it('applies defaults', () => {
    expect(parse({ b: 'x' })).toEqual({ a: 1, b: 'x', c: 'x' });
  });
  it('throws on missing required', () => {
    expect(() => parse({})).toThrow(/Missing required option: b/);
  });
  it('throws on validation failure', () => {
    expect(() => parse({ b: 'x', c: 99 })).toThrow(/Invalid option: c/);
  });
});

describe('destructuring edge cases', () => {
  it('defaults only fire on undefined, not null', () => {
    const { x = 10 } = { x: null };
    expect(x).toBeNull();
  });
  it('destructuring null throws', () => {
    expect(() => { const { x } = null; }).toThrow(TypeError);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
URL: https://api.example.com retries: 5
{ lat: 37.7749, lng: -122.4194 }
2 1
{ host: 'localhost', port: 5432, user: 'admin', pool: 10 }
{ name: '<unknown>', email: '<none>', street: '<no street>' }
{ name: 'Ana', email: '<none>', street: '<no street>' }
{ name: 'Ana', email: '<none>', street: 'Main St' }

# 5/5 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add nested-schema support (recursive defineOptions)
- [ ] Add a type-driven version that emits TS types from the schema
- [ ] Compare with zod for the same use case`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Syntax for renaming during destructuring?
**Q2:** When does a destructuring default fire?
**Q3:** Write a function signature with default named options. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`const {x = 1} = {x: null}\` give \`null\`, not \`1\`?
**Q5:** A junior writes \`function f({a, b})\` and calls \`f()\` — TypeError. Fix.
**Q6:** Refactor for named args:
\`\`\`js
function search(query, page, perPage, sort, filters) { /* ... */ }
search('js', 1, 20, 'date', { tag: 'tutorial' });
\`\`\`

### Day 7 — Application
**Q7:** Build a swap utility for any two variables using one line.
**Q8:** A PR uses positional args for a 7-option API — refactor to destructured options.
**Q9:** Is destructuring slower than direct property access? When does it matter?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every destructuring pattern with concrete examples."
**Q11:** Draw: how destructuring compiles to property-access + temporary-binding code.
**Q12:** ★ System design: "Design a public API where every method accepts options with safe defaults and clear validation — patterns and pitfalls."`
  },

  // ── 16. promises ─────────────────────────────────────────────────────────
  'promises': {
    feynman: `## FEYNMAN CHECK

### Explain Promises Like I'm 10 Years Old
> A Promise is a PLACEHOLDER for a value that doesn't exist yet — like an order receipt from a restaurant. It has three states: PENDING (waiting), FULFILLED (resolved with a value), REJECTED (errored). Once a Promise settles, it CANNOT go back — settled is forever. \`.then(onFulfilled, onRejected)\` registers callbacks. Chaining is the magic: \`p.then(x => x+1).then(...)\` — each .then returns a NEW promise resolved with the callback's return value (or the awaited value if the callback returns a promise). The non-obvious detail: promise callbacks ALWAYS run async via the MICROTASK QUEUE, even if the promise was already resolved — \`Promise.resolve(1).then(console.log); console.log('sync')\` logs 'sync' then 1.

---

### 5 Deep Conceptual Questions

**Q1: What problem do Promises fundamentally solve?**
> **A:** Composition and error handling for async operations. Callback-based code suffered from: (1) nesting (pyramid of doom), (2) error propagation requiring manual checks at every level, (3) no way to express "run these N async ops in parallel and wait for all". Promises gave async values a TYPE — values that can be chained, mapped, combined via Promise.all/race/any/allSettled — making async composition look like sync. async/await built on this foundation.

**Q2: Mental model for chains?**
> **A:** Each .then is a TRANSFORMATION. If the callback returns a plain value, the next promise resolves with that value. If it returns a promise, the chain WAITS for that promise too (auto-flatten — no Promise<Promise<T>>). If it throws, the next promise is rejected. \`.catch\` is sugar for \`.then(undefined, onRejected)\`. Errors propagate down the chain until caught — like exceptions in sync code.

**Q3: Most dangerous misconception?**
> **A:** \`.then(success).catch(err)\` catches errors in success, but NOT vice-versa:
> \`\`\`js
> // ❌ Common: assuming .catch catches everything including .then bugs
> fetch('/api').then(r => {
>   throw new Error('oops');   // caught below ✓
> }).catch(e => console.error(e));
>
> // ❌ But this is asymmetric: throws inside catch are NOT caught
> fetch('/api').catch(e => {
>   throw new Error('recovery failed');   // becomes unhandledRejection
> });
>
> // ✅ Chain a second .catch or use try/await
> fetch('/api').catch(e => { throw new Error('x'); }).catch(e => console.error(e));
> \`\`\`

**Q4: How do Promise.all, race, any, allSettled differ?**
> **A:** \`Promise.all([p1,p2,p3])\` resolves with [v1,v2,v3] if ALL succeed; rejects with the FIRST error (fail-fast). \`Promise.race\` settles with whichever settles FIRST (success or fail). \`Promise.any\` resolves with the first SUCCESS, rejects only if ALL fail (AggregateError). \`Promise.allSettled\` waits for ALL to settle and returns [{status, value/reason}, ...] — never rejects. Use all for fail-fast pipelines, allSettled for "do as much as possible".

**Q5: FAANG-grade definition?**
> **A:** "A Promise is an immutable object representing the eventual completion (fulfilled with a value) or failure (rejected with a reason) of an asynchronous operation — settled exactly once, with .then/.catch/.finally callbacks scheduled via the microtask queue draining between every macrotask — composed via Promise.all/race/any/allSettled — forming the foundation of async/await syntax."`,
    build: `## BUILD

### 🏗️ Mini Project: Promise-Based Task Pool With Limit + Retry + Timeout

**What you will build:** A task scheduler that runs N async tasks with max-concurrency, exponential backoff retry on failure, and per-task timeout — using Promise.race for the timeout and a custom queue for concurrency.
**Why this project:** Forces Promise.race, Promise.allSettled, error propagation, and queue management.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-promises && cd js-promises
npm init -y && npm install -D vitest
ni pool.js, pool.test.js -ItemType File
\`\`\`

#### Step 2 — Promise Utilities
\`\`\`js
// pool.js

// Timeout via Promise.race
export function withTimeout(promise, ms, errMsg = 'Timeout') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errMsg)), ms)),
  ]);
}

// Retry with exponential backoff
export async function retry(fn, { attempts = 3, baseMs = 100 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); }
    catch (e) {
      lastErr = e;
      if (i < attempts - 1) await sleep(baseMs * 2 ** i);
    }
  }
  throw lastErr;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
\`\`\`

#### Step 3 — Concurrency-Limited Pool
\`\`\`js
// pool.js (continued)
export async function pool(tasks, { concurrency = 4 } = {}) {
  const results = new Array(tasks.length);
  let nextIndex = 0;
  const running = new Set();

  async function runOne() {
    const i = nextIndex++;
    if (i >= tasks.length) return;
    const task = tasks[i];
    const p = Promise.resolve()
      .then(() => task())
      .then(
        (value)  => ({ status: 'fulfilled', value }),
        (reason) => ({ status: 'rejected',  reason }),
      )
      .then((settled) => {
        results[i] = settled;
        running.delete(p);
      });
    running.add(p);
    if (running.size >= concurrency) await Promise.race(running);
    return runOne();
  }

  await Promise.all(Array.from({ length: concurrency }, runOne));
  await Promise.all(running);   // drain remaining
  return results;
}
\`\`\`

#### Step 4 — Error Handling: Run It All
\`\`\`js
// demo.js
import { pool, retry, withTimeout } from './pool.js';

function flakyFetch(url, failRate = 0.5) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < failRate) reject(new Error('Network blip'));
      else resolve(\`OK \${url}\`);
    }, Math.random() * 200);
  });
}

const urls = Array.from({ length: 10 }, (_, i) => \`/api/\${i}\`);

const tasks = urls.map(url =>
  () => withTimeout(retry(() => flakyFetch(url), { attempts: 4 }), 1000)
);

const results = await pool(tasks, { concurrency: 3 });
const ok = results.filter(r => r.status === 'fulfilled').length;
const fail = results.filter(r => r.status === 'rejected').length;
console.log(\`Done: \${ok} ok, \${fail} failed\`);

// Show the microtask priority — log order
console.log('A: sync');
Promise.resolve().then(() => console.log('C: microtask'));
setTimeout(() => console.log('D: macrotask'));
console.log('B: sync');
// Output: A, B, C, D
\`\`\`

#### Step 5 — Tests
\`\`\`js
// pool.test.js
import { describe, it, expect, vi } from 'vitest';
import { pool, retry, withTimeout } from './pool.js';

describe('withTimeout', () => {
  it('resolves before timeout', async () => {
    const r = await withTimeout(Promise.resolve(42), 100);
    expect(r).toBe(42);
  });
  it('rejects on timeout', async () => {
    const p = new Promise(r => setTimeout(() => r('late'), 200));
    await expect(withTimeout(p, 50)).rejects.toThrow('Timeout');
  });
});

describe('retry', () => {
  it('succeeds on first try', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    expect(await retry(fn)).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('retries on failure', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('x'))
      .mockResolvedValueOnce('ok');
    expect(await retry(fn, { attempts: 3, baseMs: 1 })).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });
  it('throws after attempts exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always'));
    await expect(retry(fn, { attempts: 2, baseMs: 1 })).rejects.toThrow('always');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('pool', () => {
  it('limits concurrency', async () => {
    let active = 0, peak = 0;
    const tasks = Array.from({ length: 10 }, () => async () => {
      active++; peak = Math.max(peak, active);
      await new Promise(r => setTimeout(r, 20));
      active--;
      return 'done';
    });
    await pool(tasks, { concurrency: 3 });
    expect(peak).toBeLessThanOrEqual(3);
  });
  it('returns ordered allSettled-style results', async () => {
    const r = await pool([
      () => Promise.resolve(1),
      () => Promise.reject(new Error('x')),
      () => Promise.resolve(3),
    ]);
    expect(r[0].status).toBe('fulfilled');
    expect(r[1].status).toBe('rejected');
    expect(r[2].status).toBe('fulfilled');
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Done: 10 ok, 0 failed
A: sync
B: sync
C: microtask
D: macrotask

# 7/7 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add cancellation via AbortSignal — when signal aborts, cancel pending tasks
- [ ] Add priority queue support — high-priority tasks jump the line
- [ ] Compare with p-limit and p-queue libraries`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Three Promise states.
**Q2:** Difference between Promise.all and Promise.allSettled?
**Q3:** Write a one-line promise that resolves with 5 after 100ms. From memory.

### Day 3 — Comprehension
**Q4:** What does \`Promise.resolve(1).then(console.log)\` log first vs \`console.log(2)\` after it?
**Q5:** A junior writes \`.then(x => x).catch(...)\` — both branches throw. Diagnose.
**Q6:** Refactor to Promise.all:
\`\`\`js
async function get() {
  const a = await fetchA();
  const b = await fetchB();
  return { a, b };   // a and b could run in parallel!
}
\`\`\`

### Day 7 — Application
**Q7:** Implement Promise.any from scratch using Promise.allSettled.
**Q8:** A PR uses Promise.all for non-critical fetches — show how one failure breaks everything; fix with allSettled.
**Q9:** When should you use Promise.race? Show a timeout pattern.

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through what happens when a Promise resolves — microtask, then handler, then chain."
**Q11:** Draw: state machine of Promise (pending → fulfilled / rejected) with arrows.
**Q12:** ★ System design: "Build a fetch-with-cache layer that dedupes concurrent calls to the same URL — what Promise patterns?"`
  },

  // ── 17. async-await ──────────────────────────────────────────────────────
  'async-await': {
    feynman: `## FEYNMAN CHECK

### Explain async/await Like I'm 10 Years Old
> async/await is SYNTACTIC SUGAR for Promises. \`async function f()\` always returns a Promise. \`await p\` PAUSES the function until p settles, then resumes with p's value (or throws if rejected). Inside an async function, you write code that LOOKS synchronous but ISN'T — it can use try/catch for errors and for-loops for sequencing. The non-obvious detail: \`await\` ONLY pauses the CURRENT async function — the caller keeps running. \`fn()\` where fn is async returns the promise IMMEDIATELY; you have to await fn() or chain .then. A common bug: forgetting to await — \`async function() { saveToDb(user); }\` is fire-and-forget; errors vanish silently. ESLint's no-floating-promises catches this.

---

### 5 Deep Conceptual Questions

**Q1: What problem does async/await fundamentally solve over raw Promises?**
> **A:** Readability and control flow. With raw Promises, branching/looping/error-handling around async ops required nested .then chains: \`p.then(a => { if (a) return q.then(b => ...) else return ...; }).catch(...)\`. With async/await, the same code is: \`try { const a = await p; if (a) { const b = await q; ... } } catch (e) { ... }\` — flat, debuggable, supports loops naturally.

**Q2: Mental model for async/await?**
> **A:** "Every await is a SUSPEND POINT — the engine puts your function aside, runs other things, and resumes when the awaited value is ready." The function's local variables are preserved on the heap (a Continuation). The caller never blocks. await DOES NOT make the program single-threaded blocking — the event loop runs other tasks while you're paused.

**Q3: Most dangerous misconception?**
> **A:** Sequential awaits in a loop when parallel would do:
> \`\`\`js
> // ❌ Slow — each fetch awaits the previous to complete
> for (const url of urls) {
>   const data = await fetch(url).then(r => r.json());
>   results.push(data);
> }
> // 10 URLs × 200ms each = 2000ms total
>
> // ✅ Parallel with Promise.all
> const results = await Promise.all(urls.map(url => fetch(url).then(r => r.json())));
> // All 10 in flight at once = ~200ms total
> \`\`\`

**Q4: How does async/await compile under the hood?**
> **A:** The compiler converts each async function into a STATE MACHINE. Every \`await\` becomes a state transition: save current state, return the awaited promise's continuation, schedule resume callback. When the promise settles, the runtime jumps back into the function at the saved state. Modern V8 has dedicated bytecode for async — making it nearly as fast as raw .then chains, with extra overhead only for try/catch around await.

**Q5: FAANG-grade definition?**
> **A:** "async/await is JavaScript syntactic sugar over Promises — async functions always return a Promise, await expressions suspend the function at compile-time-generated state-machine resume points, throwing rejected-promise reasons as synchronous errors catchable by try/catch — enabling synchronous-looking code over asynchronous operations with full support for loops, branches, try/finally, and structured error handling."`,
    build: `## BUILD

### 🏗️ Mini Project: Sequential vs Parallel Image Loader With Progress

**What you will build:** Two implementations of "load 20 images and report progress" — one with sequential await (slow, simple), one with parallel Promise.all + progress callback (fast, complex) — and a benchmark comparing them.
**Why this project:** Forces you to SEE the cost of sequential awaits and how to parallelise correctly.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-async && cd js-async
npm init -y && npm install -D vitest
ni loader.js, loader.test.js -ItemType File
\`\`\`

#### Step 2 — Sequential vs Parallel
\`\`\`js
// loader.js

// Simulate image load with variable delay
function loadImage(url) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ url, bytes: Math.floor(Math.random() * 50000) }), 50 + Math.random() * 150);
  });
}

// SEQUENTIAL — slow, simple
export async function loadAllSeq(urls, onProgress) {
  const results = [];
  for (const url of urls) {
    const img = await loadImage(url);     // ❌ each waits for previous
    results.push(img);
    onProgress?.(results.length, urls.length);
  }
  return results;
}

// PARALLEL — fast, but progress callback is trickier
export async function loadAllPar(urls, onProgress) {
  let done = 0;
  return Promise.all(urls.map(async (url) => {
    const img = await loadImage(url);
    done++;
    onProgress?.(done, urls.length);
    return img;
  }));
}

// CONCURRENT WITH LIMIT — best of both worlds
export async function loadAllLimit(urls, { concurrency = 4, onProgress } = {}) {
  let done = 0;
  const results = new Array(urls.length);
  let idx = 0;
  async function worker() {
    while (idx < urls.length) {
      const i = idx++;
      results[i] = await loadImage(urls[i]);
      done++;
      onProgress?.(done, urls.length);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}
\`\`\`

#### Step 3 — Benchmark Them
\`\`\`js
// demo.js
import { loadAllSeq, loadAllPar, loadAllLimit } from './loader.js';

const urls = Array.from({ length: 20 }, (_, i) => \`/img/\${i}.png\`);

console.time('sequential');
await loadAllSeq(urls, (done, total) => process.stdout.write(\`\\r[seq] \${done}/\${total}\`));
console.timeEnd('sequential');

console.time('parallel');
await loadAllPar(urls, (done, total) => process.stdout.write(\`\\r[par] \${done}/\${total}\`));
console.timeEnd('parallel');

console.time('limit=4');
await loadAllLimit(urls, { concurrency: 4, onProgress: (d, t) => process.stdout.write(\`\\r[lim] \${d}/\${t}\`) });
console.timeEnd('limit=4');
\`\`\`

#### Step 4 — Error Handling: try/catch With await
\`\`\`js
// Robust version with error per task
export async function loadAllSafe(urls) {
  const settled = await Promise.allSettled(urls.map(loadImage));
  const ok    = settled.filter(s => s.status === 'fulfilled').map(s => s.value);
  const errors = settled.filter(s => s.status === 'rejected').map(s => s.reason);
  return { ok, errors };
}

// Top-level await (ES2022, modules only)
const { ok, errors } = await loadAllSafe(['/good', '/bad', '/ugly']);
console.log(\`Loaded: \${ok.length}, Failed: \${errors.length}\`);
\`\`\`

#### Step 5 — Tests
\`\`\`js
// loader.test.js
import { describe, it, expect, vi } from 'vitest';
import { loadAllSeq, loadAllPar, loadAllLimit } from './loader.js';

describe('async/await loaders', () => {
  it('sequential is slower than parallel for same workload', async () => {
    const urls = ['a', 'b', 'c', 'd', 'e'];
    const startSeq = Date.now();
    await loadAllSeq(urls);
    const seqTime = Date.now() - startSeq;

    const startPar = Date.now();
    await loadAllPar(urls);
    const parTime = Date.now() - startPar;

    expect(parTime).toBeLessThan(seqTime);
  });
  it('progress callback fires for each completion', async () => {
    const onProgress = vi.fn();
    await loadAllPar(['a', 'b', 'c'], onProgress);
    expect(onProgress).toHaveBeenCalledTimes(3);
    expect(onProgress).toHaveBeenLastCalledWith(3, 3);
  });
  it('limit caps concurrency', async () => {
    let active = 0, peak = 0;
    const urls = Array.from({ length: 10 }, (_, i) => 'u' + i);
    // Wrap loadImage to track concurrency — not directly testable without injection
    // Instead, just verify timing isn't fully parallel
    const start = Date.now();
    await loadAllLimit(urls, { concurrency: 2 });
    const time = Date.now() - start;
    expect(time).toBeGreaterThan(200);   // 2-at-a-time can't finish in <200ms
  });
});
\`\`\`

**Expected Output:**
\`\`\`
[seq] 20/20  sequential: 2400ms
[par] 20/20  parallel: 200ms
[lim] 20/20  limit=4: 600ms

Loaded: 3, Failed: 0

# All tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add an AbortController so users can cancel
- [ ] Add backpressure — pause new loads when downstream is slow
- [ ] Compare with for-await-of over a generator`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does an async function return?
**Q2:** What does \`await\` actually do?
**Q3:** Write an async function that fetches two URLs in parallel and returns both. From memory.

### Day 3 — Comprehension
**Q4:** Why is \`for (const u of urls) { await fetch(u) }\` slow?
**Q5:** A junior writes \`async function save() { db.write(user); }\` — no await. Show the bug.
**Q6:** Refactor to await + try/catch:
\`\`\`js
function loadUser(id) {
  return fetch('/u/'+id).then(r => r.json()).catch(e => null);
}
\`\`\`

### Day 7 — Application
**Q7:** Build a generator that yields async results one at a time (for-await-of).
**Q8:** A PR awaits inside a forEach — explain why it doesn't actually wait.
**Q9:** What's the overhead of async/await vs raw .then chains?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how async/await compiles to a state machine."
**Q11:** Draw: call stack and microtask queue across 3 await points in one async function.
**Q12:** ★ System design: "Build a pipeline that fetches → transforms → uploads 1M records with backpressure and retry."`
  },

  // ── 18. event-loop ───────────────────────────────────────────────────────
  'event-loop': {
    feynman: `## FEYNMAN CHECK

### Explain Event Loop Like I'm 10 Years Old
> The event loop is the SCHEDULER that runs your JavaScript. JS is single-threaded — only ONE thing runs at a time. But asynchronous operations (setTimeout, fetch, click handlers, Promise resolutions) need to run LATER. The runtime keeps queues: MACROTASK QUEUE (setTimeout, setInterval, I/O, UI events) and MICROTASK QUEUE (Promise .then callbacks, queueMicrotask, MutationObserver). The loop is: (1) Run ONE macrotask from the queue. (2) Drain ALL microtasks queued during that macrotask. (3) Browser paints if needed. (4) Go to step 1. The non-obvious power: microtasks always drain BEFORE the next macrotask — that's why \`Promise.resolve().then(...)\` ALWAYS runs before \`setTimeout(..., 0)\`.

---

### 5 Deep Conceptual Questions

**Q1: Why was the event loop designed this way?**
> **A:** JavaScript runs in browsers — it MUST not block UI rendering. Single-threaded execution prevents data races (no locks needed in user code), but requires non-blocking I/O. The event loop is the bridge: native I/O happens in C++ threads underneath, results are posted back to the JS queue, the loop picks them up between synchronous chunks. This let JS scale from "small page scripts" to "Gmail" without redesigning the language.

**Q2: Mental model for queue priority?**
> **A:** "Sync code runs to completion. Then microtasks drain (priority — including chained .then). Then ONE macrotask runs. Then microtasks drain again. Then maybe a paint. Repeat." Microtasks have a footgun: an infinite chain of microtasks STARVES macrotasks AND blocks paint (frozen UI). Browser dev tools warn about long microtask chains.

**Q3: Most dangerous misconception?**
> **A:** \`setTimeout(fn, 0)\` runs "immediately":
> \`\`\`js
> // ❌ Order is NOT (sync, timer, then microtask)
> setTimeout(() => console.log('macro'), 0);
> Promise.resolve().then(() => console.log('micro'));
> console.log('sync');
>
> // Actual output:
> // sync   (sync code first)
> // micro  (microtask queue drained next)
> // macro  (macrotask comes last)
>
> // ✅ Use queueMicrotask for "as soon as possible" without timer overhead
> queueMicrotask(() => console.log('also micro'));
> \`\`\`

**Q4: How does requestAnimationFrame fit in?**
> **A:** rAF callbacks fire RIGHT BEFORE the browser paints — typically 60 times per second (every 16.67ms) or matching the display refresh rate. They are scheduled BETWEEN microtask drain and paint. This makes rAF the canonical hook for animations: it runs once per frame, no more (avoiding the over-rendering of setInterval), and is automatically paused for inactive tabs. NEVER do heavy work in rAF — you have ~10ms before the next frame.

**Q5: FAANG-grade definition?**
> **A:** "The JavaScript event loop is the runtime's single-threaded scheduler that processes one macrotask per tick (timers, I/O callbacks, UI events) interleaved with full draining of the microtask queue (Promise reactions, queueMicrotask, MutationObserver) between every macrotask — coordinated with browser paint via requestAnimationFrame and requestIdleCallback — providing non-blocking concurrency without thread-level parallelism."`,
    build: `## BUILD

### 🏗️ Mini Project: Event Loop Visualizer — Log Order Of Sync, Promise, setTimeout, rAF

**What you will build:** A page that schedules every kind of async task and logs their execution order in real-time — proving the microtask-then-macrotask ordering empirically.
**Why this project:** Forces hands-on observation of the queues — every async ordering interview question relies on understanding this.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-eventloop && cd js-eventloop
ni index.html, app.js -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html><html><body>
  <button id="run">Run scheduling demo</button>
  <pre id="out"></pre>
  <script type="module" src="app.js"></script>
</body></html>
\`\`\`

#### Step 3 — The Demo
\`\`\`js
// app.js
const out = document.getElementById('out');
const log = (msg) => { out.textContent += msg + '\\n'; };

document.getElementById('run').onclick = () => {
  out.textContent = '';

  log('1. sync start');

  setTimeout(() => log('5. macrotask: setTimeout(0)'),         0);
  setTimeout(() => log('6. macrotask: setTimeout(50)'),       50);

  Promise.resolve()
    .then(() => log('3. microtask: Promise.then (1st)'))
    .then(() => log('4. microtask: Promise.then (2nd, chained)'));

  queueMicrotask(() => log('3b. microtask: queueMicrotask'));

  requestAnimationFrame(() => log('7. rAF: before paint'));

  // Sync runs first
  log('2. sync end');
};
\`\`\`

#### Step 4 — Error Handling: Starvation Demo
\`\`\`js
// Showing microtask STARVATION — UI freezes
document.body.insertAdjacentHTML('beforeend',
  '<button id="starve">Starve macrotasks (locks UI for 3s)</button>');

document.getElementById('starve').onclick = () => {
  log('--- starting starvation ---');
  let count = 0;
  function recurse() {
    count++;
    if (count > 100000) {
      log('Done after ' + count + ' microtasks');
      return;
    }
    queueMicrotask(recurse);   // each microtask schedules another
  }
  recurse();
  // While this runs, setTimeout below CANNOT fire — UI is frozen
  setTimeout(() => log('Macrotask scheduled — fired only AFTER microtasks drained'), 0);
};
\`\`\`

#### Step 5 — Tests
\`\`\`js
// eventloop.test.js
import { describe, it, expect, vi } from 'vitest';

describe('event loop ordering', () => {
  it('microtasks run before macrotasks', async () => {
    const log = [];
    setTimeout(() => log.push('macro'), 0);
    await Promise.resolve().then(() => log.push('micro'));
    // After await, the microtask has run but macrotask hasn't
    expect(log).toEqual(['micro']);
    await new Promise(r => setTimeout(r, 10));
    expect(log).toEqual(['micro', 'macro']);
  });

  it('chained .then go on the same microtask queue drain', async () => {
    const log = [];
    Promise.resolve().then(() => log.push('a')).then(() => log.push('b'));
    Promise.resolve().then(() => log.push('c'));
    await new Promise(r => setTimeout(r, 0));
    expect(log).toEqual(['a', 'c', 'b']);   // interleaved by FIFO order
  });

  it('queueMicrotask matches Promise.then in priority', async () => {
    const log = [];
    queueMicrotask(() => log.push('qmt'));
    Promise.resolve().then(() => log.push('pt'));
    await new Promise(r => setTimeout(r, 0));
    expect(log).toEqual(['qmt', 'pt']);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
1. sync start
2. sync end
3. microtask: Promise.then (1st)
3b. microtask: queueMicrotask
4. microtask: Promise.then (2nd, chained)
5. macrotask: setTimeout(0)
7. rAF: before paint            (next frame, ~16ms)
6. macrotask: setTimeout(50)    (after 50ms)
\`\`\`

**Stretch Challenges:**
- [ ] Add a Worker thread and show messages arrive as macrotasks
- [ ] Show MessageChannel as a faster macrotask alternative to setTimeout(0)
- [ ] Build a "low-priority defer" using setTimeout vs queueMicrotask`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between microtask and macrotask?
**Q2:** Order of: \`sync\`, \`setTimeout(...,0)\`, \`Promise.resolve().then(...)\`?
**Q3:** What scheduler does requestAnimationFrame integrate with? From memory.

### Day 3 — Comprehension
**Q4:** Why can a long microtask chain freeze the UI but a long macrotask chain doesn't (as badly)?
**Q5:** A junior says "setTimeout(0) is immediate" — show three ways it isn't.
**Q6:** Refactor for non-blocking:
\`\`\`js
function process(items) {
  for (const x of items) heavyWork(x);    // blocks the UI for 5s
}
\`\`\`

### Day 7 — Application
**Q7:** Write a scheduler that yields to the event loop every 5ms during a heavy loop.
**Q8:** A PR uses setInterval for 1ms animation — explain why rAF is correct.
**Q9:** What is the overhead per microtask vs per macrotask?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through what happens between a Promise resolving and its .then callback running."
**Q11:** Draw: event loop diagram with stack, microtask queue, macrotask queue, paint cycle.
**Q12:** ★ System design: "Build a 60fps UI that also runs a CPU-intensive parser — how do you schedule the work?"`
  },

  // ── 19. event-loop-deep ──────────────────────────────────────────────────
  'event-loop-deep': {
    feynman: `## FEYNMAN CHECK

### Explain Event Loop Internals Like I'm 10 Years Old
> Going DEEPER than the basic queue model: Node.js's event loop has SIX PHASES (timers, pending callbacks, idle/prepare, poll, check, close callbacks) each with its own callback queue. Browser event loops add specific phases for navigation, rendering, input events, with microtasks draining at SPECIFIC checkpoints. Node.js also has \`process.nextTick\` — its own queue that drains BEFORE microtasks (higher priority than promises). The non-obvious complexity: I/O callbacks live in the POLL phase; setImmediate fires in the CHECK phase; setTimeout fires in TIMERS phase. So \`setImmediate(...)\` vs \`setTimeout(...,0)\` ordering depends on where you call them — INSIDE an I/O callback, setImmediate ALWAYS fires first. This level of detail matters for performance-critical Node code and is a senior interview staple.

---

### 5 Deep Conceptual Questions

**Q1: Why does Node.js need multiple phases instead of one queue?**
> **A:** Phases give Node.js precise control over WHEN different callback types run. The POLL phase blocks waiting for I/O (with a timeout); the TIMERS phase processes expired timeouts; CHECK runs setImmediate. This lets I/O-heavy servers prioritise actual network/disk work over speculative timers. Each phase has a queue; the loop drains its queue (up to a limit), then moves to the next phase. Microtasks (including process.nextTick) drain BETWEEN any two callbacks in any phase.

**Q2: Mental model for process.nextTick vs queueMicrotask?**
> **A:** Node.js has TWO microtask-tier queues: \`process.nextTick\` (highest priority — drains BEFORE Promise microtasks) and the standard microtask queue (Promises, queueMicrotask). Both drain between EVERY operation, but nextTick drains first. Library code should prefer queueMicrotask for portability (browsers don't have nextTick). Recursive nextTick CAN STARVE the loop just like recursive microtasks.

**Q3: Most dangerous misconception?**
> **A:** \`setTimeout(0)\` and \`setImmediate\` are interchangeable in Node:
> \`\`\`js
> // ❌ Order depends on context
> setTimeout(() => console.log('timeout'), 0);
> setImmediate(() => console.log('immediate'));
> // Output is NON-DETERMINISTIC — depends on whether main was reached before/after 1ms
>
> // ✅ Inside an I/O callback, setImmediate ALWAYS wins
> fs.readFile('package.json', () => {
>   setTimeout(() => console.log('timeout'), 0);
>   setImmediate(() => console.log('immediate'));
>   // Output: immediate, then timeout — every time
> });
> \`\`\`

**Q4: How does the browser interleave rendering with JavaScript?**
> **A:** Browser event loop runs: macrotask → drain microtasks → IF needed, run requestAnimationFrame callbacks → recalc styles + layout + paint → composite. The "rendering" steps only happen when the browser decides (typically aligned to vsync, ~16.67ms at 60Hz). Heavy JS BLOCKS rendering — that's why a sync 50ms loop drops 3 frames. ResizeObserver and IntersectionObserver also fire at specific event-loop checkpoints to avoid layout thrashing.

**Q5: FAANG-grade definition?**
> **A:** "The Node.js event loop processes callbacks across six dedicated phases (timers, pending callbacks, idle/prepare, poll, check, close) with separate queues per phase, draining process.nextTick and microtask queues between every callback — while browser event loops integrate rendering checkpoints (rAF, ResizeObserver, IntersectionObserver, style recalc, paint) between macrotasks — making the precise ordering of cross-API async operations runtime-dependent and frequently the source of subtle production bugs."`,
    build: `## BUILD

### 🏗️ Mini Project: Demonstrate Every Node Event-Loop Phase Empirically

**What you will build:** A Node.js script that schedules tasks in every phase and prints the actual execution order — verifying setImmediate-after-I/O ordering, process.nextTick priority, and microtask interleaving.
**Why this project:** Forces deep understanding of Node's internal scheduling — exactly what senior Node interviews test.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir node-loop && cd node-loop
npm init -y && npm install -D vitest
ni demo.js, phases.js -ItemType File
\`\`\`

#### Step 2 — Phase Demo
\`\`\`js
// demo.js — run with: node demo.js
import fs from 'node:fs/promises';
import { setImmediate as setImmediatePromise } from 'node:timers/promises';

console.log('1. sync start');

process.nextTick(() => console.log('3. process.nextTick'));

Promise.resolve().then(() => console.log('4. Promise.then'));

queueMicrotask(() => console.log('5. queueMicrotask'));

setTimeout(() => console.log('6. setTimeout(0)'), 0);

setImmediate(() => console.log('7. setImmediate'));

// I/O callback — order between setTimeout(0) and setImmediate is DETERMINISTIC inside I/O
import('node:fs').then(({ readFile }) => {
  readFile('./demo.js', () => {
    console.log('8. I/O callback (readFile)');
    setTimeout(() => console.log('10. setTimeout inside I/O'), 0);
    setImmediate(() => console.log('9. setImmediate inside I/O (always before setTimeout in I/O)'));
  });
});

console.log('2. sync end');
\`\`\`

#### Step 3 — process.nextTick Starvation
\`\`\`js
// phases.js
// Demonstrate that nextTick can STARVE other phases
let count = 0;
function recurseNextTick() {
  if (count++ > 1000) {
    console.log(\`Drained \${count} nextTicks before phase advanced\`);
    return;
  }
  process.nextTick(recurseNextTick);
}

console.log('Scheduling 1001 process.nextTicks...');
recurseNextTick();
setTimeout(() => console.log('setTimeout FINALLY fires'), 0);
\`\`\`

#### Step 4 — Error Handling: setImmediate vs setTimeout(0) Race
\`\`\`js
// race.js — non-deterministic at top level, deterministic in I/O
// Top level (race condition):
for (let i = 0; i < 5; i++) {
  setTimeout(() => console.log('  [top]   timeout', i), 0);
  setImmediate(() => console.log('  [top]   immediate', i));
}

// Inside I/O — deterministic
import { readFile } from 'node:fs';
readFile(import.meta.filename ?? __filename, () => {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => console.log('  [I/O]  timeout', i), 0);
    setImmediate(() => console.log('  [I/O]  immediate', i));
  }
});
\`\`\`

#### Step 5 — Tests
\`\`\`js
// phases.test.js
import { describe, it, expect } from 'vitest';

describe('Node.js phase ordering', () => {
  it('process.nextTick runs before Promise microtask', () => new Promise((done) => {
    const log = [];
    process.nextTick(() => log.push('nt'));
    Promise.resolve().then(() => log.push('pt'));
    setImmediate(() => {
      expect(log).toEqual(['nt', 'pt']);
      done();
    });
  }));

  it('setImmediate fires before setTimeout(0) inside I/O', () => new Promise(async (done) => {
    const { readFile } = await import('node:fs');
    readFile(import.meta.url.replace('file://', ''), () => {
      const log = [];
      setTimeout(() => log.push('to'), 0);
      setImmediate(() => {
        log.push('im');
        setImmediate(() => {
          expect(log).toEqual(['im', 'to']);   // immediate always first
          done();
        });
      });
    });
  }));

  it('microtasks drain between every macrotask', () => new Promise((done) => {
    const log = [];
    setTimeout(() => { log.push('to1'); Promise.resolve().then(() => log.push('pt1')); }, 0);
    setTimeout(() => { log.push('to2'); Promise.resolve().then(() => log.push('pt2')); }, 0);
    setTimeout(() => {
      expect(log).toEqual(['to1', 'pt1', 'to2', 'pt2']);
      done();
    }, 10);
  }));
});
\`\`\`

**Expected Output:**
\`\`\`
1. sync start
2. sync end
3. process.nextTick
4. Promise.then
5. queueMicrotask
6. setTimeout(0)
7. setImmediate
8. I/O callback (readFile)
9. setImmediate inside I/O (always before setTimeout in I/O)
10. setTimeout inside I/O

Drained 1001 nextTicks before phase advanced
setTimeout FINALLY fires
\`\`\`

**Stretch Challenges:**
- [ ] Compare with Bun and Deno — do they have the same six-phase model?
- [ ] Use Worker threads to do CPU work and post messages back via the event loop
- [ ] Profile a real Express server to see the % of time spent in each phase`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Six phases of Node's event loop.
**Q2:** Which is higher priority: process.nextTick or Promise.then?
**Q3:** Write code that proves setImmediate runs before setTimeout(0) inside an I/O callback. From memory.

### Day 3 — Comprehension
**Q4:** Why is setTimeout(0) vs setImmediate ordering non-deterministic at top level?
**Q5:** A junior recursively schedules process.nextTick — the server stops responding. Diagnose.
**Q6:** Refactor to avoid I/O starvation:
\`\`\`js
function processQueue() {
  while (queue.length) handle(queue.shift());   // blocks event loop
}
\`\`\`

### Day 7 — Application
**Q7:** Build a CPU-yielding iterator using setImmediate that processes 10k items without blocking.
**Q8:** A PR adds a tight Promise chain in a server hot path — explain how it blocks I/O.
**Q9:** What's the cost of process.nextTick vs setImmediate per call?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every queue/phase a callback can be in across browser and Node."
**Q11:** Draw: Node event loop with phases + queues + microtask drains between each callback.
**Q12:** ★ System design: "Architect a high-throughput Node server processing 100k req/s — pick scheduling strategies for fairness and latency."`
  },

  // ── 20. settimeout-vs-setinterval ────────────────────────────────────────
  'settimeout-vs-setinterval': {
    feynman: `## FEYNMAN CHECK

### Explain setTimeout vs setInterval Like I'm 10 Years Old
> \`setTimeout(fn, ms)\` schedules fn to run ONCE after at least ms milliseconds. \`setInterval(fn, ms)\` schedules fn to run REPEATEDLY every ms milliseconds. Both return a handle you can cancel with clearTimeout/clearInterval. The non-obvious traps: (1) ms is the MINIMUM delay, not exact — the runtime guarantees "at least" ms, but heavy load can push it later. (2) setInterval does NOT wait for the previous run to FINISH — if your handler takes 200ms and interval is 100ms, runs overlap and queue up. (3) Browsers throttle timers in BACKGROUND TABS to 1000ms minimum (Chrome) to save battery. (4) For animations, NEVER use setInterval — use requestAnimationFrame which syncs with display refresh. Most modern code uses a "self-rescheduling setTimeout" instead of setInterval for predictable spacing.

---

### 5 Deep Conceptual Questions

**Q1: Why does setInterval often misbehave at scale?**
> **A:** setInterval queues a callback at fixed intervals from the START of the timer — not from the END of the previous handler. If handler takes 80ms and interval is 100ms, you get a 20ms gap. If handler suddenly takes 150ms (network slow, GC pause), the runtime queues TWO handlers — they back up and may run back-to-back. Self-rescheduling setTimeout avoids this: \`function tick() { doWork(); setTimeout(tick, 100); }\` — always has the FULL interval after the work finishes.

**Q2: Mental model for timers in the event loop?**
> **A:** Timers go into the TIMERS PHASE queue. The event loop processes them in order of expiry time. setTimeout(fn, 0) actually has a minimum delay of 1ms historically (and 4ms after the 4th nested call). \`queueMicrotask\` or \`setImmediate\` are faster alternatives if you just want "as soon as possible after current sync code." Background tabs throttle to 1000ms minimum to save CPU.

**Q3: Most dangerous misconception?**
> **A:** clearInterval/clearTimeout handle still leaks the closure:
> \`\`\`js
> // ❌ Closure prevents GC even after clear
> function setup() {
>   const bigData = new Array(1e6).fill({ heavy: true });
>   const id = setInterval(() => {
>     console.log(bigData[0]);   // captures bigData
>   }, 1000);
>   // Even after clearInterval(id), if id is reachable, bigData stays
> }
>
> // ✅ Null the handler reference when canceling
> let handler = () => doWork();
> const id = setInterval(handler, 1000);
> clearInterval(id);
> handler = null;   // releases the closure
> \`\`\`

**Q4: How do timers interact with requestAnimationFrame?**
> **A:** requestAnimationFrame is SYNCHRONISED with the browser's vsync (typically 60Hz = 16.67ms per frame). Tasks run BETWEEN microtask drain and the paint step. setTimeout/setInterval are macrotasks — fire on their own schedule, may run multiple times per frame (drops frames) or be delayed by GC. For animations: rAF. For "do work later but not on every frame": setTimeout. For "polling": prefer event-based APIs (Observable, IntersectionObserver, MutationObserver) over interval polling.

**Q5: FAANG-grade definition?**
> **A:** "setTimeout schedules a single callback to fire after at least the specified milliseconds (minimum clamped to 4ms after 5 nested calls per HTML spec); setInterval schedules callbacks at fixed-rate intervals from timer creation, not accounting for handler duration — both processed in the timers phase of the event loop, throttled to 1000ms in inactive tabs, and superseded by requestAnimationFrame for visual updates and by event-driven APIs for state-change reactions."`,
    build: `## BUILD

### 🏗️ Mini Project: Self-Rescheduling Timer vs setInterval — Drift Comparison

**What you will build:** Two timers running the same heavy workload — one with setInterval, one with self-rescheduling setTimeout — visualised with a real-time chart showing how interval drifts as workload increases.
**Why this project:** Forces empirical observation of interval drift — the #1 timer bug in production.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-timers && cd js-timers
ni index.html, app.js -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html><html><body>
  <button id="start">Start both timers</button>
  <button id="stop">Stop</button>
  <h3>setInterval (drifts):</h3><pre id="interval"></pre>
  <h3>Self-rescheduling setTimeout (stable):</h3><pre id="timeout"></pre>
  <script type="module" src="app.js"></script>
</body></html>
\`\`\`

#### Step 3 — Two Timer Implementations
\`\`\`js
// app.js
const $interval = document.getElementById('interval');
const $timeout  = document.getElementById('timeout');

let intervalId, timeoutId;
let intervalLast, timeoutLast;

function heavyWork(ms = 20) {
  const end = performance.now() + ms;
  while (performance.now() < end) {}   // synchronous CPU burn
}

document.getElementById('start').onclick = () => {
  $interval.textContent = '';
  $timeout.textContent  = '';
  intervalLast = timeoutLast = performance.now();

  // ─── setInterval: drifts as work piles up ───
  intervalId = setInterval(() => {
    const now = performance.now();
    const elapsed = (now - intervalLast).toFixed(0);
    $interval.textContent += \`tick — elapsed since last: \${elapsed}ms\\n\`;
    intervalLast = now;
    heavyWork(20);   // simulate work
  }, 100);

  // ─── Self-rescheduling setTimeout: stable spacing ───
  function tick() {
    const now = performance.now();
    const elapsed = (now - timeoutLast).toFixed(0);
    $timeout.textContent += \`tick — elapsed since last: \${elapsed}ms\\n\`;
    timeoutLast = now;
    heavyWork(20);
    timeoutId = setTimeout(tick, 100);
  }
  timeoutId = setTimeout(tick, 100);
};

document.getElementById('stop').onclick = () => {
  clearInterval(intervalId);
  clearTimeout(timeoutId);
};
\`\`\`

#### Step 4 — Error Handling: Throttling + Cleanup
\`\`\`js
// Robust timer wrapper
export function createTimer(fn, intervalMs) {
  let id = null;
  let cancelled = false;

  async function tick() {
    if (cancelled) return;
    const start = performance.now();
    try { await fn(); }
    catch (e) { console.error('Timer fn threw:', e); }
    const elapsed = performance.now() - start;
    const delay = Math.max(0, intervalMs - elapsed);   // adjust for work time
    if (!cancelled) id = setTimeout(tick, delay);
  }

  return {
    start() { if (id === null) tick(); },
    stop()  { cancelled = true; clearTimeout(id); id = null; },
  };
}

// Usage
const timer = createTimer(async () => {
  await fetch('/heartbeat');
}, 5000);
timer.start();
// timer.stop();   when done
\`\`\`

#### Step 5 — Tests
\`\`\`js
// timers.test.js
import { describe, it, expect, vi } from 'vitest';
import { createTimer } from './app.js';

describe('createTimer', () => {
  it('starts and stops cleanly', async () => {
    vi.useFakeTimers();
    let count = 0;
    const t = createTimer(() => count++, 100);
    t.start();
    await vi.advanceTimersByTimeAsync(350);
    expect(count).toBeGreaterThanOrEqual(2);
    t.stop();
    const after = count;
    await vi.advanceTimersByTimeAsync(500);
    expect(count).toBe(after);   // no more increments after stop
    vi.useRealTimers();
  });

  it('caller errors do not stop the timer', async () => {
    vi.useFakeTimers();
    let calls = 0;
    const t = createTimer(() => { calls++; if (calls === 1) throw new Error('x'); }, 10);
    t.start();
    await vi.advanceTimersByTimeAsync(50);
    expect(calls).toBeGreaterThan(1);
    t.stop();
    vi.useRealTimers();
  });
});
\`\`\`

**Expected Output:**
\`\`\`
setInterval (drifts):
tick — elapsed since last: 102ms
tick — elapsed since last: 121ms   ← drifting
tick — elapsed since last: 119ms
tick — elapsed since last: 134ms
...

Self-rescheduling setTimeout (stable):
tick — elapsed since last: 121ms
tick — elapsed since last: 122ms   ← consistent
tick — elapsed since last: 121ms
tick — elapsed since last: 122ms
...
\`\`\`

**Stretch Challenges:**
- [ ] Add a pause-on-tab-hidden (document.visibilityState)
- [ ] Add an exponential-backoff version for retry-with-delay
- [ ] Replace setTimeout with MessageChannel for sub-1ms scheduling`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does setInterval do when the handler takes longer than the interval?
**Q2:** Minimum throttled delay in background tabs?
**Q3:** Write a self-rescheduling setTimeout pattern. From memory.

### Day 3 — Comprehension
**Q4:** Why is setInterval bad for animations? What's the alternative?
**Q5:** A junior uses setInterval for a heartbeat — under load, heartbeats pile up. Diagnose.
**Q6:** Refactor to self-rescheduling:
\`\`\`js
setInterval(async () => {
  const data = await fetchSlowly();   // sometimes takes 2s
  update(data);
}, 1000);
\`\`\`

### Day 7 — Application
**Q7:** Build a debounce that survives rapid tab switching (use Page Visibility API).
**Q8:** A PR sets timeout to 0 expecting immediate execution — show 3 alternatives that are faster.
**Q9:** What's the granularity of setTimeout in modern browsers vs Node?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every consideration for picking between setTimeout, setInterval, rAF, queueMicrotask, and setImmediate."
**Q11:** Draw: drift over time for setInterval(100) when handler takes 80ms / 120ms / 200ms.
**Q12:** ★ System design: "Build a polling layer with adaptive interval based on response latency — what timer pattern, what backoff strategy?"`
  },

  // ── 21. template-literals ────────────────────────────────────────────────
  'template-literals': {
    feynman: `## FEYNMAN CHECK

### Explain Template Literals Like I'm 10 Years Old
> Template literals use BACKTICKS instead of quotes, and let you EMBED EXPRESSIONS inside \`\${...}\`. They support multi-line strings without \\n, and you can use ANY JS expression inside the interpolation — function calls, ternaries, math. The advanced feature is TAGGED TEMPLATES: \`tag\\\`hello \${name}\\\`\` calls \`tag(strings, ...values)\` where strings is an array of the static parts and values are the interpolated values. This is how styled-components writes CSS-in-JS, how SQL libraries safely parameterise queries, and how html template libraries (lit-html) work. The non-obvious detail: the strings array has a special \`.raw\` property with un-escaped versions (so \`\\n\` stays as two chars), used by String.raw and useful for things like regex builders.

---

### 5 Deep Conceptual Questions

**Q1: When are template literals worth it vs '+' concatenation?**
> **A:** ALMOST ALWAYS for strings with variables. \`\\\`Hello, \${name}! You have \${count} messages.\\\`\` is far clearer than \`'Hello, ' + name + '! You have ' + count + ' messages.'\`. They also handle multi-line naturally (no need for '\\\\n' joins). The only case for concatenation: when one operand is undefined/null and you specifically want \`'Hello, ' + null\` → 'Hello, null' (template gives same result via String conversion — no real difference).

**Q2: Mental model for tagged templates?**
> **A:** A tag function receives the literal parts SEPARATED from the dynamic values. \`tag\\\`a\${b}c\${d}e\\\`\` becomes \`tag(['a','c','e'], b, d)\`. The tag can then process the array+values however it wants — escape HTML, inject SQL params, build a styled className. This is the foundation of safe DSLs inside JS: the static text is trusted (developer-written), the values are escaped automatically before being inserted.

**Q3: Most dangerous misconception?**
> **A:** Template literals automatically escape HTML/SQL:
> \`\`\`js
> // ❌ NO escaping — just string concatenation
> const name = '<script>alert(1)</script>';
> document.body.innerHTML = \\\`Welcome, \${name}!\\\`;   // XSS!
>
> // ❌ Same with SQL
> const id = "1' OR '1'='1";
> db.query(\\\`SELECT * FROM users WHERE id = '\${id}'\\\`);   // SQL injection
>
> // ✅ Use a tagged template that escapes
> const safeHtml = (s, ...v) => s.reduce((acc, str, i) =>
>   acc + str + (i < v.length ? escapeHtml(v[i]) : ''), '');
> document.body.innerHTML = safeHtml\\\`Welcome, \${name}!\\\`;
> \`\`\`

**Q4: How does String.raw work?**
> **A:** String.raw is a built-in tag that returns the raw (un-escaped) version of the template. \`String.raw\\\`Line 1\\\\nLine 2\\\`\` returns \`'Line 1\\\\nLine 2'\` (literal backslash-n, two chars) instead of the actual newline. This is essential for: writing regex patterns (\`String.raw\\\`\\\\d+\\\`\` → \`'\\\\d+'\`), Windows paths (\`String.raw\\\`C:\\\\Users\\\\Ana\\\`\`), and anywhere escape sequences must be preserved.

**Q5: FAANG-grade definition?**
> **A:** "Template literals are backtick-delimited string expressions supporting multi-line content and \\\${expression} interpolation — with tagged templates (\\\`tag\\\\\\\`...\\\\\\\`\\\`) invoking a function with the static-string array (plus a .raw property) and interpolated values as separate arguments, providing the foundation for DSL libraries (styled-components, lit-html, gql, parameterised SQL) to safely compose dynamic strings while escaping or transforming interpolated values."`,
    build: `## BUILD

### 🏗️ Mini Project: Safe-HTML Tag + SQL Param Builder + CSS Helper

**What you will build:** Three production-grade tagged template functions: \`html\` (escapes HTML in values), \`sql\` (collects values as parameters, returns parameterized query), and \`css\` (auto-prefixes vendor properties).
**Why this project:** Forces every tagged-template pattern in real-world use.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-templates && cd js-templates
npm init -y && npm install -D vitest
ni tags.js, tags.test.js -ItemType File
\`\`\`

#### Step 2 — Tagged Template Library
\`\`\`js
// tags.js

// 1. html — escapes interpolated values
const HTML_ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => HTML_ESCAPE[c]); }

export function html(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    const value = i < values.length
      ? (Array.isArray(values[i]) ? values[i].join('') : escapeHtml(values[i]))
      : '';
    return acc + str + value;
  }, '');
}

// 2. sql — parameterises (compatible with pg / mysql2)
export function sql(strings, ...values) {
  const text = strings.reduce((acc, str, i) =>
    acc + str + (i < values.length ? \`$\${i + 1}\` : ''), '');
  return { text, values };
}

// 3. css — vendor prefixing + minification
const VENDOR_PROPS = ['transform', 'transition', 'user-select', 'appearance'];
export function css(strings, ...values) {
  const raw = strings.reduce((acc, str, i) => acc + str + (i < values.length ? values[i] : ''), '');
  return raw.replace(/^(\\s*)([a-z-]+)(\\s*:\\s*[^;]+;)/gm, (_, indent, prop, rest) => {
    if (VENDOR_PROPS.includes(prop)) {
      return \`\${indent}-webkit-\${prop}\${rest}\\n\${indent}-moz-\${prop}\${rest}\\n\${indent}\${prop}\${rest}\`;
    }
    return _;
  });
}
\`\`\`

#### Step 3 — Use Them
\`\`\`js
// demo.js
import { html, sql, css } from './tags.js';

const name = '<script>alert(1)</script>';
const userIds = [1, 2, 3];

// HTML — escapes the script tag automatically
const greeting = html\`<p>Hello, \${name}!</p>\`;
console.log(greeting);
// <p>Hello, &lt;script&gt;alert(1)&lt;/script&gt;!</p>

// SQL — produces parameterised query, no injection possible
const query = sql\`SELECT * FROM users WHERE id IN (\${userIds[0]}, \${userIds[1]}, \${userIds[2]}) AND name = \${name}\`;
console.log(query);
// { text: 'SELECT * FROM users WHERE id IN ($1, $2, $3) AND name = $4',
//   values: [1, 2, 3, '<script>alert(1)</script>'] }

// CSS — auto-prefixes
const styles = css\`
  .btn {
    transform: rotate(45deg);
    transition: all 0.3s ease;
    color: blue;
  }
\`;
console.log(styles);

// Array interpolation
const items = ['apple', 'banana', 'cherry'];
const list = html\`<ul>\${items.map(i => html\`<li>\${i}</li>\`)}</ul>\`;
console.log(list);
\`\`\`

#### Step 4 — Error Handling: String.raw For Regex/Paths
\`\`\`js
// rawDemo.js
// Without String.raw — backslash escapes are processed
const regex1 = /\\d+/;   // works
const str1 = '\\d+';     // 'd+' — backslash escapes the d!

// With String.raw — backslashes preserved as literals
const str2 = String.raw\`\\d+\`;   // '\\d+' — two chars
const regex2 = new RegExp(String.raw\`\\d{3}-\\d{4}\`);
console.log(regex2.test('555-1234'));   // true

// Windows paths
const path = String.raw\`C:\\Users\\Ana\\Documents\`;
console.log(path);   // C:\\Users\\Ana\\Documents (literal backslashes)
\`\`\`

#### Step 5 — Tests
\`\`\`js
// tags.test.js
import { describe, it, expect } from 'vitest';
import { html, sql, css } from './tags.js';

describe('html tag', () => {
  it('escapes HTML entities in interpolated values', () => {
    const r = html\`<p>\${'<script>'}</p>\`;
    expect(r).toBe('<p>&lt;script&gt;</p>');
  });
  it('does NOT escape static parts (developer-trusted)', () => {
    const r = html\`<b>\${'safe'}</b>\`;
    expect(r).toBe('<b>safe</b>');
  });
  it('joins arrays without re-escaping', () => {
    const r = html\`<ul>\${[1, 2, 3].map(n => html\`<li>\${n}</li>\`)}</ul>\`;
    expect(r).toContain('<li>1</li><li>2</li>');
  });
});

describe('sql tag', () => {
  it('produces parameterised query', () => {
    const q = sql\`SELECT * WHERE id = \${42} AND name = \${'Ana'}\`;
    expect(q.text).toBe('SELECT * WHERE id = $1 AND name = $2');
    expect(q.values).toEqual([42, 'Ana']);
  });
});

describe('css tag', () => {
  it('auto-prefixes vendor properties', () => {
    const r = css\`.x { transform: scale(2); }\`;
    expect(r).toContain('-webkit-transform');
    expect(r).toContain('-moz-transform');
    expect(r).toContain('transform: scale(2);');
  });
  it('leaves non-vendor properties alone', () => {
    const r = css\`.x { color: blue; }\`;
    expect(r).not.toContain('-webkit-color');
  });
});
\`\`\`

**Expected Output:**
\`\`\`
<p>Hello, &lt;script&gt;alert(1)&lt;/script&gt;!</p>
{ text: 'SELECT * FROM users WHERE id IN ($1, $2, $3) AND name = $4',
  values: [1, 2, 3, '<script>alert(1)</script>'] }
.btn {
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  transform: rotate(45deg);
  ...
}
<ul><li>apple</li><li>banana</li><li>cherry</li></ul>
true
C:\\Users\\Ana\\Documents

# All tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add a graphql tag that validates query syntax at runtime
- [ ] Cache the compiled output of repeated template calls
- [ ] Build a typed version (TypeScript) that infers param types`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Two main advantages of template literals over string concatenation.
**Q2:** What does a tag function receive?
**Q3:** Write a multi-line template with two interpolations. From memory.

### Day 3 — Comprehension
**Q4:** Do template literals escape HTML? Show with a 3-line XSS demo.
**Q5:** A junior writes \`exec(\\\`echo \${userInput}\\\`)\` — explain the command injection risk.
**Q6:** Refactor to a tagged template:
\`\`\`js
const safe = (str, val) => str + escapeHtml(val);
const html = safe('<p>Hello ', userName) + '</p>';
\`\`\`

### Day 7 — Application
**Q7:** Build a typed translate('greeting', { name }) using template literals + lookup.
**Q8:** A PR uses raw template literals for DB queries — patch with sql tag and explain SQL injection.
**Q9:** What's the perf cost of tagged templates vs concat at high call-rate?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Implement html\\\`...\\\` from scratch with HTML escaping and array handling."
**Q11:** Draw: how a tagged call \\\`tag\\\\\\\`a\\\${b}c\\\${d}\\\\\\\`\\\` decomposes into tag(strings, ...values).
**Q12:** ★ System design: "Architect i18n for a 30-language SaaS — pick between template-literal tags, ICU MessageFormat, and full i18n libraries."`
  },

  // ── 22. symbol-and-iterators ─────────────────────────────────────────────
  'symbol-and-iterators': {
    feynman: `## FEYNMAN CHECK

### Explain Symbols & Iterators Like I'm 10 Years Old
> A SYMBOL is a UNIQUE, UNFORGEABLE value. \`Symbol('x') !== Symbol('x')\` — they're always different. Used as object keys, they create "hidden" properties invisible to JSON.stringify, Object.keys, for...in. Well-known symbols (\`Symbol.iterator\`, \`Symbol.asyncIterator\`, \`Symbol.toPrimitive\`) are how JS hooks behaviour into your objects. \`Symbol.iterator\`: any object with a method at this key becomes ITERABLE — usable with for...of, spread, destructuring. The non-obvious power: you can make ANY class iterable by adding \`[Symbol.iterator]\`: \`for (const x of myCustomList) ...\`. Symbol.asyncIterator gives you \`for await...of\` for streams. This is how Node streams, async generators, and observable libraries integrate with built-in language syntax.

---

### 5 Deep Conceptual Questions

**Q1: What problem do Symbols solve?**
> **A:** Three things: (1) PROPERTY COLLISIONS — when libraries patch your objects (\`obj.__internalId = ...\`), they may clash with future spec additions or other libs. Symbols guarantee uniqueness — only the holder can access. (2) PROTOCOL HOOKS — Symbol.iterator, Symbol.toPrimitive let JS extend behaviour without reserving new keywords. (3) ENUMS — \`const RED = Symbol('red')\` for true unique constants (though typed-enums via TS literal-unions are more common today).

**Q2: Mental model for the iterator protocol?**
> **A:** An iterable is anything implementing \`[Symbol.iterator]()\` — which returns an ITERATOR (an object with a \`.next()\` method returning \`{ value, done }\`). When you write \`for (const x of arr)\`, JS calls \`arr[Symbol.iterator]()\`, then \`.next()\` repeatedly until done is true. Spread, destructuring \`[a, b] = iterable\`, Array.from all use the same protocol. Async iterators add Symbol.asyncIterator + Promises.

**Q3: Most dangerous misconception?**
> **A:** Symbols are private:
> \`\`\`js
> // ❌ Symbols are NOT private — anyone can find them
> const obj = { [Symbol('secret')]: 'value' };
> console.log(Object.getOwnPropertySymbols(obj));   // [Symbol(secret)]
> const [sym] = Object.getOwnPropertySymbols(obj);
> console.log(obj[sym]);   // 'value' — fully accessible
>
> // ✅ For TRUE privacy, use #private class fields (ES2022)
> class Secret {
>   #data;
>   constructor(d) { this.#data = d; }
> }
> \`\`\`

**Q4: How do generators relate to iterators?**
> **A:** A generator function (\`function*\`) AUTOMATICALLY produces an object that implements both the iterator protocol AND the iterable protocol — \`gen[Symbol.iterator]()\` returns gen itself. \`yield\` pauses, \`gen.next()\` resumes. This makes generators the easiest way to create iterables without manually writing the .next() state machine. Async generators (\`async function*\`) plug into for-await-of for streams.

**Q5: FAANG-grade definition?**
> **A:** "Symbols are unique, unforgeable JavaScript primitives used as object keys to avoid collision and as well-known protocol hooks (Symbol.iterator for synchronous iteration, Symbol.asyncIterator for async, Symbol.toPrimitive for coercion, Symbol.hasInstance for instanceof) — the iterator protocol is any object exposing a .next() method returning {value, done}, with iterables exposing [Symbol.iterator]() returning an iterator — collectively forming the foundation of for...of, spread, destructuring, async streams, and Node.js's Readable streams."`,
    build: `## BUILD

### 🏗️ Mini Project: Make A LinkedList Iterable + Build A Range Generator

**What you will build:** A LinkedList class that works with for...of and spread by implementing Symbol.iterator, plus a range() generator with step and reverse — usable everywhere an iterable is expected.
**Why this project:** Forces hands-on implementation of the iterator protocol — the foundation of all "for...of magic."
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-symbols && cd js-symbols
npm init -y && npm install -D vitest
ni iterables.js, iterables.test.js -ItemType File
\`\`\`

#### Step 2 — Iterable LinkedList
\`\`\`js
// iterables.js
export class LinkedList {
  constructor() { this.head = null; this.tail = null; this.size = 0; }

  push(value) {
    const node = { value, next: null };
    if (!this.head) { this.head = node; this.tail = node; }
    else { this.tail.next = node; this.tail = node; }
    this.size++;
    return this;
  }

  // Iterator protocol — makes LinkedList work with for...of, spread, [...list]
  *[Symbol.iterator]() {
    let current = this.head;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }
}
\`\`\`

#### Step 3 — Range Generator
\`\`\`js
// range.js
export function* range(start, end, step = 1) {
  if (step === 0) throw new Error('step cannot be zero');
  if (step > 0) {
    for (let i = start; i < end; i += step) yield i;
  } else {
    for (let i = start; i > end; i += step) yield i;
  }
}

// Compose with other iterables
export function* take(iterable, n) {
  let count = 0;
  for (const x of iterable) {
    if (count++ >= n) return;
    yield x;
  }
}

export function* map(iterable, fn) {
  for (const x of iterable) yield fn(x);
}

export function* filter(iterable, pred) {
  for (const x of iterable) if (pred(x)) yield x;
}
\`\`\`

#### Step 4 — Error Handling: Symbols For Real Use
\`\`\`js
// hidden.js
const REGISTRY = Symbol('__registry');
const VALIDATED = Symbol('__validated');

export class Plugin {
  constructor(name) {
    this.name = name;
    this[REGISTRY] = new Map();   // hidden from JSON / for-in / Object.keys
    this[VALIDATED] = false;
  }
  register(key, fn) { this[REGISTRY].set(key, fn); }
  invoke(key, ...args) { return this[REGISTRY].get(key)?.(...args); }
  validate() { this[VALIDATED] = true; }
}

const p = new Plugin('auth');
p.register('login', (u) => 'logged in ' + u);

console.log(Object.keys(p));        // ['name']  — symbols hidden
console.log(JSON.stringify(p));     // {"name":"auth"}  — symbols stripped
console.log(p.invoke('login', 'Ana'));   // works
\`\`\`

#### Step 5 — Use Everything
\`\`\`js
// demo.js
import { LinkedList } from './iterables.js';
import { range, take, map, filter } from './range.js';

const list = new LinkedList();
[1, 2, 3, 4, 5].forEach(n => list.push(n));

// for...of just works
for (const v of list) console.log('iter:', v);

// Spread
console.log([...list]);                          // [1, 2, 3, 4, 5]
console.log(Math.max(...list));                  // 5

// Destructuring
const [first, second, ...rest] = list;
console.log({ first, second, rest });

// Generator composition
console.log([...take(range(1, Infinity), 5)]);   // [1, 2, 3, 4, 5]
console.log([...filter(map(range(1, 10), n => n * n), x => x > 20)]);
// [25, 36, 49, 64, 81]

// Range counting backwards
console.log([...range(10, 0, -2)]);   // [10, 8, 6, 4, 2]
\`\`\`

#### Step 6 — Tests
\`\`\`js
// iterables.test.js
import { describe, it, expect } from 'vitest';
import { LinkedList } from './iterables.js';
import { range, take, map, filter } from './range.js';

describe('LinkedList iterable', () => {
  it('works with for...of', () => {
    const list = new LinkedList();
    list.push('a').push('b').push('c');
    const result = [];
    for (const v of list) result.push(v);
    expect(result).toEqual(['a', 'b', 'c']);
  });
  it('works with spread', () => {
    const list = new LinkedList();
    [1, 2, 3].forEach(n => list.push(n));
    expect([...list]).toEqual([1, 2, 3]);
  });
  it('works with destructuring', () => {
    const list = new LinkedList();
    [10, 20, 30].forEach(n => list.push(n));
    const [a, b] = list;
    expect([a, b]).toEqual([10, 20]);
  });
});

describe('range', () => {
  it('counts forward', () => {
    expect([...range(0, 5)]).toEqual([0, 1, 2, 3, 4]);
  });
  it('respects step', () => {
    expect([...range(0, 10, 2)]).toEqual([0, 2, 4, 6, 8]);
  });
  it('counts backward', () => {
    expect([...range(5, 0, -1)]).toEqual([5, 4, 3, 2, 1]);
  });
  it('rejects step 0', () => {
    expect(() => [...range(0, 5, 0)]).toThrow();
  });
});

describe('lazy operators', () => {
  it('take is lazy — works on infinite iterables', () => {
    expect([...take(range(1, Infinity), 3)]).toEqual([1, 2, 3]);
  });
  it('map and filter compose', () => {
    const r = [...filter(map(range(1, 11), n => n * 2), n => n > 10)];
    expect(r).toEqual([12, 14, 16, 18, 20]);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
iter: 1
iter: 2
iter: 3
iter: 4
iter: 5
[ 1, 2, 3, 4, 5 ]
5
{ first: 1, second: 2, rest: [ 3, 4, 5 ] }
[ 1, 2, 3, 4, 5 ]
[ 25, 36, 49, 64, 81 ]
[ 10, 8, 6, 4, 2 ]

# 10/10 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add async iterator support (Symbol.asyncIterator) to LinkedList
- [ ] Add reduce as a non-lazy terminal operator
- [ ] Implement zip(a, b) yielding tuples from two iterables`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does \`Symbol('x') === Symbol('x')\` return?
**Q2:** What does the iterator protocol require?
**Q3:** Write a generator that yields 1, 2, 3. From memory.

### Day 3 — Comprehension
**Q4:** Are Symbols private? How could someone access symbol-keyed properties?
**Q5:** A junior writes a class but can't use it with for...of — diagnose.
**Q6:** Make this object iterable:
\`\`\`js
const counter = { from: 1, to: 5 };
\`\`\`

### Day 7 — Application
**Q7:** Build a lazy infinite Fibonacci generator usable with take(n).
**Q8:** A PR adds Symbol.toPrimitive — explain when it's invoked.
**Q9:** What's the cost of yield vs raw .next() iteration?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how for-of, spread, and destructuring all use Symbol.iterator."
**Q11:** Draw: state machine for an iterator yielding 3 values then done.
**Q12:** ★ System design: "Architect a streaming JSON parser using async iterators — what backpressure, what buffering?"`
  },

  // ── 23. generators ───────────────────────────────────────────────────────
  'generators': {
    feynman: `## FEYNMAN CHECK

### Explain Generators Like I'm 10 Years Old
> A generator is a FUNCTION YOU CAN PAUSE. Declared with \`function*\` (note the asterisk). Inside, \`yield expr\` pauses execution and produces \`{value: expr, done: false}\` to the caller. The next \`.next()\` call resumes from where it paused. \`yield\`'s expression is the VALUE returned to the caller; \`.next(arg)\`'s arg becomes the RESULT of yield inside the generator — making it BIDIRECTIONAL communication. Generators are perfect for: lazy sequences, infinite streams, custom iterators, coroutines, simple state machines. The non-obvious power: \`async function*\` (async generator) lets you \`yield await fetch(...)\` — combined with \`for await...of\`, this is the foundation of Node.js streams, server-sent events, and observable patterns.

---

### 5 Deep Conceptual Questions

**Q1: What problem do generators solve over plain functions?**
> **A:** Three things: (1) LAZY EVALUATION — yield only when asked; an infinite Fibonacci sequence doesn't blow memory. (2) STATE MACHINE simplicity — yield in a loop expresses "produce value, wait, continue from here" without manual state-tracking. (3) COROUTINES — \`.next(arg)\` lets the caller send data IN, enabling two-way communication between caller and callee (used by redux-saga to model side effects as effects yielded to the runtime).

**Q2: Mental model for generator execution?**
> **A:** "A generator FUNCTION is a factory; calling it returns a paused-at-the-start iterator. Each .next() runs until the next yield (or return) and returns {value, done}. The yield's expression is sent to the caller AS value; the caller's .next(arg) sends arg back INTO the generator as the yield expression's result." Pause-and-resume — the generator's local state (variables, position) is preserved across yields.

**Q3: Most dangerous misconception?**
> **A:** Generators are async by default:
> \`\`\`js
> // ❌ Sync generator — yields immediately, no async involved
> function* gen() { yield fetch('/api'); }   // yields the Promise, not the resolved value
> const it = gen();
> console.log(it.next().value);   // Promise<Response> — caller must await
>
> // ✅ Use ASYNC generator for async yield
> async function* asyncGen() {
>   const data = await fetch('/api').then(r => r.json());
>   yield data;
> }
> for await (const item of asyncGen()) console.log(item);
> \`\`\`

**Q4: How do generators interact with try/catch and return?**
> **A:** \`gen.throw(err)\` injects err AT THE current yield point — the generator can catch it with try/catch around the yield. \`gen.return(value)\` finishes the generator early, running any finally blocks. This makes generators a clean way to implement resource cleanup (close DB connection in finally regardless of how iteration ended). for-of automatically calls gen.return() if the loop is broken early.

**Q5: FAANG-grade definition?**
> **A:** "Generators are JavaScript functions declared with function* that produce iterator objects supporting lazy, pausable execution via yield expressions — with bidirectional communication via .next(value) and exception injection via .throw(error) — and async generators (async function*) integrating with for-await-of for asynchronous streaming — collectively enabling lazy sequences, coroutines, simple state machines, and the underpinning of effect-based libraries like redux-saga."`,
    build: `## BUILD

### 🏗️ Mini Project: Async Generator Streaming A Paginated API + Backpressure

**What you will build:** An async generator that paginates through a REST API, yielding records one at a time, with proper cancellation and the for-await-of consumer pattern.
**Why this project:** Forces async generators, pagination, and consumer-driven flow — the foundation of every modern streaming API.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-generators && cd js-generators
npm init -y && npm install -D vitest
ni gen.js, gen.test.js -ItemType File
\`\`\`

#### Step 2 — Async Pagination Generator
\`\`\`js
// gen.js

// Fake API returning pages of users
async function fetchPage(page) {
  await new Promise(r => setTimeout(r, 50));   // simulate latency
  if (page > 5) return { data: [], hasMore: false };
  return {
    data: Array.from({ length: 10 }, (_, i) => ({ id: page * 10 + i, name: \`User \${page * 10 + i}\` })),
    hasMore: page < 5,
  };
}

// Async generator yields ONE user at a time, fetching pages on demand
export async function* paginate(signal) {
  let page = 0;
  while (true) {
    if (signal?.aborted) return;
    const { data, hasMore } = await fetchPage(page++);
    for (const item of data) {
      if (signal?.aborted) return;
      yield item;
    }
    if (!hasMore) return;
  }
}

// Composable: take only first N
export async function* take(asyncIter, n) {
  let i = 0;
  for await (const x of asyncIter) {
    if (i++ >= n) return;
    yield x;
  }
}

// Composable: filter
export async function* filter(asyncIter, pred) {
  for await (const x of asyncIter) if (await pred(x)) yield x;
}
\`\`\`

#### Step 3 — Sync Generators For Coroutines
\`\`\`js
// coroutine.js
// State machine via generator
export function* trafficLight() {
  while (true) {
    yield 'green';
    yield 'yellow';
    yield 'red';
  }
}

// Bidirectional — caller sends control
export function* interactiveSum() {
  let total = 0;
  while (true) {
    const n = yield total;     // yields current total, awaits next number
    if (n === null) return total;
    total += n;
  }
}

const it = interactiveSum();
it.next();             // start: yields 0
console.log(it.next(5).value);   // 5
console.log(it.next(10).value);  // 15
console.log(it.next(20).value);  // 35
console.log(it.next(null).value); // 35 (done)
\`\`\`

#### Step 4 — Error Handling: Cleanup On Early Break
\`\`\`js
// cleanup.js
export function* withDbConnection(db) {
  console.log('Opening DB connection');
  try {
    yield db.query('SELECT 1');
    yield db.query('SELECT 2');
    yield db.query('SELECT 3');
  } finally {
    console.log('Closing DB connection');   // ALWAYS runs, even on early break
    db.close();
  }
}

// Even if caller breaks early, finally runs
const fakeDb = { query: (q) => 'result of ' + q, close: () => console.log('closed!') };
for (const result of withDbConnection(fakeDb)) {
  console.log(result);
  break;   // early exit — finally still runs
}
\`\`\`

#### Step 5 — Use Everything
\`\`\`js
// demo.js
import { paginate, take, filter } from './gen.js';
import { trafficLight } from './coroutine.js';

// Sync generator
const light = trafficLight();
for (let i = 0; i < 6; i++) console.log(light.next().value);
// green, yellow, red, green, yellow, red

// Async pagination — only fetch what we consume
const controller = new AbortController();
const first5 = take(paginate(controller.signal), 5);
for await (const user of first5) console.log('Got user:', user.id);

// Filtering inline
console.log('--- only even IDs, first 3 ---');
const evenOnly = take(filter(paginate(controller.signal), u => u.id % 2 === 0), 3);
for await (const user of evenOnly) console.log('Even user:', user.id);

// Cancel mid-stream
const ctrl2 = new AbortController();
setTimeout(() => ctrl2.abort(), 100);
let count = 0;
for await (const _ of paginate(ctrl2.signal)) count++;
console.log('Got', count, 'before cancel');
\`\`\`

#### Step 6 — Tests
\`\`\`js
// gen.test.js
import { describe, it, expect } from 'vitest';
import { paginate, take, filter } from './gen.js';
import { trafficLight, interactiveSum } from './coroutine.js';

describe('generators', () => {
  it('trafficLight cycles forever', () => {
    const it = trafficLight();
    expect(it.next().value).toBe('green');
    expect(it.next().value).toBe('yellow');
    expect(it.next().value).toBe('red');
    expect(it.next().value).toBe('green');   // cycles
  });

  it('interactiveSum is bidirectional', () => {
    const it = interactiveSum();
    it.next();
    expect(it.next(5).value).toBe(5);
    expect(it.next(10).value).toBe(15);
  });
});

describe('async generators', () => {
  it('paginate yields all items lazily', async () => {
    const ids = [];
    for await (const u of paginate()) ids.push(u.id);
    expect(ids.length).toBe(50);   // 5 pages × 10 items
  });

  it('take stops the underlying generator early', async () => {
    const ids = [];
    for await (const u of take(paginate(), 3)) ids.push(u.id);
    expect(ids).toEqual([0, 1, 2]);
  });

  it('filter composes correctly', async () => {
    const ids = [];
    for await (const u of take(filter(paginate(), u => u.id % 5 === 0), 4)) ids.push(u.id);
    expect(ids).toEqual([0, 5, 10, 15]);
  });

  it('AbortSignal cancels mid-stream', async () => {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 75);
    let count = 0;
    for await (const _ of paginate(ctrl.signal)) count++;
    expect(count).toBeLessThan(50);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
green
yellow
red
green
yellow
red
Got user: 0
Got user: 1
Got user: 2
Got user: 3
Got user: 4
--- only even IDs, first 3 ---
Even user: 0
Even user: 2
Even user: 4
Got 10 before cancel

# All 7 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add concurrent paginate that overlaps fetches (lookahead)
- [ ] Implement merge(asyncIter1, asyncIter2) that interleaves both
- [ ] Compare with RxJS Observable for the same use case`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Syntax to declare a generator vs async generator.
**Q2:** What does yield's expression become to the caller?
**Q3:** Write a generator yielding 1, 2, 3. From memory.

### Day 3 — Comprehension
**Q4:** Why does for-of automatically call gen.return() on early break?
**Q5:** A junior writes \`function gen() { yield 1 }\` (no asterisk) — what happens?
**Q6:** Refactor to lazy generator:
\`\`\`js
function getAll() { return arr.map(transform).filter(test).slice(0, 10); }
// arr is 1M items — wasted work!
\`\`\`

### Day 7 — Application
**Q7:** Build an async generator that streams CSV rows from a fetch response.
**Q8:** A PR uses gen.throw inside a try/catch in the generator — explain the mechanics.
**Q9:** What's the perf overhead of yield vs raw iteration?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain how redux-saga uses generators to model side effects."
**Q11:** Draw: state diagram of a generator (suspended → running → suspended at yield → done).
**Q12:** ★ System design: "Stream-process 100GB of JSON-lines — generators vs streams vs workers, which wins?"`
  },

  // ── 24. proxy-and-reflect ────────────────────────────────────────────────
  'proxy-and-reflect': {
    feynman: `## FEYNMAN CHECK

### Explain Proxy & Reflect Like I'm 10 Years Old
> Proxy lets you INTERCEPT operations on an object — \`get\`, \`set\`, \`has\`, \`delete\`, \`call\` (for functions), \`apply\`, \`construct\`, even \`Object.keys\`. You create \`new Proxy(target, handler)\` where handler defines TRAP functions for each operation. Reflect provides the DEFAULT IMPLEMENTATIONS of every trap as methods (\`Reflect.get(target, prop)\`, \`Reflect.set(target, prop, value)\`) — so handlers can selectively customise and pass through. Together they enable: reactive frameworks (Vue 3, MobX 6), property validation, lazy loading, access logging, virtual objects, mocking libraries. The non-obvious detail: a Proxy is OBSERVATIONALLY INDISTINGUISHABLE from the target for most uses — but \`===\` compares Proxy and target as different references. Some operations (e.g. internal-slot access on Date or Map) bypass Proxy traps.

---

### 5 Deep Conceptual Questions

**Q1: What problem do Proxy & Reflect fundamentally solve?**
> **A:** Programmatic metaprogramming — customising the FUNDAMENTAL behavior of objects at the language level. Before Proxy (pre-ES6), you could only customize via getters/setters per-property (Object.defineProperty) — slow, verbose, no support for dynamic property lookup. Proxy intercepts ALL operations uniformly, enabling clean implementations of: Vue 3's reactivity (auto-subscribe to property reads, auto-notify on writes), validation wrappers (reject invalid values at set time), data binding, sandboxing for plugin systems.

**Q2: Mental model for traps?**
> **A:** Think of Proxy as a TRANSLATOR sitting between the caller and the target. Every operation the caller performs goes through your handler first. If you don't define a trap, the operation forwards to the target (default behavior). Inside a trap, \`Reflect.get(target, prop)\` (or \`.set\`, etc.) gives you the default — call it to "let the operation through", or replace it entirely. This is decorator-pattern at the language level.

**Q3: Most dangerous misconception?**
> **A:** Proxy can intercept built-in object internals:
> \`\`\`js
> // ❌ Proxy CANNOT intercept Map/Set internal slots
> const mapProxy = new Proxy(new Map(), {
>   set(t, p, v) { console.log('set'); return Reflect.set(t, p, v); }
> });
> mapProxy.set('k', 'v');   // No log — Map.set uses internal slots, bypassing the proxy
> console.log(mapProxy.get('k'));   // undefined!
>
> // ✅ For Map/Set, wrap each method explicitly
> const mapProxy = new Proxy(new Map(), {
>   get(t, p) {
>     const value = Reflect.get(t, p);
>     return typeof value === 'function' ? value.bind(t) : value;
>   }
> });
> \`\`\`

**Q4: How does Vue 3's reactivity use Proxy?**
> **A:** Vue 3 wraps every reactive object in a Proxy. The \`get\` trap registers the CURRENT EFFECT (the rendering function being executed) as a subscriber to that property. The \`set\` trap notifies all subscribers, re-running effects (re-rendering components that read that property). This achieves "automatic dependency tracking" — no manual subscriptions needed. The replacement for Vue 2's Object.defineProperty approach (which couldn't detect new property additions, array index sets, etc.).

**Q5: FAANG-grade definition?**
> **A:** "Proxy is JavaScript's metaprogramming primitive — wrapping a target object with a handler whose traps intercept fundamental operations (property access, assignment, deletion, function invocation, construction, prototype access, descriptor queries) — paired with Reflect, which provides the default implementations of every trap as static methods enabling clean trap composition — collectively powering reactive frameworks, validation layers, mocking libraries, and virtual-object patterns, with limitations around built-in internal-slot operations on Date, Map, Set, WeakMap, and Promise."`,
    build: `## BUILD

### 🏗️ Mini Project: Mini Reactive System (Vue-Style) Using Proxy

**What you will build:** A reactive() factory that wraps objects so writes auto-notify reads — a tiny clone of Vue 3's reactivity using Proxy + Reflect — and an effect(fn) helper that re-runs when its dependencies change.
**Why this project:** Forces the exact pattern that powers Vue, MobX, Valtio, and Solid.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-proxy && cd js-proxy
npm init -y && npm install -D vitest
ni reactive.js, reactive.test.js -ItemType File
\`\`\`

#### Step 2 — Reactive Core
\`\`\`js
// reactive.js
let currentEffect = null;
const targetMap = new WeakMap();   // target -> (key -> Set<effect>)

function track(target, key) {
  if (!currentEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));
  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, (dep = new Set()));
  dep.add(currentEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  const dep = depsMap?.get(key);
  if (!dep) return;
  for (const effect of [...dep]) effect();
}

export function reactive(target) {
  return new Proxy(target, {
    get(t, key, receiver) {
      const result = Reflect.get(t, key, receiver);
      track(t, key);
      return typeof result === 'object' && result !== null ? reactive(result) : result;
    },
    set(t, key, value, receiver) {
      const oldValue = t[key];
      const result = Reflect.set(t, key, value, receiver);
      if (oldValue !== value) trigger(t, key);
      return result;
    },
    deleteProperty(t, key) {
      const result = Reflect.deleteProperty(t, key);
      trigger(t, key);
      return result;
    },
  });
}

export function effect(fn) {
  const run = () => {
    currentEffect = run;
    try { fn(); }
    finally { currentEffect = null; }
  };
  run();
  return run;
}
\`\`\`

#### Step 3 — Use It
\`\`\`js
// demo.js
import { reactive, effect } from './reactive.js';

const state = reactive({ count: 0, user: { name: 'Ana' }, items: [] });

// Effect re-runs whenever any property IT READS changes
effect(() => {
  console.log(\`count is \${state.count}, user is \${state.user.name}\`);
});

state.count = 1;             // logs: count is 1, user is Ana
state.count = 2;             // logs: count is 2, user is Ana
state.user.name = 'Bob';     // logs: count is 2, user is Bob  (deep reactivity!)
state.unused = 'foo';        // no log — effect didn't read 'unused'

// Computed via effect + reactive
const computed = reactive({ doubled: 0 });
effect(() => { computed.doubled = state.count * 2; });
state.count = 5;
console.log(computed.doubled);   // 10
\`\`\`

#### Step 4 — Error Handling: Validation Proxy
\`\`\`js
// validate.js
export function validated(target, schema) {
  return new Proxy(target, {
    set(t, key, value) {
      const validator = schema[key];
      if (validator && !validator(value)) {
        throw new TypeError(\`Invalid value for "\${key}": \${value}\`);
      }
      return Reflect.set(t, key, value);
    },
  });
}

const user = validated({ age: 0, name: '' }, {
  age:  v => Number.isInteger(v) && v >= 0 && v <= 120,
  name: v => typeof v === 'string' && v.length > 0,
});

user.age  = 30;       // ok
user.name = 'Ana';    // ok
try { user.age = -1; }     catch (e) { console.log('caught:', e.message); }
try { user.name = ''; }    catch (e) { console.log('caught:', e.message); }
\`\`\`

#### Step 5 — Tests
\`\`\`js
// reactive.test.js
import { describe, it, expect, vi } from 'vitest';
import { reactive, effect } from './reactive.js';
import { validated } from './validate.js';

describe('reactive', () => {
  it('re-runs effect on property change', () => {
    const s = reactive({ x: 0 });
    const spy = vi.fn();
    effect(() => { spy(s.x); });
    expect(spy).toHaveBeenCalledTimes(1);
    s.x = 1;
    expect(spy).toHaveBeenCalledTimes(2);
    s.x = 1;   // same value
    expect(spy).toHaveBeenCalledTimes(2);   // no re-run
  });

  it('tracks only read properties', () => {
    const s = reactive({ a: 0, b: 0 });
    const spy = vi.fn();
    effect(() => { spy(s.a); });
    s.b = 99;
    expect(spy).toHaveBeenCalledTimes(1);   // unaffected
  });

  it('deep reactivity for nested objects', () => {
    const s = reactive({ user: { name: 'Ana' } });
    const spy = vi.fn();
    effect(() => { spy(s.user.name); });
    s.user.name = 'Bob';
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

describe('validated proxy', () => {
  it('allows valid sets', () => {
    const u = validated({ n: 0 }, { n: v => v > 0 });
    u.n = 5;
    expect(u.n).toBe(5);
  });
  it('throws on invalid sets', () => {
    const u = validated({ n: 0 }, { n: v => v > 0 });
    expect(() => { u.n = -1; }).toThrow(TypeError);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
count is 0, user is Ana
count is 1, user is Ana
count is 2, user is Ana
count is 2, user is Bob
10
caught: Invalid value for "age": -1
caught: Invalid value for "name":

# All tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add computed(getter) — like Vue's computed properties, lazy + cached
- [ ] Add a Map/Set handler so reactive(new Map()) works
- [ ] Build a snapshot/restore feature using Proxy + structuredClone`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between Proxy and Object.defineProperty?
**Q2:** What does Reflect provide?
**Q3:** Write a Proxy that logs every property access. From memory.

### Day 3 — Comprehension
**Q4:** Why does Proxy fail to intercept Map.set/get without special handling?
**Q5:** A junior uses Proxy on a Date — methods throw. Diagnose.
**Q6:** Add validation to this setter:
\`\`\`js
const config = { timeout: 5000 };
config.timeout = -1;   // should throw
\`\`\`

### Day 7 — Application
**Q7:** Build a Proxy that warns on use of deprecated property names with rename hints.
**Q8:** A PR wraps every API response in a Proxy for lazy loading — explain the trade-offs.
**Q9:** What's the perf cost of Proxy property access vs direct access?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how Vue 3's reactivity works using Proxy + WeakMap."
**Q11:** Draw: every trap Proxy supports and the operation it intercepts.
**Q12:** ★ System design: "Architect a security sandbox for third-party JS using Proxy — what traps, what limits?"`
  },

  // ── 25. modules-es6 ──────────────────────────────────────────────────────
  'modules-es6': {
    feynman: `## FEYNMAN CHECK

### Explain ES Modules Like I'm 10 Years Old
> ES Modules (ESM) are JavaScript's STANDARD module system (since 2015 in the spec, 2020 in Node.js). Each file is a MODULE with its own scope — top-level let/const are NOT global, exports are explicit (\`export const x\`, \`export default y\`), imports are static (\`import {x} from './x.js'\`). Two big differences from CommonJS: imports are HOISTED and STATICALLY ANALYZABLE (bundlers can tree-shake unused exports), and bindings are LIVE — if a module updates its exported value, importers see the new value (CJS exports are copied at import time). The non-obvious detail: ESM requires explicit \`.js\` extension in import specifiers (Node strict ESM), supports top-level await (the module's evaluation is itself async), and dynamic imports \`await import('./mod.js')\` return a Promise for code-splitting.

---

### 5 Deep Conceptual Questions

**Q1: What problem do ES modules solve over CommonJS?**
> **A:** Three things: (1) STATIC ANALYSIS — bundlers can determine exactly which exports are used, tree-shaking dead code (CommonJS's dynamic requires make this impossible). (2) ASYNC LOADING — \`import()\` is a Promise, enabling code-splitting for huge apps. (3) BROWSER NATIVE — modern browsers load ESM directly via \`<script type="module">\`, no bundling required for small projects. (4) Top-level await for cleaner async initialization.

**Q2: Mental model for ESM vs CommonJS?**
> **A:** CJS is REQUIRE-TIME EXECUTION — \`require('foo')\` runs foo.js synchronously, returns module.exports value. ESM is PARSE-THEN-EVALUATE — parse the entire module graph first (collect imports/exports statically), then evaluate modules in dependency order. ESM imports are READ-ONLY LIVE BINDINGS to the exporting module's variables (CJS just gets a snapshot). This is why circular imports behave differently — ESM may have undefined values mid-load that resolve later; CJS leaves you with the partial state at require time.

**Q3: Most dangerous misconception?**
> **A:** Default and named exports are interchangeable:
> \`\`\`js
> // ❌ Importing default as named
> // export.js
> export default function greet() {}
> // import.js
> import { greet } from './export.js';   // undefined — there's no NAMED 'greet'
>
> // ✅ Match the export form
> import greet from './export.js';             // for default
> import { greet } from './export.js';         // for named
> import * as mod from './export.js';          // import everything; mod.default + mod.greet
> \`\`\`

**Q4: How does top-level await change module evaluation?**
> **A:** Without TLA, modules evaluate synchronously top-to-bottom. With TLA (\`const config = await fetch('/cfg.json').then(r => r.json())\` at module top level), the module's evaluation becomes a Promise. Modules that import a TLA module wait for it to resolve before they evaluate. This enables clean async initialization (config loading, lazy WASM) without the IIFE workaround. Caveat: it blocks every importer; misuse causes long startup times.

**Q5: FAANG-grade definition?**
> **A:** "ECMAScript Modules are JavaScript's standardized module system with static, hoisted imports/exports — enabling compile-time tree-shaking and dependency analysis — featuring read-only live bindings (importers see updated values), dynamic \`import()\` returning Promises for code-splitting, top-level await for async module initialization, and native browser support via type='module' — superseding CommonJS (which remains dominant in legacy Node.js but is being phased out for new code) while requiring careful handling of dual-format publishing for libraries that must support both."`,
    build: `## BUILD

### 🏗️ Mini Project: Mini Plugin System With Dynamic Imports + Tree-Shaking Demo

**What you will build:** A plugin loader that uses dynamic import() for lazy loading, a tree-shaking demo showing unused exports stripped by bundlers, and a circular-import scenario showing ESM's live-binding behavior.
**Why this project:** Forces every modern module pattern — static imports, dynamic imports, default vs named, TLA, circular handling.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-modules && cd js-modules
npm init -y
# add to package.json: "type": "module"
node -e "const p=require('./package.json'); p.type='module'; require('fs').writeFileSync('./package.json', JSON.stringify(p,null,2))"
npm install -D vitest
mkdir plugins
ni plugins/auth.js, plugins/logger.js, plugins/cache.js, loader.js, demo.js -ItemType File
\`\`\`

#### Step 2 — Plugins (Each Default-Exports A Class)
\`\`\`js
// plugins/auth.js
export default class AuthPlugin {
  name = 'auth';
  async init(app) { console.log(\`[auth] init for \${app}\`); }
  middleware(req, res, next) { req.user = { id: 1 }; next(); }
}

// plugins/logger.js
export default class LoggerPlugin {
  name = 'logger';
  async init() { console.log('[logger] init'); }
  middleware(req, res, next) { console.log(\`\${req.method} \${req.url}\`); next(); }
}

// plugins/cache.js
export default class CachePlugin {
  name = 'cache';
  store = new Map();
  async init() { console.log('[cache] init'); }
  get(k) { return this.store.get(k); }
  set(k, v) { this.store.set(k, v); }
}
\`\`\`

#### Step 3 — Dynamic-Loading Loader
\`\`\`js
// loader.js
export async function loadPlugins(names) {
  const plugins = [];
  for (const name of names) {
    // Dynamic import — code is loaded lazily, only when needed
    const mod = await import(\`./plugins/\${name}.js\`);
    const PluginClass = mod.default;
    const instance = new PluginClass();
    await instance.init('my-app');
    plugins.push(instance);
  }
  return plugins;
}

// Tree-shaking demo: only used exports survive bundling
// utils.js
export function used() { return 'used'; }
export function unused() { return 'never imported — bundler removes this'; }

// caller.js
import { used } from './utils.js';
console.log(used());   // bundler keeps 'used', strips 'unused'
\`\`\`

#### Step 4 — Top-Level Await + Circular Imports
\`\`\`js
// config.js — TLA
const cfg = await fetch('/api/config').then(r => r.json()).catch(() => ({ env: 'dev' }));
export default cfg;

// Now importing config waits for the fetch
// app.js
import config from './config.js';
console.log('app starts with env:', config.env);

// Circular imports — a.js imports b.js, b.js imports a.js
// a.js
import { foo } from './b.js';
export const a = 1;
export function fromA() { return foo() + a; }

// b.js
import { a } from './a.js';
export function foo() { return 'foo: a=' + a; }   // a may be undefined during initial load
\`\`\`

#### Step 5 — Demo + Tests
\`\`\`js
// demo.js
import { loadPlugins } from './loader.js';

const plugins = await loadPlugins(['auth', 'logger', 'cache']);
console.log('Loaded:', plugins.map(p => p.name));

// Use them
const fakeReq = { method: 'GET', url: '/users' };
const fakeRes = {};
plugins[0].middleware(fakeReq, fakeRes, () => {});
plugins[1].middleware(fakeReq, fakeRes, () => {});

// Code splitting with conditional import
async function loadIfNeeded(featureFlag) {
  if (featureFlag) {
    const { default: HeavyFeature } = await import('./plugins/cache.js');
    return new HeavyFeature();
  }
}

// modules.test.js
import { describe, it, expect } from 'vitest';

describe('ESM features', () => {
  it('dynamic import returns a module namespace', async () => {
    const mod = await import('./plugins/auth.js');
    expect(typeof mod.default).toBe('function');
    expect(mod.default.name).toBe('AuthPlugin');
  });

  it('imports are read-only live bindings', async () => {
    const counter = await import('./counter.js');
    const initial = counter.count;
    counter.increment();
    expect(counter.count).toBe(initial + 1);   // see live update
  });

  it('default vs named exports are distinct', async () => {
    const mod = await import('./mixed.js');
    expect(mod.default).toBeDefined();
    expect(mod.named).toBeDefined();
    expect(mod.default).not.toBe(mod.named);
  });
});

// counter.js
export let count = 0;
export function increment() { count++; }

// mixed.js
export default 'default-value';
export const named = 'named-value';
\`\`\`

**Expected Output:**
\`\`\`
[auth] init for my-app
[logger] init
[cache] init
Loaded: [ 'auth', 'logger', 'cache' ]
GET /users
GET /users
app starts with env: dev

# Tree-shaking — bundle includes 'used' but not 'unused'
# Bundle size before: 4.2 KB
# Bundle size after:  1.1 KB

# Tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add a plugin manifest (JSON) listing available plugins to lazy-load
- [ ] Convert a CJS library to dual-format (ESM + CJS) using package.json "exports"
- [ ] Use import.meta.url to load files relative to the current module`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Three differences between ESM and CommonJS.
**Q2:** Difference between default and named exports.
**Q3:** Write a dynamic import wrapped in a function. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`import { greet } from './default-export.js'\` give undefined when the file uses default export?
**Q5:** A junior writes \`require('./module')\` in an ESM file — what happens?
**Q6:** Refactor to use top-level await:
\`\`\`js
let config;
fetch('/config').then(r => r.json()).then(c => { config = c; init(); });
\`\`\`

### Day 7 — Application
**Q7:** Set up a project with code-splitting via dynamic import based on user role.
**Q8:** A PR uses CJS require in a new file — explain the migration steps to ESM.
**Q9:** What is the cost of top-level await on app startup time?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how tree-shaking works in webpack/rollup using ESM static analysis."
**Q11:** Draw: dependency graph for a circular ESM import — when do bindings resolve?
**Q12:** ★ System design: "Architect a 200-package monorepo publishing strategy supporting both ESM-only consumers and legacy CJS — package.json exports map, conditional exports, dual-publishing."`
  },

  // ── 26. dom-manipulation ─────────────────────────────────────────────────
  'dom-manipulation': {
    feynman: `## FEYNMAN CHECK

### Explain DOM Manipulation Like I'm 10 Years Old
> The DOM (Document Object Model) is the LIVE TREE of objects the browser creates from your HTML — every element is a node you can read and change with JavaScript. \`document.querySelector\` finds a node; \`element.textContent\`, \`element.innerHTML\`, \`element.setAttribute\` change it; \`element.appendChild\`, \`element.remove()\` add/delete nodes. The non-obvious cost: every DOM mutation can trigger REFLOW (recalculate layout — expensive) and REPAINT (redraw pixels). Batching updates with DocumentFragment or innerHTML assignment triggers ONE reflow. Reading layout properties (\`offsetWidth\`, \`getBoundingClientRect\`) FORCES a synchronous reflow mid-JS — called "layout thrashing" when done inside a loop. requestAnimationFrame groups DOM reads and writes with the browser's paint cycle.

---

### 5 Deep Conceptual Questions

**Q1: Why is DOM manipulation slow?**
> **A:** JavaScript and the browser's layout engine run in the SAME THREAD but different subsystems. Mutating a DOM property marks the layout as "dirty." The next time you READ a layout property (offsetHeight, scrollTop, getBoundingClientRect), the browser MUST flush the dirty layout synchronously — even mid-JS — to return an accurate value. If you alternate reads and writes in a loop (read offsetHeight → write style → read offsetHeight → write style...), each write-read pair forces a reflow — "layout thrashing." Read all → write all avoids this.

**Q2: Mental model for reflow vs repaint?**
> **A:** REFLOW (layout) re-computes the geometry of every affected element (position, size, box model). Changing width, height, margin, padding, top/left, or adding/removing elements triggers it — it cascades through children. REPAINT re-draws pixels for affected elements without changing geometry — changing color, background, visibility. Reflow is 10-20× more expensive than repaint. CSS transforms (translate, scale) bypass both — the GPU handles them in the composite layer (no reflow, no repaint).

**Q3: Most dangerous misconception?**
> **A:** innerHTML is always safe:
> \`\`\`js
> // ❌ innerHTML from user input = XSS
> searchBox.innerHTML = \`Results for: \${userQuery}\`;
> // If userQuery = '<img onerror=alert(1) src=x>', that runs!
>
> // ✅ Use textContent for text; sanitise before innerHTML
> searchBox.textContent = \`Results for: \${userQuery}\`;   // escaped by browser
> // Or use DOMPurify for rich HTML
> searchBox.innerHTML = DOMPurify.sanitize(userHTML);
> \`\`\`

**Q4: How does event delegation reduce DOM overhead?**
> **A:** Instead of attaching a listener to EVERY button in a 1000-row table, attach ONE listener to the table. When a button is clicked, the event BUBBLES up through its ancestors — the table-level listener catches it via \`e.target\`. This works because of DOM event bubbling. Benefit: ONE listener vs 1000, no listener-leak when rows are added/removed dynamically. Pattern: \`container.addEventListener('click', e => { if (e.target.matches('button.delete')) ...; })\`.

**Q5: FAANG-grade definition?**
> **A:** "The DOM API is the browser-provided interface for reading and mutating the document tree — with synchronous reflow forced whenever layout properties are read after a mutation (layout thrashing), batching via DocumentFragment or template-cloning for performance, event delegation leveraging bubbling for efficient dynamic-content listeners, and CSS transforms/will-change for GPU-composited animations that bypass layout entirely."`,
    build: `## BUILD

### 🏗️ Mini Project: Virtual Infinite Scroll With Event Delegation

**What you will build:** An infinite-scroll list of 10,000 rows rendered as a "virtual" window — only 20 rows in the DOM at any time, scrolling managed via transform — with event delegation for row clicks.
**Why this project:** Forces DOM batching, layout-thrash avoidance, event delegation, and IntersectionObserver patterns.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-dom && cd js-dom
ni index.html, virtualList.js -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    #viewport { height: 500px; overflow-y: auto; position: relative; border: 1px solid #ccc; }
    #spacer    { position: absolute; width: 100%; pointer-events: none; }
    #rows      { position: absolute; width: 100%; }
    .row       { height: 40px; line-height: 40px; padding: 0 12px; border-bottom: 1px solid #eee; cursor: pointer; }
    .row:hover { background: #f5f5f5; }
    .row.selected { background: #dce8ff; }
  </style>
</head>
<body>
  <h2>Virtual List (10,000 rows)</h2>
  <div id="viewport">
    <div id="spacer"></div>
    <div id="rows"></div>
  </div>
  <p id="info">Click a row</p>
  <script type="module" src="virtualList.js"></script>
</body>
</html>
\`\`\`

#### Step 3 — Virtual List Implementation
\`\`\`js
// virtualList.js
const TOTAL_ROWS = 10_000;
const ROW_HEIGHT = 40;
const BUFFER = 5;

const viewport = document.getElementById('viewport');
const spacer   = document.getElementById('spacer');
const rows     = document.getElementById('rows');
const info     = document.getElementById('info');

// Set spacer height so scrollbar reflects total height
spacer.style.height = (TOTAL_ROWS * ROW_HEIGHT) + 'px';

let visibleStart = 0;
let selectedIndex = -1;

function renderRows() {
  const scrollTop = viewport.scrollTop;
  const viewportH = viewport.clientHeight;   // read once — avoid thrash
  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
  const end   = Math.min(TOTAL_ROWS, Math.ceil((scrollTop + viewportH) / ROW_HEIGHT) + BUFFER);

  if (start === visibleStart && rows.children.length === end - start) return;

  visibleStart = start;
  rows.style.transform = \`translateY(\${start * ROW_HEIGHT}px)\`;

  // Batch DOM writes in one DocumentFragment
  const frag = document.createDocumentFragment();
  for (let i = start; i < end; i++) {
    const div = document.createElement('div');
    div.className = 'row' + (i === selectedIndex ? ' selected' : '');
    div.dataset.index = i;
    div.textContent = \`Row \${i + 1}: Item #\${(i * 37 + 7) % 10000}\`;
    frag.appendChild(div);
  }
  rows.replaceChildren(frag);   // ONE DOM write replaces everything
}

// Event delegation — ONE listener on the list
rows.addEventListener('click', (e) => {
  const row = e.target.closest('.row');
  if (!row) return;
  const index = Number(row.dataset.index);
  selectedIndex = index;
  info.textContent = \`Selected row \${index + 1}\`;
  renderRows();   // re-render to update selection highlight
});

viewport.addEventListener('scroll', renderRows, { passive: true });
renderRows();   // initial render
\`\`\`

#### Step 4 — Error Handling: Layout-Thrash Avoidance
\`\`\`js
// BAD: alternates reads and writes — forces reflow each time
function badUpdateWidths(items) {
  items.forEach(el => {
    const w = el.offsetWidth;      // read → FLUSH dirty layout
    el.style.width = (w * 2) + 'px'; // write → mark dirty
  });
}

// GOOD: read all, write all — ONE layout flush
function goodUpdateWidths(items) {
  const widths = items.map(el => el.offsetWidth);   // read phase
  items.forEach((el, i) => el.style.width = (widths[i] * 2) + 'px'); // write phase
}

// requestAnimationFrame to batch correctly
function scheduleUpdate(items) {
  requestAnimationFrame(() => {
    const widths = items.map(el => el.offsetWidth);
    items.forEach((el, i) => (el.style.width = (widths[i] + 50) + 'px'));
  });
}
\`\`\`

#### Step 5 — Tests
\`\`\`js
// dom.test.js (Vitest + happy-dom)
import { describe, it, expect, beforeEach } from 'vitest';

describe('virtual list', () => {
  beforeEach(() => {
    document.body.innerHTML = \`<div id="viewport" style="height:200px;overflow-y:auto;">
      <div id="spacer"></div><div id="rows"></div></div><p id="info"></p>\`;
  });

  it('creates DocumentFragment not individual DOM appends', () => {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 5; i++) {
      const div = document.createElement('div');
      div.textContent = 'Row ' + i;
      frag.appendChild(div);
    }
    const container = document.getElementById('rows');
    container.replaceChildren(frag);
    expect(container.children.length).toBe(5);
  });

  it('event delegation catches dynamic children', () => {
    const container = document.createElement('div');
    const log = [];
    container.addEventListener('click', e => {
      if (e.target.matches('.item')) log.push(e.target.textContent);
    });
    const btn = document.createElement('div');
    btn.className = 'item'; btn.textContent = 'A';
    container.appendChild(btn);
    btn.click();
    expect(log).toEqual(['A']);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Virtual list: only ~20 rows in DOM regardless of 10,000 total
Scroll → rows update in <1ms (GPU transform, not layout reflow)
Click any row → info bar updates, row highlighted

# Tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add keyboard navigation (arrow keys scroll, Enter selects)
- [ ] Add variable row heights (measure with ResizeObserver)
- [ ] Replace manual scroll with IntersectionObserver for sentinel-based pagination`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between reflow and repaint?
**Q2:** What is layout thrashing?
**Q3:** Write event delegation for a ul list. From memory.

### Day 3 — Comprehension
**Q4:** Why do CSS transforms bypass reflow?
**Q5:** A junior updates 1000 rows in a loop with individual appends — diagnose.
**Q6:** Refactor to avoid layout thrashing:
\`\`\`js
els.forEach(el => { const h = el.offsetHeight; el.style.height = (h+10)+'px'; });
\`\`\`

### Day 7 — Application
**Q7:** Build a drag-to-reorder list using pointer events and DOM insertion.
**Q8:** A PR reads scrollTop inside a scroll handler repeatedly — explain the forced synchronous layout risk.
**Q9:** When does document.createElement + appendChild outperform innerHTML?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through browser rendering pipeline — DOM → CSSOM → layout → paint → composite."
**Q11:** Draw: event bubbling/capturing path for a nested button click.
**Q12:** ★ System design: "Build a realtime collaborative document editor (like Figma) — how do you batch DOM updates at 60fps?"`
  },

  // ── 27. fetch-api ────────────────────────────────────────────────────────
  'fetch-api': {
    feynman: `## FEYNMAN CHECK

### Explain the Fetch API Like I'm 10 Years Old
> fetch() is the modern browser API for making HTTP requests. It returns a PROMISE that resolves to a Response object. The non-obvious trap: fetch() ONLY rejects the promise on NETWORK ERRORS (DNS failure, no internet). A 404 or 500 response is considered a "successful network call" — the Promise resolves, but \`response.ok\` is false. You MUST check \`response.ok\` manually. Response bodies are STREAMS — you can only read them ONCE. \`response.json()\` and \`response.text()\` return promises that buffer and parse the stream. Timeouts require AbortController — fetch has no built-in timeout option. Credentials (cookies, auth headers) are NOT sent by default to cross-origin requests — set \`credentials: 'include'\` for cookies.

---

### 5 Deep Conceptual Questions

**Q1: What replaced XMLHttpRequest and why is fetch better?**
> **A:** XHR was callback-based, verbose, had progress events but terrible composability. fetch uses Promises — chainable, async/await compatible. fetch supports Streams (read huge responses chunk by chunk without buffering), AbortSignal for cancellation, and has a cleaner API. The ONE thing XHR has that fetch originally didn't: upload progress events (now available via \`request.body.pipeThrough\` for modern fetch streams). For simple HTTP calls, fetch is objectively superior.

**Q2: Mental model for the response lifecycle?**
> **A:** fetch(url) → network happens → a Response is returned (headers available NOW, but body is a STREAM not yet read). Call \`response.json()\` / \`response.text()\` / \`response.arrayBuffer()\` / \`response.blob()\` to consume the body — each returns a Promise that resolves when buffering/parsing is done. Calling two body-consuming methods throws "body already consumed." Check \`response.bodyUsed\` or clone the response (\`response.clone()\`) for multiple reads.

**Q3: Most dangerous misconception?**
> **A:** fetch rejects on HTTP error status:
> \`\`\`js
> // ❌ This never catches 404 or 500 — they resolve successfully
> try {
>   const data = await fetch('/api/user/999').then(r => r.json());
> } catch (e) {
>   console.error('error', e);   // only runs on network failure
> }
>
> // ✅ Check response.ok
> const response = await fetch('/api/user/999');
> if (!response.ok) throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
> const data = await response.json();
> \`\`\`

**Q4: How does AbortController work with fetch?**
> **A:** \`const ctrl = new AbortController()\` creates a controller. Pass \`signal: ctrl.signal\` to fetch. Calling \`ctrl.abort()\` triggers an AbortError on the fetch Promise (and any attached streams). You can reuse one signal across multiple fetches to cancel them all. It's the standard pattern for cancelling stale requests in React useEffect cleanup functions.

**Q5: FAANG-grade definition?**
> **A:** "The Fetch API is a Promise-based HTTP client standardised in the browser environment (and available in Node.js 18+ natively) — returning a Response wrapping a ReadableStream body consumed exactly once via .json()/.text()/.blob()/.arrayBuffer() — resolving on any HTTP response (including 4xx/5xx) and rejecting only on network errors — with timeout, cancellation, and retry implemented externally via AbortController, Promise.race, and wrapper utilities."`,
    build: `## BUILD

### 🏗️ Mini Project: Production Fetch Wrapper With Retry, Timeout, And Type-Safety

**What you will build:** An apiFetch(url, options) wrapper around the native fetch that: throws on non-ok responses, supports abort-signal timeout, retries with exponential backoff on network errors, and parses/validates the response JSON.
**Why this project:** Every production codebase has exactly this wrapper — forces the real edge cases of fetch.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-fetch && cd js-fetch
npm init -y && npm install -D vitest
ni apiFetch.js, apiFetch.test.js -ItemType File
\`\`\`

#### Step 2 — The Wrapper
\`\`\`js
// apiFetch.js

export class HttpError extends Error {
  constructor(status, statusText, body) {
    super(\`HTTP \${status}: \${statusText}\`);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch(url, {
  method = 'GET',
  headers = {},
  body,
  timeout = 10_000,
  retries = 2,
  retryDelay = 500,
  signal: externalSignal,
} = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('Request timeout')), timeout);

  // Chain external signal with internal timeout signal
  externalSignal?.addEventListener('abort', () => controller.abort(externalSignal.reason));

  const attempt = async (n) => {
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorBody;
        try { errorBody = await response.json(); } catch { errorBody = null; }
        throw new HttpError(response.status, response.statusText, errorBody);
      }

      const contentType = response.headers.get('content-type') ?? '';
      return contentType.includes('application/json')
        ? response.json()
        : response.text();

    } catch (err) {
      // Don't retry HTTP errors or aborts — only retry network failures
      if (err instanceof HttpError) throw err;
      if (err.name === 'AbortError') throw err;

      if (n > 0) {
        await new Promise(r => setTimeout(r, retryDelay * (retries - n + 1)));
        return attempt(n - 1);
      }
      throw err;
    }
  };

  try {
    return await attempt(retries);
  } finally {
    clearTimeout(timer);
  }
}
\`\`\`

#### Step 3 — Use It
\`\`\`js
// demo.js
import { apiFetch, HttpError } from './apiFetch.js';

// Basic GET
const user = await apiFetch('/api/users/1');
console.log('user:', user);

// POST with body
const created = await apiFetch('/api/users', {
  method: 'POST',
  body: { name: 'Ana', email: 'ana@dev.io' },
});
console.log('created:', created);

// Error handling
try {
  await apiFetch('/api/users/9999');
} catch (e) {
  if (e instanceof HttpError && e.status === 404) {
    console.log('User not found');
  } else {
    throw e;
  }
}

// Timeout + cancel
const ctrl = new AbortController();
setTimeout(() => ctrl.abort(), 500);
try {
  await apiFetch('/api/slow-endpoint', { timeout: 2000, signal: ctrl.signal });
} catch (e) {
  console.log('Cancelled:', e.name);
}
\`\`\`

#### Step 4 — Error Handling: Streaming Body
\`\`\`js
// Stream large response
async function streamJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let chunks = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks += decoder.decode(value, { stream: true });
    process.stdout.write('.');   // progress indicator
  }
  return JSON.parse(chunks);
}
\`\`\`

#### Step 5 — Tests
\`\`\`js
// apiFetch.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch, HttpError } from './apiFetch.js';

// Mock global fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

function makeResponse(status, body) {
  return Promise.resolve({
    ok: status < 400,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve(body),
  });
}

describe('apiFetch', () => {
  beforeEach(() => mockFetch.mockClear());

  it('returns parsed JSON on success', async () => {
    mockFetch.mockReturnValue(makeResponse(200, { id: 1 }));
    const r = await apiFetch('/api/user');
    expect(r).toEqual({ id: 1 });
  });

  it('throws HttpError on 4xx/5xx', async () => {
    mockFetch.mockReturnValue(makeResponse(404, { message: 'not found' }));
    await expect(apiFetch('/api/user')).rejects.toBeInstanceOf(HttpError);
  });

  it('retries on network error', async () => {
    mockFetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockReturnValue(makeResponse(200, 'ok'));
    const r = await apiFetch('/api', { retryDelay: 1 });
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(r).toBe('ok');
  });

  it('does not retry HttpError', async () => {
    mockFetch.mockReturnValue(makeResponse(500, { error: 'server' }));
    await expect(apiFetch('/api', { retryDelay: 1 })).rejects.toBeInstanceOf(HttpError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
user: { id: 1, name: 'Ana', email: 'a@dev.io' }
created: { id: 2, name: 'Ana', email: 'ana@dev.io' }
User not found
Cancelled: AbortError

# 4/4 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add caching using a Map keyed by URL
- [ ] Add request deduplication for concurrent same-URL calls
- [ ] Add telemetry that sends timing/error metrics to a monitoring API`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** When does fetch() reject?
**Q2:** How do you timeout a fetch request?
**Q3:** Write a one-liner that fetches and parses JSON, throwing on non-ok. From memory.

### Day 3 — Comprehension
**Q4:** Why can you only consume a Response body once?
**Q5:** A junior does \`const r = await fetch('/api'); const j = await r.json(); const t = await r.text()\` — diagnose.
**Q6:** Add timeout + retry to:
\`\`\`js
async function getUser(id) {
  return fetch('/api/users/'+id).then(r => r.json());
}
\`\`\`

### Day 7 — Application
**Q7:** Build a cancelable fetch with a component that cleans up on unmount.
**Q8:** A PR uses axios — explain what fetch provides natively that justifies removing the dependency.
**Q9:** What's the performance cost of JSON.parse for 5MB responses vs streaming?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every step of the fetch API — from call to parsed data, including error surfaces."
**Q11:** Draw: fetch lifecycle (Promise states, Response stream, abort signal interaction).
**Q12:** ★ System design: "Architect the HTTP client layer for a SPA: caching, deduplication, retry, auth injection, and error surfacing."`
  },

  // ── 28. web-apis ─────────────────────────────────────────────────────────
  'web-apis': {
    feynman: `## FEYNMAN CHECK

### Explain Web APIs Like I'm 10 Years Old
> "Web APIs" are the EXTRA SUPERPOWERS the browser gives JavaScript beyond the core language. The language (ECMAScript) itself has: Math, Date, Promise, Map, Set, JSON — but no concept of a browser, URL, or user. The browser ADDS: DOM, fetch, localStorage, sessionStorage, IndexedDB, Notifications, Geolocation, WebSockets, WebWorkers, ServiceWorker, Intersection Observer, Resize Observer, Canvas, WebGL, WebCrypto, WebRTC, Web Animations API. These are defined by the W3C and WHATWG specs, NOT the ECMAScript spec. The non-obvious detail: Node.js and Deno/Bun also implement SOME web APIs (\`fetch\`, \`URL\`, \`Request\`, \`Response\`, \`Blob\`, \`WebCrypto\`, \`structuredClone\`) for cross-runtime compatibility — but NOT DOM, localStorage, Notifications, etc. (those need a browser).

---

### 5 Deep Conceptual Questions

**Q1: Why does localStorage block the main thread but IndexedDB doesn't?**
> **A:** localStorage reads/writes are SYNCHRONOUS — they access the underlying storage mechanism directly on the main thread. For small amounts of data (a few KB) the overhead is imperceptible, but for large amounts it can lag. IndexedDB is ASYNCHRONOUS — all operations return Promises (or historically callbacks). It runs I/O in background threads, never blocking the event loop. For anything over ~5MB or any data that needs to be queryable, IndexedDB is the right choice.

**Q2: Mental model for Web Workers?**
> **A:** Workers are REAL BACKGROUND THREADS with separate JS runtime contexts — no shared memory (except SharedArrayBuffer + Atomics), communication only via postMessage (structured clone). They're perfect for: CPU-heavy work (image processing, parsing, crypto), keeping the main thread free for 60fps UI. ServiceWorker is a special Worker that intercepts network requests for the origin — enabling offline-first PWAs.

**Q3: Most dangerous misconception?**
> **A:** localStorage is a safe key-value store:
> \`\`\`js
> // ❌ localStorage stores STRINGS — non-string values are coerced
> localStorage.setItem('user', { id: 1, name: 'Ana' });
> localStorage.getItem('user');   // '[object Object]' — toString() called!
>
> // ❌ localStorage is synchronous + quota-limited (~5-10MB) + NOT available in workers
> // ❌ localStorage is PER ORIGIN — accessible to ALL scripts on that origin (XSS risk)
>
> // ✅ Always JSON.stringify/parse
> localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Ana' }));
> const user = JSON.parse(localStorage.getItem('user') ?? 'null');
> \`\`\`

**Q4: How does IntersectionObserver improve performance over scroll listeners?**
> **A:** Scroll listeners fire for EVERY PIXEL of scroll movement — potentially 60+/sec — requiring manual calculation of element positions via getBoundingClientRect() (which forces synchronous layout). IntersectionObserver runs at browser-determined optimal intervals (off main thread when possible), triggers ONLY when the intersection ratio crosses your threshold, and never forces layout. It's the canonical tool for: lazy-loading images, triggering animations on scroll, infinite scroll sentinels, ad viewability tracking.

**Q5: FAANG-grade definition?**
> **A:** "Browser Web APIs are host-environment extensions to the ECMAScript language — provided by the browser, defined by W3C/WHATWG, covering storage (localStorage synchronous, IndexedDB async), communication (WebSocket, BroadcastChannel, MessageChannel), observation (IntersectionObserver, ResizeObserver, MutationObserver), workers (Worker, ServiceWorker, SharedWorker), media (Canvas 2D, WebGL, WebAudio), and security (WebCrypto, CSP) — with Node.js 18+ implementing a portable subset for cross-runtime code sharing."`,
    build: `## BUILD

### 🏗️ Mini Project: Offline-Capable Notes App Using localStorage + IndexedDB + Service Worker Concepts

**What you will build:** A notes app that saves to localStorage (fast sync), syncs to IndexedDB (queryable offline store), and demonstrates Web Worker offloaded search.
**Why this project:** Forces real use of storage APIs and the async vs sync distinction.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-webapis && cd js-webapis
ni index.html, notes.js, db.js -ItemType File
\`\`\`

#### Step 2 — IndexedDB Wrapper
\`\`\`js
// db.js
const DB_NAME = 'notes-app';
const DB_VER  = 1;
const STORE   = 'notes';

export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

export async function putNote(note) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).put(note);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function getAllNotes() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}
\`\`\`

#### Step 3 — App Logic With Both Storage Layers
\`\`\`js
// notes.js
import { putNote, getAllNotes } from './db.js';

const LS_KEY = 'notes.recent';

// Fast sync write to localStorage (limited cache)
function cacheNote(note) {
  const recent = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  const idx = recent.findIndex(n => n.id === note.id);
  if (idx >= 0) recent[idx] = note;
  else recent.unshift(note);
  localStorage.setItem(LS_KEY, JSON.stringify(recent.slice(0, 10)));
}

export async function saveNote(note) {
  cacheNote(note);           // sync — instant UI update
  await putNote(note);       // async — persisted to IndexedDB
}

export function getRecentNotes() {
  return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
}

export async function searchNotes(query) {
  const all = await getAllNotes();
  const q = query.toLowerCase();
  return all.filter(n =>
    n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
}

// Demo
await saveNote({ id: crypto.randomUUID(), title: 'JS Notes', content: 'Event loop is key' });
await saveNote({ id: crypto.randomUUID(), title: 'CSS Tips', content: 'Use custom properties' });

const recent = getRecentNotes();
console.log('Recent (localStorage):', recent.length, 'notes');

const results = await searchNotes('event');
console.log('Search results:', results.map(n => n.title));
\`\`\`

#### Step 4 — Error Handling: Storage Quota + Worker
\`\`\`js
// storageCheck.js
export async function getStorageUsage() {
  if (navigator.storage?.estimate) {
    const { usage, quota } = await navigator.storage.estimate();
    return { usageMB: (usage / 1e6).toFixed(2), quotaMB: (quota / 1e6).toFixed(2) };
  }
  return null;
}

// Web Worker for search (keeps main thread free)
export function createSearchWorker() {
  const blob = new Blob([\`
    self.onmessage = ({ data: { notes, query } }) => {
      const q = query.toLowerCase();
      const results = notes.filter(n =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
      self.postMessage(results);
    };
  \`], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}
\`\`\`

#### Step 5 — Tests
\`\`\`js
// webapis.test.js (Node doesn't have localStorage/IDB, test logic only)
import { describe, it, expect, beforeEach } from 'vitest';

// Mock localStorage
const storage = {};
global.localStorage = {
  getItem: k => storage[k] ?? null,
  setItem: (k, v) => { storage[k] = v; },
};
global.crypto = { randomUUID: () => Math.random().toString(36) };

describe('localStorage note cache', () => {
  beforeEach(() => Object.keys(storage).forEach(k => delete storage[k]));

  it('stores notes as JSON', async () => {
    const { saveNote, getRecentNotes } = await import('./notes.js');
    const id = '1';
    await saveNote({ id, title: 'T', content: 'C' });
    const recent = getRecentNotes();
    expect(recent.find(n => n.id === id)).toBeTruthy();
  });

  it('limits cache to 10 most recent', async () => {
    const { saveNote, getRecentNotes } = await import('./notes.js');
    for (let i = 0; i < 15; i++) {
      await saveNote({ id: String(i), title: 'T' + i, content: '' });
    }
    expect(getRecentNotes().length).toBe(10);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Recent (localStorage): 2 notes
Search results: ['JS Notes']
Storage: { usageMB: '0.05', quotaMB: '2048.00' }
\`\`\`

**Stretch Challenges:**
- [ ] Add Service Worker to cache API responses for offline access
- [ ] Replace IndexedDB wrapper with Dexie.js and compare DX
- [ ] Add BroadcastChannel to sync notes across browser tabs`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Three Web APIs that are NOT available in Web Workers.
**Q2:** Difference between localStorage (sync) and IndexedDB (async)?
**Q3:** Write code that saves an object to localStorage safely. From memory.

### Day 3 — Comprehension
**Q4:** Why is IntersectionObserver better than scroll + getBoundingClientRect?
**Q5:** A junior writes an infinite loop in a Web Worker — does it freeze the tab?
**Q6:** What's the maximum localStorage quota? What happens when exceeded?

### Day 7 — Application
**Q7:** Build a lazy-image loader using IntersectionObserver.
**Q8:** A PR reads localStorage on every render — explain the performance concern.
**Q9:** How would you debug a Service Worker caching stale assets?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how a Service Worker enables offline-first — fetch interception, cache strategy."
**Q11:** Draw: storage API comparison — localStorage vs sessionStorage vs cookie vs IndexedDB vs Cache API.
**Q12:** ★ System design: "Architect offline-first sync for a notes app with conflict resolution when reconnecting."`
  },

  // ── 29. xhr-and-ajax ─────────────────────────────────────────────────────
  'xhr-and-ajax': {
    feynman: `## FEYNMAN CHECK

### Explain XHR & AJAX Like I'm 10 Years Old
> AJAX (Asynchronous JavaScript And XML) was the REVOLUTION that made SPAs possible — sending HTTP requests from the browser WITHOUT a page reload (using XMLHttpRequest, 2005). XHR (XMLHttpRequest) is the original API — callback-based, verbose, but still works everywhere and uniquely supports UPLOAD PROGRESS events. In 2015, the Fetch API superseded it for almost everything. Today XHR is relevant for: (1) upload progress via \`xhr.upload.onprogress\`, (2) legacy code maintenance, (3) environments where fetch isn't available (rare in 2026). The non-obvious historical detail: "XML" in AJAX is a misnomer — most AJAX today transfers JSON; the name stuck. \`xhr.responseType = 'json'\` auto-parses responses so you don't need JSON.parse.

---

### 5 Deep Conceptual Questions

**Q1: Why did fetch replace XHR for most uses?**
> **A:** XHR was designed in 2000 for a different era. The API mixes configuration and I/O: you call xhr.open(), set properties on the object, then xhr.send() — no composability. fetch is PROMISE-BASED — chainable, works with async/await, supports Response streams, and cleanly separates concerns. XHR's ONLY edge: upload progress events (\`xhr.upload.onprogress\`) — fetch doesn't expose per-chunk upload progress. For file uploading with a progress bar, XHR or the newer fetch streaming body approaches are still needed.

**Q2: Mental model for XHR states?**
> **A:** XHR is a STATE MACHINE with \`readyState\`: 0 (UNSENT), 1 (OPENED, after open()), 2 (HEADERS_RECEIVED, after send()), 3 (LOADING, while downloading), 4 (DONE). Each transition fires readystatechange. For most uses you only care about state 4. Use the simpler \`xhr.onload\` (fires when done and status indicates success), \`xhr.onerror\` (network failure), and \`xhr.ontimeout\` instead of readystatechange.

**Q3: Most dangerous misconception?**
> **A:** CORS errors are a fetch/XHR bug:
> \`\`\`js
> // ❌ CORS is a BROWSER security policy — not your code's fault
> fetch('https://other-domain.com/api');   // CORS error in browser
> // The server must include: Access-Control-Allow-Origin: *
> // or: Access-Control-Allow-Origin: https://your-app.com
>
> // ❌ Trying to 'fix' CORS by changing fetch options — only the SERVER can fix CORS
> fetch(url, { mode: 'no-cors' })   // gives opaque response — can't read body!
>
> // ✅ Correct fix: update server CORS headers, or proxy through your own server
> \`\`\`

**Q4: How does CORS preflight work?**
> **A:** Simple requests (GET/POST with safe content types and standard headers) go directly. Anything else (PUT, DELETE, custom headers like Authorization, Content-Type: application/json) triggers a PREFLIGHT: the browser sends an OPTIONS request first, asking the server "can I send a POST with Authorization header from this origin?" The server responds with Access-Control-Allow-* headers. If approved, the actual request follows. This is automatic — you never write the OPTIONS request.

**Q5: FAANG-grade definition?**
> **A:** "XMLHttpRequest is the original browser async HTTP client — a stateful object (readyState 0-4) with event-handler-based callbacks, supporting upload progress via xhr.upload.onprogress (fetch's only missing feature) and synchronous mode (avoid — blocks main thread) — largely superseded by the Fetch API but retained for upload-progress scenarios, with CORS controlled entirely by response headers from the server rather than client configuration."`,
    build: `## BUILD

### 🏗️ Mini Project: File Uploader With XHR Progress + Fetch Fallback

**What you will build:** A file uploader component that shows a real upload progress bar using XHR, with a Fetch fallback that shows a spinner when no progress is needed — plus a client-side CORS proxy demo.
**Why this project:** Forces XHR upload events AND side-by-side comparison with fetch — the one real use-case where XHR still wins.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-xhr && cd js-xhr
ni index.html, uploader.js -ItemType File
\`\`\`

#### Step 2 — XHR Uploader With Progress
\`\`\`js
// uploader.js
export function uploadWithProgress(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file, file.name);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = (e.loaded / e.total * 100).toFixed(0);
        onProgress?.(Number(pct), e.loaded, e.total);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch { resolve(xhr.responseText); }
      } else {
        reject(new Error(\`Upload failed: \${xhr.status} \${xhr.statusText}\`));
      }
    };
    xhr.onerror   = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Upload timeout'));
    xhr.timeout   = 60_000;

    xhr.open('POST', url);
    xhr.send(formData);
  });
}

// Fetch fallback — no progress, but simpler code
export async function uploadSimple(url, file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(url, { method: 'POST', body: formData });
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}
\`\`\`

#### Step 3 — UI Integration
\`\`\`html
<!DOCTYPE html>
<html><body>
  <input type="file" id="fileInput">
  <button id="upload">Upload</button>
  <progress id="bar" max="100" value="0" style="width:100%"></progress>
  <p id="status">Ready</p>
  <script type="module">
    import { uploadWithProgress } from './uploader.js';
    const fileInput = document.getElementById('fileInput');
    const status    = document.getElementById('status');
    const bar       = document.getElementById('bar');

    document.getElementById('upload').onclick = async () => {
      const file = fileInput.files[0];
      if (!file) return;
      status.textContent = 'Uploading...';
      try {
        await uploadWithProgress('/upload', file, (pct) => {
          bar.value = pct;
          status.textContent = \`\${pct}%\`;
        });
        bar.value = 100;
        status.textContent = 'Done!';
      } catch (e) {
        status.textContent = 'Error: ' + e.message;
      }
    };
  </script>
</body></html>
\`\`\`

#### Step 4 — Error Handling: CORS Proxy Pattern
\`\`\`js
// corsProxy.js — running on YOUR server to avoid CORS
export async function proxiedFetch(externalUrl, options = {}) {
  // Client calls YOUR server
  const res = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: externalUrl, options }),
  });
  return res.json();
}

// YOUR server (Node.js) fetches the external URL
// (Node has no CORS restrictions — it's a server-to-server call)
// app.post('/api/proxy', async (req, res) => {
//   const { url, options } = req.body;
//   const data = await fetch(url, options).then(r => r.json());
//   res.json(data);
// });
\`\`\`

#### Step 5 — Tests
\`\`\`js
// xhr.test.js
import { describe, it, expect, vi } from 'vitest';

class MockXHR {
  constructor() { this.upload = {}; this.timeout = 0; this.responseText = '{}'; }
  open(m, u) { this._method = m; this._url = u; }
  send(body) { setTimeout(() => { this.status = 200; this.onload(); }, 10); }
}

global.XMLHttpRequest = MockXHR;

describe('uploadWithProgress', () => {
  it('resolves on successful upload', async () => {
    const { uploadWithProgress } = await import('./uploader.js');
    const file = new Blob(['data'], { type: 'text/plain' });
    const result = await uploadWithProgress('/upload', file);
    expect(result).toEqual({});
  });
  it('calls onProgress callback', async () => {
    const { uploadWithProgress } = await import('./uploader.js');
    const progressCalls = [];
    global.XMLHttpRequest = class extends MockXHR {
      send(body) {
        this.upload.onprogress?.({ lengthComputable: true, loaded: 50, total: 100 });
        super.send(body);
      }
    };
    const file = new Blob(['data'], { type: 'text/plain' });
    await uploadWithProgress('/upload', file, (p) => progressCalls.push(p));
    expect(progressCalls).toContain(50);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Progress bar fills from 0% to 100% in real time
Done! on completion

# Tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add pause/resume using xhr.abort() + Range headers
- [ ] Add chunked upload splitting large files into 5MB chunks
- [ ] Compare upload speed XHR vs fetch ReadableStream body`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** One thing XHR does that fetch cannot (without streaming tricks).
**Q2:** What CORS header must the server send?
**Q3:** Write an XHR GET request with onload and onerror. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`fetch(url, {mode:'no-cors'})\` give an opaque response?
**Q5:** A junior adds a custom header and suddenly gets a CORS preflight — explain why.
**Q6:** Refactor XHR callback to Promise.

### Day 7 — Application
**Q7:** Build a download manager with progress and cancel using XHR.
**Q8:** A PR fetches a cross-origin API and gets CORS errors — name all possible fixes.
**Q9:** What's the browser limit on concurrent same-origin XHR/fetch connections?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through CORS preflight — every header, every condition."
**Q11:** Draw: XHR readyState transitions for a successful POST.
**Q12:** ★ System design: "Design an upload service that handles 1GB files, shows progress, supports pause/resume."`
  },

  // ── 30. error-handling-js ────────────────────────────────────────────────
  'error-handling-js': {
    feynman: `## FEYNMAN CHECK

### Explain JS Error Handling Like I'm 10 Years Old
> JavaScript has two error worlds: SYNCHRONOUS (throw/try/catch/finally) and ASYNCHRONOUS (unhandled promise rejections, onerror, onunhandledrejection). Sync errors: \`throw new Error('msg')\` creates an Error with a stack trace; \`try { ... } catch (e) { ... } finally { ... }\` catches it. Types: Error (base), TypeError, RangeError, ReferenceError, SyntaxError, URIError, EvalError — extend Error for custom ones. Async: if a Promise rejects and nobody catches it, it fires window.onunhandledRejection (browser) or process.on('unhandledRejection') (Node). The non-obvious rule: ALWAYS throw Error OBJECTS, not strings — only Error objects have a stack trace, which is invaluable for debugging in production.

---

### 5 Deep Conceptual Questions

**Q1: When should you catch an error vs let it propagate?**
> **A:** Catch when you can RECOVER — translate to a safe default, retry, show user-friendly feedback, or convert to a domain error type. Let propagate when you cannot meaningfully recover (let the outer boundary handle it). The pattern: narrow try/catch scopes around only the operation that might fail, not entire functions. A global error boundary (React's ErrorBoundary, Express error middleware, process.on('unhandledRejection')) handles unrecoverable errors gracefully.

**Q2: Mental model for error wrapping?**
> **A:** When catching and re-throwing, ALWAYS add context: \`throw new Error('Failed to load user profile', { cause: originalError })\`. ES2022's Error \`cause\` option chains errors — the original stack trace is preserved. This produces "stacktrace chains" useful in production: you see "Failed to load user profile → cause: HTTP 404" instead of just "HTTP 404" with no call-site context.

**Q3: Most dangerous misconception?**
> **A:** Try/catch catches async errors automatically:
> \`\`\`js
> // ❌ Promise rejection in setTimeout is uncaught
> async function fetchData() {
>   try {
>     setTimeout(async () => {
>       const r = await fetch('/bad');  // rejection here
>       if (!r.ok) throw new Error('bad');
>     }, 0);
>   } catch (e) {
>     console.log('caught:', e);  // never runs
>   }
> }
>
> // ✅ Return/await the promise
> async function fetchData() {
>   try {
>     const r = await fetch('/bad');
>     if (!r.ok) throw new Error('bad');
>   } catch (e) {
>     console.log('caught:', e);  // works
>   }
> }
> \`\`\`

**Q4: How do custom error classes improve error handling?**
> **A:** Custom errors let you DISCRIMINATE error types: \`catch (e) { if (e instanceof NetworkError) retry(); else if (e instanceof AuthError) redirect('/login'); else throw e; }\`. Each custom error can carry structured data (status code, request URL, validation messages) beyond a string message. The classic pattern: an AppError base class with error codes, all domain errors extend it, global handler checks instanceof chain.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript error handling spans synchronous throw/catch/finally (with typed Error subclasses and the ES2022 \`cause\` chain), asynchronous promise rejection (caught by .catch/.then(undefined, handler)/try-await or escaping to unhandledRejection global handlers), and cross-boundary error context via Error wrapping — with custom Error subclasses enabling type-discriminated recovery, and global process/window handlers as the safety net for unrecoverable errors."`,
    build: `## BUILD

### 🏗️ Mini Project: Typed Error Hierarchy With Global Handler + Result Type

**What you will build:** An AppError base class hierarchy (NetworkError, AuthError, ValidationError, NotFoundError), a global handler that routes each type, and a Result<T, E> pattern comparison showing when to use which.
**Why this project:** Forces custom Error classes, instanceof discrimination, Error.cause chaining, and global error boundaries.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-errors && cd js-errors
npm init -y && npm install -D vitest
ni errors.js, handler.js, errors.test.js -ItemType File
\`\`\`

#### Step 2 — Error Hierarchy
\`\`\`js
// errors.js

// Base: all domain errors extend this
export class AppError extends Error {
  constructor(message, { code, cause, data } = {}) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.code = code ?? 'APP_ERROR';
    this.data = data ?? {};
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
  toJSON() {
    return { error: this.name, code: this.code, message: this.message, data: this.data };
  }
}

export class NetworkError extends AppError {
  constructor(message, { status, url, cause } = {}) {
    super(message, { code: 'NETWORK_ERROR', cause, data: { status, url } });
    this.status = status;
    this.url = url;
  }
}

export class AuthError extends AppError {
  constructor(message, reason = 'UNAUTHORIZED') {
    super(message, { code: reason });
  }
  get isExpired() { return this.code === 'TOKEN_EXPIRED'; }
}

export class ValidationError extends AppError {
  constructor(message, fields = {}) {
    super(message, { code: 'VALIDATION_FAILED', data: { fields } });
    this.fields = fields;
  }
}

export class NotFoundError extends AppError {
  constructor(resource, id) {
    super(\`\${resource} with id \${id} not found\`, { code: 'NOT_FOUND', data: { resource, id } });
  }
}
\`\`\`

#### Step 3 — Global Error Handler
\`\`\`js
// handler.js
import { NetworkError, AuthError, ValidationError, NotFoundError, AppError } from './errors.js';

export function handleError(error, context = {}) {
  // Type-discriminated recovery
  if (error instanceof AuthError) {
    if (error.isExpired) refreshToken();
    else redirectToLogin();
    return;
  }
  if (error instanceof NetworkError) {
    const { status, url } = error.data;
    logMetric({ event: 'network_error', status, url });
    showRetryUI();
    return;
  }
  if (error instanceof ValidationError) {
    showFieldErrors(error.fields);
    return;
  }
  if (error instanceof NotFoundError) {
    showEmptyState(error.data.resource);
    return;
  }
  if (error instanceof AppError) {
    logError(error, 'unhandled_app_error', context);
    showGenericError();
    return;
  }
  // Unknown / non-domain error — escalate
  logError(error, 'unhandled_unknown_error', context);
  throw error;
}

// Global async boundary
if (typeof window !== 'undefined') {
  window.onunhandledrejection = (e) => { handleError(e.reason); e.preventDefault(); };
}
process.on?.('unhandledRejection', (reason) => handleError(reason));
\`\`\`

#### Step 4 — Error Wrapping + cause
\`\`\`js
// Using Error.cause for context chains
async function loadUserProfile(userId) {
  let rawUser;
  try {
    const res = await fetch(\`/api/users/\${userId}\`);
    if (res.status === 404) throw new NotFoundError('User', userId);
    if (res.status === 401) throw new AuthError('Session expired', 'TOKEN_EXPIRED');
    if (!res.ok) throw new NetworkError(\`API error\`, { status: res.status, url: res.url });
    rawUser = await res.json();
  } catch (e) {
    if (e instanceof AppError) throw e;   // already typed
    throw new NetworkError('Failed to load user profile', { cause: e });  // wrap + preserve
  }
  return rawUser;
}

// Caller sees chained context
try {
  await loadUserProfile(999);
} catch (e) {
  console.error(e.message);          // "User with id 999 not found"
  console.error(e.cause?.message);   // original error if wrapped
  console.log(e.toJSON());
}
\`\`\`

#### Step 5 — Tests
\`\`\`js
// errors.test.js
import { describe, it, expect } from 'vitest';
import { AppError, NetworkError, AuthError, ValidationError, NotFoundError } from './errors.js';

describe('error hierarchy', () => {
  it('custom errors are instanceof AppError AND their own class', () => {
    const e = new NetworkError('fail', { status: 503 });
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(AppError);
    expect(e).toBeInstanceOf(NetworkError);
    expect(e.status).toBe(503);
  });
  it('AuthError.isExpired discriminates expired token', () => {
    expect(new AuthError('x', 'TOKEN_EXPIRED').isExpired).toBe(true);
    expect(new AuthError('x', 'UNAUTHORIZED').isExpired).toBe(false);
  });
  it('ValidationError carries field errors', () => {
    const e = new ValidationError('bad', { email: 'invalid' });
    expect(e.fields.email).toBe('invalid');
  });
  it('Error cause chain preserved', () => {
    const root = new TypeError('root cause');
    const wrapped = new NetworkError('outer', { cause: root });
    expect(wrapped.cause).toBe(root);
  });
  it('toJSON produces serialisable shape', () => {
    const e = new NotFoundError('User', 42);
    const j = e.toJSON();
    expect(j).toEqual({ error: 'NotFoundError', code: 'NOT_FOUND', message: 'User with id 42 not found', data: { resource: 'User', id: 42 } });
  });
});
\`\`\`

**Expected Output:**
\`\`\`
User with id 999 not found
{ error: 'NotFoundError', code: 'NOT_FOUND', message: '...', data: {...} }

# 5/5 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add Sentry-style breadcrumbs that accumulate before an error
- [ ] Add a Result<T, E> type and compare vs throw for a pure function
- [ ] Integrate OpenTelemetry spans with each error`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Types built into JS Error hierarchy.
**Q2:** When does a Promise rejection become "unhandled"?
**Q3:** Write a custom NotFoundError class extending Error. From memory.

### Day 3 — Comprehension
**Q4:** Why throw Error objects instead of strings?
**Q5:** A junior has \`catch(e) { throw 'failed' }\` — what's wrong?
**Q6:** Add Error.cause wrapping:
\`\`\`js
async function loadData() {
  try { return await fetchRaw(); }
  catch (e) { throw new AppError('load failed'); }
}
\`\`\`

### Day 7 — Application
**Q7:** Build an error-boundary HOC for React that logs + shows fallback.
**Q8:** A PR catches all errors and returns null — why is this wrong?
**Q9:** What should process.on('unhandledRejection') do in a production Node server?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through a production error — from throw to Sentry, all the layers."
**Q11:** Draw: error propagation in a 4-layer async call chain.
**Q12:** ★ System design: "Architect error handling for a 20-service microservices system — tracing, correlation IDs, alerting."`
  },

  // ── 31. type-coercion ────────────────────────────────────────────────────
  'type-coercion': {
    feynman: `## FEYNMAN CHECK

### Explain Type Coercion Like I'm 10 Years Old
> Type coercion is JavaScript AUTOMATICALLY converting one type to another when an operator needs a specific type. \`1 + '2'\` → '12' (number coerced to string by +). \`'5' - 1\` → 4 (string coerced to number by -). \`if (0)\` → false (0 coerced to boolean). The rules are: \`+\` prefers string if EITHER operand is a string; \`- * / %\` always convert to number; \`==\` does AbstractEqualityComparison; Boolean coercion rules are: 0, '', null, undefined, NaN, false are FALSY, everything else is truthy. The non-obvious traps: \`[] + []\` → ''; \`[] + {}\` → '[object Object]'; \`{} + []\` → 0 (the \`{}\` is parsed as a block, not an object!); \`true + true\` → 2. These come up in live coding interviews.

---

### 5 Deep Conceptual Questions

**Q1: What algorithm does \`==\` actually run?**
> **A:** The Abstract Equality Comparison (ECMAScript §7.2.14): if types are equal, use strict equality. If null/undefined, they equal each other only. If one is number and other is string, convert string to number. If one is boolean, convert it to number first. If one is object and other is string/number/symbol, call ToPrimitive (valueOf then toString) on the object. This explains \`'' == 0\` (true), \`[0] == 0\` (true — [0].valueOf() → [0], [0].toString() → '0', '0' to number → 0), \`null == undefined\` (true by spec), \`null == 0\` (false — null only equals null/undefined).

**Q2: Mental model for ToPrimitive?**
> **A:** When an object needs to become a primitive (for +, ==, template literal, etc.), JavaScript calls \`[Symbol.toPrimitive](hint)\` first (if defined), then tries \`.valueOf()\` (default returns the object itself for plain objects — no coercion), then \`.toString()\`. For most plain objects, valueOf returns the object unchanged, so toString() wins: \`{}.toString()\` → '[object Object]'. Arrays: \`[1,2].toString()\` → '1,2'. Custom objects can override Symbol.toPrimitive for clean coercion behaviour.

**Q3: Most dangerous misconception?**
> **A:** All falsy values behave identically:
> \`\`\`js
> // ❌ null and undefined are NOT interchangeable in ==
> null == 0;         // false
> undefined == 0;   // false
> null == undefined; // true  (only each other)
>
> // ❌ NaN is not equal to itself
> NaN == NaN;   // false
> NaN === NaN;  // false
> Number.isNaN(NaN);  // true — only safe check
>
> // ❌ '0' is truthy but == to false
> Boolean('0');     // true (non-empty string!)
> '0' == false;     // true (coercion: false → 0, '0' → 0)
> if ('0') console.log('truthy');   // logs — confusing!
> \`\`\`

**Q4: How does implicit coercion interact with custom classes?**
> **A:** You can control coercion by defining \`[Symbol.toPrimitive](hint)\`, \`valueOf()\`, and \`toString()\`. \`hint\` is 'number', 'string', or 'default'. This powers library patterns: \`moment().valueOf()\` returns milliseconds so date comparison works (d1 < d2); BigDecimal libraries override toPrimitive so arithmetic with + is meaningful. Overuse leads to confusing APIs — prefer explicit \`.toNumber()\` methods.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript implicit type coercion is the automatic application of the ToPrimitive, ToNumber, ToString, and ToBoolean abstract operations by operators and comparison algorithms — with \`+\` string-preferring, arithmetic operators number-converting, the Abstract Equality Comparison performing cross-type coercion including ToPrimitive for objects, and boolean coercion treating 0/NaN/''/null/undefined/false as falsy — producing a rich taxonomy of surprising results that motivated the prefer-\`===\` and prefer-explicit-coercion guidelines in modern style guides."`,
    build: `## BUILD

### 🏗️ Mini Project: Coercion Test Suite — Prove Every Surprising Coercion Rule

**What you will build:** A comprehensive test file that PROVES every notorious JS coercion rule with specific expectations — serving as living documentation and interview prep.
**Why this project:** Forces you to actually VERIFY the rules, not just read them — interview gotchas disappear once you've seen them pass.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-coercion && cd js-coercion
npm init -y && npm install -D vitest
ni coercion.test.js, toPrimitive.js -ItemType File
\`\`\`

#### Step 2 — The Test Suite
\`\`\`js
// coercion.test.js
import { describe, it, expect } from 'vitest';

describe('+ operator', () => {
  it('string + anything = string concat', () => {
    expect('1' + 2).toBe('12');
    expect(1 + '2').toBe('12');
    expect('1' + true).toBe('1true');
    expect('1' + null).toBe('1null');
  });
  it('number + number = arithmetic', () => {
    expect(1 + 2).toBe(3);
    expect(true + true).toBe(2);
    expect(true + false).toBe(1);
  });
  it('array coercion', () => {
    expect([] + []).toBe('');
    expect([1] + [2]).toBe('12');
    expect([] + {}).toBe('[object Object]');
  });
});

describe('- * / force ToNumber', () => {
  it('string - 0 parses the string', () => {
    expect('5' - 0).toBe(5);
    expect('3.14' - 0).toBe(3.14);
    expect('abc' - 0).toBeNaN();
  });
  it('null and false are 0', () => {
    expect(null - 0).toBe(0);
    expect(false - 0).toBe(0);
    expect(true - 0).toBe(1);
  });
});

describe('== abstract equality', () => {
  it('null only equals null or undefined', () => {
    expect(null == null).toBe(true);
    expect(null == undefined).toBe(true);
    expect(null == 0).toBe(false);
    expect(null == '').toBe(false);
    expect(null == false).toBe(false);
  });
  it('NaN is not equal to itself', () => {
    expect(NaN == NaN).toBe(false);
    expect(NaN === NaN).toBe(false);
    expect(Number.isNaN(NaN)).toBe(true);
  });
  it('[] == 0 via ToPrimitive chain', () => {
    expect([] == 0).toBe(true);       // [].toString() → '' → 0
    expect([0] == 0).toBe(true);      // [0].toString() → '0' → 0
    expect([0] == '0').toBe(true);
  });
});

describe('Boolean conversion', () => {
  const falsy = [0, -0, 0n, '', null, undefined, NaN, false];
  const truthy = [1, -1, 'false', '0', [], {}, () => {}];

  it('falsy values', () => {
    falsy.forEach(v => expect(Boolean(v)).toBe(false));
  });
  it('truthy values (including empty array!)', () => {
    truthy.forEach(v => expect(Boolean(v)).toBe(true));
  });
  it('"0" is truthy but == false', () => {
    expect(Boolean('0')).toBe(true);   // truthy
    expect('0' == false).toBe(true);   // coerced to 0 == 0
  });
});
\`\`\`

#### Step 3 — Custom toPrimitive
\`\`\`js
// toPrimitive.js
export class Temperature {
  constructor(celsius) { this.celsius = celsius; }

  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return this.celsius;
    if (hint === 'string') return \`\${this.celsius}°C\`;
    return this.celsius;   // 'default' hint
  }
}

const temp = new Temperature(100);
console.log(\`Boiling point: \${temp}\`);   // "Boiling point: 100°C"
console.log(temp + 0);                    // 100 (number hint from arithmetic)
console.log(temp < 37);                   // false (body temp)
console.log(temp == 100);                 // true (default hint → number)
\`\`\`

#### Step 4 — Explicit Coercion (Best Practice)
\`\`\`js
// Prefer explicit over implicit
const userInput = '42px';

// ❌ Implicit
const implicit = +userInput;   // NaN (parseInt would work but + doesn't)

// ✅ Explicit — clear about what you want
const explicit = parseInt(userInput, 10);   // 42 — clear base 10
const asFloat  = parseFloat(userInput);      // 42 — stops at non-numeric
const asNum    = Number('42');               // 42
const asStr    = String(42);                 // '42'
const asBool   = Boolean(0);                 // false

// Safe string-to-number that returns null for invalid input
function toSafeInt(s) {
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}
\`\`\`

#### Step 5 — Tests (Full)
The test suite from step 2 IS the deliverable. Run:
\`\`\`bash
npx vitest run coercion.test.js
\`\`\`

**Expected Output:**
\`\`\`
✓ + operator > string + anything = string concat
✓ + operator > number + number = arithmetic
✓ + operator > array coercion
✓ - * / force ToNumber > string - 0 parses the string
✓ - * / force ToNumber > null and false are 0
✓ == abstract equality > null only equals null or undefined
✓ == abstract equality > NaN is not equal to itself
✓ == abstract equality > [] == 0 via ToPrimitive chain
✓ Boolean conversion > falsy values
✓ Boolean conversion > truthy values (including empty array!)
✓ Boolean conversion > "0" is truthy but == false

Boiling point: 100°C
100
false
true

# 11 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add a test case for every row in the type coercion table from YDKJS
- [ ] Build a linter rule that warns on implicit coercion patterns
- [ ] Compare V8 perf: \`+str\` vs \`Number(str)\` vs \`parseInt(str,10)\` at 1M calls`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What are the 8 falsy values in JavaScript?
**Q2:** What does \`[] + {}\` evaluate to and why?
**Q3:** Write three ways to convert string to number explicitly. From memory.

### Day 3 — Comprehension
**Q4:** Why is \`null == 0\` false but \`null == undefined\` true?
**Q5:** A junior writes \`if (x == null) return\` — what does this guard?
**Q6:** Explain: \`'0' == false\` is \`true\` but \`Boolean('0')\` is \`true\` — same?

### Day 7 — Application
**Q7:** Write a toSafeNumber(x) that returns null for invalid input (not NaN).
**Q8:** A PR has \`if (count)\` as a guard — when does this break with valid data?
**Q9:** What is Symbol.toPrimitive used for in real-world libraries?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through the Abstract Equality Comparison algorithm step by step for \`[] == false\`."
**Q11:** Draw: the coercion decision tree for the \`+\` operator.
**Q12:** ★ System design: "Design a form validation system that safely converts and validates all input types — no coercion surprises."`
  },

  // ── 32. regular-expressions ──────────────────────────────────────────────
  'regular-expressions': {
    feynman: `## FEYNMAN CHECK

### Explain Regex Like I'm 10 Years Old
> A regular expression is a PATTERN for matching text. \`/hello/\` matches any string containing "hello". Patterns have SPECIAL characters: \`.\` (any char), \`*\` (zero or more), \`+\` (one or more), \`?\` (zero or one), \`[abc]\` (any of a, b, c), \`^abc\` (starts with abc), \`abc$\` (ends with abc), \`\\d\` (digit), \`\\w\` (word char), \`\\s\` (whitespace). Flags: \`g\` (global — find all), \`i\` (case insensitive), \`m\` (multiline), \`s\` (dotAll — . matches \\n), \`u\` (Unicode), \`v\` (Unicode sets mode). The non-obvious performance pitfall: "catastrophic backtracking" — a regex like \`(a+)+b\` on a string of 'aaaa...' with no trailing 'b' can take exponential time. Always test regex with adversarial input.

---

### 5 Deep Conceptual Questions

**Q1: Greedy vs lazy quantifiers?**
> **A:** By default, \`+\`, \`*\`, and \`{n,m}\` are GREEDY — they match AS MUCH AS POSSIBLE while still allowing the overall pattern to match. \`+?\`, \`*?\`, \`{n,m}?\` are LAZY — they match AS LITTLE AS POSSIBLE. \`<.+>\` matches \`<b>bold</b>\` entirely (greedy, spans from first < to last >). \`<.+?>\` matches just \`<b>\` (lazy, stops at first >). For HTML-like parsing, always use lazy. Better yet, use a real HTML parser.

**Q2: Mental model for named capture groups?**
> **A:** Named groups \`(?<name>pattern)\` store the matched text under a label. \`/(?<year>\\d{4})-(?<month>\\d{2})/\` on '2024-06' gives \`match.groups.year = '2024'\`, \`match.groups.month = '06'\` — self-documenting and position-independent. Use in replaceAll: \`str.replace(/(?<y>\\d{4})-(?<m>\\d{2})/, '\$<m>/\$<y>')\` swaps year/month.

**Q3: Most dangerous misconception?**
> **A:** RegExp.lastIndex for stateful reuse:
> \`\`\`js
> // ❌ Regex with /g flag is STATEFUL — lastIndex persists between calls
> const re = /\\d+/g;
> re.test('abc123');   // true  — lastIndex now at 6
> re.test('abc456');   // false — starts searching from index 6, finds nothing
> re.test('abc789');   // true  — lastIndex reset to 0 on no-match
>
> // ✅ Create a new regex per call, or reset lastIndex
> const re = /\\d+/g;
> re.lastIndex = 0;
> re.test('abc456');   // true
>
> // ✅ Or: use .test() on a fresh regex each call
> /\\d+/.test('abc456');   // always true — no state
> \`\`\`

**Q4: How does the regex engine work internally?**
> **A:** Most JS engines use NFA (Non-deterministic Finite Automaton) with backtracking. The engine tries to match the pattern against the string; when it hits a branch (\`|\`, \`*\`, \`+\`), it tries one path and backtracks if it fails. CATASTROPHIC BACKTRACKING occurs with patterns like \`(a+)+\` — each \`a+\` can match 1-n chars, the outer \`+\` can take 1-n groups — exponential combinations. Modern engines (V8 Irregexp) use optimisations + cache to speed simple patterns; still vulnerable to pathological ones. Use ReDoS analyzers (safe-regex npm package) before shipping user-input regex.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript regular expressions are pattern-matching expressions compiled to an NFA-based backtracking engine — with literal characters, metacharacters (.\\d\\w\\s), quantifiers (greedy +*? and lazy +?*?), anchors (^$\\b), groups (capturing, non-capturing, named, lookahead/lookbehind), character classes, and flags (gimsuy/v) — with stateful lastIndex on /g regexes causing common bugs and catastrophic backtracking a denial-of-service risk for user-provided patterns."`,
    build: `## BUILD

### 🏗️ Mini Project: URL Parser + Email Validator Using Named Capture Groups

**What you will build:** Two production-grade regex utilities: a URL parser that extracts protocol/host/port/path/query/fragment into named groups, and an email validator with proper RFC-5321 subset validation.
**Why this project:** Forces named capture groups, anchors, alternation, and non-greedy matching in a realistic context.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-regex && cd js-regex
npm init -y && npm install -D vitest
ni regex.js, regex.test.js -ItemType File
\`\`\`

#### Step 2 — URL Parser
\`\`\`js
// regex.js

// Named capture groups for all URL parts
const URL_RE = /^(?<protocol>[a-z][a-z0-9+\\-.]*):\/\/(?<host>[^/:?#]+)(?::(?<port>\\d+))?(?<path>\\/[^?#]*)?(?:\\?(?<query>[^#]*))?(?:#(?<fragment>.*))?$/i;

export function parseUrl(url) {
  const m = url.trim().match(URL_RE);
  if (!m) return null;
  const { protocol, host, port, path = '/', query = '', fragment = '' } = m.groups;
  return {
    protocol,
    host,
    port: port ? Number(port) : null,
    path,
    query: Object.fromEntries(new URLSearchParams(query)),
    fragment,
    href: url,
  };
}

// Email validator (RFC-5321 subset)
const EMAIL_RE = /^(?<local>[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]{1,64})@(?<domain>[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/;

export function validateEmail(email) {
  if (email.length > 254) return { valid: false, reason: 'too long' };
  const m = email.match(EMAIL_RE);
  if (!m) return { valid: false, reason: 'invalid format' };
  const { local, domain } = m.groups;
  if (local.length > 64) return { valid: false, reason: 'local part too long' };
  if (!domain.includes('.')) return { valid: false, reason: 'domain missing TLD' };
  return { valid: true, local, domain };
}

// Template literal regex builder
export function buildSlugPattern(reserved = []) {
  const escapeRe = (s) => s.split('').map(c => /[a-zA-Z0-9]/.test(c) ? c : '\\' + c).join('');
  const reservedRe = reserved.length ? '(?!' + reserved.map(escapeRe).join('|') + ')' : '';
  return new RegExp('^' + reservedRe + '[a-z0-9][a-z0-9-]{2,62}[a-z0-9]$');
}
\`\`\`

#### Step 3 — Advanced Patterns
\`\`\`js
// demo.js
import { parseUrl, validateEmail, buildSlugPattern } from './regex.js';

// URL parsing
console.log(parseUrl('https://api.example.com:8080/v2/users?page=1&limit=20#section'));
// { protocol: 'https', host: 'api.example.com', port: 8080,
//   path: '/v2/users', query: {page:'1', limit:'20'}, fragment: 'section' }

// Email validation
console.log(validateEmail('user+tag@example.co.uk'));   // { valid: true, ... }
console.log(validateEmail('nope@'));                      // { valid: false, reason: '...' }

// Slug pattern with reserved words
const slugRe = buildSlugPattern(['admin', 'api', 'www']);
console.log(slugRe.test('admin'));         // false (reserved)
console.log(slugRe.test('my-cool-app'));   // true

// Named group replace — swap date format
const date = '2024-06-15';
const us = date.replace(/(?<y>\\d{4})-(?<m>\\d{2})-(?<d>\\d{2})/, '\$<m>/\$<d>/\$<y>');
console.log(us);   // 06/15/2024

// Lookbehind — match numbers after '$'
const prices = 'Items: $12.50, $5.00, 30 (no dollar)';
const dollarAmounts = [...prices.matchAll(/(?<=\\$)\\d+\\.\\d{2}/g)].map(m => m[0]);
console.log(dollarAmounts);   // ['12.50', '5.00']
\`\`\`

#### Step 4 — Error Handling: lastIndex Trap + ReDoS
\`\`\`js
// lastIndex reset guard
export function testAll(re, strings) {
  return strings.map(s => {
    re.lastIndex = 0;   // ALWAYS reset for reused /g regex
    return { s, match: re.test(s) };
  });
}

// Safe user-provided regex
export function safeRegex(pattern) {
  try {
    const re = new RegExp(pattern, 'u');
    // Check for catastrophic backtracking heuristic: nested quantifiers
    if (/\\(\\([^)]+\\)[+*]\\)[+*]/.test(pattern)) {
      throw new Error('Pattern has potential catastrophic backtracking');
    }
    return re;
  } catch (e) {
    throw new TypeError('Invalid regex pattern: ' + e.message);
  }
}
\`\`\`

#### Step 5 — Tests
\`\`\`js
// regex.test.js
import { describe, it, expect } from 'vitest';
import { parseUrl, validateEmail, buildSlugPattern } from './regex.js';

describe('parseUrl', () => {
  it('parses full URL with all parts', () => {
    const r = parseUrl('https://api.test.com:3000/users?page=2#results');
    expect(r.protocol).toBe('https');
    expect(r.host).toBe('api.test.com');
    expect(r.port).toBe(3000);
    expect(r.path).toBe('/users');
    expect(r.query.page).toBe('2');
    expect(r.fragment).toBe('results');
  });
  it('returns null for invalid URL', () => {
    expect(parseUrl('not a url')).toBeNull();
  });
  it('handles URL without port', () => {
    const r = parseUrl('http://example.com/path');
    expect(r.port).toBeNull();
  });
});

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com').valid).toBe(true);
    expect(validateEmail('a+b@x.io').valid).toBe(true);
  });
  it('rejects invalid emails', () => {
    expect(validateEmail('nope').valid).toBe(false);
    expect(validateEmail('a@b').valid).toBe(false);   // missing TLD
    expect(validateEmail('a@.com').valid).toBe(false);
  });
});

describe('buildSlugPattern', () => {
  it('blocks reserved words', () => {
    const re = buildSlugPattern(['admin', 'api']);
    expect(re.test('admin')).toBe(false);
    expect(re.test('my-app')).toBe(true);
  });
  it('enforces minimum 4 char slugs', () => {
    const re = buildSlugPattern();
    expect(re.test('ab')).toBe(false);
    expect(re.test('abc1')).toBe(true);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
{ protocol: 'https', host: 'api.example.com', port: 8080, path: '/v2/users',
  query: { page: '1', limit: '20' }, fragment: 'section', href: '...' }
{ valid: true, local: 'user+tag', domain: 'example.co.uk' }
false  true  06/15/2024  ['12.50', '5.00']

# 8/8 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Build a tokenizer for a simple expression language using regex
- [ ] Add timeout protection against ReDoS using a Worker
- [ ] Implement highlight(text, pattern) that wraps matches in <mark>`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does lastIndex do for global regexes?
**Q2:** Difference between greedy and lazy quantifiers?
**Q3:** Write a regex matching an email address. From memory.

### Day 3 — Comprehension
**Q4:** Why is \`const re = /\\d+/g; re.test(s1); re.test(s2);\` buggy?
**Q5:** Explain catastrophic backtracking with a concrete example.
**Q6:** Add named capture groups:
\`\`\`js
const m = '2024-06-15'.match(/(\\d{4})-(\\d{2})-(\\d{2})/);
const year = m[1], month = m[2], day = m[3];
\`\`\`

### Day 7 — Application
**Q7:** Build a tokenizer that extracts variable names, operators, and literals from JS code.
**Q8:** A PR uses user input directly in new RegExp(userInput) — explain the ReDoS risk.
**Q9:** What's the performance cost of regex vs String.includes for hot paths?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Implement a function to validate IPv4 addresses using regex — explain each group."
**Q11:** Draw: NFA state diagram for the pattern \`(a|ab)c\`.
**Q12:** ★ System design: "Architect a content-moderation system using regex patterns — performance at 10M/day, attack resistance."`
  },

  // ── 33. memory-management-js ─────────────────────────────────────────────
  'memory-management-js': {
    feynman: `## FEYNMAN CHECK

### Explain Memory Management Like I'm 10 Years Old
> JavaScript uses GARBAGE COLLECTION — you never call free() like in C. The garbage collector (GC) finds objects that are no longer REACHABLE from "roots" (global object, stack, registers) and frees their memory. The algorithm: MARK-AND-SWEEP — start from roots, mark everything reachable, sweep (free) the rest. V8 uses GENERATIONAL GC: new-space (short-lived objects — young gen, collected often, cheap), old-space (long-lived objects — old gen, collected infrequently, more expensive). Most objects die young — creating and discarding them is cheap. The non-obvious leaks: event listeners not removed on component unmount, closures capturing large objects, detached DOM nodes, global caches without WeakMap.

---

### 5 Deep Conceptual Questions

**Q1: When is an object eligible for GC?**
> **A:** When NO reachable reference points to it. "Reachable" means: you can reach it from global, the current call stack, or another reachable object. Circular references are NOT a problem for modern mark-and-sweep (they're treated correctly — if neither is reachable from roots, both are GC'd). The old reference-counting algorithm DID fail on circles (IE 6 memory leaks with circular DOM/JS references) — mark-and-sweep fixed this.

**Q2: Mental model for V8's generational heap?**
> **A:** Two spaces: NEW SPACE (~1-8MB, scavenging GC runs in <1ms) for recently allocated objects. Objects surviving two scavenges are PROMOTED to OLD SPACE. OLD SPACE GC (mark-compact) runs infrequently but takes longer (~10-100ms). This is why "allocation storms" — allocating thousands of objects per frame — can trigger frequent scavenges and drop frames. Pool, reuse, or use typed arrays when you need many objects.

**Q3: Most dangerous misconception?**
> **A:** Setting a variable to null immediately frees memory:
> \`\`\`js
> // ❌ Variable = null doesn't free memory — just removes the REFERENCE
> let bigData = new Array(1_000_000).fill({});
> bigData = null;   // eligible for GC, but GC may run later
>
> // ❌ REAL memory leak: event listener holds reference
> function setup() {
>   const bigData = new Array(1_000_000).fill({});
>   document.addEventListener('click', () => console.log(bigData.length));
>   // bigData captured by closure — never freed until listener removed
> }
>
> // ✅ Remove the listener to release the closure
> const handler = () => console.log(bigData.length);
> document.addEventListener('click', handler);
> // On cleanup:
> document.removeEventListener('click', handler);
> \`\`\`

**Q4: When do WeakMap and WeakRef help?**
> **A:** WeakMap stores object→value pairs where the OBJECT KEY is held weakly — if the key object is otherwise unreachable, the GC can collect both the key and its entry. Perfect for: caching computed properties of external objects without preventing their collection. WeakRef holds a weak reference to an object — \`ref.deref()\` returns the object or undefined if collected. FinalizationRegistry lets you run cleanup when an object is collected. Use these for: memoisation caches, object-private metadata stores, DOM-attached cleanup.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript memory is managed by V8's generational garbage collector — using mark-and-sweep with tri-color marking in old-space and scavenging in new-space for short-lived objects — with memory leaks arising from unremoved event listeners, closures over large data, detached DOM nodes, and unbounded caches — addressed via WeakMap/WeakRef for weak references, FinalizationRegistry for cleanup callbacks, and object pooling for high-frequency allocation patterns."`,
    build: `## BUILD

### 🏗️ Mini Project: Memory Leak Detector Using WeakRef + FinalizationRegistry

**What you will build:** A component registry that tracks objects without preventing their GC, using WeakRef and FinalizationRegistry to detect when objects are collected — demonstrating both the leak pattern and the fix.
**Why this project:** Forces hands-on use of WeakRef/FinalizationRegistry and makes GC OBSERVABLE.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-memory && cd js-memory
node --expose-gc -e "global.gc(); console.log('gc available')"
npm init -y && npm install -D vitest
ni memory.js, memory.test.js -ItemType File
\`\`\`

#### Step 2 — Leak Detector
\`\`\`js
// memory.js
const registry = new FinalizationRegistry((name) => {
  console.log(\`[GC] \${name} has been collected\`);
});

export function track(obj, name) {
  registry.register(obj, name, obj);
  return obj;
}

export function untrack(obj) {
  registry.unregister(obj);
}

// WeakRef cache — values can be GC'd
export class WeakCache {
  #store = new Map();

  set(key, value) {
    this.#store.set(key, new WeakRef(value));
  }

  get(key) {
    const ref = this.#store.get(key);
    if (!ref) return undefined;
    const value = ref.deref();
    if (!value) {
      this.#store.delete(key);   // clean up dead ref
      return undefined;
    }
    return value;
  }

  has(key) { return this.get(key) !== undefined; }
}
\`\`\`

#### Step 3 — Leak Patterns + Fixes
\`\`\`js
// leaks.js

// PATTERN 1: Event listener leak
export function createLeaky() {
  const bigData = new Array(100_000).fill(0);
  // Leak: closure over bigData held by listener forever
  document.addEventListener('click', () => bigData.length);
  return 'leaky component';
}

export function createFixed() {
  const bigData = new Array(100_000).fill(0);
  const handler = () => bigData.length;
  document.addEventListener('click', handler);
  return {
    destroy() { document.removeEventListener('click', handler); }
  };
}

// PATTERN 2: Cache without eviction
const badCache = new Map();   // grows forever
export function cacheBad(key, value) { badCache.set(key, value); }

const goodCache = new WeakCache();   // values GC'd when keys die
export { goodCache };

// PATTERN 3: Detached DOM node
export function detachDemo() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  document.body.removeChild(div);   // div is detached

  const capturedDiv = div;   // ❌ JS still holds a reference
  setTimeout(() => console.log(capturedDiv.tagName), 1000);
  // div not GC'd — capturedDiv closure prevents it

  // Fix: don't capture detached DOM nodes; set to null after use
}
\`\`\`

#### Step 4 — Object Pool For High-Frequency Allocation
\`\`\`js
// pool.js — reuse objects to reduce GC pressure
export class ObjectPool {
  #idle = [];
  #factory;
  #reset;
  #maxSize;
  #created = 0;

  constructor(factory, reset, maxSize = 100) {
    this.#factory = factory;
    this.#reset = reset;
    this.#maxSize = maxSize;
  }

  acquire() {
    if (this.#idle.length) return this.#idle.pop();
    this.#created++;
    return this.#factory();
  }

  release(obj) {
    if (this.#idle.length >= this.#maxSize) return;
    this.#reset(obj);
    this.#idle.push(obj);
  }

  get stats() { return { idle: this.#idle.length, created: this.#created }; }
}

const vectorPool = new ObjectPool(
  () => ({ x: 0, y: 0, z: 0 }),
  (v) => { v.x = v.y = v.z = 0; },
  50,
);

function processParticles(count) {
  const vecs = [];
  for (let i = 0; i < count; i++) {
    const v = vectorPool.acquire();
    v.x = Math.random(); v.y = Math.random(); v.z = Math.random();
    vecs.push(v);
  }
  // ... processing ...
  vecs.forEach(v => vectorPool.release(v));
}
\`\`\`

#### Step 5 — Tests
\`\`\`js
// memory.test.js
import { describe, it, expect } from 'vitest';
import { WeakCache } from './memory.js';
import { ObjectPool } from './pool.js';

describe('WeakCache', () => {
  it('stores and retrieves values', () => {
    const cache = new WeakCache();
    const obj = { id: 1 };
    cache.set('k', obj);
    expect(cache.get('k')).toBe(obj);
    expect(cache.has('k')).toBe(true);
  });
  it('returns undefined for missing keys', () => {
    const cache = new WeakCache();
    expect(cache.get('missing')).toBeUndefined();
  });
});

describe('ObjectPool', () => {
  it('reuses objects', () => {
    const pool = new ObjectPool(() => ({}), (o) => { Object.keys(o).forEach(k => delete o[k]); }, 5);
    const a = pool.acquire();
    a.x = 1;
    pool.release(a);
    const b = pool.acquire();
    expect(b).toBe(a);   // same object
    expect(b.x).toBeUndefined();   // reset
  });
  it('creates new objects when pool is empty', () => {
    const pool = new ObjectPool(() => ({}), () => {}, 2);
    const a = pool.acquire();
    const b = pool.acquire();
    const c = pool.acquire();
    expect(pool.stats.created).toBe(3);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
[GC] TrackedObject has been collected  (appears after GC runs)
WeakCache cleans up dead refs automatically

# Tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Build a memory profiler that snapshots heap size at regular intervals
- [ ] Add LRU eviction to WeakCache for the strong-key use case
- [ ] Build a RetainedSizeCalculator that estimates object tree size`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What makes an object eligible for garbage collection?
**Q2:** Difference between WeakMap and Map?
**Q3:** Name three common causes of memory leaks in JS. From memory.

### Day 3 — Comprehension
**Q4:** Does setting a variable to null immediately free memory?
**Q5:** A junior uses a Map as a component cache — memory grows forever. Fix with WeakMap.
**Q6:** Why can't you use WeakMap with primitive keys?

### Day 7 — Application
**Q7:** Build a memoize that uses WeakMap so cached values are GC'd with their keys.
**Q8:** A React component adds an event listener in useEffect without cleanup — diagnose.
**Q9:** What's the performance cost of triggering frequent old-gen GC?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through V8's generational GC — new space, old space, scavenging, mark-compact."
**Q11:** Draw: what happens to a detached DOM node reference held in a closure.
**Q12:** ★ System design: "Profile and fix a Node.js server that OOMs after 48h — tools, patterns, fixes."`
  },

  // ── 34. v8-engine ────────────────────────────────────────────────────────
  'v8-engine': {
    feynman: `## FEYNMAN CHECK

### Explain V8 Like I'm 10 Years Old
> V8 is the JavaScript ENGINE inside Chrome and Node.js — it converts your JS code into MACHINE CODE that the CPU can run directly. V8 has two compilers: SPARKPLUG (fast, generates OK code immediately — gets you running fast) and TURBOFAN (optimising compiler — watches hot functions and recompiles them to blazing fast machine code). Between them is MAGLEV (2023 — mid-tier). The key idea: JavaScript is DYNAMICALLY TYPED but V8 makes it fast by ASSUMING TYPES. If a function always receives integers, V8 generates integer-optimised code. If you suddenly pass a string, V8 DEOPTIMISES — throws away the optimised code and falls back. The non-obvious insight: predictable patterns (same types, same property order, same array element types) are CRITICAL for performance.

---

### 5 Deep Conceptual Questions

**Q1: What is JIT (Just-In-Time) compilation and why does V8 use it?**
> **A:** JIT compiles code to machine code AT RUNTIME as it runs, rather than ahead-of-time. V8 starts with the interpreter (Ignition) for fast startup, identifies HOT FUNCTIONS (called many times), and compiles those to optimised machine code (TurboFan). The result: the first call is interpreted (slow), subsequent calls are increasingly fast as optimisations accumulate. This produces near-C performance for hot JS code while preserving dynamic-language flexibility.

**Q2: Mental model for hidden classes and inline caches?**
> **A:** V8 assigns every object a HIDDEN CLASS (shape/map internally) — a descriptor of its property names and offsets. Objects created with the same properties in the same order share a hidden class. INLINE CACHES: property access is compiled as "if hidden class is C0, load from offset 8." The first call is monomorphic (one hidden class → fast). Adding variety: polymorphic (2-4 classes → slower lookup). Many classes: megamorphic (dictionary lookup → much slower). Write constructors that initialise ALL properties — in the same order every time.

**Q3: Most dangerous misconception?**
> **A:** Optimisation tricks from 2015 still apply:
> \`\`\`js
> // ❌ Outdated: avoid try/catch in hot code (pre-2018 V8 de-optimised it)
> function hotLoop() {
>   try { doWork(); } catch (e) { handle(e); }   // ✅ Fine in modern V8 (TurboFan)
> }
>
> // ❌ Outdated: arguments object is slow (true in older V8, largely fixed)
> // ✅ Current real concerns:
>
> // 1. Polymorphic property access (STILL IMPORTANT)
> function add(a, b) { return a.x + b.x; }
> add({ x: 1 }, { x: 2 });          // monomorphic
> add({ x: 1, y: 1 }, { x: 2 });    // NOW polymorphic — slower
>
> // 2. Array element kind changes (STILL IMPORTANT)
> const arr = [1, 2, 3];          // PACKED_SMI
> arr.push(1.5);                   // PACKED_DOUBLE
> arr.push('x');                   // PACKED
> // Once promoted, NEVER goes back down
> \`\`\`

**Q4: How does V8 optimise async/await?**
> **A:** V8's TurboFan has dedicated optimisations for async/await since 2018 (the "zero-cost async" initiative). Each await point compiles to a CONTINUATION (saved stack frame on the heap). V8 reuses Promises internally with an optimised Path ("PromiseReactionJob") for async function continuations. The overhead vs synchronous code is roughly 2 Promise allocations per await — much lower than older Node (which needed 3). In microbenchmarks, async/await is nearly as fast as raw .then chains; in macrobenchmarks, the difference is negligible.

**Q5: FAANG-grade definition?**
> **A:** "V8 is Google's open-source JavaScript and WebAssembly engine implementing the ECMAScript and WebAssembly specs — using a three-tier JIT pipeline (Ignition interpreter → Maglev mid-tier → TurboFan optimising compiler) with speculation-based optimisations (hidden classes for shape inference, inline caches for property access, type specialisation for arithmetic) and deoptimisation when speculations are violated — with a generational garbage collector (scavenging new-space, mark-compact old-space) and a profiling-guided optimisation cycle that produces near-native performance for hot JS code."`,
    build: `## BUILD

### 🏗️ Mini Project: V8 Optimisation Lab — Prove Hidden Classes, Array Kinds, And Inline Caches With Benchmarks

**What you will build:** A set of micro-benchmarks that empirically demonstrate V8's hidden class, inline cache, and array-element-kind optimisations — with before/after measurements you can run in Node.
**Why this project:** Makes V8 internals OBSERVABLE — every perf rule becomes a measured data point.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-v8 && cd js-v8
node --version  # needs Node 18+
ni bench.js, bench-run.js -ItemType File
\`\`\`

#### Step 2 — Hidden Class Benchmarks
\`\`\`js
// bench.js
import { performance } from 'node:perf_hooks';

function bench(label, fn, iterations = 1_000_000) {
  // Warm-up
  for (let i = 0; i < 1000; i++) fn(i);
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn(i);
  const ms = (performance.now() - start).toFixed(1);
  console.log(\`\${label}: \${ms}ms\`);
}

// HIDDEN CLASSES

// Consistent order → same hidden class → FAST
class ConsistentPoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// Inconsistent order → different hidden classes per call → SLOW (IC pollution)
function makePoint(x, y, extra) {
  const p = {};
  if (extra) p.z = 0;
  p.x = x;
  p.y = y;
  return p;
}

export function runHiddenClassBench() {
  bench('consistent class', (i) => new ConsistentPoint(i, i + 1));
  bench('inconsistent shape', (i) => makePoint(i, i + 1, i % 2));
}
\`\`\`

#### Step 3 — Array Element Kind Benchmarks
\`\`\`js
// bench.js (continued)
export function runArrayKindBench() {
  // PACKED_SMI — best, all integers
  const smiArr = Array.from({ length: 1000 }, (_, i) => i);   // stays PACKED_SMI

  // PACKED_DOUBLE — loses Smi optimisation when float added
  const dblArr = [...smiArr, 0.5];   // promoted to PACKED_DOUBLE

  // PACKED — loses numeric optimisation when string added
  const mixArr = [...smiArr, 'x'];   // promoted to PACKED

  // HOLEY — never goes back to PACKED when element is deleted
  const holeyArr = [...smiArr];
  delete holeyArr[500];   // now HOLEY

  function sumArray(arr) {
    let s = 0;
    for (let i = 0; i < arr.length; i++) s += arr[i];
    return s;
  }

  bench('PACKED_SMI sum',    () => sumArray(smiArr),   100_000);
  bench('PACKED_DOUBLE sum', () => sumArray(dblArr),   100_000);
  bench('PACKED_MIXED sum',  () => sumArray(mixArr),   100_000);
  bench('HOLEY sum',         () => sumArray(holeyArr), 100_000);
}
\`\`\`

#### Step 4 — Inline Cache Demo
\`\`\`js
// bench.js (continued)
export function runICBench() {
  const obj1 = { x: 1 };
  const obj2 = { x: 2, y: 2 };   // different shape — IC becomes polymorphic
  const obj3 = { y: 3, x: 3 };   // different order — IC becomes megamorphic

  function getX(obj) { return obj.x; }

  bench('monomorphic (always same shape)', () => getX(obj1), 5_000_000);

  // Train IC to be polymorphic
  getX(obj2); getX(obj2);
  bench('polymorphic (2 shapes)', () => {
    getX(obj1);
    getX(obj2);
  }, 2_500_000);

  // Megamorphic
  const shapes = Array.from({ length: 10 }, (_, i) => ({ ['k' + i]: i, x: i }));
  shapes.forEach(s => getX(s));
  bench('megamorphic (10 shapes)', () => getX(shapes[Math.floor(Math.random() * 10)]), 500_000);
}
\`\`\`

#### Step 5 — Run It
\`\`\`js
// bench-run.js
import { runHiddenClassBench, runArrayKindBench, runICBench } from './bench.js';

console.log('\\n=== HIDDEN CLASS ===');
runHiddenClassBench();

console.log('\\n=== ARRAY ELEMENT KIND ===');
runArrayKindBench();

console.log('\\n=== INLINE CACHE ===');
runICBench();
\`\`\`

**Expected Output:**
\`\`\`
=== HIDDEN CLASS ===
consistent class: 48ms
inconsistent shape: 210ms   ← 4× slower

=== ARRAY ELEMENT KIND ===
PACKED_SMI sum: 120ms
PACKED_DOUBLE sum: 180ms
PACKED_MIXED sum: 320ms
HOLEY sum: 400ms

=== INLINE CACHE ===
monomorphic (always same shape): 85ms
polymorphic (2 shapes): 95ms
megamorphic (10 shapes): 420ms   ← 5× slower
\`\`\`

**Stretch Challenges:**
- [ ] Use \`node --print-opt-code --print-deopt-code\` to see compiled machine code
- [ ] Profile with \`node --prof\` + tick-processor to find hot functions
- [ ] Add a WebAssembly version of the tight loop and compare`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Three compilation tiers V8 uses.
**Q2:** What is a hidden class?
**Q3:** What's an inline cache and why does it get "polymorphic"? From memory.

### Day 3 — Comprehension
**Q4:** Why do array element kinds matter for performance?
**Q5:** A junior deletes a property from a hot object — V8 perf drops. Diagnose.
**Q6:** Refactor for hidden class stability:
\`\`\`js
function makeUser(admin) {
  const u = { name: 'Ana' };
  if (admin) u.role = 'admin';
  return u;
}
\`\`\`

### Day 7 — Application
**Q7:** Write a micro-benchmark comparing for vs forEach vs for-of on PACKED_SMI array.
**Q8:** A PR hot path receives both {x,y} and {x,y,z} objects — explain IC pollution.
**Q9:** What are the practical perf rules derived from V8 hidden classes?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how V8 optimises this function: \`function add(a, b) { return a + b; }\` called 10M times with integers."
**Q11:** Draw: V8 JIT pipeline from source to machine code.
**Q12:** ★ System design: "Profile a Node microservice doing 50k RPS and identify the top 3 V8-level bottlenecks — tools, analysis, fixes."`
  },

  // ── 35. loops ────────────────────────────────────────────────────────────
  'loops': {
    feynman: `## FEYNMAN CHECK

### Explain Loops Like I'm 10 Years Old
> JavaScript has SIX loop forms: \`for\` (classic, index), \`while\` (unknown iterations), \`do...while\` (at least once), \`for...in\` (object property names — AVOID for arrays), \`for...of\` (iterable values — arrays, strings, Maps, Sets, generators), and \`Array.forEach\` (callback on each element). Modern preference: \`for...of\` for iterables with complex logic; \`map/filter/reduce\` for transformations; classic \`for\` for performance-critical indexed access. The non-obvious rules: \`for...in\` includes INHERITED enumerable properties — always risky on arrays. \`forEach\` cannot be broken with \`break\` or use \`return\` to exit early — use \`for...of\` or every/some for those needs. Generators + for-of give you lazy infinite iteration.

---

### 5 Deep Conceptual Questions

**Q1: When should you use for-of over map/filter?**
> **A:** Use \`for-of\` when: you need \`break\`/\`continue\`, you're accumulating into a single non-array result (summing), you're iterating over anything non-array (Map, Set, generator, string, NodeList), or combining multiple operations in one pass for performance. Use \`map/filter/reduce\` when: you're transforming an array into another array and readability matters more than micro-performance. The functional forms compose better; for-of is more flexible.

**Q2: Mental model for for-in vs for-of?**
> **A:** \`for...in\` was designed for OBJECTS — it iterates PROPERTY NAMES (string keys), including inherited enumerable ones. On arrays it gives '0', '1', '2' as strings AND any custom properties attached to the array or Array.prototype. Never use for-in on arrays. \`for...of\` uses the ITERATOR PROTOCOL — it works on any iterable, gives you VALUES, and excludes non-iterable properties. Use for-of for arrays; use \`Object.entries()\` in for-of for objects.

**Q3: Most dangerous misconception?**
> **A:** forEach can be broken:
> \`\`\`js
> // ❌ break and return have no effect in forEach
> [1, 2, 3, 4, 5].forEach((n) => {
>   if (n === 3) return;    // just skips THIS callback — doesn't stop iteration
>   if (n === 3) break;     // SyntaxError — can't break inside a function
> });
>
> // ✅ Use for...of for break/continue
> for (const n of [1, 2, 3, 4, 5]) {
>   if (n === 3) break;    // exits the loop
>   console.log(n);        // 1, 2
> }
>
> // ✅ Use .some() / .every() for early-exit functional style
> [1, 2, 3, 4, 5].some((n) => { console.log(n); return n === 3; });
> \`\`\`

**Q4: How does for-await-of work with async generators?**
> **A:** \`for await (const x of asyncIterable)\` calls \`asyncIterable[Symbol.asyncIterator]()\` to get an async iterator, then repeatedly calls \`.next()\` which returns a Promise — the loop awaits each one before proceeding. This enables "async lazy sequences" — paginated API data, streaming file reads, WebSocket messages — all with clean loop syntax. Cancellation via \`break\` calls the iterator's \`.return()\` method (if defined) to allow cleanup.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript iteration comprises imperative loops (for, while, do-while, for...in for property enumeration, for...of using the iterator protocol, for-await-of for async iterables) and declarative array methods (map, filter, reduce, every, some, find, flatMap) — with for...in avoiding arrays due to prototype pollution, for...of composing cleanly with generators and any Symbol.iterator-implementing object, and forEach lacking break/return semantics — with V8 optimising for PACKED_SMI element loops via element-kind-specific code paths."`,
    build: `## BUILD

### 🏗️ Mini Project: Loop Performance Profiler — Empirically Compare All 6 Loop Forms

**What you will build:** A benchmark suite comparing all JS loop forms on the same workload — sum of 1M integers — with a chart of relative performance and an explanation of why each differs.
**Why this project:** Makes the theoretical loop-performance rules MEASURABLE — removes guess-work from perf conversations.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-loops && cd js-loops
node --version
ni bench.js, results.md -ItemType File
\`\`\`

#### Step 2 — Benchmarks
\`\`\`js
// bench.js
import { performance } from 'node:perf_hooks';

const SIZE = 1_000_000;
const arr  = Int32Array.from({ length: SIZE }, (_, i) => i);   // TypedArray for best perf
const regular = Array.from({ length: SIZE }, (_, i) => i);    // regular PACKED_SMI

function bench(label, fn, iterations = 10) {
  // Warm-up
  for (let i = 0; i < 3; i++) fn();
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const ms = ((performance.now() - start) / iterations).toFixed(2);
  console.log(\`\${label.padEnd(40)}: \${ms}ms per run\`);
}

// 1. Classic for loop (fastest — direct index, no protocol overhead)
bench('for (classic, TypedArray)', () => {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) sum += arr[i];
  return sum;
});

bench('for (classic, regular array)', () => {
  let sum = 0;
  for (let i = 0; i < regular.length; i++) sum += regular[i];
  return sum;
});

// 2. while
bench('while', () => {
  let sum = 0, i = 0;
  while (i < regular.length) sum += regular[i++];
  return sum;
});

// 3. for...of
bench('for...of', () => {
  let sum = 0;
  for (const x of regular) sum += x;
  return sum;
});

// 4. forEach
bench('Array.forEach', () => {
  let sum = 0;
  regular.forEach(x => { sum += x; });
  return sum;
});

// 5. reduce
bench('Array.reduce', () => {
  return regular.reduce((acc, x) => acc + x, 0);
});

// 6. for...in (DON'T do this on arrays — show it's slow + risky)
bench('for...in (wrong tool)', () => {
  let sum = 0;
  for (const key in regular) sum += regular[key];
  return sum;
});
\`\`\`

#### Step 3 — When To Use Each
\`\`\`js
// Use cases for each loop form

// for: performance-critical, index needed, typed arrays
function binarySearch(sortedArr, target) {
  let lo = 0, hi = sortedArr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (sortedArr[mid] === target) return mid;
    if (sortedArr[mid] < target)  lo = mid + 1;
    else                          hi = mid - 1;
  }
  return -1;
}

// for...of: natural for iterables, supports break
function findFirst(iterable, predicate) {
  for (const item of iterable) {
    if (predicate(item)) return item;
  }
  return null;
}

// for...of with Object.entries: clean object iteration
function formatConfig(config) {
  const lines = [];
  for (const [key, value] of Object.entries(config)) {
    lines.push(\`\${key} = \${value}\`);
  }
  return lines.join('\\n');
}
\`\`\`

#### Step 4 — Early Exit Patterns
\`\`\`js
const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// ❌ forEach cannot early-exit
// data.forEach(n => { if (n > 5) break; });   SyntaxError

// ✅ some() for "any" — exits on first true
const hasLarge = data.some(n => n > 5);

// ✅ every() for "all" — exits on first false
const allPositive = data.every(n => n > 0);

// ✅ find() for first match
const firstLarge = data.find(n => n > 5);

// ✅ for...of for complex early-exit logic
function sumUntilExceeds(data, limit) {
  let sum = 0;
  for (const n of data) {
    if (sum + n > limit) break;
    sum += n;
  }
  return sum;
}

console.log(sumUntilExceeds([3, 3, 3, 3, 3, 3, 3], 10));   // 9
\`\`\`

#### Step 5 — Tests
\`\`\`js
// loops.test.js
import { describe, it, expect } from 'vitest';

describe('loop semantics', () => {
  it('for...of iterates values', () => {
    const r = [];
    for (const x of [1, 2, 3]) r.push(x);
    expect(r).toEqual([1, 2, 3]);
  });
  it('for...in iterates keys as strings', () => {
    const r = [];
    for (const k in [1, 2, 3]) r.push(typeof k);
    expect(r).toEqual(['string', 'string', 'string']);
  });
  it('forEach cannot break (method returns undefined)', () => {
    let count = 0;
    [1, 2, 3, 4, 5].forEach((n) => { if (n === 3) return; count++; });
    expect(count).toBe(4);   // 3 was skipped but 4 and 5 still ran
  });
  it('for...of break exits the loop', () => {
    let count = 0;
    for (const n of [1, 2, 3, 4, 5]) { if (n === 3) break; count++; }
    expect(count).toBe(2);   // 1 and 2 counted
  });
});
\`\`\`

**Expected Output:**
\`\`\`
for (classic, TypedArray)               : 0.18ms per run
for (classic, regular array)            : 0.41ms per run
while                                    : 0.43ms per run
for...of                                 : 0.86ms per run
Array.forEach                            : 0.91ms per run
Array.reduce                             : 0.95ms per run
for...in (wrong tool)                    : 8.20ms per run  ← 20× slower!

# 4/4 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add Int32Array vs Float64Array vs regular array benchmark
- [ ] Benchmark for-await-of over async generator vs Promise.all for 1000 items
- [ ] Add a benchmark for sparse (holey) arrays to show the performance cliff`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Six loop forms in JavaScript.
**Q2:** Why should you never use for...in on arrays?
**Q3:** Write a for...of loop with break. From memory.

### Day 3 — Comprehension
**Q4:** How do you early-exit from forEach?
**Q5:** A junior uses \`for (const k in obj)\` and accidentally iterates prototype methods. Fix.
**Q6:** Refactor for-in to safe object iteration:
\`\`\`js
for (const key in config) { apply(key, config[key]); }
\`\`\`

### Day 7 — Application
**Q7:** Build a lazy batch processor using for-of + generator that yields chunks of N.
**Q8:** A PR chains .map().filter().reduce() in a hot path — show a single-loop equivalent.
**Q9:** What's the cost difference between for-of and a classic for on PACKED_SMI arrays?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every iteration mechanism in JS and pick the right one for each scenario."
**Q11:** Draw: how for...of interacts with Symbol.iterator — the full call sequence.
**Q12:** ★ System design: "Process 1 billion records in Node — generators, streams, worker-threads — which loop form at each layer?"`
  },

  // ── 36. performance-optimization-js ──────────────────────────────────────
  'performance-optimization-js': {
    feynman: `## FEYNMAN CHECK

### Explain JS Performance Like I'm 10 Years Old
> Making JavaScript fast means: doing LESS work, doing it FEWER TIMES, and giving the V8 engine PREDICTABLE patterns to optimise. The main levers: AVOID LAYOUT THRASH (batch DOM reads then writes), DEBOUNCE/THROTTLE expensive event handlers, use MEMOISATION to skip repeated computations, move CPU work to WEB WORKERS, prefer TYPED ARRAYS for numerical data, avoid creating garbage in hot paths (object pool), and let the browser batch visual updates with requestAnimationFrame. The non-obvious insight: the number-one JS performance issue in 2026 is not algorithmic complexity — it is BUNDLE SIZE (parse + eval time). A 1MB uncompressed bundle delays interactivity by ~800ms on mid-range mobile. Tree-shaking, code-splitting, and proper lazy-loading matter more than micro-optimisations.

---

### 5 Deep Conceptual Questions

**Q1: What are the five performance bottleneck categories?**
> **A:** (1) PARSE/EVAL — large bundles are slow to download, parse, and JIT compile. (2) STYLE/LAYOUT — DOM mutations causing repeated reflow. (3) JS CPU — synchronous operations blocking the main thread (>50ms = "long task"). (4) GARBAGE COLLECTION — allocation storms triggering frequent GC pauses. (5) NETWORK — too many requests, large resources, no caching. Profiling (Chrome DevTools Performance panel, Lighthouse, Node --prof) identifies which category is hot before optimising.

**Q2: Mental model for debounce vs throttle?**
> **A:** DEBOUNCE: delay the call until N ms after the LAST invocation — "wait until they stop typing." Scroll-to-anchor search, save-as-you-type. THROTTLE: allow the call at most once per N ms — "fire at most once per interval regardless of how often triggered." Scroll position for analytics, resize listener for responsive layout. BOTH are for reducing high-frequency callbacks — pick based on "fire after calm" (debounce) vs "fire regularly" (throttle).

**Q3: Most dangerous misconception?**
> **A:** Micro-optimisations matter more than algorithmic choices:
> \`\`\`js
> // ❌ Obsessing over == vs === perf
> // Irrelevant — both are ns-level differences

> // ❌ Caching array.length in a loop  (modern V8 already does this)
> for (let i = 0, len = arr.length; i < len; i++) {}  // no measurable gain

> // ✅ ACTUAL wins:
> // 1. Replace O(n²) with O(n log n) algorithm
> // 2. Avoid a 500ms reflow on every keystroke
> // 3. Tree-shake 200KB unused code from the bundle
> // 4. Replace synchronous DB call with async + connection pool
> // 5. Move image processing to a Web Worker
> \`\`\`

**Q4: How does memoisation interact with garbage collection?**
> **A:** A naive memoisation cache (Map keyed by args) holds STRONG REFERENCES to every result — cache grows unboundedly and prevents GC. Solutions: (1) LRU cache with max size — evict oldest on overflow. (2) WeakMap for object keys — GC'able when key is unreachable (only works for object args). (3) TTL-based expiry — expires after N seconds. The right choice depends on: result size, arg types, access patterns, and memory constraints.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript performance optimisation spans: bundle reduction (code-splitting, tree-shaking, dynamic import for non-critical paths), runtime CPU (algorithmic complexity, debounce/throttle, Web Worker offloading, WASM for compute-heavy tasks), memory (object pooling, WeakMap caches, avoiding closures over large data), rendering (batched DOM mutations, CSS transforms for GPU compositing, requestAnimationFrame scheduling), and network (HTTP/2 multiplexing, preload/prefetch, resource hints, edge caching) — with profiling as the mandatory prerequisite to any optimisation decision."`,
    build: `## BUILD

### 🏗️ Mini Project: Search-As-You-Type With Debounce + Web Worker + LRU Cache

**What you will build:** A search box that debounces keystrokes, offloads the actual search to a Web Worker, caches results in an LRU cache, and shows render timing in the console.
**Why this project:** Combines every major perf technique in one realistic UI feature.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-perf && cd js-perf
ni index.html, debounce.js, lru.js, search.worker.js, app.js -ItemType File
\`\`\`

#### Step 2 — Utilities
\`\`\`js
// debounce.js
export function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

export function throttle(fn, ms) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn.apply(this, args); }
  };
}

// lru.js
export class LRUCache {
  #max; #map = new Map();
  constructor(max = 100) { this.#max = max; }
  get(key) {
    if (!this.#map.has(key)) return undefined;
    const val = this.#map.get(key);
    this.#map.delete(key);
    this.#map.set(key, val);   // move to tail (most recent)
    return val;
  }
  set(key, value) {
    if (this.#map.has(key)) this.#map.delete(key);
    else if (this.#map.size >= this.#max) {
      this.#map.delete(this.#map.keys().next().value);  // evict LRU (head)
    }
    this.#map.set(key, value);
  }
  get size() { return this.#map.size; }
}
\`\`\`

#### Step 3 — Web Worker Search
\`\`\`js
// search.worker.js
const DATA = Array.from({ length: 50_000 }, (_, i) => ({
  id: i,
  title: 'Item ' + i,
  tags: ['js', 'ts', 'react', 'vue', 'angular'].filter((_, j) => (i + j) % 3 === 0),
}));

self.onmessage = ({ data: { query, reqId } }) => {
  const q = query.toLowerCase().trim();
  const start = performance.now();
  const results = q
    ? DATA.filter(d => d.title.toLowerCase().includes(q) || d.tags.some(t => t.includes(q)))
    : [];
  self.postMessage({ results: results.slice(0, 20), reqId, elapsed: performance.now() - start });
};
\`\`\`

#### Step 4 — App Integration
\`\`\`js
// app.js
import { debounce } from './debounce.js';
import { LRUCache } from './lru.js';

const worker = new Worker(new URL('./search.worker.js', import.meta.url));
const cache  = new LRUCache(50);
let reqId = 0;

const input   = document.getElementById('query');
const results = document.getElementById('results');
const stats   = document.getElementById('stats');

const search = debounce((query) => {
  const cached = cache.get(query);
  if (cached) { render(cached, 0, 'CACHE'); return; }

  const id = ++reqId;
  worker.postMessage({ query, reqId: id });
}, 200);

worker.onmessage = ({ data: { results: res, reqId: id, elapsed } }) => {
  if (id !== reqId) return;   // stale response — ignore
  cache.set(input.value, res);
  render(res, elapsed, 'WORKER');
};

function render(items, elapsed, source) {
  const start = performance.now();
  results.innerHTML = items.map(i =>
    '<li>' + i.title + ' [' + i.tags.join(', ') + ']</li>').join('');
  stats.textContent = source + ' | search: ' + elapsed.toFixed(1) + 'ms | render: ' + (performance.now() - start).toFixed(1) + 'ms | cache: ' + cache.size;
}

input.addEventListener('input', e => search(e.target.value));
\`\`\`

#### Step 5 — Tests
\`\`\`js
// perf.test.js
import { describe, it, expect, vi } from 'vitest';
import { debounce, throttle } from './debounce.js';
import { LRUCache } from './lru.js';

describe('debounce', () => {
  it('delays invocation', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d(); d(); d();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('LRUCache', () => {
  it('returns undefined for missing key', () => {
    const c = new LRUCache(3);
    expect(c.get('x')).toBeUndefined();
  });
  it('evicts LRU on overflow', () => {
    const c = new LRUCache(2);
    c.set('a', 1); c.set('b', 2);
    c.get('a');        // a is now MRU
    c.set('c', 3);     // b evicted (LRU)
    expect(c.get('b')).toBeUndefined();
    expect(c.get('a')).toBe(1);
    expect(c.get('c')).toBe(3);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
WORKER | search: 12.3ms | render: 0.8ms | cache: 1
WORKER | search: 11.1ms | render: 0.6ms | cache: 2
CACHE  | search: 0ms    | render: 0.5ms | cache: 2  (same query again → cache hit)
\`\`\`

**Stretch Challenges:**
- [ ] Add requestIdleCallback to render results only when browser is idle
- [ ] Replace Web Worker with WASM for even faster search
- [ ] Add virtual scrolling to render only visible items from 50k results`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between debounce and throttle?
**Q2:** What is "layout thrashing"?
**Q3:** Write a debounce function. From memory.

### Day 3 — Comprehension
**Q4:** Why does bundle size matter more than micro-optimisations for mobile?
**Q5:** A junior memoises a function with a plain object cache — memory grows forever. Fix.
**Q6:** When should you use a Web Worker vs WASM vs just optimising the algorithm?

### Day 7 — Application
**Q7:** Build a performance profiler that measures time for each step in a data pipeline.
**Q8:** A PR has a 3MB lodash import — explain tree-shaking and the fix.
**Q9:** What Lighthouse score does a 1MB bundle get for Time-to-Interactive on 3G?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Profile a React SPA that feels janky on scroll — walk me through every tool and fix."
**Q11:** Draw: critical rendering path and where JS execution fits in.
**Q12:** ★ System design: "Optimise a dashboard that renders 10k data points every 2 seconds — WebGL, Canvas, virtual DOM, or direct DOM?"`
  },

  // ── 37. functional-programming-js ────────────────────────────────────────
  'functional-programming-js': {
    feynman: `## FEYNMAN CHECK

### Explain Functional Programming Like I'm 10 Years Old
> Functional Programming (FP) is a style where: (1) you prefer PURE FUNCTIONS (same inputs → same outputs, no side effects), (2) you treat data as IMMUTABLE (never mutate, always return new values), (3) you build complex operations from SMALL COMPOSED FUNCTIONS (pipe/compose). The result: code that's easier to test (pure functions are trivially testable), easier to reason about (no hidden state), and often more concise. JavaScript isn't purely functional but supports the style — Array.map/filter/reduce are the gateway drugs. The advanced tools: functor (map over a container), monad (flatMap for chaining containers that might be empty/errored), and ADTs (Option/Result types replacing null/exceptions). Libraries like Ramda and fp-ts bring the full FP toolkit to JS/TS.

---

### 5 Deep Conceptual Questions

**Q1: What makes a function "pure"?**
> **A:** A pure function: (1) always returns the SAME OUTPUT for the same inputs (referential transparency), (2) has NO SIDE EFFECTS — doesn't modify external state, perform I/O, read from mutable global, mutate its arguments. Benefits: trivially testable (no mocking), memoizable (same args → cache result), parallelisable (no shared state conflicts). Impure code (DB calls, logging, UI mutations) is inevitable — FP pushes impurity to the EDGES and keeps the logic core pure.

**Q2: Mental model for function composition?**
> **A:** Every program is a pipeline: input → transform1 → transform2 → ... → output. Composition lets you build pipelines from small, tested, named units: \`const processOrder = pipe(validateOrder, calculateTax, applyDiscounts, formatReceipt)\`. Each step is a pure function. The pipeline is itself a function. Changing any step doesn't break others. This is the underlying model of React hooks (compose effects), Redux reducers (compose state transitions), and RxJS operators (compose stream transformations).

**Q3: Most dangerous misconception?**
> **A:** FP is always better than OOP:
> \`\`\`js
> // ❌ Extreme immutability has real costs
> // Updating one field in a 1000-property object with spread:
> const next = { ...state, ...state.users.map(u => u.id === id ? { ...u, role: 'admin' } : u) };
> // vs mutable version: users.find(u => u.id === id).role = 'admin';
>
> // ❌ Deep nesting of map/filter/reduce can be LESS readable than a for loop
> // ✅ FP is a TOOL — use it where it improves clarity (transformations, pipelines)
> //   and skip it where it doesn't (game loops, DOM manipulation, stateful services)
> \`\`\`

**Q4: How does an Option/Maybe monad help over null?**
> **A:** Instead of returning null and forcing callers to check, an Option type wraps a value that may not exist: Some(value) or None. You can \`map\` over it (apply a function if Some, return None if None) and \`flatMap\` for chaining. The benefit: you CANNOT accidentally call methods on a None without explicitly handling it — the type enforces the null-check. TypeScript's \`strictNullChecks\` approximates this; full Option types come from libraries like fp-ts.

**Q5: FAANG-grade definition?**
> **A:** "Functional programming in JavaScript is a style emphasising pure functions (deterministic, side-effect-free), immutable data (spread, structuredClone, Immer), first-class functions (stored, passed, returned), and function composition (pipe, compose, curry, partial) — with higher-order functions (map, filter, reduce, flatMap) as the foundational idioms — and optional FP abstractions (functor, monad, applicative via fp-ts) for rigorous null-safety and error-chaining — pragmatically mixed with imperative and OOP styles in production JavaScript."`,
    build: `## BUILD

### 🏗️ Mini Project: Railway-Oriented Programming — Result<T,E> For Error Chaining

**What you will build:** A Result type (Ok<T> | Err<E>) that lets you chain operations without try/catch — the functional alternative to exception-based error handling.
**Why this project:** Forces monad-style composition AND comparison with try/catch — the FP pattern most relevant to production JS.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-fp && cd js-fp
npm init -y && npm install -D vitest
ni result.js, pipeline.js, result.test.js -ItemType File
\`\`\`

#### Step 2 — Result Type
\`\`\`js
// result.js
export const ok  = (value) => ({ ok: true,  value,  error: undefined });
export const err = (error) => ({ ok: false, value: undefined, error });

export function mapResult(result, fn) {
  return result.ok ? ok(fn(result.value)) : result;
}

export function flatMapResult(result, fn) {
  return result.ok ? fn(result.value) : result;
}

export function mapErr(result, fn) {
  return result.ok ? result : err(fn(result.error));
}

// Pipe through a series of Result-returning functions
export function pipeResult(value, ...fns) {
  return fns.reduce((res, fn) => flatMapResult(res, fn), ok(value));
}

// Unwrap or throw
export function unwrap(result) {
  if (result.ok) return result.value;
  throw result.error instanceof Error ? result.error : new Error(String(result.error));
}

// Convert try/catch block to Result
export function tryCatch(fn) {
  try { return ok(fn()); }
  catch (e) { return err(e); }
}
\`\`\`

#### Step 3 — Pipeline Using Result
\`\`\`js
// pipeline.js
import { ok, err, pipeResult } from './result.js';

function parseAge(input) {
  const n = parseInt(input, 10);
  if (!Number.isInteger(n)) return err(new Error('Age must be a number'));
  return ok(n);
}

function validateAge(age) {
  if (age < 0 || age > 150) return err(new Error('Age out of range (0-150)'));
  return ok(age);
}

function formatAge(age) {
  return ok(age < 18 ? 'minor' : age < 65 ? 'adult' : 'senior');
}

export function classifyAge(input) {
  return pipeResult(input, parseAge, validateAge, formatAge);
}

// Demo
const cases = ['25', '-5', '200', 'abc', '17', '70'];
cases.forEach(input => {
  const r = classifyAge(input);
  if (r.ok) console.log(\`"\${input}" → \${r.value}\`);
  else      console.log(\`"\${input}" → ERROR: \${r.error.message}\`);
});
\`\`\`

#### Step 4 — Compare With try/catch
\`\`\`js
// comparison.js
// ❌ try/catch — error type is unknown, leaks at call site
async function loadUserTryCatch(id) {
  try {
    const res = await fetch('/api/users/' + id);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    // What type is e? NetworkError? HttpError? ParseError? Unknown!
    console.error(e);
    return null;  // caller can't distinguish error types
  }
}

// ✅ Result — caller knows exactly what happened
async function loadUserResult(id) {
  const res = await tryCatch(() => fetch('/api/users/' + id)).then(...)
  // Each step returns typed Result
}

// Practical use: validate form fields
function validateForm({ name, age, email }) {
  return pipeResult(
    { name, age, email },
    (d) => d.name.length >= 2 ? ok(d) : err('Name too short'),
    (d) => parseAge(String(d.age)).ok ? ok(d) : err('Invalid age'),
    (d) => /^[^@]+@[^@]+\\.[^@]+$/.test(d.email) ? ok(d) : err('Invalid email'),
  );
}
\`\`\`

#### Step 5 — Tests
\`\`\`js
// result.test.js
import { describe, it, expect } from 'vitest';
import { ok, err, mapResult, flatMapResult, pipeResult, tryCatch, unwrap } from './result.js';
import { classifyAge } from './pipeline.js';

describe('Result type', () => {
  it('ok wraps value, err wraps error', () => {
    expect(ok(42)).toEqual({ ok: true, value: 42, error: undefined });
    expect(err('fail')).toEqual({ ok: false, value: undefined, error: 'fail' });
  });
  it('mapResult transforms ok', () => {
    expect(mapResult(ok(5), n => n * 2)).toEqual(ok(10));
  });
  it('mapResult skips err', () => {
    const r = mapResult(err('x'), n => n * 2);
    expect(r.ok).toBe(false);
    expect(r.error).toBe('x');
  });
  it('flatMapResult chains results', () => {
    const r = flatMapResult(ok(5), n => n > 0 ? ok(n * 2) : err('negative'));
    expect(r).toEqual(ok(10));
  });
  it('tryCatch converts exception to err', () => {
    expect(tryCatch(() => { throw new Error('boom'); }).ok).toBe(false);
    expect(tryCatch(() => 42)).toEqual(ok(42));
  });
});

describe('classifyAge pipeline', () => {
  it('valid adult', () => expect(classifyAge('25')).toEqual(ok('adult')));
  it('valid minor', () => expect(classifyAge('15')).toEqual(ok('minor')));
  it('valid senior', () => expect(classifyAge('70')).toEqual(ok('senior')));
  it('negative age', () => expect(classifyAge('-1').ok).toBe(false));
  it('non-numeric', () => expect(classifyAge('abc').ok).toBe(false));
});
\`\`\`

**Expected Output:**
\`\`\`
"25" → adult
"-5" → ERROR: Age out of range (0-150)
"200" → ERROR: Age out of range (0-150)
"abc" → ERROR: Age must be a number
"17" → minor
"70" → senior

# 9/9 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add an async pipe that handles Promise-returning functions
- [ ] Convert the result type to TypeScript with full generics
- [ ] Compare with neverthrow npm package`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What makes a function pure?
**Q2:** Difference between map and flatMap for containers?
**Q3:** Write a pipe of three pure functions. From memory.

### Day 3 — Comprehension
**Q4:** When does FP hurt more than it helps?
**Q5:** A junior chains .map().map().map() — rewrite as a single pass.
**Q6:** Refactor to pure function:
\`\`\`js
let total = 0;
function addToTotal(n) { total += n; return total; }
\`\`\`

### Day 7 — Application
**Q7:** Build an Option<T> type with map, flatMap, getOrElse.
**Q8:** A PR has deeply nested if/else for data transformation — refactor with pipe.
**Q9:** What's the perf cost of immutable updates with spread vs Immer?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Implement compose(f, g, h) from scratch and explain its type signature."
**Q11:** Draw: railway-oriented programming — the happy path and error track.
**Q12:** ★ System design: "Architect a data transformation pipeline for ETL processing 10M events/day using FP principles."`
  },

  // ── 38. design-patterns-js ───────────────────────────────────────────────
  'design-patterns-js': {
    feynman: `## FEYNMAN CHECK

### Explain Design Patterns Like I'm 10 Years Old
> Design patterns are REUSABLE SOLUTIONS to COMMON PROBLEMS in code. They're not code you copy — they're ideas you adapt. The Gang of Four book (1994) catalogued 23 patterns in three categories: CREATIONAL (how to create objects: Singleton, Factory, Builder, Prototype), STRUCTURAL (how to compose objects: Adapter, Decorator, Facade, Proxy, Composite), and BEHAVIOURAL (how objects communicate: Observer, Strategy, Command, Iterator, Chain of Responsibility). JavaScript has its own idiomatic patterns: Module (IIFE-based), Revealing Module, Mixin, Observer (EventEmitter), Pub/Sub, Prototype-delegation, Middleware (Express). The non-obvious point: overuse of patterns is the biggest mistake. Patterns solve ACTUAL problems — applying them to simple code adds complexity without benefit.

---

### 5 Deep Conceptual Questions

**Q1: What problems do creational patterns solve?**
> **A:** They hide the complexity of OBJECT CONSTRUCTION. Factory Method hides which subclass to instantiate (useful when the exact type isn't known until runtime). Builder assembles complex objects step-by-step — great for objects with many optional configs (QueryBuilder, URL builder, test fixtures). Singleton ensures ONE instance (logger, config, connection pool — but beware: global state, hard to test, anti-pattern in most modern DI frameworks).

**Q2: Mental model for Observer vs Pub/Sub?**
> **A:** OBSERVER: subjects hold direct REFERENCES to observers — tight coupling. \`eventEmitter.on('data', handler)\` — the emitter knows its listeners. PUB/SUB: a message BROKER decouples publishers from subscribers — publishers post to a topic, subscribers listen on a topic, neither knows the other. Redux (central store), MessageBus, MQTT. Pub/Sub is better for cross-component communication; Observer for tight component relationships.

**Q3: Most dangerous misconception?**
> **A:** Singleton is always a pattern worth using:
> \`\`\`js
> // ❌ Singleton makes testing hard — global state leaked between tests
> class Database {
>   static instance;
>   static getInstance() { return (Database.instance ??= new Database()); }
> }
> // In test: can't inject a different DB, tests pollute each other
>
> // ✅ Use Dependency Injection instead — pass the dependency
> class UserService {
>   constructor(private db: Database) {}  // injectable!
> }
> // Test: new UserService(mockDb)
> // Singleton only genuinely needed for: performance-sensitive system resources
> //   (e.g., V8 isolate, WASM module) — everywhere else, prefer DI
> \`\`\`

**Q4: How does the Strategy pattern differ from Polymorphism?**
> **A:** Polymorphism (via inheritance) bakes the algorithm into the CLASS hierarchy — you swap algorithms by changing the class. Strategy bakes the algorithm into a FUNCTION/OBJECT that's INJECTED at runtime — you swap algorithms by passing a different function. Strategy is more flexible (compose multiple strategies, switch at runtime, easier to test), but adds more abstraction. Modern FP idiom: pass a function. Classic OOP: inject a Strategy object. Lodash's sortBy(arr, iteratee) is the Strategy pattern with a function.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript design patterns are recurring solution templates for common software design problems — divided into creational (Factory, Builder, Singleton), structural (Adapter, Decorator, Proxy, Facade, Composite), and behavioural (Observer, Strategy, Command, Chain of Responsibility, Iterator, Mediator) patterns from the Gang of Four — augmented by JavaScript-specific idioms (Module/IIFE, Mixin, Prototype Delegation, Middleware Pipeline) — valuable as a shared vocabulary and as starting points, but anti-patterns when applied mechanically to problems they don't genuinely solve."`,
    build: `## BUILD

### 🏗️ Mini Project: Mini Express-Style Middleware Pipeline (Chain of Responsibility)

**What you will build:** A composable middleware pipeline that processes HTTP-like request objects through auth, rate-limiting, validation, and logging middlewares — exactly how Express, Koa, and Next.js API routes work internally.
**Why this project:** Forces Chain of Responsibility + Decorator-via-wrapper + Command — three patterns in one realistic project.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-patterns && cd js-patterns
npm init -y && npm install -D vitest
ni middleware.js, patterns.js, patterns.test.js -ItemType File
\`\`\`

#### Step 2 — Middleware Pipeline
\`\`\`js
// middleware.js
export function createApp() {
  const stack = [];

  return {
    use(fn) { stack.push(fn); return this; },

    async handle(req, res) {
      let index = 0;
      const next = async () => {
        const mw = stack[index++];
        if (mw) await mw(req, res, next);
      };
      await next();
      return res;
    },
  };
}

// Middleware implementations
export function authMiddleware(req, res, next) {
  if (!req.headers?.authorization) {
    res.status = 401; res.body = { error: 'Unauthorized' }; return;
  }
  req.user = { id: 1, role: 'user' };
  return next();
}

export function rateLimitMiddleware(limit = 100) {
  const counts = new Map();
  return (req, res, next) => {
    const key = req.ip ?? 'unknown';
    const current = (counts.get(key) ?? 0) + 1;
    counts.set(key, current);
    if (current > limit) {
      res.status = 429; res.body = { error: 'Too Many Requests' }; return;
    }
    req.rateInfo = { remaining: limit - current };
    return next();
  };
}

export function logMiddleware(req, res, next) {
  const start = Date.now();
  return next().then(() => {
    console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url} \${res.status} \${Date.now()-start}ms\`);
  });
}
\`\`\`

#### Step 3 — Other Patterns Demo
\`\`\`js
// patterns.js

// OBSERVER — EventEmitter
export class EventEmitter {
  #events = new Map();
  on(e, fn)  { (this.#events.get(e) ?? this.#events.set(e, new Set()).get(e)).add(fn); }
  off(e, fn) { this.#events.get(e)?.delete(fn); }
  emit(e, ...args) { for (const fn of this.#events.get(e) ?? []) fn(...args); }
}

// STRATEGY — sorting
const sortStrategies = {
  asc:       (a, b) => a.localeCompare(b),
  desc:      (a, b) => b.localeCompare(a),
  byLength:  (a, b) => a.length - b.length,
};
export const sortWith = (arr, strategy = 'asc') =>
  [...arr].sort(sortStrategies[strategy] ?? sortStrategies.asc);

// DECORATOR — adding retry to any async function
export function withRetry(fn, maxAttempts = 3, delayMs = 100) {
  return async function (...args) {
    let lastErr;
    for (let i = 0; i < maxAttempts; i++) {
      try { return await fn(...args); }
      catch (e) { lastErr = e; if (i < maxAttempts - 1) await new Promise(r => setTimeout(r, delayMs)); }
    }
    throw lastErr;
  };
}

// BUILDER — query builder
export class QueryBuilder {
  #table; #conditions = []; #limit; #offset; #orderBy;

  from(table)          { this.#table = table; return this; }
  where(cond)          { this.#conditions.push(cond); return this; }
  order(col, dir='ASC'){ this.#orderBy = { col, dir }; return this; }
  take(n)              { this.#limit = n; return this; }
  skip(n)              { this.#offset = n; return this; }

  build() {
    let q = 'SELECT * FROM ' + this.#table;
    if (this.#conditions.length) q += ' WHERE ' + this.#conditions.join(' AND ');
    if (this.#orderBy) q += ' ORDER BY ' + this.#orderBy.col + ' ' + this.#orderBy.dir;
    if (this.#limit)   q += ' LIMIT ' + this.#limit;
    if (this.#offset)  q += ' OFFSET ' + this.#offset;
    return q;
  }
}
\`\`\`

#### Step 4 — Wire Everything Together
\`\`\`js
// demo.js
import { createApp, authMiddleware, rateLimitMiddleware, logMiddleware } from './middleware.js';
import { sortWith, withRetry, QueryBuilder } from './patterns.js';

const app = createApp();
app.use(logMiddleware)
   .use(rateLimitMiddleware(5))
   .use(authMiddleware);

const req = { method: 'GET', url: '/users', headers: { authorization: 'Bearer x' }, ip: '127.0.0.1' };
const res = { status: 200, body: null };
await app.handle(req, res);
console.log('response:', res);

console.log(sortWith(['banana', 'apple', 'cherry'], 'asc'));
console.log(sortWith(['banana', 'apple', 'cherry'], 'byLength'));

const q = new QueryBuilder()
  .from('users').where('age > 18').where('role = "admin"').order('name').take(10).skip(20)
  .build();
console.log(q);
\`\`\`

#### Step 5 — Tests
\`\`\`js
// patterns.test.js
import { describe, it, expect, vi } from 'vitest';
import { createApp, authMiddleware } from './middleware.js';
import { sortWith, withRetry, QueryBuilder } from './patterns.js';

describe('middleware pipeline', () => {
  it('stops pipeline on 401', async () => {
    const app = createApp();
    const next = vi.fn();
    app.use(authMiddleware).use(next);
    const req = { method: 'GET', url: '/', headers: {} };
    const res = {};
    await app.handle(req, res);
    expect(res.status).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('QueryBuilder', () => {
  it('builds a query with all options', () => {
    const q = new QueryBuilder().from('users').where('active = true').order('name').take(5).build();
    expect(q).toBe('SELECT * FROM users WHERE active = true ORDER BY name ASC LIMIT 5');
  });
});

describe('withRetry decorator', () => {
  it('retries on failure', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('x'))
      .mockResolvedValue('ok');
    const wrapped = withRetry(fn, 3, 1);
    expect(await wrapped()).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
\`\`\`

**Expected Output:**
\`\`\`
[2026-06-26] GET /users 200 2ms
response: { status: 200, body: null }
['apple', 'banana', 'cherry']
['apple', 'banana', 'cherry']   (by length: 5, 6, 6)
SELECT * FROM users WHERE age > 18 AND role = "admin" ORDER BY name ASC LIMIT 10 OFFSET 20

# All tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add a CQRS-style command bus pattern
- [ ] Implement Undo/Redo using the Command pattern
- [ ] Build a type-safe dependency injection container`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Three categories of GoF patterns.
**Q2:** Difference between Observer and Pub/Sub?
**Q3:** Write a Singleton in JS. From memory.

### Day 3 — Comprehension
**Q4:** Why is Singleton usually an anti-pattern in modern code?
**Q5:** A junior uses inheritance to add retry logic — refactor to a Decorator function.
**Q6:** Refactor to Strategy:
\`\`\`js
function format(data, type) {
  if (type === 'json') return JSON.stringify(data);
  if (type === 'csv')  return data.map(r => r.join(',')).join('\\n');
}
\`\`\`

### Day 7 — Application
**Q7:** Build an event bus that supports wildcard subscriptions (\`user.*\`).
**Q8:** A PR implements a Builder with 12 parameters as constructor args — refactor.
**Q9:** What's the performance cost of the middleware pipeline pattern at 100k req/s?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every place design patterns appear in the React codebase."
**Q11:** Draw: class diagram for Strategy pattern applied to a payment processor.
**Q12:** ★ System design: "Design a plugin system for a SaaS — factory + observer + command patterns combined."`
  },

  // ── 39. testing-js ───────────────────────────────────────────────────────
  'testing-js': {
    feynman: `## FEYNMAN CHECK

### Explain JS Testing Like I'm 10 Years Old
> Testing is writing CODE that checks your CODE. Three levels: UNIT (test one function in isolation — fast, pure functions, no I/O), INTEGRATION (test multiple units working together — database + service + API), E2E (test the whole system through the UI — Playwright/Cypress). The testing pyramid: LOTS of unit tests (fast, cheap), FEWER integration tests, VERY FEW E2E tests (slow, fragile). Modern tools: Vitest (unit/integration, fast, ESM-native), Jest (older, battle-tested), Playwright (E2E). The non-obvious rule: test BEHAVIOR, not IMPLEMENTATION. \`expect(cart.total).toBe(100)\` is a good test. \`expect(cart._calculateLineItems).toHaveBeenCalledWith(5)\` is a brittle test that breaks when you refactor internals.

---

### 5 Deep Conceptual Questions

**Q1: What is the right granularity for a unit test?**
> **A:** The right granularity is a PUBLIC BEHAVIOR — something the user or API consumer can observe. Not "the private method was called" or "the helper function returned X," but "given inputs, the observable output is Y." This makes tests refactoring-resistant — you can completely rewrite internals and the test still passes. It also drives good API design: if testing is hard, the API is probably wrong.

**Q2: Mental model for mocks, stubs, and spies?**
> **A:** STUB: a fake function that returns a pre-programmed value — replaces real dependencies. MOCK: a stub PLUS expectations about how it was called — verifies interaction, not just output. SPY: wraps the REAL function and records calls — lets you assert on calls without replacing behavior. Rule of thumb: prefer stubs for state-based tests (check outputs), mocks for interaction-based tests (check calls). Over-mocking leads to tests that pass when production code is broken.

**Q3: Most dangerous misconception?**
> **A:** High code coverage means high quality:
> \`\`\`js
> // ❌ This test has 100% coverage but tests NOTHING meaningful
> it('returns something', () => {
>   const r = doComplexOperation(1, 2);
>   expect(r).toBeDefined();   // passes even if r = undefined
> });
>
> // ✅ Test the SPECIFIC expected outputs, edge cases, and error paths
> it('adds shipping correctly for domestic orders', () => {
>   const cart = createCart({ items: [{ sku: 'X', qty: 1, price: 10 }], address: 'US' });
>   expect(cart.total).toBe(13.50);  // 10 + 3.50 domestic shipping
> });
> it('throws for invalid quantity', () => {
>   expect(() => addItem(cart, 'X', -1)).toThrow('Quantity must be positive');
> });
> \`\`\`

**Q4: How do you test async code?**
> **A:** Return the Promise (older Jest) or use async/await in the test function (modern, cleaner). \`await expect(asyncFn()).resolves.toBe(x)\` tests successful resolution. \`await expect(asyncFn()).rejects.toThrow('msg')\` tests rejection. For observables/streams, use async generators in for-await-of or collect all emissions then assert. For timers, use \`vi.useFakeTimers() / vi.advanceTimersByTimeAsync(ms)\`.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript testing is the practice of writing automated assertions about code behavior — structured in a pyramid of unit tests (isolated, fast, many), integration tests (cross-boundary, fewer), and E2E tests (full-system, few) — with testing frameworks (Jest, Vitest) providing describe/it/expect, spy/mock/stub utilities, and fake timers — guided by TDD (test-first), BDD (behavior-first), and the principle of testing observable behavior over implementation details, with mutation testing as the rigor check for test quality."`,
    build: `## BUILD

### 🏗️ Mini Project: TDD — Shopping Cart Built Test-First With Vitest

**What you will build:** A complete shopping cart module written TEST-FIRST: write the failing test, write the minimal code to pass it, refactor — repeat for 10 features (add item, remove, update quantity, calculate total, apply coupon, tax, shipping, undo, serialise).
**Why this project:** Forces real TDD workflow — you can't write code without a test that demands it.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-testing && cd js-testing
npm init -y && npm install -D vitest
ni cart.js, cart.test.js -ItemType File
\`\`\`

#### Step 2 — Test Suite (Write Tests First)
\`\`\`js
// cart.test.js
import { describe, it, expect } from 'vitest';
import { createCart } from './cart.js';

describe('Cart — add item', () => {
  it('adds an item', () => {
    const cart = createCart();
    cart.addItem({ sku: 'A', name: 'Book', price: 10, qty: 1 });
    expect(cart.items).toHaveLength(1);
  });
  it('merges duplicate SKU by increasing qty', () => {
    const cart = createCart();
    cart.addItem({ sku: 'A', price: 10, qty: 1 });
    cart.addItem({ sku: 'A', price: 10, qty: 2 });
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].qty).toBe(3);
  });
  it('rejects negative qty', () => {
    const cart = createCart();
    expect(() => cart.addItem({ sku: 'A', price: 10, qty: -1 })).toThrow('Qty must be positive');
  });
});

describe('Cart — total', () => {
  it('calculates subtotal', () => {
    const cart = createCart();
    cart.addItem({ sku: 'A', price: 10, qty: 2 });
    cart.addItem({ sku: 'B', price: 5, qty: 3 });
    expect(cart.subtotal).toBe(35);
  });
  it('applies percentage coupon', () => {
    const cart = createCart();
    cart.addItem({ sku: 'A', price: 100, qty: 1 });
    cart.applyCoupon({ code: 'SAVE20', type: 'pct', value: 20 });
    expect(cart.discount).toBe(20);
    expect(cart.subtotalAfterDiscount).toBe(80);
  });
  it('applies fixed coupon', () => {
    const cart = createCart();
    cart.addItem({ sku: 'A', price: 100, qty: 1 });
    cart.applyCoupon({ code: 'SAVE5', type: 'fixed', value: 5 });
    expect(cart.discount).toBe(5);
  });
  it('calculates total with tax and shipping', () => {
    const cart = createCart({ taxRate: 0.10, shipping: 5 });
    cart.addItem({ sku: 'A', price: 100, qty: 1 });
    expect(cart.total).toBe(115);   // 100 + 10 tax + 5 shipping
  });
});

describe('Cart — serialisation', () => {
  it('serialises and deserialises without data loss', () => {
    const cart = createCart({ taxRate: 0.10, shipping: 5 });
    cart.addItem({ sku: 'A', price: 10, qty: 2 });
    cart.applyCoupon({ code: 'SAVE5', type: 'fixed', value: 5 });
    const json = cart.toJSON();
    const restored = createCart().fromJSON(json);
    expect(restored.total).toBe(cart.total);
    expect(restored.items).toHaveLength(1);
  });
});
\`\`\`

#### Step 3 — Minimal Implementation To Pass Tests
\`\`\`js
// cart.js
export function createCart({ taxRate = 0, shipping = 0 } = {}) {
  let items = [];
  let coupon = null;

  return {
    get items() { return [...items]; },

    addItem({ sku, name, price, qty }) {
      if (qty <= 0) throw new Error('Qty must be positive');
      const existing = items.find(i => i.sku === sku);
      if (existing) existing.qty += qty;
      else items.push({ sku, name, price, qty });
    },

    removeItem(sku) { items = items.filter(i => i.sku !== sku); },

    updateQty(sku, qty) {
      if (qty <= 0) throw new Error('Qty must be positive');
      const item = items.find(i => i.sku === sku);
      if (item) item.qty = qty;
    },

    applyCoupon(c) { coupon = c; },
    removeCoupon()  { coupon = null; },

    get subtotal() { return items.reduce((s, i) => s + i.price * i.qty, 0); },

    get discount() {
      if (!coupon) return 0;
      if (coupon.type === 'pct')   return Math.round(this.subtotal * coupon.value / 100 * 100) / 100;
      if (coupon.type === 'fixed') return Math.min(coupon.value, this.subtotal);
      return 0;
    },

    get subtotalAfterDiscount() { return this.subtotal - this.discount; },
    get tax()   { return Math.round(this.subtotalAfterDiscount * taxRate * 100) / 100; },
    get total() { return this.subtotalAfterDiscount + this.tax + (items.length ? shipping : 0); },

    toJSON() { return JSON.stringify({ items, coupon, taxRate, shipping }); },

    fromJSON(json) {
      const data = JSON.parse(json);
      items = data.items;
      coupon = data.coupon;
      return this;
    },
  };
}
\`\`\`

#### Step 4 — Async Tests + Fake Timers
\`\`\`js
// async.test.js
import { describe, it, expect, vi } from 'vitest';

async function fetchProduct(sku) {
  return new Promise(r => setTimeout(() => r({ sku, price: 29.99 }), 200));
}

describe('async tests', () => {
  it('resolves with product data', async () => {
    const p = await fetchProduct('BOOK-1');
    expect(p.price).toBe(29.99);
  });

  it('fake timers: advances without waiting', async () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    setTimeout(spy, 1000);
    await vi.advanceTimersByTimeAsync(1000);
    expect(spy).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
\`\`\`

**Expected Output:**
\`\`\`
✓ Cart — add item > adds an item
✓ Cart — add item > merges duplicate SKU
✓ Cart — add item > rejects negative qty
✓ Cart — total > calculates subtotal
✓ Cart — total > applies percentage coupon
✓ Cart — total > applies fixed coupon
✓ Cart — total > calculates total with tax and shipping
✓ Cart — serialisation > serialises and deserialises
# 8 tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add property-based testing using fast-check: test total(add-then-remove) === 0
- [ ] Achieve mutation testing score > 90% using Stryker
- [ ] Add snapshot testing for the toJSON output`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Three levels of the testing pyramid.
**Q2:** Difference between stub, mock, and spy?
**Q3:** Write a test for a pure function. From memory.

### Day 3 — Comprehension
**Q4:** Why is high code coverage an incomplete quality measure?
**Q5:** A junior tests a private method — explain why this is brittle.
**Q6:** Refactor this test to test behavior not implementation:
\`\`\`js
expect(discountService._applyPct).toHaveBeenCalledWith(0.2);
\`\`\`

### Day 7 — Application
**Q7:** Write tests for an async function with a network dependency (stub the fetch).
**Q8:** A PR has no tests for the error path — write the missing tests.
**Q9:** What's the right ratio of unit:integration:E2E tests for a SaaS?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how you'd TDD a password-reset feature."
**Q11:** Draw: testing pyramid for a full-stack React + Node app.
**Q12:** ★ System design: "Architect a testing strategy for 50 microservices — contract tests, integration, E2E, chaos."`
  },

  // ── 40. webpack-and-vite ─────────────────────────────────────────────────
  'webpack-and-vite': {
    feynman: `## FEYNMAN CHECK

### Explain Webpack & Vite Like I'm 10 Years Old
> Bundlers take your many .js files and combine them into ONE or FEW files the browser can load efficiently. Before bundlers (pre-2012), you loaded 50 <script> tags — 50 network requests, order-sensitive, no code sharing. Webpack (2014) was the breakthrough: resolve imports, tree-shake dead code, code-split by route, minify, handle CSS/images via loaders. It's powerful but SLOW to start (full dependency graph + transpile + bundle). Vite (2020) changed the approach: in DEV, serve NATIVE ES MODULES directly (no bundle, instant start), only transpile files as they're REQUESTED. In PROD, Vite uses Rollup to bundle. The result: Vite dev starts in <500ms; Webpack dev starts in 5-30s for large apps. Modern choice: Vite for new projects.

---

### 5 Deep Conceptual Questions

**Q1: What is tree-shaking and why does it require ESM?**
> **A:** Tree-shaking is the bundler removing code that's NEVER IMPORTED. \`import { used } from 'utils'\` — bundler sees exactly what's imported; unused exports are eliminated. This requires STATIC imports (ESM) — the bundler can analyse the dependency graph at build time. CommonJS \`require()\` is dynamic — the module's exports object can be mutated at runtime, so the bundler can't safely remove anything. This is why libraries that want to be tree-shaken must publish ESM builds.

**Q2: Mental model for code splitting?**
> **A:** Instead of ONE 2MB bundle, split into: vendor chunk (React, lodash — cached long-term by CDN/browser), route chunks (each page's code — loaded lazily on navigation), and shared chunks (code used by multiple routes). The browser downloads only what it needs NOW. \`React.lazy(() => import('./Dashboard'))\` creates a split point — the Dashboard component's code is in a separate chunk fetched on first navigation.

**Q3: Most dangerous misconception?**
> **A:** Webpack and Vite are interchangeable drop-in replacements:
> \`\`\`
> ❌ "Just switch from Webpack to Vite" — there are real differences:
>
> - Vite dev uses NATIVE ESM — no polyfills for legacy browsers in dev
> - Webpack loaders (raw-loader, file-loader) have different Vite equivalents
> - Vite uses Rollup for prod builds; Webpack uses its own engine
> - CSS handling, asset paths, env variables, module federation — all different
>
> ✅ Migration is valuable but requires testing:
> - Check browser targets (legacy browser support needs @vitejs/plugin-legacy)
> - Port webpack.config.js → vite.config.ts carefully
> - Verify all special imports (SVG, CSS modules, assets) work
> \`\`\`

**Q4: How does HMR (Hot Module Replacement) work in Vite?**
> **A:** Vite's dev server watches files. When you save a file, Vite: (1) Re-executes ONLY that module + its dependants (not the whole bundle). (2) Sends a WebSocket message to the browser. (3) The browser runs the new module code and calls any registered HMR callbacks. React Fast Refresh intercepts component changes and re-renders in place without losing state. Vite's HMR is FAST because each module is a native ES module — there's no rebundling.

**Q5: FAANG-grade definition?**
> **A:** "Webpack is a static module bundler that resolves import graphs, applies loaders for non-JS assets, produces optimised split bundles, and enables code-splitting via dynamic import — using a compiler-like multi-pass pipeline (parsing, optimisation, emit) that scales to millions of lines but has slow cold-start; Vite is a dev-server/build-tool hybrid using native ES modules for instant dev startup and Rollup for production builds — providing faster iteration at the cost of slightly different semantics, with module federation (webpack) and library mode (vite) as the respective multi-app patterns."`,
    build: `## BUILD

### 🏗️ Mini Project: Configure Both Webpack And Vite For The Same App — See The Difference

**What you will build:** A tiny React app configured with BOTH Webpack 5 and Vite — with bundle analysis, tree-shaking proof, and code-splitting — showing the build output and startup time difference empirically.
**Why this project:** Forces hands-on configuration of both tools — the most common DevEx task at every company.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-bundlers && cd js-bundlers
npm init -y
npm install react react-dom
npm install -D webpack webpack-cli babel-loader @babel/core @babel/preset-react html-webpack-plugin webpack-bundle-analyzer
npm install -D vite @vitejs/plugin-react rollup-plugin-visualizer
ni src/App.jsx, src/index.jsx, public/index.html, webpack.config.js, vite.config.js, src/utils.js -ItemType File
\`\`\`

#### Step 2 — App Code
\`\`\`jsx
// src/utils.js — some used, some unused (tree-shaking test)
export const used = (n) => n * 2;
export const UNUSED_CONSTANT = 'This should be tree-shaken';
export function unusedFunction() { return 'never called'; }

// src/App.jsx
import { used } from './utils.js';
export default function App() {
  return <h1>Hello — used(5) = {used(5)}</h1>;
}

// src/index.jsx
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
createRoot(document.getElementById('root')).render(<App />);
\`\`\`

#### Step 3 — Webpack Config
\`\`\`js
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env, argv) => ({
  mode: argv.mode ?? 'production',
  entry: './src/index.jsx',
  output: { path: path.resolve('dist-webpack'), filename: '[name].[contenthash].js', clean: true },
  module: {
    rules: [{ test: /\\.jsx?$/, exclude: /node_modules/, use: {
      loader: 'babel-loader',
      options: { presets: ['@babel/preset-react'] },
    }}],
  },
  resolve: { extensions: ['.js', '.jsx'] },
  optimization: {
    usedExports: true,       // tree-shaking
    sideEffects: false,
    splitChunks: { chunks: 'all', name: 'vendors' },
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'public/index.html' }),
    ...(env?.analyze ? [new BundleAnalyzerPlugin()] : []),
  ],
});
\`\`\`

#### Step 4 — Vite Config
\`\`\`js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    ...(mode === 'analyze' ? [visualizer({ open: true, gzipSize: true })] : []),
  ],
  build: {
    outDir: 'dist-vite',
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react', 'react-dom'] },
      },
    },
  },
}));
\`\`\`

#### Step 5 — Build + Compare
\`\`\`bash
# package.json scripts
# "build:wp": "webpack --mode production"
# "build:vite": "vite build"
# "analyze:wp": "webpack --mode production --env analyze"

# Run and compare
time npm run build:wp
time npm run build:vite

# Inspect outputs
Get-ChildItem dist-webpack -Recurse | Measure-Object -Property Length -Sum
Get-ChildItem dist-vite    -Recurse | Measure-Object -Property Length -Sum
\`\`\`

**Expected Output:**
\`\`\`
Webpack build:  8.2s
Vite build:     1.1s    ← 7× faster

dist-webpack:
  main.abc123.js  142KB
  vendors.def456.js  132KB   (react split out)
  index.html

dist-vite:
  assets/index-abc123.js  0.5KB   (app code only, tree-shaken)
  assets/vendor-def456.js  140KB  (react+react-dom)
  index.html

UNUSED_CONSTANT and unusedFunction: NOT in either bundle (tree-shaken ✅)
\`\`\`

**Stretch Challenges:**
- [ ] Add CSS modules and compare how each handles them
- [ ] Add module federation (webpack) for micro-frontends
- [ ] Add @vitejs/plugin-legacy for IE11-era browser targets`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Why does Vite dev start faster than Webpack?
**Q2:** What is tree-shaking and why does it need ESM?
**Q3:** What is code splitting? Name one API that creates a split point. From memory.

### Day 3 — Comprehension
**Q4:** Why can't CommonJS be tree-shaken?
**Q5:** A junior adds lodash and bundle grows 500KB — fix with tree-shaking.
**Q6:** What is the difference between HMR and live-reload?

### Day 7 — Application
**Q7:** Set up a React app with route-based code splitting using React.lazy.
**Q8:** A PR has 3MB vendor chunk — explain how to analyse and split it.
**Q9:** What's the trade-off between bundle count and request waterfall?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how Vite's dev server serves modules differently from Webpack."
**Q11:** Draw: Webpack's compilation pipeline — entry, loaders, optimise, emit.
**Q12:** ★ System design: "Optimise a micro-frontend architecture with 5 teams sharing React — module federation, shared vendors, independent deploys."`
  },

  // ── 41. security-js ──────────────────────────────────────────────────────
  'security-js': {
    feynman: `## FEYNMAN CHECK

### Explain JS Security Like I'm 10 Years Old
> Security in JS means protecting users from: XSS (injecting malicious script via innerHTML), CSRF (tricking a browser into sending requests), and Prototype Pollution (breaking all objects by mutating Object.prototype). XSS fix: use textContent or DOMPurify instead of innerHTML. CSRF fix: SameSite cookies + CSRF tokens. Prototype pollution fix: Object.create(null) for user-controlled key-value stores + freeze Object.prototype. Supply-chain attacks (malicious npm packages) need npm audit + lockfiles. Never put API keys in client-side JS — they appear in the bundle.

---

### 5 Deep Conceptual Questions

**Q1: How does XSS work and what prevents it?**
> **A:** XSS injects executable code into your page via user-controlled HTML. Prevention: (1) textContent instead of innerHTML for user data; (2) DOMPurify for rich HTML; (3) Content-Security-Policy header blocking inline scripts; (4) HttpOnly cookies so JS cannot steal auth tokens; (5) escape user values in all output contexts (HTML, URL, CSS, JS).

**Q2: Mental model for CSP?**
> **A:** CSP is a HTTP response header instructing the browser which script sources to execute. \`script-src 'self' 'nonce-XYZ'\` blocks ALL scripts except same-origin ones and those with the matching nonce. Even injected \`<script>\` tags are blocked because they lack the nonce. Next.js and React frameworks generate nonces automatically.

**Q3: Most dangerous misconception?**
> **A:** JSON.parse is safe for user input:
> \`\`\`js
> // Prototype pollution via JSON
> const input = '{"__proto__": {"admin": true}}';
> Object.assign({}, JSON.parse(input));
> console.log(({}).admin);   // true — ALL objects polluted!
>
> // Fix: validate schema after parse (zod/joi) or use Object.create(null)
> const safe = Object.create(null);
> Object.assign(safe, JSON.parse(input));
> console.log(({}).admin);   // undefined — prototype intact
> \`\`\`

**Q4: How do supply-chain attacks work?**
> **A:** A compromised or typosquatted npm package executes code inside your bundle. Defenses: lockfiles (npm ci), npm audit in CI, minimal dependencies, Subresource Integrity for CDN scripts, and reviewing package ownership before install.

**Q5: FAANG-grade definition?**
> **A:** "JavaScript security encompasses XSS prevention (CSP, textContent, DOMPurify, HttpOnly cookies), CSRF mitigation (SameSite cookies, double-submit cookie), prototype-pollution hardening (Object.create(null), Object.freeze on Object.prototype), supply-chain management (audit, lockfiles, SRI), and secrets hygiene (no API keys in bundles, server-side proxy, bundle secrets scanning)."`,
    build: `## BUILD

### 🏗️ Mini Project: Secure Input Sanitizer + CSP Nonce Generator

**What you will build:** escapeHtml, sanitizeUrl (blocks javascript:/data:), prototype-pollution-safe deep merge, and a CSP nonce generator — each with tests.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-security && cd js-security
npm init -y && npm install -D vitest
ni secure.js, secure.test.js -ItemType File
\`\`\`

#### Step 2 — Security Library
\`\`\`js
// secure.js
const HTML_ENT = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;' };
export function escapeHtml(str) {
  return String(str).replace(/[&<>"'/]/g, c => HTML_ENT[c]);
}

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);
export function sanitizeUrl(url) {
  try {
    const p = new URL(url);
    return ALLOWED_PROTOCOLS.has(p.protocol) ? url : 'about:blank';
  } catch { return 'about:blank'; }
}

export function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (['__proto__','constructor','prototype'].includes(key)) continue;
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = Object.create(null);
      safeMerge(target[key], source[key]);
    } else { target[key] = source[key]; }
  }
  return target;
}

export function generateNonce() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/[+/=]/g, c => ({'+':'-','/':'_','=':''}[c]));
}

export function buildCSP(nonce) {
  return [
    "default-src 'self'",
    "script-src 'self' 'nonce-" + nonce + "'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self'",
    "base-uri 'self'",
  ].join('; ');
}
\`\`\`

#### Step 3 — Demo
\`\`\`js
import { escapeHtml, sanitizeUrl, safeMerge, generateNonce, buildCSP } from './secure.js';

console.log(escapeHtml('<img onerror=alert(1)>'));
// &lt;img onerror=alert(1)&gt;

console.log(sanitizeUrl('javascript:alert(1)'));  // about:blank
console.log(sanitizeUrl('https://example.com'));  // https://example.com

const obj = Object.create(null);
safeMerge(obj, JSON.parse('{"__proto__":{"evil":true},"name":"Ana"}'));
console.log(({}).evil);    // undefined — not polluted
console.log(obj.name);     // Ana

const nonce = generateNonce();
console.log(buildCSP(nonce));
\`\`\`

#### Step 4 — Error Handling: Secrets In Bundles
\`\`\`js
const SECRET_RE = [/sk_live_[A-Za-z0-9]{24}/, /AKIA[A-Z0-9]{16}/, /ghp_[A-Za-z0-9]{36}/];
export function detectSecrets(code) {
  return SECRET_RE.map(re => re.exec(code)).filter(Boolean).map(m => m[0]);
}

// Run as a pre-build check
const bundle = require('fs').readFileSync('./dist/index.js', 'utf8');
const found = detectSecrets(bundle);
if (found.length) { console.error('SECRETS IN BUNDLE:', found); process.exit(1); }
\`\`\`

#### Step 5 — Tests
\`\`\`js
// secure.test.js
import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeUrl, safeMerge } from './secure.js';

describe('escapeHtml', () => {
  it('escapes XSS vectors', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });
  it('handles non-strings', () => { expect(escapeHtml(42)).toBe('42'); });
});

describe('sanitizeUrl', () => {
  it('allows safe protocols', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
  });
  it('blocks dangerous protocols', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('about:blank');
    expect(sanitizeUrl('data:text/html,<h1>x</h1>')).toBe('about:blank');
  });
});

describe('safeMerge', () => {
  it('merges normally', () => {
    const a = { x: 1 };
    safeMerge(a, { y: 2 });
    expect(a).toEqual({ x: 1, y: 2 });
  });
  it('blocks __proto__ pollution', () => {
    const a = Object.create(null);
    safeMerge(a, JSON.parse('{"__proto__":{"evil":true}}'));
    expect(({}).evil).toBeUndefined();
  });
});
\`\`\`

**Expected Output:**
\`\`\`
&lt;img onerror=alert(1)&gt;
about:blank
https://example.com
undefined  Ana
default-src 'self'; script-src 'self' 'nonce-...'; ...

# All tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add a sanitiseHTML with allowlist using DOMParser
- [ ] Add HMAC webhook signature verification
- [ ] Build a git pre-commit hook that fails on detected secrets`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Three main JS security threats.
**Q2:** Why is textContent safer than innerHTML?
**Q3:** Write a one-liner HTML escaper. From memory.

### Day 3 — Comprehension
**Q4:** Show prototype pollution in 3 lines.
**Q5:** A junior puts user input in a URL: \`<a href="\${url}">\` — what's the attack?
**Q6:** What HTTP cookie attribute prevents JS from reading it?

### Day 7 — Application
**Q7:** Build an allowlist-based HTML sanitizer.
**Q8:** A PR sends API keys in query params — why is this logged in server logs?
**Q9:** What is SRI and when should you use it?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through all attack surfaces in a React SPA."
**Q11:** Draw: CSP header → browser enforcement flow.
**Q12:** ★ System design: "Security architecture for a fintech SPA — CSP, cookies, secret management."`
  },

  // ── 42. weakref-and-finalizationregistry ─────────────────────────────────
  'weakref-and-finalizationregistry': {
    feynman: `## FEYNMAN CHECK

### Explain WeakRef & FinalizationRegistry Like I'm 10 Years Old
> A WeakRef holds a WEAK pointer to an object — if nothing else holds it, the GC CAN free it. \`ref.deref()\` returns the object if alive, or undefined if collected. FinalizationRegistry runs a CALLBACK when an object is GC'd — useful for logging memory leaks or releasing non-JS resources. The critical caveat: GC timing is non-deterministic — your cleanup may run seconds later or never. NEVER rely on FinalizationRegistry for critical cleanup. Use explicit dispose() methods + try/finally for that.

---

### 5 Deep Conceptual Questions

**Q1: When is WeakRef useful?**
> **A:** Three scenarios: (1) Evictable caches where cached values should be GC'd under memory pressure — deref() returns undefined when evicted, you re-compute. (2) Observer patterns where listeners should not prevent the observed object from being GC'd. (3) Back-references in two-way relationships where one direction should avoid creating retention cycles.

**Q2: Mental model for FinalizationRegistry?**
> **A:** FinalizationRegistry is a GC hook — register(obj, token) schedules a callback with token when obj is collected. Use for: detecting leaked objects (if callback fires, the cleanup was implicit — log a warning), releasing OS file descriptors in native bindings (with a fallback). The callback must never resurrect the object or access GC'd data.

**Q3: Most dangerous misconception?**
> **A:** FinalizationRegistry is deterministic cleanup:
> \`\`\`js
> // ❌ GC may never run before process exits — resource leaks
> class FileHandle {
>   #fd;
>   constructor(p) { this.#fd = open(p); registry.register(this, this.#fd); }
> }
>
> // ✅ Always use explicit lifecycle
> class FileHandle {
>   #fd; #closed = false;
>   constructor(p) { this.#fd = open(p); }
>   close() { if (!this.#closed) { close(this.#fd); this.#closed = true; } }
>   [Symbol.dispose]() { this.close(); }
> }
> using h = new FileHandle('/tmp/x');   // auto-closed on scope exit
> \`\`\`

**Q4: WeakRef vs WeakMap?**
> **A:** WeakMap is KEYED — object key → value, both weakly held, great for "attach metadata to objects." WeakRef is a DIRECT weak pointer to one object you can store anywhere. WeakRef is lower-level; WeakMap is usually the right abstraction unless you specifically need to store a reference independently without preventing collection.

**Q5: FAANG-grade definition?**
> **A:** "WeakRef (ES2021) holds a non-owning reference to an object that doesn't prevent GC — deref() returning undefined after collection — paired with FinalizationRegistry scheduling cleanup callbacks after collection, subject to non-deterministic GC timing — enabling evictable caches, leak detection, and native resource tracking — while mandating explicit lifecycle management via Symbol.dispose and TC39 explicit-resource-management for critical cleanup."`,
    build: `## BUILD

### 🏗️ Mini Project: WeakRef Evictable Cache + Leak Detector

**What you will build:** A cache that holds values via WeakRef (GC can evict them under memory pressure) with FinalizationRegistry logging evictions — compared empirically against a strong Map cache.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir js-weakref && cd js-weakref
node --version   # needs Node 14.6+
npm init -y && npm install -D vitest
ni weakCache.js, weakCache.test.js -ItemType File
\`\`\`

#### Step 2 — WeakRef Cache
\`\`\`js
// weakCache.js
const evictions = [];
const registry = new FinalizationRegistry(({ key, stats }) => {
  evictions.push({ key, at: Date.now() });
  stats.evicted++;
});

export function createWeakCache() {
  const store = new Map();
  const stats = { hits: 0, misses: 0, evicted: 0 };

  return {
    set(key, value) {
      store.set(key, new WeakRef(value));
      registry.register(value, { key, stats }, value);
    },
    get(key) {
      const ref = store.get(key);
      if (!ref) { stats.misses++; return undefined; }
      const v = ref.deref();
      if (!v) { store.delete(key); stats.misses++; return undefined; }
      stats.hits++;
      return v;
    },
    has(key) { return this.get(key) !== undefined; },
    get size() { return store.size; },
    get stats() { return { ...stats }; },
    get evictionLog() { return [...evictions]; },
  };
}
\`\`\`

#### Step 3 — Demonstrate Eviction
\`\`\`js
// demo.js — run with: node --expose-gc demo.js
import { createWeakCache } from './weakCache.js';

const wc = createWeakCache();
const strong = new Map();

for (let i = 0; i < 10; i++) {
  const obj = { id: i, data: new Uint8Array(50_000) };
  wc.set('k' + i, obj);
  strong.set('k' + i, obj);
}

console.log('Before GC: weak=', wc.size, 'strong=', strong.size);

if (global.gc) global.gc();
await new Promise(r => setTimeout(r, 100));

console.log('After GC: weak=', wc.size, 'strong=', strong.size);
console.log('Stats:', wc.stats);
\`\`\`

#### Step 4 — Symbol.dispose Explicit Lifecycle
\`\`\`js
// dispose.js
export class Connection {
  #conn;
  #closed = false;

  constructor(url) {
    this.#conn = { url, id: Math.random().toString(36).slice(2) };
    console.log('opened:', this.#conn.id);
  }

  query(sql) {
    if (this.#closed) throw new Error('Connection closed');
    return 'result of: ' + sql;
  }

  close() {
    if (!this.#closed) { console.log('closed:', this.#conn.id); this.#closed = true; }
  }

  [Symbol.dispose]() { this.close(); }
}
\`\`\`

#### Step 5 — Tests
\`\`\`js
// weakCache.test.js
import { describe, it, expect } from 'vitest';
import { createWeakCache } from './weakCache.js';

describe('WeakRef cache', () => {
  it('stores and retrieves values', () => {
    const c = createWeakCache();
    const obj = { id: 1 };
    c.set('k', obj);
    expect(c.get('k')).toBe(obj);
    expect(c.stats.hits).toBe(1);
  });
  it('returns undefined for missing keys', () => {
    const c = createWeakCache();
    expect(c.get('x')).toBeUndefined();
    expect(c.stats.misses).toBe(1);
  });
  it('tracks count', () => {
    const c = createWeakCache();
    c.set('a', {}); c.set('b', {});
    expect(c.size).toBe(2);
  });
  it('live strong ref keeps value accessible', () => {
    const c = createWeakCache();
    const obj = { x: 99 };
    c.set('k', obj);
    expect(c.get('k')).toBe(obj);   // obj still in scope — not GC'd
  });
});
\`\`\`

**Expected Output:**
\`\`\`
Before GC: weak= 10  strong= 10
After GC:  weak= X   strong= 10   (X may be <10 if GC reclaimed some)
Stats: { hits: 0, misses: 0, evicted: N }

# All tests pass
\`\`\`

**Stretch Challenges:**
- [ ] Add TTL-based eviction alongside WeakRef eviction
- [ ] Build a memory-pressure notifier using performance.measureUserAgentSpecificMemory
- [ ] Implement using/await using with Symbol.dispose for a DB transaction`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does WeakRef.deref() return after the object is collected?
**Q2:** When does FinalizationRegistry callback run?
**Q3:** Name two real use cases for WeakRef. From memory.

### Day 3 — Comprehension
**Q4:** Why can't you rely on FinalizationRegistry for critical cleanup?
**Q5:** A junior uses Map to cache DOM nodes — memory grows forever. Fix with WeakMap.
**Q6:** Difference between WeakRef and WeakMap?

### Day 7 — Application
**Q7:** Build an observer where listeners auto-remove when GC'd via WeakRef.
**Q8:** A PR uses FinalizationRegistry to close DB connections — explain the risk.
**Q9:** When does WeakRef actually save memory vs a strong-ref cache?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every weak reference mechanism — WeakRef, WeakMap, WeakSet."
**Q11:** Draw: lifecycle of a WeakRef-cached object — strong refs, GC eligibility, deref undefined.
**Q12:** ★ System design: "Design a component debugger that tracks all live instances without preventing GC."`
  }
};


