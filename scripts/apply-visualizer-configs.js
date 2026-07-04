/*
 * apply-visualizer-configs.js
 *
 * Rewrites the `## VISUALIZATION_CONFIG` section of each MDX topic file so
 * that the frontend {@link StepwiseVisualizer} can render an interactive,
 * animated, step-by-step walkthrough.
 *
 * The visual section is stored between the `## VISUALIZATION_CONFIG` heading
 * and the next `## `. This script replaces that entire section with a
 * fenced-JSON block, e.g.:
 *
 *   ## VISUALIZATION_CONFIG
 *   ```json
 *   { "steps": [ ... ] }
 *   ```
 *
 * Usage:
 *   node scripts/apply-visualizer-configs.js               # writes files only
 *   node scripts/apply-visualizer-configs.js --import      # also runs importer
 */

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT   = path.join(__dirname, '..');
const CONTENT_ROOT = path.join(REPO_ROOT, 'apps', 'web', 'content');

// ─── Config catalogue ─────────────────────────────────────────────────────

// Merge all batch config files
const fs2 = require('fs'), path2 = require('path');
const CONFIGS = {};
function mergeDeep(target, source) {
  for (const key of Object.keys(source)) {
    if (target[key] && typeof target[key] === 'object' && typeof source[key] === 'object') {
      mergeDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}
// Load main configs
mergeDeep(CONFIGS, require('./visualizer-configs'));
// Load all batch extension files
const batchFiles = fs2.readdirSync(__dirname)
  .filter(f => f.match(/^visualizer-configs-.*\.js$/))
  .sort();
for (const bf of batchFiles) {
  try {
    let loaded = require(path2.join(__dirname, bf));
    // Support array format: [{ path, slug, steps, ... }]
    if (Array.isArray(loaded)) {
      const obj = {};
      for (const item of loaded) {
        const { path: p, slug, ...rest } = item;
        if (!obj[p]) obj[p] = {};
        obj[p][slug] = rest;
      }
      loaded = obj;
    }
    mergeDeep(CONFIGS, loaded);
    console.log(`  loaded batch: ${bf}`);
  } catch(e) {
    console.error(`  FAILED loading ${bf}: ${e.message}`);
  }
}

// ─── Splicer ──────────────────────────────────────────────────────────────

function spliceVisualSection(mdx, jsonPayload) {
    const heading = '## VISUALIZATION_CONFIG';
    const nextHeadingRe = /\n## [A-Z_]/;

    const start = mdx.indexOf(heading);
    if (start < 0) return null;   // no section — skip

    const afterHeading = mdx.substring(start + heading.length);
    const nextMatch = afterHeading.match(nextHeadingRe);
    const endRel = nextMatch ? nextMatch.index : afterHeading.length;

    const before = mdx.substring(0, start + heading.length);
    const after  = afterHeading.substring(endRel);
    const body   = `\n\`\`\`json\n${JSON.stringify(jsonPayload, null, 2)}\n\`\`\`\n`;

    return before + body + after;
}

function run() {
    let changed = 0;
    const touchedByPath = {};
    for (const [pathSlug, topics] of Object.entries(CONFIGS)) {
        touchedByPath[pathSlug] = [];
        const dir = path.join(CONTENT_ROOT, pathSlug);
        if (!fs.existsSync(dir)) {
            console.warn('  MISSING dir:', dir);
            continue;
        }
        for (const [slug, payload] of Object.entries(topics)) {
            const file = path.join(dir, slug + '.mdx');
            if (!fs.existsSync(file)) {
                console.warn('  MISSING file:', file);
                continue;
            }
            const raw = fs.readFileSync(file, 'utf8');
            const updated = spliceVisualSection(raw, payload);
            if (!updated) {
                console.warn('  no VISUALIZATION_CONFIG section in', slug);
                continue;
            }
            if (updated !== raw) {
                fs.writeFileSync(file, updated, 'utf8');
                changed++;
                touchedByPath[pathSlug].push(slug);
                console.log(`  OK  ${pathSlug}/${slug}  (${payload.steps.length} steps)`);
            }
        }
    }

    console.log(`\n>> ${changed} MDX file(s) updated`);

    if (process.argv.includes('--import')) {
        console.log('\n>> Running importer for touched paths ...');
        for (const [pathSlug, slugs] of Object.entries(touchedByPath)) {
            if (!slugs.length) continue;
            const args = ['scripts/importContentDirect.js', pathSlug, ...slugs];
            console.log('   node ' + args.join(' '));
            const r = spawnSync('node', args, { cwd: REPO_ROOT, stdio: 'inherit' });
            if (r.status !== 0) console.error('   importer failed for', pathSlug);
        }
    }
}

run();

