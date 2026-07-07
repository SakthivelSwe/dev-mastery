'use strict';
/**
 * Sync topic descriptions from MDX frontmatter into the DB.
 *
 * Only writes when:
 *   - MDX frontmatter has a non-empty `description` field, AND
 *   - The DB description is empty/null OR shorter and looks less informative, AND
 *   - The MDX file lives in the topic's canonical (owner) path folder.
 *
 * Supports --dry-run.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const CONN = process.env.SUPABASE_DB_URL || 'postgresql://postgres.diculkpsidcofmbyeqdq:%23Devmastery%40098@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres';
const CONTENT_ROOT = path.join(__dirname, '..', 'apps', 'web', 'content');
const DRY = process.argv.includes('--dry-run');

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
      const mdxDesc = (fm.description || '').trim();
      if (!mdxDesc) continue;

      const dbRow = await c.query(
        `SELECT t.id, t.description, lp.slug AS owner
         FROM topics t LEFT JOIN learning_paths lp ON lp.id = t.path_id
         WHERE t.slug=$1`, [slug]);
      if (!dbRow.rowCount) continue;
      const { id, description: dbDesc, owner } = dbRow.rows[0];
      // Skip cross-listed MDX (folder != canonical owner)
      if (owner && owner !== p.slug) continue;

      const current = (dbDesc || '').trim();
      if (current === mdxDesc) continue;
      // Only overwrite if current is empty OR MDX is significantly longer
      const shouldWrite = !current || mdxDesc.length > current.length + 10;
      if (!shouldWrite) continue;
      plan.push({ id, slug, from: current || '(empty)', to: mdxDesc });
    }
  }

  console.log(`Planned updates: ${plan.length}`);
  plan.slice(0, 15).forEach(p =>
    console.log(`  ${p.slug.padEnd(38)} "${p.from.slice(0, 40)}..."  →  "${p.to.slice(0, 60)}..."`));
  if (plan.length > 15) console.log(`  ... and ${plan.length - 15} more`);

  if (DRY) { console.log('\n[dry-run] no writes'); await c.end(); return; }

  let done = 0;
  for (const p of plan) {
    await c.query(`UPDATE topics SET description=$1, updated_at=now() WHERE id=$2`, [p.to, p.id]);
    done++;
  }
  console.log(`\nUpdated ${done} topic descriptions from MDX frontmatter.`);
  await c.end();
})().catch(e => { console.error(e); process.exit(1); });

