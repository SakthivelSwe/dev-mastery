#!/usr/bin/env node
/**
 * DevMastery content reconciliation — single entry point.
 *
 * Runs every idempotent maintenance script in the correct order:
 *   1. seed-all-topic-paths.js       (cross-list every MDX into topic_paths)
 *   2. sync-mdx-titles-to-db.js      (adopt richer MDX titles into DB)
 *   3. normalize-topic-titles.js     (fix any remaining ugly auto-generated titles)
 *   4. refresh-path-total-topics.js  (recompute learning_paths.total_topics)
 *   5. audit-content-vs-db.js        (final report: orphans + drift)
 *
 * Usage:
 *   node scripts/reconcile-content.js           # apply all steps
 *   node scripts/reconcile-content.js --dry     # audit-only (skips writes where supported)
 *   node scripts/reconcile-content.js --skip=1,3  # skip specific steps by number
 */
'use strict';
const { spawnSync } = require('child_process');
const path = require('path');

const DRY  = process.argv.includes('--dry');
const skipArg = process.argv.find(a => a.startsWith('--skip='));
const SKIP = new Set((skipArg ? skipArg.split('=')[1] : '').split(',').filter(Boolean));

const STEPS = [
  { n: 1, name: 'Seed topic_paths junction',       script: 'seed-all-topic-paths.js',        supportsDry: false },
  { n: 2, name: 'Fix broken MDX frontmatter titles', script: 'fix-broken-mdx-titles.js',     supportsDry: false },
  { n: 3, name: 'Sync MDX titles → DB',            script: 'sync-mdx-titles-to-db.js',       supportsDry: true  },
  { n: 4, name: 'Derive descriptions from MDX WHY', script: 'derive-descriptions-from-why.js', supportsDry: true  },
  { n: 5, name: 'Populate topic tags',             script: 'populate-topic-tags.js',         supportsDry: true  },
  { n: 6, name: 'Normalize remaining ugly titles', script: 'normalize-topic-titles.js',      supportsDry: true  },
  { n: 7, name: 'Refresh path total_topics',       script: 'refresh-path-total-topics.js',   supportsDry: false },
  { n: 8, name: 'Audit content vs DB',             script: 'audit-content-vs-db.js',         supportsDry: false },
];

for (const step of STEPS) {
  if (SKIP.has(String(step.n))) {
    console.log(`\n═══ Step ${step.n}: SKIPPED (${step.name}) ═══`);
    continue;
  }
  console.log(`\n═══ Step ${step.n}: ${step.name} ═══`);
  const args = [path.join(__dirname, step.script)];
  if (DRY && step.supportsDry) args.push('--dry-run');
  if (DRY && !step.supportsDry && step.n !== 8) {
    console.log('  (skipped — no --dry-run support; step is a write)');
    continue;
  }
  const r = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`\nStep ${step.n} FAILED with exit code ${r.status}`);
    process.exit(r.status || 1);
  }
}

console.log('\n═══ Reconciliation complete ═══');



