/**
 * DevMastery — Full GFG-Style Content Regeneration Engine
 * =========================================================
 * Scans ALL 744 MDX files across all 22 learning paths,
 * identifies which ones are incomplete / thin, and regenerates
 * them with comprehensive GeeksForGeeks-style content using
 * Gemini 1.5 Flash (multi-key rotation + exponential back-off).
 *
 * Usage:
 *   npx tsx scripts/regenerateGFGContent.ts              # all paths
 *   npx tsx scripts/regenerateGFGContent.ts java-mastery  # single path
 *   npx tsx scripts/regenerateGFGContent.ts --force       # regenerate all regardless
 *
 * Required env (in .env.dev at root):
 *   GEMINI_API_KEY=...
 *   GEMINI_API_KEY_2=...   (optional)
 *   GEMINI_API_KEY_3=...   (optional)
 */

const fs   = require('fs');
const path = require('path');

// ─── Load env ─────────────────────────────────────────────────────────────
function loadEnv() {
  const candidates = [
    path.join(__dirname, '../.env.dev'),
    path.join(__dirname, '../.env'),
    path.join(__dirname, '../apps/web/.env.local'),
  ];
  for (const f of candidates) {
    if (fs.existsSync(f)) {
      const raw = fs.readFileSync(f, 'utf-8');
      raw.split('\n').forEach(line => {
        const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
      });
    }
  }
}
loadEnv();

// ─── API Key pool ──────────────────────────────────────────────────────────
const API_KEYS: string[] = [];
for (let i = 1; i <= 5; i++) {
  const key = i === 1 ? process.env.GEMINI_API_KEY : process.env[`GEMINI_API_KEY_${i}`];
  if (key && key !== 'YOUR_GEMINI_API_KEY_HERE' && key.length > 10) API_KEYS.push(key);
}

if (API_KEYS.length === 0) {
  console.error('\n❌  No GEMINI_API_KEY found.');
  console.error('    Create a .env.dev file at the project root with:');
  console.error('    GEMINI_API_KEY=your_key_here\n');
  console.error('    Get a free key at: https://aistudio.google.com/app/apikey\n');
  process.exit(1);
}

console.log(`🔑  ${API_KEYS.length} Gemini API key(s) loaded.`);

// ─── Constants ────────────────────────────────────────────────────────────
const CONTENT_DIR = path.join(__dirname, '../apps/web/content');
const CONCURRENCY = 4;        // parallel topics at a time (stay within free-tier RPM)
const MIN_QUALITY_BYTES = 8000; // files under this are considered incomplete
const FORCE = process.argv.includes('--force');
const TARGET_PATH = process.argv.find(a => !a.startsWith('-') && a !== process.argv[1] && a !== process.argv[0] && !a.includes('regenerate')) || null;

// ─── Path metadata (language, context) ───────────────────────────────────
const PATH_META: Record<string, { lang: string; ctx: string; codeType: string }> = {
  'java-mastery':        { lang: 'java',       ctx: 'Java (JVM, Spring Boot)',        codeType: 'java' },
  'javascript':          { lang: 'javascript', ctx: 'JavaScript (Node.js / Browser)', codeType: 'javascript' },
  'typescript':          { lang: 'typescript', ctx: 'TypeScript (Node.js / React)',   codeType: 'typescript' },
  'react':               { lang: 'tsx',        ctx: 'React 18 with TypeScript',       codeType: 'tsx' },
  'angular':             { lang: 'typescript', ctx: 'Angular 17 with TypeScript',     codeType: 'typescript' },
  'spring-boot':         { lang: 'java',       ctx: 'Spring Boot 3 / Java 21',        codeType: 'java' },
  'dsa':                 { lang: 'java',       ctx: 'Java (DSA, LeetCode)',            codeType: 'java' },
  'leetcode-patterns':   { lang: 'java',       ctx: 'Java (LeetCode Patterns)',        codeType: 'java' },
  'system-design':       { lang: 'text',       ctx: 'System Design (diagrams, SQL, pseudocode)', codeType: 'text' },
  'api-design':          { lang: 'json',       ctx: 'API Design (REST, OpenAPI, HTTP)', codeType: 'json' },
  'software-architecture': { lang: 'java',     ctx: 'Software Architecture (Java/Python)', codeType: 'java' },
  'html':                { lang: 'html',       ctx: 'HTML5 / Web Standards',          codeType: 'html' },
  'css':                 { lang: 'css',        ctx: 'CSS3 / Tailwind / PostCSS',      codeType: 'css' },
  'sql':                 { lang: 'sql',        ctx: 'SQL (PostgreSQL / MySQL)',        codeType: 'sql' },
  'postgresql-dba':      { lang: 'sql',        ctx: 'PostgreSQL DBA (SQL, config)',    codeType: 'sql' },
  'mongodb':             { lang: 'javascript', ctx: 'MongoDB (Node.js driver / Mongoose)', codeType: 'javascript' },
  'design-system':       { lang: 'tsx',        ctx: 'Design System (React / Storybook)', codeType: 'tsx' },
  'nextjs':              { lang: 'tsx',        ctx: 'Next.js 15 / App Router',        codeType: 'tsx' },
  'docker':              { lang: 'dockerfile', ctx: 'Docker / Container ecosystem',   codeType: 'dockerfile' },
  'kubernetes':          { lang: 'yaml',       ctx: 'Kubernetes / Helm / kubectl',    codeType: 'yaml' },
  'git-github':          { lang: 'bash',       ctx: 'Git / GitHub / CI-CD',           codeType: 'bash' },
  'full-stack':          { lang: 'typescript', ctx: 'Full Stack (mixed languages)',   codeType: 'typescript' },
};

// ─── Quality checker ──────────────────────────────────────────────────────
interface QualityReport {
  complete: boolean;
  hasWhy: boolean;
  hasTheory: boolean;
  hasCode: boolean;
  hasLevel4or5: boolean;
  hasRealWorld: boolean;
  hasInterview: boolean;
  has5QAs: boolean;
  byteSize: number;
}

function checkQuality(content: string): QualityReport {
  const byteSize = Buffer.byteLength(content, 'utf-8');
  const hasWhy        = /##\s+WHY/.test(content);
  const hasTheory     = /##\s+THEORY/.test(content);
  const hasCode       = /##\s+CODE/.test(content);
  const hasLevel4or5  = /###\s+Level\s+[45]/.test(content);
  const hasRealWorld  = /##\s+REAL_WORLD|##\s+REAL WORLD/.test(content);
  const hasInterview  = /##\s+INTERVIEW/.test(content);
  const qaMatches     = (content.match(/###\s+Q\d+:/g) || []).length;
  const has5QAs       = qaMatches >= 4;

  const complete = hasWhy && hasTheory && hasCode && hasLevel4or5 && hasRealWorld && hasInterview && has5QAs && byteSize >= MIN_QUALITY_BYTES;

  return { complete, hasWhy, hasTheory, hasCode, hasLevel4or5, hasRealWorld, hasInterview, has5QAs, byteSize };
}

// ─── Frontmatter parser ───────────────────────────────────────────────────
function parseFrontmatter(raw: string): { title: string; slug: string; level: number } {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return { title: '', slug: '', level: 1 };
  const fm = fmMatch[1];
  const title = (fm.match(/title:\s*"?([^"\n]+)"?/) || [])[1]?.trim() || '';
  const slug  = (fm.match(/slug:\s*"?([^"\n]+)"?/)  || [])[1]?.trim() || '';
  const level = parseInt((fm.match(/level:\s*(\d+)/) || [])[1] || '1', 10);
  return { title, slug, level };
}

// ─── The big prompt template ───────────────────────────────────────────────
function buildPrompt(
  slug: string,
  title: string,
  level: number,
  pathSlug: string,
  pathMeta: { lang: string; ctx: string; codeType: string },
  existingContent: string,
  quality: QualityReport
): string {
  const langLabel   = pathMeta.codeType;
  const contextInfo = pathMeta.ctx;

  const existingSummary = quality.byteSize > 2000
    ? `\n\nEXISTING CONTENT SUMMARY (enhance this, don't discard):\n${existingContent.substring(0, 3000)}\n...(truncated)`
    : '';

  return `You are an expert technical writer for DevMastery, a premium developer education platform similar to GeeksForGeeks but more in-depth, with a focus on working professionals and interview preparation.

Generate a COMPLETE, comprehensive MDX topic file for the following:
- Topic: "${title}"
- Slug: "${slug}"  
- Learning Path: "${pathSlug}" (${contextInfo})
- Level: ${level}/5
- Primary language for code examples: ${langLabel}
${existingSummary}

The output MUST be a single, complete MDX file following this EXACT structure. Do NOT add any preamble or explanation outside the MDX — output ONLY the MDX content starting with ---

---
title: "${title}"
slug: "${slug}"
level: ${level}
---

## WHY

[Write 3-5 rich paragraphs explaining WHY this topic matters from first principles:
- Start with the PROBLEM that existed before this concept/feature was invented
- Explain real production scenarios where NOT knowing this causes actual bugs
- Use bold text for key terms
- Be compelling and connect to a developer's daily work
- DO NOT be generic — be specific to this exact topic]

## THEORY

[Write a thorough theory section with multiple ### sub-headings:
- Explain the internals / mechanics (how does it work under the hood?)
- Include a METHOD/PROPERTY reference table if applicable (| Method | Description | Example |)
- Cover common misconceptions and traps with ⚠️ markers
- Use concrete examples inline
- For complex topics: include a numbered list of steps showing exactly how it works internally
- Minimum 600 words]

## VISUALIZATION_CONFIG
\`\`\`json
{ "component": "CodeStepsVisualizer" }
\`\`\`

## CODE

### Level 1 — Beginner
\`\`\`${langLabel}
// [Beginner example: the absolute simplest use case]
// [Every single line should have a comment explaining WHAT and WHY]
// [At the end, add: // Expected Output:]
// [Then: // line 1 of output]
// [Then: // line 2 of output...]
\`\`\`

### Level 2 — Building Blocks
\`\`\`${langLabel}
// [Show 2-3 related concepts used together]
// [More realistic than Level 1 but still approachable]
// [Include Expected Output]
\`\`\`

### Level 3 — Intermediate
\`\`\`${langLabel}
// [Real-world applicable code — the kind you'd actually write at work]
// [Show a common pattern or gotcha that trips developers up]
// [Include Expected Output]
\`\`\`

### Level 4 — Advanced
\`\`\`${langLabel}
// [Advanced usage: performance considerations, integration with frameworks]
// [Show interaction with ${contextInfo} ecosystem]
// [Production-grade patterns. Include Expected Output]
\`\`\`

### Level 5 — Expert
\`\`\`${langLabel}
// [Expert level: internals, reflection/JMX/profiling, or advanced design patterns]
// [Something a Staff Engineer or Architect would write]
// [Include Expected Output]
\`\`\`

## REAL_WORLD

[Write 3-4 paragraphs + code examples demonstrating PRODUCTION use:
- How does this appear in ${contextInfo} codebases?
- Show a common anti-pattern and the correct fix
- Include actual framework/library code (not toy examples)
- Explain performance implications in production]

## INTERVIEW

### Q1: [Easy question about the fundamentals of this topic]
**Difficulty:** Easy | **Companies:** All

❌ **Weak answer:** "[What a junior developer would say — vague, incomplete]"

✅ **Strong answer:**
"[What gets you the job — specific, mentions internals, uses correct terminology, gives an example]"

### Q2: [Medium question about a common trap or misconception]
**Difficulty:** Medium | **Companies:** [2-3 relevant companies e.g., Amazon, Google]

❌ **Weak answer:** "[Superficial answer]"

✅ **Strong answer:**
"[Detailed answer explaining the why behind the behavior]"

### Q3: [Medium question about performance or real-world application]
**Difficulty:** Medium | **Companies:** [2-3 relevant companies]

❌ **Weak answer:** "[Common wrong answer]"

✅ **Strong answer:**
"[Correct answer with concrete numbers/examples]"

### Q4: [Hard question about internals or edge cases]
**Difficulty:** Hard | **Companies:** [specific companies known for this topic]

❌ **Weak answer:** "[What most people would say]"

✅ **Strong answer:**
"[Expert-level answer that demonstrates deep understanding]"

### Q5: [Hard question connecting this topic to larger system concepts]
**Difficulty:** Hard | **Companies:** [specific companies]

❌ **Weak answer:** "[Generic answer]"

✅ **Strong answer:**
"[Answer that shows architectural thinking and real-world experience]"

IMPORTANT RULES:
1. ALL code examples must be COMPLETE, RUNNABLE programs (not fragments)
2. Every code example must have "// Expected Output:" comments showing EXACT output
3. The THEORY section must be comprehensive — at least 8 distinct paragraphs or sub-sections
4. The INTERVIEW answers must be concrete and specific, not vague
5. Do NOT use placeholder text like "[your content here]" — write actual content
6. The total file should be at least 3000 words of actual content
7. Output ONLY the MDX content — no markdown fences around it, no preamble`;
}

// ─── Gemini caller with key rotation ─────────────────────────────────────
let currentKeyIdx = 0;

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function callGemini(prompt: string, attempt = 0): Promise<string> {
  if (attempt > 8) throw new Error('Max retries exceeded');

  const keyIdx = currentKeyIdx % API_KEYS.length;
  const apiKey = API_KEYS[keyIdx];

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 8192,
            topP: 0.95,
          },
          systemInstruction: {
            parts: [{
              text: 'You are a world-class developer educator. Your explanations combine the clarity of GeeksForGeeks with the depth of a senior engineer\'s blog post. Every code example you write is complete, runnable, and heavily commented. You always explain the "why" behind every concept, not just the "what".'
            }]
          }
        })
      }
    );

    if (res.status === 429 || res.status === 503) {
      const waitMs = Math.min(1000 * Math.pow(2, attempt), 60000);
      console.warn(`    ⏳ Rate limited (key ${keyIdx + 1}). Waiting ${waitMs / 1000}s...`);
      currentKeyIdx = (currentKeyIdx + 1) % API_KEYS.length;
      await sleep(waitMs);
      return callGemini(prompt, attempt + 1);
    }

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errBody.substring(0, 200)}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');

    // Rotate key for next call (load balancing)
    currentKeyIdx = (currentKeyIdx + 1) % API_KEYS.length;
    return text;

  } catch (err: any) {
    if (err.message?.includes('fetch') || err.code === 'ECONNRESET') {
      const waitMs = 5000 * (attempt + 1);
      console.warn(`    ⚠️  Network error. Retry ${attempt + 1} in ${waitMs / 1000}s...`);
      await sleep(waitMs);
      return callGemini(prompt, attempt + 1);
    }
    throw err;
  }
}

// ─── Clean up Gemini's response ────────────────────────────────────────────
function cleanResponse(raw: string, slug: string, title: string): string {
  let text = raw.trim();

  // Strip wrapping markdown fences if Gemini added them
  if (text.startsWith('```markdown')) text = text.slice(11).trim();
  else if (text.startsWith('```mdx'))    text = text.slice(6).trim();
  else if (text.startsWith('```'))       text = text.slice(3).trim();
  if (text.endsWith('```')) text = text.slice(0, text.lastIndexOf('```')).trim();

  // Ensure frontmatter is present
  if (!text.startsWith('---')) {
    text = `---\ntitle: "${title}"\nslug: "${slug}"\nlevel: 1\n---\n\n${text}`;
  }

  return text;
}

// ─── Process a single file ─────────────────────────────────────────────────
async function processFile(filePath: string, pathSlug: string): Promise<void> {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const quality = checkQuality(raw);
  const fm = parseFrontmatter(raw);

  if (!FORCE && quality.complete) {
    process.stdout.write('.');  // dot = skipped (already complete)
    return;
  }

  const pathMeta = PATH_META[pathSlug] || PATH_META['full-stack'];
  const title = fm.title || path.basename(filePath, '.mdx').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const slug  = fm.slug  || path.basename(filePath, '.mdx');
  const level = fm.level || 1;

  const prompt = buildPrompt(slug, title, level, pathSlug, pathMeta, raw, quality);

  try {
    const generated = await callGemini(prompt);
    const cleaned = cleanResponse(generated, slug, title);
    fs.writeFileSync(filePath, cleaned, 'utf-8');

    const newQuality = checkQuality(cleaned);
    const status = newQuality.complete ? '✅' : '⚠️ ';
    console.log(`\n    ${status} ${pathSlug}/${slug} (${(cleaned.length / 1024).toFixed(1)}KB) [WHY:${newQuality.hasWhy} L5:${newQuality.hasLevel4or5} INT:${newQuality.has5QAs}]`);

  } catch (err: any) {
    console.error(`\n    ❌ FAILED ${pathSlug}/${slug}: ${err.message?.substring(0, 100)}`);
  }
}

// ─── Concurrency pool ─────────────────────────────────────────────────────
async function runPool(tasks: (() => Promise<void>)[], concurrency: number) {
  const queue = [...tasks];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const task = queue.shift();
      if (task) await task();
    }
  });
  await Promise.all(workers);
}

// ─── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 DevMastery GFG-Style Content Regeneration Engine');
  console.log('====================================================');
  if (FORCE) console.log('⚡ FORCE mode: regenerating ALL files regardless of quality');
  if (TARGET_PATH) console.log(`🎯 Target path: ${TARGET_PATH}`);
  console.log('');

  const pathDirs = fs.readdirSync(CONTENT_DIR)
    .filter(d => fs.statSync(path.join(CONTENT_DIR, d)).isDirectory())
    .filter(d => !TARGET_PATH || d === TARGET_PATH);

  let totalFiles = 0;
  let skipped    = 0;
  const allTasks: (() => Promise<void>)[] = [];

  // ── Audit phase ──
  for (const pathSlug of pathDirs) {
    const pathDir = path.join(CONTENT_DIR, pathSlug);
    const mdxFiles = fs.readdirSync(pathDir).filter((f: string) => f.endsWith('.mdx'));
    totalFiles += mdxFiles.length;

    for (const file of mdxFiles) {
      const filePath = path.join(pathDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const q = checkQuality(raw);

      if (!FORCE && q.complete) {
        skipped++;
        continue;
      }

      const capturedPath = pathSlug;
      const capturedFile = filePath;
      allTasks.push(() => processFile(capturedFile, capturedPath));
    }
  }

  const toProcess = allTasks.length;
  console.log(`📊 Audit complete:`);
  console.log(`   Total files   : ${totalFiles}`);
  console.log(`   Already complete (skip): ${skipped}`);
  console.log(`   Need upgrading : ${toProcess}`);
  console.log('');

  if (toProcess === 0) {
    console.log('🎉 All topics already meet GFG-style quality standards!');
    return;
  }

  console.log(`⚙️  Processing ${toProcess} files with concurrency=${CONCURRENCY}...`);
  console.log(`   (. = skipped, ✅ = upgraded, ⚠️  = generated but needs review)\n`);

  const startTime = Date.now();
  await runPool(allTasks, CONCURRENCY);

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  console.log(`\n\n🎉 DONE! Processed ${toProcess} topics in ${mins}m ${secs}s.`);
  console.log('   Run: npx tsx apps/web/scripts/importContent.ts to push to backend.\n');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});

