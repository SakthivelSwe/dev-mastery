'use strict';
/**
 * Derive missing topic descriptions from the first paragraph under `## WHY`
 * in the canonical MDX file. Cleans markdown, trims to ~240 chars.
 *
 * Only writes when:
 *   - DB description is empty/null
 *   - The MDX file lives in the topic's canonical owner path
 *   - A usable first paragraph exists
 *
 * Supports --dry-run.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const CONN = process.env.SUPABASE_DB_URL || 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
const CONTENT_ROOT = path.join(__dirname, '..', 'apps', 'web', 'content');
const DRY = process.argv.includes('--dry-run');
const MAX_LEN = 240;

function parseFM(raw) {
  const fm = {}; if (!raw.startsWith('---')) return fm;
  const end = raw.indexOf('---', 3); if (end < 0) return fm;
  for (const line of raw.substring(3, end).split('\n')) {
    const i = line.indexOf(':'); if (i < 0) continue;
    const k = line.substring(0, i).trim();
    let v = line.substring(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    fm[k] = v;
  }
  return fm;
}

function stripBodyStart(raw) {
  if (!raw.startsWith('---')) return raw;
  const end = raw.indexOf('---', 3);
  return end < 0 ? raw : raw.substring(end + 3);
}

function extractWhyFirstPara(raw) {
  const body = stripBodyStart(raw);
  const m = body.match(/##\s+WHY\s*\r?\n([\s\S]*?)(?=\r?\n##\s+|\r?\n---|\r?\n<|$)/i);
  if (!m) return null;
  // Take the first non-empty paragraph in the WHY section
  const paras = m[1].split(/\r?\n\r?\n/).map(p => p.trim()).filter(Boolean);
  if (!paras.length) return null;
  let text = paras[0];
  // Strip common markdown: **bold**, *italic*, `code`, links [x](y), inline HTML
  text = text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length > MAX_LEN) {
    // Cut at last sentence boundary before MAX_LEN
    const cut = text.slice(0, MAX_LEN);
    const lastDot = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    text = (lastDot > MAX_LEN * 0.6 ? cut.slice(0, lastDot + 1) : cut.trim() + '…');
  }
  return text;
}

(async () => {
  const c = new Client({ connectionString: CONN });
  await c.connect();

  const paths = await c.query(`SELECT slug FROM learning_paths ORDER BY order_index`);
  const plan = [];

  for (const p of paths.rows) {
    const dir = path.join(CONTENT_ROOT, p.slug);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.mdx'))) {
      const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
      const fm = parseFM(raw);
      const slug = (fm.slug || f.replace(/\.mdx$/, '')).trim();

      const dbRow = await c.query(
        `SELECT t.id, t.description, lp.slug AS owner
         FROM topics t LEFT JOIN learning_paths lp ON lp.id = t.path_id
         WHERE t.slug=$1`, [slug]);
      if (!dbRow.rowCount) continue;
      const { id, description: dbDesc, owner } = dbRow.rows[0];

      // Only fill EMPTY descriptions, and only from canonical folder
      if (dbDesc && dbDesc.trim()) continue;
      if (owner && owner !== p.slug) continue;

      const why = extractWhyFirstPara(raw);
      if (!why || why.length < 30) continue;
      plan.push({ id, slug, from: '(empty)', to: why });
    }
  }

  console.log(`Planned updates: ${plan.length}`);
  plan.slice(0, 10).forEach(p =>
    console.log(`  ${p.slug.padEnd(38)} → "${p.to.slice(0, 80)}${p.to.length > 80 ? '...' : ''}"`));
  if (plan.length > 10) console.log(`  ... and ${plan.length - 10} more`);

  if (DRY) { console.log('\n[dry-run] no writes'); await c.end(); return; }

  let done = 0;
  for (const p of plan) {
    await c.query(`UPDATE topics SET description=$1, updated_at=now() WHERE id=$2`, [p.to, p.id]);
    done++;
  }
  console.log(`\nUpdated ${done} topic descriptions from MDX WHY sections.`);
  await c.end();
})().catch(e => { console.error(e); process.exit(1); });

