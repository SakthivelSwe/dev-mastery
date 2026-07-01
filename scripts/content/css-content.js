/**
 * GFG+ depth FEYNMAN / BUILD / SPACED REVIEW for all CSS topics.
 * Matches SKILL.md standards: real analogies, 5 deep Q&As, named build projects,
 * 12 spaced-review questions, code snippets in answers.
 *
 * Built in 6 batches per SKILL.md batching strategy (5 topics per batch).
 * Batch 1 of 6: Foundations.
 */
module.exports = {

  // ── 1. css-intro ──────────────────────────────────────────────────────────
  'css-intro': {
    feynman: `## FEYNMAN CHECK

### Explain CSS Like I'm 10 Years Old
> CSS is the "painter" that walks through the DOM tree the browser built from HTML and says: "this heading is 2rem and red, this paragraph has 1em of margin, this button has 8px of padding." But CSS doesn't paint immediately — it first computes a SECOND tree called the CSSOM, then the browser MERGES the DOM + CSSOM into the Render Tree (only visible nodes), runs LAYOUT (calculates every box's x/y/width/height), then PAINT (rasterises to pixels), then COMPOSITE (assembles layers onto the screen). This is why one wrong CSS rule can trigger "layout thrashing" — re-running steps 3-5 sixty times per second.

---

### 5 Deep Conceptual Questions

**Q1: What problem does CSS fundamentally solve, and why couldn't you solve it another way?**
> **A:** CSS solves "separation of concerns" between document structure (HTML) and presentation. Before CSS (pre-1996), styling lived inside HTML as \`<font color="red" size="5">\` and \`<table>\`-based layouts — meaning a redesign required editing every page. CSS introduced a CASCADE: one rule can target thousands of elements via selectors, and you can override globally → site-wide → component-level → element-level with predictable precedence. JavaScript could mimic this with inline styles, but you'd lose pseudo-classes, media queries, animations, and the entire render-pipeline optimisation the browser does for CSS.

**Q2: What is the ONE mental model that makes CSS click into place?**
> **A:** CSS is a function: \`(element, context) → computed style\`. For every element in the DOM, the browser collects every matching rule, sorts them by specificity + source order + \`!important\`, computes inherited values from the parent, then resolves units (\`em\` → \`px\`, \`%\` → pixels) against the containing block. Once you internalise "every property has a computed value AND a used value, and they can differ," debugging becomes mechanical instead of magical.

**Q3: What is the most dangerous misconception about CSS? Show it with code.**
> **A:** That \`!important\` "wins" against everything — actually two \`!important\` rules still battle by specificity:
> \`\`\`html
> <!-- ❌ "I'll just use !important to fix this..." -->
> <style>
>   .button       { color: red !important; }
>   .modal .button { color: blue !important; }   /* WINS — higher specificity */
> </style>
> <div class="modal"><button class="button">Text</button></div>
> <!-- Result: blue, not red. !important doesn't bypass specificity. -->
>
> <!-- ✅ Fix the specificity properly without !important -->
> <style>
>   .button       { color: red; }
>   .modal .button { color: red; }
> </style>
> \`\`\`

**Q4: How does CSS interact with the browser's rendering pipeline at the runtime level?**
> **A:** The browser parses every \`<link rel="stylesheet">\` into the CSSOM, which BLOCKS rendering — the browser refuses to paint until all stylesheets are downloaded and parsed (otherwise you'd see a "flash of unstyled content"). It then walks the DOM + CSSOM to build the Render Tree, runs the layout algorithm (which is O(n) in element count but can cascade on a single \`width\` change), paints layers into bitmaps, and composites them on the GPU. Modifying a layout property (\`width\`, \`top\`, \`margin\`) re-runs layout+paint+composite; modifying \`transform\` or \`opacity\` only re-runs composite — which is why \`transform: translate\` is 60fps and \`top: 10px\` is jank.

**Q5: Write a one-sentence definition of CSS that a senior engineer at a FAANG company would find technically precise.**
> **A:** "CSS is a declarative, cascading, inherited style-resolution language whose rules the browser parses into the CSSOM, merges with the DOM to produce the Render Tree, and then evaluates through a four-stage pipeline (style → layout → paint → composite) — which is why selector specificity, the containing-block algorithm, and the will-change/compositor-promotion rules have direct measurable impact on Largest Contentful Paint and Cumulative Layout Shift."`,

    build: `## BUILD

### 🏗️ Mini Project: Build a CSS Debugger That Visualises the Render Pipeline

**What you will build:** A page with overlays that highlight WHICH parts of the screen trigger layout, paint, or composite when you interact — using DevTools' Performance and Layers panels to prove how different CSS properties cost different amounts.
**Why this project:** Forces you to internalise that \`transform\` is cheap and \`top\` is expensive, by SEEING the difference in real time.
**Time estimate:** 30 minutes

---

#### Step 1 — Project Setup
\`\`\`bash
mkdir css-pipeline && cd css-pipeline
ni demo.html, style.css, app.js -ItemType File
\`\`\`

#### Step 2 — A Page With Two Movable Boxes (One Cheap, One Expensive)
\`\`\`html
<!-- demo.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CSS render-pipeline demo</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>CSS render pipeline</h1>
  <p>Open DevTools → Performance, click Record, then click "Animate".
     Compare the green (paint) and purple (layout) bars.</p>

  <div class="track">
    <div id="cheap"     class="box">transform</div>
    <div id="expensive" class="box">top/left</div>
  </div>

  <button id="go">Animate both boxes 200 frames</button>
  <script src="app.js"></script>
</body>
</html>
\`\`\`

#### Step 3 — CSS That Sets Up Both Approaches
\`\`\`css
/* style.css */
body { font-family: system-ui; padding: 2rem; background: #fafafa; }
.track {
  position: relative;
  height: 200px;
  border: 2px dashed #ccc;
  margin: 1rem 0;
}
.box {
  position: absolute;
  width: 100px; height: 100px;
  display: grid; place-items: center;
  color: white; font-weight: bold;
  border-radius: 8px;
}
#cheap     { top: 10px;  left: 0;   background: #2a9d8f; will-change: transform; }
#expensive { top: 100px; left: 0;   background: #e76f51; }

button { padding: 0.5em 1em; font: inherit; cursor: pointer; }
\`\`\`

#### Step 4 — Error Handling: Honour \`prefers-reduced-motion\`
\`\`\`javascript
// app.js
const cheap     = document.getElementById('cheap');
const expensive = document.getElementById('expensive');
const btn       = document.getElementById('go');

// Respect the user's OS-level "reduce motion" setting (a11y requirement)
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

btn.addEventListener('click', () => {
  if (reduceMotion) {
    alert('Reduced-motion mode is on — skipping animation.');
    return;
  }
  animate(0);
});

function animate(frame) {
  if (frame >= 200) return;

  // CHEAP: transform only triggers COMPOSITE
  cheap.style.transform = \`translateX(\${frame * 2}px)\`;

  // EXPENSIVE: left triggers LAYOUT + PAINT + COMPOSITE
  expensive.style.left = (frame * 2) + 'px';

  requestAnimationFrame(() => animate(frame + 1));
}
\`\`\`

#### Step 5 — Tests / What to Look For in DevTools
\`\`\`javascript
// Open Performance tab → record while clicking the button
// Compare the two boxes' frame breakdown:
//
//   #cheap     (transform): only "Composite Layers" bars   → ~0.5ms / frame
//   #expensive (left):       "Layout" + "Paint" + "Composite" → ~4-8ms / frame
//
// At 60fps you have ~16.67ms per frame. The expensive box can break that budget
// on a complex page — the cheap one cannot.

// Programmatic check: measure actual frame times
let frames = 0, start = performance.now();
function tick() {
  frames++;
  if (performance.now() - start < 1000) requestAnimationFrame(tick);
  else console.log('FPS:', frames);
}
requestAnimationFrame(tick);
\`\`\`

**Expected Output:**
\`\`\`
- DevTools Performance: cheap box shows only purple "Composite" bars
- DevTools Performance: expensive box shows green "Layout" + yellow "Paint" + purple "Composite"
- On a throttled CPU (4x slowdown), the expensive box drops to ~20-30 FPS
- The cheap box stays locked at 60 FPS
- "Layers" panel shows #cheap has its own compositor layer (because of will-change)
\`\`\`

**Stretch Challenges:**
- [ ] Add a third box that animates \`background-color\` and see it triggers PAINT but not LAYOUT
- [ ] Add a 100-element grid to make the layout cost obvious — expensive box drops to single-digit FPS
- [ ] Add CSS containment (\`contain: layout paint\`) to the expensive box and watch the cost vanish`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** Name the four stages of the browser render pipeline that CSS participates in. Which one does \`transform\` skip?

**Q2:** What is the difference between the CSSOM and the Render Tree? Which one contains \`display: none\` elements?

**Q3:** Write the 5-line CSS that centers a single \`<div>\` both horizontally and vertically inside its parent. From memory.

---

### Day 3 — Comprehension

**Q4:** Explain the cascade in one sentence. What are the FIVE things the browser uses to break a tie between competing rules?

**Q5:** Describe the most common production bug caused by misunderstanding specificity. Show the broken rule and the proper fix (without \`!important\`).

**Q6:** Refactor this for performance:
\`\`\`css
.modal { position: fixed; top: 0; left: 0; transition: top 0.3s, left 0.3s; }
.modal.open { top: 50px; left: 50px; }
\`\`\`

---

### Day 7 — Application

**Q7:** Build a page that intentionally triggers layout thrashing in a loop. Then refactor it using \`transform\` + \`will-change\` to lock 60 FPS.

**Q8:** A page has 5000 \`<li>\` elements with a hover style. Hovering anywhere causes 200ms jank. Name 3 CSS-level causes and the fix for each.

**Q9:** What is "containing block"? Show one scenario where the answer depends on \`position: fixed\` vs \`position: absolute\`.

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Classic interview: "Walk me through what the browser does between receiving a CSS file and showing the styled page."

**Q11:** Draw the dependency graph: css-intro ↔ selectors ↔ box-model ↔ display-and-positioning. Which concept enables which?

**Q12:** ★ System design: "Design the CSS delivery strategy for a global SaaS where above-the-fold CSS must inline (<14KB), the rest must lazy-load, dark mode must work without flicker, and Core Web Vitals must stay green across 200 countries."`
  },

  // ── 2. selectors ──────────────────────────────────────────────────────────
  'selectors': {
    feynman: `## FEYNMAN CHECK

### Explain CSS Selectors Like I'm 10 Years Old
> Selectors are the QUERIES of CSS — they ask the browser "find every element matching this pattern, and apply these styles to them." \`.btn\` matches every element with \`class="btn"\`; \`a:hover\` matches every link the mouse is currently over; \`p > strong\` matches \`<strong>\` that is a DIRECT child of \`<p>\`. Each selector has a SPECIFICITY score (4-digit number: inline, IDs, classes, elements) that decides which rule wins when two selectors target the same element. This is why \`#header .btn\` (0,1,1,0) beats \`.modal .btn\` (0,0,2,0) — and why nobody should ever use IDs in CSS.

---

### 5 Deep Conceptual Questions

**Q1: What problem do CSS selectors fundamentally solve?**
> **A:** They give CSS its targeting power — one rule applies to many elements without you naming each. They also encode RELATIONSHIPS (descendant, child, sibling, attribute, state) so styling can react to context: a link inside a nav is styled differently from a link inside an article. Without selectors, CSS would degenerate into per-element inline styles, defeating the cascade.

**Q2: What is the ONE mental model that makes selectors click?**
> **A:** Selectors are matched RIGHT-TO-LEFT, not left-to-right. \`nav ul li a\` doesn't mean "find all navs, then their uls, then..." — it means "find every \`<a>\`, then check if its ancestor chain includes \`li > ul > nav\`." This is why ".btn" is fast but "div div div .btn" is slow on large pages: the browser must walk up the ancestor chain for every potential match.

**Q3: What is the most dangerous misconception about selectors? Show it with code.**
> **A:** That nesting selectors deeply "scopes" them safely — instead it locks specificity high and makes overrides require even higher specificity:
> \`\`\`css
> /* ❌ Specificity (0,0,4,0). Now every override needs ≥4 classes or !important */
> .page .sidebar .widget .title { color: red; }
>
> /* ✅ Use a single class with BEM-style naming. Specificity (0,0,1,0). Easy to override. */
> .widget__title { color: red; }
> \`\`\`

**Q4: How does the browser evaluate selectors at the runtime level?**
> **A:** The browser maintains a hash map of rules indexed by their rightmost simple selector (the "key selector") — class names, IDs, tag names. When matching, it looks up only rules whose key matches the element, then walks UP the ancestor chain to test the rest. This is why \`* { color: red }\` is slow (every element matches the key) and why \`:has(.child)\` is computationally expensive (it inverts the direction — checking descendants).

**Q5: Write a one-sentence definition of CSS selectors that a senior engineer at a FAANG company would find technically precise.**
> **A:** "CSS selectors are right-to-left-matched patterns over the DOM tree that compose simple selectors (tag, class, id, attribute, pseudo-class) with combinators (descendant, child, adjacent sibling, general sibling) and resolve specificity as a four-tuple (\`a, b, c, d\`) → first by !important, then by inline, ID, class, element count, then by source order — which is why deeply-nested selectors and ID-based rules create a specificity arms race that makes design-system overrides painful."`,

    build: `## BUILD

### 🏗️ Mini Project: A Working "Selector Playground" That Visualises Specificity Battles

**What you will build:** An interactive HTML page where you can type CSS selectors and see which elements match + the specificity score of each rule, with a live "battle" view showing which rule wins for each element.
**Why this project:** Most devs never internalise specificity until they SEE it. Building this hard-codes the rules.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir selector-playground && cd selector-playground
ni index.html, app.js -ItemType File
\`\`\`

#### Step 2 — Markup With Variety of Targets
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Selector playground</title>
  <style>
    body { font-family: system-ui; padding: 2rem; }
    .target { padding: 0.25em 0.5em; border: 1px dashed #ccc; margin: 0.25em 0; }
    .winner { outline: 3px solid green; }
    input { width: 100%; padding: 0.5em; font: inherit; }
    pre { background: #f4f4f4; padding: 1em; }
  </style>
</head>
<body>
  <h1>Selector Playground</h1>

  <input id="sel" placeholder="Type a CSS selector, e.g. nav > a:hover">

  <h2>Targets</h2>
  <nav>
    <a href="#" class="target link" id="home">Home</a>
    <a href="#" class="target link active" data-section="blog">Blog</a>
  </nav>
  <article class="target post">
    <h3 class="target title">Hello World</h3>
    <p class="target intro">Lead paragraph.</p>
    <p class="target">Regular paragraph.</p>
  </article>

  <h2>Results</h2>
  <pre id="out"></pre>

  <script src="app.js"></script>
</body>
</html>
\`\`\`

#### Step 3 — Specificity Calculator + Live Match Highlighting
\`\`\`javascript
// app.js
const input = document.getElementById('sel');
const out   = document.getElementById('out');

// Compute specificity as [inline, ids, classes/attrs/pseudo-classes, elements/pseudo-elements]
function specificity(selector) {
  // Strip pseudo-elements (single colon and double colon)
  const s = selector.replace(/::?[\\w-]+(\\([^)]*\\))?/g, '');
  const ids        = (s.match(/#[\\w-]+/g)  || []).length;
  const classesEtc = (s.match(/(\\.[\\w-]+|\\[[^\\]]+\\]|:[\\w-]+(\\([^)]*\\))?)/g) || []).length;
  const elems      = (s.match(/(^|[\\s>+~])[a-z][\\w-]*/g) || []).length;
  return [0, ids, classesEtc, elems];
}

input.addEventListener('input', () => {
  const sel = input.value.trim();
  document.querySelectorAll('.winner').forEach(el => el.classList.remove('winner'));
  if (!sel) { out.textContent = ''; return; }

  try {
    const matches = document.querySelectorAll(sel);
    matches.forEach(el => el.classList.add('winner'));
    const spec = specificity(sel);
    out.textContent =
      \`Selector:    \${sel}\\n\` +
      \`Specificity: (\${spec.join(',')})\\n\` +
      \`Matches:     \${matches.length} element(s)\\n\` +
      Array.from(matches).map((el, i) =>
        \`  \${i + 1}. \${el.tagName.toLowerCase()}\` +
        (el.id ? '#' + el.id : '') +
        (el.className ? '.' + [...el.classList].filter(c=>c!=='winner').join('.') : '')
      ).join('\\n');
  } catch (err) {
    out.textContent = 'Invalid selector: ' + err.message;
  }
});
\`\`\`

#### Step 4 — Edge Cases: Pseudo-Class State, Attribute Selectors, :has()
\`\`\`javascript
// Try these selectors in the playground to confirm understanding:
// a                     → matches both links, spec (0,0,0,1)
// .link                 → matches both links, spec (0,0,1,0)
// .active               → matches Blog only, spec (0,0,1,0)
// nav a.active          → matches Blog only, spec (0,0,2,1)  ← wins over .link
// a[data-section="blog"]→ matches Blog only, spec (0,0,1,1)
// article:has(.intro)   → matches the article that has a .intro child (modern :has)
// p:not(.intro)         → all <p> EXCEPT the lead

// Hover and focus states need real interaction — test in DevTools "force state"
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
// Built-in assertions on specificity calculation
console.assert(JSON.stringify(specificity('a'))             === '[0,0,0,1]',  'tag');
console.assert(JSON.stringify(specificity('.link'))         === '[0,0,1,0]',  'class');
console.assert(JSON.stringify(specificity('#home'))         === '[0,1,0,0]',  'id');
console.assert(JSON.stringify(specificity('nav a.active'))  === '[0,0,1,2]',  'mix');
console.assert(JSON.stringify(specificity('a[href]:hover')) === '[0,0,2,1]',  'attr+pseudo');
console.log('All specificity tests passed.');
\`\`\`

**Expected Output:**
\`\`\`
- Typing ".link" highlights both links, shows specificity (0,0,1,0)
- Typing "nav a.active" highlights only "Blog", specificity (0,0,1,2)
- Invalid selectors caught and shown with error message
- All 5 console.assert lines pass without warning
\`\`\`

**Stretch Challenges:**
- [ ] Add a 2-rule "battle mode": type two selectors, see which one wins per element
- [ ] Visualise the right-to-left matching by highlighting each ancestor as the browser would check
- [ ] Add complexity-class detection: warn when a selector hits >3 levels of nesting`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** Name the FIVE categories of selectors (universal, type, class, ID, attribute) plus the FOUR combinators (descendant, child, adjacent sibling, general sibling). Give one syntax example of each.

**Q2:** Compute the specificity of: \`#nav .item a:hover\`, \`a.btn.primary\`, \`* + *\`, \`section h2\`.

**Q3:** Write the selector that matches every checked checkbox inside a form. No autocomplete.

---

### Day 3 — Comprehension

**Q4:** Why are CSS selectors matched right-to-left? Give a 4-line example where this matters for performance.

**Q5:** Describe a real bug introduced by using IDs in CSS. Show the broken rule and the BEM-style refactor that fixes it.

**Q6:** Refactor this selector chain to lower specificity without changing the visual result:
\`\`\`css
body div.page .sidebar #widgets .widget .header .title { color: red; }
\`\`\`

---

### Day 7 — Application

**Q7:** Build a CSS-only navigation where the active link highlights based on \`:has()\` + \`:target\` — no JavaScript.

**Q8:** A design system rule \`.btn { background: blue }\` is overridden by an app rule \`.page .container .btn\`. Name 3 ways to restore the design-system rule WITHOUT \`!important\`.

**Q9:** What is the difference between \`:nth-child(2)\`, \`:nth-of-type(2)\`, and \`:nth-last-child(2)\`? Show a 6-row HTML example where each picks a DIFFERENT row.

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "Explain CSS specificity. How would you debug a rule that's not applying despite being more specific?"

**Q11:** Draw the dependency graph: selectors ↔ pseudo-classes-advanced ↔ pseudo-elements-advanced ↔ css-architecture.

**Q12:** ★ System design: "Design the selector-naming conventions for a 500-component design system used by 40 teams. How do you prevent specificity wars while supporting per-team theme overrides?"`
  },

  // ── 3. box-model ──────────────────────────────────────────────────────────
  'box-model': {
    feynman: `## FEYNMAN CHECK

### Explain the CSS Box Model Like I'm 10 Years Old
> Every HTML element is a rectangular box with FOUR concentric layers: \`content\` (the text/image), \`padding\` (transparent space inside the border), \`border\` (the visible edge), and \`margin\` (transparent space OUTSIDE the border, between this box and the next). The classic confusion: by default, \`width: 200px\` means CONTENT is 200px, but padding and border are ADDED on top — so the visible box is wider than 200. The 2014 fix \`box-sizing: border-box\` made \`width\` include padding+border (which is what every designer instinctively expected), and is now applied globally by virtually every CSS reset.

---

### 5 Deep Conceptual Questions

**Q1: What problem does the box model fundamentally solve?**
> **A:** It standardises HOW elements occupy space, so designers and browsers agree on what "200px wide" means. Before CSS, layout was \`<table>\`-driven and inconsistent across browsers. The box model gives every element a predictable 4-layer geometry that CSS layout algorithms (flow, flex, grid) all operate on.

**Q2: What is the ONE mental model that makes the box model click?**
> **A:** Think of a picture frame: the photograph is \`content\`, the matte border around the photo is \`padding\`, the wooden frame is \`border\`, and the gap on the wall between this frame and the next one is \`margin\`. Background colour extends through padding but NOT through margin — which is why a coloured box with margin appears as a coloured rectangle on a white gap.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** That \`width: 100%\` + padding fits inside the parent — without \`border-box\`, it overflows:
> \`\`\`css
> /* ❌ With default content-box, this element is 100% + 40px wide → horizontal scrollbar! */
> .card {
>   width: 100%;
>   padding: 20px;
>   border: 2px solid;
> }
>
> /* ✅ With border-box, total width stays at 100% — padding+border eat INTO the 100% */
> *, *::before, *::after { box-sizing: border-box; }
> .card { width: 100%; padding: 20px; border: 2px solid; }
> \`\`\`

**Q4: How does margin collapsing interact with the layout algorithm?**
> **A:** When two block-level elements stack vertically and both have margins, the LARGER margin wins — they "collapse" into one — instead of adding up. This only happens in BLOCK flow direction (vertical, in LTR languages) and ONLY when nothing separates the margins (no border, no padding, no inline content). It does NOT happen in flex/grid containers or for horizontal margins. The most surprising consequence: a child's top margin can "escape" through its parent if the parent has no padding/border, pushing the parent down.

**Q5: Write a one-sentence definition of the box model that a senior engineer at a FAANG company would find technically precise.**
> **A:** "The CSS box model is the four-layer (content → padding → border → margin) geometric specification governing every formatting-context-participating element, parameterised by \`box-sizing\` (content-box vs border-box) which determines whether the \`width\`/\`height\` properties refer to the content box or the padding-box-plus-border-box — with margin-collapsing rules that apply only in block formatting contexts, are killed by flex/grid containers, and most commonly surprise developers when a child's top margin propagates through a padding-less parent."`,

    build: `## BUILD

### 🏗️ Mini Project: A "Box Model Inspector" That Visualises Every Layer

**What you will build:** A page that lets you adjust width, padding, border, and margin sliders on a target element, with live colour-coded overlays showing each box-model layer and the computed dimensions in real time.
**Why this project:** Once you've manipulated every property and seen the result, the box model stops being abstract.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir box-inspector && cd box-inspector
ni index.html, app.js -ItemType File
\`\`\`

#### Step 2 — Markup With Sliders
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Box-model inspector</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui; padding: 2rem; background: #fafafa; }

    .controls { display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 0.5em; max-width: 500px; }
    .controls label { font-family: monospace; }

    /* The target element + visual overlays */
    .container { background: #eee; padding: 40px; margin-top: 2rem; max-width: 500px; }
    .target {
      background: #ffe66d;          /* content layer */
      border: 4px solid #e76f51;    /* border layer */
      padding: 16px;                /* padding layer (shown via the bg gradient below) */
      margin: 8px;                  /* margin layer (transparent gap) */
      background-clip: content-box; /* visualise content-box vs padding-box */
      background-color: #ffe66d;
      box-shadow:
        inset 0 0 0 999px #b5e2fa00,
        0 0 0 999px transparent;
    }
    .legend { display: flex; gap: 1em; margin-top: 1em; font-family: monospace; }
    .legend span { padding: 0.25em 0.5em; }
    .l-content { background: #ffe66d; }
    .l-padding { background: #b5e2fa; }
    .l-border  { background: #e76f51; color: white; }
    .l-margin  { background: #c0c0c0; }

    output { display: block; margin-top: 1em; font-family: monospace; }
  </style>
</head>
<body>
  <h1>Box-model inspector</h1>
  <div class="controls">
    <label for="w">width</label>
    <input id="w" type="range" min="50" max="400" value="200">
    <span id="w-v">200px</span>

    <label for="p">padding</label>
    <input id="p" type="range" min="0" max="60" value="16">
    <span id="p-v">16px</span>

    <label for="b">border</label>
    <input id="b" type="range" min="0" max="20" value="4">
    <span id="b-v">4px</span>

    <label for="m">margin</label>
    <input id="m" type="range" min="0" max="60" value="8">
    <span id="m-v">8px</span>

    <label for="bs">box-sizing</label>
    <select id="bs">
      <option value="border-box">border-box</option>
      <option value="content-box">content-box</option>
    </select>
    <span></span>
  </div>

  <div class="container">
    <div class="target">Target box</div>
  </div>

  <div class="legend">
    <span class="l-content">content</span>
    <span class="l-padding">padding</span>
    <span class="l-border">border</span>
    <span class="l-margin">margin</span>
  </div>

  <output id="out"></output>
  <script src="app.js"></script>
</body>
</html>
\`\`\`

#### Step 3 — Wire the Sliders to Live CSS
\`\`\`javascript
// app.js
const target = document.querySelector('.target');
const out    = document.getElementById('out');

const inputs = { w: 'width', p: 'padding', b: 'border-width', m: 'margin' };
const sizing = document.getElementById('bs');

function update() {
  for (const [id, prop] of Object.entries(inputs)) {
    const el = document.getElementById(id);
    const val = el.value + 'px';
    document.getElementById(id + '-v').textContent = val;
    if (prop === 'border-width') target.style.border = el.value + 'px solid #e76f51';
    else target.style[prop] = val;
  }
  target.style.boxSizing = sizing.value;

  // Show computed dimensions
  const rect = target.getBoundingClientRect();
  const cs   = getComputedStyle(target);
  out.textContent =
    \`Box-sizing:     \${cs.boxSizing}\\n\` +
    \`Specified width: \${cs.width}\\n\` +
    \`Actual width on screen: \${rect.width}px\\n\` +
    \`(content + padding + border = \${cs.width}+\${cs.paddingLeft}*2+\${cs.borderLeftWidth}*2)\\n\` +
    \`Margin: \${cs.margin}  (NOT included in border-box width)\`;
}

document.querySelectorAll('input, select').forEach(el => el.addEventListener('input', update));
update();
\`\`\`

#### Step 4 — Edge Cases: Margin Collapsing Demo
\`\`\`html
<!-- Add to demo.html to see margin collapse in action -->
<h2>Margin collapse</h2>
<div style="background: #f4f4f4; padding: 0;">
  <p style="margin: 50px 0; background: #ffe66d;">
    My top margin (50px) ESCAPES the padding-less parent and pushes it down 50px.
    Add padding: 1px to the parent and the margin will collapse inside instead.
  </p>
</div>
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
// Assertions on computed dimensions
function getActualWidth() {
  return target.getBoundingClientRect().width;
}

target.style.boxSizing = 'content-box';
target.style.width   = '200px';
target.style.padding = '20px';
target.style.border  = '5px solid';
console.assert(getActualWidth() === 250,
  'content-box: 200 + 20*2 + 5*2 = 250');

target.style.boxSizing = 'border-box';
console.assert(getActualWidth() === 200,
  'border-box: total stays 200, content shrinks');

console.log('Box-model assertions passed.');
\`\`\`

**Expected Output:**
\`\`\`
- Slider drag visibly changes the yellow content / blue padding / red border layers
- "Actual width" matches the math: width + 2*padding + 2*border for content-box,
  exactly width for border-box
- Toggling box-sizing instantly changes which layer the width refers to
- Margin-collapse demo: yellow paragraph pushes its grey parent down 50px
- Both console.asserts pass
\`\`\`

**Stretch Challenges:**
- [ ] Add per-side controls (padding-top, margin-left, etc.) and watch asymmetric margins
- [ ] Add a "logical properties" toggle (\`padding-inline-start\` etc.) and flip dir="rtl"
- [ ] Use \`outline\` instead of \`border\` to prove outline doesn't participate in the box model`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** Name the four box-model layers in order from inside to outside. Which one does \`background-color\` extend through?

**Q2:** What does \`box-sizing: border-box\` change? Give one practical reason 99% of stylesheets use it globally.

**Q3:** Write the 2 CSS rules every modern reset starts with to enforce border-box globally.

---

### Day 3 — Comprehension

**Q4:** What is margin collapsing? Give the 3 conditions required for it to happen and 2 ways to prevent it.

**Q5:** Describe the production bug caused by \`width: 100%\` with padding under content-box sizing. Show the broken layout and the one-line fix.

**Q6:** Refactor for predictability:
\`\`\`css
.card { width: 300px; padding: 20px; border: 1px solid; }
.grid { display: grid; grid-template-columns: 1fr 1fr; }
\`\`\`

---

### Day 7 — Application

**Q7:** Build a 4-column dashboard where each card has padding 20px and gap 16px, while still fitting exactly inside a 1200px viewport. No JS.

**Q8:** A user reports a 1px scrollbar appearing on the page. List 3 box-model causes and the fix for each.

**Q9:** What is the difference between \`min-content\`, \`max-content\`, and \`fit-content\` as values for \`width\`? Show 3 boxes side-by-side demonstrating each.

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "Explain the difference between content-box and border-box. Why is border-box almost always the right default?"

**Q11:** Draw the dependency graph: box-model ↔ display-and-positioning ↔ flexbox ↔ css-grid.

**Q12:** ★ System design: "Design the spacing system for a multi-brand design system where every component honours an 8-point grid. How do tokens, padding, margin, and gap interact across themes?"`
  },

  // ── 4. units ──────────────────────────────────────────────────────────────
  'units': {
    feynman: `## FEYNMAN CHECK

### Explain CSS Units Like I'm 10 Years Old
> CSS values use ABSOLUTE units (\`px\`, \`pt\`, \`cm\` — fixed sizes) and RELATIVE units (\`%\`, \`em\`, \`rem\`, \`vw\`, \`vh\`, \`ch\`, \`fr\` — calculated from something else). \`rem\` is "relative to the ROOT font-size" (default 16px); \`em\` is "relative to THIS element's font-size" (which cascades and stacks confusingly); \`%\` is relative to the parent's matching dimension; \`vw\`/\`vh\` are 1% of the viewport. Modern apps use \`rem\` for typography (respects user zoom), \`%\` for fluid widths, \`ch\` for text-line widths, and \`fr\` for grid tracks. Using \`px\` for font-size is an accessibility violation because it ignores the user's browser-zoom font-size preference.

---

### 5 Deep Conceptual Questions

**Q1: What problem do CSS units fundamentally solve?**
> **A:** They let one stylesheet adapt to many contexts (different viewports, font sizes, user zoom levels, container widths) without recompilation. Absolute units (px) work for fixed-resolution prints; relative units enable responsive design. Without relative units, every breakpoint would require a hand-tuned px value.

**Q2: What is the ONE mental model that makes units click?**
> **A:** Every relative unit answers "relative to WHAT?" — and the answer is different per unit. \`em\` = relative to MY computed font-size. \`rem\` = relative to ROOT font-size. \`%\` = relative to parent's matching property (width % → parent width, padding % → parent WIDTH not height). \`vw\` = relative to viewport. \`fr\` = relative to other tracks in the same grid. Memorising these "anchor points" is 90% of the battle.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** That \`em\` is safe to use everywhere — it COMPOUNDS through nesting and produces "shrinking text" bugs:
> \`\`\`css
> /* ❌ Each nested .item shrinks its children by 10% */
> .item { font-size: 0.9em; }
>
> /* HTML: <div class="item"><div class="item"><div class="item">Tiny</div></div></div> */
> /* Effective size: 1em → 0.9em → 0.81em → 0.729em (Tiny is ~73% of root) */
>
> /* ✅ rem is always anchored to the root — no compounding */
> .item { font-size: 0.9rem; }
> /* Every .item, no matter how nested, is 0.9 * root size = 14.4px (if root is 16px) */
> \`\`\`

**Q4: How does \`vw\`/\`vh\` interact with the mobile browser address bar at the runtime level?**
> **A:** On mobile, the visible viewport size CHANGES as you scroll (the address bar slides up/away). The traditional \`vh\` unit refers to the LARGEST viewport (no address bar), so \`height: 100vh\` on mobile creates a section TALLER than the visible screen on load. The 2022 spec added \`svh\` (small — smallest possible viewport), \`lvh\` (large — biggest possible), and \`dvh\` (dynamic — current). Use \`dvh\` for "fill the visible screen right now" — it updates as the address bar moves.

**Q5: Write a one-sentence definition of CSS units that a senior engineer at a FAANG company would find technically precise.**
> **A:** "CSS units are typed numeric values that resolve into used pixel values via a context-sensitive computation — absolute units map 1:1 to CSS pixels regardless of context, while relative units (\`em\`, \`%\`, \`vw\`, \`fr\`, \`ch\`) resolve against an anchor (element font-size, containing block, viewport, grid track total, or 0-character advance) — which is why typography stacks built on \`em\` introduce compounding bugs and viewport-based layouts must distinguish \`vh\` (legacy), \`svh\`, \`lvh\`, and \`dvh\` to handle mobile browser-chrome resizing correctly."`,

    build: `## BUILD

### 🏗️ Mini Project: A Side-By-Side Unit Demo + Zoom-Accessibility Verifier

**What you will build:** A page that renders the same heading sized in \`px\`, \`em\`, \`rem\`, \`%\`, \`vw\`, \`clamp()\` — then verifies which ones respect Cmd/Ctrl-+ browser zoom (accessibility-required behaviour).
**Why this project:** Visually proves why \`rem\` and \`clamp\` are the modern defaults and \`px\` is an a11y violation for typography.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir unit-demo && cd unit-demo
ni index.html, verify.js -ItemType File
\`\`\`

#### Step 2 — The Comparison Page
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CSS units compared</title>
  <style>
    /* Root font-size = 16px by default. Override here to demonstrate. */
    :root { font-size: 16px; }
    body  { font-family: system-ui; padding: 2rem; max-width: 800px; }

    .row { display: grid; grid-template-columns: 200px 1fr 80px; gap: 1em;
           align-items: baseline; border-bottom: 1px solid #eee; padding: 0.5em 0; }
    .label { font-family: monospace; color: #666; }
    .px   { font-size: 24px; }
    .em   { font-size: 1.5em; }
    .rem  { font-size: 1.5rem; }
    .pct  { font-size: 150%; }       /* % of parent's font-size */
    .vw   { font-size: 4vw; }        /* 4% of viewport width */
    .clmp { font-size: clamp(1rem, 1rem + 1vw, 2rem); }
  </style>
</head>
<body>
  <h1>How each CSS unit renders</h1>

  <div class="row"><span class="label">font-size: 24px</span>
    <span class="px">Sample heading</span>
    <output></output></div>

  <div class="row"><span class="label">font-size: 1.5em</span>
    <span class="em">Sample heading</span>
    <output></output></div>

  <div class="row"><span class="label">font-size: 1.5rem</span>
    <span class="rem">Sample heading</span>
    <output></output></div>

  <div class="row"><span class="label">font-size: 150%</span>
    <span class="pct">Sample heading</span>
    <output></output></div>

  <div class="row"><span class="label">font-size: 4vw</span>
    <span class="vw">Sample heading</span>
    <output></output></div>

  <div class="row"><span class="label">font-size: clamp(1rem, 1rem+1vw, 2rem)</span>
    <span class="clmp">Sample heading</span>
    <output></output></div>

  <h2>Viewport units gotcha</h2>
  <div style="height: 100dvh; background: #ffe66d;">
    This box uses <code>height: 100dvh</code> — fills VISIBLE viewport,
    shrinks when mobile address bar appears.
  </div>

  <script src="verify.js"></script>
</body>
</html>
\`\`\`

#### Step 3 — Live Computed-Size Readouts
\`\`\`javascript
// verify.js
function refresh() {
  for (const row of document.querySelectorAll('.row')) {
    const span   = row.querySelector('span:nth-of-type(2)') ?? row.children[1];
    const out    = row.querySelector('output');
    const size   = parseFloat(getComputedStyle(span).fontSize);
    out.textContent = size.toFixed(1) + 'px';
  }
}
refresh();
window.addEventListener('resize', refresh);
\`\`\`

#### Step 4 — Edge Cases: User Zoom + Min Font-Size Setting
\`\`\`javascript
// verify.js (continued) — detect and warn if px-sized text won't respect zoom
function warnAboutAccessibility() {
  for (const el of document.querySelectorAll('[class*="px"]')) {
    const cs = getComputedStyle(el);
    if (cs.fontSize.endsWith('px') && el.tagName.match(/H[1-6]|P|SPAN|DIV/i)) {
      // Browsers DO scale px on Cmd-+ zoom, but NOT for user's
      // "minimum font size" or "default font size" browser settings.
      console.warn('px font-size — will not honour user minimum font-size:',
        el.textContent.slice(0, 30));
    }
  }
}
warnAboutAccessibility();

// Walk the user through testing:
console.log('Press Cmd/Ctrl-+ to zoom — every unit scales correctly.');
console.log('Now: Settings → Appearance → Font size → Largest.');
console.log('rem and % scale; px does NOT. That is the a11y violation.');
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
// Programmatic assertions on computed sizes (with default 16px root)
const px  = parseFloat(getComputedStyle(document.querySelector('.px')).fontSize);
const rem = parseFloat(getComputedStyle(document.querySelector('.rem')).fontSize);
const em  = parseFloat(getComputedStyle(document.querySelector('.em')).fontSize);

console.assert(px  === 24, 'px should equal exactly 24');
console.assert(rem === 24, '1.5rem * 16px = 24');
console.assert(em  === 24, '1.5em on body (font: inherit = 16) = 24');
console.log('Unit assertions passed.');
\`\`\`

**Expected Output:**
\`\`\`
- Every heading visually matches except <vw> which changes with window width
- Computed-size readouts show all start at 24px in a 600px-wide window
- Resize window: vw and clamp readings update; px/em/rem/% stay constant
- 100dvh box shrinks/grows on mobile as address bar shows/hides
- All console.asserts pass
\`\`\`

**Stretch Challenges:**
- [ ] Change \`:root { font-size: 20px }\` and watch only rem/% change — px/em do not
- [ ] Add a font-size slider that overrides \`:root\` to simulate user browser zoom
- [ ] Add a CSS container query units demo (\`cqw\`, \`cqh\`, \`cqi\`, \`cqb\`)`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** What is \`rem\` relative to? What is \`em\` relative to? When do they compound and when don't they?

**Q2:** Name the four viewport units \`vh\`, \`svh\`, \`lvh\`, \`dvh\`. When would you choose each?

**Q3:** Write the \`clamp()\` expression that grows a font from 1rem (mobile) to 2.5rem (desktop) fluidly with viewport.

---

### Day 3 — Comprehension

**Q4:** Why is \`px\` for typography an accessibility violation? Which user setting does it ignore?

**Q5:** Describe the "shrinking nested text" bug caused by \`em\` units. Show the broken cascade and the rem-based fix.

**Q6:** Refactor for accessibility:
\`\`\`css
body  { font-size: 16px; }
h1    { font-size: 40px; }
.card { font-size: 14px; padding: 16px; width: 320px; }
\`\`\`

---

### Day 7 — Application

**Q7:** Build a fluid-typography stylesheet (4 heading sizes + body) using only \`rem\` and \`clamp()\`. Must look great at 320px and 2560px without media queries.

**Q8:** A landing page renders correctly at desktop zoom 100% but breaks at 200%. List 3 unit-choice root causes and the fix for each.

**Q9:** What is the \`ch\` unit? Build a 65-character-wide reading column using \`max-width: 65ch\`. Why is this better than 600px?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "Walk me through when you'd choose \`px\`, \`em\`, \`rem\`, \`%\`, \`vw\`, \`fr\`, or \`clamp()\`."

**Q11:** Draw the dependency graph: units ↔ typography ↔ responsive-design ↔ css-variables.

**Q12:** ★ System design: "Design the unit system for a global SaaS supporting browser zoom 50%-400%, mobile + desktop + TV layouts, and per-tenant theme density (compact / comfortable / spacious). Which units belong at which layer?"`
  },

  // ── 5. colors ─────────────────────────────────────────────────────────────
  'colors': {
    feynman: `## FEYNMAN CHECK

### Explain CSS Colors Like I'm 10 Years Old
> CSS colors come in many notations — \`red\` (named), \`#ff0000\` (hex), \`rgb(255,0,0)\`, \`hsl(0,100%,50%)\`, and modern \`oklch(0.62 0.25 29)\`. All eventually map to the same screen pixels, BUT \`hsl\` and \`oklch\` let you reason about them ("rotate the hue 30°", "make it 20% darker") which hex doesn't. The big 2023 shift: the sRGB color space (everything before) covers only ~75% of what modern displays can show — \`color(display-p3 ...)\` and \`oklch()\` unlock the vivid 30%+ extra range that iPhones, MacBooks, and OLED TVs have had since 2017 but the web couldn't reach.

---

### 5 Deep Conceptual Questions

**Q1: What problem do CSS colors fundamentally solve?**
> **A:** They give a single declarative way to refer to colors that maps to actual screen pixels across every device — handling transparency (alpha), color spaces (sRGB → P3 → Rec2020), gamut mapping (what to do when the color you ask for can't be shown), accessibility contrast calculations, and dark-mode adaptation. Without a unified system, every browser and OS would render \`#ff0000\` differently.

**Q2: What is the ONE mental model that makes CSS colors click?**
> **A:** Colors are 3 (or 4) numbers in a coordinate space. RGB is "amount of red, green, blue light" (hardware-oriented, hard for humans). HSL is "hue angle, saturation %, lightness %" (designer-friendly, but mathematically lies — equal-lightness HSL values appear different brightnesses). OKLCH is "perceptual lightness, chroma, hue" (mathematically TRUE — equal lightness means equal visual brightness), which is why design systems built in 2024+ use it for systematic color palettes.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** That \`hsl()\` lightness is perceptually uniform — it isn't:
> \`\`\`css
> /* ❌ These two colors have the same HSL lightness (50%) but look very different brightnesses */
> .a { background: hsl(60 100% 50%); }   /* yellow — appears VERY bright */
> .b { background: hsl(240 100% 50%); }  /* blue   — appears VERY dark   */
>
> /* ✅ OKLCH lightness is perceptually accurate — these two look equally bright */
> .a { background: oklch(0.7 0.2 90); }   /* yellow */
> .b { background: oklch(0.7 0.2 270); }  /* blue   */
> \`\`\`

**Q4: How does color interact with the GPU and display at the runtime level?**
> **A:** The browser parses your color value, maps it to the sRGB color space (default), then the GPU rasterises every pixel. On wide-gamut displays (modern iPhones, MacBooks, OLED TVs), the OS COMPRESSES the GPU output back to sRGB — meaning \`#ff0000\` on an iPhone shows the SAME red as a 2005 monitor, even though the iPhone could display a much more vivid red. Specifying \`color(display-p3 1 0 0)\` tells the browser "render this in the P3 space" — the GPU outputs the wider-gamut red, unlocking ~30% more color volume.

**Q5: Write a one-sentence definition of CSS colors that a senior engineer at a FAANG company would find technically precise.**
> **A:** "CSS colors are typed values in a specified color space (sRGB by default, with \`color()\`, \`oklch()\`, \`lab()\` exposing wide-gamut and perceptually-uniform spaces) that the browser resolves into pixel values via gamut mapping, alpha compositing, and final device-color-profile conversion — which is why hex/hsl/named colors clip wide-gamut hardware to sRGB while \`color(display-p3)\` and \`oklch()\` unlock the extra ~30% color volume modern displays already have."`,

    build: `## BUILD

### 🏗️ Mini Project: Build a Perceptually-Uniform Color Palette With OKLCH + Contrast Auditor

**What you will build:** A 10-step color palette (50, 100, 200, ..., 900) for a brand hue using OKLCH so every step has equal visual brightness change, plus an automated WCAG contrast checker that flags any text/background pair below AA.
**Why this project:** Touches every modern color concept — perceptual uniformity, wide gamut, accessibility — in one tool.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir color-system && cd color-system
ni index.html, palette.js -ItemType File
\`\`\`

#### Step 2 — A Brand-Color Generator
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OKLCH palette generator</title>
  <style>
    body { font-family: system-ui; padding: 2rem; }
    .palette { display: grid; grid-template-columns: repeat(10, 1fr); gap: 0; margin: 1em 0; }
    .swatch { aspect-ratio: 1; display: grid; place-items: center;
              font-family: monospace; font-size: 0.75em; text-align: center; padding: 0.5em; }
    .controls { display: flex; gap: 1em; align-items: center; }
    .controls input { font: inherit; }
    .audit { margin-top: 2em; }
    .pass { color: green; }
    .fail { color: crimson; font-weight: bold; }
  </style>
</head>
<body>
  <h1>OKLCH brand palette</h1>
  <div class="controls">
    <label>Brand hue (0-360):
      <input id="hue" type="range" min="0" max="360" value="260">
      <span id="hue-v">260</span></label>
    <label>Chroma (0-0.4):
      <input id="chroma" type="range" min="0" max="0.4" step="0.01" value="0.15">
      <span id="chroma-v">0.15</span></label>
  </div>

  <div id="palette" class="palette"></div>

  <h2>WCAG contrast audit</h2>
  <div id="audit" class="audit"></div>

  <script src="palette.js"></script>
</body>
</html>
\`\`\`

#### Step 3 — Palette Generation + WCAG Audit (\`palette.js\`)
\`\`\`javascript
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

// Map each step to an OKLCH lightness from very light (0.97) to very dark (0.20)
const stepLightness = {
  50: 0.97, 100: 0.93, 200: 0.86, 300: 0.78, 400: 0.68,
  500: 0.58, 600: 0.48, 700: 0.38, 800: 0.28, 900: 0.20,
};

const palEl   = document.getElementById('palette');
const auditEl = document.getElementById('audit');
const hueIn   = document.getElementById('hue');
const chrIn   = document.getElementById('chroma');

function buildPalette() {
  const hue = +hueIn.value, chroma = +chrIn.value;
  document.getElementById('hue-v').textContent    = hue;
  document.getElementById('chroma-v').textContent = chroma;

  palEl.innerHTML = '';
  for (const step of steps) {
    const L = stepLightness[step];
    const color = \`oklch(\${L} \${chroma} \${hue})\`;
    const sw = document.createElement('div');
    sw.className = 'swatch';
    sw.style.background = color;
    sw.style.color = L > 0.55 ? 'black' : 'white';
    sw.textContent = step + '\\n' + color;
    sw.dataset.lightness = L;
    palEl.appendChild(sw);
  }
  runAudit();
}

function relativeLuminance([r, g, b]) {
  // Standard sRGB → relative luminance per WCAG
  const channel = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(rgb1, rgb2) {
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  const [lo, hi] = l1 < l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function rgbFromSwatch(el) {
  // getComputedStyle returns "rgb(r, g, b)" even for OKLCH — browser gamut-maps for us
  const m = getComputedStyle(el).backgroundColor.match(/\\d+/g);
  return m.slice(0, 3).map(Number);
}

function runAudit() {
  const swatches = [...palEl.children];
  auditEl.innerHTML = '';
  for (const sw of swatches) {
    const bg   = rgbFromSwatch(sw);
    const text = sw.style.color === 'black' ? [0,0,0] : [255,255,255];
    const r    = contrastRatio(bg, text).toFixed(2);
    const ok   = r >= 4.5;          // WCAG AA for normal text
    const row  = document.createElement('div');
    row.innerHTML = \`<strong>step \${sw.textContent.split('\\n')[0]}</strong>:
                     contrast \${r}:1 against \${sw.style.color}
                     <span class="\${ok ? 'pass' : 'fail'}">\${ok ? '✓ AA' : '✗ FAIL'}</span>\`;
    auditEl.appendChild(row);
  }
}

hueIn.addEventListener('input', buildPalette);
chrIn.addEventListener('input', buildPalette);
buildPalette();
\`\`\`

#### Step 4 — Edge Cases: Wide-Gamut, Dark Mode, Reduced Transparency
\`\`\`html
<!-- Display-P3 wide-gamut red (more vivid on modern displays) -->
<div style="background: color(display-p3 1 0 0); height: 50px; margin: 1em 0;">P3 red</div>
<div style="background: #ff0000;                 height: 50px; margin: 1em 0;">sRGB red</div>

<!-- Side-by-side on a wide-gamut display: P3 is visibly more saturated -->

<!-- Dark mode: use CSS color-scheme for native dark form controls -->
<style>
  :root { color-scheme: light dark; }
  @media (prefers-color-scheme: dark) {
    body { background: oklch(0.18 0.02 260); color: oklch(0.92 0.02 260); }
  }
</style>

<!-- Accessibility: respect prefers-reduced-transparency -->
<style>
  .glass { background: rgb(255 255 255 / 0.5); backdrop-filter: blur(10px); }
  @media (prefers-reduced-transparency) {
    .glass { background: white; backdrop-filter: none; }
  }
</style>
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
// Verify perceptually-uniform spacing
const lights = [...palEl.children].map(el => +el.dataset.lightness);
const diffs = lights.slice(0, -1).map((l, i) => Math.abs(l - lights[i + 1]));
const max = Math.max(...diffs), min = Math.min(...diffs);
console.assert(max - min < 0.10,
  'OKLCH lightness steps should be approximately uniform');

// Verify WCAG contrast of brand color on white
const brand500 = palEl.children[5];  // step 500
const r = contrastRatio(rgbFromSwatch(brand500), [255,255,255]);
console.log('step-500 on white contrast:', r.toFixed(2));
console.assert(r >= 3.0, 'brand color on white should be at least 3:1 (large text AA)');
\`\`\`

**Expected Output:**
\`\`\`
- 10 swatches with smooth lightness gradient
- WCAG contrast ratios shown below each swatch
- Steps 600-900 pass AA against white text
- Steps 50-300 pass AA against black text
- Steps 400-500 may fail one or both — that's a real-world design constraint
- console.assert passes: lightness spacing is uniform
\`\`\`

**Stretch Challenges:**
- [ ] Add a "color-mix(in oklch, brand 50%, white)" demo for tinted variants
- [ ] Add an "out of P3 gamut" warning when chroma is too high for sRGB
- [ ] Add a CSV export of \`--brand-50\` through \`--brand-900\` CSS custom properties`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** Name 5 CSS color notations and one reason to use each.

**Q2:** What is the difference between \`hsl(0,100%,50%)\` and \`oklch(0.62 0.25 29)\`? Why might a designer prefer OKLCH for systematic palettes?

**Q3:** Write the CSS for a button that is brand-blue in light mode and lighter brand-blue in dark mode, using \`prefers-color-scheme\`.

---

### Day 3 — Comprehension

**Q4:** What is the minimum WCAG AA contrast ratio for normal-sized body text? For large text? Show 2 color pairs that pass each level.

**Q5:** Describe a real production bug caused by using \`hsl()\` for a button palette and discovering buttons look different brightnesses across hues.

**Q6:** Refactor this for wide-gamut and accessibility:
\`\`\`css
:root { --brand: #1a73e8; --brand-light: lighten(#1a73e8, 20%); }
.btn { background: var(--brand); color: white; }
\`\`\`

---

### Day 7 — Application

**Q7:** Build a 5-step semantic color system (success, warning, danger, info, neutral) with light and dark mode variants using only CSS custom properties + \`color-mix()\`.

**Q8:** A page passes Lighthouse but fails axe-core's color-contrast rule on every \`<a>\`. List 3 root causes and the CSS fix for each.

**Q9:** What is \`color-mix()\` and what 3 problems does it solve that CSS preprocessors used to handle?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "How do you build a design system color palette that's perceptually uniform and accessible?"

**Q11:** Draw the dependency graph: colors ↔ css-variables ↔ accessibility-html ↔ design-system.

**Q12:** ★ System design: "Design the color token architecture for a multi-brand SaaS where: each brand has its own primary hue; every component honours WCAG AA; light/dark/high-contrast modes work; tokens propagate to React, iOS, Android."`
  },

  // ── 6. display-and-positioning ───────────────────────────────────────────
  'display-and-positioning': {
    feynman: `## FEYNMAN CHECK

### Explain Display & Positioning Like I'm 10 Years Old
> Every HTML element lives in one of two parallel universes: the NORMAL FLOW universe (where boxes stack like books on a shelf — block boxes top-to-bottom, inline boxes left-to-right) and the POSITIONED universe (where boxes float above the page, ignoring their neighbours). \`display\` tells the box what KIND of citizen it is in the flow universe (block, inline, flex, grid). \`position\` tells the box whether it stays in the flow or escapes to the positioned universe (relative=still-in-flow-but-offset, absolute=out-of-flow-relative-to-nearest-positioned-ancestor, fixed=out-of-flow-relative-to-viewport, sticky=in-flow-until-scroll-threshold). This is why a dropdown menu that uses \`position: absolute\` without a positioned ancestor escapes ALL the way to the \`<body>\` — surprising and bug-inducing.

---

### 5 Deep Conceptual Questions

**Q1: What problem does the \`display\` property fundamentally solve?**
> **A:** It tells the layout engine which ALGORITHM to use for this element and its children. \`display: block\` invokes the block formatting context (stack vertically, fill width). \`display: flex\` invokes the flexbox algorithm (1D distribution). \`display: grid\` invokes the grid algorithm (2D placement). Without \`display\` the browser couldn't know whether to call the block layout or the table layout or the flex layout — each is a completely different algorithm with different cost characteristics.

**Q2: What is the mental model that makes positioning click?**
> **A:** Every positioned element creates a "containing block" for its absolutely-positioned descendants. When you write \`position: absolute; top: 10px\`, the browser walks UP the DOM looking for the nearest ancestor with \`position\` set to anything except \`static\` (the default). That ancestor's padding box becomes your coordinate origin. If no ancestor is positioned, you fall back to the initial containing block (the viewport).

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** That \`position: absolute\` is "absolute to the page" — actually absolute to the nearest positioned ancestor:
> \`\`\`css
> /* ❌ Tooltip escapes the card and lands on the body */
> .card { padding: 1rem; }           /* no position set! */
> .tooltip { position: absolute; top: 0; right: 0; }
>
> /* ✅ Anchor the tooltip to the card by making the card positioned */
> .card { padding: 1rem; position: relative; }
> .tooltip { position: absolute; top: 0; right: 0; }
> \`\`\`

**Q4: How does \`position: sticky\` interact with overflow at the runtime level?**
> **A:** Sticky elements toggle between \`relative\` and \`fixed\` based on scroll position WITHIN their nearest scrolling ancestor. If ANY ancestor has \`overflow: hidden\` (or \`auto\` or \`scroll\`), THAT becomes the sticky's scroll context — which is why \`position: sticky\` mysteriously fails when wrapped in an \`overflow: hidden\` parent: the parent IS the scroll container, but it has no scrollbar, so the sticky never activates.

**Q5: One-sentence FAANG-grade definition?**
> **A:** "\`display\` selects the layout algorithm and formatting context for an element's children, while \`position\` controls whether the element participates in normal flow or is taken out and placed relative to its containing block — and the combination determines which ancestor's box model and scroll context govern the element's final coordinates."`,
    build: `## BUILD

### 🏗️ Mini Project: Modal + Toast Stack With Correct Stacking Contexts

**What you will build:** A page with a modal dialog (\`position: fixed\` + backdrop), a toast notification stack (\`position: fixed; bottom: 1rem\`), and a sticky table header — all coexisting without z-index wars.
**Why this project:** Forces you to understand stacking contexts, containing blocks, and the \`position\` ↔ \`z-index\` relationship.
**Time estimate:** 35 minutes

---

#### Step 1 — Project Setup
\`\`\`bash
mkdir position-demo && cd position-demo
ni index.html, style.css, app.js -ItemType File
\`\`\`

#### Step 2 — HTML Skeleton
\`\`\`html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
  <header class="site-header">Site Header (fixed)</header>
  <main>
    <section class="card">
      <h2>Sticky Table</h2>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Name</th></tr></thead>
          <tbody id="rows"></tbody>
        </table>
      </div>
      <button id="open">Open modal</button>
      <button id="toast">Add toast</button>
    </section>
  </main>
  <div id="modal" class="modal" hidden>
    <div class="modal-backdrop"></div>
    <div class="modal-dialog">Hi, I'm a modal. <button id="close">Close</button></div>
  </div>
  <div id="toasts" class="toast-stack"></div>
  <script src="app.js"></script>
</body>
</html>
\`\`\`

#### Step 3 — Positioning CSS
\`\`\`css
body { margin: 0; font: 16px system-ui; }
.site-header { position: fixed; top: 0; left: 0; right: 0; height: 50px;
  background: #222; color: white; z-index: 10; display: grid; place-items: center; }
main { margin-top: 70px; padding: 1rem; }
.card { position: relative; border: 1px solid #ddd; padding: 1rem; max-height: 300px; overflow: auto; }
.table-wrap { max-height: 200px; overflow: auto; }
thead th { position: sticky; top: 0; background: #f5f5f5; }
.modal { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; }
.modal-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
.modal-dialog { position: relative; background: white; padding: 2rem; border-radius: 8px; }
.toast-stack { position: fixed; bottom: 1rem; right: 1rem; z-index: 200; display: grid; gap: 0.5rem; }
.toast { background: #2a9d8f; color: white; padding: 0.5rem 1rem; border-radius: 4px; }
\`\`\`

#### Step 4 — Error Handling: Restore Body Scroll & Focus Trap
\`\`\`javascript
const modal = document.getElementById('modal');
const opener = document.getElementById('open');
const closer = document.getElementById('close');
let lastFocus = null;

opener.onclick = () => {
  lastFocus = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';   // prevent background scroll
  closer.focus();                            // focus trap entry
};
closer.onclick = () => {
  modal.hidden = true;
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();          // restore focus
};
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closer.click(); });
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
// Populate the table so sticky header is visible
for (let i=1;i<=50;i++) document.getElementById('rows').insertAdjacentHTML('beforeend',
  \`<tr><td>\${i}</td><td>User \${i}</td></tr>\`);

document.getElementById('toast').onclick = () => {
  const t = document.createElement('div'); t.className='toast'; t.textContent='Saved!';
  document.getElementById('toasts').appendChild(t);
  setTimeout(() => t.remove(), 3000);
};
\`\`\`

**Expected Output:**
\`\`\`
- Header stays at top while scrolling
- Table header sticks within its scroll container, not the page
- Modal centers over the viewport even when page is scrolled
- Toasts stack bottom-right, above the modal backdrop (z:200 > z:100)
- Escape key closes modal and restores focus to the "Open modal" button
\`\`\`

**Stretch Challenges:**
- [ ] Implement a full focus trap so Tab cycles inside the modal
- [ ] Add CSS containment to the table to prevent layout invalidation propagation
- [ ] Replace z-index numbers with CSS custom properties (\`--z-modal\`) for maintainability`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Name the five values of the \`position\` property. Which one is the default? Which two are out-of-flow?
**Q2:** What does \`display: inline-block\` give you that neither \`inline\` nor \`block\` alone provides?
**Q3:** Write the 4 lines of CSS to center a fixed-size box in the viewport using \`position\`. From memory.

### Day 3 — Comprehension
**Q4:** When does \`position: sticky\` silently fail? Name two causes.
**Q5:** Describe a production bug where a \`position: absolute\` element escaped its parent. Show the broken CSS and the fix.
**Q6:** Refactor for clarity:
\`\`\`css
.dropdown { position: absolute; top: 100%; z-index: 999; }
.dropdown-parent { /* no position set */ }
\`\`\`

### Day 7 — Application
**Q7:** Build a sticky sidebar that scrolls until the footer, then stops above it. No JavaScript.
**Q8:** A PR adds \`overflow: hidden\` to a parent and now the child's \`position: sticky\` no longer sticks. Diagnose.
**Q9:** What is the cost of \`position: fixed\` on a heavily-scrolled page? When does it trigger compositor promotion?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain how stacking contexts are created and why z-index sometimes 'doesn't work.'"
**Q11:** Draw: display ↔ position ↔ flexbox ↔ grid — which subsumes which?
**Q12:** ★ System design: "Design the z-index architecture for a complex SaaS dashboard with modals, popovers, tooltips, and toasts."`
  },

  // ── 7. flexbox ───────────────────────────────────────────────────────────
  'flexbox': {
    feynman: `## FEYNMAN CHECK

### Explain Flexbox Like I'm 10 Years Old
> Flexbox is a CONVEYOR BELT for a row (or column) of items. You pick the direction (\`flex-direction\`), then for any leftover space you tell the conveyor how to distribute it: \`justify-content\` controls spacing along the belt, \`align-items\` controls position perpendicular to it. Each item can declare "I want to grow into free space" (\`flex-grow\`), "I'll shrink if we run out of space" (\`flex-shrink\`), or "this is my preferred starting size" (\`flex-basis\`). The non-obvious magic: \`flex: 1 1 0\` makes items split the container EQUALLY regardless of content, while \`flex: 1 1 auto\` makes them split PROPORTIONAL to content size — one tiny difference, totally different visual result.

---

### 5 Deep Conceptual Questions

**Q1: What problem did Flexbox solve that floats and inline-block couldn't?**
> **A:** Vertical centering, equal-height columns, and reordering of items without changing the HTML — all without hacks like negative margins, ghost elements, or the \`vertical-align: middle\` + \`display: table-cell\` trick. Pre-Flexbox, "center a div vertically" was the canonical CSS interview question because there was no clean answer. Flexbox also introduced the concept of "main axis" vs "cross axis," letting you swap layout direction with a single property change.

**Q2: What mental model makes Flexbox click?**
> **A:** Flexbox is 1-DIMENSIONAL. You pick an axis (\`row\` or \`column\`), and everything else describes "along this axis" (justify) or "perpendicular" (align). \`flex-grow\` distributes FREE space (after content fits); \`flex-shrink\` distributes OVERFLOW (when content doesn't fit). \`flex-basis\` is the starting size BEFORE growing or shrinking is applied. The shorthand \`flex: 1\` expands to \`flex: 1 1 0\` — basis zero means "ignore my content size, just split equally."

**Q3: Most dangerous misconception? Show with code.**
> **A:** Thinking \`flex: 1\` and \`flex: auto\` are the same:
> \`\`\`css
> /* ❌ "I want equal columns" — but they're proportional to content */
> .col { flex: auto; }   /* = flex: 1 1 auto — basis = content size */
>
> /* ✅ Truly equal columns regardless of content */
> .col { flex: 1; }      /* = flex: 1 1 0 — basis = 0, then grow equally */
> \`\`\`

**Q4: How does Flexbox interact with \`min-width: auto\` at the runtime level?**
> **A:** Every flex item has an IMPLICIT \`min-width: auto\` that prevents shrinking below its content's intrinsic minimum size — which is why a flex item containing a long unbreakable word can blow out the container even when \`flex-shrink: 1\`. The fix is explicit \`min-width: 0\` (or \`overflow: hidden\`), which is the #1 production bug with Flexbox + text content.

**Q5: One-sentence FAANG-grade definition?**
> **A:** "Flexbox is a 1-dimensional layout algorithm that distributes free space and overflow along a main axis among its children using a three-part declaration (grow / shrink / basis), governed by a containing flex formatting context with implicit \`min-content\` constraints that make \`min-width: 0\` a frequent escape hatch."`,
    build: `## BUILD

### 🏗️ Mini Project: Responsive Navbar With Logo, Links, Search, and Mobile Toggle

**What you will build:** A real production-pattern navbar: logo pinned left, links centered, search + avatar pinned right, collapsing to a hamburger menu under 768px.
**Why this project:** Forces you to use \`justify-content\`, \`flex-grow\`, \`gap\`, \`flex-wrap\`, and a media-query swap of \`flex-direction\`.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir flex-navbar && cd flex-navbar
ni index.html, style.css -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
  <nav class="nav">
    <a href="/" class="logo">⚡ DevMastery</a>
    <button class="hamburger" aria-expanded="false">☰</button>
    <ul class="links">
      <li><a href="#">Docs</a></li>
      <li><a href="#">Pricing</a></li>
      <li><a href="#">Blog</a></li>
    </ul>
    <div class="actions">
      <input type="search" placeholder="Search...">
      <img class="avatar" src="https://i.pravatar.cc/32" alt="User">
    </div>
  </nav>
</body></html>
\`\`\`

#### Step 3 — Flexbox CSS
\`\`\`css
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font: 16px system-ui; }

.nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #1a1a2e;
  color: white;
  flex-wrap: wrap;
}
.logo { font-weight: bold; color: white; text-decoration: none; }
.links {
  display: flex; gap: 1.25rem; list-style: none; margin: 0; padding: 0;
  flex: 1;                   /* takes the leftover space */
  justify-content: center;
}
.links a { color: white; text-decoration: none; }
.actions { display: flex; align-items: center; gap: 0.75rem; }
.actions input { padding: 0.4em 0.6em; border-radius: 4px; border: 0; min-width: 0; }
.avatar { width: 32px; height: 32px; border-radius: 50%; }
.hamburger { display: none; background: none; border: 0; color: white; font-size: 1.5rem; }
\`\`\`

#### Step 4 — Error Handling: Mobile Collapse + Long-Word Safety
\`\`\`css
@media (max-width: 768px) {
  .hamburger { display: block; }
  .links { display: none; flex-basis: 100%; flex-direction: column; }
  .nav[data-open="true"] .links { display: flex; }
  .actions input { width: 100%; }
}
/* The classic Flexbox text-overflow fix */
.logo, .links a { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
\`\`\`

#### Step 5 — Tests (manual + scriptable)
\`\`\`javascript
const nav = document.querySelector('.nav');
document.querySelector('.hamburger').onclick = (e) => {
  const open = nav.dataset.open === 'true';
  nav.dataset.open = String(!open);
  e.currentTarget.setAttribute('aria-expanded', String(!open));
};

// Smoke test: at 1024px width all rows visible; at 600px hamburger appears
console.assert(getComputedStyle(document.querySelector('.hamburger')).display !== 'none' ||
  window.innerWidth > 768, 'Hamburger should show under 768px');
\`\`\`

**Expected Output:**
\`\`\`
Desktop (>768px): logo | centered links | search + avatar
Mobile (<768px):  logo | hamburger      | (links hidden until toggle)
\`\`\`

**Stretch:**
- [ ] Add \`flex-wrap\` with a "more" overflow menu for very narrow viewports
- [ ] Animate the link expansion using \`grid-template-rows\` 0fr → 1fr
- [ ] Replace media query with container queries`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does \`flex: 1\` expand to? What does each of the three numbers mean?
**Q2:** Name the two axes in flexbox. Which property controls spacing along each?
**Q3:** Write 5 lines of CSS to make 3 columns of equal width with 1rem gap. From memory.

### Day 3 — Comprehension
**Q4:** Difference between \`flex: 1 1 0\` and \`flex: 1 1 auto\`? Give a screenshot-able example.
**Q5:** A flex item with a long URL is blowing out the container. Diagnose and fix.
**Q6:** Refactor:
\`\`\`css
.row { display: flex; }
.col1 { width: 200px; }
.col2 { flex: 1; }
.col3 { width: 100px; }
/* On mobile, .col3 should appear first */
\`\`\`

### Day 7 — Application
**Q7:** Build a chat bubble layout: avatar left, name+message stack, timestamp right-aligned to the bubble.
**Q8:** A PR uses \`margin: auto\` on a flex item — what does that do? When is it cleaner than \`justify-content\`?
**Q9:** What is the cost of \`flex-wrap\` on a row of 10,000 items?

### Day 14 — Synthesis
**Q10:** ★ Interview: "When do you use Flexbox vs Grid?"
**Q11:** Draw: how do flex-grow, flex-shrink, and flex-basis interact during the flexible-length resolution algorithm?
**Q12:** ★ System design: "Design the layout primitives for a component library that supports RTL languages, fluid typography, and intrinsic sizing."`
  },

  // ── 8. css-grid ──────────────────────────────────────────────────────────
  'css-grid': {
    feynman: `## FEYNMAN CHECK

### Explain CSS Grid Like I'm 10 Years Old
> Grid is a CHESSBOARD you paint onto a container. You define columns (\`grid-template-columns: 200px 1fr 200px\`) and rows, then items can occupy ONE square or SPAN multiple squares using \`grid-column: 1 / 3\` (start line 1, end line 3). Flexbox is 1D — items flow in a single direction. Grid is 2D — items can sit anywhere on the board, even overlapping. The magical \`fr\` unit means "one fraction of leftover space," so \`1fr 1fr\` = two equal columns. \`auto-fit\` + \`minmax(200px, 1fr)\` builds responsive grids without ANY media queries.

---

### 5 Deep Conceptual Questions

**Q1: Why was Grid needed when Flexbox existed?**
> **A:** Flexbox handles 1D distribution beautifully — but for true 2D layouts (rows AND columns simultaneously aligned to a shared structure, like a dashboard), Flexbox forces you to nest containers and the columns of row A don't align with row B. Grid lets the entire page share one coordinate system. It also introduced \`fr\` (fraction unit), \`minmax()\`, \`auto-fill\` / \`auto-fit\`, and named template areas — none of which Flexbox has.

**Q2: Mental model that unlocks Grid?**
> **A:** A grid is a set of LINES, not cells. Numbering starts at line 1 (left/top edge). \`grid-column: 2 / 4\` means "start at line 2, end at line 4" — occupying cells between lines 2 and 4 (two cells wide). Negative numbers count from the end. Once you see lines, not cells, \`span 2\` and \`-1\` (last line) make instant sense.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Confusing \`auto-fill\` with \`auto-fit\`:
> \`\`\`css
> /* auto-fill: creates empty columns to fill the row */
> grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
> /* If only 2 items but space for 5 → 2 items + 3 empty 200px slots */
>
> /* auto-fit: collapses empty tracks and lets items grow */
> grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
> /* 2 items + space for 5 → 2 items each take 50% of the row */
> \`\`\`

**Q4: How does Grid interact with intrinsic sizing at the runtime level?**
> **A:** Grid resolves tracks in three passes: (1) base sizes from min-content of items, (2) growth limits from max-content, (3) stretching to fill the container. \`min-content\` = smallest size an item can shrink to (longest unbreakable word). \`fr\` units only distribute LEFTOVER space after fixed and content-sized tracks resolve. This is why \`minmax(0, 1fr)\` is the production trick: it forces tracks to ignore content overflow and obey the fr distribution exactly.

**Q5: FAANG-grade one-liner?**
> **A:** "CSS Grid is a 2-dimensional layout algorithm that defines explicit and implicit tracks along two axes, resolved through a three-pass intrinsic sizing algorithm, with items placed via line-based or area-based coordinates — enabling layout decoupling between source order and visual order, which is why screen-reader DOM order can diverge dangerously from visual order."`,
    build: `## BUILD

### 🏗️ Mini Project: Dashboard With Sidebar + Header + Main + Aside + Footer

**What you will build:** The classic dashboard "holy grail" layout using named template areas, responsive down to mobile via a single media query that rewrites the areas.
**Why this project:** Forces named lines, template areas, \`auto\`-rows, and responsive grid restructuring.
**Time estimate:** 35 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir grid-dashboard && cd grid-dashboard
ni index.html, style.css -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
  <div class="app">
    <header class="head">Header</header>
    <nav class="side">Sidebar</nav>
    <main class="main">Main content</main>
    <aside class="aside">Right rail</aside>
    <footer class="foot">Footer</footer>
  </div>
</body></html>
\`\`\`

#### Step 3 — Grid CSS
\`\`\`css
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font: 16px system-ui; }

.app {
  display: grid;
  min-height: 100vh;
  grid-template-columns: 220px 1fr 280px;
  grid-template-rows: 60px 1fr 40px;
  grid-template-areas:
    "head head  head"
    "side main  aside"
    "foot foot  foot";
}
.head  { grid-area: head;  background: #1a1a2e; color: white; padding: 1rem; }
.side  { grid-area: side;  background: #f0f0f5; padding: 1rem; }
.main  { grid-area: main;  padding: 1rem; }
.aside { grid-area: aside; background: #f5f5f0; padding: 1rem; }
.foot  { grid-area: foot;  background: #1a1a2e; color: white; padding: 0.5rem 1rem; }
\`\`\`

#### Step 4 — Error Handling: Responsive Mobile Stack
\`\`\`css
@media (max-width: 768px) {
  .app {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr auto auto;
    grid-template-areas:
      "head"
      "side"
      "main"
      "aside"
      "foot";
  }
}
/* Prevent fr tracks from being inflated by long unbreakable content */
.main, .aside, .side { min-width: 0; overflow: auto; }
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
const app = document.querySelector('.app');
const styles = getComputedStyle(app);
console.assert(styles.display === 'grid', 'Should be a grid');
console.log('Template areas:', styles.gridTemplateAreas);
// Visual: resize browser to 600px width — layout collapses to single column
\`\`\`

**Expected Output:**
\`\`\`
Desktop (>768px): full 3-column dashboard with header/footer spanning all columns
Mobile (<768px):  single column stacking head → side → main → aside → foot
Sidebar widths fixed (220px / 280px); main column flexes
\`\`\`

**Stretch:**
- [ ] Add subgrid for cards inside .main that align to the parent grid lines
- [ ] Use \`grid-auto-flow: dense\` to pack cards of different sizes
- [ ] Replace media query with container queries for sidebar-aware layout`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is the \`fr\` unit? What does it distribute?
**Q2:** Write the 4-line CSS for a responsive grid with min column width 200px that fills the row. From memory.
**Q3:** Difference between \`grid-template-columns\` and \`grid-auto-columns\`?

### Day 3 — Comprehension
**Q4:** \`auto-fill\` vs \`auto-fit\` — visual difference with 2 items and 5 column slots?
**Q5:** Bug: my grid items are wider than their tracks. Diagnose and explain the \`minmax(0, 1fr)\` fix.
**Q6:** Refactor this 3-column layout to use named template areas:
\`\`\`css
.layout { display: grid; grid-template-columns: 200px 1fr 200px; }
.layout > nav { grid-column: 1; }
.layout > main { grid-column: 2; }
.layout > aside { grid-column: 3; }
\`\`\`

### Day 7 — Application
**Q7:** Build a Pinterest-style masonry layout using \`grid-auto-flow: dense\` and varied row spans.
**Q8:** A PR sets \`grid-template-columns: 1fr 1fr 1fr\` but one column has a huge image — what breaks? What is the fix?
**Q9:** When would you reach for subgrid? What problem does it solve that nested grids do not?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through how to choose between Flexbox and CSS Grid for a given UI."
**Q11:** Draw: how do explicit tracks, implicit tracks, and \`grid-auto-flow\` interact?
**Q12:** ★ System design: "Design a layout system for a CMS where editors define page templates by dragging grid areas — generating CSS at build time."`
  },

  // ── 9. float-and-clear ───────────────────────────────────────────────────
  'float-and-clear': {
    feynman: `## FEYNMAN CHECK

### Explain Float & Clear Like I'm 10 Years Old
> Float was CSS's original way to make text WRAP AROUND an image — like a magazine layout. The image is pulled to the left or right edge, and text flows around it. \`clear\` says "I refuse to sit next to anything floating — push me below it." Floats were so good at this that developers ABUSED them for full-page layouts (pre-2015) by floating columns left and clearing footers. Today, Grid/Flexbox killed float-for-layout, but float lives on for its ORIGINAL purpose: text wrapping. The non-obvious bug: a floated element's parent COLLAPSES (height: 0) because floats are out-of-flow — the famous "clearfix" hack exists solely to fix this.

---

### 5 Deep Conceptual Questions

**Q1: What problem did float originally solve?**
> **A:** Text wrapping around images, exactly like print magazines do. Before float (and before CSS at all), HTML had \`<img align="left">\` which was deprecated. Float gave CSS a way to take an element out of normal flow but still let inline content (text) flow around it on the opposite side. This is STILL its best modern use case — for layout, Grid is superior.

**Q2: Mental model for float?**
> **A:** A floated element is REMOVED from normal flow for block-level purposes (its parent doesn't see it for height calculation) but it STAYS in flow for inline content (text wraps around it). This dual nature is why \`overflow: auto\` on the parent "fixes" collapse — \`overflow\` triggers a "block formatting context" which DOES count floated children.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing parents need \`clearfix\` for layout — actually they need it only when YOU want the parent to contain the float visually:
> \`\`\`css
> /* ❌ Parent has zero height because both children float */
> .row { background: gray; }
> .row > div { float: left; width: 50%; }
>
> /* ✅ Modern fix: use a block formatting context */
> .row { background: gray; display: flow-root; }   /* preferred */
> /* OR */
> .row::after { content: ""; display: table; clear: both; }   /* clearfix legacy */
> \`\`\`

**Q4: How does float interact with block formatting contexts at the runtime level?**
> **A:** A BFC is a region where block-level boxes are laid out, floats interact, and margins collapse. Triggering a BFC on a parent (\`overflow: auto\`, \`display: flow-root\`, \`display: flex\`, \`display: grid\`) makes it CONTAIN floated children. This is why putting \`overflow: hidden\` on a wrapper "magically" fixes the collapse bug — it's not the overflow doing the work, it's the implicit BFC creation.

**Q5: FAANG-grade definition?**
> **A:** "A floated element is removed from block formatting context flow but remains in inline formatting context flow on the opposite side, causing inline content to wrap around it and its parent to require a containing block formatting context (via \`display: flow-root\`, an overflow value other than visible, or the clearfix hack) to include the float in its height calculation."`,
    build: `## BUILD

### 🏗️ Mini Project: Magazine Article With Drop-Cap and Pull-Quote (Float's Real Use Case)

**What you will build:** A blog article where the first letter is a drop-cap (float: left), a pull-quote sits floated right inside a paragraph, and text wraps naturally around both — exactly like a print magazine.
**Why this project:** Forces you to use float for the thing it was DESIGNED for (text wrapping) rather than the thing it was abused for (full layouts).
**Time estimate:** 20 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir float-magazine && cd float-magazine
ni article.html, style.css -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
<article>
  <h1>The History of Float</h1>
  <p><span class="drop-cap">F</span>loat was introduced in CSS 1 for one purpose: wrapping
     text around images, just as print magazines have done for centuries.
     <aside class="pull-quote">"Float was abused for layout — but its original
     purpose was always inline media flow."</aside>
     Developers later abused it for full-page layouts because no real layout system
     existed yet. With Grid and Flexbox now mature, float can finally return to
     its proper job: making editorial content beautiful again.</p>
  <p>The drop-cap to your left is a single character with \`float: left\`. The
     pull-quote on your right is an \`<aside>\` with \`float: right\`. Both are
     out of normal block flow, yet the body text wraps around them.</p>
</article>
</body></html>
\`\`\`

#### Step 3 — CSS
\`\`\`css
body { font: 18px/1.6 Georgia, serif; max-width: 640px; margin: 2rem auto; padding: 0 1rem; }
article { display: flow-root; }   /* contains the floats */
.drop-cap {
  float: left;
  font-size: 4em;
  line-height: 0.9;
  padding-right: 0.1em;
  font-weight: bold;
  color: #8b3a3a;
}
.pull-quote {
  float: right;
  width: 40%;
  margin: 0.3em 0 0.5em 1em;
  padding: 0.5em 1em;
  border-left: 4px solid #8b3a3a;
  font-style: italic;
  font-size: 1.1em;
  color: #555;
}
\`\`\`

#### Step 4 — Error Handling: Mobile Safety
\`\`\`css
@media (max-width: 480px) {
  .pull-quote {
    float: none;
    width: auto;
    margin: 1em 0;
    border-left-width: 6px;
  }
}
\`\`\`

#### Step 5 — Tests (visual)
\`\`\`javascript
// Verify the article contains its floats (no collapse)
const art = document.querySelector('article');
console.assert(art.offsetHeight > 0, 'Article should have non-zero height');
console.log('Article height:', art.offsetHeight, 'px');
\`\`\`

**Expected Output:**
\`\`\`
- Large red "F" drop-cap on the left of paragraph 1
- Italicised pull-quote floats right inside the same paragraph
- Body text wraps cleanly around both
- On mobile, pull-quote becomes a full-width block
\`\`\`

**Stretch:**
- [ ] Add \`shape-outside: circle()\` to wrap text around a curved drop-cap shape
- [ ] Replace \`display: flow-root\` with the legacy clearfix and compare
- [ ] Convert the layout to use CSS \`initial-letter\` (currently Safari-only)`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What are the three valid values of \`float\`? What about \`clear\`?
**Q2:** Why does a parent of only-floated children collapse to zero height?
**Q3:** Write the modern (non-hack) way to make a parent contain its floats. From memory.

### Day 3 — Comprehension
**Q4:** Name three ways to trigger a block formatting context. Why does each fix the float-collapse bug?
**Q5:** When should you still reach for \`float\` in 2026?
**Q6:** Refactor this legacy layout to Flexbox:
\`\`\`css
.col-left { float: left; width: 30%; }
.col-right { float: right; width: 65%; }
.clearfix::after { content: ""; display: table; clear: both; }
\`\`\`

### Day 7 — Application
**Q7:** Build a magazine article with a sidebar that floats right and disappears on mobile.
**Q8:** A PR uses \`float: left\` for a navbar — explain why this is wrong in 2026 and what to use instead.
**Q9:** What does \`shape-outside\` add to float, and what is its performance cost?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every way to contain a float, ordered from worst to best practice."
**Q11:** Draw: how do float, BFC, and clear interact in normal flow?
**Q12:** ★ System design: "A CMS lets editors insert inline images that wrap text. Design the float + max-width + responsive collapse rules so it never breaks the article layout."`
  },

  // ── 10. responsive-design ────────────────────────────────────────────────
  'responsive-design': {
    feynman: `## FEYNMAN CHECK

### Explain Responsive Design Like I'm 10 Years Old
> Responsive design = your page is a LIQUID, not a poster. It pours into any container (phone, tablet, desktop, watch, fridge) and reshapes itself to fit. The three pillars: (1) FLUID grids — use \`%\`, \`fr\`, \`flex\`, never fixed \`px\` widths for layout; (2) FLEXIBLE images — \`max-width: 100%\` so images shrink with their parent; (3) MEDIA QUERIES — checkpoints where the layout fundamentally restructures (sidebar moves under main content, navigation collapses to a hamburger). Modern addition: CONTAINER QUERIES — a component reshapes based on its OWN size, not the viewport, so a card looks correct whether you put it in a sidebar or a hero.

---

### 5 Deep Conceptual Questions

**Q1: What problem did responsive design solve?**
> **A:** Before 2010, sites built for 1024×768 desktops looked broken on phones. The fix was "m-dot" sites (m.example.com) — separate codebases, double maintenance, broken SEO. Responsive (Ethan Marcotte, 2010) said: one HTML, one CSS, fluid layout — let the browser adapt. Media queries gave breakpoints; later, viewport meta (\`<meta name="viewport" content="width=device-width">\`) made mobile browsers actually use the CSS pixel width instead of pretending to be 980px wide.

**Q2: Mental model that makes responsive design click?**
> **A:** Think MOBILE FIRST. Start with the smallest viable layout (single column, stacked, no sidebar). Add complexity ONLY behind \`min-width\` media queries. This guarantees your CSS cascade is additive — you never have to UNDO desktop styles for mobile, which is the #1 source of CSS bloat.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Confusing CSS pixels with device pixels — and forgetting the viewport meta:
> \`\`\`html
> <!-- ❌ Missing viewport meta — iPhone renders at 980px wide and zooms out -->
> <head>
>   <title>My site</title>
> </head>
>
> <!-- ✅ Use device-width so 1 CSS px = 1 reference px regardless of DPR -->
> <head>
>   <meta name="viewport" content="width=device-width, initial-scale=1">
>   <title>My site</title>
> </head>
> \`\`\`

**Q4: How do container queries differ from media queries at the runtime level?**
> **A:** Media queries evaluate against the VIEWPORT — one global signal for the whole page. Container queries evaluate against a nearest CONTAINMENT context (\`container-type: inline-size\`) — a per-element signal. This means a card component placed in a 300px sidebar gets a different layout than the same card in a 900px hero, with no JS, no resize observers, no global breakpoints. Cost: the browser must run an extra layout pass per container, which is why container queries opt-in via \`container-type\`.

**Q5: FAANG-grade definition?**
> **A:** "Responsive design is a layered approach combining fluid intrinsic sizing (percentages, fr, flex, clamp), media-query breakpoints driven by content needs rather than device sizes, and increasingly container queries scoped to component-level containment contexts — producing a single CSS payload that adapts across the full range of viewports and embedding contexts."`,
    build: `## BUILD

### 🏗️ Mini Project: Card Grid That Adapts to Viewport AND Container

**What you will build:** A grid of product cards that responds to the viewport (1 / 2 / 3 / 4 columns) AND to its container — the same card in a 300px sidebar renders compact, the same card in a 900px main area renders wide.
**Why this project:** Forces real-world media queries + container queries + intrinsic sizing all together.
**Time estimate:** 40 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir responsive-cards && cd responsive-cards
ni index.html, style.css -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="page">
    <aside class="sidebar">
      <div class="card">
        <img src="https://picsum.photos/400/300" alt="">
        <h3>Compact in sidebar</h3>
        <p>This card adapts to its container, not the viewport.</p>
      </div>
    </aside>
    <main class="main">
      <div class="grid">
        ${'<div class="card"><img src="https://picsum.photos/400/300" alt=""><h3>Card</h3><p>Sample text…</p></div>'.repeat(6)}
      </div>
    </main>
  </div>
</body></html>
\`\`\`

#### Step 3 — CSS (fluid + media + container)
\`\`\`css
*, *::before, *::after { box-sizing: border-box; }
html { font-size: clamp(14px, 1vw + 12px, 18px); }  /* fluid type */
body { margin: 0; font-family: system-ui; }

.page { display: grid; grid-template-columns: 1fr; gap: 1rem; padding: 1rem; }
@media (min-width: 900px) { .page { grid-template-columns: 280px 1fr; } }

.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

/* Container query: a card adapts to its OWN container */
.card { container-type: inline-size; border: 1px solid #ddd; border-radius: 8px;
        overflow: hidden; background: white; }
.card img { max-width: 100%; height: auto; display: block; }
.card h3, .card p { padding: 0 1rem; }
.card h3 { margin: 0.75rem 0 0.25rem; }

@container (min-width: 320px) {
  .card { display: grid; grid-template-columns: 120px 1fr; }
  .card img { height: 100%; object-fit: cover; }
  .card h3, .card p { padding: 0.75rem 1rem 0.75rem 0; }
}
\`\`\`

#### Step 4 — Error Handling: Image Width Safety
\`\`\`css
img { max-width: 100%; height: auto; }   /* never overflow */
.card p { hyphens: auto; overflow-wrap: anywhere; }   /* long words don't blow out */
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
const card = document.querySelector('.sidebar .card');
const grid = document.querySelector('.grid .card');
console.log('Sidebar card width:', card.offsetWidth);
console.log('Grid card width:',    grid.offsetWidth);
console.log('Same component — different shape based on container.');
\`\`\`

**Expected Output:**
\`\`\`
- < 900px: single-column page, grid auto-fits 1-2 columns
- ≥ 900px: 280px sidebar + main with multi-column grid
- Sidebar card (≈260px) → narrow stacked card with image on top
- Grid card (≥320px)   → horizontal layout, image on left
- Font size scales from 14px → 18px across 320→1920px
\`\`\`

**Stretch:**
- [ ] Add \`prefers-color-scheme: dark\` for dark mode
- [ ] Add \`prefers-reduced-motion\` to disable hover transforms
- [ ] Add a third breakpoint for ultra-wide (≥1600px) showing a 4-column grid`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Name the three pillars of responsive design coined by Ethan Marcotte in 2010.
**Q2:** Why is the viewport meta tag necessary? What happens without it on iPhone?
**Q3:** Write the 1 line of CSS that makes ALL images responsive by default. From memory.

### Day 3 — Comprehension
**Q4:** Difference between media queries and container queries? Give one use case each.
**Q5:** Bug: my mobile layout is broken because I wrote \`max-width: 768px\` queries instead of \`min-width\`. Explain why mobile-first is better.
**Q6:** Refactor this to fluid typography using \`clamp()\`:
\`\`\`css
h1 { font-size: 32px; }
@media (min-width: 768px) { h1 { font-size: 48px; } }
@media (min-width: 1200px) { h1 { font-size: 64px; } }
\`\`\`

### Day 7 — Application
**Q7:** Build a navigation that is a bottom-tab-bar on mobile and a left-rail on desktop. No JS.
**Q8:** A PR uses \`100vh\` for full-screen sections — what breaks on iOS Safari? What is the modern fix?
**Q9:** Performance cost of container queries vs media queries? When does container-query overhead matter?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Design the breakpoints for a complex product. How do you choose values?"
**Q11:** Draw: how do viewport, container, and \`clamp()\` interact to produce a fluid layout?
**Q12:** ★ System design: "Design the responsive strategy for a multi-tenant SaaS where embedded widgets render inside customers' websites at unknown sizes — no \`window.innerWidth\` reliable."`
  },

  // ── 11. typography ───────────────────────────────────────────────────────
  'typography': {
    feynman: `## FEYNMAN CHECK

### Explain Typography Like I'm 10 Years Old
> Typography is the SCIENCE of making letters readable on a screen. Browsers don't just "show text" — they measure font metrics (cap-height, x-height, ascender, descender, line-gap), break lines using a complex algorithm (Knuth-Plass on advanced engines), apply kerning pairs from the font file, and pick the best font from your \`font-family\` cascade if the first is unavailable. The non-obvious detail: \`line-height: 1.5\` doesn't mean "1.5 lines tall" — it means 1.5 × the font-size, and the EXTRA space is split equally above and below each line (the "leading"). This is why mixing fonts of different x-heights on one line creates uneven gaps.

---

### 5 Deep Conceptual Questions

**Q1: What problem does CSS typography solve that HTML alone couldn't?**
> **A:** HTML provides semantic structure (\`<h1>\`, \`<p>\`, \`<em>\`) but no control over the typeface, size, weight, spacing, or rendering. Pre-CSS, the browser picked a default and you got Times New Roman. CSS gave designers control over font-family, font-size, line-height, letter-spacing, and modern features like \`font-feature-settings\` (ligatures, alternates), \`font-variation-settings\` (variable fonts), and \`text-rendering\` (geometricPrecision vs optimizeLegibility).

**Q2: Mental model that unlocks typography?**
> **A:** Type is a SYSTEM, not individual choices. Define a modular scale (1.25× ratio: 16 → 20 → 25 → 31 → 39) and a rhythm (line-height as a multiple of base size). Body text wants 45-75 characters per line. Line-height should DECREASE as font-size INCREASES (headlines tight, body loose). Letter-spacing should INCREASE on uppercase and tiny text. Every typographic decision should reference back to the base unit.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Using \`em\` for font-size deep in the tree (compounding):
> \`\`\`css
> /* ❌ Each nested .small compounds: 0.8 × 0.8 × 0.8 = 0.512 */
> .small { font-size: 0.8em; }
> /* <p class="small"><span class="small"><span class="small">tiny</span></span></p> */
>
> /* ✅ Use rem to anchor to root */
> .small { font-size: 0.8rem; }   /* always 0.8 of root */
> \`\`\`

**Q4: How does \`font-display\` interact with the browser's font loading at runtime?**
> **A:** When a \`@font-face\` rule references a remote font, the browser must download it. \`font-display: block\` (default-ish) waits up to 3s showing INVISIBLE text (FOIT — Flash of Invisible Text), then falls back. \`swap\` shows fallback IMMEDIATELY then swaps when loaded (FOUT — Flash of Unstyled Text). \`optional\` gives the font 100ms; if not ready, fallback wins permanently for that page-load. The choice affects Largest Contentful Paint significantly — \`swap\` is generally best for body, \`optional\` for non-critical fonts.

**Q5: FAANG-grade definition?**
> **A:** "CSS typography is the API surface for the browser's text-rendering pipeline — font-family resolution against the local font cache and @font-face declarations, font-feature-settings forwarded to HarfBuzz for OpenType shaping, line-breaking via the platform's Unicode line-break algorithm, and metric-based line box construction governed by font-metrics-override and ascent/descent properties — directly influencing Cumulative Layout Shift and Largest Contentful Paint."`,
    build: `## BUILD

### 🏗️ Mini Project: Typographic System With Modular Scale, Fluid Type, and Font Loading

**What you will build:** A landing page using a modular type scale, fluid sizing via \`clamp()\`, self-hosted variable fonts with \`font-display: swap\`, and \`size-adjust\` to prevent CLS.
**Why this project:** Forces real production typography: modular scale, variable fonts, layout-shift prevention.
**Time estimate:** 40 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir typo-system && cd typo-system
ni index.html, style.css -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="style.css">
<link rel="preload" as="font" type="font/woff2"
  href="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2" crossorigin>
</head>
<body>
  <article>
    <h1>The Modular Scale</h1>
    <p class="lead">Type that breathes — every size is a multiple of the previous one.</p>
    <h2>Why Scale Matters</h2>
    <p>A modular scale (1.25× here) gives mathematical harmony to your hierarchy.
       Body text stays at 1rem; headings step up by powers of the ratio.</p>
    <blockquote>"Typography is invisible until it isn't."</blockquote>
    <p>Variable fonts collapse weight, width, and slant into ONE file —
       four HTTP requests become one.</p>
  </article>
</body></html>
\`\`\`

#### Step 3 — Typographic CSS
\`\`\`css
@font-face {
  font-family: "Inter";
  src: url("https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2") format("woff2");
  font-display: swap;
  size-adjust: 107%;   /* match fallback metrics to prevent CLS */
}

:root {
  --ratio: 1.25;
  --base: clamp(1rem, 0.5rem + 0.5vw, 1.125rem);
  --h3: calc(var(--base) * var(--ratio));
  --h2: calc(var(--h3)   * var(--ratio));
  --h1: calc(var(--h2)   * var(--ratio));
  --measure: 65ch;
  --leading: 1.55;
}
body { font-family: "Inter", system-ui, sans-serif;
       font-size: var(--base); line-height: var(--leading);
       max-width: var(--measure); margin: 2rem auto; padding: 0 1rem;
       color: #1a1a1a; }
h1 { font-size: var(--h1); line-height: 1.1; letter-spacing: -0.02em; }
h2 { font-size: var(--h2); line-height: 1.2; }
.lead { font-size: var(--h3); color: #555; }
blockquote { font-style: italic; border-left: 3px solid #999; padding-left: 1em; color: #555; }
\`\`\`

#### Step 4 — Error Handling: Variable Font Fallback & Reduced Motion
\`\`\`css
@supports not (font-variation-settings: "wght" 400) {
  body { font-weight: normal; }   /* graceful degradation */
}
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
const cs = getComputedStyle(document.body);
console.log('Body font-size:', cs.fontSize, 'line-height:', cs.lineHeight);
console.log('h1 font-size:',  getComputedStyle(document.querySelector('h1')).fontSize);
// Verify font loaded
document.fonts.ready.then(() => console.log('Fonts loaded:', [...document.fonts].map(f => f.family)));
\`\`\`

**Expected Output:**
\`\`\`
- Body size scales fluidly from 16px → 18px across viewport widths
- Heading sizes follow 1.25× modular scale, mathematically consistent
- font-display: swap shows fallback then swaps to Inter with no CLS (size-adjust)
- Max-width 65ch keeps measure within readable range
\`\`\`

**Stretch:**
- [ ] Add font-feature-settings: "ss01" 1, "cv11" 1 for stylistic alternates
- [ ] Add a dark-mode variant with adjusted contrast
- [ ] Use \`font-variation-settings: "wght" 380\` for fine-grained weight`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is the difference between \`em\` and \`rem\`? When does \`em\` cause bugs?
**Q2:** What does \`line-height: 1.5\` actually mean? Where does the extra space go?
**Q3:** Write the @font-face block for a self-hosted woff2 with \`font-display: swap\`. From memory.

### Day 3 — Comprehension
**Q4:** Explain FOIT vs FOUT vs FOFT. Which font-display value produces each?
**Q5:** A redesign caused CLS on every page when the custom font loaded. Diagnose and fix using \`size-adjust\`.
**Q6:** Refactor with a modular scale and \`clamp()\`:
\`\`\`css
h1 { font-size: 48px; } h2 { font-size: 32px; } h3 { font-size: 24px; }
@media (min-width: 768px) { h1 { font-size: 64px; } }
\`\`\`

### Day 7 — Application
**Q7:** Build a fluid type system: base 14-18px, scale 1.2, 6 levels of hierarchy.
**Q8:** A PR adds a webfont and Lighthouse drops 20 points on Largest Contentful Paint. Trace the cause.
**Q9:** When would you use a variable font over four static font files? What is the file-size break-even point?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every layout-shift cause a custom font can introduce, and how to eliminate each."
**Q11:** Draw the dependency graph: font-family ↔ @font-face ↔ font-display ↔ size-adjust ↔ CLS.
**Q12:** ★ System design: "Design the typography system for a multilingual app supporting Latin, Cyrillic, CJK, and Arabic — including subsetting, fallbacks, and per-script line-height tuning."`
  },

  // ── 12. backgrounds ──────────────────────────────────────────────────────
  'backgrounds': {
    feynman: `## FEYNMAN CHECK

### Explain Backgrounds Like I'm 10 Years Old
> A background is everything PAINTED BEHIND an element's content. CSS lets you stack multiple background LAYERS (first listed = on top), each with its own image, color, position, repeat behaviour, and size. The non-obvious power: backgrounds can be GRADIENTS (which are images, not colors — they participate in \`background-image\` shorthand), and a SINGLE element can have unlimited gradient layers stacked into complex patterns. The first wave of CSS-only "icon fonts" used backgrounds; today CSS gradients reproduce many SVG illustrations at a fraction of the bytes.

---

### 5 Deep Conceptual Questions

**Q1: Why do backgrounds matter beyond decoration?**
> **A:** Backgrounds avoid extra DOM nodes for purely visual concerns — every \`<div class="decoration">\` you replace with a CSS background is one less node for layout, paint, and accessibility tree. Gradients defined in CSS scale perfectly (no rasterization), recolor with CSS variables, and are GPU-accelerated when promoted to a layer. Background images can be cached, lazy-loaded via \`content-visibility\`, and varied with \`prefers-color-scheme\` — capabilities a \`<div>\` doesn't have.

**Q2: Mental model for backgrounds?**
> **A:** Think of a STACK of transparent sheets behind the element. The first \`background-image\` in your declaration is the top sheet, the last is the bottom, and the \`background-color\` is the floor. Each layer has its own position, size, repeat, and clip — controlled by comma-separated values that match by index across all background-* properties.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Forgetting layer order:
> \`\`\`css
> /* ❌ The dark overlay is BELOW the photo — no darkening visible */
> background-image:
>   url(hero.jpg),
>   linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5));
>
> /* ✅ Overlay first (on top), photo last (on bottom) */
> background-image:
>   linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
>   url(hero.jpg);
> \`\`\`

**Q4: How does \`background-attachment: fixed\` interact with compositing?**
> **A:** \`fixed\` forces the background to be rendered relative to the VIEWPORT, not the element — which on most browsers triggers a separate compositor layer for the element so the background can stay still during scroll. This is expensive on mobile and is the primary cause of "janky scroll" when parallax is implemented with background-attachment. The modern alternative is \`transform: translateZ(0)\` on the content and a normal background, or CSS scroll-driven animations.

**Q5: FAANG-grade definition?**
> **A:** "A background is a multi-layer compositing surface positioned behind an element's content layer, supporting raster images, CSS-painted gradients, and color, governed by per-layer origin/clip/size/position properties, with attachment values that can trigger compositor-layer promotion and thus directly impact scroll performance."`,
    build: `## BUILD

### 🏗️ Mini Project: Hero Section With Layered Gradient Overlay, Pattern, and Photo

**What you will build:** A hero with a photo background, a dark gradient overlay for legibility, a subtle SVG noise pattern for texture, all stacked in ONE element via multiple backgrounds.
**Why this project:** Forces multi-background syntax, gradient stacking, and the photo-overlay pattern used by every news site.
**Time estimate:** 25 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir bg-hero && cd bg-hero
ni index.html, style.css -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
  <section class="hero">
    <div class="hero-content">
      <h1>The Future of Layout</h1>
      <p>Multiple backgrounds, one element, zero extra divs.</p>
    </div>
  </section>
</body></html>
\`\`\`

#### Step 3 — Multi-Layer Background
\`\`\`css
body { margin: 0; font: 16px system-ui; }

.hero {
  min-height: 60vh;
  display: grid; place-items: center;
  color: white;
  text-align: center;
  /* Layer order: top → bottom */
  background:
    /* Noise overlay (top) */
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.7'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/></svg>"),
    /* Dark gradient for text legibility */
    linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.7)),
    /* Photo (bottom) */
    url("https://picsum.photos/1600/900") center / cover no-repeat;
  background-color: #1a1a2e;   /* fallback if photo fails to load */
}
.hero-content h1 { font-size: clamp(2rem, 5vw, 4rem); margin: 0 0 0.5em; }
.hero-content p  { font-size: 1.25rem; max-width: 40ch; margin: 0 auto; }
\`\`\`

#### Step 4 — Error Handling: Reduced Motion, Slow Network
\`\`\`css
@media (prefers-reduced-motion: reduce) { .hero { background-attachment: scroll; } }
@media (prefers-color-scheme: dark) { .hero { background-color: #000; } }
/* Reduce noise on small screens to save bytes */
@media (max-width: 600px) {
  .hero { background-image:
    linear-gradient(180deg, rgba(0,0,0,0.3), rgba(0,0,0,0.7)),
    url("https://picsum.photos/800/600") center / cover no-repeat; }
}
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
const hero = document.querySelector('.hero');
const bg = getComputedStyle(hero).backgroundImage;
console.log('Layers:', bg.split(/,(?![^()]*\))/).length, 'background images stacked');
console.assert(hero.offsetHeight > 200, 'Hero should be tall');
\`\`\`

**Expected Output:**
\`\`\`
- Three-layer composite: noise on top, dark gradient middle, photo behind
- Text remains readable over any photo (gradient ensures contrast)
- Hero scales fluidly with viewport
- Mobile uses smaller photo + skips noise layer
\`\`\`

**Stretch:**
- [ ] Add a conic-gradient color sweep on top for a "premium" feel
- [ ] Use \`background-blend-mode: overlay\` to color-grade the photo
- [ ] Replace SVG noise with \`background-image: paint(noise)\` using Houdini`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is the layer order when listing multiple \`background-image\` values?
**Q2:** Difference between \`background-position\` and \`object-position\`?
**Q3:** Write 4 lines of CSS to overlay a 50% black gradient on top of a hero image. From memory.

### Day 3 — Comprehension
**Q4:** What does \`background-clip: text\` do? Show a "text gradient" example.
**Q5:** Bug: text on a hero image is unreadable in some photos. Fix without changing the photo.
**Q6:** Refactor this to use a single multi-background:
\`\`\`html
<div class="hero">
  <img src="photo.jpg" class="bg">
  <div class="overlay"></div>
  <h1>Title</h1>
</div>
\`\`\`

### Day 7 — Application
**Q7:** Build a CSS-only checkerboard pattern using two repeating linear-gradients.
**Q8:** A PR uses \`background-attachment: fixed\` for parallax and mobile scroll jank appears. Diagnose and fix.
**Q9:** When does \`background-blend-mode\` change pixel values vs just compositing alpha?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every way to draw a gradient in CSS and when to use each."
**Q11:** Draw: how do background layers, blend modes, and the element's content layer compose into final pixels?
**Q12:** ★ System design: "Design a theming system where backgrounds dynamically use brand colors, support light/dark/high-contrast, and remain accessible with WCAG AA contrast."`
  },

  // ── 13. transforms ───────────────────────────────────────────────────────
  'transforms': {
    feynman: `## FEYNMAN CHECK

### Explain CSS Transforms Like I'm 10 Years Old
> Transforms apply MATH (a 2D or 3D transformation matrix) to an element's pixels AFTER layout has finished. The browser still thinks the element is at its original position — its bounding box, click target, and neighbours all act as if nothing changed — but the GPU paints it translated, rotated, scaled, or skewed. This is why \`transform: translateY(-10px)\` is 60fps but \`margin-top: -10px\` is jank: translate skips layout entirely. The function order MATTERS — \`translate() rotate()\` translates then rotates around the new position; \`rotate() translate()\` rotates first then translates along the rotated axis (different result).

---

### 5 Deep Conceptual Questions

**Q1: What problem do transforms solve?**
> **A:** GPU-accelerated animation without invalidating layout. Before transforms, moving an element required changing \`top\`/\`left\`/\`margin\` — each triggering layout for the entire document subtree, paint for affected pixels, and composite. Transform skips layout and paint entirely; the existing rasterised layer is just moved/rotated/scaled by the compositor. This is the single most important property for smooth 60fps animations.

**Q2: Mental model that makes transforms click?**
> **A:** Think of the element as a PHOTOGRAPH already taped to the page. Transform doesn't move the tape — it tells the rendering engine how to project that photo at paint time. Layout is fixed; what you see is the transformed projection. Transforms compose left-to-right: \`A B C\` means C applied first, then B, then A — multiply matrices right-to-left.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing transform functions are commutative:
> \`\`\`css
> /* ❌ Different result — translates then rotates around the new position */
> .a { transform: translateX(100px) rotate(45deg); }
>
> /* ❌ Different — rotates first, then translates along the rotated X axis */
> .b { transform: rotate(45deg) translateX(100px); }
> /* Both are valid; the bug is assuming they're the same. */
> \`\`\`

**Q4: How do transforms interact with the GPU at runtime?**
> **A:** When a transform contains a 3D function (\`translate3d\`, \`translateZ\`, \`perspective\`) or you set \`will-change: transform\`, the browser promotes the element to its OWN compositor layer — rasterised once into a texture and uploaded to the GPU. Subsequent transforms are just GPU matrix operations, costing microseconds. The trade-off: each layer consumes VRAM, so over-promoting hundreds of elements crashes mobile devices. The rule: promote only what animates.

**Q5: FAANG-grade definition?**
> **A:** "CSS \`transform\` applies a 2D/3D affine transformation matrix to an element's coordinate space at paint time, leaving its layout box unchanged — when combined with compositor-layer promotion (via 3D transforms or \`will-change\`), the transformation runs entirely on the GPU as a per-frame matrix multiplication, bypassing layout and paint and producing CSS's only reliable path to 60fps animation."`,
    build: `## BUILD

### 🏗️ Mini Project: Card Tilt-on-Hover With 3D Perspective

**What you will build:** A product card that tilts in 3D following the cursor — using \`perspective\`, \`rotateX\`, \`rotateY\`, and \`transform-style: preserve-3d\` for child layering.
**Why this project:** Forces all major transform concepts: perspective, axis rotation, 3D nesting, GPU promotion.
**Time estimate:** 30 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir tilt-card && cd tilt-card
ni index.html, style.css, app.js -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
  <div class="scene">
    <div class="card">
      <div class="shine"></div>
      <h2>Tilt me</h2>
      <p>Hover and move the cursor.</p>
    </div>
  </div>
  <script src="app.js"></script>
</body></html>
\`\`\`

#### Step 3 — CSS Transform Foundation
\`\`\`css
body { display: grid; place-items: center; min-height: 100vh; margin: 0;
       background: #0f0f1e; font-family: system-ui; color: white; }

.scene { perspective: 1000px; }   /* viewing distance */

.card {
  width: 300px; height: 400px;
  padding: 2rem;
  background: linear-gradient(135deg, #1e1e3a, #3a1e5a);
  border-radius: 12px;
  transform-style: preserve-3d;       /* children participate in 3D */
  will-change: transform;             /* promote to compositor layer */
  transition: transform 0.2s ease-out;
  position: relative;
  overflow: hidden;
}
.shine {
  position: absolute; inset: 0;
  background: radial-gradient(circle 200px at var(--mx,50%) var(--my,50%),
                              rgba(255,255,255,0.25), transparent 60%);
  pointer-events: none;
}
.card h2 { transform: translateZ(40px); }   /* float out of card */
.card p  { transform: translateZ(20px); }
\`\`\`

#### Step 4 — Error Handling: Reduced Motion + Pointer Quit
\`\`\`javascript
const card  = document.querySelector('.card');
const scene = document.querySelector('.scene');

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

scene.addEventListener('pointermove', (e) => {
  if (reduceMotion) return;
  const r = scene.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width  - 0.5;   // -0.5 .. 0.5
  const y = (e.clientY - r.top)  / r.height - 0.5;
  card.style.transform = \`rotateY(\${x * 25}deg) rotateX(\${-y * 25}deg)\`;
  card.style.setProperty('--mx', \`\${(x + 0.5) * 100}%\`);
  card.style.setProperty('--my', \`\${(y + 0.5) * 100}%\`);
});
scene.addEventListener('pointerleave', () => {
  card.style.transform = '';
});
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
// Verify GPU promotion
const cs = getComputedStyle(card);
console.log('will-change:', cs.willChange);
console.log('transform:', cs.transform);
// Manual: open DevTools → Rendering → Layer borders. Card should have an orange border.
\`\`\`

**Expected Output:**
\`\`\`
- Card tilts smoothly in 3D following cursor (±25° on both axes)
- Title and paragraph float OUT of the card via translateZ
- Shine spotlight follows cursor via CSS custom properties
- DevTools Layers panel: card is its own compositor layer
- Reduced-motion users get a static card (no tilt)
\`\`\`

**Stretch:**
- [ ] Add \`backface-visibility: hidden\` and a flip-to-back animation
- [ ] Use \`@property --tilt-x\` to make the transform itself animatable
- [ ] Wrap in IntersectionObserver to only enable tilt while card is on-screen`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Why is \`transform: translate\` faster than changing \`top\`/\`left\`?
**Q2:** Are transform functions commutative? Show why.
**Q3:** Write 3 lines of CSS to center a child via \`transform: translate(-50%, -50%)\`. From memory.

### Day 3 — Comprehension
**Q4:** What does \`transform-style: preserve-3d\` do? When do you need it?
**Q5:** Bug: nested transforms are clipping at the parent's edge in 3D space. Diagnose.
**Q6:** Optimize: this animation is janky on mobile.
\`\`\`css
.box { transition: left 0.3s; }
.box.open { left: 200px; }
\`\`\`

### Day 7 — Application
**Q7:** Build a flip-card with front and back faces using \`rotateY\` and \`backface-visibility\`.
**Q8:** A PR uses \`will-change: transform\` on every card in a 1000-item list. What goes wrong?
**Q9:** What is the cost of a 4×4 matrix transform vs a simple translateX on the GPU?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Explain compositor-layer promotion. When does the browser do it automatically? When should you do it manually?"
**Q11:** Draw the rendering pipeline: how does transform skip layout and paint?
**Q12:** ★ System design: "Design a complex interactive UI (Figma-like canvas) with 10,000 transformable nodes. How do you batch transforms, manage layers, and stay above 60fps?"`
  },

  // ── 14. filters-and-effects ──────────────────────────────────────────────
  'filters-and-effects': {
    feynman: `## FEYNMAN CHECK

### Explain Filters & Effects Like I'm 10 Years Old
> CSS filters are PHOTOSHOP FOR THE BROWSER — \`blur(5px)\`, \`brightness(1.2)\`, \`contrast(1.5)\`, \`grayscale(80%)\`, \`drop-shadow()\`, \`hue-rotate(90deg)\`, and the SVG-only superpower \`url(#filter-id)\`. They apply AFTER the element has been painted, modifying the resulting pixels. \`backdrop-filter\` is the opposite — it filters what's BEHIND the element (used for the iOS "frosted glass" effect). The non-obvious detail: filters force a compositor layer (good for GPU acceleration) but also force a re-rasterization any time the element changes — so animating \`filter: blur()\` is much more expensive than animating \`transform\`.

---

### 5 Deep Conceptual Questions

**Q1: What problem do CSS filters solve?**
> **A:** Visual effects without image-editing tools or extra DOM nodes. Pre-filter, blurring an image meant pre-rendering a blurred PNG; darkening on hover meant a separate dark image. Filters let you express these as declarative CSS, animatable, swappable with custom properties, and free from the round-trip cost of separate image assets.

**Q2: Mental model for filters?**
> **A:** Filters are POST-PROCESSING. The browser paints the element (and its children) into an offscreen bitmap, runs the filter pipeline left-to-right (\`blur(5px) brightness(0.8) contrast(1.2)\`), then composites the result. Multiple filters compose: each step sees the output of the previous. Order matters — \`blur grayscale\` and \`grayscale blur\` produce different results.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Using \`filter: drop-shadow()\` and \`box-shadow\` interchangeably:
> \`\`\`css
> /* ❌ box-shadow draws a rectangle shadow even for irregular shapes */
> .icon { box-shadow: 2px 2px 4px black; }     /* shadow is the element's bounding box */
>
> /* ✅ drop-shadow follows the alpha channel — perfect for PNG/SVG icons */
> .icon { filter: drop-shadow(2px 2px 4px black); }
> \`\`\`

**Q4: How does \`backdrop-filter\` interact with the rendering pipeline?**
> **A:** \`backdrop-filter\` requires the browser to: (1) render everything BEHIND the element to an offscreen buffer, (2) apply the filter to that buffer, (3) composite the element on top. This is significantly more expensive than \`filter\` because it requires reading from the existing composite. It also forces a stacking context. On low-end devices, a single \`backdrop-filter: blur(20px)\` over a large area can drop frame rates from 60 to 20 fps.

**Q5: FAANG-grade definition?**
> **A:** "CSS \`filter\` defines a post-paint pixel-processing pipeline applied to an element's rasterised output before composition, while \`backdrop-filter\` applies the same pipeline to the composited content beneath the element — both forcing compositor-layer promotion and rasterisation invalidation on change, making them powerful for static effects but performance-critical to animate."`,
    build: `## BUILD

### 🏗️ Mini Project: Frosted-Glass Navigation Bar (iOS-Style)

**What you will build:** A semi-transparent navigation bar that blurs the page content behind it as you scroll — the signature iOS / macOS effect, using only CSS.
**Why this project:** Forces \`backdrop-filter\`, fallback handling, and the trade-off between visual richness and performance.
**Time estimate:** 25 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir frosted-nav && cd frosted-nav
ni index.html, style.css -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
  <nav class="topbar">
    <strong>DevMastery</strong>
    <span><a href="#">Docs</a> · <a href="#">Pricing</a> · <a href="#">Blog</a></span>
  </nav>
  <main>
    <h1>Scroll me</h1>
    <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames…</p>
    <!-- duplicate enough content so the page scrolls -->
  </main>
</body></html>
\`\`\`

#### Step 3 — Frosted Glass CSS
\`\`\`css
* { box-sizing: border-box; }
body { margin: 0; font: 16px system-ui;
       background: linear-gradient(135deg, #4a90e2 0%, #50c8a3 50%, #f5a623 100%); }

.topbar {
  position: sticky; top: 0; z-index: 10;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.75rem 1.5rem;

  /* Fallback for browsers without backdrop-filter */
  background: rgba(255, 255, 255, 0.85);

  /* Frosted glass — supported everywhere except Firefox before v103 */
  -webkit-backdrop-filter: blur(20px) saturate(180%);
          backdrop-filter: blur(20px) saturate(180%);
  background: rgba(255, 255, 255, 0.6);

  border-bottom: 1px solid rgba(255,255,255,0.3);
}
.topbar a { color: #1a1a2e; text-decoration: none; margin: 0 0.25rem; }
main { padding: 2rem; max-width: 700px; margin: auto; color: white; }
main p { background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px;
         margin-bottom: 600px; }   /* force scroll */
\`\`\`

#### Step 4 — Error Handling: Feature Detection + Performance
\`\`\`css
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .topbar { background: rgba(255,255,255,0.95); }   /* solid fallback */
}
@media (prefers-reduced-transparency: reduce) {
  .topbar { backdrop-filter: none; background: rgba(255,255,255,0.95); }
}
/* Reduce blur radius on low-end devices to save battery */
@media (max-resolution: 1dppx) {
  .topbar { backdrop-filter: blur(12px) saturate(150%); }
}
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
const nav = document.querySelector('.topbar');
const bf  = getComputedStyle(nav).backdropFilter ||
            getComputedStyle(nav).webkitBackdropFilter;
console.log('backdrop-filter:', bf || 'not supported, using fallback');
console.log('Stacking context created:', getComputedStyle(nav).isolation);
\`\`\`

**Expected Output:**
\`\`\`
- Semi-transparent top bar that blurs the colourful background behind as you scroll
- saturate(180%) boosts colour vibrancy through the blur (iOS hallmark)
- Solid white fallback for Firefox < 103 and prefers-reduced-transparency users
- Sticky position keeps bar at top during scroll
\`\`\`

**Stretch:**
- [ ] Add a noise filter via SVG \`<feTurbulence>\` for true glass texture
- [ ] Animate \`backdrop-filter: blur()\` from 0 → 20px on scroll using IntersectionObserver
- [ ] Profile the cost in DevTools Performance and compare with a solid bar`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Name 5 \`filter\` functions. What does each do?
**Q2:** Difference between \`filter\` and \`backdrop-filter\`?
**Q3:** Write the CSS to apply blur(5px) + grayscale(100%) on hover. From memory.

### Day 3 — Comprehension
**Q4:** Why does \`filter: drop-shadow()\` beat \`box-shadow\` for icons?
**Q5:** Bug: animating \`filter: blur()\` is laggy. Diagnose and propose a cheaper effect.
**Q6:** Refactor for accessibility:
\`\`\`css
.card { backdrop-filter: blur(40px); }
\`\`\`

### Day 7 — Application
**Q7:** Build a "magnifying glass" cursor effect using \`backdrop-filter\` clipped to a circle.
**Q8:** A PR adds \`backdrop-filter\` to every dropdown and scroll FPS drops on Android. Trace.
**Q9:** What is the cost difference between \`filter: blur(5px)\` and \`filter: blur(50px)\`?

### Day 14 — Synthesis
**Q10:** ★ Interview: "When would you use a CSS filter vs an SVG \`<filter>\`?"
**Q11:** Draw: where in the rendering pipeline does \`filter\` execute? \`backdrop-filter\`?
**Q12:** ★ System design: "Design a video editor with real-time filters that runs at 60fps on a Chromebook. CSS filters? Canvas? WebGL?"`
  },

  // ── 15. css-functions ────────────────────────────────────────────────────
  'css-functions': {
    feynman: `## FEYNMAN CHECK

### Explain CSS Functions Like I'm 10 Years Old
> CSS functions are MINI-CALCULATORS the browser runs while computing styles. \`calc(100% - 20px)\` does arithmetic. \`min()\` / \`max()\` pick smallest/largest. \`clamp(min, ideal, max)\` is the responsive sweet spot — "this size, unless it goes below min or above max." \`var(--token)\` reads a custom property. \`color-mix(in oklch, red 50%, blue)\` blends colors. \`rgb()\` / \`oklch()\` define colors. The killer combo: \`font-size: clamp(1rem, 0.5rem + 2vw, 2rem)\` gives you fluid responsive type with NO media queries. Modern CSS is largely about combining these functions, not adding new properties.

---

### 5 Deep Conceptual Questions

**Q1: What problem did CSS functions solve?**
> **A:** Two units could never be combined without JS. \`width: 100% - 20px\` was invalid because the browser couldn't compute \`%\` (resolved at layout) minus \`px\` (resolved at parse). \`calc()\` was the first function that DEFERRED computation to the right moment in the layout algorithm. Once that door opened, the language gained \`min/max/clamp\` (deferred conditional sizing), \`var()\` (deferred token resolution), and \`color-mix/color-contrast\` (deferred color manipulation) — turning static CSS into a partially-programmable styling language.

**Q2: Mental model for CSS functions?**
> **A:** Each function is a LATE-BOUND expression — its arguments are evaluated when the browser knows enough context to resolve units, parent sizes, and the current cascade. \`calc()\` lets you mix percentage + pixel + viewport + em. \`min()/max()/clamp()\` are conditional comparisons. \`var()\` is variable substitution. They COMPOSE: \`clamp(1rem, var(--base) + 0.5vw, 2rem)\` is legal and powerful.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Misusing \`clamp()\` argument order:
> \`\`\`css
> /* ❌ Min larger than max — browser may pick min or behave unexpectedly */
> font-size: clamp(2rem, 5vw, 1rem);
>
> /* ✅ Correct order: MIN, PREFERRED, MAX (low → high) */
> font-size: clamp(1rem, 5vw, 2rem);
> \`\`\`

**Q4: How does \`var()\` interact with the cascade at runtime?**
> **A:** Custom properties (\`--name\`) are INHERITED through the DOM tree by default — you set \`--accent: blue\` on \`:root\` and every descendant reads it. \`var()\` resolves at COMPUTED-VALUE time, which means a single CSS variable change on the root triggers re-computation for every using-element — fast for tokens, dangerous for animations (use \`@property\` to register custom props for performance and type safety).

**Q5: FAANG-grade definition?**
> **A:** "CSS functions are deferred-evaluation expressions resolved during style computation rather than parsing, enabling unit-mixing arithmetic (\`calc\`), conditional clamping (\`min\`/\`max\`/\`clamp\`), cascade-driven token substitution (\`var\`), and modern color-space operations (\`color-mix\`, \`oklch\`) — collectively transforming CSS from a static declarative language into a partially programmable one with O(n) recomputation cost on root-token change."`,
    build: `## BUILD

### 🏗️ Mini Project: Fluid Design System Powered Entirely by CSS Functions

**What you will build:** A page where typography, spacing, and colors are ALL computed from CSS variables via \`clamp()\`, \`calc()\`, and \`color-mix()\` — change ONE root token and the whole system rescales.
**Why this project:** Forces \`clamp()\`, \`calc()\`, \`var()\`, and \`color-mix()\` together — the foundation of every modern design token system.
**Time estimate:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir css-fn-system && cd css-fn-system
ni index.html, style.css -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="style.css"></head>
<body>
  <button id="toggle">Toggle dark mode</button>
  <article>
    <h1>One Root, Whole System</h1>
    <h2>Built with CSS Functions</h2>
    <p>Resize the window and toggle dark mode. Every spacing, font size, and color
       you see is computed from a handful of root tokens.</p>
    <button class="primary">Primary button</button>
    <button class="primary subtle">Subtle variant</button>
  </article>
</body></html>
\`\`\`

#### Step 3 — Token + Function System
\`\`\`css
:root {
  /* Single source of truth */
  --base-size: 16;                                          /* unitless */
  --ratio: 1.25;
  --step: calc(var(--base-size) * 1px);
  --space: clamp(0.5rem, 0.25rem + 1vw, 1.25rem);

  /* Modular scale via calc compounding */
  --s-0: 1rem;
  --s-1: calc(var(--s-0) * var(--ratio));
  --s-2: calc(var(--s-1) * var(--ratio));
  --s-3: calc(var(--s-2) * var(--ratio));

  /* Fluid font sizes */
  --font-body: clamp(1rem, 0.5rem + 0.5vw, 1.125rem);
  --font-h2:   clamp(1.5rem, 1rem + 1.5vw, 2.25rem);
  --font-h1:   clamp(2rem, 1.5rem + 2vw, 3.5rem);

  /* Color system */
  --hue: 250;
  --primary: oklch(0.6 0.18 var(--hue));
  --on-primary: oklch(0.98 0 0);
  --surface: oklch(0.98 0.005 var(--hue));
  --text: oklch(0.2 0.02 var(--hue));
}

[data-theme="dark"] {
  --surface: oklch(0.18 0.02 var(--hue));
  --text:    oklch(0.95 0.005 var(--hue));
  --primary: oklch(0.7 0.18 var(--hue));
}

body { font: var(--font-body)/1.55 system-ui;
       background: var(--surface); color: var(--text);
       margin: 0; padding: var(--space); transition: background 0.2s, color 0.2s; }
article { max-width: min(70ch, 100% - 2 * var(--space)); margin: auto; }
h1 { font-size: var(--font-h1); margin-block: var(--s-2) var(--s-0); }
h2 { font-size: var(--font-h2); margin-block: var(--s-1) var(--s-0); color: var(--primary); }

.primary {
  padding: calc(var(--space) / 2) var(--space);
  background: var(--primary); color: var(--on-primary);
  border: 0; border-radius: 6px; font: inherit; cursor: pointer;
}
.primary.subtle {
  background: color-mix(in oklch, var(--primary), var(--surface) 70%);
  color: var(--primary);
}
\`\`\`

#### Step 4 — Error Handling
\`\`\`javascript
const btn = document.getElementById('toggle');
btn.onclick = () => {
  const html = document.documentElement;
  const next = html.dataset.theme === 'dark' ? '' : 'dark';
  html.dataset.theme = next;
  localStorage.setItem('theme', next);
};
// Honour saved preference
document.documentElement.dataset.theme = localStorage.getItem('theme') || '';

// Honour prefers-color-scheme on first visit
if (!localStorage.getItem('theme') &&
    matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.dataset.theme = 'dark';
}
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
const cs = getComputedStyle(document.body);
console.log('Body font-size:', cs.fontSize);
console.log('Primary color:',  getComputedStyle(document.documentElement).getPropertyValue('--primary'));
// Change --hue at runtime and watch the whole UI re-theme
document.documentElement.style.setProperty('--hue', '180');
\`\`\`

**Expected Output:**
\`\`\`
- Typography scales smoothly from 16px → 18px across 320→1920px viewport
- Modular scale: each heading 1.25× the next
- Buttons recolour from primary to subtle via color-mix
- Toggle button swaps dark mode via single data-theme attribute
- Changing --hue at runtime re-themes EVERYTHING (try 0=red, 120=green, 250=blue)
\`\`\`

**Stretch:**
- [ ] Use \`@property --hue { syntax: "<number>"; ... }\` to animate hue smoothly
- [ ] Add a \`prefers-contrast: more\` variant via \`oklch\` lightness shifts
- [ ] Generate a color palette of 5 tints/shades programmatically via color-mix`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does \`clamp(1rem, 2vw, 2rem)\` mean? What are the three arguments?
**Q2:** What problem did \`calc()\` solve that pure CSS couldn't?
**Q3:** Write a single \`font-size: clamp(...)\` for fluid type 14-22px across 320-1280px. From memory.

### Day 3 — Comprehension
**Q4:** Difference between \`var()\` and a SCSS variable?
**Q5:** A junior wrote \`clamp(5vw, 1rem, 2rem)\` and got odd results. Diagnose.
**Q6:** Refactor to one fluid rule:
\`\`\`css
h1 { font-size: 24px; }
@media (min-width: 768px) { h1 { font-size: 36px; } }
@media (min-width: 1200px) { h1 { font-size: 48px; } }
\`\`\`

### Day 7 — Application
**Q7:** Build a spacing scale using \`calc()\` from a single \`--step\` token.
**Q8:** A PR uses \`var(--undefined-token)\` everywhere with no fallback. What breaks at runtime?
**Q9:** Performance: setting a root-level CSS variable triggers recomputation for how many elements?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Design a fluid type and spacing system using only CSS functions — no media queries, no JavaScript."
**Q11:** Draw: how does \`var()\` interact with the cascade and inheritance vs traditional CSS properties?
**Q12:** ★ System design: "Build a theming engine that supports 50 brands, light/dark/high-contrast modes, and runtime hue rotation — using only CSS variables and \`color-mix\`. What's the architecture?"`
  },

  // ── 16. css-animations ───────────────────────────────────────────────────
  'css-animations': {
    feynman: `## FEYNMAN CHECK

### Explain CSS Animations Like I'm 10 Years Old
> A CSS animation is a TIMELINE the browser plays for you. You define keyframes — snapshots of styles at 0%, 50%, 100% — give the timeline a duration, easing, and play count, then attach it via \`animation: name 2s ease infinite\`. Unlike \`transition\` (which only animates BETWEEN two states triggered by an external change), animations run AUTONOMOUSLY and can loop, alternate, and chain. The non-obvious detail: keyframe interpolation uses the easing function PER-KEYFRAME-PAIR, not across the whole timeline — so different segments can have different easings.

---

### 5 Deep Conceptual Questions

**Q1: What problem did CSS animations solve?**
> **A:** Pre-2010 web animation meant JavaScript \`setInterval\` loops mutating \`style.left\` — terrible for performance (every frame triggered layout) and a maintenance burden. CSS animations declared the timeline once; the browser handles ticking, RAF synchronization, and (for animatable-compositor properties like transform/opacity) GPU rasterization. They also pause automatically when the tab is backgrounded — a saving \`setInterval\` doesn't get.

**Q2: Mental model?**
> **A:** \`@keyframes\` describes WHAT, \`animation\` describes HOW. Keyframes are checkpoints; the browser fills the values between them using the timing function. \`animation-fill-mode\` controls what happens BEFORE the animation starts and AFTER it ends — \`forwards\` keeps the final state, \`backwards\` pre-applies the first frame during delay, \`both\` does both.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Animating non-compositor properties:
> \`\`\`css
> /* ❌ Animating top causes layout/paint every frame (jank on mobile) */
> @keyframes slide-bad { from { top: 0; } to { top: 100px; } }
>
> /* ✅ transform: translate is GPU-only — 60fps */
> @keyframes slide-good { from { transform: translateY(0); } to { transform: translateY(100px); } }
> \`\`\`

**Q4: How does \`animation\` interact with the compositor at runtime?**
> **A:** When you animate \`transform\` or \`opacity\`, the browser promotes the element to its own compositor layer once, then runs the animation entirely on the compositor thread — independent of the main thread. This means even if JavaScript is locked up, the animation keeps running. Animating ANY other property (width, color, top) requires main-thread work each frame and stalls when JS is busy.

**Q5: FAANG-grade definition?**
> **A:** "A CSS animation is a declarative timeline expressed as @keyframes interpolated by a per-segment timing function, driven by the browser's animation worklet — running on the compositor thread for animatable compositor properties (transform, opacity, filter) and on the main thread for everything else, with automatic visibility-based pausing and integration with the Web Animations API."`,
    build: `## BUILD

### 🏗️ Mini Project: Skeleton Loader + Bounce Notification + Looping Logo

**What you will build:** Three real-world CSS animations: a shimmer skeleton for loading states, a bouncing toast notification, and a smoothly looping logo spinner.
**Why this project:** Forces \`@keyframes\`, easing functions, \`animation-fill-mode\`, and respecting \`prefers-reduced-motion\`.
**Time estimate:** 30 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir css-anim-pack && cd css-anim-pack
ni index.html, style.css -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
  <div class="skeleton"></div>
  <div class="skeleton" style="width: 60%"></div>
  <div class="skeleton" style="width: 40%"></div>

  <div class="toast">✅ Saved successfully</div>

  <div class="spinner" aria-label="Loading"></div>
</body></html>
\`\`\`

#### Step 3 — Animations
\`\`\`css
body { font: 16px system-ui; padding: 2rem; background: #f7f7f9; display: grid; gap: 2rem; }

/* 1. Shimmer skeleton */
.skeleton {
  height: 14px; width: 80%; border-radius: 4px;
  background: linear-gradient(90deg, #e6e6ea 25%, #f4f4f8 50%, #e6e6ea 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}
@keyframes shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}

/* 2. Bounce toast */
.toast {
  align-self: end;
  padding: 0.75rem 1.25rem; background: #2a9d8f; color: white;
  border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
}
@keyframes bounce-in {
  0%   { opacity: 0; transform: translateY(-30px) scale(0.9); }
  60%  { opacity: 1; transform: translateY(8px)   scale(1.02); }
  100% { opacity: 1; transform: translateY(0)     scale(1); }
}

/* 3. Spinner */
.spinner {
  width: 36px; height: 36px; border-radius: 50%;
  border: 4px solid #eee; border-top-color: #4a90e2;
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
\`\`\`

#### Step 4 — Error Handling: Reduced Motion + Pause on Hover
\`\`\`css
@media (prefers-reduced-motion: reduce) {
  .skeleton, .toast, .spinner { animation: none; }
  .skeleton { background: #e6e6ea; }
  .spinner  { border-top-color: #4a90e2; }
}
.spinner:hover { animation-play-state: paused; }   /* debug-friendly */
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
const all = document.getAnimations();
console.log('Active animations:', all.length);
all.forEach(a => console.log(a.animationName, a.playState));
// Pause everything at once
document.querySelectorAll('.skeleton, .spinner, .toast').forEach(el =>
  el.getAnimations().forEach(a => a.pause())
);
\`\`\`

**Expected Output:**
\`\`\`
- Skeleton bars shimmer with a moving gradient (1.4s loop)
- Toast bounces in with overshoot easing (0.5s, plays once)
- Spinner rotates smoothly at 60fps (GPU-accelerated via transform)
- Reduced-motion users see static placeholders, no animation
\`\`\`

**Stretch:**
- [ ] Stagger the skeleton animations via \`animation-delay: calc(var(--i) * 0.15s)\`
- [ ] Add a chained two-step toast: slide-in then nudge-attention
- [ ] Use Web Animations API to control the spinner from JavaScript`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between \`transition\` and \`animation\`?
**Q2:** What does \`animation-fill-mode: forwards\` do?
**Q3:** Write the @keyframes for a fade-in (opacity 0 → 1, 300ms). From memory.

### Day 3 — Comprehension
**Q4:** Why is animating \`transform\` better than animating \`top\`?
**Q5:** A 30-element list animates with \`animation-delay: calc(var(--i) * 100ms)\` but they all start together. Diagnose.
**Q6:** Refactor for performance:
\`\`\`css
@keyframes drift { 0% { left: 0; } 100% { left: 200px; } }
\`\`\`

### Day 7 — Application
**Q7:** Build a "typing dots" loader (three dots bouncing in sequence).
**Q8:** A PR animates background-color and CPU usage spikes on mobile. Trace and fix.
**Q9:** What happens to a CSS animation when its tab is backgrounded? When the device is low on battery?

### Day 14 — Synthesis
**Q10:** ★ Interview: "When would you use CSS animations, Web Animations API, or a library like Framer Motion?"
**Q11:** Draw: how does the compositor thread vs main thread divide work for CSS animations?
**Q12:** ★ System design: "Design the animation system for a complex app with 100s of concurrent animations — micro-interactions, page transitions, scroll-linked effects."`
  },

  // ── 17. css-transitions ──────────────────────────────────────────────────
  'css-transitions': {
    feynman: `## FEYNMAN CHECK

### Explain CSS Transitions Like I'm 10 Years Old
> A transition is a SOFT BRIDGE between two states. Normally CSS changes are INSTANT — toggle a class, the colour flips. With \`transition: background 0.3s\`, the colour glides smoothly over 300ms. You don't need keyframes; the browser interpolates BETWEEN whatever the property was and whatever it's becoming. Transitions only run when (a) the property changes AND (b) the new value is different AND (c) the property is animatable (e.g., \`display: none\` is NOT animatable, which is why hiding a menu with transitions is so painful).

---

### 5 Deep Conceptual Questions

**Q1: What problem do transitions solve?**
> **A:** Smooth interactive feedback. A button changing colour on hover from gray to blue feels jarring if instant; over 200ms with ease-out, it feels polished. Pre-transitions, you needed JavaScript libraries (jQuery's \`.animate()\`) to interpolate property values frame by frame. Transitions moved this into the browser's animation pipeline — declarative, GPU-accelerated for transform/opacity, and zero JavaScript.

**Q2: Mental model?**
> **A:** Transitions are EVENT-DRIVEN — they fire ONLY when a CSS property changes. You declare the bridge ahead of time (\`transition: all 0.3s\`), then any class toggle, hover, or style change causes any matching animatable property to glide. The browser fires \`transitionstart\` / \`transitionend\` events you can listen to.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Trying to animate \`display\`:
> \`\`\`css
> /* ❌ display is NOT animatable — transition is ignored */
> .menu { display: none; transition: display 0.3s; }
> .menu.open { display: block; }
>
> /* ✅ Use visibility + opacity (both animatable) */
> .menu { visibility: hidden; opacity: 0; transition: opacity 0.3s, visibility 0.3s; }
> .menu.open { visibility: visible; opacity: 1; }
> \`\`\`

**Q4: How do transitions interact with the cascade at runtime?**
> **A:** When a property changes (via class toggle, :hover, JS), the browser checks if a \`transition-property\` matches AND if the OLD and NEW computed values are both interpolatable. If yes, it creates a transition timeline that runs on the compositor (for transform/opacity) or main thread (everything else). The transition can be interrupted mid-flight — if you toggle the class twice quickly, the browser smoothly re-targets without snapping.

**Q5: FAANG-grade definition?**
> **A:** "A CSS transition is a property-change-driven interpolation between the old and new computed values of an animatable property, governed by transition-property, duration, timing-function, and delay — running on the compositor thread for GPU-friendly properties, supporting graceful reversal via the smooth interruption algorithm, and integrating with TransitionEvent for state coordination."`,
    build: `## BUILD

### 🏗️ Mini Project: Accessible Accordion With Smooth Open/Close

**What you will build:** A native \`<details>\`-style accordion that smoothly transitions between collapsed and expanded — without the \`height: auto\` impossibility — using \`grid-template-rows: 0fr → 1fr\`.
**Why this project:** Forces you to learn the modern hack for animating to "auto" height — one of the most-asked CSS questions.
**Time estimate:** 25 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir trans-accordion && cd trans-accordion
ni index.html, style.css, app.js -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
  <div class="accordion">
    <button class="trigger" aria-expanded="false" aria-controls="p1">Section 1</button>
    <div class="panel" id="p1" role="region">
      <div class="inner">Content of section 1. Lorem ipsum dolor sit amet…</div>
    </div>
    <button class="trigger" aria-expanded="false" aria-controls="p2">Section 2</button>
    <div class="panel" id="p2" role="region">
      <div class="inner">Content of section 2. Lorem ipsum dolor sit amet…</div>
    </div>
  </div>
  <script src="app.js"></script>
</body></html>
\`\`\`

#### Step 3 — Transition CSS
\`\`\`css
body { font: 16px system-ui; max-width: 500px; margin: 2rem auto; padding: 1rem; }
.accordion { border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
.trigger {
  display: block; width: 100%; padding: 1rem;
  background: #f5f5f7; border: 0; text-align: left;
  font: inherit; font-weight: 600; cursor: pointer;
  border-top: 1px solid #ddd;
  transition: background 0.2s ease;
}
.trigger:first-of-type { border-top: 0; }
.trigger:hover  { background: #e8e8ec; }
.trigger[aria-expanded="true"] { background: #2a9d8f; color: white; }

.panel {
  display: grid;
  grid-template-rows: 0fr;        /* magic: animatable to 1fr */
  transition: grid-template-rows 0.3s ease;
}
.panel > .inner { overflow: hidden; padding: 0 1rem; }
.panel[data-open="true"] {
  grid-template-rows: 1fr;
}
.panel[data-open="true"] > .inner { padding: 1rem; }
\`\`\`

#### Step 4 — Error Handling: Reduced Motion + Keyboard Support
\`\`\`javascript
document.querySelectorAll('.trigger').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', String(!expanded));
    panel.dataset.open = String(!expanded);
  });
});
\`\`\`
\`\`\`css
@media (prefers-reduced-motion: reduce) {
  .panel { transition: none; }
}
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
const trigger = document.querySelector('.trigger');
trigger.click();
console.assert(trigger.getAttribute('aria-expanded') === 'true', 'Should expand');

trigger.addEventListener('transitionend', e => {
  if (e.propertyName === 'grid-template-rows')
    console.log('Accordion animation complete');
});
\`\`\`

**Expected Output:**
\`\`\`
- Click trigger → panel smoothly expands from 0 to natural height
- Uses grid-template-rows 0fr → 1fr (the only way to animate to "auto")
- Trigger color transitions to teal when expanded
- Reduced-motion users get instant toggle, no animation
- aria-expanded keeps screen readers in sync
\`\`\`

**Stretch:**
- [ ] Add a chevron icon that rotates 180° via transform transition
- [ ] Implement an "only one open at a time" mode
- [ ] Use the new \`interpolate-size: allow-keywords\` (when supported) for true height: auto`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Which CSS properties are NOT animatable via transition? Name three.
**Q2:** What is the difference between \`transition\` and \`animation\`?
**Q3:** Write 2 lines of CSS for a button that smoothly transitions background on hover. From memory.

### Day 3 — Comprehension
**Q4:** Why can't you transition \`height: auto\`? What modern workaround exists?
**Q5:** A transition snaps abruptly when interrupted. Diagnose: is the browser doing something wrong, or is the CSS?
**Q6:** Refactor: this hover transition feels delayed.
\`\`\`css
.btn { transition: all 0.5s ease-in; }
.btn:hover { background: blue; }
\`\`\`

### Day 7 — Application
**Q7:** Build a tooltip that fades + slides in on hover, with proper visibility transition.
**Q8:** A PR triggers a transition by toggling a class, but it only animates the second time the user clicks. Diagnose.
**Q9:** What is the cost of \`transition: all\` vs \`transition: transform, opacity\`?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Why doesn't transition: height: auto work, and what are all the ways to work around it?"
**Q11:** Draw: where do transitions live in the rendering pipeline relative to keyframe animations?
**Q12:** ★ System design: "Design a smooth route-transition system between SPA pages where elements morph from one layout to another (FLIP technique)."`
  },

  // ── 18. pseudo-classes-advanced ──────────────────────────────────────────
  'pseudo-classes-advanced': {
    feynman: `## FEYNMAN CHECK

### Explain Advanced Pseudo-Classes Like I'm 10 Years Old
> Pseudo-classes are MAGIC SELECTORS that match based on STATE or POSITION, not just markup. \`:hover\` matches when the cursor's on it. \`:focus-visible\` matches only when keyboard-focused (not mouse-clicked). \`:has(img)\` matches a parent that contains an img child (the "parent selector" we waited 20 years for). \`:is(h1, h2, h3)\` reduces selector repetition. \`:where()\` is like \`:is()\` but with ZERO specificity — perfect for resets that shouldn't fight your real styles. \`:nth-child(2n+1 of .visible)\` filters by class first then takes every odd — modern, powerful, easily missed.

---

### 5 Deep Conceptual Questions

**Q1: Why are pseudo-classes critical for accessibility?**
> **A:** \`:focus-visible\` lets you remove the focus ring for mouse users (who don't need it) while keeping it for keyboard users (who depend on it). Without it, sites either show ugly outlines for everyone or remove them entirely and break keyboard navigation — both wrong. \`:focus-within\` styles a container based on whether any descendant has focus — invaluable for form groupings. These can't be done without JavaScript otherwise.

**Q2: Mental model that unlocks :has()?**
> **A:** \`:has()\` is the LONG-AWAITED parent selector. \`article:has(img)\` matches articles containing an img. Crucially, it's a STATE matcher — like \`:hover\`, the browser keeps the match up-to-date as the DOM changes. This makes "style this card differently when it has a featured image" trivially declarative — pre-:has(), you needed JavaScript to add a class.

**Q3: Most dangerous misconception? Show with code.**
> **A:** \`:where()\` vs \`:is()\` — same syntax, completely different specificity:
> \`\`\`css
> /* ❌ Default styles override custom ones (specificity battle) */
> :is(h1, h2, h3) { margin: 0; }   /* specificity counts highest of args */
> .page-title { margin-top: 2rem; }   /* may lose */
>
> /* ✅ Zero-specificity reset */
> :where(h1, h2, h3) { margin: 0; }   /* specificity is 0 */
> .page-title { margin-top: 2rem; }   /* always wins */
> \`\`\`

**Q4: How does \`:has()\` interact with the browser's selector matcher at runtime?**
> **A:** Traditional CSS selectors evaluate right-to-left (subject first, then ancestors) — fast. \`:has()\` requires the browser to look at DESCENDANTS of the subject, which is more expensive. Modern engines have invariants — \`:has()\` only triggers re-match when DOM mutations occur in the subject's subtree. This is generally fast, but a heavy \`:has(:not(.x))\` pattern across thousands of elements can measurably impact style invalidation cost.

**Q5: FAANG-grade definition?**
> **A:** "Pseudo-classes are state-driven and structural selector modifiers evaluated by the browser's style invalidation engine — \`:has()\` enables right-to-left subject-relative selection (the long-missing parent selector), \`:is()\`/\`:where()\` provide selector-list grouping with specificity opt-in/opt-out, and \`:focus-visible\`/\`:focus-within\` expose UA-determined input modality, collectively forming the foundation of accessible interactive styling without JavaScript."`,
    build: `## BUILD

### 🏗️ Mini Project: Accessible Form With :has(), :focus-visible, and :user-invalid

**What you will build:** A login form that uses pseudo-classes to style error states, focus indicators (keyboard only), and the parent label when the input is invalid — all without any JavaScript class toggling.
**Why this project:** Forces modern pseudo-classes that solve real accessibility patterns previously requiring JS.
**Time estimate:** 25 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir pseudo-form && cd pseudo-form
ni index.html, style.css -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
  <form>
    <label>
      <span>Email</span>
      <input type="email" name="email" required>
    </label>
    <label>
      <span>Password</span>
      <input type="password" name="password" required minlength="8">
    </label>
    <button type="submit">Sign in</button>
  </form>
</body></html>
\`\`\`

#### Step 3 — Pseudo-Class Magic
\`\`\`css
:where(*, *::before, *::after) { box-sizing: border-box; }
body { font: 16px system-ui; display: grid; place-items: center; min-height: 100vh;
       background: #f5f5f7; margin: 0; }
form { display: grid; gap: 1rem; padding: 2rem; background: white;
       border-radius: 8px; min-width: 320px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }

label { display: grid; gap: 0.25rem; }
input { padding: 0.5rem 0.75rem; font: inherit; border: 1px solid #ccc;
        border-radius: 4px; }

/* Keyboard-only focus ring (no ugly ring on mouse click) */
input:focus-visible { outline: 2px solid #4a90e2; outline-offset: 2px; }

/* Parent label colours its TEXT when input has a value */
label:has(input:placeholder-shown) span { color: #888; }
label:has(input:not(:placeholder-shown)) span { color: #1a1a2e; }

/* Style the input AFTER the user interacts AND it's invalid */
input:user-invalid { border-color: #d33; background: #fff5f5; }
label:has(input:user-invalid) span::after {
  content: " — please check this field";
  color: #d33; font-weight: normal;
}

/* Disable submit until the form is valid */
form:has(input:user-invalid, input:placeholder-shown) button {
  opacity: 0.5; cursor: not-allowed;
}
button { padding: 0.6em; background: #2a9d8f; color: white; border: 0;
         border-radius: 4px; font: inherit; cursor: pointer; }
\`\`\`

#### Step 4 — Error Handling: Hint Placeholders + Reduced Motion
\`\`\`html
<input type="email" name="email" required placeholder=" ">
<input type="password" name="password" required minlength="8" placeholder=" ">
\`\`\`
\`\`\`css
@media (prefers-reduced-motion: reduce) {
  input { transition: none; }
}
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
const form = document.querySelector('form');
const btn  = form.querySelector('button');
console.log('Submit disabled initially:', getComputedStyle(btn).opacity === '0.5');

form.querySelector('input[type=email]').value = 'invalid';
form.querySelector('input[type=email]').dispatchEvent(new Event('blur'));
// Visually verify :user-invalid styling appears after blur
\`\`\`

**Expected Output:**
\`\`\`
- Keyboard tab → blue focus outline; mouse click → no outline (focus-visible)
- Label text greys when input empty, darkens when filled (:placeholder-shown)
- After blur, invalid inputs show red border + helpful error text
- Submit button stays at 50% opacity until form is fully valid (:has selector)
- Zero JavaScript required for any of this
\`\`\`

**Stretch:**
- [ ] Add \`input:user-valid\` with green checkmark via ::after
- [ ] Use \`:nth-of-type()\` to zebra-stripe a long form
- [ ] Use \`:has(:checked)\` for a CSS-only collapsible details element`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between \`:focus\` and \`:focus-visible\`?
**Q2:** What is the specificity of \`:where(.a, .b)\` vs \`:is(.a, .b)\`?
**Q3:** Write a selector that targets a div containing an img child. From memory.

### Day 3 — Comprehension
**Q4:** What does \`:user-invalid\` do that \`:invalid\` doesn't?
**Q5:** A junior used \`:hover\` to show focus rings. Why does this break keyboard users?
**Q6:** Refactor with \`:is()\`:
\`\`\`css
header h1, header h2, header h3, header h4 { font-family: serif; }
\`\`\`

### Day 7 — Application
**Q7:** Build a card that gets a "featured" border treatment ONLY when it contains an \`<img>\`.
**Q8:** A PR uses \`:has()\` on every list row — should you worry about performance? Measure how.
**Q9:** Difference between \`:nth-child(2n+1)\` and \`:nth-child(2n+1 of .visible)\`?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every modern pseudo-class added since CSS Selectors Level 4."
**Q11:** Draw: how do pseudo-classes participate in the selector-matching engine's right-to-left evaluation?
**Q12:** ★ System design: "Design a component library that eliminates 90% of JavaScript-driven state-class toggling by using \`:has()\`, \`:focus-within\`, and form pseudo-classes."`
  },

  // ── 19. pseudo-elements-advanced ─────────────────────────────────────────
  'pseudo-elements-advanced': {
    feynman: `## FEYNMAN CHECK

### Explain Advanced Pseudo-Elements Like I'm 10 Years Old
> Pseudo-elements (::before, ::after, ::marker, ::placeholder, ::selection, ::backdrop) let you style PARTS of an element that DON'T EXIST in the DOM. \`::before\` and \`::after\` insert virtual children — perfect for decorative icons, badges, or tooltip arrows without polluting markup. \`::marker\` styles list bullets. \`::selection\` styles highlighted text. \`::backdrop\` styles the overlay behind \`<dialog>\` and fullscreen elements. They REQUIRE \`content\` to render — even \`content: ""\` (empty string) is enough. The trick: they live inside their host element's box, so they participate in its layout and stacking context.

---

### 5 Deep Conceptual Questions

**Q1: What problem do pseudo-elements solve?**
> **A:** Decoration without DOM bloat. Every "tooltip arrow" \`<span>\` is one more node for parsers, layout engines, screen readers, and React reconciliation. Pseudo-elements achieve the same visual effect with zero DOM cost. \`::marker\` lets you style list bullets without restructuring HTML. \`::selection\` lets you brand text-selection highlight — impossible to style otherwise.

**Q2: Mental model?**
> **A:** A pseudo-element is a VIRTUAL element grafted into the host. \`::before\` is the first child (visually); \`::after\` is the last. It inherits from the host but lives in its own box — meaning you can absolutely position it, give it width/height, and animate it. It's inert to events (\`pointer-events: none\` is the default behaviour) unless explicitly styled otherwise.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Forgetting \`content\`:
> \`\`\`css
> /* ❌ Pseudo-element doesn't render — invisible bug! */
> .badge::after {
>   background: red;
>   width: 8px; height: 8px; border-radius: 50%;
> }
>
> /* ✅ Must include content (even empty string) */
> .badge::after {
>   content: "";
>   background: red;
>   width: 8px; height: 8px; border-radius: 50%;
> }
> \`\`\`

**Q4: How do pseudo-elements interact with accessibility?**
> **A:** Content inserted via \`::before {content: "$" attr(data-price)}\` IS read by most modern screen readers — sometimes as part of the host element's text, sometimes as separate content. For decorative-only pseudo-elements, this can be noise. Best practice: use pseudo-elements ONLY for decoration that has no semantic meaning, and convey actual content in real DOM with proper ARIA. Decorative icons via \`content: "★"\` are fine; meaningful text via pseudo-element is an accessibility anti-pattern.

**Q5: FAANG-grade definition?**
> **A:** "Pseudo-elements are virtual styling targets inserted by the user agent into the box tree of their host — generating a single anonymous box per element that participates in the host's formatting context but is absent from the DOM tree, the accessibility tree (in modern implementations of decorative content), and the selector engine's child-counting algorithm."`,
    build: `## BUILD

### 🏗️ Mini Project: Tooltip With CSS-Only Arrow, Notification Badge, Custom Selection

**What you will build:** Three real-world pseudo-element patterns — a tooltip with a triangular arrow drawn via ::before, a notification dot badge via ::after, and branded text selection.
**Why this project:** Forces \`::before\`, \`::after\`, \`::selection\`, and the triangular-arrow CSS trick that ships in every component library.
**Time estimate:** 30 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir pseudo-pack && cd pseudo-pack
ni index.html, style.css -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
  <p>Try <span class="tooltip" data-tip="This is a real CSS-only tooltip.">hovering me</span>
     to see a tooltip.</p>

  <button class="inbox" data-count="7">Inbox</button>

  <p>Select this text to see custom highlight colour.</p>
</body></html>
\`\`\`

#### Step 3 — Pseudo-Element CSS
\`\`\`css
body { font: 16px/1.6 system-ui; padding: 2rem; }

/* 1. Tooltip with arrow */
.tooltip { position: relative; cursor: help; border-bottom: 1px dashed; }
.tooltip::after {
  content: attr(data-tip);
  position: absolute; bottom: 130%; left: 50%; transform: translateX(-50%);
  padding: 0.5rem 0.75rem; background: #1a1a2e; color: white;
  border-radius: 4px; white-space: nowrap; font-size: 0.875rem;
  opacity: 0; pointer-events: none; transition: opacity 0.15s;
}
.tooltip::before {
  content: "";
  position: absolute; bottom: 115%; left: 50%; transform: translateX(-50%);
  border: 6px solid transparent; border-top-color: #1a1a2e;
  opacity: 0; transition: opacity 0.15s;
}
.tooltip:hover::after, .tooltip:hover::before,
.tooltip:focus::after, .tooltip:focus::before { opacity: 1; }

/* 2. Notification badge */
.inbox { position: relative; padding: 0.5rem 1rem; font: inherit;
         background: #f5f5f7; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; }
.inbox::after {
  content: attr(data-count);
  position: absolute; top: -6px; right: -6px;
  min-width: 18px; height: 18px; padding: 0 5px;
  background: #d33; color: white; font-size: 11px; font-weight: bold;
  border-radius: 9px; display: grid; place-items: center;
}

/* 3. Custom selection */
::selection { background: #2a9d8f; color: white; }
\`\`\`

#### Step 4 — Error Handling: Empty Count, Reduced Motion
\`\`\`css
.inbox[data-count="0"]::after, .inbox:not([data-count])::after { display: none; }
@media (prefers-reduced-motion: reduce) {
  .tooltip::after, .tooltip::before { transition: none; }
}
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
const inbox = document.querySelector('.inbox');
inbox.dataset.count = '0';
// Badge should disappear when count is 0

const tip = document.querySelector('.tooltip');
tip.focus();   // keyboard users should also see tooltip
\`\`\`

**Expected Output:**
\`\`\`
- Hover/focus "hovering me" → dark tooltip with triangular arrow appears
- Inbox button shows red "7" badge in top-right corner
- Selecting text shows teal highlight instead of default blue
- data-count="0" hides the badge automatically
\`\`\`

**Stretch:**
- [ ] Add \`::marker\` styling to a custom list (different colour bullets per item)
- [ ] Use \`::backdrop\` on a native \`<dialog>\` element
- [ ] Animate the badge with a pulse keyframe on count change`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Why is \`content: ""\` required on ::before/::after even when you don't need text?
**Q2:** Name 4 pseudo-elements beyond ::before/::after.
**Q3:** Write the CSS for a "★" star icon prepended to every \`<a>\`. From memory.

### Day 3 — Comprehension
**Q4:** Are pseudo-elements visible to screen readers? When is that a problem?
**Q5:** Why doesn't \`::before\` work on \`<img>\` and \`<input>\`?
**Q6:** Refactor: this badge uses an extra \`<span>\` — convert to a pseudo-element.
\`\`\`html
<button>Inbox <span class="count">7</span></button>
\`\`\`

### Day 7 — Application
**Q7:** Build a CSS-only "REQUIRED" asterisk for form labels using \`label::after\`.
**Q8:** A PR puts important error text inside \`::after\` — explain the a11y problem and the fix.
**Q9:** Style the bullets of an \`<ol>\` to be red and bold, without changing markup.

### Day 14 — Synthesis
**Q10:** ★ Interview: "List every CSS-only triangle technique and explain the math."
**Q11:** Draw: how do pseudo-elements participate in the box tree and stacking context?
**Q12:** ★ System design: "Design a component library that minimises DOM nodes via pseudo-elements. What are the limits, and when must you fall back to real DOM?"`
  },

  // ── 20. css-variables ────────────────────────────────────────────────────
  'css-variables': {
    feynman: `## FEYNMAN CHECK

### Explain CSS Variables Like I'm 10 Years Old
> CSS variables (custom properties) are TOKENS that live in the cascade. Declare \`--accent: blue\` on \`:root\` and use it with \`var(--accent)\` anywhere. Unlike SCSS variables (resolved at build time), CSS variables are LIVE — change them at runtime via JavaScript or media queries and every using-element updates instantly. They INHERIT down the DOM tree by default, which is how you get scoped theming (set \`--accent: red\` on a section and only THAT section gets red). The non-obvious power: combined with \`@property\`, you can animate them with type safety; combined with \`calc()\`, you have a programmable design system.

---

### 5 Deep Conceptual Questions

**Q1: What problem do CSS variables solve that SCSS variables don't?**
> **A:** Runtime mutability and cascade inheritance. SCSS \`$accent\` is replaced at compile time with the literal value — once your bundle ships, you can't change it. CSS variables are read by the browser at computed-value time, so JavaScript can mutate them, media queries can override them, dark mode can swap them — all live, all reactive. They also inherit through the DOM, so scoped themes "just work."

**Q2: Mental model?**
> **A:** A CSS variable is an INHERITED CSS property whose name starts with \`--\`. It cascades and inherits exactly like \`color\` does. \`var(--x, fallback)\` reads it (with optional fallback for undefined cases). The browser resolves variables at COMPUTED-VALUE time, AFTER the cascade picks a winner — so you can override one variable in a media query and every \`var(--x)\` rule recomputes.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Trying to use \`var()\` inside selectors or values where it's not allowed:
> \`\`\`css
> /* ❌ var() doesn't work inside @media query feature values */
> @media (min-width: var(--breakpoint)) { ... }
>
> /* ❌ var() can't compose selectors */
> .var(--class-name) { color: red; }
>
> /* ✅ var() works inside property VALUES only */
> .button { padding: var(--btn-padding); color: var(--accent); }
> \`\`\`

**Q4: How do CSS variables interact with animation at runtime?**
> **A:** By default, custom properties are \`<*>\` type — animating them switches between values instantly without interpolation. To animate smoothly, register them with \`@property\`: \`@property --hue { syntax: "<number>"; initial-value: 0; inherits: false; }\` — now \`--hue: 0 → 360\` interpolates frame-by-frame. This unlocks animatable gradients, hue rotation, fluid transitions — impossible before \`@property\`.

**Q5: FAANG-grade definition?**
> **A:** "CSS custom properties are inheritable, cascade-resolved properties whose names follow the \`--*\` syntax and whose values are evaluated at computed-value time via \`var()\` substitution — when registered through @property with a syntax descriptor they become typed and animatable, forming the foundation of runtime-themeable, JavaScript-bridged design token systems."`,
    build: `## BUILD

### 🏗️ Mini Project: Runtime-Theming Engine With Scoped Themes and Animated Gradient

**What you will build:** A page where users pick brand colors with an input, and the whole UI re-themes instantly. Bonus: an animated gradient using @property-registered variables.
**Why this project:** Forces \`:root\` tokens, scoped overrides, JavaScript bridging, and the new @property animation trick.
**Time estimate:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir vars-theming && cd vars-theming
ni index.html, style.css, app.js -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
  <header class="hero">
    <h1>Variable-Powered Theming</h1>
    <p>Move the hue slider →</p>
    <input id="hue" type="range" min="0" max="360" value="220">
  </header>
  <main>
    <button>Primary action</button>
    <button class="ghost">Ghost variant</button>
    <section class="brand-emerald"><p>This section scoped to emerald theme.</p></section>
  </main>
  <script src="app.js"></script>
</body></html>
\`\`\`

#### Step 3 — Variable System + Animated Gradient
\`\`\`css
@property --hue {
  syntax: "<number>";
  initial-value: 220;
  inherits: true;
}

:root {
  --hue: 220;
  --primary: oklch(0.62 0.18 var(--hue));
  --primary-text: oklch(0.98 0 0);
  --bg: oklch(0.97 0.01 var(--hue));
  --fg: oklch(0.18 0.02 var(--hue));
  --radius: 6px;
}

.brand-emerald { --hue: 160; }   /* scoped override — emerald subsection */

body { background: var(--bg); color: var(--fg);
       font: 16px system-ui; margin: 0; padding: 2rem; transition: background 0.3s; }

.hero {
  padding: 3rem 2rem; border-radius: 12px; color: white;
  background:
    linear-gradient(135deg,
      oklch(0.6 0.2 var(--hue)),
      oklch(0.5 0.2 calc(var(--hue) + 60)));
  margin-bottom: 2rem;
  transition: --hue 0.5s ease;     /* @property makes this work */
}

button { padding: 0.6em 1.2em; border-radius: var(--radius); border: 0;
         background: var(--primary); color: var(--primary-text);
         font: inherit; cursor: pointer; margin-right: 0.5rem; }
button.ghost { background: transparent; color: var(--primary); border: 2px solid var(--primary); }

section { padding: 1.5rem; background: var(--bg); border-radius: var(--radius);
          margin-top: 1rem; }
\`\`\`

#### Step 4 — Error Handling: Bridge JS, persist preference
\`\`\`javascript
const slider = document.getElementById('hue');
const root = document.documentElement;
slider.addEventListener('input', e => {
  root.style.setProperty('--hue', e.target.value);
  localStorage.setItem('hue', e.target.value);
});
// Restore on load
const saved = localStorage.getItem('hue');
if (saved) { slider.value = saved; root.style.setProperty('--hue', saved); }

// Honour OS dark mode
const dark = matchMedia('(prefers-color-scheme: dark)');
function applyScheme() {
  root.style.setProperty('--bg', dark.matches
    ? \`oklch(0.18 0.02 var(--hue))\`
    : \`oklch(0.97 0.01 var(--hue))\`);
}
dark.addEventListener('change', applyScheme); applyScheme();
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
const cs = getComputedStyle(root);
console.log('--hue:',     cs.getPropertyValue('--hue'));
console.log('--primary:', cs.getPropertyValue('--primary'));
// Programmatically theme to red and verify
root.style.setProperty('--hue', '0');
console.assert(cs.getPropertyValue('--hue').trim() === '0', 'Hue should be 0');
\`\`\`

**Expected Output:**
\`\`\`
- Slider 0-360 → entire hero gradient + buttons + accents re-hue live
- Emerald subsection ignores root --hue (scoped override)
- LocalStorage persists user's hue across reloads
- Auto-switches background to dark variant when OS dark mode toggled
- @property makes the hue transition animate smoothly (not snap)
\`\`\`

**Stretch:**
- [ ] Animate \`--hue\` 0→360 over 30s for a "demo mode" rainbow
- [ ] Build a "contrast checker" using \`color-contrast()\` against the dynamic --primary
- [ ] Expose --hue as a CSS \`@property\` consumable in CSS \`@scope\` blocks`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between SCSS \`$var\` and CSS \`--var\`?
**Q2:** Where can \`var()\` be used? Where can it NOT be used?
**Q3:** Write a fallback for an undefined variable: \`color: var(--accent, ???)\`. From memory.

### Day 3 — Comprehension
**Q4:** Why aren't custom properties animatable by default? How does \`@property\` change this?
**Q5:** A theme switch causes a flash of unstyled content (FOUC). Diagnose: variables vs class toggle order.
**Q6:** Refactor:
\`\`\`css
.btn-primary  { background: #2a9d8f; color: white; padding: 0.5em 1em; }
.btn-danger   { background: #d33;    color: white; padding: 0.5em 1em; }
.btn-success  { background: #2a9d8f; color: white; padding: 0.5em 1em; font-weight: bold; }
\`\`\`

### Day 7 — Application
**Q7:** Build a dark/light/high-contrast theme switcher using ONLY CSS variables + a \`data-theme\` attribute.
**Q8:** A PR sets a CSS variable on every animation frame from \`requestAnimationFrame\`. What is the cost?
**Q9:** How does variable inheritance interact with \`:host\` in shadow DOM?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Design a tokenised theming system that works on Web, iOS, Android — sharing the same source of truth."
**Q11:** Draw: how does \`var()\` resolution sit relative to cascade + inheritance + computed-value time?
**Q12:** ★ System design: "Build a runtime theme builder where designers pick 3 tokens (hue, radius, font-scale) and the whole component library re-themes. How do you architect the token graph?"`
  },

  // ── 21. css-architecture ─────────────────────────────────────────────────
  'css-architecture': {
    feynman: `## FEYNMAN CHECK

### Explain CSS Architecture Like I'm 10 Years Old
> CSS architecture is the SET OF RULES your team agrees on to prevent your stylesheet from turning into a 30,000-line dumpster fire. Major methodologies: BEM (\`block__element--modifier\`) — every class self-documents its scope. SMACSS — categorise rules by purpose (base/layout/module/state/theme). ITCSS — order rules by specificity (settings → tools → generic → elements → objects → components → utilities). Atomic CSS — every utility class does ONE thing (Tailwind's approach). The non-obvious truth: any methodology beats none, and the choice matters less than the team's CONSISTENCY in following it.

---

### 5 Deep Conceptual Questions

**Q1: What problem does CSS architecture solve?**
> **A:** CSS has GLOBAL SCOPE — every rule can affect any element on any page. Without discipline, this leads to specificity wars (.btn vs .header .btn vs body.dark .header .btn:hover), \`!important\` cascades, and the famous "delete this CSS and pray nothing breaks" syndrome. Architecture methodologies impose naming + structural conventions that turn CSS into a more local, predictable system — without language-level help.

**Q2: Mental model that unlocks architecture?**
> **A:** Think of CSS as a LAYERED system from low to high specificity:
> 1. **Settings** — variables, tokens
> 2. **Generic** — resets, normalise
> 3. **Elements** — bare \`h1\`, \`p\`, \`a\` defaults
> 4. **Objects** — abstract layout patterns (.media, .stack)
> 5. **Components** — concrete UI (.btn, .card)
> 6. **Utilities** — single-purpose (.mt-4, .text-center)
> Each layer's rules NEVER reach a higher specificity than the next layer. This is ITCSS in 6 lines.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing nesting helps organisation:
> \`\`\`scss
> /* ❌ Deep nesting creates specificity bombs */
> .page {
>   .header {
>     .nav {
>       .item {
>         &.active { color: red; }   /* .page .header .nav .item.active = 0,1,4 */
>       }
>     }
>   }
> }
>
> /* ✅ Flat BEM keeps specificity low */
> .nav__item--active { color: red; }   /* 0,1,0 */
> \`\`\`

**Q4: How does architecture interact with CSS-in-JS and Tailwind at runtime?**
> **A:** CSS-in-JS (styled-components, emotion) gives each component a generated class name — automatic scoping eliminates naming wars but adds runtime CSS generation cost. Tailwind (utility-first) inverts the pyramid — most rules are atomic utilities, components are markup combinations — eliminating CSS bloat but moving complexity into HTML. Modern CSS itself adds \`@scope\` and \`@layer\` to solve the same problems natively: \`@layer reset, base, components, utilities;\` lets you control cascade order WITHOUT specificity hacks.

**Q5: FAANG-grade definition?**
> **A:** "CSS architecture is the discipline of imposing locality and predictability onto a globally-scoped declarative language — through naming conventions (BEM), specificity layering (ITCSS, @layer), composition primitives (utility classes, design tokens), and tooling (CSS modules, scoped queries) — turning a fragile global stylesheet into a maintainable, refactor-safe codebase."`,
    build: `## BUILD

### 🏗️ Mini Project: Refactor a Tangled Stylesheet Using @layer + BEM + Tokens

**What you will build:** Take a messy "real-world" stylesheet with specificity wars, refactor it into a layered architecture using \`@layer\`, BEM naming, and design tokens.
**Why this project:** Forces the architecture decision-making process that senior devs go through every day.
**Time estimate:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir css-arch && cd css-arch
ni index.html, messy.css, refactored.css -ItemType File
\`\`\`

#### Step 2 — The Messy Original
\`\`\`css
/* messy.css */
.btn { padding: 8px 16px; background: blue; color: white; border-radius: 4px; }
.header .btn { background: red !important; }
body.dark .header .btn:hover { background: orange !important; }
#promo .btn { padding: 12px 24px !important; font-size: 18px !important; }
.card .btn-large.btn { font-weight: bold; padding: 14px 28px; }
\`\`\`

#### Step 3 — Refactored with @layer + BEM + Tokens
\`\`\`css
/* refactored.css */
@layer reset, tokens, base, components, utilities;

@layer tokens {
  :root {
    --color-primary: #2a9d8f;
    --color-danger: #d33;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --radius: 4px;
  }
}

@layer base {
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font: 16px system-ui; }
}

@layer components {
  /* Block */
  .btn {
    display: inline-block;
    padding: var(--space-2) var(--space-4);
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius);
    border: 0; font: inherit; cursor: pointer;
  }
  /* Modifiers */
  .btn--danger { background: var(--color-danger); }
  .btn--large  { padding: var(--space-3) calc(var(--space-4) * 1.5);
                 font-size: 1.125rem; font-weight: 600; }
  /* States (no extra specificity needed thanks to @layer) */
  .btn:hover { filter: brightness(1.08); }
}

@layer utilities {
  .u-mt-4 { margin-top: var(--space-4); }
  .u-text-center { text-align: center; }
}
\`\`\`

#### Step 4 — HTML Using the New Architecture
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="refactored.css"></head>
<body>
  <header>
    <button class="btn">Default</button>
    <button class="btn btn--danger">Delete</button>
    <button class="btn btn--large">Big CTA</button>
  </header>
  <main class="u-mt-4 u-text-center">
    <button class="btn btn--large btn--danger">Combined modifiers</button>
  </main>
</body></html>
\`\`\`

#### Step 5 — Tests: Specificity Audit
\`\`\`javascript
// Verify zero !important
const text = await (await fetch('refactored.css')).text();
console.assert(!text.includes('!important'), 'Should have no !important');
console.log('Layer count:', (text.match(/@layer/g) || []).length);

// All button rules have specificity 0,1,0 or 0,2,0 max — no wars possible
\`\`\`

**Expected Output:**
\`\`\`
- All buttons share base styles via .btn
- Modifiers (.btn--danger, .btn--large) compose cleanly
- @layer order ensures utilities always win over components without !important
- Zero specificity wars — every rule is predictable
- Tokens centralised → change --color-primary once, every button updates
\`\`\`

**Stretch:**
- [ ] Add a @scope rule to limit .btn styles to a specific section
- [ ] Convert to CSS Modules (\`btn.module.css\`) for true scoping
- [ ] Add a Stylelint config that enforces BEM naming`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does BEM stand for? Write an example class for "card title with featured modifier."
**Q2:** What is ITCSS's main principle?
**Q3:** Write the order of layers in @layer for a reset → tokens → components → utilities setup. From memory.

### Day 3 — Comprehension
**Q4:** Compare BEM, utility-first (Tailwind), and CSS-in-JS. When would you choose each?
**Q5:** A junior added \`!important\` to fix a specificity issue. Show the correct fix using @layer.
**Q6:** Refactor: this deeply-nested rule has specificity 0,4,2:
\`\`\`css
.page .header nav ul li a.active { color: red; }
\`\`\`

### Day 7 — Application
**Q7:** Audit an open-source project's CSS — count specificity, find @layer usage, identify methodology.
**Q8:** A PR introduces a new \`.button\` class that conflicts with an existing \`.btn\`. Propose a renaming + migration strategy.
**Q9:** What does \`@scope\` solve that @layer doesn't?

### Day 14 — Synthesis
**Q10:** ★ Interview: "How would you architect CSS for a design system used by 50+ apps?"
**Q11:** Draw: how do @layer, BEM, design tokens, and CSS Modules combine to form a complete architecture?
**Q12:** ★ System design: "Migrate a 10-year-old jQuery app with 50k lines of CSS to a modern, tokenised, layered architecture. What's the rollout plan?"`
  },

  // ── 22. preprocessors ────────────────────────────────────────────────────
  'preprocessors': {
    feynman: `## FEYNMAN CHECK

### Explain CSS Preprocessors Like I'm 10 Years Old
> A preprocessor (Sass, Less, Stylus) is a LANGUAGE that COMPILES to CSS. You write \`.scss\` with features CSS doesn't have — variables, nesting, mixins, functions, loops, partials, math — and a build tool compiles it to plain CSS the browser understands. Sass is the most popular; \`.scss\` syntax is a superset of CSS, so existing CSS pastes in unchanged. The non-obvious modern reality: CSS itself has caught up massively (variables, nesting, \`@layer\`, \`@scope\`, \`color-mix\`) — meaning Sass is increasingly used for build-time concerns (mixins, loops, partials) rather than runtime features.

---

### 5 Deep Conceptual Questions

**Q1: What problem did Sass solve?**
> **A:** CSS in 2007 had no variables, no nesting, no functions, no imports that actually inlined. Maintaining themed color systems meant find-and-replace across files. Sass introduced \`$variables\`, nesting, \`@mixin\`, \`@function\`, \`@if\`/\`@for\`/\`@each\`, and \`@import\` (now \`@use\`) for true partials. Suddenly CSS became a programmable language with proper modularisation.

**Q2: Mental model: how does Sass compile?**
> **A:** Sass is a TRANSPILER. Source \`.scss\` files are read; variables are replaced; nesting is flattened to selectors; mixins are inlined; functions are evaluated; \`@for\` loops are unrolled; output is a plain \`.css\` file. None of these features exist at runtime — by the time the browser sees the CSS, all Sass magic is gone. This is fundamentally different from CSS variables, which exist AT runtime.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing Sass \`$variables\` and CSS \`--variables\` are interchangeable:
> \`\`\`scss
> /* ❌ Sass variable - frozen at build time */
> $primary: blue;
> .btn { background: $primary; }   // becomes: background: blue;
> // JavaScript can NEVER change this
>
> /* ✅ CSS variable - live at runtime */
> :root { --primary: blue; }
> .btn { background: var(--primary); }
> // JavaScript: document.documentElement.style.setProperty('--primary', 'red');
> \`\`\`

**Q4: How does Sass interact with modern CSS at the build level?**
> **A:** Sass and modern CSS now overlap heavily — both have nesting, both have variables-of-a-sort. The remaining unique Sass features are: build-time loops (\`@for $i from 1 through 12 { .col-#{$i} {...} }\`), parameterised mixins, partial files with \`@use\` (true module system with namespacing), and color functions like \`lighten()\` (now matched by CSS \`color-mix\`). For greenfield projects, vanilla CSS + PostCSS often replaces Sass entirely.

**Q5: FAANG-grade definition?**
> **A:** "A CSS preprocessor is a build-time language that compiles a feature-rich superset (variables, mixins, functions, loops, partials, math) into static CSS — operating entirely at build time with zero runtime cost, complementary but increasingly redundant to modern CSS's runtime custom properties, nesting, and @scope/@layer/color-mix capabilities."`,
    build: `## BUILD

### 🏗️ Mini Project: Themed Button System Using Sass Mixins + Loops

**What you will build:** A complete button system with 5 variants generated by a Sass loop, a responsive mixin, and partial-file architecture — compiled to clean CSS.
**Why this project:** Forces real Sass features (mixins, loops, partials, \`@use\`) that vanilla CSS still can't fully replace.
**Time estimate:** 30 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir sass-buttons && cd sass-buttons
npm init -y
npm install --save-dev sass
ni src/_tokens.scss, src/_mixins.scss, src/main.scss, index.html -ItemType File
\`\`\`

#### Step 2 — Tokens Partial
\`\`\`scss
// src/_tokens.scss
$colors: (
  "primary": #2a9d8f,
  "danger":  #d33,
  "warning": #e9c46a,
  "success": #4cb944,
  "ghost":   transparent,
);
$radius: 4px;
$spacing-2: 0.5rem;
$spacing-4: 1rem;
$bp-md: 768px;
\`\`\`

#### Step 3 — Mixin + Loop Generation
\`\`\`scss
// src/_mixins.scss
@use "sass:color";

@mixin button-base {
  display: inline-block;
  padding: $spacing-2 $spacing-4;
  border-radius: $radius;
  border: 0;
  font: inherit;
  cursor: pointer;
  transition: filter 0.15s, transform 0.1s;
  &:hover  { filter: brightness(1.08); }
  &:active { transform: translateY(1px); }
}

@mixin respond($breakpoint) {
  @if $breakpoint == md { @media (min-width: $bp-md) { @content; } }
  @if $breakpoint == lg { @media (min-width: 1024px) { @content; } }
}

// src/main.scss
@use "tokens" as *;
@use "mixins" as *;

.btn { @include button-base; }

@each $name, $hex in $colors {
  .btn--#{$name} {
    background: $hex;
    color: if(lightness($hex) > 60, #1a1a2e, white);
    @if $name == "ghost" {
      border: 2px solid currentColor;
      color: map-get($colors, "primary");
    }
  }
}

.btn-row { display: flex; gap: $spacing-2; flex-wrap: wrap; }

@include respond(md) {
  .btn { padding: $spacing-2 calc($spacing-4 * 1.25); }
}
\`\`\`

#### Step 4 — Error Handling: Build Script
\`\`\`json
// package.json
{
  "scripts": {
    "build": "sass src/main.scss dist/main.css --style=compressed",
    "watch": "sass --watch src/main.scss dist/main.css"
  }
}
\`\`\`
\`\`\`bash
npm run build
# Inspect dist/main.css to see the compiled output
\`\`\`

#### Step 5 — HTML + Tests
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="dist/main.css"></head>
<body>
  <div class="btn-row">
    <button class="btn btn--primary">Primary</button>
    <button class="btn btn--danger">Danger</button>
    <button class="btn btn--warning">Warning</button>
    <button class="btn btn--success">Success</button>
    <button class="btn btn--ghost">Ghost</button>
  </div>
</body></html>
\`\`\`
\`\`\`javascript
// Verify five variants generated
const css = await (await fetch('dist/main.css')).text();
console.log('Variants generated:', (css.match(/\.btn--\w+/g) || []).length);
\`\`\`

**Expected Output:**
\`\`\`
- 5 button variants from one @each loop
- White or dark text auto-chosen based on background lightness
- Ghost variant has special border + transparent fill
- Mobile: 0.5/1rem padding; ≥768px: 0.5/1.25rem padding (mixin-applied)
- Compiled CSS is clean, no Sass syntax remains
\`\`\`

**Stretch:**
- [ ] Replace Sass with vanilla CSS @scope + nesting and compare LOC
- [ ] Add a dark-mode mixin that flips lightness via \`color.scale\`
- [ ] Migrate this to PostCSS (next topic) — note what Sass features have no PostCSS equivalent`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does a CSS preprocessor do at build time vs runtime?
**Q2:** Difference between \`@import\` and \`@use\` in modern Sass?
**Q3:** Write a Sass \`@for\` loop that generates 12 column classes. From memory.

### Day 3 — Comprehension
**Q4:** Why is a Sass \`$variable\` not the same as a CSS \`--variable\`?
**Q5:** A team uses Sass nesting 6 levels deep. What's the problem? Show the specificity output.
**Q6:** Refactor this Sass to vanilla CSS using modern features:
\`\`\`scss
.card { .title { color: blue; &:hover { color: red; } } }
\`\`\`

### Day 7 — Application
**Q7:** Build a Sass spacing-scale mixin that emits \`.m-{n}\` and \`.p-{n}\` classes from 0-8.
**Q8:** A PR adds Sass to an existing PostCSS project. What conflicts arise? How do you resolve?
**Q9:** Performance: when does Sass compile time matter? When does it not?

### Day 14 — Synthesis
**Q10:** ★ Interview: "When would you choose Sass over vanilla CSS in 2026?"
**Q11:** Draw: how does Sass fit in the build pipeline alongside PostCSS, autoprefixer, and CSS modules?
**Q12:** ★ System design: "A design system needs to ship CSS for Web + tokens for iOS/Android. Where does Sass help, and where is it a liability?"`
  },

  // ── 23. postcss ──────────────────────────────────────────────────────────
  'postcss': {
    feynman: `## FEYNMAN CHECK

### Explain PostCSS Like I'm 10 Years Old
> PostCSS is a PLUGIN PIPELINE for CSS. Unlike Sass (a single language), PostCSS is a tool that parses CSS into an AST (Abstract Syntax Tree), runs PLUGINS that transform the AST, then serialises back to CSS. Each plugin does ONE job: \`autoprefixer\` adds vendor prefixes; \`postcss-preset-env\` polyfills future CSS; \`cssnano\` minifies; \`postcss-import\` inlines @imports. Tailwind, modern Vite/Next.js, and most build systems use PostCSS under the hood. The non-obvious power: you can write your OWN plugin in ~50 lines of JS to enforce house rules, generate utilities, or rewrite tokens.

---

### 5 Deep Conceptual Questions

**Q1: What problem does PostCSS solve that Sass doesn't?**
> **A:** Sass is monolithic — you get the features Sass ships with. PostCSS is COMPOSABLE — pick exactly the transformations you need, write your own, and skip the rest. Want only autoprefixer? Use only autoprefixer. Want to polyfill \`color-mix\` for Safari 14? Use \`postcss-preset-env\` with stage 1. PostCSS is the Babel of CSS — a transformation framework, not a language.

**Q2: Mental model?**
> **A:** PostCSS converts \`color: red;\` into an AST node like \`{type: 'decl', prop: 'color', value: 'red'}\`. Plugins receive these nodes, mutate them, add new ones, or remove them. After all plugins run, PostCSS prints the AST back to CSS. This is identical to how Babel works on JavaScript.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Confusing PostCSS-Nesting with native CSS Nesting:
> \`\`\`css
> /* ❌ Native CSS nesting requires & for child selectors */
> .card { color: red; .title { color: blue; } }    /* Invalid: needs & */
>
> /* ✅ Native CSS Nesting syntax */
> .card { color: red; & .title { color: blue; } }
>
> /* ✅ postcss-nesting plugin: writes either, compiles to legacy CSS */
> \`\`\`

**Q4: How does PostCSS integrate with a modern build system?**
> **A:** Vite, Next.js, and Webpack invoke PostCSS automatically when they see a \`postcss.config.js\` file. The config lists plugins; the bundler runs them on every .css file. Order matters — \`postcss-import\` must run first (inlines imports), then transformation plugins, then \`autoprefixer\`, then \`cssnano\` (last, for minification). A typical pipeline is 5-8 plugins; build time stays under 100ms even on large projects because the AST is small.

**Q5: FAANG-grade definition?**
> **A:** "PostCSS is a CSS-AST transformation framework — parsing CSS into a Node-based tree, running an ordered chain of plugins that mutate, add, or remove nodes, and serialising back to CSS — enabling composable, project-specific tooling (autoprefixing, future-syntax polyfilling, design-token expansion, minification, custom linting) without prescribing a language."`,
    build: `## BUILD

### 🏗️ Mini Project: Build a PostCSS Pipeline With Autoprefixer + preset-env + Custom Plugin

**What you will build:** A real PostCSS build that polyfills \`oklch()\` and \`@nest\` for older browsers, autoprefixes, AND runs a custom plugin that warns about \`!important\`.
**Why this project:** Forces all PostCSS fundamentals: configuration, plugin chaining, custom plugin authoring.
**Time estimate:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir postcss-pipeline && cd postcss-pipeline
npm init -y
npm install --save-dev postcss postcss-cli postcss-preset-env autoprefixer cssnano
ni src/main.css, postcss.config.js, plugins/no-important.js, index.html -ItemType File
\`\`\`

#### Step 2 — Source CSS (modern features)
\`\`\`css
/* src/main.css */
:root { --hue: 220; }

.card {
  background: oklch(0.95 0.02 var(--hue));
  border: 1px solid oklch(0.85 0.02 var(--hue));
  padding: 1rem;
  border-radius: 8px;

  & .title {
    font-size: 1.25rem;
    color: oklch(0.3 0.05 var(--hue));
  }

  & :hover { background: oklch(0.92 0.04 var(--hue)); }
}

.bad { color: red !important; }   /* should trigger our custom plugin warning */
\`\`\`

#### Step 3 — Custom Plugin
\`\`\`javascript
// plugins/no-important.js
module.exports = () => ({
  postcssPlugin: 'no-important',
  Declaration(decl, { result }) {
    if (decl.important) {
      decl.warn(result, \`Avoid !important on "\${decl.prop}: \${decl.value}"\`, { word: '!important' });
    }
  },
});
module.exports.postcss = true;
\`\`\`

#### Step 4 — PostCSS Config
\`\`\`javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('postcss-preset-env')({
      stage: 1,
      features: { 'nesting-rules': true, 'oklab-function': true },
    }),
    require('./plugins/no-important'),
    require('autoprefixer'),
    require('cssnano')({ preset: 'default' }),
  ],
};
\`\`\`
\`\`\`json
// package.json (add)
"scripts": { "build": "postcss src/main.css -o dist/main.css" }
\`\`\`

\`\`\`bash
npm run build
# Watch warnings: "Avoid !important on color: red"
\`\`\`

#### Step 5 — HTML + Tests
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="dist/main.css"></head>
<body>
  <div class="card">
    <h2 class="title">PostCSS Pipeline</h2>
    <p>Nesting → flat selectors. oklch → rgb fallback. Vendor prefixes added.</p>
  </div>
  <p class="bad">This line should trigger a warning during build.</p>
</body></html>
\`\`\`
\`\`\`javascript
// In Node tests
const fs = require('fs');
const out = fs.readFileSync('dist/main.css', 'utf8');
console.assert(!out.includes('& '), 'Nesting should be flattened');
console.assert(out.includes('rgb'),  'oklch should be polyfilled to rgb fallback');
\`\`\`

**Expected Output:**
\`\`\`
- src/main.css uses oklch, nesting, custom properties
- dist/main.css: nesting flattened, oklch has rgb() fallback, vendor prefixes added, minified
- Build logs: "Avoid !important on color: red" (from custom plugin)
- File size after cssnano: typically 60-80% smaller than source
\`\`\`

**Stretch:**
- [ ] Write a plugin that auto-converts \`px\` to \`rem\` based on a 16px root
- [ ] Add \`postcss-import\` and split into multiple source files
- [ ] Add stylelint and integrate it into the same pipeline`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What is PostCSS at a high level? How is it different from Sass?
**Q2:** Name three commonly-used PostCSS plugins.
**Q3:** Write a postcss.config.js with autoprefixer + cssnano. From memory.

### Day 3 — Comprehension
**Q4:** Why must plugin order matter? Give an example where wrong order breaks output.
**Q5:** A custom plugin needs to add a new declaration. What's the minimum API surface to call?
**Q6:** Refactor: this Sass-only project should migrate to PostCSS — list the plugins needed.

### Day 7 — Application
**Q7:** Write a PostCSS plugin that prepends \`/* (c) DevMastery 2026 */\` to every output file.
**Q8:** A PR adds a plugin that doubles build time. How do you profile and decide whether to keep it?
**Q9:** How does PostCSS interact with CSS Modules and Tailwind?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every step from \`oklch(0.6 0.18 220)\` in source to the bytes in the browser's stylesheet."
**Q11:** Draw: how does PostCSS fit between source CSS, bundler, and browser?
**Q12:** ★ System design: "Design a CSS toolchain for a monorepo with 50 packages, each with its own design tokens. Where does PostCSS sit? Where does Tailwind?"`
  },

  // ── 24. css-in-js ────────────────────────────────────────────────────────
  'css-in-js': {
    feynman: `## FEYNMAN CHECK

### Explain CSS-in-JS Like I'm 10 Years Old
> CSS-in-JS writes your styles INSIDE your JavaScript components — using libraries like styled-components, emotion, vanilla-extract, or Linaria. The library generates UNIQUE class names per component (\`.sc-abc123\`) so styles never leak. Two flavours: RUNTIME (styled-components, emotion — CSS generated and injected in the browser) vs ZERO-RUNTIME (vanilla-extract, Linaria — CSS extracted at build time into static .css files). Runtime gives full dynamic theming via props; zero-runtime gives faster page loads. In 2026, the trend has swung hard toward zero-runtime — React Server Components made runtime CSS-in-JS measurably slower.

---

### 5 Deep Conceptual Questions

**Q1: What problem did CSS-in-JS solve?**
> **A:** Component-scoped styles without naming conventions. Pre-CSS-in-JS, you needed BEM discipline to keep \`.Button\` from colliding with someone else's \`.Button\`. CSS-in-JS auto-generates unique class names, co-locates styles with components (delete the component, the styles vanish), and lets you derive styles from props/state with the full power of JavaScript. The trade-off — added bundle size and runtime overhead — became acceptable in the React era.

**Q2: Mental model: runtime vs zero-runtime?**
> **A:** Runtime CSS-in-JS: every \`<StyledButton primary={true}>\` call evaluates a template literal in JS, generates CSS text, hashes it for a class name, injects a \`<style>\` tag — every render. Zero-runtime: a Babel/SWC plugin reads your styled definitions at BUILD time, extracts them to a static CSS file, and replaces JS template calls with the generated class name — no runtime JS, just regular CSS in the browser.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing styled-components are free of cost:
> \`\`\`tsx
> /* ❌ Generates a new class name + injects new CSS on every prop change */
> const Btn = styled.button\`background: \${p => p.bg};\`;
> <Btn bg="#" + Math.random() />   // hundreds of styles in <head>!
>
> /* ✅ Stable variants via attribute */
> const Btn = styled.button\`
>   &[data-variant="primary"] { background: blue; }
>   &[data-variant="danger"]  { background: red; }
> \`;
> <Btn data-variant="primary" />
> \`\`\`

**Q4: How does CSS-in-JS interact with React Server Components?**
> **A:** Runtime CSS-in-JS depends on a browser-side context that doesn't exist in RSC — styles can't be generated during server render of components that don't ship JS. This is why styled-components and emotion don't work in Next.js App Router server components. Zero-runtime libraries (vanilla-extract, Panda CSS, StyleX) work fine because their CSS is statically extracted at build time. This single technical fact has reshaped the 2026 CSS-in-JS landscape.

**Q5: FAANG-grade definition?**
> **A:** "CSS-in-JS is a paradigm for co-locating component styles with JavaScript through string-template or object-literal APIs that generate scoped class names — either at runtime (template evaluation + style injection per render, providing prop-driven dynamism) or at build time (static AST extraction, producing zero-runtime CSS files), with React Server Components effectively mandating the latter approach for production performance."`,
    build: `## BUILD

### 🏗️ Mini Project: Themed Button With styled-components AND vanilla-extract — Compare Both

**What you will build:** The same themed button implemented twice — once with styled-components (runtime), once with vanilla-extract (zero-runtime) — then measure the bundle size + render cost difference.
**Why this project:** Forces understanding the runtime vs zero-runtime trade-off through actual measurement.
**Time estimate:** 40 minutes

#### Step 1 — Setup
\`\`\`bash
npx create-vite@latest cssjs-demo -- --template react-ts
cd cssjs-demo
npm install
npm install styled-components @types/styled-components
npm install -D @vanilla-extract/css @vanilla-extract/vite-plugin
\`\`\`

#### Step 2 — styled-components Version
\`\`\`tsx
// src/StyledButton.tsx
import styled, { css } from 'styled-components';

const variants = {
  primary: css\`background: #2a9d8f; color: white;\`,
  danger:  css\`background: #d33;    color: white;\`,
  ghost:   css\`background: transparent; color: #2a9d8f; border: 2px solid #2a9d8f;\`,
};

export const StyledButton = styled.button<{ variant?: keyof typeof variants }>\`
  padding: 0.5em 1em;
  border-radius: 4px;
  border: 0;
  font: inherit;
  cursor: pointer;
  transition: filter 0.15s;
  &:hover { filter: brightness(1.08); }
  \${p => variants[p.variant ?? 'primary']};
\`;
\`\`\`

#### Step 3 — vanilla-extract Version
\`\`\`typescript
// src/Button.css.ts
import { style, styleVariants } from '@vanilla-extract/css';

const base = style({
  padding: '0.5em 1em',
  borderRadius: 4,
  border: 0,
  font: 'inherit',
  cursor: 'pointer',
  transition: 'filter 0.15s',
  ':hover': { filter: 'brightness(1.08)' },
});

export const button = styleVariants({
  primary: [base, { background: '#2a9d8f', color: 'white' }],
  danger:  [base, { background: '#d33',    color: 'white' }],
  ghost:   [base, { background: 'transparent', color: '#2a9d8f',
                    border: '2px solid #2a9d8f' }],
});
\`\`\`
\`\`\`tsx
// src/Button.tsx
import { button } from './Button.css';
export function Button({ variant = 'primary' as keyof typeof button, ...rest }) {
  return <button className={button[variant]} {...rest} />;
}
\`\`\`

#### Step 4 — App Using Both (For Comparison)
\`\`\`tsx
// src/App.tsx
import { StyledButton } from './StyledButton';
import { Button } from './Button';
export default function App() {
  return (
    <div style={{ padding: 24, display: 'grid', gap: 16 }}>
      <h2>styled-components (runtime)</h2>
      <StyledButton variant="primary">Primary</StyledButton>
      <StyledButton variant="danger">Danger</StyledButton>
      <h2>vanilla-extract (zero-runtime)</h2>
      <Button variant="primary">Primary</Button>
      <Button variant="danger">Danger</Button>
    </div>
  );
}
\`\`\`

#### Step 5 — Tests: Bundle Comparison
\`\`\`bash
npm run build
# Inspect dist/assets/*.js — find the size difference:
# styled-components version: +12kb JS for the runtime
# vanilla-extract version:   adds 0kb JS, +1kb CSS
\`\`\`
\`\`\`javascript
// Measure render cost
console.time('styled-components render');
for (let i=0;i<10000;i++) { /* render Styled */ }
console.timeEnd('styled-components render');

console.time('vanilla-extract render');
for (let i=0;i<10000;i++) { /* render Button */ }
console.timeEnd('vanilla-extract render');
\`\`\`

**Expected Output:**
\`\`\`
- Both buttons look identical in the UI
- styled-components bundle: +12-15kb JS (the runtime + template parser)
- vanilla-extract bundle:   +0kb JS, +1kb CSS in a static stylesheet
- 10k renders: styled-components ~30ms, vanilla-extract ~3ms (10x faster)
- vanilla-extract works in React Server Components; styled-components does not
\`\`\`

**Stretch:**
- [ ] Add dynamic theme switching to both — note which is more ergonomic
- [ ] Profile each in Chrome DevTools Performance and compare hydration cost
- [ ] Migrate the styled-components version to emotion and compare`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Difference between runtime and zero-runtime CSS-in-JS?
**Q2:** Name a library for each.
**Q3:** Write a styled-components button with hover state. From memory.

### Day 3 — Comprehension
**Q4:** Why don't styled-components work in React Server Components?
**Q5:** A junior creates 1000 styled-button instances with different prop values — what goes wrong?
**Q6:** Refactor this to use stable variants (data-attribute pattern):
\`\`\`tsx
const Btn = styled.button\`color: \${p => p.color};\`;
<Btn color="red" />
\`\`\`

### Day 7 — Application
**Q7:** Build a theme provider that works for both styled-components and CSS variables.
**Q8:** A PR replaces all styled-components with emotion. What changes? What stays the same?
**Q9:** How does CSS-in-JS interact with Tailwind in the same codebase?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Why has the industry moved from styled-components to zero-runtime libraries in 2024-2026?"
**Q11:** Draw: lifecycle of a styled-component from import → render → DOM update.
**Q12:** ★ System design: "Pick a CSS strategy for a Next.js 15 app with React Server Components, multi-brand theming, and a goal of < 50kb CSS+JS."`
  },

  // ── 25. tailwind-deep ────────────────────────────────────────────────────
  'tailwind-deep': {
    feynman: `## FEYNMAN CHECK

### Explain Tailwind In Depth Like I'm 10 Years Old
> Tailwind is UTILITY-FIRST CSS — instead of writing \`.btn { padding: 8px 16px; background: blue; }\`, you write \`<button class="px-4 py-2 bg-blue-500">\` directly in HTML. Each class does ONE thing. Tailwind ships with thousands of these atomic utilities; a JIT (Just-In-Time) compiler scans your HTML and outputs ONLY the utilities you used (so the final CSS is tiny — typically 10-15kb gzipped). The non-obvious power: \`tailwind.config.js\` lets you customise every token (colors, spacing, breakpoints), and the \`@apply\` directive lets you compose utilities into traditional component classes when needed.

---

### 5 Deep Conceptual Questions

**Q1: Why has Tailwind eaten the world (in 2026)?**
> **A:** Three factors. (1) The CSS file stops growing — new components reuse existing utilities, so adding 100 components adds ~0 bytes of CSS. (2) Local reasoning — every style change happens INSIDE the component file, no jumping to CSS to chase a class. (3) Constraint-driven design — utilities snap to your design tokens (\`p-4\` not \`padding: 17px\`), enforcing consistency. The trade-off (verbose HTML) was overpriced; the win (deletable, refactor-safe styles) was underpriced.

**Q2: Mental model: how does Tailwind generate CSS?**
> **A:** The JIT compiler scans every file matching \`content: ["./src/**/*.{html,tsx}"]\` in your config. For every class name it sees that matches a Tailwind utility pattern (e.g., \`bg-blue-500\`, \`p-[17px]\`, \`md:flex\`), it emits the corresponding CSS rule. Classes you never use never appear in the output. This is fundamentally different from frameworks like Bootstrap that ship a fixed stylesheet — Tailwind's output is bespoke per project.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Building class strings dynamically:
> \`\`\`tsx
> /* ❌ JIT can't see the full string at build time — utilities missing */
> <div className={\`text-\${color}-500\`} />   // text-red-500 silently absent
>
> /* ✅ Use complete class names or safelist them in config */
> <div className={color === 'red' ? 'text-red-500' : 'text-blue-500'} />
>
> // OR in tailwind.config.js: safelist: ['text-red-500', 'text-blue-500']
> \`\`\`

**Q4: How does Tailwind interact with the cascade at runtime?**
> **A:** Tailwind utilities are LOW SPECIFICITY (single class). Conflicts (e.g., \`p-4 p-8\`) resolve by SOURCE ORDER — last one in the generated CSS wins, NOT last one in the HTML. Tailwind sorts utilities into a deterministic order at build time; the \`tailwind-merge\` helper handles run-time class merging in components. Modifiers (\`hover:\`, \`md:\`) generate \`:hover\` and \`@media\` wrapped rules, evaluated by the browser normally.

**Q5: FAANG-grade definition?**
> **A:** "Tailwind is a utility-first CSS framework with a JIT compiler that generates atomic CSS rules from class-name patterns scanned in source files, producing a minimal stylesheet of only the utilities used — operating as a design-token-driven system where \`tailwind.config.js\` defines the constraint space, \`@apply\`/\`@layer\` enable component-level composition, and arbitrary-value syntax (\`p-[17px]\`) provides escape hatches without breaking the constraint model."`,
    build: `## BUILD

### 🏗️ Mini Project: Pricing Page With Custom Theme, Dark Mode, and @apply Components

**What you will build:** A full pricing page in Tailwind v4 with custom design tokens, dark mode toggle, responsive 3-column → 1-column collapse, and a reusable Button component using \`@apply\`.
**Why this project:** Forces every important Tailwind feature: config, theming, dark mode, responsive, @apply, dynamic content safelisting.
**Time estimate:** 45 minutes

#### Step 1 — Setup
\`\`\`bash
npx create-vite@latest tw-pricing -- --template vanilla-ts
cd tw-pricing && npm install
npm install -D tailwindcss @tailwindcss/vite
\`\`\`

#### Step 2 — Tailwind Config + Theme
\`\`\`javascript
// tailwind.config.js  (v4 reads CSS-based config preferred, shown JS for clarity)
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { 50: '#f0fdfb', 500: '#2a9d8f', 700: '#206a60' },
      },
      fontFamily: { sans: ['Inter', 'system-ui'] },
      borderRadius: { card: '12px' },
    },
  },
};
\`\`\`
\`\`\`css
/* src/main.css */
@import "tailwindcss";

@layer components {
  .btn {
    @apply inline-block px-4 py-2 rounded-md font-medium transition;
    @apply bg-brand-500 text-white hover:bg-brand-700;
    @apply focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-700;
  }
  .btn-ghost {
    @apply bg-transparent text-brand-500 border-2 border-brand-500 hover:bg-brand-50;
  }
}
\`\`\`

#### Step 3 — HTML
\`\`\`html
<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width">
  <link rel="stylesheet" href="src/main.css"></head>
<body class="font-sans bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
  <header class="flex justify-between items-center px-8 py-4">
    <strong>DevMastery</strong>
    <button id="toggle" class="btn-ghost btn">Toggle dark</button>
  </header>

  <main class="px-8">
    <h1 class="text-4xl font-bold text-center mb-8">Pricing</h1>
    <div class="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
      <article class="bg-white dark:bg-gray-800 p-6 rounded-card shadow">
        <h2 class="text-xl font-semibold mb-1">Free</h2>
        <p class="text-3xl font-bold">$0<span class="text-base font-normal">/mo</span></p>
        <ul class="mt-4 space-y-1 text-sm"><li>✓ Basic features</li><li>✓ Community</li></ul>
        <button class="btn w-full mt-4">Start free</button>
      </article>
      <article class="bg-brand-500 text-white p-6 rounded-card shadow-lg md:scale-105">
        <h2 class="text-xl font-semibold mb-1">Pro</h2>
        <p class="text-3xl font-bold">$19<span class="text-base font-normal">/mo</span></p>
        <ul class="mt-4 space-y-1 text-sm"><li>✓ All free features</li><li>✓ Priority support</li><li>✓ Pro components</li></ul>
        <button class="btn bg-white text-brand-700 w-full mt-4 hover:bg-brand-50">Upgrade</button>
      </article>
      <article class="bg-white dark:bg-gray-800 p-6 rounded-card shadow">
        <h2 class="text-xl font-semibold mb-1">Team</h2>
        <p class="text-3xl font-bold">$49<span class="text-base font-normal">/mo</span></p>
        <ul class="mt-4 space-y-1 text-sm"><li>✓ All pro features</li><li>✓ SSO</li><li>✓ Audit log</li></ul>
        <button class="btn-ghost btn w-full mt-4">Contact sales</button>
      </article>
    </div>
  </main>

  <script type="module" src="src/main.ts"></script>
</body></html>
\`\`\`

#### Step 4 — Error Handling: Dark Mode Persistence + Safelist
\`\`\`typescript
// src/main.ts
const root = document.documentElement;
const btn  = document.getElementById('toggle')!;
const saved = localStorage.getItem('theme');
if (saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches)) {
  root.classList.add('dark');
}
btn.addEventListener('click', () => {
  root.classList.toggle('dark');
  localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
});
\`\`\`

#### Step 5 — Tests
\`\`\`bash
npm run build
# Inspect dist/assets/*.css size — should be ~10-15kb after gzip
gzip -c dist/assets/*.css | wc -c
\`\`\`
\`\`\`javascript
// Verify only used utilities are present
const css = await (await fetch('dist/assets/' + Object.keys(window.__manifest)[0])).text();
console.log('Stylesheet bytes:', css.length);
console.assert(!css.includes('.text-purple-300'), 'Unused utilities should be tree-shaken');
\`\`\`

**Expected Output:**
\`\`\`
- 3-column pricing layout on ≥768px, stacks to 1 column on mobile
- Featured "Pro" plan scaled 105% on desktop
- Toggle button flips dark mode; preference saved to localStorage
- Output CSS contains ONLY utilities used (no purple, no flex if unused)
- Custom brand-500 color used throughout, defined once in config
- .btn class composed via @apply — JSX uses plain "btn" everywhere
\`\`\`

**Stretch:**
- [ ] Add a hover animation using \`group-hover\` and \`transition\`
- [ ] Add a custom plugin to Tailwind that generates "scrollbar-thin" utility
- [ ] Profile the rendered CSS — compare with the same page in vanilla CSS`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does "utility-first" mean? Give 5 utility class examples.
**Q2:** How does Tailwind keep the output CSS small?
**Q3:** Write the Tailwind classes for: a button with primary background, padded, rounded, hover-darkens. From memory.

### Day 3 — Comprehension
**Q4:** When does \`text-\${color}-500\` (dynamic class string) silently break?
**Q5:** A junior tries \`<div class="p-4 p-8">\` expecting p-8 to win. Explain what actually decides which wins.
**Q6:** Refactor this verbose markup using \`@apply\`:
\`\`\`html
<button class="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-700">A</button>
<button class="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-700">B</button>
<button class="px-4 py-2 bg-brand-500 text-white rounded hover:bg-brand-700">C</button>
\`\`\`

### Day 7 — Application
**Q7:** Build a responsive card grid in 8 utility classes or fewer.
**Q8:** A PR turns \`text-red-500\` to dynamic — JIT misses it. Fix two ways (refactor + safelist).
**Q9:** When is Tailwind a BAD choice? Name two real scenarios.

### Day 14 — Synthesis
**Q10:** ★ Interview: "Defend Tailwind to a skeptic who says it's just inline styles by another name."
**Q11:** Draw: how does the JIT compiler interact with your bundler and source files?
**Q12:** ★ System design: "Migrate a 50-component design system from styled-components to Tailwind. What is the rollout strategy and theming layer?"`
  },

  // ── 26. css-performance ──────────────────────────────────────────────────
  'css-performance': {
    feynman: `## FEYNMAN CHECK

### Explain CSS Performance Like I'm 10 Years Old
> CSS performance is about MINIMISING the work the browser does per frame. Three big costs: (1) BYTES — every kb of CSS delays first paint because CSS is render-blocking; (2) PARSE+MATCH — complex selectors and deep DOMs cost CPU; (3) LAYOUT+PAINT+COMPOSITE — changing certain properties triggers expensive recalculation. The golden rules: animate only \`transform\` and \`opacity\` (compositor-only), use \`will-change\` sparingly (it costs memory), add \`content-visibility: auto\` to offscreen sections (browser skips rendering until needed), and avoid huge selectors like \`* { box-sizing: border-box; }\` on enormous DOMs.

---

### 5 Deep Conceptual Questions

**Q1: What are the three stages of CSS performance cost?**
> **A:** (1) DELIVERY — bytes over the wire, render-blocking until parsed. (2) STYLE COMPUTATION — for each element, find matching rules, resolve cascade, compute used values. Cost is O(elements × rules). (3) LAYOUT/PAINT/COMPOSITE — applying styles to pixels. Layout is recursive (changing one width can cascade), paint rasterises layers, composite assembles them on the GPU. Each later stage is usually MORE expensive than the previous, so optimising the right one matters.

**Q2: Mental model for "what triggers what"?**
> **A:** Memorise the three categories:
> - **LAYOUT** properties (width, height, top, padding, margin, border, font-size, display) → re-layout + paint + composite
> - **PAINT** properties (color, background, box-shadow, border-radius) → paint + composite
> - **COMPOSITE** properties (transform, opacity, filter) → composite only
> Animate ONLY the third category for 60fps. The site csstriggers.com is the cheat sheet.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Believing \`will-change\` is free:
> \`\`\`css
> /* ❌ Promoting every card to its own GPU layer — VRAM explosion */
> .card { will-change: transform; }
>
> /* ✅ Promote only what is ACTIVELY animating, and remove after */
> .card.is-animating { will-change: transform; }
> // JS: el.classList.add('is-animating');
> //     animation.onfinish = () => el.classList.remove('is-animating');
> \`\`\`

**Q4: How does \`content-visibility: auto\` work at runtime?**
> **A:** \`content-visibility: auto\` tells the browser "if this element is offscreen, skip layout/paint for its subtree until it nears the viewport." The browser uses a hint called \`contain-intrinsic-size\` to reserve placeholder space. For a 10,000-row table, this can turn a 4-second initial render into 200ms by skipping rendering of all rows beyond the viewport. Cost: the browser must do extra work on scroll to enter/exit content-visibility on each section.

**Q5: FAANG-grade definition?**
> **A:** "CSS performance is the joint optimisation of stylesheet delivery (file size, render-blocking, critical CSS extraction), style invalidation cost (selector complexity, descendant invalidation triggered by mutations), and rendering pipeline stage costs (composite-only animations, will-change-driven layer promotion, contain/content-visibility-driven rendering skip) — measured via Core Web Vitals (LCP, CLS, INP) and Chrome DevTools Performance traces."`,
    build: `## BUILD

### 🏗️ Mini Project: Optimise a 10,000-Row Table to 60fps Scroll With CSS Only

**What you will build:** A table with 10,000 rows that scrolls smoothly using \`content-visibility: auto\`, \`contain: layout style paint\`, and avoiding common CSS performance traps.
**Why this project:** Forces every modern CSS performance feature: containment, content-visibility, GPU acceleration, will-change.
**Time estimate:** 30 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir css-perf && cd css-perf
ni index.html, style.css -ItemType File
\`\`\`

#### Step 2 — HTML (10,000 rows generated client-side)
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
  <h1>10,000-Row Table</h1>
  <div class="scroll">
    <table id="tbl">
      <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>City</th></tr></thead>
      <tbody></tbody>
    </table>
  </div>
  <script>
    const tbody = document.querySelector('#tbl tbody');
    const frag = document.createDocumentFragment();
    for (let i=1;i<=10000;i++) {
      const tr = document.createElement('tr');
      tr.innerHTML = \`<td>\${i}</td><td>User \${i}</td><td>user\${i}@dev.io</td><td>NYC</td>\`;
      frag.appendChild(tr);
    }
    tbody.appendChild(frag);
  </script>
</body></html>
\`\`\`

#### Step 3 — Performance CSS
\`\`\`css
body { font: 14px system-ui; margin: 0; padding: 1rem; }
h1 { margin-bottom: 1rem; }
.scroll { height: 80vh; overflow: auto; border: 1px solid #ddd; }

table { width: 100%; border-collapse: collapse; }
th, td { padding: 8px 12px; border-bottom: 1px solid #eee; text-align: left; }
thead th { position: sticky; top: 0; background: #f5f5f7; z-index: 1; }

/* The killer optimisation: */
tbody tr {
  content-visibility: auto;             /* skip render when offscreen */
  contain-intrinsic-size: 0 36px;       /* reserve space for unrendered rows */
  contain: layout style paint;          /* isolate row from siblings */
}

/* GPU-friendly hover */
tbody tr:hover { background: #f0f8ff; }
\`\`\`

#### Step 4 — Error Handling: Measure & Compare
\`\`\`javascript
// Toggle the optimisation off to see the difference
const styleEl = document.createElement('style');
document.head.appendChild(styleEl);

document.body.insertAdjacentHTML('beforeend',
  '<button id="toggle">Toggle content-visibility</button>');
let optimised = true;
document.getElementById('toggle').onclick = () => {
  optimised = !optimised;
  styleEl.textContent = optimised ? '' :
    \`tbody tr { content-visibility: visible !important; contain: none !important; }\`;
  console.log('Optimised:', optimised);
};
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
// Measure scroll FPS
let frames = 0, last = performance.now();
function tick(now) {
  frames++;
  if (now - last > 1000) {
    console.log('FPS:', frames);
    frames = 0; last = now;
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// Measure initial render time
console.time('initial render');
window.addEventListener('load', () => console.timeEnd('initial render'));
\`\`\`

**Expected Output:**
\`\`\`
- With optimisations: initial render <300ms, scroll FPS 60
- Without (toggle off):   initial render >3s,   scroll FPS 20-30 on mid-range device
- Memory: optimised version uses ~10MB less because offscreen DOM isn't fully laid out
- DevTools Performance: optimised version shows almost no "Recalculate Style" cost on scroll
\`\`\`

**Stretch:**
- [ ] Add \`will-change: scroll-position\` to the scroller and measure the effect
- [ ] Profile in Chrome DevTools → Performance, compare layout cost before/after
- [ ] Build a virtualised version with JS and compare to pure CSS content-visibility`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** Name properties that trigger LAYOUT vs PAINT vs COMPOSITE only.
**Q2:** What does \`content-visibility: auto\` do?
**Q3:** Write the CSS to isolate a card so its changes don't invalidate siblings. From memory.

### Day 3 — Comprehension
**Q4:** Why is animating \`width\` more expensive than animating \`transform: scaleX()\`?
**Q5:** A junior adds \`will-change: transform\` to every card. Diagnose the problem.
**Q6:** Optimise:
\`\`\`css
@keyframes slide { from { left: 0; } to { left: 200px; } }
.box { position: relative; animation: slide 0.3s; }
\`\`\`

### Day 7 — Application
**Q7:** Build a long-form blog page with \`content-visibility: auto\` on each section.
**Q8:** A PR adds a complex \`box-shadow\` on every list item and scrolling jank appears. Diagnose.
**Q9:** What does \`contain: strict\` do? When is it safe to use?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Walk me through every step from a CSS file in the network tab to pixels on the screen, naming each performance cost."
**Q11:** Draw: how do containment, content-visibility, and will-change interact with the rendering pipeline?
**Q12:** ★ System design: "Optimise CSS for an enterprise dashboard with 200 widgets, real-time data updates, and a goal of < 100ms INP."`
  },

  // ── 27. printing-css ─────────────────────────────────────────────────────
  'printing-css': {
    feynman: `## FEYNMAN CHECK

### Explain Print CSS Like I'm 10 Years Old
> Print CSS controls how your web page looks when SAVED AS PDF or PRINTED. The browser switches to "print media" — applies your \`@media print\` rules, removes interactive UI, paginates content, and renders to paper-sized pages. Real superpowers: \`@page\` controls margins and headers; \`page-break-before\`/\`break-inside\` prevents tables splitting awkwardly; \`size: A4 portrait\` sets page format. Invoice generators, exam papers, recipes, and academic papers all rely on print CSS — and almost every developer ignores it, producing PDFs with cut-off content, hyperlink chaos, and dark-mode backgrounds wasting toner.

---

### 5 Deep Conceptual Questions

**Q1: What problem does print CSS solve?**
> **A:** Most web pages look terrible when printed: dark backgrounds, missing critical content, broken pagination, navigation bars taking 25% of every page, links showing as underlined-only with the URL invisible. Print CSS gives you a parallel stylesheet that activates ONLY at print/PDF time, letting you hide UI chrome, switch to print-safe colors, expand URLs inline ("Visit example.com — example.com"), and control page breaks.

**Q2: Mental model?**
> **A:** Think of \`@media print\` as a TOTALLY DIFFERENT context. Display, layout, and most properties still work, but: there's no scroll, viewport equals page size, and the browser handles pagination. \`@page\` rules let you control page margins and orientation. CSS Generated Content (\`::before\`/\`::after\`) is your best friend for adding running headers/footers.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Forgetting that backgrounds are stripped by default:
> \`\`\`css
> /* ❌ The branded gradient header is GONE in print — toner-saving default */
> .header { background: linear-gradient(blue, purple); color: white; }
>
> /* ✅ Force colors when actually needed for legibility */
> @media print {
>   .header {
>     -webkit-print-color-adjust: exact;
>             print-color-adjust:  exact;
>   }
> }
> \`\`\`

**Q4: How does pagination interact with CSS at runtime?**
> **A:** Browsers paginate by walking the rendered document and inserting page breaks at fragmentation points. \`break-before: page\` forces a new page; \`break-inside: avoid\` keeps an element on one page if possible; \`orphans\` / \`widows\` control how many lines may sit alone at page bottom/top. The browser tries hard but doesn't always succeed — testing with actual "Print to PDF" is mandatory.

**Q5: FAANG-grade definition?**
> **A:** "Print CSS is a parallel rendering pipeline activated via \`@media print\` and configured by \`@page\` rules — driving the user-agent's paged-media fragmentation engine using break-before/break-after/break-inside hints, with print-specific color adjustment (print-color-adjust), generated content for running headers, and link-URL expansion via \`content: ' (' attr(href) ')'\` — collectively producing professional-grade printed output without server-side rendering."`,
    build: `## BUILD

### 🏗️ Mini Project: Invoice Page That Prints Perfectly to A4

**What you will build:** A web invoice that looks great on screen AND produces a clean A4 PDF when printed — with correct margins, no UI chrome, expanded URLs, and proper page breaks for long line-item tables.
**Why this project:** Forces every important print-CSS feature: @page, color-adjust, break-inside, generated content for links.
**Time estimate:** 25 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir print-invoice && cd print-invoice
ni invoice.html, style.css -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
  <nav class="ui-only"><button onclick="window.print()">Print / Save PDF</button></nav>
  <article class="invoice">
    <header>
      <h1>Invoice #INV-2026-0421</h1>
      <p>Date: 2026-06-26 · <a href="https://devmastery.io">https://devmastery.io</a></p>
    </header>
    <section><strong>Bill to:</strong><br>Acme Corp · 1 Infinite Loop · Cupertino</section>
    <table>
      <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
      <tbody>
        <!-- 30 line items so we can test pagination -->
        ${'<tr><td>Pro license</td><td>1</td><td>$19</td><td>$19</td></tr>'.repeat(30)}
      </tbody>
      <tfoot>
        <tr><td colspan="3">Subtotal</td><td>$570</td></tr>
        <tr><td colspan="3">Tax (10%)</td><td>$57</td></tr>
        <tr class="total"><td colspan="3">Total due</td><td>$627</td></tr>
      </tfoot>
    </table>
    <footer>Thank you for your business · <a href="mailto:billing@devmastery.io">billing@devmastery.io</a></footer>
  </article>
</body></html>
\`\`\`

#### Step 3 — Screen + Print Styles
\`\`\`css
/* Screen */
body { font: 14px system-ui; max-width: 800px; margin: 2rem auto;
       padding: 1rem; background: #f5f5f7; }
.invoice { background: white; padding: 2rem; box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
h1 { margin: 0; }
table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
th, td { padding: 0.5rem; border-bottom: 1px solid #eee; text-align: left; }
th { background: #f0f0f5; }
tfoot td { font-weight: 600; }
.total td { background: #f0f0f5; }
nav.ui-only button { padding: 0.5rem 1rem; cursor: pointer; }

/* Print */
@media print {
  @page {
    size: A4;
    margin: 1.5cm;
    @top-right { content: "Invoice INV-2026-0421"; font-size: 10pt; color: #666; }
    @bottom-right { content: "Page " counter(page) " of " counter(pages); font-size: 10pt; color: #666; }
  }

  body { background: white; max-width: none; margin: 0; padding: 0; font-size: 11pt; }
  .invoice { box-shadow: none; padding: 0; }
  .ui-only { display: none !important; }    /* hide the print button itself */

  thead { display: table-header-group; }    /* repeat header on each page */
  tr, td, th { break-inside: avoid; }       /* don't split rows */
  tfoot { break-before: avoid; }            /* keep total with last items */

  /* Expand URLs inline so paper reader can see them */
  a[href^="http"]::after, a[href^="mailto"]::after {
    content: " (" attr(href) ")"; font-size: 0.85em; color: #555;
  }

  /* Force key brand color */
  h1, .total td {
    -webkit-print-color-adjust: exact;
            print-color-adjust:  exact;
  }
}
\`\`\`

#### Step 4 — Error Handling: Multi-Page Safety
\`\`\`css
@media print {
  /* Avoid widow/orphan lines */
  p { orphans: 3; widows: 3; }
  /* Headings always stay with following content */
  h1, h2, h3 { break-after: avoid; }
  /* Long tables: ensure the totals row is together */
  tfoot tr { break-inside: avoid; }
}
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
// Browser: Ctrl/Cmd+P to test print preview
// Verify:
//   - Header repeats on each page (display: table-header-group)
//   - Page numbers appear in bottom-right
//   - URLs expand in parentheses next to each link
//   - The 30-row table paginates cleanly
//   - Totals row stays grouped with subtotal/tax
\`\`\`

**Expected Output:**
\`\`\`
- Screen: clean invoice on light gray background, button visible
- Print preview: A4 portrait, 1.5cm margins
- Page 1: header + ~20 items
- Page 2: header repeats, remaining ~10 items + totals row
- Bottom-right of every page: "Page 1 of 2", "Page 2 of 2"
- Links read aloud-friendly: "DevMastery (https://devmastery.io)"
\`\`\`

**Stretch:**
- [ ] Add a watermark via \`@page :first { background: url(watermark.svg); }\`
- [ ] Localise the running header to user's language
- [ ] Generate the same invoice server-side with Puppeteer and compare`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** How do you target print-only styles?
**Q2:** What does \`@page\` control?
**Q3:** Write 3 lines of CSS to expand link URLs inline when printing. From memory.

### Day 3 — Comprehension
**Q4:** Why doesn't your blue header gradient appear in the printed PDF? How do you force it?
**Q5:** A table with 100 rows splits a row in half mid-page. Fix it with one property.
**Q6:** Refactor: this print stylesheet doesn't hide the cookie banner.
\`\`\`css
.cookie-banner { background: yellow; position: fixed; bottom: 0; }
\`\`\`

### Day 7 — Application
**Q7:** Build a recipe page that prints with the ingredients list on page 1 and instructions on page 2.
**Q8:** A PR uses px units throughout — should print use px or mm/cm? Justify.
**Q9:** What's the difference between \`break-before: page\` and \`page-break-before: always\`?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Design the print stylesheet for an academic journal — running headers, footnotes, page numbers, two-column layout."
**Q11:** Draw: pipeline from HTML → screen rendering vs print rendering — what is common, what diverges?
**Q12:** ★ System design: "An e-commerce site needs 'Save invoice as PDF.' Client-side print CSS, server-side Puppeteer, or paid PDF service? Decision matrix."`
  },

  // ── 28. custom-properties-advanced ───────────────────────────────────────
  'custom-properties-advanced': {
    feynman: `## FEYNMAN CHECK

### Explain Advanced Custom Properties Like I'm 10 Years Old
> Beyond basic theming, custom properties unlock superpowers when combined with \`@property\`. Plain \`--hue: 220\` is untyped and instantly-swappable (no interpolation). \`@property --hue { syntax: '<number>'; initial-value: 220; inherits: true; }\` REGISTERS the property — now it's typed, has a fallback, and is ANIMATABLE. This single change makes gradients animatable, colors transitionable, and CSS Houdini Paint Worklets able to consume CSS variables as typed inputs. Combined with \`@scope\` for locality and \`@layer\` for cascade control, custom properties become a complete component-API mechanism — letting you pass "props" to CSS components from HTML alone.

---

### 5 Deep Conceptual Questions

**Q1: What problem does \`@property\` solve?**
> **A:** Untyped custom properties can't be interpolated — \`transition: --hue 0.3s\` does nothing because the browser doesn't know whether \`--hue\` is a number, a color, or a string. \`@property\` registers it with a SYNTAX descriptor (\`<number>\`, \`<color>\`, \`<length>\`), giving the browser enough type information to interpolate frame-by-frame. Suddenly gradients, rotations, and complex variables become smoothly animatable.

**Q2: Mental model: custom properties as component API?**
> **A:** Think of \`--btn-bg\`, \`--btn-padding\`, \`--btn-radius\` as the PUBLIC API of a button component. The component CSS reads these with fallbacks: \`background: var(--btn-bg, blue);\`. Consumers customise via inline style or CSS scope: \`<button style="--btn-bg: red">\` or \`section { --btn-bg: green; }\`. This eliminates the need for modifier classes or component variants — every styling axis is a variable.

**Q3: Most dangerous misconception? Show with code.**
> **A:** Mixing typed and untyped:
> \`\`\`css
> /* ❌ --hue is untyped, transition is silently ignored */
> :root { --hue: 220; }
> .hero { background: oklch(0.6 0.2 var(--hue)); transition: --hue 0.5s; }
>
> /* ✅ Register the property → transition works */
> @property --hue { syntax: "<number>"; initial-value: 220; inherits: true; }
> :root { --hue: 220; }
> .hero { background: oklch(0.6 0.2 var(--hue)); transition: --hue 0.5s; }
> \`\`\`

**Q4: How do registered properties interact with the cascade and inheritance?**
> **A:** Registered properties FULLY participate in cascade and inheritance — but \`inherits: false\` lets you create non-inheriting variables (useful for component-local state). Their initial-value is used when no rule sets them. Most importantly, type validation: if you set \`--hue: red\` but \`syntax: <number>\`, the property reverts to its initial value (graceful failure instead of silent breakage). This is a major step toward CSS having genuine type safety.

**Q5: FAANG-grade definition?**
> **A:** "Advanced custom properties are typed, registered, optionally non-inheriting cascade-resolved variables — combining @property's syntax descriptors for animation interpolation and type validation, @scope for spatial limitation of variable visibility, and @layer for cascade precedence — collectively enabling CSS-only component APIs, theme tokens, and Houdini Paint Worklet typed inputs without runtime JavaScript."`,
    build: `## BUILD

### 🏗️ Mini Project: Animated Gradient + Themed Button Component Using @property

**What you will build:** A hero with a fully animatable conic gradient using @property-registered hue, and a button "component" whose entire styling API is exposed as custom properties — instances customised purely via inline style.
**Why this project:** Forces real @property usage and the component-via-variables pattern that production design systems rely on.
**Time estimate:** 35 minutes

#### Step 1 — Setup
\`\`\`bash
mkdir cp-advanced && cd cp-advanced
ni index.html, style.css, app.js -ItemType File
\`\`\`

#### Step 2 — HTML
\`\`\`html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><link rel="stylesheet" href="style.css"></head>
<body>
  <header class="hero"><h1>Animated Conic</h1></header>

  <main>
    <h2>Button Component API via CSS Variables</h2>
    <button class="btn">Default</button>
    <button class="btn" style="--btn-bg:#d33; --btn-radius:24px">Danger pill</button>
    <button class="btn" style="--btn-bg:transparent; --btn-fg:#2a9d8f; --btn-border:2px solid #2a9d8f">Ghost</button>
    <button class="btn" style="--btn-bg:#1a1a2e; --btn-padding:1rem 2rem; --btn-radius:0">Square dark</button>
  </main>
  <script src="app.js"></script>
</body></html>
\`\`\`

#### Step 3 — Registered Properties + Component
\`\`\`css
/* Registered for animation */
@property --hue {
  syntax: "<number>";
  initial-value: 220;
  inherits: true;
}
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

/* Animated hero */
.hero {
  --hue: 220;
  height: 50vh;
  display: grid; place-items: center; color: white;
  background: conic-gradient(from var(--angle),
    oklch(0.6 0.2 var(--hue)),
    oklch(0.5 0.2 calc(var(--hue) + 120)),
    oklch(0.55 0.2 calc(var(--hue) + 240)),
    oklch(0.6 0.2 var(--hue)));
  animation: rotate 20s linear infinite, hue-shift 30s linear infinite;
}
@keyframes rotate    { to { --angle: 360deg; } }
@keyframes hue-shift { 50% { --hue: 340; } }

/* Button as a fully-variabled component */
.btn {
  /* The component's public API — every visual axis as a token */
  --btn-bg: #2a9d8f;
  --btn-fg: white;
  --btn-padding: 0.5em 1em;
  --btn-radius: 6px;
  --btn-border: none;
  --btn-shadow: 0 1px 2px rgba(0,0,0,0.1);

  background: var(--btn-bg);
  color: var(--btn-fg);
  padding: var(--btn-padding);
  border-radius: var(--btn-radius);
  border: var(--btn-border);
  box-shadow: var(--btn-shadow);

  font: inherit; cursor: pointer;
  transition: filter 0.15s;
  margin: 0.25rem;
}
.btn:hover { filter: brightness(1.08); }

main { padding: 2rem; }
\`\`\`

#### Step 4 — Error Handling: Reduced Motion + Feature Detection
\`\`\`javascript
// app.js
@supports (background: paint(none)) {
  /* Houdini Paint Worklet capable */
}

if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelector('.hero').style.animation = 'none';
}

// JS bridge: change the global hue from outside CSS
document.documentElement.style.setProperty('--hue', '160');
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
// Verify @property registration took effect
const props = CSS.getRegisteredProperties?.() || [];
console.log('Registered properties:', props.map(p => p.name));

// Verify a typed property reverts on invalid input
document.documentElement.style.setProperty('--hue', 'banana');
console.log('Hue after invalid value:',
  getComputedStyle(document.documentElement).getPropertyValue('--hue'));
// Output: "220" (reverted to initial-value, not "banana")
\`\`\`

**Expected Output:**
\`\`\`
- Hero shows a slowly rotating conic gradient (@property --angle 0 → 360 over 20s)
- Hue smoothly shifts 220 → 340 → 220 over 30s (interpolation only possible thanks to @property)
- 4 button instances, each with completely different look — but all share ONE .btn class
- Customisation is via inline style, no modifier classes
- Setting --hue to invalid "banana" reverts to initial-value 220 (typed safety)
\`\`\`

**Stretch:**
- [ ] Build a CSS Houdini Paint Worklet that consumes \`--accent\` as a typed input
- [ ] Add @scope to limit .btn styles to a specific section
- [ ] Generate a button library where each prop is a registered property with documentation`,
    spacedReview: `## SPACED REVIEW

### Day 1 — Recall
**Q1:** What does \`@property\` add over a plain custom property?
**Q2:** What happens when you set a registered \`<number>\` property to a non-number value?
**Q3:** Write the @property block for an animatable \`--accent: <color>\`. From memory.

### Day 3 — Comprehension
**Q4:** Why can't you \`transition\` an unregistered custom property?
**Q5:** Difference between \`inherits: true\` and \`inherits: false\` in @property?
**Q6:** Refactor: this gradient won't animate even though there's a transition.
\`\`\`css
:root { --hue: 0; }
.hero { background: oklch(0.6 0.2 var(--hue)); transition: --hue 1s; }
.hero:hover { --hue: 180; }
\`\`\`

### Day 7 — Application
**Q7:** Build a "knob" component whose value is a registered \`<number>\` between 0 and 100, animatable.
**Q8:** A PR uses \`@property\` for every CSS variable on a 500-component page. What overhead does this add?
**Q9:** How does @property interact with CSS-in-JS libraries and Tailwind?

### Day 14 — Synthesis
**Q10:** ★ Interview: "Show me how to make a single \`.button\` class infinitely customisable via CSS custom properties — no modifier classes."
**Q11:** Draw: how do @property, @scope, @layer, and var() interact in the cascade?
**Q12:** ★ System design: "Design a design-token system where every token is a @property-registered custom property, types are validated at runtime, and tokens propagate from Figma → CSS → React props."`
  }
};

