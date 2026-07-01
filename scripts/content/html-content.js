/**
 * GFG+ depth FEYNMAN / BUILD / SPACED REVIEW for all HTML topics.
 * Matches SKILL.md standards: real analogies, 5 deep Q&As, named projects,
 * 12 spaced-review questions, code snippets in answers.
 *
 * Special keys (only when section is missing in the MDX):
 *   visual    — VISUALIZATION_CONFIG block
 *   realworld — REAL_WORLD section
 *   interview — INTERVIEW section
 */
module.exports = {

  // ── 1. html-intro ─────────────────────────────────────────────────────────
  'html-intro': {
    feynman: `## FEYNMAN CHECK

### Explain HTML Like I'm 10 Years Old
> HTML is the skeleton of a web page. It does not say what color anything is or how big — it only says "this is a heading," "this is a paragraph," "this is a list." The browser reads HTML top-to-bottom, builds a tree in memory called the DOM, then asks CSS "how should this look?" and JavaScript "what should this do?" This is why a missing closing tag can shift the entire page layout — the browser's tree-builder has to guess where you meant to close it.

---

### 5 Deep Conceptual Questions

**Q1: What problem does HTML fundamentally solve, and why couldn't you solve it another way?**
> **A:** HTML solves giving structured meaning to text in a way that ANY program — a browser, a screen reader, a search crawler, an LLM scraper — can understand without negotiating a format first. Before HTML there was no shared, hyperlinkable document format that ran in any operating system. You can't replace it with JSON because JSON has no built-in tree-of-content semantics like "this is a heading that belongs to that section."

**Q2: What is the ONE mental model that makes everything about HTML click into place?**
> **A:** The browser turns HTML text into a tree of node objects (the DOM). Every CSS rule and every JavaScript API operates on that tree, not on the original text. Once you internalise "HTML is the build script for an in-memory tree," concepts like \`document.querySelector\`, CSS specificity, and event bubbling stop feeling magical.

**Q3: What is the most dangerous misconception about HTML? Show it with code.**
> **A:** That HTML is "just markup" with no impact on accessibility, SEO, or performance.
> \`\`\`html
> <!-- ❌ Looks the same visually, breaks screen readers and SEO -->
> <div class="header">
>   <div class="title" onclick="goHome()">My Site</div>
>   <div class="nav"><div onclick="go('about')">About</div></div>
> </div>
>
> <!-- ✅ Same look, but keyboard-accessible, screen-reader friendly, indexable -->
> <header>
>   <h1><a href="/">My Site</a></h1>
>   <nav><a href="/about">About</a></nav>
> </header>
> \`\`\`

**Q4: How does HTML interact with CSS and JavaScript at the runtime level?**
> **A:** The browser parses HTML into the DOM, parses CSS into the CSSOM, then COMBINES them into the Render Tree (visible nodes only). JavaScript can mutate the DOM, which triggers re-layout. Critical detail: a \`<script>\` without \`async\` or \`defer\` BLOCKS DOM parsing until it has been downloaded and executed — this is why scripts traditionally went at the bottom of \`<body>\`.

**Q5: Write a one-sentence definition of HTML that a senior engineer at a FAANG company would find technically precise.**
> **A:** "HTML is a declarative, tree-structured markup language whose tokens are parsed by the browser into the DOM — an in-memory object tree that serves as the single source of truth on which CSS layout, JavaScript mutation, and accessibility APIs all operate — which is why semantic tag choice has measurable downstream impact on rendering performance, screen-reader UX, and search ranking."`,

    build: `## BUILD

### 🏗️ Mini Project: Build a Semantic, Accessible, SEO-Ready Article Page

**What you will build:** A complete, valid HTML5 news article page with proper document outline, semantic landmarks, and structured data — zero CSS, proving HTML alone gives you a usable page.
**Why this project:** Forces you to choose the right tag for every piece of content while thinking about screen readers, search engines, and shared link previews.
**Time estimate:** 30 minutes

---

#### Step 1 — Project Setup
\`\`\`bash
mkdir semantic-article && cd semantic-article
ni article.html -ItemType File
\`\`\`

#### Step 2 — Core Document Skeleton
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Why HTML Still Matters in 2026 | Dev Mastery</title>
  <meta name="description" content="A deep dive into why semantic HTML
        outranks div-soup for SEO, accessibility, and Core Web Vitals.">
  <link rel="canonical" href="https://example.com/articles/why-html-matters">
</head>
<body>
  <header>
    <h1><a href="/">Dev Mastery</a></h1>
    <nav aria-label="Primary">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/articles">Articles</a></li>
      </ul>
    </nav>
  </header>
  <main><article><!-- content next --></article></main>
  <footer><p>&copy; 2026 Dev Mastery</p></footer>
</body>
</html>
\`\`\`

#### Step 3 — Article Body With Proper Outline
\`\`\`html
<article>
  <header>
    <h2>Why HTML Still Matters in 2026</h2>
    <p>By <a rel="author" href="/authors/jane">Jane Doe</a> ·
       <time datetime="2026-06-25">June 25, 2026</time></p>
  </header>
  <section>
    <h3>The cost of div-soup</h3>
    <p>Search engines and screen readers both rely on semantic structure...</p>
  </section>
  <figure>
    <img src="/img/diagram.png"
         alt="Bar chart: semantic vs non-semantic pages, semantic scores 92, non-semantic 41 on Lighthouse SEO."
         width="800" height="400" loading="lazy">
    <figcaption>Lighthouse SEO scores, 100 sample pages.</figcaption>
  </figure>
</article>
\`\`\`

#### Step 4 — Edge Cases: Open Graph, Twitter Card, JSON-LD
\`\`\`html
<meta property="og:title"       content="Why HTML Still Matters in 2026">
<meta property="og:description" content="A deep dive into why semantic HTML wins.">
<meta property="og:image"       content="https://example.com/og/html-2026.png">
<meta property="og:type"        content="article">
<meta name="twitter:card"       content="summary_large_image">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Why HTML Still Matters in 2026",
  "datePublished": "2026-06-25",
  "author": { "@type": "Person", "name": "Jane Doe" },
  "image": "https://example.com/og/html-2026.png"
}
</script>
\`\`\`

#### Step 5 — Tests
\`\`\`bash
npx -y html-validate article.html
npx -y lighthouse http://localhost:8080/article.html \\
  --only-categories=seo,accessibility --quiet
# Paste URL into https://search.google.com/test/rich-results
\`\`\`

**Expected Output:**
\`\`\`
html-validate: 0 errors, 0 warnings
Lighthouse SEO: 100  Accessibility: 100
Rich Results: ✓ NewsArticle eligible
\`\`\`

**Stretch Challenges:**
- [ ] Add \`hreflang\` alternates for 3 languages
- [ ] Add a \`<nav aria-label="Breadcrumb">\` with BreadcrumbList JSON-LD
- [ ] Add a \`Speakable\` JSON-LD block for Google Assistant`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** Define HTML in one sentence including (1) what it IS, (2) what the browser DOES with it, and (3) one downstream consumer beyond rendering.

**Q2:** What are the two most critical properties of HTML5? Explain what BREAKS in production if you misunderstand either one.

**Q3:** Write a 10-line valid HTML5 document with charset, viewport, title, and a single \`<h1>\`. No template, from memory.

---

### Day 3 — Comprehension

**Q4:** What is the difference between HTML and the DOM? Give one production scenario where the source HTML and the rendered DOM diverge.

**Q5:** A page scores 41 Lighthouse SEO and 38 a11y but looks correct. Describe 3 likely HTML-level root causes and the fix for each.

**Q6:** Refactor this to be semantic and accessible:
\`\`\`html
<div class="page">
  <div class="top"><div onclick="goHome()">Site</div></div>
  <div class="body">
    <div class="big">Welcome</div>
    <div>Some content...</div>
  </div>
</div>
\`\`\`

---

### Day 7 — Application

**Q7:** Build the \`<head>\` of a product detail page that supports: SEO description, social-share preview image, canonical URL, and Google "Product" rich snippet.

**Q8:** You inherit a SPA where every route renders \`<div id="app">\`. Lighthouse SEO is 0. List 4 HTML-level fixes ordered by SEO impact.

**Q9:** What is the browser's "speculative parser"? How does it interact with \`<script src>\` tags, and why does render-blocking \`<script>\` in \`<head>\` delay FCP?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "Walk me through everything the browser does between receiving the HTML response and showing pixels."

**Q11:** Draw the dependency graph between html-intro, semantic-elements, accessibility-html, and meta-tags-and-seo.

**Q12:** ★ System design: "Launch a high-traffic news site that must rank on Google News, work on a screen reader, render in <1s on 2G, and be installable as a PWA. What HTML-level decisions do you make on Day 1?"`
  },

  // ── 2. semantic-elements ──────────────────────────────────────────────────
  'semantic-elements': {
    feynman: `## FEYNMAN CHECK

### Explain Semantic HTML Like I'm 10 Years Old
> Semantic HTML is like labelling every box in a moving truck. A \`<div>\` is an unlabelled cardboard box — movers (browsers, screen readers, Google) have to open it to guess what's inside. A \`<nav>\`, \`<article>\`, \`<aside>\`, \`<main>\` is a box with big black marker writing on the outside. The browser builds an "accessibility tree" alongside the DOM using these labels, and screen readers read THAT tree, not the visual layout. This is why a blind user can press one keystroke to jump to your \`<main>\` content — but only if you used the right tag.

---

### 5 Deep Conceptual Questions

**Q1: What problem does semantic HTML fundamentally solve?**
> **A:** It conveys STRUCTURAL meaning to non-visual consumers (screen readers, search crawlers, reader-mode parsers, browser "skip to content" features). You can't solve it with class names because \`class="nav"\` is invisible to assistive tech — only the actual tag name maps to an ARIA role in the accessibility tree.

**Q2: What is the ONE mental model that makes semantic HTML click?**
> **A:** The browser builds TWO trees from your HTML: the DOM (for CSS and JS) and the Accessibility Tree (for screen readers, voice control, switch devices). Semantic tags are the cheapest way to populate the second tree correctly — every \`<div>\` adds a node with role="generic," invisible to a screen reader navigating by landmark.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** That "ARIA roles can fix any div." ARIA only patches the accessibility tree, not keyboard handling.
> \`\`\`html
> <!-- ❌ Looks accessible, isn't. No keyboard focus, no Enter/Space handling -->
> <div role="button" onclick="submit()">Submit</div>
>
> <!-- ✅ Free: Tab-focusable, Enter/Space activate, default submit behaviour -->
> <button type="submit">Submit</button>
> \`\`\`

**Q4: How does semantic HTML interact with CSS and the rendering engine?**
> **A:** Semantic tags get default user-agent CSS (\`<h1>\` is bold, \`<button>\` has a border) AND default ARIA roles. The browser's accessibility engine watches DOM mutations and rebuilds the accessibility tree on the fly — swapping a \`<div>\` to a \`<button>\` after page load DOES update the screen-reader experience, but it triggers an accessibility-tree rebuild (a measurable cost on large pages).

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "Semantic HTML is the practice of choosing tag names whose default ARIA roles match the content's actual purpose, so the browser's accessibility tree, the user-agent stylesheet, the document outline, and SEO crawlers align on a single source of structural truth — which is why a single \`<button>\` is a 20-line accessibility fix replacing \`<div role='button' tabindex='0' onkeydown='...' onclick='...'>\`."`,

    build: `## BUILD

### 🏗️ Mini Project: Rebuild a "div-Soup" Dashboard into Pure Semantic HTML

**What you will build:** Take a typical SaaS dashboard written in \`<div>\` and rewrite it with semantic landmarks, then prove the win with Chrome's Accessibility Tree inspector and axe-core.
**Why this project:** Most real-world performance and accessibility bugs hide inside HTML choices that nobody reviews. This project makes them visible.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir semantic-refactor && cd semantic-refactor
ni before.html, after.html, axe-test.mjs -ItemType File
npm init -y; npm install -D @axe-core/playwright playwright
\`\`\`

#### Step 2 — The "Before" (anti-pattern reference)
\`\`\`html
<!DOCTYPE html>
<html lang="en"><head><title>Dashboard</title></head>
<body>
  <div class="top">
    <div class="logo">DevMastery</div>
    <div class="links">
      <div onclick="go('/')">Home</div>
      <div onclick="go('/profile')">Profile</div>
    </div>
  </div>
  <div class="page">
    <div class="side"><div class="big">Menu</div><div onclick="go('/x')">Reports</div></div>
    <div class="content"><div class="title">Q2 Revenue</div><div>...numbers...</div></div>
    <div class="extra">Related: ...</div>
  </div>
  <div class="bottom">© 2026</div>
</body></html>
\`\`\`

#### Step 3 — The Semantic Refactor
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Dashboard — DevMastery</title></head>
<body>
  <header>
    <a href="/" aria-label="DevMastery home"><strong>DevMastery</strong></a>
    <nav aria-label="Primary">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/profile">Profile</a></li>
      </ul>
    </nav>
  </header>

  <div class="page-grid">
    <nav aria-label="Secondary" class="sidebar">
      <h2>Menu</h2>
      <ul><li><a href="/x">Reports</a></li></ul>
    </nav>

    <main>
      <article aria-labelledby="q2-h">
        <h1 id="q2-h">Q2 Revenue</h1>
        <p>...numbers...</p>
      </article>
    </main>

    <aside aria-label="Related content">
      <h2>Related</h2>
      <p>...</p>
    </aside>
  </div>

  <footer>&copy; 2026 DevMastery</footer>
</body></html>
\`\`\`

#### Step 4 — Error Handling: Heading Order, Multiple \`<main>\`, Skipped Levels
\`\`\`html
<!-- ❌ Skipped from h1 → h3 (axe-core warns "heading-order") -->
<h1>Dashboard</h1>
<h3>Q2 Revenue</h3>

<!-- ❌ Two <main> elements on one page (only ONE allowed per document) -->
<main>...</main>
<main>...</main>

<!-- ✅ Correct: single <main>, no skipped levels -->
<main>
  <h1>Dashboard</h1>
  <section><h2>Q2 Revenue</h2></section>
  <section><h2>Q3 Forecast</h2></section>
</main>
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
// axe-test.mjs — runs axe-core in real browser, fails build on violations
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

for (const file of ['before.html', 'after.html']) {
  await page.goto('file://' + process.cwd() + '/' + file);
  const { violations } = await new AxeBuilder({ page }).analyze();
  console.log(\`\${file}: \${violations.length} violations\`);
  for (const v of violations) console.log('  -', v.id, v.help);
}
await browser.close();
\`\`\`

**Expected Output:**
\`\`\`
before.html: 7 violations
  - landmark-one-main  Page must have one main landmark
  - region             All page content should be contained by landmarks
  - heading-order      Heading levels should only increase by one
  - button-name        Buttons must have discernible text
after.html: 0 violations
\`\`\`

**Stretch Challenges:**
- [ ] Add a "skip to main content" link as the first focusable element
- [ ] Add \`aria-current="page"\` to the active nav item
- [ ] Replace the page-grid div with CSS subgrid — no extra div allowed`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** Name 8 HTML5 semantic landmark elements and the ARIA role each maps to by default.

**Q2:** What is the difference between \`<article>\` and \`<section>\`? Give one rule that resolves the ambiguity every time.

**Q3:** Write a 12-line semantic skeleton for a blog post page with header, nav, main, article, aside, footer.

---

### Day 3 — Comprehension

**Q4:** What is the Accessibility Tree? How does it differ from the DOM? Why does a screen reader read it instead of the rendered page?

**Q5:** Describe the most common production a11y bug caused by misusing semantic HTML. Write broken vs fix.

**Q6:** Refactor this without changing the visual layout:
\`\`\`html
<div class="card" onclick="open()">
  <div class="big">Plan name</div>
  <div>$10/mo</div>
  <div onclick="buy()">Buy</div>
</div>
\`\`\`

---

### Day 7 — Application

**Q7:** Build a fully accessible newspaper homepage HTML (no CSS) with top nav, search form, main feed (3 articles), sidebar, footer. Must score 100 Lighthouse a11y.

**Q8:** You audit a SPA where every page is \`<div id="root">\` with unlabelled \`<button>\`s. Name 4 axe-core rule IDs likely to fire and the HTML-level fix for each.

**Q9:** Explain the "document outline algorithm" — how it was supposed to work in HTML5 vs how it actually behaves in browsers today. Why must you still use \`<h1>\`–\`<h6>\` levels carefully?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "Why is using a \`<button>\` better than a \`<div role='button'>\` with onclick?"

**Q11:** Draw the dependency graph: semantic-elements ↔ accessibility-html ↔ html-attributes ↔ meta-tags-and-seo.

**Q12:** ★ System design: "Design the HTML structure for a multi-tenant SaaS where every tenant can customise their dashboard layout while preserving semantic landmarks."`
  },

  // ── 3. text-elements ──────────────────────────────────────────────────────
  'text-elements': {
    feynman: `## FEYNMAN CHECK

### Explain HTML Text Elements Like I'm 10 Years Old
> HTML has TWO types of "make it bold" and TWO types of "make it italic" — but they mean different things. \`<strong>\` means "this is IMPORTANT" (a screen reader changes its tone); \`<b>\` means "make it visually bold with no meaning." Same for \`<em>\` (emphasis, changes pronunciation) vs \`<i>\` (italic style — for ship names, foreign words). Picking the wrong one is invisible to sighted users but completely changes how the page sounds to a blind user. This is why "use \`<strong>\` not \`<b>\`" is one of the most cited beginner mistakes in WCAG audits.

---

### 5 Deep Conceptual Questions

**Q1: What problem does semantic text markup fundamentally solve?**
> **A:** It separates VISUAL presentation (CSS owns) from SEMANTIC importance (the document owns). Swap your design system and \`<strong>\` still gets announced with stress by screen readers; \`<b>\` won't — it's purely a style hook surviving for legacy reasons.

**Q2: What is the ONE mental model that makes text-element choice click?**
> **A:** Ask: "If I removed all CSS, does this word still need to look or sound different?" If YES → use a semantic tag (\`<strong>\`, \`<em>\`, \`<mark>\`, \`<code>\`, \`<abbr>\`). If NO → it's just styling, use \`<span>\`. The user-agent stylesheet exists precisely so semantic tags carry visual defaults too.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** Using \`<br>\` for spacing instead of paragraph structure:
> \`\`\`html
> <!-- ❌ Screen reader announces "Line break, line break, line break" — exhausting -->
> Hello there.<br><br>
> Welcome to the site.<br><br>
>
> <!-- ✅ Three distinct paragraphs, properly announced and properly margined -->
> <p>Hello there.</p>
> <p>Welcome to the site.</p>
> \`\`\`

**Q4: How does \`<code>\` + \`<pre>\` interact with whitespace and the rendering engine?**
> **A:** \`<pre>\` preserves whitespace and newlines exactly (uses monospace); \`<code>\` is just inline monospace, no whitespace preservation. Combining \`<pre><code>...</code></pre>\` is what Markdown converts to — \`<pre>\` handles layout, \`<code>\` carries the "this is source code" semantic so screen readers announce it as code and syntax highlighters know what to target.

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "Semantic text elements are inline tags whose default ARIA semantics influence how assistive tech announces emphasis, abbreviation expansions, code spans, deletions, and inserted content — which is why swapping \`<b>\` for \`<strong>\` in a 10-year-old codebase changes the audible experience for screen-reader users with zero visual change."`,

    build: `## BUILD

### 🏗️ Mini Project: Technical Docs Page Using Every Semantic Text Tag Correctly

**What you will build:** A "Keyboard shortcuts reference" page using every inline text semantic: \`<code>\`, \`<kbd>\`, \`<samp>\`, \`<var>\`, \`<mark>\`, \`<abbr>\`, \`<del>\`, \`<ins>\`, \`<sup>\`, \`<sub>\`, \`<q>\`, \`<cite>\`, \`<time>\`.
**Why this project:** Most devs only know \`<strong>\` and \`<em>\`. The full inline vocabulary separates a junior from a senior on accessibility-sensitive products.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir text-elements-demo && cd text-elements-demo
ni shortcuts.html -ItemType File
\`\`\`

#### Step 2 — Core Document
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Keyboard Shortcuts — VS Code</title></head>
<body>
  <main>
    <h1>Keyboard Shortcuts <small>(<abbr title="Visual Studio Code">VSC</abbr> 1.92)</small></h1>
    <p>Last updated <time datetime="2026-06-25">June 25, 2026</time>.</p>

    <h2>Editing</h2>
    <p>Duplicate the current line with
       <kbd>Shift</kbd>+<kbd>Alt</kbd>+<kbd>Down</kbd>.</p>

    <p>Open the command palette with
       <kbd><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd></kbd>.</p>
  </main>
</body></html>
\`\`\`

#### Step 3 — Inline Semantics for Code, Output, Variables
\`\`\`html
<h2>Run a script</h2>
<p>Run <code>npm test</code>. You should see output like:</p>

<pre><samp>PASS  ./auth.test.js
  ✓ rejects invalid token (12 ms)
  ✓ accepts valid token  ( 8 ms)
</samp></pre>

<p>Replace <var>file</var> with the actual filename:
   <code>node <var>file</var>.js</code>.</p>
\`\`\`

#### Step 4 — Highlights, Quotes, Edits, Math
\`\`\`html
<h2>Recent changes</h2>
<p>The shortcut <del datetime="2026-04-01">Ctrl+B</del>
   <ins datetime="2026-04-01"><kbd>Ctrl</kbd>+<kbd>K</kbd> <kbd>Ctrl</kbd>+<kbd>B</kbd></ins>
   now toggles the sidebar.</p>

<p>As <cite>The VS Code Docs</cite> note: <q>Keybindings can be
   user-customised per workspace.</q></p>

<p>Search results for <mark>keybinding</mark> are highlighted in the margin.</p>

<p>Chemistry: H<sub>2</sub>O. Math: E = mc<sup>2</sup>.</p>
\`\`\`

#### Step 5 — Tests
\`\`\`bash
npx -y html-validate shortcuts.html

# Manual: open with NVDA / VoiceOver and confirm:
#   - <kbd> announced as "Ctrl" (not styled text)
#   - <mark> announced with "marked" or "highlight" prefix
#   - <abbr title=...> announced as full expansion on first read
#   - <del>/<ins> announced as "deleted" / "inserted"
#   - <q> wrapped in audible quote marks
\`\`\`

**Expected Output:**
\`\`\`
html-validate: 0 errors, 0 warnings
\`\`\`

**Stretch Challenges:**
- [ ] Add a \`<details><summary>\` collapsible "Advanced shortcuts" section
- [ ] Add \`<ruby>\` annotations for the Japanese translation of "shortcut"
- [ ] Replace visual "·" separators with \`<span aria-hidden="true">\` so they're not read aloud`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** Give the semantic difference between: \`<strong>\` vs \`<b>\`, \`<em>\` vs \`<i>\`, \`<mark>\` vs \`<span class="highlight">\`.

**Q2:** What does \`<kbd>\` mean? \`<samp>\`? \`<var>\`? Give a 1-line example of each in context.

**Q3:** Write 4 lines that correctly mark up: an abbreviation with expansion, a deleted phrase, an inserted phrase, and a date machines can parse.

---

### Day 3 — Comprehension

**Q4:** What is the difference between \`<pre>\`, \`<code>\`, and \`<pre><code>\`? Which whitespace is preserved by each?

**Q5:** The a11y audit flags \`<b class="warning">Important!</b>\`. Explain why, and give the one-character fix.

**Q6:** Refactor:
\`\`\`html
Hello there.<br><br>
This is <b><i>very</i></b> important: do not
<span style="text-decoration:line-through">click</span>
<span style="background:yellow">delete</span>.
\`\`\`

---

### Day 7 — Application

**Q7:** Mark up a 4-line poem so: each line is a paragraph, the poet's name is cited, every foreign word is italicised semantically, and the year written is machine-readable.

**Q8:** Every line of source code on a marketing page uses \`<span class="mono">\`. Name 3 problems this causes (SEO, a11y, search-in-page).

**Q9:** Why does \`<wbr>\` exist? Show a 4-line example where omitting it breaks line-wrapping on mobile and including it fixes it.

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "When would you use \`<i>\` and not \`<em>\`?"

**Q11:** Draw the dependency graph: text-elements ↔ semantic-elements ↔ accessibility-html.

**Q12:** ★ System design: "Design markup conventions for an AI-generated documentation system that must produce screen-reader-friendly output for code samples, terminal output, keyboard shortcuts, and breaking-change notices. Which inline tags do you mandate and why?"`
  },

  // ── 4. html-attributes ────────────────────────────────────────────────────
  'html-attributes': {
    feynman: `## FEYNMAN CHECK

### Explain HTML Attributes Like I'm 10 Years Old
> Attributes are the configuration knobs of an HTML tag. \`<input type="email" required maxlength="100">\` is one tag with three knobs. Boolean attributes are special — their PRESENCE alone means true; the value is irrelevant. \`<input disabled>\`, \`<input disabled="disabled">\`, and \`<input disabled="false">\` are ALL disabled, which trips up almost every junior dev once. \`data-*\` attributes are an officially-blessed namespace for your own metadata — JavaScript reads them as \`element.dataset.userId\` (camelCased).

---

### 5 Deep Conceptual Questions

**Q1: What problem do HTML attributes fundamentally solve?**
> **A:** They let one tag handle many variations without inventing 50 new tags. There's one \`<input>\` with 25 attribute combinations instead of \`<text-input>\`, \`<email-input>\`, etc. Cost: parsing rules are tag-specific (boolean attributes, enumerated attributes, IDL vs content attributes), which makes the HTML spec longer than most programming languages.

**Q2: What is the ONE mental model that makes attributes click?**
> **A:** There are TWO parallel attribute spaces: the CONTENT attribute (string in markup, accessed via \`getAttribute\`) and the IDL attribute (JS property, e.g. \`input.value\`). They start in sync but can drift. \`<input value="hi">\` initialises both; typing changes IDL but NOT content. This is why \`form.reset()\` works — it copies the original content attribute back to IDL.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** That \`<button disabled="false">\` enables the button. Boolean attributes are presence-only:
> \`\`\`html
> <!-- ❌ All THREE are disabled. The value is completely ignored. -->
> <button disabled>Save</button>
> <button disabled="">Save</button>
> <button disabled="false">Save</button>
>
> <!-- ✅ The ONLY way to enable is to omit the attribute entirely -->
> <button>Save</button>
> <!-- Or in JS: button.removeAttribute('disabled') / button.disabled = false -->
> \`\`\`

**Q4: How do \`data-*\` attributes interact with JavaScript at the runtime level?**
> **A:** Every \`data-*\` is exposed on \`element.dataset\` with hyphenated→camelCase conversion: \`data-user-id="42"\` → \`el.dataset.userId === "42"\`. Crucially, dataset values are ALWAYS strings — \`data-count="5"\` gives \`"5"\` not \`5\`. The DOM stores both representations in sync, so \`el.dataset.userId = '99'\` immediately updates the HTML attribute.

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "HTML attributes are key-value pairs the browser parses into a NamedNodeMap on each element, separated into content attributes (string values living in markup) and IDL attributes (typed values living on the DOM node prototype) — which is why \`input.checked = true\` updates the live state without altering the original \`checked\` content attribute the form-reset algorithm reads from."`,

    build: `## BUILD

### 🏗️ Mini Project: Declarative Web-Component Loader Built on \`data-*\`

**What you will build:** A 60-line vanilla-JS module that scans the page for \`<div data-component="...">\`, automatically instantiates the right widget, and observes the DOM for dynamically added ones. The pattern Angular's selector engine, htmx, and Alpine.js use under the hood.
**Why this project:** Forces you to understand \`dataset\`, type coercion, attribute mutation, and \`MutationObserver\` in one tight piece of code.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir data-loader && cd data-loader
ni index.html, loader.js -ItemType File
\`\`\`

#### Step 2 — Markup That Drives the System
\`\`\`html
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Data-driven widgets</title></head>
<body>
  <div data-component="counter" data-start="10" data-step="2"></div>
  <div data-component="clock" data-format="24h"></div>
  <button id="add">Add another counter dynamically</button>
  <script type="module" src="./loader.js"></script>
</body></html>
\`\`\`

#### Step 3 — The Loader (dataset + MutationObserver)
\`\`\`javascript
// loader.js — component registry keyed by data-component
const registry = {
  counter(host) {
    let value = Number(host.dataset.start ?? 0);  // dataset is ALWAYS string
    const step = Number(host.dataset.step ?? 1);
    host.innerHTML = '<output>' + value + '</output> <button>+</button>';
    const out = host.querySelector('output');
    host.querySelector('button').addEventListener('click', () => {
      value += step;
      out.textContent = value;
    });
  },
  clock(host) {
    const fmt = host.dataset.format === '24h' ? 'en-GB' : 'en-US';
    const tick = () => host.textContent = new Date().toLocaleTimeString(fmt);
    tick();
    setInterval(tick, 1000);
  },
};

function hydrate(root) {
  const nodes = root.querySelectorAll('[data-component]:not([data-hydrated])');
  for (const host of nodes) {
    const init = registry[host.dataset.component];
    if (!init) { console.warn('Unknown:', host.dataset.component); continue; }
    init(host);
    host.dataset.hydrated = 'true';
  }
}

hydrate(document);

// Auto-hydrate future insertions
new MutationObserver((records) => {
  for (const r of records)
    for (const node of r.addedNodes)
      if (node.nodeType === 1) hydrate(node);
}).observe(document.body, { childList: true, subtree: true });

// Demo: add a counter at runtime — MutationObserver hydrates it
document.getElementById('add').addEventListener('click', () => {
  const div = document.createElement('div');
  div.dataset.component = 'counter';
  div.dataset.start = '100';
  div.dataset.step = '5';
  document.body.appendChild(div);
});
\`\`\`

#### Step 4 — Error Handling
\`\`\`javascript
// Wrap init in try/catch so one broken widget can't break the page
function hydrate(root) {
  const nodes = root.querySelectorAll('[data-component]:not([data-hydrated])');
  for (const host of nodes) {
    const init = registry[host.dataset.component];
    if (!init) continue;
    try {
      init(host);
      host.dataset.hydrated = 'true';
    } catch (err) {
      host.dataset.hydrated = 'error';
      host.setAttribute('aria-invalid', 'true');
      console.error('[' + host.dataset.component + ']', err);
    }
  }
}
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
console.assert(document.querySelector('[data-hydrated]'),
  'at least one widget should be hydrated');
console.assert(document.querySelector('output').textContent === '10',
  'counter should start at 10');
\`\`\`

**Expected Output:**
\`\`\`
- Counter shows 10, clicking increments by 2
- Clock shows current time in 24h format
- "Add another counter" inserts a new widget that hydrates automatically (starts at 100, steps by 5)
\`\`\`

**Stretch Challenges:**
- [ ] Add \`data-lazy="viewport"\` flag deferring init until element scrolls into view (IntersectionObserver)
- [ ] Support nested JSON config: \`data-config='{"theme":"dark"}'\` parsed once
- [ ] Add teardown path: when host is removed, run the component's cleanup`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** What is a boolean attribute? Write the THREE syntactically valid ways to mark an input as disabled.

**Q2:** What is the difference between \`element.getAttribute('value')\` and \`element.value\` on an \`<input>\`? When do they diverge?

**Q3:** Convert \`data-user-profile-id="42"\` to the JS expression that reads it. Then write the expression that updates it to 99.

---

### Day 3 — Comprehension

**Q4:** Name 6 global attributes valid on every HTML element. For each, give a one-line use case.

**Q5:** Describe the production bug caused by writing \`<input disabled={isDisabled}>\` in a non-JSX templating engine. Show buggy vs fixed.

**Q6:** Refactor this for security and accessibility:
\`\`\`html
<a href="javascript:void(0)" onclick="open(\${url})">Open</a>
<input type="text" placeholder="Email" required="false" />
\`\`\`

---

### Day 7 — Application

**Q7:** Build a \`data-track="event-name"\` analytics system that captures clicks across the entire page using ONE delegated listener on \`document\`.

**Q8:** Every form uses \`<input type="text" name="email">\` with JS validation. List 3 attribute changes that would eliminate the JS validation entirely.

**Q9:** What is \`contenteditable\`? Build a 20-line in-browser markdown preview where typing in a \`contenteditable\` div instantly renders to HTML.

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "Explain the difference between an HTML content attribute and a DOM IDL attribute. Give one case where they intentionally diverge."

**Q11:** Draw the dependency graph: html-attributes ↔ forms-html ↔ form-validation ↔ accessibility-html.

**Q12:** ★ System design: "Design attribute conventions for a server-rendered framework that's progressively enhanced. How do you encode component state, hydration boundaries, and analytics without inventing non-standard names?"`
  },

  // ── 5. forms-html — ALSO supplies realworld + interview (the missing ones) ─
  'forms-html': {
    realworld: `## REAL_WORLD

### How GitHub & Stripe Use Native HTML Forms

GitHub's issue-creation form, Stripe's Checkout, and Shopify's storefronts all use plain \`<form method="POST" action="/submit">\` as the base layer — JavaScript is layered ON TOP for nicer UX, but the form still submits if JS fails to load. This is **progressive enhancement** and it's why GitHub still works on a 2G connection.

\`\`\`html
<!-- GitHub-style issue form: works without JS, enhanced with JS -->
<form action="/repo/issues" method="POST" enctype="multipart/form-data" id="issue-form">
  <input type="hidden" name="csrf_token" value="abc123xyz">

  <label for="issue-title">Title</label>
  <input id="issue-title" name="title" type="text" required
         maxlength="256" autocomplete="off" autofocus>

  <label for="issue-body">Description</label>
  <textarea id="issue-body" name="body" rows="10" required
            minlength="10" maxlength="65535"
            aria-describedby="body-help"></textarea>
  <small id="body-help">Supports Markdown. Drag and drop images.</small>

  <label for="issue-files">Attach files</label>
  <input id="issue-files" name="attachments" type="file"
         multiple accept="image/*,.pdf,.txt">

  <fieldset>
    <legend>Labels</legend>
    <label><input type="checkbox" name="labels" value="bug"> Bug</label>
    <label><input type="checkbox" name="labels" value="enhancement"> Enhancement</label>
  </fieldset>

  <button type="submit">Submit new issue</button>
  <button type="button" formnovalidate onclick="saveDraft()">Save draft</button>
</form>
\`\`\`

### Production Gotcha: Double-Submit-After-Click Memory Leak
The #1 form bug at scale — accidentally double-submitting payments because the button isn't disabled fast enough:

\`\`\`javascript
// ❌ DANGEROUS — double-clicks send two POST requests, two charges
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await fetch('/charge', { method: 'POST', body: new FormData(form) });
});

// ✅ PRODUCTION-SAFE — disable button synchronously BEFORE await
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type=submit]');
  if (btn.disabled) return;          // already submitting
  btn.disabled = true;               // synchronous — blocks double-click
  btn.textContent = 'Submitting...';
  try {
    await fetch('/charge', { method: 'POST', body: new FormData(form) });
  } finally {
    btn.disabled = false;
    btn.textContent = 'Pay';
  }
});
\`\`\`
**Why it happens:** Between \`fetch()\` returning a promise and the network round-trip completing, the button stays enabled — a quick second click queues a second request before the first resolves.

### Form Element Quick Reference

| Element | Submits to server | Default \`type\` | Common gotcha |
|---------|------------------|-----------------|---------------|
| \`<input type="text">\` | as \`name=value\` | text | autocomplete defaults vary by browser |
| \`<button>\` inside form | yes (type defaults to "submit") | submit | always specify \`type\` explicitly |
| \`<select multiple>\` | as repeated \`name=value\` | — | server must parse as array |
| \`<input type="file">\` | needs \`enctype="multipart/form-data"\` | — | silent fail without correct enctype |
| \`<input type="hidden">\` | always | — | never put secrets here — visible in DevTools |`,

    interview: `## INTERVIEW

**Q1 (Junior): What is the difference between \`method="GET"\` and \`method="POST"\`?**
A: GET appends form data to the URL as query parameters (visible, bookmarkable, cacheable, length-limited to ~2KB); POST sends data in the request body (hidden from URL, no size limit, never cached). Use GET for searches and filters where the URL should reflect state; use POST for anything that mutates server state. Common bug: using GET for a login form puts the password in browser history and server access logs.

**Q2 (Junior): Why must a file upload form have \`enctype="multipart/form-data"\`?**
A: The default \`application/x-www-form-urlencoded\` encoding cannot represent binary data — it serialises everything as URL-encoded strings. Multipart encoding splits the body into separate parts, each with its own headers, allowing files to transmit as native binary. Without it, your server receives only the filename string, not the bytes.
\`\`\`html
<!-- ❌ Silently fails — server gets filename string only -->
<form action="/upload" method="POST">
  <input type="file" name="avatar">
</form>

<!-- ✅ Correct — server receives actual file bytes -->
<form action="/upload" method="POST" enctype="multipart/form-data">
  <input type="file" name="avatar">
</form>
\`\`\`

**Q3 (Mid): What happens when a \`<button>\` inside a \`<form>\` has no \`type\` attribute?**
A: It defaults to \`type="submit"\` and submits the form when clicked or when Enter is pressed in any field. This causes one of the most common React/Angular bugs: a "Cancel" or "Add row" button inside a form unexpectedly submits. Always specify \`type="button"\` for any in-form button that should NOT submit. Zero runtime cost; enormous bug-prevention payoff.

**Q4 (Mid): What is the role of the \`name\` attribute vs the \`id\` attribute on form controls?**
A: \`name\` is what gets serialised in the submission payload — \`<input name="email" value="x">\` sends \`email=x\` to the server. \`id\` is purely for DOM/CSS/label-association and is NEVER sent to the server. A control without a \`name\` is invisible to form submission. The \`id\` is required only because \`<label for="x">\` needs it to associate a label for accessibility and click-to-focus.

**Q5 (Senior): How does the browser's autofill engine decide which fields to autofill?**
A: It reads the \`autocomplete\` attribute, \`name\`/\`id\` heuristics, the input \`type\`, and surrounding \`<label>\` text. The WHATWG spec defines ~50 \`autocomplete\` token values (\`given-name\`, \`family-name\`, \`postal-code\`, \`cc-number\`, \`one-time-code\`) telling the browser exactly what to suggest. Setting \`autocomplete="off"\` on a password field is actively bad — modern browsers ignore it for security (it would defeat password managers). For sensitive new-password fields use \`autocomplete="new-password"\` to opt into "suggest a strong password" UX.

**Q6 (Senior): What is the difference between \`<input type="submit">\` and \`<button type="submit">\`?**
A: Functionally similar, but \`<button>\` can contain arbitrary HTML (icons, formatting, SVG), is far easier to style (no browser-specific quirks), and can have a separate \`value\` attribute submitted alongside form data. \`<input type="submit">\` accepts only a plain text label via \`value\`. In 2026 there's essentially no reason to use \`<input type="submit">\` outside legacy. The "implicit submission" rule still applies to both: Enter in any single-line text input triggers submission via the first \`type="submit"\` element.

**Q7 (Senior+): Design a checkout submission strategy that survives: network failure, tab close, back button, double-submit.**
A: (1) Persist each step's data to \`sessionStorage\` on every \`change\` event so a tab close + reopen restores state. (2) Use a hidden \`<input name="idempotency_key" value="<uuid>">\` generated once at flow start so the server dedupes a double-submission at the DB layer. (3) Disable the final pay button SYNCHRONOUSLY inside the submit handler before any \`await\` (see REAL_WORLD gotcha). (4) For back button, use \`history.pushState\` to give each step a distinct URL and listen to \`popstate\` to restore the right section. (5) On reconnect after network failure, retry with the SAME idempotency_key — the server returns the cached result instead of charging twice. This combination is how Stripe Checkout achieves "exactly-once" payment over an "at-least-once" network.`,

    feynman: `## FEYNMAN CHECK

### Explain HTML Forms Like I'm 10 Years Old
> A form is a stamped envelope: each input is a labelled line, and clicking Submit folds the page up and posts it to the address in \`action\`. The browser does the entire mailing for free — it gathers every \`name=value\` pair, encodes them, opens the network connection, and follows the response — without one line of JavaScript. This is why \`<form>\` is the ONLY HTML element that can mutate server state without scripting, and why every JS framework's form library is just a fancier wrapper around it.

---

### 5 Deep Conceptual Questions

**Q1: What problem do HTML forms fundamentally solve?**
> **A:** They give the browser a built-in, accessible, network-aware mechanism to collect typed data and ship it to a server using either HTTP method, multiple encodings, and progressive enhancement. Replacing with custom JS loses: automatic Enter-key submission, keyboard accessibility, screen-reader form-mode, password manager integration, autofill heuristics, and the ability to submit without JS.

**Q2: What is the ONE mental model that makes forms click?**
> **A:** A form is a serialiser: every NAMED, ENABLED control inside the form contributes one (or more) \`name=value\` pair to the submission, encoded per \`enctype\`. Controls without \`name\`, controls outside the \`<form>\`, and disabled controls are silently EXCLUDED. Once you internalise "no name = no submission," 90% of form mysteries disappear.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** That a \`<button>\` inside a form is just a click target:
> \`\`\`html
> <!-- ❌ Clicking "Cancel" submits the form. Pressing Enter in title submits the form. -->
> <form action="/save" method="POST">
>   <input name="title">
>   <button onclick="closeDialog()">Cancel</button>
>   <button>Save</button>
> </form>
>
> <!-- ✅ Cancel is type=button (no submit). Save is explicit submit. -->
> <form action="/save" method="POST">
>   <input name="title">
>   <button type="button" onclick="closeDialog()">Cancel</button>
>   <button type="submit">Save</button>
> </form>
> \`\`\`

**Q4: How does form submission interact with the browser's networking stack?**
> **A:** On submit, the browser walks the form's elements collection in DOM order, gathers every successful control (named, non-disabled, valid value), encodes the dataset using \`enctype\`, opens an XHR-equivalent request to \`action\` with the form's \`method\`, and either replaces the current document with the response (default) or does nothing if \`event.preventDefault()\` was called. The serialisation is identical to \`new FormData(form)\`, which is why fetch-based handlers can pass \`new FormData(form)\` directly as the body.

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "An HTML form is a serialisation boundary defined by a \`<form>\` element that collects named, non-disabled successful controls in DOM order, encodes them per \`enctype\`, and dispatches an HTTP request to \`action\` via \`method\` — providing keyboard accessibility, autofill, password-manager integration, and progressive enhancement that no JavaScript form library can fully replicate without re-implementing decades of browser UX."`,

    build: `## BUILD

### 🏗️ Mini Project: No-JS Multi-Step Wizard With Full Validation and Autosave

**What you will build:** A 3-step registration wizard that works WITHOUT JavaScript using native HTML form features (\`required\`, \`pattern\`, \`type\`, \`autocomplete\`, hidden fields for step state) — then enhanced with 30 lines of JS for autosave to \`sessionStorage\`.
**Why this project:** Proves you understand native form capabilities deeply enough to ship a working flow before reaching for React-Hook-Form or Formik.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir wizard-form && cd wizard-form
ni step-1.html, step-2.html, step-3.html, server.mjs -ItemType File
\`\`\`

#### Step 2 — Step 1 (Personal Info) — pure HTML
\`\`\`html
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Register · 1 of 3</title></head>
<body>
  <form action="/wizard/step2" method="POST" autocomplete="on">
    <progress value="1" max="3"></progress>
    <h1>Personal Info</h1>

    <label for="fn">First name</label>
    <input id="fn" name="firstName" type="text" required
           minlength="1" maxlength="50" autocomplete="given-name" autofocus>

    <label for="ln">Last name</label>
    <input id="ln" name="lastName" type="text" required
           minlength="1" maxlength="50" autocomplete="family-name">

    <label for="dob">Date of birth</label>
    <input id="dob" name="dob" type="date" required
           max="2010-01-01" autocomplete="bday">

    <button type="submit">Next →</button>
  </form>
</body></html>
\`\`\`

#### Step 3 — Step 2 (Account) — hidden inputs carry prior data
\`\`\`html
<form action="/wizard/step3" method="POST" autocomplete="on">
  <progress value="2" max="3"></progress>
  <h1>Account Setup</h1>

  <input type="hidden" name="firstName" value="{{ firstName }}">
  <input type="hidden" name="lastName"  value="{{ lastName }}">
  <input type="hidden" name="dob"       value="{{ dob }}">

  <label for="em">Email</label>
  <input id="em" name="email" type="email" required
         autocomplete="email" maxlength="254">

  <label for="pw">Password</label>
  <input id="pw" name="password" type="password" required
         minlength="12" autocomplete="new-password"
         pattern=".*[A-Z].*" title="Must include at least one uppercase letter">

  <button type="button" formnovalidate
          onclick="history.back()">← Back</button>
  <button type="submit">Next →</button>
</form>
\`\`\`

#### Step 4 — Error Handling: Autosave + Double-Submit Prevention
\`\`\`html
<script>
// Persist every change to sessionStorage so reload/back doesn't lose data
document.querySelectorAll('input, select, textarea').forEach(el => {
  const key = 'wizard:' + el.name;
  if (sessionStorage.getItem(key)) el.value = sessionStorage.getItem(key);
  el.addEventListener('input', () => sessionStorage.setItem(key, el.value));
});

// Prevent double-submit (the #1 production form bug)
const form = document.querySelector('form');
form.addEventListener('submit', () => {
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = true;                 // synchronous — no await yet
  btn.textContent = 'Submitting...';
}, { once: true });
</script>
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
// server.mjs — minimal Node server that validates each step
import http from 'node:http';
import { parse } from 'node:querystring';

http.createServer((req, res) => {
  if (req.method !== 'POST') return res.end('OK');
  let body = '';
  req.on('data', c => body += c);
  req.on('end', () => {
    const data = parse(body);
    // Server-side validation — NEVER trust client validation alone
    if (req.url === '/wizard/step2' && (!data.firstName || !data.lastName))
      return res.writeHead(400).end('Missing fields');
    if (req.url === '/wizard/step3') {
      if (!/.+@.+\\..+/.test(data.email))         return res.writeHead(400).end('Bad email');
      if ((data.password || '').length < 12)     return res.writeHead(400).end('Short pw');
    }
    res.writeHead(303, { Location: req.url.replace(/step\\d/, m => 'step' + (+m.slice(-1) + 1)) }).end();
  });
}).listen(8080);
\`\`\`

**Expected Output:**
\`\`\`
- With JS disabled: full wizard works, server handles each step
- With JS enabled: data persists across reload, button disables on submit
- Empty submission: browser tooltip "Please fill in this field"
- Bad email: tooltip "Please include an '@' in the email address"
- Double-click on Submit: only ONE POST hits the server
\`\`\`

**Stretch Challenges:**
- [ ] Add \`autocomplete="one-time-code"\` to a 6-digit SMS verification step (iOS auto-paste)
- [ ] Add a CSP header and prove the inline script still works using a nonce
- [ ] Replace autosave with the \`FormData\` API + IndexedDB for resumability across sessions`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** Define an HTML form in one sentence: what it collects, how it serialises, where it sends.

**Q2:** What attribute MUST be on every form control that you want submitted? What happens if you omit it?

**Q3:** Write a 12-line HTML form with: required email field, min-12-char password field, autocomplete hints, submit button.

---

### Day 3 — Comprehension

**Q4:** What is the difference between \`<button>\` (no type) and \`<button type="button">\` inside a form? Give one bug each causes.

**Q5:** Describe the "double-submit payment" production bug. Write the buggy submit handler and the fix.

**Q6:** Refactor for progressive enhancement, accessibility, and security:
\`\`\`html
<form>
  <div>Email</div>
  <input id="x">
  <div>Password</div>
  <input id="y" type="password">
  <div onclick="submit()">Go</div>
</form>
\`\`\`

---

### Day 7 — Application

**Q7:** Build a file upload form that supports: multiple files, only images and PDFs, drag-and-drop, and a visible "X selected" count — using only HTML attributes and 5 lines of JS.

**Q8:** A form POSTs JSON via fetch and Lighthouse a11y flags it. Name 4 missing form features that would be present if it had used native \`<form action method>\`.

**Q9:** Explain the \`autocomplete\` token system. Give the correct token for: a one-time SMS code, a new password during signup, a credit card expiry month.

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "Walk me through what happens between Submit click and the browser navigating to the response — without JavaScript involved."

**Q11:** Draw the dependency graph: forms-html ↔ form-validation ↔ html-attributes ↔ accessibility-html.

**Q12:** ★ System design: "Design checkout form handling that survives: tab close, network failure mid-flow, back button, double-click on pay, submission without JS."`
  },

  // ── 6. form-validation ────────────────────────────────────────────────────
  'form-validation': {
    feynman: `## FEYNMAN CHECK

### Explain HTML5 Form Validation Like I'm 10 Years Old
> Before you call the server, the browser plays bouncer at the door: it checks every input against built-in rules (\`required\`, \`type="email"\`, \`pattern\`, \`min/max\`, \`minlength/maxlength\`) AND any custom rule you set via \`setCustomValidity('...')\`. If anything fails, the browser blocks the submission and pops up the FIRST invalid field's error — without ONE line of JS. This is why "use the platform" exists: native validation gives you keyboard nav, screen-reader announcements, mobile-friendly UI, and built-in localised error text for free.

---

### 5 Deep Conceptual Questions

**Q1: What problem does native form validation fundamentally solve?**
> **A:** It eliminates the round-trip cost of submitting an obviously-invalid form, while ALSO giving the user instant feedback in a UX consistent with their OS and locale. A custom JS validator can do the same but you re-invent: focus management, ARIA live-region announcements, mobile native error styling, localised error strings, and the screen-reader form mode.

**Q2: What is the ONE mental model that makes form validation click?**
> **A:** Every form control has a live \`validity\` object whose 8 boolean flags (\`valueMissing\`, \`typeMismatch\`, \`patternMismatch\`, \`tooLong\`, \`tooShort\`, \`rangeUnderflow\`, \`rangeOverflow\`, \`stepMismatch\`, plus catch-all \`customError\`) summarise WHY the field is invalid. The browser uses these flags to block submission and show the tooltip. Custom validation is just \`element.setCustomValidity(message)\` — empty string means valid.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** That client-side validation is enough. It's purely a UX layer, NEVER security:
> \`\`\`javascript
> // ❌ DANGEROUS — attacker bypasses the form with curl
> // Server: app.post('/transfer', (req, res) => bank.transfer(req.body.amount));
>
> // ✅ Server MUST re-validate every constraint the HTML claimed
> app.post('/transfer', (req, res) => {
>   const amt = Number(req.body.amount);
>   if (!Number.isFinite(amt) || amt <= 0 || amt > 10000) return res.sendStatus(400);
>   bank.transfer(amt);
> });
> \`\`\`

**Q4: How does \`:invalid\` CSS interact with the validation engine?**
> **A:** The browser keeps \`validity.valid\` in sync on every \`input\` event. \`:invalid\` matches whenever \`validity.valid === false\`. The pitfall: \`:invalid\` fires IMMEDIATELY on page load — a required-but-empty input is already \`:invalid\` before the user touched it, producing ugly red borders on a fresh form. Fix: apply error styles via \`:invalid:not(:placeholder-shown)\` or gate them behind a JS-toggled \`data-touched\` attribute.

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "HTML5 form validation is a declarative constraint API exposed via element attributes (\`required\`, \`pattern\`, \`min\`, \`type\`...) and a programmatic counterpart (\`element.validity\`, \`setCustomValidity\`, \`reportValidity\`) that the browser uses to block submission and surface localised error UI — providing zero-JS UX that must always be re-checked on the server because it is purely a client-side hint, not a security boundary."`,

    build: `## BUILD

### 🏗️ Mini Project: Sign-Up Form With Full Native + Async Custom Validation

**What you will build:** A registration form using every relevant native validation attribute, custom \`setCustomValidity\` for password-confirm matching, async validation that checks username availability via fetch, and properly-timed error display (no premature red borders).
**Why this project:** Wires together every layer of the Constraint Validation API correctly — most production forms get only 1 or 2 layers right.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir validation-demo && cd validation-demo
ni signup.html, validate.js -ItemType File
\`\`\`

#### Step 2 — Form With Native Constraints
\`\`\`html
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Sign up</title>
<style>
  /* Show errors ONLY after first blur — avoids ugly red on page load */
  [data-touched]:invalid { border-color: crimson; }
  [data-touched]:valid   { border-color: green;   }
  .err { color: crimson; font-size: 0.9em; min-height: 1.2em; }
</style></head>
<body>
<form id="signup" action="/signup" method="POST" novalidate>
  <label for="u">Username</label>
  <input id="u" name="username" type="text" required
         minlength="3" maxlength="20"
         pattern="[a-z0-9_]+"
         title="Lowercase letters, digits, underscore only"
         aria-describedby="u-err">
  <div id="u-err" class="err" aria-live="polite"></div>

  <label for="e">Email</label>
  <input id="e" name="email" type="email" required maxlength="254"
         aria-describedby="e-err">
  <div id="e-err" class="err" aria-live="polite"></div>

  <label for="p">Password</label>
  <input id="p" name="password" type="password" required
         minlength="12" pattern=".*[A-Z].*[0-9].*"
         title="≥12 chars, 1 uppercase, 1 digit"
         aria-describedby="p-err">
  <div id="p-err" class="err" aria-live="polite"></div>

  <label for="p2">Confirm password</label>
  <input id="p2" name="passwordConfirm" type="password" required
         aria-describedby="p2-err">
  <div id="p2-err" class="err" aria-live="polite"></div>

  <button type="submit">Create account</button>
</form>
<script type="module" src="./validate.js"></script>
</body></html>
\`\`\`

#### Step 3 — Custom + Async Validation (\`validate.js\`)
\`\`\`javascript
const form = document.getElementById('signup');
const u    = form.username;
const p    = form.password;
const p2   = form.passwordConfirm;

// (1) Mark fields as "touched" on first blur — :invalid styling only shows then
for (const field of form.elements) {
  if (!field.name) continue;
  field.addEventListener('blur', () => field.dataset.touched = 'true', { once: true });
  field.addEventListener('input', () => showError(field));
}

// (2) Password-confirm custom validity — runs on EITHER field changing
function syncConfirm() {
  const msg = p.value && p2.value && p.value !== p2.value
    ? 'Passwords do not match'
    : '';
  p2.setCustomValidity(msg);
  showError(p2);
}
p.addEventListener('input', syncConfirm);
p2.addEventListener('input', syncConfirm);

// (3) Async username availability — debounced, AbortController-cancelled
let abort;
u.addEventListener('input', async () => {
  if (abort) abort.abort();
  abort = new AbortController();
  if (!u.checkValidity()) return;           // skip if native rules already fail
  await new Promise(r => setTimeout(r, 300));  // debounce
  try {
    const r = await fetch('/api/check?u=' + encodeURIComponent(u.value),
                          { signal: abort.signal });
    const { available } = await r.json();
    u.setCustomValidity(available ? '' : 'Username already taken');
  } catch (e) {
    if (e.name !== 'AbortError') u.setCustomValidity('');
  }
  showError(u);
});

// (4) Render validation message into the live region
function showError(field) {
  const slot = document.getElementById(field.id + '-err');
  slot.textContent = field.validity.valid ? '' : field.validationMessage;
  field.setAttribute('aria-invalid', String(!field.validity.valid));
}

// (5) On submit, re-check ALL and let browser show its UI
form.addEventListener('submit', (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    form.reportValidity();                  // browser focuses first invalid field
  }
});
\`\`\`

#### Step 4 — Edge Cases
\`\`\`javascript
// Disable submit while any field is invalid (optional UX)
form.addEventListener('input', () => {
  form.querySelector('button[type=submit]').disabled = !form.checkValidity();
});

// Reset clears custom validity too (otherwise stays "taken" after reset)
form.addEventListener('reset', () => {
  for (const el of form.elements) el.setCustomValidity?.('');
});
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
// Smoke test via the DOM API
console.assert(form.username.validity.valueMissing, 'username should be required');
form.username.value = 'ab';
console.assert(form.username.validity.tooShort, 'minlength=3 should trigger tooShort');
form.username.value = 'AB!';
console.assert(form.username.validity.patternMismatch, 'pattern should reject uppercase/!');
form.username.value = 'ok_name';
console.assert(form.username.validity.valid, 'valid username should pass');
\`\`\`

**Expected Output:**
\`\`\`
- Empty submission: browser tooltip on first invalid field, no network call
- "AB!" in username: red border after blur, "Lowercase letters, digits, underscore only"
- Password "abc" + confirm "xyz": confirm field shows "Passwords do not match"
- Available username: green border. Taken: red border + "Username already taken"
- All console.assert calls pass with no warning
\`\`\`

**Stretch Challenges:**
- [ ] Add a strength meter that turns the password border yellow → green based on entropy
- [ ] Add a "Show password" toggle without breaking validation
- [ ] Replace inline error divs with a single \`<output>\` summary at form top`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** Name the 8 \`ValidityState\` boolean flags. Give one HTML attribute that triggers each.

**Q2:** What is the ONE method you call to set a custom error message on a form control? What argument means "no error"?

**Q3:** Write a 6-line HTML form with a username field that requires 3-20 lowercase letters or digits, no spaces.

---

### Day 3 — Comprehension

**Q4:** Why does \`:invalid\` create poor UX on a freshly loaded form? Give two different fixes.

**Q5:** Describe a production bug where the team relied on \`pattern\` for security. Show the exploit and the server-side fix.

**Q6:** Refactor so the password-confirm check is properly hooked into the Constraint Validation API:
\`\`\`html
<input id="pw" type="password">
<input id="pw2" type="password">
<button onclick="if(pw.value!==pw2.value){alert('mismatch');return false;}submit();">Go</button>
\`\`\`

---

### Day 7 — Application

**Q7:** Build an async "is this email already registered" validator with 300ms debounce, AbortController cancellation, and aria-live error display. No libraries.

**Q8:** A form validates entirely in JS with custom HTML errors. List 4 things the browser would give you for free if you migrated to the Constraint Validation API.

**Q9:** What is \`form.reportValidity()\` vs \`form.checkValidity()\`? When do you call each and what does each do to the UI?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "Walk me through how you would build a sign-up form's validation using only browser APIs."

**Q11:** Draw the dependency graph: form-validation ↔ forms-html ↔ html-attributes ↔ accessibility-html.

**Q12:** ★ System design: "Design validation for a multi-region SaaS where: client validates instantly, server enforces business rules, async checks must work offline, error messages localised in 14 languages. Where does each rule live?"`
  },

  // ── 7. accessibility-html ─────────────────────────────────────────────────
  'accessibility-html': {
    feynman: `## FEYNMAN CHECK

### Explain HTML Accessibility Like I'm 10 Years Old
> Accessibility is making your web page work when somebody isn't using a mouse, isn't looking at the screen, or has a brain that processes things differently. The browser builds a second tree alongside the DOM called the **accessibility tree** — that's what a screen reader actually reads. Native HTML tags (\`<button>\`, \`<nav>\`, \`<main>\`, \`<input>\`) automatically have the right "role" in that tree. The moment you reach for \`<div onclick>\`, the browser puts role=generic in the accessibility tree — invisible to a blind user, unreachable by the Tab key.

---

### 5 Deep Conceptual Questions

**Q1: What problem does HTML accessibility fundamentally solve?**
> **A:** It makes the web usable for the 15% of humans with a permanent disability AND for the temporarily disabled (broken arm, baby in hand, bright sun on phone screen). It also unlocks SEO, voice control, automated testing, and reader-mode features — accessibility is the foundation of every alternative interface to your site.

**Q2: What is the ONE mental model that makes accessibility click?**
> **A:** "Native first, ARIA second, never both." If a native element does what you need, use it (\`<button>\`, \`<input type="checkbox">\`). Only reach for ARIA roles when you must build a custom widget. NEVER add a redundant ARIA role to a native element (\`<button role="button">\` literally breaks some screen readers).

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** That \`aria-label\` fixes everything:
> \`\`\`html
> <!-- ❌ aria-label only patches the screen-reader name. Not keyboard-focusable. No click semantics. -->
> <div aria-label="Close" onclick="close()">X</div>
>
> <!-- ✅ Real button: focusable, Enter/Space works, screen-reader-announced, form-friendly -->
> <button type="button" aria-label="Close" onclick="close()">×</button>
> \`\`\`

**Q4: How does focus management interact with the accessibility tree?**
> **A:** The accessibility tree tracks WHICH node currently has focus (the OS announces it). Only certain elements are focusable by default (links with \`href\`, form controls, \`tabindex\`). Adding \`tabindex="0"\` makes any element focusable in the normal Tab order; \`tabindex="-1"\` makes it programmatically focusable (via \`element.focus()\`) but skipped by Tab. \`tabindex="1+"\` is almost always a bug — it overrides natural DOM order and confuses screen-reader users.

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "HTML accessibility is the discipline of choosing semantic elements, providing text alternatives for non-text content, managing keyboard focus order, and using ARIA only as a polyfill for custom widgets — so that the browser's accessibility tree, populated automatically by native elements, conveys interactive affordances and content structure to assistive technologies without requiring JavaScript instrumentation."`,

    build: `## BUILD

### 🏗️ Mini Project: An Accessible Custom Modal Dialog From Scratch

**What you will build:** A fully WCAG 2.2-compliant modal dialog with: focus trap, ESC to close, focus restoration, screen-reader announcements, and \`<dialog>\` element fallback to ARIA for older browsers.
**Why this project:** Modals are the most commonly broken widget on the web. Building one correctly forces you to use every accessibility primitive.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir a11y-modal && cd a11y-modal
ni index.html, modal.js -ItemType File
\`\`\`

#### Step 2 — Use the Native \`<dialog>\` Element
\`\`\`html
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Accessible modal</title></head>
<body>
  <main>
    <h1>Account settings</h1>
    <button id="open-btn" type="button">Delete account</button>
  </main>

  <dialog id="confirm" aria-labelledby="d-title" aria-describedby="d-desc">
    <h2 id="d-title">Are you sure?</h2>
    <p id="d-desc">This will permanently delete your account and all data.</p>
    <form method="dialog">
      <button value="cancel" type="submit">Cancel</button>
      <button value="confirm" type="submit" autofocus>Delete</button>
    </form>
  </dialog>

  <script type="module" src="./modal.js"></script>
</body></html>
\`\`\`

#### Step 3 — Wire It Up
\`\`\`javascript
const openBtn = document.getElementById('open-btn');
const dlg     = document.getElementById('confirm');

openBtn.addEventListener('click', () => {
  dlg.showModal();                     // native: focus trap + inert background
});

dlg.addEventListener('close', () => {
  // dlg.returnValue is 'confirm' or 'cancel' — set by the button's value=
  if (dlg.returnValue === 'confirm') deleteAccount();
  openBtn.focus();                     // restore focus to the trigger
});

function deleteAccount() {
  console.log('Account deletion requested');
}
\`\`\`

#### Step 4 — Fallback for Older Browsers (No \`<dialog>\` Support)
\`\`\`javascript
// Polyfill: trap focus inside a div if <dialog> is unsupported
function manualModal(modal, trigger) {
  const focusable = modal.querySelectorAll(
    'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0], last = focusable[focusable.length - 1];

  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.removeAttribute('hidden');
  first.focus();

  function onKey(e) {
    if (e.key === 'Escape') return close();
    if (e.key !== 'Tab') return;
    // Loop focus inside the modal
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
  function close() {
    modal.setAttribute('hidden', '');
    document.removeEventListener('keydown', onKey);
    trigger.focus();                   // restore focus
  }

  document.addEventListener('keydown', onKey);
  modal.querySelector('[data-close]')?.addEventListener('click', close);
}
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
// Manual tests every PR should run:
// 1. Open modal → focus moves to autofocus button
// 2. Press Tab → focus stays inside dialog (cycles between buttons)
// 3. Press Esc → dialog closes, focus returns to "Delete account" trigger
// 4. Screen reader (NVDA/VoiceOver) announces "Are you sure? Dialog" on open
// 5. Background page is inert — Tab cannot reach links behind the modal

// Automated: axe-core on the page with modal open
import AxeBuilder from '@axe-core/playwright';
const { violations } = await new AxeBuilder({ page }).analyze();
console.assert(violations.length === 0, 'Modal should have zero a11y violations');
\`\`\`

**Expected Output:**
\`\`\`
- axe-core: 0 violations
- Tab order: Delete → Cancel → loops back to Delete
- Esc closes modal, focus visible on "Delete account" trigger
- NVDA announces: "Are you sure? Dialog. This will permanently delete..."
\`\`\`

**Stretch Challenges:**
- [ ] Animate open/close with prefers-reduced-motion respect
- [ ] Add \`inert\` attribute polyfill for browsers without native support
- [ ] Add a "click outside to close" handler that doesn't trap focus`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** What is the accessibility tree? How does it differ from the DOM?

**Q2:** Name 4 ways to provide a text alternative for an image. When is each appropriate?

**Q3:** Write the HTML for a button-icon (✕) that closes a dialog and is properly labelled for a screen reader.

---

### Day 3 — Comprehension

**Q4:** What does \`tabindex="-1"\` do vs \`tabindex="0"\` vs \`tabindex="1"\`? Why is the third almost always a bug?

**Q5:** Describe the most common production a11y bug introduced by SPAs. Show the broken pattern and the fix.

**Q6:** Refactor for accessibility:
\`\`\`html
<div onclick="toggle()" class="switch">
  <img src="on.svg">
</div>
\`\`\`

---

### Day 7 — Application

**Q7:** Build a fully keyboard-accessible custom tab interface (no libraries) that satisfies the ARIA Authoring Practices "tabs" pattern.

**Q8:** A modal opens but Tab leaks to background. List 3 root-cause possibilities and the fix for each.

**Q9:** What is a "live region"? Build a 10-line auto-saving form that announces "Saved" to screen-reader users without stealing focus.

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "Walk me through making a custom dropdown that's fully accessible."

**Q11:** Draw the dependency graph: accessibility-html ↔ semantic-elements ↔ html-attributes ↔ forms-html.

**Q12:** ★ System design: "Design the a11y testing strategy for a 500-component design system: which checks run in CI, which in PR review, which in manual audit?"`
  },

  // ── 8. links-and-images ───────────────────────────────────────────────────
  'links-and-images': {
    feynman: `## FEYNMAN CHECK

### Explain Links and Images Like I'm 10 Years Old
> Links (\`<a href>\`) and images (\`<img src>\`) are the two ways HTML reaches out to other URLs. A link tells the browser "navigate here when clicked"; an image tells the browser "download this and render it inline." Both are subject to the same security rules (CORS, mixed content) but behave totally differently: a link is lazy (only fetched on click), an image is eager (fetched immediately during HTML parsing unless you say \`loading="lazy"\`). Getting \`alt=""\` wrong on images and \`target="_blank"\` wrong on links are the two most common accessibility AND security mistakes on the web.

---

### 5 Deep Conceptual Questions

**Q1: What problem do \`<a>\` and \`<img>\` fundamentally solve?**
> **A:** They are the original "rich-media composition" primitives — the reason the web outcompeted plain-text protocols. \`<a>\` invented hypertext navigation; \`<img>\` invented inline media. Every modern resource hint (\`<link rel="preload">\`, \`fetchpriority\`) descends from optimisation pressure on these two tags.

**Q2: What is the ONE mental model that makes them click?**
> **A:** Both are URL references with browser-managed fetch lifecycles, but \`<a>\` is user-initiated (click) and \`<img>\` is parser-initiated (downloaded during HTML parse). Once you internalise "the browser starts the \`<img>\` fetch BEFORE running your CSS or JS," lazy-loading, priority hints, and LCP optimisation all make sense.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** That \`target="_blank"\` is safe by itself:
> \`\`\`html
> <!-- ❌ Tab-napping vulnerability — the new tab can navigate THIS tab via window.opener -->
> <a href="https://evil.com" target="_blank">External link</a>
>
> <!-- ✅ Safe: rel="noopener" severs the window.opener reference -->
> <a href="https://evil.com" target="_blank" rel="noopener noreferrer">External link</a>
> \`\`\`
> Modern browsers default \`target="_blank"\` to noopener since 2021, but legacy stacks (older WebViews, embedded browsers) still leak.

**Q4: How does an \`<img>\` interact with the browser's preload scanner at the runtime level?**
> **A:** While the main HTML parser runs synchronously (and is blocked by \`<script>\`), the browser ALSO runs a "preload scanner" in parallel that finds \`<img src>\`, \`<link rel="stylesheet">\`, and other URLs in the raw HTML bytes and starts fetching them immediately. This is why \`<img loading="lazy">\` works ONLY for images below the fold — for above-the-fold images, the preload scanner has already started the fetch before the parser reaches the tag. For LCP images, use \`fetchpriority="high"\` instead.

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "\`<a>\` and \`<img>\` are URL-bearing elements with distinct fetch lifecycles: \`<a>\` defers the network request until user interaction while \`<img>\` triggers an eager parallel fetch via the browser's preload scanner — which is why \`fetchpriority\`, \`loading\`, \`decoding\`, and \`rel\` attributes are the most impactful single-attribute additions for Core Web Vitals."`,

    build: `## BUILD

### 🏗️ Mini Project: A Performance-Optimised Image Gallery With Responsive Sources

**What you will build:** A gallery page that achieves a perfect LCP score using \`<picture>\`, \`srcset\`, \`sizes\`, \`loading\`, \`decoding\`, and \`fetchpriority\` — and external links that are SEO + security correct.
**Why this project:** Combines every modern \`<img>\` and \`<a>\` attribute into one realistic scenario.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir gallery && cd gallery
ni gallery.html -ItemType File
mkdir img
# Drop into img/: hero-400.avif, hero-800.avif, hero-1200.avif, hero-1200.jpg, plus more
\`\`\`

#### Step 2 — Hero Image (Above-the-Fold, Highest Priority)
\`\`\`html
<!-- LCP image: eager-load, high priority, sync decode -->
<picture>
  <source type="image/avif"
          srcset="img/hero-400.avif 400w,
                  img/hero-800.avif 800w,
                  img/hero-1200.avif 1200w"
          sizes="(max-width: 600px) 100vw, 50vw">
  <source type="image/webp"
          srcset="img/hero-400.webp 400w,
                  img/hero-800.webp 800w"
          sizes="(max-width: 600px) 100vw, 50vw">
  <img src="img/hero-1200.jpg"
       alt="Sunlit forest path through autumn maples in Hokkaido."
       width="1200" height="675"
       fetchpriority="high"
       decoding="sync">
</picture>
\`\`\`

#### Step 3 — Lazy-Loaded Gallery (Below the Fold)
\`\`\`html
<ul class="gallery">
  <li>
    <img src="img/g-1.jpg"
         alt="Snow on Mt Fuji, photographed at sunrise."
         width="400" height="300"
         loading="lazy" decoding="async">
  </li>
  <li>
    <img src="img/g-2.jpg"
         alt=""              <!-- decorative — empty alt, screen-reader skips -->
         width="400" height="300"
         loading="lazy" decoding="async">
  </li>
  <li>
    <img src="img/g-3.jpg"
         alt="Cherry blossoms in Kyoto's Maruyama Park at peak bloom."
         width="400" height="300"
         loading="lazy" decoding="async">
  </li>
</ul>
\`\`\`

#### Step 4 — Smart Links: Internal, External, Download, Phone, Email
\`\`\`html
<!-- Internal link — prefetched for instant navigation -->
<a href="/about">About us</a>
<link rel="prefetch" href="/about">

<!-- External — safe target=_blank with explicit rel hints -->
<a href="https://flickr.com" target="_blank" rel="noopener noreferrer external">
  See more on Flickr →
</a>

<!-- Sponsored or paid link (SEO-friendly) -->
<a href="https://sponsor.com" rel="sponsored noopener" target="_blank">Sponsor</a>

<!-- User-generated content link (SEO-friendly, e.g. comments section) -->
<a href="https://user-blog.com" rel="ugc noopener" target="_blank">User blog</a>

<!-- Download attribute: forces save-as instead of navigation -->
<a href="/files/album.zip" download="kyoto-photos.zip">Download all (12 MB)</a>

<!-- Telephone, email, SMS — opens the native handler app -->
<a href="tel:+819012345678">+81 90-1234-5678</a>
<a href="mailto:hi@example.com?subject=Hello">hi@example.com</a>
<a href="sms:+819012345678?body=Hi">SMS</a>
\`\`\`

#### Step 5 — Tests
\`\`\`bash
# 1. Lighthouse — should achieve LCP <2.5s on slow 4G simulation
npx -y lighthouse http://localhost:8080/gallery.html \\
  --only-categories=performance --throttling.cpuSlowdownMultiplier=4 --quiet

# 2. Manual: check Network tab — hero image must start fetching FIRST,
#    gallery images only when scrolled into view
\`\`\`

**Expected Output:**
\`\`\`
Lighthouse Performance: 95+
LCP: <2.5s on slow 4G
- Hero image fetched first with high priority
- Gallery images fetched only when scrolled near
- External links open in new tab with no window.opener leak
\`\`\`

**Stretch Challenges:**
- [ ] Add \`<link rel="preconnect">\` for the CDN domain
- [ ] Use \`<img srcset>\` with \`x\` descriptors instead of \`w\` for icon assets
- [ ] Implement a "blur-up" placeholder using a tiny base64 \`<img>\` swapped on load`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** When do you use \`alt=""\` vs a descriptive \`alt="..."\`? Give one example of each.

**Q2:** What does \`rel="noopener noreferrer"\` protect against? Which browsers still need it?

**Q3:** Write a \`<picture>\` element that serves AVIF to supporting browsers and falls back to JPEG.

---

### Day 3 — Comprehension

**Q4:** What is the difference between \`loading="lazy"\`, \`fetchpriority="high"\`, and \`decoding="async"\`? When does each matter?

**Q5:** Describe an SEO scenario where missing \`width\`/\`height\` attributes on \`<img>\` directly hurts Core Web Vitals. Quantify the CLS impact.

**Q6:** Refactor for performance and accessibility:
\`\`\`html
<img src="photo.jpg" onclick="open()">
<a href="https://x.com" target="_blank">External</a>
\`\`\`

---

### Day 7 — Application

**Q7:** Build the \`<head>\` resource hints (\`preload\`, \`preconnect\`, \`dns-prefetch\`) for a page whose hero is an AVIF image hosted on a CDN subdomain.

**Q8:** A page's LCP regressed from 2.1s to 4.8s. The only change was wrapping the hero \`<img>\` in a JS-rendered component. Explain the cause and the fix.

**Q9:** What is the \`srcset\` "w descriptor" vs "x descriptor"? When do you use each? Give a 4-line example of each.

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "How would you optimise images on a Pinterest-style infinite-scroll gallery?"

**Q11:** Draw the dependency graph: links-and-images ↔ performance-html ↔ meta-tags-and-seo ↔ accessibility-html.

**Q12:** ★ System design: "Design the image delivery pipeline for a global e-commerce site with 500M images: which formats, what CDN cache headers, which HTML attributes per image type?"`
  },

  // ── 9. list-elements ──────────────────────────────────────────────────────
  'list-elements': {
    feynman: `## FEYNMAN CHECK

### Explain List Elements Like I'm 10 Years Old
> HTML has three list types: \`<ul>\` for unordered items (order doesn't matter — like shopping list), \`<ol>\` for ordered (order matters — like recipe steps), and \`<dl>\` for definition pairs (term → definition, like a glossary). Screen readers ANNOUNCE list counts ("list of 5 items") — which is huge for navigation. \`<nav><ul>\` is the universal pattern because the nav landmark + the announced list count tells a blind user exactly what they're looking at: "navigation, list of 7 items."

---

### 5 Deep Conceptual Questions

**Q1: What problem do list elements fundamentally solve?**
> **A:** They give a screen reader the metadata to announce item COUNTS and CURRENT POSITION ("item 3 of 5"), which is impossible with stacked \`<div>\`s. They also give browsers and search crawlers a hint that these items are a related collection, which influences how Reader Mode and SEO snippets render.

**Q2: What is the ONE mental model that makes lists click?**
> **A:** A list is a CONTAINER (\`<ul>\` / \`<ol>\` / \`<dl>\`) that may ONLY directly contain list items (\`<li>\` for ul/ol, \`<dt>\`+\`<dd>\` for dl). Putting anything else as a direct child is invalid HTML and breaks the screen-reader item count. CSS-wise, the bullets are a default user-agent style applied to \`<li>\`, removable with \`list-style: none\` without losing the semantic.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** Removing \`<ul>\` because "I don't want bullets":
> \`\`\`html
> <!-- ❌ Lost semantic. Screen reader announces 3 generic items, not "list of 3" -->
> <nav>
>   <div><a href="/">Home</a></div>
>   <div><a href="/blog">Blog</a></div>
>   <div><a href="/about">About</a></div>
> </nav>
>
> <!-- ✅ Semantic preserved. CSS removes bullets without losing the list role -->
> <nav>
>   <ul style="list-style:none; padding:0;">
>     <li><a href="/">Home</a></li>
>     <li><a href="/blog">Blog</a></li>
>     <li><a href="/about">About</a></li>
>   </ul>
> </nav>
> \`\`\`

**Q4: How does \`<ol>\` interact with browser numbering and the \`start\`/\`reversed\`/\`type\` attributes?**
> **A:** \`<ol start="5">\` starts at 5; \`<ol reversed>\` counts down; \`<ol type="A">\` uses A, B, C; per-item \`<li value="10">\` jumps the numbering. Crucially, these are SEMANTIC numbers — they're exposed in the accessibility tree, so a screen reader announces "item 5" not "item 1." This is the only way to correctly mark up a continuation list ("steps continued from previous page, starting at step 8").

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "HTML lists are semantic container elements (\`<ul>\`, \`<ol>\`, \`<dl>\`) whose direct children populate the accessibility tree with item-count and position metadata that screen readers announce on entry — which is why removing the \`<ul>\` from a nav menu silently regresses the experience for keyboard and screen-reader users despite producing identical pixels."`,

    build: `## BUILD

### 🏗️ Mini Project: Site Navigation, Breadcrumb, and FAQ — All Using Lists Correctly

**What you will build:** A site header containing primary nav (\`<ul>\`), a breadcrumb (\`<ol>\` with \`aria-current\`), and a FAQ section (\`<dl>\`) — proving each list type's correct use case.
**Why this project:** Demonstrates the three list elements solving three distinct problems in one page.
**Time estimate:** 25 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir lists-demo && cd lists-demo
ni page.html -ItemType File
\`\`\`

#### Step 2 — Primary Nav (unordered list)
\`\`\`html
<header>
  <nav aria-label="Primary">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/products">Products</a></li>
      <li><a href="/pricing">Pricing</a></li>
      <li><a href="/blog" aria-current="page">Blog</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>
\`\`\`

#### Step 3 — Breadcrumb (ordered list with current page)
\`\`\`html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/blog">Blog</a></li>
    <li><a href="/blog/web">Web</a></li>
    <li><a href="/blog/web/html-lists" aria-current="page">HTML lists</a></li>
  </ol>
</nav>

<!-- BreadcrumbList JSON-LD for Google rich results -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home",       "item": "https://example.com/" },
    { "@type": "ListItem", "position": 2, "name": "Blog",       "item": "https://example.com/blog" },
    { "@type": "ListItem", "position": 3, "name": "Web",        "item": "https://example.com/blog/web" },
    { "@type": "ListItem", "position": 4, "name": "HTML lists" }
  ]
}
</script>
\`\`\`

#### Step 4 — FAQ as a Definition List
\`\`\`html
<section aria-labelledby="faq-h">
  <h2 id="faq-h">Frequently asked questions</h2>
  <dl>
    <dt>What is the difference between &lt;ul&gt; and &lt;ol&gt;?</dt>
    <dd>&lt;ul&gt; is for items where order does not matter; &lt;ol&gt;
        is for items where order does (steps, rankings, breadcrumbs).</dd>

    <dt>When should I use &lt;dl&gt;?</dt>
    <dd>For pairs of related items — terms and definitions, questions and
        answers, key-value metadata.</dd>
  </dl>
</section>

<!-- FAQPage JSON-LD so the answers appear directly in Google search -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the difference between ul and ol?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ul is for unordered items; ol is for ordered items."
      }
    }
  ]
}
</script>
\`\`\`

#### Step 5 — Tests
\`\`\`bash
npx -y html-validate page.html
# Should produce zero errors.

# Test the rich snippets:
# https://search.google.com/test/rich-results
# Paste your page URL → expect "Breadcrumbs" and "FAQ" to be detected
\`\`\`

**Expected Output:**
\`\`\`
html-validate: 0 errors, 0 warnings
Rich Results Test: ✓ Breadcrumbs detected (4 items)
                   ✓ FAQ detected (2 questions)
Screen reader announces: "Primary navigation, list of 5 items"
                         "Breadcrumb, list of 4 items, current page: HTML lists"
\`\`\`

**Stretch Challenges:**
- [ ] Convert FAQ to \`<details>/<summary>\` collapsibles AND keep the \`<dl>\` semantic
- [ ] Add a nested \`<ul>\` for mega-menu sub-items with \`aria-expanded\` toggle
- [ ] Style breadcrumbs without removing the \`<ol>\` using CSS counter generation`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** What is the only direct child allowed inside \`<ul>\` and \`<ol>\`? What about \`<dl>\`?

**Q2:** Name three attributes valid only on \`<ol>\` and explain what each does.

**Q3:** Write a 5-item ordered list that starts at 10 and counts down.

---

### Day 3 — Comprehension

**Q4:** Why is \`<nav><ul>\` the universal pattern for site navigation? What does a screen reader announce that \`<nav><div>\` doesn't get?

**Q5:** Describe a SEO regression caused by removing \`<ol>\` from a breadcrumb. What rich snippet stops appearing in Google?

**Q6:** Refactor:
\`\`\`html
<div class="menu">
  <div onclick="go('/')">Home</div>
  <div onclick="go('/a')">About</div>
  <div onclick="go('/c')" class="active">Contact</div>
</div>
\`\`\`

---

### Day 7 — Application

**Q7:** Build a multi-level mega menu using only \`<ul>\` and \`<a>\`, with proper keyboard navigation, no JS. Use CSS \`:focus-within\` for the open state.

**Q8:** You inherit a FAQ section using \`<div>\`s. List 3 things you lose vs using \`<dl>\` (a11y, SEO, semantic).

**Q9:** What is a "description list" vs a "definition list"? When did the HTML spec change the name and why?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "When would you use a \`<dl>\` instead of a \`<table>\`?"

**Q11:** Draw the dependency graph: list-elements ↔ semantic-elements ↔ accessibility-html ↔ meta-tags-and-seo.

**Q12:** ★ System design: "Design the HTML structure for a Wikipedia-style content site with infinite categories, breadcrumbs, table of contents, and reference lists. Where does each list type fit?"`
  },

  // ── 10. tables ────────────────────────────────────────────────────────────
  'tables': {
    feynman: `## FEYNMAN CHECK

### Explain HTML Tables Like I'm 10 Years Old
> A \`<table>\` is a 2D data grid where cells in the same row are related horizontally and cells in the same column are related vertically. Screen readers use the \`<th scope="col">\` and \`<th scope="row">\` headers to ANNOUNCE the column AND row context for every cell — "Revenue, Q3, 1.2 million." Using a \`<table>\` for layout (the 1990s sin) confuses screen readers because they announce the layout grid as data. Using \`<div>\` for actual tabular data loses all the screen-reader navigation that makes a 100-row table usable for a blind user.

---

### 5 Deep Conceptual Questions

**Q1: What problem do tables fundamentally solve?**
> **A:** They convey 2D data relationships — every cell has TWO contexts (its row meaning + its column meaning) that the user needs simultaneously. No \`<div>\` grid can give a screen reader the announcement "Q3 Revenue, North America, 4.2 million" — only \`<th scope>\` does.

**Q2: What is the ONE mental model that makes tables click?**
> **A:** A table has SIX semantic groups: \`<caption>\` (title), \`<thead>\` (header rows), \`<tbody>\` (body rows), \`<tfoot>\` (footer rows), \`<colgroup>\`/\`<col>\` (column groups), and individual \`<th>\`/\`<td>\` cells with \`scope\` attributes. Together they form an accessibility-tree structure that lets a screen reader navigate by column or row, announce headers automatically, and skip the table entirely with one keystroke.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** Using \`<th>\` without \`scope\`:
> \`\`\`html
> <!-- ❌ Screen reader can't tell which header applies to which cell -->
> <table>
>   <tr><th>Name</th><th>Q1</th><th>Q2</th></tr>
>   <tr><td>Alice</td><td>100</td><td>120</td></tr>
> </table>
>
> <!-- ✅ Explicit scope: every cell is announced with its column header -->
> <table>
>   <caption>Sales by rep, Q1-Q2 2026</caption>
>   <thead>
>     <tr>
>       <th scope="col">Name</th>
>       <th scope="col">Q1</th>
>       <th scope="col">Q2</th>
>     </tr>
>   </thead>
>   <tbody>
>     <tr><th scope="row">Alice</th><td>100</td><td>120</td></tr>
>   </tbody>
> </table>
> \`\`\`

**Q4: How do \`rowspan\` and \`colspan\` interact with the accessibility tree?**
> **A:** They merge cells visually but the accessibility tree still tracks the row × column grid — a \`colspan="2"\` cell is announced as covering columns 2 and 3. The trap: misaligned \`rowspan\` creates "ragged" rows that screen readers cannot parse. The browser builds a 2D map and assigns each cell to its row/column coordinates; if your math is off (e.g., 3 cells + colspan=2 in a 4-column table = overflow), the grid corrupts.

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "An HTML table is a 2D data grid composed of grouped structural elements (\`<caption>\`, \`<thead>\`, \`<tbody>\`, \`<tfoot>\`, \`<colgroup>\`) and \`<th>\`/\`<td>\` cells whose \`scope\` and \`headers\` attributes feed a row/column adjacency map into the accessibility tree — making it the only HTML construct that conveys two-dimensional data relationships to assistive technologies."`,

    build: `## BUILD

### 🏗️ Mini Project: A Sortable, Accessible, Responsive Data Table With Caption and Footer

**What you will build:** A quarterly-revenue table with \`<caption>\`, \`<thead>\`, sortable columns (click \`<th>\` to sort), \`<tfoot>\` totals, and a "stack on mobile" responsive pattern that preserves accessibility.
**Why this project:** A real-world data table touches every table semantic + a JS sort + a non-trivial responsive challenge.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir data-table && cd data-table
ni table.html, sort.js -ItemType File
\`\`\`

#### Step 2 — Semantic Table Markup
\`\`\`html
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>Revenue table</title></head>
<body>
<table id="rev">
  <caption>Quarterly revenue by region, 2026 (USD millions)</caption>
  <colgroup>
    <col span="1" style="background:#fafafa">  <!-- region column subtle bg -->
    <col span="4">
  </colgroup>
  <thead>
    <tr>
      <th scope="col"><button type="button" data-sort="0">Region ↕</button></th>
      <th scope="col"><button type="button" data-sort="1">Q1 ↕</button></th>
      <th scope="col"><button type="button" data-sort="2">Q2 ↕</button></th>
      <th scope="col"><button type="button" data-sort="3">Q3 ↕</button></th>
      <th scope="col"><button type="button" data-sort="4">Q4 ↕</button></th>
    </tr>
  </thead>
  <tbody>
    <tr><th scope="row">North America</th><td>4.2</td><td>4.8</td><td>5.1</td><td>5.6</td></tr>
    <tr><th scope="row">EMEA</th>        <td>3.1</td><td>3.4</td><td>3.7</td><td>3.9</td></tr>
    <tr><th scope="row">APAC</th>        <td>2.8</td><td>3.0</td><td>3.4</td><td>3.7</td></tr>
  </tbody>
  <tfoot>
    <tr><th scope="row">Total</th><td>10.1</td><td>11.2</td><td>12.2</td><td>13.2</td></tr>
  </tfoot>
</table>
<script type="module" src="./sort.js"></script>
</body></html>
\`\`\`

#### Step 3 — Sort by Column (\`sort.js\`)
\`\`\`javascript
const table = document.getElementById('rev');
const tbody = table.tBodies[0];

table.tHead.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-sort]');
  if (!btn) return;
  const col = Number(btn.dataset.sort);
  const dir = btn.dataset.dir === 'asc' ? 'desc' : 'asc';

  // Reset every button's sort indicator
  for (const b of table.tHead.querySelectorAll('button[data-sort]')) {
    b.removeAttribute('data-dir');
    b.setAttribute('aria-sort', 'none');
  }
  btn.dataset.dir = dir;
  btn.setAttribute('aria-sort', dir === 'asc' ? 'ascending' : 'descending');

  // Sort rows by the chosen column
  const rows = Array.from(tbody.rows);
  rows.sort((a, b) => {
    const av = a.cells[col].textContent.trim();
    const bv = b.cells[col].textContent.trim();
    const an = parseFloat(av), bn = parseFloat(bv);
    const cmp = !isNaN(an) && !isNaN(bn) ? an - bn : av.localeCompare(bv);
    return dir === 'asc' ? cmp : -cmp;
  });
  for (const r of rows) tbody.appendChild(r);   // reattach in new order
});
\`\`\`

#### Step 4 — Edge Cases: Responsive Stack on Mobile (CSS Only)
\`\`\`html
<style>
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ddd; padding: 0.5em; text-align: left; }
  caption { font-weight: bold; padding-bottom: 0.5em; }
  th button { background: none; border: 0; font: inherit; cursor: pointer; }

  /* Mobile: stack rows as cards while preserving table semantics */
  @media (max-width: 600px) {
    thead { display: none; }                  /* hide column headers */
    tr { display: block; margin-bottom: 1em; border: 1px solid #ddd; }
    td { display: block; border: none; }
    td::before { content: attr(data-label) ": "; font-weight: bold; }
  }
</style>
\`\`\`
\`\`\`html
<!-- Add data-label to every <td> for the CSS pseudo-element to read -->
<td data-label="Q1">4.2</td>
<td data-label="Q2">4.8</td>
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
console.assert(table.caption, 'table must have a <caption>');
console.assert(table.tHead && table.tBodies.length === 1 && table.tFoot,
  'table needs thead, tbody, tfoot');
for (const th of table.tHead.querySelectorAll('th'))
  console.assert(th.scope === 'col', 'every header cell needs scope="col"');
for (const th of table.tBodies[0].querySelectorAll('th'))
  console.assert(th.scope === 'row', 'every row header needs scope="row"');
\`\`\`

**Expected Output:**
\`\`\`
- Caption announced on table entry
- Clicking column header sorts ascending; clicking again descends
- aria-sort attribute updates so screen readers announce the sort state
- On screens <600px: rows stack as cards with inline labels
- All console.asserts pass
\`\`\`

**Stretch Challenges:**
- [ ] Add a filter input above the table (filters by region, ARIA live count)
- [ ] Make total row recalculate after sort/filter
- [ ] Add CSV export using \`new Blob\` and \`URL.createObjectURL\``,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** Name the SIX semantic table sub-elements. What does each contribute to the accessibility tree?

**Q2:** What does \`scope="col"\` vs \`scope="row"\` do? When is \`scope="colgroup"\` or \`scope="rowgroup"\` needed?

**Q3:** Write a 6-row table (3 columns) with caption, header row, and footer total row. Every header has \`scope\`.

---

### Day 3 — Comprehension

**Q4:** Why is using \`<table>\` for page layout an accessibility violation? How do screen readers misinterpret it?

**Q5:** Describe a real bug introduced when \`colspan\` math doesn't match the table's column count. What does the browser do?

**Q6:** Refactor for accessibility:
\`\`\`html
<table>
  <tr><td><b>Name</b></td><td><b>Email</b></td></tr>
  <tr><td>Alice</td><td>a@x.com</td></tr>
</table>
\`\`\`

---

### Day 7 — Application

**Q7:** Build a fully accessible employee directory table with: search/filter, sortable columns, row-selection checkboxes, and "select all" header checkbox.

**Q8:** A 500-row data table is slow to scroll on mobile. Name 3 HTML/CSS-level optimisations (not virtualisation).

**Q9:** What is the difference between \`<th headers="x y">\` and \`<th scope="col">\`? When does each apply?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "How do you make a data table accessible AND responsive?"

**Q11:** Draw the dependency graph: tables ↔ accessibility-html ↔ semantic-elements ↔ html-attributes.

**Q12:** ★ System design: "Design the table component for a financial dashboard with 50 columns × 10k rows, must work for screen-reader users and support sorting, filtering, freezing columns, and CSV export."`
  },

  // ── 11. meta-tags-and-seo ─────────────────────────────────────────────────
  'meta-tags-and-seo': {
    feynman: `## FEYNMAN CHECK

### Explain Meta Tags and SEO Like I'm 10 Years Old
> Meta tags live in \`<head>\` and tell other programs (Google, Facebook, Twitter, browsers) HOW to interpret your page without rendering it. Google reads \`<title>\` and \`<meta name="description">\` for search results; Facebook reads \`<meta property="og:image">\` for shared link previews; the browser reads \`<meta name="viewport">\` to decide how to scale on mobile. Get any of these wrong and your page gets ranked lower, looks broken when shared, or pinch-zooms weirdly on phones — all invisible bugs to a desktop developer testing locally.

---

### 5 Deep Conceptual Questions

**Q1: What problem do meta tags fundamentally solve?**
> **A:** They convey machine-readable metadata that doesn't fit anywhere else in the document — search descriptions, social preview images, mobile scaling, theme colour, character encoding, robot instructions. Without them, every consumer (Google, Slack, iMessage) would have to GUESS by parsing your page content, which is slow and unreliable.

**Q2: What is the ONE mental model that makes meta tags click?**
> **A:** Meta tags are CONTRACTS with specific consumers. Each \`property=\` or \`name=\` belongs to a published spec (Open Graph for Facebook/LinkedIn, Twitter Cards, Schema.org JSON-LD for Google rich results, viewport for mobile browsers). Adding random meta tags doesn't help — they only matter when a named consumer reads that exact key.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** That \`<meta name="keywords">\` still matters for SEO:
> \`\`\`html
> <!-- ❌ Wasted bytes. Google has ignored this since 2009. -->
> <meta name="keywords" content="html, seo, web, dev">
>
> <!-- ✅ The metadata that actually affects ranking and previews -->
> <title>HTML Meta Tags & SEO — Dev Mastery</title>
> <meta name="description" content="A practical guide to head metadata
                                    that controls Google rankings and social previews.">
> <link rel="canonical" href="https://example.com/articles/meta-tags">
> <meta property="og:title" content="HTML Meta Tags & SEO">
> <meta property="og:image" content="https://example.com/og/meta-2026.png">
> \`\`\`

**Q4: How does \`<meta name="viewport">\` interact with the mobile rendering pipeline?**
> **A:** Without it, mobile browsers assume a 980px-wide desktop viewport and SHRINK the rendered page to fit — the legacy "pinch to zoom" website experience. \`width=device-width, initial-scale=1\` tells the browser "the layout viewport equals the physical screen width" — every responsive site requires it. The browser uses this value BEFORE running CSS media queries, so media queries are useless without the viewport meta tag set correctly.

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "HTML \`<meta>\` and \`<link>\` tags in \`<head>\` are typed key-value contracts with named external consumers — Google's indexer, Facebook's link unfurler, mobile browsers' viewport engine, password managers' theme parser — whose absence or misconfiguration silently degrades search rankings, social-share appearance, mobile rendering, and PWA installability without producing any visible bug on the developer's desktop browser."`,

    build: `## BUILD

### 🏗️ Mini Project: A Production-Grade \`<head>\` Block With Full SEO, Social, and JSON-LD

**What you will build:** The complete \`<head>\` for a blog article that ranks on Google, previews correctly on Slack/Twitter/LinkedIn, installs as a PWA, and earns a rich snippet.
**Why this project:** Most devs copy-paste the same 3-line \`<head>\` everywhere. The complete recipe touches 15+ tags.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir seo-head && cd seo-head
ni article.html, og-image.png -ItemType File
\`\`\`

#### Step 2 — Core Tags (every page MUST have these)
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">                              <!-- first, before <title> -->
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>Why HTML Meta Tags Still Matter in 2026 | Dev Mastery</title>
  <meta name="description" content="A 30-minute deep-dive on the head
        metadata that controls Google rankings, Slack previews, and mobile UX.">
  <link rel="canonical" href="https://devmastery.io/articles/meta-tags-2026">
\`\`\`

#### Step 3 — Open Graph (Facebook, LinkedIn, Slack, iMessage previews)
\`\`\`html
  <meta property="og:type"        content="article">
  <meta property="og:title"       content="Why HTML Meta Tags Still Matter in 2026">
  <meta property="og:description" content="A 30-minute deep-dive on the head metadata.">
  <meta property="og:url"         content="https://devmastery.io/articles/meta-tags-2026">
  <meta property="og:image"       content="https://devmastery.io/og/meta-2026.png">
  <meta property="og:image:alt"   content="Diagram: 12 meta tags grouped by consumer.">
  <meta property="og:image:width"  content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name"   content="Dev Mastery">
  <meta property="article:published_time" content="2026-06-25T10:00:00Z">
  <meta property="article:author" content="https://devmastery.io/authors/jane">
\`\`\`

#### Step 4 — Twitter Cards + Theme + Mobile + Robot Hints
\`\`\`html
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:site"        content="@devmastery">
  <meta name="twitter:creator"     content="@janedoe">

  <meta name="theme-color"         content="#0e639c">
  <meta name="color-scheme"        content="light dark">

  <meta name="robots"              content="index, follow, max-image-preview:large">
  <meta name="googlebot"           content="index, follow">

  <link rel="icon"      href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest"  href="/manifest.webmanifest">

  <link rel="alternate" hreflang="en" href="https://devmastery.io/articles/meta-tags-2026">
  <link rel="alternate" hreflang="ja" href="https://devmastery.io/ja/articles/meta-tags-2026">
  <link rel="alternate" hreflang="x-default" href="https://devmastery.io/articles/meta-tags-2026">
\`\`\`

#### Step 5 — JSON-LD for Rich Results + Tests
\`\`\`html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Why HTML Meta Tags Still Matter in 2026",
    "description": "A 30-minute deep-dive on head metadata.",
    "image": "https://devmastery.io/og/meta-2026.png",
    "datePublished": "2026-06-25T10:00:00Z",
    "dateModified":  "2026-06-25T10:00:00Z",
    "author": {
      "@type": "Person",
      "name": "Jane Doe",
      "url": "https://devmastery.io/authors/jane"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Dev Mastery",
      "logo": { "@type": "ImageObject", "url": "https://devmastery.io/logo.png" }
    },
    "mainEntityOfPage": "https://devmastery.io/articles/meta-tags-2026"
  }
  </script>
</head>
<body>...</body>
</html>
\`\`\`
\`\`\`bash
# Validate
npx -y html-validate article.html

# Test rich results
# https://search.google.com/test/rich-results

# Test OG previews
# https://www.opengraph.xyz/  (paste your URL)

# Test Twitter Card
# https://cards-dev.twitter.com/validator
\`\`\`

**Expected Output:**
\`\`\`
- html-validate: 0 errors
- Rich Results Test: ✓ Article eligible for "Top stories" carousel
- Opengraph.xyz: shows large image, title, description as Facebook would render
- Twitter Card Validator: shows summary_large_image card
- Lighthouse SEO: 100/100
\`\`\`

**Stretch Challenges:**
- [ ] Add \`<link rel="preload">\` for the LCP image so it starts loading before \`<body>\`
- [ ] Add \`<meta name="format-detection" content="telephone=no">\` and explain when you'd want it
- [ ] Add a \`<link rel="alternate" type="application/rss+xml">\` so feed readers auto-discover the RSS`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** Name 4 \`<meta>\` tags that EVERY HTML5 page should include. What does each do?

**Q2:** What is \`<link rel="canonical">\`? Why does omitting it on a paginated page hurt SEO?

**Q3:** Write the \`<head>\` block (8-10 lines) for a generic blog article with charset, viewport, title, description, canonical, OG title/description/image.

---

### Day 3 — Comprehension

**Q4:** Why was \`<meta name="keywords">\` abandoned by search engines? When did Google officially stop using it?

**Q5:** Describe a production bug where a missing \`<meta name="viewport">\` made the site unusable on mobile despite responsive CSS.

**Q6:** Refactor this \`<head>\` for SEO and social sharing:
\`\`\`html
<head>
  <title>Page</title>
  <meta name="keywords" content="foo, bar, baz">
  <meta name="author" content="me">
</head>
\`\`\`

---

### Day 7 — Application

**Q7:** Build the \`<head>\` for an e-commerce product page that earns the Google "Product" rich snippet (price, availability, ratings).

**Q8:** A blog post shows the wrong preview image on Slack. List 4 root-cause possibilities, ordered by likelihood.

**Q9:** What is \`hreflang\` and when do you need it? Show the correct combination of \`hreflang\` and \`canonical\` for a 3-language site.

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "Walk me through every meta tag that affects Google ranking, ordered by impact."

**Q11:** Draw the dependency graph: meta-tags-and-seo ↔ performance-html ↔ links-and-images ↔ pwa-manifest.

**Q12:** ★ System design: "Design the head-generation pipeline for a multi-tenant CMS with 1M pages across 14 languages. How do you generate per-page meta, canonical, hreflang, and JSON-LD at build time vs runtime?"`
  },

  // ── 12. internationalization ──────────────────────────────────────────────
  'internationalization': {
    feynman: `## FEYNMAN CHECK

### Explain HTML Internationalization (i18n) Like I'm 10 Years Old
> i18n in HTML is telling the browser, the screen reader, the spell-checker, and Google EXACTLY what language each piece of text is — and which direction it's written in. \`<html lang="en">\` is the single most important tag because it changes the pronunciation engine for VoiceOver, switches hyphenation rules, and tells Google which language to index. \`dir="rtl"\` flips the entire layout for Arabic and Hebrew without rewriting a single CSS rule — the browser does the mirroring for free. Get \`lang\` wrong and a French paragraph gets pronounced in an English accent — comprehensible to nobody.

---

### 5 Deep Conceptual Questions

**Q1: What problem does HTML i18n fundamentally solve?**
> **A:** It tells every text-consuming subsystem (screen reader, spell-checker, hyphenation engine, Google indexer, machine translator, CSS \`:lang()\` selector) which language and writing direction each piece of text uses, so they can apply the right rules without guessing. Guessing is bad: the screen reader pronounces "ramen" wrong, hyphenation breaks in mid-word, Google indexes a multilingual page as the wrong language.

**Q2: What is the ONE mental model that makes i18n click?**
> **A:** \`lang\` is inherited and per-subtree-overridable. \`<html lang="en">\` applies to everything; a \`<blockquote lang="ja">\` inside switches to Japanese for that subtree, then back to English outside. The browser maintains a "current language" per node and exposes it via \`element.lang\` and the CSS \`:lang(ja)\` selector — meaning you can style language-tagged content differently with zero JS.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** Omitting \`lang\` because "the content is mostly English":
> \`\`\`html
> <!-- ❌ Screen reader uses the user's default language to pronounce — Japanese names in English voice -->
> <html>
> <body>
>   <p>Visit Kyoto's Kiyomizu-dera temple.</p>
> </body>
> </html>
>
> <!-- ✅ Both English overall AND the proper noun marked as Japanese for correct pronunciation -->
> <html lang="en">
> <body>
>   <p>Visit Kyoto's <span lang="ja">清水寺</span> (Kiyomizu-dera) temple.</p>
> </body>
> </html>
> \`\`\`

**Q4: How does \`dir="rtl"\` interact with CSS and the layout engine?**
> **A:** The browser computes a "bidirectional resolved direction" per element and flips: text direction, default text alignment, the left/right of CSS \`float\`, the order of flex/grid items (with \`flex-direction: row\` reversing to row-reverse), and even the directionality of the \`margin-inline-start\` logical properties. Use the LOGICAL properties (\`padding-inline-start\`, \`margin-block-end\`, \`text-align: start\`) instead of physical (\`padding-left\`) so your CSS works in both directions for free.

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "HTML internationalization is the discipline of declaring \`lang\` (per BCP-47), \`dir\`, and \`hreflang\` so that the browser's text-rendering, hyphenation, spell-check, screen-reader pronunciation, search-engine indexing, and CSS \`:lang()\` selector all derive correct behaviour from authoritative metadata — and using CSS logical properties so that physical layout adapts to bidirectional resolution automatically."`,

    build: `## BUILD

### 🏗️ Mini Project: A Trilingual Page (EN/JA/AR) With Per-Section Direction Switching

**What you will build:** One HTML page containing English, Japanese, and Arabic content sections — each correctly tagged so screen readers, spell-check, and CSS all handle them right, including a fully RTL Arabic block.
**Why this project:** Forces you to use \`lang\`, \`dir\`, \`hreflang\`, CSS \`:lang()\`, and CSS logical properties in one place.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir i18n-demo && cd i18n-demo
ni en.html, ja.html, ar.html -ItemType File
\`\`\`

#### Step 2 — Root Document Setup
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>About Kyoto — Dev Mastery</title>

  <!-- Tell Google about every language version -->
  <link rel="alternate" hreflang="en" href="https://example.com/en.html">
  <link rel="alternate" hreflang="ja" href="https://example.com/ja.html">
  <link rel="alternate" hreflang="ar" href="https://example.com/ar.html">
  <link rel="alternate" hreflang="x-default" href="https://example.com/en.html">

  <style>
    /* Style by language with zero JS */
    :lang(ja) { font-family: "Hiragino Sans", "Yu Gothic", sans-serif; }
    :lang(ar) { font-family: "Noto Naskh Arabic", serif; font-size: 1.1em; }

    /* Logical properties so CSS works in both LTR and RTL */
    article { padding-inline: 1rem; margin-block-end: 2rem; }
    blockquote { border-inline-start: 3px solid #ccc; padding-inline-start: 1rem; }
  </style>
</head>
\`\`\`

#### Step 3 — Body With Per-Section Language Tags
\`\`\`html
<body>
  <header>
    <nav aria-label="Language">
      <ul>
        <li><a href="/en.html" hreflang="en" lang="en">English</a></li>
        <li><a href="/ja.html" hreflang="ja" lang="ja">日本語</a></li>
        <li><a href="/ar.html" hreflang="ar" lang="ar">العربية</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <h1>Visiting Kyoto</h1>
      <p>Kyoto, the cultural heart of Japan, contains over 2000 temples.</p>
      <p>Don't miss <span lang="ja">清水寺</span>
         (<span lang="ja-Latn">Kiyomizu-dera</span>)
         or the bamboo grove in <span lang="ja">嵐山</span>.</p>
    </article>

    <article lang="ja">
      <h2>京都を訪れる</h2>
      <p>日本の文化の中心、京都には2000以上の寺院があります。</p>
      <p><span lang="en">English</span>のツアーもあります。</p>
    </article>

    <article lang="ar" dir="rtl">
      <h2>زيارة كيوتو</h2>
      <p>كيوتو هي قلب اليابان الثقافي، وتضم أكثر من 2000 معبد.</p>
      <p>لا تفوّت زيارة <span lang="ja">清水寺</span>.</p>
    </article>
  </main>
</body>
\`\`\`

#### Step 4 — Edge Cases: Numbers, Dates, Money (Locale-Aware)
\`\`\`html
<!-- Use <time datetime=...> with a locale-aware visible format -->
<p>Last updated <time datetime="2026-06-25">June 25, 2026</time>.</p>

<!-- For dynamic locale-aware formatting, use Intl in JS, not hand-coding -->
<script>
  const date = new Intl.DateTimeFormat(document.documentElement.lang, {
    dateStyle: 'long'
  }).format(new Date('2026-06-25'));

  const price = new Intl.NumberFormat(document.documentElement.lang, {
    style: 'currency', currency: 'JPY'
  }).format(1500);

  // Renders: "June 25, 2026" in en, "2026年6月25日" in ja, "٢٥ يونيو ٢٠٢٦" in ar
  // ¥1,500 in en;  ￥1,500 in ja;  ١٬٥٠٠ ¥ in ar
</script>
\`\`\`

#### Step 5 — Tests
\`\`\`bash
# 1. Validate
npx -y html-validate en.html

# 2. Manual: open in VoiceOver/NVDA
#    - English section: read in English voice
#    - Japanese section: voice switches to Japanese
#    - Arabic section: voice switches AND reading order flips RTL

# 3. Visual: open in browser
#    - Arabic <article> text right-aligned, scrollbar on the LEFT
#    - Quoted bamboo block uses border-inline-start (right side in RTL)
\`\`\`

**Expected Output:**
\`\`\`
- html-validate: 0 errors
- VoiceOver switches voice between languages automatically
- Arabic block renders RTL with mirrored padding/border
- Intl.DateTimeFormat outputs locale-appropriate dates
\`\`\`

**Stretch Challenges:**
- [ ] Add a Hebrew \`<bdi>\` user-name in the comments section so it doesn't corrupt the surrounding text direction
- [ ] Add \`<meta http-equiv="Accept-CH" content="Accept-Language">\` and route to the right language at the CDN
- [ ] Use CSS \`writing-mode: vertical-rl\` for a Japanese vertical-text caption`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** What is the difference between \`<html lang="en">\` and \`<meta http-equiv="content-language">\`? Which one matters today?

**Q2:** Name 4 browser/OS subsystems that read the \`lang\` attribute.

**Q3:** Write a 3-line example tagging a Japanese word inside an English sentence so a screen reader pronounces it correctly.

---

### Day 3 — Comprehension

**Q4:** Why is \`dir="auto"\` useful for user-generated content like comments? Give an example.

**Q5:** Describe an SEO bug caused by missing \`hreflang\` alternates on a multilingual site. Which countries' Google results break?

**Q6:** Refactor for i18n and RTL:
\`\`\`html
<div style="padding-left: 1rem; border-left: 2px solid;">
  <p>مرحبا بالعالم</p>
</div>
\`\`\`

---

### Day 7 — Application

**Q7:** Build the header + lang switcher + 3 article blocks in 3 languages — entirely server-rendered, no JS — with correct \`hreflang\` and \`lang\` per block.

**Q8:** A page mixes English UI labels with Japanese user-generated content. List 3 root causes of text-direction corruption and the HTML fix for each.

**Q9:** What is \`<bdi>\` vs \`<bdo>\` vs the Unicode bidi override characters? When do you use each?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "How would you make a multilingual site SEO-friendly?"

**Q11:** Draw the dependency graph: internationalization ↔ meta-tags-and-seo ↔ accessibility-html ↔ html-attributes.

**Q12:** ★ System design: "Design the i18n strategy for a global SaaS supporting 30 languages including 4 RTL languages, with user-generated comments in any language. Cover: routing, server rendering, lazy loading translations, and screen-reader UX."`
  },

  // ── 13. html5-apis ────────────────────────────────────────────────────────
  'html5-apis': {
    feynman: `## FEYNMAN CHECK

### Explain HTML5 APIs Like I'm 10 Years Old
> HTML5 quietly bundled JavaScript with about 40 new built-in APIs that browsers expose to your page — Geolocation, Canvas, Web Storage, History, Drag-and-Drop, File API, Web Workers, IndexedDB, Notifications, Web Audio, WebSockets, Service Workers, Intersection Observer, ResizeObserver, and more. They're all gated by a *permission model*: dangerous ones (camera, GPS, notifications) require explicit user consent; safe ones (localStorage, History) don't. Together they're why a browser tab can now replace what used to require a desktop app — Figma, VS Code, Google Maps all run on these APIs.

---

### 5 Deep Conceptual Questions

**Q1: What problem do HTML5 APIs fundamentally solve?**
> **A:** They give web pages access to platform capabilities (storage, location, sensors, files, threads, GPU, networking) that previously required a native app. Without them you couldn't build offline-capable web apps, real-time chat, in-browser image editing, or web-based games — every "Can I move this to the web?" decision since 2010 depended on which HTML5 API closed the gap.

**Q2: What is the ONE mental model that makes HTML5 APIs click?**
> **A:** Every API is in one of three tiers: (1) always-on (Web Storage, History, Canvas — no permission needed); (2) one-time-prompt (Geolocation, Notifications, Camera — user clicks "Allow"); (3) install-required (Service Worker, Push, Background Sync — only after the page meets PWA criteria over HTTPS). Knowing the tier tells you what UX to design around the API.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** Treating \`localStorage\` as secure or large-capacity:
> \`\`\`javascript
> // ❌ DANGEROUS: synchronous (blocks main thread), readable by ANY script on the page, ~5MB cap
> localStorage.setItem('jwt', 'eyJhbGc...');         // XSS-stealable
> localStorage.setItem('photos', JSON.stringify(arr)); // hits quota after a few large images
>
> // ✅ Use the right API for the job
> // - Auth tokens: HttpOnly Secure cookie set by server (JS can't read)
> // - Large/structured data: IndexedDB (async, gigabytes, structured queries)
> const db = await indexedDB.open('photos', 1);      // async, ~unlimited
> \`\`\`

**Q4: How does the Intersection Observer API interact with the browser's rendering pipeline?**
> **A:** Instead of running expensive \`getBoundingClientRect()\` on every scroll event (which forces synchronous layout), Intersection Observer registers a callback that fires AFTER the browser has computed layout — batched, off the critical path. It's why infinite-scroll lists, lazy-loaded images, and viewport analytics scale to thousands of observed elements without jank. The browser groups intersection changes into one callback per animation frame.

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "HTML5 APIs are the suite of browser-exposed platform capabilities — storage, sensors, threading, networking, lifecycle, observers — gated by a three-tier permission model and accessed via JavaScript globals (\`navigator\`, \`window\`, \`document\`, registered service workers) — which together close the gap between web pages and native apps and underpin every offline-capable, real-time, or hardware-aware product running in a browser tab."`,

    build: `## BUILD

### 🏗️ Mini Project: A Mini "Notes" App Using 6 HTML5 APIs

**What you will build:** A note-taking app that uses: localStorage (settings), IndexedDB (notes), History API (back/forward), Service Worker (offline), Notification (reminders), Intersection Observer (lazy-load images). All vanilla JS, no framework.
**Why this project:** Touches the most-used HTML5 APIs in one realistic product.
**Time estimate:** 60 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir notes-app && cd notes-app
ni index.html, app.js, sw.js, manifest.webmanifest -ItemType File
\`\`\`

#### Step 2 — Storage Layer (IndexedDB for notes, localStorage for settings)
\`\`\`javascript
// app.js — IndexedDB wrapper for notes
const dbOpen = indexedDB.open('notes-db', 1);
dbOpen.onupgradeneeded = (e) => {
  e.target.result.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
};
const db = await new Promise(r => dbOpen.onsuccess = e => r(e.target.result));

async function addNote(text) {
  const tx = db.transaction('notes', 'readwrite');
  await tx.objectStore('notes').add({ text, created: Date.now() });
}

async function getAllNotes() {
  const tx = db.transaction('notes', 'readonly');
  return new Promise(r => {
    const req = tx.objectStore('notes').getAll();
    req.onsuccess = () => r(req.result);
  });
}

// localStorage for small settings only
const settings = {
  get theme()  { return localStorage.getItem('theme') ?? 'light'; },
  set theme(v) { localStorage.setItem('theme', v); }
};
\`\`\`

#### Step 3 — History API for Deep Linking
\`\`\`javascript
// Each opened note pushes a state — back button works without a router
function openNote(id) {
  history.pushState({ noteId: id }, '', '#note-' + id);
  render(id);
}

// Restore state when the user navigates back/forward
window.addEventListener('popstate', (e) => {
  if (e.state?.noteId) render(e.state.noteId);
  else renderList();
});
\`\`\`

#### Step 4 — Service Worker for Offline + Notifications API for Reminders
\`\`\`javascript
// app.js — register the service worker
if ('serviceWorker' in navigator) {
  await navigator.serviceWorker.register('/sw.js');
}

// Permission-gated notification (Tier 2)
async function remindMe(noteId, atTime) {
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return;            // user denied — fall back gracefully
  const delay = atTime - Date.now();
  setTimeout(() => {
    new Notification('Reminder', { body: 'Open note #' + noteId, tag: 'note-' + noteId });
  }, delay);
}
\`\`\`
\`\`\`javascript
// sw.js — cache-first for offline support
const CACHE = 'notes-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/', '/app.js', '/manifest.webmanifest'])));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
// Intersection Observer for lazy-loading note thumbnails
const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;             // swap data-src → src
      io.unobserve(img);
    }
  }
});
document.querySelectorAll('img[data-src]').forEach(img => io.observe(img));

// Quick smoke tests
console.assert('indexedDB' in window,       'IndexedDB required');
console.assert('localStorage' in window,    'localStorage required');
console.assert('serviceWorker' in navigator,'Service Worker required');
console.assert('Notification' in window,    'Notification API required');
console.assert('IntersectionObserver' in window, 'IntersectionObserver required');
console.assert('pushState' in history,      'History API required');
\`\`\`

**Expected Output:**
\`\`\`
- Adding a note persists to IndexedDB (survives reload AND tab close)
- Back/forward buttons navigate between notes
- App loads offline after first visit (Service Worker cache hit)
- Notification fires at scheduled time
- Note thumbnails fetch only when scrolled into view
- All console.asserts pass
\`\`\`

**Stretch Challenges:**
- [ ] Add the Web Share API so users can share a note natively from mobile
- [ ] Add Background Sync so reminders fire even if the tab is closed
- [ ] Add the File System Access API for export-to-disk on desktop`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** Name 5 HTML5 APIs and what each one enables.

**Q2:** What is the difference between \`localStorage\`, \`sessionStorage\`, and \`IndexedDB\`? Pick one for: an auth token, user notes, a feature flag.

**Q3:** Write 5 lines that register a service worker if the browser supports it.

---

### Day 3 — Comprehension

**Q4:** What are the THREE permission tiers for HTML5 APIs? Give one API in each tier.

**Q5:** Describe an XSS vulnerability caused by storing a JWT in localStorage. What's the fix?

**Q6:** Refactor this scroll handler into an IntersectionObserver:
\`\`\`javascript
window.addEventListener('scroll', () => {
  document.querySelectorAll('.lazy').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) el.classList.add('visible');
  });
});
\`\`\`

---

### Day 7 — Application

**Q7:** Build an "Are you still there?" idle-timeout prompt using the Page Visibility API and \`document.visibilityState\`.

**Q8:** A feature uses Geolocation. List 4 fallback states you must design for (denied, error, timeout, never-prompted).

**Q9:** What is the Beacon API? When would you use it over \`fetch()\`? Give an analytics example.

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "How would you build offline-capable web app?"

**Q11:** Draw the dependency graph: html5-apis ↔ pwa-manifest ↔ performance-html ↔ web-components.

**Q12:** ★ System design: "Design the data-sync layer for a notes app that must work offline, sync across devices, resolve conflicts, and respect browser storage quotas."`
  },

  // ── 14. template-slot ─────────────────────────────────────────────────────
  'template-slot': {
    feynman: `## FEYNMAN CHECK

### Explain \`<template>\` and \`<slot>\` Like I'm 10 Years Old
> \`<template>\` is an HTML element whose contents the browser parses but DOESN'T render — it sits silent in the DOM as a clonable blueprint. \`<slot>\` is a placeholder INSIDE a Web Component where the component's user can inject custom content. Together they're the native, framework-free way to build reusable HTML widgets: \`<template>\` stores the markup, JavaScript clones it on demand, and \`<slot>\` lets consumers fill in the variable parts. This is the engine behind every native \`<details>\`, \`<dialog>\`, and \`<select>\` — and every modern web component library.

---

### 5 Deep Conceptual Questions

**Q1: What problem do \`<template>\` and \`<slot>\` fundamentally solve?**
> **A:** They give you a native cloneable-DOM-fragment primitive without parsing strings of HTML at runtime (which is slow AND an XSS risk via \`innerHTML\`). \`<template>.content\` is a DocumentFragment whose nodes are already parsed — \`element.appendChild(template.content.cloneNode(true))\` is the fastest and safest way to instantiate repeated structures.

**Q2: What is the ONE mental model that makes them click?**
> **A:** \`<template>\` is an inert clipboard; \`<slot>\` is a window into shadow DOM. Think of a Web Component as a sealed black box: \`<template>\` builds the inside, \`<slot>\` is the labelled hole through which the outside world can drop content. The content that ends up in a slot is called "slotted content" and remains in the LIGHT DOM (so external CSS still styles it).

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** Using \`innerHTML\` to clone repeated UI:
> \`\`\`javascript
> // ❌ XSS risk + re-parsing cost on every iteration
> for (const user of users) {
>   list.innerHTML += '<li class="user">' + user.name + '</li>'; // user.name from API
> }
>
> // ✅ Parse once in <template>, clone many times — XSS-safe, fast
> // HTML:  <template id="user-row"><li class="user"></li></template>
> const tpl = document.getElementById('user-row');
> for (const user of users) {
>   const node = tpl.content.cloneNode(true);
>   node.querySelector('.user').textContent = user.name; // textContent escapes
>   list.appendChild(node);
> }
> \`\`\`

**Q4: How does a \`<slot>\` interact with the shadow DOM at render time?**
> **A:** When a custom element with a shadow root has a \`<slot>\` in its template, the browser performs "flattening": at paint time, slotted light-DOM children are projected INTO the slot position but remain owned by the light tree (visible to \`querySelector\`, styled by outer CSS using \`::slotted()\`). This means CSS scoping is one-way (component CSS stays inside) but content flows in — a clean separation that no framework had before Shadow DOM v1.

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "\`<template>\` is an inert, parser-validated DOM fragment whose \`.content\` property can be cloned to instantiate repeated UI without \`innerHTML\` parsing cost or XSS risk; \`<slot>\` is the projection point inside a shadow root where light-DOM children of the host element are rendered while remaining stylable from outer CSS via \`::slotted()\` — together forming the native primitives the platform offers for reusable templated components."`,

    build: `## BUILD

### 🏗️ Mini Project: A \`<user-card>\` Web Component With Slotted Content

**What you will build:** A reusable \`<user-card>\` element built on \`<template>\` + \`<slot>\`, with named slots, styled shadow DOM, and a fallback when slots are empty.
**Why this project:** A canonical exercise hitting every aspect of templates and slots in one tight example.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir user-card && cd user-card
ni index.html, user-card.js -ItemType File
\`\`\`

#### Step 2 — The Template + Slots
\`\`\`html
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>user-card demo</title></head>
<body>
  <template id="user-card-tpl">
    <style>
      :host { display: block; border: 1px solid #ddd; padding: 1em;
              border-radius: 8px; max-width: 320px; }
      ::slotted([slot="avatar"]) { border-radius: 50%; width: 64px; height: 64px; }
      header { display: flex; gap: 1em; align-items: center; }
      h2 { margin: 0; }
      footer { margin-top: 1em; color: #666; }
    </style>
    <header>
      <slot name="avatar">
        <!-- Fallback shown when no <img slot="avatar"> is supplied -->
        <div style="width:64px;height:64px;background:#eee;border-radius:50%"></div>
      </slot>
      <div>
        <h2><slot name="name">Anonymous</slot></h2>
        <slot name="title">No title</slot>
      </div>
    </header>
    <p><slot>This user has no bio yet.</slot></p>
    <footer><slot name="meta"></slot></footer>
  </template>

  <user-card>
    <img slot="avatar" src="alice.jpg" alt="Alice">
    <span slot="name">Alice Tanaka</span>
    <span slot="title">Staff Engineer</span>
    Loves building developer tools and growing maple bonsai.
    <span slot="meta">Joined 2024</span>
  </user-card>

  <user-card></user-card>  <!-- All fallbacks shown -->

  <script type="module" src="./user-card.js"></script>
</body></html>
\`\`\`

#### Step 3 — Custom Element Implementation
\`\`\`javascript
// user-card.js
const tpl = document.getElementById('user-card-tpl');

class UserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // Clone the parsed template (faster + safer than innerHTML)
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
  }
}

customElements.define('user-card', UserCard);
\`\`\`

#### Step 4 — Edge Cases: Slot Change Events + Updating Content
\`\`\`javascript
class UserCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    // React when slotted content changes (e.g., dynamic name swap)
    const nameSlot = this.shadowRoot.querySelector('slot[name="name"]');
    nameSlot.addEventListener('slotchange', () => {
      const nodes = nameSlot.assignedNodes({ flatten: true });
      const name = nodes.map(n => n.textContent).join('').trim();
      this.setAttribute('aria-label', name || 'User card');
    });
  }
}
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
const card = document.querySelector('user-card');
console.assert(card.shadowRoot, 'should attach shadow root');
console.assert(card.shadowRoot.querySelector('slot[name="name"]'),
  'named name slot should exist');
console.assert(card.shadowRoot.querySelector('slot:not([name])'),
  'default slot should exist for bio');

// Dynamic content swap
const span = card.querySelector('[slot="name"]');
span.textContent = 'Alice Updated';
// slotchange handler fires automatically — aria-label updates
\`\`\`

**Expected Output:**
\`\`\`
- First card: shows image, "Alice Tanaka", "Staff Engineer", bio, "Joined 2024"
- Second card: shows fallback avatar, "Anonymous", "No title", default bio
- Updating slotted content updates aria-label via slotchange
- All console.asserts pass
\`\`\`

**Stretch Challenges:**
- [ ] Add CSS \`::part\` so external CSS can theme inner elements
- [ ] Add an attribute \`compact\` that re-templates with a smaller layout
- [ ] Make it form-associated via \`ElementInternals\` so it participates in form submission`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** What does the \`<template>\` element do that a hidden \`<div>\` does not? Name 2 differences.

**Q2:** Define "named slot" vs "default slot." Show the markup for each.

**Q3:** Write a 5-line snippet that clones a \`<template>\` and inserts it into the page.

---

### Day 3 — Comprehension

**Q4:** What is the \`slotchange\` event? When does it fire and what's a common use case?

**Q5:** Describe an XSS bug caused by avoiding \`<template>\` and using \`innerHTML\` in a loop. Show the broken loop and the safe alternative.

**Q6:** Refactor for performance and security:
\`\`\`javascript
for (const item of items) {
  list.innerHTML += \`<li><a href="\${item.url}">\${item.name}</a></li>\`;
}
\`\`\`

---

### Day 7 — Application

**Q7:** Build a \`<comment-card>\` web component with three named slots (avatar, author, body) and a default slot fallback.

**Q8:** A component uses \`<slot>\` but external CSS can't style the slotted content. Name 3 reasons and the fix for each.

**Q9:** What is the difference between OPEN and CLOSED shadow DOM? When would you use a closed shadow root?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "When would you use \`<template>\` and \`<slot>\` instead of React?"

**Q11:** Draw the dependency graph: template-slot ↔ web-components ↔ html5-apis ↔ html-attributes.

**Q12:** ★ System design: "Design a design system delivered as web components for a multi-framework org (React + Vue + Angular consumers). How do templates, slots, shadow DOM, and CSS parts let one codebase serve all three?"`
  },

  // ── 15. web-components ────────────────────────────────────────────────────
  'web-components': {
    feynman: `## FEYNMAN CHECK

### Explain Web Components Like I'm 10 Years Old
> Web Components are the browser's native version of "build your own HTML tag." \`<my-counter></my-counter>\` is a real element you can register in 20 lines of JS, with: its own internal HTML (Shadow DOM), its own CSS (scoped — outside CSS can't reach in), its own lifecycle callbacks (\`connectedCallback\`, \`disconnectedCallback\`, \`attributeChangedCallback\`), and full DOM API parity. Once defined, your tag works in React, Angular, Vue, plain HTML, even server-rendered pages — it's the only "framework" that's built into the browser itself.

---

### 5 Deep Conceptual Questions

**Q1: What problem do Web Components fundamentally solve?**
> **A:** Cross-framework component reuse. A React component only works in React; an Angular directive only works in Angular. A Web Component works EVERYWHERE because it's a native browser element. This is why GitHub, Salesforce, and Adobe build their design systems as Web Components — one codebase serves React-using teams, Angular-using teams, and plain-HTML pages.

**Q2: What is the ONE mental model that makes Web Components click?**
> **A:** A Web Component is just a class extending \`HTMLElement\`, registered with \`customElements.define('my-tag', MyClass)\`. The browser instantiates your class whenever it parses \`<my-tag>\`. Lifecycle callbacks fire at known points (constructor → connectedCallback → attributeChangedCallback → disconnectedCallback). Shadow DOM is OPT-IN — you call \`this.attachShadow({mode:'open'})\` only if you want scoped CSS.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** Doing rendering in the constructor:
> \`\`\`javascript
> // ❌ Forbidden — the spec disallows DOM mutation in constructors.
> //    The element isn't yet inserted into the document, attributes aren't yet parsed.
> class MyEl extends HTMLElement {
>   constructor() {
>     super();
>     this.innerHTML = '<p>' + this.getAttribute('label') + '</p>'; // attribute is null!
>   }
> }
>
> // ✅ Render in connectedCallback, when the element is in the DOM
> class MyEl extends HTMLElement {
>   connectedCallback() {
>     this.innerHTML = '<p>' + this.getAttribute('label') + '</p>';
>   }
> }
> \`\`\`

**Q4: How does \`attributeChangedCallback\` interact with the browser's attribute parsing pipeline?**
> **A:** You opt into observation by declaring \`static observedAttributes = ['label', 'disabled']\`. The browser then calls \`attributeChangedCallback(name, oldValue, newValue)\` whenever any observed attribute is set, removed, or changed — including the initial parse-time values. This is how custom elements stay in sync with declarative \`<my-tag label="hello">\` AND imperative \`el.setAttribute('label','hi')\` — one callback handles both.

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "A Web Component is a user-defined HTML element implemented as a class extending \`HTMLElement\`, registered via \`customElements.define\`, with optional Shadow DOM for style/markup encapsulation, optional Template/Slot composition, and four lifecycle hooks (\`constructor\`, \`connectedCallback\`, \`disconnectedCallback\`, \`attributeChangedCallback\`) — providing the only framework-agnostic, browser-native component model that interoperates with React, Angular, Vue, and plain HTML simultaneously."`,

    build: `## BUILD

### 🏗️ Mini Project: A \`<theme-toggle>\` Custom Element That Works Everywhere

**What you will build:** A self-contained \`<theme-toggle>\` button you can drop into any HTML page. It persists choice to localStorage, syncs across tabs, respects \`prefers-color-scheme\`, dispatches a custom event, and ships with proper a11y.
**Why this project:** Touches every Web Component lifecycle hook + custom events + scoped styling + state persistence.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir theme-toggle && cd theme-toggle
ni index.html, theme-toggle.js -ItemType File
\`\`\`

#### Step 2 — Markup
\`\`\`html
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><title>theme-toggle demo</title>
<style>
  :root[data-theme="dark"] { background: #111; color: #eee; }
</style></head>
<body>
  <h1>Theme demo</h1>
  <theme-toggle></theme-toggle>
  <script type="module" src="./theme-toggle.js"></script>
</body></html>
\`\`\`

#### Step 3 — The Custom Element
\`\`\`javascript
class ThemeToggle extends HTMLElement {
  // Tell the browser which attributes to observe
  static observedAttributes = ['theme'];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = \`
      <style>
        button { font: inherit; padding: 0.5em 1em; cursor: pointer;
                 background: var(--bg, #f0f0f0); color: inherit;
                 border: 1px solid currentColor; border-radius: 4px; }
      </style>
      <button type="button" aria-pressed="false">
        <span class="label"></span>
      </button>
    \`;
    this.btn   = this.shadowRoot.querySelector('button');
    this.label = this.shadowRoot.querySelector('.label');
    this.btn.addEventListener('click', () => this.toggle());
  }

  connectedCallback() {
    // Restore from localStorage, or fall back to system preference
    const saved = localStorage.getItem('theme');
    const sys   = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    this.setAttribute('theme', saved ?? sys);

    // Sync with other tabs (storage event fires in OTHER tabs only)
    this._onStorage = (e) => {
      if (e.key === 'theme' && e.newValue) this.setAttribute('theme', e.newValue);
    };
    window.addEventListener('storage', this._onStorage);
  }

  disconnectedCallback() {
    // Avoid memory leak — remove the listener we added in connectedCallback
    window.removeEventListener('storage', this._onStorage);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'theme' && newValue !== oldValue) {
      // Apply to <html> so all CSS can react
      document.documentElement.dataset.theme = newValue;
      localStorage.setItem('theme', newValue);
      this.label.textContent = newValue === 'dark' ? '🌙 Dark' : '☀️ Light';
      this.btn.setAttribute('aria-pressed', String(newValue === 'dark'));

      // Let parent app react if it wants
      this.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme: newValue },
        bubbles: true, composed: true     // crosses shadow boundary
      }));
    }
  }

  toggle() {
    const current = this.getAttribute('theme');
    this.setAttribute('theme', current === 'dark' ? 'light' : 'dark');
  }
}

customElements.define('theme-toggle', ThemeToggle);
\`\`\`

#### Step 4 — Edge Cases: SSR, Lazy Definition, Multiple Instances
\`\`\`html
<!-- Pattern: the element appears in HTML BEFORE the JS runs (SSR / no-JS).
     The browser silently upgrades it to a custom element once defined. -->
<theme-toggle></theme-toggle>
<script type="module">
  // Late definition — instances already in the DOM upgrade on define()
  await new Promise(r => setTimeout(r, 1000));
  await import('./theme-toggle.js');
</script>
\`\`\`

#### Step 5 — Tests
\`\`\`javascript
// Verify the element is upgraded
const el = document.querySelector('theme-toggle');
console.assert(el instanceof HTMLElement, 'should be an element');
console.assert(el.shadowRoot,             'should have shadow root');

// Verify event dispatches across shadow boundary
let receivedTheme;
document.addEventListener('themechange', (e) => receivedTheme = e.detail.theme);
el.toggle();
console.assert(receivedTheme === 'dark' || receivedTheme === 'light',
  'themechange should fire on toggle');

// Verify persistence
console.assert(localStorage.getItem('theme'), 'theme should be persisted');
\`\`\`

**Expected Output:**
\`\`\`
- Button toggles between ☀️ Light and 🌙 Dark, page background changes
- aria-pressed updates for screen-reader users
- Reload keeps the chosen theme (localStorage)
- Open two tabs: toggling in one updates the other (storage event)
- themechange CustomEvent bubbles to document level
\`\`\`

**Stretch Challenges:**
- [ ] Add \`form-associated\` via \`ElementInternals\` so it participates in form submit
- [ ] Add a "system" tri-state (light / dark / auto-follow-OS)
- [ ] Publish as an npm package and consume it in React + Vue + plain HTML to prove portability`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** Name the FOUR Web Component lifecycle callbacks and when each fires.

**Q2:** What does \`static observedAttributes\` do? What happens if you forget it?

**Q3:** Write the minimum 7-line custom element that logs "connected" when added to the DOM.

---

### Day 3 — Comprehension

**Q4:** What is the difference between OPEN and CLOSED shadow DOM? When does each make sense?

**Q5:** Describe the bug caused by doing DOM work in a custom element's constructor. Why does the spec forbid it?

**Q6:** Refactor this broken custom element:
\`\`\`javascript
class MyEl extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = '<p>' + this.getAttribute('msg') + '</p>';  // always null!
    document.body.addEventListener('click', this.onBodyClick);    // never removed!
  }
}
\`\`\`

---

### Day 7 — Application

**Q7:** Build a \`<lazy-img>\` element that defers loading until visible (Intersection Observer), supports blur placeholder, and dispatches a \`load\` event.

**Q8:** A custom element works in plain HTML but breaks in React. List 3 React-specific gotchas (refs, attribute vs prop, event naming) and the workaround for each.

**Q9:** What is \`ElementInternals\` and what does "form-associated custom element" let you do?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "Why would a company invest in Web Components for their design system?"

**Q11:** Draw the dependency graph: web-components ↔ template-slot ↔ html-attributes ↔ html5-apis.

**Q12:** ★ System design: "Design the architecture for a 200-component design system delivered as web components, consumed by React, Angular, and Vue teams, with theme tokens, accessibility, SSR, and a documentation site."`
  },

  // ── 16. performance-html ──────────────────────────────────────────────────
  'performance-html': {
    feynman: `## FEYNMAN CHECK

### Explain HTML Performance Like I'm 10 Years Old
> Every HTML byte the browser receives goes through: parse → build DOM → fetch sub-resources → run scripts → compute styles → layout → paint. \`<script>\` BLOCKS this pipeline; \`<link rel="stylesheet">\` blocks rendering but not parsing; \`<img>\` is downloaded in parallel by the preload scanner. The single biggest HTML-level perf decision is the ORDER of tags in \`<head>\` — putting a \`<script src>\` before your CSS stalls EVERYTHING. Modern hints (\`async\`, \`defer\`, \`preload\`, \`fetchpriority\`, \`loading\`) exist precisely to let you opt OUT of these defaults.

---

### 5 Deep Conceptual Questions

**Q1: What problem does HTML performance optimisation fundamentally solve?**
> **A:** It minimises Time to First Byte → First Contentful Paint → Largest Contentful Paint — the three Core Web Vitals that determine SEO ranking and user perception. A 100ms delay in LCP measurably drops conversion rates. HTML-level fixes are the cheapest perf wins because they don't require touching the framework or backend.

**Q2: What is the ONE mental model that makes HTML perf click?**
> **A:** The browser has TWO parsers: the main HTML parser (blocked by sync scripts) and the speculative preload scanner (looks AHEAD in the byte stream for \`<img>\`, \`<script src>\`, \`<link href>\` and starts fetching). Your job is to put the LCP image and critical CSS where the preload scanner finds them first, and to keep sync scripts out of the critical path.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** That moving \`<script>\` to the bottom of \`<body>\` is still best practice in 2026:
> \`\`\`html
> <!-- ❌ Pre-2015 advice. The preload scanner is delayed — script discovered late. -->
> <!DOCTYPE html><html><head><title>Site</title></head>
> <body>
>   <main>...</main>
>   <script src="app.js"></script>           <!-- discovered last → fetched last -->
> </body></html>
>
> <!-- ✅ Modern: put scripts in <head> with defer — discovered early, executed after parse -->
> <!DOCTYPE html><html><head>
>   <title>Site</title>
>   <link rel="stylesheet" href="app.css">
>   <script src="app.js" defer></script>     <!-- parallel download, deferred execution -->
> </head>
> <body><main>...</main></body></html>
> \`\`\`

**Q4: How do \`async\` and \`defer\` interact with the HTML parser at runtime?**
> **A:** \`async\`: downloads in parallel with parsing, EXECUTES AS SOON AS DOWNLOADED (interrupts parsing, no guaranteed order). \`defer\`: downloads in parallel with parsing, EXECUTES AFTER parse completes (preserves source order, fires before \`DOMContentLoaded\`). For 99% of scripts, \`defer\` is correct because order matters; \`async\` is for independent scripts like analytics. Module scripts (\`<script type="module">\`) are \`defer\` by default.

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "HTML performance is the practice of ordering and annotating \`<head>\` and \`<body>\` tags so the browser's preload scanner discovers critical resources (LCP image, critical CSS, deferred JS) in the right order with the right priorities — turning HTML markup itself into a network-scheduler that materially shifts First Contentful Paint, Largest Contentful Paint, and Cumulative Layout Shift before a single byte of JavaScript runs."`,

    build: `## BUILD

### 🏗️ Mini Project: Turn a Lighthouse-Failing Page Into a Lighthouse-Passing Page

**What you will build:** Take a typical landing page that scores 45 on Lighthouse Performance and apply HTML-only optimisations (resource hints, image attributes, script attributes, font preloading) to score 95+.
**Why this project:** Concretely demonstrates each HTML-level perf lever's measurable impact.
**Time estimate:** 45 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir perf-fix && cd perf-fix
ni before.html, after.html -ItemType File
mkdir img; mkdir fonts
# Drop hero.jpg, font.woff2 into respective folders
\`\`\`

#### Step 2 — The "Before" (typical pre-optimisation)
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Landing page</title>
  <!-- ❌ Render-blocking, no preconnect to CDN -->
  <link rel="stylesheet" href="https://cdn.example.com/app.css">
  <!-- ❌ Render-blocking, in head with no defer -->
  <script src="https://cdn.example.com/big-app.js"></script>
  <style>
    @font-face {
      font-family: 'Brand'; src: url('/fonts/font.woff2') format('woff2');
      /* ❌ No font-display: invisible text until font loads (FOIT) */
    }
  </style>
</head>
<body>
  <!-- ❌ No width/height — causes CLS when loaded -->
  <img src="/img/hero.jpg" alt="Hero">
  <!-- ❌ Below-fold images eager-loaded -->
  <img src="/img/g1.jpg" alt="">
  <img src="/img/g2.jpg" alt="">
  <img src="/img/g3.jpg" alt="">
</body>
</html>
\`\`\`

#### Step 3 — The "After" (HTML-only optimisations applied)
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Landing page</title>

  <!-- ✅ Preconnect to CDN: saves 100-300ms on first fetch from that origin -->
  <link rel="preconnect" href="https://cdn.example.com" crossorigin>
  <link rel="dns-prefetch" href="https://cdn.example.com">

  <!-- ✅ Preload the LCP image (hero) so it starts BEFORE CSS parses -->
  <link rel="preload" as="image" href="/img/hero.jpg" fetchpriority="high">

  <!-- ✅ Preload the brand font — eliminates FOUT/FOIT -->
  <link rel="preload" as="font" type="font/woff2"
        href="/fonts/font.woff2" crossorigin>

  <link rel="stylesheet" href="https://cdn.example.com/app.css">

  <!-- ✅ Defer script: downloads in parallel, executes after parse -->
  <script src="https://cdn.example.com/big-app.js" defer></script>

  <style>
    @font-face {
      font-family: 'Brand';
      src: url('/fonts/font.woff2') format('woff2');
      font-display: swap;   /* ✅ Show fallback immediately, swap when ready */
    }
  </style>
</head>
<body>
  <!-- ✅ Hero: width/height prevents CLS, fetchpriority=high for LCP -->
  <img src="/img/hero.jpg" alt="Sunlit forest path"
       width="1200" height="600"
       fetchpriority="high" decoding="sync">

  <!-- ✅ Below-fold: lazy + async -->
  <img src="/img/g1.jpg" alt="" width="400" height="300"
       loading="lazy" decoding="async">
  <img src="/img/g2.jpg" alt="" width="400" height="300"
       loading="lazy" decoding="async">
  <img src="/img/g3.jpg" alt="" width="400" height="300"
       loading="lazy" decoding="async">
</body>
</html>
\`\`\`

#### Step 4 — Edge Cases: Module Scripts, Third-Party Tags, Inline CSS
\`\`\`html
<!-- ESM is defer-by-default. Don't add defer redundantly. -->
<script type="module" src="/app.mjs"></script>

<!-- Analytics: async is fine (independent, order doesn't matter) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA"></script>

<!-- Inline critical CSS for above-the-fold, lazy-load the rest -->
<style>/* ~5KB of above-the-fold styles inlined */</style>
<link rel="stylesheet" href="/rest.css" media="print"
      onload="this.media='all'">                <!-- non-blocking pattern -->
\`\`\`

#### Step 5 — Tests
\`\`\`bash
# Lighthouse comparison
npx -y lighthouse http://localhost:8080/before.html --only-categories=performance --quiet
npx -y lighthouse http://localhost:8080/after.html  --only-categories=performance --quiet

# Diff the metrics
# - LCP:    before 4.2s → after 1.8s  (-57%)
# - CLS:    before 0.31 → after 0.00  (-100%)
# - TBT:    before 800ms → after 120ms (-85%)
# - Score:  before 45    → after 96
\`\`\`

**Expected Output:**
\`\`\`
- Lighthouse Performance: 45 → 96
- LCP: 4.2s → 1.8s
- CLS: 0.31 → 0.00
- TBT: 800ms → 120ms
- All vitals "Good" instead of "Poor"
\`\`\`

**Stretch Challenges:**
- [ ] Inline critical CSS extracted by \`critters\` and async-load the rest
- [ ] Add \`<link rel="modulepreload">\` for ESM dependency graphs
- [ ] Add Speculation Rules API \`<script type="speculationrules">\` for instant next-page nav`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** What is the difference between \`async\` and \`defer\` on \`<script>\`? When does each preserve source order?

**Q2:** Name 4 \`<link rel="...">\` values used for performance hints. What does each do?

**Q3:** Write the \`<link>\` tag that preloads a WOFF2 font, plus the \`@font-face\` rule that uses it.

---

### Day 3 — Comprehension

**Q4:** What is the preload scanner? How does it interact with \`<script>\` tags in \`<head>\`?

**Q5:** Describe a CLS regression caused by adding an \`<img>\` without width/height. Quantify the score impact.

**Q6:** Refactor for perf:
\`\`\`html
<head>
  <script src="https://cdn.com/big.js"></script>
  <link rel="stylesheet" href="https://cdn.com/all.css">
</head>
<body>
  <img src="hero.jpg" alt="">
</body>
\`\`\`

---

### Day 7 — Application

**Q7:** Optimise the \`<head>\` for a page whose LCP element is a Google Fonts heading on an AVIF hero image.

**Q8:** Lighthouse flags "Eliminate render-blocking resources." Name 3 HTML-level techniques to address it.

**Q9:** What is the difference between \`fetchpriority="high"\` and \`<link rel="preload">\`? When do you use each?

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "Walk me through optimising the first-paint of a content-heavy article page."

**Q11:** Draw the dependency graph: performance-html ↔ links-and-images ↔ meta-tags-and-seo ↔ html-intro.

**Q12:** ★ System design: "Design the HTML delivery pipeline for a global news site that must achieve sub-2s LCP at p75 across 200 countries, with personalised content, ads, and 3rd-party trackers."`
  },

  // ── 17. pwa-manifest ──────────────────────────────────────────────────────
  'pwa-manifest': {
    feynman: `## FEYNMAN CHECK

### Explain the PWA Web App Manifest Like I'm 10 Years Old
> The Web App Manifest is a tiny JSON file (\`manifest.webmanifest\`) referenced from \`<link rel="manifest">\` that tells the OS "this website wants to be installable like a native app." It declares the app name, icon set, theme colour, splash screen, start URL, and display mode (\`standalone\` removes browser chrome — looks like a real app). Combined with a Service Worker for offline support and HTTPS, it earns the browser's "Add to Home Screen" prompt. This is why Twitter Lite, Pinterest, and Starbucks Mobile all install as PWAs and run from your phone's home screen without ever visiting an app store.

---

### 5 Deep Conceptual Questions

**Q1: What problem does the PWA manifest fundamentally solve?**
> **A:** It eliminates the app store as a distribution choke point. With one JSON file + a service worker, your website becomes installable, launches with its own icon and splash screen, runs full-screen without browser chrome, and works offline. For developing-world users on cheap Android phones with limited storage, a 200KB PWA beats a 50MB native app every time.

**Q2: What is the ONE mental model that makes PWAs click?**
> **A:** A PWA is just a regular website + 3 ingredients: HTTPS (required), a Web App Manifest (declares "I'm installable"), and a Service Worker (handles offline + push). The browser checks for all three on every page load — once they're present and the user has visited a few times, it triggers the installation prompt automatically.

**Q3: What is the most dangerous misconception? Show it with code.**
> **A:** That setting \`"display": "standalone"\` is enough to be installable:
> \`\`\`json
> // ❌ Browser will NOT show install prompt — missing required fields
> { "display": "standalone", "name": "My App" }
>
> // ✅ Minimum installable manifest per current spec
> {
>   "name": "Notes App",
>   "short_name": "Notes",
>   "start_url": "/",
>   "display": "standalone",
>   "background_color": "#ffffff",
>   "theme_color": "#0e639c",
>   "icons": [
>     { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
>     { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" },
>     { "src": "/icons/512-maskable.png", "sizes": "512x512",
>       "type": "image/png", "purpose": "maskable" }
>   ]
> }
> \`\`\`

**Q4: How does the manifest interact with the OS at install time?**
> **A:** On install, the browser parses the manifest, downloads the largest \`icons\` entry that satisfies the OS launcher size, copies them to the OS app registry, creates a shortcut with \`name\` + the icon, and registers the \`start_url\` as the launch target. \`theme_color\` is read by the OS to colour the task switcher and the title bar. \`display: standalone\` strips the browser's URL bar at launch. \`maskable\` icons let Android crop the icon to whatever shape the launcher uses (circle, squircle, rounded square).

**Q5: Write a one-sentence FAANG-precise definition.**
> **A:** "A Web App Manifest is a JSON document referenced via \`<link rel='manifest'>\` declaring name, icons (including maskable variants), start URL, display mode, theme/background colour, and capability hints (shortcuts, share targets, file handlers) that — combined with HTTPS and a Service Worker — qualifies a website as an installable Progressive Web App with OS-level integration, splash screens, and standalone launch."`,

    build: `## BUILD

### 🏗️ Mini Project: Make Any Website Installable in Under 30 Lines

**What you will build:** A complete installable PWA with manifest, service worker (offline cache-first), install prompt UI, and update-detection — for an existing single HTML page.
**Why this project:** The minimum-viable PWA recipe, end-to-end.
**Time estimate:** 30 minutes

---

#### Step 1 — Setup
\`\`\`bash
mkdir my-pwa && cd my-pwa
ni index.html, manifest.webmanifest, sw.js -ItemType File
mkdir icons
# Create icons/192.png, icons/512.png, icons/512-maskable.png (≥192×192, ≥512×512)
\`\`\`

#### Step 2 — The Manifest
\`\`\`json
{
  "name": "Notes App",
  "short_name": "Notes",
  "description": "Offline-first note-taking PWA.",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#0e639c",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/512-maskable.png", "sizes": "512x512",
      "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [
    {
      "name": "New note",
      "url": "/?new=1",
      "icons": [{ "src": "/icons/192.png", "sizes": "192x192" }]
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": { "title": "title", "text": "text", "url": "url" }
  }
}
\`\`\`

#### Step 3 — Wire the Manifest Into the Page
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Notes App</title>

  <!-- The manifest reference -->
  <link rel="manifest" href="/manifest.webmanifest">

  <!-- Theme colour for the browser tab strip + OS launcher -->
  <meta name="theme-color" content="#0e639c">

  <!-- iOS-specific (Apple ignores the manifest for some properties) -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <link rel="apple-touch-icon" href="/icons/192.png">
</head>
<body>
  <h1>Notes</h1>
  <button id="install" hidden>Install app</button>
  <script type="module" src="/app.js"></script>
</body>
</html>
\`\`\`

#### Step 4 — Service Worker + Install Prompt
\`\`\`javascript
// app.js — register SW + capture install prompt
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered, scope:', reg.scope));
}

// Capture the browser's deferred install prompt
let deferredPrompt;
const installBtn = document.getElementById('install');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();                   // stop the auto-prompt
  deferredPrompt = e;                   // save it for our button
  installBtn.hidden = false;
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  installBtn.hidden = true;
  deferredPrompt.prompt();              // show the native install dialog
  const { outcome } = await deferredPrompt.userChoice;
  console.log('Install outcome:', outcome);   // 'accepted' or 'dismissed'
  deferredPrompt = null;
});

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  installBtn.hidden = true;
});
\`\`\`
\`\`\`javascript
// sw.js — cache-first for the app shell
const CACHE = 'notes-v1';
const SHELL = ['/', '/app.js', '/manifest.webmanifest',
               '/icons/192.png', '/icons/512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
\`\`\`

#### Step 5 — Tests
\`\`\`bash
# 1. Validate the manifest
npx -y pwa-asset-generator --validate manifest.webmanifest

# 2. Run Lighthouse PWA audit
npx -y lighthouse http://localhost:8080/ --only-categories=pwa --quiet

# 3. Chrome DevTools → Application → Manifest:
#    - All fields valid, icons present
#    - "Add to home screen" button works
#    - After install, app launches in standalone window
\`\`\`

**Expected Output:**
\`\`\`
- Lighthouse PWA: passes (✓ installable, ✓ offline)
- Chrome: install button shows in URL bar
- Installed app: launches in standalone window with custom theme colour
- Offline mode: page still loads from service worker cache
- Long-press app icon on Android: "New note" shortcut appears
\`\`\`

**Stretch Challenges:**
- [ ] Add a periodic Background Sync that refreshes content overnight
- [ ] Add a Web Push subscription for notifications when offline notes sync
- [ ] Add a File Handler so the PWA opens \`.md\` files from the OS file manager`,

    spacedReview: `## SPACED REVIEW

---

### Day 1 — Recall

**Q1:** Name the THREE technical requirements for a website to qualify as an installable PWA.

**Q2:** What does \`"display": "standalone"\` do? What does \`"display": "fullscreen"\` do differently?

**Q3:** Write the \`<link>\` and \`<meta>\` tags needed in \`<head>\` to wire up a manifest and theme colour.

---

### Day 3 — Comprehension

**Q4:** What is a "maskable" icon and why does Android need one? What happens if you don't provide one?

**Q5:** Describe a bug where the install prompt never appears despite a valid manifest. List 3 likely causes.

**Q6:** Refactor for installability:
\`\`\`html
<head>
  <title>My App</title>
</head>
\`\`\`
plus this minimal but broken manifest:
\`\`\`json
{ "name": "My App" }
\`\`\`

---

### Day 7 — Application

**Q7:** Build a "share target" PWA: a notes app that registers as a destination when Android users share a URL or selected text.

**Q8:** A PWA works offline on first install but breaks after a new deploy. Explain the root cause and the cache-busting fix.

**Q9:** What is the difference between \`scope\` and \`start_url\` in the manifest? Give an example where they intentionally differ.

---

### Day 14 — Synthesis & Interview Prep

**Q10:** ★ Interview: "When would you choose a PWA over a native app?"

**Q11:** Draw the dependency graph: pwa-manifest ↔ html5-apis ↔ meta-tags-and-seo ↔ performance-html.

**Q12:** ★ System design: "Design the PWA strategy for an e-commerce app serving emerging markets: offline cart, background sync for orders, push notifications, app shortcuts, install promotion. How does each capability map to manifest fields and service-worker events?"`
  }
};




