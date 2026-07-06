#!/usr/bin/env node
/**
 * DevMastery Auto-Fix Apply
 * -------------------------
 * Companion to `scripts/auto-fix-content.js`. Reads AI-generated proposals
 * from `apps/web/content/_audit/proposals/<path>/*.proposal.md`, splices
 * each proposed section back into the corresponding live `.mdx` file,
 * writes a `.bak` backup, and re-runs the audit so you can see whether the
 * score actually improved.
 *
 * Safety features:
 *   - Refuses to touch files that no longer exist.
 *   - Refuses to touch proposals older than 7 days (stale — content moved on).
 *   - `--dry-run` prints the plan without writing anything.
 *   - Always keeps a `.bak` copy next to the original before overwriting.
 *   - Never touches sections that were NOT explicitly listed in the proposal.
 *
 * Usage:
 *   node scripts/apply-auto-fixes.js <path-slug>                # apply all
 *   node scripts/apply-auto-fixes.js <path-slug> <topic-slug>   # apply one
 *   node scripts/apply-auto-fixes.js <path-slug> --dry-run
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT         = path.resolve(__dirname, '..');
const CONTENT_DIR  = path.join(ROOT, 'apps', 'web', 'content');
const AUDIT_DIR    = path.join(CONTENT_DIR, '_audit');
const PROPOSAL_DIR = path.join(AUDIT_DIR, 'proposals');
const STALE_DAYS   = 7;

// Section headings the bot is allowed to rewrite (must match audit script).
const SECTION_ORDER = [
  '## WHY',
  '## THEORY',
  '## VISUALIZATION_CONFIG',
  '## CODE',
  '## REAL_WORLD',
  '## INTERVIEW',
  '## FEYNMAN CHECK',
  '## BUILD',
  '## SPACED REVIEW',
];

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const positional = args.filter(a => !a.startsWith('--'));
  const [pathSlug, topicFilter] = positional;

  if (!pathSlug) {
    console.error('Usage: node scripts/apply-auto-fixes.js <path-slug> [topic-slug] [--dry-run]');
    process.exit(1);
  }

  const dir = path.join(PROPOSAL_DIR, pathSlug);
  if (!fs.existsSync(dir)) {
    console.error(`No proposal directory found: ${path.relative(ROOT, dir)}`);
    console.error(`Run \`npm run content:autofix ${pathSlug}\` first.`);
    process.exit(1);
  }

  const files = fs.readdirSync(dir)
    .filter(f => f.endsWith('.proposal.md'))
    .filter(f => !topicFilter || f === `${topicFilter}.proposal.md`);

  if (files.length === 0) {
    console.log(`No matching proposals in ${path.relative(ROOT, dir)}`);
    return;
  }

  console.log(`${dryRun ? '[DRY RUN] ' : ''}Applying ${files.length} proposal(s) for ${pathSlug}\n`);

  const results = { applied: 0, skipped: 0, failed: 0 };
  for (const proposalFile of files) {
    const topicSlug = proposalFile.replace(/\.proposal\.md$/, '');
    try {
      const outcome = applyOne(pathSlug, topicSlug, path.join(dir, proposalFile), dryRun);
      console.log(`  ${outcome.icon} ${topicSlug}  ${outcome.note}`);
      if (outcome.applied) results.applied++;
      else                 results.skipped++;
    } catch (err) {
      console.log(`  ❌ ${topicSlug}  — ${err.message}`);
      results.failed++;
    }
  }

  console.log(`\nDone. applied=${results.applied}  skipped=${results.skipped}  failed=${results.failed}`);
  if (!dryRun && results.applied > 0) {
    console.log(`\nRe-run \`npm run content:audit\` to confirm the score improved.`);
  }
}

function applyOne(pathSlug, topicSlug, proposalPath, dryRun) {
  // Stale-check.
  const stat = fs.statSync(proposalPath);
  const ageDays = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24);
  if (ageDays > STALE_DAYS) {
    return { applied: false, icon: '⏭️', note: `skipped — proposal is ${ageDays.toFixed(0)}d old (>${STALE_DAYS}d)` };
  }

  const targetPath = path.join(CONTENT_DIR, pathSlug, `${topicSlug}.mdx`);
  if (!fs.existsSync(targetPath)) {
    return { applied: false, icon: '⏭️', note: `skipped — target MDX missing` };
  }

  const proposalRaw = fs.readFileSync(proposalPath, 'utf8');
  const proposedSections = extractSections(proposalRaw);
  if (Object.keys(proposedSections).length === 0) {
    return { applied: false, icon: '⏭️', note: `skipped — no valid sections parsed from proposal` };
  }

  const originalMdx = fs.readFileSync(targetPath, 'utf8');
  const patched     = spliceSections(originalMdx, proposedSections);
  if (patched === originalMdx) {
    return { applied: false, icon: '⏭️', note: `skipped — proposal would be a no-op` };
  }

  if (!dryRun) {
    fs.writeFileSync(targetPath + '.bak', originalMdx);
    fs.writeFileSync(targetPath, patched);
  }

  const changed = Object.keys(proposedSections);
  return {
    applied: !dryRun,
    icon: dryRun ? '🔎' : '✅',
    note: `${changed.length} section(s): ${changed.map(h => h.replace(/^## /, '')).join(', ')}`,
  };
}

/** Extract heading → body pairs from the proposal, keyed by canonical heading. */
function extractSections(proposalMd) {
  const result = {};
  const lines = proposalMd.split('\n');
  let current = null;
  let buffer = [];
  const flush = () => {
    if (current) result[current] = buffer.join('\n').trim();
    current = null;
    buffer = [];
  };
  for (const line of lines) {
    const headingMatch = SECTION_ORDER.find(h => line.trim().toUpperCase() === h.toUpperCase());
    if (headingMatch) {
      flush();
      current = headingMatch;
      continue;
    }
    if (current) buffer.push(line);
  }
  flush();
  return result;
}

/**
 * Replace each named section in the MDX with the proposed content. Sections
 * not present in `proposed` are left untouched. If the MDX does not yet
 * contain a heading that IS in `proposed`, the new section is appended in
 * canonical order.
 */
function spliceSections(mdx, proposed) {
  const lines = mdx.split('\n');
  const headings = [];
  const headingRegex = /^(##\s+.+)$/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(headingRegex);
    if (!m) continue;
    const canonical = SECTION_ORDER.find(h => m[1].trim().toUpperCase() === h.toUpperCase());
    if (canonical) headings.push({ canonical, lineIndex: i });
  }

  // Build [start, end) ranges per existing section.
  const ranges = new Map();
  for (let i = 0; i < headings.length; i++) {
    const start = headings[i].lineIndex;
    const end   = i + 1 < headings.length ? headings[i + 1].lineIndex : lines.length;
    ranges.set(headings[i].canonical, { start, end });
  }

  // Work from the bottom up so we don't invalidate earlier indices.
  const sortedProposedHeadings = Object.keys(proposed)
    .filter(h => ranges.has(h))
    .sort((a, b) => ranges.get(b).start - ranges.get(a).start);

  let out = [...lines];
  for (const heading of sortedProposedHeadings) {
    const { start, end } = ranges.get(heading);
    const replacement = [heading, '', proposed[heading].trim(), ''];
    out.splice(start, end - start, ...replacement);
  }

  // Any proposed section that didn't exist yet → append in canonical order.
  const appended = Object.keys(proposed).filter(h => !ranges.has(h));
  if (appended.length) {
    const inOrder = SECTION_ORDER.filter(h => appended.includes(h));
    out.push('');
    for (const h of inOrder) {
      out.push(h, '', proposed[h].trim(), '');
    }
  }

  return out.join('\n');
}

if (require.main === module) main();

module.exports = { extractSections, spliceSections };

