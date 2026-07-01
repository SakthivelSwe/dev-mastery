/**
 * auditAllPaths.js  —  Scans EVERY content path and reports section coverage.
 * Shows which paths need FEYNMAN / BUILD / SPACED REVIEW (and VISUALIZATION_CONFIG).
 *
 * Usage:  node scripts/auditAllPaths.js
 */
const fs   = require('fs');
const path = require('path');

const CONTENT_ROOT = path.join(__dirname, '..', 'apps', 'web', 'content');

const ALL_9 = ['WHY','THEORY','VISUALIZATION_CONFIG','CODE','REAL_WORLD','INTERVIEW','FEYNMAN','BUILD','SPACED REVIEW'];

function checkFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const missing = [];
  for (const sec of ALL_9) {
    const pattern = new RegExp(`^##\\s+${sec}`, 'm');
    if (!pattern.test(raw)) missing.push(sec);
  }
  return missing;
}

const dirs = fs.readdirSync(CONTENT_ROOT).filter(d =>
  fs.statSync(path.join(CONTENT_ROOT, d)).isDirectory()
);

const summary = [];

for (const dir of dirs) {
  const dirPath = path.join(CONTENT_ROOT, dir);
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.mdx'));
  if (!files.length) continue;

  const topicsMissingAny   = [];
  const sectionMissingCount = {};

  for (const file of files) {
    const missing = checkFile(path.join(dirPath, file));
    if (missing.length) {
      topicsMissingAny.push({ slug: file.replace('.mdx',''), missing });
      for (const s of missing) sectionMissingCount[s] = (sectionMissingCount[s]||0)+1;
    }
  }

  summary.push({ dir, total: files.length, incomplete: topicsMissingAny.length, sectionMissingCount, topicsMissingAny });
}

// Print summary table
console.log('\n' + '═'.repeat(90));
console.log('  PATH AUDIT — Section Coverage Across All Content Paths');
console.log('═'.repeat(90));
console.log(`  ${'PATH'.padEnd(25)} ${'FILES'.padStart(5)} ${'COMPLETE'.padStart(8)} ${'MISSING SECTIONS'}`);
console.log('─'.repeat(90));

for (const row of summary) {
  const complete = row.total - row.incomplete;
  const pct = Math.round((complete / row.total) * 100);
  const missingSummary = Object.entries(row.sectionMissingCount)
    .sort((a,b) => b[1]-a[1])
    .map(([s,n]) => `${s}(${n})`)
    .join(', ');
  const status = pct === 100 ? '✅' : pct >= 50 ? '⚠️ ' : '❌';
  console.log(`  ${status} ${row.dir.padEnd(23)} ${String(row.total).padStart(5)} ${String(complete+'/'+row.total).padStart(8)}  ${missingSummary || 'none'}`);
}

console.log('═'.repeat(90));

// Detailed missing report
const needsWork = summary.filter(r => r.incomplete > 0);
if (needsWork.length) {
  console.log('\n📋 PATHS NEEDING WORK (run: node scripts/writeSections.js <path>):\n');
  for (const row of needsWork) {
    const sections = [...new Set(row.topicsMissingAny.flatMap(t => t.missing))];
    console.log(`  node scripts/writeSections.js ${row.dir}`);
    console.log(`    → ${row.incomplete} topics missing: [${sections.join(', ')}]\n`);
  }
} else {
  console.log('\n✅ ALL paths have complete 9-section coverage!\n');
}

