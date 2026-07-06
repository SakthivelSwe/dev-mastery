#!/usr/bin/env node
/**
 * DevMastery Content Health Auditor
 * ---------------------------------
 * Scans `apps/web/content/<path>/<topic>.mdx` and verifies each file against
 * the 9-section schema defined in SKILL.md. Emits a machine-readable JSON
 * report the Admin UI (/admin/content-health) can render, plus a short
 * Markdown summary for the terminal / CI logs.
 *
 * Usage:
 *   node scripts/audit-content-health.js               # audit all paths
 *   node scripts/audit-content-health.js java-mastery  # single path
 *   node scripts/audit-content-health.js --json        # print JSON to stdout
 *
 * Outputs:
 *   apps/web/content/_audit/health.json
 *   apps/web/content/_audit/health.md
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT         = path.resolve(__dirname, '..');
const CONTENT_DIR  = path.join(ROOT, 'apps', 'web', 'content');
const AUDIT_DIR    = path.join(CONTENT_DIR, '_audit');

// ─── The mandatory 9 sections (headings must match exactly) ────────────
const REQUIRED_SECTIONS = [
  { key: 'why',           heading: '## WHY',                  minWords: 150 },
  { key: 'theory',        heading: '## THEORY',               minWords: 300 },
  { key: 'visual',        heading: '## VISUALIZATION_CONFIG', minWords: 5   },
  { key: 'code',          heading: '## CODE',                 minWords: 120 },
  { key: 'realWorld',     heading: '## REAL_WORLD',           minWords: 100 },
  { key: 'interview',     heading: '## INTERVIEW',            minWords: 200 },
  { key: 'feynman',       heading: '## FEYNMAN CHECK',        minWords: 150 },
  { key: 'build',         heading: '## BUILD',                minWords: 120 },
  { key: 'spacedReview',  heading: '## SPACED REVIEW',        minWords: 80  },
];

// ─── Extra rules that catch mistakes learners actually run into ────────
const EXTRA_CHECKS = [
  {
    id: 'theory-has-diagram',
    label: 'THEORY has a Mermaid or ASCII diagram',
    test: (sections) => {
      const t = sections.theory || '';
      return /```mermaid/i.test(t) || /```[\s\S]*?[│┌└─┐┘├┤]/.test(t);
    },
  },
  {
    id: 'code-has-4-levels',
    label: 'CODE has 4 progressive levels (Beginner → Expert)',
    test: (sections) => {
      const c = sections.code || '';
      const levels = c.match(/^###\s+Level\s*[1-4]/gmi) || [];
      return levels.length >= 4;
    },
  },
  {
    id: 'interview-has-5-qas',
    label: 'INTERVIEW has 5+ Q&A pairs',
    test: (sections) => {
      const i = sections.interview || '';
      const qs = i.match(/(^|\n)###?\s*Q\d|(^|\n)\*\*Q\d/g) || [];
      return qs.length >= 5;
    },
  },
  {
    id: 'visualization-has-json',
    label: 'VISUALIZATION_CONFIG contains a JSON block with `component`',
    test: (sections) => {
      const v = sections.visual || '';
      return /```json[\s\S]*?"component"\s*:/i.test(v);
    },
  },
  {
    id: 'spaced-review-has-12-questions',
    label: 'SPACED REVIEW has 12+ recall questions',
    test: (sections) => {
      const s = sections.spacedReview || '';
      const qs = s.match(/^\s*(?:\d+\.|\-|\*)\s+/gm) || [];
      return qs.length >= 12;
    },
  },
];

// ─── Parse a single .mdx file into { frontmatter, sections{...} } ──────
function parseMdx(raw) {
  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  const frontmatter = {};
  if (fmMatch) {
    for (const line of fmMatch[1].split('\n')) {
      const m = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*?)\s*$/);
      if (m) frontmatter[m[1]] = m[2].replace(/^"(.*)"$/, '$1');
    }
  }
  const body = fmMatch ? raw.slice(fmMatch[0].length) : raw;
  const sections = {};
  const headingRegex = /^(##\s+[^\n]+)$/gm;
  const found = [];
  let match;
  while ((match = headingRegex.exec(body)) !== null) {
    found.push({ heading: match[1].trim(), start: match.index });
  }
  for (let i = 0; i < found.length; i++) {
    const end = i + 1 < found.length ? found[i + 1].start : body.length;
    const slice = body.slice(found[i].start, end);
    for (const req of REQUIRED_SECTIONS) {
      if (found[i].heading.toUpperCase() === req.heading.toUpperCase()) {
        sections[req.key] = slice.slice(req.heading.length).trim();
        break;
      }
    }
  }
  return { frontmatter, sections };
}

function wordCount(s) { return (s || '').trim().split(/\s+/).filter(Boolean).length; }

function auditFile(pathSlug, topicSlug, filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { frontmatter, sections } = parseMdx(raw);

  const missing = [];
  const shallow = [];
  for (const req of REQUIRED_SECTIONS) {
    if (!sections[req.key]) { missing.push(req.key); continue; }
    if (wordCount(sections[req.key]) < req.minWords) shallow.push({ key: req.key, words: wordCount(sections[req.key]), min: req.minWords });
  }

  const ruleFailures = [];
  for (const rule of EXTRA_CHECKS) {
    if (!rule.test(sections)) ruleFailures.push({ id: rule.id, label: rule.label });
  }

  const totalChecks = REQUIRED_SECTIONS.length + EXTRA_CHECKS.length;
  const failedChecks = missing.length + ruleFailures.length;
  const passedChecks = totalChecks - failedChecks;
  const score = Math.round((passedChecks / totalChecks) * 100);

  return {
    pathSlug,
    topicSlug,
    title: frontmatter.title || topicSlug,
    level: Number(frontmatter.level) || null,
    score,
    status: score === 100 ? 'green' : score >= 80 ? 'yellow' : 'red',
    missing,
    shallow,
    ruleFailures,
    wordCounts: Object.fromEntries(REQUIRED_SECTIONS.map(r => [r.key, wordCount(sections[r.key])])),
  };
}

function collect(only) {
  const paths = fs.readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
    .map(d => d.name)
    .filter(p => !only || p === only);

  const results = [];
  for (const pathSlug of paths) {
    const dir = path.join(CONTENT_DIR, pathSlug);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
    for (const f of files) {
      const topicSlug = f.replace(/\.mdx$/, '');
      try {
        results.push(auditFile(pathSlug, topicSlug, path.join(dir, f)));
      } catch (err) {
        results.push({
          pathSlug, topicSlug, title: topicSlug, level: null,
          score: 0, status: 'red',
          missing: [], shallow: [], ruleFailures: [{ id: 'parse-error', label: err.message }],
          wordCounts: {},
        });
      }
    }
  }
  return results;
}

function summarise(results) {
  const byPath = new Map();
  for (const r of results) {
    if (!byPath.has(r.pathSlug)) byPath.set(r.pathSlug, { pathSlug: r.pathSlug, total: 0, green: 0, yellow: 0, red: 0, avgScore: 0 });
    const p = byPath.get(r.pathSlug);
    p.total += 1;
    p[r.status] += 1;
    p.avgScore += r.score;
  }
  const paths = [...byPath.values()].map(p => ({ ...p, avgScore: p.total ? Math.round(p.avgScore / p.total) : 0 }));
  paths.sort((a, b) => a.avgScore - b.avgScore);

  const overall = {
    generatedAt: new Date().toISOString(),
    totalTopics: results.length,
    green: results.filter(r => r.status === 'green').length,
    yellow: results.filter(r => r.status === 'yellow').length,
    red: results.filter(r => r.status === 'red').length,
    avgScore: results.length ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0,
  };
  return { overall, paths, topics: results };
}

function writeMarkdown(report) {
  const { overall, paths, topics } = report;
  const lines = [];
  lines.push(`# Content Health Report — ${overall.generatedAt}`);
  lines.push('');
  lines.push(`**Overall score:** ${overall.avgScore}/100  •  🟢 ${overall.green}  🟡 ${overall.yellow}  🔴 ${overall.red}  (${overall.totalTopics} topics)`);
  lines.push('');
  lines.push('## Path scoreboard');
  lines.push('');
  lines.push('| Path | Avg | 🟢 | 🟡 | 🔴 | Total |');
  lines.push('| --- | ---:| ---:| ---:| ---:| ---:|');
  for (const p of paths) {
    lines.push(`| ${p.pathSlug} | ${p.avgScore} | ${p.green} | ${p.yellow} | ${p.red} | ${p.total} |`);
  }
  lines.push('');
  const worst = topics.filter(t => t.status === 'red').slice(0, 25);
  if (worst.length) {
    lines.push('## Worst 25 topics needing attention');
    lines.push('');
    lines.push('| Path | Topic | Score | Missing sections | Rule failures |');
    lines.push('| --- | --- | ---:| --- | --- |');
    for (const t of worst) {
      lines.push(`| ${t.pathSlug} | ${t.topicSlug} | ${t.score} | ${t.missing.join(', ') || '—'} | ${t.ruleFailures.map(r => r.id).join(', ') || '—'} |`);
    }
  }
  return lines.join('\n') + '\n';
}

// ─── CLI ────────────────────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  const jsonOnly = args.includes('--json');
  const only = args.find(a => !a.startsWith('--'));

  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }
  fs.mkdirSync(AUDIT_DIR, { recursive: true });

  const results = collect(only);
  const report  = summarise(results);

  fs.writeFileSync(path.join(AUDIT_DIR, 'health.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(AUDIT_DIR, 'health.md'),   writeMarkdown(report));

  if (jsonOnly) {
    process.stdout.write(JSON.stringify(report));
    return;
  }
  const { overall } = report;
  console.log(`Content health: avg ${overall.avgScore}/100 across ${overall.totalTopics} topics`);
  console.log(`  🟢 ${overall.green}   🟡 ${overall.yellow}   🔴 ${overall.red}`);
  console.log(`Report: ${path.relative(ROOT, path.join(AUDIT_DIR, 'health.json'))}`);
}

if (require.main === module) main();

module.exports = { auditFile, collect, summarise };

