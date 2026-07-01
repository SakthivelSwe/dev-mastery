/**
 * writeSections.js — Applies content modules to MDX files in apps/web/content/<path>/.
 * Strips old FEYNMAN/BUILD/SPACED REVIEW, then appends fresh ones.
 * If the content module provides why/theory/visual/code/realworld/interview keys
 * AND the MDX is missing those sections, those are injected too.
 *
 * Usage: node scripts/writeSections.js <path>
 */
const fs   = require('fs');
const path = require('path');

const CONTENT_ROOT = path.join(__dirname, '..', 'apps', 'web', 'content');
const ALL_PATHS = ['javascript', 'typescript', 'react', 'angular', 'html', 'css'];

function stripAfterInterview(raw) {
  const idx = raw.search(/\n## FEYNMAN/);
  if (idx > -1) return raw.substring(0, idx).trimEnd();
  return raw.trimEnd();
}

function stripSection(raw, heading) {
  const pattern = new RegExp(`\\n## ${heading}[\\s\\S]*?(?=\\n## |$)`, 'i');
  return raw.replace(pattern, '').trimEnd();
}

function hasSection(raw, heading) {
  return new RegExp(`^##\\s+${heading}`, 'mi').test(raw);
}

function processPath(pathSlug) {
  const contentFile = path.join(__dirname, 'content', `${pathSlug}-content.js`);
  if (!fs.existsSync(contentFile)) {
    console.warn(`  WARN  no content file for ${pathSlug}`);
    return;
  }
  const contentData = require(contentFile);
  const dir = path.join(CONTENT_ROOT, pathSlug);
  if (!fs.existsSync(dir)) { console.warn(`  WARN  dir missing: ${dir}`); return; }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
  let ok = 0, skipped = 0;

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    const data = contentData[slug];
    if (!data) {
      console.log(`  SKIP  ${slug.padEnd(45)} (no entry in content file)`);
      skipped++;
      continue;
    }
    const filePath = path.join(dir, file);
    let raw = fs.readFileSync(filePath, 'utf-8');

    raw = stripAfterInterview(raw);

    // Split frontmatter from body so injected WHY/THEORY land after frontmatter
    let frontmatter = '';
    let body = raw;
    if (raw.startsWith('---')) {
      const fmEnd = raw.indexOf('---', 3);
      if (fmEnd > -1) {
        frontmatter = raw.substring(0, fmEnd + 3);
        body = raw.substring(fmEnd + 3).trimStart();
      }
    }

    if (data.why && !hasSection(body, 'WHY')) {
      body = data.why.trim() + '\n\n' + body;
    }
    if (data.theory && !hasSection(body, 'THEORY')) {
      const nextHeading = body.search(/\n## (?!WHY\b)/);
      if (nextHeading > -1) {
        body = body.substring(0, nextHeading) + '\n\n' + data.theory.trim() + body.substring(nextHeading);
      } else {
        body = body + '\n\n' + data.theory.trim();
      }
    }
    raw = frontmatter + (frontmatter ? '\n\n' : '') + body;

    if (data.visual && !hasSection(raw, 'VISUALIZATION_CONFIG')) {
      const codeIdx = raw.search(/\n## CODE/);
      if (codeIdx > -1) raw = raw.substring(0, codeIdx) + '\n\n' + data.visual.trim() + raw.substring(codeIdx);
      else raw = raw + '\n\n' + data.visual.trim();
    } else if (data.visual && hasSection(raw, 'VISUALIZATION_CONFIG')) {
      raw = stripSection(raw, 'VISUALIZATION_CONFIG');
      const codeIdx = raw.search(/\n## CODE/);
      if (codeIdx > -1) raw = raw.substring(0, codeIdx) + '\n\n' + data.visual.trim() + raw.substring(codeIdx);
      else raw = raw + '\n\n' + data.visual.trim();
    }

    if (data.code && !hasSection(raw, 'CODE')) {
      const realIdx = raw.search(/\n## REAL_WORLD/);
      if (realIdx > -1) raw = raw.substring(0, realIdx) + '\n\n' + data.code.trim() + raw.substring(realIdx);
      else raw = raw + '\n\n' + data.code.trim();
    }

    let extra = '';
    if (data.realworld && !hasSection(raw, 'REAL_WORLD')) extra += '\n\n' + data.realworld.trim();
    if (data.interview && !hasSection(raw, 'INTERVIEW'))  extra += '\n\n' + data.interview.trim();

    const newRaw = raw
      + extra
      + '\n\n' + data.feynman.trim()
      + '\n\n' + data.build.trim()
      + '\n\n' + data.spacedReview.trim()
      + '\n';
    fs.writeFileSync(filePath, newRaw, 'utf-8');
    console.log(`  OK    ${slug}`);
    ok++;
  }
  console.log(`  -- ${pathSlug}: ${ok} updated, ${skipped} skipped\n`);
}

const args = process.argv.slice(2);
if (!args.length) { console.error('Usage: node scripts/writeSections.js <path|all>'); process.exit(1); }
const targets = args[0] === 'all' ? ALL_PATHS : args;
for (const p of targets) processPath(p);

