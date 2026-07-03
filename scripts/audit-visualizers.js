/*
 * audit-visualizers.js
 * Prints a table showing which topics have a visualizer step config.
 * Usage: node scripts/audit-visualizers.js
 */
const fs   = require('fs');
const path = require('path');

const CONTENT_ROOT = path.join(__dirname, '..', 'apps', 'web', 'content');
const paths = fs.readdirSync(CONTENT_ROOT).filter(p =>
  fs.statSync(path.join(CONTENT_ROOT, p)).isDirectory()
);

let total = 0, done = 0;
const report = [];

for (const pathSlug of paths.sort()) {
  const dir = path.join(CONTENT_ROOT, pathSlug);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const hasSteps = /"steps"\s*:/.test(raw);
    const stepCount = hasSteps
      ? (raw.match(/"title"\s*:/g) || []).length
      : 0;
    total++;
    if (hasSteps) done++;
    report.push({ path: pathSlug, slug: file.replace('.mdx', ''), hasSteps, stepCount });
  }
}

console.log('\n DevMastery Visualizer Audit\n');
console.log(
  ' Path'.padEnd(18) +
  ' Slug'.padEnd(44) +
  ' Steps'.padStart(6) +
  ' Status'
);
console.log(' ' + '-'.repeat(75));

for (const r of report) {
  const status = r.hasSteps ? `✅ ${r.stepCount} steps` : '🔲 pending';
  console.log(
    ` ${r.path.padEnd(17)} ${r.slug.padEnd(43)} ${String(r.stepCount).padStart(5)}  ${status}`
  );
}

const pct = Math.round((done / total) * 100);
console.log(`\n  Done: ${done} / ${total}  (${pct}%)\n`);

