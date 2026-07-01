/**
 * addMissingSections.js
 * Appends ## FEYNMAN CHECK, ## BUILD, ## SPACED REVIEW to any .mdx file
 * in a content path that is missing those sections.
 *
 * Usage:
 *   node scripts/addMissingSections.js javascript
 *   node scripts/addMissingSections.js typescript
 *   node scripts/addMissingSections.js react
 *   node scripts/addMissingSections.js angular
 *   node scripts/addMissingSections.js html
 *   node scripts/addMissingSections.js css
 *   node scripts/addMissingSections.js all   ← processes all 6 paths
 */

const fs   = require('fs');
const path = require('path');

const CONTENT_ROOT = path.join(__dirname, '..', 'apps', 'web', 'content');

// ─── path-specific language label for code blocks ────────────────────────────
const LANG = {
  javascript: 'javascript',
  typescript: 'typescript',
  react:      'jsx',
  angular:    'typescript',
  html:       'html',
  css:        'css',
};

// ─── path-specific visualization component ───────────────────────────────────
const VISUAL_COMPONENT = {
  'spring-boot':           'UmlClassDiagram',
  'java-mastery':          'UmlClassDiagram',
  'docker':                'NetworkDiagram',
  'kubernetes':            'NetworkDiagram',
  'system-design':         'ConceptMap',
  'software-architecture': 'ConceptMap',
  'design-system':         'ConceptMap',
  'dsa':                   'TreeVisualization',
  'leetcode-patterns':     'FlowChart',
  'api-design':            'SequenceDiagram',
  'sql':                   'DatabaseSchema',
  'postgresql-dba':        'DatabaseSchema',
  'mongodb':               'DatabaseSchema',
  'git-github':            'GitGraph',
  'nextjs':                'CodeRunner',
  'full-stack':            'FlowChart',
  'javascript':            'CodeRunner',
  'typescript':            'CodeRunner',
  'react':                 'CodeRunner',
  'angular':               'CodeRunner',
  'html':                  'CodeRunner',
  'css':                   'CodeRunner',
};

// ─── helpers ──────────────────────────────────────────────────────────────────
function parseFrontmatter(raw) {
  const fm = {};
  if (!raw.startsWith('---')) return { fm, body: raw };
  const end = raw.indexOf('---', 3);
  if (end < 0) return { fm, body: raw };
  const head = raw.substring(3, end);
  const body = raw.substring(end + 3).trim();
  for (const line of head.split('\n')) {
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const k = line.substring(0, idx).trim();
    let v = line.substring(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    fm[k] = v;
  }
  return { fm, body };
}

function hasSection(content, heading) {
  return new RegExp(`^##\\s+${heading}`, 'mi').test(content);
}

function humanTitle(slug) {
  return slug.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ─── VISUALIZATION_CONFIG template ───────────────────────────────────────────
function visualConfig(slug, pathSlug) {
  const component = VISUAL_COMPONENT[pathSlug] || 'CodeRunner';
  return `## VISUALIZATION_CONFIG

\`\`\`json
{ "component": "${component}", "state": "${slug}" }
\`\`\`
`;
}
function feynman(title, slug, lang) {
  const t = title;
  const varName = slug.replace(/-/g, '_');
  return `## FEYNMAN CHECK

### Explain ${t} Like I'm 10 Years Old
Imagine you have a magical LEGO set. Each LEGO brick knows exactly what it does and how it connects to other bricks. **${t}** is like the instruction manual that tells you *which* bricks exist, *how* they snap together, and *what* you can build with them.

When a professional developer talks about ${t}, they are really talking about a precise set of rules the computer follows every single time — no surprises, no magic, just rules you can learn once and rely on forever.

---

### 5 Deep Conceptual Questions

**Q1: In your own words, what problem does ${t} solve? Why would JavaScript/web development be harder without it?**
> **A:** ${t} solves the problem of [describing the core purpose]. Without it, developers would need to write repetitive, error-prone boilerplate code every time they need this behaviour. It provides a standardised, predictable mechanism that the runtime engine optimises for performance.

**Q2: What is the single most important thing to remember about ${t}?**
> **A:** The single most important thing is understanding the *mental model*: ${t} operates on [core abstraction]. Once you internalize this, every API, every edge case, and every debugging scenario becomes logical rather than mysterious.

**Q3: What is the most common mistake developers make with ${t} and why?**
> **A:** The most common mistake is misunderstanding the *timing* or *scope* in which ${t} operates. Developers assume [incorrect assumption], but the actual behaviour is [correct behaviour]. This leads to bugs that are hard to reproduce because the error only appears under specific conditions.

**Q4: How does ${t} interact with the JavaScript event loop / browser rendering pipeline?**
> **A:** ${t} interacts with the runtime at the [synchronous/asynchronous/compile-time] phase. Understanding whether its work happens on the call stack, in a microtask queue, or during a browser paint cycle determines when side effects become visible and how to sequence operations correctly.

**Q5: If you had to explain the internal mechanism of ${t} to a senior engineer in two sentences, what would you say?**
> **A:** "${t} works by [mechanism step 1]. The engine then [mechanism step 2], which is why you observe [observable behaviour]."
`;
}

// ─── BUILD template ───────────────────────────────────────────────────────────
function build(title, slug, lang) {
  const varName = slug.replace(/-/g, '');
  const cap = title.replace(/\s+/g, '');
  return `## BUILD

### 🏗️ Mini Project: Build a ${title} Utility

**Goal:** Implement a real, working ${title} module from scratch — no libraries, pure ${lang === 'css' || lang === 'html' ? 'HTML/CSS' : lang}.

**What you'll build:** A self-contained \`${varName}\` module that demonstrates every key concept from this topic in a runnable, testable way.

---

#### Step 1 — Set Up the Project Structure

\`\`\`bash
mkdir ${slug}-demo && cd ${slug}-demo
touch index.${lang === 'typescript' ? 'ts' : lang === 'css' ? 'css' : lang === 'html' ? 'html' : 'js'}
\`\`\`

#### Step 2 — Core Implementation

\`\`\`${lang}
// ── ${title} Core Implementation ──────────────────────────────────────────────
// This module demonstrates the fundamental concepts of ${title}.
// Study each section carefully — each one maps directly to the THEORY section above.

// 1. Basic setup / initialisation
function create${cap}(config = {}) {
  const defaults = {
    enabled: true,
    debug: false,
    ...config,
  };

  // Internal state (private via closure)
  let _state = null;

  // 2. Core logic
  function init(value) {
    _state = value;
    if (defaults.debug) console.log(\`[${title}] Initialized with:\`, value);
    return _state;
  }

  // 3. Main operation
  function process(input) {
    if (!defaults.enabled) return null;
    // TODO: Replace this with the actual ${title} logic from the THEORY section
    const result = input;
    if (defaults.debug) console.log(\`[${title}] Processed:\`, result);
    return result;
  }

  // 4. Cleanup / teardown
  function destroy() {
    _state = null;
    if (defaults.debug) console.log(\`[${title}] Destroyed.\`);
  }

  return { init, process, destroy };
}

// ── Usage ─────────────────────────────────────────────────────────────────────
const instance = create${cap}({ debug: true });
instance.init('hello world');
const result = instance.process('hello world');
console.log('Result:', result);
instance.destroy();
\`\`\`

#### Step 3 — Add Error Handling

\`\`\`${lang}
// Robust error handling for production use
function safeProcess(input) {
  try {
    if (input === null || input === undefined) {
      throw new TypeError(\`[${title}] Input cannot be null or undefined\`);
    }
    const instance = create${cap}();
    return { success: true, data: instance.process(input) };
  } catch (err) {
    console.error(\`[${title}] Error:\`, err.message);
    return { success: false, error: err.message };
  }
}

console.log(safeProcess('valid input'));   // { success: true, data: '...' }
console.log(safeProcess(null));            // { success: false, error: '...' }
\`\`\`

#### Step 4 — Write Tests

\`\`\`${lang}
// Simple test runner (no dependencies needed)
function test(description, fn) {
  try {
    fn();
    console.log(\`  ✅ PASS: \${description}\`);
  } catch (e) {
    console.error(\`  ❌ FAIL: \${description} — \${e.message}\`);
  }
}

function assert(actual, expected, msg = '') {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(\`Expected \${JSON.stringify(expected)} but got \${JSON.stringify(actual)}. \${msg}\`);
  }
}

console.log('\\n── ${title} Tests ──');

test('initialises correctly', () => {
  const m = create${cap}();
  assert(typeof m.init, 'function');
  assert(typeof m.process, 'function');
});

test('processes valid input', () => {
  const m = create${cap}();
  m.init('test');
  const out = m.process('test');
  assert(out !== null && out !== undefined, true, 'output should not be null');
});

test('handles null input gracefully', () => {
  const result = safeProcess(null);
  assert(result.success, false);
  assert(typeof result.error, 'string');
});

console.log('\\n── All tests complete ──\\n');
\`\`\`

#### Step 5 — Challenge Extensions (stretch goals)

- [ ] Add a caching layer so repeated calls with the same input skip reprocessing
- [ ] Add TypeScript types / JSDoc annotations to every function
- [ ] Make it work asynchronously (return a Promise)
- [ ] Add a rate-limiter so \`process()\` can only be called N times per second
- [ ] Write a benchmark comparing your implementation to a naive alternative

---

**Expected Output:**
\`\`\`
[${title}] Initialized with: hello world
[${title}] Processed: hello world
Result: hello world
[${title}] Destroyed.

── ${title} Tests ──
  ✅ PASS: initialises correctly
  ✅ PASS: processes valid input
  ✅ PASS: handles null input gracefully

── All tests complete ──
\`\`\`
`;
}

// ─── SPACED REVIEW template ───────────────────────────────────────────────────
function spacedReview(title, slug) {
  return `## SPACED REVIEW

> **How to use:** Answer each question from memory before revealing the answer. The increasing difficulty across days mirrors the Ebbinghaus forgetting curve — reviewing at these intervals locks the concept into long-term memory.

---

### Day 1 — Recall (immediately after studying)

**Q1: Define ${title} in one sentence.**
<details><summary>Answer</summary>

${title} is [the core definition restated in simple terms, connecting the mechanism to the observable behaviour].
</details>

**Q2: What are the two most important properties / characteristics of ${title}?**
<details><summary>Answer</summary>

1. **[Property 1]** — [why it matters]
2. **[Property 2]** — [why it matters]
</details>

**Q3: Write a 5-line code snippet that demonstrates the most basic usage of ${title}.**
<details><summary>Answer</summary>

Refer to the **Level 1** example in the CODE section above. The key lines are the ones that [describe what the critical lines do].
</details>

---

### Day 3 — Comprehension (deepen understanding)

**Q4: What is the difference between ${title} and [the closest related concept]?**
<details><summary>Answer</summary>

| Feature | ${title} | Related Concept |
|---------|---------|----------------|
| Purpose | [purpose of ${title}] | [purpose of related] |
| When to use | [use case] | [use case] |
| Performance | [characteristic] | [characteristic] |

The key distinction is [one-sentence summary of the difference].
</details>

**Q5: Describe a real-world scenario where misusing ${title} causes a bug.**
<details><summary>Answer</summary>

**Scenario:** A developer [describes common misuse pattern]. 

**The bug:** [What goes wrong — e.g., memory leak, stale data, race condition].

**The fix:** [How to correct it with correct ${title} usage].
</details>

**Q6: What does ${title} look like in a production codebase? Name one popular open-source library that relies on it heavily.**
<details><summary>Answer</summary>

In production, ${title} typically appears in [where/how]. A well-known example is **[library name]** which uses it to [specific purpose], which you can see in its source at [conceptual location].
</details>

---

### Day 7 — Application (use the knowledge)

**Q7: Refactor the following naive code to use ${title} correctly:**
\`\`\`javascript
// Naive — do NOT do this:
function badExample() {
  // repetitive / inefficient / error-prone pattern
  const a = doThing(1);
  const b = doThing(2);
  const c = doThing(3);
  return [a, b, c];
}
\`\`\`
<details><summary>Answer</summary>

\`\`\`javascript
// Better — using ${title}:
function goodExample() {
  return [1, 2, 3].map(n => doThingWith_${slug.replace(/-/g, '_')}(n));
}
\`\`\`
The refactored version is more readable, less error-prone, and easier to extend.
</details>

**Q8: How would you unit-test ${title} in isolation? What would you mock?**
<details><summary>Answer</summary>

To test ${title} in isolation:
1. **Mock** any external dependencies (network calls, timers, DOM).
2. **Assert** on the public interface — inputs and outputs — not internal state.
3. **Edge cases to cover:** null input, empty input, boundary values, and error conditions.

\`\`\`javascript
// Example test skeleton
describe('${title}', () => {
  it('handles the happy path', () => { /* ... */ });
  it('throws on invalid input', () => { /* ... */ });
  it('cleans up resources after use', () => { /* ... */ });
});
\`\`\`
</details>

**Q9: What is the performance cost of ${title} at scale? How would you optimise it?**
<details><summary>Answer</summary>

At scale, the main costs are:
- **Memory:** [how ${title} uses memory and how to reduce it]
- **CPU:** [computational complexity and how to reduce it]
- **Network/IO:** [if applicable]

**Optimisation strategies:**
1. [Strategy 1] — reduces [cost] by [mechanism]
2. [Strategy 2] — most effective when [condition]
3. [Strategy 3] — trade-off: [pro vs con]
</details>

---

### Day 14 — Synthesis & Interview Prep

**Q10: ★ Classic interview question: "[Most common ${title} interview question]"**
<details><summary>Answer</summary>

**Answer structure (use this in interviews):**

1. **Define it:** "${title} is..."
2. **Explain the mechanism:** "Under the hood, it works by..."
3. **Give a concrete example:** "A classic case is..."
4. **Mention the gotcha:** "The subtle thing most developers miss is..."
5. **Close with best practice:** "In production, you should always..."

This structure takes 60–90 seconds and signals senior-level thinking.
</details>

**Q11: How does ${title} relate to other concepts in this learning path? Draw the mental map.**
<details><summary>Answer</summary>

\`\`\`
${title}
  ├── depends on ──► [Prerequisite concept A]
  ├── depends on ──► [Prerequisite concept B]
  ├── enables ─────► [Advanced concept C]
  └── pairs with ──► [Sibling concept D]
\`\`\`

Understanding this graph tells you the order to learn/teach these topics and which bugs are *actually* caused by misunderstanding an upstream concept.
</details>

**Q12: ★ System design: "How would you use ${title} to build a [large-scale feature]?"**
<details><summary>Answer</summary>

**Approach:**
1. **Identify** where ${title} fits in the data/control flow.
2. **Choose** the right variant/pattern of ${title} for the scale requirement.
3. **Handle** failure modes: what happens when ${title} is unavailable or behaves unexpectedly?
4. **Monitor** it: what metric tells you ${title} is healthy in production?

This answer demonstrates that you can apply individual concepts to real architecture decisions — exactly what separates mid-level from senior engineers.
</details>
`;
}

function processMdx(filePath, pathSlug) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { fm, body } = parseFrontmatter(raw);

  const slug  = fm.slug  || path.basename(filePath, '.mdx');
  const title = fm.title || humanTitle(slug);
  const lang  = LANG[pathSlug] || 'javascript';

  const needsVisual  = !hasSection(raw, 'VISUALIZATION_CONFIG');
  const needsFeynman = !hasSection(raw, 'FEYNMAN');
  const needsBuild   = !hasSection(raw, 'BUILD');
  const needsSpaced  = !hasSection(raw, 'SPACED REVIEW');

  if (!needsVisual && !needsFeynman && !needsBuild && !needsSpaced) {
    console.log(`  SKIP  ${slug.padEnd(45)} (all sections present)`);
    return false;
  }

  let current = raw;

  // Inject VISUALIZATION_CONFIG before ## CODE if missing
  if (needsVisual) {
    const codeIdx = current.search(/\n## CODE/);
    const visual = '\n\n' + visualConfig(slug, pathSlug);
    if (codeIdx > -1) {
      current = current.substring(0, codeIdx) + visual + current.substring(codeIdx);
    } else {
      // append before feynman area
      current = current.trimEnd() + visual;
    }
  }

  let additions = '';
  if (needsFeynman) additions += '\n\n' + feynman(title, slug, lang);
  if (needsBuild)   additions += '\n\n' + build(title, slug, lang);
  if (needsSpaced)  additions += '\n\n' + spacedReview(title, slug);

  fs.writeFileSync(filePath, current.trimEnd() + additions, 'utf-8');

  const added = [
    needsVisual  && 'visual',
    needsFeynman && 'feynman',
    needsBuild   && 'build',
    needsSpaced  && 'spacedreview'
  ].filter(Boolean).join(', ');
  console.log(`  ADD   ${slug.padEnd(45)} +[${added}]`);
  return true;
}

// ─── entry point ─────────────────────────────────────────────────────────────
const ALL_PATHS = ['javascript', 'typescript', 'react', 'angular', 'html', 'css'];

const args = process.argv.slice(2);
if (!args.length) {
  console.error('Usage: node scripts/addMissingSections.js <path|all>');
  process.exit(1);
}

const targets = args[0] === 'all' ? ALL_PATHS : args;

let totalFiles = 0;
let totalUpdated = 0;

for (const pathSlug of targets) {
  const dir = path.join(CONTENT_ROOT, pathSlug);
  if (!fs.existsSync(dir)) {
    console.warn(`  WARN  Directory not found: ${dir}`);
    continue;
  }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
  console.log(`\n── ${pathSlug.toUpperCase()} (${files.length} files) ${'─'.repeat(50 - pathSlug.length)}`);

  for (const file of files) {
    const updated = processMdx(path.join(dir, file), pathSlug);
    totalFiles++;
    if (updated) totalUpdated++;
  }
}

console.log(`\n✅ Done. ${totalUpdated} / ${totalFiles} files updated.`);

