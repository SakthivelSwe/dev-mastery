#!/usr/bin/env node
/**
 * DevMastery Content Auto-Fix Bot
 * -------------------------------
 * Reads `apps/web/content/_audit/health.json` (produced by
 * `scripts/audit-content-health.js`), picks the worst-scoring topics for a
 * given path, and asks Gemini to fill in missing/shallow sections while
 * honouring the 9-section schema in SKILL.md.
 *
 * The bot writes *proposals* to `apps/web/content/_audit/proposals/<path>/`
 * — it never overwrites the live `.mdx` files. A human reviews the diff and
 * copies the accepted section into the real file, or runs the companion
 * `scripts/apply-auto-fixes.js` (TODO) to bulk-apply high-confidence fixes.
 *
 * Usage:
 *   GEMINI_API_KEY=... node scripts/auto-fix-content.js <path-slug> [limit]
 *   e.g.  node scripts/auto-fix-content.js react 5
 *
 * Env:
 *   GEMINI_API_KEY   required
 *   GEMINI_MODEL     default gemini-1.5-flash
 *   DRY_RUN=1        prints prompts, does not call Gemini
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT        = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'apps', 'web', 'content');
const AUDIT_DIR   = path.join(CONTENT_DIR, '_audit');
const PROPOSAL_DIR = path.join(AUDIT_DIR, 'proposals');

const MODEL   = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const API_KEY = process.env.GEMINI_API_KEY;
const DRY_RUN = process.env.DRY_RUN === '1';

// ─── The section templates the bot is allowed to (re)generate. ──────────
// Kept minimal so it's mechanical and safe. Prompt engineering lives in
// buildPrompt().
const FIXABLE_SECTIONS = {
  why:          '## WHY',
  theory:       '## THEORY',
  visual:       '## VISUALIZATION_CONFIG',
  code:         '## CODE',
  realWorld:    '## REAL_WORLD',
  interview:    '## INTERVIEW',
  feynman:      '## FEYNMAN CHECK',
  build:        '## BUILD',
  spacedReview: '## SPACED REVIEW',
};

// ─── CLI ────────────────────────────────────────────────────────────────
function main() {
  const [, , pathArg, limitArg] = process.argv;
  if (!pathArg) {
    console.error('Usage: node scripts/auto-fix-content.js <path-slug> [limit]');
    process.exit(1);
  }
  const limit = Number(limitArg) || 5;

  const healthPath = path.join(AUDIT_DIR, 'health.json');
  if (!fs.existsSync(healthPath)) {
    console.error(`Audit report not found: ${healthPath}`);
    console.error(`Run \`npm run content:audit\` first.`);
    process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(healthPath, 'utf8'));

  const targets = report.topics
    .filter(t => t.pathSlug === pathArg && t.status !== 'green')
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);

  if (targets.length === 0) {
    console.log(`No topics to fix in path "${pathArg}". 🎉`);
    return;
  }

  if (!DRY_RUN && !API_KEY) {
    console.error('GEMINI_API_KEY env var is required (or set DRY_RUN=1).');
    process.exit(1);
  }

  fs.mkdirSync(path.join(PROPOSAL_DIR, pathArg), { recursive: true });
  console.log(`Fixing ${targets.length} topic(s) in ${pathArg}…`);
  console.log(`(model=${MODEL}, dryRun=${DRY_RUN})\n`);

  // Sequential to respect Gemini free-tier RPM.
  (async () => {
    let ok = 0, fail = 0;
    for (const t of targets) {
      try {
        await fixTopic(pathArg, t);
        ok++;
        console.log(`  ✅ ${t.topicSlug}  (was ${t.score}/100)`);
      } catch (err) {
        fail++;
        console.log(`  ❌ ${t.topicSlug}  — ${err.message}`);
      }
      // Be nice to the free-tier RPM ceiling (15/min).
      await sleep(4500);
    }
    console.log(`\nDone. ${ok} proposals written, ${fail} failed.`);
    console.log(`Proposals: apps/web/content/_audit/proposals/${pathArg}/`);
  })();
}

async function fixTopic(pathSlug, topic) {
  const filePath = path.join(CONTENT_DIR, pathSlug, `${topic.topicSlug}.mdx`);
  if (!fs.existsSync(filePath)) throw new Error(`missing source file`);
  const original = fs.readFileSync(filePath, 'utf8');

  // Only ask for sections that are missing or shallow — never rewrite whole file.
  const needed = new Set([
    ...topic.missing,
    ...topic.shallow.map(s => s.key),
  ]);
  if (needed.size === 0) return; // nothing to fix that this bot can help with

  const prompt = buildPrompt(topic, [...needed], original);
  if (DRY_RUN) {
    fs.writeFileSync(
      path.join(PROPOSAL_DIR, pathSlug, `${topic.topicSlug}.prompt.txt`),
      prompt,
    );
    return;
  }

  const response = await callGemini(prompt);
  const proposal = buildProposal(topic, [...needed], response);
  fs.writeFileSync(
    path.join(PROPOSAL_DIR, pathSlug, `${topic.topicSlug}.proposal.md`),
    proposal,
  );
}

function buildPrompt(topic, sectionKeys, originalMdx) {
  const sectionHeadings = sectionKeys.map(k => FIXABLE_SECTIONS[k]).filter(Boolean);
  return [
    `You are a senior engineering author for the DevMastery learning platform.`,
    `Rewrite ONLY the following sections of the given topic MDX file, keeping ALL other sections untouched.`,
    ``,
    `Topic slug: ${topic.topicSlug}`,
    `Path:       ${topic.pathSlug}`,
    `Level:      ${topic.level ?? 'unknown'} (1=beginner … 5=expert)`,
    `Title:      ${topic.title}`,
    ``,
    `Sections to (re)write, each with its exact heading:`,
    ...sectionHeadings.map(h => `  ${h}`),
    ``,
    `Rules — non-negotiable:`,
    `- Preserve the heading text EXACTLY as shown above (case-sensitive).`,
    `- WHY: 3–4 paragraphs (problem → solution → failure mode → why seniors care).`,
    `- THEORY: 400+ words including at least one Mermaid diagram inside a fenced code block.`,
    `- VISUALIZATION_CONFIG: fenced JSON with {"component":"...","state":"..."} keys only.`,
    `- CODE: exactly 4 progressive levels (### Level 1 Beginner, Level 2 Intermediate, Level 3 Advanced, Level 4 Expert), each runnable, no TODO stubs, no placeholder names.`,
    `- REAL_WORLD: name at least one real company/library using this in production and cite the failure mode.`,
    `- INTERVIEW: 5+ Q&A pairs, Junior → Senior progression, each with a full answer.`,
    `- FEYNMAN CHECK: analogy + 5 recall Q&As with full answers.`,
    `- BUILD: mini-project with setup → implement → test → expected output.`,
    `- SPACED REVIEW: 12 numbered questions covering Day 1 / 3 / 7 / 14 buckets.`,
    ``,
    `Return ONLY the requested sections, in order, separated by blank lines. Do NOT wrap the whole output in a code fence. Do NOT include the frontmatter.`,
    ``,
    `Existing MDX (for context — do not repeat unchanged sections):`,
    '```mdx',
    originalMdx.slice(0, 6000),
    '```',
  ].join('\n');
}

function buildProposal(topic, sectionKeys, aiResponse) {
  return [
    `# Auto-fix proposal for ${topic.pathSlug}/${topic.topicSlug}`,
    ``,
    `> Original score: **${topic.score}/100**`,
    `> Sections regenerated: **${sectionKeys.join(', ')}**`,
    `> Model: **${MODEL}**`,
    `> Generated at: ${new Date().toISOString()}`,
    ``,
    `Review the diff below carefully. When accepted, copy each section into`,
    `\`apps/web/content/${topic.pathSlug}/${topic.topicSlug}.mdx\``,
    `replacing the corresponding heading block. Re-run \`npm run content:audit\``,
    `to confirm the score improved.`,
    ``,
    `---`,
    ``,
    aiResponse.trim(),
    ``,
  ].join('\n');
}

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(API_KEY)}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gemini HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text;
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

if (require.main === module) main();

